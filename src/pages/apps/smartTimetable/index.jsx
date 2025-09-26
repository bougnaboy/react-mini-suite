import { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

/* ============================= Utils ============================ */
const load = (k, fb) => {
    try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v ?? fb; }
    catch { return fb; }
};
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

const hhmm = (d) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

function uid() { return Math.random().toString(36).slice(2, 9); }

const PALETTE = [
    "#10b981", "#22c55e", "#06b6d4", "#0ea5e9",
    "#a78bfa", "#f59e0b", "#ef4444", "#f97316",
    "#e11d48", "#14b8a6", "#8b5cf6", "#d946ef",
];
function pickNextColor(used) {
    for (const c of PALETTE) if (!used.includes(c)) return c;
    return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

/* ====================== Storage Keys & Defaults ======================= */
const KEYS = {
    SETTINGS: "tt_settings",
    SUBJECTS: "tt_subjects",
    SLOTS: "tt_slots",
};

const DEFAULT_DAYS = [
    { key: "Mon", label: "Mon", enabled: true },
    { key: "Tue", label: "Tue", enabled: true },
    { key: "Wed", label: "Wed", enabled: true },
    { key: "Thu", label: "Thu", enabled: true },
    { key: "Fri", label: "Fri", enabled: true },
    { key: "Sat", label: "Sat", enabled: true },
    { key: "Sun", label: "Sun", enabled: false },
];

function defaultPeriodTimes(count = 8, start = "08:00", minutes = 60) {
    const [sh, sm] = start.split(":").map(Number);
    let t = new Date();
    t.setHours(sh, sm, 0, 0);
    const out = [];
    for (let i = 0; i < count; i++) {
        const a = new Date(t);
        const b = new Date(t.getTime() + minutes * 60000);
        out.push({
            id: `P${i + 1}`,
            label: `P${i + 1}`,
            time: `${hhmm(a)}–${hhmm(b)}`,
        });
        t = b;
    }
    return out;
}

const DEFAULT_SETTINGS = {
    days: DEFAULT_DAYS,
    periods: defaultPeriodTimes(8, "08:00", 60),
};

/* ---------- Normalizers (safeguard bad/old imports) ---------- */
function normalizeSettings(s) {
    const days = Array.isArray(s?.days)
        ? s.days.map((d, i) => ({
            key: d?.key ?? d?.label ?? `D${i + 1}`,
            label: d?.label ?? d?.key ?? `Day ${i + 1}`,
            enabled: !!d?.enabled,
        }))
        : DEFAULT_DAYS;

    const periods = Array.isArray(s?.periods)
        ? s.periods.map((p, i) => ({
            id: p?.id ?? `P${i + 1}`,
            label: p?.label ?? `P${i + 1}`,
            time: p?.time ?? "",
        }))
        : defaultPeriodTimes(8, "08:00", 60);

    return { days, periods };
}
function normalizeSubjects(arr) {
    return Array.isArray(arr)
        ? arr.map((s, i) => ({
            id: s?.id ?? uid(),
            code: s?.code ?? `SUB${i + 1}`,
            name: s?.name ?? "",
            color: s?.color ?? pickNextColor([]),
        }))
        : [];
}
function normalizeSlots(obj) {
    return obj && typeof obj === "object" && !Array.isArray(obj) ? obj : {};
}

/* ============================ Component ========================= */
export default function SmartTimetable() {
    const [settings, setSettings] = useState(() =>
        normalizeSettings(load(KEYS.SETTINGS, DEFAULT_SETTINGS))
    );
    const [subjects, setSubjects] = useState(() =>
        normalizeSubjects(load(KEYS.SUBJECTS, []))
    );
    const [slots, setSlots] = useState(() =>
        normalizeSlots(load(KEYS.SLOTS, {}))
    );
    const [brush, setBrush] = useState(null);
    const [slotEdit, setSlotEdit] = useState(null);

    // persist
    useEffect(() => save(KEYS.SETTINGS, settings), [settings]);
    useEffect(() => save(KEYS.SUBJECTS, subjects), [subjects]);
    useEffect(() => save(KEYS.SLOTS, slots), [slots]);

    const enabledDays = useMemo(
        () => (settings.days ?? []).map((d, idx) => ({ ...d, idx })).filter((d) => d.enabled),
        [settings.days]
    );

    /* ----------------------------- Subjects ----------------------------- */
    function addSubject() {
        const used = subjects.map((s) => s.color);
        const newSub = {
            id: uid(),
            code: `SUB${subjects.length + 1}`,
            name: "",
            color: pickNextColor(used),
        };
        setSubjects((arr) => [newSub, ...arr]);
        setBrush(newSub.id);
    }

    function updateSubject(id, patch) {
        setSubjects((arr) => arr.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    }

    function deleteSubject(id) {
        const s = subjects.find((x) => x.id === id);
        const label = s ? ` ${s.code || s.name || ""}` : "";
        if (!confirm(`Delete subject${label}? Slots using it will be cleared.`)) return;
        setSubjects((arr) => arr.filter((s) => s.id !== id));
        setSlots((m) => {
            const n = { ...m };
            Object.keys(n).forEach((k) => { if (n[k]?.subjectId === id) delete n[k].subjectId; });
            return n;
        });
        if (brush === id) setBrush(null);
    }

    /* ----------------------------- Grid ops ----------------------------- */
    function keyFor(dayKey, pIndex) { return `${dayKey}:${pIndex}`; }

    function handleCellClick(dayKey, pIndex) {
        const k = keyFor(dayKey, pIndex);
        if (brush) {
            setSlots((m) => ({ ...m, [k]: { ...(m[k] || {}), subjectId: brush } }));
            return;
        }
        setSlotEdit({ key: k, data: slots[k] || { subjectId: "", room: "", note: "" } });
    }

    function clearCell(k) {
        setSlots((m) => {
            const next = { ...m };
            if (!next[k]) return m;
            delete next[k].subjectId;
            delete next[k].room;
            delete next[k].note;
            if (!next[k] || Object.keys(next[k]).length === 0) delete next[k];
            return next;
        });
    }

    function saveCell(k, data) {
        setSlots((m) => ({ ...m, [k]: data }));
    }

    /* ------------------------------- IO ------------------------------- */
    function handleExport() {
        // add a tiny header to help future imports
        const payload = { _type: "smart-timetable", _v: 1, settings, subjects, slots };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "smart-timetable.json";
        a.click();
        URL.revokeObjectURL(a.href);
    }

    function handleImport(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                // Strip BOM if present
                const raw = typeof reader.result === "string" ? reader.result : new TextDecoder().decode(reader.result);
                const text = String(raw).replace(/^\uFEFF/, "");
                const data = JSON.parse(text);

                // Accept multiple shapes: full payload, only settings, only subjects, or only slots
                const shape = sniff(data);

                if (!confirm("Import will replace current timetable. Continue?")) return;

                setSettings(normalizeSettings(shape.settings ?? {}));
                setSubjects(normalizeSubjects(shape.subjects ?? []));
                setSlots(normalizeSlots(shape.slots ?? {}));
                setBrush(null);
                setSlotEdit(null);
                alert("Imported successfully.");
            } catch (err) {
                console.error("Import failed:", err);
                alert("Import failed. Make sure you selected a valid JSON exported from this app.");
            } finally {
                // allow re-importing the same file
                e.target.value = "";
            }
        };
        reader.onerror = () => {
            alert("Couldn't read the selected file.");
            e.target.value = "";
        };
        reader.readAsText(file);
    }

    // Heuristic to accept different JSON shapes
    function sniff(d) {
        if (!d || typeof d !== "object") return { settings: {}, subjects: [], slots: {} };
        if (d._type === "smart-timetable" || d.settings || d.subjects || d.slots) {
            return { settings: d.settings || {}, subjects: d.subjects || [], slots: d.slots || {} };
        }
        // Only settings?
        if (d.days || d.periods) return { settings: d, subjects: [], slots: {} };
        // Only subjects?
        if (Array.isArray(d) && d.every(x => typeof x === "object" && (x.code || x.name || x.color))) {
            return { settings: {}, subjects: d, slots: {} };
        }
        // Only slots? (keys like "Mon:0")
        if (!Array.isArray(d)) {
            const keys = Object.keys(d);
            const looksLikeSlots = keys.length > 0 && keys.every(k => k.includes(":"));
            if (looksLikeSlots) return { settings: {}, subjects: [], slots: d };
        }
        return { settings: {}, subjects: [], slots: {} };
    }

    function handleReset() {
        if (!confirm("Reset everything? This clears subjects and timetable.")) return;
        setSettings(DEFAULT_SETTINGS);
        setSubjects([]);
        setSlots({});
        setBrush(null);
    }

    function subjectById(id) { return subjects.find((s) => s.id === id); }

    /* ------------------------------ Print ------------------------------ */
    function handlePrint() {
        const days = (settings.days || []).filter((d) => d.enabled);
        const periods = settings.periods || [];

        const css = `
      @page { size: A4; margin: 10mm; }
      * { box-sizing: border-box; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial; }
      h2 { margin: 0 0 8px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ccc; padding: 6px; font-size: 12px; text-align: center; }
      th:first-child, td:first-child { text-align: left; white-space: nowrap; }
      .time { color:#555; font-weight: 600; }
      .cell { border-radius: 6px; padding: 4px 6px; display: inline-block; min-width: 54px; }
      .sub { font-weight: 700; }
      .room { color:#222; opacity:.85; font-size: 11px; }
    `;

        const rows = periods.map((p, pi) => {
            const tds = days.map((d) => {
                const k = keyFor(d.key, pi);
                const sl = slots[k];
                if (!sl?.subjectId) return `<td>—</td>`;
                const sub = subjectById(sl.subjectId);
                const bg = (sub?.color || "#ddd").replace("#", "");
                return `<td>
          <span class="cell" style="background:#${bg}22; border:1px solid #${bg}">
            <span class="sub">${escape(sub?.code || "—")}</span>
            ${sl.room ? `<div class="room">${escape(sl.room)}</div>` : ""}
          </span>
        </td>`;
            }).join("");
            return `<tr>
        <td><div><strong>${escape(p.label ?? "")}</strong></div><div class="time">${escape(p.time ?? "")}</div></td>
        ${tds}
      </tr>`;
        }).join("");

        const thead = `<tr>
      <th>Period</th>
      ${days.map((d) => `<th>${escape(d.label ?? "")}</th>`).join("")}
    </tr>`;

        const html = `<!doctype html>
<html><head><meta charset="utf-8"/><title>Smart Timetable</title><style>${css}</style></head>
<body>
  <h2>Smart Timetable</h2>
  <table>
    <thead>${thead}</thead>
    <tbody>${rows}</tbody>
  </table>
  <script>window.print()</script>
</body></html>`;

        const w = window.open("", "_blank", "width=1000,height=900");
        if (!w) return alert("Popup blocked. Allow popups to print.");
        w.document.open(); w.document.write(html); w.document.close(); w.focus();

        function escape(s = "") {
            return String(s).replace(/[&<>"']/g, (c) => ({
                "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
            }[c]));
        }
    }

    /* -------------------------------- UI -------------------------------- */
    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div>
                    <Styled.Title>Smart Timetable</Styled.Title>
                    <Styled.Subtitle className="muted">
                        Click a subject to select the <em>brush</em>, then click cells to assign. Double-click (or click without brush) to edit slot.
                    </Styled.Subtitle>
                </div>

                <Styled.Actions>
                    <Styled.FileLabel>
                        Import
                        {/* allow all json extensions */}
                        <input type="file" accept=".json,application/json" onChange={handleImport} />
                    </Styled.FileLabel>
                    <Styled.Button onClick={handleExport} $variant="ghost">Export</Styled.Button>
                    <Styled.Button onClick={handlePrint} $variant="ghost">Print</Styled.Button>
                    <Styled.Button onClick={handleReset} $variant="danger">Reset</Styled.Button>
                </Styled.Actions>
            </Styled.Header>

            <Styled.Grid>
                {/* Subjects */}
                <Styled.Card>
                    <Styled.CardHead>
                        <Styled.CardTitle>Subjects</Styled.CardTitle>
                        <Styled.Button onClick={addSubject} $variant="ghost">+ Add</Styled.Button>
                    </Styled.CardHead>

                    <Styled.SubjectList>
                        {subjects.length === 0 && <Styled.Empty>No subjects yet.</Styled.Empty>}

                        {subjects.map((s) => (
                            <Styled.SubjectItem key={s.id} $active={brush === s.id}>
                                <Styled.ColorSwatch
                                    style={{ background: s.color }}
                                    onClick={() => setBrush(brush === s.id ? null : s.id)}
                                    title="Use as brush"
                                />
                                <div className="fields">
                                    <input
                                        className="code"
                                        placeholder="Code"
                                        value={s.code}
                                        onChange={(e) => updateSubject(s.id, { code: e.target.value })}
                                    />
                                    <input
                                        className="name"
                                        placeholder="Name"
                                        value={s.name}
                                        onChange={(e) => updateSubject(s.id, { name: e.target.value })}
                                    />
                                </div>
                                <div className="ops">
                                    <input
                                        type="color"
                                        value={s.color}
                                        onChange={(e) => updateSubject(s.id, { color: e.target.value })}
                                        title="Pick color"
                                    />
                                    <Styled.IconBtn title="Delete" onClick={() => deleteSubject(s.id)}>✕</Styled.IconBtn>
                                </div>
                            </Styled.SubjectItem>
                        ))}
                    </Styled.SubjectList>

                    <Styled.Hint className="muted">
                        Tip: Click a color square to toggle brush. Brush assigns instantly on cell click.
                    </Styled.Hint>
                </Styled.Card>

                {/* Settings */}
                <Styled.Card>
                    <Styled.CardHead>
                        <Styled.CardTitle>Settings</Styled.CardTitle>
                    </Styled.CardHead>

                    <Styled.SettingsRow>
                        <div>
                            <strong>Days</strong>
                            <Styled.DayToggles>
                                {(settings.days || []).map((d, i) => (
                                    <label key={d.key} title={d.label}>
                                        <input
                                            type="checkbox"
                                            checked={!!d.enabled}
                                            onChange={(e) =>
                                                setSettings((s) => {
                                                    const days = (s.days || []).slice();
                                                    days[i] = { ...days[i], enabled: e.target.checked };
                                                    return { ...s, days };
                                                })
                                            }
                                        />
                                        <span>{d.label}</span>
                                    </label>
                                ))}
                            </Styled.DayToggles>
                        </div>

                        <div>
                            <strong>Periods & times</strong>
                            <Styled.PeriodList>
                                {(settings.periods || []).map((p, idx) => (
                                    <div key={p.id} className="row">
                                        <input
                                            className="plabel"
                                            value={p.label}
                                            onChange={(e) =>
                                                setSettings((s) => {
                                                    const periods = (s.periods || []).slice();
                                                    periods[idx] = { ...periods[idx], label: e.target.value };
                                                    return { ...s, periods };
                                                })
                                            }
                                        />
                                        <input
                                            className="ptime"
                                            value={p.time}
                                            onChange={(e) =>
                                                setSettings((s) => {
                                                    const periods = (s.periods || []).slice();
                                                    periods[idx] = { ...periods[idx], time: e.target.value };
                                                    return { ...s, periods };
                                                })
                                            }
                                        />
                                        <Styled.IconBtn
                                            title="Remove period"
                                            onClick={() =>
                                                setSettings((s) => {
                                                    const curr = (s.periods || []);
                                                    if (curr.length <= 1) return s;
                                                    if (!confirm(`Remove ${p.label}?`)) return s;
                                                    const periods = curr.slice();
                                                    periods.splice(idx, 1);
                                                    // remove/shift slots of removed period index
                                                    setSlots((m) => {
                                                        const next = {};
                                                        Object.entries(m || {}).forEach(([k, v]) => {
                                                            const [day, pi] = k.split(":");
                                                            if (+pi === idx) return; // drop
                                                            const newIndex = +pi > idx ? +pi - 1 : +pi;
                                                            next[`${day}:${newIndex}`] = v;
                                                        });
                                                        return next;
                                                    });
                                                    return { ...s, periods };
                                                })
                                            }
                                        >
                                            ✕
                                        </Styled.IconBtn>
                                    </div>
                                ))}
                            </Styled.PeriodList>

                            <Styled.Row gap="8">
                                <Styled.Button
                                    $variant="ghost"
                                    onClick={() =>
                                        setSettings((s) => ({
                                            ...s,
                                            periods: [...(s.periods || []), { id: uid(), label: `P${(s.periods?.length || 0) + 1}`, time: "" }],
                                        }))
                                    }
                                >
                                    + Add Period
                                </Styled.Button>
                                <Styled.Button
                                    $variant="ghost"
                                    onClick={() =>
                                        setSettings((s) => ({ ...s, periods: defaultPeriodTimes(8, "08:00", 60) }))
                                    }
                                >
                                    Reset to 8 × 60min (08:00)
                                </Styled.Button>
                            </Styled.Row>
                        </div>
                    </Styled.SettingsRow>
                </Styled.Card>
            </Styled.Grid>

            {/* Timetable */}
            <Styled.Card>
                <Styled.CardHead>
                    <Styled.CardTitle>Timetable</Styled.CardTitle>
                    <Styled.Hint className="muted">Alt/Option-click a cell to clear.</Styled.Hint>
                </Styled.CardHead>

                <Styled.Table>
                    <thead>
                        <tr>
                            <th style={{ width: 180 }}>Period</th>
                            {enabledDays.map((d) => <th key={d.key}>{d.label}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {(settings.periods || []).map((p, pi) => (
                            <tr key={p.id}>
                                <td>
                                    <div><strong>{p.label}</strong></div>
                                    <div className="muted">{p.time}</div>
                                </td>
                                {enabledDays.map((d) => {
                                    const k = keyFor(d.key, pi);
                                    const data = slots[k];
                                    const sub = data?.subjectId ? subjectById(data.subjectId) : null;
                                    return (
                                        <td
                                            key={d.key}
                                            onClick={(e) => {
                                                if (e.altKey || e.metaKey) clearCell(k);
                                                else handleCellClick(d.key, pi);
                                            }}
                                            title={data?.note ? data.note : ""}
                                        >
                                            {sub ? (
                                                <Styled.Cell style={{ borderColor: sub.color, background: sub.color + "22" }}>
                                                    <div className="sub">{sub.code || "—"}</div>
                                                    {data?.room ? <div className="room">{data.room}</div> : null}
                                                </Styled.Cell>
                                            ) : <Styled.Dash>—</Styled.Dash>}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </Styled.Table>
            </Styled.Card>

            {/* Slot Editor */}
            {slotEdit && (
                <SlotEditor
                    subjects={subjects}
                    k={slotEdit.key}
                    initial={slotEdit.data}
                    onClose={() => setSlotEdit(null)}
                    onSave={(k, data) => { saveCell(k, data); setSlotEdit(null); }}
                    onClear={(k) => { clearCell(k); setSlotEdit(null); }}
                />
            )}
        </Styled.Wrapper>
    );
}

/* ---------------------------- Slot Editor ---------------------------- */
function SlotEditor({ subjects, k, initial, onClose, onSave, onClear }) {
    const [subjectId, setSubjectId] = useState(initial.subjectId || "");
    const [room, setRoom] = useState(initial.room || "");
    const [note, setNote] = useState(initial.note || "");

    return (
        <Styled.Modal onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <Styled.Dialog onMouseDown={(e) => e.stopPropagation()}>
                <Styled.DialogHead>
                    <h3>Edit Slot — {k}</h3>
                    <button onClick={onClose} aria-label="Close">✕</button>
                </Styled.DialogHead>

                <Styled.Form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSave(k, { subjectId, room, note });
                    }}
                >
                    <label>
                        <span>Subject</span>
                        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                            <option value="">— None —</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>{s.code || s.name || s.id}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <span>Room</span>
                        <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Optional (e.g., 204)" />
                    </label>
                    <label className="full">
                        <span>Note</span>
                        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional notes" />
                    </label>

                    <Styled.DialogFoot>
                        <Styled.Button type="submit">Save</Styled.Button>
                        <Styled.Button type="button" $variant="ghost" onClick={() => onClear(k)}>Clear</Styled.Button>
                        <Styled.Button type="button" $variant="danger" onClick={onClose}>Close</Styled.Button>
                    </Styled.DialogFoot>
                </Styled.Form>
            </Styled.Dialog>
        </Styled.Modal>
    );
}

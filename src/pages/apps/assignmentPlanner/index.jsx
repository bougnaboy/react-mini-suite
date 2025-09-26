import { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

/* ============================ Constants ============================ */
const KEYS = {
    DATA: "ap_assignments",
    COUNTER_PREFIX: "ap_counter_", // ap_counter_YYYYMMDD
};

const STATUSES = [
    { key: "todo", label: "To-Do" },
    { key: "doing", label: "In-Progress" },
    { key: "done", label: "Done" },
];

const PRIORITIES = [
    { key: "high", label: "High" },
    { key: "med", label: "Medium" },
    { key: "low", label: "Low" },
];

const emptyAssignment = {
    id: "",
    title: "",
    course: "",
    dueAt: "", // datetime-local
    priority: "med",
    status: "todo",
    estHours: "",
    notes: "",
    createdAt: "",
};

/* ============================ Helpers ============================= */
const yyyymmdd = (d = new Date()) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
        d.getDate()
    ).padStart(2, "0")}`;

const prettyDateTime = (s) => {
    if (!s) return "—";
    const d = new Date(s);
    if (isNaN(d)) return s;
    return d.toLocaleString([], { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
};

const daysLeft = (s) => {
    if (!s) return null;
    const now = new Date();
    const due = new Date(s);
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diff;
};

function load(key, fb) {
    try {
        const v = JSON.parse(localStorage.getItem(key) || "null");
        return v ?? fb;
    } catch {
        return fb;
    }
}
function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function nextId() {
    const d = yyyymmdd();
    const k = KEYS.COUNTER_PREFIX + d;
    const curr = +(localStorage.getItem(k) || "0");
    const next = curr + 1;
    localStorage.setItem(k, String(next));
    return `A${d}-${String(next).padStart(3, "0")}`;
}

/* ============================ Component =========================== */
export default function AssignmentPlanner() {
    const [items, setItems] = useState(() => load(KEYS.DATA, []));
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [prioFilter, setPrioFilter] = useState("all");
    const [courseFilter, setCourseFilter] = useState("all");
    const [sort, setSort] = useState({ by: "dueAt", dir: "asc" }); // asc|desc
    const [showForm, setShowForm] = useState(false);
    const [draft, setDraft] = useState(emptyAssignment);

    useEffect(() => save(KEYS.DATA, items), [items]);

    const courses = useMemo(() => {
        const set = new Set(items.map((i) => i.course).filter(Boolean));
        return Array.from(set).sort();
    }, [items]);

    const filtered = useMemo(() => {
        let list = items.slice();

        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter((i) =>
                [i.id, i.title, i.course, i.notes].join(" ").toLowerCase().includes(q)
            );
        }
        if (statusFilter !== "all") list = list.filter((i) => i.status === statusFilter);
        if (prioFilter !== "all") list = list.filter((i) => i.priority === prioFilter);
        if (courseFilter !== "all") list = list.filter((i) => i.course === courseFilter);

        list.sort((a, b) => {
            const dir = sort.dir === "asc" ? 1 : -1;
            if (sort.by === "dueAt") {
                return (new Date(a.dueAt) - new Date(b.dueAt)) * dir;
            }
            if (sort.by === "priority") {
                const order = { high: 3, med: 2, low: 1 };
                return (order[a.priority] - order[b.priority]) * dir;
            }
            return a.id.localeCompare(b.id) * dir;
        });
        return list;
    }, [items, query, statusFilter, prioFilter, courseFilter, sort]);

    const stats = useMemo(() => {
        const total = items.length;
        const done = items.filter((i) => i.status === "done").length;
        const todo = items.filter((i) => i.status === "todo").length;
        const doing = items.filter((i) => i.status === "doing").length;
        const nextDue = items
            .filter((i) => i.status !== "done" && i.dueAt)
            .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))[0];
        return { total, done, todo, doing, nextDue };
    }, [items]);

    /* ----------------------------- CRUD ----------------------------- */
    function openNew() {
        setDraft({ ...emptyAssignment, id: "", createdAt: "" });
        setShowForm(true);
    }
    function openEdit(it) {
        setDraft(it);
        setShowForm(true);
    }
    function saveDraft() {
        if (!draft.title.trim()) {
            alert("Title is required.");
            return;
        }
        if (!draft.id) {
            const id = nextId();
            const createdAt = new Date().toISOString();
            const rec = { ...emptyAssignment, ...draft, id, createdAt };
            setItems((arr) => [rec, ...arr]);
        } else {
            setItems((arr) => arr.map((i) => (i.id === draft.id ? { ...draft } : i)));
        }
        setShowForm(false);
    }
    function deleteItem(id) {
        const it = items.find((x) => x.id === id);
        const name = it ? `\n${it.title}` : "";
        if (!confirm(`Delete this assignment?${name}`)) return;
        setItems((arr) => arr.filter((i) => i.id !== id));
    }
    function changeStatus(id, status) {
        setItems((arr) => arr.map((i) => (i.id === id ? { ...i, status } : i)));
    }

    /* --------------------------- IO / Print ------------------------- */
    function handleExport() {
        const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `assignments-${yyyymmdd()}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    }
    function handleImport(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result);
                if (!Array.isArray(data)) throw new Error("Invalid file");
                if (!confirm("Replace existing assignments with imported data?")) return;
                setItems(data);
            } catch {
                alert("Invalid JSON file.");
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    }
    function handleReset() {
        if (!confirm("This will delete ALL assignments. Continue?")) return;
        setItems([]);
    }
    function handlePrint() {
        // Format: "Sep 27, 2025, 11:57 AM"
        const fmtPrintDateTime = (val) => {
            if (!val) return "—";
            const d = new Date(val);
            if (isNaN(d)) return "—";
            return d.toLocaleString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            });
        };

        const css = `
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial; }
    h1,h2,h3 { margin:0; }
    .muted{color:#555}
    table{width:100%; border-collapse:collapse; margin-top:8px}
    th,td{border-bottom:1px solid #ddd; padding:6px; font-size:12px}
    th{text-align:left}
    .pill{display:inline-block; padding:2px 8px; border:1px solid #ccc; border-radius:999px; font-size:11px}
  `;

        const rows = items
            .slice()
            .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
            .map(
                (i) => `<tr>
        <td><strong>${escape(i.title)}</strong><div class="muted">${escape(i.course || "")}</div></td>
        <td>${fmtPrintDateTime(i.dueAt)}</td>
        <td><span class="pill">${i.priority}</span></td>
        <td><span class="pill">${STATUSES.find(s => s.key === i.status)?.label || i.status}</span></td>
      </tr>`
            )
            .join("");

        const nowStr = fmtPrintDateTime(new Date());

        const html = `<!doctype html>
<html><head><meta charset="utf-8"/><title>Assignments</title><style>${css}</style></head>
<body>
  <h2>Assignment Planner</h2>
  <div class="muted">Generated: ${nowStr}</div>
  <table>
    <thead><tr><th>Title • Course</th><th>Due</th><th>Priority</th><th>Status</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="4" class="muted">No assignments</td></tr>`}</tbody>
  </table>
  <script>window.print()</script>
</body></html>`;

        const w = window.open("", "_blank", "width=900,height=1100");
        if (!w) return alert("Popup blocked. Allow popups to print.");
        w.document.open(); w.document.write(html); w.document.close(); w.focus();

        function escape(s = "") {
            return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
        }
    }

    const escape = (s = "") => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    /* ============================= UI ============================= */
    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div>
                    <Styled.Title>Assignment Planner</Styled.Title>
                    <Styled.Subtitle>
                        Organize coursework • autosave • quick print
                    </Styled.Subtitle>
                </div>

                <Styled.Actions>
                    <Styled.Button onClick={openNew}>New</Styled.Button>
                    <Styled.FileLabel>
                        Import
                        <input type="file" accept="application/json" onChange={handleImport} />
                    </Styled.FileLabel>
                    <Styled.Button onClick={handleExport} $variant="ghost">Export</Styled.Button>
                    <Styled.Button onClick={handlePrint} $variant="ghost">Print</Styled.Button>
                    <Styled.Button onClick={handleReset} $variant="danger">Reset All</Styled.Button>
                </Styled.Actions>
            </Styled.Header>

            {/* Toolbar */}
            <Styled.Toolbar>
                <Styled.Search
                    placeholder="Search by title, course, notes…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Styled.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} title="Status">
                    <option value="all">All Status</option>
                    {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </Styled.Select>
                <Styled.Select value={prioFilter} onChange={(e) => setPrioFilter(e.target.value)} title="Priority">
                    <option value="all">All Priority</option>
                    {PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                </Styled.Select>
                <Styled.Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} title="Course">
                    <option value="all">All Courses</option>
                    {courses.map((c) => <option key={c} value={c}>{c}</option>)}
                </Styled.Select>
                <Styled.Select value={`${sort.by}:${sort.dir}`} onChange={(e) => {
                    const [by, dir] = e.target.value.split(":");
                    setSort({ by, dir });
                }}>
                    <option value="dueAt:asc">Due ↑</option>
                    <option value="dueAt:desc">Due ↓</option>
                    <option value="priority:desc">Priority High→Low</option>
                    <option value="priority:asc">Priority Low→High</option>
                    <option value="id:desc">Newest</option>
                    <option value="id:asc">Oldest</option>
                </Styled.Select>
            </Styled.Toolbar>

            {/* Stats */}
            <Styled.Stats>
                <div><strong>Total:</strong> {stats.total}</div>
                <div><strong>To-Do:</strong> {stats.todo}</div>
                <div><strong>In-Progress:</strong> {stats.doing}</div>
                <div><strong>Done:</strong> {stats.done}</div>
                <div className="muted">
                    {stats.nextDue ? <>Next: <em>{stats.nextDue.title}</em> • {prettyDateTime(stats.nextDue.dueAt)}</> : "No upcoming"}
                </div>
            </Styled.Stats>

            {/* Table */}
            <Styled.Card>
                <Styled.Table>
                    <thead>
                        <tr>
                            <th>Assignment</th>
                            <th>Course</th>
                            <th>Due</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Est. hrs</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7}><Styled.Empty>No matching assignments.</Styled.Empty></td>
                            </tr>
                        )}
                        {filtered.map((i) => {
                            const dleft = daysLeft(i.dueAt);
                            return (
                                <tr key={i.id}>
                                    <td>
                                        <Styled.TitleCell onClick={() => openEdit(i)} title="Edit">
                                            <strong>{i.title || "Untitled"}</strong>
                                            {i.notes && <div className="muted small">{i.notes}</div>}
                                        </Styled.TitleCell>
                                    </td>
                                    <td>{i.course || "—"}</td>
                                    <td>
                                        <div>{prettyDateTime(i.dueAt)}</div>
                                        {dleft !== null && (
                                            <Styled.DueBadge $overdue={dleft < 0} $soon={dleft >= 0 && dleft <= 2}>
                                                {dleft < 0 ? `${Math.abs(dleft)}d overdue` : dleft === 0 ? "Today" : `${dleft}d left`}
                                            </Styled.DueBadge>
                                        )}
                                    </td>
                                    <td><Styled.Pill data-prio={i.priority}>{i.priority}</Styled.Pill></td>
                                    <td>
                                        <Styled.InlineSelect
                                            value={i.status}
                                            onChange={(e) => changeStatus(i.id, e.target.value)}
                                        >
                                            {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                                        </Styled.InlineSelect>
                                    </td>
                                    <td className="num">{i.estHours || "—"}</td>
                                    <td className="num">
                                        <Styled.IconBtn title="Edit" onClick={() => openEdit(i)}>✎</Styled.IconBtn>
                                        <Styled.IconBtn title="Delete" onClick={() => deleteItem(i.id)}>✕</Styled.IconBtn>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Styled.Table>
            </Styled.Card>

            {/* Form Modal */}
            {showForm && (
                <Styled.Modal onMouseDown={(e) => e.target === e.currentTarget && setShowForm(false)}>
                    <Styled.Dialog onMouseDown={(e) => e.stopPropagation()}>
                        <Styled.DialogHead>
                            <h3>{draft.id ? "Edit Assignment" : "New Assignment"}</h3>
                            <button onClick={() => setShowForm(false)} aria-label="Close">✕</button>
                        </Styled.DialogHead>

                        <Styled.Form onSubmit={(e) => { e.preventDefault(); saveDraft(); }}>
                            <label>
                                <span>Title *</span>
                                <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
                            </label>
                            <label>
                                <span>Course</span>
                                <input value={draft.course} onChange={(e) => setDraft((d) => ({ ...d, course: e.target.value }))} />
                            </label>
                            <Styled.Grid2>
                                <label>
                                    <span>Due (date & time)</span>
                                    <input type="datetime-local" value={draft.dueAt} onChange={(e) => setDraft((d) => ({ ...d, dueAt: e.target.value }))} />
                                </label>
                                <label>
                                    <span>Priority</span>
                                    <select value={draft.priority} onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value }))}>
                                        {PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                                    </select>
                                </label>
                            </Styled.Grid2>
                            <Styled.Grid2>
                                <label>
                                    <span>Status</span>
                                    <select value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}>
                                        {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                                    </select>
                                </label>
                                <label>
                                    <span>Est. Hours</span>
                                    <input type="number" min="0" step="0.5" value={draft.estHours} onChange={(e) => setDraft((d) => ({ ...d, estHours: e.target.value }))} />
                                </label>
                            </Styled.Grid2>
                            <label className="full">
                                <span>Notes</span>
                                <textarea rows={3} value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} />
                            </label>

                            <Styled.DialogFoot>
                                <Styled.Button type="submit">{draft.id ? "Save" : "Add"}</Styled.Button>
                                {draft.id && (
                                    <Styled.Button
                                        type="button"
                                        $variant="danger"
                                        onClick={() => {
                                            setShowForm(false);
                                            deleteItem(draft.id);
                                        }}
                                    >
                                        Delete
                                    </Styled.Button>
                                )}
                                <Styled.Button type="button" $variant="ghost" onClick={() => setShowForm(false)}>Close</Styled.Button>
                            </Styled.DialogFoot>
                        </Styled.Form>
                    </Styled.Dialog>
                </Styled.Modal>
            )}
        </Styled.Wrapper>
    );
}

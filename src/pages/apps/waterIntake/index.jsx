import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

const STORAGE_KEY = "water-intake.v1";
const GOAL_KEY_V1 = "water-intake.goal.v1";
const GLASS_ML_KEY_V1 = "water-intake.glassml.v1";

const DEFAULT_GOAL = 8;             // glasses/day
const DEFAULT_GLASS_ML = 250;       // ml per glass
const UNIT = "glasses";             // label only for goal/progress

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

const todayISO = () => {
    const t = new Date();
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, "0");
    const dd = String(t.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const fmtDateNice = (iso) => {
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

const loadLogs = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; }
    catch { return []; }
};
const loadGoal = () => {
    const v = Number(localStorage.getItem(GOAL_KEY_V1));
    return Number.isFinite(v) && v > 0 ? v : DEFAULT_GOAL;
};
const loadGlassMl = () => {
    const v = Number(localStorage.getItem(GLASS_ML_KEY_V1));
    return Number.isFinite(v) && v > 0 ? v : DEFAULT_GLASS_ML;
};

export default function WaterIntake() {
    // data
    const [logs, setLogs] = useState(loadLogs);        // [{id, date, createdAt}]
    const [goal, setGoal] = useState(loadGoal);
    const [glassMl, setGlassMl] = useState(loadGlassMl);

    // ui
    const [selectedDate, setSelectedDate] = useState(todayISO());
    const [addCount, setAddCount] = useState(1);

    // settings inputs (editable)
    const [editingGoal, setEditingGoal] = useState(goal);
    const [editingGlassMl, setEditingGlassMl] = useState(glassMl);

    useEffect(() => setEditingGoal(goal), [goal]);
    useEffect(() => setEditingGlassMl(glassMl), [glassMl]);

    // confirm modal
    const [confirm, setConfirm] = useState(null); // {title, message, confirmText, cancelText, tone, onConfirm}
    const askConfirm = (opts) =>
        setConfirm({ title: "Are you sure?", message: "", confirmText: "Confirm", cancelText: "Cancel", tone: "default", ...opts });
    const handleConfirm = () => { const fn = confirm?.onConfirm; setConfirm(null); if (typeof fn === "function") fn(); };
    useEffect(() => {
        if (!confirm) return;
        const onKey = (e) => { if (e.key === "Escape") setConfirm(null); if (e.key === "Enter") handleConfirm(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [confirm]);

    // persist
    useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(logs)); }, [logs]);
    useEffect(() => { localStorage.setItem(GOAL_KEY_V1, String(goal)); }, [goal]);
    useEffect(() => { localStorage.setItem(GLASS_ML_KEY_V1, String(glassMl)); }, [glassMl]);

    // derived (for selected day)
    const logsForDay = useMemo(
        () => logs.filter(l => l.date === selectedDate).sort((a, b) => b.createdAt - a.createdAt),
        [logs, selectedDate]
    );
    const countForDay = logsForDay.length;
    const consumedMl = countForDay * glassMl;
    const pct = goal > 0 ? Math.min(100, Math.round((countForDay / goal) * 100)) : 0;

    // actions
    const addGlasses = (n) => {
        const k = Math.max(1, Math.floor(Number(n) || 1));
        const now = Date.now();
        const newOnes = Array.from({ length: k }, (_, i) => ({
            id: uid() + i,
            date: selectedDate,
            createdAt: now + i,
        }));
        setLogs(prev => [...newOnes, ...prev]);
        setAddCount(1);
    };

    const undoLast = () => {
        // remove most recent entry for the selected day
        const idToRemove = logsForDay[0]?.id;
        if (!idToRemove) return;
        setLogs(prev => prev.filter(l => l.id !== idToRemove));
    };

    const removeLog = (id) => setLogs(prev => prev.filter(l => l.id !== id));
    const clearDay = () => setLogs(prev => prev.filter(l => l.date !== selectedDate));

    const shiftDay = (delta) => {
        const d = new Date(`${selectedDate}T00:00:00`);
        d.setDate(d.getDate() + delta);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        setSelectedDate(`${yyyy}-${mm}-${dd}`);
    };

    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        <Styled.Title>Water Intake</Styled.Title>
                        <Styled.Sub>Log {UNIT} • Visual progress • LocalStorage</Styled.Sub>
                    </div>

                    <div style={{ textAlign: "right" }}>
                        <Styled.Badge>{countForDay}/{goal} {UNIT}</Styled.Badge>{" "}
                        <Styled.Badge $tone="muted">{pct}%</Styled.Badge>
                        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
                            ~{consumedMl} ml today <span style={{ opacity: 0.7 }}>({glassMl} ml/glass)</span>
                        </div>
                    </div>
                </Styled.Header>

                {/* Progress Ring */}
                <Styled.Card>
                    <Styled.ProgressWrap>
                        <ProgressRing value={countForDay} max={goal} size={140} stroke={10} />

                        <Styled.ProgressInfo>
                            <div className="big">{countForDay}/{goal}</div>
                            <div className="small">{pct}% of goal</div>
                        </Styled.ProgressInfo>

                        <Styled.QuickRow>
                            <Styled.PrimaryButton type="button" onClick={() => addGlasses(1)}>+1</Styled.PrimaryButton>
                            <Styled.Button type="button" onClick={() => addGlasses(2)}>+2</Styled.Button>
                            <Styled.Button type="button" onClick={() => addGlasses(3)}>+3</Styled.Button>

                            <Styled.Input
                                type="number"
                                inputMode="numeric"
                                min="1"
                                step="1"
                                value={addCount}
                                onChange={(e) => setAddCount(Math.max(1, Number(e.target.value) || 1))}
                                aria-label="Number of glasses"
                                style={{ width: 90 }}
                            />
                            <Styled.PrimaryButton type="button" onClick={() => addGlasses(addCount)}>Add</Styled.PrimaryButton>

                            <Styled.Button type="button" onClick={undoLast} disabled={countForDay === 0}>
                                Undo last
                            </Styled.Button>
                        </Styled.QuickRow>
                    </Styled.ProgressWrap>
                </Styled.Card>

                {/* Toolbar: date + goal + per-glass ml */}
                <Styled.Toolbar>
                    <Styled.RowWrap>
                        <Styled.Button type="button" onClick={() => shiftDay(-1)}>◀ Prev</Styled.Button>
                        <Styled.Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value || todayISO())}
                            aria-label="Selected date"
                            style={{ width: 160 }}
                        />
                        <Styled.Button type="button" onClick={() => setSelectedDate(todayISO())}>Today</Styled.Button>
                        <Styled.Button type="button" onClick={() => shiftDay(1)}>Next ▶</Styled.Button>
                    </Styled.RowWrap>

                    {/* Goal controls */}
                    <Styled.RowWrap>
                        <Styled.Input
                            type="number"
                            inputMode="numeric"
                            min="1"
                            step="1"
                            value={editingGoal}
                            onChange={(e) => setEditingGoal(Math.max(1, Number(e.target.value) || 1))}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && editingGoal !== goal) {
                                    askConfirm({
                                        title: "Update daily goal?",
                                        message: `Set goal to ${editingGoal} ${UNIT}?`,
                                        confirmText: "Set goal",
                                        onConfirm: () => setGoal(editingGoal),
                                    });
                                }
                            }}
                            aria-label={`Daily goal (${UNIT})`}
                            style={{ width: 140 }}
                        />
                        <Styled.Button
                            type="button"
                            onClick={() => {
                                if (editingGoal === goal) return;
                                askConfirm({
                                    title: "Update daily goal?",
                                    message: `Set goal to ${editingGoal} ${UNIT}?`,
                                    confirmText: "Set goal",
                                    onConfirm: () => setGoal(editingGoal),
                                });
                            }}
                        >
                            Set goal
                        </Styled.Button>

                        <Styled.DangerButton
                            type="button"
                            onClick={() => askConfirm({
                                title: "Reset goal?",
                                message: `Reset goal to ${DEFAULT_GOAL} ${UNIT}?`,
                                confirmText: "Reset",
                                tone: "danger",
                                onConfirm: () => setGoal(DEFAULT_GOAL),
                            })}
                        >
                            Reset
                        </Styled.DangerButton>
                    </Styled.RowWrap>

                    {/* Per-glass ML controls */}
                    <Styled.RowWrap>
                        <Styled.Input
                            type="number"
                            inputMode="numeric"
                            min="50"
                            step="50"
                            value={editingGlassMl}
                            onChange={(e) => setEditingGlassMl(Math.max(1, Number(e.target.value) || 1))}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && editingGlassMl !== glassMl) {
                                    askConfirm({
                                        title: "Update per-glass size?",
                                        message: `Set per glass to ${editingGlassMl} ml?`,
                                        confirmText: "Set ml/glass",
                                        onConfirm: () => setGlassMl(editingGlassMl),
                                    });
                                }
                            }}
                            aria-label="Per glass (ml)"
                            style={{ width: 160 }}
                        />
                        <Styled.Button
                            type="button"
                            onClick={() => {
                                if (editingGlassMl === glassMl) return;
                                askConfirm({
                                    title: "Update per-glass size?",
                                    message: `Set per glass to ${editingGlassMl} ml?`,
                                    confirmText: "Set ml/glass",
                                    onConfirm: () => setGlassMl(editingGlassMl),
                                });
                            }}
                        >
                            Set ml/glass
                        </Styled.Button>

                        <Styled.DangerButton
                            type="button"
                            onClick={() => askConfirm({
                                title: "Reset per-glass size?",
                                message: `Reset to ${DEFAULT_GLASS_ML} ml per glass?`,
                                confirmText: "Reset",
                                tone: "danger",
                                onConfirm: () => setGlassMl(DEFAULT_GLASS_ML),
                            })}
                        >
                            Reset ml
                        </Styled.DangerButton>
                    </Styled.RowWrap>

                    <Styled.RowWrap>
                        <Styled.DangerButton
                            type="button"
                            onClick={() => askConfirm({
                                title: "Clear this day?",
                                message: `Remove all logs on ${fmtDateNice(selectedDate)}?`,
                                confirmText: "Clear day",
                                tone: "danger",
                                onConfirm: clearDay
                            })}
                        >
                            Clear day
                        </Styled.DangerButton>
                    </Styled.RowWrap>
                </Styled.Toolbar>

                {/* Logs list */}
                <Styled.List>
                    {logsForDay.length === 0 && <Styled.Empty>No logs on {fmtDateNice(selectedDate)}.</Styled.Empty>}

                    {logsForDay.map((l, idx) => (
                        <Styled.Item key={l.id}>
                            <Styled.ItemLeft>
                                <div>
                                    <Styled.ItemTitle>Glass #{logsForDay.length - idx}</Styled.ItemTitle>
                                    <Styled.ItemMeta>
                                        <Styled.Tag>#water</Styled.Tag>
                                        <span>•</span>
                                        <span>{new Date(l.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                        <span>•</span>
                                        <span>{glassMl} ml</span>
                                    </Styled.ItemMeta>
                                </div>
                            </Styled.ItemLeft>

                            <Styled.ItemRight>
                                <Styled.IconButton
                                    onClick={() => askConfirm({
                                        title: "Delete log?",
                                        message: `Delete this glass entry?`,
                                        confirmText: "Delete",
                                        tone: "danger",
                                        onConfirm: () => removeLog(l.id)
                                    })}
                                    aria-label="Delete"
                                >
                                    🗑️
                                </Styled.IconButton>
                            </Styled.ItemRight>
                        </Styled.Item>
                    ))}
                </Styled.List>

                <Styled.FooterNote>Data stays in your browser (localStorage). Refresh-safe.</Styled.FooterNote>

                {/* Confirm Modal */}
                {confirm && (
                    <Styled.ModalOverlay onClick={() => setConfirm(null)}>
                        <Styled.ModalCard role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(e) => e.stopPropagation()}>
                            <Styled.ModalTitle id="confirm-title">{confirm.title}</Styled.ModalTitle>
                            {confirm.message ? <Styled.ModalMessage>{confirm.message}</Styled.ModalMessage> : null}
                            <Styled.ModalActions>
                                <Styled.Button type="button" onClick={() => setConfirm(null)}>{confirm.cancelText || "Cancel"}</Styled.Button>
                                {confirm.tone === "danger" ? (
                                    <Styled.DangerButton type="button" onClick={handleConfirm} autoFocus>{confirm.confirmText || "Confirm"}</Styled.DangerButton>
                                ) : (
                                    <Styled.PrimaryButton type="button" onClick={handleConfirm} autoFocus>{confirm.confirmText || "Confirm"}</Styled.PrimaryButton>
                                )}
                            </Styled.ModalActions>
                        </Styled.ModalCard>
                    </Styled.ModalOverlay>
                )}
            </Styled.Container>
        </Styled.Page>
    );
}

/** Simple circular progress ring using SVG */
function ProgressRing({ value, max, size = 140, stroke = 10 }) {
    const safeMax = Math.max(1, Number(max) || 1);
    const clamped = Math.max(0, Math.min(value, safeMax));
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = circumference * (clamped / safeMax);
    const dashoffset = circumference - progress;

    return (
        <Styled.Ring aria-label={`Progress ${clamped}/${safeMax}`}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none"
                    stroke="hsl(0 0% 100% / 0.12)"     /* track */
                    strokeWidth={stroke}
                />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none"
                    stroke="currentColor"               /* progress uses text color */
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={dashoffset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`} /* start at top */
                />
            </svg>
        </Styled.Ring>
    );
}

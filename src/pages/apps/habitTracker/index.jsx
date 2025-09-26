// HabitTracker/index.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

/* -------------------------
   Storage & helpers
------------------------- */
const STORAGE_KEY = "habitTracker.v1";

const pad = (n) => String(n).padStart(2, "0");
const monthKeyOf = (y, m) => `${y}-${pad(m)}`; // m: 1-12
const parseMonthKey = (mk) => {
    const [y, m] = mk.split("-").map(Number);
    return { y, m };
};
const daysIn = (y, m /* 1..12 */) => new Date(y, m, 0).getDate();
const ymd = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const todayYMD = () => {
    const d = new Date();
    return ymd(d.getFullYear(), d.getMonth() + 1, d.getDate());
};

// localStorage
const loadState = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : { habits: [] };
    } catch {
        return { habits: [] };
    }
};
const saveState = (s) => localStorage.setItem(STORAGE_KEY, JSON.stringify(s));

/* -------------------------
   Component
------------------------- */
export default function HabitTracker() {
    // month selection
    const now = new Date();
    const [monthKey, setMonthKey] = useState(monthKeyOf(now.getFullYear(), now.getMonth() + 1));

    // data
    const [state, setState] = useState(() => loadState());
    const [showAdd, setShowAdd] = useState(false);
    const [newHabit, setNewHabit] = useState({ name: "" });

    // ui
    const [query, setQuery] = useState("");
    const [view, setView] = useState("all"); // all | active | archived

    // derived
    const { y, m } = parseMonthKey(monthKey);
    const totalDays = daysIn(y, m);
    const dayList = useMemo(() => Array.from({ length: totalDays }, (_, i) => i + 1), [totalDays]);

    // persist
    useEffect(() => { saveState(state); }, [state]);

    // actions
    const addHabit = () => {
        const name = (newHabit.name || "").trim();
        if (!name) return;
        setState((s) => ({
            ...s,
            habits: [
                ...s.habits,
                { id: crypto.randomUUID(), name, createdAt: Date.now(), archived: false, marks: {} }, // marks: { 'YYYY-MM-DD': 'done'|'skip' }
            ],
        }));
        setNewHabit({ name: "" });
        setShowAdd(false);
    };

    const archiveHabit = (id, val = true) => {
        setState((s) => ({
            ...s,
            habits: s.habits.map((h) => (h.id === id ? { ...h, archived: val } : h)),
        }));
    };

    const removeHabit = (id) => {
        setState((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) }));
    };

    const toggleMark = (habitId, day) => {
        const key = ymd(y, m, day);
        setState((s) => {
            const habits = s.habits.map((h) => {
                if (h.id !== habitId) return h;
                const prev = h.marks?.[key] || null;
                const next = prev === null ? "done" : prev === "done" ? "skip" : null; // cycle
                const marks = { ...(h.marks || {}) };
                if (!next) delete marks[key];
                else marks[key] = next;
                return { ...h, marks };
            });
            return { ...s, habits };
        });
    };

    // filters
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return state.habits.filter((h) => {
            if (view === "archived" && !h.archived) return false;
            if (view === "active" && h.archived) return false;
            if (!q) return true;
            return h.name.toLowerCase().includes(q);
        });
    }, [state.habits, query, view]);

    // month input helpers
    const onMonthChange = (val) => { /^\d{4}-\d{2}$/.test(val) && setMonthKey(val); };
    const prevMonth = () => {
        let yr = y, mo = m - 1; if (mo < 1) { yr -= 1; mo = 12; }
        setMonthKey(monthKeyOf(yr, mo));
    };
    const nextMonth = () => {
        let yr = y, mo = m + 1; if (mo > 12) { yr += 1; mo = 1; }
        setMonthKey(monthKeyOf(yr, mo));
    };

    // completion %
    const pct = (h) => {
        let done = 0;
        for (let d = 1; d <= totalDays; d++) {
            if (h.marks?.[ymd(y, m, d)] === "done") done++;
        }
        return Math.round((done / totalDays) * 100) || 0;
    };

    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        <Styled.Title>Habit Tracker</Styled.Title>
                        <Styled.Sub>Grid-based monthly tracker — LocalStorage. Click a day to toggle.</Styled.Sub>
                    </div>
                    <Styled.BadgeRow>
                        <Styled.Tag>Total: {state.habits.length}</Styled.Tag>
                        <Styled.Tag $tone="muted">{new Date(`${monthKey}-01`).toLocaleString(undefined, { month: "long", year: "numeric" })}</Styled.Tag>
                    </Styled.BadgeRow>
                </Styled.Header>

                {/* Filters (single row, wraps on small screens) */}
                <Styled.FilterBar>
                    <Styled.Input
                        placeholder='Search habits (e.g., "Exercise", "No Smoking")'
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search habits"
                        style={{ flex: "2 1 320px" }}
                    />
                    <Styled.Select value={view} onChange={(e) => setView(e.target.value)} aria-label="View">
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                    </Styled.Select>

                    <Styled.Input
                        type="month"
                        value={monthKey}
                        onChange={(e) => onMonthChange(e.target.value)}
                        aria-label="Month"
                        style={{ flex: "0 1 180px" }}
                    />
                    <Styled.Button onClick={prevMonth} title="Previous month">◀</Styled.Button>
                    <Styled.Button onClick={nextMonth} title="Next month">▶</Styled.Button>

                    <Styled.Button onClick={() => setShowAdd((v) => !v)}>
                        {showAdd ? "Close" : "Add Habit"}
                    </Styled.Button>

                    <Styled.DangerButton
                        onClick={() => {
                            setState((s) => ({
                                ...s,
                                habits: s.habits.map((h) => {
                                    const marks = { ...(h.marks || {}) };
                                    for (let d = 1; d <= totalDays; d++) delete marks[ymd(y, m, d)];
                                    return { ...h, marks };
                                }),
                            }));
                        }}
                        title="Clear all marks for this month"
                    >
                        Clear Month
                    </Styled.DangerButton>
                </Styled.FilterBar>

                {/* Add Habit panel (Save/Cancel under inputs, right-aligned) */}
                {showAdd && (
                    <Styled.Card>
                        <Styled.FormRow>
                            <Styled.Input
                                placeholder='Habit name (e.g., "No Smoking", "Exercise")'
                                value={newHabit.name}
                                onChange={(e) => setNewHabit({ name: e.target.value })}
                                autoFocus
                                style={{ flex: "2 1 360px" }}
                            />
                            <Styled.PrimaryButton onClick={addHabit} disabled={!newHabit.name?.trim()}>
                                Add
                            </Styled.PrimaryButton>
                        </Styled.FormRow>
                        <Styled.ButtonRow>
                            <Styled.Button onClick={() => { setShowAdd(false); setNewHabit({ name: "" }); }}>
                                Cancel
                            </Styled.Button>
                            <Styled.PrimaryButton onClick={addHabit} disabled={!newHabit.name?.trim()}>
                                Save
                            </Styled.PrimaryButton>
                        </Styled.ButtonRow>
                    </Styled.Card>
                )}

                {/* Grid */}
                <Styled.GridOuter>
                    {/* Header row */}
                    <Styled.GridHeader $cols={totalDays}>
                        <Styled.GHCell className="sticky">Habit / Progress</Styled.GHCell>
                        {dayList.map((d) => (
                            <Styled.GHCell key={`dh-${d}`} className="day" aria-label={`Day ${d}`}>
                                {d}
                            </Styled.GHCell>
                        ))}
                    </Styled.GridHeader>

                    {/* Habit rows */}
                    {filtered.length === 0 ? (
                        <Styled.Empty>No habits yet. Add one to get started.</Styled.Empty>
                    ) : (
                        filtered.map((h) => (
                            <Styled.HabitRow key={h.id} $cols={totalDays}>
                                <Styled.HabitName>
                                    <div className="name">{h.name}</div>
                                    <div className="sub">{pct(h)}% this month</div>
                                    <div className="actions">
                                        {!h.archived ? (
                                            <Styled.Button onClick={() => archiveHabit(h.id, true)}>Archive</Styled.Button>
                                        ) : (
                                            <Styled.Button onClick={() => archiveHabit(h.id, false)}>Unarchive</Styled.Button>
                                        )}
                                        <Styled.DangerButton onClick={() => removeHabit(h.id)}>Delete</Styled.DangerButton>
                                    </div>
                                </Styled.HabitName>

                                {dayList.map((d) => {
                                    const key = ymd(y, m, d);
                                    const st = h.marks?.[key] || null; // null | 'done' | 'skip'
                                    return (
                                        <Styled.DayCell
                                            key={`${h.id}-${key}`}
                                            $state={st || undefined}
                                            onClick={() => toggleMark(h.id, d)}
                                            title={st ? `${st} (${key})` : `mark done (${key})`}
                                            aria-label={`Toggle ${h.name} on ${key}`}
                                        >
                                            {st === "done" ? "✓" : st === "skip" ? "—" : ""}
                                        </Styled.DayCell>
                                    );
                                })}
                            </Styled.HabitRow>
                        ))
                    )}
                </Styled.GridOuter>

                <Styled.FooterNote>
                    Tip: Click a cell to cycle <b>empty → done → skip → empty</b>. Data saves automatically in your browser.
                </Styled.FooterNote>
            </Styled.Container>
        </Styled.Page>
    );
}

import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

/* Local-date "YYYY-MM-DD" (avoid UTC shift). */
function getLocalISO(date = new Date()) {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
}

/* "Sep 20, 2025" style. */
function formatPretty(date = new Date()) {
    const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = new Date(date);
    return `${m[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/* Last N days ending today (oldest → newest). */
function lastNDays(n) {
    const out = [];
    const today = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        out.push(getLocalISO(d));
    }
    return out;
}

/* Current and best streak from a Set of YYYY-MM-DD strings. */
function computeStreaks(dateSet) {
    const today = new Date(getLocalISO());
    let current = 0;
    for (let i = 0; ; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const iso = getLocalISO(d);
        if (dateSet.has(iso)) current++;
        else break;
    }
    const dates = Array.from(dateSet).sort();
    let best = 0, run = 0, prev = null;
    for (const iso of dates) {
        if (!prev) run = 1;
        else {
            const p = new Date(prev);
            const c = new Date(iso);
            const diff = (c - p) / 86400000;
            run = diff === 1 ? run + 1 : 1;
        }
        best = Math.max(best, run);
        prev = iso;
    }
    return { current, best };
}

const STORAGE_KEY = "learning-streak-tracker:v1";

export default function LearningStreakTracker() {
    const [tracks, setTracks] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });
    const [newName, setNewName] = useState("");

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
    }, [tracks]);

    const gridDays = useMemo(() => lastNDays(56), []);
    const prettyToday = useMemo(() => formatPretty(new Date()), []);

    const addTrack = (e) => {
        e.preventDefault();
        const name = newName.trim();
        if (!name) return;
        setTracks((prev) => [
            ...prev,
            { id: crypto.randomUUID?.() || String(Date.now()), name, dates: [] },
        ]);
        setNewName("");
    };

    const removeTrack = (id, name) => {
        if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
        setTracks((prev) => prev.filter((t) => t.id !== id));
    };

    const renameTrack = (id, name) => {
        setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));
    };

    const toggleToday = (id) => {
        const todayISO = getLocalISO();
        setTracks((prev) =>
            prev.map((t) => {
                if (t.id !== id) return t;
                const set = new Set(t.dates);
                if (set.has(todayISO)) set.delete(todayISO);
                else set.add(todayISO);
                return { ...t, dates: Array.from(set).sort() };
            })
        );
    };

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div className="row">
                    <h2>Learning Streak Tracker</h2>
                    <span className="date">{prettyToday}</span>
                </div>
                <p className="muted">
                    Track daily learning for any topic (e.g., “JavaScript”, “DSA”). Mark today, watch your streak climb. Local only.
                </p>
            </Styled.Header>

            <Styled.Toolbar onSubmit={addTrack}>
                <input
                    type="text"
                    placeholder="Add a learning track (e.g., React)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    aria-label="New track name"
                />
                <Styled.Button type="submit" $tone="accent">Add</Styled.Button>
            </Styled.Toolbar>

            <Styled.TrackList>
                {tracks.map((t) => {
                    const dateSet = new Set(t.dates);
                    const { current, best } = computeStreaks(dateSet);
                    const todayDone = dateSet.has(getLocalISO());

                    return (
                        <Styled.Card key={t.id}>
                            <Styled.CardTop>
                                <input
                                    className="name"
                                    value={t.name}
                                    onChange={(e) => renameTrack(t.id, e.target.value)}
                                />
                                <Styled.Actions>
                                    <Styled.Button onClick={() => toggleToday(t.id)} $tone={todayDone ? "neutral" : "accent"}>
                                        {todayDone ? "Undo Today" : "Mark Today"}
                                    </Styled.Button>
                                    <Styled.IconButton onClick={() => removeTrack(t.id, t.name)} aria-label="Delete">
                                        ✕
                                    </Styled.IconButton>
                                </Styled.Actions>
                            </Styled.CardTop>

                            <Styled.Stats>
                                <Styled.Stat>
                                    <span className="label">Current</span>
                                    <span className="value">{current}</span>
                                </Styled.Stat>
                                <Styled.Stat>
                                    <span className="label">Best</span>
                                    <span className="value">{best}</span>
                                </Styled.Stat>
                                <Styled.Stat>
                                    <span className="label">Today</span>
                                    <span className="value">{todayDone ? "✅" : "—"}</span>
                                </Styled.Stat>
                            </Styled.Stats>

                            <Styled.Heatmap>
                                {gridDays.map((d) => (
                                    <Styled.Cell key={t.id + d} $on={dateSet.has(d)} title={d} />
                                ))}
                            </Styled.Heatmap>

                            <Styled.Legend>
                                <span className="dot on" />
                                <span>done</span>
                                <span className="dot off" />
                                <span>missed</span>
                                <span className="spacer" />
                                <span className="muted">Last 8 weeks</span>
                            </Styled.Legend>
                        </Styled.Card>
                    );
                })}

                {tracks.length === 0 && (
                    <Styled.Empty>
                        <p>No tracks yet.</p>
                        <p className="muted">Add one above and start your streak today.</p>
                    </Styled.Empty>
                )}
            </Styled.TrackList>
        </Styled.Wrapper>
    );
}

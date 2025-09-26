import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

/* -------------------------
   Storage & helpers
------------------------- */
const STORAGE_KEY = "goalSetter.v1";
const STATUSES = ["Planned", "In Progress", "Done"];

const uid = () =>
(crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`);

const todayISO = () => {
    const t = new Date();
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, "0");
    const dd = String(t.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const formatNice = (iso) =>
    iso
        ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        })
        : "";

/* -------------------------
   Main
------------------------- */
export default function PersonalGoalSetter() {
    const [goals, setGoals] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
        } catch {
            return [];
        }
    });

    // add form
    const thisYear = String(new Date().getFullYear());
    const [title, setTitle] = useState("");
    const [year, setYear] = useState(thisYear);
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("Planned");
    const [progress, setProgress] = useState(0); // 0..100
    const [due, setDue] = useState(""); // optional YYYY-MM-DD
    const [notes, setNotes] = useState("");

    // ui filters
    const [query, setQuery] = useState("");
    const [filterYear, setFilterYear] = useState(thisYear);
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterCat, setFilterCat] = useState("All");
    const [sortBy, setSortBy] = useState("created"); // created | title | progress | due | status | year
    const [editing, setEditing] = useState(null);

    // confirm modal
    const [confirm, setConfirm] = useState(null);
    const askConfirm = (opts) =>
        setConfirm({
            title: "Are you sure?",
            message: "",
            confirmText: "Confirm",
            cancelText: "Cancel",
            tone: "default",
            hideCancel: false,
            ...opts,
        });
    const handleConfirm = () => {
        const fn = confirm?.onConfirm;
        setConfirm(null);
        if (typeof fn === "function") fn();
    };
    useEffect(() => {
        if (!confirm) return;
        const onKey = (e) => {
            if (e.key === "Escape") setConfirm(null);
            if (e.key === "Enter") handleConfirm();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [confirm]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    }, [goals]);

    // derived
    const allYears = useMemo(() => {
        const set = new Set(goals.map((g) => g.year).filter(Boolean));
        set.add(thisYear);
        return Array.from(set).sort();
    }, [goals, thisYear]);

    const allCategories = useMemo(
        () =>
            Array.from(new Set(goals.map((g) => g.category).filter(Boolean))).sort(),
        [goals]
    );

    const counts = useMemo(() => {
        const total = goals.filter((g) => filterYear === "All" || g.year === filterYear).length;
        const done = goals.filter((g) => (filterYear === "All" || g.year === filterYear) && g.status === "Done").length;
        const active = total - done;
        return { total, done, active };
    }, [goals, filterYear]);

    const avgProgress = useMemo(() => {
        const scoped = goals.filter((g) => filterYear === "All" || g.year === filterYear);
        if (!scoped.length) return 0;
        const sum = scoped.reduce((acc, g) => acc + (Number(g.progress) || 0), 0);
        return Math.round((100 * sum) / (scoped.length * 100));
    }, [goals, filterYear]);

    const filtered = useMemo(() => {
        let list = goals;

        if (filterYear !== "All") list = list.filter((g) => g.year === filterYear);
        if (filterStatus !== "All") list = list.filter((g) => g.status === filterStatus);
        if (filterCat !== "All") list = list.filter((g) => g.category === filterCat);

        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(
                (g) =>
                    (g.title || "").toLowerCase().includes(q) ||
                    (g.category || "").toLowerCase().includes(q) ||
                    (g.notes || "").toLowerCase().includes(q)
            );
        }

        if (sortBy === "title") {
            list = [...list].sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === "progress") {
            list = [...list].sort(
                (a, b) => (Number(b.progress) || 0) - (Number(a.progress) || 0)
            );
        } else if (sortBy === "due") {
            list = [...list].sort(
                (a, b) => new Date(a.due || 8640000000000000) - new Date(b.due || 8640000000000000)
            );
        } else if (sortBy === "status") {
            const order = { Planned: 0, "In Progress": 1, Done: 2 };
            list = [...list].sort(
                (a, b) => order[a.status] - order[b.status] || a.title.localeCompare(b.title)
            );
        } else if (sortBy === "year") {
            list = [...list].sort(
                (a, b) => Number(a.year) - Number(b.year) || a.title.localeCompare(b.title)
            );
        } else {
            list = [...list].sort((a, b) => b.createdAt - a.createdAt);
        }

        return list;
    }, [goals, filterYear, filterStatus, filterCat, query, sortBy]);

    const resetFilters = () => {
        setFilterYear("All");
        setFilterStatus("All");
        setFilterCat("All");
        setQuery("");
        setSortBy("created");
    };

    // actions
    const addGoal = (e) => {
        e.preventDefault?.();
        const t = title.trim();
        if (!t) return;
        const p = Math.max(0, Math.min(100, Number(progress) || 0));
        const g = {
            id: uid(),
            title: t,
            year: (year || thisYear).trim(),
            category: category.trim(),
            status,
            progress: p,
            due: due.trim(),
            notes: notes.trim(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            completedAt: status === "Done" || p === 100 ? todayISO() : "",
        };
        setGoals((prev) => [g, ...prev]);

        // show newly added goal immediately
        setFilterYear(g.year);
        setFilterStatus("All");
        setFilterCat("All");
        setQuery("");

        // reset form
        setTitle("");
        setYear(thisYear);
        setCategory("");
        setStatus("Planned");
        setProgress(0);
        setDue("");
        setNotes("");
    };

    const startEdit = (id) => setEditing(id);
    const cancelEdit = () => setEditing(null);
    const saveEdit = (id, patch) => {
        setGoals((prev) =>
            prev.map((g) =>
                g.id === id
                    ? {
                        ...g,
                        ...patch,
                        progress: Math.max(0, Math.min(100, Number(patch.progress ?? g.progress) || 0)),
                        completedAt:
                            (patch.status ?? g.status) === "Done" || (Number(patch.progress ?? g.progress) || 0) === 100
                                ? g.completedAt || todayISO()
                                : "",
                        updatedAt: Date.now(),
                    }
                    : g
            )
        );
        setEditing(null);
    };

    const removeGoal = (id) => {
        setConfirm({
            title: "Delete goal?",
            message: "This will remove it from your list.",
            tone: "danger",
            confirmText: "Delete",
            onConfirm: () => setGoals((prev) => prev.filter((g) => g.id !== id)),
        });
    };

    const clearAll = () => {
        if (!goals.length) return;
        setConfirm({
            title: "Clear all goals?",
            message: "This will delete every goal from your list.",
            tone: "danger",
            confirmText: "Clear All",
            onConfirm: () => {
                setGoals([]);
                resetFilters();
            },
        });
    };

    const duplicateGoal = (id) => {
        const g = goals.find((x) => x.id === id);
        if (!g) return;
        const copy = {
            ...g,
            id: uid(),
            title: `${g.title} (copy)`,
            status: "Planned",
            progress: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            completedAt: "",
        };
        setGoals((prev) => [copy, ...prev]);
    };

    const quickStatus = (id, next) => {
        setGoals((prev) =>
            prev.map((g) =>
                g.id === id
                    ? {
                        ...g,
                        status: next,
                        progress: next === "Done" ? 100 : g.progress,
                        completedAt: next === "Done" ? todayISO() : "",
                        updatedAt: Date.now(),
                    }
                    : g
            )
        );
    };

    const nudgeProgress = (id, delta) => {
        setGoals((prev) =>
            prev.map((g) => {
                if (g.id !== id) return g;
                const next = Math.max(0, Math.min(100, (Number(g.progress) || 0) + delta));
                return {
                    ...g,
                    progress: next,
                    status: next >= 100 ? "Done" : g.status,
                    completedAt: next >= 100 ? todayISO() : g.completedAt,
                    updatedAt: Date.now(),
                };
            })
        );
    };

    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        <Styled.Title>Personal Goal Setter</Styled.Title>
                        <Styled.Sub>Set and track progress towards your yearly goals - LocalStorage.</Styled.Sub>
                    </div>
                    <Styled.BadgeRow>
                        <Styled.Tag>Total: {counts.total}</Styled.Tag>
                        <Styled.Tag>Active: {counts.active}</Styled.Tag>
                        <Styled.Tag>Done: {counts.done}</Styled.Tag>
                        <Styled.Tag>Avg: {avgProgress}%</Styled.Tag>
                    </Styled.BadgeRow>
                </Styled.Header>

                {/* Add form */}
                <Styled.Card as="form" onSubmit={addGoal}>
                    <Styled.FormRow>
                        <Styled.Label title="Enter a short title for the goal">
                            <Styled.LabelText>Title *</Styled.LabelText>
                            <Styled.Input
                                placeholder="e.g., Run a half-marathon"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                aria-label="Goal title"
                                required
                            />
                        </Styled.Label>

                        <Styled.Label title="Target year for this goal">
                            <Styled.LabelText>Year</Styled.LabelText>
                            <Styled.Input
                                placeholder="e.g., 2025"
                                inputMode="numeric"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                list="year-suggestions"
                                aria-label="Year"
                            />
                            <datalist id="year-suggestions">
                                {allYears.map((y) => (
                                    <option key={y} value={y} />
                                ))}
                            </datalist>
                        </Styled.Label>

                        <Styled.Label title="Category tag for grouping">
                            <Styled.LabelText>Category</Styled.LabelText>
                            <Styled.Input
                                placeholder="e.g., Health"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                list="cat-suggestions"
                                aria-label="Category"
                            />
                            <datalist id="cat-suggestions">
                                {allCategories.map((c) => (
                                    <option key={c} value={c} />
                                ))}
                            </datalist>
                        </Styled.Label>

                        <Styled.Label title="Optional due date">
                            <Styled.LabelText>Due Date</Styled.LabelText>
                            <Styled.Input
                                type="date"
                                value={due}
                                onChange={(e) => setDue(e.target.value)}
                                aria-label="Due date"
                            />
                        </Styled.Label>

                        <Styled.Label title="Current status of this goal">
                            <Styled.LabelText>Status</Styled.LabelText>
                            <Styled.Select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                aria-label="Status"
                            >
                                {STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </Styled.Select>
                        </Styled.Label>

                        <Styled.Label title="Progress percentage (0–100)">
                            <Styled.LabelText>Progress %</Styled.LabelText>
                            <Styled.Input
                                type="number"
                                inputMode="numeric"
                                placeholder="0–100"
                                value={progress}
                                onChange={(e) => setProgress(e.target.value)}
                                aria-label="Progress percent"
                            />
                        </Styled.Label>

                        <Styled.PrimaryButton type="submit" disabled={!title.trim()}>
                            Add
                        </Styled.PrimaryButton>
                    </Styled.FormRow>

                    <Styled.Label style={{ width: "100%", marginTop: 8 }} title="Optional notes for this goal">
                        <Styled.LabelText>Notes</Styled.LabelText>
                        <Styled.TextArea
                            placeholder="Any details, sub-steps, or references…"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            aria-label="Notes"
                        />
                    </Styled.Label>

                    {!title.trim() && <Styled.Helper>Tip: Title is required.</Styled.Helper>}
                </Styled.Card>

                {/* Filter bar */}
                <Styled.FilterBar>
                    <Styled.Select
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                        aria-label="Filter by year"
                        title="Filter by year"
                        style={{ flex: "0 1 180px" }}
                    >
                        {["All", ...allYears].map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </Styled.Select>
                    <Styled.Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        aria-label="Filter by status"
                        title="Filter by status"
                        style={{ flex: "0 1 180px" }}
                    >
                        {["All", ...STATUSES].map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </Styled.Select>
                    <Styled.Select
                        value={filterCat}
                        onChange={(e) => setFilterCat(e.target.value)}
                        aria-label="Filter by category"
                        title="Filter by category"
                        style={{ flex: "0 1 220px" }}
                    >
                        <option value="All">All categories</option>
                        {allCategories.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </Styled.Select>
                    <Styled.Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        aria-label="Sort"
                        title="Sort"
                        style={{ flex: "0 1 220px" }}
                    >
                        <option value="created">Newest</option>
                        <option value="title">Title A–Z</option>
                        <option value="progress">Progress (high → low)</option>
                        <option value="due">Due date (early → late)</option>
                        <option value="status">By status</option>
                        <option value="year">By year</option>
                    </Styled.Select>
                    <Styled.Input
                        placeholder="Search title/category/notes…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search"
                        style={{ flex: "2 1 320px" }}
                        title="Keyword search"
                    />
                    <Styled.Button type="button" onClick={resetFilters} title="Reset filters to default">
                        Reset
                    </Styled.Button>
                </Styled.FilterBar>

                {/* List heading + Clear All */}
                <Styled.SectionBar>
                    <Styled.SectionTitle>List of Goals</Styled.SectionTitle>
                    <Styled.DangerButton type="button" onClick={clearAll} title="Delete all goals">
                        Clear All
                    </Styled.DangerButton>
                </Styled.SectionBar>

                {/* List */}
                <Styled.List>
                    {filtered.length === 0 && goals.length === 0 && (
                        <Styled.Empty>No goals yet. Add your first!</Styled.Empty>
                    )}
                    {filtered.length === 0 && goals.length > 0 && (
                        <Styled.Empty>
                            No goals match your current filters. Try <b>Reset</b>.
                        </Styled.Empty>
                    )}

                    {filtered.map((g) => {
                        if (editing === g.id) {
                            return (
                                <EditRow key={g.id} goal={g} onCancel={cancelEdit} onSave={saveEdit} />
                            );
                        }

                        return (
                            <Styled.Item key={g.id}>
                                <Styled.ItemLeft>
                                    <div>
                                        <Styled.ItemTitle>{g.title}</Styled.ItemTitle>
                                        <Styled.ItemMeta>
                                            <Styled.Tag>#{g.year}</Styled.Tag>
                                            <span>•</span>
                                            {g.category ? (
                                                <Styled.Tag>#{g.category}</Styled.Tag>
                                            ) : (
                                                <Styled.Tag $tone="muted">No category</Styled.Tag>
                                            )}
                                            <span>•</span>
                                            <Styled.Tag>#{g.status}</Styled.Tag>
                                            {g.due ? (
                                                <>
                                                    <span>•</span>
                                                    <Styled.DueHint>Due {formatNice(g.due)}</Styled.DueHint>
                                                </>
                                            ) : null}
                                            {g.completedAt && (
                                                <>
                                                    <span>•</span>
                                                    <Styled.DueHint>Done {formatNice(g.completedAt)}</Styled.DueHint>
                                                </>
                                            )}
                                        </Styled.ItemMeta>

                                        <Styled.ProgressWrap>
                                            <Styled.ProgressTrack aria-hidden="true">
                                                <Styled.ProgressFill $pct={g.progress} />
                                            </Styled.ProgressTrack>
                                            <Styled.ProgressText>Progress: {g.progress}%</Styled.ProgressText>
                                        </Styled.ProgressWrap>
                                    </div>
                                </Styled.ItemLeft>

                                <Styled.ItemRight>
                                    <Styled.Button onClick={() => nudgeProgress(g.id, -10)} title="-10%">
                                        −10%
                                    </Styled.Button>
                                    <Styled.Button onClick={() => nudgeProgress(g.id, +10)} title="+10%">
                                        +10%
                                    </Styled.Button>

                                    {g.status !== "Done" ? (
                                        <Styled.Button
                                            onClick={() => quickStatus(g.id, "Done")}
                                            title="Mark as Done"
                                        >
                                            ✅ Done
                                        </Styled.Button>
                                    ) : (
                                        <Styled.Button
                                            onClick={() => quickStatus(g.id, "In Progress")}
                                            title="Mark In Progress"
                                        >
                                            🔁 In Progress
                                        </Styled.Button>
                                    )}

                                    <Styled.IconButton title="Duplicate" onClick={() => duplicateGoal(g.id)}>
                                        📄
                                    </Styled.IconButton>
                                    <Styled.IconButton title="Edit" onClick={() => startEdit(g.id)}>
                                        ✏️
                                    </Styled.IconButton>
                                    <Styled.IconButton title="Delete" onClick={() => removeGoal(g.id)}>
                                        🗑️
                                    </Styled.IconButton>
                                </Styled.ItemRight>
                            </Styled.Item>
                        );
                    })}
                </Styled.List>

                <Styled.FooterNote>
                    Data stays in your browser (LocalStorage). Refresh-safe.
                </Styled.FooterNote>

                {/* Confirm Modal */}
                {confirm && (
                    <Styled.ModalOverlay onClick={() => setConfirm(null)}>
                        <Styled.ModalCard
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="confirm-title"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Styled.ModalTitle id="confirm-title">
                                {confirm.title}
                            </Styled.ModalTitle>
                            {confirm.message ? (
                                <Styled.ModalMessage>{confirm.message}</Styled.ModalMessage>
                            ) : null}
                            <Styled.ModalActions>
                                {!confirm.hideCancel && (
                                    <Styled.Button type="button" onClick={() => setConfirm(null)}>
                                        {confirm.cancelText || "Cancel"}
                                    </Styled.Button>
                                )}
                                {confirm.tone === "danger" ? (
                                    <Styled.DangerButton type="button" onClick={handleConfirm} autoFocus>
                                        {confirm.confirmText || "Confirm"}
                                    </Styled.DangerButton>
                                ) : (
                                    <Styled.PrimaryButton type="button" onClick={handleConfirm} autoFocus>
                                        {confirm.confirmText || "Confirm"}
                                    </Styled.PrimaryButton>
                                )}
                            </Styled.ModalActions>
                        </Styled.ModalCard>
                    </Styled.ModalOverlay>
                )}
            </Styled.Container>
        </Styled.Page>
    );
}

/* -------------------------
   Edit Row
------------------------- */
function EditRow({ goal, onCancel, onSave }) {
    const [t, setT] = useState(goal.title);
    const [y, setY] = useState(goal.year);
    const [c, setC] = useState(goal.category || "");
    const [s, setS] = useState(goal.status);
    const [p, setP] = useState(goal.progress || 0);
    const [d, setD] = useState(goal.due || "");
    const [n, setN] = useState(goal.notes || "");

    const clamp = (v) => Math.max(0, Math.min(100, Number(v) || 0));

    return (
        <Styled.Item
            as="form"
            $edit
            onSubmit={(e) => {
                e.preventDefault();
                if (!t.trim()) return;
                onSave(goal.id, {
                    title: t.trim(),
                    year: String(y).trim(),
                    category: c.trim(),
                    status: s,
                    progress: clamp(p),
                    due: d,
                    notes: n.trim(),
                });
            }}
        >
            <Styled.ItemLeft style={{ flexDirection: "column", gap: 12 }}>
                <Styled.FormRow>
                    <Styled.Label title="Edit goal title">
                        <Styled.LabelText>Title *</Styled.LabelText>
                        <Styled.Input
                            value={t}
                            onChange={(e) => setT(e.target.value)}
                            placeholder="Title"
                            required
                            aria-label="Title"
                        />
                    </Styled.Label>

                    <Styled.Label title="Edit year">
                        <Styled.LabelText>Year</Styled.LabelText>
                        <Styled.Input
                            value={y}
                            onChange={(e) => setY(e.target.value)}
                            placeholder="Year"
                            inputMode="numeric"
                            aria-label="Year"
                        />
                    </Styled.Label>

                    <Styled.Label title="Edit category">
                        <Styled.LabelText>Category</Styled.LabelText>
                        <Styled.Input
                            value={c}
                            onChange={(e) => setC(e.target.value)}
                            placeholder="Category"
                            aria-label="Category"
                        />
                    </Styled.Label>

                    <Styled.Label title="Edit due date">
                        <Styled.LabelText>Due Date</Styled.LabelText>
                        <Styled.Input
                            type="date"
                            value={d}
                            onChange={(e) => setD(e.target.value)}
                            aria-label="Due date"
                        />
                    </Styled.Label>

                    <Styled.Label title="Edit status">
                        <Styled.LabelText>Status</Styled.LabelText>
                        <Styled.Select
                            value={s}
                            onChange={(e) => setS(e.target.value)}
                            aria-label="Status"
                        >
                            {STATUSES.map((st) => (
                                <option key={st} value={st}>
                                    {st}
                                </option>
                            ))}
                        </Styled.Select>
                    </Styled.Label>

                    <Styled.Label title="Edit progress percent">
                        <Styled.LabelText>Progress %</Styled.LabelText>
                        <Styled.Input
                            type="number"
                            inputMode="numeric"
                            value={p}
                            onChange={(e) => setP(e.target.value)}
                            placeholder="0–100"
                            aria-label="Progress percent"
                        />
                    </Styled.Label>
                </Styled.FormRow>

                <Styled.Label style={{ width: "100%" }} title="Edit notes">
                    <Styled.LabelText>Notes</Styled.LabelText>
                    <Styled.TextArea
                        placeholder="Notes"
                        value={n}
                        onChange={(e) => setN(e.target.value)}
                        aria-label="Notes"
                    />
                </Styled.Label>

                {/* Buttons */}
                <Styled.ButtonRow>
                    <Styled.PrimaryButton type="submit">Save</Styled.PrimaryButton>
                    <Styled.Button type="button" onClick={onCancel}>
                        Cancel
                    </Styled.Button>
                </Styled.ButtonRow>
            </Styled.ItemLeft>
        </Styled.Item>
    );
}

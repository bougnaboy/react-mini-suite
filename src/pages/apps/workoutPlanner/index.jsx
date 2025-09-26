import { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

/* -------------------------
   Storage & helpers
------------------------- */
const STORAGE_KEY = "workout-planner.v1";
const STATUSES = ["Planned", "Done"];

const uid = () =>
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

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
   App
------------------------- */
export default function WorkoutPlanner() {
    const [workouts, setWorkouts] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
        } catch {
            return [];
        }
    });

    // add form
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(todayISO());
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("Planned");
    const [duration, setDuration] = useState(""); // minutes

    // ui
    const [query, setQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterCat, setFilterCat] = useState("All");
    const [sortBy, setSortBy] = useState("created"); // created | date | title | duration | status
    const [editing, setEditing] = useState(null);

    // confirm modal
    const [confirm, setConfirm] = useState(null); // {title, message, confirmText, cancelText, tone, hideCancel, onConfirm}
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
    }, [workouts]);

    // derived
    const allCategories = useMemo(
        () =>
            Array.from(new Set(workouts.map((w) => w.category).filter(Boolean))).sort(),
        [workouts]
    );

    const counts = useMemo(
        () => ({
            planned: workouts.filter((w) => w.status === "Planned").length,
            done: workouts.filter((w) => w.status === "Done").length,
            total: workouts.length,
        }),
        [workouts]
    );

    const filtered = useMemo(() => {
        let list = workouts;

        if (filterStatus !== "All") list = list.filter((w) => w.status === filterStatus);
        if (filterCat !== "All") list = list.filter((w) => w.category === filterCat);

        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(
                (w) =>
                    w.title.toLowerCase().includes(q) ||
                    (w.category || "").toLowerCase().includes(q) ||
                    (w.exercises || []).some((ex) =>
                        (ex.name || "").toLowerCase().includes(q)
                    )
            );
        }

        if (sortBy === "title") {
            list = [...list].sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === "date") {
            list = [...list].sort(
                (a, b) => new Date(a.date || 0) - new Date(b.date || 0)
            );
        } else if (sortBy === "duration") {
            list = [...list].sort(
                (a, b) => (Number(b.duration) || 0) - (Number(a.duration) || 0)
            );
        } else if (sortBy === "status") {
            const order = { Planned: 0, Done: 1 };
            list = [...list].sort(
                (a, b) => order[a.status] - order[b.status] || a.title.localeCompare(b.title)
            );
        } else {
            list = [...list].sort((a, b) => b.createdAt - a.createdAt);
        }

        return list;
    }, [workouts, filterStatus, filterCat, query, sortBy]);

    // actions
    const addWorkout = (e) => {
        e.preventDefault();
        const t = title.trim();
        if (!t) return;
        const w = {
            id: uid(),
            title: t,
            date: date || todayISO(),
            category: category.trim(),
            status,
            duration: duration.trim(), // minutes
            notes: "",
            exercises: [], // [{id, name, sets, reps, weight, time}]
            createdAt: Date.now(),
            updatedAt: Date.now(),
            completedAt: status === "Done" ? todayISO() : "",
        };
        setWorkouts((prev) => [w, ...prev]);
        setTitle("");
        setDate(todayISO());
        setCategory("");
        setStatus("Planned");
        setDuration("");
        setConfirm({
            title: "Saved",
            message: `Added “${t}”.`,
            confirmText: "OK",
            hideCancel: true,
        });
    };

    const startEdit = (id) => setEditing(id);
    const cancelEdit = () => setEditing(null);
    const saveEdit = (id, patch) => {
        setWorkouts((prev) =>
            prev.map((w) =>
                w.id === id ? { ...w, ...patch, updatedAt: Date.now() } : w
            )
        );
        setEditing(null);
        setConfirm({
            title: "Saved",
            message: "Workout updated.",
            confirmText: "OK",
            hideCancel: true,
        });
    };
    const removeWorkout = (id) => {
        askConfirm({
            title: "Delete workout?",
            message: "This will remove it from your planner.",
            confirmText: "Delete",
            tone: "danger",
            onConfirm: () => setWorkouts((prev) => prev.filter((w) => w.id !== id)),
        });
    };
    const duplicateWorkout = (id) => {
        const w = workouts.find((x) => x.id === id);
        if (!w) return;
        const copy = {
            ...w,
            id: uid(),
            title: `${w.title} (copy)`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            completedAt: "",
            status: "Planned",
        };
        setWorkouts((prev) => [copy, ...prev]);
    };
    const quickStatus = (id, next) => {
        setWorkouts((prev) =>
            prev.map((w) =>
                w.id === id
                    ? {
                        ...w,
                        status: next,
                        completedAt: next === "Done" ? todayISO() : "",
                        updatedAt: Date.now(),
                    }
                    : w
            )
        );
    };

    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        <Styled.Title>Workout Planner</Styled.Title>
                        <Styled.Sub>Create and track your daily workout routines — LocalStorage.</Styled.Sub>
                    </div>
                    <Styled.BadgeRow>
                        <Styled.Tag>Total: {counts.total}</Styled.Tag>
                        <Styled.Tag>Planned: {counts.planned}</Styled.Tag>
                        <Styled.Tag>Done: {counts.done}</Styled.Tag>
                    </Styled.BadgeRow>
                </Styled.Header>

                {/* Add form */}
                <Styled.Card as="form" onSubmit={addWorkout}>
                    <Styled.FormRow>
                        <Styled.Input
                            placeholder="Workout title *"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            style={{ flex: "2 1 320px" }}
                        />
                        <Styled.Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            aria-label="Date"
                            style={{ flex: "0 1 170px" }}
                        />
                        <Styled.Input
                            placeholder="Category (e.g., Strength)"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            list="cat-suggestions"
                            style={{ flex: "1 1 220px" }}
                        />
                        <datalist id="cat-suggestions">
                            {allCategories.map((c) => (
                                <option key={c} value={c} />
                            ))}
                        </datalist>
                        <Styled.Input
                            placeholder="Duration (min)"
                            inputMode="numeric"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            style={{ flex: "0 1 140px" }}
                        />
                        <Styled.Select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            aria-label="Status"
                            style={{ flex: "0 1 160px" }}
                        >
                            {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </Styled.Select>
                        <Styled.PrimaryButton type="submit" disabled={!title.trim()}>
                            Add
                        </Styled.PrimaryButton>
                    </Styled.FormRow>
                    {!title.trim() && <Styled.Helper>Tip: Title is required.</Styled.Helper>}
                </Styled.Card>

                {/* Filter bar: single row (wraps on small screens) */}
                <Styled.FilterBar>
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
                        <option value="date">Date (old → new)</option>
                        <option value="title">Title A–Z</option>
                        <option value="duration">Duration (high → low)</option>
                        <option value="status">By status</option>
                    </Styled.Select>
                    <Styled.Input
                        placeholder="Search title/category/exercise…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search"
                        style={{ flex: "2 1 320px" }}
                    />
                </Styled.FilterBar>

                {/* List */}
                <Styled.List>
                    {filtered.length === 0 && (
                        <Styled.Empty>No workouts yet. Add your first!</Styled.Empty>
                    )}

                    {filtered.map((w) => {
                        if (editing === w.id) {
                            return (
                                <EditRow
                                    key={w.id}
                                    workout={w}
                                    onCancel={cancelEdit}
                                    onSave={saveEdit}
                                />
                            );
                        }

                        return (
                            <Styled.Item key={w.id}>
                                <Styled.ItemLeft>
                                    <div>
                                        <Styled.ItemTitle>{w.title}</Styled.ItemTitle>
                                        <Styled.ItemMeta>
                                            {w.date ? (
                                                <>
                                                    <Styled.Tag>{formatNice(w.date)}</Styled.Tag>
                                                    <span>•</span>
                                                </>
                                            ) : null}
                                            {w.category ? (
                                                <Styled.Tag>#{w.category}</Styled.Tag>
                                            ) : (
                                                <Styled.Tag tone="muted">No category</Styled.Tag>
                                            )}
                                            <span>•</span>
                                            <Styled.Tag>#{w.status}</Styled.Tag>
                                            {w.duration ? (
                                                <>
                                                    <span>•</span>
                                                    <Styled.Tag>{w.duration} min</Styled.Tag>
                                                </>
                                            ) : null}
                                            {w.exercises?.length ? (
                                                <>
                                                    <span>•</span>
                                                    <Styled.Tag>{w.exercises.length} exercises</Styled.Tag>
                                                </>
                                            ) : null}
                                            {w.completedAt && (
                                                <>
                                                    <span>•</span>
                                                    <Styled.DueHint>Done {formatNice(w.completedAt)}</Styled.DueHint>
                                                </>
                                            )}
                                        </Styled.ItemMeta>
                                    </div>
                                </Styled.ItemLeft>

                                <Styled.ItemRight>
                                    {w.status !== "Done" ? (
                                        <Styled.Button
                                            onClick={() => quickStatus(w.id, "Done")}
                                            title="Mark as Done"
                                        >
                                            ✅ Done
                                        </Styled.Button>
                                    ) : (
                                        <Styled.Button
                                            onClick={() => quickStatus(w.id, "Planned")}
                                            title="Mark as Planned"
                                        >
                                            🔁 Planned
                                        </Styled.Button>
                                    )}
                                    <Styled.IconButton title="Duplicate" onClick={() => duplicateWorkout(w.id)}>
                                        📄
                                    </Styled.IconButton>
                                    <Styled.IconButton title="Edit" onClick={() => startEdit(w.id)}>
                                        ✏️
                                    </Styled.IconButton>
                                    <Styled.IconButton title="Delete" onClick={() => removeWorkout(w.id)}>
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
function EditRow({ workout, onCancel, onSave }) {
    const [t, setT] = useState(workout.title);
    const [d, setD] = useState(workout.date || todayISO());
    const [c, setC] = useState(workout.category || "");
    const [s, setS] = useState(workout.status);
    const [dur, setDur] = useState(workout.duration || "");
    const [notes, setNotes] = useState(workout.notes || "");

    const [exs, setExs] = useState(workout.exercises?.length ? workout.exercises : []);

    // temp inputs for adding one exercise
    const [exName, setExName] = useState("");
    const [exSets, setExSets] = useState("");
    const [exReps, setExReps] = useState("");
    const [exWeight, setExWeight] = useState("");
    const [exTime, setExTime] = useState("");

    const addExercise = (e) => {
        e?.preventDefault?.();
        const name = exName.trim();
        if (!name) return;
        setExs((prev) => [
            ...prev,
            { id: uid(), name, sets: exSets.trim(), reps: exReps.trim(), weight: exWeight.trim(), time: exTime.trim() },
        ]);
        setExName(""); setExSets(""); setExReps(""); setExWeight(""); setExTime("");
    };
    const removeExercise = (id) => setExs((prev) => prev.filter((x) => x.id !== id));

    return (
        <Styled.Item as="form" $edit
            onSubmit={(e) => {
                e.preventDefault();
                if (!t.trim()) return;
                onSave(workout.id, {
                    title: t.trim(),
                    date: d,
                    category: c.trim(),
                    status: s,
                    duration: dur.trim(),
                    notes,
                    exercises: exs,
                    completedAt: s === "Done" && !workout.completedAt ? todayISO() : workout.completedAt,
                });
            }}
        >
            <Styled.ItemLeft style={{ flexDirection: "column", gap: 12 }}>
                <Styled.FormRow>
                    <Styled.Input
                        value={t}
                        onChange={(e) => setT(e.target.value)}
                        placeholder="Title *"
                        required
                        style={{ flex: "2 1 320px" }}
                    />
                    <Styled.Input
                        type="date"
                        value={d}
                        onChange={(e) => setD(e.target.value)}
                        style={{ flex: "0 1 170px" }}
                    />
                    <Styled.Input
                        value={c}
                        onChange={(e) => setC(e.target.value)}
                        placeholder="Category"
                        style={{ flex: "1 1 220px" }}
                    />
                    <Styled.Input
                        value={dur}
                        onChange={(e) => setDur(e.target.value)}
                        placeholder="Duration (min)"
                        inputMode="numeric"
                        style={{ flex: "0 1 140px" }}
                    />
                    <Styled.Select
                        value={s}
                        onChange={(e) => setS(e.target.value)}
                        style={{ flex: "0 1 160px" }}
                    >
                        {STATUSES.map((st) => (
                            <option key={st} value={st}>
                                {st}
                            </option>
                        ))}
                    </Styled.Select>
                </Styled.FormRow>

                <Styled.Fieldset>
                    <Styled.Legend>Exercises</Styled.Legend>
                    <Styled.RowWrap>
                        <Styled.Input
                            style={{ flex: "2 1 240px" }}
                            placeholder="Exercise name (e.g., Squats)"
                            value={exName}
                            onChange={(e) => setExName(e.target.value)}
                        />
                        <Styled.Input
                            placeholder="Sets"
                            inputMode="numeric"
                            value={exSets}
                            onChange={(e) => setExSets(e.target.value)}
                            style={{ flex: "0 1 90px" }}
                        />
                        <Styled.Input
                            placeholder="Reps"
                            inputMode="numeric"
                            value={exReps}
                            onChange={(e) => setExReps(e.target.value)}
                            style={{ flex: "0 1 90px" }}
                        />
                        <Styled.Input
                            placeholder="Weight (kg)"
                            inputMode="numeric"
                            value={exWeight}
                            onChange={(e) => setExWeight(e.target.value)}
                            style={{ flex: "0 1 120px" }}
                        />
                        <Styled.Input
                            placeholder="Time (min)"
                            inputMode="numeric"
                            value={exTime}
                            onChange={(e) => setExTime(e.target.value)}
                            style={{ flex: "0 1 110px" }}
                        />
                        <Styled.PrimaryButton type="button" onClick={addExercise}>
                            Add
                        </Styled.PrimaryButton>
                    </Styled.RowWrap>

                    {exs.length === 0 && <Styled.Helper>No exercises yet.</Styled.Helper>}
                    {exs.length > 0 && (
                        <Styled.Bullets as="ul">
                            {exs.map((x) => (
                                <li key={x.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ flex: 1 }}>
                                        <strong>{x.name}</strong>
                                        {x.sets || x.reps ? ` — ${x.sets || "?"}×${x.reps || "?"}` : ""}
                                        {x.weight ? ` @ ${x.weight}kg` : ""}
                                        {x.time ? ` • ${x.time}min` : ""}
                                    </span>
                                    <Styled.IconButton title="Remove" onClick={() => removeExercise(x.id)}>
                                        ✕
                                    </Styled.IconButton>
                                </li>
                            ))}
                        </Styled.Bullets>
                    )}
                </Styled.Fieldset>

                <Styled.TextArea
                    placeholder="Notes (optional)…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />

                {/* Buttons BELOW all inputs */}
                <Styled.ButtonRow>
                    <Styled.PrimaryButton type="submit">Save</Styled.PrimaryButton>
                    <Styled.Button type="button" onClick={onCancel}>Cancel</Styled.Button>
                </Styled.ButtonRow>
            </Styled.ItemLeft>
        </Styled.Item>
    );
}

import React, { useEffect, useMemo, useState } from "react";
import Styled from "./styled";

/* storage key */
const LS_KEY = "taskScheduler_tasks_v1";

/* utils */
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
const todayISO = () => new Date().toISOString().slice(0, 10);
const isPast = (iso) => {
    if (!iso) return false;
    const d = new Date(iso + "T00:00:00");
    const t = new Date(todayISO() + "T00:00:00");
    return d < t;
};
const priorityOrder = { high: 3, medium: 2, low: 1 };

const TaskScheduler = () => {
    /* ---------- state ---------- */
    const [tasks, setTasks] = useState(() => {
        try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
    });

    const [form, setForm] = useState({
        title: "",
        description: "",
        due: "",
        priority: "medium",
    });
    const [errors, setErrors] = useState({});
    const [editingId, setEditingId] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("open"); // open|done|all
    const [sortBy, setSortBy] = useState("priority"); // priority|dueAsc|dueDesc|created

    const [confirm, setConfirm] = useState({ open: false, type: "", payload: null, title: "", body: "" });

    /* ---------- persist ---------- */
    useEffect(() => {
        try { localStorage.setItem(LS_KEY, JSON.stringify(tasks)); } catch { }
    }, [tasks]);

    /* ---------- validation ---------- */
    const validate = (next = form) => {
        const e = {};
        if (!next.title.trim()) e.title = "Title is required.";
        if (next.title.length > 100) e.title = "Max 100 characters.";
        if (next.description.length > 500) e.description = "Max 500 characters.";
        if (next.due && isPast(next.due)) e.due = "Due date cannot be in the past.";
        if (!["low", "medium", "high"].includes(next.priority)) e.priority = "Select a priority.";
        return e;
    };

    const onField = (name, value) => {
        const next = { ...form, [name]: value };
        setForm(next);
        setErrors(validate(next)); // live
    };

    /* ---------- submit ---------- */
    const onSubmit = (e) => {
        e.preventDefault();
        const v = validate(form);
        setErrors(v);
        if (Object.keys(v).length) return;

        if (editingId) {
            setTasks((prev) =>
                prev.map((t) => (t.id === editingId ? { ...t, ...form, updatedAt: Date.now() } : t))
            );
        } else {
            setTasks((prev) => [
                {
                    id: uid(),
                    ...form,
                    done: false,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
                ...prev,
            ]);
        }
        resetForm();
    };

    const resetForm = () => {
        setForm({ title: "", description: "", due: "", priority: "medium" });
        setErrors({});
        setEditingId(null);
    };

    /* ---------- actions ---------- */
    const toggleDone = (id) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done, updatedAt: Date.now() } : t)));

    const askDelete = (id) =>
        setConfirm({ open: true, type: "delete-one", payload: id, title: "Delete task?", body: "This cannot be undone." });

    const askClearAll = () =>
        setConfirm({ open: true, type: "clear-all", title: "Clear all tasks?", body: "All tasks will be removed from this browser." });

    const doConfirm = () => {
        if (confirm.type === "delete-one") {
            const id = confirm.payload;
            setTasks((prev) => prev.filter((t) => t.id !== id));
            if (editingId === id) resetForm();
        } else if (confirm.type === "clear-all") {
            setTasks([]);
            resetForm();
        }
        setConfirm({ open: false, type: "", payload: null, title: "", body: "" });
    };

    const onEdit = (task) => {
        setEditingId(task.id);
        setForm({ title: task.title, description: task.description || "", due: task.due || "", priority: task.priority });
        setErrors(validate({ title: task.title, description: task.description || "", due: task.due || "", priority: task.priority }));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    /* ---------- derived list ---------- */
    const filteredSorted = useMemo(() => {
        let list = tasks;

        // search
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter((t) => (t.title + " " + (t.description || "")).toLowerCase().includes(q));
        }
        // status
        if (statusFilter !== "all") {
            const needDone = statusFilter === "done";
            list = list.filter((t) => t.done === needDone);
        }
        // sort
        const by = [...list];
        if (sortBy === "priority") {
            by.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority] || (a.due || "").localeCompare(b.due || ""));
        } else if (sortBy === "dueAsc") {
            by.sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"));
        } else if (sortBy === "dueDesc") {
            by.sort((a, b) => (b.due || "").localeCompare(a.due || ""));
        } else if (sortBy === "created") {
            by.sort((a, b) => b.createdAt - a.createdAt);
        }
        return by;
    }, [tasks, search, statusFilter, sortBy]);

    const buckets = useMemo(() => {
        const x = { high: [], medium: [], low: [] };
        for (const t of filteredSorted) x[t.priority].push(t);
        return x;
    }, [filteredSorted]);

    const stats = useMemo(() => {
        const total = tasks.length;
        const done = tasks.filter((t) => t.done).length;
        return { total, done, open: total - done };
    }, [tasks]);

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div>
                    <h1>Task Scheduler</h1>
                    <p>Add tasks and manage by <strong>priority</strong>. Save, search, filter, sort—stay sane.</p>
                </div>
                <Styled.Badges>
                    <span className="badge">Validation</span>
                    <span className="badge">LocalStorage</span>
                    <span className="badge">Modals</span>
                </Styled.Badges>
            </Styled.Header>

            <Styled.Layout>
                {/* LEFT: form + filters */}
                <div className="left">
                    <Styled.Card>
                        <form onSubmit={onSubmit} noValidate>
                            <Styled.SectionTitle>{editingId ? "Edit Task" : "New Task"}</Styled.SectionTitle>

                            <Styled.Grid>
                                <Styled.Field invalid={!!errors.title}>
                                    <label htmlFor="title">Title <em>*</em></label>
                                    <input
                                        id="title" type="text" placeholder="e.g., Call client, write report"
                                        value={form.title} onChange={(e) => onField("title", e.target.value)}
                                    />
                                    <Styled.Error>{errors.title || "\u00A0"}</Styled.Error>
                                </Styled.Field>

                                <Styled.Field invalid={!!errors.priority}>
                                    <label htmlFor="priority">Priority <em>*</em></label>
                                    <select id="priority" value={form.priority} onChange={(e) => onField("priority", e.target.value)}>
                                        <option value="high">High</option>
                                        <option value="medium">Middle</option>
                                        <option value="low">Low</option>
                                    </select>
                                    <Styled.Error>{errors.priority || "\u00A0"}</Styled.Error>
                                </Styled.Field>

                                <Styled.Field invalid={!!errors.due}>
                                    <label htmlFor="due">Due date</label>
                                    <input id="due" type="date" value={form.due} onChange={(e) => onField("due", e.target.value)} />
                                    <Styled.Error>{errors.due || "\u00A0"}</Styled.Error>
                                </Styled.Field>

                                <Styled.Field className="span-2" invalid={!!errors.description}>
                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        id="description" rows={3} placeholder="Optional notes…"
                                        value={form.description} onChange={(e) => onField("description", e.target.value)}
                                    />
                                    <Styled.Error>{errors.description || "\u00A0"}</Styled.Error>
                                </Styled.Field>
                            </Styled.Grid>

                            <Styled.Actions>
                                <button type="submit" className="primary">{editingId ? "Update Task" : "Add Task"}</button>
                                {editingId && <button type="button" className="ghost" onClick={resetForm}>Cancel Edit</button>}
                                <div className="spacer" />
                                <button type="button" className="ghost danger" onClick={askClearAll} disabled={!tasks.length}>Clear All</button>
                            </Styled.Actions>
                        </form>
                    </Styled.Card>

                    <Styled.Card>
                        <Styled.SectionTitle>Filters</Styled.SectionTitle>
                        <Styled.FilterBar>
                            <input
                                type="text" placeholder="Search…"
                                value={search} onChange={(e) => setSearch(e.target.value)}
                            />
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="open">Open</option>
                                <option value="done">Done</option>
                                <option value="all">All</option>
                            </select>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="priority">Sort: Priority</option>
                                <option value="dueAsc">Sort: Due (Asc)</option>
                                <option value="dueDesc">Sort: Due (Desc)</option>
                                <option value="created">Sort: Created</option>
                            </select>

                            <div className="stats">
                                <span>Total: {stats.total}</span>
                                <span>Open: {stats.open}</span>
                                <span>Done: {stats.done}</span>
                            </div>
                        </Styled.FilterBar>
                    </Styled.Card>
                </div>

                {/* RIGHT: board */}
                <div className="right">
                    <Styled.Board>
                        {["high", "medium", "low"].map((p) => (
                            <Styled.Column key={p}>
                                <div className={`col-head ${p}`}>
                                    <strong>{p === "high" ? "High" : p === "medium" ? "Middle" : "Low"}</strong>
                                    <span>{buckets[p].length}</span>
                                </div>
                                <div className="col-body">
                                    {buckets[p].length === 0 ? (
                                        <Styled.Empty>Nothing here.</Styled.Empty>
                                    ) : (
                                        buckets[p].map((t) => (
                                            <Styled.TaskCard key={t.id} data-done={t.done ? "1" : "0"}>
                                                <div className="row-1">
                                                    <label className="check">
                                                        <input type="checkbox" checked={!!t.done} onChange={() => toggleDone(t.id)} />
                                                        <span />
                                                    </label>
                                                    <div className="title" title={t.title}>{t.title}</div>
                                                </div>

                                                {t.description && <div className="desc">{t.description}</div>}

                                                <div className="row-2">
                                                    <div className="meta">
                                                        {t.due ? <span className={`due ${isPast(t.due) && !t.done ? "overdue" : ""}`}>Due {t.due}</span> : <span className="due none">No due</span>}
                                                        <span className={`prio ${t.priority}`}>{t.priority}</span>
                                                    </div>
                                                    <div className="actions">
                                                        <button onClick={() => onEdit(t)}>Edit</button>
                                                        <button className="danger" onClick={() => askDelete(t.id)}>Delete</button>
                                                    </div>
                                                </div>
                                            </Styled.TaskCard>
                                        ))
                                    )}
                                </div>
                            </Styled.Column>
                        ))}
                    </Styled.Board>
                </div>
            </Styled.Layout>

            {/* modal */}
            {confirm.open && (
                <Styled.ModalOverlay onClick={() => setConfirm({ open: false, type: "", payload: null, title: "", body: "" })}>
                    <Styled.Modal onClick={(e) => e.stopPropagation()}>
                        <h3>{confirm.title}</h3>
                        <p>{confirm.body}</p>
                        <div className="actions">
                            <button className="ghost" onClick={() => setConfirm({ open: false, type: "", payload: null, title: "", body: "" })}>Cancel</button>
                            <button className="danger" onClick={doConfirm}>{confirm.type === "clear-all" ? "Delete All" : "Delete"}</button>
                        </div>
                    </Styled.Modal>
                </Styled.ModalOverlay>
            )}
        </Styled.Wrapper>
    );
};

export default TaskScheduler;

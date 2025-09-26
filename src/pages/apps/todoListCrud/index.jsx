import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

const STORAGE_KEY = "todo-list.v1";

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

const todayISO = () => {
    const t = new Date();
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, "0");
    const dd = String(t.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const formatNice = (iso) => {
    if (!iso) return "No due date";
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

const daysUntil = (iso) => {
    if (!iso) return null;
    const a = new Date(`${iso}T00:00:00`);
    const b = new Date(`${todayISO()}T00:00:00`);
    return Math.round((a - b) / (1000 * 60 * 60 * 24));
};

const load = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
    } catch {
        return [];
    }
};

export default function TodoListCrud() {
    const [todos, setTodos] = useState(load);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [due, setDue] = useState("");
    const [query, setQuery] = useState("");
    const [catFilter, setCatFilter] = useState("All");
    const [sortBy, setSortBy] = useState("created"); // created | dueAsc | dueDesc
    const [editing, setEditing] = useState(null); // id being edited

    // --- Confirm dialog state ---
    const [confirm, setConfirm] = useState(null);
    // shape: { title, message, confirmText, cancelText, tone, onConfirm }

    const askConfirm = (opts) => {
        setConfirm({
            title: "Are you sure?",
            message: "",
            confirmText: "Confirm",
            cancelText: "Cancel",
            tone: "default", // or "danger"
            ...opts,
        });
    };

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
    // --- /Confirm dialog state ---

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }, [todos]);

    const categories = useMemo(() => {
        const set = new Set(todos.map(t => t.category).filter(Boolean));
        return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
    }, [todos]);

    const filtered = useMemo(() => {
        let list = todos;

        if (catFilter !== "All") {
            list = list.filter(t => (t.category || "").toLowerCase() === catFilter.toLowerCase());
        }

        if (query.trim()) {
            const q = query.trim().toLowerCase();
            list = list.filter(t =>
                t.title.toLowerCase().includes(q) ||
                (t.category || "").toLowerCase().includes(q)
            );
        }

        if (sortBy === "dueAsc") {
            list = [...list].sort((a, b) => (a.due || "9999-12-31").localeCompare(b.due || "9999-12-31"));
        } else if (sortBy === "dueDesc") {
            list = [...list].sort((a, b) => (b.due || "0000-01-01").localeCompare(a.due || "0000-01-01"));
        } else {
            // created (newest first)
            list = [...list].sort((a, b) => b.createdAt - a.createdAt);
        }

        return list;
    }, [todos, catFilter, query, sortBy]);

    const addTodo = (e) => {
        e.preventDefault();
        const t = title.trim();
        const c = category.trim();
        if (!t) return;

        const newTodo = {
            id: uid(),
            title: t,
            category: c || "",
            due: due || "",
            done: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setTodos(prev => [newTodo, ...prev]);
        setTitle("");
        setCategory("");
        setDue("");
    };

    const toggleDone = (id) => {
        setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done, updatedAt: Date.now() } : t));
    };

    const removeTodo = (id) => {
        setTodos(prev => prev.filter(t => t.id !== id));
    };

    const startEdit = (id) => setEditing(id);

    const saveEdit = (id, patch) => {
        setTodos(prev => prev.map(t => t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t));
        setEditing(null);
    };

    const cancelEdit = () => setEditing(null);

    const clearCompleted = () => setTodos(prev => prev.filter(t => !t.done));

    const markAllVisibleDone = () => {
        const visibleIds = new Set(filtered.map(t => t.id));
        setTodos(prev => prev.map(t => visibleIds.has(t.id) ? { ...t, done: true, updatedAt: Date.now() } : t));
    };

    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        <Styled.Title>To-Do List</Styled.Title>
                        <Styled.Sub>Basic CRUD • Categories • Due Dates • LocalStorage</Styled.Sub>
                    </div>
                    <Styled.BadgeRow>
                        <Styled.Badge>{todos.filter(t => !t.done).length} open</Styled.Badge>
                        <Styled.Badge $tone="muted">{todos.filter(t => t.done).length} done</Styled.Badge>
                    </Styled.BadgeRow>
                </Styled.Header>

                <Styled.Card as="form" onSubmit={addTodo}>
                    <Styled.FormRow>
                        <Styled.Input
                            placeholder="Task title *"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            aria-label="Task title"
                            required
                        />
                        <Styled.Input
                            placeholder="Category (optional)"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            aria-label="Category"
                            list="category-suggestions"
                        />
                        <datalist id="category-suggestions">
                            {Array.from(new Set(todos.map(t => t.category).filter(Boolean))).map(c => (
                                <option key={c} value={c} />
                            ))}
                        </datalist>
                        <Styled.Input
                            type="date"
                            value={due}
                            onChange={(e) => setDue(e.target.value)}
                            aria-label="Due date"
                            min="1900-01-01"
                        />
                        <Styled.PrimaryButton type="submit" disabled={!title.trim()}>Add</Styled.PrimaryButton>
                    </Styled.FormRow>
                    {!title.trim() && <Styled.Helper>Tip: Title is required.</Styled.Helper>}
                </Styled.Card>

                <Styled.Toolbar>
                    <Styled.RowWrap>
                        <Styled.Select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} aria-label="Filter by category">
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </Styled.Select>

                        <Styled.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort">
                            <option value="created">Newest</option>
                            <option value="dueAsc">Due date ↑</option>
                            <option value="dueDesc">Due date ↓</option>
                        </Styled.Select>

                        <Styled.Input
                            placeholder="Search title/category…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            aria-label="Search"
                        />
                    </Styled.RowWrap>

                    <Styled.RowWrap>
                        <Styled.Button
                            type="button"
                            onClick={() =>
                                askConfirm({
                                    title: "Complete visible?",
                                    message: `Mark ${filtered.filter(t => !t.done).length} task(s) as done?`,
                                    confirmText: "Complete",
                                    onConfirm: markAllVisibleDone,
                                })
                            }
                        >
                            Complete visible
                        </Styled.Button>

                        <Styled.DangerButton
                            type="button"
                            onClick={() =>
                                askConfirm({
                                    title: "Clear completed?",
                                    message: `Remove ${todos.filter(t => t.done).length} completed task(s)?`,
                                    confirmText: "Clear",
                                    tone: "danger",
                                    onConfirm: clearCompleted,
                                })
                            }
                        >
                            Clear completed
                        </Styled.DangerButton>
                    </Styled.RowWrap>
                </Styled.Toolbar>

                <Styled.List>
                    {filtered.length === 0 && (
                        <Styled.Empty>Nothing here yet. Add your first task!</Styled.Empty>
                    )}

                    {filtered.map(item => {
                        const dleft = daysUntil(item.due);
                        const overdue = dleft !== null && dleft < 0 && !item.done;

                        if (editing === item.id) {
                            return (
                                <EditRow
                                    key={item.id}
                                    item={item}
                                    onCancel={cancelEdit}
                                    onSave={saveEdit}
                                />
                            );
                        }

                        return (
                            <Styled.Item key={item.id} $done={item.done} $overdue={overdue}>
                                <Styled.ItemLeft>
                                    <Styled.Checkbox
                                        type="checkbox"
                                        checked={item.done}
                                        onChange={() => toggleDone(item.id)}
                                        aria-label={`Mark ${item.title} ${item.done ? "not done" : "done"}`}
                                    />
                                    <div>
                                        <Styled.ItemTitle $done={item.done}>{item.title}</Styled.ItemTitle>
                                        <Styled.ItemMeta>
                                            {item.category ? <Styled.Tag>#{item.category}</Styled.Tag> : <Styled.Tag $tone="muted">No category</Styled.Tag>}
                                            <span>•</span>
                                            <span title={item.due ? item.due : "No due date"}>
                                                {item.due ? `Due ${formatNice(item.due)}` : "No due"}
                                            </span>
                                            {item.due && !item.done && (
                                                <Styled.DueHint $overdue={overdue}>
                                                    {dleft === 0 ? "Today" : dleft < 0 ? `${Math.abs(dleft)}d overdue` : `${dleft}d left`}
                                                </Styled.DueHint>
                                            )}
                                        </Styled.ItemMeta>
                                    </div>
                                </Styled.ItemLeft>

                                <Styled.ItemRight>
                                    <Styled.IconButton onClick={() => startEdit(item.id)} aria-label="Edit">✏️</Styled.IconButton>
                                    <Styled.IconButton
                                        onClick={() =>
                                            askConfirm({
                                                title: "Delete task?",
                                                message: `Delete “${item.title}” permanently?`,
                                                confirmText: "Delete",
                                                tone: "danger",
                                                onConfirm: () => removeTodo(item.id),
                                            })
                                        }
                                        aria-label="Delete"
                                    >
                                        🗑️
                                    </Styled.IconButton>
                                </Styled.ItemRight>
                            </Styled.Item>
                        );
                    })}
                </Styled.List>

                <Styled.FooterNote>
                    Data stays in your browser (localStorage). Refresh-safe.
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
                                <Styled.Button type="button" onClick={() => setConfirm(null)}>
                                    {confirm.cancelText || "Cancel"}
                                </Styled.Button>

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

function EditRow({ item, onCancel, onSave }) {
    const [t, setT] = useState(item.title);
    const [c, setC] = useState(item.category || "");
    const [d, setD] = useState(item.due || "");

    return (
        <Styled.Item as="form" onSubmit={(e) => { e.preventDefault(); if (!t.trim()) return; onSave(item.id, { title: t.trim(), category: c.trim(), due: d }); }}>
            <Styled.ItemLeft style={{ alignItems: "center" }}>
                <Styled.Input
                    value={t}
                    onChange={(e) => setT(e.target.value)}
                    aria-label="Edit title"
                    placeholder="Title *"
                    required
                />
                <Styled.Input
                    value={c}
                    onChange={(e) => setC(e.target.value)}
                    aria-label="Edit category"
                    placeholder="Category"
                    style={{ maxWidth: 180 }}
                />
                <Styled.Input
                    type="date"
                    value={d}
                    onChange={(e) => setD(e.target.value)}
                    aria-label="Edit due date"
                    style={{ maxWidth: 160 }}
                />
            </Styled.ItemLeft>
            <Styled.ItemRight>
                <Styled.PrimaryButton type="submit">Save</Styled.PrimaryButton>
                <Styled.Button type="button" onClick={onCancel}>Cancel</Styled.Button>
            </Styled.ItemRight>
        </Styled.Item>
    );
}

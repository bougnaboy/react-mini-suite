import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/* -------------------------
   Storage & helpers
------------------------- */
const STORAGE_KEY = "kanbanBoard.v1";

/* Safe LocalStorage */
const safeGet = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? null; }
    catch { return null; }
};
const safeSet = (obj) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch { }
};

/* Id + small utils */
const uid = () =>
(crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`);

const PRIORITIES = ["Low", "Medium", "High"];
const LABEL_PALETTE = [
    "#60a5fa", "#a78bfa", "#34d399", "#fbbf24", "#f87171", "#f472b6", "#f59e0b"
];

/* Default board */
const DEFAULT_STATE = {
    columns: ["todo", "doing", "done"],
    columnMeta: {
        todo: { id: "todo", title: "To Do" },
        doing: { id: "doing", title: "Doing" },
        done: { id: "done", title: "Done" },
    },
    lists: {
        todo: [],
        doing: [],
        done: [],
    },
    tasks: {}, // id -> task
};

function normalizeLoaded(data) {
    // Guard against missing fields from older exports
    const base = JSON.parse(JSON.stringify(DEFAULT_STATE));
    if (!data || typeof data !== "object") return base;
    return {
        columns: Array.isArray(data.columns) && data.columns.length ? data.columns : base.columns,
        columnMeta: { ...base.columnMeta, ...(data.columnMeta || {}) },
        lists: { ...base.lists, ...(data.lists || {}) },
        tasks: { ...(data.tasks || {}) },
    };
}

// --- Date helpers (MMM DD, YYYY + local time) ---
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fmtDateLocal = (val) => {
    if (!val) return "";
    // If it's an ISO date like "2025-09-05", render via UTC to avoid TZ drift
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
        const [y, m, d] = val.split("-").map(Number);
        const dt = new Date(Date.UTC(y, m - 1, d));
        return `${MONTHS_SHORT[dt.getUTCMonth()]} ${String(dt.getUTCDate()).padStart(2, "0")}, ${dt.getUTCFullYear()}`;
    }
    const dt = new Date(val);
    if (isNaN(dt)) return "";
    return `${MONTHS_SHORT[dt.getMonth()]} ${String(dt.getDate()).padStart(2, "0")}, ${dt.getFullYear()}`;
};

const fmtDateTime = (ts) => {
    if (!ts) return "";
    const dt = new Date(ts);
    if (isNaN(dt)) return "";
    const date = `${MONTHS_SHORT[dt.getMonth()]} ${String(dt.getDate()).padStart(2, "0")}, ${dt.getFullYear()}`;
    const time = dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); // keep your local time format
    return `${date}, ${time}`;
};

const isOverdue = (d) => {
    if (!d) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(d); due.setHours(0, 0, 0, 0);
    return due < today;
};
const toLocalDateStr = (ts) => new Date(ts).toLocaleString();

/* ----------------------------------
   Main component: KanbanBoard
---------------------------------- */
export default function KanbanBoard() {
    const persisted = safeGet();
    const [board, setBoard] = useState(normalizeLoaded(persisted) || DEFAULT_STATE);

    /* UI state */
    const [query, setQuery] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [orderMode, setOrderMode] = useState("manual"); // manual | updated | due | priority
    const [confirm, setConfirm] = useState(null); // modal
    const [toast, setToast] = useState("");

    const toastTimer = useRef(null);
    const pulse = (t) => {
        setToast(t);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(""), 1200);
    };

    useEffect(() => { safeSet(board); }, [board]);

    /* ----- Add task form state ----- */
    const [newTask, setNewTask] = useState({
        title: "",
        desc: "",
        priority: "Medium",
        due: "",
        labels: "",
        column: "todo",
    });

    const resetNewTask = () =>
        setNewTask({ title: "", desc: "", priority: "Medium", due: "", labels: "", column: "todo" });

    /* ----- Derived counts ----- */
    const counts = useMemo(() => {
        const c = {};
        for (const col of board.columns) c[col] = board.lists[col].length;
        return c;
    }, [board]);

    /* ----------------------------------
       Core data operations
    ---------------------------------- */
    const addTask = () => {
        const title = newTask.title.trim();
        if (!title) return;

        const id = uid();
        const now = Date.now();
        const labels = newTask.labels
            .split(",")
            .map(s => s.trim())
            .filter(Boolean)
            .slice(0, 6);

        const task = {
            id,
            title,
            desc: newTask.desc.trim(),
            priority: PRIORITIES.includes(newTask.priority) ? newTask.priority : "Medium",
            due: newTask.due || "",
            labels,
            createdAt: now,
            updatedAt: now,
            flash: false,
        };

        setBoard(prev => {
            const next = structuredClone(prev);
            next.tasks[id] = task;
            next.lists[newTask.column] = [...next.lists[newTask.column], id];
            return next;
        });

        pulse("Task added");
        resetNewTask();
    };

    const updateTask = (id, patch) => {
        setBoard(prev => {
            const next = structuredClone(prev);
            if (!next.tasks[id]) return prev;
            next.tasks[id] = { ...next.tasks[id], ...patch, updatedAt: Date.now() };
            return next;
        });
    };

    const removeTask = (id) => {
        const col = findTaskColumn(id);
        if (!col) return;
        setBoard(prev => {
            const next = structuredClone(prev);
            delete next.tasks[id];
            next.lists[col] = next.lists[col].filter(x => x !== id);
            return next;
        });
    };

    const findTaskColumn = (id) => {
        for (const col of board.columns) {
            if (board.lists[col].includes(id)) return col;
        }
        return null;
    };

    const moveTask = (taskId, fromCol, toCol, targetIndex = null) => {
        setBoard(prev => {
            const next = structuredClone(prev);
            const fromList = next.lists[fromCol] || [];
            const toList = next.lists[toCol] || [];

            let curIdx = fromList.indexOf(taskId);
            if (curIdx === -1) return prev;

            // remove
            fromList.splice(curIdx, 1);

            // compute target index
            if (targetIndex == null || targetIndex > toList.length) targetIndex = toList.length;
            if (targetIndex < 0) targetIndex = 0;

            // adjust when moving within same column and removing before insertion point
            if (fromCol === toCol && curIdx < targetIndex) targetIndex -= 1;

            toList.splice(targetIndex, 0, taskId);

            next.lists[fromCol] = fromList;
            next.lists[toCol] = toList;

            if (next.tasks[taskId]) next.tasks[taskId].updatedAt = Date.now();

            return next;
        });
    };

    const clearColumn = (col) => {
        setBoard(prev => {
            const next = structuredClone(prev);
            for (const id of next.lists[col]) delete next.tasks[id];
            next.lists[col] = [];
            return next;
        });
    };

    const clearAll = () => setBoard(structuredClone(DEFAULT_STATE));

    /* ----------------------------------
       Drag & Drop (HTML5)
    ---------------------------------- */
    const [drag, setDrag] = useState({ id: null, from: null });
    const [hover, setHover] = useState({ col: null, targetId: null, pos: null }); // pos: 'before'|'after'|null

    const onDragStart = (e, id) => {
        const from = findTaskColumn(id);
        if (!from) return;
        setDrag({ id, from });
        e.dataTransfer.effectAllowed = "move";
        try { e.dataTransfer.setData("text/plain", id); } catch { }
    };

    const onDragEnd = () => {
        setDrag({ id: null, from: null });
        setHover({ col: null, targetId: null, pos: null });
    };

    const onColumnDragOver = (e, col) => {
        e.preventDefault();
        setHover(h => (h.col === col && h.targetId ? h : { col, targetId: null, pos: null }));
    };

    const onColumnDrop = (e, col) => {
        e.preventDefault();
        if (!drag.id || !drag.from) return;
        moveTask(drag.id, drag.from, col, null);
        onDragEnd();
    };

    const onCardDragOver = (e, col, targetId) => {
        e.preventDefault();
        if (!drag.id || drag.id === targetId) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        const pos = e.clientY < mid ? "before" : "after";
        setHover({ col, targetId, pos });
    };

    const onCardDrop = (e, col, targetId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!drag.id || !drag.from) return;
        const list = board.lists[col];
        let idx = list.indexOf(targetId);
        if (idx === -1) {
            moveTask(drag.id, drag.from, col, null);
        } else {
            if (hover.pos === "after") idx += 1;
            moveTask(drag.id, drag.from, col, idx);
        }
        onDragEnd();
    };

    /* ----------------------------------
       Filtering + ordering (view only)
    ---------------------------------- */
    const visibleIds = (col) => {
        let ids = board.lists[col].slice();

        // Map -> data
        let rows = ids.map(id => board.tasks[id]).filter(Boolean);

        if (query.trim()) {
            const s = query.toLowerCase();
            rows = rows.filter(
                (t) =>
                    t.title.toLowerCase().includes(s) ||
                    (t.desc || "").toLowerCase().includes(s) ||
                    (t.labels || []).join(",").toLowerCase().includes(s)
            );
        }

        if (priorityFilter !== "All") {
            rows = rows.filter((t) => t.priority === priorityFilter);
        }

        if (orderMode === "updated") {
            rows.sort((a, b) => b.updatedAt - a.updatedAt);
        } else if (orderMode === "due") {
            rows.sort((a, b) => {
                const ad = a.due ? new Date(a.due).getTime() : Infinity;
                const bd = b.due ? new Date(b.due).getTime() : Infinity;
                return ad - bd;
            });
        } else if (orderMode === "priority") {
            const rank = { High: 0, Medium: 1, Low: 2 };
            rows.sort((a, b) => (rank[a.priority] ?? 9) - (rank[b.priority] ?? 9));
        } else {
            // manual: keep column order
            rows = board.lists[col].map(id => board.tasks[id]).filter(Boolean).filter(r => rows.includes(r));
        }

        return rows.map(r => r.id);
    };

    /* ----------------------------------
       Export / Import
    ---------------------------------- */
    const onExport = () => {
        const blob = new Blob([JSON.stringify(board, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `kanban-board-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        pulse("Exported JSON");
    };

    const fileRef = useRef(null);
    const onImportClick = () => fileRef.current?.click();
    const onImportFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result);
                setBoard(normalizeLoaded(parsed));
                pulse("Imported board");
            } catch {
                pulse("Invalid JSON");
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    /* ----------------------------------
       Confirm helpers
    ---------------------------------- */
    const askConfirm = (opts) =>
        setConfirm({
            title: "Are you sure?",
            message: "",
            confirmText: "Confirm",
            cancelText: "Cancel",
            tone: "danger",
            hideCancel: false,
            ...opts,
        });

    /* ----------------------------------
       Edit inline state
    ---------------------------------- */
    const [editingId, setEditingId] = useState(null);
    const [editDraft, setEditDraft] = useState(null);

    const beginEdit = (t) => {
        setEditingId(t.id);
        setEditDraft({
            title: t.title,
            desc: t.desc || "",
            priority: t.priority || "Medium",
            due: t.due || "",
            labels: (t.labels || []).join(", "),
        });
    };
    const cancelEdit = () => {
        setEditingId(null);
        setEditDraft(null);
    };
    const saveEdit = (id) => {
        const patch = {
            title: editDraft.title.trim() || "(Untitled)",
            desc: editDraft.desc.trim(),
            priority: PRIORITIES.includes(editDraft.priority) ? editDraft.priority : "Medium",
            due: editDraft.due || "",
            labels: (editDraft.labels || "")
                .split(",")
                .map(s => s.trim())
                .filter(Boolean)
                .slice(0, 6),
        };
        updateTask(id, patch);
        setEditingId(null);
        setEditDraft(null);
        pulse("Task updated");
    };

    /* ----------------------------------
       Render
    ---------------------------------- */
    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        <Styled.Title>Kanban Board</Styled.Title>
                        <div style={{ height: 8 }} />
                        <Styled.Sub>
                            Personal Trello-like board with <b>To Do</b>, <b>Doing</b>, <b>Done</b>. Drag cards to move,
                            reorder within a list, search &amp; sort, edit inline, and export/import as JSON. Data stays in
                            your browser (LocalStorage).
                        </Styled.Sub>
                        <div style={{ height: 6 }} />
                        <Styled.BulletList aria-label="How to use">
                            <Styled.BulletItem>Use the form to add tasks; drag to move across columns.</Styled.BulletItem>
                            <Styled.BulletItem>Sort view by Updated, Due, or Priority — or keep Manual order.</Styled.BulletItem>
                            <Styled.BulletItem>Edit any card inline; delete with confirmation.</Styled.BulletItem>
                            <Styled.BulletItem>Export/Import your entire board as JSON.</Styled.BulletItem>
                        </Styled.BulletList>
                    </div>

                    <Styled.BadgeRow>
                        <Styled.Tag>Total: {Object.keys(board.tasks).length}</Styled.Tag>
                        <Styled.Tag $tone="muted">To Do: {counts.todo}</Styled.Tag>
                        <Styled.Tag $tone="muted">Doing: {counts.doing}</Styled.Tag>
                        <Styled.Tag $tone="muted">Done: {counts.done}</Styled.Tag>
                    </Styled.BadgeRow>
                </Styled.Header>

                {/* Controls */}
                <Styled.Card>
                    <Styled.FormRow>
                        <Styled.Label title="Task title">
                            <Styled.LabelText>Title</Styled.LabelText>
                            <Styled.Input
                                placeholder="Build Kanban board…"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            />
                        </Styled.Label>

                        <Styled.Label title="Task description">
                            <Styled.LabelText>Description</Styled.LabelText>
                            <Styled.Textarea
                                placeholder="Optional details…"
                                value={newTask.desc}
                                onChange={(e) => setNewTask({ ...newTask, desc: e.target.value })}
                            />
                        </Styled.Label>

                        <Styled.Label title="Task priority">
                            <Styled.LabelText>Priority</Styled.LabelText>
                            <Styled.Select
                                value={newTask.priority}
                                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                            >
                                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                            </Styled.Select>
                        </Styled.Label>

                        <Styled.Label title="Due date">
                            <Styled.LabelText>Due</Styled.LabelText>
                            <Styled.DateInput
                                value={newTask.due}
                                onChange={(e) => setNewTask({ ...newTask, due: e.target.value })}
                            />
                        </Styled.Label>

                        <Styled.Label title="Comma-separated labels">
                            <Styled.LabelText>Labels (comma separated)</Styled.LabelText>
                            <Styled.Input
                                placeholder="frontend, api, bug…"
                                value={newTask.labels}
                                onChange={(e) => setNewTask({ ...newTask, labels: e.target.value })}
                            />
                        </Styled.Label>

                        <Styled.Label title="Target column">
                            <Styled.LabelText>Add to</Styled.LabelText>
                            <Styled.Select
                                value={newTask.column}
                                onChange={(e) => setNewTask({ ...newTask, column: e.target.value })}
                            >
                                {board.columns.map((c) => (
                                    <option key={c} value={c}>{board.columnMeta[c]?.title || c}</option>
                                ))}
                            </Styled.Select>
                        </Styled.Label>

                        <Styled.RowWrap>
                            <Styled.PrimaryButton type="button" onClick={addTask} disabled={!newTask.title.trim()}>
                                Add task
                            </Styled.PrimaryButton>
                            <Styled.Button type="button" onClick={resetNewTask}>
                                Reset
                            </Styled.Button>
                        </Styled.RowWrap>
                    </Styled.FormRow>
                </Styled.Card>

                {/* Filters */}
                <div style={{ height: 10 }} />
                <Styled.Card>
                    <Styled.FormRow>
                        <Styled.Label title="Search title, description, labels">
                            <Styled.LabelText>Search</Styled.LabelText>
                            <Styled.Input
                                placeholder="Filter tasks…"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </Styled.Label>

                        <Styled.Label title="Filter by priority">
                            <Styled.LabelText>Priority</Styled.LabelText>
                            <Styled.Select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                            >
                                {["All", ...PRIORITIES].map(p => <option key={p} value={p}>{p}</option>)}
                            </Styled.Select>
                        </Styled.Label>

                        <Styled.Label title="Ordering for view">
                            <Styled.LabelText>Order</Styled.LabelText>
                            <Styled.Select value={orderMode} onChange={(e) => setOrderMode(e.target.value)}>
                                <option value="manual">Manual (drag)</option>
                                <option value="updated">Last updated</option>
                                <option value="due">Due date</option>
                                <option value="priority">Priority</option>
                            </Styled.Select>
                        </Styled.Label>

                        <Styled.RowWrap>
                            <Styled.Button type="button" onClick={() => setQuery("")}>
                                Clear search
                            </Styled.Button>
                        </Styled.RowWrap>

                        <Styled.ButtonRow>
                            <Styled.Button type="button" onClick={onExport}>
                                Export JSON
                            </Styled.Button>
                            <Styled.Button type="button" onClick={onImportClick}>
                                Import JSON
                            </Styled.Button>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="application/json"
                                onChange={onImportFile}
                                hidden
                            />
                            <Styled.DangerButton
                                type="button"
                                onClick={() =>
                                    askConfirm({
                                        title: "Clear entire board?",
                                        message: "This will delete every task across all columns.",
                                        confirmText: "Clear All",
                                        onConfirm: () => {
                                            clearAll();
                                            setConfirm(null);
                                            pulse("Cleared board");
                                        },
                                    })
                                }
                            >
                                Clear All
                            </Styled.DangerButton>
                        </Styled.ButtonRow>
                    </Styled.FormRow>
                </Styled.Card>

                {/* Board grid */}
                <Styled.BoardGrid>
                    {board.columns.map((col) => {
                        const title = board.columnMeta[col]?.title || col;
                        const ids = visibleIds(col);

                        return (
                            <Styled.Column
                                key={col}
                                onDragOver={(e) => onColumnDragOver(e, col)}
                                onDrop={(e) => onColumnDrop(e, col)}
                            >
                                <Styled.ColumnHeader>
                                    <Styled.ColumnTitle>{title}</Styled.ColumnTitle>
                                    <Styled.ColumnMeta>
                                        <Styled.Chip>{ids.length} items</Styled.Chip>
                                        <Styled.Button
                                            type="button"
                                            onClick={() =>
                                                askConfirm({
                                                    title: `Clear "${title}"?`,
                                                    message: "This will delete all tasks in this column.",
                                                    confirmText: "Clear Column",
                                                    onConfirm: () => {
                                                        clearColumn(col);
                                                        setConfirm(null);
                                                        pulse(`Cleared ${title}`);
                                                    },
                                                })
                                            }
                                        >
                                            Clear
                                        </Styled.Button>
                                    </Styled.ColumnMeta>
                                </Styled.ColumnHeader>

                                <Styled.TaskList>
                                    {/* Drop indicator at top when hovering before the first card */}
                                    {hover.col === col && hover.targetId == null && <Styled.DropIndicator />}

                                    {ids.map((id) => {
                                        const t = board.tasks[id];
                                        const dragging = drag.id === id;

                                        const beingHovered = hover.col === col && hover.targetId === id;
                                        const showBefore = beingHovered && hover.pos === "before";
                                        const showAfter = beingHovered && hover.pos === "after";

                                        return (
                                            <React.Fragment key={id}>
                                                {showBefore && <Styled.DropIndicator />}
                                                <Styled.TaskCard
                                                    draggable
                                                    onDragStart={(e) => onDragStart(e, id)}
                                                    onDragEnd={onDragEnd}
                                                    onDragOver={(e) => onCardDragOver(e, col, id)}
                                                    onDrop={(e) => onCardDrop(e, col, id)}
                                                    $dragging={dragging}
                                                    $flash={t.flash}
                                                >
                                                    {editingId === id ? (
                                                        <>
                                                            <Styled.Input
                                                                value={editDraft.title}
                                                                onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                                                                placeholder="Title"
                                                            />
                                                            <Styled.Textarea
                                                                value={editDraft.desc}
                                                                onChange={(e) => setEditDraft({ ...editDraft, desc: e.target.value })}
                                                                placeholder="Description"
                                                            />
                                                            <Styled.FormRow>
                                                                <Styled.Label>
                                                                    <Styled.LabelText>Priority</Styled.LabelText>
                                                                    <Styled.Select
                                                                        value={editDraft.priority}
                                                                        onChange={(e) => setEditDraft({ ...editDraft, priority: e.target.value })}
                                                                    >
                                                                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                                                    </Styled.Select>
                                                                </Styled.Label>
                                                                <Styled.Label>
                                                                    <Styled.LabelText>Due</Styled.LabelText>
                                                                    <Styled.DateInput
                                                                        value={editDraft.due}
                                                                        onChange={(e) => setEditDraft({ ...editDraft, due: e.target.value })}
                                                                    />
                                                                </Styled.Label>
                                                                <Styled.Label>
                                                                    <Styled.LabelText>Labels</Styled.LabelText>
                                                                    <Styled.Input
                                                                        value={editDraft.labels}
                                                                        onChange={(e) => setEditDraft({ ...editDraft, labels: e.target.value })}
                                                                        placeholder="comma separated"
                                                                    />
                                                                </Styled.Label>
                                                            </Styled.FormRow>
                                                            <Styled.ButtonRow>
                                                                <Styled.PrimaryButton type="button" onClick={() => saveEdit(id)}>
                                                                    Save
                                                                </Styled.PrimaryButton>
                                                                <Styled.Button type="button" onClick={cancelEdit}>
                                                                    Cancel
                                                                </Styled.Button>
                                                            </Styled.ButtonRow>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Styled.TaskTitle>{t.title}</Styled.TaskTitle>
                                                            {t.desc ? <Styled.TaskDesc>{t.desc}</Styled.TaskDesc> : null}
                                                            <Styled.TaskMeta>
                                                                <Styled.Chip title="Priority">{t.priority}</Styled.Chip>
                                                                {t.due && (
                                                                    // Due date (MMM DD, YYYY)
                                                                    <Styled.Chip title="Due date" style={{ opacity: isOverdue(t.due) ? 1 : 0.9 }}>
                                                                        {isOverdue(t.due) ? "⚠️ " : ""}{fmtDateLocal(t.due)}
                                                                    </Styled.Chip>


                                                                )}
                                                                {(t.labels || []).slice(0, 6).map((lbl, i) => (
                                                                    <Styled.Chip key={i} title={`Label: ${lbl}`}>
                                                                        <Styled.LabelDot $c={LABEL_PALETTE[i % LABEL_PALETTE.length]} />
                                                                        {lbl}
                                                                    </Styled.Chip>
                                                                ))}
                                                                {/* // Last updated (MMM DD, YYYY, time) */}
                                                                <Styled.Chip title="Last updated">{fmtDateTime(t.updatedAt)}</Styled.Chip>
                                                            </Styled.TaskMeta>

                                                            <Styled.ButtonRow>
                                                                <Styled.Button type="button" onClick={() => beginEdit(t)}>
                                                                    Edit
                                                                </Styled.Button>
                                                                <Styled.Button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        // Quick move helpers
                                                                        const from = findTaskColumn(t.id);
                                                                        const idx = board.lists["doing"]?.length ?? 0;
                                                                        moveTask(t.id, from, "doing", idx);
                                                                        pulse("Moved to Doing");
                                                                    }}
                                                                >
                                                                    Move to Doing
                                                                </Styled.Button>
                                                                <Styled.Button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const from = findTaskColumn(t.id);
                                                                        const idx = board.lists["done"]?.length ?? 0;
                                                                        moveTask(t.id, from, "done", idx);
                                                                        pulse("Moved to Done");
                                                                    }}
                                                                >
                                                                    Move to Done
                                                                </Styled.Button>
                                                                <Styled.DangerButton
                                                                    type="button"
                                                                    onClick={() =>
                                                                        askConfirm({
                                                                            title: "Delete this task?",
                                                                            message: "This cannot be undone.",
                                                                            confirmText: "Delete",
                                                                            onConfirm: () => {
                                                                                removeTask(t.id);
                                                                                setConfirm(null);
                                                                                pulse("Task deleted");
                                                                            },
                                                                        })
                                                                    }
                                                                >
                                                                    Delete
                                                                </Styled.DangerButton>
                                                            </Styled.ButtonRow>
                                                        </>
                                                    )}
                                                </Styled.TaskCard>
                                                {showAfter && <Styled.DropIndicator />}
                                            </React.Fragment>
                                        );
                                    })}
                                </Styled.TaskList>
                            </Styled.Column>
                        );
                    })}
                </Styled.BoardGrid>

                <Styled.FooterNote>
                    Data stays in your browser (LocalStorage). Works offline. Export your board to back it up.
                </Styled.FooterNote>

                {toast && <Styled.Toast role="status" aria-live="polite">{toast}</Styled.Toast>}

                {confirm && (
                    <Styled.ModalOverlay onClick={() => setConfirm(null)}>
                        <Styled.ModalCard
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="confirm-title"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Styled.ModalTitle id="confirm-title">{confirm.title}</Styled.ModalTitle>
                            {confirm.message ? <Styled.ModalMessage>{confirm.message}</Styled.ModalMessage> : null}
                            <Styled.ModalActions>
                                {!confirm.hideCancel && (
                                    <Styled.Button type="button" onClick={() => setConfirm(null)}>
                                        {confirm.cancelText || "Cancel"}
                                    </Styled.Button>
                                )}
                                {confirm.tone === "danger" ? (
                                    <Styled.DangerButton type="button" onClick={confirm.onConfirm} autoFocus>
                                        {confirm.confirmText || "Confirm"}
                                    </Styled.DangerButton>
                                ) : (
                                    <Styled.PrimaryButton type="button" onClick={confirm.onConfirm} autoFocus>
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

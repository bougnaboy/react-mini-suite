import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/* -------------------------
   Storage & helpers
------------------------- */
const STORAGE_KEY = "stickyNotesApp.v1";

/* Safe LocalStorage */
const safeGet = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}; }
    catch { return {}; }
};
const safeSet = (obj) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch { }
};

/* Id + math helpers */
const uid = () =>
(crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const snap = (v, grid) => (grid > 1 ? Math.round(v / grid) * grid : v);

/* Palette */
const COLORS = [
    "#FFF59D", // yellow
    "#FFCCBC", // peach
    "#C5E1A5", // green
    "#B3E5FC", // blue
    "#E1BEE7", // purple
    "#FFE082", // amber
    "#F8BBD0", // pink
    "#CFD8DC", // gray
];

/* Default note box (wider so all colors + buttons fit nicely) */
const DEF_W = 320;
const DEF_H = 200;
const MIN_W = 200;
const MIN_H = 120;

/* -------------------------
   Main
------------------------- */
export default function StickyNotesApp() {
    const persisted = safeGet();

    /* ---- Notes state ---- */
    const [notes, setNotes] = useState(persisted.notes ?? []);
    const [grid, setGrid] = useState(persisted.grid ?? 8);                 // snap size (0 = off)
    const [defaultColor, setDefaultColor] = useState(persisted.defaultColor ?? COLORS[0]);

    /* Search (results at bottom) */
    const [query, setQuery] = useState("");
    const [sortBy, setSortBy] = useState("updated"); // updated | created | title

    /* Confirm modal */
    const [confirm, setConfirm] = useState(null);
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

    /* Toast */
    const [toast, setToast] = useState("");
    const toastTimer = useRef(null);
    const pulse = (t) => {
        setToast(t);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(""), 1200);
    };

    /* Persist */
    useEffect(() => {
        safeSet({ notes, grid, defaultColor });
    }, [notes, grid, defaultColor]);

    /* Refs */
    const boardRef = useRef(null);
    const dragRef = useRef({
        type: null, // 'move' | 'resize'
        id: null,
        startX: 0,
        startY: 0,
        boxX: 0,
        boxY: 0,
        boxW: 0,
        boxH: 0,
    });

    /* Derived stats */
    const stats = useMemo(() => {
        const total = notes.length;
        const colors = new Set(notes.map((n) => n.color)).size;
        return { total, colors };
    }, [notes]);

    /* Highest z for bring-to-front */
    const nextZ = () => (notes.length ? Math.max(...notes.map((n) => n.z || 1)) + 1 : 1);

    /* -------------------------
        Actions
    ------------------------- */
    const addNote = () => {
        const board = boardRef.current;
        const rect = board?.getBoundingClientRect();
        const bw = rect?.width || 900;
        const bh = rect?.height || 520;

        const count = notes.length;
        const pad = 16;
        const x = snap(
            clamp(20 + (count * 24) % Math.max(DEF_W, bw - DEF_W - pad), 8, Math.max(8, bw - DEF_W - pad)),
            grid
        );
        const y = snap(
            clamp(20 + (count * 18) % Math.max(DEF_H, bh - DEF_H - pad), 8, Math.max(8, bh - DEF_H - pad)),
            grid
        );

        const n = {
            id: uid(),
            title: "",
            text: "",
            color: defaultColor,
            x, y, w: DEF_W, h: DEF_H,
            z: nextZ(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            flash: false,
        };
        setNotes((prev) => [...prev, n]);
    };

    const removeNote = (id) => {
        askConfirm({
            title: "Delete this note?",
            message: "This cannot be undone.",
            confirmText: "Delete",
            tone: "danger",
            onConfirm: () => {
                setNotes((prev) => prev.filter((n) => n.id !== id));
                setConfirm(null);
            },
        });
    };

    const clearAll = () => {
        if (!notes.length) return;
        askConfirm({
            title: "Clear all notes?",
            message: "This will delete every note on the board.",
            confirmText: "Clear All",
            tone: "danger",
            onConfirm: () => {
                setNotes([]);
                setConfirm(null);
            },
        });
    };

    const duplicateNote = (id) => {
        const src = notes.find((n) => n.id === id);
        if (!src) return;
        const copy = {
            ...src,
            id: uid(),
            x: snap(src.x + 20, grid),
            y: snap(src.y + 16, grid),
            z: nextZ(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            flash: true,
        };
        setNotes((prev) => [...prev, copy]);
        setTimeout(() => {
            setNotes((prev) => prev.map((n) => (n.id === copy.id ? { ...n, flash: false } : n)));
        }, 700);
    };

    const bringToFront = (id) => {
        const z = nextZ();
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, z, updatedAt: Date.now() } : n)));
    };

    const setNoteColor = (id, color) => {
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, color, updatedAt: Date.now() } : n)));
    };

    const updateNoteField = (id, patch) => {
        setNotes((prev) =>
            prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n))
        );
    };

    /* -------------------------
       Drag / Resize (pointer)
    ------------------------- */
    const onDragStart = (e, id, type) => {
        e.stopPropagation();
        e.preventDefault();

        const note = notes.find((n) => n.id === id);
        if (!note) return;

        const { clientX, clientY } = e;
        dragRef.current = {
            type,
            id,
            startX: clientX,
            startY: clientY,
            boxX: note.x,
            boxY: note.y,
            boxW: note.w,
            boxH: note.h,
        };

        bringToFront(id);

        window.addEventListener("pointermove", onDragMove, { passive: false });
        window.addEventListener("pointerup", onDragEnd, { once: true });
    };

    const onDragMove = (e) => {
        const d = dragRef.current;
        if (!d.id) return;

        const board = boardRef.current;
        const rect = board?.getBoundingClientRect();
        const bw = rect?.width || 900;
        const bh = rect?.height || 520;

        const dx = e.clientX - d.startX;
        const dy = e.clientY - d.startY;

        if (d.type === "move") {
            let nx = d.boxX + dx;
            let ny = d.boxY + dy;
            const note = notes.find((n) => n.id === d.id);
            const w = note?.w ?? DEF_W;
            const h = note?.h ?? DEF_H;
            nx = clamp(nx, 0, Math.max(0, bw - w));
            ny = clamp(ny, 0, Math.max(0, bh - h));
            nx = snap(nx, grid);
            ny = snap(ny, grid);
            setNotes((prev) => prev.map((n) => (n.id === d.id ? { ...n, x: nx, y: ny } : n)));
        } else if (d.type === "resize") {
            let nw = clamp(d.boxW + dx, MIN_W, 2000);
            let nh = clamp(d.boxH + dy, MIN_H, 2000);
            nw = snap(nw, grid);
            nh = snap(nh, grid);
            setNotes((prev) => prev.map((n) => (n.id === d.id ? { ...n, w: nw, h: nh } : n)));
        }
    };

    const onDragEnd = () => {
        dragRef.current = { type: null, id: null, startX: 0, startY: 0, boxX: 0, boxY: 0, boxW: 0, boxH: 0 };
        window.removeEventListener("pointermove", onDragMove);
    };

    /* -------------------------
       Results (bottom)
    ------------------------- */
    const filtered = useMemo(() => {
        let list = notes.slice();
        if (query.trim()) {
            const s = query.toLowerCase();
            list = list.filter(
                (n) =>
                    (n.title || "").toLowerCase().includes(s) ||
                    (n.text || "").toLowerCase().includes(s)
            );
        }
        if (sortBy === "title") {
            list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        } else if (sortBy === "created") {
            list.sort((a, b) => b.createdAt - a.createdAt);
        } else {
            list.sort((a, b) => b.updatedAt - a.updatedAt);
        }
        return list;
    }, [notes, query, sortBy]);

    const resetFilters = () => {
        setQuery("");
        setSortBy("updated");
    };

    const focusNote = (id) => {
        bringToFront(id);
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, flash: true } : n)));
        setTimeout(() => {
            setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, flash: false } : n)));
        }, 700);
    };

    /* -------------------------
       Render
    ------------------------- */
    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        <Styled.Title>Sticky Notes App</Styled.Title>
                        <div style={{ height: 8 }} />
                        <Styled.Sub>
                            A digital cork-board for quick thoughts. Create colorful sticky notes, drag them
                            around, resize, duplicate, and organize your ideas. Everything is saved locally in
                            your browser (LocalStorage) and is refresh-safe.
                        </Styled.Sub>
                        <div style={{ height: 6 }} />
                        <Styled.BulletList aria-label="How to use">
                            <Styled.BulletItem>Click "Add note" to create a new sticky.</Styled.BulletItem>
                            <Styled.BulletItem>Drag using the small grip in the header; pull the corner to resize.</Styled.BulletItem>
                            <Styled.BulletItem>Change color, edit title/text, duplicate, or delete (with confirmation).</Styled.BulletItem>
                            <Styled.BulletItem>Toggle grid snap for tidy alignment; use "Focus" from results to bring one to front.</Styled.BulletItem>
                        </Styled.BulletList>
                        <div style={{ height: 10 }} />
                    </div>

                    <Styled.BadgeRow>
                        <Styled.Tag>Total: {stats.total}</Styled.Tag>
                        <Styled.Tag $tone="muted">Colors: {stats.colors}</Styled.Tag>
                    </Styled.BadgeRow>
                </Styled.Header>

                {/* Controls */}
                <Styled.Card>
                    <Styled.FormRow>
                        <Styled.RowWrap>
                            <Styled.PrimaryButton type="button" onClick={addNote}>
                                Add note
                            </Styled.PrimaryButton>
                            <Styled.DangerButton type="button" onClick={clearAll} disabled={!notes.length}>
                                Clear All
                            </Styled.DangerButton>
                        </Styled.RowWrap>

                        <Styled.Label title="Default color for new notes">
                            <Styled.LabelText>New note color</Styled.LabelText>
                            <Styled.ColorRow>
                                {COLORS.map((c) => (
                                    <Styled.ColorDot
                                        key={c}
                                        $c={c}
                                        aria-label={`Choose ${c}`}
                                        onClick={() => setDefaultColor(c)}
                                        $active={defaultColor === c}
                                        title={c}
                                    />
                                ))}
                            </Styled.ColorRow>
                        </Styled.Label>

                        <Styled.Label title="Snap movement & resize to grid">
                            <Styled.LabelText>Grid snap</Styled.LabelText>
                            <Styled.Select
                                value={grid}
                                onChange={(e) => setGrid(Number(e.target.value) || 0)}
                                aria-label="Grid snap"
                            >
                                <option value={0}>Off</option>
                                <option value={4}>4 px</option>
                                <option value={8}>8 px</option>
                                <option value={12}>12 px</option>
                                <option value={16}>16 px</option>
                            </Styled.Select>
                        </Styled.Label>
                    </Styled.FormRow>
                </Styled.Card>

                {/* Board */}
                <Styled.BoardCard>
                    <Styled.Board ref={boardRef} aria-label="Sticky notes board">
                        {notes.map((n) => (
                            <Styled.Note
                                key={n.id}
                                style={{ left: n.x, top: n.y, width: n.w, height: n.h, zIndex: n.z }}
                                $bg={n.color}
                                $dragging={dragRef.current.id === n.id}
                                $flash={n.flash}
                                onFocus={() => bringToFront(n.id)}
                            >
                                <Styled.NoteHeader>
                                    {/* drag grip */}
                                    <Styled.NoteDrag
                                        title="Drag to move"
                                        onPointerDown={(e) => onDragStart(e, n.id, "move")}
                                    />

                                    {/* title input */}
                                    <Styled.NoteTitle
                                        placeholder="Title"
                                        value={n.title}
                                        onChange={(e) => updateNoteField(n.id, { title: e.target.value })}
                                    />

                                    {/* actions: color dots + duplicate/delete */}
                                    <Styled.NoteActions $w="240px">
                                        <Styled.ColorRow $nowrap $w="170px" style={{ marginRight: 6 }}>
                                            {COLORS.map((c) => (
                                                <Styled.TinyDot
                                                    key={c}
                                                    $c={c}
                                                    $active={n.color === c}
                                                    onClick={() => setNoteColor(n.id, c)}
                                                    title={`Set ${c}`}
                                                />
                                            ))}
                                        </Styled.ColorRow>

                                        <Styled.IconButton onClick={() => duplicateNote(n.id)} title="Duplicate">
                                            📄
                                        </Styled.IconButton>
                                        <Styled.IconButton onClick={() => removeNote(n.id)} title="Delete">
                                            🗑️
                                        </Styled.IconButton>
                                    </Styled.NoteActions>
                                </Styled.NoteHeader>

                                <Styled.NoteBody>
                                    <Styled.NoteText
                                        placeholder="Type your note…"
                                        value={n.text}
                                        onChange={(e) => updateNoteField(n.id, { text: e.target.value })}
                                    />
                                </Styled.NoteBody>

                                <Styled.ResizeHandle
                                    title="Drag to resize"
                                    onPointerDown={(e) => onDragStart(e, n.id, "resize")}
                                />
                            </Styled.Note>
                        ))}
                    </Styled.Board>
                </Styled.BoardCard>

                {/* RESULTS (bottom) */}
                <div style={{ marginTop: 24 }} />
                <Styled.SectionTitle>Results</Styled.SectionTitle>
                <div style={{ height: 8 }} />

                <Styled.Card>
                    <Styled.FormRow>
                        <Styled.Label title="Search title & note text">
                            <Styled.LabelText>Search</Styled.LabelText>
                            <Styled.Input
                                placeholder="Find notes…"
                                aria-label="Search notes"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </Styled.Label>

                        <Styled.Label title="Sort the filtered results">
                            <Styled.LabelText>Sort by</Styled.LabelText>
                            <Styled.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="updated">Last updated</option>
                                <option value="created">Newest</option>
                                <option value="title">Title A–Z</option>
                            </Styled.Select>
                        </Styled.Label>

                        <Styled.RowWrap>
                            <Styled.Button type="button" onClick={resetFilters}>
                                Reset
                            </Styled.Button>
                        </Styled.RowWrap>
                    </Styled.FormRow>
                </Styled.Card>

                <div style={{ height: 10 }} />

                <Styled.List>
                    {filtered.length === 0 && notes.length === 0 && (
                        <Styled.Empty>No notes yet. Click "Add note".</Styled.Empty>
                    )}
                    {filtered.length === 0 && notes.length > 0 && (
                        <Styled.Empty>No notes match your search. Try Reset.</Styled.Empty>
                    )}

                    {filtered.map((n) => (
                        <Styled.Item key={n.id}>
                            <Styled.ItemLeft>
                                <Styled.ItemTitle>
                                    {n.title || "(Untitled)"} —{" "}
                                    <span style={{ opacity: 0.7 }}>
                                        {new Date(n.updatedAt).toLocaleString()}
                                    </span>
                                </Styled.ItemTitle>
                                <Styled.ItemMeta>
                                    <Styled.Tag $tone="muted">
                                        {String(n.text || "").slice(0, 120) || "No content"}
                                        {String(n.text || "").length > 120 ? "…" : ""}
                                    </Styled.Tag>
                                </Styled.ItemMeta>
                            </Styled.ItemLeft>
                            <Styled.ItemRight>
                                <Styled.Button type="button" onClick={() => focusNote(n.id)} title="Bring into focus">
                                    Focus
                                </Styled.Button>
                            </Styled.ItemRight>
                        </Styled.Item>
                    ))}
                </Styled.List>

                <Styled.FooterNote>
                    Data stays in your browser (LocalStorage). Works offline.
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

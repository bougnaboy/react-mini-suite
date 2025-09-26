import { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

const STORAGE_KEY = "reading-list.v1";
const STATUSES = ["To Read", "Reading", "Read"];

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
const todayISO = () => {
    const t = new Date();
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, "0");
    const dd = String(t.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};
const formatNice = (iso) => iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "";

const load = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; }
    catch { return []; }
};

export default function BookReadingList() {
    const [books, setBooks] = useState(load);
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [status, setStatus] = useState("To Read");
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("All");
    const [sortBy, setSortBy] = useState("created"); // created | title | author | status
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
    const handleConfirm = () => { const fn = confirm?.onConfirm; setConfirm(null); if (typeof fn === "function") fn(); };
    useEffect(() => {
        if (!confirm) return;
        const onKey = (e) => { if (e.key === "Escape") setConfirm(null); if (e.key === "Enter") handleConfirm(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [confirm]);

    useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(books)), [books]);

    const counts = useMemo(() => ({
        toRead: books.filter(b => b.status === "To Read").length,
        reading: books.filter(b => b.status === "Reading").length,
        read: books.filter(b => b.status === "Read").length,
    }), [books]);

    const filtered = useMemo(() => {
        let list = books;

        if (filter !== "All") list = list.filter(b => b.status === filter);

        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(b =>
                b.title.toLowerCase().includes(q) ||
                (b.author || "").toLowerCase().includes(q)
            );
        }

        if (sortBy === "title") {
            list = [...list].sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === "author") {
            list = [...list].sort((a, b) => (a.author || "").localeCompare(b.author || ""));
        } else if (sortBy === "status") {
            const order = { "To Read": 0, "Reading": 1, "Read": 2 };
            list = [...list].sort((a, b) => order[a.status] - order[b.status] || a.title.localeCompare(b.title));
        } else {
            list = [...list].sort((a, b) => b.createdAt - a.createdAt);
        }

        return list;
    }, [books, filter, query, sortBy]);

    const addBook = (e) => {
        e.preventDefault();
        const t = title.trim();
        if (!t) return;
        const book = {
            id: uid(),
            title: t,
            author: author.trim(),
            status,
            totalPages: "",
            currentPage: "",
            notes: "",
            startedAt: status === "Reading" ? todayISO() : "",
            finishedAt: status === "Read" ? todayISO() : "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setBooks(prev => [book, ...prev]);
        setTitle(""); setAuthor(""); setStatus("To Read");
        setConfirm({ title: "Saved", message: `Added “${t}”.`, confirmText: "OK", hideCancel: true });
    };

    const startEdit = id => setEditing(id);
    const cancelEdit = () => setEditing(null);

    const saveEdit = (id, patch) => {
        setBooks(prev => prev.map(b => b.id === id ? { ...b, ...patch, updatedAt: Date.now() } : b));
        setEditing(null);
        setConfirm({ title: "Saved", message: "Book updated.", confirmText: "OK", hideCancel: true });
    };

    const removeBook = (id) => {
        askConfirm({
            title: "Delete book?",
            message: "This will remove the book from your list.",
            confirmText: "Delete",
            tone: "danger",
            onConfirm: () => setBooks(prev => prev.filter(b => b.id !== id)),
        });
    };

    const clearRead = () => {
        askConfirm({
            title: "Clear all ‘Read’ books?",
            message: "This will remove all books marked as Read.",
            confirmText: "Clear",
            tone: "danger",
            onConfirm: () => setBooks(prev => prev.filter(b => b.status !== "Read")),
        });
    };

    const setStatusQuick = (id, nextStatus) => {
        setBooks(prev => prev.map(b => {
            if (b.id !== id) return b;
            const patch = { status: nextStatus, updatedAt: Date.now() };
            if (nextStatus === "Reading" && !b.startedAt) patch.startedAt = todayISO();
            if (nextStatus === "Read") patch.finishedAt = todayISO();
            return { ...b, ...patch };
        }));
    };

    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        <Styled.Title>Book Reading List</Styled.Title>
                        <Styled.Sub>Track books to read, reading, and read • LocalStorage</Styled.Sub>
                    </div>
                    <Styled.BadgeRow>
                        <Styled.Tag>To Read: {counts.toRead}</Styled.Tag>
                        <Styled.Tag>Reading: {counts.reading}</Styled.Tag>
                        <Styled.Tag>Read: {counts.read}</Styled.Tag>
                    </Styled.BadgeRow>
                </Styled.Header>

                {/* Add form */}
                <Styled.Card as="form" onSubmit={addBook}>
                    <Styled.FormRow>
                        <Styled.Input
                            placeholder="Book title *"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                        <Styled.Input
                            placeholder="Author"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            list="author-suggestions"
                        />
                        <datalist id="author-suggestions">
                            {Array.from(new Set(books.map(b => b.author).filter(Boolean))).map(a => (
                                <option key={a} value={a} />
                            ))}
                        </datalist>
                        <Styled.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </Styled.Select>
                        <Styled.PrimaryButton type="submit" disabled={!title.trim()}>Add</Styled.PrimaryButton>
                    </Styled.FormRow>
                    {!title.trim() && <Styled.Helper>Tip: Title is required.</Styled.Helper>}
                </Styled.Card>

                {/* Toolbar */}
                <Styled.Toolbar>
                    <Styled.RowWrap>
                        <Styled.Select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter">
                            {["All", ...STATUSES].map(s => <option key={s} value={s}>{s}</option>)}
                        </Styled.Select>
                        <Styled.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort">
                            <option value="created">Newest</option>
                            <option value="title">Title A–Z</option>
                            <option value="author">Author A–Z</option>
                            <option value="status">By status</option>
                        </Styled.Select>
                        <Styled.Input
                            placeholder="Search title/author…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            aria-label="Search"
                        />
                    </Styled.RowWrap>

                    <Styled.RowWrap>
                        <Styled.DangerButton type="button" onClick={clearRead}>Clear ‘Read’</Styled.DangerButton>
                    </Styled.RowWrap>
                </Styled.Toolbar>

                {/* List */}
                <Styled.List>
                    {filtered.length === 0 && <Styled.Empty>No books yet. Add your first!</Styled.Empty>}

                    {filtered.map(b => {
                        const hasProgress = Number(b.totalPages) > 0;
                        const pct = hasProgress ? Math.max(0, Math.min(100, Math.round((Number(b.currentPage) || 0) / Number(b.totalPages) * 100))) : null;

                        if (editing === b.id) {
                            return (
                                <EditRow
                                    key={b.id}
                                    book={b}
                                    onCancel={cancelEdit}
                                    onSave={saveEdit}
                                />
                            );
                        }

                        return (
                            <Styled.Item key={b.id}>
                                <Styled.ItemLeft>
                                    <div>
                                        <Styled.ItemTitle>{b.title}</Styled.ItemTitle>
                                        <Styled.ItemMeta>
                                            {b.author ? <Styled.Tag>by {b.author}</Styled.Tag> : <Styled.Tag tone="muted">Unknown author</Styled.Tag>}
                                            <span>•</span>
                                            <Styled.Tag>#{b.status}</Styled.Tag>
                                            {hasProgress && (
                                                <>
                                                    <span>•</span>
                                                    <Styled.DueHint>{b.currentPage}/{b.totalPages} ({pct}%)</Styled.DueHint>
                                                </>
                                            )}
                                            {b.startedAt && <><span>•</span><span>Started {formatNice(b.startedAt)}</span></>}
                                            {b.finishedAt && <><span>•</span><span>Finished {formatNice(b.finishedAt)}</span></>}
                                        </Styled.ItemMeta>
                                    </div>
                                </Styled.ItemLeft>

                                <Styled.ItemRight>
                                    {b.status !== "Reading" && <Styled.IconButton onClick={() => setStatusQuick(b.id, "Reading")} title="Mark as Reading">📖</Styled.IconButton>}
                                    {b.status !== "Read" && <Styled.IconButton onClick={() => setStatusQuick(b.id, "Read")} title="Mark as Read">✅</Styled.IconButton>}
                                    <Styled.IconButton onClick={() => startEdit(b.id)} title="Edit">✏️</Styled.IconButton>
                                    <Styled.IconButton onClick={() => removeBook(b.id)} title="Delete">🗑️</Styled.IconButton>
                                </Styled.ItemRight>
                            </Styled.Item>
                        );
                    })}
                </Styled.List>

                <Styled.FooterNote>Data stays in your browser (localStorage). Refresh-safe.</Styled.FooterNote>

                {/* Confirm Modal */}
                {confirm && (
                    <Styled.ModalOverlay onClick={() => setConfirm(null)}>
                        <Styled.ModalCard role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(e) => e.stopPropagation()}>
                            <Styled.ModalTitle id="confirm-title">{confirm.title}</Styled.ModalTitle>
                            {confirm.message ? <Styled.ModalMessage>{confirm.message}</Styled.ModalMessage> : null}
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

function EditRow({ book, onCancel, onSave }) {
    const [t, setT] = useState(book.title);
    const [a, setA] = useState(book.author || "");
    const [s, setS] = useState(book.status);
    const [tp, setTp] = useState(book.totalPages || "");
    const [cp, setCp] = useState(book.currentPage || "");
    const [st, setSt] = useState(book.startedAt || "");
    const [fn, setFn] = useState(book.finishedAt || "");
    const [notes, setNotes] = useState(book.notes || "");

    return (
        <Styled.Item as="form" onSubmit={(e) => {
            e.preventDefault();
            if (!t.trim()) return;
            const patch = {
                title: t.trim(),
                author: a.trim(),
                status: s,
                totalPages: tp,
                currentPage: cp,
                startedAt: st,
                finishedAt: fn,
                notes,
            };
            // auto-set dates
            if (s === "Reading" && !st) patch.startedAt = todayISO();
            if (s === "Read" && !fn) patch.finishedAt = todayISO();
            onSave(book.id, patch);
        }}>
            <Styled.ItemLeft style={{ flexDirection: "column", gap: 10 }}>
                <Styled.FormRow>
                    <Styled.Input value={t} onChange={(e) => setT(e.target.value)} placeholder="Title *" required />
                    <Styled.Input value={a} onChange={(e) => setA(e.target.value)} placeholder="Author" />
                    <Styled.Select value={s} onChange={(e) => setS(e.target.value)}>
                        {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                    </Styled.Select>
                </Styled.FormRow>

                <Styled.RowWrap>
                    <Styled.Input
                        type="number" inputMode="numeric" min="0" step="1"
                        value={tp} onChange={(e) => setTp(e.target.value)} placeholder="Total pages"
                        style={{ width: 140 }}
                    />
                    <Styled.Input
                        type="number" inputMode="numeric" min="0" step="1"
                        value={cp} onChange={(e) => setCp(e.target.value)} placeholder="Current page"
                        style={{ width: 140 }}
                    />
                    <Styled.Input type="date" value={st} onChange={(e) => setSt(e.target.value)} aria-label="Started date" />
                    <Styled.Input type="date" value={fn} onChange={(e) => setFn(e.target.value)} aria-label="Finished date" />
                </Styled.RowWrap>

                <Styled.TextArea
                    placeholder="Notes (optional)…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </Styled.ItemLeft>

            <Styled.ItemRight>
                <Styled.PrimaryButton type="submit">Save</Styled.PrimaryButton>
                <Styled.Button type="button" onClick={onCancel}>Cancel</Styled.Button>
            </Styled.ItemRight>
        </Styled.Item>
    );
}

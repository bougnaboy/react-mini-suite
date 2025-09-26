import { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

const FALLBACK_POSTER = new URL('./noPoster.png', document.baseURI).toString();


/** -------------------------
 *  Storage & helpers
 *  ------------------------- */
const STORAGE_KEY = "movie-watchlist.v1";
const STATUSES = ["To Watch", "Watching", "Watched"];
const RATINGS = [0, 1, 2, 3, 4, 5];

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/** Small, keyboard-friendly rating control (0..5) */
function RatingStars({ value = 0, onChange, titlePrefix = "Rating" }) {
    const set = (v) => typeof onChange === "function" && onChange(Math.max(0, Math.min(5, v)));
    const onKey = (e) => { if (e.key === "ArrowRight") set(value + 1); if (e.key === "ArrowLeft") set(value - 1); };

    return (
        <div role="radiogroup" tabIndex={0} onKeyDown={onKey} style={{ display: "inline-flex", gap: 6, outline: "none" }}>
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = value >= star;
                return (
                    <Styled.StarButton
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={filled && value === star}
                        title={`${titlePrefix}: ${star}`}
                        onClick={() => set(star)}
                        $filled={filled}
                    >
                        {filled ? "★" : "☆"}
                    </Styled.StarButton>
                );
            })}
            <Styled.IconButton type="button" title="Clear rating" onClick={() => set(0)}>⟲</Styled.IconButton>
        </div>
    );
}


/** -------------------------
 *  App
 *  ------------------------- */
export default function MovieWatchlist() {
    const [movies, setMovies] = useState(() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; }
        catch { return []; }
    });

    const [title, setTitle] = useState("");
    const [year, setYear] = useState("");
    const [status, setStatus] = useState("To Watch");
    const [rating, setRating] = useState(0);
    const [posterUrl, setPosterUrl] = useState("");

    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("All");
    const [sortBy, setSortBy] = useState("created"); // created | title | year | rating | status
    const [editing, setEditing] = useState(null);

    // confirm modal (same pattern as BookReadingList)
    const [confirm, setConfirm] = useState(null); // {title, message, confirmText, cancelText, tone, hideCancel, onConfirm}
    const askConfirm = (opts) => setConfirm({ title: "Are you sure?", message: "", confirmText: "Confirm", cancelText: "Cancel", tone: "default", hideCancel: false, ...opts });
    const handleConfirm = () => { const fn = confirm?.onConfirm; setConfirm(null); if (typeof fn === "function") fn(); };
    useEffect(() => {
        if (!confirm) return;
        const onKey = (e) => { if (e.key === "Escape") setConfirm(null); if (e.key === "Enter") handleConfirm(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [confirm]);

    useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(movies)), [movies]);

    const counts = useMemo(() => ({
        toWatch: movies.filter(m => m.status === "To Watch").length,
        watching: movies.filter(m => m.status === "Watching").length,
        watched: movies.filter(m => m.status === "Watched").length,
    }), [movies]);

    const filtered = useMemo(() => {
        let list = movies;

        if (filter !== "All") list = list.filter(m => m.status === filter);

        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(m =>
                m.title.toLowerCase().includes(q) ||
                String(m.year || "").toLowerCase().includes(q)
            );
        }

        if (sortBy === "title") {
            list = [...list].sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === "year") {
            list = [...list].sort((a, b) => (b.year || 0) - (a.year || 0));
        } else if (sortBy === "rating") {
            list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === "status") {
            const order = { "To Watch": 0, "Watching": 1, "Watched": 2 };
            list = [...list].sort((a, b) => order[a.status] - order[b.status] || a.title.localeCompare(b.title));
        } else {
            list = [...list].sort((a, b) => b.createdAt - a.createdAt); // newest first
        }

        return list;
    }, [movies, filter, query, sortBy]);

    const addMovie = (e) => {
        e.preventDefault();
        const t = title.trim();
        if (!t) return;
        const mv = {
            id: uid(),
            title: t,
            year: year.trim(),
            status,
            rating: Number(rating) || 0,
            posterUrl: posterUrl.trim(),
            notes: "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setMovies(prev => [mv, ...prev]);
        setTitle(""); setYear(""); setStatus("To Watch"); setRating(0); setPosterUrl("");
        setConfirm({ title: "Saved", message: `Added “${t}”.`, confirmText: "OK", hideCancel: true });
    };

    const startEdit = id => setEditing(id);
    const cancelEdit = () => setEditing(null);
    const saveEdit = (id, patch) => {
        setMovies(prev => prev.map(m => m.id === id ? { ...m, ...patch, updatedAt: Date.now() } : m));
        setEditing(null);
        setConfirm({ title: "Saved", message: "Movie updated.", confirmText: "OK", hideCancel: true });
    };

    const removeMovie = (id) => {
        askConfirm({
            title: "Delete movie?",
            message: "This will remove it from your list.",
            confirmText: "Delete",
            tone: "danger",
            onConfirm: () => setMovies(prev => prev.filter(m => m.id !== id)),
        });
    };

    const clearWatched = () => {
        askConfirm({
            title: "Clear all ‘Watched’ movies?",
            message: "This will remove all movies marked as Watched.",
            confirmText: "Clear",
            tone: "danger",
            onConfirm: () => setMovies(prev => prev.filter(m => m.status !== "Watched")),
        });
    };

    const setStatusQuick = (id, nextStatus) => {
        setMovies(prev => prev.map(m => m.id === id ? { ...m, status: nextStatus, updatedAt: Date.now() } : m));
    };
    const setRatingQuick = (id, nextRating) => {
        setMovies(prev => prev.map(m => m.id === id ? { ...m, rating: clamp(Number(nextRating) || 0, 0, 5), updatedAt: Date.now() } : m));
    };

    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        <Styled.Title>Movie Watchlist</Styled.Title>
                        <Styled.Sub>Save movies to watch, track progress, and rate — LocalStorage.</Styled.Sub>
                    </div>
                    <Styled.BadgeRow>
                        <Styled.Tag>To Watch: {counts.toWatch}</Styled.Tag>
                        <Styled.Tag>Watching: {counts.watching}</Styled.Tag>
                        <Styled.Tag>Watched: {counts.watched}</Styled.Tag>
                    </Styled.BadgeRow>
                </Styled.Header>

                {/* Add form */}
                <Styled.Card as="form" onSubmit={addMovie}>
                    <Styled.FormRow>
                        <Styled.Input placeholder="Movie title *" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        <Styled.Input placeholder="Year (e.g., 2024)" inputMode="numeric" pattern="\d{4}" value={year} onChange={(e) => setYear(e.target.value)} />
                        <Styled.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </Styled.Select>
                        <Styled.Select value={rating} onChange={(e) => setRating(Number(e.target.value))} aria-label="Initial rating" title="Initial rating">
                            {RATINGS.map(r => <option key={r} value={r}>{r === 0 ? "No rating" : `${r} ★`}</option>)}
                        </Styled.Select>
                        <Styled.Input placeholder="Poster URL (optional)" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} />
                        <Styled.PrimaryButton type="submit" disabled={!title.trim()}>Add</Styled.PrimaryButton>
                    </Styled.FormRow>
                    {!title.trim() && <Styled.Helper>Tip: Title is required.</Styled.Helper>}
                    <Styled.Helper>Add <code>public/noPoster.png</code> for a graceful image fallback.</Styled.Helper>
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
                            <option value="year">Year (new → old)</option>
                            <option value="rating">Rating (high → low)</option>
                            <option value="status">By status</option>
                        </Styled.Select>
                        <Styled.Input placeholder="Search title/year…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search" />
                    </Styled.RowWrap>

                    <Styled.RowWrap>
                        <Styled.DangerButton type="button" onClick={clearWatched}>Clear ‘Watched’</Styled.DangerButton>
                    </Styled.RowWrap>
                </Styled.Toolbar>

                {/* List */}
                <Styled.List>
                    {filtered.length === 0 && <Styled.Empty>No movies yet. Add your first!</Styled.Empty>}

                    {filtered.map(m => {
                        if (editing === m.id) {
                            return <EditRow key={m.id} movie={m} onCancel={cancelEdit} onSave={saveEdit} />;
                        }

                        return (
                            <Styled.Item key={m.id}>
                                <Styled.ThumbWrap>
                                    <img
                                        src={(m.posterUrl && m.posterUrl.trim()) || FALLBACK_POSTER}
                                        onError={(e) => {
                                            if (!e.currentTarget.dataset.fallback) {
                                                e.currentTarget.dataset.fallback = '1';
                                                e.currentTarget.src = FALLBACK_POSTER;   // same fallback
                                            }
                                        }}
                                        alt={`${m.title} poster`}
                                        width={64}
                                        height={88}
                                        style={{ width: 64, height: 88, objectFit: 'cover', borderRadius: 8 }}
                                    />


                                </Styled.ThumbWrap>

                                <Styled.ItemLeft>
                                    <div>
                                        <Styled.ItemTitle>{m.title} {m.year ? <span>({m.year})</span> : null}</Styled.ItemTitle>
                                        <Styled.ItemMeta>
                                            <Styled.Tag>#{m.status}</Styled.Tag>
                                            <span>•</span>
                                            {m.rating > 0 ? <Styled.Tag>{m.rating} ★</Styled.Tag> : <Styled.Tag tone="muted">No rating</Styled.Tag>}
                                        </Styled.ItemMeta>
                                    </div>
                                </Styled.ItemLeft>

                                <Styled.ItemRight>
                                    <RatingStars value={m.rating || 0} onChange={(r) => setRatingQuick(m.id, r)} titlePrefix={`Rate ${m.title}`} />
                                    {m.status !== "Watching" && <Styled.IconButton onClick={() => setStatusQuick(m.id, "Watching")} title="Mark as Watching">🎬</Styled.IconButton>}
                                    {m.status !== "Watched" && <Styled.IconButton onClick={() => setStatusQuick(m.id, "Watched")} title="Mark as Watched">✅</Styled.IconButton>}
                                    <Styled.IconButton onClick={() => startEdit(m.id)} title="Edit">✏️</Styled.IconButton>
                                    <Styled.IconButton onClick={() => removeMovie(m.id)} title="Delete">🗑️</Styled.IconButton>
                                </Styled.ItemRight>
                            </Styled.Item>
                        );
                    })}
                </Styled.List>

                <Styled.FooterNote>Data stays in your browser (LocalStorage). Refresh-safe.</Styled.FooterNote>

                {/* Confirm Modal */}
                {confirm && (
                    <Styled.ModalOverlay onClick={() => setConfirm(null)}>
                        <Styled.ModalCard role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(e) => e.stopPropagation()}>
                            <Styled.ModalTitle id="confirm-title">{confirm.title}</Styled.ModalTitle>
                            {confirm.message ? <Styled.ModalMessage>{confirm.message}</Styled.ModalMessage> : null}
                            <Styled.ModalActions>
                                {!confirm.hideCancel && <Styled.Button type="button" onClick={() => setConfirm(null)}>{confirm.cancelText || "Cancel"}</Styled.Button>}
                                {confirm.tone === "danger"
                                    ? <Styled.DangerButton type="button" onClick={handleConfirm} autoFocus>{confirm.confirmText || "Confirm"}</Styled.DangerButton>
                                    : <Styled.PrimaryButton type="button" onClick={handleConfirm} autoFocus>{confirm.confirmText || "Confirm"}</Styled.PrimaryButton>}
                            </Styled.ModalActions>
                        </Styled.ModalCard>
                    </Styled.ModalOverlay>
                )}
            </Styled.Container>
        </Styled.Page>
    );
}

function EditRow({ movie, onCancel, onSave }) {
    const [t, setT] = useState(movie.title);
    const [y, setY] = useState(movie.year || "");
    const [s, setS] = useState(movie.status);
    const [r, setR] = useState(movie.rating || 0);
    const [p, setP] = useState(movie.posterUrl || "");
    const [notes, setNotes] = useState(movie.notes || "");

    return (
        <Styled.Item as="form" onSubmit={(e) => {
            e.preventDefault();
            if (!t.trim()) return;
            onSave(movie.id, {
                title: t.trim(),
                year: y.trim(),
                status: s,
                rating: clamp(Number(r) || 0, 0, 5),
                posterUrl: p.trim(),
                notes,
            });
        }}>
            <Styled.ItemLeft style={{ flexDirection: "column", gap: 10 }}>
                <Styled.FormRow>
                    <Styled.Input value={t} onChange={(e) => setT(e.target.value)} placeholder="Title *" required />
                    <Styled.Input value={y} onChange={(e) => setY(e.target.value)} placeholder="Year" inputMode="numeric" pattern="\d{4}" />
                    <Styled.Select value={s} onChange={(e) => setS(e.target.value)}>
                        {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                    </Styled.Select>
                    <Styled.Select value={r} onChange={(e) => setR(Number(e.target.value))} aria-label="Rating">
                        {RATINGS.map(x => <option key={x} value={x}>{x === 0 ? "No rating" : `${x} ★`}</option>)}
                    </Styled.Select>
                    <Styled.Input value={p} onChange={(e) => setP(e.target.value)} placeholder="Poster URL" />
                </Styled.FormRow>
                <Styled.TextArea placeholder="Notes (optional)…" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Styled.ItemLeft>

            <Styled.ItemRight>
                <Styled.PrimaryButton type="submit">Save</Styled.PrimaryButton>
                <Styled.Button type="button" onClick={onCancel}>Cancel</Styled.Button>
            </Styled.ItemRight>
        </Styled.Item>
    );
}

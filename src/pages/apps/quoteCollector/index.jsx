import React, { useEffect, useMemo, useState, useRef } from "react";
import { Styled } from "./styled";

/* -------------------------
   Storage & helpers
------------------------- */
const STORAGE_KEY = "quoteCollector.v1";
const RATINGS = [1, 2, 3, 4, 5];

/* short uid for local items */
const uid = () =>
    crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

/* safe LocalStorage IO */
const safeGet = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; }
    catch { return []; }
};
const safeSet = (list) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
    catch { }
};

/* parse "tag1, tag2 tag3" -> ["tag1","tag2","tag3"] (unique, lowercase) */
function parseTags(text) {
    return Array.from(
        new Set(
            (text || "")
                .split(/[,\s]+/)
                .map((t) => t.trim().toLowerCase())
                .filter(Boolean)
        )
    );
}
/* format tags array back into a string for the inline editor */
const joinTags = (tags = []) => (tags || []).join(", ");

/* -------------------------
   Main
------------------------- */
export default function QuoteCollector() {
    /* ---- persisted list of quotes ---- */
    const [quotes, setQuotes] = useState(() => safeGet());

    // todisplay copied message
    const [copied, setCopied] = useState(false);
    const copyTimer = useRef(null);
    useEffect(() => {
        return () => {
            if (copyTimer.current) clearTimeout(copyTimer.current);
        };
    }, []);


    /* ---- add form state ---- */
    const [text, setText] = useState("");
    const [author, setAuthor] = useState("");
    const [source, setSource] = useState("");
    const [tagsLine, setTagsLine] = useState("");
    const [year, setYear] = useState("");
    const [rating, setRating] = useState(5);
    const [favorite, setFavorite] = useState(false);
    const [notes, setNotes] = useState("");

    /* ---- results (bottom) filters ---- */
    const [query, setQuery] = useState("");
    const [filterAuthor, setFilterAuthor] = useState("All");
    const [filterTag, setFilterTag] = useState("All");
    const [favOnly, setFavOnly] = useState(false);
    const [minRating, setMinRating] = useState(1);
    const [sortBy, setSortBy] = useState("created"); // created | author | length | rating | year

    /* ---- ui helpers ---- */
    const [editing, setEditing] = useState(null);
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

    /* persist when list changes */
    useEffect(() => { safeSet(quotes); }, [quotes]);

    /* ---- derived: authors & tags universe (for filters & datalist) ---- */
    const allAuthors = useMemo(
        () => Array.from(new Set(quotes.map((q) => q.author).filter(Boolean))).sort(),
        [quotes]
    );
    const allTags = useMemo(
        () => Array.from(new Set(quotes.flatMap((q) => q.tags || []))).sort(),
        [quotes]
    );

    /* ---- quick stats ---- */
    const stats = useMemo(() => {
        const total = quotes.length;
        const favs = quotes.filter((q) => q.favorite).length;
        const authors = allAuthors.length;
        return { total, favs, authors };
    }, [quotes, allAuthors]);

    /* ---- filter + search + sort pipeline (for bottom "Results") ---- */
    const filtered = useMemo(() => {
        let list = quotes.slice();

        if (favOnly) list = list.filter((q) => q.favorite);
        if (filterAuthor !== "All") list = list.filter((q) => q.author === filterAuthor);
        if (filterTag !== "All") list = list.filter((q) => (q.tags || []).includes(filterTag));
        if (minRating > 1) list = list.filter((q) => (Number(q.rating) || 0) >= minRating);

        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(
                (x) =>
                    (x.text || "").toLowerCase().includes(q) ||
                    (x.author || "").toLowerCase().includes(q) ||
                    (x.source || "").toLowerCase().includes(q) ||
                    (x.notes || "").toLowerCase().includes(q) ||
                    (x.tags || []).some((t) => (t || "").toLowerCase().includes(q))
            );
        }

        if (sortBy === "author") {
            list.sort((a, b) => (a.author || "").localeCompare(b.author || "") || a.text.localeCompare(b.text));
        } else if (sortBy === "length") {
            list.sort((a, b) => (a.text || "").length - (b.text || "").length);
        } else if (sortBy === "rating") {
            list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0) || b.createdAt - a.createdAt);
        } else if (sortBy === "year") {
            list.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0) || b.createdAt - a.createdAt);
        } else {
            list.sort((a, b) => b.createdAt - a.createdAt);
        }
        return list;
    }, [quotes, favOnly, filterAuthor, filterTag, minRating, query, sortBy]);

    /* reset all bottom filters back to default */
    const resetFilters = () => {
        setQuery("");
        setFilterAuthor("All");
        setFilterTag("All");
        setFavOnly(false);
        setMinRating(1);
        setSortBy("created");
    };

    /* -------------------------
       Actions (Add/Edit/Delete)
    ------------------------- */

    const addQuote = (e) => {
        e?.preventDefault?.();
        const t = (text || "").trim();
        if (!t) return; // quote text is mandatory

        const q = {
            id: uid(),
            text: t,
            author: author.trim(),
            source: source.trim(),
            tags: parseTags(tagsLine),
            year: Number(year) || "",
            rating: Number(rating) || 0,
            favorite: !!favorite,
            notes: (notes || "").trim(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setQuotes((prev) => [q, ...prev]);

        // reset the form after adding
        setText("");
        setAuthor("");
        setSource("");
        setTagsLine("");
        setYear("");
        setRating(5);
        setFavorite(false);
        setNotes("");
    };

    const startEdit = (id) => setEditing(id);
    const cancelEdit = () => setEditing(null);

    const saveEdit = (id, patch) => {
        setQuotes((prev) =>
            prev.map((q) =>
                q.id === id
                    ? {
                        ...q,
                        ...patch,
                        tags: parseTags(patch.tagsLine ?? joinTags(q.tags || [])),
                        rating: Number(patch.rating ?? q.rating) || 0,
                        year: Number(patch.year ?? q.year) || "",
                        favorite: !!(patch.favorite ?? q.favorite),
                        updatedAt: Date.now(),
                    }
                    : q
            )
        );
        setEditing(null);
    };

    const removeOne = (id) => {
        setConfirm({
            title: "Delete quote?",
            message: "This will remove it from your list.",
            tone: "danger",
            confirmText: "Delete",
            onConfirm: () => {
                setQuotes((prev) => prev.filter((q) => q.id !== id));
                setConfirm(null);
            },
        });
    };

    const clearAll = () => {
        if (!quotes.length) return;
        setConfirm({
            title: "Clear all quotes?",
            message: "This will delete every quote from your list.",
            tone: "danger",
            confirmText: "Clear All",
            onConfirm: () => {
                setQuotes([]);
                resetFilters();
                setConfirm(null);
            },
        });
    };

    const duplicateOne = (id) => {
        const q = quotes.find((x) => x.id === id);
        if (!q) return;
        const copy = {
            ...q,
            id: uid(),
            favorite: false, // copies start non-favourite to avoid accidental noise
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setQuotes((prev) => [copy, ...prev]);
    };

    const toggleFavorite = (id) => {
        setQuotes((prev) =>
            prev.map((q) => (q.id === id ? { ...q, favorite: !q.favorite, updatedAt: Date.now() } : q))
        );
    };

    const copyToClipboard = async (id) => {
        const q = quotes.find((x) => x.id === id);
        if (!q) return;
        const str = `${q.text} — ${q.author || "Unknown"}${q.source ? ` (${q.source})` : ""}`;

        let success = false;
        try {
            await navigator.clipboard.writeText(str);
            success = true;
        } catch {
            try {
                // Fallback for older browsers
                const ta = document.createElement("textarea");
                ta.value = str;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
                success = true;
            } catch {
                success = false;
            }
        } finally {
            if (success) {
                if (copyTimer.current) clearTimeout(copyTimer.current);
                setCopied(true);
                copyTimer.current = setTimeout(() => setCopied(false), 1200);
            }
        }
    };


    /* -------------------------
       Render
    ------------------------- */
    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        {/* Title */}
                        <Styled.Title>Quote Collector</Styled.Title>

                        {/* explicit space BELOW the title (as requested) */}
                        <div style={{ height: 8 }} />

                        {/* Para 1: what this project is */}
                        <Styled.Sub>
                            A simple, offline-first place to save your favourite inspirational quotes. Track the
                            author, source, tags, rating, year and personal notes—everything stays in your
                            browser via LocalStorage.
                        </Styled.Sub>

                        {/* space below para 1 */}
                        <div style={{ height: 6 }} />

                        {/* Para 2: how to use (bullet list as requested) */}
                        <Styled.BulletList aria-label="How to use steps">
                            <Styled.BulletItem>Type a quote in the form at the top.</Styled.BulletItem>
                            <Styled.BulletItem>Optionally add author, source, tags, rating, year and notes.</Styled.BulletItem>
                            <Styled.BulletItem>Click Add to save it to your collection.</Styled.BulletItem>
                            <Styled.BulletItem>Scroll down to the Results section to search or filter by author, tag, favourites or rating.</Styled.BulletItem>
                            <Styled.BulletItem>Use the actions on each item to favourite, copy, edit or delete.</Styled.BulletItem>
                            <Styled.BulletItem>Use Clear All (with confirmation) to start fresh.</Styled.BulletItem>
                        </Styled.BulletList>

                        {/* space below bullet list (second para) */}
                        <div style={{ height: 10 }} />
                    </div>

                    {/* Quick stats on the right */}
                    <Styled.BadgeRow>
                        <Styled.Tag>Total: {quotes.length}</Styled.Tag>
                        <Styled.Tag>Favourites: {stats.favs}</Styled.Tag>
                        <Styled.Tag $tone="muted">Authors: {stats.authors}</Styled.Tag>
                    </Styled.BadgeRow>
                </Styled.Header>

                {/* =========================================================
            ADD QUOTE FORM (top)
           ========================================================= */}
                <Styled.Card as="form" onSubmit={addQuote}>
                    <Styled.FormRow>
                        {/* Quote text (required) */}
                        <Styled.Label title="The quote itself (required)">
                            <Styled.LabelText>Quote *</Styled.LabelText>
                            <Styled.TextArea
                                placeholder='e.g., "We are what we repeatedly do. Excellence, then, is not an act, but a habit."'
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                aria-label="Quote text"
                                required
                            />
                        </Styled.Label>

                        {/* Author */}
                        <Styled.Label title="Who said it?">
                            <Styled.LabelText>Author</Styled.LabelText>
                            <Styled.Input
                                placeholder="e.g., Aristotle"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                aria-label="Author"
                                list="author-suggestions"
                            />
                            <datalist id="author-suggestions">
                                {allAuthors.map((a) => (
                                    <option key={a} value={a} />
                                ))}
                            </datalist>
                        </Styled.Label>

                        {/* Source */}
                        <Styled.Label title="Book/article/speech/link">
                            <Styled.LabelText>Source</Styled.LabelText>
                            <Styled.Input
                                placeholder="e.g., Nicomachean Ethics"
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                aria-label="Source"
                            />
                        </Styled.Label>

                        {/* Year */}
                        <Styled.Label title="Approximate year (optional)">
                            <Styled.LabelText>Year</Styled.LabelText>
                            <Styled.Input
                                type="number"
                                inputMode="numeric"
                                placeholder="e.g., 350"
                                value={year}
                                onChange={(e) => setYear(e.target.value.replace(/[^\d-]/g, ""))}
                                aria-label="Year"
                            />
                        </Styled.Label>

                        {/* Rating */}
                        <Styled.Label title="How much this resonates (1–5)">
                            <Styled.LabelText>Rating</Styled.LabelText>
                            <Styled.Select
                                value={rating}
                                onChange={(e) => setRating(Number(e.target.value) || 1)}
                                aria-label="Rating"
                            >
                                {RATINGS.map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </Styled.Select>
                        </Styled.Label>

                        {/* Favourite */}
                        <Styled.Label title="Mark as favourite">
                            <Styled.LabelText>Favourite</Styled.LabelText>
                            <div>
                                <input
                                    type="checkbox"
                                    checked={favorite}
                                    onChange={(e) => setFavorite(e.target.checked)}
                                    aria-label="Favourite"
                                    id="fav"
                                />{" "}
                                <label htmlFor="fav" style={{ opacity: 0.85, fontSize: 12 }}>
                                    Add to favourites
                                </label>
                            </div>
                        </Styled.Label>

                        {/* Tags */}
                        <Styled.Label title="Comma or space separated tags">
                            <Styled.LabelText>Tags</Styled.LabelText>
                            <Styled.Input
                                placeholder="e.g., discipline habits philosophy"
                                value={tagsLine}
                                onChange={(e) => setTagsLine(e.target.value)}
                                aria-label="Tags"
                            />
                            <Styled.Helper>
                                Use commas or spaces. Example: <code>discipline, habits, philosophy</code>
                            </Styled.Helper>
                        </Styled.Label>
                    </Styled.FormRow>

                    {/* Notes (full width, after all inputs) */}
                    <Styled.Label style={{ width: "100%", marginTop: 8 }} title="Your personal notes">
                        <Styled.LabelText>Notes</Styled.LabelText>
                        <Styled.TextArea
                            placeholder="Why this quote matters to you, where you used it, context…"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            aria-label="Notes"
                        />
                    </Styled.Label>

                    {/* Helper shown if quote is empty */}
                    {!text.trim() && <Styled.Helper>Tip: Quote text is required.</Styled.Helper>}

                    {/* ✅ Add button moved to the VERY END */}
                    <Styled.ButtonRow>
                        <Styled.PrimaryButton type="submit" disabled={!text.trim()}>
                            Add
                        </Styled.PrimaryButton>
                    </Styled.ButtonRow>
                </Styled.Card>


                {/* =========================================================
            RESULTS (bottom, with exact sequence & spacing)
            Sequence: Heading → space → Filters block → space → Results list
           ========================================================= */}

                {/* Space ABOVE results block (as requested) */}
                <div style={{ marginTop: 24 }} />

                {/* Results heading */}
                <Styled.SectionTitle>Results</Styled.SectionTitle>

                {/* Space below heading */}
                <div style={{ height: 8 }} />

                {/* Filters block */}
                <Styled.Card>
                    <Styled.FormRow>
                        {/* Keyword search */}
                        <Styled.Label title="Search across quote, author, source, tags, and notes">
                            <Styled.LabelText>Search</Styled.LabelText>
                            <Styled.Input
                                placeholder="Search quote/author/source/tags/notes…"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                aria-label="Search"
                            />
                        </Styled.Label>

                        {/* Author filter */}
                        <Styled.Label title="Filter by author">
                            <Styled.LabelText>Author</Styled.LabelText>
                            <Styled.Select
                                value={filterAuthor}
                                onChange={(e) => setFilterAuthor(e.target.value)}
                                aria-label="Filter by author"
                            >
                                <option value="All">All authors</option>
                                {allAuthors.map((a) => (
                                    <option key={a} value={a}>
                                        {a}
                                    </option>
                                ))}
                            </Styled.Select>
                        </Styled.Label>

                        {/* Tag filter */}
                        <Styled.Label title="Filter by tag">
                            <Styled.LabelText>Tag</Styled.LabelText>
                            <Styled.Select
                                value={filterTag}
                                onChange={(e) => setFilterTag(e.target.value)}
                                aria-label="Filter by tag"
                            >
                                <option value="All">All tags</option>
                                {allTags.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </Styled.Select>
                        </Styled.Label>

                        {/* Minimum rating */}
                        <Styled.Label title="Show only quotes with rating ≥ this value">
                            <Styled.LabelText>Min rating</Styled.LabelText>
                            <Styled.Select
                                value={minRating}
                                onChange={(e) => setMinRating(Number(e.target.value) || 1)}
                                aria-label="Minimum rating"
                            >
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </Styled.Select>
                        </Styled.Label>

                        {/* Sort */}
                        <Styled.Label title="Sort results">
                            <Styled.LabelText>Sort by</Styled.LabelText>
                            <Styled.Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                aria-label="Sort"
                            >
                                <option value="created">Newest</option>
                                <option value="author">Author A–Z</option>
                                <option value="length">Quote length (short → long)</option>
                                <option value="rating">Rating (high → low)</option>
                                <option value="year">Year (new → old)</option>
                            </Styled.Select>
                        </Styled.Label>

                        {/* Favourites only + Reset + Clear All in the filter block itself */}
                        <Styled.RowWrap>
                            <label style={{ fontSize: 12, opacity: 0.9 }}>
                                <input
                                    type="checkbox"
                                    checked={favOnly}
                                    onChange={(e) => setFavOnly(e.target.checked)}
                                    style={{ verticalAlign: "middle", marginRight: 6 }}
                                />
                                Favourites only
                            </label>

                            <Styled.Button type="button" onClick={resetFilters} title="Reset filters">
                                Reset
                            </Styled.Button>

                            {/* Keep Clear All near filters so sequence remains: heading → filters → results */}
                            <Styled.DangerButton type="button" onClick={clearAll} title="Delete all quotes">
                                Clear All
                            </Styled.DangerButton>
                        </Styled.RowWrap>
                    </Styled.FormRow>
                </Styled.Card>

                {/* Space below filters */}
                <div style={{ height: 10 }} />

                {/* Results list */}
                <Styled.List>
                    {filtered.length === 0 && quotes.length === 0 && (
                        <Styled.Empty>No quotes yet. Add your first!</Styled.Empty>
                    )}
                    {filtered.length === 0 && quotes.length > 0 && (
                        <Styled.Empty>No quotes match your current filters. Try Reset.</Styled.Empty>
                    )}

                    {filtered.map((q) => {
                        if (editing === q.id) {
                            return (
                                <EditRow
                                    key={q.id}
                                    item={q}
                                    onCancel={() => setEditing(null)}
                                    onSave={saveEdit}
                                />
                            );
                        }

                        return (
                            <Styled.Item key={q.id} $favorite={q.favorite}>
                                <Styled.ItemLeft>
                                    {/* Main quote text */}
                                    <Styled.QuoteText>{q.text}</Styled.QuoteText>

                                    {/* Meta row: author, source, year, rating, tags, favourite flag */}
                                    <Styled.ItemMeta>
                                        <Styled.Tag>#{q.author || "Unknown"}</Styled.Tag>
                                        {q.source && (
                                            <>
                                                <span>•</span>
                                                <Styled.Tag>#{q.source}</Styled.Tag>
                                            </>
                                        )}
                                        {q.year && (
                                            <>
                                                <span>•</span>
                                                <Styled.Tag>{q.year}</Styled.Tag>
                                            </>
                                        )}
                                        <span>•</span>
                                        <Styled.Tag>Rating {q.rating || 0}/5</Styled.Tag>
                                        {(q.tags || []).slice(0, 6).map((t) => (
                                            <React.Fragment key={t}>
                                                <span>•</span>
                                                <Styled.Tag>#{t}</Styled.Tag>
                                            </React.Fragment>
                                        ))}
                                        {q.favorite && (
                                            <>
                                                <span>•</span>
                                                <Styled.Tag $tone="muted">Favourite</Styled.Tag>
                                            </>
                                        )}
                                    </Styled.ItemMeta>

                                    {/* Optional personal notes */}
                                    {q.notes ? (
                                        <div style={{ marginTop: 4, fontSize: 13, opacity: 0.9 }}>{q.notes}</div>
                                    ) : null}
                                </Styled.ItemLeft>

                                {/* Actions */}
                                <Styled.ItemRight>
                                    <Styled.Button onClick={() => copyToClipboard(q.id)} title="Copy to clipboard">
                                        Copy
                                    </Styled.Button>
                                    <Styled.Button onClick={() => toggleFavorite(q.id)} title="Toggle favourite">
                                        {q.favorite ? "Unfavourite" : "Favourite"}
                                    </Styled.Button>
                                    <Styled.Button onClick={() => duplicateOne(q.id)} title="Duplicate">
                                        Duplicate
                                    </Styled.Button>
                                    <Styled.Button onClick={() => setEditing(q.id)} title="Edit">
                                        Edit
                                    </Styled.Button>
                                    <Styled.Button onClick={() => removeOne(q.id)} title="Delete">
                                        Delete
                                    </Styled.Button>
                                </Styled.ItemRight>
                            </Styled.Item>
                        );
                    })}
                </Styled.List>

                {/* Footer note */}
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
                            <Styled.ModalTitle id="confirm-title">{confirm.title}</Styled.ModalTitle>
                            {confirm.message ? <Styled.ModalMessage>{confirm.message}</Styled.ModalMessage> : null}
                            <Styled.ModalActions>
                                {!confirm.hideCancel && (
                                    <Styled.Button type="button" onClick={() => setConfirm(null)}>
                                        {confirm.cancelText || "Cancel"}
                                    </Styled.Button>
                                )}
                                <Styled.DangerButton type="button" onClick={confirm.onConfirm} autoFocus>
                                    {confirm.confirmText || "Confirm"}
                                </Styled.DangerButton>
                            </Styled.ModalActions>
                        </Styled.ModalCard>
                    </Styled.ModalOverlay>
                )}
            </Styled.Container>

            {copied && (
                <Styled.Toast role="status" aria-live="polite">
                    Copied
                </Styled.Toast>
            )}

        </Styled.Page>
    );
}

/* -------------------------
   Edit Row (inline editor)
------------------------- */
function EditRow({ item, onCancel, onSave }) {
    const [t, setT] = useState(item.text);
    const [a, setA] = useState(item.author || "");
    const [s, setS] = useState(item.source || "");
    const [y, setY] = useState(item.year || "");
    const [r, setR] = useState(item.rating || 5);
    const [fav, setFav] = useState(!!item.favorite);
    const [tagsLine, setTagsLine] = useState(joinTags(item.tags || []));
    const [n, setN] = useState(item.notes || "");

    return (
        <>
            <Styled.Item
                as="form"
                $edit
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!t.trim()) return;
                    onSave(item.id, {
                        text: t.trim(),
                        author: a.trim(),
                        source: s.trim(),
                        year: y,
                        rating: r,
                        favorite: fav,
                        tagsLine,
                        notes: n.trim(),
                    });
                }}
            >
                <Styled.ItemLeft style={{ display: "grid", gap: 12 }}>
                    <Styled.Label title="Edit quote text">
                        <Styled.LabelText>Quote *</Styled.LabelText>
                        <Styled.TextArea
                            value={t}
                            onChange={(e) => setT(e.target.value)}
                            placeholder="Quote"
                            required
                        />
                    </Styled.Label>

                    <Styled.FormRow>
                        <Styled.Label title="Edit author">
                            <Styled.LabelText>Author</Styled.LabelText>
                            <Styled.Input
                                value={a}
                                onChange={(e) => setA(e.target.value)}
                                placeholder="Author"
                            />
                        </Styled.Label>

                        <Styled.Label title="Edit source">
                            <Styled.LabelText>Source</Styled.LabelText>
                            <Styled.Input
                                value={s}
                                onChange={(e) => setS(e.target.value)}
                                placeholder="Source"
                            />
                        </Styled.Label>

                        <Styled.Label title="Edit year">
                            <Styled.LabelText>Year</Styled.LabelText>
                            <Styled.Input
                                type="number"
                                inputMode="numeric"
                                value={y}
                                onChange={(e) => setY(e.target.value)}
                                placeholder="Year"
                            />
                        </Styled.Label>

                        <Styled.Label title="Edit rating">
                            <Styled.LabelText>Rating</Styled.LabelText>
                            <Styled.Select
                                value={r}
                                onChange={(e) => setR(Number(e.target.value) || 1)}
                            >
                                {RATINGS.map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </Styled.Select>
                        </Styled.Label>

                        <Styled.Label title="Toggle favourite">
                            <Styled.LabelText>Favourite</Styled.LabelText>
                            <div>
                                <input
                                    type="checkbox"
                                    checked={fav}
                                    onChange={(e) => setFav(e.target.checked)}
                                />
                                <span style={{ marginLeft: 6, opacity: 0.85, fontSize: 12 }}>
                                    Mark as favourite
                                </span>
                            </div>
                        </Styled.Label>
                    </Styled.FormRow>

                    <Styled.Label title="Edit tags (comma or space separated)">
                        <Styled.LabelText>Tags</Styled.LabelText>
                        <Styled.Input
                            value={tagsLine}
                            onChange={(e) => setTagsLine(e.target.value)}
                            placeholder="Tags"
                        />
                    </Styled.Label>

                    <Styled.Label title="Edit notes">
                        <Styled.LabelText>Notes</Styled.LabelText>
                        <Styled.TextArea
                            value={n}
                            onChange={(e) => setN(e.target.value)}
                            placeholder="Notes"
                        />
                    </Styled.Label>

                    <Styled.ButtonRow>
                        <Styled.PrimaryButton type="submit">Save</Styled.PrimaryButton>
                        <Styled.Button type="button" onClick={onCancel}>
                            Cancel
                        </Styled.Button>
                    </Styled.ButtonRow>
                </Styled.ItemLeft>

            </Styled.Item>

        </>
    );
}

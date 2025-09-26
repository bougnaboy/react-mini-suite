import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/* -------------------------
   Storage & helpers
------------------------- */
const STORAGE_KEY = "colorPalettePicker.v1";

/* short uid */
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

/* tags: "tag1, tag2 tag3" -> ["tag1","tag2","tag3"] */
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
const joinTags = (tags = []) => (tags || []).join(", ");

/* Ensure HEX string: accepts "#abc", "abc", "#aabbcc" */
function normalizeHex(input) {
    let s = (input || "").toString().trim().replace(/#/g, "").toLowerCase();
    s = s.replace(/[^0-9a-f]/g, "");
    if (s.length === 3) s = s.split("").map((c) => c + c).join("");
    if (s.length !== 6) {
        // If invalid length, fall back to black
        s = "000000";
    }
    return `#${s}`;
}

/* Random hex color */
const randomHex = () =>
    `#${Array.from({ length: 6 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("")}`;

/* Pick black/white label for contrast with background */
function pickTextColor(bgHex) {
    const hex = normalizeHex(bgHex).slice(1);
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    // sRGB -> linear
    const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    return L > 0.54 ? "#000" : "#fff";
}

/* -------------------------
   Main
------------------------- */
export default function ColorPalettePicker() {
    /* persisted palettes list */
    const [palettes, setPalettes] = useState(() => safeGet());

    /* toast for copy */
    const [copied, setCopied] = useState(false);
    const copyTimer = useRef(null);
    useEffect(() => () => copyTimer.current && clearTimeout(copyTimer.current), []);

    /* add form state */
    const [name, setName] = useState("");
    const [tagsLine, setTagsLine] = useState("");
    const [notes, setNotes] = useState("");
    const [colors, setColors] = useState(() =>
        // start with 5 pleasant randoms
        Array.from({ length: 5 }, () => randomHex())
    );

    /* filters at bottom */
    const [query, setQuery] = useState("");
    const [filterTag, setFilterTag] = useState("All");
    const [contains, setContains] = useState(""); // contains color substring
    const [sortBy, setSortBy] = useState("created"); // created | name | count

    /* ui helpers */
    const [editing, setEditing] = useState(null);

    // global confirm modal (used for removing palettes, clearing all, and removing swatches in add form)
    const [confirm, setConfirm] = useState(null);
    const askConfirm = (opts) =>
        setConfirm({
            title: "Are you sure?",
            message: "",
            confirmText: "Confirm",
            cancelText: "Cancel",
            tone: "danger",
            hideCancel: false,
            onConfirm: null,
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

    /* persist on list change */
    useEffect(() => safeSet(palettes), [palettes]);

    /* derived: tags universe + stats */
    const allTags = useMemo(
        () => Array.from(new Set(palettes.flatMap((p) => p.tags || []))).sort(),
        [palettes]
    );
    const stats = useMemo(() => {
        const total = palettes.length;
        const totalColors = palettes.reduce((a, p) => a + (p.colors?.length || 0), 0);
        const avg = total ? Math.round(totalColors / total) : 0;
        return { total, totalColors, avg };
    }, [palettes]);

    /* filter + search + sort for bottom "Results" */
    const filtered = useMemo(() => {
        let list = palettes.slice();

        if (filterTag !== "All") list = list.filter((p) => (p.tags || []).includes(filterTag));

        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(
                (p) =>
                    (p.name || "").toLowerCase().includes(q) ||
                    (p.notes || "").toLowerCase().includes(q) ||
                    (p.tags || []).some((t) => t.includes(q)) ||
                    (p.colors || []).some((h) => h.toLowerCase().includes(q))
            );
        }

        if (contains.trim()) {
            const c = contains.toLowerCase().replace(/#/g, "");
            list = list.filter((p) => (p.colors || []).some((h) => h.toLowerCase().replace("#", "").includes(c)));
        }

        if (sortBy === "name") {
            list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        } else if (sortBy === "count") {
            list.sort((a, b) => (b.colors?.length || 0) - (a.colors?.length || 0));
        } else {
            list.sort((a, b) => b.createdAt - a.createdAt);
        }

        return list;
    }, [palettes, query, filterTag, contains, sortBy]);

    /* reset filters */
    const resetFilters = () => {
        setQuery("");
        setFilterTag("All");
        setContains("");
        setSortBy("created");
    };

    /* -------------------------
       Actions
    ------------------------- */

    const addColor = () => {
        setColors((prev) => (prev.length >= 10 ? prev : [...prev, randomHex()]));
    };

    // UPDATED: confirm before removing swatch in ADD FORM
    const removeColor = (idx) => {
        askConfirm({
            title: "Remove this color?",
            message: "This will delete the swatch from the new palette.",
            confirmText: "Remove",
            onConfirm: () =>
                setColors((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== idx))),
        });
    };

    const updateColor = (idx, hex) => {
        const hx = normalizeHex(hex);
        setColors((prev) => prev.map((c, i) => (i === idx ? hx : c)));
    };
    const randomizeColors = () => {
        setColors((prev) => prev.map(() => randomHex()));
    };

    const addPalette = (e) => {
        e?.preventDefault?.();
        const nm = (name || "").trim();
        const cols = (colors || []).map(normalizeHex).filter(Boolean);
        if (!nm || cols.length < 2) return; // need a title and at least 2 colors

        const p = {
            id: uid(),
            name: nm,
            colors: cols,
            tags: parseTags(tagsLine),
            notes: (notes || "").trim(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setPalettes((prev) => [p, ...prev]);

        // reset form
        setName("");
        setTagsLine("");
        setNotes("");
        randomizeColors();
    };

    const startEdit = (id) => setEditing(id);
    const cancelEdit = () => setEditing(null);

    const saveEdit = (id, patch) => {
        setPalettes((prev) =>
            prev.map((p) =>
                p.id === id
                    ? {
                        ...p,
                        ...patch,
                        colors: (patch.colors || p.colors).map(normalizeHex),
                        tags: parseTags(patch.tagsLine ?? joinTags(p.tags || [])),
                        updatedAt: Date.now(),
                    }
                    : p
            )
        );
        setEditing(null);
    };

    const duplicateOne = (id) => {
        const p = palettes.find((x) => x.id === id);
        if (!p) return;
        const copy = {
            ...p,
            id: uid(),
            name: `${p.name} (copy)`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setPalettes((prev) => [copy, ...prev]);
    };

    const removeOne = (id) => {
        askConfirm({
            title: "Delete palette?",
            message: "This will remove it from your list.",
            confirmText: "Delete",
            onConfirm: () => setPalettes((prev) => prev.filter((p) => p.id !== id)),
        });
    };

    const clearAll = () => {
        if (!palettes.length) return;
        askConfirm({
            title: "Clear all palettes?",
            message: "This will delete every palette from your list.",
            confirmText: "Clear All",
            onConfirm: () => {
                setPalettes([]);
                resetFilters();
            },
        });
    };

    const copyHex = async (hex) => {
        try {
            await navigator.clipboard.writeText(normalizeHex(hex));
            if (copyTimer.current) clearTimeout(copyTimer.current);
            setCopied(true);
            copyTimer.current = setTimeout(() => setCopied(false), 1200);
        } catch { }
    };

    const copyPalette = async (p) => {
        const text = (p.colors || []).join(", ");
        try {
            await navigator.clipboard.writeText(text);
            if (copyTimer.current) clearTimeout(copyTimer.current);
            setCopied(true);
            copyTimer.current = setTimeout(() => setCopied(false), 1200);
        } catch { }
    };

    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        {/* Title */}
                        <Styled.Title>Color Palette Picker</Styled.Title>

                        {/* space below title */}
                        <div style={{ height: 8 }} />

                        {/* Para 1: what this project is */}
                        <Styled.Sub>
                            Create, preview, and save your own color palettes. Each palette keeps a name, notes,
                            tags, and multiple swatches — perfect for UI themes, brand kits, or mood boards.
                            Everything is stored locally (works offline).
                        </Styled.Sub>

                        {/* space below para 1 */}
                        <div style={{ height: 6 }} />

                        {/* Para 2: how to use (bullet list) */}
                        <Styled.BulletList aria-label="How to use steps">
                            <Styled.BulletItem>Give your palette a name and pick at least two colors.</Styled.BulletItem>
                            <Styled.BulletItem>Use the color pickers or type hex (e.g., #ff7a59). Add/Remove swatches as needed.</Styled.BulletItem>
                            <Styled.BulletItem>Optionally add tags and notes, then click Add to save.</Styled.BulletItem>
                            <Styled.BulletItem>Scroll to Results to search, filter by tag, and sort. Click a swatch to copy its hex.</Styled.BulletItem>
                            <Styled.BulletItem>Duplicate, edit inline, or delete with confirmation anytime.</Styled.BulletItem>
                        </Styled.BulletList>

                        {/* space below bullet list */}
                        <div style={{ height: 10 }} />
                    </div>

                    {/* Quick stats on the right */}
                    <Styled.BadgeRow>
                        <Styled.Tag>Total: {stats.total}</Styled.Tag>
                        <Styled.Tag>Colors: {stats.totalColors}</Styled.Tag>
                        <Styled.Tag $tone="muted">Avg/palette: {stats.avg}</Styled.Tag>
                    </Styled.BadgeRow>
                </Styled.Header>

                {/* =========================================================
            ADD PALETTE FORM (top)
           ========================================================= */}
                <Styled.Card as="form" onSubmit={addPalette}>
                    <Styled.FormRow>
                        {/* Name */}
                        <Styled.Label title="Short title for the palette">
                            <Styled.LabelText>Name *</Styled.LabelText>
                            <Styled.Input
                                placeholder="e.g., Sunset Glow"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                aria-label="Palette name"
                                required
                            />
                        </Styled.Label>

                        {/* Tags */}
                        <Styled.Label title="Comma or space separated tags">
                            <Styled.LabelText>Tags</Styled.LabelText>
                            <Styled.Input
                                placeholder="e.g., warm gradient brand"
                                value={tagsLine}
                                onChange={(e) => setTagsLine(e.target.value)}
                                aria-label="Tags"
                            />
                            <Styled.Helper>
                                Use commas or spaces. Example: <code>warm, gradient, brand</code>
                            </Styled.Helper>
                        </Styled.Label>
                    </Styled.FormRow>

                    {/* Swatches editor */}
                    <div style={{ marginTop: 10 }}>
                        <Styled.LabelText>Colors (click swatch to copy hex)</Styled.LabelText>
                        <div style={{ height: 6 }} />
                        <Styled.SwatchGrid>
                            {colors.map((c, idx) => {
                                const hx = normalizeHex(c);
                                const textColor = pickTextColor(hx);
                                return (
                                    <div key={idx} style={{ display: "grid", gap: 6 }}>
                                        {/* Swatch preview (click = copy) */}
                                        <Styled.Swatch
                                            type="button"
                                            style={{ background: hx }}
                                            onClick={() => copyHex(hx)}
                                            title="Copy hex"
                                        >
                                            <Styled.SwatchHex>{hx}</Styled.SwatchHex>
                                        </Styled.Swatch>

                                        {/* Inputs: color picker + hex text */}
                                        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 6 }}>
                                            <input
                                                type="color"
                                                value={hx}
                                                onChange={(e) => updateColor(idx, e.target.value)}
                                                aria-label={`Pick color ${idx + 1}`}
                                                style={{
                                                    width: 40,
                                                    height: 36,
                                                    borderRadius: 8,
                                                    border: "1px solid hsl(0 0% 100% / 0.14)",
                                                    background: "transparent",
                                                    cursor: "pointer",
                                                }}
                                            />
                                            <Styled.Input
                                                placeholder="#AABBCC"
                                                value={hx}
                                                onChange={(e) => updateColor(idx, e.target.value)}
                                                aria-label={`Hex color ${idx + 1}`}
                                            />
                                            <Styled.Button
                                                type="button"
                                                onClick={() => removeColor(idx)}
                                                disabled={colors.length <= 2}
                                                title="Remove this color"
                                            >
                                                Remove
                                            </Styled.Button>
                                        </div>

                                        {/* Contrast hint */}
                                        <div style={{ fontSize: 11, opacity: 0.75 }}>
                                            Contrast label on this swatch would be{" "}
                                            <span style={{ color: textColor }}>
                                                {textColor === "#000" ? "black" : "white"}
                                            </span>.
                                        </div>
                                    </div>
                                );
                            })}
                        </Styled.SwatchGrid>

                        <Styled.RowWrap style={{ marginTop: 10 }}>
                            <Styled.Button type="button" onClick={addColor} disabled={colors.length >= 10} title="Add color">
                                + Add color
                            </Styled.Button>
                            <Styled.Button type="button" onClick={randomizeColors} title="Randomize all colors">
                                Randomize
                            </Styled.Button>
                        </Styled.RowWrap>
                    </div>

                    {/* Notes (full width) */}
                    <Styled.Label style={{ width: "100%", marginTop: 10 }} title="Optional notes">
                        <Styled.LabelText>Notes</Styled.LabelText>
                        <Styled.TextArea
                            placeholder="Inspiration, usage, or references…"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            aria-label="Notes"
                        />
                    </Styled.Label>

                    {/* Helper + Add at the very end */}
                    {!name.trim() && <Styled.Helper>Tip: Name is required. Add at least two colors.</Styled.Helper>}
                    <Styled.ButtonRow>
                        <Styled.PrimaryButton type="submit" disabled={!name.trim() || colors.length < 2}>
                            Add
                        </Styled.PrimaryButton>
                    </Styled.ButtonRow>
                </Styled.Card>

                {/* =========================================================
            RESULTS (bottom, strict sequence)
            Heading → space → Filters block → space → Results list
           ========================================================= */}

                {/* Space ABOVE results */}
                <div style={{ marginTop: 24 }} />

                {/* Results heading */}
                <Styled.SectionTitle>Results</Styled.SectionTitle>

                {/* Space below heading */}
                <div style={{ height: 8 }} />

                {/* Filters block */}
                <Styled.Card>
                    <Styled.FormRow>
                        {/* Search */}
                        <Styled.Label title="Search across name, notes, tags, and hex values">
                            <Styled.LabelText>Search</Styled.LabelText>
                            <Styled.Input
                                placeholder="Search name/notes/tags/hex…"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                aria-label="Search"
                            />
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
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </Styled.Select>
                        </Styled.Label>

                        {/* Contains color */}
                        <Styled.Label title="Show palettes that contain this hex (partial OK)">
                            <Styled.LabelText>Contains color</Styled.LabelText>
                            <Styled.Input
                                placeholder="e.g., ff7a, #1e90ff"
                                value={contains}
                                onChange={(e) => setContains(e.target.value)}
                                aria-label="Contains hex"
                            />
                        </Styled.Label>

                        {/* Sort */}
                        <Styled.Label title="Sort the results">
                            <Styled.LabelText>Sort by</Styled.LabelText>
                            <Styled.Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                aria-label="Sort"
                            >
                                <option value="created">Newest</option>
                                <option value="name">Name A–Z</option>
                                <option value="count">Color count (high → low)</option>
                            </Styled.Select>
                        </Styled.Label>

                        <Styled.RowWrap>
                            <Styled.Button type="button" onClick={resetFilters} title="Reset filters">
                                Reset
                            </Styled.Button>
                            <Styled.DangerButton type="button" onClick={clearAll} title="Delete all palettes">
                                Clear All
                            </Styled.DangerButton>
                        </Styled.RowWrap>
                    </Styled.FormRow>
                </Styled.Card>

                {/* Space below filters */}
                <div style={{ height: 10 }} />

                {/* Results list */}
                <Styled.List>
                    {filtered.length === 0 && palettes.length === 0 && (
                        <Styled.Empty>No palettes yet. Add your first!</Styled.Empty>
                    )}
                    {filtered.length === 0 && palettes.length > 0 && (
                        <Styled.Empty>No results match your current filters. Try Reset.</Styled.Empty>
                    )}

                    {filtered.map((p) => {
                        if (editing === p.id) {
                            return (
                                <EditRow
                                    key={p.id}
                                    item={p}
                                    onCancel={() => setEditing(null)}
                                    onSave={saveEdit}
                                />
                            );
                        }
                        return (
                            <Styled.Item key={p.id}>
                                <Styled.ItemLeft>
                                    <Styled.ItemTitle>{p.name}</Styled.ItemTitle>
                                    <Styled.ItemMeta>
                                        {(p.tags || []).slice(0, 8).map((t, idx) => (
                                            <React.Fragment key={`${t}-${idx}`}>
                                                <Styled.Tag>#{t}</Styled.Tag>
                                                <span>•</span>
                                            </React.Fragment>
                                        ))}
                                        <Styled.Tag $tone="muted">
                                            {p.colors?.length || 0} colors
                                        </Styled.Tag>
                                    </Styled.ItemMeta>

                                    {/* Swatches preview */}
                                    <Styled.SwatchGrid>
                                        {(p.colors || []).map((hex, i) => (
                                            <Styled.Swatch
                                                key={i}
                                                type="button"
                                                style={{ background: normalizeHex(hex) }}
                                                onClick={() => copyHex(hex)}
                                                title="Copy hex"
                                            >
                                                <Styled.SwatchHex>{normalizeHex(hex)}</Styled.SwatchHex>
                                            </Styled.Swatch>
                                        ))}
                                    </Styled.SwatchGrid>

                                    {/* Optional notes */}
                                    {p.notes ? (
                                        <div style={{ marginTop: 4, fontSize: 13, opacity: 0.9 }}>{p.notes}</div>
                                    ) : null}
                                </Styled.ItemLeft>

                                {/* Actions */}
                                <Styled.ItemRight>
                                    <Styled.Button onClick={() => copyPalette(p)} title="Copy hex list">
                                        Copy list
                                    </Styled.Button>
                                    <Styled.Button onClick={() => duplicateOne(p.id)} title="Duplicate">
                                        Duplicate
                                    </Styled.Button>
                                    <Styled.Button onClick={() => setEditing(p.id)} title="Edit">
                                        Edit
                                    </Styled.Button>
                                    <Styled.Button onClick={() => removeOne(p.id)} title="Delete">
                                        Delete
                                    </Styled.Button>
                                </Styled.ItemRight>
                            </Styled.Item>
                        );
                    })}
                </Styled.List>

                <Styled.FooterNote>
                    Data stays in your browser (LocalStorage). Works offline.
                </Styled.FooterNote>

                {/* Global Confirm Modal */}
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

            {/* Copied toast */}
            {copied && <Styled.Toast role="status" aria-live="polite">Copied</Styled.Toast>}
        </Styled.Page>
    );
}

/* -------------------------
   Edit Row (inline)
------------------------- */
function EditRow({ item, onCancel, onSave }) {
    const [n, setN] = useState(item.name);
    const [tagsLine, setTagsLine] = useState(joinTags(item.tags || []));
    const [notes, setNotes] = useState(item.notes || "");
    const [cols, setCols] = useState(item.colors || []);

    // Local confirm just for EditRow (confirm before removing swatch in edit mode)
    const [confirm, setConfirm] = useState(null);
    const askConfirm = (opts) =>
        setConfirm({
            title: "Remove this color?",
            message: "This will delete the swatch from this palette.",
            confirmText: "Remove",
            cancelText: "Cancel",
            tone: "danger",
            hideCancel: false,
            onConfirm: null,
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

    const addColor = () => setCols((prev) => (prev.length >= 10 ? prev : [...prev, randomHex()]));
    const removeColor = (idx) =>
        askConfirm({
            onConfirm: () =>
                setCols((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== idx))),
        });
    const updateColor = (idx, hex) =>
        setCols((prev) => prev.map((c, i) => (i === idx ? normalizeHex(hex) : c)));

    return (
        <Styled.Item
            as="form"
            $edit
            onSubmit={(e) => {
                e.preventDefault();
                if (!n.trim() || (cols || []).length < 2) return;
                onSave(item.id, {
                    name: n.trim(),
                    tagsLine,
                    notes: notes.trim(),
                    colors: cols,
                });
            }}
        >
            <Styled.ItemLeft>
                <Styled.FormRow>
                    <Styled.Label title="Edit palette name">
                        <Styled.LabelText>Name *</Styled.LabelText>
                        <Styled.Input value={n} onChange={(e) => setN(e.target.value)} placeholder="Name" />
                    </Styled.Label>

                    <Styled.Label title="Edit tags (comma/space separated)">
                        <Styled.LabelText>Tags</Styled.LabelText>
                        <Styled.Input value={tagsLine} onChange={(e) => setTagsLine(e.target.value)} placeholder="Tags" />
                    </Styled.Label>
                </Styled.FormRow>

                {/* Swatches editor */}
                <Styled.SwatchGrid>
                    {cols.map((c, idx) => {
                        const hx = normalizeHex(c);
                        return (
                            <div key={idx} style={{ display: "grid", gap: 6 }}>
                                <Styled.Swatch type="button" style={{ background: hx }} title="Preview">
                                    <Styled.SwatchHex>{hx}</Styled.SwatchHex>
                                </Styled.Swatch>
                                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 6 }}>
                                    <input
                                        type="color"
                                        value={hx}
                                        onChange={(e) => updateColor(idx, e.target.value)}
                                        aria-label={`Pick color ${idx + 1}`}
                                        style={{
                                            width: 40,
                                            height: 36,
                                            borderRadius: 8,
                                            border: "1px solid hsl(0 0% 100% / 0.14)",
                                            background: "transparent",
                                            cursor: "pointer",
                                        }}
                                    />
                                    <Styled.Input
                                        value={hx}
                                        onChange={(e) => updateColor(idx, e.target.value)}
                                        placeholder="#AABBCC"
                                        aria-label={`Hex color ${idx + 1}`}
                                    />
                                    <Styled.Button type="button" onClick={() => removeColor(idx)} disabled={cols.length <= 2}>
                                        Remove
                                    </Styled.Button>
                                </div>
                            </div>
                        );
                    })}
                </Styled.SwatchGrid>

                <Styled.RowWrap style={{ marginTop: 10 }}>
                    <Styled.Button type="button" onClick={addColor} disabled={cols.length >= 10}>
                        + Add color
                    </Styled.Button>
                </Styled.RowWrap>

                <Styled.Label title="Edit notes">
                    <Styled.LabelText>Notes</Styled.LabelText>
                    <Styled.TextArea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Notes"
                    />
                </Styled.Label>

                <Styled.ButtonRow>
                    <Styled.PrimaryButton type="submit">Save</Styled.PrimaryButton>
                    <Styled.Button type="button" onClick={onCancel}>Cancel</Styled.Button>
                </Styled.ButtonRow>
            </Styled.ItemLeft>

            {/* Local confirm modal for EditRow */}
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
        </Styled.Item>
    );
}

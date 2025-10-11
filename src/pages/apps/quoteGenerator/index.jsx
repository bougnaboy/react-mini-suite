import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";
/* Optional: ToastContainer aapke app me global ho to yeh work karega; otherwise harmless */
import { toast } from "react-toastify";

/* =========================================================
   Constants
   ========================================================= */
const DRAFT_KEY = "quoteGenerator_last_v1";
const FAV_KEY = "quoteGenerator_favorites_v1";

const SOURCES = [
    { id: "advice", label: "Advice Slip API" },
    { id: "quotable", label: "Quotable API" },
];

/* Offline fallback quotes/advice (for network issues) */
const FALLBACK = [
    { text: "The best time to start was yesterday. The next best time is now.", author: "Unknown", source: "fallback" },
    { text: "Make it work, make it right, make it fast.", author: "Kent Beck", source: "fallback" },
    { text: "It always seems impossible until it is done.", author: "Nelson Mandela", source: "fallback" },
    { text: "Be curious. Read widely. Try new things.", author: "Unknown", source: "fallback" },
    { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds", source: "fallback" },
];

/* Normalize API responses to { id?, text, author, source } */
async function fetchQuoteFrom(source) {
    const cacheBuster = `?_=${Date.now()}`;
    if (source === "advice") {
        const res = await fetch(`https://api.adviceslip.com/advice${cacheBuster}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Advice API error");
        const data = await res.json();
        const slip = data?.slip;
        return {
            id: slip?.id ?? undefined,
            text: slip?.advice || "Keep going.",
            author: "Advice",
            source: "advice",
        };
    }

    // quotable
    const res = await fetch(`https://api.quotable.io/random${cacheBuster}`);
    if (!res.ok) throw new Error("Quotable API error");
    const data = await res.json();
    return {
        id: data?._id ?? undefined,
        text: data?.content || "Stay hungry, stay foolish.",
        author: data?.author || "Unknown",
        source: "quotable",
    };
}

/* Small utilities */
function timeLabel(d = new Date()) {
    // Sep 20, 2025 14:22:10 hrs (IST style)
    const parts = new Intl.DateTimeFormat("en-US", {
        month: "short", day: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false, timeZone: "Asia/Kolkata",
    }).formatToParts(d);

    const g = (t) => parts.find((p) => p.type === t)?.value || "";
    return `${g("month")} ${g("day")}, ${g("year")} ${g("hour")}:${g("minute")}:${g("second")} hrs`;
}

function uid() {
    return Math.random().toString(36).slice(2, 9);
}

/* =========================================================
   Confirm Modal (local, lightweight)
   ========================================================= */
function useConfirm() {
    const [confirm, setConfirm] = useState(null);
    const open = (opts) => setConfirm({ id: uid(), ...opts });
    const close = () => setConfirm(null);
    return { confirm, open, close };
}

/* =========================================================
   Main Component
   ========================================================= */
const QuoteGenerator = () => {
    const [source, setSource] = useState("advice");
    const [loading, setLoading] = useState(false);
    const [current, setCurrent] = useState(null);
    const [favs, setFavs] = useState(() => {
        try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); } catch { return []; }
    });
    const [filter, setFilter] = useState("");
    const { confirm, open, close } = useConfirm();
    const printRef = useRef(null);

    useEffect(() => {
        // Load last viewed quote (if any)
        try {
            const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
            if (saved && saved.text) setCurrent(saved);
        } catch { }
    }, []);

    useEffect(() => {
        if (!current) return;
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify(current)); } catch { }
    }, [current]);

    const filteredFavs = useMemo(() => {
        const q = filter.trim().toLowerCase();
        if (!q) return favs;
        return favs.filter((f) =>
            (f.text || "").toLowerCase().includes(q) ||
            (f.author || "").toLowerCase().includes(q) ||
            (f.source || "").toLowerCase().includes(q)
        );
    }, [favs, filter]);

    const fetchNew = async () => {
        setLoading(true);
        try {
            const q = await fetchQuoteFrom(source);
            setCurrent({ ...q, fetchedAt: new Date().toISOString() });
            toast?.success?.("New quote loaded");
        } catch (e) {
            // Fallback item
            const f = FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
            setCurrent({ ...f, fetchedAt: new Date().toISOString() });
            toast?.error?.("API issue, showing a fallback");
        } finally {
            setLoading(false);
        }
    };

    const copyCurrent = async () => {
        if (!current?.text) return;
        const text = current.author ? `${current.text} — ${current.author}` : current.text;
        try {
            await navigator.clipboard.writeText(text);
            toast?.info?.("Copied to clipboard");
        } catch {
            /* fallback */
            const ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            ta.remove();
            toast?.info?.("Copied to clipboard");
        }
    };

    const shareCurrent = async () => {
        if (!current?.text) return;
        const text = current.author ? `${current.text} — ${current.author}` : current.text;
        const shareData = { text, title: "Quote" };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch { }
        } else {
            copyCurrent();
        }
    };

    const saveCurrent = () => {
        if (!current?.text) return;
        const exists = favs.some((f) => f.text === current.text && f.author === current.author);
        if (exists) {
            toast?.info?.("Already in favorites");
            return;
        }
        const next = [{ ...current, id: current.id || uid() }, ...favs];
        setFavs(next);
        try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch { }
        toast?.success?.("Saved");
    };

    const removeOne = (id) => {
        open({
            title: "Remove favorite?",
            message: "This quote will be removed from your saved list.",
            confirmText: "Remove",
            danger: true,
            onConfirm: () => {
                const next = favs.filter((f) => f.id !== id);
                setFavs(next);
                try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch { }
                close();
                toast?.info?.("Removed");
            },
        });
    };

    const clearAll = () => {
        if (!favs.length) return;
        open({
            title: "Clear all favorites?",
            message: "This deletes all saved quotes. This cannot be undone.",
            confirmText: "Clear All",
            danger: true,
            onConfirm: () => {
                setFavs([]);
                try { localStorage.removeItem(FAV_KEY); } catch { }
                close();
                toast?.info?.("Cleared");
            },
        });
    };

    const exportJSON = () => {
        const blob = new Blob([JSON.stringify(favs, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "quote-favorites.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const onImportFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(String(reader.result || "[]"));
                if (!Array.isArray(parsed)) throw new Error("Not an array");
                const sanitized = parsed
                    .filter((x) => x && x.text)
                    .map((x) => ({
                        id: x.id || uid(),
                        text: String(x.text),
                        author: x.author ? String(x.author) : "Unknown",
                        source: x.source ? String(x.source) : "import",
                        fetchedAt: x.fetchedAt || new Date().toISOString(),
                    }));
                open({
                    title: "Replace favorites?",
                    message: `This will replace your current favorites with ${sanitized.length} imported items.`,
                    confirmText: "Replace",
                    danger: true,
                    onConfirm: () => {
                        setFavs(sanitized);
                        try { localStorage.setItem(FAV_KEY, JSON.stringify(sanitized)); } catch { }
                        close();
                        toast?.success?.("Imported");
                    },
                });
            } catch {
                toast?.error?.("Invalid JSON");
            }
        };
        reader.readAsText(file);
        // reset input value so same file can be chosen again
        e.target.value = "";
    };

    // Load a quote on first mount if none present
    useEffect(() => {
        if (!current) fetchNew();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keyboard shortcuts: n = new, s = save, c = copy
    useEffect(() => {
        const onKey = (e) => {
            if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
            if (e.key.toLowerCase() === "n") { fetchNew(); }
            if (e.key.toLowerCase() === "s") { saveCurrent(); }
            if (e.key.toLowerCase() === "c") { copyCurrent(); }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current, favs, source]);

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div>
                    <h1>Quote Generator</h1>
                    <p>Press the button (or hit <kbd>N</kbd>) to fetch a fresh quote or advice. Save your favorites locally.</p>
                </div>
                <Styled.HeaderActions>
                    <label className="select">
                        <span>Source</span>
                        <select value={source} onChange={(e) => setSource(e.target.value)}>
                            {SOURCES.map((s) => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                        </select>
                    </label>
                    <button onClick={fetchNew} disabled={loading} title="New (N)">
                        {loading ? "Loading..." : "New"}
                    </button>
                </Styled.HeaderActions>
            </Styled.Header>

            <Styled.Layout>
                {/* LEFT: Current Quote */}
                <Styled.Card>
                    <Styled.QuoteBlock>
                        <blockquote>
                            {current?.text || "…"}
                        </blockquote>
                        <div className="meta">
                            <span className="author">{current?.author || "—"}</span>
                            <span className="source">{current?.source ? `src: ${current.source}` : ""}</span>
                        </div>
                    </Styled.QuoteBlock>

                    <Styled.Actions>
                        <button onClick={saveCurrent} title="Save (S)">Save</button>
                        <button onClick={copyCurrent} className="ghost" title="Copy (C)">Copy</button>
                        <button onClick={shareCurrent} className="ghost">Share</button>
                    </Styled.Actions>

                    <Styled.FootNote>
                        <span className="muted">
                            Last fetched: {current?.fetchedAt ? timeLabel(new Date(current.fetchedAt)) : "—"}
                        </span>
                    </Styled.FootNote>
                </Styled.Card>

                {/* RIGHT: Favorites */}
                <Styled.Side>
                    <Styled.Card ref={printRef}>
                        <Styled.SideHeader>
                            <h3>Favorites <span className="count">{favs.length}</span></h3>
                            <div className="row">
                                <input
                                    type="text"
                                    placeholder="Search saved…"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                />
                                <div className="btns">
                                    <button className="ghost" onClick={exportJSON} disabled={!favs.length}>Export</button>
                                    <label className="ghost file">
                                        Import
                                        <input type="file" accept="application/json" onChange={onImportFile} />
                                    </label>
                                    <button className="danger" disabled={!favs.length} onClick={clearAll}>Clear</button>
                                </div>
                            </div>
                        </Styled.SideHeader>

                        <Styled.List>
                            {filteredFavs.length === 0 && (
                                <Styled.Empty>
                                    <p className="muted">No saved quotes yet. Save a few, then you can search, export, or clear.</p>
                                </Styled.Empty>
                            )}

                            {filteredFavs.map((q) => (
                                <li key={q.id}>
                                    <div className="content">
                                        <p className="text">“{q.text}”</p>
                                        <p className="meta">
                                            <span className="author">— {q.author || "Unknown"}</span>
                                            {q.source ? <span className="source"> · {q.source}</span> : null}
                                        </p>
                                    </div>
                                    <div className="itemBtns">
                                        <button className="ghost" onClick={() => {
                                            setCurrent({ ...q, fetchedAt: q.fetchedAt || new Date().toISOString() });
                                            toast?.info?.("Loaded to viewer");
                                        }}>Load</button>
                                        <button className="danger" onClick={() => removeOne(q.id)}>Remove</button>
                                    </div>
                                </li>
                            ))}
                        </Styled.List>
                    </Styled.Card>
                </Styled.Side>
            </Styled.Layout>

            {/* Confirm Modal */}
            {confirm && (
                <Styled.Modal role="dialog" aria-modal="true" onClick={close}>
                    <div className="box" onClick={(e) => e.stopPropagation()}>
                        <h4>{confirm.title || "Are you sure?"}</h4>
                        {confirm.message ? <p className="muted">{confirm.message}</p> : null}
                        <div className="row">
                            <button className="ghost" onClick={close}>Cancel</button>
                            <button
                                className={confirm.danger ? "danger" : ""}
                                onClick={() => (confirm.onConfirm?.(), null)}
                            >
                                {confirm.confirmText || "Confirm"}
                            </button>
                        </div>
                    </div>
                </Styled.Modal>
            )}
        </Styled.Wrapper>
    );
};

export default QuoteGenerator;

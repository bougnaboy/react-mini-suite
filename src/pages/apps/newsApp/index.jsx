import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/*
  This app supports simple client-side calls to news providers.
  Providers:
    - GNews: https://gnews.io/ (Free tier; requires API key; allows client calls)
    - NewsAPI: https://newsapi.org/ (Key required; note client usage/rate-limit/CORS)
  If a call fails (no key, rate-limit, CORS), the app falls back to demo articles.

  Everything persists locally:
    - Settings  -> localStorage.newsApp_settings_v1
    - Bookmarks -> localStorage.newsApp_bookmarks_v1
    - History   -> localStorage.newsApp_history_v1
    - Cache     -> localStorage.newsApp_cache_v1
*/

const SETTINGS_KEY = "newsApp_settings_v1";
const BOOKMARKS_KEY = "newsApp_bookmarks_v1";
const HISTORY_KEY = "newsApp_history_v1";
const CACHE_KEY = "newsApp_cache_v1";

/* Small category/country/lang preset */
const CATEGORIES = [
    "top", "technology", "business", "science", "entertainment", "sports", "health", "world", "nation",
];

const COUNTRIES = [
    { code: "in", label: "India" },
    { code: "us", label: "United States" },
    { code: "gb", label: "United Kingdom" },
    { code: "de", label: "Germany" },
    { code: "au", label: "Australia" },
];

const LANGS = [
    { code: "en", label: "English" },
    { code: "hi", label: "Hindi" },
    { code: "de", label: "German" },
    { code: "fr", label: "French" },
    { code: "es", label: "Spanish" },
];

/* Simple demo dataset (used when API is unavailable) */
const demoArticles = [
    {
        title: "Front-end Practice: Building a News App in React",
        description: "From API wiring to UX polish — pagination, filters, bookmarks, and modals.",
        url: "https://example.com/react-news-app",
        image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1200&auto=format&fit=crop",
        source: "Demo Feed",
        publishedAt: "2025-09-12T10:00:00Z",
    },
    {
        title: "JavaScript Performance Tips for Modern SPAs",
        description: "Practical guidance on network strategies and rendering patterns.",
        url: "https://example.com/js-performance",
        image: "https://images.unsplash.com/photo-1487014679447-9f8336841d58?q=80&w=1200&auto=format&fit=crop",
        source: "Demo Feed",
        publishedAt: "2025-09-10T16:20:00Z",
    },
    {
        title: "Styled Components: Design Systems That Stick",
        description: "Tokens, themes, and maintainability without wrestling the cascade.",
        url: "https://example.com/styled-components",
        image: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop",
        source: "Demo Feed",
        publishedAt: "2025-09-08T08:45:00Z",
    },
];

const initialSettings = {
    provider: "gnews",       // "gnews" | "newsapi"
    apiKey: "",              // user-supplied
    country: "in",
    lang: "en",
    category: "top",         // maps to provider endpoints (best-effort)
    query: "",
    pageSize: 12,
    useDemoIfNoKey: true,    // show demo data if key missing
};

function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}
function writeJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { } }

/* Provider adapters */
function buildGNewsURL({ apiKey, country, lang, category, query, page, pageSize }) {
    // Docs: https://gnews.io/docs/v4#tag/Top-headlines/operation/getTopHeadlines
    // top headlines
    const base = "https://gnews.io/api/v4/top-headlines";
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (lang) params.set("lang", lang);
    if (country) params.set("country", country);
    if (category && category !== "top") params.set("topic", category); // gnews topics: world, nation, business, technology, entertainment, sports, science, health
    params.set("max", String(pageSize || 12));
    params.set("page", String(page || 1));
    params.set("apikey", apiKey || "");
    return `${base}?${params.toString()}`;
}

function normalizeFromGNews(json) {
    // gnews shape: { totalArticles, articles: [{ title, description, url, image, source:{name}, publishedAt }, ...] }
    const items = (json?.articles || []).map((a) => ({
        title: a.title || "",
        description: a.description || "",
        url: a.url || "#",
        image: a.image || "",
        source: a.source?.name || "GNews",
        publishedAt: a.publishedAt || "",
    }));
    const total = json?.totalArticles || items.length;
    return { items, total };
}

function buildNewsAPIURL({ apiKey, country, lang, category, query, page, pageSize }) {
    // Docs: https://newsapi.org/docs/endpoints/top-headlines
    // Note: language filter in NewsAPI is separate; some combinations may ignore country.
    const base = "https://newsapi.org/v2/top-headlines";
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (country) params.set("country", country);
    if (category && category !== "top") params.set("category", category);
    if (lang) params.set("language", lang);
    params.set("page", String(page || 1));
    params.set("pageSize", String(pageSize || 12));
    params.set("apiKey", apiKey || "");
    return `${base}?${params.toString()}`;
}

function normalizeFromNewsAPI(json) {
    // newsapi shape: { totalResults, articles: [{ title, description, url, urlToImage, source:{name}, publishedAt }, ...] }
    const items = (json?.articles || []).map((a) => ({
        title: a.title || "",
        description: a.description || "",
        url: a.url || "#",
        image: a.urlToImage || "",
        source: a.source?.name || "NewsAPI",
        publishedAt: a.publishedAt || "",
    }));
    const total = json?.totalResults || items.length;
    return { items, total };
}

/* Tiny confirm dialog */
function useConfirm() {
    const [open, setOpen] = useState(false);
    const [cfg, setCfg] = useState({ title: "Confirm", message: "", onYes: null, yesLabel: "Yes", noLabel: "Cancel" });
    function ask(opts) { setCfg({ ...cfg, ...opts }); setOpen(true); }
    function close() { setOpen(false); }
    return { open, cfg, ask, close };
}

const NewsApp = () => {
    const [settings, setSettings] = useState(() => readJSON(SETTINGS_KEY, initialSettings));
    const [bookmarks, setBookmarks] = useState(() => readJSON(BOOKMARKS_KEY, []));
    const [history, setHistory] = useState(() => readJSON(HISTORY_KEY, []));
    const [articles, setArticles] = useState(() => readJSON(CACHE_KEY, { items: demoArticles, total: demoArticles.length }));
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const [showDemo, setShowDemo] = useState(!settings.apiKey && settings.useDemoIfNoKey);
    const [preview, setPreview] = useState(null); // article preview modal

    const { open, cfg, ask, close } = useConfirm();
    const mountedRef = useRef(false);
    const qDebounceRef = useRef(null);

    const canFetch = settings.apiKey?.trim().length > 0;
    const hasMore = articles.items.length < (articles.total || 0);

    useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

    /* persist settings/bookmarks/history/cache */
    useEffect(() => writeJSON(SETTINGS_KEY, settings), [settings]);
    useEffect(() => writeJSON(BOOKMARKS_KEY, bookmarks), [bookmarks]);
    useEffect(() => writeJSON(HISTORY_KEY, history), [history]);
    useEffect(() => writeJSON(CACHE_KEY, articles), [articles]);

    function onSettingsChange(field, value) {
        setSettings((s) => ({ ...s, [field]: value }));
        if (field === "query") {
            // debounce the query typing
            clearTimeout(qDebounceRef.current);
            qDebounceRef.current = setTimeout(() => {
                setPage(1);
                fetchArticles(1, { ...settings, query: value });
            }, 400);
            return;
        }
        if (["country", "lang", "category", "provider", "pageSize"].includes(field)) {
            setPage(1);
            fetchArticles(1, { ...settings, [field]: value });
        }
    }

    function formatISO(ts) {
        try {
            const d = new Date(ts);
            return new Intl.DateTimeFormat("en-IN", {
                month: "short", day: "2-digit", year: "numeric",
                hour: "2-digit", minute: "2-digit", hour12: false
            }).format(d);
        } catch { return ""; }
    }

    function addToHistory(entry) {
        const now = new Date().toISOString();
        const rec = { ...entry, at: now };
        setHistory((h) => {
            const next = [rec, ...h].slice(0, 20);
            return next;
        });
    }

    async function fetchArticles(nextPage = 1, nextSettings = settings) {
        const s = nextSettings || settings;
        setErrMsg("");
        setLoading(true);

        // If no key and demo is allowed, just show demo
        if (!s.apiKey?.trim() && s.useDemoIfNoKey) {
            const payload = { items: demoArticles, total: demoArticles.length };
            if (!mountedRef.current) return;
            setArticles(nextPage === 1 ? payload : { items: [...articles.items, ...payload.items], total: payload.total });
            setShowDemo(true);
            setLoading(false);
            return;
        }

        const payload = { items: [], total: 0 };
        try {
            let url = "";
            if (s.provider === "gnews") {
                url = buildGNewsURL({ apiKey: s.apiKey, country: s.country, lang: s.lang, category: s.category, query: s.query, page: nextPage, pageSize: s.pageSize });
            } else {
                url = buildNewsAPIURL({ apiKey: s.apiKey, country: s.country, lang: s.lang, category: s.category, query: s.query, page: nextPage, pageSize: s.pageSize });
            }

            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const json = await res.json();
            const normalized = s.provider === "gnews" ? normalizeFromGNews(json) : normalizeFromNewsAPI(json);
            payload.items = normalized.items;
            payload.total = normalized.total;

            // update state
            if (!mountedRef.current) return;
            setArticles((prev) => {
                if (nextPage === 1) return payload;
                return { items: [...prev.items, ...payload.items], total: payload.total };
            });
            setShowDemo(false);

            // record history if page 1
            if (nextPage === 1) {
                addToHistory({
                    provider: s.provider, country: s.country, lang: s.lang,
                    category: s.category, query: s.query || "",
                });
            }
        } catch (err) {
            if (!mountedRef.current) return;
            // fallback to demo on any network/api issues
            setErrMsg("Live fetch failed (key, CORS, or rate limit). Showing demo feed.");
            setArticles(nextPage === 1
                ? { items: demoArticles, total: demoArticles.length }
                : { items: [...articles.items, ...demoArticles], total: articles.items.length + demoArticles.length });
            setShowDemo(true);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }

    function toggleBookmark(article) {
        setBookmarks((b) => {
            const exists = b.some((x) => x.url === article.url);
            if (exists) {
                return b.filter((x) => x.url !== article.url);
            }
            return [{ ...article, savedAt: new Date().toISOString() }, ...b].slice(0, 200);
        });
    }

    function isBookmarked(url) {
        return bookmarks.some((x) => x.url === url);
    }

    function confirmClearBookmarks() {
        ask({
            title: "Clear Bookmarks",
            message: "Remove all saved articles?",
            yesLabel: "Clear",
            onYes: () => setBookmarks([]),
        });
    }

    function confirmRemoveBookmark(url) {
        ask({
            title: "Remove Bookmark",
            message: "Delete this saved article?",
            yesLabel: "Remove",
            onYes: () => setBookmarks((b) => b.filter((x) => x.url !== url)),
        });
    }

    function confirmClearHistory() {
        ask({
            title: "Clear History",
            message: "Erase recent fetch history?",
            yesLabel: "Clear",
            onYes: () => setHistory([]),
        });
    }

    function confirmResetSettings() {
        ask({
            title: "Reset Settings",
            message: "Restore defaults and keep demo on if key is missing?",
            yesLabel: "Reset",
            onYes: () => { setSettings(initialSettings); setPage(1); fetchArticles(1, initialSettings); },
        });
    }

    function confirmClearCache() {
        ask({
            title: "Clear Cache",
            message: "Clear cached articles?",
            yesLabel: "Clear",
            onYes: () => { writeJSON(CACHE_KEY, null); setArticles({ items: [], total: 0 }); },
        });
    }

    function onSubmitSettings(e) {
        e.preventDefault();
        setPage(1);
        fetchArticles(1, settings);
    }

    useEffect(() => {
        // initial fetch on mount
        fetchArticles(1, settings);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const heading = useMemo(() => {
        const p = settings.provider === "gnews" ? "GNews" : "NewsAPI";
        const cat = settings.category === "top" ? "Top" : settings.category;
        return `${cat} • ${settings.country.toUpperCase()} • ${p}`;
    }, [settings]);

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div className="titles">
                    <h1>News App using React</h1>
                    <p>Fetch latest headlines by interests. Client-only, with demo fallback and local bookmarks.</p>
                </div>
                <div className="actions">
                    <button type="button" onClick={confirmResetSettings} className="ghost">Reset</button>
                    <button type="button" onClick={confirmClearCache} className="ghost">Clear Cache</button>
                </div>
            </Styled.Header>

            {/* SETTINGS BAR */}
            <Styled.Settings as="form" onSubmit={onSubmitSettings}>
                <div className="row">
                    <div className="field">
                        <label htmlFor="provider">Provider</label>
                        <select
                            id="provider"
                            value={settings.provider}
                            onChange={(e) => onSettingsChange("provider", e.target.value)}
                        >
                            <option value="gnews">GNews</option>
                            <option value="newsapi">NewsAPI</option>
                        </select>
                    </div>

                    <div className="field">
                        <label htmlFor="apiKey">API Key</label>
                        <input
                            id="apiKey"
                            type="password"
                            placeholder="Enter API key"
                            value={settings.apiKey}
                            onChange={(e) => onSettingsChange("apiKey", e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="country">Country</label>
                        <select
                            id="country"
                            value={settings.country}
                            onChange={(e) => onSettingsChange("country", e.target.value)}
                        >
                            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                        </select>
                    </div>

                    <div className="field">
                        <label htmlFor="lang">Language</label>
                        <select
                            id="lang"
                            value={settings.lang}
                            onChange={(e) => onSettingsChange("lang", e.target.value)}
                        >
                            {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                        </select>
                    </div>

                    <div className="field">
                        <label htmlFor="pageSize">Page Size</label>
                        <select
                            id="pageSize"
                            value={settings.pageSize}
                            onChange={(e) => onSettingsChange("pageSize", Number(e.target.value))}
                        >
                            {[6, 12, 18, 24].map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                </div>

                <div className="row">
                    <div className="chips" aria-label="Categories">
                        {CATEGORIES.map((c) => {
                            const active = c === settings.category;
                            return (
                                <button
                                    type="button"
                                    key={c}
                                    className={`chip ${active ? "active" : ""}`}
                                    onClick={() => onSettingsChange("category", c)}
                                    title={c}
                                >
                                    {c}
                                </button>
                            );
                        })}
                    </div>

                    <div className="searchWrap">
                        <input
                            type="search"
                            placeholder="Search keywords…"
                            value={settings.query}
                            onChange={(e) => onSettingsChange("query", e.target.value)}
                        />
                        <button type="submit">Go</button>
                    </div>
                </div>

                <div className="row rowSmall">
                    <label className="checkbox">
                        <input
                            type="checkbox"
                            checked={settings.useDemoIfNoKey}
                            onChange={(e) => onSettingsChange("useDemoIfNoKey", e.target.checked)}
                        />
                        <span>Use demo data if API key is missing</span>
                    </label>
                </div>
            </Styled.Settings>

            {/* STATUS */}
            <Styled.StatusBar>
                <div className="left">
                    <strong>{heading}</strong>
                    <span className="meta">
                        {loading ? "Loading…" : `${articles.items.length} of ${articles.total || articles.items.length}`}
                        {showDemo ? " • Demo" : ""}
                    </span>
                    {errMsg && <span className="err">{errMsg}</span>}
                </div>
                <div className="right">
                    <button type="button" className="ghost" onClick={confirmClearHistory} title="Clear history">Clear History</button>
                    <button type="button" className="ghost" onClick={confirmClearBookmarks} title="Clear bookmarks">Clear Bookmarks</button>
                </div>
            </Styled.StatusBar>

            {/* GRID */}
            <Styled.Grid>
                {articles.items.map((a) => (
                    <article key={a.url} className="card">
                        <button className="thumb" onClick={() => setPreview(a)} title="Preview">
                            {a.image ? (
                                <img src={a.image} alt={a.title || "image"} loading="lazy" />
                            ) : (
                                <div className="noimg">No Image</div>
                            )}
                        </button>

                        <div className="body">
                            <h3 title={a.title}>{a.title}</h3>
                            {a.description && <p className="desc">{a.description}</p>}
                            <div className="meta">
                                <span className="src">{a.source || "Source"}</span>
                                <span className="dot">•</span>
                                <span className="time">{formatISO(a.publishedAt)}</span>
                            </div>
                        </div>

                        <div className="actions">
                            <a href={a.url} target="_blank" rel="noreferrer" className="ghost">Open</a>
                            <button
                                type="button"
                                className={isBookmarked(a.url) ? "primary" : ""}
                                onClick={() => toggleBookmark(a)}
                                title={isBookmarked(a.url) ? "Bookmarked" : "Save"}
                            >
                                {isBookmarked(a.url) ? "Saved" : "Save"}
                            </button>
                        </div>
                    </article>
                ))}
            </Styled.Grid>

            {/* LOAD MORE */}
            <Styled.FooterBar>
                {hasMore && (
                    <button
                        disabled={loading}
                        onClick={() => { const next = page + 1; setPage(next); fetchArticles(next); }}
                        className="loadMore"
                    >
                        {loading ? "Loading…" : "Load More"}
                    </button>
                )}
            </Styled.FooterBar>

            {/* BOOKMARKS + HISTORY SIDE SECTION */}
            <Styled.SideWrap>
                <Styled.Panel>
                    <h4>Bookmarks ({bookmarks.length})</h4>
                    <ul className="list">
                        {bookmarks.map((b) => (
                            <li key={b.url}>
                                <a href={b.url} target="_blank" rel="noreferrer">{b.title}</a>
                                <div className="row">
                                    <span className="src">{b.source}</span>
                                    <button className="danger" onClick={() => confirmRemoveBookmark(b.url)}>Remove</button>
                                </div>
                            </li>
                        ))}
                        {bookmarks.length === 0 && <li className="muted">No bookmarks yet</li>}
                    </ul>
                </Styled.Panel>

                <Styled.Panel>
                    <h4>Recent</h4>
                    <ul className="list">
                        {history.map((h, i) => (
                            <li key={i}>
                                <span className="muted">
                                    {h.provider} • {h.country.toUpperCase()} • {h.category}{h.query ? ` • "${h.query}"` : ""}
                                </span>
                                <div className="row">
                                    <span className="src">{new Date(h.at).toLocaleString()}</span>
                                </div>
                            </li>
                        ))}
                        {history.length === 0 && <li className="muted">No history yet</li>}
                    </ul>
                </Styled.Panel>
            </Styled.SideWrap>

            {/* PREVIEW MODAL */}
            {preview && (
                <Styled.ModalBackdrop onClick={() => setPreview(null)} role="dialog" aria-modal="true">
                    <Styled.ModalCard onClick={(e) => e.stopPropagation()}>
                        <div className="head">
                            <h3>{preview.title}</h3>
                            <button className="ghost" onClick={() => setPreview(null)}>Close</button>
                        </div>
                        <div className="content">
                            {preview.image ? (
                                <img src={preview.image} alt="" />
                            ) : (
                                <div className="noimg">No Image</div>
                            )}
                            {preview.description && <p className="desc">{preview.description}</p>}
                            <div className="metaLine">
                                <span>{preview.source || "Source"}</span>
                                <span className="dot">•</span>
                                <span>{new Date(preview.publishedAt).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="foot">
                            <a className="ghost" href={preview.url} target="_blank" rel="noreferrer">Open Source</a>
                            <button
                                onClick={() => {
                                    navigator.clipboard?.writeText(preview.url || "");
                                }}
                            >
                                Copy Link
                            </button>
                            <button
                                className={isBookmarked(preview.url) ? "primary" : ""}
                                onClick={() => toggleBookmark(preview)}
                            >
                                {isBookmarked(preview.url) ? "Saved" : "Save"}
                            </button>
                        </div>
                    </Styled.ModalCard>
                </Styled.ModalBackdrop>
            )}

            {/* CONFIRM MODAL (clear/remove actions) */}
            {open && (
                <Styled.ModalBackdrop onClick={close} role="alertdialog" aria-modal="true">
                    <Styled.ModalCard onClick={(e) => e.stopPropagation()}>
                        <div className="head">
                            <h3>{cfg.title}</h3>
                        </div>
                        <div className="content">
                            <p>{cfg.message}</p>
                        </div>
                        <div className="foot">
                            <button className="ghost" onClick={close}>{cfg.noLabel || "Cancel"}</button>
                            <button
                                className="danger"
                                onClick={() => { cfg.onYes?.(); close(); }}
                            >
                                {cfg.yesLabel || "Yes"}
                            </button>
                        </div>
                    </Styled.ModalCard>
                </Styled.ModalBackdrop>
            )}
        </Styled.Wrapper>
    );
};

export default NewsApp;

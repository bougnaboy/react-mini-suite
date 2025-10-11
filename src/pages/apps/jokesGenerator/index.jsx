import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/* =========================================================
   Local settings + storage keys
   ========================================================= */
const SETTINGS_KEY = "jokesGen_settings_v1";
const HISTORY_KEY = "jokesGen_history_v1";
const FAVES_KEY = "jokesGen_faves_v1";
const MAX_HISTORY = 100;

/* Categories supported by JokeAPI */
const CATEGORIES = [
    { key: "Programming", label: "Programming" },
    { key: "Misc", label: "Misc" },
    { key: "Pun", label: "Pun" },
    { key: "Spooky", label: "Spooky" },
    { key: "Christmas", label: "Christmas" },
    { key: "Dark", label: "Dark" }, // gated by allowDark + safeMode
];

/* Soft profanity mask (fallback) */
const BAD_WORDS = ["damn", "hell", "crap"];
function softClean(s = "") {
    let out = String(s);
    BAD_WORDS.forEach((w) => {
        const r = new RegExp(`\\b${w}\\b`, "ig");
        out = out.replace(r, w[0] + "★".repeat(Math.max(0, w.length - 1)));
    });
    return out;
}

/* IST label: "Sep 20, 2025 HH:MM:SS hrs" */
function formatISTLabel(date) {
    const d = typeof date === "string" ? new Date(date) : date;
    const parts = new Intl.DateTimeFormat("en-US", {
        month: "short", day: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false, timeZone: "Asia/Kolkata",
    }).formatToParts(d);
    const get = (t) => parts.find((p) => p.type === t)?.value || "";
    return `${get("month")} ${get("day")}, ${get("year")} ${get("hour")}:${get("minute")}:${get("second")} hrs`;
}

/* Safe JSON */
function readJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; } }
function writeJSON(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { } }

/* Local fallback jokes */
const FALLBACK_JOKES = [
    { category: "Programming", type: "single", joke: "Why do programmers prefer dark mode? Because light attracts bugs." },
    { category: "Pun", type: "twopart", setup: "I would tell you a UDP joke", delivery: "…but you might not get it." },
    { category: "Misc", type: "single", joke: "Parallel lines have so much in common. It’s a shame they’ll never meet." },
    { category: "Programming", type: "twopart", setup: "How many programmers does it take to change a light bulb?", delivery: "None. That’s a hardware problem." },
    { category: "Spooky", type: "single", joke: "Skeletons are so chill—nothing gets under their skin." },
    { category: "Christmas", type: "twopart", setup: "What do you call an elf who sings?", delivery: "A wrapper." },
];

function toJokeRecord(src) {
    const id = src.id ?? crypto.randomUUID();
    const category = src.category || "General";
    const type = src.type || (src.setup && src.delivery ? "twopart" : "single");
    const blacklistFlags = src.blacklistFlags || {};
    const time = new Date().toISOString();

    if (type === "twopart") {
        return {
            id, category, type,
            setup: softClean(src.setup || ""),
            delivery: softClean(src.delivery || ""),
            text: `${softClean(src.setup || "")} — ${softClean(src.delivery || "")}`,
            blacklistFlags, time,
        };
    }
    return {
        id, category, type: "single",
        joke: softClean(src.joke || src.delivery || src.setup || ""),
        text: softClean(src.joke || src.delivery || src.setup || ""),
        blacklistFlags, time,
    };
}

function buildJokeApiURL({ categories, safeMode, allowDark, onlySingle, onlyTwoPart }) {
    const selected = categories.length ? categories : ["Programming", "Misc", "Pun", "Spooky", "Christmas"];
    const filtered = allowDark ? selected : selected.filter((c) => c !== "Dark");
    const catStr = filtered.length ? filtered.join(",") : "Any";

    let type = "";
    if (onlySingle && !onlyTwoPart) type = "&type=single";
    if (onlyTwoPart && !onlySingle) type = "&type=twopart";

    const safeParam = safeMode ? "&safe-mode" : "&blacklistFlags=nsfw,religious,racist,sexist,explicit";
    return `https://v2.jokeapi.dev/joke/${encodeURIComponent(catStr)}?idRange=0-300&amount=1${type}${safeParam}`;
}

async function fetchOfficialJoke() {
    const r = await fetch("https://official-joke-api.appspot.com/random_joke", { cache: "no-store" });
    if (!r.ok) throw new Error("Official Joke API failed");
    const j = await r.json();
    return toJokeRecord({ category: "Misc", type: "twopart", setup: j.setup, delivery: j.punchline });
}

async function fetchOneJoke(options) {
    try {
        const url = buildJokeApiURL(options);
        const r = await fetch(url, { cache: "no-store" });
        if (r.ok) {
            const j = await r.json();
            if (j && j.error === false) return toJokeRecord(j);
        }
    } catch { }
    try { return await fetchOfficialJoke(); } catch { }
    return toJokeRecord(FALLBACK_JOKES[Math.floor(Math.random() * FALLBACK_JOKES.length)]);
}

/* =========================================================
   Component
   ========================================================= */
const JokesGenerator = () => {
    /* Settings */
    const defaultSettings = { safeMode: true, allowDark: false, onlySingle: false, onlyTwoPart: false, categories: ["Programming", "Misc", "Pun"] };
    const init = readJSON(SETTINGS_KEY, defaultSettings);

    const [safeMode, setSafeMode] = useState(init.safeMode);
    const [allowDark, setAllowDark] = useState(init.allowDark);
    const [onlySingle, setOnlySingle] = useState(init.onlySingle);
    const [onlyTwoPart, setOnlyTwoPart] = useState(init.onlyTwoPart);
    const [categories, setCategories] = useState(init.categories);

    const [count, setCount] = useState(1);
    const [loading, setLoading] = useState(false);
    const [current, setCurrent] = useState([]);
    const [history, setHistory] = useState(() => readJSON(HISTORY_KEY, []));
    const [faves, setFaves] = useState(() => readJSON(FAVES_KEY, []));
    const [q, setQ] = useState("");

    const searchRef = useRef(null);

    /* Confirm modal state */
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmKind, setConfirmKind] = useState(null); // 'clear-history' | 'remove-fav'
    const [confirmPayload, setConfirmPayload] = useState(null);

    const openConfirmClearHistory = () => { setConfirmKind("clear-history"); setConfirmPayload(null); setConfirmOpen(true); };
    const openConfirmRemoveFav = (item) => { setConfirmKind("remove-fav"); setConfirmPayload(item); setConfirmOpen(true); };
    const closeConfirm = () => { setConfirmOpen(false); setConfirmKind(null); setConfirmPayload(null); };

    const onConfirm = () => {
        if (confirmKind === "clear-history") {
            setHistory([]);
            writeJSON(HISTORY_KEY, []);
        } else if (confirmKind === "remove-fav" && confirmPayload) {
            setFaves((prev) => {
                const next = prev.filter((j) => j.text !== confirmPayload.text);
                writeJSON(FAVES_KEY, next);
                return next;
            });
        }
        closeConfirm();
    };

    /* Persist settings */
    useEffect(() => {
        writeJSON(SETTINGS_KEY, { safeMode, allowDark, onlySingle, onlyTwoPart, categories });
    }, [safeMode, allowDark, onlySingle, onlyTwoPart, categories]);

    /* Shortcuts */
    useEffect(() => {
        const onKey = (e) => {
            if (confirmOpen) {
                if (e.key === "Escape") { e.preventDefault(); closeConfirm(); }
                return;
            }
            if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
                e.preventDefault(); handleGenerate();
            }
            if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
                e.preventDefault(); searchRef.current?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [confirmOpen, safeMode, allowDark, onlySingle, onlyTwoPart, categories, count]);

    const handleGenerate = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const opts = { safeMode, allowDark, onlySingle, onlyTwoPart, categories };
            const list = [];
            for (let i = 0; i < Math.max(1, Math.min(10, Number(count) || 1)); i++) {
                // eslint-disable-next-line no-await-in-loop
                const jk = await fetchOneJoke(opts);
                list.push(jk);
            }
            setCurrent(list);
            setHistory((prev) => {
                const existing = new Set(prev.map((j) => j.text));
                const merged = [...list.filter((j) => !existing.has(j.text)), ...prev];
                const trimmed = merged.slice(0, MAX_HISTORY);
                writeJSON(HISTORY_KEY, trimmed);
                return trimmed;
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleFav = (joke) => {
        setFaves((prev) => {
            const exists = prev.find((j) => j.text === joke.text);
            let next;
            if (exists) next = prev.filter((j) => j.text !== joke.text);
            else next = [{ ...joke }, ...prev].slice(0, 200);
            writeJSON(FAVES_KEY, next);
            return next;
        });
    };

    const copyText = async (text) => { try { await navigator.clipboard.writeText(text); } catch { } };
    const shareText = async (text) => { try { if (navigator.share) await navigator.share({ text }); else await navigator.clipboard.writeText(text); } catch { } };
    const printText = (text) => {
        const w = window.open("", "_blank", "noopener,noreferrer,width=680,height=840");
        if (!w) return;
        w.document.write(`
      <html><head><title>Print Joke</title>
      <style>
        body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 24px; }
        .j { font-size: 18px; line-height: 1.5; white-space: pre-wrap; }
        .m { color: #666; margin-top: 6px; font-size: 13px; }
      </style>
      </head><body>
        <div class="j">${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
        <div class="m">${formatISTLabel(new Date())}</div>
        <script>window.onload = () => setTimeout(() => window.print(), 300)</script>
      </body></html>
    `);
        w.document.close();
    };

    const filteredHistory = useMemo(() => {
        const t = q.trim().toLowerCase();
        if (!t) return history;
        return history.filter((h) => h.text.toLowerCase().includes(t) || h.category.toLowerCase().includes(t));
    }, [q, history]);

    const isFav = (j) => faves.some((f) => f.text === j.text);

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div>
                    <h1>Jokes Generator</h1>
                    <p>Clean, safe-mode by default. Save favorites, search history, copy, share, and print—fully client-side.</p>
                </div>
                <Styled.Badges>
                    <span className="badge">Safe Mode</span>
                    <span className="badge">Local Cache</span>
                    <span className="badge">Keyboard: g /</span>
                </Styled.Badges>
            </Styled.Header>

            <Styled.Layout>
                {/* LEFT: Controls + Current jokes */}
                <Styled.Card>
                    <Styled.Section>
                        <Styled.SectionTitle>Controls</Styled.SectionTitle>

                        <Styled.Grid cols="3">
                            <Styled.Field>
                                <label>Quantity</label>
                                <select value={count} onChange={(e) => setCount(e.target.value)}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </Styled.Field>

                            <Styled.Field>
                                <label>Mode</label>
                                <div className="inline">
                                    <label className="checkbox">
                                        <input type="checkbox" checked={safeMode} onChange={(e) => setSafeMode(e.target.checked)} />
                                        <span>Safe Mode</span>
                                    </label>
                                    <label className="checkbox">
                                        <input type="checkbox" checked={allowDark} onChange={(e) => setAllowDark(e.target.checked)} />
                                        <span>Allow “Dark”</span>
                                    </label>
                                </div>
                            </Styled.Field>

                            <Styled.Field>
                                <label>Type Filter</label>
                                <div className="inline">
                                    <label className="checkbox">
                                        <input type="checkbox" checked={onlySingle} onChange={(e) => { setOnlySingle(e.target.checked); if (e.target.checked) setOnlyTwoPart(false); }} />
                                        <span>Single</span>
                                    </label>
                                    <label className="checkbox">
                                        <input type="checkbox" checked={onlyTwoPart} onChange={(e) => { setOnlyTwoPart(e.target.checked); if (e.target.checked) setOnlySingle(false); }} />
                                        <span>Two-part</span>
                                    </label>
                                </div>
                            </Styled.Field>
                        </Styled.Grid>

                        <Styled.Field className="span2">
                            <label>Categories</label>
                            <Styled.Chips>
                                {CATEGORIES.map((c) => {
                                    const active = categories.includes(c.key);
                                    const disabled = c.key === "Dark" && safeMode && !allowDark;
                                    return (
                                        <label key={c.key} className={`chip ${active ? "active" : ""} ${disabled ? "disabled" : ""}`}>
                                            <input
                                                type="checkbox"
                                                disabled={disabled}
                                                checked={active}
                                                onChange={() => {
                                                    setCategories((prev) => {
                                                        const set = new Set(prev);
                                                        if (set.has(c.key)) set.delete(c.key);
                                                        else set.add(c.key);
                                                        return Array.from(set);
                                                    });
                                                }}
                                            />
                                            <span>{c.label}</span>
                                        </label>
                                    );
                                })}
                            </Styled.Chips>
                        </Styled.Field>

                        <Styled.Actions>
                            <button type="button" onClick={handleGenerate} disabled={loading}>
                                {loading ? "Generating…" : "Generate (g)"}
                            </button>
                        </Styled.Actions>
                    </Styled.Section>

                    <Styled.Section>
                        <Styled.SectionTitle>Current</Styled.SectionTitle>
                        {current.length === 0 && <Styled.Help>No jokes yet. Press Generate.</Styled.Help>}
                        <Styled.Jokes>
                            {current.map((j) => (
                                <Styled.JokeCard key={j.id}>
                                    <div className="meta">
                                        <span className={`pill ${j.category.toLowerCase()}`}>{j.category}</span>
                                        <span className="time">{formatISTLabel(j.time)}</span>
                                    </div>

                                    {j.type === "twopart" ? (
                                        <div className="content">
                                            <div className="setup">{j.setup}</div>
                                            <div className="delivery">— {j.delivery}</div>
                                        </div>
                                    ) : (
                                        <div className="content single">{j.text}</div>
                                    )}

                                    <div className="actions">
                                        <button type="button" className="ghost" onClick={() => copyText(j.text)}>Copy</button>
                                        <button type="button" className="ghost" onClick={() => shareText(j.text)}>Share</button>
                                        <button type="button" className="ghost" onClick={() => printText(j.text)}>Print</button>
                                        <button type="button" onClick={() => toggleFav(j)} aria-pressed={isFav(j)}>
                                            {isFav(j) ? "★ Saved" : "☆ Save"}
                                        </button>
                                    </div>
                                </Styled.JokeCard>
                            ))}
                        </Styled.Jokes>
                    </Styled.Section>
                </Styled.Card>

                {/* RIGHT: History + Favorites */}
                <Styled.Side>
                    <Styled.Card>
                        <Styled.SectionTitle>History</Styled.SectionTitle>
                        <Styled.Field>
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Search history… (/)"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                        </Styled.Field>
                        <Styled.List>
                            {filteredHistory.length === 0 && <li className="muted">No matches.</li>}
                            {filteredHistory.slice(0, 30).map((h) => (
                                <li key={`${h.id}-${h.time}`}>
                                    <span className="cat">{h.category}</span>
                                    <span className="txt" title={h.text}>{h.text}</span>
                                    <div className="row-actions">
                                        <button className="sm ghost" onClick={() => copyText(h.text)}>Copy</button>
                                        <button className="sm ghost" onClick={() => toggleFav(h)} aria-pressed={isFav(h)}>
                                            {isFav(h) ? "★" : "☆"}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </Styled.List>
                        <Styled.Actions>
                            <button type="button" className="ghost" onClick={openConfirmClearHistory}>
                                Clear History
                            </button>
                        </Styled.Actions>
                    </Styled.Card>

                    <Styled.Card>
                        <Styled.SectionTitle>Favorites ({faves.length})</Styled.SectionTitle>
                        <Styled.List>
                            {faves.length === 0 && <li className="muted">None saved yet.</li>}
                            {faves.slice(0, 30).map((f) => (
                                <li key={`${f.id}-f`}>
                                    <span className="cat">{f.category}</span>
                                    <span className="txt" title={f.text}>{f.text}</span>
                                    <div className="row-actions">
                                        <button className="sm ghost" onClick={() => copyText(f.text)}>Copy</button>
                                        <button className="sm danger" onClick={() => openConfirmRemoveFav(f)}>Remove</button>
                                    </div>
                                </li>
                            ))}
                        </Styled.List>
                        <Styled.Actions>
                            <button
                                type="button"
                                className="ghost"
                                onClick={() => {
                                    const data = JSON.stringify(faves, null, 2);
                                    const blob = new Blob([data], { type: "application/json" });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url; a.download = "jokes-favorites.json"; a.click();
                                    URL.revokeObjectURL(url);
                                }}
                            >
                                Export JSON
                            </button>
                        </Styled.Actions>
                    </Styled.Card>
                </Styled.Side>
            </Styled.Layout>

            {/* Confirm Modal */}
            {confirmOpen && (
                <Styled.ModalOverlay onClick={closeConfirm} aria-modal="true" role="dialog">
                    <Styled.ModalCard onClick={(e) => e.stopPropagation()} tabIndex={-1}>
                        <h3>Confirm</h3>
                        <p className="msg">
                            {confirmKind === "clear-history" && "Clear all jokes from history? This cannot be undone."}
                            {confirmKind === "remove-fav" && "Remove this joke from favorites?"}
                        </p>
                        <Styled.ModalActions>
                            <button type="button" className="ghost" onClick={closeConfirm}>Cancel</button>
                            <button type="button" className="danger" onClick={onConfirm}>Yes, Confirm</button>
                        </Styled.ModalActions>
                    </Styled.ModalCard>
                </Styled.ModalOverlay>
            )}
        </Styled.Wrapper>
    );
};

export default JokesGenerator;

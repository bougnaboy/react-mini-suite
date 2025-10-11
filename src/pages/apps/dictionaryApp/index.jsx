import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/* =========================================================
   Local constants
   ========================================================= */
const API_BASE = "https://api.dictionaryapi.dev/api/v2/entries";
const LANG = "en";
const LSK = {
    HISTORY: "dictionaryApp_history_v1",
    FAVS: "dictionaryApp_favs_v1",
};
const HISTORY_LIMIT = 50;

/* small helper */
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/* normalize API response (Free Dictionary API) to a stable shape */
function normalizeEntries(json) {
    const entries = Array.isArray(json) ? json : [];
    const items = [];
    for (const e of entries) {
        const phonetics = (e.phonetics || []).map((p) => ({
            text: p.text || "",
            audio: p.audio || "",
        }));
        const meanings = (e.meanings || []).map((m) => ({
            partOfSpeech: m.partOfSpeech || "",
            definitions: (m.definitions || []).map((d) => ({
                definition: d.definition || "",
                example: d.example || "",
                synonyms: d.synonyms || [],
                antonyms: d.antonyms || [],
            })),
        }));
        const sourceUrls = e.sourceUrls || [];
        items.push({
            word: e.word || "",
            phonetics,
            meanings,
            sourceUrls,
        });
    }
    return items;
}

/* =========================================================
   Confirm Modal (self-contained to this page)
   ========================================================= */
function ConfirmModal({ open, title, message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onClose }) {
    if (!open) return null;
    return (
        <Styled.ModalBackdrop role="dialog" aria-modal="true">
            <Styled.ModalCard>
                <h3>{title}</h3>
                <p className="muted">{message}</p>
                <Styled.ModalActions>
                    <button className="ghost" onClick={onClose}>{cancelText}</button>
                    <button onClick={onConfirm}>{confirmText}</button>
                </Styled.ModalActions>
            </Styled.ModalCard>
        </Styled.ModalBackdrop>
    );
}

/* =========================================================
   Main component
   ========================================================= */
const DictionaryApp = () => {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [entries, setEntries] = useState([]);      // normalized list (combined)
    const [error, setError] = useState("");

    const [history, setHistory] = useState(() => {
        try { return JSON.parse(localStorage.getItem(LSK.HISTORY) || "[]"); } catch { return []; }
    });
    const [favs, setFavs] = useState(() => {
        try { return JSON.parse(localStorage.getItem(LSK.FAVS) || "[]"); } catch { return []; }
    });

    const [modal, setModal] = useState({ open: false, type: null, payload: null });
    const controllerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    useEffect(() => {
        try { localStorage.setItem(LSK.HISTORY, JSON.stringify(history)); } catch { }
    }, [history]);

    useEffect(() => {
        try { localStorage.setItem(LSK.FAVS, JSON.stringify(favs)); } catch { }
    }, [favs]);

    const currentWord = entries[0]?.word || "";
    const isFav = useMemo(() => favs.includes(currentWord.toLowerCase()), [favs, currentWord]);

    const fetchWord = async (word) => {
        const w = String(word || "").trim();
        if (!w) return;

        setLoading(true);
        setError("");
        setEntries([]);

        // abort previous in-flight request
        controllerRef.current?.abort?.();
        const ctl = new AbortController();
        controllerRef.current = ctl;

        try {
            const res = await fetch(`${API_BASE}/${LANG}/${encodeURIComponent(w)}`, { signal: ctl.signal });
            const data = await res.json();

            if (!res.ok) {
                const msg = data && (data.message || data.title) ? `${data.title || "Error"}: ${data.message || ""}` : "Word not found.";
                setError(msg);
                setEntries([]);
            } else {
                const items = normalizeEntries(data);
                if (!items.length) {
                    setError("No definitions found.");
                    setEntries([]);
                } else {
                    // merge all entries into one result-like list (keep order)
                    setEntries(items);

                    // update history: unique + most-recent-first
                    setHistory((prev) => {
                        const set = new Set([w.toLowerCase(), ...prev]);
                        const merged = Array.from(set).slice(0, HISTORY_LIMIT);
                        return merged;
                    });
                }
            }
        } catch (e) {
            if (e.name !== "AbortError") {
                setError("Network error. Try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const onSearch = () => fetchWord(query);
    const onKeyDown = (e) => {
        if (e.key === "Enter") onSearch();
    };

    const clearQuery = () => setQuery("");

    /* ===== Favorites ===== */
    const toggleFav = () => {
        const w = currentWord.toLowerCase();
        if (!w) return;
        setFavs((prev) => {
            if (prev.includes(w)) return prev.filter((x) => x !== w);
            return [w, ...prev].slice(0, 200);
        });
    };

    const confirmRemoveFav = (word) => {
        setModal({
            open: true,
            type: "removeFav",
            payload: String(word || "").toLowerCase(),
            title: "Remove Favorite?",
            message: `This will remove "${word}" from your favorites.`,
            confirmText: "Remove",
        });
    };

    const confirmClearFavs = () => {
        setModal({
            open: true,
            type: "clearFavs",
            payload: null,
            title: "Clear All Favorites?",
            message: "This will remove all saved favorite words.",
            confirmText: "Clear All",
        });
    };

    /* ===== History ===== */
    const confirmRemoveHistoryItem = (word) => {
        setModal({
            open: true,
            type: "removeHistoryItem",
            payload: String(word || "").toLowerCase(),
            title: "Delete from History?",
            message: `Remove "${word}" from your search history?`,
            confirmText: "Delete",
        });
    };

    const confirmClearHistory = () => {
        setModal({
            open: true,
            type: "clearHistory",
            payload: null,
            title: "Clear Search History?",
            message: "This will remove all previously searched words.",
            confirmText: "Clear All",
        });
    };

    const closeModal = () => setModal({ open: false, type: null, payload: null });

    const doModalAction = () => {
        if (modal.type === "removeFav") {
            setFavs((prev) => prev.filter((w) => w !== modal.payload));
        }
        if (modal.type === "clearFavs") {
            setFavs([]);
        }
        if (modal.type === "removeHistoryItem") {
            setHistory((prev) => prev.filter((w) => w !== modal.payload));
        }
        if (modal.type === "clearHistory") {
            setHistory([]);
        }
        closeModal();
    };

    /* audio */
    const playAudio = (url) => {
        if (!url) return;
        try {
            const a = new Audio(url);
            a.play().catch(() => { });
        } catch { }
    };

    /* small helpers for UI */
    const firstEntry = entries[0];
    const combinedMeanings = useMemo(() => {
        // flatten all meanings for all entries to show in one page
        const list = [];
        for (const e of entries) {
            for (const m of e.meanings) list.push(m);
        }
        return list;
    }, [entries]);

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div>
                    <h1>Dictionary Application</h1>
                    <p className="muted">Use this dictionary to search the meaning of any English word. Learn API fetching patterns in React.</p>
                </div>
            </Styled.Header>

            <Styled.Layout>
                {/* LEFT: main content */}
                <Styled.Column>
                    <Styled.Card>
                        <Styled.SearchRow>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search a word…"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={onKeyDown}
                                aria-label="Search word"
                            />
                            {query && (
                                <button className="ghost" onClick={clearQuery} title="Clear query">Clear</button>
                            )}
                            <button onClick={onSearch} title="Search">Search</button>
                        </Styled.SearchRow>

                        {loading && (
                            <Styled.Loading>
                                <Styled.Spinner />
                                <span>Fetching definitions…</span>
                            </Styled.Loading>
                        )}

                        {!loading && error && (
                            <Styled.Error role="alert">{error}</Styled.Error>
                        )}

                        {!loading && !error && firstEntry && (
                            <>
                                <Styled.ResultHeader>
                                    <div>
                                        <h2 className="word">{firstEntry.word}</h2>
                                        <div className="phonetics">
                                            {firstEntry.phonetics?.filter(p => p.text).slice(0, 3).map((p, i) => (
                                                <span key={i} className="phonetic">{p.text}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="actions">
                                        <button onClick={toggleFav}>
                                            {isFav ? "★ Saved" : "☆ Save"}
                                        </button>
                                        {/* Play first available audio */}
                                        {firstEntry.phonetics?.find(p => p.audio)?.audio && (
                                            <button
                                                className="ghost"
                                                onClick={() => playAudio(firstEntry.phonetics.find(p => p.audio).audio)}
                                            >
                                                ▶︎ Pronounce
                                            </button>
                                        )}
                                    </div>
                                </Styled.ResultHeader>

                                <Styled.Definitions>
                                    {combinedMeanings.map((m, i) => (
                                        <div className="pos-block" key={i}>
                                            <div className="pos">{m.partOfSpeech || "—"}</div>
                                            <ol className="defs">
                                                {m.definitions.map((d, j) => (
                                                    <li key={j}>
                                                        <div className="def">{d.definition}</div>
                                                        {d.example && <div className="example">“{d.example}”</div>}
                                                        {(d.synonyms?.length || d.antonyms?.length) ? (
                                                            <div className="chips">
                                                                {d.synonyms?.slice(0, 6).map((s) => (
                                                                    <span key={"s_" + s} className="chip" title="Synonym">syn: {s}</span>
                                                                ))}
                                                                {d.antonyms?.slice(0, 6).map((a) => (
                                                                    <span key={"a_" + a} className="chip alt" title="Antonym">ant: {a}</span>
                                                                ))}
                                                            </div>
                                                        ) : null}
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    ))}
                                </Styled.Definitions>

                                {firstEntry.sourceUrls?.length ? (
                                    <Styled.Sources>
                                        <span>Sources:</span>
                                        {firstEntry.sourceUrls.map((u) => (
                                            <a key={u} href={u} target="_blank" rel="noreferrer">{u.replace(/^https?:\/\//, "")}</a>
                                        ))}
                                    </Styled.Sources>
                                ) : null}
                            </>
                        )}
                    </Styled.Card>
                </Styled.Column>

                {/* RIGHT: history & favorites */}
                <Styled.Side>
                    <Styled.Card>
                        <Styled.SideHeader>
                            <h3>History</h3>
                            <div className="actions">
                                <button className="ghost" onClick={confirmClearHistory} disabled={!history.length}>Clear</button>
                            </div>
                        </Styled.SideHeader>
                        {!history.length ? (
                            <p className="muted">Recent searches will appear here.</p>
                        ) : (
                            <Styled.List>
                                {history.map((w) => (
                                    <div className="row" key={w}>
                                        <button className="link" onClick={() => { setQuery(w); fetchWord(w); }}>{w}</button>
                                        <div className="row-actions">
                                            <button className="ghost" onClick={() => confirmRemoveHistoryItem(w)} title="Delete from history">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </Styled.List>
                        )}
                    </Styled.Card>

                    <Styled.Card>
                        <Styled.SideHeader>
                            <h3>Favorites</h3>
                            <div className="actions">
                                <button className="ghost" onClick={confirmClearFavs} disabled={!favs.length}>Clear</button>
                            </div>
                        </Styled.SideHeader>
                        {!favs.length ? (
                            <p className="muted">Save words to review later.</p>
                        ) : (
                            <Styled.List>
                                {favs.map((w) => (
                                    <div className="row" key={w}>
                                        <button className="link" onClick={() => { setQuery(w); fetchWord(w); }}>{w}</button>
                                        <div className="row-actions">
                                            <button className="ghost" onClick={() => confirmRemoveFav(w)} title="Remove from favorites">Remove</button>
                                        </div>
                                    </div>
                                ))}
                            </Styled.List>
                        )}
                    </Styled.Card>
                </Styled.Side>
            </Styled.Layout>

            {/* Confirm Modal */}
            <ConfirmModal
                open={modal.open}
                title={modal.title}
                message={modal.message}
                confirmText={modal.confirmText}
                onConfirm={doModalAction}
                onClose={closeModal}
            />
        </Styled.Wrapper>
    );
};

export default DictionaryApp;

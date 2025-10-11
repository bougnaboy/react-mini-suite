import React, { useEffect, useMemo, useState } from "react";
import { Styled, PrintOnly } from "./styled";
import { toast } from "react-toastify";

/* =========================
   LocalStorage Keys
   ========================= */
const DRAFT_KEY = "wordLetterCounter_draft_v1";
const SAVES_KEY = "wordLetterCounter_saves_v1";

/* =========================
   Small helpers
   ========================= */
const nowISO = () => new Date().toISOString();
const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

function toTitle(str) {
    return str
        .toLowerCase()
        .replace(/\b\w/g, (m) => m.toUpperCase());
}
function toSentence(str) {
    const s = str
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s*\w)/g, (m) => m.toUpperCase());
    return s;
}
function removeExtraSpaces(str) {
    return str.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

/* Counters */
function getStats(text) {
    const raw = text || "";
    const trimmed = raw.trim();

    const lines = raw.length ? raw.split(/\n/).length : 0;
    const wordsArr = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
    const words = wordsArr.length;

    const normWords = wordsArr
        .map((w) => w.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, ""))
        .filter(Boolean);
    const uniqueWords = new Set(normWords).size;

    let letters = 0;
    try {
        letters = (raw.match(/\p{L}/gu) || []).length;
    } catch {
        letters = (raw.match(/[A-Za-z]/g) || []).length;
    }

    const characters = raw.length;
    const charactersNoSpaces = raw.replace(/\s/g, "").length;
    const sentences = (raw.match(/[.!?]+(\s|$)/g) || []).length;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).length : 0;
    const readTime = words ? Math.max(1, Math.ceil(words / 180)) : 0;

    return {
        words, letters, characters, charactersNoSpaces,
        sentences, paragraphs, lines, uniqueWords, readTime
    };
}

/* Confirm Modal */
function ConfirmModal({ open, title = "Are you sure?", message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel }) {
    if (!open) return null;
    return (
        <Styled.ModalBackdrop aria-modal="true" role="dialog">
            <Styled.ModalCard>
                <h3>{title}</h3>
                {message && <p className="muted">{message}</p>}
                <Styled.ModalActions>
                    <button type="button" className="ghost" onClick={onCancel}>{cancelText}</button>
                    <button type="button" onClick={onConfirm}>{confirmText}</button>
                </Styled.ModalActions>
            </Styled.ModalCard>
        </Styled.ModalBackdrop>
    );
}

const WordLetterCounter = () => {
    const [title, setTitle] = useState("Untitled");
    const [text, setText] = useState(() => {
        try { return localStorage.getItem(DRAFT_KEY) ?? ""; } catch { return ""; }
    });
    const [saves, setSaves] = useState(() => {
        try { return JSON.parse(localStorage.getItem(SAVES_KEY) || "[]"); } catch { return []; }
    });
    const [currentId, setCurrentId] = useState(null);

    // modals
    const [confirmClear, setConfirmClear] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
    const [confirmClearAll, setConfirmClearAll] = useState(false);

    const stats = useMemo(() => getStats(text), [text]);
    const liveText = `${stats.words} words, ${stats.letters} letters, ${stats.characters} chars`;

    useEffect(() => {
        try { localStorage.setItem(DRAFT_KEY, text); } catch { }
    }, [text]);

    useEffect(() => {
        const onKey = (e) => {
            const mod = e.metaKey || e.ctrlKey;
            if (mod && e.key.toLowerCase() === "s") {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [title, text, currentId, saves]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            toast?.success?.("Copied!");
        } catch {
            toast?.error?.("Copy failed");
        }
    };

    const handleDownload = () => {
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${(title || "document").replace(/\s+/g, "_")}.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    const handlePrint = () => {
        window.print(); // global CSS will ensure only stats are printed
    };

    const handleTransform = (mode) => {
        switch (mode) {
            case "trim": setText((t) => t.trim()); break;
            case "extraspaces": setText((t) => removeExtraSpaces(t)); break;
            case "upper": setText((t) => t.toUpperCase()); break;
            case "lower": setText((t) => t.toLowerCase()); break;
            case "title": setText((t) => toTitle(t)); break;
            case "sentence": setText((t) => toSentence(t)); break;
            default: break;
        }
    };

    const handleClear = () => setConfirmClear(true);
    const confirmClearText = () => {
        setConfirmClear(false);
        setText("");
        setTitle("Untitled");
        setCurrentId(null);
        toast?.info?.("Cleared");
    };

    const handleSave = () => {
        const trimmedTitle = title.trim() || "Untitled";
        const record = {
            id: currentId || uid(),
            title: trimmedTitle,
            content: text,
            createdAt: currentId ? undefined : nowISO(),
            updatedAt: nowISO()
        };

        let next;
        if (currentId) {
            next = saves.map((s) => (s.id === currentId
                ? { ...s, title: record.title, content: record.content, updatedAt: record.updatedAt }
                : s));
        } else {
            next = [{ ...record, createdAt: record.createdAt || nowISO() }, ...saves];
            setCurrentId(record.id);
        }
        setSaves(next);
        try { localStorage.setItem(SAVES_KEY, JSON.stringify(next)); } catch { }
        toast?.success?.("Saved");
    };

    const handleLoad = (id) => {
        const found = saves.find((s) => s.id === id);
        if (!found) return;
        setTitle(found.title || "Untitled");
        setText(found.content || "");
        setCurrentId(found.id);
        toast?.info?.("Loaded");
    };

    const requestDelete = (id) => setConfirmDelete({ open: true, id });
    const confirmDeleteOne = () => {
        const id = confirmDelete.id;
        const next = saves.filter((s) => s.id !== id);
        setSaves(next);
        try { localStorage.setItem(SAVES_KEY, JSON.stringify(next)); } catch { }
        if (currentId === id) {
            setCurrentId(null);
            setTitle("Untitled");
            setText("");
        }
        setConfirmDelete({ open: false, id: null });
        toast?.info?.("Deleted");
    };

    const requestClearAll = () => setConfirmClearAll(true);
    const confirmClearAllSaves = () => {
        setConfirmClearAll(false);
        setSaves([]);
        try { localStorage.setItem(SAVES_KEY, "[]"); } catch { }
        toast?.info?.("All saved docs removed");
    };

    return (
        <Styled.Wrapper>
            {/* Global print CSS that prints only stats */}
            <PrintOnly />

            <Styled.Header>
                <div>
                    <h1>Word & Letter Counter</h1>
                    <p>
                        Want to check the count of your assignments? Paste your text here —
                        the app shows total <strong>words</strong> and <strong>letters</strong>,
                        plus extra stats and quick tools.
                    </p>
                </div>

                <Styled.HeaderActions>
                    <button type="button" className="ghost" onClick={handleCopy} title="Copy to clipboard">Copy</button>
                    <button type="button" className="ghost" onClick={handleDownload} title="Download .txt">Download</button>
                    <button type="button" onClick={handlePrint} title="Print stats only">Print</button>
                </Styled.HeaderActions>
            </Styled.Header>

            <Styled.Layout>
                {/* LEFT: Editor (no print) */}
                <Styled.EditorCard>
                    <Styled.TitleRow>
                        <input
                            type="text"
                            placeholder="Document title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={120}
                            aria-label="Document title"
                        />
                        <div className="row-actions">
                            <button type="button" className="ghost" onClick={() => handleTransform("extraspaces")}>Clean Spaces</button>
                            <button type="button" className="ghost" onClick={() => handleTransform("trim")}>Trim</button>
                            <Styled.Dropdown>
                                <select aria-label="Transform text" onChange={(e) => { handleTransform(e.target.value); e.target.selectedIndex = 0; }}>
                                    <option value="">Transform…</option>
                                    <option value="upper">UPPERCASE</option>
                                    <option value="lower">lowercase</option>
                                    <option value="title">Title Case</option>
                                    <option value="sentence">Sentence case</option>
                                </select>
                            </Styled.Dropdown>
                        </div>
                    </Styled.TitleRow>

                    <Styled.Textarea
                        placeholder="Paste or type your assignment here…"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        spellCheck="true"
                        aria-label="Main text editor"
                    />

                    <Styled.EditorActions>
                        <button type="button" onClick={handleSave}>Save</button>
                        <button type="button" className="ghost" onClick={() => setConfirmClear(true)}>Clear</button>
                    </Styled.EditorActions>
                </Styled.EditorCard>

                {/* RIGHT: Stats + Saves (Stats is print target) */}
                <Styled.Side>
                    <Styled.Card className="wlc-print-stats" aria-live="polite" aria-atomic="true">
                        <h3>Stats</h3>
                        <Styled.StatsGrid>
                            <div><span className="label">Words</span><span className="value">{stats.words}</span></div>
                            <div><span className="label">Letters</span><span className="value">{stats.letters}</span></div>
                            <div><span className="label">Chars (all)</span><span className="value">{stats.characters}</span></div>
                            <div><span className="label">Chars (no spaces)</span><span className="value">{stats.charactersNoSpaces}</span></div>
                            <div><span className="label">Sentences</span><span className="value">{stats.sentences}</span></div>
                            <div><span className="label">Paragraphs</span><span className="value">{stats.paragraphs}</span></div>
                            <div><span className="label">Lines</span><span className="value">{stats.lines}</span></div>
                            <div><span className="label">Unique words</span><span className="value">{stats.uniqueWords}</span></div>
                            <div className="span2"><span className="label">Reading time</span><span className="value">{stats.words ? `${stats.readTime} min` : "—"}</span></div>
                        </Styled.StatsGrid>
                        <Styled.HiddenLive role="status">
                            {`${stats.words} words, ${stats.letters} letters, ${stats.characters} chars`}
                        </Styled.HiddenLive>
                    </Styled.Card>

                    <Styled.Card>
                        <h3>Saved Documents</h3>
                        <Styled.SaveRow>
                            <button type="button" className="ghost" onClick={() => { setCurrentId(null); setTitle("Untitled"); setText(""); }}>New</button>
                            <div className="spacer" />
                            <button type="button" className="danger" onClick={() => setConfirmClearAll(true)}>Clear All</button>
                        </Styled.SaveRow>

                        {saves.length === 0 ? (
                            <p className="muted">No saved docs yet. Press <strong>Save</strong> to keep this document.</p>
                        ) : (
                            <Styled.SaveList>
                                {saves.map((s) => (
                                    <li key={s.id} className={currentId === s.id ? "active" : ""}>
                                        <button type="button" className="item" onClick={() => handleLoad(s.id)} title="Load">
                                            <span className="t">{s.title || "Untitled"}</span>
                                            <span className="d">{new Date(s.updatedAt || s.createdAt).toLocaleString()}</span>
                                        </button>
                                        <div className="actions">
                                            <button type="button" className="ghost" onClick={() => handleLoad(s.id)}>Load</button>
                                            <button type="button" className="danger" onClick={() => setConfirmDelete({ open: true, id: s.id })}>Delete</button>
                                        </div>
                                    </li>
                                ))}
                            </Styled.SaveList>
                        )}
                    </Styled.Card>
                </Styled.Side>
            </Styled.Layout>

            {/* Confirm Modals */}
            <ConfirmModal
                open={confirmClear}
                title="Clear text?"
                message="This will remove the current text from the editor."
                confirmText="Clear"
                onConfirm={confirmClearText}
                onCancel={() => setConfirmClear(false)}
            />
            <ConfirmModal
                open={confirmDelete.open}
                title="Delete document?"
                message="This will permanently delete the saved document."
                confirmText="Delete"
                onConfirm={confirmDeleteOne}
                onCancel={() => setConfirmDelete({ open: false, id: null })}
            />
            <ConfirmModal
                open={confirmClearAll}
                title="Remove all saved docs?"
                message="This cannot be undone."
                confirmText="Remove All"
                onConfirm={confirmClearAllSaves}
                onCancel={() => setConfirmClearAll(false)}
            />
        </Styled.Wrapper>
    );
};

export default WordLetterCounter;

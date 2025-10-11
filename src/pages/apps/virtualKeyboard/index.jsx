import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/* =========================================================
   Local storage keys
   ========================================================= */
const DRAFT_KEY = "virtualKeyboard_message_v1";
const SNIPPETS_KEY = "virtualKeyboard_snippets_v1";

/* =========================================================
   Helpers
   ========================================================= */
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function formatISTLabel(iso) {
    try {
        const d = new Date(iso);
        const parts = new Intl.DateTimeFormat("en-US", {
            month: "short", day: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit", second: "2-digit",
            hour12: false, timeZone: "Asia/Kolkata",
        }).formatToParts(d);
        const get = (t) => parts.find((p) => p.type === t)?.value || "";
        return `${get("month")} ${get("day")}, ${get("year")} ${get("hour")}:${get("minute")}:${get("second")} hrs`;
    } catch { return iso; }
}

/* Shift/symbol mappings like a typical US keyboard */
const SHIFT_MAP = {
    "`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&", "8": "*", "9": "(", "0": ")",
    "-": "_", "=": "+", "[": "{", "]": "}", "\\": "|",
    ";": ":", "'": "\"", ",": "<", ".": ">", "/": "?"
};
const LETTERS = [
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
    ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
    ["Caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "Enter"],
    ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "←", "→"],
    ["Space"]
];

/* =========================================================
   Confirm modal (self-made, no portal)
   ========================================================= */
function useConfirm() {
    const [state, setState] = useState({ open: false, title: "", message: "", onConfirm: null });
    const ask = (opts) => setState({ open: true, ...opts });
    const close = () => setState((s) => ({ ...s, open: false }));
    const Modal = (
        <Styled.ModalOverlay hidden={!state.open} aria-hidden={!state.open}>
            <Styled.Modal role="dialog" aria-modal="true" aria-labelledby="confirm-title">
                <h3 id="confirm-title">{state.title || "Confirm"}</h3>
                <p className="msg">{state.message || "Are you sure?"}</p>
                <div className="actions">
                    <button className="ghost" onClick={close}>Cancel</button>
                    <button
                        className="danger"
                        onClick={() => {
                            try { state.onConfirm?.(); } finally { close(); }
                        }}
                    >
                        Yes, do it
                    </button>
                </div>
            </Styled.Modal>
        </Styled.ModalOverlay>
    );
    return { ask, Modal };
}

/* =========================================================
   Component
   ========================================================= */
const VirtualKeyboard = () => {
    const taRef = useRef(null);
    const fileRef = useRef(null);

    const [text, setText] = useState(() => {
        try { return localStorage.getItem(DRAFT_KEY) || ""; } catch { return ""; }
    });
    const [caps, setCaps] = useState(false);
    const [shift, setShift] = useState(false);         // one-shot by default
    const [stickyShift, setStickyShift] = useState(false);
    const [clickHighlight, setClickHighlight] = useState(""); // shows last pressed key briefly

    const [snippets, setSnippets] = useState(() => {
        try { return JSON.parse(localStorage.getItem(SNIPPETS_KEY) || "[]"); } catch { return []; }
    });
    const [snippetTitle, setSnippetTitle] = useState("");

    const { ask, Modal } = useConfirm();

    /* autosave draft */
    useEffect(() => {
        try { localStorage.setItem(DRAFT_KEY, text); } catch { }
    }, [text]);

    /* derived counters */
    const charCount = text.length;
    const lineCount = (text.match(/\n/g)?.length || 0) + 1;

    /* -----------------------------------------------------
       Textarea helpers: insert / delete / caret
       ----------------------------------------------------- */
    function focusTA(preventScroll = false) {
        const el = taRef.current;
        if (!el) return;
        try { el.focus({ preventScroll }); } catch { el.focus(); }
    }

    function insertAtCursor(val) {
        const el = taRef.current;
        if (!el) return;
        const start = el.selectionStart ?? text.length;
        const end = el.selectionEnd ?? text.length;
        const next = text.slice(0, start) + val + text.slice(end);
        setText(next);
        const newPos = start + val.length;
        requestAnimationFrame(() => {
            el.selectionStart = el.selectionEnd = newPos;
            focusTA(true);
        });
    }

    function backspace() {
        const el = taRef.current;
        if (!el) return;
        const start = el.selectionStart ?? 0;
        const end = el.selectionEnd ?? 0;
        if (start !== end) {
            // delete selection
            const next = text.slice(0, start) + text.slice(end);
            setText(next);
            requestAnimationFrame(() => {
                el.selectionStart = el.selectionEnd = start;
                focusTA(true);
            });
            return;
        }
        if (start === 0) return;
        const next = text.slice(0, start - 1) + text.slice(end);
        setText(next);
        requestAnimationFrame(() => {
            el.selectionStart = el.selectionEnd = start - 1;
            focusTA(true);
        });
    }

    function delForward() {
        const el = taRef.current;
        if (!el) return;
        const start = el.selectionStart ?? 0;
        const end = el.selectionEnd ?? 0;
        if (start !== end) {
            const next = text.slice(0, start) + text.slice(end);
            setText(next);
            requestAnimationFrame(() => {
                el.selectionStart = el.selectionEnd = start;
                focusTA(true);
            });
            return;
        }
        if (start >= text.length) return;
        const next = text.slice(0, start) + text.slice(start + 1);
        setText(next);
        requestAnimationFrame(() => {
            el.selectionStart = el.selectionEnd = start;
            focusTA(true);
        });
    }

    function moveCaret(dir) {
        const el = taRef.current;
        if (!el) return;
        const start = el.selectionStart ?? 0;
        const end = el.selectionEnd ?? 0;
        const pos = dir === "left" ? Math.min(start, end) : Math.max(start, end);
        const next = clamp(pos + (dir === "left" ? -1 : 1), 0, text.length);
        requestAnimationFrame(() => {
            el.selectionStart = el.selectionEnd = next;
            focusTA(true);
        });
    }

    /* -----------------------------------------------------
       Keyboard handling
       ----------------------------------------------------- */
    function visualize(keyLabel) {
        setClickHighlight(keyLabel);
        setTimeout(() => setClickHighlight(""), 120);
    }

    function applyShift(val) {
        // letters: case; symbols: SHIFT_MAP
        if (/[a-z]/i.test(val)) {
            const upper = (caps && !shift) || (!caps && shift);
            return upper ? val.toUpperCase() : val.toLowerCase();
        }
        if (shift && SHIFT_MAP[val]) return SHIFT_MAP[val];
        return val;
    }

    function handleKey(label) {
        visualize(label);

        if (label === "Backspace") { backspace(); oneShotShift(); return; }
        if (label === "Delete") { delForward(); oneShotShift(); return; }
        if (label === "Enter") { insertAtCursor("\n"); oneShotShift(); return; }
        if (label === "Tab") { insertAtCursor("\t"); oneShotShift(); return; }
        if (label === "Space") { insertAtCursor(" "); oneShotShift(); return; }
        if (label === "Caps") { setCaps((c) => !c); return; }
        if (label === "Shift") { setShift((s) => !s); return; }
        if (label === "←") { moveCaret("left"); return; }
        if (label === "→") { moveCaret("right"); return; }

        // regular char
        const val = applyShift(label);
        insertAtCursor(val);
        oneShotShift();
    }

    function oneShotShift() {
        if (!stickyShift) setShift(false);
    }

    /* -----------------------------------------------------
       Clipboard / file / print / clear
       ----------------------------------------------------- */
    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(text);
            // silent success, no toast required here
        } catch {
            // fallback
            const el = taRef.current;
            if (!el) return;
            el.select();
            document.execCommand("copy");
            focusTA(true);
        }
    }

    async function pasteFromClipboard() {
        try {
            const s = await navigator.clipboard.readText();
            insertAtCursor(s);
        } catch {
            // permission blocked; ignore
        }
    }

    function downloadTxt() {
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "virtual-keyboard.txt";
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
    }

    function triggerUpload() {
        fileRef.current?.click();
    }

    function onFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const content = String(reader.result || "");
            ask({
                title: "Replace message with file content?",
                message: "This will replace your current message with the file text.",
                onConfirm: () => setText(content),
            });
        };
        reader.readAsText(file);
        e.target.value = "";
    }

    function printMessage() {
        const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Message</title>
          <style>
            body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 24px; }
            pre { white-space: pre-wrap; word-wrap: break-word; border: 1px solid #ccc; padding: 16px; border-radius: 8px; }
            h2 { margin: 0 0 12px 0; font-size: 16px; }
          </style>
        </head>
        <body>
          <h2>Message</h2>
          <pre>${text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</pre>
          <script>window.onload = () => { setTimeout(() => window.print(), 50); }</script>
        </body>
      </html>`;
        const w = window.open("", "_blank");
        if (!w) return;
        w.document.open(); w.document.write(html); w.document.close();
    }

    function clearMessage() {
        ask({
            title: "Clear message?",
            message: "This will remove all text from the editor.",
            onConfirm: () => setText(""),
        });
    }

    /* -----------------------------------------------------
       Snippets (save / load / delete)
       ----------------------------------------------------- */
    function saveSnippet() {
        const title = (snippetTitle || text.slice(0, 40) || "Untitled").trim();
        if (!title) return;
        const entry = {
            id: Date.now(),
            title,
            content: text,
            createdAt: new Date().toISOString(),
        };
        const next = [entry, ...snippets].slice(0, 200); // keep last 200
        setSnippets(next);
        try { localStorage.setItem(SNIPPETS_KEY, JSON.stringify(next)); } catch { }
        setSnippetTitle("");
    }

    function loadSnippet(id, mode) {
        const sn = snippets.find((s) => s.id === id);
        if (!sn) return;
        if (mode === "replace") {
            ask({
                title: "Load snippet?",
                message: `Replace the current message with "${sn.title}"?`,
                onConfirm: () => setText(sn.content),
            });
        } else {
            // append
            const sep = text && !text.endsWith("\n") ? "\n" : "";
            setText(text + sep + sn.content);
        }
    }

    function deleteSnippet(id) {
        const sn = snippets.find((s) => s.id === id);
        if (!sn) return;
        ask({
            title: "Delete snippet?",
            message: `This will permanently remove "${sn.title}".`,
            onConfirm: () => {
                const next = snippets.filter((x) => x.id !== id);
                setSnippets(next);
                try { localStorage.setItem(SNIPPETS_KEY, JSON.stringify(next)); } catch { }
            },
        });
    }

    function clearSnippets() {
        if (!snippets.length) return;
        ask({
            title: "Clear all saved?",
            message: "This will remove all saved snippets.",
            onConfirm: () => {
                setSnippets([]);
                try { localStorage.removeItem(SNIPPETS_KEY); } catch { }
            },
        });
    }

    /* -----------------------------------------------------
       Render
       ----------------------------------------------------- */
    const keyboardRows = useMemo(() => LETTERS, []);
    const activeCaps = caps ? "active" : "";
    const activeShift = shift ? "active" : "";

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div>
                    <h1>Virtual Keyboard</h1>
                    <p>Damaged keyboard? Type using on-screen keys. Copy, save snippets, print, or download as .txt.</p>
                </div>
                <Styled.HeaderActions>
                    <button className="ghost" onClick={() => setCaps((c) => !c)} aria-pressed={caps}>
                        Caps {caps ? "ON" : "OFF"}
                    </button>
                    <button className="ghost" onClick={() => setShift((s) => !s)} aria-pressed={shift}>
                        Shift {shift ? "ON" : "OFF"}
                    </button>
                    <label className="checkbox">
                        <input type="checkbox" checked={stickyShift} onChange={(e) => setStickyShift(e.target.checked)} />
                        <span>Sticky Shift</span>
                    </label>
                </Styled.HeaderActions>
            </Styled.Header>

            <Styled.Layout>
                {/* LEFT: Editor + Keyboard */}
                <div className="col">
                    <Styled.Card>
                        <Styled.EditorHeader>
                            <div className="meta">
                                <span>Chars: <strong>{charCount}</strong></span>
                                <span>Lines: <strong>{lineCount}</strong></span>
                            </div>
                            <div className="actions">
                                <button onClick={copyToClipboard} title="Copy to clipboard">Copy</button>
                                <button className="ghost" onClick={pasteFromClipboard} title="Paste from clipboard">Paste</button>
                                <button className="ghost" onClick={downloadTxt} title="Download .txt">Download</button>
                                <button className="ghost" onClick={triggerUpload} title="Upload .txt">Upload</button>
                                <input ref={fileRef} type="file" accept=".txt" onChange={onFileChange} hidden />
                                <button className="ghost" onClick={printMessage} title="Print message">Print</button>
                                <button className="danger" onClick={clearMessage} title="Clear message">Clear</button>
                            </div>
                        </Styled.EditorHeader>

                        <Styled.Textarea
                            ref={taRef}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type here using the on-screen keyboard…"
                            spellCheck={false}
                            aria-label="Message editor"
                        />
                    </Styled.Card>

                    <Styled.Card>
                        <Styled.Keyboard>
                            {keyboardRows.map((row, i) => (
                                <div key={i} className="row">
                                    {row.map((keyLabel) => {
                                        const wide = ["Backspace", "Enter", "Tab", "Caps", "Shift", "Space"].includes(keyLabel);
                                        const space = keyLabel === "Space";
                                        const isActive =
                                            (keyLabel === "Caps" && caps) ||
                                            (keyLabel === "Shift" && shift) ||
                                            clickHighlight === keyLabel;
                                        return (
                                            <Styled.Key
                                                key={keyLabel}
                                                $wide={wide}
                                                $space={space}
                                                aria-pressed={isActive}
                                                className={isActive ? "active" : ""}
                                                onMouseDown={(e) => { e.preventDefault(); handleKey(keyLabel); }}
                                                onClick={(e) => e.preventDefault()}
                                                title={keyLabel}
                                            >
                                                {applyShift(keyLabel)}
                                            </Styled.Key>
                                        );
                                    })}
                                </div>
                            ))}
                            <div className="row row-aux">
                                <Styled.Key onMouseDown={(e) => { e.preventDefault(); handleKey("Delete"); }} title="Delete">Del</Styled.Key>
                                <Styled.Key onMouseDown={(e) => { e.preventDefault(); handleKey("←"); }} title="Left">←</Styled.Key>
                                <Styled.Key onMouseDown={(e) => { e.preventDefault(); handleKey("→"); }} title="Right">→</Styled.Key>
                            </div>
                        </Styled.Keyboard>
                    </Styled.Card>
                </div>

                {/* RIGHT: Snippets & Settings */}
                <div className="col">
                    <Styled.Card>
                        <h3>Save Snippet</h3>
                        <Styled.SnippetForm onSubmit={(e) => { e.preventDefault(); saveSnippet(); }}>
                            <input
                                type="text"
                                placeholder="Snippet title"
                                value={snippetTitle}
                                onChange={(e) => setSnippetTitle(e.target.value)}
                                maxLength={80}
                            />
                            <div className="row">
                                <button type="submit">Save</button>
                                <button type="button" className="ghost danger" onClick={clearSnippets}>Clear All</button>
                            </div>
                        </Styled.SnippetForm>
                        <Styled.Divider />
                        <Styled.SnippetList role="list">
                            {snippets.length === 0 && <p className="muted">No saved snippets yet.</p>}
                            {snippets.map((sn) => (
                                <li key={sn.id}>
                                    <div className="info">
                                        <strong>{sn.title}</strong>
                                        <span className="date">{formatISTLabel(sn.createdAt)}</span>
                                        <p className="preview">{sn.content.slice(0, 120) || "—"}</p>
                                    </div>
                                    <div className="buttons">
                                        <button onClick={() => loadSnippet(sn.id, "replace")} title="Replace current text">Load</button>
                                        <button className="ghost" onClick={() => loadSnippet(sn.id, "append")} title="Append to end">Append</button>
                                        <button className="ghost danger" onClick={() => deleteSnippet(sn.id)} title="Delete snippet">Delete</button>
                                    </div>
                                </li>
                            ))}
                        </Styled.SnippetList>
                    </Styled.Card>

                    <Styled.Card>
                        <h3>Tips</h3>
                        <ul className="tips">
                            <li>Caps toggles casing; Shift changes one key (unless Sticky Shift is on).</li>
                            <li>Use ← → buttons to move the caret precisely.</li>
                            <li>Upload/Download .txt for quick transfer; Print makes a clean hard copy.</li>
                        </ul>
                    </Styled.Card>
                </div>
            </Styled.Layout>

            {Modal}
        </Styled.Wrapper>
    );
};

export default VirtualKeyboard;

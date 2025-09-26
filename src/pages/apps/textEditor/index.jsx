import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/* -------------------------
   Storage & helpers
------------------------- */
const STORAGE_KEY = "textEditor.basic.v1";

/* Safe LocalStorage */
const safeGet = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? null; }
    catch { return null; }
};
const safeSet = (obj) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch { }
};

/* --- Date helpers (MMM DD, YYYY + local time) --- */
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDateLocal = (val) => {
    if (!val) return "";
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
        const [y, m, d] = val.split("-").map(Number);
        const dt = new Date(Date.UTC(y, m - 1, d));
        return `${MONTHS_SHORT[dt.getUTCMonth()]} ${String(dt.getUTCDate()).padStart(2, "0")}, ${dt.getUTCFullYear()}`;
    }
    const dt = new Date(val);
    if (isNaN(dt)) return "";
    return `${MONTHS_SHORT[dt.getMonth()]} ${String(dt.getDate()).padStart(2, "0")}, ${dt.getFullYear()}`;
};
const fmtDateTime = (ts) => {
    if (!ts) return "";
    const dt = new Date(ts);
    if (isNaN(dt)) return "";
    const date = `${MONTHS_SHORT[dt.getMonth()]} ${String(dt.getDate()).padStart(2, "0")}, ${dt.getFullYear()}`;
    const time = dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); // local time
    return `${date}, ${time}`;
};

/* Initial state */
const DEFAULT_DOC = {
    title: "Untitled",
    html: "",
    updatedAt: Date.now(),
    plainPaste: true, // paste as plain text by default
};

export default function TextEditorBasic() {
    const persisted = safeGet();
    const [doc, setDoc] = useState(persisted || DEFAULT_DOC);
    const [toast, setToast] = useState("");
    const [confirm, setConfirm] = useState(null);

    const editorRef = useRef(null);
    const selectionStateRef = useRef({}); // to paint active toolbar buttons
    const saveTimer = useRef(null);

    /* Persist */
    useEffect(() => { safeSet(doc); }, [doc]);

    /* Word/char counts */
    const stats = useMemo(() => {
        const tmp = document.createElement("div");
        tmp.innerHTML = doc.html || "";
        const text = (tmp.textContent || "").trim();
        const words = text ? text.split(/\s+/).length : 0;
        const chars = text.length;
        return { words, chars };
    }, [doc.html]);

    /* Toast helper */
    const pulse = (m) => {
        setToast(m);
        setTimeout(() => setToast(""), 1200);
    };

    /* --- Caret stability: uncontrolled editor + hydrate only when needed --- */
    useEffect(() => {
        const el = editorRef.current;
        if (!el) return;
        const nextHTML = doc.html || "";
        if (el.innerHTML !== nextHTML) {
            el.innerHTML = nextHTML;
        }
    }, [doc.html]);

    /* Sync selection (active states for toolbar) */
    const [, setForce] = useState(0);
    useEffect(() => {
        const onSel = () => {
            const s = {};
            try {
                s.bold = document.queryCommandState("bold");
                s.italic = document.queryCommandState("italic");
                s.underline = document.queryCommandState("underline");
                s.strike = document.queryCommandState("strikeThrough");
                s.ul = document.queryCommandState("insertUnorderedList");
                s.ol = document.queryCommandState("insertOrderedList");
                s.left = document.queryCommandState("justifyLeft");
                s.center = document.queryCommandState("justifyCenter");
                s.right = document.queryCommandState("justifyRight");
                const block = (document.queryCommandValue("formatBlock") || "").toLowerCase();
                s.h1 = block.includes("h1");
                s.h2 = block.includes("h2");
                s.p = block.includes("p");
                s.blockquote = block.includes("blockquote");
                s.pre = block.includes("pre");
            } catch { }
            selectionStateRef.current = s;
            setForce((x) => x + 1); // cheap tick
        };
        document.addEventListener("selectionchange", onSel);
        return () => document.removeEventListener("selectionchange", onSel);
    }, []);

    /* Remember & restore selection (for color pickers) */
    const lastRangeRef = useRef(null);
    useEffect(() => {
        const updateRange = () => {
            const sel = window.getSelection?.();
            if (sel && sel.rangeCount > 0) {
                lastRangeRef.current = sel.getRangeAt(0);
            }
        };
        document.addEventListener("selectionchange", updateRange);
        return () => document.removeEventListener("selectionchange", updateRange);
    }, []);
    const restoreSelection = () => {
        const range = lastRangeRef.current;
        if (!range) return;
        const sel = window.getSelection?.();
        if (!sel) return;
        try {
            sel.removeAllRanges();
            sel.addRange(range);
        } catch { }
    };

    /* Editor input -> save (debounced) */
    const onInput = () => {
        const html = editorRef.current?.innerHTML || "";
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            setDoc(prev => ({ ...prev, html, updatedAt: Date.now() }));
        }, 250);
    };

    /* IME composition support */
    const composingRef = useRef(false);
    const onCompositionStart = () => (composingRef.current = true);
    const onCompositionEnd = () => {
        composingRef.current = false;
        onInput(); // commit after composition
    };

    /* Commands */
    const run = (cmd, val = null) => {
        editorRef.current?.focus();
        try { document.execCommand(cmd, false, val); } catch { }
        onInput();
    };
    const setBlock = (block) => {
        editorRef.current?.focus();
        try { document.execCommand("formatBlock", false, block); } catch { }
        onInput();
    };
    const addLink = () => {
        editorRef.current?.focus();
        let url = window.prompt("Enter URL (https://…)");
        if (!url) return;
        if (!/^https?:\/\//i.test(url)) url = "https://" + url;
        try { document.execCommand("createLink", false, url); } catch { }
        onInput();
    };
    const removeLink = () => run("unlink");
    const clearFormatting = () => {
        editorRef.current?.focus();
        try {
            document.execCommand("removeFormat");
            document.execCommand("unlink");
        } catch { }
        onInput();
    };

    /* Color commands */
    const enableStyleWithCSS = () => {
        try { document.execCommand("styleWithCSS", false, true); } catch { }
    };
    const setTextColor = (hex) => {
        editorRef.current?.focus();
        restoreSelection();
        enableStyleWithCSS();
        try { document.execCommand("foreColor", false, hex); } catch { }
        onInput();
    };
    const setHighlight = (hex) => {
        editorRef.current?.focus();
        restoreSelection();
        enableStyleWithCSS();
        let ok = false;
        try { ok = document.execCommand("hiliteColor", false, hex); } catch { }
        if (!ok) {
            try { document.execCommand("backColor", false, hex); } catch { }
        }
        onInput();
    };

    /* Export / Import / Print / New */
    const onExportHTML = () => {
        const blob = new Blob(
            [`<!doctype html><meta charset="utf-8"><title>${doc.title}</title><body>${doc.html}</body>`],
            { type: "text/html" }
        );
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${doc.title.replace(/\s+/g, "-").toLowerCase()}.html`;
        a.click();
        URL.revokeObjectURL(a.href);
        pulse("Exported .html");
    };
    const onExportJSON = () => {
        const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${doc.title.replace(/\s+/g, "-").toLowerCase()}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
        pulse("Exported .json");
    };
    const fileRef = useRef(null);
    const importHTML = () => fileRef.current?.click();
    const onImportFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const html = String(reader.result || "");
            setDoc((prev) => ({ ...prev, html, updatedAt: Date.now() }));
            pulse("Imported HTML");
        };
        reader.readAsText(file);
        e.target.value = "";
    };
    const doPrint = () => {
        const w = window.open("", "_blank");
        if (!w) return;
        w.document.write(`<!doctype html><meta charset="utf-8"><title>${doc.title}</title><body>${doc.html}</body>`);
        w.document.close();
        w.focus();
        w.print();
    };

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
    const newDoc = () => {
        askConfirm({
            title: "Clear editor?",
            message: "This will remove all content.",
            confirmText: "Clear",
            onConfirm: () => {
                setDoc({ ...DEFAULT_DOC, updatedAt: Date.now() });
                setConfirm(null);
                setTimeout(() => editorRef.current?.focus(), 0);
                pulse("Editor cleared");
            },
        });
    };

    /* Keyboard shortcuts */
    const onKeyDown = (e) => {
        const mod = e.metaKey || e.ctrlKey;
        if (!mod) return;
        if (e.key.toLowerCase() === "b") { e.preventDefault(); run("bold"); }
        if (e.key.toLowerCase() === "i") { e.preventDefault(); run("italic"); }
        if (e.key.toLowerCase() === "u") { e.preventDefault(); run("underline"); }
        if (e.key.toLowerCase() === "k") { e.preventDefault(); addLink(); }
    };

    /* Palettes + color picker refs */
    const TEXT_PALETTE = ["#111827", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#6b7280", "#ffffff"];
    const HILITE_PALETTE = ["#fff3b0", "#fde68a", "#fca5a5", "#bfdbfe", "#bbf7d0", "#f5f5f5"];
    const textColorRef = useRef(null);
    const highlightRef = useRef(null);

    /* Render */
    const s = selectionStateRef.current;

    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        <Styled.Title>Text Editor (Basic)</Styled.Title>
                        <div style={{ height: 8 }} />
                        <Styled.Sub>
                            Minimal, fast notes editor with basic formatting. Uses <b>contentEditable</b>, saves to
                            LocalStorage, and supports export/import. Paste-as-plain-text is on by default to keep your notes clean.
                        </Styled.Sub>
                        <div style={{ height: 6 }} />
                        <Styled.BulletList aria-label="Tips">
                            <Styled.BulletItem><b>Shortcuts:</b> Ctrl/⌘+B, Ctrl/⌘+I, Ctrl/⌘+U, Ctrl/⌘+K (link)</Styled.BulletItem>
                            <Styled.BulletItem>Use H1/H2/Quote/Code block for structure.</Styled.BulletItem>
                            <Styled.BulletItem>Toggle “Plain paste” if you want to keep source formatting while pasting.</Styled.BulletItem>
                        </Styled.BulletList>
                    </div>
                </Styled.Header>

                {/* Doc meta */}
                <Styled.Card>
                    <Styled.FormRow>
                        <Styled.Label title="Document title">
                            <Styled.LabelText>Title</Styled.LabelText>
                            <Styled.Input
                                placeholder="Untitled"
                                value={doc.title}
                                onChange={(e) => setDoc((p) => ({ ...p, title: e.target.value }))}
                            />
                        </Styled.Label>

                        <Styled.RowWrap>
                            <Styled.PrimaryButton type="button" onClick={onExportHTML}>Export .html</Styled.PrimaryButton>
                            <Styled.PrimaryButton type="button" onClick={onExportJSON}>Export .json</Styled.PrimaryButton>
                            <Styled.PrimaryButton type="button" onClick={importHTML}>Import .html</Styled.PrimaryButton>
                            <input ref={fileRef} type="file" accept=".html,text/html" onChange={onImportFile} hidden />
                            <Styled.PrimaryButton type="button" onClick={doPrint}>Print</Styled.PrimaryButton>
                            <Styled.DangerButton type="button" onClick={newDoc}>Clear</Styled.DangerButton>
                        </Styled.RowWrap>
                    </Styled.FormRow>
                </Styled.Card>

                {/* Editor */}
                <Styled.EditorCard>
                    <Styled.EditorToolbar>
                        <Styled.Toolbar>
                            {/* Inline */}
                            <Styled.ToolButton $active={s.bold} onMouseDown={(e) => e.preventDefault()} onClick={() => run("bold")} title="Bold (Ctrl/⌘+B)">B</Styled.ToolButton>
                            <Styled.ToolButton $active={s.italic} onMouseDown={(e) => e.preventDefault()} onClick={() => run("italic")} title="Italic (Ctrl/⌘+I)"><i>I</i></Styled.ToolButton>
                            <Styled.ToolButton $active={s.underline} onMouseDown={(e) => e.preventDefault()} onClick={() => run("underline")} title="Underline (Ctrl/⌘+U)"><u>U</u></Styled.ToolButton>
                            <Styled.ToolButton $active={s.strike} onMouseDown={(e) => e.preventDefault()} onClick={() => run("strikeThrough")} title="Strikethrough">S</Styled.ToolButton>
                            <Styled.Split />

                            {/* Blocks */}
                            <Styled.ToolButton $active={s.h1} onMouseDown={(e) => e.preventDefault()} onClick={() => setBlock("h1")} title="Heading 1">H1</Styled.ToolButton>
                            <Styled.ToolButton $active={s.h2} onMouseDown={(e) => e.preventDefault()} onClick={() => setBlock("h2")} title="Heading 2">H2</Styled.ToolButton>
                            <Styled.ToolButton $active={s.p} onMouseDown={(e) => e.preventDefault()} onClick={() => setBlock("p")} title="Paragraph">P</Styled.ToolButton>
                            <Styled.ToolButton $active={s.blockquote} onMouseDown={(e) => e.preventDefault()} onClick={() => setBlock("blockquote")} title="Quote">“ ”</Styled.ToolButton>
                            <Styled.ToolButton $active={s.pre} onMouseDown={(e) => e.preventDefault()} onClick={() => setBlock("pre")} title="Code block">{`</>`}</Styled.ToolButton>
                            <Styled.Split />

                            {/* Lists */}
                            <Styled.ToolButton $active={s.ul} onMouseDown={(e) => e.preventDefault()} onClick={() => run("insertUnorderedList")} title="Bulleted list">• List</Styled.ToolButton>
                            <Styled.ToolButton $active={s.ol} onMouseDown={(e) => e.preventDefault()} onClick={() => run("insertOrderedList")} title="Numbered list">1. List</Styled.ToolButton>
                            <Styled.Split />

                            {/* Colors */}
                            <Styled.ToolButton
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => { restoreSelection(); textColorRef.current?.click(); }}
                                title="Text color"
                            >
                                A
                            </Styled.ToolButton>
                            <Styled.ColorInput
                                ref={textColorRef}
                                onInput={(e) => setTextColor(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <Styled.ColorRow>
                                {["#111827", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#6b7280", "#ffffff"].map(c => (
                                    <Styled.Swatch
                                        key={c}
                                        $c={c}
                                        title={`Text ${c}`}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => setTextColor(c)}
                                    />
                                ))}
                            </Styled.ColorRow>

                            <Styled.ToolButton
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => { restoreSelection(); highlightRef.current?.click(); }}
                                title="Highlight color"
                            >
                                H
                            </Styled.ToolButton>
                            <Styled.ColorInput
                                ref={highlightRef}
                                onInput={(e) => setHighlight(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <Styled.ColorRow>
                                {["#fff3b0", "#fde68a", "#fca5a5", "#bfdbfe", "#bbf7d0", "#f5f5f5"].map(c => (
                                    <Styled.Swatch
                                        key={c}
                                        $c={c}
                                        title={`Highlight ${c}`}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => setHighlight(c)}
                                    />
                                ))}
                            </Styled.ColorRow>
                            <Styled.Split />

                            {/* Align */}
                            <Styled.ToolButton $active={s.left} onMouseDown={(e) => e.preventDefault()} onClick={() => run("justifyLeft")} title="Align left">⟸</Styled.ToolButton>
                            <Styled.ToolButton $active={s.center} onMouseDown={(e) => e.preventDefault()} onClick={() => run("justifyCenter")} title="Align center">≡</Styled.ToolButton>
                            <Styled.ToolButton $active={s.right} onMouseDown={(e) => e.preventDefault()} onClick={() => run("justifyRight")} title="Align right">⟹</Styled.ToolButton>
                            <Styled.Split />

                            {/* Links & utils */}
                            <Styled.ToolButton onMouseDown={(e) => e.preventDefault()} onClick={addLink} title="Insert link (Ctrl/⌘+K)">Link</Styled.ToolButton>
                            <Styled.ToolButton onMouseDown={(e) => e.preventDefault()} onClick={removeLink} title="Remove link">Unlink</Styled.ToolButton>
                            <Styled.Split />
                            <Styled.ToolButton onMouseDown={(e) => e.preventDefault()} onClick={() => run("undo")} title="Undo">Undo</Styled.ToolButton>
                            <Styled.ToolButton onMouseDown={(e) => e.preventDefault()} onClick={() => run("redo")} title="Redo">Redo</Styled.ToolButton>
                            <Styled.ToolButton onMouseDown={(e) => e.preventDefault()} onClick={clearFormatting} title="Clear formatting">Clear</Styled.ToolButton>

                            {/* Paste mode */}
                            <Styled.ToolButton
                                $active={doc.plainPaste}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setDoc(p => ({ ...p, plainPaste: !p.plainPaste }))}
                                title="Paste as plain text (toggle)"
                            >
                                Plain paste
                            </Styled.ToolButton>
                        </Styled.Toolbar>
                    </Styled.EditorToolbar>

                    <Styled.EditorArea
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        data-placeholder="Start typing here…"
                        onInput={onInput}
                        onKeyDown={onKeyDown}
                        onPaste={(e) => {
                            if (!doc.plainPaste) return;
                            e.preventDefault();
                            const text = e.clipboardData.getData("text/plain");
                            document.execCommand("insertText", false, text);
                        }}
                        onCompositionStart={onCompositionStart}
                        onCompositionEnd={onCompositionEnd}
                    />
                </Styled.EditorCard>

                <Styled.MetaRow>
                    <span>
                        <b>Last saved:</b> {fmtDateTime(doc.updatedAt)}
                    </span>
                    <span>
                        <b>Words:</b> {stats.words} &nbsp;•&nbsp; <b>Chars:</b> {stats.chars}
                    </span>
                </Styled.MetaRow>

                {toast && <Styled.Toast role="status" aria-live="polite">{toast}</Styled.Toast>}

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
                                    <button type="button" onClick={() => setConfirm(null)}>
                                        {confirm.cancelText || "Cancel"}
                                    </button>
                                )}
                                {confirm.tone === "danger" ? (
                                    <Styled.DangerButton type="button" onClick={confirm.onConfirm} autoFocus>
                                        {confirm.confirmText || "Confirm"}
                                    </Styled.DangerButton>
                                ) : (
                                    <Styled.PrimaryButton type="button" onClick={confirm.onConfirm} autoFocus>
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

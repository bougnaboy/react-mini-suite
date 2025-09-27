import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

// IMPORTANT: treat gifshot.min.js as a URL asset, not a module
import gifshotUrl from "./gifshot.min.js?url";

const LS_KEY = "gifGenerator_v1";

export default function GifGenerator() {
    const [frames, setFrames] = useState([]); // [{id, name, dataUrl}]
    const [gifWidth, setGifWidth] = useState(320);
    const [gifHeight, setGifHeight] = useState(240);
    const [delayMs, setDelayMs] = useState(150);

    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [gifDataUri, setGifDataUri] = useState("");
    const [errMsg, setErrMsg] = useState("");
    const [engineReady, setEngineReady] = useState(
        typeof window !== "undefined" && !!window.gifshot
    );

    const fileInputRef = useRef(null);
    const dropRef = useRef(null);

    // --- load gifshot as a CLASSIC script (prevents worker scope bug) ---
    useEffect(() => {
        if (window.gifshot) {
            setEngineReady(true);
            return;
        }
        const s = document.createElement("script");
        s.src = gifshotUrl;           // served by Vite as a static file
        s.async = true;
        s.defer = true;
        s.onload = () => setEngineReady(!!window.gifshot);
        s.onerror = () => setErrMsg("Could not load GIF engine.");
        document.body.appendChild(s);
        return () => { /* keep it loaded */ };
    }, []);

    // restore
    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed?.frames?.length) setFrames(parsed.frames);
            if (parsed?.gifWidth) setGifWidth(parsed.gifWidth);
            if (parsed?.gifHeight) setGifHeight(parsed.gifHeight);
            if (parsed?.delayMs) setDelayMs(parsed.delayMs);
        } catch { }
    }, []);

    // persist
    useEffect(() => {
        try {
            localStorage.setItem(
                LS_KEY,
                JSON.stringify({ frames, gifWidth, gifHeight, delayMs })
            );
        } catch { }
    }, [frames, gifWidth, gifHeight, delayMs]);

    // drag & drop
    useEffect(() => {
        const el = dropRef.current;
        if (!el) return;

        const onDragOver = (e) => { e.preventDefault(); el.classList.add("dragging"); };
        const onDragLeave = (e) => { e.preventDefault(); el.classList.remove("dragging"); };
        const onDrop = (e) => {
            e.preventDefault(); el.classList.remove("dragging");
            handleFiles([...(e.dataTransfer?.files || [])]);
        };

        el.addEventListener("dragover", onDragOver);
        el.addEventListener("dragleave", onDragLeave);
        el.addEventListener("drop", onDrop);
        return () => {
            el.removeEventListener("dragover", onDragOver);
            el.removeEventListener("dragleave", onDragLeave);
            el.removeEventListener("drop", onDrop);
        };
    }, []);

    const handlePick = () => fileInputRef.current?.click();

    const handleFiles = async (files) => {
        setErrMsg("");
        const imageFiles = files.filter((f) => f.type.startsWith("image/"));
        if (!imageFiles.length) return;

        const readFile = (file) =>
            new Promise((resolve) => {
                const r = new FileReader();
                r.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, dataUrl: r.result });
                r.readAsDataURL(file);
            });

        const results = [];
        for (const f of imageFiles) {
            if (f.size > 2 * 1024 * 1024) setErrMsg("Some images are >2MB. Consider resizing.");
            // eslint-disable-next-line no-await-in-loop
            results.push(await readFile(f));
        }
        setFrames((prev) => [...prev, ...results]);
    };

    const onFileChange = (e) => {
        handleFiles([...(e.target?.files || [])]);
        e.target.value = "";
    };

    const removeFrame = (id) => {
        const f = frames.find((x) => x.id === id);
        const name = f?.name ? ` "${f.name}"` : "";
        if (!confirm(`Delete${name}?`)) return;
        setFrames((prev) => prev.filter((x) => x.id !== id));
    };

    const moveFrame = (idx, dir) => {
        if (idx < 0 || idx >= frames.length) return;
        const newIdx = dir === "up" ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= frames.length) return;
        const clone = [...frames];
        const [item] = clone.splice(idx, 1);
        clone.splice(newIdx, 0, item);
        setFrames(clone);
    };

    const clearAll = () => {
        if (!frames.length) return;
        if (!confirm("Clear all frames?")) return;
        setFrames([]);
        setGifDataUri("");
    };

    const canGenerate = useMemo(
        () => frames.length >= 2 && engineReady && !isGenerating,
        [frames.length, engineReady, isGenerating]
    );

    const generate = () => {
        if (!window.gifshot) {
            setErrMsg("GIF engine not ready yet.");
            return;
        }
        if (frames.length < 2) {
            setErrMsg("Add at least two images.");
            return;
        }

        setIsGenerating(true);
        setProgress(0);
        setErrMsg("");
        setGifDataUri("");

        const images = frames.map((f) => f.dataUrl);
        const width = Math.max(16, Number(gifWidth) || 320);
        const height = Math.max(16, Number(gifHeight) || 240);
        const interval = Math.max(10, Number(delayMs) || 150) / 1000; // seconds

        try {
            window.gifshot.createGIF(
                {
                    images,
                    gifWidth: width,
                    gifHeight: height,
                    interval,
                    repeat: 0,
                    numWorkers: 2,
                    sampleInterval: 10,
                    background: "#000",
                    crossOrigin: "Anonymous",
                    progressCallback: (p) => {
                        const pct = Math.max(0, Math.min(100, Math.round((p || 0) * 100)));
                        setProgress(pct);
                    },
                },
                (obj) => {
                    setIsGenerating(false);
                    if (obj.error) {
                        setErrMsg(typeof obj.error === "string" ? obj.error : "Failed to generate GIF.");
                        return;
                    }
                    setGifDataUri(obj.image); // data:image/gif;base64,...
                }
            );
        } catch {
            setIsGenerating(false);
            setErrMsg("GIF generation failed. Try smaller dimensions or fewer frames.");
        }
    };

    return (
        <Styled.Wrapper>
            <header className="header">
                <h2>GIF Generator</h2>
                <p className="muted">Drop images → arrange → set size & delay → Generate GIF → Download.</p>
                <div className="status">
                    <span className={`chip ${engineReady ? "ok" : ""}`}>gif engine {engineReady ? "ready" : "…"}</span>
                </div>
            </header>

            <div className="grid">
                <section className="panel">
                    <div className="dropzone" ref={dropRef} onClick={handlePick} title="Drop images here or click to pick">
                        <div className="dz-inner">
                            <b>Drop images</b> or <span className="link">browse</span>
                            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={onFileChange} style={{ display: "none" }} />
                        </div>
                    </div>

                    <div className="framesHead">
                        <h4>Frames ({frames.length})</h4>
                        <div className="spacer" />
                        <button className="ghost" onClick={handlePick}>Add</button>
                        <button className="danger" onClick={clearAll}>Clear</button>
                    </div>

                    <ul className="frames">
                        {frames.map((f, idx) => (
                            <li key={f.id} className="frame">
                                <div className="thumb"><img src={f.dataUrl} alt={f.name || `frame-${idx + 1}`} /></div>
                                <div className="meta">
                                    <div className="name" title={f.name}>{idx + 1}. {f.name || "frame"}</div>
                                    <div className="row">
                                        <button className="ghost" onClick={() => moveFrame(idx, "up")} aria-label="Move up">↑</button>
                                        <button className="ghost" onClick={() => moveFrame(idx, "down")} aria-label="Move down">↓</button>
                                        <button className="danger" onClick={() => removeFrame(f.id)} aria-label="Remove">✕</button>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {!frames.length && <li className="empty">No frames yet. Add a few images.</li>}
                    </ul>
                </section>

                <section className="panel">
                    <div className="settings">
                        <h4>Settings</h4>
                        <div className="row">
                            <label htmlFor="gifWidth">Width</label>
                            <input id="gifWidth" type="number" min="16" step="1" value={gifWidth} onChange={(e) => setGifWidth(e.target.value)} />
                        </div>
                        <div className="row">
                            <label htmlFor="gifHeight">Height</label>
                            <input id="gifHeight" type="number" min="16" step="1" value={gifHeight} onChange={(e) => setGifHeight(e.target.value)} />
                        </div>
                        <div className="row">
                            <label htmlFor="delayMs">Delay (ms)</label>
                            <input id="delayMs" type="number" min="10" step="10" value={delayMs} onChange={(e) => setDelayMs(e.target.value)} />
                        </div>
                        <div className="actions">
                            <button className="primary" disabled={!canGenerate} onClick={generate}>
                                {isGenerating ? `Generating… ${progress}%` : "Generate GIF"}
                            </button>
                        </div>
                        {!!errMsg && <p className="error">{errMsg}</p>}
                    </div>

                    <div className="output">
                        <h4>Output</h4>
                        <div className="preview">
                            {gifDataUri ? (
                                <>
                                    <img src={gifDataUri} alt="Generated GIF preview" />
                                    <div className="row">
                                        <a className="primary" href={gifDataUri} download="animated.gif">Download GIF</a>
                                    </div>
                                </>
                            ) : <div className="placeholder">Your GIF will appear here after generation.</div>}
                        </div>
                    </div>
                </section>
            </div>

            <footer className="tips muted small">Tip: If generation fails, reduce image sizes or width/height.</footer>
        </Styled.Wrapper>
    );
}

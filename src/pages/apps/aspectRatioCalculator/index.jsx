import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/* =========================================================
   Helpers
   ========================================================= */
const MB = 1024 * 1024;
const ACCEPTED_IMAGE = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

function gcd(a, b) {
    a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b));
    while (b) { const t = b; b = a % b; a = t; }
    return a || 1;
}
function simplifyRatio(w, h) {
    const g = gcd(w, h);
    return [Math.max(1, Math.round(w / g)), Math.max(1, Math.round(h / g))];
}
function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
function fmt(n, d = 0) { return Number.isFinite(n) ? Number(n.toFixed(d)) : 0; }
function uid() { return Math.random().toString(36).slice(2, 9); }

/* Simple confirm modal */
const ConfirmModal = ({ open, title = "Confirm", message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel }) => {
    if (!open) return null;
    return (
        <Styled.ModalOverlay role="dialog" aria-modal="true">
            <Styled.ModalCard>
                <header><h3>{title}</h3></header>
                <p className="modal-message">{message}</p>
                <footer className="modal-actions">
                    <button className="ghost" onClick={onCancel}>{cancelText}</button>
                    <button onClick={onConfirm}>{confirmText}</button>
                </footer>
            </Styled.ModalCard>
        </Styled.ModalOverlay>
    );
};

/* =========================================================
   Constants / Local Storage Keys
   ========================================================= */
const LS_STATE = "aspectRatioCalc_state_v1";
const LS_SAVED = "aspectRatioCalc_saved_v1";

const PRESETS = [
    { name: "Square", w: 1, h: 1 },
    { name: "3:2", w: 3, h: 2 },
    { name: "4:3", w: 4, h: 3 },
    { name: "16:9", w: 16, h: 9 },
    { name: "21:9", w: 21, h: 9 },
    { name: "A4 Portrait (~1:1.414)", w: 1, h: 1.4142 },
    { name: "A4 Landscape (~1.414:1)", w: 1.4142, h: 1 },
];

const initial = {
    ratioW: 16,
    ratioH: 9,
    width: 1280,
    height: 720,
    lock: true,
    fit: "contain", // contain | cover | fill
    grid: false,
    round: 0,
    scale: 60,
    bgShade: 0.08,
    useCssAR: true,
    fileName: "",
    imgNaturalW: 0,
    imgNaturalH: 0,
};

const AspectRatioCalculator = () => {
    const [state, setState] = useState(() => {
        try { return { ...initial, ...(JSON.parse(localStorage.getItem(LS_STATE) || "null") || {}) }; }
        catch { return initial; }
    });
    const [imgUrl, setImgUrl] = useState(null);
    const [imgError, setImgError] = useState("");
    const [saved, setSaved] = useState(() => {
        try { return JSON.parse(localStorage.getItem(LS_SAVED) || "[]"); } catch { return []; }
    });

    const [confirm, setConfirm] = useState({ open: false, kind: "", payload: null });

    const imgRef = useRef(null);
    const canvasRef = useRef(null);

    /* Persist settings */
    useEffect(() => {
        try { localStorage.setItem(LS_STATE, JSON.stringify(state)); } catch { }
    }, [state]);

    useEffect(() => {
        try { localStorage.setItem(LS_SAVED, JSON.stringify(saved)); } catch { }
    }, [saved]);

    /* Image load sync */
    const onImgLoad = (e) => {
        const el = e.currentTarget;
        const nw = el.naturalWidth || 0;
        const nh = el.naturalHeight || 0;
        const [rw, rh] = simplifyRatio(nw, nh);
        setState((s) => ({
            ...s,
            imgNaturalW: nw,
            imgNaturalH: nh,
            width: nw || s.width,
            height: nh || s.height,
            ratioW: rw || s.ratioW,
            ratioH: rh || s.ratioH,
        }));
    };

    const ratio = useMemo(() => {
        const g = gcd(state.ratioW, state.ratioH);
        return { w: Math.max(1, Math.round(state.ratioW / g)), h: Math.max(1, Math.round(state.ratioH / g)) };
    }, [state.ratioW, state.ratioH]);

    const cssAspectRatio = `${ratio.w} / ${ratio.h}`;

    function setField(k, v) { setState((s) => ({ ...s, [k]: v })); }

    function applyPreset(p) {
        const [rw, rh] = simplifyRatio(p.w, p.h);
        let w = state.width, h = state.height;
        if (state.lock) h = Math.max(1, Math.round((w * rh) / rw));
        setState((s) => ({ ...s, ratioW: rw, ratioH: rh, height: h }));
    }

    function handleWidthChange(val) {
        const width = clamp(parseFloat(val) || 0, 1, 99999);
        if (state.lock) {
            const height = Math.max(1, Math.round((width * ratio.h) / ratio.w));
            setState((s) => ({ ...s, width: fmt(width, s.round), height: fmt(height, s.round) }));
        } else setState((s) => ({ ...s, width: fmt(width, s.round) }));
    }

    function handleHeightChange(val) {
        const height = clamp(parseFloat(val) || 0, 1, 99999);
        if (state.lock) {
            const width = Math.max(1, Math.round((height * ratio.w) / ratio.h));
            setState((s) => ({ ...s, height: fmt(height, s.round), width: fmt(width, s.round) }));
        } else setState((s) => ({ ...s, height: fmt(height, s.round) }));
    }

    function handleRatioW(val) {
        const n = clamp(parseFloat(val) || 1, 1, 9999);
        const [rw, rh] = simplifyRatio(n, state.ratioH);
        let h = state.height;
        if (state.lock) h = Math.max(1, Math.round((state.width * rh) / rw));
        setState((s) => ({ ...s, ratioW: rw, ratioH: rh, height: h }));
    }

    function handleRatioH(val) {
        const n = clamp(parseFloat(val) || 1, 1, 9999);
        const [rw, rh] = simplifyRatio(state.ratioW, n);
        let h = state.height;
        if (state.lock) h = Math.max(1, Math.round((state.width * rh) / rw));
        setState((s) => ({ ...s, ratioW: rw, ratioH: rh, height: h }));
    }

    function onDrop(e) {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
    }
    function onFileInput(e) {
        const file = e.target.files?.[0];
        if (file) onFile(file);
    }
    function onFile(file) {
        setImgError("");
        if (!ACCEPTED_IMAGE.includes(file.type)) { setImgError("Upload JPG/PNG/WEBP image."); return; }
        if (file.size > 6 * MB) { setImgError("Image must be under 6 MB."); return; }
        const url = URL.createObjectURL(file);
        setImgUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
        setField("fileName", file.name);
    }

    function ask(kind, payload = null) { setConfirm({ open: true, kind, payload }); }
    function closeAsk() { setConfirm({ open: false, kind: "", payload: null }); }
    function confirmAction() {
        const { kind, payload } = confirm;
        if (kind === "clear-image") {
            if (imgUrl) URL.revokeObjectURL(imgUrl);
            setImgUrl(null); setImgError("");
            setState((s) => ({ ...s, fileName: "", imgNaturalW: 0, imgNaturalH: 0 }));
        }
        if (kind === "reset-all") {
            if (imgUrl) URL.revokeObjectURL(imgUrl);
            setImgUrl(null); setImgError(""); setState(initial);
        }
        if (kind === "delete-saved") setSaved((arr) => arr.filter((x) => x.id !== payload));
        closeAsk();
    }

    function copyCss() {
        const css = [
            `/* quick CSS for the box */`,
            `.box {`,
            `  aspect-ratio: ${cssAspectRatio};`,
            `  width: ${state.width}px;`,
            `  /* height auto will be computed by aspect-ratio */`,
            `  background: #000;`,
            `}`,
        ].join("\n");
        navigator.clipboard?.writeText(css);
    }

    function savePreset() {
        const name = prompt("Name this preset (e.g., 16:9 Banner)?", `${state.ratioW}:${state.ratioH}`);
        if (!name) return;
        const item = {
            id: uid(),
            name,
            ratioW: ratio.w,
            ratioH: ratio.h,
            width: state.width,
            height: state.height,
            createdAt: new Date().toISOString(),
        };
        setSaved((arr) => [item, ...arr]);
    }

    function exportPng() {
        if (!imgRef.current || !canvasRef.current) return;
        const img = imgRef.current;
        const W = Math.max(1, Math.round(state.width));
        const H = Math.max(1, Math.round(state.height));
        const cnv = canvasRef.current;
        cnv.width = W; cnv.height = H;
        const ctx = cnv.getContext("2d");
        ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);

        const iw = img.naturalWidth || 1;
        const ih = img.naturalHeight || 1;

        if (state.fit === "fill") {
            ctx.drawImage(img, 0, 0, W, H);
        } else if (state.fit === "contain") {
            const scale = Math.min(W / iw, H / ih);
            const dw = Math.round(iw * scale);
            const dh = Math.round(ih * scale);
            const dx = Math.round((W - dw) / 2);
            const dy = Math.round((H - dh) / 2);
            ctx.drawImage(img, dx, dy, dw, dh);
        } else if (state.fit === "cover") {
            const scale = Math.max(W / iw, H / ih);
            const sw = Math.round(W / scale);
            const sh = Math.round(H / scale);
            const sx = Math.round((iw - sw) / 2);
            const sy = Math.round((ih - sh) / 2);
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
        }

        const link = document.createElement("a");
        link.download = (state.fileName ? state.fileName.replace(/\.[a-z]+$/i, "") : "preview") + `_${W}x${H}.png`;
        link.href = cnv.toDataURL("image/png");
        link.click();
    }

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div>
                    <h1>Aspect Ratio Calculator</h1>
                    <p>Upload an image, choose a ratio, and get live previews. Export PNG or copy CSS.</p>
                </div>
                <Styled.Badges>
                    <span className="badge">Preview</span>
                    <span className="badge">Export PNG</span>
                    <span className="badge">Copy CSS</span>
                </Styled.Badges>
            </Styled.Header>

            <Styled.Layout>
                {/* Left: Controls */}
                <Styled.Card as="section">
                    {/* Upload */}
                    <Styled.Section>
                        <Styled.SectionTitle>1) Image</Styled.SectionTitle>
                        <Styled.Grid cols="3">
                            <Styled.Field className="span2">
                                <label htmlFor="file">Upload (JPG/PNG/WEBP, &lt; 6MB)</label>
                                <Styled.DropZone
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={onDrop}
                                    data-hasfile={!!imgUrl}
                                    tabIndex={0}
                                >
                                    {imgUrl ? (
                                        <div className="dz-hasfile">
                                            <span className="name">{state.fileName || "image"}</span>
                                            <div className="actions">
                                                <button type="button" className="ghost" onClick={() => ask("clear-image")}>Remove</button>
                                                <button type="button" onClick={exportPng} disabled={!imgUrl}>Export PNG</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="dz-empty">
                                            <p>Drag & drop an image here, or select a file</p>
                                            <label className="btnlike" htmlFor="file">Choose File</label>
                                        </div>
                                    )}
                                    <input id="file" name="file" type="file" accept="image/*" onChange={onFileInput} />
                                </Styled.DropZone>
                                <Styled.Error role="alert">{imgError}</Styled.Error>
                                {!!(state.imgNaturalW && state.imgNaturalH) && (
                                    <Styled.Help>Detected: {state.imgNaturalW} × {state.imgNaturalH}</Styled.Help>
                                )}
                            </Styled.Field>

                            <Styled.Field>
                                <label>Fit</label>
                                <select value={state.fit} onChange={(e) => setField("fit", e.target.value)}>
                                    <option value="contain">Contain</option>
                                    <option value="cover">Cover</option>
                                    <option value="fill">Fill</option>
                                </select>
                            </Styled.Field>
                        </Styled.Grid>
                    </Styled.Section>

                    {/* Ratio */}
                    <Styled.Section>
                        <Styled.SectionTitle>2) Ratio</Styled.SectionTitle>
                        <Styled.Grid cols="4">
                            <Styled.Field>
                                <label htmlFor="rw">W</label>
                                <input id="rw" type="number" min="1" step="1" value={state.ratioW} onChange={(e) => handleRatioW(e.target.value)} />
                            </Styled.Field>
                            <Styled.Field mid=":"></Styled.Field>
                            <Styled.Field>
                                <label htmlFor="rh">H</label>
                                <input id="rh" type="number" min="1" step="1" value={state.ratioH} onChange={(e) => handleRatioH(e.target.value)} />
                            </Styled.Field>
                            <Styled.Field>
                                <label>&nbsp;</label>
                                <label className="checkbox">
                                    <input type="checkbox" checked={state.lock} onChange={(e) => setField("lock", !!e.target.checked)} />
                                    <span>Lock ratio</span>
                                </label>
                            </Styled.Field>
                        </Styled.Grid>

                        <Styled.Presets>
                            {PRESETS.map((p) => (
                                <button key={p.name} type="button" onClick={() => applyPreset(p)}>{p.name}</button>
                            ))}
                            <button type="button" className="ghost" onClick={savePreset}>Save Preset</button>
                        </Styled.Presets>
                    </Styled.Section>

                    {/* Size */}
                    <Styled.Section>
                        <Styled.SectionTitle>3) Size</Styled.SectionTitle>
                        <Styled.Grid cols="4">
                            <Styled.Field>
                                <label htmlFor="width">Width (px)</label>
                                <input id="width" type="number" min="1" value={state.width} onChange={(e) => handleWidthChange(e.target.value)} />
                            </Styled.Field>
                            <Styled.Field mid="×"></Styled.Field>
                            <Styled.Field>
                                <label htmlFor="height">Height (px)</label>
                                <input id="height" type="number" min="1" value={state.height} onChange={(e) => handleHeightChange(e.target.value)} />
                            </Styled.Field>
                            <Styled.Field>
                                <label htmlFor="round">Round</label>
                                <select id="round" value={state.round} onChange={(e) => setField("round", parseInt(e.target.value || "0"))}>
                                    <option value="0">0 decimals</option>
                                    <option value="1">1 decimal</option>
                                    <option value="2">2 decimals</option>
                                </select>
                            </Styled.Field>
                        </Styled.Grid>

                        <Styled.Grid cols="3">
                            <Styled.Field>
                                <label htmlFor="scale">Preview Scale: {state.scale}%</label>
                                <input id="scale" type="range" min="10" max="100" step="1" value={state.scale} onChange={(e) => setField("scale", parseInt(e.target.value || "60"))} />
                            </Styled.Field>
                            <Styled.Field>
                                <label className="checkbox">
                                    <input type="checkbox" checked={state.grid} onChange={(e) => setField("grid", !!e.target.checked)} />
                                    <span>Show grid overlay</span>
                                </label>
                            </Styled.Field>
                            <Styled.Field>
                                <label className="checkbox">
                                    <input type="checkbox" checked={state.useCssAR} onChange={(e) => setField("useCssAR", !!e.target.checked)} />
                                    <span>Use CSS <code>aspect-ratio</code></span>
                                </label>
                            </Styled.Field>
                        </Styled.Grid>
                    </Styled.Section>

                    {/* Actions */}
                    <Styled.Actions>
                        <button type="button" onClick={copyCss}>Copy CSS</button>
                        <button type="button" onClick={exportPng} disabled={!imgUrl}>Export PNG</button>
                        <div className="spacer" />
                        <button type="button" className="ghost" onClick={() => ask("reset-all")}>Reset All</button>
                    </Styled.Actions>
                </Styled.Card>

                {/* Right: Preview + Saved */}
                <Styled.Side>
                    <Styled.Card>
                        <h3>Preview</h3>
                        <Styled.PreviewWrap>
                            <Styled.PreviewBox
                                data-grid={state.grid ? "1" : "0"}
                                style={{
                                    width: `${state.scale}%`,
                                    maxWidth: "100%",
                                    ...(state.useCssAR
                                        ? { aspectRatio: cssAspectRatio }
                                        : { height: `${Math.round((state.scale / 100) * state.height)}px` }),
                                    backgroundColor: `rgba(0,0,0,${state.bgShade})`,
                                }}
                            >
                                {imgUrl ? (
                                    <img
                                        ref={imgRef}
                                        src={imgUrl}
                                        alt="preview"
                                        onLoad={onImgLoad}
                                        style={{ objectFit: state.fit, width: "100%", height: "100%" }}
                                    />
                                ) : (
                                    <div className="placeholder"><span>{ratio.w}:{ratio.h}</span></div>
                                )}
                                {state.grid && <div className="grid" aria-hidden />}
                            </Styled.PreviewBox>
                        </Styled.PreviewWrap>
                        <p className="muted">Aspect: <strong>{ratio.w}:{ratio.h}</strong> — CSS: <code>aspect-ratio: {ratio.w} / {ratio.h}</code></p>
                        <canvas ref={canvasRef} width="0" height="0" style={{ display: "none" }} />
                    </Styled.Card>

                    <Styled.Card>
                        <h3>Saved Presets</h3>
                        {saved.length === 0 && <p className="muted">No saved presets yet.</p>}
                        <Styled.SavedList>
                            {saved.map((it) => (
                                <li key={it.id}>
                                    <div className="meta">
                                        <strong>{it.name}</strong>
                                        <span>{it.ratioW}:{it.ratioH} — {it.width}×{it.height}</span>
                                    </div>
                                    <div className="row-actions">
                                        <button
                                            className="ghost"
                                            onClick={() => {
                                                setState((s) => ({
                                                    ...s,
                                                    ratioW: it.ratioW,
                                                    ratioH: it.ratioH,
                                                    width: it.width,
                                                    height: it.height,
                                                    lock: true,
                                                }));
                                            }}
                                        >
                                            Apply
                                        </button>
                                        <button onClick={() => ask("delete-saved", it.id)}>Delete</button>
                                    </div>
                                </li>
                            ))}
                        </Styled.SavedList>
                    </Styled.Card>
                </Styled.Side>
            </Styled.Layout>

            {/* Modals */}
            <ConfirmModal
                open={confirm.open}
                title={
                    confirm.kind === "clear-image" ? "Remove Image"
                        : confirm.kind === "reset-all" ? "Reset All"
                            : "Delete Preset"
                }
                message={
                    confirm.kind === "clear-image" ? "Remove the current image from the preview?"
                        : confirm.kind === "reset-all" ? "Reset all settings to default and clear image?"
                            : "Delete this saved preset?"
                }
                confirmText="Yes"
                cancelText="Cancel"
                onConfirm={confirmAction}
                onCancel={closeAsk}
            />
        </Styled.Wrapper>
    );
};

export default AspectRatioCalculator;

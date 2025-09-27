import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/* -------------------------
   Storage & helpers
------------------------- */
const STORAGE_KEY = "drawingApp.v1";

/** Compact random id */
const uid = () =>
(crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`);

/** Safe LocalStorage IO */
const safeGet = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}; }
    catch { return {}; }
};
const safeSet = (obj) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch { }
};

/** Normalize point → store as 0..1 (so replay scales with canvas size) */
const toNorm = (x, y, w, h) => [x / w, y / h];
const fromNorm = (nx, ny, w, h) => [nx * w, ny * h];

/** Replay a single stroke on a given ctx */
function paintStroke(ctx, stroke, w, h) {
    const { mode, color, size, pts } = stroke;
    if (!pts || pts.length === 0) return;

    const prevOp = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = mode === "erase" ? "destination-out" : "source-over";
    ctx.strokeStyle = color || "#fff";
    ctx.lineWidth = Math.max(0.5, Number(size) || 2);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    // move to first
    const [x0, y0] = fromNorm(pts[0][0], pts[0][1], w, h);
    ctx.moveTo(x0, y0);

    for (let i = 1; i < pts.length; i++) {
        const [x, y] = fromNorm(pts[i][0], pts[i][1], w, h);
        ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalCompositeOperation = prevOp;
}

/** Replay all strokes */
function repaintAll(ctx, strokes, w, h, bg) {
    // clear
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = bg || "transparent";
    ctx.clearRect(0, 0, w, h);
    if (bg && bg !== "transparent") {
        ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();

    for (const s of strokes) paintStroke(ctx, s, w, h);
}

/* -------------------------
   Main
------------------------- */
export default function DrawingApp() {
    const persisted = safeGet();

    // tool settings
    const [tool, setTool] = useState(persisted.tool ?? "brush"); // "brush" | "erase"
    const [color, setColor] = useState(persisted.color ?? "#00d1ff");
    const [size, setSize] = useState(persisted.size ?? 6);
    const [exportWhiteBg, setExportWhiteBg] = useState(persisted.exportWhiteBg ?? true);

    // strokes & history
    const [strokes, setStrokes] = useState(persisted.strokes ?? []); // {id, mode, color, size, pts:[[nx,ny],...]}
    const [redo, setRedo] = useState([]);

    // ui
    const [toast, setToast] = useState("");
    const toastTimer = useRef(null);
    const [confirm, setConfirm] = useState(null);

    // canvas refs
    const wrapperRef = useRef(null);
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const dprRef = useRef(1);
    const drawingRef = useRef({ active: false, strokeId: null });

    // derived counts
    const canUndo = strokes.length > 0;
    const canRedo = redo.length > 0;

    // persist
    useEffect(() => {
        safeSet({ tool, color, size, strokes, exportWhiteBg });
    }, [tool, color, size, strokes, exportWhiteBg]);

    /* -------------------------
       Canvas sizing (DPR aware)
    ------------------------- */
    const resizeCanvas = () => {
        const wrap = wrapperRef.current;
        const canvas = canvasRef.current;
        if (!wrap || !canvas) return;

        const rect = wrap.getBoundingClientRect();
        const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
        dprRef.current = dpr;

        canvas.width = Math.max(1, Math.floor(rect.width * dpr));
        canvas.height = Math.max(1, Math.floor((rect.height || 480) * dpr));

        canvas.style.width = `${Math.floor(rect.width)}px`;
        canvas.style.height = `${Math.floor(rect.height || 480)}px`;

        const ctx = canvas.getContext("2d");
        ctxRef.current = ctx;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // scale drawing units to CSS pixels

        // repaint at new size
        repaintAll(ctx, strokes, canvas.width / dpr, canvas.height / dpr, null);
    };

    useEffect(() => {
        resizeCanvas();
        const ro = new ResizeObserver(resizeCanvas);
        if (wrapperRef.current) ro.observe(wrapperRef.current);
        const onResize = () => resizeCanvas();
        window.addEventListener("resize", onResize);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", onResize);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // repaint when strokes change (e.g., undo/redo)
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;
        const dpr = dprRef.current;
        repaintAll(ctx, strokes, canvas.width / dpr, canvas.height / dpr, null);
    }, [strokes]);

    /* -------------------------
       Drawing (pointer events)
    ------------------------- */
    const addPoint = (cx, cy) => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;

        const dpr = dprRef.current;
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;

        // normalize & store
        setStrokes((prev) => {
            const idx = prev.findIndex((s) => s.id === drawingRef.current.strokeId);
            if (idx === -1) return prev;
            const next = prev.slice();
            const s = { ...next[idx] };
            const nx = cx / w;
            const ny = cy / h;

            // incremental draw
            const last = s.pts.length ? s.pts[s.pts.length - 1] : null;
            s.pts = [...s.pts, [nx, ny]];
            next[idx] = s;

            // draw just the last segment for perf
            if (last) {
                const [px, py] = fromNorm(last[0], last[1], w, h);
                const [x, y] = [cx, cy];

                const prevOp = ctx.globalCompositeOperation;
                ctx.globalCompositeOperation = s.mode === "erase" ? "destination-out" : "source-over";
                ctx.strokeStyle = s.color;
                ctx.lineWidth = Math.max(0.5, Number(s.size) || 2);
                ctx.lineCap = "round";
                ctx.lineJoin = "round";

                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.globalCompositeOperation = prevOp;
            }
            return next;
        });
    };

    const pointerPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left);
        const y = (e.clientY - rect.top);
        return [x, y];
    };

    const onPointerDown = (e) => {
        e.preventDefault();
        canvasRef.current.setPointerCapture?.(e.pointerId);

        const [x, y] = pointerPos(e);
        const id = uid();
        drawingRef.current = { active: true, strokeId: id };

        // ✅ Use slider size directly for mouse/touch; pressure only for pens
        const isPen = e.pointerType === "pen";
        const pressure = isPen ? (e.pressure || 1) : 1;
        const effectiveSize = Math.max(1, Number(size) || 1) * pressure;

        setStrokes((prev) => [
            ...prev,
            { id, mode: tool === "erase" ? "erase" : "brush", color, size: effectiveSize, pts: [] },
        ]);
        setRedo([]);
        addPoint(x, y);
    };


    const onPointerMove = (e) => {
        if (!drawingRef.current.active) return;
        const [x, y] = pointerPos(e);
        addPoint(x, y);
    };

    const endStroke = () => {
        drawingRef.current.active = false;
        drawingRef.current.strokeId = null;
    };

    const onPointerUp = () => endStroke();
    const onPointerCancel = () => endStroke();
    const onPointerLeave = () => endStroke();

    /* -------------------------
       Actions
    ------------------------- */
    const undo = () => {
        if (!canUndo) return;
        setStrokes((prev) => {
            const next = prev.slice(0, -1);
            setRedo((r) => [prev[prev.length - 1], ...r]);
            return next;
        });
    };
    const redoAction = () => {
        if (!canRedo) return;
        setRedo((r) => {
            const [first, ...rest] = r;
            if (!first) return r;
            setStrokes((s) => [...s, first]);
            return rest;
        });
    };

    const askClear = () => {
        if (!strokes.length) return;
        setConfirm({
            title: "Clear canvas?",
            message: "This will remove all strokes. You can't undo after clearing.",
            confirmText: "Clear",
            tone: "danger",
            onConfirm: () => {
                setStrokes([]);
                setRedo([]);
                setConfirm(null);
                pulse("Canvas cleared");
            },
        });
    };

    const savePNG = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // If export with white background, compose on offscreen canvas
        if (exportWhiteBg) {
            const off = document.createElement("canvas");
            off.width = canvas.width;
            off.height = canvas.height;
            const octx = off.getContext("2d");
            octx.fillStyle = "#fff";
            octx.fillRect(0, 0, off.width, off.height);
            octx.drawImage(canvas, 0, 0);
            const url = off.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = url;
            a.download = `drawing-${Date.now()}.png`;
            a.click();
        } else {
            const url = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = url;
            a.download = `drawing-${Date.now()}.png`;
            a.click();
        }
        pulse("PNG saved");
    };

    const pulse = (text) => {
        setToast(text);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(""), 1200);
    };

    /* Keyboard shortcuts */
    useEffect(() => {
        const onKey = (e) => {
            const mod = e.ctrlKey || e.metaKey;
            if (mod && e.key.toLowerCase() === "z") {
                e.preventDefault();
                if (e.shiftKey) redoAction();
                else undo();
            } else if (mod && e.key.toLowerCase() === "y") {
                e.preventDefault();
                redoAction();
            } else if (e.key.toLowerCase() === "b") {
                setTool("brush");
            } else if (e.key.toLowerCase() === "e") {
                setTool("erase");
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [canUndo, canRedo]);

    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        {/* Title */}
                        <Styled.Title>Drawing App (Canvas)</Styled.Title>

                        {/* spacing per your rules */}
                        <div style={{ height: 8 }} />

                        {/* Para 1: what this project is */}
                        <Styled.Sub>
                            A simple, offline-first paint-like app powered by the HTML canvas. It supports brush and eraser,
                            undo/redo, clear, and exporting your art as PNG. Your strokes and tool settings persist locally.
                        </Styled.Sub>

                        {/* space below para 1 */}
                        <div style={{ height: 6 }} />

                        {/* Para 2: how to use (bullet steps) */}
                        <Styled.BulletList aria-label="How to use">
                            <Styled.BulletItem>Pick a color and size, then draw with your mouse or finger.</Styled.BulletItem>
                            <Styled.BulletItem>Toggle Brush/Eraser, use Undo/Redo, or Clear the canvas (asks confirmation).</Styled.BulletItem>
                            <Styled.BulletItem>Click Save PNG to download (with optional white background).</Styled.BulletItem>
                            <Styled.BulletItem>Shortcuts: Ctrl/Cmd+Z (Undo), Ctrl/Cmd+Shift+Z or +Y (Redo), B (Brush), E (Eraser).</Styled.BulletItem>
                        </Styled.BulletList>

                        {/* space below bullet list */}
                        <div style={{ height: 10 }} />
                    </div>

                    {/* Quick badges */}
                    <Styled.BadgeRow>
                        <Styled.Tag>Strokes: {strokes.length}</Styled.Tag>
                        <Styled.Tag>Undo: {canUndo ? "Yes" : "No"}</Styled.Tag>
                        <Styled.Tag>Redo: {canRedo ? "Yes" : "No"}</Styled.Tag>
                    </Styled.BadgeRow>
                </Styled.Header>

                {/* Controls */}
                <Styled.Card>
                    <Styled.FormRow>
                        {/* Tool */}
                        <Styled.Label title="Choose drawing tool">
                            <Styled.LabelText>Tool</Styled.LabelText>
                            <Styled.RowWrap>
                                <Styled.Toggle
                                    $active={tool === "brush"}
                                    onClick={() => setTool("brush")}
                                    title="Brush (B)"
                                >
                                    Brush
                                </Styled.Toggle>
                                <Styled.Toggle
                                    $active={tool === "erase"}
                                    onClick={() => setTool("erase")}
                                    title="Eraser (E)"
                                >
                                    Eraser
                                </Styled.Toggle>
                            </Styled.RowWrap>
                        </Styled.Label>

                        {/* Color */}
                        <Styled.Label title="Brush color">
                            <Styled.LabelText>Color</Styled.LabelText>
                            <Styled.ColorRow>
                                <Styled.ColorInput
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    aria-label="Color"
                                />
                                <Styled.Swatch $c={color} />
                            </Styled.ColorRow>
                        </Styled.Label>

                        {/* Size */}
                        <Styled.Label title="Brush size">
                            <Styled.LabelText>Size ({size}px)</Styled.LabelText>
                            <Styled.Range
                                min={1}
                                max={40}
                                step={1}
                                value={size}
                                onChange={(e) => setSize(Number(e.target.value) || 1)}
                                aria-label="Brush size"
                            />
                        </Styled.Label>

                        {/* Export options */}
                        <Styled.Label title="Export background">
                            <Styled.LabelText>Export</Styled.LabelText>
                            <label style={{ fontSize: 12, opacity: 0.9 }}>
                                <input
                                    type="checkbox"
                                    checked={exportWhiteBg}
                                    onChange={(e) => setExportWhiteBg(e.target.checked)}
                                    style={{ verticalAlign: "middle", marginRight: 6 }}
                                />
                                White background on PNG
                            </label>
                        </Styled.Label>

                        {/* Action buttons */}
                        <Styled.RowWrap>
                            <Styled.Button type="button" onClick={undo} disabled={!canUndo} title="Undo (Ctrl/Cmd+Z)">
                                Undo
                            </Styled.Button>
                            <Styled.Button type="button" onClick={redoAction} disabled={!canRedo} title="Redo (Ctrl/Cmd+Shift+Z)">
                                Redo
                            </Styled.Button>
                            <Styled.DangerButton type="button" onClick={askClear} disabled={!strokes.length} title="Clear canvas">
                                Clear
                            </Styled.DangerButton>
                            <Styled.PrimaryButton type="button" onClick={savePNG} title="Save image as PNG">
                                Save PNG
                            </Styled.PrimaryButton>
                        </Styled.RowWrap>
                    </Styled.FormRow>
                </Styled.Card>

                {/* Canvas area */}
                <Styled.CanvasCard>
                    <Styled.CanvasWrap ref={wrapperRef}>
                        <Styled.Canvas
                            ref={canvasRef}
                            onContextMenu={(e) => e.preventDefault()}
                            onPointerDown={onPointerDown}
                            onPointerMove={onPointerMove}
                            onPointerUp={onPointerUp}
                            onPointerLeave={onPointerLeave}
                            onPointerCancel={onPointerCancel}
                        />
                    </Styled.CanvasWrap>
                </Styled.CanvasCard>

                <Styled.FooterNote>
                    Data stays in your browser (LocalStorage). Works offline.
                </Styled.FooterNote>

                {/* Toast */}
                {toast && <Styled.Toast role="status" aria-live="polite">{toast}</Styled.Toast>}

                {/* Confirm Modal */}
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

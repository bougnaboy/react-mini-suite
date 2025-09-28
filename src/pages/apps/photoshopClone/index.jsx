import React, { useEffect, useRef, useState } from "react";
import { Styled } from "./styled";

const defaults = {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    hue: 0,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    invert: 0,
    rotation: 0,
    flipH: false,
    flipV: false,
    zoom: 1,
    brushSize: 8,
    brushColor: "#ffffff",
    drawEnabled: false,
};

export default function PhotoshopClone() {
    const [imageObj, setImageObj] = useState(null);
    const [state, setState] = useState(defaults);
    const [canvasSize, setCanvasSize] = useState({ w: 800, h: 500 });
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const mainCanvasRef = useRef(null);
    const drawCanvasRef = useRef(null);
    const containerRef = useRef(null);
    const isDrawingRef = useRef(false);
    const lastPointRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return;
            const maxW = containerRef.current.clientWidth - 24;
            if (imageObj && imageObj.naturalWidth) {
                const { w, h } = sizeAfterRotation(
                    imageObj.naturalWidth,
                    imageObj.naturalHeight,
                    state.rotation
                );
                const scale = Math.min(1, maxW / w);
                setCanvasSize({ w: Math.round(w * scale), h: Math.round(h * scale) });
            } else {
                setCanvasSize({ w: Math.min(900, maxW), h: 500 });
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [imageObj, state.rotation]);

    useEffect(() => {
        renderBase();
    }, [imageObj, state, canvasSize.w, canvasSize.h]);

    function onOpenFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const img = new Image();
        img.onload = () => {
            setImageObj(img);
            const containerW = containerRef.current?.clientWidth || 900;
            const { w, h } = sizeAfterRotation(img.naturalWidth, img.naturalHeight, state.rotation);
            const scale = Math.min(1, (containerW - 24) / w);
            setCanvasSize({ w: Math.round(w * scale), h: Math.round(h * scale) });
        };
        img.src = URL.createObjectURL(file);
    }

    function sizeAfterRotation(w, h, rotation) {
        return rotation % 180 === 0 ? { w, h } : { w: h, h: w };
    }

    function filterString(s) {
        return [
            `brightness(${s.brightness}%)`,
            `contrast(${s.contrast}%)`,
            `saturate(${s.saturate}%)`,
            `hue-rotate(${s.hue}deg)`,
            `blur(${s.blur}px)`,
            `grayscale(${s.grayscale}%)`,
            `sepia(${s.sepia}%)`,
            `invert(${s.invert}%)`,
        ].join(" ");
    }

    function renderBase() {
        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        canvas.width = canvasSize.w;
        canvas.height = canvasSize.h;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawCheckerboard(ctx, canvas.width, canvas.height);

        if (!imageObj) return;

        const natural = sizeAfterRotation(imageObj.naturalWidth, imageObj.naturalHeight, state.rotation);
        const scale = Math.min(canvas.width / natural.w, canvas.height / natural.h);
        const drawW = natural.w * scale;
        const drawH = natural.h * scale;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((state.rotation * Math.PI) / 180);
        const sx = state.flipH ? -1 : 1;
        const sy = state.flipV ? -1 : 1;
        ctx.scale(sx, sy);
        ctx.filter = filterString(state);

        const dx = -drawW / 2;
        const dy = -drawH / 2;
        ctx.drawImage(imageObj, dx, dy, drawW, drawH);
        ctx.restore();

        const overlay = drawCanvasRef.current;
        if (overlay) {
            overlay.width = canvas.width;
            overlay.height = canvas.height;
        }
    }

    function drawCheckerboard(ctx, w, h) {
        const size = 16;
        for (let y = 0; y < h; y += size) {
            for (let x = 0; x < w; x += size) {
                const odd = ((x / size) + (y / size)) % 2 === 1;
                ctx.fillStyle = odd ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.15)";
                ctx.fillRect(x, y, size, size);
            }
        }
    }

    function update(partial) {
        setState((prev) => ({ ...prev, ...partial }));
    }

    function resetAll() {
        setState(defaults);
        const dc = drawCanvasRef.current;
        if (dc) {
            const dctx = dc.getContext("2d");
            dctx.clearRect(0, 0, dc.width, dc.height);
        }
    }

    function handleExport() {
        const url = mergeAndGetDataURL();
        if (!url) return;
        const a = document.createElement("a");
        a.href = url;
        a.download = "edited.png";
        a.click();
    }

    // Reliable print: hidden iframe with only the merged image
    function handlePrint() {
        const url = mergeAndGetDataURL();
        if (!url) return;

        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Print</title>
    <style>
      @page { margin: 0; }
      html, body { margin:0; padding:0; background:#fff; }
      img { display:block; width:100%; height:auto; }
    </style>
  </head>
  <body>
    <img id="toPrint" src="${url}" alt="Edited"/>
  </body>
</html>`);
        doc.close();

        const onReady = () => {
            const img = doc.getElementById("toPrint");
            const go = () => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                setTimeout(() => document.body.removeChild(iframe), 300);
            };
            if (!img) { go(); return; }
            if (img.complete) go();
            else img.onload = go;
        };

        if (iframe.contentWindow.document.readyState === "complete") onReady();
        else iframe.onload = onReady;
    }

    function mergeAndGetDataURL() {
        const base = mainCanvasRef.current;
        const draw = drawCanvasRef.current;
        if (!base) return "";
        const out = document.createElement("canvas");
        out.width = base.width;
        out.height = base.height;
        const octx = out.getContext("2d");
        octx.drawImage(base, 0, 0);
        if (draw) octx.drawImage(draw, 0, 0);
        return out.toDataURL("image/png");
    }

    function onDrawStart(e) {
        if (!state.drawEnabled) return;
        isDrawingRef.current = true;
        const { x, y } = pointerPos(e);
        lastPointRef.current = { x, y };
    }
    function onDrawMove(e) {
        if (!state.drawEnabled || !isDrawingRef.current) return;
        const canvas = drawCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.lineWidth = state.brushSize;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.strokeStyle = state.brushColor;

        const { x, y } = pointerPos(e);
        const { x: lx, y: ly } = lastPointRef.current;

        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(x, y);
        ctx.stroke();

        lastPointRef.current = { x, y };
    }
    function onDrawEnd() { isDrawingRef.current = false; }

    function pointerPos(e) {
        const canvas = drawCanvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
        return {
            x: Math.max(0, Math.min(canvas.width, ((clientX - rect.left) * canvas.width) / rect.width)),
            y: Math.max(0, Math.min(canvas.height, ((clientY - rect.top) * canvas.height) / rect.height)),
        };
    }

    function clearDrawLayer() {
        const dc = drawCanvasRef.current;
        if (!dc) return;
        const dctx = dc.getContext("2d");
        dctx.clearRect(0, 0, dc.width, dc.height);
    }

    function handleConfirmReset() {
        resetAll();
        setShowResetConfirm(false);
    }
    function handleCancelReset() {
        setShowResetConfirm(false);
    }

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div className="title">Photoshop Clone</div>
                <div className="actions">
                    <label className="fileBtn">
                        <input type="file" accept="image/png,image/jpeg" onChange={onOpenFile} />
                        Open Image
                    </label>
                    <button onClick={() => setShowResetConfirm(true)}>Reset</button>
                    <button onClick={handleExport} disabled={!imageObj}>Export PNG</button>
                    <button onClick={handlePrint} disabled={!imageObj}>Print</button>
                </div>
            </Styled.Header>

            <Styled.Body>
                <Styled.Sidebar>
                    <Styled.Group>
                        <Styled.Label>Zoom</Styled.Label>
                        <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={state.zoom}
                            onChange={(e) => update({ zoom: Number(e.target.value) })}
                        />
                    </Styled.Group>

                    <Styled.Row>
                        <button onClick={() => update({ rotation: (state.rotation + 270) % 360 })}>⟲ Rotate -90</button>
                        <button onClick={() => update({ rotation: (state.rotation + 90) % 360 })}>⟳ Rotate +90</button>
                    </Styled.Row>
                    <Styled.Row>
                        <button onClick={() => update({ flipH: !state.flipH })}>{state.flipH ? "Unflip H" : "Flip H"}</button>
                        <button onClick={() => update({ flipV: !state.flipV })}>{state.flipV ? "Unflip V" : "Flip V"}</button>
                    </Styled.Row>

                    <Styled.Separator />

                    <Styled.Group>
                        <Styled.Label>Brightness: {state.brightness}%</Styled.Label>
                        <input
                            type="range"
                            min="0"
                            max="200"
                            value={state.brightness}
                            onChange={(e) => update({ brightness: Number(e.target.value) })}
                        />
                    </Styled.Group>
                    <Styled.Group>
                        <Styled.Label>Contrast: {state.contrast}%</Styled.Label>
                        <input
                            type="range"
                            min="0"
                            max="200"
                            value={state.contrast}
                            onChange={(e) => update({ contrast: Number(e.target.value) })}
                        />
                    </Styled.Group>
                    <Styled.Group>
                        <Styled.Label>Saturation: {state.saturate}%</Styled.Label>
                        <input
                            type="range"
                            min="0"
                            max="300"
                            value={state.saturate}
                            onChange={(e) => update({ saturate: Number(e.target.value) })}
                        />
                    </Styled.Group>
                    <Styled.Group>
                        <Styled.Label>Hue: {state.hue}°</Styled.Label>
                        <input
                            type="range"
                            min="-180"
                            max="180"
                            value={state.hue}
                            onChange={(e) => update({ hue: Number(e.target.value) })}
                        />
                    </Styled.Group>
                    <Styled.Group>
                        <Styled.Label>Blur: {state.blur}px</Styled.Label>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            value={state.blur}
                            onChange={(e) => update({ blur: Number(e.target.value) })}
                        />
                    </Styled.Group>
                    <Styled.Group>
                        <Styled.Label>Grayscale: {state.grayscale}%</Styled.Label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={state.grayscale}
                            onChange={(e) => update({ grayscale: Number(e.target.value) })}
                        />
                    </Styled.Group>
                    <Styled.Group>
                        <Styled.Label>Sepia: {state.sepia}%</Styled.Label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={state.sepia}
                            onChange={(e) => update({ sepia: Number(e.target.value) })}
                        />
                    </Styled.Group>
                    <Styled.Group>
                        <Styled.Label>Invert: {state.invert}%</Styled.Label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={state.invert}
                            onChange={(e) => update({ invert: Number(e.target.value) })}
                        />
                    </Styled.Group>

                    <Styled.Separator />

                    <Styled.Group>
                        <Styled.Row>
                            <button
                                onClick={() => update({ drawEnabled: !state.drawEnabled })}
                                className={state.drawEnabled ? "active" : ""}
                            >
                                {state.drawEnabled ? "Drawing: On" : "Drawing: Off"}
                            </button>
                            <button onClick={clearDrawLayer}>Clear Drawings</button>
                        </Styled.Row>
                        <Styled.Row>
                            <Styled.Label>Brush Size</Styled.Label>
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={state.brushSize}
                                onChange={(e) => update({ brushSize: Number(e.target.value) })}
                            />
                        </Styled.Row>
                        <Styled.Row>
                            <Styled.Label>Brush Color</Styled.Label>
                            <input
                                type="color"
                                value={state.brushColor}
                                onChange={(e) => update({ brushColor: e.target.value })}
                            />
                        </Styled.Row>
                    </Styled.Group>
                </Styled.Sidebar>

                <Styled.Stage ref={containerRef}>
                    <Styled.CanvasStack
                        style={{ transform: `scale(${state.zoom})` }}
                        onMouseDown={onDrawStart}
                        onMouseMove={onDrawMove}
                        onMouseUp={onDrawEnd}
                        onMouseLeave={onDrawEnd}
                        onTouchStart={onDrawStart}
                        onTouchMove={onDrawMove}
                        onTouchEnd={onDrawEnd}
                    >
                        <canvas ref={mainCanvasRef} />
                        <canvas ref={drawCanvasRef} />
                    </Styled.CanvasStack>

                    {!imageObj && (
                        <Styled.Hint>
                            Open an image to start. Adjust, rotate/flip, draw if needed, then Export or Print.
                        </Styled.Hint>
                    )}
                </Styled.Stage>
            </Styled.Body>

            {showResetConfirm && (
                <Styled.ModalBackdrop onClick={handleCancelReset}>
                    <Styled.ModalCard onClick={(e) => e.stopPropagation()}>
                        <div className="title">Reset editor?</div>
                        <div className="msg">This will clear all adjustments and drawings. This can’t be undone.</div>
                        <div className="row">
                            <button className="ghost" onClick={handleCancelReset}>Cancel</button>
                            <button className="danger" onClick={handleConfirmReset}>Yes, Reset</button>
                        </div>
                    </Styled.ModalCard>
                </Styled.ModalBackdrop>
            )}
        </Styled.Wrapper>
    );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/**
 * SealMaker — Digital rubber stamp generator
 * - Shapes: Round / Rect
 * - Inputs: top text, bottom text, center text, color, border, transparent bg
 * - Optional: center logo (upload) + size slider
 * - Actions: Download PNG, Copy PNG, Print
 * - Persistence: localStorage (namespace "sealMaker")
 */

const NS = "sealMaker";

const readLS = (k, fb) => {
    try { const v = localStorage.getItem(`${NS}::${k}`); return v ? JSON.parse(v) : fb; }
    catch { return fb; }
};
const writeLS = (k, v) => { try { localStorage.setItem(`${NS}::${k}`, JSON.stringify(v)); } catch { } };

const CANVAS_SIZE = 1024; // hi-res; CSS scales it down

export default function SealMaker() {
    const [shape, setShape] = useState(readLS("shape", "round"));      // "round" | "rect"
    const [color, setColor] = useState(readLS("color", "#d32f2f"));    // stamp color
    const [border, setBorder] = useState(readLS("border", 20));          // px line width
    const [topText, setTopText] = useState(readLS("topText", "PAID"));
    const [bottomText, setBottomText] = useState(readLS("bottomText", "RECEIVED"));
    const [centerText, setCenterText] = useState(readLS("centerText", "AR"));
    const [transparent, setTransparent] = useState(readLS("transparent", false));
    const [ringSize, setRingSize] = useState(readLS("ringSize", 48));        // px font size for ring text
    const [centerSize, setCenterSize] = useState(readLS("centerSize", 120));   // px center font

    const [logo, setLogo] = useState(readLS("logo", null));          // dataURL
    const [logoScale, setLogoScale] = useState(readLS("logoScale", 0.28));     // fraction of canvas width
    const fileRef = useRef(null);

    const canvasRef = useRef(null);
    const [copied, setCopied] = useState(false);

    // persist
    useEffect(() => writeLS("shape", shape), [shape]);
    useEffect(() => writeLS("color", color), [color]);
    useEffect(() => writeLS("border", border), [border]);
    useEffect(() => writeLS("topText", topText), [topText]);
    useEffect(() => writeLS("bottomText", bottomText), [bottomText]);
    useEffect(() => writeLS("centerText", centerText), [centerText]);
    useEffect(() => writeLS("transparent", transparent), [transparent]);
    useEffect(() => writeLS("ringSize", ringSize), [ringSize]);
    useEffect(() => writeLS("centerSize", centerSize), [centerSize]);
    useEffect(() => writeLS("logo", logo), [logo]);
    useEffect(() => writeLS("logoScale", logoScale), [logoScale]);

    // redraw on dependencies
    useEffect(() => {
        const c = canvasRef.current;
        if (!c) return;
        c.width = CANVAS_SIZE;
        c.height = CANVAS_SIZE;
        const ctx = c.getContext("2d");
        drawStamp(ctx, {
            shape, color, border,
            topText, bottomText, centerText,
            transparent, ringSize, centerSize, logo, logoScale
        });
    }, [shape, color, border, topText, bottomText, centerText, transparent, ringSize, centerSize, logo, logoScale]);

    const onDownload = () => {
        const c = canvasRef.current;
        if (!c) return;
        const a = document.createElement("a");
        a.download = `stamp-${shape}.png`;
        a.href = c.toDataURL("image/png");
        a.click();
    };

    const onCopy = async () => {
        const c = canvasRef.current;
        if (!c) return;
        try {
            const blob = await new Promise((res) => c.toBlob(res, "image/png"));
            if (!blob) return;
            await navigator.clipboard.write([new window.ClipboardItem({ "image/png": blob })]);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {
            // Fallback: copy data URL
            try { await navigator.clipboard.writeText(c.toDataURL("image/png")); } catch { }
        }
    };

    const onPrint = () => {
        const c = canvasRef.current;
        if (!c) return;
        const dataURL = c.toDataURL("image/png");

        const iframe = document.createElement("iframe");
        iframe.setAttribute("aria-hidden", "true");
        Object.assign(iframe.style, { position: "fixed", right: 0, bottom: 0, width: 0, height: 0, border: 0 });
        document.body.appendChild(iframe);

        const done = (ev) => {
            if (ev?.data === "__seal_print_done__") {
                window.removeEventListener("message", done);
                setTimeout(() => iframe.remove(), 50);
            }
        };
        window.addEventListener("message", done);

        iframe.srcdoc = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Print Stamp</title>
          <style>
            @page { margin: 10mm; }
            html, body { height: 100%; }
            body { display: grid; place-items: center; }
            img { width: 70mm; height: auto; }
          </style>
        </head>
        <body>
          <img id="stamp" src="${dataURL}" />
          <script>
            const img = document.getElementById('stamp');
            img.onload = () => { setTimeout(() => { window.focus(); window.print(); }, 60); };
            window.onafterprint = () => { parent.postMessage("__seal_print_done__", "*"); };
          <\/script>
        </body>
      </html>
    `;
    };

    const onLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setLogo(reader.result);
        reader.readAsDataURL(file);
    };
    const clearLogo = () => {
        setLogo(null);
        if (fileRef.current) fileRef.current.value = "";
    };

    return (
        <Styled.Wrapper>
            <Styled.HeaderBar>
                <h1>SealMaker — Digital Stamp Generator</h1>
                <span className="muted">Single-purpose · Offline-first · LocalStorage only</span>
            </Styled.HeaderBar>

            <Styled.Grid>
                {/* Left: Form */}
                <Styled.Panel>
                    <Styled.Form>
                        <Styled.FieldRow>
                            <label>Shape</label>
                            <select value={shape} onChange={(e) => setShape(e.target.value)}>
                                <option value="round">Round</option>
                                <option value="rect">Rect</option>
                            </select>
                        </Styled.FieldRow>

                        <Styled.FieldRow>
                            <label>Stamp color</label>
                            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                        </Styled.FieldRow>

                        <Styled.FieldRow>
                            <label>Border thickness</label>
                            <Styled.SliderRow>
                                <input type="range" min="8" max="40" step="1" value={border} onChange={(e) => setBorder(Number(e.target.value))} />
                                <span>{border}px</span>
                            </Styled.SliderRow>
                        </Styled.FieldRow>

                        <Field label="Top text">
                            <input type="text" placeholder="PAID" value={topText} onChange={(e) => setTopText(e.target.value)} />
                        </Field>

                        <Field label="Bottom text">
                            <input type="text" placeholder="RECEIVED" value={bottomText} onChange={(e) => setBottomText(e.target.value)} />
                        </Field>

                        <Field label="Center text">
                            <input type="text" placeholder="AR" value={centerText} onChange={(e) => setCenterText(e.target.value)} />
                        </Field>

                        <Styled.FieldRow>
                            <label>Ring text size</label>
                            <Styled.SliderRow>
                                <input type="range" min="28" max="72" step="1" value={ringSize} onChange={(e) => setRingSize(Number(e.target.value))} />
                                <span>{ringSize}px</span>
                            </Styled.SliderRow>
                        </Styled.FieldRow>

                        <Styled.FieldRow>
                            <label>Center text size</label>
                            <Styled.SliderRow>
                                <input type="range" min="60" max="200" step="2" value={centerSize} onChange={(e) => setCenterSize(Number(e.target.value))} />
                                <span>{centerSize}px</span>
                            </Styled.SliderRow>
                        </Styled.FieldRow>

                        <Styled.FieldRow>
                            <label>Center logo (optional)</label>
                            <Styled.Row>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={onLogoUpload}
                                    onClick={(e) => { e.currentTarget.value = ""; }}
                                />
                                {logo && <Styled.GhostBtn type="button" onClick={clearLogo}>Remove</Styled.GhostBtn>}
                            </Styled.Row>

                            <Styled.SliderRow>
                                <span>Logo size</span>
                                <input
                                    type="range"
                                    min="0.10"
                                    max="0.50"
                                    step="0.01"
                                    value={logoScale}
                                    onChange={(e) => setLogoScale(Number(e.target.value))}
                                />
                                <span>{Math.round(logoScale * 100)}%</span>
                            </Styled.SliderRow>
                        </Styled.FieldRow>

                        <Styled.CheckRow>
                            <label>
                                <input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} />
                                Transparent background
                            </label>
                        </Styled.CheckRow>

                    </Styled.Form>
                </Styled.Panel>

                {/* Right: Preview & actions */}
                <Styled.Panel>
                    <Styled.CanvasBox>
                        <canvas ref={canvasRef} aria-label="Stamp preview" />
                    </Styled.CanvasBox>

                    <Styled.Actions>
                        <Styled.PrimaryBtn type="button" onClick={onDownload}>Download PNG</Styled.PrimaryBtn>
                        <Styled.SecondaryBtn type="button" onClick={onCopy}>{copied ? "Copied!" : "Copy PNG"}</Styled.SecondaryBtn>
                        <Styled.SecondaryBtn type="button" onClick={onPrint}>Print</Styled.SecondaryBtn>
                    </Styled.Actions>

                    <Styled.TinyNote>
                        Tip: Keep ring text short for better curvature. Use a logo with transparent background (PNG/SVG) if possible.
                    </Styled.TinyNote>
                </Styled.Panel>
            </Styled.Grid>
        </Styled.Wrapper>
    );
}

/* ------------------------------ tiny subcomponents ------------------------------ */
function Field({ label, children }) {
    return (
        <Styled.FieldRow>
            <label>{label}</label>
            {children}
        </Styled.FieldRow>
    );
}

/* --------------------------------- drawing --------------------------------- */
function drawStamp(ctx, opts) {
    const {
        shape, color, border,
        topText, bottomText, centerText,
        transparent, ringSize, centerSize, logo, logoScale
    } = opts;

    const W = CANVAS_SIZE, H = CANVAS_SIZE;
    const cx = W / 2, cy = H / 2;

    // bg
    ctx.clearRect(0, 0, W, H);
    if (!transparent) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, W, H);
    }

    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    if (shape === "round") {
        const radius = 450;
        // outer ring
        ctx.lineWidth = border;
        circle(ctx, cx, cy, radius);
        ctx.stroke();

        // inner ring for aesthetics
        ctx.lineWidth = Math.max(2, Math.floor(border * 0.35));
        circle(ctx, cx, cy, radius - 60);
        ctx.stroke();

        // arc texts
        const font = `700 ${ringSize}px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`;
        if (topText?.trim()) {
            drawArcText(ctx, topText.toUpperCase(), cx, cy, radius - (20 + 15), Math.PI + Math.PI * 0.075, Math.PI - Math.PI * 0.075, font, color, true);
        }
        if (bottomText?.trim()) {
            drawArcText(ctx, bottomText.toUpperCase(), cx, cy, radius - 20, Math.PI * 0.075, Math.PI - Math.PI * 0.075, font, color, false);
        }

        // center text
        if (centerText?.trim()) {
            ctx.save();
            ctx.font = `800 ${centerSize}px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = color;
            ctx.fillText(centerText.toUpperCase(), cx, cy + 4);
            ctx.restore();
        }

        // logo overlay
        if (logo) {
            const img = new Image();
            img.onload = () => {
                const size = Math.round(W * clamp(logoScale, 0.1, 0.5));
                const x = cx - size / 2;
                const y = cy - size / 2;
                // white pad for visibility
                ctx.save();
                roundedRect(ctx, x - 10, y - 10, size + 20, size + 20, 16);
                ctx.fillStyle = "#fff";
                ctx.fill();
                ctx.restore();
                ctx.drawImage(img, x, y, size, size);
            };
            img.src = logo;
        }
    } else {
        // RECT shape
        const pad = 80;
        ctx.lineWidth = border;
        roundedRect(ctx, pad, pad, W - pad * 2, H - pad * 2, 60);
        ctx.stroke();

        // inner rectangle
        ctx.lineWidth = Math.max(2, Math.floor(border * 0.35));
        roundedRect(ctx, pad + 50, pad + 50, W - (pad + 50) * 2, H - (pad + 50) * 2, 40);
        ctx.stroke();

        // top & bottom (straight)
        ctx.save();
        ctx.font = `700 ${ringSize}px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = color;

        if (topText?.trim()) ctx.fillText(topText.toUpperCase(), cx, pad + 40 + ringSize + 15);
        if (bottomText?.trim()) ctx.fillText(bottomText.toUpperCase(), cx, H - (pad + 40 + ringSize));
        ctx.restore();

        // center text
        if (centerText?.trim()) {
            ctx.save();
            ctx.font = `800 ${centerSize}px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = color;
            ctx.fillText(centerText.toUpperCase(), cx, cy + 4);
            ctx.restore();
        }

        // logo overlay
        if (logo) {
            const img = new Image();
            img.onload = () => {
                const size = Math.round(W * clamp(logoScale, 0.1, 0.5));
                ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
            };
            img.src = logo;
        }
    }
}

/** Draw text along an arc from startAngle to endAngle (radians).
 *  If isTop=true: top arc (letters upright), else bottom arc (letters upright)
 */
function drawArcText(ctx, text, cx, cy, radius, startAngle, endAngle, font, color, isTop) {
    const chars = [...text];
    if (chars.length === 0) return;

    const total = Math.abs(endAngle - startAngle);
    const step = chars.length > 1 ? total / (chars.length - 1) : 0;

    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < chars.length; i++) {
        const angle = isTop ? (startAngle - i * step) : (startAngle + i * step);
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);

        ctx.save();
        // rotate so the letter is upright
        const rotate = isTop ? angle + Math.PI / 2 : angle - Math.PI / 2;
        ctx.translate(x, y);
        ctx.rotate(rotate);
        ctx.fillText(chars[i], 0, 0);
        ctx.restore();
    }

    ctx.restore();
}

/* primitives */
function circle(ctx, x, y, r) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.closePath();
}
function roundedRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
}
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

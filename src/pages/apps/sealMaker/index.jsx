import { useEffect, useRef, useState } from "react";
import { Styled } from "./styled";

/**
 * SealMaker — Digital rubber stamp generator
 * Fix: proper top/bottom arc placement (left→right, upright glyphs, non-crossing spacing)
 * Adds: Ring offset + tracking sliders (as before)
 */

const NS = "sealMaker";
const CANVAS_SIZE = 1024;

const readLS = (k, fb) => {
    try { const v = localStorage.getItem(`${NS}::${k}`); return v ? JSON.parse(v) : fb; }
    catch { return fb; }
};
const writeLS = (k, v) => { try { localStorage.setItem(`${NS}::${k}`, JSON.stringify(v)); } catch { } };

export default function SealMaker() {
    const [shape, setShape] = useState(readLS("shape", "round"));
    const [color, setColor] = useState(readLS("color", "#2AA1FF"));
    const [border, setBorder] = useState(readLS("border", 20));

    const [topText, setTopText] = useState(readLS("topText", "NOT PAID"));
    const [bottomText, setBottomText] = useState(readLS("bottomText", "RECEIVED"));
    const [centerText, setCenterText] = useState(readLS("centerText", "AR"));

    const [transparent, setTransparent] = useState(readLS("transparent", false));

    const [ringSize, setRingSize] = useState(readLS("ringSize", 48));
    const [centerSize, setCenterSize] = useState(readLS("centerSize", 120));

    // distance of arc text baseline from the outer ring
    const [ringOffset, setRingOffset] = useState(readLS("ringOffset", 45));
    // extra px between glyphs on the arc
    const [ringTracking, setRingTracking] = useState(readLS("ringTracking", 1.5));

    const [logo, setLogo] = useState(readLS("logo", null));
    const [logoScale, setLogoScale] = useState(readLS("logoScale", 0.28));

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
    useEffect(() => writeLS("ringOffset", ringOffset), [ringOffset]);
    useEffect(() => writeLS("ringTracking", ringTracking), [ringTracking]);
    useEffect(() => writeLS("logo", logo), [logo]);
    useEffect(() => writeLS("logoScale", logoScale), [logoScale]);

    // redraw
    useEffect(() => {
        const c = canvasRef.current; if (!c) return;
        c.width = CANVAS_SIZE; c.height = CANVAS_SIZE;
        const ctx = c.getContext("2d");
        drawStamp(ctx, {
            shape, color, border, topText, bottomText, centerText,
            transparent, ringSize, centerSize, ringOffset, ringTracking,
            logo, logoScale
        });
    }, [shape, color, border, topText, bottomText, centerText, transparent, ringSize, centerSize, ringOffset, ringTracking, logo, logoScale]);

    /* ---------------------------- actions ---------------------------- */
    const onDownload = () => {
        const c = canvasRef.current; if (!c) return;
        const a = document.createElement("a");
        a.download = `stamp-${shape}.png`;
        a.href = c.toDataURL("image/png");
        a.click();
    };

    const onCopy = async () => {
        const c = canvasRef.current; if (!c) return;
        try {
            const blob = await new Promise((res) => c.toBlob(res, "image/png"));
            if (blob) {
                await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
                setCopied(true); setTimeout(() => setCopied(false), 1200);
                return;
            }
        } catch { }
        try { await navigator.clipboard.writeText(c.toDataURL("image/png")); } catch { }
    };

    const onPrint = () => {
        const c = canvasRef.current; if (!c) return;
        const dataURL = c.toDataURL("image/png");
        const iframe = document.createElement("iframe");
        Object.assign(iframe.style, { position: "fixed", right: 0, bottom: 0, width: 0, height: 0, border: 0 });
        document.body.appendChild(iframe);

        const done = (ev) => { if (ev?.data === "__seal_print_done__") { window.removeEventListener("message", done); setTimeout(() => iframe.remove(), 50); } };
        window.addEventListener("message", done);

        iframe.srcdoc = `
      <!doctype html>
      <html><head><meta charset="utf-8">
      <title>Print Stamp</title>
      <style>
        @page { margin: 10mm; }
        html,body{height:100%} body{display:grid;place-items:center}
        img{ width:72mm; height:auto; }
      </style>
      </head>
      <body>
        <img id="stamp" src="${dataURL}" />
        <script>
          const img = document.getElementById('stamp');
          img.onload = () => { setTimeout(()=>{ window.focus(); window.print(); }, 60); };
          window.onafterprint = () => { parent.postMessage("__seal_print_done__", "*"); };
        <\/script>
      </body></html>
    `;
    };

    const onLogoUpload = (e) => {
        const f = e.target.files?.[0]; if (!f) return;
        const reader = new FileReader();
        reader.onload = () => setLogo(reader.result);
        reader.readAsDataURL(f);
    };
    const clearLogo = () => { setLogo(null); if (fileRef.current) fileRef.current.value = ""; };

    return (
        <Styled.Wrapper>
            <Styled.HeaderBar>
                <h1>SealMaker — Digital Stamp Generator</h1>
                <span className="muted">Accurate arc text • Offline-first • LocalStorage only</span>
            </Styled.HeaderBar>

            <Styled.Grid>
                {/* Left: Controls */}
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
                            <label>Ring offset (round)</label>
                            <Styled.SliderRow>
                                <input type="range" min="0" max="80" step="1" value={ringOffset} onChange={(e) => setRingOffset(Number(e.target.value))} />
                                <span>{ringOffset}px</span>
                            </Styled.SliderRow>
                        </Styled.FieldRow>

                        <Styled.FieldRow>
                            <label>Ring letter spacing</label>
                            <Styled.SliderRow>
                                <input type="range" min="0" max="6" step="0.1" value={ringTracking} onChange={(e) => setRingTracking(Number(e.target.value))} />
                                <span>{ringTracking}px</span>
                            </Styled.SliderRow>
                        </Styled.FieldRow>

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
                                <input ref={fileRef} type="file" accept="image/*" onChange={onLogoUpload} onClick={(e) => (e.currentTarget.value = "")} />
                                {logo && <Styled.GhostBtn type="button" onClick={clearLogo}>Remove</Styled.GhostBtn>}
                            </Styled.Row>

                            <Styled.SliderRow>
                                <span>Logo size</span>
                                <input type="range" min="0.10" max="0.50" step="0.01" value={logoScale} onChange={(e) => setLogoScale(Number(e.target.value))} />
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
                        If the ring text looks tight/loose, tweak <b>Ring letter spacing</b>. Use <b>Ring offset</b> to move text away from the border.
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
        transparent, ringSize, centerSize, ringOffset, ringTracking,
        logo, logoScale
    } = opts;

    const W = CANVAS_SIZE, H = CANVAS_SIZE;
    const cx = W / 2, cy = H / 2;

    // bg
    ctx.clearRect(0, 0, W, H);
    if (!transparent) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, W, H);
    }

    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    if (shape === "round") {
        const outerR = 450;

        // rings
        ctx.lineWidth = border;
        circle(ctx, cx, cy, outerR);
        ctx.stroke();

        ctx.lineWidth = Math.max(2, Math.floor(border * 0.35));
        circle(ctx, cx, cy, outerR - 60);
        ctx.stroke();

        // arc texts
        const font = `700 ${ringSize}px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`;
        const textR = outerR - (20 + ringOffset);

        if (topText?.trim()) {
            // TOP: center at -PI/2, draw left→right
            drawArcTextCentered(ctx, topText.toUpperCase(), cx, cy, textR, -Math.PI / 2, true, font, color, ringTracking);
        }
        if (bottomText?.trim()) {
            // BOTTOM: center at +PI/2, draw left→right
            drawArcTextCentered(ctx, bottomText.toUpperCase(), cx, cy, textR, Math.PI / 2, false, font, color, ringTracking);
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
        // RECT
        const pad = 80;
        ctx.lineWidth = border;
        roundedRect(ctx, pad, pad, W - pad * 2, H - pad * 2, 60);
        ctx.stroke();

        ctx.lineWidth = Math.max(2, Math.floor(border * 0.35));
        roundedRect(ctx, pad + 50, pad + 50, W - (pad + 50) * 2, H - (pad + 50) * 2, 40);
        ctx.stroke();

        // straight texts
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

        // logo
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

/** Centered arc text, left→right with upright glyphs.
 * radius: baseline radius
 * centerAngle: -PI/2 for top, +PI/2 for bottom
 * isTop: true => top arc, false => bottom arc
 * tracking: px BETWEEN letters
 */
function drawArcTextCentered(ctx, text, cx, cy, radius, centerAngle, isTop, font, color, tracking = 0) {
    const chars = [...text];
    if (!chars.length) return;

    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const widths = chars.map((ch) => ctx.measureText(ch).width);
    const totalWidth = widths.reduce((a, b) => a + b, 0) + tracking * Math.max(0, chars.length - 1);
    const totalAngle = totalWidth / radius;

    // Start so that the whole string is centered around centerAngle.
    let angle = isTop
        ? centerAngle - totalAngle / 2
        : centerAngle + totalAngle / 2;

    for (let i = 0; i < chars.length; i++) {
        const w = widths[i];
        const half = (w / radius) / 2;

        if (isTop) {
            angle += half;
        } else {
            angle -= half;
        }

        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);

        ctx.save();
        const rot = isTop ? angle + Math.PI / 2 : angle - Math.PI / 2;
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.fillText(chars[i], 0, 0);
        ctx.restore();

        if (isTop) {
            angle += half + (i < chars.length - 1 ? (tracking / radius) : 0);
        } else {
            angle -= half + (i < chars.length - 1 ? (tracking / radius) : 0);
        }
    }

    ctx.restore();
}

/* primitives */
function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.closePath(); }
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

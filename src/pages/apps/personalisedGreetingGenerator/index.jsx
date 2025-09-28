import React, { useEffect, useRef, useState } from "react";
import { Styled } from "./styled";

/**
 * Personalised Greeting Generator
 * - Pick occasion, tone, names, optional extra line
 * - Choose palette + background style
 * - Live preview on canvas (portrait)
 * - Export PNG
 * - Print (prints ONLY the card via hidden iframe)
 * - Reset with custom confirm
 *
 * No keyboard shortcuts. Code kept clear and human.
 */

const CANVAS_W = 1200; // portrait card
const CANVAS_H = 1600;

const palettes = {
    emerald: { bg1: "#0b1510", bg2: "#11221a", accent: "#22c55e", text: "#e8f7ee" },
    royal: { bg1: "#0b0f24", bg2: "#1a2148", accent: "#7aa2ff", text: "#e9ecff" },
    candy: { bg1: "#2b0f1a", bg2: "#4a1424", accent: "#ff6b9a", text: "#ffe6ef" },
    sunrise: { bg1: "#26190d", bg2: "#4a2a12", accent: "#f59e0b", text: "#fff4e0" },
    mint: { bg1: "#0f1d1a", bg2: "#16322c", accent: "#34d399", text: "#e7fff7" },
};

const defaultState = {
    occasion: "Birthday",
    tone: "Friendly",
    recipient: "",
    fromName: "",
    extraLine: "",
    paletteKey: "emerald",
    bgStyle: "gradient", // 'gradient' | 'solid' | 'pattern'
    zoom: 0.8,
};

export default function PersonalisedGreetingGenerator() {
    const [s, setS] = useState(defaultState);
    const [logoObj, setLogoObj] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => { drawCard(); }, [s, logoObj]);

    function update(partial) {
        setS(prev => ({ ...prev, ...partial }));
    }

    function onLogoChange(e) {
        const file = e.target.files?.[0];
        if (!file) return setLogoObj(null);
        const img = new Image();
        img.onload = () => setLogoObj(img);
        img.src = URL.createObjectURL(file);
    }

    function makeMessage() {
        const namePart = s.recipient ? `${s.recipient},` : "";
        const extra = s.extraLine ? `\n${s.extraLine}` : "";

        // lightweight template variations by occasion + tone
        const o = s.occasion;
        const t = s.tone;

        const templates = {
            Birthday: {
                Friendly: `${namePart}\nWishing you a day full of smiles and a year packed with wins. ${extra}`,
                Formal: `${namePart}\nWarm birthday wishes. May the year ahead bring health, success, and joy. ${extra}`,
                Funny: `${namePart}\nAnother lap around the sun — still looking good! Cake first, decisions later. ${extra}`,
            },
            Anniversary: {
                Friendly: `${namePart}\nHere’s to love, laughter, and many more years together. ${extra}`,
                Formal: `${namePart}\nWishing you a wonderful anniversary and continued happiness. ${extra}`,
                Funny: `${namePart}\nCongrats on renewing the “you + me” contract. Auto-renew looks good! ${extra}`,
            },
            Congratulations: {
                Friendly: `${namePart}\nHuge congrats! You earned this. Onward and upward. ${extra}`,
                Formal: `${namePart}\nCongratulations on your achievement. Wishing you continued success. ${extra}`,
                Funny: `${namePart}\nMission accomplished. Bragging rights unlocked — use responsibly. ${extra}`,
            },
            "Thank You": {
                Friendly: `${namePart}\nThank you—your help made a real difference. ${extra}`,
                Formal: `${namePart}\nWith sincere thanks for your support and time. ${extra}`,
                Funny: `${namePart}\nThanks a ton — I owe you coffee (or two). ${extra}`,
            },
            "Get Well Soon": {
                Friendly: `${namePart}\nWishing you steady rest and a smooth recovery. ${extra}`,
                Formal: `${namePart}\nWishing you good health and a swift recovery. ${extra}`,
                Funny: `${namePart}\nRest, hydrate, and queue your favorite shows. Doctor’s orders (mine). ${extra}`,
            },
            "Happy New Year": {
                Friendly: `${namePart}\nNew goals, new wins. Have a bright, peaceful year ahead! ${extra}`,
                Formal: `${namePart}\nWishing you prosperity and good health in the year ahead. ${extra}`,
                Funny: `${namePart}\nNew Year’s resolution: more laughs, fewer bugs. Let’s go. ${extra}`,
            },
            "Happy Diwali": {
                Friendly: `${namePart}\nMay your home glow with light, joy, and good fortune. ${extra}`,
                Formal: `${namePart}\nWishing you and your family a bright and prosperous Diwali. ${extra}`,
                Funny: `${namePart}\nLight the diyas, not the inbox. Have a sparkling Diwali! ${extra}`,
            },
        };

        const bank = templates[o] || templates["Congratulations"];
        const body = bank?.[t] || bank?.Friendly;
        const from = s.fromName ? `\n— ${s.fromName}` : "";
        return { title: o, body: body.trim(), from };
    }

    function drawBackground(ctx, w, h, pal) {
        if (s.bgStyle === "solid") {
            ctx.fillStyle = pal.bg2;
            ctx.fillRect(0, 0, w, h);
            return;
        }
        if (s.bgStyle === "pattern") {
            // subtle dotted pattern over gradient base
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, pal.bg1);
            grad.addColorStop(1, pal.bg2);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            ctx.globalAlpha = 0.12;
            ctx.fillStyle = "#ffffff";
            const step = 40;
            for (let y = 60; y < h - 60; y += step) {
                for (let x = 60; x < w - 60; x += step) {
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.globalAlpha = 1;
            return;
        }
        // default gradient
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, pal.bg1);
        grad.addColorStop(1, pal.bg2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    }

    function wrapText(ctx, text, maxWidth) {
        const words = text.split(/\s+/);
        const lines = [];
        let line = "";
        for (let i = 0; i < words.length; i++) {
            const test = line ? line + " " + words[i] : words[i];
            if (ctx.measureText(test).width <= maxWidth) {
                line = test;
            } else {
                if (line) lines.push(line);
                line = words[i];
            }
        }
        if (line) lines.push(line);
        return lines;
    }

    function drawCard() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = CANVAS_W;
        canvas.height = CANVAS_H;
        const ctx = canvas.getContext("2d");

        const pal = palettes[s.paletteKey] || palettes.emerald;

        // background
        drawBackground(ctx, CANVAS_W, CANVAS_H, pal);

        // safe area
        const margin = 90;
        const innerW = CANVAS_W - margin * 2;

        // title
        const { title, body, from } = makeMessage();
        ctx.save();
        ctx.fillStyle = pal.text;
        ctx.textAlign = "center";

        // header accent
        ctx.fillStyle = pal.accent + "33";
        ctx.fillRect(margin, margin + 24, innerW, 6);

        // title text with subtle shadow
        ctx.fillStyle = pal.text;
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowBlur = 12;
        ctx.font = "700 80px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";
        ctx.fillText(title, CANVAS_W / 2, margin + 90);

        // body copy
        ctx.shadowBlur = 0;
        ctx.fillStyle = pal.text;
        ctx.font = "400 40px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";
        const bodyMax = innerW * 0.9;
        const bodyLines = wrapText(ctx, body, bodyMax);
        let y = margin + 200;
        bodyLines.forEach(line => {
            ctx.fillText(line, CANVAS_W / 2, y);
            y += 56;
        });

        // signature
        if (from) {
            ctx.font = "600 38px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";
            ctx.fillStyle = pal.accent;
            ctx.fillText(from, CANVAS_W / 2, CANVAS_H - margin - 80);
        }

        // optional logo (bottom-right)
        if (logoObj) {
            const targetW = 180;
            const scale = targetW / logoObj.naturalWidth;
            const targetH = logoObj.naturalHeight * scale;
            const x = CANVAS_W - margin - targetW;
            const yLogo = CANVAS_H - margin - targetH;
            // white plate for contrast
            ctx.fillStyle = "rgba(255,255,255,0.08)";
            ctx.fillRect(x - 14, yLogo - 14, targetW + 28, targetH + 28);
            ctx.drawImage(logoObj, x, yLogo, targetW, targetH);
        }

        ctx.restore();
    }

    function downloadPNG() {
        const url = canvasRef.current?.toDataURL("image/png");
        if (!url) return;
        const a = document.createElement("a");
        a.href = url;
        a.download = "greeting-card.png";
        a.click();
    }

    function printCard() {
        const url = canvasRef.current?.toDataURL("image/png");
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
    <title>Print Card</title>
    <style>
      @page { margin: 0; }
      html, body { margin:0; padding:0; background:#fff; }
      img { display:block; width:100%; height:auto; }
    </style>
  </head>
  <body>
    <img id="card" src="${url}" alt="Greeting Card"/>
  </body>
</html>`);
        doc.close();

        const go = () => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setTimeout(() => document.body.removeChild(iframe), 300);
        };
        const img = doc.getElementById("card");
        if (img?.complete) go();
        else img.onload = go;
    }

    function randomizePalette() {
        const keys = Object.keys(palettes);
        const next = keys[Math.floor(Math.random() * keys.length)];
        update({ paletteKey: next });
    }

    function handleConfirmReset() {
        setS(defaultState);
        setLogoObj(null);
        setShowConfirm(false);
    }

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div className="title">Personalised Greeting Generator</div>
                <div className="actions">
                    <button onClick={downloadPNG}>Export PNG</button>
                    <button onClick={printCard}>Print</button>
                    <button onClick={() => setShowConfirm(true)}>Reset</button>
                </div>
            </Styled.Header>

            <Styled.Body>
                <Styled.Sidebar>
                    <Styled.Group>
                        <Styled.Label>Occasion</Styled.Label>
                        <select value={s.occasion} onChange={(e) => update({ occasion: e.target.value })}>
                            <option>Birthday</option>
                            <option>Anniversary</option>
                            <option>Congratulations</option>
                            <option>Thank You</option>
                            <option>Get Well Soon</option>
                            <option>Happy New Year</option>
                            <option>Happy Diwali</option>
                        </select>
                    </Styled.Group>

                    <Styled.Row>
                        <Styled.Group style={{ flex: 1 }}>
                            <Styled.Label>Recipient name</Styled.Label>
                            <input
                                placeholder="e.g., Ashish"
                                value={s.recipient}
                                onChange={(e) => update({ recipient: e.target.value })}
                            />
                        </Styled.Group>
                        <Styled.Group style={{ flex: 1 }}>
                            <Styled.Label>From</Styled.Label>
                            <input
                                placeholder="e.g., Team A2RP"
                                value={s.fromName}
                                onChange={(e) => update({ fromName: e.target.value })}
                            />
                        </Styled.Group>
                    </Styled.Row>

                    <Styled.Group>
                        <Styled.Label>Tone</Styled.Label>
                        <div className="chips">
                            {["Friendly", "Formal", "Funny"].map(t => (
                                <button
                                    key={t}
                                    className={s.tone === t ? "chip active" : "chip"}
                                    onClick={() => update({ tone: t })}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </Styled.Group>

                    <Styled.Group>
                        <Styled.Label>Extra line (optional)</Styled.Label>
                        <input
                            placeholder="e.g., Have a fantastic year ahead!"
                            value={s.extraLine}
                            onChange={(e) => update({ extraLine: e.target.value })}
                        />
                    </Styled.Group>

                    <Styled.Group>
                        <Styled.Label>Palette</Styled.Label>
                        <div className="swatches">
                            {Object.keys(palettes).map(k => (
                                <button
                                    key={k}
                                    title={k}
                                    className={"swatch" + (s.paletteKey === k ? " selected" : "")}
                                    onClick={() => update({ paletteKey: k })}
                                    style={{
                                        background: `linear-gradient(90deg, ${palettes[k].bg1}, ${palettes[k].bg2})`
                                    }}
                                />
                            ))}
                            <button className="chip" onClick={randomizePalette}>Random</button>
                        </div>
                    </Styled.Group>

                    <Styled.Group>
                        <Styled.Label>Background style</Styled.Label>
                        <div className="chips">
                            {["gradient", "solid", "pattern"].map(k => (
                                <button
                                    key={k}
                                    className={s.bgStyle === k ? "chip active" : "chip"}
                                    onClick={() => update({ bgStyle: k })}
                                >
                                    {k}
                                </button>
                            ))}
                        </div>
                    </Styled.Group>

                    <Styled.Group>
                        <Styled.Label>Logo / Photo (optional)</Styled.Label>
                        <label className="fileBtn">
                            <input type="file" accept="image/*" onChange={onLogoChange} />
                            Upload Image
                        </label>
                        {logoObj && <div className="hint">Added ✓ (bottom-right)</div>}
                    </Styled.Group>

                    <Styled.Group>
                        <Styled.Label>Preview Zoom</Styled.Label>
                        <input
                            type="range"
                            min="0.5"
                            max="1.2"
                            step="0.05"
                            value={s.zoom}
                            onChange={(e) => update({ zoom: Number(e.target.value) })}
                        />
                    </Styled.Group>
                </Styled.Sidebar>

                <Styled.Stage ref={containerRef}>
                    <Styled.CanvasWrap style={{ transform: `scale(${s.zoom})` }}>
                        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} />
                    </Styled.CanvasWrap>
                    <Styled.Hint>Tip: fill names, choose tone/palette, then Export or Print.</Styled.Hint>
                </Styled.Stage>
            </Styled.Body>

            {showConfirm && (
                <Styled.ModalBackdrop onClick={() => setShowConfirm(false)}>
                    <Styled.ModalCard onClick={(e) => e.stopPropagation()}>
                        <div className="title">Reset settings?</div>
                        <div className="msg">This will clear names, extra line, logo, and visual choices.</div>
                        <div className="row">
                            <button className="ghost" onClick={() => setShowConfirm(false)}>Cancel</button>
                            <button className="danger" onClick={handleConfirmReset}>Yes, Reset</button>
                        </div>
                    </Styled.ModalCard>
                </Styled.ModalBackdrop>
            )}
        </Styled.Wrapper>
    );
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/* ----------------------------------------------------------------------------
   RGB Color Guesser — “no numbers by default” learning game
   - Two modes: Tiles (choose swatch) / Mixer (match via sliders)
   - Decoys generated in CIE Lab for perceptual closeness
   - Reveal panel AFTER guess/check shows exact numbers & deltas
   - Soft hints toggle (off by default)
   - Print Scorecard prints only the compact card area
   - LocalStorage: best score & best streak
---------------------------------------------------------------------------- */

const LS = {
    bestScore: "rgbGuesser_bestScore",
    bestStreak: "rgbGuesser_bestStreak",
};

const DIFF = {
    Easy: { options: 3, tolLab: 20 }, // ΔE76 tolerance for Mixer success
    Medium: { options: 6, tolLab: 12 },
    Hard: { options: 9, tolLab: 7 },
};

const MODES = { Tiles: "Tiles", Mixer: "Mixer" };

/* ---------- Color space helpers (sRGB <-> XYZ <-> Lab), ΔE76 ---------- */
function srgbToLinear(u) { u /= 255; return u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4); }
function linearToSrgb(u) { return (u <= 0.0031308 ? 12.92 * u : 1.055 * Math.pow(u, 1 / 2.4) - 0.055) * 255; }

function clamp01(x) { return Math.max(0, Math.min(1, x)); }
function clamp255(n) { return Math.max(0, Math.min(255, Math.round(n))); }

function rgbToXyz({ r, g, b }) {
    const R = srgbToLinear(r), G = srgbToLinear(g), B = srgbToLinear(b);
    // D65/2°, sRGB matrix
    const X = 0.4124564 * R + 0.3575761 * G + 0.1804375 * B;
    const Y = 0.2126729 * R + 0.7151522 * G + 0.0721750 * B;
    const Z = 0.0193339 * R + 0.1191920 * G + 0.9503041 * B;
    return { X, Y, Z };
}
function xyzToRgb({ X, Y, Z }) {
    const R = 3.2404542 * X + -1.5371385 * Y + -0.4985314 * Z;
    const G = -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z;
    const B = 0.0556434 * X + -0.2040259 * Y + 1.0572252 * Z;
    return {
        r: clamp255(linearToSrgb(clamp01(R))),
        g: clamp255(linearToSrgb(clamp01(G))),
        b: clamp255(linearToSrgb(clamp01(B))),
    };
}
function xyzToLab({ X, Y, Z }) {
    // D65 reference white
    const Xn = 0.95047, Yn = 1.00000, Zn = 1.08883;
    const fx = f(X / Xn), fy = f(Y / Yn), fz = f(Z / Zn);
    return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
    function f(t) { return t > Math.pow(6 / 29, 3) ? Math.cbrt(t) : (t * (29 / 6) * (29 / 6) / 3 + 4 / 29); }
}
function labToXyz({ L, a, b }) {
    const fy = (L + 16) / 116;
    const fx = fy + a / 500;
    const fz = fy - b / 200;

    const Xn = 0.95047, Yn = 1.00000, Zn = 1.08883;
    const xr = inv(fx), yr = inv(fy), zr = inv(fz);
    return { X: xr * Xn, Y: yr * Yn, Z: zr * Zn };

    function inv(ft) {
        const t3 = ft * ft * ft;
        const eps = Math.pow(6 / 29, 3);
        return t3 > eps ? t3 : (3 * Math.pow(6 / 29, 2) * (ft - 4 / 29));
    }
}
function rgbToLab(rgb) { return xyzToLab(rgbToXyz(rgb)); }
function labToRgb(lab) { return xyzToRgb(labToXyz(lab)); }
function deltaE76(a, b) { const dL = a.L - b.L, da = a.a - b.a, db = a.b - b.b; return Math.sqrt(dL * dL + da * da + db * db); }

/* ---------- misc helpers ---------- */
function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rgbStr({ r, g, b }) { return `rgb(${r}, ${g}, ${b})`; }
const hex = (n) => n.toString(16).padStart(2, "0");
function rgbHex({ r, g, b }) { return `#${hex(r)}${hex(g)}${hex(b)}`; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

/* Generate decoys around a target in Lab at chosen ΔE radius, then convert back.
   If out-of-gamut, try smaller radius; fallback to simple RGB jitter as last resort. */
function labDecoys(targetRgb, count, radius) {
    const targ = rgbToLab(targetRgb);
    const out = new Set();
    const opts = [];

    for (let i = 0; i < count; i++) {
        let tries = 0, ok = null;
        while (tries < 20 && !ok) {
            tries++;
            const theta = rand(0, 2 * Math.PI);        // direction in a/b plane
            const phi = rand(-Math.PI / 6, Math.PI / 6); // small L tilt
            const dL = radius * Math.sin(phi);
            const dR = radius * Math.cos(phi);
            const da = dR * Math.cos(theta);
            const db = dR * Math.sin(theta);

            const candLab = { L: targ.L + dL, a: targ.a + da, b: targ.b + db };
            let candRgb = labToRgb(candLab);

            // if out-of-gamut projection pushed too far, shrink toward target
            if ([candRgb.r, candRgb.g, candRgb.b].some((v) => v < 0 || v > 255)) {
                // retry with smaller radius
                radius *= 0.8;
                continue;
            }

            const key = `${candRgb.r}-${candRgb.g}-${candRgb.b}`;
            if (!out.has(key) &&
                !(candRgb.r === targetRgb.r && candRgb.g === targetRgb.g && candRgb.b === targetRgb.b)) {
                out.add(key);
                ok = candRgb;
            }
        }
        if (!ok) {
            // fallback RGB jitter
            const j = {
                r: clamp(targetRgb.r + randInt(-30, 30), 0, 255),
                g: clamp(targetRgb.g + randInt(-30, 30), 0, 255),
                b: clamp(targetRgb.b + randInt(-30, 30), 0, 255),
            };
            const key = `${j.r}-${j.g}-${j.b}`;
            if (!out.has(key)) { out.add(key); ok = j; }
        }
        opts.push(ok);
    }
    return opts;
}

/* Round generator */
function randomBase() { return { r: randInt(30, 255), g: randInt(30, 255), b: randInt(30, 255) }; }
function generateRound({ options }) {
    const target = randomBase();
    // radius tuned by options (more options => closer decoys)
    const baseR = options === 9 ? 14 : options === 6 ? 18 : 24;
    const decoys = labDecoys(target, options - 1, baseR);
    // insert target and shuffle
    const arr = [...decoys, target];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; }
    return { target, options: arr };
}

export default function RgbColorGuesser() {
    const [difficultyKey, setDifficultyKey] = useState("Medium");
    const difficulty = DIFF[difficultyKey];

    const [mode, setMode] = useState(MODES.Tiles);
    const [round, setRound] = useState(() => generateRound(difficulty));

    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [lives, setLives] = useState(3);
    const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem(LS.bestScore)) || 0);
    const [bestStreak, setBestStreak] = useState(() => Number(localStorage.getItem(LS.bestStreak)) || 0);

    const [showNumbers, setShowNumbers] = useState(false); // learning toggle
    const [showHints, setShowHints] = useState(false);     // soft hints toggle

    const [reveal, setReveal] = useState(null);
    // reveal = { t: time, target:{r,g,b}, picked:{r,g,b}, ok:boolean, deltaE:number, d:{dr,dg,db}, mode, diff }

    // Mixer state
    const [mix, setMix] = useState({ r: 128, g: 128, b: 128 });

    const printRef = useRef(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    useEffect(() => { setRound(generateRound(difficulty)); setReveal(null); setMix({ r: 128, g: 128, b: 128 }); }, [difficultyKey]);

    useEffect(() => { if (score > bestScore) { setBestScore(score); localStorage.setItem(LS.bestScore, String(score)); } }, [score]); // eslint-disable-line
    useEffect(() => { if (streak > bestStreak) { setBestStreak(streak); localStorage.setItem(LS.bestStreak, String(streak)); } }, [streak]); // eslint-disable-line

    function nextRound(resetLives) {
        setRound(generateRound(difficulty));
        if (resetLives) setLives(3);
        setReveal(null);
        if (mode === MODES.Mixer) setMix({ r: 128, g: 128, b: 128 });
    }

    function onGuess(opt) {
        const ok = (opt.r === round.target.r && opt.g === round.target.g && opt.b === round.target.b);
        const d = { dr: opt.r - round.target.r, dg: opt.g - round.target.g, db: opt.b - round.target.b };
        const deltaE = deltaE76(rgbToLab(opt), rgbToLab(round.target));

        setReveal({ t: new Date().toLocaleTimeString(), target: round.target, picked: opt, ok, deltaE, d, mode, diff: difficultyKey });

        if (ok) {
            const gained = 10 + streak * 2;
            setScore(s => s + gained);
            setStreak(s => s + 1);
            nextRound(false);
        } else {
            setScore(s => Math.max(0, s - 3));
            setStreak(0);
            setLives(l => {
                const left = l - 1;
                if (left <= 0) { setTimeout(() => nextRound(true), 220); return 3; }
                return left;
            });
        }
    }

    function onMixerCheck() {
        const ok = deltaE76(rgbToLab(mix), rgbToLab(round.target)) <= difficulty.tolLab;
        const d = { dr: mix.r - round.target.r, dg: mix.g - round.target.g, db: mix.b - round.target.b };
        const dE = deltaE76(rgbToLab(mix), rgbToLab(round.target));
        setReveal({ t: new Date().toLocaleTimeString(), target: round.target, picked: mix, ok, deltaE: dE, d, mode, diff: difficultyKey });

        if (ok) {
            const closenessBonus = Math.max(0, Math.round((difficulty.tolLab - dE)));
            const gained = 10 + streak * 2 + closenessBonus;
            setScore(s => s + gained);
            setStreak(s => s + 1);
            nextRound(false);
        } else {
            setScore(s => Math.max(0, s - 3));
            setStreak(0);
            setLives(l => {
                const left = l - 1;
                if (left <= 0) { setTimeout(() => nextRound(true), 220); return 3; }
                return left;
            });
        }
    }

    function resetAll() {
        setScore(0); setStreak(0); setLives(3);
        setReveal(null);
        setRound(generateRound(difficulty));
        setMix({ r: 128, g: 128, b: 128 });
    }

    function dominantChannel({ r, g, b }) {
        const arr = [{ k: "R", v: r }, { k: "G", v: g }, { k: "B", v: b }].sort((a, b) => b.v - a.v);
        return arr[0].k;
    }
    function warmCool({ r, g, b }) {
        // simple heuristic
        return (r > b + 25) ? "Warm" : (b > r + 25) ? "Cool" : "Neutral";
    }

    function handlePrint() {
        if (!printRef.current) return;
        const html = printRef.current.outerHTML;

        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed"; iframe.style.right = "0"; iframe.style.bottom = "0";
        iframe.style.width = "0"; iframe.style.height = "0"; iframe.style.border = "0";
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Scorecard</title>
<style>
  @page { margin: 0; }
  html, body { margin:0; padding:0; background:#fff; }
  .print-root { width:100vw; min-height:100vh; display:grid; place-items:center; }
  .card { width: 660px; border:1px solid #ddd; padding:16px; font:14px/1.45 system-ui, -apple-system, Segoe UI, Roboto, Arial; }
  .row { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
  .sw { display:grid; grid-template-columns: 64px 1fr; gap:10px; align-items:center; }
  .chip { display:inline-block; padding:3px 8px; border:1px solid #ccc; border-radius:999px; }
  .muted { color:#666; font-size:12px; }
  .box { width:64px; height:40px; border:1px solid #aaa; }
</style>
</head>
<body>
  <div class="print-root">${html}</div>
  <script>window.onload = () => { window.focus(); window.print(); setTimeout(()=>window.close(), 300); };</script>
</body>
</html>`);
        doc.close();
    }

    const targetHex = rgbHex(round.target);
    const showRevealNumbers = !!reveal; // reveal panel numbers only after an attempt
    const showAlwaysNumbers = showNumbers; // learning toggle: show everywhere

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div className="title">RGB Color Guesser</div>
                <div className="controls">
                    <select value={difficultyKey} onChange={(e) => setDifficultyKey(e.target.value)} aria-label="Difficulty">
                        {Object.keys(DIFF).map(k => <option key={k} value={k}>{k}</option>)}
                    </select>

                    <div className="seg">
                        <button className={mode === MODES.Tiles ? "active" : ""} onClick={() => setMode(MODES.Tiles)}>Tiles</button>
                        <button className={mode === MODES.Mixer ? "active" : ""} onClick={() => setMode(MODES.Mixer)}>Mixer</button>
                    </div>

                    <label className="toggle">
                        <input type="checkbox" checked={showNumbers} onChange={(e) => setShowNumbers(e.target.checked)} />
                        <span>Show numbers (learning)</span>
                    </label>

                    <label className="toggle">
                        <input type="checkbox" checked={showHints} onChange={(e) => setShowHints(e.target.checked)} />
                        <span>Hints</span>
                    </label>

                    <button onClick={() => setRound(generateRound(difficulty))}>New Round</button>
                    <button onClick={() => setShowResetConfirm(true)}>Reset</button>
                    <button onClick={handlePrint}>Print Scorecard</button>
                </div>
            </Styled.Header>

            <Styled.Stats>
                <div className="chip">Score: <b>{score}</b></div>
                <div className="chip">Streak: <b>{streak}</b></div>
                <div className="chip">Lives: <b>{lives}</b></div>
                <div className="chip ghost">Best Score: <b>{bestScore}</b></div>
                <div className="chip ghost">Best Streak: <b>{bestStreak}</b></div>
            </Styled.Stats>

            <Styled.Stage>
                <Styled.TargetCard>
                    <div className="top">
                        <div className="swatch" style={{ background: rgbStr(round.target) }} />
                        <div className="vals">
                            {/* Only show numbers if learning toggle is ON */}
                            {showAlwaysNumbers && (
                                <>
                                    <div className="rgb">{rgbStr(round.target)}</div>
                                    <div className="hex">{targetHex}</div>
                                </>
                            )}
                            {showHints && (
                                <div className="hint">
                                    <span className="muted">Dominant:</span> <b>{dominantChannel(round.target)}</b>
                                    {"  "}<span className="muted">Tone:</span> <b>{warmCool(round.target)}</b>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="note muted">Guess the color. Numbers stay hidden unless you enable “Show numbers” or after you answer.</div>
                </Styled.TargetCard>

                {mode === MODES.Tiles ? (
                    <Styled.Options $cols={difficulty.options <= 3 ? 3 : 3}>
                        {round.options.map((opt, i) => (
                            <button key={`${opt.r}-${opt.g}-${opt.b}-${i}`} onClick={() => onGuess(opt)}>
                                <span className="box" style={{ background: rgbStr(opt) }} />
                                {/* No titles on options to prevent cheating by tooltip */}
                                {showAlwaysNumbers && <span className="code">{rgbStr(opt)}</span>}
                            </button>
                        ))}
                    </Styled.Options>
                ) : (
                    <Styled.Mixer>
                        <div className="mixRow">
                            <div className="mixSwatch" style={{ background: rgbStr(mix) }} />
                            <div className="mixVals">
                                <div>{rgbStr(mix)} {showAlwaysNumbers && <span className="muted">({rgbHex(mix)})</span>}</div>
                            </div>
                        </div>
                        <div className="sliders">
                            <label>R <input type="range" min="0" max="255" value={mix.r} onChange={(e) => setMix({ ...mix, r: Number(e.target.value) })} /></label>
                            <label>G <input type="range" min="0" max="255" value={mix.g} onChange={(e) => setMix({ ...mix, g: Number(e.target.value) })} /></label>
                            <label>B <input type="range" min="0" max="255" value={mix.b} onChange={(e) => setMix({ ...mix, b: Number(e.target.value) })} /></label>
                        </div>
                        <div className="act">
                            <button onClick={onMixerCheck}>Check</button>
                        </div>
                        <div className="muted tiny">Success tolerance (ΔE, Lab): ≤ {difficulty.tolLab}.</div>
                    </Styled.Mixer>
                )}

                {/* Reveal-after-guess: numbers + deltas, separate from tiles */}
                {reveal && (
                    <Styled.Reveal ref={printRef}>
                        <div className="card">
                            <div className="top">
                                <h3 className="title">Result — {reveal.ok ? "Correct" : "Wrong"}</h3>
                                <div className={`pill ${reveal.ok ? "ok" : "bad"}`}>{reveal.ok ? "Correct" : "Wrong"}</div>
                            </div>

                            <div className="row">
                                <div className="sw">
                                    <div className="box" style={{ background: rgbStr(reveal.target) }}></div>
                                    <div>
                                        <div><b>Target</b></div>
                                        <div className="muted">{rgbStr(reveal.target)}  •  {rgbHex(reveal.target)}</div>
                                    </div>
                                </div>
                                <div className="sw">
                                    <div className="box" style={{ background: rgbStr(reveal.picked) }}></div>
                                    <div>
                                        <div><b>Picked</b></div>
                                        <div className="muted">{rgbStr(reveal.picked)}  •  {rgbHex(reveal.picked)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="row mt">
                                <div>
                                    <b>Deltas</b>
                                    <div className="muted">ΔR {reveal.d.dr}, ΔG {reveal.d.dg}, ΔB {reveal.d.db}</div>
                                </div>
                                <div>
                                    <b>ΔE (Lab)</b>
                                    <div className="muted">{Math.round(reveal.deltaE)}</div>
                                </div>
                            </div>

                            <div className="row mt">
                                <div className="muted">Mode: {reveal.mode}</div>
                                <div className="muted">Difficulty: {reveal.diff} • {new Date().toLocaleString()}</div>
                            </div>
                        </div>
                    </Styled.Reveal>
                )}
            </Styled.Stage>

            {showResetConfirm && (
                <Styled.ModalBackdrop onClick={() => setShowResetConfirm(false)}>
                    <Styled.ModalCard onClick={(e) => e.stopPropagation()}>
                        <div className="title">Reset progress?</div>
                        <div className="msg">This will clear score, streak, lives, and the last result.</div>
                        <div className="row">
                            <button className="ghost" onClick={() => setShowResetConfirm(false)}>Cancel</button>
                            <button className="danger" onClick={() => { resetAll(); setShowResetConfirm(false); }}>Yes, Reset</button>
                        </div>
                    </Styled.ModalCard>
                </Styled.ModalBackdrop>
            )}
        </Styled.Wrapper>
    );
}

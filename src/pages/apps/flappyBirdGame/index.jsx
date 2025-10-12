import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/* =========================================================
   LocalStorage keys
   ========================================================= */
const LS_BEST = "flappyBird_best_v1";
const LS_STATS = "flappyBird_stats_v1";
const LS_SETTINGS = "flappyBird_settings_v1";

/* =========================================================
   Logical canvas size (we scale it responsively)
   ========================================================= */
const BASE_W = 480;
const BASE_H = 640;
const GROUND_H = 80;
const BIRD_X = 120;
const PIPE_W = 70;

const DEFAULTS = {
    gravity: 0.42,
    jump: -7.0,
    gap: 150,
    speedMul: 1.0,
    spawnEvery: 1400, // ms
};

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

function makePipe(gap) {
    const minTop = 50;
    const maxTop = BASE_H - GROUND_H - gap - 50;
    const topH = rand(minTop, Math.max(minTop, maxTop));
    return { x: BASE_W + 40, topH, gap, scored: false };
}

const FlappyBirdGame = () => {
    /* ---------- refs for game state (avoid stale closures) ---------- */
    const canvasRef = useRef(null);
    const rafRef = useRef(0);

    const phaseRef = useRef("ready"); // "ready" | "playing" | "over"
    const settingsRef = useRef(DEFAULTS);
    const scoreRef = useRef(0);

    const birdRef = useRef({ y: BASE_H / 2, vy: 0, r: 14 });
    const pipesRef = useRef([]);
    const lastSpawnRef = useRef(0);
    const pausedRef = useRef(false);

    /* ---------- React state for UI ---------- */
    const [phase, setPhase] = useState("ready");
    const [score, setScore] = useState(0);
    const [best, setBest] = useState(0);
    const [stats, setStats] = useState({ attempts: 0, totalScore: 0, lastScore: 0 });
    const [settings, setSettings] = useState(() => {
        try { return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(LS_SETTINGS) || "{}")) }; }
        catch { return DEFAULTS; }
    });

    /* keep refs in sync with state */
    useEffect(() => { phaseRef.current = phase; }, [phase]);
    useEffect(() => { settingsRef.current = settings; try { localStorage.setItem(LS_SETTINGS, JSON.stringify(settings)); } catch { } }, [settings]);
    useEffect(() => { scoreRef.current = score; }, [score]);

    /* ---------- LS boot ---------- */
    useEffect(() => {
        try { setBest(parseInt(localStorage.getItem(LS_BEST) || "0", 10) || 0); } catch { }
        try {
            const s = JSON.parse(localStorage.getItem(LS_STATS) || "{}");
            if (s && typeof s === "object") {
                setStats({
                    attempts: s.attempts || 0,
                    totalScore: s.totalScore || 0,
                    lastScore: s.lastScore || 0
                });
            }
        } catch { }
    }, []);

    /* ---------- Canvas resize (DPR-aware) ---------- */
    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const parentW = canvas.parentElement?.clientWidth || BASE_W;
        const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
        const scale = parentW / BASE_W;
        const cssW = Math.max(320, parentW);
        const cssH = Math.round(BASE_H * scale);

        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);

        const ctx = canvas.getContext("2d");
        // logical units → device pixels
        ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    };

    useEffect(() => {
        resizeCanvas();
        const onR = () => resizeCanvas();
        window.addEventListener("resize", onR);
        return () => window.removeEventListener("resize", onR);
    }, []);

    /* ---------- Controls ---------- */
    const flap = () => {
        const phaseNow = phaseRef.current;
        if (phaseNow === "ready") {
            start();
            return;
        }
        if (phaseNow !== "playing" || pausedRef.current) return;
        birdRef.current.vy = settingsRef.current.jump;
    };

    const start = () => {
        setPhase("playing");
        setScore(0);
        pipesRef.current = [];
        birdRef.current = { y: BASE_H / 2, vy: 0, r: 14 };
        lastSpawnRef.current = performance.now();
        pausedRef.current = false;
    };

    const restart = () => {
        setPhase("ready");
        setScore(0);
        pipesRef.current = [];
        birdRef.current = { y: BASE_H / 2, vy: 0, r: 14 };
        lastSpawnRef.current = 0;
        pausedRef.current = false;
    };

    const onKeyDown = (e) => {
        if (["Space", "ArrowUp"].includes(e.code)) {
            e.preventDefault();
            flap();
        } else if (e.key.toLowerCase() === "p") {
            if (phaseRef.current === "playing") pausedRef.current = !pausedRef.current;
        } else if (e.key.toLowerCase() === "r") {
            restart();
        }
    };

    /* attach global key once; clicks via React handlers on canvas */
    useEffect(() => {
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    /* ---------- Always-on RAF loop (reads refs, never stale) ---------- */
    useEffect(() => {
        cancelAnimationFrame(rafRef.current);
        const loop = (t) => {
            step(t);
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafRef.current);
    }, []); // mount once

    const step = (t) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const nowPhase = phaseRef.current;
        const s = settingsRef.current;

        // Background
        ctx.clearRect(0, 0, BASE_W, BASE_H);
        const g = ctx.createLinearGradient(0, 0, 0, BASE_H);
        g.addColorStop(0, "#89CFF0");
        g.addColorStop(1, "#d0f0ff");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, BASE_W, BASE_H);

        // Ground
        ctx.fillStyle = "#c2b280";
        ctx.fillRect(0, BASE_H - GROUND_H, BASE_W, GROUND_H);

        // Phase overlays
        if (nowPhase === "ready") {
            drawCenteredText(ctx, "Flappy Bird", BASE_W / 2, 120, "28px Poppins", "#212121");
            drawCenteredText(ctx, "Tap / Click / Space to start", BASE_W / 2, 160, "16px Poppins", "#333");
            drawCenteredText(ctx, "P: Pause • R: Restart", BASE_W / 2, 184, "12px Poppins", "#555");
        }
        if (nowPhase === "over") {
            drawCenteredText(ctx, "Game Over", BASE_W / 2, 150, "26px Poppins", "#b00020");
            drawCenteredText(ctx, "Tap / Space to restart", BASE_W / 2, 180, "14px Poppins", "#444");
        }

        // Simulate if playing (not paused)
        if (nowPhase === "playing" && !pausedRef.current) {
            const b = birdRef.current;
            b.vy += s.gravity;
            b.y += b.vy;
            b.y = clamp(b.y, 0, BASE_H - GROUND_H - b.r);

            // spawn pipes
            if (t - lastSpawnRef.current >= s.spawnEvery / s.speedMul) {
                pipesRef.current.push(makePipe(s.gap));
                lastSpawnRef.current = t;
            }

            // pipes move + draw
            ctx.fillStyle = "#6fcf97";
            for (let i = pipesRef.current.length - 1; i >= 0; i--) {
                const p = pipesRef.current[i];
                p.x -= 2.2 * s.speedMul;

                // top
                ctx.fillRect(p.x, 0, PIPE_W, p.topH);
                // bottom
                const bottomY = p.topH + p.gap;
                ctx.fillRect(p.x, bottomY, PIPE_W, BASE_H - GROUND_H - bottomY);

                // score when passed
                if (!p.scored && p.x + PIPE_W < BIRD_X - b.r) {
                    p.scored = true;
                    setScore((val) => val + 1);
                }

                // cleanup
                if (p.x + PIPE_W < -40) pipesRef.current.splice(i, 1);
            }

            // bird
            drawBird(ctx, BIRD_X, b.y, b.r);

            // collisions
            if (b.y + b.r >= BASE_H - GROUND_H) return gameOver();
            for (const p of pipesRef.current) {
                if (circleRectCollide(BIRD_X, b.y, b.r, p.x, 0, PIPE_W, p.topH)) return gameOver();
                const bottomY = p.topH + p.gap;
                if (circleRectCollide(BIRD_X, b.y, b.r, p.x, bottomY, PIPE_W, BASE_H - GROUND_H - bottomY)) return gameOver();
            }
        } else {
            // idle bird
            const b = birdRef.current;
            drawBird(ctx, BIRD_X, b.y, b.r);
        }

        // HUD
        ctx.font = "bold 26px Poppins, Arial";
        ctx.fillStyle = "#111";
        ctx.textAlign = "left";
        ctx.fillText(`Score: ${scoreRef.current}`, 14, 34);

        if (nowPhase === "playing" && pausedRef.current) {
            drawCenteredText(ctx, "Paused", BASE_W / 2, 160, "22px Poppins", "#333");
        }
    };

    const gameOver = () => {
        setPhase("over");
        const s = scoreRef.current;
        // stats
        setStats((prev) => {
            const next = { attempts: prev.attempts + 1, totalScore: prev.totalScore + s, lastScore: s };
            try { localStorage.setItem(LS_STATS, JSON.stringify(next)); } catch { }
            return next;
        });
        // best
        setBest((b) => {
            const nb = Math.max(b, s);
            try { localStorage.setItem(LS_BEST, String(nb)); } catch { }
            return nb;
        });
    };

    /* ---------- Draw helpers ---------- */
    function drawCenteredText(ctx, text, x, y, font, fill) {
        ctx.save();
        ctx.font = font;
        ctx.fillStyle = fill;
        ctx.textAlign = "center";
        ctx.fillText(text, x, y);
        ctx.restore();
    }
    function drawBird(ctx, x, y, r) {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = "#ffd166";
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        // eye
        ctx.beginPath();
        ctx.fillStyle = "#fff";
        ctx.arc(x + r * 0.3, y - r * 0.2, r * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = "#000";
        ctx.arc(x + r * 0.42, y - r * 0.2, r * 0.18, 0, Math.PI * 2);
        ctx.fill();
        // beak
        ctx.beginPath();
        ctx.moveTo(x + r * 0.9, y);
        ctx.lineTo(x + r * 1.5, y - r * 0.25);
        ctx.lineTo(x + r * 1.5, y + r * 0.25);
        ctx.closePath();
        ctx.fillStyle = "#f3722c";
        ctx.fill();
        ctx.restore();
    }
    function circleRectCollide(cx, cy, cr, rx, ry, rw, rh) {
        const nx = clamp(cx, rx, rx + rw);
        const ny = clamp(cy, ry, ry + rh);
        const dx = cx - nx;
        const dy = cy - ny;
        return dx * dx + dy * dy <= cr * cr;
    }

    /* ---------- Modals: clear best/stats ---------- */
    const [confirmClearBest, setConfirmClearBest] = useState(false);
    const [confirmClearStats, setConfirmClearStats] = useState(false);

    const clearBest = () => {
        try { localStorage.removeItem(LS_BEST); } catch { }
        setBest(0);
        setConfirmClearBest(false);
    };
    const clearStats = () => {
        try { localStorage.removeItem(LS_STATS); } catch { }
        setStats({ attempts: 0, totalScore: 0, lastScore: 0 });
        setConfirmClearStats(false);
    };

    const average = useMemo(() => {
        if (!stats.attempts) return 0;
        return (stats.totalScore / stats.attempts).toFixed(2);
    }, [stats]);

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div>
                    <h1>Flappy Bird Game</h1>
                </div>
                <Styled.Badges>
                    <span className="badge">Local Best</span>
                    <span className="badge">Stats</span>
                    <span className="badge">Responsive Canvas</span>
                </Styled.Badges>
            </Styled.Header>

            <Styled.Layout>
                {/* LEFT: Game */}
                <Styled.GameCard>
                    <Styled.CanvasWrap>
                        <canvas
                            ref={canvasRef}
                            width={BASE_W}
                            height={BASE_H}
                            onPointerDown={flap}
                            onTouchStart={(e) => { e.preventDefault(); flap(); }}
                            role="img"
                            aria-label="Flappy Bird canvas"
                        />
                    </Styled.CanvasWrap>

                    <Styled.Controls>
                        <button
                            onClick={() =>
                                phaseRef.current === "playing"
                                    ? (pausedRef.current = !pausedRef.current)
                                    : start()
                            }
                            aria-label="Start or Pause"
                        >
                            {phaseRef.current === "playing" ? (pausedRef.current ? "Resume" : "Pause") : "Start"}
                        </button>
                        <button onClick={restart} aria-label="Restart">Restart</button>
                        <div className="spacer" />
                        <div className="score">
                            <span>Score: <strong>{score}</strong></span>
                            <span>Best: <strong>{best}</strong></span>
                        </div>
                    </Styled.Controls>

                    <Styled.FooterNote>
                        Tap / Click / Space to flap • P to pause • R to restart
                    </Styled.FooterNote>
                </Styled.GameCard>

                {/* RIGHT: Stats + Settings */}
                <Styled.Side>
                    <Styled.Card>
                        <h3>Stats</h3>
                        <Styled.Stats>
                            <li><span>Best Score</span><strong>{best}</strong></li>
                            <li><span>Attempts</span><strong>{stats.attempts}</strong></li>
                            <li><span>Last Score</span><strong>{stats.lastScore}</strong></li>
                            <li><span>Average</span><strong>{average}</strong></li>
                        </Styled.Stats>
                        <Styled.Actions>
                            <button className="danger" onClick={() => setConfirmClearBest(true)}>Clear Best</button>
                            <button className="danger" onClick={() => setConfirmClearStats(true)}>Clear Stats</button>
                        </Styled.Actions>
                    </Styled.Card>

                    <Styled.Card>
                        <h3>Difficulty</h3>
                        <Styled.Field>
                            <label htmlFor="speedMul">Speed</label>
                            <input
                                id="speedMul" type="range" min="0.6" max="1.8" step="0.1"
                                value={settings.speedMul}
                                onChange={(e) => setSettings((s) => ({ ...s, speedMul: parseFloat(e.target.value) }))}
                            />
                            <Styled.Help>{settings.speedMul.toFixed(1)}x</Styled.Help>
                        </Styled.Field>

                        <Styled.Field>
                            <label htmlFor="gap">Gap</label>
                            <input
                                id="gap" type="range" min="110" max="220" step="5"
                                value={settings.gap}
                                onChange={(e) => setSettings((s) => ({ ...s, gap: parseInt(e.target.value, 10) }))}
                            />
                            <Styled.Help>{settings.gap}px</Styled.Help>
                        </Styled.Field>

                        <Styled.Field>
                            <label htmlFor="gravity">Gravity</label>
                            <input
                                id="gravity" type="range" min="0.30" max="0.70" step="0.02"
                                value={settings.gravity}
                                onChange={(e) => setSettings((s) => ({ ...s, gravity: parseFloat(e.target.value) }))}
                            />
                            <Styled.Help>{settings.gravity.toFixed(2)}</Styled.Help>
                        </Styled.Field>

                        <Styled.Field>
                            <label htmlFor="jump">Jump Strength</label>
                            <input
                                id="jump" type="range" min="-9" max="-5" step="0.1"
                                value={settings.jump}
                                onChange={(e) => setSettings((s) => ({ ...s, jump: parseFloat(e.target.value) }))}
                            />
                            <Styled.Help>{settings.jump.toFixed(1)}</Styled.Help>
                        </Styled.Field>
                    </Styled.Card>
                </Styled.Side>
            </Styled.Layout>

            {/* Confirm Modals */}
            <ConfirmModal
                open={confirmClearBest}
                title="Clear Best Score?"
                message="This will remove your saved best score."
                onConfirm={clearBest}
                onClose={() => setConfirmClearBest(false)}
            />
            <ConfirmModal
                open={confirmClearStats}
                title="Clear Stats?"
                message="This will reset attempts, total score, and last score."
                onConfirm={clearStats}
                onClose={() => setConfirmClearStats(false)}
            />
        </Styled.Wrapper>
    );
};

/* =========================================================
   Confirm Modal (self-made)
   ========================================================= */
const ConfirmModal = ({ open, title, message, onConfirm, onClose }) => {
    if (!open) return null;
    return (
        <Styled.ModalBackdrop onMouseDown={onClose}>
            <Styled.Modal onMouseDown={(e) => e.stopPropagation()}>
                <h4>{title}</h4>
                <p>{message}</p>
                <div className="row">
                    <button className="ghost" onClick={onClose}>Cancel</button>
                    <button className="danger" onClick={() => onConfirm?.()}>Yes, proceed</button>
                </div>
            </Styled.Modal>
        </Styled.ModalBackdrop>
    );
};

export default FlappyBirdGame;

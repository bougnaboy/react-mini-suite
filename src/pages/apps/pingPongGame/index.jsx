import React, { useEffect, useRef, useState } from "react";
import { Styled } from "./styled";

/* =========================================================
   Local storage keys
   ========================================================= */
const LS_SETTINGS = "pingPong_settings_v1";
const LS_HISCORES = "pingPong_highscores_v1";

/* =========================================================
   Defaults
   ========================================================= */
const defaultSettings = {
    mode: "single",              // "single" | "two"
    difficulty: "medium",        // "easy" | "medium" | "hard"
    winScore: 7,                 // points to win a match
    ballSpeed: 6,                // starting speed
    paddleSpeed: 8,              // keyboard move speed per frame
    sound: false,
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const PingPongGame = () => {
    /* SETTINGS + PERSIST ----------------------------------- */
    const [settings, setSettings] = useState(() => {
        try {
            return { ...defaultSettings, ...(JSON.parse(localStorage.getItem(LS_SETTINGS) || "null") || {}) };
        } catch {
            return defaultSettings;
        }
    });
    useEffect(() => {
        try { localStorage.setItem(LS_SETTINGS, JSON.stringify(settings)); } catch { }
    }, [settings]);

    const [hiScores, setHiScores] = useState(() => {
        try { return JSON.parse(localStorage.getItem(LS_HISCORES) || "[]"); } catch { return []; }
    });
    useEffect(() => {
        try { localStorage.setItem(LS_HISCORES, JSON.stringify(hiScores)); } catch { }
    }, [hiScores]);

    /* GAME STATE ------------------------------------------- */
    const arenaRef = useRef(null);
    const frameRef = useRef(0);
    const playingRef = useRef(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isServing, setIsServing] = useState(true);

    const [scores, setScores] = useState({ left: 0, right: 0 });
    const [winner, setWinner] = useState("");

    // arena metrics (responsive)
    const [arena, setArena] = useState({ w: 960, h: 540, dpr: 1 });

    // paddles and ball (in refs for perf)
    const leftRef = useRef({ x: 28, y: 0, w: 14, h: 100 });
    const rightRef = useRef({ x: 0, y: 0, w: 14, h: 100 }); // x set later from arena width
    const ballRef = useRef({ x: 0, y: 0, r: 9, vx: 0, vy: 0, speed: settings.ballSpeed });

    // keyboard state
    const keys = useRef({ w: false, s: false, ArrowUp: false, ArrowDown: false });

    // pointer drag (which side is being dragged)
    const drag = useRef({ active: false, side: "" });

    /* ---------------------- DOM Sync ---------------------- */
    const syncTransforms = () => {
        if (!arenaRef.current) return;
        const L = leftRef.current;
        const R = rightRef.current;
        const B = ballRef.current;

        const arenaEl = arenaRef.current;
        const paddleLeft = arenaEl.querySelector('[data-role="paddle-left"]');
        const paddleRight = arenaEl.querySelector('[data-role="paddle-right"]');
        const ballEl = arenaEl.querySelector('[data-role="ball"]');
        if (paddleLeft) paddleLeft.style.transform = `translate(${L.x}px, ${L.y}px)`;
        if (paddleRight) paddleRight.style.transform = `translate(${R.x}px, ${R.y}px)`;
        if (ballEl) ballEl.style.transform = `translate(${B.x - B.r}px, ${B.y - B.r}px)`;
    };

    /* -------------------- Resize logic -------------------- */
    useEffect(() => {
        const update = () => {
            const el = arenaRef.current;
            if (!el) return;
            const w = el.clientWidth;
            const h = el.clientHeight || Math.round(w * 9 / 16); // ✅ use actual height
            setArena({ w, h, dpr: window.devicePixelRatio || 1 });
        };
        update();
        const ro = new ResizeObserver(update);
        if (arenaRef.current) ro.observe(arenaRef.current);
        window.addEventListener("orientationchange", update);
        return () => {
            try { ro.disconnect(); } catch { }
            window.removeEventListener("orientationchange", update);
        };
    }, []);

    // init or when arena changes
    useEffect(() => {
        const { w, h } = arena;
        // center paddles and ball
        leftRef.current.y = (h - leftRef.current.h) / 2;
        rightRef.current.x = w - 28 - rightRef.current.w;
        rightRef.current.y = (h - rightRef.current.h) / 2;

        ballRef.current.x = w / 2;
        ballRef.current.y = h / 2;
        ballRef.current.vx = 0;
        ballRef.current.vy = 0;
        ballRef.current.speed = settings.ballSpeed;

        setIsServing(true);
        setIsPlaying(false);
        playingRef.current = false;
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;

        // ✅ reflect positions immediately (even when paused)
        syncTransforms();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [arena.w, arena.h]);

    /* =========================================================
       Game Loop
       ========================================================= */
    const startServe = () => {
        if (isPlaying) return;
        setWinner("");
        setIsServing(false);
        setIsPlaying(true);
        playingRef.current = true;

        // launch ball towards random side
        const angle = (Math.random() * 0.6 - 0.3); // -0.3..0.3 radians
        const dir = Math.random() < 0.5 ? -1 : 1;
        const speed = settings.ballSpeed;
        ballRef.current.vx = Math.cos(angle) * speed * dir;
        ballRef.current.vy = Math.sin(angle) * speed;
        loop();
    };

    const pause = () => {
        setIsPlaying(false);
        playingRef.current = false;
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
    };

    const resume = () => {
        if (playingRef.current) return;
        setIsPlaying(true);
        playingRef.current = true;
        loop();
    };

    const loop = () => {
        frameRef.current = requestAnimationFrame(loop);
        tick();
    };

    /* =========================================================
       Physics + Controls
       ========================================================= */
    const tick = () => {
        const { w, h } = arena;
        const L = leftRef.current;
        const R = rightRef.current;
        const B = ballRef.current;

        // keyboard movement (both players)
        if (keys.current.w) L.y -= settings.paddleSpeed;
        if (keys.current.s) L.y += settings.paddleSpeed;
        if (keys.current.ArrowUp && settings.mode === "two") R.y -= settings.paddleSpeed;
        if (keys.current.ArrowDown && settings.mode === "two") R.y += settings.paddleSpeed;

        // AI paddle for single-player
        if (settings.mode === "single") {
            const targetY = B.y - R.h / 2;
            const follow = settings.difficulty === "easy" ? 0.05 : settings.difficulty === "hard" ? 0.16 : 0.1;
            R.y += (targetY - R.y) * follow;
        }

        // clamp paddles using actual arena height ✅
        L.y = clamp(L.y, 0, h - L.h);
        R.y = clamp(R.y, 0, h - R.h);

        // move ball
        B.x += B.vx;
        B.y += B.vy;

        // walls
        if (B.y - B.r <= 0 && B.vy < 0) {
            B.vy = -B.vy;
            B.y = B.r;
        }
        if (B.y + B.r >= h && B.vy > 0) {
            B.vy = -B.vy;
            B.y = h - B.r;
        }

        // paddle collisions
        if (B.x - B.r <= L.x + L.w && B.x > L.x && B.y >= L.y && B.y <= L.y + L.h && B.vx < 0) {
            B.vx = -B.vx;
            const impact = (B.y - (L.y + L.h / 2)) / (L.h / 2);
            B.vy += impact * 2.5;
            B.speed *= 1.03;
            const mag = Math.hypot(B.vx, B.vy) || 1;
            B.vx = (B.vx / mag) * B.speed;
            B.vy = (B.vy / mag) * B.speed;
            B.x = L.x + L.w + B.r + 0.01;
        }
        if (B.x + B.r >= R.x && B.x < R.x + R.w && B.y >= R.y && B.y <= R.y + R.h && B.vx > 0) {
            B.vx = -B.vx;
            const impact = (B.y - (R.y + R.h / 2)) / (R.h / 2);
            B.vy += impact * 2.5;
            B.speed *= 1.03;
            const mag = Math.hypot(B.vx, B.vy) || 1;
            B.vx = (B.vx / mag) * B.speed;
            B.vy = (B.vy / mag) * B.speed;
            B.x = R.x - B.r - 0.01;
        }

        // goal?
        if (B.x + B.r < 0) {
            goal("right");
        } else if (B.x - B.r > w) {
            goal("left");
        }

        // ✅ reflect to DOM every frame
        syncTransforms();
    };

    const goal = (side) => {
        pause();
        setIsServing(true);

        setScores((prev) => {
            const next = { ...prev, [side]: prev[side] + 1 };
            if (next[side] >= settings.winScore) {
                setWinner(side === "left" ? "Player 1" : (settings.mode === "single" ? "You" : "Player 2"));
                try {
                    const entry = {
                        when: new Date().toISOString(),
                        mode: settings.mode,
                        difficulty: settings.mode === "single" ? settings.difficulty : "-",
                        score: `${next.left}–${next.right}`,
                    };
                    setHiScores((arr) => [entry, ...arr].slice(0, 10));
                } catch { }
                setScores({ left: 0, right: 0 });
            }
            return next;
        });

        // reset ball to center
        const { w, h } = arena;
        ballRef.current.x = w / 2;
        ballRef.current.y = h / 2;
        ballRef.current.vx = 0;
        ballRef.current.vy = 0;
        ballRef.current.speed = settings.ballSpeed;

        // reflect after reset
        syncTransforms();
    };

    /* =========================================================
       Controls: keyboard
       ========================================================= */
    useEffect(() => {
        const onKey = (e) => {
            if (e.repeat) return;
            if (e.type === "keydown") {
                if (e.key in keys.current) keys.current[e.key] = true;
                if (e.key === " " || e.code === "Space") {
                    e.preventDefault();
                    if (isServing) startServe();
                    else if (isPlaying) pause();
                    else resume();
                }
            } else {
                if (e.key in keys.current) keys.current[e.key] = false;
            }
        };
        window.addEventListener("keydown", onKey);
        window.addEventListener("keyup", onKey);
        const onBlur = () => {
            keys.current = { w: false, s: false, ArrowUp: false, ArrowDown: false };
            pause();
        };
        window.addEventListener("blur", onBlur);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("keyup", onKey);
            window.removeEventListener("blur", onBlur);
        };
    }, [isPlaying, isServing]); // ok

    /* =========================================================
       Controls: mouse/touch drag
       ========================================================= */
    const onPointerDown = (e) => {
        if (!arenaRef.current) return;
        const rect = arenaRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        drag.current.active = true;
        drag.current.side = x < rect.width / 2 ? "left" : "right";
        arenaRef.current.setPointerCapture?.(e.pointerId);
        moveWithPointer(e);
    };
    const onPointerMove = (e) => {
        if (!drag.current.active) return;
        moveWithPointer(e);
    };
    const onPointerUp = (e) => {
        drag.current.active = false;
        try { arenaRef.current?.releasePointerCapture?.(e.pointerId); } catch { }
    };

    const moveWithPointer = (e) => {
        if (!arenaRef.current) return;
        const rect = arenaRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const padH = leftRef.current.h;
        const targetY = clamp(y - padH / 2, 0, rect.height - padH);

        if (drag.current.side === "left") {
            leftRef.current.y = targetY;
        } else if (settings.mode === "two") {
            rightRef.current.y = targetY;
        }

        // ✅ reflect immediately even if paused
        syncTransforms();
    };

    /* =========================================================
       Clear/Reset modals
       ========================================================= */
    const [modal, setModal] = useState({ show: false, kind: "" });
    const openModal = (kind) => setModal({ show: true, kind });
    const closeModal = () => setModal({ show: false, kind: "" });

    const confirmModal = () => {
        if (modal.kind === "clearScores") {
            setScores({ left: 0, right: 0 });
            setWinner("");
            syncTransforms();
        }
        if (modal.kind === "resetDefaults") {
            setSettings(defaultSettings);
        }
        if (modal.kind === "clearHiScores") {
            setHiScores([]);
        }
        closeModal();
    };

    const isServeDisabled = !isServing;
    const isPauseDisabled = !isPlaying;
    const isResumeDisabled = isPlaying || isServing;

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div>
                    <h1>Ping Pong Game</h1>
                    <p>Drag paddles (mouse/touch) or use keys (W/S and ↑/↓). Space = Serve/Pause/Resume.</p>
                </div>
                <Styled.Badges>
                    <span className="badge">Single / Two Player</span>
                    <span className="badge">Local Save</span>
                    <span className="badge">No Portals</span>
                </Styled.Badges>
            </Styled.Header>

            <Styled.Layout>
                {/* ===================== LEFT: GAME ===================== */}
                <Styled.Card>
                    <Styled.Scorebar>
                        <div className="side">
                            <strong>Player 1</strong>
                            <span className="score">{scores.left}</span>
                        </div>
                        <div className="center">
                            {winner ? <span className="winner">{winner} won</span> : <span>{isPlaying ? "Playing..." : (isServing ? "Press Serve" : "Paused")}</span>}
                        </div>
                        <div className="side right">
                            <strong>{settings.mode === "single" ? "CPU" : "Player 2"}</strong>
                            <span className="score">{scores.right}</span>
                        </div>
                    </Styled.Scorebar>

                    <Styled.Arena
                        ref={arenaRef}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerUp}
                    >
                        <div className="net" aria-hidden />
                        <div data-role="paddle-left" className="paddle" aria-label="Left paddle" />
                        <div data-role="paddle-right" className="paddle" aria-label="Right paddle" />
                        <div data-role="ball" className="ball" aria-label="Ball" />
                    </Styled.Arena>

                    <Styled.Actions>
                        <div className="left">
                            <button onClick={startServe} disabled={isServeDisabled}>Serve</button>
                            <button onClick={pause} disabled={isPauseDisabled}>Pause</button>
                            <button onClick={resume} disabled={isResumeDisabled}>Resume</button>
                        </div>
                        <div className="right">
                            <button className="ghost" onClick={() => openModal("clearScores")}>Clear Scores</button>
                            <button className="ghost" onClick={() => openModal("resetDefaults")}>Reset Defaults</button>
                        </div>
                    </Styled.Actions>
                </Styled.Card>

                {/* ===================== RIGHT: SETTINGS & HISTORY ===================== */}
                <Styled.Side>
                    <Styled.Card>
                        <h3>Settings</h3>
                        <Styled.FormRow>
                            <label>Mode</label>
                            <div className="inline">
                                <label className="radio">
                                    <input
                                        type="radio"
                                        name="mode"
                                        value="single"
                                        checked={settings.mode === "single"}
                                        onChange={(e) => setSettings((s) => ({ ...s, mode: e.target.value }))}
                                    />
                                    <span>Single Player</span>
                                </label>
                                <label className="radio">
                                    <input
                                        type="radio"
                                        name="mode"
                                        value="two"
                                        checked={settings.mode === "two"}
                                        onChange={(e) => setSettings((s) => ({ ...s, mode: e.target.value }))}
                                    />
                                    <span>Two Players</span>
                                </label>
                            </div>
                        </Styled.FormRow>

                        {settings.mode === "single" && (
                            <Styled.FormRow>
                                <label>CPU Difficulty</label>
                                <select
                                    value={settings.difficulty}
                                    onChange={(e) => setSettings((s) => ({ ...s, difficulty: e.target.value }))}
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </Styled.FormRow>
                        )}

                        <Styled.FormRow>
                            <label>Win Score</label>
                            <select
                                value={settings.winScore}
                                onChange={(e) => setSettings((s) => ({ ...s, winScore: Number(e.target.value) }))}
                            >
                                {[5, 7, 9, 11].map((n) => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </Styled.FormRow>

                        <Styled.FormRow>
                            <label>Ball Speed</label>
                            <input
                                type="range" min={3} max={12} step={1}
                                value={settings.ballSpeed}
                                onChange={(e) => setSettings((s) => ({ ...s, ballSpeed: Number(e.target.value) }))}
                            />
                            <div className="hint">{settings.ballSpeed}</div>
                        </Styled.FormRow>

                        <Styled.FormRow>
                            <label>Paddle Speed</label>
                            <input
                                type="range" min={5} max={16} step={1}
                                value={settings.paddleSpeed}
                                onChange={(e) => setSettings((s) => ({ ...s, paddleSpeed: Number(e.target.value) }))}
                            />
                            <div className="hint">{settings.paddleSpeed}</div>
                        </Styled.FormRow>
                    </Styled.Card>

                    <Styled.Card>
                        <h3>Controls</h3>
                        <ul className="tips">
                            <li>Drag left/right half to move that paddle.</li>
                            <li>W/S = Player 1, ↑/↓ = Player 2 (two-player mode).</li>
                            <li>Space = Serve / Pause / Resume.</li>
                        </ul>
                    </Styled.Card>

                    <Styled.Card>
                        <h3>Recent Matches</h3>
                        {hiScores.length === 0 ? (
                            <p className="muted">Nothing yet.</p>
                        ) : (
                            <Styled.HiList>
                                {hiScores.map((h, i) => (
                                    <li key={i}>
                                        <div className="row">
                                            <span className="score">{h.score}</span>
                                            <span className="meta">
                                                {h.mode === "single" ? `CPU: ${h.difficulty}` : "Two-Player"}
                                            </span>
                                        </div>
                                        <div className="time">{new Date(h.when).toLocaleString()}</div>
                                    </li>
                                ))}
                            </Styled.HiList>
                        )}
                        <Styled.Actions>
                            <div className="left" />
                            <div className="right">
                                <button className="ghost" onClick={() => openModal("clearHiScores")}>Clear History</button>
                            </div>
                        </Styled.Actions>
                    </Styled.Card>
                </Styled.Side>
            </Styled.Layout>

            {/* =====================================================
          Confirm Modal (self-made, no portals)
         ===================================================== */}
            {modal.show && (
                <Styled.Modal onMouseDown={closeModal}>
                    <Styled.ModalCard onMouseDown={(e) => e.stopPropagation()}>
                        <h3>
                            {modal.kind === "clearScores" && "Clear current scores?"}
                            {modal.kind === "resetDefaults" && "Reset settings to defaults?"}
                            {modal.kind === "clearHiScores" && "Clear match history?"}
                        </h3>
                        <p className="muted">
                            {modal.kind === "clearScores" && "This will set Player 1 and Player 2 scores to zero."}
                            {modal.kind === "resetDefaults" && "All game settings will return to their original values."}
                            {modal.kind === "clearHiScores" && "This will remove saved results from localStorage."}
                        </p>
                        <Styled.ModalActions>
                            <button className="ghost" onClick={closeModal}>Cancel</button>
                            <button className="danger" onClick={confirmModal}>Confirm</button>
                        </Styled.ModalActions>
                    </Styled.ModalCard>
                </Styled.Modal>
            )}
        </Styled.Wrapper>
    );
};

export default PingPongGame;

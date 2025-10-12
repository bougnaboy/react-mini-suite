import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Styled from "./styled";

/* ======== constants ======== */
const BOARD = 20;
const START_LEN = 3;
const MIN_SPEED = 60;
const START_SPEED = 180;
const HS_KEY = "snake_highscore_v1";

/* dir helpers */
const DIR = {
    up: { x: 0, y: -1, key: "up" },
    down: { x: 0, y: 1, key: "down" },
    left: { x: -1, y: 0, key: "left" },
    right: { x: 1, y: 0, key: "right" },
};
const OPP = { up: "down", down: "up", left: "right", right: "left" };

const rand = (n) => Math.floor(Math.random() * n);
const same = (a, b) => a.x === b.x && a.y === b.y;

/* ======== helpers ======== */
function makeStartSnake() {
    const c = Math.floor(BOARD / 2);
    return Array.from({ length: START_LEN }, (_, i) => ({ x: c - i, y: c }));
}
function randomFood(snake) {
    while (true) {
        const p = { x: rand(BOARD), y: rand(BOARD) };
        if (!snake.some((s) => same(s, p))) return p;
    }
}

const SnakeGame = () => {
    const [snake, setSnake] = useState(makeStartSnake);
    const [dir, setDir] = useState(DIR.right);
    const nextDirRef = useRef(DIR.right);
    const [food, setFood] = useState(() => randomFood(makeStartSnake()));
    const [speed, setSpeed] = useState(START_SPEED);
    const [running, setRunning] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [confirm, setConfirm] = useState({ open: false, type: "", title: "", body: "" });
    const [high, setHigh] = useState(() => {
        try { return parseInt(localStorage.getItem(HS_KEY) || "0", 10) || 0; } catch { return 0; }
    });

    const score = useMemo(() => Math.max(0, snake.length - START_LEN), [snake.length]);

    /* keep refs fresh */
    const snakeRef = useRef(snake);
    const runningRef = useRef(running);
    const gameOverRef = useRef(gameOver);
    useEffect(() => { snakeRef.current = snake; }, [snake]);
    useEffect(() => { runningRef.current = running; }, [running]);
    useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);

    /* focusable wrapper to trap keys */
    const wrapRef = useRef(null);
    const refocus = () => wrapRef.current?.focus();
    useEffect(() => { refocus(); }, []);

    function queueDir(name) {
        if (OPP[dir.key] === name) return; // no instant reverse
        nextDirRef.current = DIR[name];
    }
    function toggleRunPause() {
        if (gameOverRef.current) return;
        setRunning((r) => !r);
    }
    function newGame() {
        const sn = makeStartSnake();
        setSnake(sn);
        setDir(DIR.right);
        nextDirRef.current = DIR.right;
        setFood(randomFood(sn));
        setSpeed(START_SPEED);
        setRunning(false);
        setGameOver(false);
        refocus();
    }

    /* ✅ handle keys here; prevent page scroll */
    const handleKey = (e) => {
        const key = e.key.toLowerCase();
        const isArrow = key.startsWith("arrow");
        const isWASD = ["w", "a", "s", "d"].includes(key);
        const isSpace = key === " ";
        const isEnter = key === "enter";
        if (isArrow || isWASD || isSpace || isEnter) e.preventDefault(); // stop page scroll
        if (e.repeat) return;

        if (["arrowup", "w"].includes(key)) { queueDir("up"); }
        if (["arrowdown", "s"].includes(key)) { queueDir("down"); }
        if (["arrowleft", "a"].includes(key)) { queueDir("left"); }
        if (["arrowright", "d"].includes(key)) { queueDir("right"); }
        if (isSpace || key === "p") { toggleRunPause(); }
        if (isEnter && gameOverRef.current) { newGame(); }
    };

    const step = useCallback(() => {
        const s = snakeRef.current;
        const cur = nextDirRef.current;
        setDir(cur);

        const head = s[0];
        const next = { x: head.x + cur.x, y: head.y + cur.y };

        // wall
        if (next.x < 0 || next.y < 0 || next.x >= BOARD || next.y >= BOARD) {
            setRunning(false); setGameOver(true); return;
        }
        // self
        if (s.some((p) => same(p, next))) {
            setRunning(false); setGameOver(true); return;
        }

        // move / eat
        const ate = same(next, food);
        const grown = [next, ...s];
        const tailCut = ate ? grown : grown.slice(0, -1);
        setSnake(tailCut);

        if (ate) {
            setFood(randomFood(tailCut));
            setSpeed((ms) => Math.max(MIN_SPEED, ms - 6));
        }

        // high score
        const sc = Math.max(0, tailCut.length - START_LEN);
        if (sc > high) {
            setHigh(sc);
            try { localStorage.setItem(HS_KEY, String(sc)); } catch { }
        }
    }, [food, high]);

    /* game loop */
    useEffect(() => {
        let id;
        let last = performance.now();
        let acc = 0;
        const loop = (t) => {
            const dt = t - last;
            last = t;
            if (runningRef.current && !gameOverRef.current) {
                acc += dt;
                if (acc >= speed) { acc = 0; step(); }
            }
            id = requestAnimationFrame(loop);
        };
        id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, [speed, step]);

    /* confirm actions */
    const askReset = () => setConfirm({ open: true, type: "reset", title: "Reset game?", body: "Current run will be lost." });
    const askClearHS = () => setConfirm({ open: true, type: "clear-hs", title: "Clear high score?", body: "This removes the saved best score from this browser." });
    const doConfirm = () => {
        if (confirm.type === "reset") newGame();
        if (confirm.type === "clear-hs") { setHigh(0); try { localStorage.setItem(HS_KEY, "0"); } catch { } }
        setConfirm({ open: false, type: "", title: "", body: "" });
    };

    /* grid render helpers */
    const snakeSet = useMemo(() => new Set(snake.map((p) => `${p.x},${p.y}`)), [snake]);
    const cells = useMemo(() => {
        const arr = [];
        for (let y = 0; y < BOARD; y++) for (let x = 0; x < BOARD; x++) {
            const k = `${x},${y}`;
            const isFood = food.x === x && food.y === y;
            const isHead = snake[0].x === x && snake[0].y === y;
            const isBody = !isHead && snakeSet.has(k);
            arr.push({ k, isFood, isHead, isBody });
        }
        return arr;
    }, [snake, snakeSet, food]);

    return (
        <Styled.Wrapper
            ref={wrapRef}
            tabIndex={0}
            onKeyDown={handleKey}
            aria-label="Snake Game Area (focus is trapped here for keyboard controls)"
        >
            <Styled.Header>
                <div>
                    <h1>Snake</h1>
                    <p>Arrow/WASD to move • Space to {running ? "Pause" : "Start"} • Enter to restart on game over.</p>
                </div>
                <Styled.Badges>
                    <span className="badge">Board {BOARD}×{BOARD}</span>
                    <span className="badge">RAF Loop</span>
                </Styled.Badges>
            </Styled.Header>

            <Styled.Layout>
                <div className="left">
                    <Styled.Card>
                        <Styled.TopBar>
                            <div className="metric"><span className="label">Score</span><strong>{score}</strong></div>
                            <div className="metric"><span className="label">High</span><strong>{high}</strong></div>
                            <div className="metric"><span className="label">Speed</span><strong>{Math.round(1000 / speed)} /s</strong></div>
                            <div className="spacer" />
                            <Styled.ControlsMini>
                                <button onMouseDown={(e) => e.preventDefault()} onClick={() => { queueDir("up"); refocus(); }} aria-label="Up">▲</button>
                                <div className="row">
                                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => { queueDir("left"); refocus(); }} aria-label="Left">◀</button>
                                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => { toggleRunPause(); refocus(); }} aria-label="Play/Pause">{running ? "⏸" : "▶"}</button>
                                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => { queueDir("right"); refocus(); }} aria-label="Right">▶</button>
                                </div>
                                <button onMouseDown={(e) => e.preventDefault()} onClick={() => { queueDir("down"); refocus(); }} aria-label="Down">▼</button>
                            </Styled.ControlsMini>
                        </Styled.TopBar>

                        <Styled.Board $size={BOARD} onClick={refocus}>
                            {cells.map((c) => (
                                <div className={["cell", c.isFood && "food", c.isHead && "head", c.isBody && "snake"].filter(Boolean).join(" ")} key={c.k} />
                            ))}
                        </Styled.Board>

                        <Styled.Actions>
                            {!gameOver ? (
                                <>
                                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => { toggleRunPause(); refocus(); }}>{running ? "Pause" : "Start"}</button>
                                    <button className="ghost" onMouseDown={(e) => e.preventDefault()} onClick={() => { askReset(); refocus(); }}>Reset</button>
                                </>
                            ) : (
                                <>
                                    <button className="primary" onMouseDown={(e) => e.preventDefault()} onClick={() => { newGame(); refocus(); }}>New Game</button>
                                    <button className="ghost" onMouseDown={(e) => e.preventDefault()} onClick={() => { askReset(); refocus(); }}>Reset Board</button>
                                </>
                            )}
                            <div className="spacer" />
                            <button className="ghost danger" onMouseDown={(e) => e.preventDefault()} onClick={() => { askClearHS(); refocus(); }}>Clear High Score</button>
                        </Styled.Actions>
                    </Styled.Card>
                </div>

                <div className="right">
                    <Styled.Card>
                        <Styled.SectionTitle>How to play</Styled.SectionTitle>
                        <Styled.Info>
                            Eat the <span className="foodDot" /> to grow. Avoid the walls and your own tail.
                            Game speeds up a little with each bite.
                        </Styled.Info>
                    </Styled.Card>
                </div>
            </Styled.Layout>

            {gameOver && (
                <Styled.Overlay onClick={newGame}>
                    <div className="panel" onClick={(e) => e.stopPropagation()}>
                        <h3>Game Over</h3>
                        <p>Final score <strong>{score}</strong></p>
                        <button className="primary" onMouseDown={(e) => e.preventDefault()} onClick={() => { newGame(); refocus(); }}>Play Again</button>
                    </div>
                </Styled.Overlay>
            )}

            {confirm.open && (
                <Styled.ModalOverlay onClick={() => setConfirm({ open: false, type: "", title: "", body: "" })}>
                    <Styled.Modal onClick={(e) => e.stopPropagation()}>
                        <h3>{confirm.title}</h3>
                        <p>{confirm.body}</p>
                        <div className="actions">
                            <button className="ghost" onClick={() => setConfirm({ open: false, type: "", title: "", body: "" })}>Cancel</button>
                            <button className="danger" onClick={doConfirm}>{confirm.type === "reset" ? "Reset" : "Delete"}</button>
                        </div>
                    </Styled.Modal>
                </Styled.ModalOverlay>
            )}
        </Styled.Wrapper>
    );
};

export default SnakeGame;

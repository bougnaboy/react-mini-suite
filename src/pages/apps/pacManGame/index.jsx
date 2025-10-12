import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

// Symbols
const WALL = "#";
const EMPTY = " ";
const PELLET = ".";
const POWER = "o";
const PACMAN_SPAWN = "P";
const GHOST_SPAWN = "G";

/** Fixed-width maze */
const MAZE = [
    "#####################",
    "#.........##.........#",
    "#.###.###.##.###.###.#",
    "#o###.###.##.###.###o#",
    "#....................#",
    "#.###.#.######.#.###.#",
    "#.....#....##..#.....#",
    "#####.### ## ###.#####",
    "    #.#   GG   #.#    ",
    "#####.# ##  ## #.#####",
    "#.........P..........#",
    "#####################",
];

// Gameplay constants
const TICK_MS = 120;
const GHOST_MOVE_EVERY = 2;
const FRIGHTENED_TICKS = 50;
const START_LIVES = 3;
const PELLET_SCORE = 10;
const POWER_SCORE = 50;
const GHOST_SCORE = 200;

// Storage
const HS_KEY = "pacMan_highScore_v1";

// Directions
const DIRS = {
    left: { r: 0, c: -1, key: "left" },
    right: { r: 0, c: 1, key: "right" },
    up: { r: -1, c: 0, key: "up" },
    down: { r: 1, c: 0, key: "down" },
};
const DIR_ORDER = ["left", "right", "up", "down"];

const isWalkable = (cell) => cell !== WALL && cell !== undefined;

/** Parse maze */
function parseMaze(map) {
    const grid = map.map((row) => row.split(""));
    let pac = null;
    const ghosts = [];
    let pellets = 0;

    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            const ch = grid[r][c];
            if (ch === PACMAN_SPAWN) { pac = { r, c }; grid[r][c] = EMPTY; }
            else if (ch === GHOST_SPAWN) { ghosts.push({ r, c }); grid[r][c] = EMPTY; }
            else if (ch === PELLET || ch === POWER) pellets++;
        }
    }
    if (!pac) pac = { r: 1, c: 1 };
    if (ghosts.length === 0) ghosts.push({ r: pac.r, c: pac.c + 3 }, { r: pac.r, c: pac.c - 3 });

    return { grid, pac, ghosts, pelletsTotal: pellets };
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const cloneGrid = (g) => g.map((row) => row.slice());

/** Confirm Modal */
const ConfirmModal = ({ open, title, message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onClose }) => {
    if (!open) return null;
    return (
        <Styled.ModalBackdrop onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
            <Styled.Modal onClick={(e) => e.stopPropagation()}>
                <h3>{title}</h3>
                <p>{message}</p>
                <Styled.ModalActions>
                    <button className="ghost" onClick={onClose}>{cancelText}</button>
                    <button className="danger" onClick={() => { onConfirm?.(); onClose?.(); }}>{confirmText}</button>
                </Styled.ModalActions>
            </Styled.Modal>
        </Styled.ModalBackdrop>
    );
};

const PacManGame = () => {
    const parsed = useMemo(() => parseMaze(MAZE), []);
    const [grid, setGrid] = useState(() => cloneGrid(parsed.grid));

    // Entities
    const [pac, setPac] = useState({ r: parsed.pac.r, c: parsed.pac.c, dir: "left", nextDir: "left" });
    const [ghosts, setGhosts] = useState(() =>
        parsed.ghosts.map((g, i) => ({
            id: i,
            r: g.r,
            c: g.c,
            dir: pick(DIR_ORDER),
            color: ["#ff4d4f", "#2f88ff", "#ff8c00", "#ff6bd6"][i % 4],
            home: { r: g.r, c: g.c },
        }))
    );

    // Game state
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(() => {
        try { return Number(localStorage.getItem(HS_KEY) || 0); } catch { return 0; }
    });
    const [lives, setLives] = useState(START_LIVES);
    const [paused, setPaused] = useState(false);
    const [frightenedTicks, setFrightenedTicks] = useState(0);
    const [pelletsLeft, setPelletsLeft] = useState(parsed.pelletsTotal);
    const [helpOpen, setHelpOpen] = useState(false);

    // Modals
    const [resetOpen, setResetOpen] = useState(false);
    const [clearHOpen, setClearHOpen] = useState(false);

    // Ticker
    const tickRef = useRef(0);
    const loopRef = useRef(null);

    // Helpers
    const rows = grid.length;
    const cols = grid[0].length;

    // Movement helpers
    const canMove = useCallback((r, c, dirKey) => {
        const d = DIRS[dirKey];
        const nr = r + d.r;
        const nc = c + d.c;
        const cell = grid[nr]?.[nc];
        return isWalkable(cell);
    }, [grid]);

    const moveEntity = (r, c, dirKey) => {
        const d = DIRS[dirKey];
        return { r: r + d.r, c: c + d.c };
    };

    // Eat tile
    const eatTile = useCallback((r, c) => {
        const cell = grid[r][c];
        if (cell === PELLET || cell === POWER) {
            setGrid((g) => { const next = cloneGrid(g); next[r][c] = EMPTY; return next; });
            setPelletsLeft((x) => x - 1);
            setScore((s) => s + (cell === POWER ? POWER_SCORE : PELLET_SCORE));
            if (cell === POWER) setFrightenedTicks(FRIGHTENED_TICKS);
        }
    }, [grid]);

    // Ghost AI (random, anti-backtrack)
    const chooseGhostDir = useCallback((ghost) => {
        const options = DIR_ORDER.slice();
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        const reverseMap = { left: "right", right: "left", up: "down", down: "up" };

        for (const k of options) {
            if (k === reverseMap[ghost.dir]) continue;
            const d = DIRS[k], nr = ghost.r + d.r, nc = ghost.c + d.c;
            if (isWalkable(grid[nr]?.[nc])) return k;
        }
        for (const k of options) {
            const d = DIRS[k], nr = ghost.r + d.r, nc = ghost.c + d.c;
            if (isWalkable(grid[nr]?.[nc])) return k;
        }
        return ghost.dir;
    }, [grid]);

    // Collisions
    const checkCollisions = useCallback((pr, pc, gList) => {
        for (const gh of gList) {
            if (gh.r === pr && gh.c === pc) {
                if (frightenedTicks > 0) {
                    setScore((s) => s + GHOST_SCORE);
                    setGhosts((prev) =>
                        prev.map((g) => (g.id === gh.id ? { ...g, r: gh.home.r, c: gh.home.c, dir: pick(DIR_ORDER) } : g))
                    );
                } else {
                    return true;
                }
            }
        }
        return false;
    }, [frightenedTicks]);

    // Main tick loop
    useEffect(() => {
        if (paused) return;
        loopRef.current = setInterval(() => {
            tickRef.current += 1;
            const tick = tickRef.current;

            // Pac-Man
            setPac((p) => {
                let nextDir = p.dir;
                if (p.nextDir && canMove(p.r, p.c, p.nextDir)) nextDir = p.nextDir;
                else if (!canMove(p.r, p.c, nextDir)) {
                    if (p.nextDir && canMove(p.r, p.c, p.nextDir)) nextDir = p.nextDir;
                    else return p;
                }
                const { r: nr, c: nc } = moveEntity(p.r, p.c, nextDir);
                eatTile(nr, nc);
                return { ...p, r: nr, c: nc, dir: nextDir };
            });

            // Ghosts
            const ghostEvery = frightenedTicks > 0 ? GHOST_MOVE_EVERY + 1 : GHOST_MOVE_EVERY;
            if (tick % ghostEvery === 0) {
                setGhosts((list) => list.map((g) => {
                    const dir = chooseGhostDir(g);
                    const { r: nr, c: nc } = moveEntity(g.r, g.c, dir);
                    return { ...g, r: nr, c: nc, dir };
                }));
            }

            // Frightened ticks
            if (frightenedTicks > 0) setFrightenedTicks((t) => Math.max(0, t - 1));
        }, TICK_MS);

        return () => clearInterval(loopRef.current);
    }, [paused, canMove, chooseGhostDir, eatTile, frightenedTicks]);

    // Post-move: collisions + win/lose
    useEffect(() => {
        const id = setTimeout(() => {
            setPac((p) => {
                if (checkCollisions(p.r, p.c, ghosts)) {
                    if (lives > 1) {
                        setLives((x) => x - 1);
                        setPac({ r: parsed.pac.r, c: parsed.pac.c, dir: "left", nextDir: "left" });
                        setGhosts(parsed.ghosts.map((g, i) => ({
                            id: i, r: g.r, c: g.c, dir: pick(DIR_ORDER),
                            color: ["#ff4d4f", "#2f88ff", "#ff8c00", "#ff6bd6"][i % 4],
                            home: { r: g.r, c: g.c },
                        })));
                        setFrightenedTicks(0);
                        setPaused(true);
                        setTimeout(() => setPaused(false), 600);
                    } else {
                        setLives(0);
                        setPaused(true);
                    }
                }
                return p;
            });

            if (pelletsLeft === 0 && lives > 0) setPaused(true);
        }, 5);
        return () => clearTimeout(id);
    }, [ghosts, lives, pelletsLeft, parsed, checkCollisions]);

    // High score
    useEffect(() => {
        if (score > highScore) {
            setHighScore(score);
            try { localStorage.setItem(HS_KEY, String(score)); } catch { }
        }
    }, [score, highScore]);

    // Keyboard (block page scroll on arrows)
    const handleKey = useCallback((e) => {
        const tag = (e.target?.tagName || "").toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select" || e.target?.isContentEditable) return;

        const key = e.key;
        const lower = key.toLowerCase();
        const isArrow = key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown";
        if (isArrow) e.preventDefault();

        if (isArrow || ["a", "d", "w", "s"].includes(lower)) {
            if (key === "ArrowLeft" || lower === "a") setPac((p) => ({ ...p, nextDir: "left" }));
            else if (key === "ArrowRight" || lower === "d") setPac((p) => ({ ...p, nextDir: "right" }));
            else if (key === "ArrowUp" || lower === "w") setPac((p) => ({ ...p, nextDir: "up" }));
            else if (key === "ArrowDown" || lower === "s") setPac((p) => ({ ...p, nextDir: "down" }));
            return;
        }
        if (lower === "p") { e.preventDefault(); setPaused((x) => !x); return; }
        if (lower === "r") { e.preventDefault(); setResetOpen(true); return; }
    }, []);

    useEffect(() => {
        const listener = (e) => handleKey(e);
        window.addEventListener("keydown", listener, { passive: false });
        return () => window.removeEventListener("keydown", listener);
    }, [handleKey]);

    // Recompute pellets on grid change
    useEffect(() => {
        const count = grid.flat().filter((ch) => ch === PELLET || ch === POWER).length;
        setPelletsLeft(count);
    }, [grid]);

    /** ✅ RESET function (this was missing in your paste) */
    const doReset = useCallback(() => {
        setGrid(cloneGrid(parsed.grid));
        setPac({ r: parsed.pac.r, c: parsed.pac.c, dir: "left", nextDir: "left" });
        setGhosts(parsed.ghosts.map((g, i) => ({
            id: i, r: g.r, c: g.c, dir: pick(DIR_ORDER),
            color: ["#ff4d4f", "#2f88ff", "#ff8c00", "#ff6bd6"][i % 4],
            home: { r: g.r, c: g.c },
        })));
        setScore(0);
        setLives(START_LIVES);
        setPelletsLeft(parsed.pelletsTotal);
        setFrightenedTicks(0);
        setPaused(false);
    }, [parsed]);

    const clearHighScore = useCallback(() => {
        setHighScore(0);
        try { localStorage.removeItem(HS_KEY); } catch { }
    }, []);

    // Render helpers
    const cellKey = (r, c) => `${r}:${c}`;
    const isPacHere = (r, c) => pac.r === r && pac.c === c;
    const ghostAt = (r, c) => ghosts.find((g) => g.r === r && g.c === c);

    return (
        <Styled.Wrapper>
            <Styled.Container>
                <Styled.TopBar>
                    <div className="left">
                        <h1>PacMan Game</h1>
                        <p className="subtitle">Nostalgic mini-game in React — pellets, power-ups, and pesky ghosts.</p>
                    </div>
                    <div className="right">
                        <div className="stat"><span className="label">Score</span><span className="value">{score}</span></div>
                        <div className="stat"><span className="label">High</span><span className="value">{highScore}</span></div>
                        <div className="stat">
                            <span className="label">Lives</span>
                            <span className="value">{Array.from({ length: lives }).map((_, i) => <span key={i} className="life" />)}</span>
                        </div>
                    </div>
                </Styled.TopBar>

                <Styled.Toolbar>
                    <button onClick={() => setPaused((x) => !x)}>{paused ? "Resume" : "Pause"}</button>
                    <button onClick={() => setResetOpen(true)}>Reset Game</button>
                    <button className="ghost" onClick={() => setHelpOpen((x) => !x)}>{helpOpen ? "Hide Help" : "Show Help"}</button>
                    <div className="spacer" />
                    <button className="danger" onClick={() => setClearHOpen(true)}>Clear High Score</button>
                </Styled.Toolbar>

                {helpOpen && (
                    <Styled.Help>
                        <strong>Controls:</strong> Arrow keys / WASD to move, P to Pause/Resume, R to Reset.{" "}
                        Eat <em>pellets</em> (•) for 10 pts, <em>power pellets</em> (◉) for 50 pts and frightened ghosts.{" "}
                        Collide with a normal ghost → lose a life. In frightened time, collide to eat ghost (200 pts).{" "}
                        Everything is client-side; high score is stored in your browser.
                    </Styled.Help>
                )}

                <Styled.Board
                    role="application"
                    aria-label="PacMan board"
                    $cols={cols}        // ✅ only pass transient prop for styled use
                >
                    {grid.map((row, r) => (
                        <div key={r} className="row">
                            {row.map((cell, c) => {
                                const gh = ghostAt(r, c);
                                const pacHere = isPacHere(r, c);
                                const isFright = frightenedTicks > 0;

                                return (
                                    <div
                                        key={`${r}:${c}`}
                                        className={[
                                            "cell",
                                            cell === "#" ? "wall" : "floor",
                                            cell === "." ? "pellet" : "",
                                            cell === "o" ? "power" : "",
                                        ].join(" ").trim()}
                                    >
                                        {cell === "." && <span className="dot" />}
                                        {cell === "o" && <span className="power-dot" />}
                                        {pacHere && <span className={`pacman dir-${pac.dir}`} aria-label="PacMan" />}
                                        {gh && (
                                            <span
                                                className={`ghost ${isFright ? "frightened" : ""}`}
                                                style={{ "--ghost": gh.color }}
                                                aria-label="Ghost"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                    {paused && <div className="overlay"><span>{lives === 0 ? "Game Over" : "Paused"}</span></div>}
                </Styled.Board>

                <Styled.Footer>
                    <div className="meta">
                        <span>Pellets left: {pelletsLeft}</span>
                        {frightenedTicks > 0 && <span> | Frightened: {frightenedTicks}</span>}
                    </div>
                </Styled.Footer>
            </Styled.Container>

            {/* Confirm Modals */}
            <ConfirmModal
                open={resetOpen}
                title="Reset Game?"
                message="This will restart the maze, score, and lives."
                confirmText="Reset"
                onConfirm={doReset}
                onClose={() => setResetOpen(false)}
            />
            <ConfirmModal
                open={clearHOpen}
                title="Clear High Score?"
                message="High score will be removed from this browser."
                confirmText="Clear"
                onConfirm={clearHighScore}
                onClose={() => setClearHOpen(false)}
            />
        </Styled.Wrapper>
    );
};

export default PacManGame;

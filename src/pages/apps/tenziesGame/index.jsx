import React, { useEffect, useMemo, useRef, useState } from "react";
import Styled from "./styled";

/* =========================
   LocalStorage keys
   ========================= */
const STATS_KEY = "tenzies_stats_v1";

/* =========================
   Helpers
   ========================= */
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const newDie = () => ({ id: cryptoId(), value: rand(1, 6), held: false });
const newDice = (n = 10) => Array.from({ length: n }, newDie);
function cryptoId() {
    try { return crypto.randomUUID(); } catch { return Math.random().toString(36).slice(2); }
}
function formatTime(sec) {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

/* =========================
   Component
   ========================= */
const TenziesGame = () => {
    const [dice, setDice] = useState(() => newDice(10));
    const [rolls, setRolls] = useState(0);
    const [won, setWon] = useState(false);

    const [timerOn, setTimerOn] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const tickRef = useRef(null);

    const [stats, setStats] = useState(() => {
        try {
            return (
                JSON.parse(localStorage.getItem(STATS_KEY) || "null") || {
                    bestTime: null,
                    bestRolls: null,
                    totalWins: 0,
                    totalRolls: 0,
                    totalPlayTime: 0,
                }
            );
        } catch {
            return { bestTime: null, bestRolls: null, totalWins: 0, totalRolls: 0, totalPlayTime: 0 };
        }
    });

    const [confirm, setConfirm] = useState({ open: false, type: "", title: "", body: "" });

    /* derived */
    const targetValue = useMemo(() => {
        // most frequent value among held dice; otherwise value of first die
        const heldVals = dice.filter((d) => d.held).map((d) => d.value);
        if (heldVals.length) {
            return heldVals.sort((a, b) =>
                heldVals.filter((v) => v === b).length - heldVals.filter((v) => v === a).length
            )[0];
        }
        return dice[0]?.value ?? 1;
    }, [dice]);

    const allSame = useMemo(() => dice.every((d) => d.value === dice[0].value), [dice]);
    const allHeld = useMemo(() => dice.every((d) => d.held), [dice]);

    /* timer */
    useEffect(() => {
        if (timerOn) {
            tickRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
        }
        return () => clearInterval(tickRef.current);
    }, [timerOn]);

    /* win detect */
    useEffect(() => {
        if (!won && allHeld && allSame) {
            setWon(true);
            setTimerOn(false);
            // update stats
            const next = { ...stats };
            next.totalWins += 1;
            next.totalRolls += rolls;
            next.totalPlayTime += elapsed;
            if (next.bestTime === null || elapsed < next.bestTime) next.bestTime = elapsed;
            if (next.bestRolls === null || rolls < next.bestRolls) next.bestRolls = rolls;
            setStats(next);
            try { localStorage.setItem(STATS_KEY, JSON.stringify(next)); } catch { }
        }
    }, [allHeld, allSame, won, rolls, elapsed, stats]);

    /* persist stats when changed (non-win updates) */
    useEffect(() => {
        try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch { }
    }, [stats]);

    /* keyboard controls */
    useEffect(() => {
        const onKey = (e) => {
            if (e.repeat) return;
            if (e.code === "Space") {
                e.preventDefault();
                won ? newGame() : rollDice();
            }
            // digits 1..0 toggling (0 = 10th)
            if (/Digit[0-9]/.test(e.code)) {
                const d = e.code === "Digit0" ? 10 : parseInt(e.code.slice(-1), 10);
                toggleHoldIndex(d - 1);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [won, dice]);

    function toggleHold(id) {
        if (!timerOn && !won) setTimerOn(true);
        setDice((prev) => prev.map((d) => (d.id === id ? { ...d, held: !d.held } : d)));
    }
    function toggleHoldIndex(idx) {
        const die = dice[idx];
        if (!die) return;
        toggleHold(die.id);
    }

    function rollDice() {
        if (won) return;
        if (!timerOn) setTimerOn(true);
        setDice((prev) => prev.map((d) => (d.held ? d : { ...d, value: rand(1, 6) })));
        setRolls((r) => r + 1);
    }

    function newGame() {
        setDice(newDice(10));
        setRolls(0);
        setWon(false);
        setElapsed(0);
        setTimerOn(false);
    }

    const askReset = () =>
        setConfirm({ open: true, type: "reset", title: "Reset current game?", body: "Your current progress will be lost." });

    const askClearStats = () =>
        setConfirm({
            open: true,
            type: "clear-stats",
            title: "Clear all stats?",
            body: "Best time, best rolls and totals will be removed from this browser.",
        });

    function doConfirm() {
        if (confirm.type === "reset") {
            newGame();
        } else if (confirm.type === "clear-stats") {
            const cleared = { bestTime: null, bestRolls: null, totalWins: 0, totalRolls: 0, totalPlayTime: 0 };
            setStats(cleared);
            try { localStorage.setItem(STATS_KEY, JSON.stringify(cleared)); } catch { }
        }
        setConfirm({ open: false, type: "", title: "", body: "" });
    }

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div>
                    <h1>Tenzies</h1>
                    <p>Hold dice and roll until all ten dice show the <strong>same value</strong>. Quick fingers, quicker brain.</p>
                </div>
                <Styled.Badges>
                    <span className="badge">Timer</span>
                    <span className="badge">Keyboard</span>
                    <span className="badge">Confetti</span>
                </Styled.Badges>
            </Styled.Header>

            <Styled.Layout>
                {/* LEFT: Board */}
                <div className="left">
                    <Styled.Card>
                        <Styled.Bar>
                            <div className="col">
                                <div className="label">Timer</div>
                                <div className="val">{formatTime(elapsed)}</div>
                            </div>
                            <div className="col">
                                <div className="label">Rolls</div>
                                <div className="val">{rolls}</div>
                            </div>
                            <div className="col">
                                <div className="label">Target</div>
                                <div className="val">{targetValue}</div>
                            </div>
                            <div className="spacer" />
                            <div className="hint">Space: {won ? "New Game" : "Roll"} • Keys 1–0: toggle dice</div>
                        </Styled.Bar>

                        <Styled.DiceGrid>
                            {dice.map((d, i) => (
                                <Styled.Die
                                    key={d.id}
                                    aria-pressed={d.held}
                                    data-held={d.held ? "1" : "0"}
                                    title={d.held ? "Held — click to release" : "Click to hold"}
                                    onClick={() => toggleHold(d.id)}
                                >
                                    <div className={`pips value-${d.value}`} aria-label={`Die ${i + 1} shows ${d.value}`}>
                                        {Array.from({ length: 9 }).map((_, k) => <span className="pip" key={k} />)}
                                    </div>
                                    <div className="num">{d.value}</div>
                                    <div className="idx">{i + 1}</div>
                                </Styled.Die>
                            ))}
                        </Styled.DiceGrid>

                        <Styled.Actions>
                            {!won ? (
                                <button onClick={rollDice}>Roll</button>
                            ) : (
                                <button className="primary" onClick={newGame}>New Game</button>
                            )}
                            <button className="ghost" onClick={askReset}>Reset</button>
                            <div className="spacer" />
                            <button className="ghost danger" onClick={askClearStats}>Clear Stats</button>
                        </Styled.Actions>
                    </Styled.Card>

                    <Styled.Card>
                        <Styled.SectionTitle>How to play</Styled.SectionTitle>
                        <Styled.Info>
                            Click a die to <strong>hold</strong> its value. Press <kbd>Space</kbd> to roll the rest.
                            Win when all ten dice are held and show the same number.
                        </Styled.Info>
                    </Styled.Card>
                </div>

                {/* RIGHT: Stats */}
                <div className="right">
                    <Styled.Card>
                        <Styled.SectionTitle>Your Stats</Styled.SectionTitle>
                        <Styled.Stats>
                            <div>
                                <span className="label">Best Time </span>
                                <strong>{stats.bestTime == null ? "—" : formatTime(stats.bestTime)}</strong>
                            </div>
                            <div>
                                <span className="label">Best Rolls </span>
                                <strong>{stats.bestRolls == null ? "—" : stats.bestRolls}</strong>
                            </div>
                            <div>
                                <span className="label">Total Wins </span>
                                <strong>{stats.totalWins}</strong>
                            </div>
                            <div>
                                <span className="label">Total Rolls </span>
                                <strong>{stats.totalRolls}</strong>
                            </div>
                            <div>
                                <span className="label">Total Play Time </span>
                                <strong>{formatTime(stats.totalPlayTime)}</strong>
                            </div>
                        </Styled.Stats>
                    </Styled.Card>
                </div>
            </Styled.Layout>

            {/* Win confetti */}
            {won && (
                <Styled.WinOverlay onClick={newGame}>
                    <div className="panel">
                        <h3>You Win!</h3>
                        <p>
                            Time <strong>{formatTime(elapsed)}</strong> • Rolls <strong>{rolls}</strong>
                        </p>
                        <button className="primary" onClick={newGame}>Play Again</button>
                    </div>
                    {Array.from({ length: 60 }).map((_, i) => <i className="confetti" key={i} />)}
                </Styled.WinOverlay>
            )}

            {/* Confirm modal */}
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

export default TenziesGame;

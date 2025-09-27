import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

/* -------------------------
   Storage & helpers
------------------------- */
const STORAGE_KEY = "ticTacToeGame.v1";

const LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6],         // diags
];

const emptyBoard = () => Array(9).fill("");

const safeGet = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
    } catch {
        return {};
    }
};
const safeSet = (obj) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch { }
};

/* Check winner & line */
function getWinner(board) {
    for (const [a, b, c] of LINES) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], line: [a, b, c] };
        }
    }
    if (board.every(Boolean)) return { winner: "draw", line: [] };
    return { winner: null, line: [] };
}

/* Simple AI:
   1) Win if possible
   2) Block opponent win
   3) Take center
   4) Take a corner
   5) Take a side
*/
function aiMove(board, aiMark) {
    const human = aiMark === "X" ? "O" : "X";

    const tryWin = (mark) => {
        for (let i = 0; i < 9; i++) {
            if (!board[i]) {
                const next = [...board];
                next[i] = mark;
                if (getWinner(next).winner === mark) return i;
            }
        }
        return -1;
    };

    // 1) win
    let idx = tryWin(aiMark);
    if (idx !== -1) return idx;

    // 2) block
    idx = tryWin(human);
    if (idx !== -1) return idx;

    // 3) center
    if (!board[4]) return 4;

    // 4) corners
    const corners = [0, 2, 6, 8].filter(i => !board[i]);
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

    // 5) sides
    const sides = [1, 3, 5, 7].filter(i => !board[i]);
    if (sides.length) return sides[Math.floor(Math.random() * sides.length)];

    return -1;
}

/* -------------------------
   Main
------------------------- */
export default function TicTacToeGame() {
    const persisted = safeGet();

    // settings
    const [mode, setMode] = useState(persisted.mode ?? "ai");         // "ai" | "friend"
    const [youPlayAs, setYouPlayAs] = useState(persisted.youPlayAs ?? "X"); // "X" | "O"
    const [scores, setScores] = useState(persisted.scores ?? { X: 0, O: 0, draw: 0 });

    // game state
    const [board, setBoard] = useState(persisted.board ?? emptyBoard());
    const [xIsNext, setXIsNext] = useState(persisted.xIsNext ?? true);
    const [confirm, setConfirm] = useState(null);

    // AI UX flag
    const [aiThinking, setAiThinking] = useState(false);

    // winner & UI flags
    const { winner, line } = useMemo(() => getWinner(board), [board]);
    const nextPlayer = xIsNext ? "X" : "O";
    const isAITurn = mode === "ai" && nextPlayer !== youPlayAs && !winner;

    // persist
    useEffect(() => {
        safeSet({ mode, youPlayAs, board, xIsNext, scores });
    }, [mode, youPlayAs, board, xIsNext, scores]);

    /* -------------------------
       Core move helpers
    ------------------------- */
    // Place the current nextPlayer mark at index i (used by both human and AI)
    const placeAt = (i) => {
        if (board[i] || winner) return false;
        setBoard(prev => {
            const next = [...prev];
            next[i] = nextPlayer;
            return next;
        });
        setXIsNext(prev => !prev);
        return true;
    };

    // Human click handler (blocks when not user's turn in AI mode)
    const playAt = (i) => {
        if (board[i] || winner) return;
        if (mode === "ai" && nextPlayer !== youPlayAs) return; // not your turn
        placeAt(i);
    };

    // AI turn effect with "thinking" delay
    useEffect(() => {
        if (!isAITurn) return;
        setAiThinking(true);
        const id = setTimeout(() => {
            const idx = aiMove(board, nextPlayer);
            if (idx !== -1) {
                placeAt(idx);
            }
            setAiThinking(false);
        }, 600); // small delay for UX
        return () => clearTimeout(id);
    }, [isAITurn, board, nextPlayer]);

    // After each completed game, update scores
    useEffect(() => {
        if (!winner) return;
        if (winner === "draw") {
            setScores(s => ({ ...s, draw: s.draw + 1 }));
        } else {
            setScores(s => ({ ...s, [winner]: s[winner] + 1 }));
        }
    }, [winner]);

    const newGame = () => {
        setBoard(emptyBoard());
        setXIsNext(true);
    };

    const askResetBoard = () => {
        if (board.some(Boolean) && !winner) {
            setConfirm({
                title: "Reset current game?",
                message: "This will clear the board and start a new game.",
                confirmText: "Reset",
                tone: "danger",
                onConfirm: () => { newGame(); setConfirm(null); }
            });
        } else {
            newGame();
        }
    };

    const askResetScores = () => {
        if (scores.X || scores.O || scores.draw) {
            setConfirm({
                title: "Reset scores?",
                message: "This will clear X/O/draw counters.",
                confirmText: "Reset",
                tone: "danger",
                onConfirm: () => { setScores({ X: 0, O: 0, draw: 0 }); setConfirm(null); }
            });
        }
    };

    const changeMode = (nextMode) => {
        if (nextMode === mode) return;
        if (board.some(Boolean) && !winner) {
            setConfirm({
                title: "Switch mode?",
                message: "This will reset the current game.",
                confirmText: "Switch",
                onConfirm: () => {
                    setMode(nextMode);
                    newGame();
                    setConfirm(null);
                }
            });
        } else {
            setMode(nextMode);
            newGame();
        }
    };

    const changeMark = (nextMark) => {
        if (mode !== "ai" || nextMark === youPlayAs) return;
        if (board.some(Boolean) && !winner) {
            setConfirm({
                title: "Change your mark?",
                message: "This will reset the current game.",
                confirmText: "Change",
                onConfirm: () => {
                    setYouPlayAs(nextMark);
                    newGame();
                    setConfirm(null);
                }
            });
        } else {
            setYouPlayAs(nextMark);
            newGame();
        }
    };

    const statusText = winner
        ? (winner === "draw" ? "It's a draw!" : `${winner} wins!`)
        : isAITurn
            ? `Turn: ${nextPlayer} — AI thinking…`
            : `Turn: ${nextPlayer}`;

    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        {/* Title */}
                        <Styled.Title>Tic-Tac-Toe Game</Styled.Title>

                        {/* space below title */}
                        <div style={{ height: 8 }} />

                        {/* Para 1: what this project is */}
                        <Styled.Sub>
                            A clean, offline-first Tic-Tac-Toe you can play solo against a simple AI
                            or locally with a friend. It keeps a lightweight scoreboard in your browser
                            (LocalStorage) and highlights the winning line when the game ends.
                        </Styled.Sub>

                        {/* space below para 1 */}
                        <div style={{ height: 6 }} />

                        {/* Para 2: how to use (steps) */}
                        <Styled.BulletList aria-label="How to use">
                            <Styled.BulletItem>Choose mode: versus AI or play with a friend.</Styled.BulletItem>
                            <Styled.BulletItem>If playing vs AI, pick your mark (X goes first).</Styled.BulletItem>
                            <Styled.BulletItem>Click a cell to place your mark; the app blocks invalid moves.</Styled.BulletItem>
                            <Styled.BulletItem>Use "New game" to clear the board or "Reset scores" to clear counters (both ask for confirmation when needed).</Styled.BulletItem>
                        </Styled.BulletList>

                        {/* space below bullet list */}
                        <div style={{ height: 10 }} />
                    </div>

                    {/* Quick badges */}
                    <Styled.BadgeRow>
                        <Styled.Tag>Mode: {mode === "ai" ? "AI" : "Friend"}</Styled.Tag>
                        <Styled.Tag>Turn: {winner ? "-" : nextPlayer}</Styled.Tag>
                        {isAITurn && <Styled.Tag>AI thinking…</Styled.Tag>}
                        <Styled.Tag $tone="muted">Scores — X: {scores.X} • O: {scores.O} • Draw: {scores.draw}</Styled.Tag>
                    </Styled.BadgeRow>
                </Styled.Header>

                {/* Controls */}
                <Styled.Card>
                    <Styled.FormRow>
                        <Styled.Label title="Select play mode">
                            <Styled.LabelText>Mode</Styled.LabelText>
                            <Styled.Select
                                value={mode}
                                onChange={(e) => changeMode(e.target.value)}
                                aria-label="Mode"
                            >
                                <option value="ai">Play vs AI</option>
                                <option value="friend">Play with a friend</option>
                            </Styled.Select>
                        </Styled.Label>

                        <Styled.Label title="Choose your mark (AI plays the other)" style={{ opacity: mode === "ai" ? 1 : 0.6 }}>
                            <Styled.LabelText>Your mark</Styled.LabelText>
                            <Styled.Select
                                value={youPlayAs}
                                onChange={(e) => changeMark(e.target.value)}
                                aria-label="Your mark"
                                disabled={mode !== "ai"}
                            >
                                <option value="X">X (first)</option>
                                <option value="O">O (second)</option>
                            </Styled.Select>
                        </Styled.Label>

                        <Styled.RowWrap>
                            <Styled.PrimaryButton type="button" onClick={askResetBoard}>
                                New game
                            </Styled.PrimaryButton>
                            <Styled.Button type="button" onClick={askResetScores}>
                                Reset scores
                            </Styled.Button>
                        </Styled.RowWrap>
                    </Styled.FormRow>
                </Styled.Card>

                {/* Game board */}
                <Styled.BoardCard aria-live="polite">
                    <Styled.Status>{statusText}</Styled.Status>
                    <Styled.BoardWrap>
                        {board.map((cell, i) => (
                            <Styled.Cell
                                key={i}
                                role="button"
                                aria-label={`Cell ${i + 1} ${cell ? cell : "empty"}`}
                                $win={line.includes(i)}
                                $disabled={
                                    Boolean(cell) ||
                                    Boolean(winner) ||
                                    (mode === "ai" && nextPlayer !== youPlayAs) ||
                                    aiThinking
                                }
                                onClick={() => playAt(i)}
                            >
                                <Styled.Mark $m={cell}>{cell}</Styled.Mark>
                            </Styled.Cell>
                        ))}
                    </Styled.BoardWrap>
                </Styled.BoardCard>

                <Styled.FooterNote>
                    Data stays in your browser (LocalStorage). Works offline.
                </Styled.FooterNote>

                {/* Confirm Modal */}
                {confirm && (
                    <Styled.ModalOverlay onClick={() => setConfirm(null)}>
                        <Styled.ModalCard
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="confirm-title"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Styled.ModalTitle id="confirm-title">{confirm.title}</Styled.ModalTitle>
                            {confirm.message ? <Styled.ModalMessage>{confirm.message}</Styled.ModalMessage> : null}
                            <Styled.ModalActions>
                                <Styled.Button type="button" onClick={() => setConfirm(null)}>
                                    Cancel
                                </Styled.Button>
                                {confirm.tone === "danger" ? (
                                    <Styled.DangerButton type="button" onClick={confirm.onConfirm} autoFocus>
                                        {confirm.confirmText || "Confirm"}
                                    </Styled.DangerButton>
                                ) : (
                                    <Styled.PrimaryButton type="button" onClick={confirm.onConfirm} autoFocus>
                                        {confirm.confirmText || "Confirm"}
                                    </Styled.PrimaryButton>
                                )}
                            </Styled.ModalActions>
                        </Styled.ModalCard>
                    </Styled.ModalOverlay>
                )}
            </Styled.Container>
        </Styled.Page>
    );
}

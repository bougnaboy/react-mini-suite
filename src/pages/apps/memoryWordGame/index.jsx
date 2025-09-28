import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

const BEST_KEY = "memoryWordGame_best";

const BASE_PAIRS = [
    { word: "abate", def: "to reduce; lessen" },
    { word: "candid", def: "truthful and straightforward" },
    { word: "diligent", def: "hard-working and careful" },
    { word: "emulate", def: "to imitate to equal or surpass" },
    { word: "frugal", def: "economical; avoiding waste" },
    { word: "lucid", def: "clear; easy to understand" },
    { word: "novice", def: "a beginner" },
    { word: "pragmatic", def: "practical; focused on results" },
    { word: "resilient", def: "able to recover quickly" },
    { word: "vivid", def: "bright; producing strong images" },
    { word: "succinct", def: "brief and to the point" },
    { word: "arduous", def: "involving great effort" },
];

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function buildDeck(pairCount) {
    const chosen = shuffle(BASE_PAIRS).slice(0, pairCount);
    let id = 0;
    const cards = [];
    chosen.forEach((p, idx) => {
        // keep a pairId to match word <-> def
        cards.push({ id: id++, pairId: idx, type: "word", face: p.word });
        cards.push({ id: id++, pairId: idx, type: "def", face: p.def });
    });
    return shuffle(cards);
}

export default function MemoryWordGame() {
    const [pairCount, setPairCount] = useState(8);           // 6 / 8 / 10 work well
    const [deck, setDeck] = useState(() => buildDeck(8));
    const [revealed, setRevealed] = useState([]);            // ids currently face-up (max 2 that aren’t matched)
    const [matched, setMatched] = useState(new Set());       // ids that are done
    const [busy, setBusy] = useState(false);
    const [moves, setMoves] = useState(0);
    const [best, setBest] = useState(() => {
        const v = localStorage.getItem(BEST_KEY);
        return v ? Number(v) : null;
    });
    const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);

    const totalMatches = useMemo(() => deck.length / 2, [deck]);

    useEffect(() => {
        // reset when pairCount changes
        newGame(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pairCount]);

    function newGame(confirm = true) {
        if (confirm) {
            setShowNewGameConfirm(true);
            return;
        }
        const next = buildDeck(pairCount);
        setDeck(next);
        setRevealed([]);
        setMatched(new Set());
        setBusy(false);
        setMoves(0);
    }

    function handleConfirmNewGame() {
        setShowNewGameConfirm(false);
        newGame(false);
    }
    function handleCancelNewGame() {
        setShowNewGameConfirm(false);
    }

    function onCardClick(card) {
        if (busy) return;
        if (matched.has(card.id)) return;
        if (revealed.includes(card.id)) return;

        if (revealed.length === 0) {
            setRevealed([card.id]);
            return;
        }

        if (revealed.length === 1) {
            const firstId = revealed[0];
            const first = deck.find(c => c.id === firstId);
            const second = card;

            const nextRevealed = [firstId, second.id];
            setRevealed(nextRevealed);
            setMoves(m => m + 1);

            // check match by pairId and type difference
            if (first.pairId === second.pairId && first.type !== second.type) {
                // lock both
                const next = new Set(matched);
                next.add(firstId);
                next.add(second.id);
                setMatched(next);
                // clear revealed soon to allow next move
                setTimeout(() => setRevealed([]), 250);
            } else {
                // flip back after a short delay
                setBusy(true);
                setTimeout(() => {
                    setRevealed([]);
                    setBusy(false);
                }, 700);
            }
        }
    }

    useEffect(() => {
        // win condition
        if (matched.size === deck.length && deck.length > 0) {
            if (best === null || moves < best) {
                setBest(moves);
                localStorage.setItem(BEST_KEY, String(moves));
            }
        }
    }, [matched, deck.length, moves, best]);

    const solved = matched.size === deck.length && deck.length > 0;

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div className="title">Memory Word Game</div>
                <div className="controls">
                    <label className="sel">
                        <span>Pairs</span>
                        <select
                            value={pairCount}
                            onChange={(e) => setPairCount(Number(e.target.value))}
                            aria-label="Select number of pairs"
                        >
                            <option value={6}>6</option>
                            <option value={8}>8</option>
                            <option value={10}>10</option>
                        </select>
                    </label>
                    <button onClick={() => newGame(true)}>New Game</button>
                </div>
            </Styled.Header>

            <Styled.StatsBar>
                <div>Moves: <b>{moves}</b></div>
                <div>Matched: <b>{matched.size / 2}</b> / {totalMatches}</div>
                <div>Best (fewest moves): <b>{best ?? "—"}</b></div>
            </Styled.StatsBar>

            {solved && (
                <Styled.Banner>
                    <span>Nice! You matched all pairs in {moves} moves.</span>
                    <button onClick={() => newGame(false)}>Play again</button>
                </Styled.Banner>
            )}

            <Styled.Grid data-busy={busy ? "1" : "0"}>
                {deck.map((card) => {
                    const isMatched = matched.has(card.id);
                    const isRevealed = isMatched || revealed.includes(card.id);
                    return (
                        <Styled.Card
                            key={card.id}
                            type="button"
                            aria-label={isRevealed ? card.face : "Hidden card"}
                            data-revealed={isRevealed ? "1" : "0"}
                            data-matched={isMatched ? "1" : "0"}
                            onClick={() => onCardClick(card)}
                            disabled={busy || isMatched}
                        >
                            <div className="inner">
                                <div className="tag">{card.type === "word" ? "Word" : "Definition"}</div>
                                <div className="face">{isRevealed ? card.face : "?"}</div>
                            </div>
                        </Styled.Card>
                    );
                })}
            </Styled.Grid>

            {showNewGameConfirm && (
                <Styled.ModalBackdrop onClick={handleCancelNewGame}>
                    <Styled.ModalCard onClick={(e) => e.stopPropagation()}>
                        <div className="title">Start a new game?</div>
                        <div className="msg">This will reshuffle and reset your moves.</div>
                        <div className="row">
                            <button className="ghost" onClick={handleCancelNewGame}>Cancel</button>
                            <button className="danger" onClick={handleConfirmNewGame}>Yes, New Game</button>
                        </div>
                    </Styled.ModalCard>
                </Styled.ModalBackdrop>
            )}
        </Styled.Wrapper>
    );
}

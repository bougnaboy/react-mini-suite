import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

// 8 fruit pairs → 16 cards (4x4)
const FRUITS = ["🍎", "🍌", "🍇", "🍉", "🍓", "🍍", "🍑", "🍐"];

function makeShuffledDeck() {
    // duplicate & flatten
    const base = FRUITS.flatMap((f) => [{ f }, { f }]);
    // add ids
    const withIds = base.map((c, i) => ({ id: `${c.f}-${i}-${Math.random().toString(36).slice(2, 7)}`, f: c.f, matched: false, flipped: false }));
    // Fisher-Yates
    for (let i = withIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [withIds[i], withIds[j]] = [withIds[j], withIds[i]];
    }
    return withIds;
}

const LS_KEY = "fruitMatcher_bestMoves";

const FruitMatcherGame = () => {
    const [deck, setDeck] = useState(() => makeShuffledDeck());
    const [firstPick, setFirstPick] = useState(null); // index
    const [lock, setLock] = useState(false);
    const [moves, setMoves] = useState(0);
    const matchedCount = useMemo(() => deck.filter(c => c.matched).length / 2, [deck]);
    const bestMoves = useMemo(() => {
        try { return Number(localStorage.getItem(LS_KEY)) || null; } catch { return null; }
    }, [deck]); // simple re-read on game changes (cheap)

    useEffect(() => {
        if (matchedCount === FRUITS.length && moves > 0) {
            try {
                const prev = Number(localStorage.getItem(LS_KEY)) || Infinity;
                if (moves < prev) localStorage.setItem(LS_KEY, String(moves));
            } catch { }
        }
    }, [matchedCount, moves]);

    const resetGame = () => {
        setDeck(makeShuffledDeck());
        setFirstPick(null);
        setMoves(0);
        setLock(false);
    };

    const handleFlip = (idx) => {
        if (lock) return;
        const card = deck[idx];
        if (card.flipped || card.matched) return;

        const next = deck.slice();
        next[idx] = { ...card, flipped: true };
        setDeck(next);

        if (firstPick === null) {
            setFirstPick(idx);
            return;
        }

        // second pick
        setLock(true);
        setMoves((m) => m + 1);

        const a = next[firstPick];
        const b = next[idx];
        if (a.f === b.f) {
            // match
            setTimeout(() => {
                const upd = next.slice();
                upd[firstPick] = { ...a, matched: true };
                upd[idx] = { ...b, matched: true };
                setDeck(upd);
                setFirstPick(null);
                setLock(false);
            }, 250);
        } else {
            // no match → flip back
            setTimeout(() => {
                const upd = next.slice();
                upd[firstPick] = { ...a, flipped: false };
                upd[idx] = { ...b, flipped: false };
                setDeck(upd);
                setFirstPick(null);
                setLock(false);
            }, 650);
        }
    };

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div className="title">Fruit Matcher</div>
                <div className="meta">
                    <span>Pairs: {matchedCount}/{FRUITS.length}</span>
                    <span>Moves: {moves}</span>
                    {bestMoves !== null && <span>Best: {bestMoves}</span>}
                </div>
                <div className="actions">
                    <button onClick={resetGame} aria-label="Start a new game">New Game</button>
                </div>
            </Styled.Header>

            <Styled.Grid>
                {deck.map((card, idx) => (
                    <Styled.Card
                        key={card.id}
                        onClick={() => handleFlip(idx)}
                        $flipped={card.flipped || card.matched}
                        $matched={card.matched}
                        aria-label={card.matched ? "Matched" : card.flipped ? card.f : "Hidden card"}
                    >
                        <div className="inner">
                            <div className="front">{card.f}</div>
                            <div className="back">🍏</div>
                        </div>
                    </Styled.Card>
                ))}
            </Styled.Grid>
        </Styled.Wrapper>
    );
};

export default FruitMatcherGame;

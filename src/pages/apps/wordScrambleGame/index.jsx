import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/* -------------------------
   Storage & helpers
------------------------- */
const STORAGE_KEY = "wordScrambleGame.v1";

/* Small, clean word bank (A–Z mix, no spaces/punctuation) */
const WORDS = [
    "react", "variable", "function", "object", "array", "promise", "module", "bundle", "router", "context",
    "reducer", "virtual", "component", "hook", "state", "effect", "closure", "syntax", "compile", "render",
    "testing", "jest", "enzyme", "parcel", "webpack", "vite", "babel", "typescript", "javascript", "frontend",
    "backend", "fullstack", "network", "storage", "session", "cookie", "auth", "token", "refresh", "graphql",
    "schema", "resolver", "endpoint", "request", "response", "payload", "debug", "release", "feature", "branch",
    "commit", "merge", "deploy", "version", "optimize", "runtime", "memory", "thread", "promise", "await",
    "lint", "format", "eslint", "prettier", "node", "server", "client", "socket", "stream", "buffer", "binary",
];

/* Random helpers */
const randInt = (n) => Math.floor(Math.random() * n);
const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};
const uniqueId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/* Safe LocalStorage IO */
const safeGet = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}; }
    catch { return {}; }
};
const safeSet = (obj) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch { }
};

/* Build scrambled pool with stable ids; avoid "already correct order" when possible */
const makeScramble = (word) => {
    const chars = word.split("");
    let mixed = shuffle(chars);
    // try a few times to avoid identical to original
    for (let k = 0; k < 8 && mixed.join("") === word; k++) mixed = shuffle(chars);
    return mixed.map((ch) => ({ id: uniqueId(), ch, used: false }));
};

/* -------------------------
   Main
------------------------- */
export default function WordScrambleGame() {
    const persisted = safeGet();

    /* ---- Stats & session ---- */
    const [stats, setStats] = useState(
        persisted.stats ?? { solved: 0, played: 0, streak: 0, best: 0 }
    );
    const [seen, setSeen] = useState(persisted.seen ?? {}); // map of word -> true (to rotate variety)

    /* ---- Current round ---- */
    const [word, setWord] = useState(persisted.round?.word || "");
    const [pool, setPool] = useState(persisted.round?.pool || []);
    const [guessIds, setGuessIds] = useState(persisted.round?.guessIds || []);
    const [isSolved, setIsSolved] = useState(persisted.round?.isSolved || false);
    const [attempts, setAttempts] = useState(persisted.round?.attempts || 0);
    const [hints, setHints] = useState(persisted.round?.hints || 0);

    /* ---- UI ---- */
    const [message, setMessage] = useState("");
    const [confirm, setConfirm] = useState(null);
    const [showHintLetter, setShowHintLetter] = useState(null); // transient highlight
    const msgTimer = useRef(null);
    const inputRef = useRef(null);

    /* Persist all */
    useEffect(() => {
        safeSet({
            stats,
            seen,
            round: { word, pool, guessIds, isSolved, attempts, hints },
        });
    }, [stats, seen, word, pool, guessIds, isSolved, attempts, hints]);

    /* Kick off a round if empty */
    useEffect(() => {
        if (!word) newRound();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* Derived strings */
    const guess = useMemo(() => {
        const m = new Map(pool.map((p) => [p.id, p]));
        return guessIds.map((id) => m.get(id)?.ch || "").join("");
    }, [pool, guessIds]);

    const remaining = pool.filter((p) => !p.used);

    /* ---- Actions ---- */
    function newRound(nextWord) {
        // choose a not-recently-seen word for freshness
        let w = nextWord || "";
        if (!w) {
            const candidates = WORDS.filter((x) => !seen[x]);
            w = (candidates.length ? candidates : WORDS)[randInt(candidates.length ? candidates.length : WORDS.length)];
        }
        const newPool = makeScramble(w);
        setWord(w);
        setPool(newPool);
        setGuessIds([]);
        setIsSolved(false);
        setAttempts(0);
        setHints(0);
        setShowHintLetter(null);
        setMessage("");
        setSeen((s) => ({ ...s, [w]: true }));
        // focus for quick typing
        setTimeout(() => inputRef.current?.focus(), 0);
    }

    function clearGuess() {
        setPool((prev) => prev.map((p) => ({ ...p, used: false })));
        setGuessIds([]);
        setShowHintLetter(null);
        setMessage("");
    }

    function pickLetter(id) {
        if (isSolved) return;
        setPool((prev) =>
            prev.map((p) => (p.id === id && !p.used ? { ...p, used: true } : p))
        );
        setGuessIds((prev) => [...prev, id]);
        setMessage("");
    }

    function popLetter(idx = guessIds.length - 1) {
        if (idx < 0 || isSolved) return;
        const id = guessIds[idx];
        setGuessIds((prev) => prev.filter((_, i) => i !== idx));
        setPool((prev) => prev.map((p) => (p.id === id ? { ...p, used: false } : p)));
        setShowHintLetter(null);
    }

    function shufflePool() {
        if (isSolved) return;
        // keep used flags but reshuffle the visual order of remaining pool only
        const unused = pool.filter((p) => !p.used);
        const used = pool.filter((p) => p.used);
        const reshuffled = shuffle(unused);
        setPool([...reshuffled, ...used]);
    }

    function submitGuess() {
        if (isSolved) return;
        if (guess.length !== word.length) {
            pulseMsg("Use all letters before checking.");
            return;
        }
        setAttempts((n) => n + 1);
        if (guess.toLowerCase() === word.toLowerCase()) {
            setIsSolved(true);
            setStats((s) => {
                const next = {
                    solved: s.solved + 1,
                    played: s.played + 1,
                    streak: s.streak + 1,
                    best: Math.max(s.best, s.streak + 1),
                };
                return next;
            });
            pulseMsg("Correct! 🎉");
        } else {
            // wrong - keep streak but count played; allow retry
            setStats((s) => ({ ...s, played: s.played + 1, streak: 0 }));
            pulseMsg("Not quite - try again.");
        }
    }

    function showHint() {
        if (isSolved) return;
        // reveal the next correct character position in the guess
        const targetChars = word.split("");
        const currentChars = guess.split("");
        let pos = -1;
        for (let i = 0; i < targetChars.length; i++) {
            if (currentChars[i] !== targetChars[i]) { pos = i; break; }
        }
        if (pos === -1) {
            pulseMsg("You're almost there. Check and submit!");
            return;
        }

        // Return any letter currently at 'pos' back to pool
        if (guessIds[pos]) popLetter(pos);

        // Find an available pool letter that matches the needed char
        const need = targetChars[pos];
        const match = pool.find((p) => !p.used && p.ch.toLowerCase() === need.toLowerCase());
        if (!match) {
            pulseMsg("Use existing letters to align the word.");
            return;
        }
        // Place that exact letter into the guess at 'pos'
        setPool((prev) => prev.map((p) => (p.id === match.id ? { ...p, used: true } : p)));
        setGuessIds((prev) => {
            const next = prev.slice();
            next.splice(pos, 0, match.id);
            return next;
        });
        setHints((h) => h + 1);
        setShowHintLetter(pos);
        pulseMsg(`Hint added at position ${pos + 1}.`);
    }

    function revealWord() {
        if (isSolved) return;
        setConfirm({
            title: "Reveal the answer?",
            message: "This shows the full word and ends the round.",
            confirmText: "Reveal",
            tone: "danger",
            onConfirm: () => {
                // Build full guess in correct order, reusing already-correct letters first.
                const chosen = new Set();      // ids already used in the final assembly
                const ids = new Array(word.length);

                // 1) Reuse correct letters already at the right position
                for (let i = 0; i < word.length; i++) {
                    const want = word[i].toLowerCase();
                    const idAtPos = guessIds[i];
                    const letterAtPos = idAtPos
                        ? pool.find((p) => p.id === idAtPos)?.ch?.toLowerCase()
                        : undefined;
                    if (idAtPos && letterAtPos === want && !chosen.has(idAtPos)) {
                        ids[i] = idAtPos;
                        chosen.add(idAtPos);
                    }
                }

                // 2) Fill remaining positions using any matching tile (used or unused)
                for (let i = 0; i < word.length; i++) {
                    if (ids[i]) continue;
                    const want = word[i].toLowerCase();
                    const match = pool.find(
                        (p) => p.ch.toLowerCase() === want && !chosen.has(p.id)
                    );
                    if (match) {
                        ids[i] = match.id;
                        chosen.add(match.id);
                    }
                }

                // Mark exactly the chosen ids as used; others become free
                setPool((prev) => prev.map((p) => ({ ...p, used: chosen.has(p.id) })));
                setGuessIds(ids);
                setIsSolved(true);
                setStats((s) => ({ ...s, played: s.played + 1, streak: 0 }));
                setConfirm(null);
                pulseMsg("Answer revealed.");
            },
        });
    }


    function nextWord() {
        newRound(); // picks fresh word
    }

    function resetStats() {
        setConfirm({
            title: "Reset stats?",
            message: "Solved/played counts and streaks will be cleared.",
            confirmText: "Reset",
            tone: "danger",
            onConfirm: () => {
                setStats({ solved: 0, played: 0, streak: 0, best: 0 });
                setSeen({});
                setConfirm(null);
                pulseMsg("Stats reset.");
            },
        });
    }

    function pulseMsg(text) {
        setMessage(text);
        if (msgTimer.current) clearTimeout(msgTimer.current);
        msgTimer.current = setTimeout(() => setMessage(""), 1400);
    }

    /* ---- Keyboard input (letters/backspace/enter) ---- */
    useEffect(() => {
        const onKey = (e) => {
            if (!word) return;
            const k = e.key;
            if (/^[a-z]$/i.test(k)) {
                // find a non-used matching letter from remaining pool first;
                // else pick any remaining (for convenience)
                const lower = k.toLowerCase();
                const match =
                    remaining.find((p) => p.ch.toLowerCase() === lower) || remaining[0];
                if (match) pickLetter(match.id);
            } else if (k === "Backspace") {
                popLetter();
            } else if (k === "Enter") {
                submitGuess();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [word, pool, guessIds, remaining, isSolved]);

    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        {/* Title */}
                        <Styled.Title>Word Scramble Game</Styled.Title>

                        {/* space below title */}
                        <div style={{ height: 8 }} />

                        {/* Para 1: what this project is */}
                        <Styled.Sub>
                            A fast, offline-first word scramble. Rearrange the jumbled letters to find
                            the correct word. Your streaks and stats are saved locally (LocalStorage),
                            and the game is refresh-safe.
                        </Styled.Sub>

                        {/* space below para 1 */}
                        <div style={{ height: 6 }} />

                        {/* Para 2: how to use (bullet list) */}
                        <Styled.BulletList aria-label="How to use">
                            <Styled.BulletItem>Click letters to build your guess (or type on the keyboard).</Styled.BulletItem>
                            <Styled.BulletItem>Backspace removes the last letter; click any chosen letter to put it back.</Styled.BulletItem>
                            <Styled.BulletItem>Use Shuffle to reorder the pool, Hint to reveal a correct position, and Check to validate.</Styled.BulletItem>
                            <Styled.BulletItem>Reveal shows the answer (ends the round), and Next starts a fresh word.</Styled.BulletItem>
                            <Styled.BulletItem>Stats show solved/played, current streak, and best streak.</Styled.BulletItem>
                        </Styled.BulletList>

                        {/* space below bullet list */}
                        <div style={{ height: 10 }} />
                    </div>

                    {/* Quick stats */}
                    <Styled.BadgeRow>
                        <Styled.Tag>Solved: {stats.solved}</Styled.Tag>
                        <Styled.Tag>Played: {stats.played}</Styled.Tag>
                        <Styled.Tag>Streak: {stats.streak}</Styled.Tag>
                        <Styled.Tag $tone="muted">Best: {stats.best}</Styled.Tag>
                    </Styled.BadgeRow>
                </Styled.Header>

                {/* Game Card */}
                <Styled.Card>
                    {/* Word length + attempts/hints */}
                    <Styled.MetaRow>
                        <Styled.Tag>Letters: {word.length}</Styled.Tag>
                        <Styled.Tag>Attempts: {attempts}</Styled.Tag>
                        <Styled.Tag $tone={hints ? undefined : "muted"}>Hints: {hints}</Styled.Tag>
                        {isSolved ? <Styled.Tag>Result: Correct</Styled.Tag> : null}
                    </Styled.MetaRow>

                    {/* Guess row */}
                    <Styled.SectionTitle>Your guess</Styled.SectionTitle>
                    <div style={{ height: 6 }} />
                    <Styled.GuessRow aria-label="Current guess">
                        {guessIds.length === 0 && (
                            <Styled.EmptySlot tone="muted">Click letters below or type…</Styled.EmptySlot>
                        )}
                        {guessIds.map((id, i) => {
                            const letter = pool.find((p) => p.id === id)?.ch || "";
                            const correct = word[i]?.toLowerCase() === letter.toLowerCase();
                            return (
                                <Styled.GuessTile
                                    key={id}
                                    $correct={isSolved || (showHintLetter === i ? true : undefined)}
                                    $pulse={showHintLetter === i}
                                    onClick={() => popLetter(i)}
                                    title="Remove this letter"
                                >
                                    {letter.toUpperCase()}
                                    {!isSolved && (
                                        <Styled.TileHintTitle aria-hidden>
                                            {correct ? "✓" : ""}
                                        </Styled.TileHintTitle>
                                    )}
                                </Styled.GuessTile>
                            );
                        })}
                    </Styled.GuessRow>

                    {/* Controls */}
                    <Styled.ButtonRow>
                        <Styled.Button type="button" onClick={clearGuess} title="Clear your current guess">Clear</Styled.Button>
                        <Styled.Button type="button" onClick={shufflePool} title="Shuffle remaining letters">Shuffle</Styled.Button>
                        <Styled.Button type="button" onClick={showHint} title="Reveal a correct letter position">Hint</Styled.Button>
                        <Styled.PrimaryButton type="button" onClick={submitGuess} title="Check your guess">Check</Styled.PrimaryButton>
                        <Styled.Button type="button" onClick={revealWord} title="Show the answer">Reveal</Styled.Button>
                        <Styled.Button type="button" onClick={nextWord} title="New word">Next</Styled.Button>
                        <Styled.DangerButton type="button" onClick={resetStats} title="Reset all stats">Reset stats</Styled.DangerButton>
                    </Styled.ButtonRow>

                    {/* Pool letters */}
                    <div style={{ height: 12 }} />
                    <Styled.SectionTitle>Letters</Styled.SectionTitle>
                    <div style={{ height: 6 }} />
                    <Styled.PoolWrap aria-label="Available letters">
                        {pool.map((p) =>
                            p.used ? null : (
                                <Styled.PoolTile
                                    key={p.id}
                                    onClick={() => pickLetter(p.id)}
                                    title="Add this letter"
                                >
                                    {p.ch.toUpperCase()}
                                </Styled.PoolTile>
                            )
                        )}
                        {remaining.length === 0 && (
                            <Styled.Empty tone="muted">No letters left.</Styled.Empty>
                        )}
                    </Styled.PoolWrap>

                    {/* Message */}
                    {message && <Styled.Toast role="status" aria-live="polite">{message}</Styled.Toast>}
                </Styled.Card>

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
                                {!confirm.hideCancel && (
                                    <Styled.Button type="button" onClick={() => setConfirm(null)}>
                                        {confirm.cancelText || "Cancel"}
                                    </Styled.Button>
                                )}
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

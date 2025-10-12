import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

/* ==============================
   Constants & helpers
   ============================== */
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const KEY_SETTINGS = "hangman_settings_v1";
const KEY_STATS = "hangman_stats_v1";
const KEY_CUSTOM = "hangman_custom_words_v1";
const KEY_PROGRESS = "hangman_progress_v1";

const DEFAULT_SETTINGS = { difficulty: "medium", allowHint: true, repeatWords: false };

const DEFAULT_BANK = [
    { w: "JAVASCRIPT", c: "Programming" },
    { w: "REACT", c: "Programming" },
    { w: "DEVELOPER", c: "General" },
    { w: "KEYBOARD", c: "General" },
    { w: "ALGORITHM", c: "Programming" },
    { w: "ASYNC", c: "Programming" },
    { w: "COMPILER", c: "General" },
    { w: "BROWSER", c: "General" },
    { w: "STYLESHEET", c: "Frontend" },
    { w: "VARIABLE", c: "Programming" },
    { w: "FUNCTION", c: "Programming" },
    { w: "COMPONENT", c: "Frontend" },
    { w: "MONGODB", c: "Databases" },
    { w: "EXPRESS", c: "Backend" },
    { w: "VITE", c: "Tooling" },
    { w: "WEBPACK", c: "Tooling" },
    { w: "ZUSTAND", c: "State Mgmt" },
    { w: "TYPESCRIPT", c: "Programming" },
    { w: "ALACRITY", c: "English" },
    { w: "EUPHORIA", c: "English" },
    { w: "ELEPHANT", c: "Animals" },
    { w: "CROCODILE", c: "Animals" },
    { w: "DOLPHIN", c: "Animals" },
    { w: "BENGALURU", c: "India" },
    { w: "PATNA", c: "India" },
    { w: "MUMBAI", c: "India" },
];

const DIFFICULTY = {
    easy: { lives: 8, min: 3, max: 7 },
    medium: { lives: 7, min: 4, max: 10 },
    hard: { lives: 6, min: 6, max: 20 },
};

const cleanAlpha = (s) => (s || "").toUpperCase().replace(/[^A-Z]/g, "");
const uniq = (arr) => Array.from(new Set(arr));

/* ==============================
   ConfirmModal (inline)
   ============================== */
function ConfirmModal({ open, title = "Confirm", body, confirmText = "Confirm", onCancel, onConfirm }) {
    if (!open) return null;
    return (
        <Styled.Overlay role="dialog" aria-modal="true" onClick={onCancel}>
            <Styled.Modal onClick={(e) => e.stopPropagation()} aria-labelledby="cm-title">
                <h3 id="cm-title">{title}</h3>
                {typeof body === "string" ? <p className="muted">{body}</p> : body}
                <Styled.ModalActions>
                    <button type="button" className="ghost" onClick={onCancel}>Cancel</button>
                    <button type="button" onClick={onConfirm}>{confirmText}</button>
                </Styled.ModalActions>
            </Styled.Modal>
        </Styled.Overlay>
    );
}

/* ==============================
   Main Component
   ============================== */
const HangmanGame = () => {
    const [settings, setSettings] = useState(() => {
        try { return { ...DEFAULT_SETTINGS, ...(JSON.parse(localStorage.getItem(KEY_SETTINGS) || "{}")) }; } catch { return DEFAULT_SETTINGS; }
    });
    const [stats, setStats] = useState(() => {
        try { return JSON.parse(localStorage.getItem(KEY_STATS) || '{"games":0,"wins":0,"losses":0}'); } catch { return { games: 0, wins: 0, losses: 0 }; }
    });
    const [customWords, setCustomWords] = useState(() => {
        try { return JSON.parse(localStorage.getItem(KEY_CUSTOM) || "[]"); } catch { return []; }
    });

    // game state
    const [secret, setSecret] = useState({ w: "", c: "" });
    const [guessed, setGuessed] = useState([]);
    const [wrongSet, setWrongSet] = useState([]);
    const [lives, setLives] = useState(DIFFICULTY[settings.difficulty].lives);
    const [status, setStatus] = useState("idle"); // idle | playing | won | lost
    const [hintUsed, setHintUsed] = useState(false);
    const [msg, setMsg] = useState("");

    // modals
    const [confirmClear, setConfirmClear] = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);
    const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);

    // add custom word form
    const [newWord, setNewWord] = useState("");
    const [newCat, setNewCat] = useState("Custom");
    const [formErr, setFormErr] = useState("");

    const allBank = useMemo(() => {
        const bank = [...DEFAULT_BANK, ...customWords.map((w) => ({ w: w.w, c: w.c || "Custom" }))];
        const { min, max } = DIFFICULTY[settings.difficulty];
        return bank.filter((x) => x.w.length >= min && x.w.length <= max);
    }, [customWords, settings.difficulty]);

    /* persist */
    useEffect(() => { try { localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings)); } catch { } }, [settings]);
    useEffect(() => { try { localStorage.setItem(KEY_STATS, JSON.stringify(stats)); } catch { } }, [stats]);
    useEffect(() => { try { localStorage.setItem(KEY_CUSTOM, JSON.stringify(customWords)); } catch { } }, [customWords]);

    /* restore or new */
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(KEY_PROGRESS) || "null");
            if (saved && saved.secret?.w && saved.status === "playing") {
                setSecret(saved.secret);
                setGuessed(saved.guessed || []);
                setWrongSet(saved.wrongSet || []);
                setLives(saved.lives || DIFFICULTY[settings.difficulty].lives);
                setStatus("playing");
                setHintUsed(!!saved.hintUsed);
                setSettings((s) => ({ ...s, ...(saved.settings || {}) }));
                setMsg("Restored in-progress game.");
                return;
            }
        } catch { }
        startNewGame(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* save progress */
    useEffect(() => {
        try {
            if (status === "playing") {
                localStorage.setItem(
                    KEY_PROGRESS,
                    JSON.stringify({ secret, guessed, wrongSet, lives, status, hintUsed, settings })
                );
            } else if (status === "won" || status === "lost") {
                localStorage.removeItem(KEY_PROGRESS);
            }
        } catch { }
    }, [secret, guessed, wrongSet, lives, status, hintUsed, settings]);

    /* keyboard */
    useEffect(() => {
        const onKey = (e) => {
            if (status !== "playing") return;
            const k = e.key.toUpperCase();
            if (ALPHABET.includes(k)) {
                e.preventDefault();
                handleGuess(k);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, guessed, wrongSet, secret, lives]);

    const masked = useMemo(() => {
        const set = new Set(guessed);
        return secret.w.split("").map((ch) => (set.has(ch) ? ch : "_")).join(" ");
    }, [secret, guessed]);

    const isComplete = useMemo(() => secret.w && secret.w.split("").every((ch) => guessed.includes(ch)), [secret, guessed]);

    function pickRandom() {
        const pool = allBank.length ? allBank : DEFAULT_BANK;
        if (!pool.length) return { w: "REACT", c: "Programming" };
        if (settings.repeatWords) {
            return pool[Math.floor(Math.random() * pool.length)];
        }
        let candidate = pool[Math.floor(Math.random() * pool.length)];
        const last = secret?.w;
        if (pool.length > 1 && candidate.w === last) {
            candidate = pool[(pool.indexOf(candidate) + 1) % pool.length];
        }
        return candidate;
    }

    function startNewGame(askConfirm = true) {
        if (askConfirm && status === "playing" && (guessed.length > 0 || wrongSet.length > 0)) {
            setConfirmReset(true);
            return;
        }
        const chosen = pickRandom();
        const L = DIFFICULTY[settings.difficulty].lives;
        setSecret(chosen);
        setGuessed([]);
        setWrongSet([]);
        setLives(L);
        setStatus("playing");
        setHintUsed(false);
        setMsg("");
    }

    function handleGuess(letter) {
        if (status !== "playing") return;
        if (guessed.includes(letter) || wrongSet.includes(letter)) return;

        if (secret.w.includes(letter)) {
            const nextGuessed = uniq([...guessed, letter]);
            setGuessed(nextGuessed);
            if (secret.w.split("").every((ch) => nextGuessed.includes(ch))) {
                setStatus("won");
                setStats((s) => ({ ...s, games: s.games + 1, wins: s.wins + 1 }));
                setMsg("You won! 🎉");
            }
        } else {
            const nextWrong = uniq([...wrongSet, letter]);
            const nextLives = Math.max(0, lives - 1);
            setWrongSet(nextWrong);
            setLives(nextLives);
            if (nextLives === 0) {
                setStatus("lost");
                setStats((s) => ({ ...s, games: s.games + 1, losses: s.losses + 1 }));
                setMsg(`You lost. The word was ${secret.w}.`);
            }
        }
    }

    function useHint() {
        if (!settings.allowHint || hintUsed || status !== "playing") return;
        const unrevealed = secret.w.split("").filter((ch) => !guessed.includes(ch));
        if (!unrevealed.length) return;
        const give = unrevealed[Math.floor(Math.random() * unrevealed.length)];
        setGuessed((g) => uniq([...g, give]));
        setHintUsed(true);
        setMsg(`Hint revealed a letter: ${give}`);
    }

    function shareResult() {
        const board = masked.replace(/ /g, "");
        const body = [
            `Hangman (${settings.difficulty})`,
            status === "won" ? "Result: WIN ✅" : status === "lost" ? "Result: LOSS ❌" : "Result: In progress",
            `Word: ${status === "lost" ? secret.w : board}`,
            `Wrong: ${wrongSet.join(", ") || "-"}`,
        ].join("\n");
        try {
            navigator.clipboard.writeText(body);
            setMsg("Result copied to clipboard.");
        } catch {
            setMsg("Copy failed.");
        }
    }

    // custom words
    function addCustomWord(e) {
        e.preventDefault();
        const word = cleanAlpha(newWord);
        const cat = newCat.trim().slice(0, 24) || "Custom";
        if (!word || word.length < 3) { setFormErr("Word must be at least 3 letters A–Z."); return; }
        if (DEFAULT_BANK.some((x) => x.w === word) || customWords.some((x) => x.w === word)) { setFormErr("Word already exists."); return; }
        if (word.length > 20) { setFormErr("Keep it ≤ 20 letters."); return; }
        setCustomWords((arr) => [{ w: word, c: cat }, ...arr]);
        setNewWord(""); setFormErr("");
    }

    function askDeleteWord(idx) { setDeleteIndex(idx); }
    function confirmDeleteWord() {
        if (deleteIndex == null) return;
        setCustomWords((arr) => arr.filter((_, i) => i !== deleteIndex));
        setDeleteIndex(null);
    }

    function clearStats() { setStats({ games: 0, wins: 0, losses: 0 }); }
    function clearProgress() {
        try { localStorage.removeItem(KEY_PROGRESS); } catch { }
        setConfirmClear(false);
        setMsg("Cleared saved progress.");
    }

    const usedLetters = useMemo(() => new Set([...guessed, ...wrongSet]), [guessed, wrongSet]);
    const wrongCount = wrongSet.length;
    const maxLives = DIFFICULTY[settings.difficulty].lives;

    return (
        <Styled.Wrapper>
            {!!msg && <Styled.Banner role="status">{msg}</Styled.Banner>}

            <Styled.Header>
                <div className="titles">
                    <h1>Hangman Game</h1>
                    <p>Guess the word before the stick figure is fully drawn. Keyboard supported. Local save enabled.</p>
                </div>

                <div className="controls">
                    {/* Difficulty pill — styled explicitly */}
                    <label className="difficulty" title="Select difficulty">
                        <span>Difficulty</span>
                        <select
                            aria-label="Difficulty"
                            value={settings.difficulty}
                            onChange={(e) => setSettings((s) => ({ ...s, difficulty: e.target.value }))}
                        >
                            <option value="easy">Easy (8)</option>
                            <option value="medium">Medium (7)</option>
                            <option value="hard">Hard (6)</option>
                        </select>
                    </label>

                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={settings.allowHint}
                            onChange={(e) => setSettings((s) => ({ ...s, allowHint: e.target.checked }))}
                        />
                        <span>Allow hint</span>
                    </label>

                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={settings.repeatWords}
                            onChange={(e) => setSettings((s) => ({ ...s, repeatWords: e.target.checked }))}
                        />
                        <span>Allow repeats</span>
                    </label>

                    <button type="button" onClick={() => startNewGame(true)}>New Game</button>
                    <button type="button" className="ghost" onClick={() => setConfirmClear(true)}>Clear Progress</button>
                </div>
            </Styled.Header>

            <Styled.Layout>
                {/* LEFT: Game */}
                <Styled.Column>
                    <Styled.Card>
                        <Styled.TopRow>
                            <div className="category">
                                <span className="label">Category</span>
                                <span className="value">{secret.c || "-"}</span>
                            </div>
                            <div className={`status ${status}`}>
                                Status: {status === "playing" ? "Playing" : status === "won" ? "Won" : status === "lost" ? "Lost" : "Idle"}
                            </div>
                            <div className="lives">Lives: <strong>{lives}/{maxLives}</strong></div>
                        </Styled.TopRow>

                        <Styled.Gallows>
                            <div className="post base" />
                            <div className="post pole" />
                            <div className="post beam" />
                            <div className="post rope" style={{ opacity: wrongCount >= 1 ? 1 : 0 }} />
                            <div className="man head" style={{ opacity: wrongCount >= 2 ? 1 : 0 }} />
                            <div className="man body" style={{ opacity: wrongCount >= 3 ? 1 : 0 }} />
                            <div className="man arm left" style={{ opacity: wrongCount >= 4 ? 1 : 0 }} />
                            <div className="man arm right" style={{ opacity: wrongCount >= 5 ? 1 : 0 }} />
                            <div className="man leg left" style={{ opacity: wrongCount >= 6 ? 1 : 0 }} />
                            <div className="man leg right" style={{ opacity: wrongCount >= 7 ? 1 : 0 }} />
                        </Styled.Gallows>

                        <Styled.Word aria-label="Word progress">{masked}</Styled.Word>

                        <Styled.Keyboard role="group" aria-label="Letters">
                            {"QWERTYUIOP-ASDFGHJKL-ZXCVBNM".split("-").map((row, i) => (
                                <div className="row" key={i}>
                                    {row.split("").map((L) => {
                                        const used = usedLetters.has(L);
                                        const wrong = wrongSet.includes(L);
                                        return (
                                            <button
                                                key={L}
                                                className={`key ${used ? (wrong ? "wrong" : "used") : ""}`}
                                                disabled={used || status !== "playing"}
                                                onClick={() => handleGuess(L)}
                                                aria-label={`Letter ${L}`}
                                            >
                                                {L}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </Styled.Keyboard>

                        <Styled.Actions>
                            <button type="button" onClick={useHint} disabled={!settings.allowHint || hintUsed || status !== "playing"}>
                                {hintUsed ? "Hint used" : "Use Hint"}
                            </button>
                            <button type="button" className="ghost" onClick={shareResult}>Copy Result</button>
                            <div className="spacer" />
                            <button type="button" className="ghost" onClick={() => setConfirmReset(true)}>Reset Game</button>
                        </Styled.Actions>
                    </Styled.Card>

                    <Styled.Card>
                        <h3>Wrong Letters</h3>
                        <Styled.BadRow>
                            {wrongSet.length ? wrongSet.map((L) => <span key={L} className="wrong">{L}</span>) : <em className="muted">None yet</em>}
                        </Styled.BadRow>
                    </Styled.Card>
                </Styled.Column>

                {/* RIGHT: Stats / Custom bank */}
                <Styled.Side>
                    <Styled.Card>
                        <h3>Stats</h3>
                        <Styled.Stats>
                            <div><span className="label">Games</span><span className="value">{stats.games}</span></div>
                            <div><span className="label">Wins</span><span className="value">{stats.wins}</span></div>
                            <div><span className="label">Losses</span><span className="value">{stats.losses}</span></div>
                            <div><span className="label">Win Rate</span><span className="value">
                                {stats.games ? Math.round((stats.wins / stats.games) * 100) + "%" : "-"}
                            </span></div>
                        </Styled.Stats>
                        <Styled.Actions>
                            <button type="button" className="danger" onClick={() => setConfirmDeleteAll(true)}>Delete All Custom Words</button>
                            <div className="spacer" />
                            <button type="button" className="ghost" onClick={clearStats}>Clear Stats</button>
                        </Styled.Actions>
                    </Styled.Card>

                    <Styled.Card>
                        <h3>Custom Words</h3>
                        <form onSubmit={addCustomWord} className="add-form">
                            <div className="grid">
                                <div>
                                    <label htmlFor="newWord">Word</label>
                                    <input
                                        id="newWord"
                                        type="text"
                                        value={newWord}
                                        onChange={(e) => { setNewWord(e.target.value); setFormErr(""); }}
                                        placeholder="Letters only (A–Z)"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="newCat">Category</label>
                                    <input
                                        id="newCat"
                                        type="text"
                                        value={newCat}
                                        onChange={(e) => setNewCat(e.target.value)}
                                        placeholder="e.g., Sports"
                                    />
                                </div>
                            </div>
                            {formErr ? <div className="error">{formErr}</div> : <div className="help">Adds to the word bank for future games.</div>}
                            <Styled.Actions>
                                <button type="submit">Add Word</button>
                            </Styled.Actions>
                        </form>

                        <Styled.List>
                            {customWords.length === 0 && <div className="muted">No custom words yet.</div>}
                            {customWords.map((it, idx) => (
                                <div key={it.w + idx} className="row">
                                    <div className="meta">
                                        <div className="word">{it.w}</div>
                                        <div className="cat">{it.c || "Custom"}</div>
                                    </div>
                                    <div className="tools">
                                        <button type="button" className="ghost danger" onClick={() => setDeleteIndex(idx)} title="Delete">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </Styled.List>
                    </Styled.Card>
                </Styled.Side>
            </Styled.Layout>

            {/* Modals */}
            <ConfirmModal
                open={confirmReset}
                title="Reset current game?"
                body="This will pick a new word and reset guesses."
                confirmText="Reset"
                onCancel={() => setConfirmReset(false)}
                onConfirm={() => { setConfirmReset(false); startNewGame(false); }}
            />
            <ConfirmModal
                open={confirmClear}
                title="Clear saved progress?"
                body="This removes the in-progress save only. Your stats/words stay."
                confirmText="Clear"
                onCancel={() => setConfirmClear(false)}
                onConfirm={clearProgress}
            />
            <ConfirmModal
                open={deleteIndex != null}
                title="Delete this word?"
                body={<p>Remove <strong>{deleteIndex != null ? customWords[deleteIndex]?.w : ""}</strong> from your custom bank?</p>}
                confirmText="Delete"
                onCancel={() => setDeleteIndex(null)}
                onConfirm={confirmDeleteWord}
            />
            <ConfirmModal
                open={confirmDeleteAll}
                title="Delete ALL custom words?"
                body="This removes your entire custom list. This cannot be undone."
                confirmText="Delete All"
                onCancel={() => setConfirmDeleteAll(false)}
                onConfirm={() => { setConfirmDeleteAll(false); setCustomWords([]); }}
            />
        </Styled.Wrapper>
    );
};

export default HangmanGame;

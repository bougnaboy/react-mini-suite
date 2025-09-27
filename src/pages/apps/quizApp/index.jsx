import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

/* -------------------------
   Storage & helpers
------------------------- */
const STORAGE_KEY = "quizApp.v1";

/* Date helpers for attempts list */
const fmtDate = (ts) =>
    new Date(ts).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
const fmtTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* Safe LocalStorage IO */
const safeGet = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}; }
    catch { return {}; }
};
const safeSet = (obj) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch { }
};

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
const uid = () =>
(crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`);

/* -----------------------------------
   Small built-in question bank
   topic: JS / React / CSS / HTML / Web
   difficulty: Easy / Medium / Hard
------------------------------------ */
const BANK = [
    // JavaScript
    { id: "js1", topic: "JavaScript", difficulty: "Easy", q: "Which keyword declares a block-scoped variable?", choices: ["var", "let", "function", "with"], a: 1 },
    { id: "js2", topic: "JavaScript", difficulty: "Easy", q: "What does Array.prototype.map return?", choices: ["A mutated array", "The same array", "A new array", "A number"], a: 2 },
    { id: "js3", topic: "JavaScript", difficulty: "Medium", q: "What is the value of typeof null in JS?", choices: ["\"object\"", "\"null\"", "\"undefined\"", "\"number\""], a: 0 },
    { id: "js4", topic: "JavaScript", difficulty: "Medium", q: "Which method removes the last element of an array?", choices: ["shift()", "pop()", "splice(0,1)", "slice(-1)"], a: 1 },
    { id: "js5", topic: "JavaScript", difficulty: "Hard", q: "What does the 'this' value depend on?", choices: ["Where a function is defined", "How a function is called", "File name", "Strict mode cannot affect it"], a: 1 },

    // React
    { id: "r1", topic: "React", difficulty: "Easy", q: "What hook manages component state?", choices: ["useState", "useMemo", "useRef", "useEffect"], a: 0 },
    { id: "r2", topic: "React", difficulty: "Easy", q: "JSX compiles down to calls to…", choices: ["React.memo", "React.createElement", "React.lazy", "React.forwardRef"], a: 1 },
    { id: "r3", topic: "React", difficulty: "Medium", q: "Which hook runs after paint by default?", choices: ["useLayoutEffect", "useImperativeHandle", "useEffect", "useCallback"], a: 2 },
    { id: "r4", topic: "React", difficulty: "Medium", q: "What prop is required when rendering lists?", choices: ["id", "className", "style", "key"], a: 3 },
    { id: "r5", topic: "React", difficulty: "Hard", q: "useMemo caches based on…", choices: ["object identity", "dependency array", "CPU load", "render count"], a: 1 },

    // CSS
    { id: "c1", topic: "CSS", difficulty: "Easy", q: "Which unit is relative to root font size?", choices: ["em", "vh", "rem", "%"], a: 2 },
    { id: "c2", topic: "CSS", difficulty: "Medium", q: "Flexbox main axis is set by…", choices: ["align-items", "justify-content", "flex-direction", "flex-wrap"], a: 2 },
    { id: "c3", topic: "CSS", difficulty: "Hard", q: "What creates a new stacking context?", choices: ["position: static", "z-index: auto", "transform", "display: inline"], a: 2 },

    // HTML
    { id: "h1", topic: "HTML", difficulty: "Easy", q: "Semantic tag for navigation links is…", choices: ["<nav>", "<section>", "<aside>", "<article>"], a: 0 },
    { id: "h2", topic: "HTML", difficulty: "Medium", q: "Which attribute improves accessibility for images?", choices: ["srcset", "loading", "alt", "width"], a: 2 },
    { id: "h3", topic: "HTML", difficulty: "Hard", q: "Which element is not phrasing content?", choices: ["<span>", "<em>", "<strong>", "<div>"], a: 3 },

    // Web
    { id: "w1", topic: "Web", difficulty: "Easy", q: "HTTP 404 indicates…", choices: ["Unauthorized", "Forbidden", "Not Found", "Too Many Requests"], a: 2 },
    { id: "w2", topic: "Web", difficulty: "Medium", q: "Which storage persists across sessions per origin?", choices: ["sessionStorage", "localStorage", "Memory cache", "Cookies (Session)"], a: 1 },
    { id: "w3", topic: "Web", difficulty: "Hard", q: "CORS primarily controls…", choices: ["Script execution order", "Cross-origin resource access", "DNS caching", "TLS versions"], a: 1 },
];

/* Available facets */
const ALL_TOPICS = Array.from(new Set(BANK.map(q => q.topic))).sort();
const ALL_DIFFS = ["Any", "Easy", "Medium", "Hard"];

/* -------------------------
   Main
------------------------- */
export default function QuizApp() {
    const persisted = safeGet();

    /* ---- Config (top) ---- */
    const [topic, setTopic] = useState(persisted.topic ?? ALL_TOPICS[0]);
    const [difficulty, setDifficulty] = useState(persisted.difficulty ?? "Any");
    const [numQuestions, setNumQuestions] = useState(persisted.numQuestions ?? 5);

    /* ---- Runtime quiz state ---- */
    const [quiz, setQuiz] = useState(persisted.quiz ?? []);          // array of {id, topic, difficulty, q, choices, a}
    const [idx, setIdx] = useState(persisted.idx ?? 0);              // current question index
    const [answers, setAnswers] = useState(persisted.answers ?? []); // array of choice indices (or null)
    const [startedAt, setStartedAt] = useState(persisted.startedAt ?? 0);
    const [finishedAt, setFinishedAt] = useState(persisted.finishedAt ?? 0);
    const inProgress = quiz.length > 0 && finishedAt === 0;
    const isFinished = quiz.length > 0 && finishedAt > 0;

    /* ---- Attempts history (bottom Results) ---- */
    const [attempts, setAttempts] = useState(persisted.attempts ?? []); // list of past attempts

    /* ---- Confirm modal ---- */
    const [confirm, setConfirm] = useState(null);

    /* Persist everything important */
    useEffect(() => {
        safeSet({
            topic, difficulty, numQuestions,
            quiz, idx, answers, startedAt, finishedAt,
            attempts
        });
    }, [topic, difficulty, numQuestions, quiz, idx, answers, startedAt, finishedAt, attempts]);

    /* Derived score & progress */
    const score = useMemo(() => {
        if (!quiz.length) return 0;
        let s = 0;
        for (let i = 0; i < quiz.length; i++) {
            if (answers[i] === quiz[i].a) s++;
        }
        return s;
    }, [quiz, answers]);

    const pct = useMemo(() => {
        if (!quiz.length) return 0;
        const answered = answers.filter((x) => x !== null && x !== undefined).length;
        return Math.round((100 * answered) / quiz.length);
    }, [quiz, answers]);

    /* -------------------------
       Top actions
    ------------------------- */

    // Build a quiz from BANK based on current filters.
    const startQuiz = () => {
        const byTopic = BANK.filter(q => q.topic === topic);
        const primary = (difficulty === "Any" ? byTopic : byTopic.filter(q => q.difficulty === difficulty));

        let pool = primary.slice();
        // Fallback: if not enough questions in chosen topic/difficulty, fill from same topic (any difficulty)
        if (pool.length < numQuestions) {
            const sameTopicAny = byTopic.filter(q => !pool.includes(q));
            pool = pool.concat(sameTopicAny);
        }
        // Final fallback: fill from entire bank to reach desired count
        if (pool.length < numQuestions) {
            const global = BANK.filter(q => !pool.includes(q));
            pool = pool.concat(global);
        }

        if (pool.length === 0) return; // (shouldn't happen with this BANK)

        const picked = shuffle(pool).slice(0, numQuestions);
        setQuiz(picked);
        setAnswers(Array(picked.length).fill(null));
        setIdx(0);
        setStartedAt(Date.now());
        setFinishedAt(0);
    };

    const confirmStartOver = () => {
        if (inProgress) {
            setConfirm({
                title: "Start a new quiz?",
                message: "This will discard your current progress.",
                confirmText: "Start new",
                tone: "danger",
                onConfirm: () => { setConfirm(null); startQuiz(); },
            });
        } else {
            startQuiz();
        }
    };

    const quitQuiz = () => {
        if (!inProgress) return;
        setConfirm({
            title: "Quit this quiz?",
            message: "Your answers will be discarded.",
            confirmText: "Quit",
            tone: "danger",
            onConfirm: () => {
                setQuiz([]);
                setAnswers([]);
                setIdx(0);
                setStartedAt(0);
                setFinishedAt(0);
                setConfirm(null);
            },
        });
    };

    const submitQuiz = () => {
        if (!inProgress) return;
        const doneAt = Date.now();
        setFinishedAt(doneAt);

        const attempt = {
            id: uid(),
            at: doneAt,
            topic,
            difficulty,
            total: quiz.length,
            correct: score,
            durationSec: startedAt ? Math.max(0, Math.round((doneAt - startedAt) / 1000)) : 0,
            items: quiz.map((q, i) => ({
                id: q.id,
                q: q.q,
                topic: q.topic,
                difficulty: q.difficulty,
                choices: q.choices,
                answerIndex: q.a,
                selectedIndex: answers[i],
                isCorrect: answers[i] === q.a,
            })),
        };
        setAttempts((prev) => [attempt, ...prev]);
    };

    /* -------------------------
       Question navigation & select
    ------------------------- */
    const selectAnswer = (choiceIndex) => {
        if (!inProgress) return;
        setAnswers((prev) => {
            const next = [...prev];
            next[idx] = choiceIndex;
            return next;
        });
    };
    const goPrev = () => setIdx((i) => Math.max(0, i - 1));
    const goNext = () => setIdx((i) => Math.min(quiz.length - 1, i + 1));

    /* -------------------------
       Results (attempts) filters
    ------------------------- */
    const [q, setQ] = useState("");
    const [filterTopic, setFilterTopic] = useState("All");
    const [filterDiff, setFilterDiff] = useState("All");
    const [minScore, setMinScore] = useState(0);
    const [sortBy, setSortBy] = useState("newest");

    const filteredAttempts = useMemo(() => {
        let list = attempts.slice();
        if (filterTopic !== "All") list = list.filter(a => a.topic === filterTopic);
        if (filterDiff !== "All") list = list.filter(a => a.difficulty === filterDiff);
        if (minScore > 0) list = list.filter(a => Math.round(100 * a.correct / a.total) >= minScore);
        if (q.trim()) {
            const s = q.toLowerCase();
            list = list.filter(a =>
                a.items.some(it =>
                    (it.q || "").toLowerCase().includes(s)
                )
            );
        }
        if (sortBy === "oldest") list.sort((a, b) => a.at - b.at);
        else if (sortBy === "score") list.sort((a, b) => (b.correct / b.total) - (a.correct / a.total) || b.at - a.at);
        else list.sort((a, b) => b.at - a.at);
        return list;
    }, [attempts, q, filterTopic, filterDiff, minScore, sortBy]);

    const resetAttemptFilters = () => {
        setQ("");
        setFilterTopic("All");
        setFilterDiff("All");
        setMinScore(0);
        setSortBy("newest");
    };

    const clearHistory = () => {
        if (!attempts.length) return;
        setConfirm({
            title: "Clear all results?",
            message: "This will delete every past quiz attempt.",
            confirmText: "Clear All",
            tone: "danger",
            onConfirm: () => { setAttempts([]); setConfirm(null); },
        });
    };

    /* -------------------------
       UI derived helpers
    ------------------------- */
    const current = quiz[idx] || null;
    const progressText = inProgress ? `Question ${idx + 1} / ${quiz.length}` : "";
    const pctProgress = useMemo(() => {
        if (!inProgress) return 0;
        return Math.round(100 * (idx + 1) / quiz.length);
    }, [inProgress, idx, quiz.length]);

    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        {/* Title */}
                        <Styled.Title>Quiz App</Styled.Title>

                        {/* space below title */}
                        <div style={{ height: 8 }} />

                        {/* Para 1: what this project is */}
                        <Styled.Sub>
                            A clean, offline-first quiz app. Pick a topic and difficulty, answer multiple-choice
                            questions, and see your score. Attempts are saved locally in your browser (LocalStorage),
                            so it's refresh-safe.
                        </Styled.Sub>

                        {/* space below para 1 */}
                        <div style={{ height: 6 }} />

                        {/* Para 2: how to use (bullet steps) */}
                        <Styled.BulletList aria-label="How to use">
                            <Styled.BulletItem>Select a topic, difficulty, and number of questions.</Styled.BulletItem>
                            <Styled.BulletItem>Start the quiz, pick an answer for each question, and navigate with Next/Prev.</Styled.BulletItem>
                            <Styled.BulletItem>Submit to see your score and review each answer.</Styled.BulletItem>
                            <Styled.BulletItem>Scroll down to the Results section to search/filter past attempts.</Styled.BulletItem>
                        </Styled.BulletList>

                        {/* space below bullet list */}
                        <div style={{ height: 10 }} />
                    </div>

                    {/* Quick badges */}
                    <Styled.BadgeRow>
                        <Styled.Tag>Topic: {topic}</Styled.Tag>
                        <Styled.Tag>Diff: {difficulty}</Styled.Tag>
                        {inProgress ? <Styled.Tag>Progress: {pct}%</Styled.Tag> : null}
                        {isFinished ? <Styled.Tag>Score: {score}/{quiz.length}</Styled.Tag> : null}
                    </Styled.BadgeRow>
                </Styled.Header>

                {/* ------------------------------
            Config Card (top controls)
        -------------------------------- */}
                <Styled.Card>
                    <Styled.FormRow>
                        {/* Topic */}
                        <Styled.Label title="Choose a topic for the quiz">
                            <Styled.LabelText>Topic</Styled.LabelText>
                            <Styled.Select value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Topic">
                                {ALL_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                            </Styled.Select>
                        </Styled.Label>

                        {/* Difficulty */}
                        <Styled.Label title="Pick difficulty">
                            <Styled.LabelText>Difficulty</Styled.LabelText>
                            <Styled.Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} aria-label="Difficulty">
                                {ALL_DIFFS.map(d => <option key={d} value={d}>{d}</option>)}
                            </Styled.Select>
                        </Styled.Label>

                        {/* Number of questions */}
                        <Styled.Label title="How many questions">
                            <Styled.LabelText>Questions</Styled.LabelText>
                            <Styled.Select value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value) || 5)} aria-label="Number of questions">
                                {[5, 10, 15].map(n => <option key={n} value={n}>{n}</option>)}
                            </Styled.Select>
                        </Styled.Label>

                        {/* Buttons */}
                        <Styled.RowWrap>
                            <Styled.PrimaryButton type="button" onClick={confirmStartOver} title="Start a new quiz">
                                Start quiz
                            </Styled.PrimaryButton>
                            {inProgress && (
                                <Styled.Button type="button" onClick={quitQuiz} title="Quit and discard">
                                    Quit
                                </Styled.Button>
                            )}
                        </Styled.RowWrap>
                    </Styled.FormRow>
                </Styled.Card>

                {/* ------------------------------
            Quiz Panel
        -------------------------------- */}
                {inProgress && current && (
                    <Styled.Card style={{ marginTop: 12 }} aria-live="polite">
                        {/* Progress bar */}
                        <Styled.ProgressWrap>
                            <Styled.ProgressTrack aria-hidden="true">
                                <Styled.ProgressFill $pct={pctProgress} />
                            </Styled.ProgressTrack>
                            <Styled.ProgressText>{progressText}</Styled.ProgressText>
                        </Styled.ProgressWrap>

                        {/* Question */}
                        <Styled.SectionTitle style={{ marginTop: 10 }}>
                            {current.q}
                        </Styled.SectionTitle>

                        {/* Options */}
                        <Styled.OptionGrid>
                            {current.choices.map((choice, i) => {
                                const selected = answers[idx] === i;
                                return (
                                    <Styled.Option
                                        key={i}
                                        $selected={selected}
                                        onClick={() => selectAnswer(i)}
                                        title={selected ? "Selected" : "Select this option"}
                                    >
                                        <Styled.OptionIndex>{String.fromCharCode(65 + i)}.</Styled.OptionIndex>
                                        <Styled.OptionText>{choice}</Styled.OptionText>
                                    </Styled.Option>
                                );
                            })}
                        </Styled.OptionGrid>

                        {/* Navigation */}
                        <Styled.ButtonRow>
                            <Styled.Button type="button" onClick={goPrev} disabled={idx === 0}>Prev</Styled.Button>
                            {idx < quiz.length - 1 ? (
                                <Styled.PrimaryButton type="button" onClick={goNext}>
                                    Next
                                </Styled.PrimaryButton>
                            ) : (
                                <Styled.PrimaryButton type="button" onClick={submitQuiz} disabled={answers.some(a => a === null)}>
                                    Submit quiz
                                </Styled.PrimaryButton>
                            )}
                        </Styled.ButtonRow>
                    </Styled.Card>
                )}

                {/* ------------------------------
            Summary (after finish)
        -------------------------------- */}
                {isFinished && (
                    <Styled.Card style={{ marginTop: 12 }}>
                        <Styled.SectionTitle>Summary</Styled.SectionTitle>
                        <div style={{ height: 6 }} />
                        <Styled.MetaRow>
                            <Styled.Tag>Score: {score} / {quiz.length}</Styled.Tag>
                            <Styled.Tag>Percent: {Math.round((100 * score) / quiz.length)}%</Styled.Tag>
                            <Styled.Tag>Duration: {Math.max(0, Math.round((finishedAt - startedAt) / 1000))}s</Styled.Tag>
                        </Styled.MetaRow>

                        {/* Review each question */}
                        <Styled.List>
                            {quiz.map((qz, i) => {
                                const sel = answers[i];
                                const correct = qz.a;
                                const isRight = sel === correct;
                                return (
                                    <Styled.Item key={qz.id} $accent={isRight ? "good" : "bad"}>
                                        <Styled.ItemLeft>
                                            <Styled.ItemTitle>Q{i + 1}. {qz.q}</Styled.ItemTitle>
                                            <Styled.ItemMeta>
                                                <Styled.Tag>#{qz.topic}</Styled.Tag>
                                                <span>•</span>
                                                <Styled.Tag>#{qz.difficulty}</Styled.Tag>
                                            </Styled.ItemMeta>
                                            <Styled.AnswerList>
                                                {qz.choices.map((opt, k) => (
                                                    <Styled.AnswerRow key={k} $state={k === correct ? "correct" : (k === sel ? "chosen" : "plain")}>
                                                        <span>{String.fromCharCode(65 + k)}.</span>
                                                        <span>{opt}</span>
                                                        <span>
                                                            {k === correct ? "Correct" : (k === sel ? "Your choice" : "")}
                                                        </span>
                                                    </Styled.AnswerRow>
                                                ))}
                                            </Styled.AnswerList>
                                        </Styled.ItemLeft>
                                        <Styled.ItemRight />
                                    </Styled.Item>
                                );
                            })}
                        </Styled.List>
                    </Styled.Card>
                )}

                {/* RESULTS */}

                {/* Space ABOVE results block (as requested) */}
                <div style={{ marginTop: 24 }} />

                {/* Results heading */}
                <Styled.SectionTitle>Results</Styled.SectionTitle>

                {/* Space below heading */}
                <div style={{ height: 8 }} />

                {/* Filters block */}
                <Styled.Card>
                    <Styled.FormRow>
                        {/* Search inside questions text */}
                        <Styled.Label title="Search within attempt questions">
                            <Styled.LabelText>Search</Styled.LabelText>
                            <Styled.Input
                                placeholder="Search question text…"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                aria-label="Search attempts"
                            />
                        </Styled.Label>

                        {/* Topic filter */}
                        <Styled.Label title="Filter by topic">
                            <Styled.LabelText>Topic</Styled.LabelText>
                            <Styled.Select value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)} aria-label="Filter by topic">
                                <option value="All">All topics</option>
                                {ALL_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                            </Styled.Select>
                        </Styled.Label>

                        {/* Difficulty filter */}
                        <Styled.Label title="Filter by difficulty">
                            <Styled.LabelText>Difficulty</Styled.LabelText>
                            <Styled.Select value={filterDiff} onChange={(e) => setFilterDiff(e.target.value)} aria-label="Filter by difficulty">
                                <option value="All">All</option>
                                {["Easy", "Medium", "Hard"].map(d => <option key={d} value={d}>{d}</option>)}
                            </Styled.Select>
                        </Styled.Label>

                        {/* Min score */}
                        <Styled.Label title="Show attempts with score ≥ this percentage">
                            <Styled.LabelText>Min %</Styled.LabelText>
                            <Styled.Select value={minScore} onChange={(e) => setMinScore(Number(e.target.value) || 0)} aria-label="Minimum percent">
                                {[0, 50, 60, 70, 80, 90, 100].map(v => <option key={v} value={v}>{v}</option>)}
                            </Styled.Select>
                        </Styled.Label>

                        {/* Sort */}
                        <Styled.Label title="Sort results">
                            <Styled.LabelText>Sort by</Styled.LabelText>
                            <Styled.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort">
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                                <option value="score">Score</option>
                            </Styled.Select>
                        </Styled.Label>

                        <Styled.RowWrap>
                            <Styled.Button type="button" onClick={resetAttemptFilters}>Reset</Styled.Button>
                            <Styled.DangerButton type="button" onClick={clearHistory}>Clear All</Styled.DangerButton>
                        </Styled.RowWrap>
                    </Styled.FormRow>
                </Styled.Card>

                {/* Space below filters */}
                <div style={{ height: 10 }} />

                {/* Results list */}
                <Styled.List>
                    {filteredAttempts.length === 0 && attempts.length === 0 && (
                        <Styled.Empty>No attempts yet. Start a quiz!</Styled.Empty>
                    )}
                    {filteredAttempts.length === 0 && attempts.length > 0 && (
                        <Styled.Empty>No attempts match your filters. Try Reset.</Styled.Empty>
                    )}

                    {filteredAttempts.map((a) => (
                        <Styled.Item key={a.id}>
                            <Styled.ItemLeft>
                                <Styled.ItemTitle>
                                    {a.topic} • {a.difficulty} — {a.correct}/{a.total} ({Math.round(100 * a.correct / a.total)}%)
                                </Styled.ItemTitle>
                                <Styled.ItemMeta>
                                    <Styled.Tag tone="muted">{fmtDate(a.at)} • {fmtTime(a.at)}</Styled.Tag>
                                    <span>•</span>
                                    <Styled.Tag>Duration {a.durationSec}s</Styled.Tag>
                                </Styled.ItemMeta>
                            </Styled.ItemLeft>
                            <Styled.ItemRight />
                        </Styled.Item>
                    ))}
                </Styled.List>

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

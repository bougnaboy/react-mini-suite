import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

// Sample texts
const TEXTS = {
    short: [
        "Practice makes progress, not perfection.",
        "Clean code is simple, direct, and readable.",
        "Typing calm and steady beats rushing.",
        "Focus on accuracy first, speed later.",
        "Small wins repeated daily become skill."
    ],
    medium: [
        "Great interfaces feel quiet. Every action is obvious, every result is expected, and nothing fights for your attention while you work.",
        "Writing code for other people means naming clearly, handling edge cases, and leaving the next developer with fewer surprises.",
        "Consistency beats cleverness. A consistent pattern makes code faster to read, maintain, and extend without fear."
    ],
    long: [
        "A reliable workflow removes friction from creative work. Build small pieces, test them quickly, and keep moving forward. Over time the tiny steps accumulate into something substantial. Speed comes from reducing hesitation and designing for clarity.",
        "Craftsmanship is repetition with attention. You revisit familiar tasks, refine small decisions, and deliberately remove unnecessary complexity. The goal is to make common operations effortless and rare operations understandable."
    ]
};

const DURATIONS = [30, 60, 120]; // seconds
const LS_KEY = "typingTest:results";

export default function TypingTest() {
    const [lengthKey, setLengthKey] = useState("short");
    const [duration, setDuration] = useState(60);
    const [target, setTarget] = useState(TEXTS.short[0]);
    const [typed, setTyped] = useState("");
    const [started, setStarted] = useState(false);
    const [paused, setPaused] = useState(false);
    const [finished, setFinished] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(duration);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const [history, setHistory] = useState([]); // saved results

    const inputRef = useRef(null);
    const resultsRef = useRef(null);
    const historyRef = useRef(null);
    const savedRef = useRef(false); // guard duplicate saves

    // Load history on mount
    useEffect(() => {
        try {
            const arr = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
            if (Array.isArray(arr)) setHistory(arr);
        } catch { }
    }, []);

    // Pick new text when length changes
    useEffect(() => {
        pickNewText(lengthKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lengthKey]);

    // Keep seconds in sync with duration when not started
    useEffect(() => {
        if (!started) setSecondsLeft(duration);
    }, [duration, started]);

    // Timer
    useEffect(() => {
        if (!started || paused || finished) return;
        const id = setInterval(() => {
            setSecondsLeft((s) => {
                if (s <= 1) {
                    clearInterval(id);
                    setFinished(true); // triggers save
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [started, paused, finished]);

    // Focus textarea when active
    useEffect(() => {
        if (!paused && !finished) inputRef.current?.focus();
    }, [paused, finished]);

    // Save when finished (timer hit or closed)
    useEffect(() => {
        if (finished) saveResult();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finished]);

    function pickNewText(key) {
        const list = TEXTS[key];
        const next = list[Math.floor(Math.random() * list.length)];
        setTarget(next);
        setTyped("");
        setStarted(false);
        setPaused(false);
        setFinished(false);
        savedRef.current = false;
        setSecondsLeft(duration);
    }

    function handleTypedChange(e) {
        const val = e.target.value;
        if (!started && val.length > 0) setStarted(true);
        setTyped(val);
    }

    // Stats
    const { correct, errors } = useMemo(() => {
        let c = 0;
        let e = 0;
        for (let i = 0; i < typed.length; i++) {
            if (typed[i] === target[i]) c++;
            else e++;
        }
        return { correct: c, errors: e };
    }, [typed, target]);

    const elapsed = useMemo(() => duration - secondsLeft, [duration, secondsLeft]);
    const elapsedMinutes = elapsed > 0 ? elapsed / 60 : 0;

    const wpm = useMemo(() => {
        if (elapsedMinutes === 0) return 0;
        return Math.max(0, Math.round((correct / 5) / elapsedMinutes));
    }, [correct, elapsedMinutes]);

    const accuracy = useMemo(() => {
        const total = typed.length || 1;
        return Math.round((correct / total) * 100);
    }, [correct, typed.length]);

    // Build + Save
    function buildResult() {
        const ts = new Date().toISOString();
        return {
            timestamp: ts,
            duration,
            elapsed,
            length: lengthKey,
            wpm,
            accuracy,
            correct,
            errors,
            totalTyped: typed.length,
            targetLength: target.length,
            targetText: target
        };
    }

    function saveResult() {
        if (savedRef.current) return;
        const result = buildResult();
        try {
            const prev = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
            prev.unshift(result);
            localStorage.setItem(LS_KEY, JSON.stringify(prev));
            setHistory(prev); // update UI
            savedRef.current = true;
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 1500);
        } catch { }
    }

    // Actions
    function restartConfirm() { setShowResetConfirm(true); }
    function confirmRestart() {
        setTyped("");
        setStarted(false);
        setPaused(false);
        setFinished(false);
        savedRef.current = false;
        setSecondsLeft(duration);
        setShowResetConfirm(false);
        inputRef.current?.focus();
    }
    function cancelRestart() { setShowResetConfirm(false); }

    function handlePauseToggle() {
        if (!started || finished) return;
        setPaused((p) => !p);
    }

    // Close Test → mark finished and save
    function handleCloseTest() {
        if (!finished) setFinished(true);
        saveResult();
    }

    // Print only the current Result card
    function handlePrintResult() {
        if (!resultsRef.current) return;
        const html = resultsRef.current.outerHTML;

        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Typing Test Result</title>
    <style>
      @page { margin: 16px; }
      html, body { margin:0; padding:0; background:#fff; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
      .printWrap { max-width: 640px; margin: 24px auto; }
      .card { border:1px solid #ddd; border-radius:12px; padding:16px; }
      .title { font-weight:700; margin-bottom:8px; font-size:18px; }
      .grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
      .item { padding:8px 10px; border:1px solid #eee; border-radius:10px; }
      .muted { color:#666; font-size:12px; }
    </style>
  </head>
  <body>
    <div class="printWrap">${html}</div>
  </body>
</html>`);
        doc.close();

        const go = () => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setTimeout(() => document.body.removeChild(iframe), 300);
        };
        if (iframe.contentWindow.document.readyState === "complete") go();
        else iframe.onload = go;
    }

    // Print the complete Saved Results block
    function handlePrintHistory() {
        if (!historyRef.current || history.length === 0) return;
        const html = historyRef.current.outerHTML;

        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Typing Test — Saved Results</title>
    <style>
      @page { margin: 16px; }
      html, body { margin:0; padding:0; background:#fff; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
      .printWrap { max-width: 860px; margin: 24px auto; }
      .hTitle { font-weight: 700; margin-bottom: 10px; font-size: 18px; }
      .list { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
      .row { display: grid; grid-template-columns: 96px 110px 1fr; gap: 10px; align-items: start; border: 1px solid #ddd; border-radius: 12px; padding: 10px; background: #fafafa; break-inside: avoid; page-break-inside: avoid; }
      .stat { text-align: center; }
      .wpm { font-weight: 800; font-size: 22px; }
      .acc { font-weight: 700; font-size: 18px; }
      .label { color: #666; font-size: 11px; margin-top: 2px; }
      .meta { color: #666; font-size: 12px; }
      .meta .line { line-height: 1.3; }
      .snip { grid-column: 1 / -1; width: 100%; margin-top: 8px; color: #111; font-size: 13px; line-height: 1.6; white-space: pre-wrap; overflow-wrap: anywhere; }
      @media print { .row { background: #fff; } }
    </style>
  </head>
  <body>
    <div class="printWrap">${html}</div>
  </body>
</html>`);
        doc.close();

        const go = () => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setTimeout(() => document.body.removeChild(iframe), 300);
        };
        if (iframe.contentWindow.document.readyState === "complete") go();
        else iframe.onload = go;
    }

    // Helpers
    function fmt(ts) {
        try { return new Date(ts).toLocaleString(); } catch { return ts; }
    }

    // Highlight characters
    function renderSpans() {
        const spans = [];
        for (let i = 0; i < target.length; i++) {
            let cls = "";
            if (i < typed.length) cls = typed[i] === target[i] ? "ok" : "err";
            else if (i === typed.length && !finished) cls = "active";
            const ch = target[i] ?? "";
            spans.push(<span key={i} className={cls === "" ? undefined : cls}>{ch}</span>);
        }
        return spans;
    }

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div className="title">Typing Test</div>
                <div className="actions">
                    <div className="group">
                        <span className="lbl">Time</span>
                        <div className="segBtns">
                            {DURATIONS.map((d) => (
                                <button
                                    key={d}
                                    className={d === duration ? "active" : ""}
                                    onClick={() => {
                                        setDuration(d);
                                        if (!started) setSecondsLeft(d);
                                    }}
                                >
                                    {d}s
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="group">
                        <span className="lbl">Length</span>
                        <div className="segBtns">
                            {["short", "medium", "long"].map((k) => (
                                <button
                                    key={k}
                                    className={k === lengthKey ? "active" : ""}
                                    onClick={() => setLengthKey(k)}
                                >
                                    {k}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button onClick={() => pickNewText(lengthKey)} title="Pick another text">New Text</button>
                    <button onClick={restartConfirm} title="Restart (clear input)">Restart</button>
                    <button onClick={handlePauseToggle} disabled={!started || finished}>
                        {paused ? "Resume" : "Pause"}
                    </button>
                    <button onClick={handlePrintResult} disabled={!finished}>Print Result</button>
                    <button onClick={handlePrintHistory} disabled={history.length === 0}>Print Saved Results</button>
                    <button onClick={handleCloseTest}>Close Test</button>

                    {justSaved && (
                        <span style={{ fontSize: 12, color: "var(--accent, #22c55e)" }}>Saved ✓</span>
                    )}
                </div>
            </Styled.Header>

            <Styled.Body>
                <Styled.Metrics>
                    <div className="metric">
                        <div className="value">{secondsLeft}s</div>
                        <div className="key">Time Left</div>
                    </div>
                    <div className="metric">
                        <div className="value">{wpm}</div>
                        <div className="key">WPM</div>
                    </div>
                    <div className="metric">
                        <div className="value">{accuracy}%</div>
                        <div className="key">Accuracy</div>
                    </div>
                    <div className="metric">
                        <div className="value">{errors}</div>
                        <div className="key">Errors</div>
                    </div>
                </Styled.Metrics>

                <Styled.PassageCard onClick={() => inputRef.current?.focus()}>
                    <Styled.Passage aria-label="typing passage">
                        {renderSpans()}
                    </Styled.Passage>
                    {paused && !finished && <Styled.Overlay>Paused</Styled.Overlay>}
                </Styled.PassageCard>

                <Styled.InputRow>
                    <textarea
                        ref={inputRef}
                        spellCheck="false"
                        value={typed}
                        onChange={handleTypedChange}
                        disabled={paused || finished}
                        placeholder="Start typing here…"
                    />
                </Styled.InputRow>

                <Styled.ResultsCard ref={resultsRef}>
                    <div className="title">Result</div>
                    <div className="grid">
                        <div className="item">
                            <div className="big">{wpm}</div>
                            <div className="muted">Words Per Minute</div>
                        </div>
                        <div className="item">
                            <div className="big">{accuracy}%</div>
                            <div className="muted">Accuracy</div>
                        </div>
                        <div className="item">
                            <div className="big">{correct}</div>
                            <div className="muted">Correct Characters</div>
                        </div>
                        <div className="item">
                            <div className="big">{errors}</div>
                            <div className="muted">Errors</div>
                        </div>
                    </div>
                    <div className="meta">
                        <span>Duration: {duration}s</span>
                        <span>Elapsed: {elapsed}s</span>
                        <span>Length: {lengthKey}</span>
                    </div>
                </Styled.ResultsCard>

                {/* Saved results (always visible if present) */}
                <Styled.History ref={historyRef}>
                    <div className="hTitle">Saved Results</div>
                    {history.length === 0 ? (
                        <div className="empty">No saved results yet.</div>
                    ) : (
                        <ul className="list">
                            {history.map((r, i) => (
                                <li key={(r.timestamp || "") + i} className="row">
                                    <div className="stat">
                                        <div className="wpm">{r.wpm}</div>
                                        <div className="label">WPM</div>
                                    </div>
                                    <div className="stat">
                                        <div className="acc">{r.accuracy}%</div>
                                        <div className="label">Accuracy</div>
                                    </div>
                                    <div className="meta">
                                        <div className="line">{fmt(r.timestamp)}</div>
                                        <div className="line">{r.duration}s • {r.length}</div>
                                    </div>
                                    <div className="snip">
                                        {r.targetText?.slice(0, 90)}
                                        {r.targetText && r.targetText.length > 90 ? "…" : ""}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Styled.History>
            </Styled.Body>

            {showResetConfirm && (
                <Styled.ModalBackdrop onClick={cancelRestart}>
                    <Styled.ModalCard onClick={(e) => e.stopPropagation()}>
                        <div className="title">Restart test?</div>
                        <div className="msg">This will clear your current input and timer.</div>
                        <div className="row">
                            <button className="ghost" onClick={cancelRestart}>Cancel</button>
                            <button className="danger" onClick={confirmRestart}>Yes, Restart</button>
                        </div>
                    </Styled.ModalCard>
                </Styled.ModalBackdrop>
            )}
        </Styled.Wrapper>
    );
}

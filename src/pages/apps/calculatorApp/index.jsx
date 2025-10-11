import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Styled } from "./styled";

/* =========================================================
   LocalStorage Keys
   ========================================================= */
const LS_HISTORY = "calculatorApp_history_v1";
const LS_MEMORY = "calculatorApp_memory_v1";

/* =========================================================
   Number formatting helpers
   ========================================================= */
function toNumberSafe(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
}

function formatResult(n) {
    if (!Number.isFinite(n)) return "Error";
    // keep precision sensible, strip trailing zeros
    let s = Number(n.toPrecision(12)).toString();
    if (s.includes("e")) {
        // expand scientific to fixed with reasonable digits
        const fixed = n.toFixed(12);
        s = fixed.replace(/\.?0+$/, "");
    }
    return s.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

/* =========================================================
   Expression evaluation (shunting-yard, no eval)
   Supported: + - * / and parentheses. % handled as "divide
   current entry by 100" at input time.
   ========================================================= */
const PRECEDENCE = { "+": 1, "-": 1, "*": 2, "/": 2 };
const isOp = (t) => ["+", "-", "*", "/"].includes(t);

function rpnFromTokens(tokens) {
    const out = [];
    const ops = [];
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (typeof t === "number") {
            out.push(t);
            continue;
        }
        if (t === "(") {
            ops.push(t);
            continue;
        }
        if (t === ")") {
            while (ops.length && ops[ops.length - 1] !== "(") {
                out.push(ops.pop());
            }
            if (ops.length && ops[ops.length - 1] === "(") ops.pop();
            continue;
        }
        if (isOp(t)) {
            while (
                ops.length &&
                isOp(ops[ops.length - 1]) &&
                PRECEDENCE[ops[ops.length - 1]] >= PRECEDENCE[t]
            ) {
                out.push(ops.pop());
            }
            ops.push(t);
            continue;
        }
    }
    while (ops.length) out.push(ops.pop());
    return out;
}

function evalTokens(tokens) {
    try {
        const rpn = rpnFromTokens(tokens);
        const st = [];
        for (const t of rpn) {
            if (typeof t === "number") {
                st.push(t);
            } else if (isOp(t)) {
                const b = st.pop();
                const a = st.pop();
                if (a === undefined || b === undefined) return NaN;
                let r = 0;
                if (t === "+") r = a + b;
                if (t === "-") r = a - b;
                if (t === "*") r = a * b;
                if (t === "/") r = b === 0 ? NaN : a / b;
                st.push(r);
            }
        }
        return st.length === 1 ? st[0] : NaN;
    } catch {
        return NaN;
    }
}

/* =========================================================
   Calculator Component
   ========================================================= */
const CalculatorApp = () => {
    // main expression is a token list: number | "(" | ")" | "+" | "-" | "*" | "/"
    const [tokens, setTokens] = useState([]);       // expression tokens excluding the "current" entry
    const [entry, setEntry] = useState("0");        // current number being typed (string)
    const [justEvaluated, setJustEvaluated] = useState(false);

    const [history, setHistory] = useState(() => {
        try { return JSON.parse(localStorage.getItem(LS_HISTORY) || "[]"); } catch { return []; }
    });
    const [memory, setMemory] = useState(() => {
        try { const v = JSON.parse(localStorage.getItem(LS_MEMORY) || "null"); return typeof v === "number" ? v : 0; }
        catch { return 0; }
    });

    // modal state
    const [modal, setModal] = useState({ open: false, title: "", message: "", onConfirm: null });

    // wrapper ref for scroll context (no portals)
    const wrapRef = useRef(null);

    const exprString = useMemo(() => {
        // build pretty expression string + current entry if last token is operator or "("
        const parts = tokens.map((t) => (typeof t === "number" ? formatResult(t) : t));
        const last = tokens[tokens.length - 1];
        if (!tokens.length) return entry;
        if (last === "(" || isOp(last)) return parts.join(" ") + " " + entry;
        return parts.join(" ");
    }, [tokens, entry]);

    /* =========================================================
       Persistence
       ========================================================= */
    useEffect(() => {
        try { localStorage.setItem(LS_HISTORY, JSON.stringify(history.slice(0, 50))); } catch { }
    }, [history]);

    useEffect(() => {
        try { localStorage.setItem(LS_MEMORY, JSON.stringify(memory)); } catch { }
    }, [memory]);

    /* =========================================================
       Input helpers
       ========================================================= */
    const resetAll = () => {
        setTokens([]);
        setEntry("0");
        setJustEvaluated(false);
    };

    const confirm = (title, message, onConfirm) => {
        setModal({ open: true, title, message, onConfirm });
    };

    const closeModal = () => setModal({ open: false, title: "", message: "", onConfirm: null });

    const pushNumberIfNeeded = useCallback((nextTokens = tokens, nextEntry = entry) => {
        // If last token is number or ")", do nothing here; caller decides.
        // Usually we push the current entry when an operator or ")" arrives.
        const val = toNumberSafe(nextEntry);
        if (!Number.isNaN(val)) {
            return [...nextTokens, val];
        }
        return [...nextTokens];
    }, [tokens, entry]);

    /* digits */
    const onDigit = (d) => {
        setEntry((prev) => {
            if (justEvaluated) {
                setTokens([]);
                setJustEvaluated(false);
                return d === "0" ? "0" : d;
            }
            if (prev === "0") return d;
            if (prev === "-0") return "-" + d;
            return prev + d;
        });
    };

    /* decimal point */
    const onDot = () => {
        setEntry((prev) => {
            if (justEvaluated) {
                setTokens([]);
                setJustEvaluated(false);
                return "0.";
            }
            if (!prev.includes(".")) return prev + ".";
            return prev;
        });
    };

    /* unary sign toggle */
    const onSign = () => {
        setEntry((prev) => {
            if (prev.startsWith("-")) return prev.slice(1) || "0";
            if (prev === "0") return "-0";
            return "-" + prev;
        });
    };

    /* percent: divide current entry by 100 */
    const onPercent = () => {
        const n = toNumberSafe(entry);
        if (Number.isFinite(n)) setEntry(formatResult(n / 100));
    };

    /* clear entry */
    const onClearEntry = () => setEntry("0");

    /* all clear (with confirm) */
    const onAllClear = () => {
        confirm("Reset Calculator", "Clear current expression and entry?", () => {
            resetAll();
            closeModal();
        });
    };

    /* backspace */
    const onBackspace = () => {
        setEntry((prev) => {
            if (justEvaluated) return prev; // ignore right after equals
            if (prev.length <= 1 || (prev.startsWith("-") && prev.length <= 2)) return "0";
            return prev.slice(0, -1);
        });
    };

    /* parentheses */
    const onParen = (ch) => {
        setJustEvaluated(false);
        if (ch === "(") {
            const last = tokens[tokens.length - 1];
            // If last token is a number or ')', implicitly insert '*'
            if (typeof last === "number" || last === ")") {
                setTokens((t) => [...t, "*", "("]);
            } else {
                setTokens((t) => [...t, "("]);
            }
            return;
        }
        // ")"
        // push current entry first if previous is operator or "("
        const last = tokens[tokens.length - 1];
        if (isOp(last) || last === "(") {
            const withNum = pushNumberIfNeeded(tokens, entry);
            setTokens((t) => [...withNum, ")"]);
            setEntry("0");
            return;
        }
        setTokens((t) => [...t, ")"]);
    };

    /* operator */
    const onOp = (op) => {
        setJustEvaluated(false);
        const last = tokens[tokens.length - 1];
        // replace operator if last token was operator
        if (isOp(last)) {
            setTokens((t) => [...t.slice(0, -1), op]);
            return;
        }
        // if last was "(" we need current entry before operator
        if (last === "(") {
            const withNum = pushNumberIfNeeded(tokens, entry);
            setTokens([...withNum, op]);
            setEntry("0");
            return;
        }
        // typical case: push current number then operator
        const withNum = pushNumberIfNeeded(tokens, entry);
        setTokens([...withNum, op]);
        setEntry("0");
    };

    /* equals */
    const onEquals = () => {
        // form full expression: if last is op or "(", add current entry
        let seq = [...tokens];
        const last = seq[seq.length - 1];
        if (!seq.length) {
            // just the entry
            const n = toNumberSafe(entry);
            if (!Number.isFinite(n)) return;
            const res = n;
            setHistory((h) => [{ expr: entry, result: formatResult(res), ts: Date.now(), id: cryptoRandom() }, ...h]);
            setEntry(formatResult(res));
            setTokens([]);
            setJustEvaluated(true);
            return;
        }
        if (isOp(last) || last === "(") {
            const n = toNumberSafe(entry);
            if (Number.isFinite(n)) seq = [...seq, n];
        }
        // naive balance: close any unclosed "(" by ignoring (don't auto insert ")")
        // evaluate
        const res = evalTokens(seq);
        const resStr = formatResult(res);
        const exprHuman = seq.map((t) => (typeof t === "number" ? formatResult(t) : t)).join(" ");
        setHistory((h) => [{ expr: exprHuman, result: resStr, ts: Date.now(), id: cryptoRandom() }, ...h]);

        setEntry(resStr);
        setTokens([]);
        setJustEvaluated(true);
    };

    /* memory */
    const onMS = () => {
        const n = toNumberSafe(entry);
        if (Number.isFinite(n)) setMemory(n);
    };
    const onMR = () => setEntry(formatResult(memory || 0));
    const onMPlus = () => {
        const n = toNumberSafe(entry);
        if (Number.isFinite(n)) setMemory((m) => (m || 0) + n);
    };
    const onMMinus = () => {
        const n = toNumberSafe(entry);
        if (Number.isFinite(n)) setMemory((m) => (m || 0) - n);
    };
    const onMC = () => {
        confirm("Clear Memory", "Remove stored memory value?", () => {
            setMemory(0);
            closeModal();
        });
    };

    /* history actions */
    const onClearHistory = () => {
        if (!history.length) return;
        confirm("Clear History", "Delete all saved calculations?", () => {
            setHistory([]);
            closeModal();
        });
    };

    const onRemoveHistoryItem = (id) => {
        confirm("Remove Entry", "Delete this calculation from history?", () => {
            setHistory((h) => h.filter((x) => x.id !== id));
            closeModal();
        });
    };

    const cryptoRandom = () =>
        (typeof crypto !== "undefined" && crypto.randomUUID)
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2);

    /* =========================================================
       Keyboard support
       ========================================================= */
    useEffect(() => {
        const onKey = (e) => {
            const k = e.key;
            if (/^\d$/.test(k)) { onDigit(k); return; }
            if (k === ".") { onDot(); return; }
            if (k === "+" || k === "-" || k === "*" || k === "/") { onOp(k); return; }
            if (k === "Enter" || k === "=") { e.preventDefault(); onEquals(); return; }
            if (k === "Backspace") { onBackspace(); return; }
            if (k === "Escape") { onAllClear(); return; }
            if (k === "%") { onPercent(); return; }
            if (k === "(" || k === ")") { onParen(k); return; }
            // small shortcuts
            if (k.toLowerCase() === "c") { onClearEntry(); return; }
            if (k.toLowerCase() === "m") { onMS(); return; }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onDigit, onDot, onOp, onEquals]); // eslint-disable-line react-hooks/exhaustive-deps

    /* =========================================================
       Render
       ========================================================= */
    return (
        <Styled.Page ref={wrapRef}>
            <Styled.AppWrapper>
                <Styled.HeaderRow>
                    <div>
                        <h1>Calculator App</h1>
                        <p>Fully functional calculator with history, memory, and keyboard. Expression-safe (no eval).</p>
                    </div>
                    <Styled.TopActions>
                        <button className="ghost" onClick={onClearHistory} title="Clear all history">Clear History</button>
                    </Styled.TopActions>
                </Styled.HeaderRow>

                <Styled.Layout>
                    {/* LEFT: Calculator */}
                    <Styled.Card>
                        {/* Memory bar */}
                        <Styled.MemoryBar>
                            <button onClick={onMC} title="Memory Clear">MC</button>
                            <button onClick={onMR} title="Memory Recall">MR</button>
                            <button onClick={onMMinus} title="Memory Minus">M-</button>
                            <button onClick={onMPlus} title="Memory Plus">M+</button>
                            <button onClick={onMS} title="Memory Store">MS</button>
                            <div className="memval">M: {formatResult(memory || 0)}</div>
                        </Styled.MemoryBar>

                        {/* Display */}
                        <Styled.Display>
                            <div className="expr" aria-label="expression">{exprString}</div>
                            <div className="value" aria-live="polite">{entry}</div>
                        </Styled.Display>

                        {/* Action strip */}
                        <Styled.ActionStrip>
                            <button onClick={onAllClear} className="danger" title="All Clear">AC</button>
                            <button onClick={onClearEntry} title="Clear Entry">C</button>
                            <button onClick={onBackspace} title="Backspace">DEL</button>
                            <button onClick={() => onOp("/")} className="op">÷</button>
                        </Styled.ActionStrip>

                        {/* Optional small functions */}
                        <Styled.FunctionRow>
                            <button onClick={() => onParen("(")} title="Open parenthesis">(</button>
                            <button onClick={() => onParen(")")} title="Close parenthesis">)</button>
                            <button onClick={onPercent} title="Percent">%</button>
                            <div />
                        </Styled.FunctionRow>

                        {/* Keypad */}
                        <Styled.Keypad>
                            <button onClick={() => onDigit("7")}>7</button>
                            <button onClick={() => onDigit("8")}>8</button>
                            <button onClick={() => onDigit("9")}>9</button>
                            <button onClick={() => onOp("*")} className="op">×</button>

                            <button onClick={() => onDigit("4")}>4</button>
                            <button onClick={() => onDigit("5")}>5</button>
                            <button onClick={() => onDigit("6")}>6</button>
                            <button onClick={() => onOp("-")} className="op">−</button>

                            <button onClick={() => onDigit("1")}>1</button>
                            <button onClick={() => onDigit("2")}>2</button>
                            <button onClick={() => onDigit("3")}>3</button>
                            <button onClick={() => onOp("+")} className="op">+</button>

                            <button onClick={onSign} title="Toggle Sign">±</button>
                            <button onClick={() => onDigit("0")}>0</button>
                            <button onClick={onDot}>.</button>
                            <button onClick={onEquals} className="eq">=</button>
                        </Styled.Keypad>
                    </Styled.Card>

                    {/* RIGHT: History */}
                    <Styled.Card>
                        <h3>History</h3>
                        {!history.length && <Styled.Empty>Nothing yet. Start calculating.</Styled.Empty>}
                        <Styled.HistoryList>
                            {history.map((h) => (
                                <Styled.HistoryItem key={h.id}>
                                    <div className="lines" onClick={() => { setEntry(h.result); setTokens([]); setJustEvaluated(true); }} title="Use result">
                                        <div className="expr">{h.expr}</div>
                                        <div className="res">= {h.result}</div>
                                    </div>
                                    <button className="remove" onClick={() => onRemoveHistoryItem(h.id)} title="Remove">×</button>
                                </Styled.HistoryItem>
                            ))}
                        </Styled.HistoryList>
                    </Styled.Card>
                </Styled.Layout>
            </Styled.AppWrapper>

            {/* Confirm Modal (no portals) */}
            {modal.open && (
                <Styled.ModalWrap>
                    <Styled.Modal>
                        <h4>{modal.title}</h4>
                        <p>{modal.message}</p>
                        <div className="actions">
                            <button className="ghost" onClick={closeModal}>Cancel</button>
                            <button className="danger" onClick={() => { modal.onConfirm?.(); }}>Confirm</button>
                        </div>
                    </Styled.Modal>
                </Styled.ModalWrap>
            )}
        </Styled.Page>
    );
};

export default CalculatorApp;

import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

/**
 * Dice App — simple, focused utility
 * - Pick how many dice (1–6)
 * - Roll to get values + total
 * - Keeps a short history (localStorage)
 * - Clear History now asks for confirmation
 */

const STORAGE_KEY = "dice-app:history";
const DICE_UNICODE = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"]; // 1..6 used

const formatPrettyDate = (ts) => {
    const d = new Date(ts);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dd = d.getDate();
    const mm = months[d.getMonth()];
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${mm} ${dd}, ${yyyy} ${hh}:${min}:${ss} hrs`;
};

const getRandom1to6 = () => Math.floor(Math.random() * 6) + 1;

/**
 * Ask for confirmation:
 * - If a global confirm modal is available (Promise<boolean>) at window.appConfirm,
 *   use it. Example expected API:
 *   window.appConfirm({ title, message, confirmText, cancelText }) -> Promise<boolean>
 * - Else fall back to native confirm.
 */
const askConfirm = async ({ title, message, confirmText = "Yes", cancelText = "Cancel" }) => {
    try {
        const { appConfirm } = window;
        if (typeof appConfirm === "function") {
            return await appConfirm({ title, message, confirmText, cancelText });
        }
    } catch {
        // ignore and fall back
    }
    // Native confirm fallback
    return window.confirm(message || title || "Are you sure?");
};

const DiceApp = () => {
    const [diceCount, setDiceCount] = useState(2);
    const [current, setCurrent] = useState([]);               // number[]
    const [history, setHistory] = useState([]);               // {values:number[], total:number, ts:number}[]

    // load history on first mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setHistory(JSON.parse(raw));
        } catch {
            // ignore parse errors
        }
    }, []);

    const total = useMemo(
        () => current.reduce((sum, n) => sum + n, 0),
        [current]
    );

    const handleRoll = () => {
        const values = Array.from({ length: diceCount }, () => getRandom1to6());
        const entry = { values, total: values.reduce((a, b) => a + b, 0), ts: Date.now() };
        setCurrent(values);
        setHistory((prev) => {
            const next = [entry, ...prev].slice(0, 20); // keep last 20
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { }
            return next;
        });
    };

    const handleClearHistory = async () => {
        const ok = await askConfirm({
            title: "Clear history?",
            message: "This will remove all saved rolls. This action cannot be undone.",
            confirmText: "Clear",
            cancelText: "Keep",
        });
        if (!ok) return;

        setHistory([]);
        try { localStorage.removeItem(STORAGE_KEY); } catch { }
    };

    const handleCountChange = (e) => {
        const nextCount = Number(e.target.value);
        setDiceCount(nextCount);
        setCurrent([]); // reset view on count change
    };

    return (
        <Styled.Wrapper>
            <header className="header">
                <h3>Dice App</h3>
                <p className="sub">Quick rolls with a tidy history. That's it.</p>
            </header>

            <Styled.Controls>
                <label htmlFor="diceCount">Dice</label>
                <Styled.Select
                    id="diceCount"
                    value={diceCount}
                    onChange={handleCountChange}
                    aria-label="Select number of dice"
                >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </Styled.Select>

                <Styled.Button type="button" onClick={handleRoll}>
                    Roll
                </Styled.Button>

                <Styled.Button type="button" $variant="ghost" onClick={handleClearHistory}>
                    Clear History
                </Styled.Button>
            </Styled.Controls>

            <Styled.DiceRow>
                {current.length === 0 ? (
                    <div className="placeholder">Pick a count and press Roll</div>
                ) : (
                    current.map((n, idx) => (
                        <Styled.Die key={idx} title={`Die ${idx + 1}: ${n}`}>
                            <span className="glyph">{DICE_UNICODE[n]}</span>
                            <span className="value">{n}</span>
                        </Styled.Die>
                    ))
                )}
            </Styled.DiceRow>

            <Styled.StatsRow>
                <div className="stat">
                    <span className="label">Dice</span>
                    <span className="value">{diceCount}</span>
                </div>
                <div className="stat">
                    <span className="label">Total</span>
                    <span className="value">{total || "-"}</span>
                </div>
                <div className="stat">
                    <span className="label">Last Roll</span>
                    <span className="value">
                        {current.length ? current.join(" + ") : "-"}
                    </span>
                </div>
            </Styled.StatsRow>

            <Styled.History>
                <h4>History</h4>
                {history.length === 0 ? (
                    <p className="muted">No rolls yet.</p>
                ) : (
                    <Styled.HistoryList>
                        {history.map((h, i) => (
                            <li key={h.ts + "-" + i}>
                                <div className="line">
                                    <span className="values">{h.values.join(" + ")}</span>
                                    <span className="total">= {h.total}</span>
                                </div>
                                <span className="time">{formatPrettyDate(h.ts)}</span>
                            </li>
                        ))}
                    </Styled.HistoryList>
                )}
            </Styled.History>
        </Styled.Wrapper>
    );
};

export default DiceApp;

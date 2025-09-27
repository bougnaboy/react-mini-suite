import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

const LS_KEY = "interestRateCalculator.form.v1";

const compoundingMap = {
    annual: 1,
    semiannual: 2,
    quarterly: 4,
    monthly: 12,
    daily: 365,
};

const formatINR = (n) =>
    isFinite(n)
        ? n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })
        : "—";

export default function InterestRateCalculator() {
    // form
    const [mode, setMode] = useState("compound");
    const [principal, setPrincipal] = useState(100000);
    const [rate, setRate] = useState(10);
    const [time, setTime] = useState(1);
    const [timeUnit, setTimeUnit] = useState("years");
    const [freq, setFreq] = useState("monthly");

    // modal
    const [showConfirm, setShowConfirm] = useState(false);

    // load once
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
            if (saved && typeof saved === "object") {
                setMode(saved.mode ?? "compound");
                setPrincipal(saved.principal ?? 100000);
                setRate(saved.rate ?? 10);
                setTime(saved.time ?? 1);
                setTimeUnit(saved.timeUnit ?? "years");
                setFreq(saved.freq ?? "monthly");
            }
        } catch { }
    }, []);

    // persist
    useEffect(() => {
        localStorage.setItem(
            LS_KEY,
            JSON.stringify({ mode, principal, rate, time, timeUnit, freq })
        );
    }, [mode, principal, rate, time, timeUnit, freq]);

    const years = useMemo(
        () => (timeUnit === "months" ? Number(time || 0) / 12 : Number(time || 0)),
        [time, timeUnit]
    );

    const result = useMemo(() => {
        const P = Number(principal || 0);
        const r = Number(rate || 0) / 100;

        if (!isFinite(P) || !isFinite(r) || !isFinite(years) || P <= 0 || r < 0 || years < 0) {
            return { interest: NaN, amount: NaN, effAPR: NaN };
        }

        if (mode === "simple") {
            const interest = P * r * years;
            const amount = P + interest;
            const effAPR = r;
            return { interest, amount, effAPR };
        }

        const n = compoundingMap[freq] ?? 1;
        const amount = P * Math.pow(1 + r / n, n * years);
        const interest = amount - P;
        const effAPR = Math.pow(1 + r / n, n) - 1;
        return { interest, amount, effAPR };
    }, [principal, rate, years, mode, freq]);

    const chipsP = [10000, 50000, 100000, 500000];
    const chipsR = [6, 7.5, 8.5, 10, 12, 14];
    const chipsT = [
        { label: "6m", val: 6, unit: "months" },
        { label: "1y", val: 1, unit: "years" },
        { label: "2y", val: 2, unit: "years" },
        { label: "3y", val: 3, unit: "years" },
        { label: "5y", val: 5, unit: "years" },
    ];

    const round2 = (n) => (isFinite(n) ? Math.round(n * 100) / 100 : NaN);
    const { interest, amount, effAPR } = result;

    const confirmReset = () => setShowConfirm(true);
    const doReset = () => {
        setMode("compound");
        setPrincipal(100000);
        setRate(10);
        setTime(1);
        setTimeUnit("years");
        setFreq("monthly");
        localStorage.removeItem(LS_KEY);
        setShowConfirm(false);
    };

    return (
        <>
            {/* print-only CSS for .print-area */}
            <Styled.PrintOnly />

            <Styled.Wrapper>
                <Styled.Card className="print-area">
                    <header>
                        <h2>Interest Rate Calculator</h2>
                        <Styled.ModeSwitch>
                            <button
                                type="button"
                                className={mode === "simple" ? "active" : ""}
                                onClick={() => setMode("simple")}
                                aria-pressed={mode === "simple"}
                            >
                                Simple
                            </button>
                            <button
                                type="button"
                                className={mode === "compound" ? "active" : ""}
                                onClick={() => setMode("compound")}
                                aria-pressed={mode === "compound"}
                            >
                                Compound
                            </button>
                        </Styled.ModeSwitch>
                    </header>

                    <Styled.Grid>
                        <Styled.Field>
                            <label>Principal (₹)</label>
                            <input
                                inputMode="decimal"
                                value={principal}
                                onChange={(e) => setPrincipal(e.target.value.replace(/[^\d.]/g, ""))}
                                placeholder="e.g., 100000"
                            />
                            <Styled.Chips>
                                {chipsP.map((v) => (
                                    <button key={v} type="button" onClick={() => setPrincipal(v)}>
                                        {v.toLocaleString("en-IN")}
                                    </button>
                                ))}
                            </Styled.Chips>
                        </Styled.Field>

                        <Styled.Field>
                            <label>Rate (% p.a.)</label>
                            <input
                                inputMode="decimal"
                                value={rate}
                                onChange={(e) => setRate(e.target.value.replace(/[^\d.]/g, ""))}
                                placeholder="e.g., 10"
                            />
                            <Styled.Chips>
                                {chipsR.map((v) => (
                                    <button key={v} type="button" onClick={() => setRate(v)}>
                                        {v}%
                                    </button>
                                ))}
                            </Styled.Chips>
                        </Styled.Field>

                        <Styled.Field>
                            <label>Time</label>
                            <div className="row">
                                <input
                                    inputMode="decimal"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value.replace(/[^\d.]/g, ""))}
                                    placeholder="e.g., 1"
                                />
                                <select value={timeUnit} onChange={(e) => setTimeUnit(e.target.value)}>
                                    <option value="years">years</option>
                                    <option value="months">months</option>
                                </select>
                            </div>
                            <Styled.Chips>
                                {chipsT.map((c) => (
                                    <button
                                        key={c.label}
                                        type="button"
                                        onClick={() => {
                                            setTime(c.val);
                                            setTimeUnit(c.unit);
                                        }}
                                    >
                                        {c.label}
                                    </button>
                                ))}
                            </Styled.Chips>
                        </Styled.Field>

                        {mode === "compound" && (
                            <Styled.Field>
                                <label>Compounding</label>
                                <select value={freq} onChange={(e) => setFreq(e.target.value)}>
                                    <option value="annual">Annual (1×)</option>
                                    <option value="semiannual">Semiannual (2×)</option>
                                    <option value="quarterly">Quarterly (4×)</option>
                                    <option value="monthly">Monthly (12×)</option>
                                    <option value="daily">Daily (365×)</option>
                                </select>
                            </Styled.Field>
                        )}
                    </Styled.Grid>

                    <Styled.Result>
                        <div>
                            <span>Interest</span>
                            <strong>{formatINR(round2(interest))}</strong>
                        </div>
                        <div>
                            <span>Total Amount</span>
                            <strong>{formatINR(round2(amount))}</strong>
                        </div>
                        <div>
                            <span>Effective Annual Rate</span>
                            <strong>{isFinite(effAPR) ? `${(effAPR * 100).toFixed(2)}%` : "—"}</strong>
                        </div>
                    </Styled.Result>

                    <Styled.Actions className="no-print">
                        <button type="button" onClick={confirmReset}>Reset</button>
                        <button type="button" onClick={() => window.print()}>Print</button>
                    </Styled.Actions>

                    <Styled.Note>
                        <pre>
                            {`Notes:
- Simple Interest: I = P × r × t
- Compound: A = P × (1 + r/n)^(n×t); I = A − P
- "Effective Annual Rate" is derived from compounding frequency (n).`}
                        </pre>
                    </Styled.Note>

                    {/* local confirm modal */}
                    {showConfirm && (
                        <Styled.ConfirmOverlay className="no-print" onClick={() => setShowConfirm(false)}>
                            <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                                <h3>Reset calculator?</h3>
                                <p>This will clear all inputs and remove saved values.</p>
                                <div className="actions">
                                    <button type="button" onClick={() => setShowConfirm(false)}>Cancel</button>
                                    <button type="button" className="danger" onClick={doReset}>Reset</button>
                                </div>
                            </div>
                        </Styled.ConfirmOverlay>
                    )}
                </Styled.Card>
            </Styled.Wrapper>
        </>
    );
}

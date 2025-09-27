import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

/**
 * We store rates as: 1 unit of currency → INR
 * Example: { USD: 83.55 } means 1 USD ≈ ₹83.55
 * Live API returns base=INR (1 INR → X currency). We invert: 1/X to get 1 currency → INR.
 */

const DEFAULT_RATES = {
    INR: 1,
    USD: 83.55,
    EUR: 89.25,
    GBP: 104.10,
    AED: 22.75,
    AUD: 54.05,
    CAD: 61.25,
    JPY: 0.56,
    SGD: 61.80,
};

const SUPPORTED_CODES = Object.keys(DEFAULT_RATES);
const LS_RATES_KEY = "cc_rates_v1";
const LS_PREFS_KEY = "cc_prefs_v1";
const LS_UPDATED_KEY = "cc_rates_updated_v1";

// Free, no-key API (ECB derived)
const LIVE_API = "https://open.er-api.com/v6/latest/INR";

const getStored = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};

const clampPositive = (num) => (Number.isFinite(num) && num >= 0 ? num : 0);

const formatNumber = (value) => {
    if (!Number.isFinite(value)) return "0";
    const opts =
        Math.abs(value) >= 1
            ? { maximumFractionDigits: 2 }
            : { maximumFractionDigits: 6 };
    return value.toLocaleString(undefined, opts);
};

const formatWhen = (unixSeconds) => {
    if (!unixSeconds) return "Never";
    try {
        // Show in IST since that’s your base audience
        return new Date(unixSeconds * 1000).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour12: false,
        });
    } catch {
        return "Recently";
    }
};

const CurrencyConverter = () => {
    const [rates, setRates] = useState(() => getStored(LS_RATES_KEY, DEFAULT_RATES));
    const [{ amount, from, to }, setPrefs] = useState(() =>
        getStored(LS_PREFS_KEY, { amount: 1000, from: "INR", to: "USD" })
    );
    const [lastUpdated, setLastUpdated] = useState(() => getStored(LS_UPDATED_KEY, 0));
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [msg, setMsg] = useState(""); // transient status

    // Persist
    useEffect(() => {
        try { localStorage.setItem(LS_RATES_KEY, JSON.stringify(rates)); } catch { }
    }, [rates]);
    useEffect(() => {
        try {
            localStorage.setItem(LS_PREFS_KEY, JSON.stringify({ amount, from, to }));
        } catch { }
    }, [amount, from, to]);
    useEffect(() => {
        try { localStorage.setItem(LS_UPDATED_KEY, JSON.stringify(lastUpdated)); } catch { }
    }, [lastUpdated]);

    const currencies = useMemo(
        () => Object.keys(rates).sort((a, b) => a.localeCompare(b)),
        [rates]
    );

    const result = useMemo(() => {
        const fromRate = rates[from] ?? 1;
        const toRate = rates[to] ?? 1;
        const amountInINR = clampPositive(Number(amount)) * fromRate;
        return amountInINR / toRate;
    }, [amount, from, to, rates]);

    const pairInfo = useMemo(() => {
        const fromRate = rates[from] ?? 1;
        const toRate = rates[to] ?? 1;
        const oneFromInTo = toRate > 0 ? fromRate / toRate : 0; // 1 FROM ≈ ? TO
        return { oneFromInTo };
    }, [from, to, rates]);

    const setAmount = (next) =>
        setPrefs((s) => ({ ...s, amount: next.replace(/[^\d.]/g, "") }));
    const quickSetAmount = (val) =>
        setPrefs((s) => ({ ...s, amount: String(val) }));
    const setFrom = (val) => setPrefs((s) => ({ ...s, from: val }));
    const setTo = (val) => setPrefs((s) => ({ ...s, to: val }));
    const swap = () => setPrefs((s) => ({ ...s, from: s.to, to: s.from }));

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(
                `${formatNumber(clampPositive(Number(amount)))} ${from} = ${formatNumber(result)} ${to}`
            );
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch { }
    };

    const refreshRates = async () => {
        setLoading(true);
        setMsg("");
        try {
            const res = await fetch(LIVE_API, { cache: "no-store" });
            const data = await res.json();
            if (data?.result !== "success" || !data?.rates) throw new Error("Bad data");

            // API is base=INR: rates[CODE] = units of CODE per 1 INR
            // We need 1 CODE → INR, so invert: 1 / rates[CODE]
            const next = { ...rates };
            for (const code of SUPPORTED_CODES) {
                if (code === "INR") { next.INR = 1; continue; }
                const perINR = data.rates[code]; // CODE per 1 INR
                if (Number.isFinite(perINR) && perINR > 0) {
                    next[code] = 1 / perINR; // 1 CODE = ? INR
                }
            }
            setRates(next);
            const ts = data.time_last_update_unix || Math.floor(Date.now() / 1000);
            setLastUpdated(ts);
            setMsg("Rates updated");
        } catch (e) {
            setMsg("Couldn’t fetch live rates. Using saved values.");
        } finally {
            setLoading(false);
            setTimeout(() => setMsg(""), 1500);
        }
    };

    const toggleEditing = () =>
        setEditing((v) => !v);
    const [editing, setEditing] = useState(false);

    const updateRate = (code, value) => {
        const parsed = parseFloat(value);
        if (!Number.isFinite(parsed) || parsed <= 0) return;
        setRates((r) => ({ ...r, [code]: parsed }));
    };

    const resetRates = () => setRates(DEFAULT_RATES);

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div className="title">
                    <h2>Currency Converter</h2>
                    <Styled.Subtle>Live refresh + offline edits</Styled.Subtle>
                </div>

                <Styled.Toolbar>
                    <Styled.Small>Last updated: {formatWhen(lastUpdated)}</Styled.Small>
                    <Styled.Button onClick={refreshRates} disabled={loading}>
                        {loading ? "Refreshing…" : "Refresh live rates"}
                    </Styled.Button>
                </Styled.Toolbar>
            </Styled.Header>

            {msg && <Styled.Flash role="status">{msg}</Styled.Flash>}

            <Styled.Card>
                <Styled.Row>
                    <div className="field">
                        <label>Amount</label>
                        <Styled.Input
                            inputMode="decimal"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label>From</label>
                        <Styled.Select value={from} onChange={(e) => setFrom(e.target.value)}>
                            {currencies.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </Styled.Select>
                    </div>

                    <Styled.Button onClick={swap} aria-label="Swap">↔</Styled.Button>

                    <div className="field">
                        <label>To</label>
                        <Styled.Select value={to} onChange={(e) => setTo(e.target.value)}>
                            {currencies.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </Styled.Select>
                    </div>
                </Styled.Row>

                <Styled.ResultRow>
                    <div className="lhs">
                        <div className="result">
                            {formatNumber(clampPositive(Number(amount)))} {from} ={" "}
                            <b>{formatNumber(result)} {to}</b>
                        </div>
                        <div className="pair">
                            1 {from} ≈ {formatNumber(pairInfo.oneFromInTo)} {to}
                        </div>
                    </div>

                    <div className="rhs">
                        <Styled.Button onClick={onCopy}>Copy</Styled.Button>
                        {copied && <Styled.Copied>Copied</Styled.Copied>}
                    </div>
                </Styled.ResultRow>

                <Styled.Chips>
                    {[100, 500, 1000, 5000, 10000].map((val) => (
                        <button key={val} onClick={() => quickSetAmount(val)}>{val}</button>
                    ))}
                </Styled.Chips>
            </Styled.Card>

            <Styled.Card>
                <Styled.EditHeader>
                    <h3>Edit Rates</h3>
                    <Styled.Button onClick={() => setEditing((v) => !v)}>
                        {editing ? "Close" : "Open"}
                    </Styled.Button>
                </Styled.EditHeader>

                {editing && (
                    <>
                        <Styled.Table>
                            <thead>
                                <tr>
                                    <th>Currency</th>
                                    <th>1 Unit = INR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currencies.map((code) => (
                                    <tr key={code}>
                                        <td>{code}</td>
                                        <td>
                                            <Styled.RateInput
                                                type="number"
                                                step="0.0001"
                                                min="0.000001"
                                                value={rates[code]}
                                                onChange={(e) => updateRate(code, e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Styled.Table>

                        <Styled.FooterRow>
                            <Styled.Button onClick={resetRates} data-variant="ghost">
                                Reset to defaults
                            </Styled.Button>
                            <Styled.Small>
                                Conversion uses:
                                <code> amount × (from→INR) ÷ (to→INR) </code>
                            </Styled.Small>
                        </Styled.FooterRow>
                    </>
                )}
            </Styled.Card>
        </Styled.Wrapper>
    );
};

export default CurrencyConverter;

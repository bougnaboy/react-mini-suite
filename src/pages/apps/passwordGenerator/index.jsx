import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMS = "0123456789";
const SYMS = "!@#$%^&*()-_=+[]{};:,.?/~";
const AMBIG = "0OIl1|`'\".,;:[]{}()<>"; // filtered out if "no ambiguous" is on

const defaultOpts = {
    length: 16,
    useLower: true,
    useUpper: true,
    useNumbers: true,
    useSymbols: false,
    noAmbiguous: true,
};

const HISTORY_KEY = "passwordGenerator.history.v1";
const MAX_HISTORY = 10;

// crypto-safe int [0, max)
function randInt(max) {
    const buf = new Uint32Array(1);
    window.crypto.getRandomValues(buf);
    return buf[0] % max;
}

function buildPool(opts) {
    let pool = "";
    if (opts.useLower) pool += LOWER;
    if (opts.useUpper) pool += UPPER;
    if (opts.useNumbers) pool += NUMS;
    if (opts.useSymbols) pool += SYMS;
    if (opts.noAmbiguous) {
        pool = [...pool].filter(ch => !AMBIG.includes(ch)).join("");
    }
    if (pool.length === 0) pool = LOWER; // fallback
    return pool;
}

function generateOne(opts) {
    const pool = buildPool(opts);

    // Guarantee at least one char from each chosen set
    const required = [];
    if (opts.useLower) required.push(LOWER);
    if (opts.useUpper) required.push(UPPER);
    if (opts.useNumbers) required.push(NUMS);
    if (opts.useSymbols) required.push(SYMS);

    const filteredRequired = required.map(set =>
        opts.noAmbiguous ? [...set].filter(ch => !AMBIG.includes(ch)).join("") : set
    ).filter(s => s.length > 0);

    const out = [];

    // add required picks first
    filteredRequired.forEach(set => {
        out.push(set[randInt(set.length)]);
    });

    // fill the rest
    const need = Math.max(0, opts.length - out.length);
    for (let i = 0; i < need; i++) {
        out.push(pool[randInt(pool.length)]);
    }

    // simple shuffle
    for (let i = out.length - 1; i > 0; i--) {
        const j = randInt(i + 1);
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out.join("");
}

function calcEntropyBits(opts) {
    const poolSize = buildPool(opts).length;
    return Math.round(opts.length * Math.log2(poolSize));
}

function strengthLabel(bits) {
    if (bits < 40) return { label: "Very Weak", score: 15 };
    if (bits < 60) return { label: "Weak", score: 30 };
    if (bits < 80) return { label: "Moderate", score: 55 };
    if (bits < 100) return { label: "Strong", score: 78 };
    return { label: "Very Strong", score: 100 };
}

function formatNow() {
    const d = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const mm = months[d.getMonth()];
    const dd = d.getDate();
    const yyyy = d.getFullYear();
    const pad = (n) => String(n).padStart(2, "0");
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${mm} ${dd}, ${yyyy} ${hh}:${min}:${ss} hrs`;
}

export default function PasswordGenerator() {
    const [opts, setOpts] = useState(defaultOpts);
    const [password, setPassword] = useState("");
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState([]);
    const bits = useMemo(() => calcEntropyBits(opts), [opts]);
    const label = useMemo(() => strengthLabel(bits), [bits]);

    useEffect(() => {
        // hydrate history
        try {
            const raw = localStorage.getItem(HISTORY_KEY);
            if (raw) setHistory(JSON.parse(raw));
        } catch { }
    }, []);

    useEffect(() => {
        // persist history
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
        } catch { }
    }, [history]);

    function update(partial) {
        setOpts(prev => ({ ...prev, ...partial }));
    }

    function generate() {
        const pwd = generateOne(opts);
        setPassword(pwd);
        setCopied(false);
        const meta = {
            at: formatNow(),
            len: opts.length,
            lower: opts.useLower,
            upper: opts.useUpper,
            nums: opts.useNumbers,
            syms: opts.useSymbols,
            na: opts.noAmbiguous,
            pwd,
        };
        setHistory(prev => [meta, ...prev].slice(0, MAX_HISTORY));
    }

    async function copyPwd() {
        try {
            await navigator.clipboard.writeText(password);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {
            // small fallback if clipboard fails
            const ta = document.createElement("textarea");
            ta.value = password;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        }
    }

    function printPwd() {
        if (!password) return;

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
    <title>Password</title>
    <style>
      @page { margin: 20mm; }
      html, body { margin:0; padding:0; background:#fff; }
      .wrap { display:flex; align-items:center; justify-content:center; min-height:100vh; }
      .pwd { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
             font-size: 22pt; letter-spacing: 1px; }
    </style>
  </head>
  <body>
    <div class="wrap"><div class="pwd">${password.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div></div>
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

    function clearHistoryConfirm() {
        if (!window.confirm("Clear saved passwords history?")) return;
        setHistory([]);
    }

    function resetOptionsConfirm() {
        if (!window.confirm("Reset options to defaults?")) return;
        setOpts(defaultOpts);
    }

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div className="title">Password Generator</div>
                <div className="actions">
                    <button onClick={generate}>Generate</button>
                    <button onClick={copyPwd} disabled={!password}>{copied ? "Copied" : "Copy"}</button>
                    <button onClick={printPwd} disabled={!password}>Print</button>
                </div>
            </Styled.Header>

            <Styled.Body>
                <Styled.Sidebar>
                    <Styled.Group>
                        <Styled.Label>Length: <b>{opts.length}</b></Styled.Label>
                        <input
                            type="range"
                            min="4"
                            max="64"
                            value={opts.length}
                            onChange={(e) => update({ length: Number(e.target.value) })}
                        />
                    </Styled.Group>

                    <Styled.Group>
                        <label><input type="checkbox" checked={opts.useLower} onChange={(e) => update({ useLower: e.target.checked })} /> Lowercase</label>
                        <label><input type="checkbox" checked={opts.useUpper} onChange={(e) => update({ useUpper: e.target.checked })} /> Uppercase</label>
                        <label><input type="checkbox" checked={opts.useNumbers} onChange={(e) => update({ useNumbers: e.target.checked })} /> Numbers</label>
                        <label><input type="checkbox" checked={opts.useSymbols} onChange={(e) => update({ useSymbols: e.target.checked })} /> Symbols</label>
                        <label><input type="checkbox" checked={opts.noAmbiguous} onChange={(e) => update({ noAmbiguous: e.target.checked })} /> No ambiguous</label>
                    </Styled.Group>

                    <Styled.Separator />

                    <Styled.Group>
                        <Styled.Label>Strength</Styled.Label>
                        <Styled.Bar aria-label={`Strength ${label.label}`}>
                            <span style={{ width: `${label.score}%` }} />
                        </Styled.Bar>
                        <div className="bits">
                            {label.label} &middot; ~{bits} bits
                        </div>
                    </Styled.Group>

                    <Styled.Row>
                        <button onClick={resetOptionsConfirm}>Reset Options</button>
                        <button className="ghost" onClick={clearHistoryConfirm} disabled={history.length === 0}>
                            Clear History
                        </button>
                    </Styled.Row>
                </Styled.Sidebar>

                <Styled.Main>
                    <Styled.OutputCard>
                        <Styled.PassBox title="Generated password">
                            {password ? password : <span className="muted">Click Generate</span>}
                        </Styled.PassBox>
                        <Styled.Row>
                            <button onClick={generate}>Regenerate</button>
                            <button onClick={copyPwd} disabled={!password}>{copied ? "Copied" : "Copy"}</button>
                            <button onClick={printPwd} disabled={!password}>Print</button>
                        </Styled.Row>
                    </Styled.OutputCard>

                    <Styled.HistoryCard>
                        <div className="h-title">Recent (last {MAX_HISTORY})</div>
                        {history.length === 0 ? (
                            <div className="muted">No history yet.</div>
                        ) : (
                            <Styled.HistoryList>
                                {history.map((h, idx) => (
                                    <li key={idx}>
                                        <code className="pwd">{h.pwd}</code>
                                        <div className="meta">
                                            <span>{h.at}</span>
                                            <span>len {h.len}</span>
                                            <span>{h.lower ? "a" : ""}{h.upper ? "A" : ""}{h.nums ? "0" : ""}{h.syms ? "#" : ""}{h.na ? " · no-amb" : ""}</span>
                                        </div>
                                    </li>
                                ))}
                            </Styled.HistoryList>
                        )}
                    </Styled.HistoryCard>
                </Styled.Main>
            </Styled.Body>
        </Styled.Wrapper>
    );
}

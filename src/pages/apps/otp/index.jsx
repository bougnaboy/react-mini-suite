import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 15; // changed from 60
const LS_KEY = "otp-demo";

const Index = () => {
    const [boxes, setBoxes] = useState(Array(OTP_LENGTH).fill(""));
    const [sentCode, setSentCode] = useState("");
    const [sentAt, setSentAt] = useState(0);
    const [status, setStatus] = useState(""); // "ok" | "error" | ""
    const [message, setMessage] = useState("");
    const [tick, setTick] = useState(0);
    const inputRefs = useRef([...Array(OTP_LENGTH)].map(() => React.createRef()));

    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.code && parsed.sentAt) {
                    setSentCode(parsed.code);
                    setSentAt(parsed.sentAt);
                }
            }
        } catch { }
    }, []);

    useEffect(() => {
        const id = setInterval(() => setTick((t) => t + 1), 1000);
        return () => clearInterval(id);
    }, []);

    const secondsLeft = useMemo(() => {
        if (!sentAt) return 0;
        const passed = Math.floor((Date.now() - sentAt) / 1000);
        const left = RESEND_SECONDS - passed;
        return left > 0 ? left : 0;
    }, [sentAt, tick]);

    const codeFromBoxes = useMemo(() => boxes.join(""), [boxes]);

    function focusBox(i) {
        const el = inputRefs.current[i]?.current;
        if (el) el.focus();
    }

    function handleChange(i, v) {
        const val = (v || "").replace(/\D/g, "").slice(0, 1);
        setBoxes((prev) => {
            const next = [...prev];
            next[i] = val;
            return next;
        });
        if (val && i < OTP_LENGTH - 1) focusBox(i + 1);
    }

    function handleKeyDown(i, e) {
        if (e.key === "Backspace") {
            if (!boxes[i] && i > 0) focusBox(i - 1);
            setStatus("");
            setMessage("");
        }
    }

    function handlePaste(e) {
        const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
        if (!text) return;
        const sliced = text.slice(0, OTP_LENGTH).split("");
        const filled = [...Array(OTP_LENGTH)].map((_, idx) => sliced[idx] || "");
        setBoxes(filled);
        const lastIndex = Math.min(OTP_LENGTH - 1, sliced.length);
        focusBox(lastIndex);
        e.preventDefault();
    }

    function handleSend() {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        const now = Date.now();
        setSentCode(code);
        setSentAt(now);
        localStorage.setItem(LS_KEY, JSON.stringify({ code, sentAt: now }));
        setBoxes(Array(OTP_LENGTH).fill(""));
        setStatus("");
        setMessage("OTP sent (demo). Enter the code to verify.");
        focusBox(0);
    }

    function handleVerify() {
        if (!sentCode) {
            setStatus("error");
            setMessage("Send OTP first.");
            return;
        }
        if (secondsLeft === 0) {
            setStatus("error");
            setMessage("OTP expired. Resend a new one.");
            return;
        }
        if (codeFromBoxes.length !== OTP_LENGTH) {
            setStatus("error");
            setMessage("Enter all digits.");
            return;
        }
        if (codeFromBoxes === sentCode) {
            setStatus("ok");
            setMessage("Verified successfully.");
        } else {
            setStatus("error");
            setMessage("Invalid code. Try again.");
        }
    }

    function handleClear() {
        setBoxes(Array(OTP_LENGTH).fill(""));
        setStatus("");
        setMessage("");
        focusBox(0);
    }

    // Print only the OTP card using a Blob-backed popup (reliable vs document.write)
    function handlePrint() {
        const codeToShow = codeFromBoxes || sentCode || "------";
        const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>OTP</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
*{box-sizing:border-box}
body{margin:0;padding:24px;font:14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Arial;}
.card{max-width:420px;margin:0 auto;border:1px solid #ddd;border-radius:16px;padding:24px}
h1{font-size:18px;margin:0 0 6px}
p{margin:0 0 12px;color:#555}
.code{display:flex;gap:8px;justify-content:center;margin:12px 0 4px}
.box{width:44px;height:54px;border:1px solid #ccc;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;letter-spacing:1px}
.small{color:#777;font-size:12px;text-align:center}
@media print {
  @page { margin: 12mm; }
}
</style>
</head>
<body>
  <div class="card">
    <h1>OTP</h1>
    <p>Use this One-Time Password:</p>
    <div class="code">
      ${codeToShow.split("").map((d) => `<div class="box">${d}</div>`).join("")}
    </div>
    <p class="small">Demo print • Not a real SMS/Email OTP</p>
  </div>
</body>
</html>`;

        try {
            const blob = new Blob([html], { type: "text/html" });
            const url = URL.createObjectURL(blob);
            const w = window.open(url, "_blank", "width=480,height=700"); // keep it simple—no noreferrer
            if (!w) {
                setStatus("error");
                setMessage("Popup blocked. Allow popups to print this card.");
                URL.revokeObjectURL(url);
                return;
            }
            w.onload = () => {
                try {
                    w.focus();
                    w.print();
                } catch { }
                URL.revokeObjectURL(url);
            };
        } catch (err) {
            setStatus("error");
            setMessage("Could not open print window.");
        }
    }

    return (
        <Styled.Wrapper>
            <Styled.Card aria-label="OTP card">
                <Styled.Header>
                    <div>
                        <h2>OTP</h2>
                        <p className="muted">Local demo — generates a 6-digit code in-browser.</p>
                    </div>

                    <Styled.Tools>
                        <button type="button" onClick={handlePrint} title="Print OTP card">Print</button>
                    </Styled.Tools>
                </Styled.Header>

                <Styled.SentRow>
                    <div className="left">
                        <span className="label">Status:</span>
                        {sentCode ? (
                            <span className="value ok">Code generated</span>
                        ) : (
                            <span className="value muted">No code yet</span>
                        )}
                    </div>
                    <div className="right">
                        {sentCode && secondsLeft === 0 ? (
                            <button type="button" onClick={handleSend}>Resend OTP</button>
                        ) : secondsLeft > 0 ? (
                            <span className="cooldown">Resend in {secondsLeft}s</span>
                        ) : (
                            <button type="button" onClick={handleSend}>Send OTP</button>
                        )}
                    </div>
                </Styled.SentRow>

                <Styled.Inputs onPaste={handlePaste}>
                    {boxes.map((val, i) => (
                        <Styled.DigitInput
                            key={i}
                            ref={inputRefs.current[i]}
                            value={val}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoComplete={i === 0 ? "one-time-code" : "off"}
                            aria-label={`OTP digit ${i + 1}`}
                            maxLength={1}
                            placeholder="•"
                        />
                    ))}
                </Styled.Inputs>

                <Styled.Actions>
                    <button type="button" onClick={handleVerify}>Verify</button>
                    <button type="button" className="ghost" onClick={handleClear}>Clear</button>
                    {sentCode ? <span className="hint">Demo code: <code>{sentCode}</code></span> : null}
                </Styled.Actions>

                {message ? (
                    <Styled.Message data-tone={status || "info"}>{message}</Styled.Message>
                ) : null}
            </Styled.Card>
        </Styled.Wrapper>
    );
};

export default Index;

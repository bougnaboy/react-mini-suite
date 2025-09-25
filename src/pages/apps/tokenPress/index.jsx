import { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/** ------------------------------------------------------------------------
 * TokenPress — simple queue ticket printer
 * Now with: Next, Prev, and Print (prints the CURRENT token)
 * ----------------------------------------------------------------------- */

const NS = "tokenPress";

const readLS = (k, fb) => {
    try { const v = localStorage.getItem(`${NS}::${k}`); return v ? JSON.parse(v) : fb; }
    catch { return fb; }
};
const writeLS = (k, v) => { try { localStorage.setItem(`${NS}::${k}`, JSON.stringify(v)); } catch { } };

const padNum = (n, width) => String(n).padStart(Number(width) || 1, "0");
const onlyDigits = (s = "") => String(s).replace(/[^\d]/g, "");
const makeNow = () =>
    new Date().toLocaleString(undefined, {
        year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit",
    });

export default function TokenPress() {
    const [settings, setSettings] = useState(
        readLS("settings", { prefix: "A", pad: 3, start: 1, shop: "" })
    );
    // CURRENT number on screen (this is what Print will print)
    const [current, setCurrent] = useState(readLS("current", 1));
    const [nowStr, setNowStr] = useState(makeNow());
    const [copied, setCopied] = useState(false);

    useEffect(() => { const t = setInterval(() => setNowStr(makeNow()), 1000); return () => clearInterval(t); }, []);
    useEffect(() => writeLS("settings", settings), [settings]);
    useEffect(() => writeLS("current", current), [current]);

    // Ensure current starts at "start" on first load if not initialized
    useEffect(() => {
        if (readLS("current", null) === null) setCurrent(Number(settings.start || 1));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const currentToken = useMemo(
        () => `${(settings.prefix || "").toString()}${padNum(current, settings.pad)}`,
        [settings.prefix, settings.pad, current]
    );

    const handleField = (key) => (e) => {
        const val = key === "pad" || key === "start" ? onlyDigits(e.target.value) : e.target.value;
        setSettings((s) => ({ ...s, [key]: val }));
    };

    const onSetStart = () => {
        if (!settings.start || isNaN(Number(settings.start))) return;
        setCurrent(Number(settings.start));
    };

    const onCopyToken = async () => {
        try { await navigator.clipboard.writeText(currentToken); setCopied(true); setTimeout(() => setCopied(false), 1000); }
        catch { }
    };

    // --- Print helper (prints given token string) ---
    const onPrint = (tokenString) => {
        const ticketHtml = getTicketHTML({ token: tokenString, shop: settings.shop?.trim(), time: makeNow() });

        const iframe = document.createElement("iframe");
        iframe.setAttribute("aria-hidden", "true");
        Object.assign(iframe.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "0" });
        document.body.appendChild(iframe);

        const handleMsg = (ev) => {
            if (ev?.data === "__tp_print_done__") {
                window.removeEventListener("message", handleMsg);
                setTimeout(() => iframe.remove(), 50);
            }
        };
        window.addEventListener("message", handleMsg);

        iframe.srcdoc = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Print Ticket</title>
          <style>
            @page { size: auto; margin: 6mm; }
            html, body { height: 100%; }
            body { display: grid; place-items: center; }
          </style>
        </head>
        <body>
          ${ticketHtml}
          <script>
            setTimeout(() => { window.focus(); window.print(); }, 60);
            window.onafterprint = () => { parent.postMessage("__tp_print_done__", "*"); };
          <\/script>
        </body>
      </html>
    `;
    };

    // --- New controls ---
    const goNext = () => setCurrent((c) => Number(c) + 1);
    const goPrev = () => setCurrent((c) => Math.max(Number(settings.start || 1), Number(c) - 1));
    const printCurrent = () => onPrint(currentToken);

    const onReset = () => {
        if (!confirm(`Reset counter to ${settings.start || 1}?`)) return;
        setCurrent(Number(settings.start || 1));
    };

    const canPrev = Number(current) > Number(settings.start || 1);

    return (
        <Styled.Wrapper>
            <Styled.HeaderBar>
                <h1>TokenPress — Queue Ticket Printer</h1>
                <span className="muted">Single-purpose · Offline-first · LocalStorage only</span>
            </Styled.HeaderBar>

            <Styled.Grid>
                {/* Left: Controls */}
                <Styled.Panel>
                    <Styled.Form>
                        <Field label="Shop/Counter name (optional)">
                            <input type="text" placeholder="AR Clinic" value={settings.shop} onChange={handleField("shop")} />
                        </Field>

                        <Field label="Prefix">
                            <input type="text" placeholder="A" value={settings.prefix} onChange={handleField("prefix")} />
                        </Field>

                        <Field label="Pad (digits)">
                            <input type="number" min="1" max="6" placeholder="3" value={settings.pad} onChange={handleField("pad")} />
                        </Field>

                        <Field label="Start number">
                            <Styled.Row>
                                <input type="number" min="0" placeholder="1" value={settings.start} onChange={handleField("start")} />
                                <Styled.GhostBtn type="button" onClick={onSetStart}>Set as start</Styled.GhostBtn>
                            </Styled.Row>
                        </Field>

                        {/* New control row: Next, Prev, Print current */}
                        <Styled.Row>
                            <Styled.SecondaryBtn type="button" onClick={goNext}>Next</Styled.SecondaryBtn>
                            <Styled.SecondaryBtn type="button" onClick={goPrev} disabled={!canPrev}>Prev</Styled.SecondaryBtn>
                            <Styled.PrimaryBtn type="button" onClick={printCurrent}>Print</Styled.PrimaryBtn>
                            <Styled.GhostBtn type="button" onClick={onReset}>Reset</Styled.GhostBtn>
                        </Styled.Row>
                    </Styled.Form>
                </Styled.Panel>

                {/* Right: Preview */}
                <Styled.Panel>
                    <Styled.PreviewCard>
                        <div className="shop">{settings.shop || "—"}</div>
                        <div className="label">Current token</div>
                        <div className="token">{currentToken}</div>
                        <div className="time">{nowStr}</div>
                    </Styled.PreviewCard>

                    <Styled.Actions>
                        <Styled.PrimaryBtn type="button" onClick={onCopyToken}>
                            {copied ? "Copied!" : "Copy token"}
                        </Styled.PrimaryBtn>
                    </Styled.Actions>

                    <Styled.TinyNote>
                        Use <b>Next</b>/<b>Prev</b> to adjust; <b>Print</b> prints the token currently shown.
                    </Styled.TinyNote>
                </Styled.Panel>
            </Styled.Grid>
        </Styled.Wrapper>
    );
}

/* ------------------------------ subcomponents ------------------------------ */
function Field({ label, children }) {
    return (
        <Styled.FieldRow>
            <label>{label}</label>
            {children}
        </Styled.FieldRow>
    );
}

/** Ticket HTML — inline for a clean, print-only page */
function getTicketHTML({ token, shop, time }) {
    return `
    <div style="
      width: 72mm;
      border: 1px dashed #bbb;
      padding: 10mm 6mm;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      color:#111;
    ">
      <div style="text-align:center; font-size:14px; opacity:.75; margin-bottom:6mm;">
        ${escapeHtml(shop || "")}
      </div>
      <div style="text-align:center; font-size:11px; letter-spacing:.1em; opacity:.6; margin-bottom:4mm;">
        TOKEN
      </div>
      <div style="text-align:center; font-weight:800; font-size:36px; letter-spacing:.06em; margin-bottom:6mm;">
        ${escapeHtml(token)}
      </div>
      <div style="text-align:center; font-size:11px; opacity:.7;">
        ${escapeHtml(time)}
      </div>
    </div>
  `;
}
function escapeHtml(s = "") {
    return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { Styled } from "./styled";

/* ------------------------------- helpers ------------------------------- */
const NS = "qrGenerator";

const sanitizeAmount = (val) => {
    if (val === "" || val == null) return "";
    const num = String(val).replace(/[^\d.]/g, "");
    const parts = num.split(".");
    if (parts.length > 2) return parts[0] + "." + parts.slice(1).join("");
    const [int = "", dec = ""] = parts;
    return dec ? `${int}.${dec.slice(0, 2)}` : int;
};

const isValidVPA = (vpa = "") =>
    /^[a-zA-Z0-9.\-_]+@[a-zA-Z0-9.\-_]+$/.test(vpa.trim());

const buildUpiUrl = ({ pa, pn, am, tn }) => {
    const params = new URLSearchParams();
    if (pa) params.set("pa", pa.trim());
    if (pn) params.set("pn", pn.trim());
    if (am !== "" && am != null) params.set("am", sanitizeAmount(am));
    if (tn) params.set("tn", tn.trim());
    params.set("cu", "INR");
    return `upi://pay?${params.toString()}`;
};

const readLS = (key, fallback) => {
    try {
        const v = localStorage.getItem(`${NS}::${key}`);
        return v ? JSON.parse(v) : fallback;
    } catch {
        return fallback;
    }
};
const writeLS = (key, val) => {
    try {
        localStorage.setItem(`${NS}::${key}`, JSON.stringify(val));
    } catch { }
};

/* ------------------------------- component ------------------------------ */
export default function QRGenerator() {
    const [form, setForm] = useState(readLS("form", { pa: "", pn: "", am: "", tn: "" }));
    const [logo, setLogo] = useState(readLS("logo", null));           // dataURL
    const [logoScale, setLogoScale] = useState(readLS("logoScale", 0.18)); // 0.10 - 0.25
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");

    const canvasRef = useRef(null);
    const fileRef = useRef(null); // <input type="file">

    const upiUrl = useMemo(() => buildUpiUrl(form), [form]);

    const handleChange = (key) => (e) => {
        const value = key === "am" ? sanitizeAmount(e.target.value) : e.target.value;
        setForm((f) => ({ ...f, [key]: value }));
    };

    useEffect(() => writeLS("form", form), [form]);
    useEffect(() => writeLS("logo", logo), [logo]);
    useEffect(() => writeLS("logoScale", logoScale), [logoScale]);

    // validate VPA
    useEffect(() => {
        if (!form.pa) return setError("");
        setError(isValidVPA(form.pa) ? "" : "Enter a valid VPA like ashish@okicici");
    }, [form.pa]);

    // draw QR whenever URL or logo changes
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const draw = async () => {
            try {
                await QRCode.toCanvas(canvas, upiUrl, {
                    width: 512,
                    margin: 2,
                    errorCorrectionLevel: "H",
                });

                if (logo) {
                    const ctx = canvas.getContext("2d");
                    const img = new Image();
                    img.onload = () => {
                        const size = Math.round(canvas.width * clamp(logoScale, 0.1, 0.25));
                        const x = (canvas.width - size) / 2;
                        const y = (canvas.height - size) / 2;

                        // white rounded background for readability
                        roundedRect(ctx, x - 10, y - 10, size + 20, size + 20, 12);
                        ctx.fillStyle = "#fff";
                        ctx.fill();

                        ctx.drawImage(img, x, y, size, size);
                    };
                    img.src = logo;
                }
            } catch (e) {
                console.error("QR draw error", e);
            }
        };

        draw();
    }, [upiUrl, logo, logoScale]);

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(upiUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch { }
    };

    const onDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = "upi-qr.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    /** Single-print using hidden iframe + img.onload; cleans up after print */
    const onPrint = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataURL = canvas.toDataURL("image/png");

        const iframe = document.createElement("iframe");
        iframe.setAttribute("aria-hidden", "true");
        Object.assign(iframe.style, {
            position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "0",
        });
        document.body.appendChild(iframe);

        const handleMsg = (ev) => {
            if (ev?.data === "__qrPrintDone__") {
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
          <title>Print QR</title>
          <style>
            @page { margin: 10mm; }
            html, body { height: 100%; }
            body { display: grid; place-items: center; }
            img { width: 72mm; height: auto; }
          </style>
        </head>
        <body>
          <img id="qr" src="${dataURL}" />
          <script>
            const img = document.getElementById('qr');
            img.onload = () => { setTimeout(() => { window.focus(); window.print(); }, 50); };
            window.onafterprint = () => { parent.postMessage("__qrPrintDone__", "*"); };
          <\/script>
        </body>
      </html>
    `;
    };

    const onLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setLogo(reader.result); // keep input value as-is so filename stays visible
        };
        reader.readAsDataURL(file);
    };

    const clearLogo = () => {
        setLogo(null);
        if (fileRef.current) fileRef.current.value = ""; // clears filename label
    };

    const clearForm = () => {
        if (!confirm("Clear all fields?")) return;
        setForm({ pa: "", pn: "", am: "", tn: "" });
    };

    const disabled = !form.pa || !!error;

    return (
        <Styled.Wrapper>
            <Styled.HeaderBar>
                <h1>UPI QR Generator (Pro)</h1>
                <span className="muted">100% client-side · localStorage only</span>
            </Styled.HeaderBar>

            <Styled.Grid>
                {/* ------------------------------ Left: Form ------------------------------ */}
                <Styled.Panel>
                    <Styled.Form>
                        <Field
                            label="VPA (pa)"
                            placeholder="ashish@okicici"
                            value={form.pa}
                            onChange={handleChange("pa")}
                            autoFocus
                            required
                        />
                        {!!error && <Styled.Error>{error}</Styled.Error>}

                        <Field
                            label="Payee Name (pn)"
                            placeholder="Ashish Ranjan"
                            value={form.pn}
                            onChange={handleChange("pn")}
                        />

                        <Styled.FieldRow>
                            <label>Quick amounts</label>
                            <Styled.Chips>
                                {[50, 100, 199, 500].map((v) => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => setForm((f) => ({ ...f, am: String(v) }))}
                                    >
                                        ₹{v}
                                    </button>
                                ))}
                                <button type="button" onClick={() => setForm((f) => ({ ...f, am: "" }))}>
                                    Clear
                                </button>
                            </Styled.Chips>
                        </Styled.FieldRow>

                        <Field
                            label="Amount (am)"
                            placeholder="199.00"
                            value={form.am}
                            onChange={handleChange("am")}
                            inputMode="decimal"
                        />

                        <Field
                            label="Note (tn)"
                            placeholder="Consulting fee"
                            value={form.tn}
                            onChange={handleChange("tn")}
                        />

                        <Styled.FieldRow>
                            <label>Logo (optional)</label>
                            <Styled.Row>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={onLogoUpload}
                                    // allow picking SAME file again by clearing value just before dialog opens
                                    onClick={(e) => { e.currentTarget.value = ""; }}
                                />
                                {logo && (
                                    <Styled.GhostBtn type="button" onClick={clearLogo}>
                                        Remove
                                    </Styled.GhostBtn>
                                )}
                            </Styled.Row>
                            <Styled.SliderRow>
                                <span>Logo size</span>
                                <input
                                    type="range"
                                    min="0.10"
                                    max="0.25"
                                    step="0.01"
                                    value={logoScale}
                                    onChange={(e) => setLogoScale(Number(e.target.value))}
                                />
                                <span>{Math.round(logoScale * 100)}%</span>
                            </Styled.SliderRow>
                        </Styled.FieldRow>

                        <Styled.Row>
                            <Styled.GhostBtn type="button" onClick={clearForm}>
                                Clear fields
                            </Styled.GhostBtn>
                        </Styled.Row>
                    </Styled.Form>
                </Styled.Panel>

                {/* --------------------------- Right: QR + Actions -------------------------- */}
                <Styled.Panel>
                    <Styled.QRBox>
                        <canvas ref={canvasRef} aria-label="UPI QR code" />
                    </Styled.QRBox>

                    <Styled.UrlPreview title={upiUrl}>{upiUrl}</Styled.UrlPreview>

                    <Styled.Actions>
                        <Styled.PrimaryBtn type="button" onClick={onCopy} disabled={disabled}>
                            {copied ? "Copied!" : "Copy UPI Link"}
                        </Styled.PrimaryBtn>
                        <Styled.SecondaryBtn type="button" onClick={onDownload} disabled={disabled}>
                            Download PNG
                        </Styled.SecondaryBtn>
                        <Styled.SecondaryBtn type="button" onClick={onPrint} disabled={disabled}>
                            Print QR
                        </Styled.SecondaryBtn>
                    </Styled.Actions>

                    <Styled.TinyNote>
                        Tip: Keep logo ≤ 20% of QR for reliable scanning. Empty fields are automatically skipped.
                    </Styled.TinyNote>
                </Styled.Panel>
            </Styled.Grid>
        </Styled.Wrapper>
    );
}

/* ---------------------------- tiny subcomponents --------------------------- */
function Field({ label, ...rest }) {
    return (
        <Styled.FieldRow>
            <label>{label}</label>
            <input {...rest} />
        </Styled.FieldRow>
    );
}

/* ------------------------------- utilities ------------------------------- */
function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
}
function roundedRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
}

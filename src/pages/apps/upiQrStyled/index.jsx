import { useEffect, useRef, useState } from "react";
import { Styled } from "./styled";

// -------- Defaults (same as your vanilla) -----------------
const DEFAULT_AMOUNTS = [99, 199, 499, 999];
const DEFAULT_NOTES = ["Thanks", "Fees", "Subscription", "Donation"];

// -------- Helpers ----------------------------------------
const isValidVPA = (vpa) =>
    /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z0-9.\-_]{2,}$/.test(vpa || "");

function buildUpiUri({ vpa, payeeName, amount, note, txnRef }) {
    const params = new URLSearchParams();
    if (vpa) params.set("pa", vpa);
    if (payeeName) params.set("pn", payeeName);
    if (amount) params.set("am", Number(amount).toFixed(2));
    if (note) params.set("tn", note);
    params.set("cu", "INR");
    if (txnRef) params.set("tr", txnRef);
    return `upi://pay?${params.toString()}`;
}

function qrPngUrl(data, size = 420) {
    const base = "https://api.qrserver.com/v1/create-qr-code/";
    const q = new URLSearchParams({ size: `${size}x${size}`, data, margin: "0" });
    return `${base}?${q.toString()}`;
}

function drawMessage(ctx, size, text) {
    ctx.fillStyle = "#f2f2f2";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "16px system-ui, -apple-system, Segoe UI, Arial";
    ctx.fillText(text, size / 2, size / 2);
}

// -------- Component --------------------------------------
export default function UpiQrStyled() {
    const [vpa, setVpa] = useState("");
    const [payeeName, setPayeeName] = useState("");
    const [txnRef, setTxnRef] = useState("");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [linkPreview, setLinkPreview] = useState("");
    const [toast, setToast] = useState("");

    const amountPresets = DEFAULT_AMOUNTS;
    const notePresets = DEFAULT_NOTES;

    const canvasRef = useRef(null);

    // Toast (tiny)
    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(""), 1400);
    }

    // Draw QR whenever inputs change
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const size = canvas.width;

        // Clear + white background
        ctx.clearRect(0, 0, size, size);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);

        if (!vpa || !isValidVPA(vpa)) {
            drawMessage(ctx, size, "Enter a valid UPI ID (name@bank)");
            setLinkPreview("");
            return;
        }

        const upi = buildUpiUri({ vpa, payeeName, amount, note, txnRef });
        setLinkPreview(upi);

        const src = qrPngUrl(upi, size);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => ctx.drawImage(img, 0, 0, size, size);
        img.onerror = () => drawMessage(ctx, size, "QR render failed. Check connection.");
        img.src = src;
    }, [vpa, payeeName, amount, note, txnRef]);

    // Actions
    async function handleCopyLink() {
        const upi = buildUpiUri({ vpa, payeeName, amount, note, txnRef });
        try {
            await navigator.clipboard.writeText(upi);
            showToast("UPI link copied.");
        } catch {
            // Fallback
            window.prompt("Copy UPI link:", upi);
        }
    }

    function handleDownload() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const safeVpa = (vpa || "upi").replace(/[^a-z0-9@._-]/gi, "_");
        const suffix = amount ? `_${Number(amount).toFixed(2)}` : "";
        const a = document.createElement("a");
        a.download = `upi_qr_${safeVpa}${suffix}.png`;
        a.href = canvas.toDataURL("image/png");
        a.click();
    }

    function handleReset() {
        if (!confirm("Reset all fields?")) return;
        setVpa("");
        setPayeeName("");
        setTxnRef("");
        setAmount("");
        setNote("");
    }

    function handlePrint() {
        // CSS ensures only the QR area is visible in print
        window.print();
    }

    return (
        <Styled.Wrapper>
            <Styled.GlobalStyles />

            <Styled.SiteHeader>
                <h1>UPI QR Generator</h1>
                <p className="muted">
                    Create a scannable UPI QR with quick amount &amp; note presets. (Client-side)
                </p>
            </Styled.SiteHeader>

            <Styled.Container>
                <Styled.Layout>
                    {/* LEFT: Controls */}
                    <Styled.Col>
                        <Styled.Card>
                            <Styled.CardTitle>Payee</Styled.CardTitle>
                            <Styled.Grid className="g-3">
                                <Styled.Field>
                                    <span>UPI ID (VPA) *</span>
                                    <input
                                        placeholder="name@bank"
                                        value={vpa}
                                        onChange={(e) => setVpa(e.target.value.trim())}
                                    />
                                </Styled.Field>
                                <Styled.Field>
                                    <span>Payee Name</span>
                                    <input
                                        placeholder="e.g., Ashish Ranjan"
                                        value={payeeName}
                                        onChange={(e) => setPayeeName(e.target.value)}
                                    />
                                </Styled.Field>
                                <Styled.Field>
                                    <span>Transaction Ref (optional)</span>
                                    <input
                                        placeholder="auto or leave blank"
                                        value={txnRef}
                                        onChange={(e) => setTxnRef(e.target.value)}
                                    />
                                </Styled.Field>
                            </Styled.Grid>
                        </Styled.Card>

                        <Styled.Card>
                            <Styled.CardHeader>
                                <Styled.CardTitle>Payment</Styled.CardTitle>
                            </Styled.CardHeader>

                            <Styled.Grid className="g-3">
                                <Styled.Field>
                                    <span>Amount (₹)</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </Styled.Field>
                                <Styled.Field>
                                    <span>Note (Message)</span>
                                    <input
                                        maxLength={60}
                                        placeholder="e.g., Consultation Fees"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                </Styled.Field>
                            </Styled.Grid>

                            <div className="presetsWrapper">
                                <small className="muted">Tap a preset to fill quickly.</small>
                                <div className="presets">
                                    <Styled.Chips>
                                        {amountPresets.map((v) => (
                                            <Styled.Chip key={v} type="button" onClick={() => setAmount(String(v))}>
                                                ₹{v}
                                            </Styled.Chip>
                                        ))}
                                    </Styled.Chips>
                                    <Styled.Chips>
                                        {notePresets.map((t) => (
                                            <Styled.Chip key={t} type="button" onClick={() => setNote(t)}>
                                                {t}
                                            </Styled.Chip>
                                        ))}
                                    </Styled.Chips>
                                </div>
                            </div>
                        </Styled.Card>
                    </Styled.Col>

                    {/* RIGHT: QR + actions */}
                    <Styled.Col>
                        <Styled.Card className="sticky">
                            <Styled.CardHeader>
                                <Styled.CardTitle>QR Preview</Styled.CardTitle>
                                <small className="muted">Updates live. Use Download or Print for sharing.</small>
                            </Styled.CardHeader>

                            <Styled.QrWrap className="qr-wrap">
                                <Styled.QrCanvas
                                    ref={canvasRef}
                                    width={420}
                                    height={420}
                                    className="qr"
                                    aria-label="UPI QR preview"
                                />
                            </Styled.QrWrap>

                            <Styled.Summary>
                                <div>
                                    <span className="muted">UPI Link</span>
                                    <Styled.Code
                                        title={linkPreview ? "Click to copy" : ""}
                                        role="button"
                                        tabIndex={0}
                                        onClick={linkPreview ? handleCopyLink : undefined}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && linkPreview) handleCopyLink();
                                        }}
                                    >
                                        {linkPreview}
                                    </Styled.Code>
                                </div>
                            </Styled.Summary>

                            <Styled.Actions>
                                <Styled.Button onClick={handleDownload}>Download PNG</Styled.Button>
                                <Styled.Button $variant="secondary" onClick={handleCopyLink}>
                                    Copy UPI Link
                                </Styled.Button>
                                <Styled.Button $variant="secondary" onClick={handlePrint}>
                                    Print
                                </Styled.Button>
                                <Styled.Button $variant="danger" onClick={handleReset}>
                                    Reset
                                </Styled.Button>
                            </Styled.Actions>
                        </Styled.Card>
                    </Styled.Col>
                </Styled.Layout>
            </Styled.Container>

            <Styled.SiteFooter>
                <small>
                    &copy; 2025 |{" "}
                    <a href="https://www.ashishranjan.net" target="_blank" rel="noreferrer">
                        Ashish Ranjan
                    </a>
                </small>
            </Styled.SiteFooter>

            {toast && <Styled.Toast>{toast}</Styled.Toast>}
        </Styled.Wrapper>
    );
}

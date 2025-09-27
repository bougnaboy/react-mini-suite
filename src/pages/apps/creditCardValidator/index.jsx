import React, { useMemo, useState } from "react";
import { Styled } from "./styled";

// Luhn checksum (returns true if number passes Luhn)
function luhnCheck(numStr) {
    const digits = numStr.replace(/\D/g, "").split("").reverse().map(Number);
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
        let d = digits[i];
        if (i % 2 === 1) {
            d *= 2;
            if (d > 9) d -= 9;
        }
        sum += d;
    }
    return sum % 10 === 0 && digits.length >= 12; // basic length sanity
}

// Basic brand detection by IIN ranges/prefixes (kept practical)
function detectBrand(num) {
    if (/^4\d{0,}/.test(num)) return "Visa";
    if (/^(5[1-5]|2(2[2-9]\d|[3-6]\d{2}|7([01]\d|20)))\d*/.test(num)) return "Mastercard";
    if (/^3[47]\d*/.test(num)) return "American Express";
    if (/^(6011|65|64[4-9])\d*/.test(num)) return "Discover";
    if (/^35(2[89]|[3-8]\d)\d*/.test(num)) return "JCB";
    if (/^(50|56|57|58|6[0-9])\d*/.test(num)) return "Maestro";
    return "Unknown";
}

// Format with spaces; AMEX uses 4-6-5, others default to 4-4-4-4
function formatCardNumber(raw, brand) {
    const s = raw.replace(/\D/g, "").slice(0, 19);
    if (brand === "American Express") {
        return s
            .replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (m, a, b, c) =>
                [a, b, c].filter(Boolean).join(" ")
            )
            .trim();
    }
    return s.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

const EXAMPLES = [
    { brand: "Visa", num: "4111111111111111" },
    { brand: "Mastercard", num: "5555555555554444" },
    { brand: "American Express", num: "378282246310005" },
    { brand: "Discover", num: "6011111111111117" },
];

const CreditCardValidator = () => {
    const [value, setValue] = useState("");

    const raw = useMemo(() => value.replace(/\D/g, ""), [value]);
    const brand = useMemo(() => detectBrand(raw), [raw]);
    const formatted = useMemo(() => formatCardNumber(raw, brand), [raw, brand]);
    const isValid = useMemo(() => (raw.length ? luhnCheck(raw) : false), [raw]);

    // Keep display formatted while editing
    const handleChange = (e) => {
        const cleaned = e.target.value.replace(/\D/g, "");
        setValue(formatCardNumber(cleaned, detectBrand(cleaned)));
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData("text");
        const cleaned = String(text || "").replace(/\D/g, "");
        setValue(formatCardNumber(cleaned, detectBrand(cleaned)));
    };

    const handleExample = (num) => setValue(formatCardNumber(num, detectBrand(num)));
    const handleClear = () => setValue("");
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(raw);
        } catch (_) {
            // ignore
        }
    };

    return (
        <Styled.Wrapper>
            <header className="head">
                <h2>Credit Card Validator</h2>
                <p className="sub">Client-side Luhn check + basic brand detection. Nothing is sent anywhere.</p>
            </header>

            <Styled.Card>
                <label htmlFor="cc">Card number</label>
                <Styled.Input
                    id="cc"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Enter card number"
                    value={formatted}
                    onChange={handleChange}
                    onPaste={handlePaste}
                    aria-label="Card number"
                />

                <Styled.Row className="statusRow">
                    <Styled.Pill $tone={brand === "Unknown" ? "muted" : "info"}>{brand}</Styled.Pill>
                    {raw.length > 0 ? (
                        <Styled.Pill $tone={isValid ? "ok" : "bad"}>
                            {isValid ? "✓ Passes Luhn" : "✗ Fails Luhn"}
                        </Styled.Pill>
                    ) : (
                        <Styled.Pill $tone="muted">—</Styled.Pill>
                    )}
                    {!!raw && <span className="len">{raw.length} digits</span>}
                </Styled.Row>

                <Styled.Row className="actions">
                    <button type="button" onClick={handleClear} disabled={!raw}>Clear</button>
                    <button type="button" onClick={handleCopy} disabled={!raw}>Copy number</button>
                </Styled.Row>
            </Styled.Card>

            <Styled.Section>
                <h4>Examples (for testing)</h4>
                <ul className="examples">
                    {EXAMPLES.map((e) => (
                        <li key={e.num}>
                            <button type="button" onClick={() => handleExample(e.num)}>
                                {e.brand}: {formatCardNumber(e.num, e.brand)}
                            </button>
                        </li>
                    ))}
                </ul>
                <p className="note">
                    Tip: This checks structure only (Luhn + prefix). It does <b>not</b> verify if a card is active.
                </p>
            </Styled.Section>
        </Styled.Wrapper>
    );
};

export default CreditCardValidator;

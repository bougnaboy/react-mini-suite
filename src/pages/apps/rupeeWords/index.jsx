import { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";
import { toast } from "react-toastify";

/** -------------------------------
 *  Helpers: number → words (INR)
 *  -------------------------------
 */

const ONES = [
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"
];

const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function chunkBelowThousand(n, hyphenate) {
    // n is 0..999
    if (n === 0) return "";
    const parts = [];
    const hundred = Math.floor(n / 100);
    const rest = n % 100;

    if (hundred) {
        parts.push(`${ONES[hundred]} hundred`);
        if (rest) parts.push(""); // spacer for the rest
    }

    if (rest) {
        if (rest < 20) {
            parts.push(ONES[rest]);
        } else {
            const t = Math.floor(rest / 10);
            const o = rest % 10;
            if (o) {
                parts.push(hyphenate ? `${TENS[t]}-${ONES[o]}` : `${TENS[t]} ${ONES[o]}`);
            } else {
                parts.push(TENS[t]);
            }
        }
    }
    return parts.filter(Boolean).join(" ").trim();
}

function toWordsIndian(rupees, hyphenate) {
    if (rupees === 0) return "zero";
    const parts = [];

    const crore = Math.floor(rupees / 10000000); rupees %= 10000000;
    const lakh = Math.floor(rupees / 100000); rupees %= 100000;
    const thousand = Math.floor(rupees / 1000); rupees %= 1000;
    const belowThousand = rupees;

    if (crore) parts.push(`${chunkBelowThousand(crore, hyphenate)} crore`);
    if (lakh) parts.push(`${chunkBelowThousand(lakh, hyphenate)} lakh`);
    if (thousand) parts.push(`${chunkBelowThousand(thousand, hyphenate)} thousand`);
    if (belowThousand) parts.push(`${chunkBelowThousand(belowThousand, hyphenate)}`);

    return parts.join(" ").trim();
}

function toWordsInternational(rupees, hyphenate) {
    if (rupees === 0) return "zero";
    const parts = [];

    const billion = Math.floor(rupees / 1_000_000_000); rupees %= 1_000_000_000;
    const million = Math.floor(rupees / 1_000_000); rupees %= 1_000_000;
    const thousand = Math.floor(rupees / 1_000); rupees %= 1_000;
    const belowThousand = rupees;

    if (billion) parts.push(`${chunkBelowThousand(billion, hyphenate)} billion`);
    if (million) parts.push(`${chunkBelowThousand(million, hyphenate)} million`);
    if (thousand) parts.push(`${chunkBelowThousand(thousand, hyphenate)} thousand`);
    if (belowThousand) parts.push(`${chunkBelowThousand(belowThousand, hyphenate)}`);

    return parts.join(" ").trim();
}

function titleCasePreserveHyphen(str) {
    // Basic Title Case that respects hyphenated compounds
    return str
        .split(" ")
        .map(w =>
            w
                .split("-")
                .map(p => (p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : p))
                .join("-")
        )
        .join(" ");
}

function formatAmountWords(amountInput, settings) {
    // Sanitize & parse
    let amt = String(amountInput || "").replace(/[^\d.]/g, "");
    if (amt === "") amt = "0";
    let value = Number(amt);
    if (Number.isNaN(value) || value < 0) value = 0;

    const rupees = Math.floor(value);
    const paise = Math.round((value - rupees) * 100);

    const toWords =
        settings.system === "international"
            ? toWordsInternational
            : toWordsIndian;

    let main = toWords(rupees, settings.hyphenate);

    // Compose currency words
    let sentence = `${main} rupees`;

    if (settings.includePaise && paise > 0) {
        const paiseWords =
            paise < 20
                ? ONES[paise]
                : (() => {
                    const t = Math.floor(paise / 10);
                    const o = paise % 10;
                    if (!o) return TENS[t];
                    return settings.hyphenate ? `${TENS[t]}-${ONES[o]}` : `${TENS[t]} ${ONES[o]}`;
                })();
        sentence += ` and ${paiseWords} paise`;
    }

    if (settings.suffixOnly) sentence += " only";

    // Case
    if (settings.caseStyle === "upper") sentence = sentence.toUpperCase();
    else sentence = titleCasePreserveHyphen(sentence);

    return {
        cleanAmount: value.toFixed(settings.includePaise ? 2 : 0),
        words: sentence
    };
}

/** -------------------------------
 *  Component
 *  -------------------------------
 */

const LS_KEY_SETTINGS = "rupeeWords::settings";
const LS_KEY_AMOUNT = "rupeeWords::amount";

const DEFAULTS = {
    system: "indian",           // "indian" | "international"
    caseStyle: "title",         // "title" | "upper"
    suffixOnly: true,
    includePaise: true,
    hyphenate: true,
};

export default function RupeeWords() {
    const [amount, setAmount] = useState("0");
    const [settings, setSettings] = useState(DEFAULTS);
    const getSymbolForSystem = (system) => (system === "indian" ? "₹" : "Rs.");
    const symbol = useMemo(() => getSymbolForSystem(settings.system), [settings.system]);

    // Load persisted state
    useEffect(() => {
        try {
            const s = JSON.parse(localStorage.getItem(LS_KEY_SETTINGS) || "null");
            if (s) setSettings({ ...DEFAULTS, ...s });
            const a = localStorage.getItem(LS_KEY_AMOUNT);
            if (a !== null) setAmount(a);
        } catch { }
    }, []);

    // Persist on change
    useEffect(() => {
        localStorage.setItem(LS_KEY_SETTINGS, JSON.stringify(settings));
    }, [settings]);
    useEffect(() => {
        localStorage.setItem(LS_KEY_AMOUNT, amount);
    }, [amount]);

    const { cleanAmount, words } = useMemo(
        () => formatAmountWords(amount, settings),
        [amount, settings]
    );

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(words);
            toast.success("Copied amount in words!");
        } catch {
            toast.error("Copy failed");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <h1>RupeeWords</h1>
                <p>Convert any ₹ amount to words — Indian/International format, with paise &amp; “Only”.</p>
            </Styled.Header>

            <Styled.Panel>
                <Styled.FormRow>
                    <label htmlFor="amount">Amount (₹)</label>
                    <Styled.AmountInput
                        id="amount"
                        inputMode="decimal"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </Styled.FormRow>

                <Styled.Controls>
                    <div>
                        <label>Numbering</label>
                        <select
                            value={settings.system}
                            onChange={(e) => setSettings((s) => ({ ...s, system: e.target.value }))}
                        >
                            <option value="indian">Indian (crore/lakh)</option>
                            <option value="international">International (million/billion)</option>
                        </select>
                    </div>

                    <div>
                        <label>Case</label>
                        <select
                            value={settings.caseStyle}
                            onChange={(e) => setSettings((s) => ({ ...s, caseStyle: e.target.value }))}
                        >
                            <option value="title">Title Case</option>
                            <option value="upper">UPPERCASE</option>
                        </select>
                    </div>

                    <div>
                        <label className="checkbox">
                            <input
                                type="checkbox"
                                checked={settings.includePaise}
                                onChange={(e) => setSettings((s) => ({ ...s, includePaise: e.target.checked }))}
                            />
                            Include Paise
                        </label>
                    </div>

                    <div>
                        <label className="checkbox">
                            <input
                                type="checkbox"
                                checked={settings.hyphenate}
                                onChange={(e) => setSettings((s) => ({ ...s, hyphenate: e.target.checked }))}
                            />
                            Hyphenate (twenty-one)
                        </label>
                    </div>

                    <div>
                        <label className="checkbox">
                            <input
                                type="checkbox"
                                checked={settings.suffixOnly}
                                onChange={(e) => setSettings((s) => ({ ...s, suffixOnly: e.target.checked }))}
                            />
                            Add “Only” suffix
                        </label>
                    </div>
                </Styled.Controls>

                <Styled.OutputCard id="rupeeWordsPrint">
                    <div className="digits">
                        <span>{symbol}</span>
                        <strong>{cleanAmount}</strong>
                    </div>
                    <p className="words">{words}</p>
                    <Styled.Actions className="no-print">
                        <button onClick={handleCopy}>Copy</button>
                        <button onClick={handlePrint}>Print</button>
                    </Styled.Actions>
                </Styled.OutputCard>


                <Styled.Note className="no-print">
                    <p>
                        Tip: Toggle Indian/International formats. Output is local-only (saved in your browser).
                    </p>
                </Styled.Note>
            </Styled.Panel>
        </Styled.Wrapper>
    );
}

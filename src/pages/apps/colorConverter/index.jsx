import React, { useMemo, useState, useRef, useEffect } from "react";
import { Styled } from "./styled";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const rgbToHex = ({ r, g, b }) =>
    "#" +
    [r, g, b]
        .map((n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();

const hexToRgb = (hex) => {
    if (!hex) return null;
    let h = hex.trim().replace(/^#/, "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const rgbToHsl = ({ r, g, b }) => {
    let R = r / 255, G = g / 255, B = b / 255;
    const max = Math.max(R, G, B), min = Math.min(R, G, B);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case R: h = (G - B) / d + (G < B ? 6 : 0); break;
            case G: h = (B - R) / d + 2; break;
            case B: h = (R - G) / d + 4; break;
            default: break;
        }
        h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToRgb = ({ h, s, l }) => {
    const H = ((h % 360) + 360) % 360;
    const S = clamp(s, 0, 100) / 100;
    const L = clamp(l, 0, 100) / 100;

    if (S === 0) {
        const val = Math.round(L * 255);
        return { r: val, g: val, b: val };
    }

    const q = L < 0.5 ? L * (1 + S) : L + S - L * S;
    const p = 2 * L - q;

    const hue2rgb = (p2, q2, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p2 + (q2 - p2) * 6 * t;
        if (t < 1 / 2) return q2;
        if (t < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - t) * 6;
        return p2;
    };

    const r = Math.round(hue2rgb(p, q, (H / 360) + 1 / 3) * 255);
    const g = Math.round(hue2rgb(p, q, (H / 360)) * 255);
    const b = Math.round(hue2rgb(p, q, (H / 360) - 1 / 3) * 255);
    return { r, g, b };
};

const parseRgbString = (val) => {
    if (!val) return null;
    const s = val.trim();
    const m1 = s.match(/^rgb\(\s*([\d]{1,3})\s*,\s*([\d]{1,3})\s*,\s*([\d]{1,3})\s*\)$/i);
    const m2 = s.match(/^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/);
    const m = m1 || m2;
    if (!m) return null;
    const r = +m[1], g = +m[2], b = +m[3];
    if ([r, g, b].some((n) => isNaN(n) || n < 0 || n > 255)) return null;
    return { r, g, b };
};

const parseHslString = (val) => {
    if (!val) return null;
    const s = val.trim();
    const m1 = s.match(/^hsl\(\s*([+-]?\d+)\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/i);
    const m2 = s.match(/^([+-]?\d+)\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%$/);
    const m = m1 || m2;
    if (!m) return null;
    const h = +m[1], S = +m[2], L = +m[3];
    if ([S, L].some((n) => isNaN(n) || n < 0 || n > 100)) return null;
    return { h, s: S, l: L };
};

const toRgbFromAny = (raw) => {
    if (!raw) return null;
    const el = document.createElement("div");
    el.style.color = "";
    el.style.color = raw.trim();
    document.body.appendChild(el);
    const got = getComputedStyle(el).color;
    document.body.removeChild(el);
    const m = got.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3] };
};

const formatRgb = ({ r, g, b }) => `rgb(${clamp(r, 0, 255)}, ${clamp(g, 0, 255)}, ${clamp(b, 0, 255)})`;
const formatHsl = ({ h, s, l }) => `hsl(${Math.round(h)}, ${clamp(s, 0, 100)}%, ${clamp(l, 0, 100)}%)`;

export default function ColorConverter() {
    const [anyColor, setAnyColor] = useState("#22c55e");
    const [hex, setHex] = useState("#22C55E");
    const [rgb, setRgb] = useState("rgb(34, 197, 94)");
    const [hsl, setHsl] = useState("hsl(146, 64%, 45%)");
    const [error, setError] = useState("");

    // copied chip state
    const [copied, setCopied] = useState(""); // 'hex' | 'rgb' | 'hsl' | ''
    const copyTimer = useRef(null);

    useEffect(() => {
        return () => {
            if (copyTimer.current) clearTimeout(copyTimer.current);
        };
    }, []);

    const showCopied = (key) => {
        setCopied(key);
        if (copyTimer.current) clearTimeout(copyTimer.current);
        copyTimer.current = setTimeout(() => setCopied(""), 1200);
    };

    const syncFromRgb = (rgbObj) => {
        if (!rgbObj) {
            setError("Invalid color");
            return;
        }
        setError("");
        const newHex = rgbToHex(rgbObj);
        const newRgbStr = formatRgb(rgbObj);
        const newHslStr = formatHsl(rgbToHsl(rgbObj));
        setHex(newHex);
        setRgb(newRgbStr);
        setHsl(newHslStr);
    };

    useMemo(() => {
        const base =
            toRgbFromAny(anyColor) ||
            hexToRgb(hex) ||
            parseRgbString(rgb) ||
            (parseHslString(hsl) && hslToRgb(parseHslString(hsl)));
        if (base) syncFromRgb(base);
        // eslint-disable-next-line
    }, []);

    const onAnyChange = (v) => {
        setAnyColor(v);
        syncFromRgb(toRgbFromAny(v));
    };

    const onHexChange = (v) => {
        const clean = v.trim().startsWith("#") ? v.trim() : `#${v.trim()}`;
        setHex(clean.toUpperCase());
        syncFromRgb(hexToRgb(clean));
        setAnyColor(clean.toUpperCase());
    };

    const onRgbChange = (v) => {
        setRgb(v);
        const parsed = parseRgbString(v);
        if (parsed) setAnyColor(formatRgb(parsed));
        syncFromRgb(parsed);
    };

    const onHslChange = (v) => {
        setHsl(v);
        const parsed = parseHslString(v);
        if (parsed) {
            const rgbObj = hslToRgb(parsed);
            setAnyColor(formatHsl(parsed));
            syncFromRgb(rgbObj);
        } else {
            setError("Invalid color");
        }
    };

    const copy = async (key, txt) => {
        try {
            await navigator.clipboard.writeText(txt);
        } catch {
            // ignore clipboard errors silently
        }
        showCopied(key);
    };

    const pickerHex = (hex && hexToRgb(hex)) ? hex : "#000000";

    return (
        <Styled.Wrapper>
            <header className="header">
                <h2>HTML Color Converter</h2>
                <p className="sub">
                    Convert between HEX, RGB, and HSL. Accepts any CSS color (e.g., <i>tomato</i>, <i>#aabbcc</i>, <i>rgb(0,0,0)</i>, <i>hsl(210, 50%, 50%)</i>).
                </p>
            </header>

            <Styled.Grid>
                <Styled.Preview style={{ background: rgb }}>
                    <div className="chip">{hex}</div>
                </Styled.Preview>

                <Styled.Fields>
                    <label>
                        <span>Any CSS Color</span>
                        <input
                            type="text"
                            value={anyColor}
                            onChange={(e) => onAnyChange(e.target.value)}
                            placeholder="tomato | #22c55e | rgb(34,197,94) | hsl(146,64%,45%)"
                        />
                    </label>

                    <div className="row two">
                        <label>
                            <span>Pick</span>
                            <input
                                type="color"
                                value={pickerHex}
                                onChange={(e) => onHexChange(e.target.value)}
                            />
                        </label>

                        <label>
                            <span>HEX</span>
                            <div className="with-btn">
                                <input
                                    type="text"
                                    value={hex}
                                    onChange={(e) => onHexChange(e.target.value)}
                                    placeholder="#AABBCC"
                                />
                                <button type="button" onClick={() => copy("hex", hex)}>Copy</button>
                                <span
                                    role="status"
                                    aria-live="polite"
                                    className={`copied ${copied === "hex" ? "show" : ""}`}
                                >
                                    Copied
                                </span>
                            </div>
                        </label>
                    </div>

                    <label>
                        <span>RGB</span>
                        <div className="with-btn">
                            <input
                                type="text"
                                value={rgb}
                                onChange={(e) => onRgbChange(e.target.value)}
                                placeholder="rgb(0, 0, 0) or 0,0,0"
                            />
                            <button type="button" onClick={() => copy("rgb", rgb)}>Copy</button>
                            <span
                                role="status"
                                aria-live="polite"
                                className={`copied ${copied === "rgb" ? "show" : ""}`}
                            >
                                Copied
                            </span>
                        </div>
                    </label>

                    <label>
                        <span>HSL</span>
                        <div className="with-btn">
                            <input
                                type="text"
                                value={hsl}
                                onChange={(e) => onHslChange(e.target.value)}
                                placeholder="hsl(210, 50%, 50%) or 210,50%,50%"
                            />
                            <button type="button" onClick={() => copy("hsl", hsl)}>Copy</button>
                            <span
                                role="status"
                                aria-live="polite"
                                className={`copied ${copied === "hsl" ? "show" : ""}`}
                            >
                                Copied
                            </span>
                        </div>
                    </label>

                    {error ? <p className="error">{error}</p> : null}
                </Styled.Fields>
            </Styled.Grid>
        </Styled.Wrapper>
    );
}

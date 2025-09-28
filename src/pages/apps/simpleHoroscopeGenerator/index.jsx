import React, { useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

const SIGNS = [
    { v: "aries", label: "Aries" },
    { v: "taurus", label: "Taurus" },
    { v: "gemini", label: "Gemini" },
    { v: "cancer", label: "Cancer" },
    { v: "leo", label: "Leo" },
    { v: "virgo", label: "Virgo" },
    { v: "libra", label: "Libra" },
    { v: "scorpio", label: "Scorpio" },
    { v: "sagittarius", label: "Sagittarius" },
    { v: "capricorn", label: "Capricorn" },
    { v: "aquarius", label: "Aquarius" },
    { v: "pisces", label: "Pisces" },
];

// deterministic RNG (seeded by sign+date)
function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    };
}
function mulberry32(a) {
    return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function formatDateISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function buildReading(sign, dateStr) {
    const seeds = xmur3(`${sign}|${dateStr}`)();
    const rand = mulberry32(seeds);

    const moods = [
        "grounded", "bold", "curious", "reflective", "optimistic", "patient",
        "adventurous", "sensitive", "confident", "balanced", "resourceful", "playful",
    ];
    const focuses = [
        "work", "relationships", "health", "learning", "money", "home",
        "creative projects", "travel plans", "habits", "networking",
    ];
    const nudges = [
        "start small and keep it simple",
        "ask for help instead of overthinking",
        "sleep on big decisions",
        "double-check the numbers",
        "write three bullets for tomorrow",
        "drink more water than usual",
        "block 30 minutes for deep work",
        "clean one small corner of your space",
        "skip the impulse buy",
        "trust a slower pace today",
    ];
    const colors = [
        "navy", "emerald", "gold", "crimson", "teal", "violet",
        "peach", "olive", "charcoal", "turquoise", "maroon", "indigo",
    ];

    const pick = (arr) => arr[Math.floor(rand() * arr.length)];
    const mood = pick(moods);
    const focus = pick(focuses);
    const nudge = pick(nudges);
    const color = pick(colors);
    const lucky = Math.max(1, Math.floor(rand() * 99));

    const lines = [
        `You might feel ${mood} today—use that energy to do one real thing in ${focus}.`,
        `Keep expectations light; momentum beats perfection. ${nudge}.`,
        `A quick check-in with yourself mid-day will keep you on track.`,
    ];

    return { mood, focus, nudge, color, lucky, lines };
}

export default function SimpleHoroscopeGenerator() {
    const [sign, setSign] = useState("aries");
    const [dateStr, setDateStr] = useState(() => formatDateISO(new Date()));
    const cardRef = useRef(null);

    const reading = useMemo(() => buildReading(sign, dateStr), [sign, dateStr]);

    function handleToday() {
        setDateStr(formatDateISO(new Date()));
    }

    // Print only the card, once. No iframe onload. No vw units.
    function handlePrintCard() {
        const { lines, color, lucky, mood, focus } = reading;
        const signLabel = SIGNS.find((s) => s.v === sign)?.label || sign;

        const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${signLabel} — ${dateStr}</title>
    <style>
      @page { margin: 0; }
      html, body { margin: 0; padding: 0; background: #fff; }
      .card {
        box-sizing: border-box;
        width: 100%;               /* fill printable width */
        max-width: 680px;          /* nice readable width */
        margin: 0 auto;
        padding: 24px;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji';
        color: #111;
      }
      .head { display:flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
      .title { font-weight: 700; font-size: 20px; }
      .date { font-size: 13px; color: #555; }
      .sep { height: 1px; background: #ddd; margin: 12px 0 14px; }
      .line { font-size: 14px; line-height: 1.6; margin: 6px 0; }
      .meta { margin-top: 14px; font-size: 13px; color: #333; display:flex; gap:16px; flex-wrap:wrap; }
      .badge { padding: 3px 8px; border: 1px solid #ccc; border-radius: 999px; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="head">
        <div class="title">${signLabel} — Horoscope</div>
        <div class="date">${dateStr}</div>
      </div>
      <div class="sep"></div>
      ${lines.map((t) => `<div class="line">${t}</div>`).join("")}
      <div class="meta">
        <div class="badge">Mood: ${mood}</div>
        <div class="badge">Focus: ${focus}</div>
        <div class="badge">Lucky Color: ${color}</div>
        <div class="badge">Lucky Number: ${lucky}</div>
      </div>
    </div>
    <script>
      window.onload = function () {
        window.focus();
        window.print();
      };
      window.onafterprint = function () {
        parent.postMessage({ type: "HR_PRINT_DONE" }, "*");
        setTimeout(() => window.close(), 0);
      };
    </script>
  </body>
</html>`;

        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        document.body.appendChild(iframe);

        // Listen for the "done" message to clean up
        const onMsg = (e) => {
            if (e && e.data && e.data.type === "HR_PRINT_DONE") {
                window.removeEventListener("message", onMsg);
                if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
            }
        };
        window.addEventListener("message", onMsg);

        // Write AFTER setting up the listener; no iframe.onload used
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();
    }

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div className="title">Simple Horoscope Generator</div>
                <div className="actions">
                    <select value={sign} onChange={(e) => setSign(e.target.value)} aria-label="Select sign">
                        {SIGNS.map((s) => (
                            <option key={s.v} value={s.v}>{s.label}</option>
                        ))}
                    </select>

                    <input
                        type="date"
                        value={dateStr}
                        onChange={(e) => setDateStr(e.target.value)}
                        aria-label="Pick date"
                    />

                    <button onClick={handleToday} title="Jump to today">Today</button>
                    <button onClick={handlePrintCard} title="Print only the card">Print Card</button>
                </div>
            </Styled.Header>

            <Styled.Body>
                <Styled.Card ref={cardRef}>
                    <div className="row head">
                        <div className="title">
                            {(SIGNS.find((s) => s.v === sign) || {}).label || sign} — Horoscope
                        </div>
                        <div className="date">{dateStr}</div>
                    </div>

                    <Styled.Separator />

                    <div className="lines">
                        {reading.lines.map((t, i) => (
                            <div key={i} className="line">{t}</div>
                        ))}
                    </div>

                    <Styled.Meta>
                        <span className="pill">Mood: {reading.mood}</span>
                        <span className="pill">Focus: {reading.focus}</span>
                        <span className="pill">Lucky Color: {reading.color}</span>
                        <span className="pill">Lucky Number: {reading.lucky}</span>
                    </Styled.Meta>
                </Styled.Card>
            </Styled.Body>
        </Styled.Wrapper>
    );
}

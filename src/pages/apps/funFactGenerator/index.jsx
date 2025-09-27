import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

const KEY_IDX = "ffg_idx";
const KEY_FAV = "ffg_favs";

// small fallback so UI works even if facts.txt fails to load
const FALLBACK = [
    "Sharks existed before trees.",
    "Octopuses have three hearts.",
    "Honey found in ancient tombs is still edible.",
    "A day on Venus is longer than its year.",
];

function parseFacts(raw) {
    return Array.from(
        new Set(
            raw
                .split("\n")
                .map((l) => l.trim())
                .filter((l) => l && !l.startsWith("#"))
        )
    );
}

export default function FunFactGenerator() {
    const [facts, setFacts] = useState(FALLBACK);

    // keep last seen index across refreshes (clamped later if list grows/shrinks)
    const [idx, setIdx] = useState(() => {
        const saved = parseInt(localStorage.getItem(KEY_IDX) || "0", 10);
        return Number.isNaN(saved) ? 0 : saved;
    });

    // favorites stored by fact text (robust if you reorder facts)
    const [favs, setFavs] = useState(() => {
        try {
            const raw = localStorage.getItem(KEY_FAV);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    // lazy-load your big list only when this page is visited
    useEffect(() => {
        let alive = true;
        import("./facts.txt?raw")
            .then((mod) => {
                if (!alive) return;
                const parsed = parseFacts(mod.default || "");
                if (parsed.length) setFacts(parsed);
            })
            .catch(() => {
                // keep FALLBACK silently
            });
        return () => {
            alive = false;
        };
    }, []);

    // clamp idx when facts length changes
    useEffect(() => {
        if (!facts.length) return;
        if (idx >= facts.length) setIdx(facts.length - 1);
        if (idx < 0) setIdx(0);
    }, [facts, idx]);

    useEffect(() => {
        localStorage.setItem(KEY_IDX, String(idx));
    }, [idx]);

    useEffect(() => {
        localStorage.setItem(KEY_FAV, JSON.stringify(favs));
    }, [favs]);

    const fact = facts[idx] || "";
    const isFav = useMemo(() => favs.includes(fact), [favs, fact]);

    const next = () => setIdx((n) => (facts.length ? (n + 1) % facts.length : 0));
    const prev = () => setIdx((n) => (facts.length ? (n - 1 + facts.length) % facts.length : 0));
    const random = () => {
        if (facts.length < 2) return;
        let r = Math.floor(Math.random() * facts.length);
        if (r === idx) r = (r + 1) % facts.length;
        setIdx(r);
    };

    const toggleFav = () => {
        if (!fact) return;
        setFavs((arr) => (arr.includes(fact) ? arr.filter((f) => f !== fact) : [...arr, fact]));
    };

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(fact);
        } catch {
            /* clipboard may be blocked; ignore */
        }
    };

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <h2>Fun-Fact Generator</h2>
                <span className="meta">
                    {facts.length ? idx + 1 : 0} / {facts.length}
                </span>
            </Styled.Header>

            <Styled.Card>
                <p className="fact" aria-live="polite">{fact}</p>
                <Styled.Controls>
                    <button onClick={prev} aria-label="Previous fact">Prev</button>
                    <button onClick={random} aria-label="Random fact">Random</button>
                    <button onClick={next} aria-label="Next fact">Next</button>
                    <button onClick={copy} aria-label="Copy fact">Copy</button>
                    <button
                        className={isFav ? "fav on" : "fav"}
                        onClick={toggleFav}
                        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                        title={isFav ? "Remove from favorites" : "Add to favorites"}
                    >
                        ★
                    </button>
                </Styled.Controls>
            </Styled.Card>

            {favs.length > 0 && (
                <Styled.Favs>
                    <div className="title">Favorites ({favs.length})</div>
                    <ul>
                        {favs.map((f) => (
                            <li key={f}>{f}</li>
                        ))}
                    </ul>
                </Styled.Favs>
            )}
        </Styled.Wrapper>
    );
}

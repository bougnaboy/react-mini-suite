import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

// LocalStorage key (kept short + readable)
const LS_KEY = "ctb.settings";

// Helper: compute next birthday (today → same year else next year)
// Also returns the age turning and the weekday for display.
function computeNextBirthday(dobStr) {
    if (!dobStr) return null;

    const now = new Date();
    const dob = new Date(dobStr); // from <input type="date"> → YYYY-MM-DD
    const month = dob.getMonth();
    const day = dob.getDate();

    // Create target as next occurrence
    let target = new Date(now.getFullYear(), month, day, 0, 0, 0, 0);

    if (target.getTime() <= now.getTime()) {
        target = new Date(now.getFullYear() + 1, month, day, 0, 0, 0, 0);
    }

    const ageTurning = target.getFullYear() - dob.getFullYear();
    const weekday = target.toLocaleDateString("en-IN", { weekday: "long" });

    return { target, ageTurning, weekday };
}

// Helper: break ms diff into parts
function splitDiff(ms) {
    if (ms < 0) ms = 0;
    const sec = Math.floor(ms / 1000);
    const days = Math.floor(sec / 86400);
    const hours = Math.floor((sec % 86400) / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    return { days, hours, minutes, seconds };
}

export default function CountdownToBirthday() {
    const [name, setName] = useState("");
    const [dob, setDob] = useState("");
    const [now, setNow] = useState(() => new Date());

    // Load saved settings once
    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (raw) {
                const saved = JSON.parse(raw);
                if (saved?.name) setName(saved.name);
                if (saved?.dob) setDob(saved.dob);
            }
        } catch { /* ignore */ }
    }, []);

    // Save on change
    useEffect(() => {
        const payload = JSON.stringify({ name, dob });
        localStorage.setItem(LS_KEY, payload);
    }, [name, dob]);

    // Tick every 1s
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const next = useMemo(() => computeNextBirthday(dob), [dob]);
    const diff = useMemo(() => {
        if (!next) return null;
        return splitDiff(next.target.getTime() - now.getTime());
    }, [next, now]);

    const prettyDate = (d) =>
        d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" });

    const resetAll = () => {
        setName("");
        setDob("");
        localStorage.removeItem(LS_KEY);
    };

    const title = name ? `Countdown To ${name}'s Birthday` : "Countdown To Birthday";

    return (
        <Styled.Wrapper>
            <header className="head">
                <h3>{title}</h3>
                <p className="muted">Set your DOB once. The timer keeps running on every open.</p>
            </header>

            <Styled.Card>
                <Styled.Row>
                    <label>
                        <span>Name (optional)</span>
                        <Styled.Input
                            type="text"
                            placeholder="e.g., Ashish"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </label>

                    <label>
                        <span>Date of Birth</span>
                        <Styled.Input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                        />
                    </label>

                    <div className="actions">
                        <Styled.Button type="button" onClick={resetAll} $tone="ghost">
                            Reset
                        </Styled.Button>
                    </div>
                </Styled.Row>

                {!dob && (
                    <Styled.Help>
                        Tip: only the month & day are used for the countdown. Year helps compute age turning.
                    </Styled.Help>
                )}
            </Styled.Card>

            {dob && next && diff && (
                <>
                    <Styled.Countdown>
                        <div className="block">
                            <strong>{String(diff.days).padStart(2, "0")}</strong>
                            <span>Days</span>
                        </div>
                        <span className="sep">:</span>
                        <div className="block">
                            <strong>{String(diff.hours).padStart(2, "0")}</strong>
                            <span>Hours</span>
                        </div>
                        <span className="sep">:</span>
                        <div className="block">
                            <strong>{String(diff.minutes).padStart(2, "0")}</strong>
                            <span>Minutes</span>
                        </div>
                        <span className="sep">:</span>
                        <div className="block">
                            <strong>{String(diff.seconds).padStart(2, "0")}</strong>
                            <span>Seconds</span>
                        </div>
                    </Styled.Countdown>

                    <Styled.Grid>
                        <Styled.Stat>
                            <span className="label">Next Birthday</span>
                            <span className="val">{prettyDate(next.target)}</span>
                        </Styled.Stat>
                        <Styled.Stat>
                            <span className="label">Weekday</span>
                            <span className="val">{next.weekday}</span>
                        </Styled.Stat>
                        <Styled.Stat>
                            <span className="label">Turning</span>
                            <span className="val">{next.ageTurning}</span>
                        </Styled.Stat>
                        <Styled.Stat>
                            <span className="label">Time Now</span>
                            <span className="val">{now.toLocaleTimeString("en-IN")}</span>
                        </Styled.Stat>
                    </Styled.Grid>
                </>
            )}

            {dob && !next && (
                <Styled.Help>Couldn't parse the date. Re-enter DOB.</Styled.Help>
            )}
        </Styled.Wrapper>
    );
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/* -------------------------
   Storage & helpers
------------------------- */
const STORAGE_KEY = "simpleTimer.v1";

const pad2 = (n) => String(Math.max(0, n | 0)).padStart(2, "0");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const formatTime = (totalSec) => {
    totalSec = Math.max(0, Math.floor(totalSec || 0));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return h > 0 ? `${pad2(h)}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
};

const safeGet = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
    } catch {
        return {};
    }
};

const safeSet = (obj) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch { }
};

/* Sound: tiny WebAudio beep */
let audioCtx = null;
const ensureAudio = () => {
    if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) audioCtx = new Ctx();
    }
};
const beepOnce = (ms = 220, freq = 880, type = "sine", gain = 0.08) => {
    try {
        ensureAudio();
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        g.gain.value = gain;
        osc.connect(g);
        g.connect(audioCtx.destination);
        osc.start();
        setTimeout(() => {
            osc.stop();
            osc.disconnect();
            g.disconnect();
        }, ms);
    } catch { }
};

const notify = async (title, body) => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") {
        new Notification(title, { body });
        return true;
    }
    if (Notification.permission === "default") {
        const res = await Notification.requestPermission();
        if (res === "granted") {
            new Notification(title, { body });
            return true;
        }
    }
    return false;
};

/* -------------------------
   Main
------------------------- */
export default function SimpleTimer() {
    // persisted
    const persisted = safeGet();

    // inputs
    const [label, setLabel] = useState(persisted.label ?? "");
    const [mm, setMm] = useState(persisted.mm ?? 5);
    const [ss, setSs] = useState(persisted.ss ?? 0);

    const [repeat, setRepeat] = useState(persisted.repeat ?? false);
    const [soundOn, setSoundOn] = useState(persisted.soundOn ?? true);
    const [notifyOn, setNotifyOn] = useState(persisted.notifyOn ?? false);

    // derive from inputs
    const initialTotal = useMemo(
        () => clamp((Number(mm) || 0) * 60 + (Number(ss) || 0), 0, 24 * 3600),
        [mm, ss]
    );

    // runtime state (can fall back to initialTotal)
    const [isRunning, setIsRunning] = useState(persisted.last?.isRunning ?? false);
    const [total, setTotal] = useState(persisted.last?.total ?? initialTotal);
    const [remaining, setRemaining] = useState(persisted.last?.remaining ?? initialTotal);
    const [endAt, setEndAt] = useState(persisted.last?.endAt ?? 0);

    // ✅ now it's safe to use initialTotal here
    const [baseTotal, setBaseTotal] = useState(
        persisted.last?.baseTotal ?? initialTotal
    );

    // compute delta AFTER total/baseTotal exist
    const delta = useMemo(
        () => (total || 0) - (baseTotal || 0),
        [total, baseTotal]
    );

    // confirm modal (for reset while running)
    const [confirm, setConfirm] = useState(null);
    const askConfirm = (opts) =>
        setConfirm({
            title: "Reset timer?",
            message: "This will stop and reset the countdown.",
            confirmText: "Reset",
            cancelText: "Cancel",
            tone: "danger",
            hideCancel: false,
            ...opts,
        });

    // persist on any change
    useEffect(() => {
        safeSet({
            label, mm, ss, repeat, soundOn, notifyOn,
            last: { isRunning, total, remaining, endAt, baseTotal },
        });
    }, [label, mm, ss, repeat, soundOn, notifyOn, isRunning, total, remaining, endAt, baseTotal]);


    // ✅ only recalc when inputs change (won't fire on pause)
    useEffect(() => {
        if (!isRunning) {
            const t = clamp((Number(mm) || 0) * 60 + (Number(ss) || 0), 0, 24 * 3600);
            setBaseTotal(t);  //  remember original for the next run
            setTotal(t);
            setRemaining(t);
        }
    }, [mm, ss]);

    // restore running timer across reloads
    useEffect(() => {
        if (isRunning && endAt > 0) {
            const left = Math.ceil((endAt - Date.now()) / 1000);
            setRemaining(Math.max(0, left));
            if (left <= 0) finish();
        }
    }, []); // run once

    // tick loop
    useEffect(() => {
        if (!isRunning) return;
        const id = setInterval(() => {
            const left = Math.ceil((endAt - Date.now()) / 1000);
            if (left <= 0) {
                clearInterval(id);
                finish();
            } else {
                setRemaining(left);
            }
        }, 200);
        return () => clearInterval(id);
    }, [isRunning, endAt]);

    // page title
    useEffect(() => {
        const base = "Timer";
        if (isRunning) {
            document.title = `${formatTime(remaining)} • ${label || base}`;
        } else {
            document.title = label ? `${label} • ${base}` : base;
        }
        return () => {
            document.title = base;
        };
    }, [isRunning, remaining, label]);

    const start = () => {
        const t = clamp((Number(mm) || 0) * 60 + (Number(ss) || 0), 0, 24 * 3600);
        if (!t) return;
        setBaseTotal(t);       // ← new
        setTotal(t);
        setRemaining(t);
        setEndAt(Date.now() + t * 1000);
        setIsRunning(true);
        ensureAudio();
    };

    const pause = () => {
        if (!isRunning) return;
        const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
        setRemaining(left);
        setIsRunning(false);
        setEndAt(0);
    };

    const resume = () => {
        if (isRunning || remaining <= 0) return;
        setEndAt(Date.now() + remaining * 1000);
        setIsRunning(true);
        ensureAudio();
    };

    const reset = () => {
        if (isRunning) {
            askConfirm({ onConfirm: hardReset });
        } else {
            hardReset();
        }
    };

    const hardReset = () => {
        const t = clamp((Number(mm) || 0) * 60 + (Number(ss) || 0), 0, 24 * 3600);
        setIsRunning(false);
        setEndAt(0);
        setBaseTotal(t);       // ← new
        setTotal(t);
        setRemaining(t);
        setConfirm(null);
    };

    const adjust = (deltaSec) => {
        const clampTotal = (t) => clamp(t, 0, 24 * 3600);

        if (isRunning) {
            // Shift end time AND update remaining/total immediately so the bar adjusts now.
            setEndAt((prev) => {
                const nextEnd = prev + deltaSec * 1000;
                const left = Math.max(0, Math.ceil((nextEnd - Date.now()) / 1000));
                setRemaining(left);

                setTotal((t) => {
                    const nt = clampTotal((t || 0) + deltaSec); // grow/shrink current cycle length
                    return Math.max(nt, left); // keep total >= remaining for sane % calc
                });

                if (left <= 0) {
                    // finish right away if we to/past zero
                    setTimeout(finish, 0);
                }
                return nextEnd;
            });
        } else {
            // Paused: nudge remaining; keep total at least remaining
            const next = clamp((remaining || 0) + deltaSec, 0, 24 * 3600);
            setRemaining(next);
            setTotal((t) => Math.max(t || 0, next));
        }
    };


    const pct = useMemo(() => {
        if (total <= 0) return 0;
        return Math.round(100 * (1 - (remaining || 0) / total));
    }, [remaining, total]);

    const endsAtText = useMemo(() => {
        if (!isRunning || !endAt) return "";
        const d = new Date(endAt);
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }, [isRunning, endAt]);

    async function finish() {
        setIsRunning(false);
        setRemaining(0);
        setEndAt(0);

        // alerts
        if (soundOn) {
            // 3 short beeps
            beepOnce(180, 880);
            setTimeout(() => beepOnce(180, 660), 220);
            setTimeout(() => beepOnce(220, 1100), 440);
        }
        if (notifyOn) {
            await notify(label || "Timer", "Time is up!");
        }

        // auto-repeat
        if (repeat) {
            const t = clamp((Number(mm) || 0) * 60 + (Number(ss) || 0), 0, 24 * 3600);
            if (t > 0) {
                setBaseTotal(t);     //  new (new cycle's original)
                setTotal(t);
                setRemaining(t);
                setEndAt(Date.now() + t * 1000);
                setIsRunning(true);
            }
        }
    }

    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        <Styled.Title>Simple Timer / Countdown</Styled.Title>
                        <Styled.Sub>
                            For cooking, workouts, or presentations — persists in LocalStorage.
                        </Styled.Sub>
                    </div>
                </Styled.Header>

                {/* Inputs */}
                <Styled.Card as="form" onSubmit={(e) => e.preventDefault()}>
                    <Styled.FormRow>
                        <Styled.Label title="Optional label for your timer">
                            <Styled.LabelText>Label</Styled.LabelText>
                            <Styled.Input
                                placeholder="e.g., Pasta, HIIT, Demo"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                aria-label="Timer label"
                            />
                        </Styled.Label>

                        <Styled.Label title="Minutes part of duration">
                            <Styled.LabelText>Minutes</Styled.LabelText>
                            <Styled.Input
                                type="number"
                                inputMode="numeric"
                                placeholder="0"
                                value={mm}
                                onChange={(e) => setMm(e.target.value.replace(/[^\d]/g, ""))}
                                aria-label="Minutes"
                            />
                        </Styled.Label>

                        <Styled.Label title="Seconds part of duration (0–59)">
                            <Styled.LabelText>Seconds</Styled.LabelText>
                            <Styled.Input
                                type="number"
                                inputMode="numeric"
                                placeholder="0"
                                value={ss}
                                onChange={(e) =>
                                    setSs(String(clamp(Number(e.target.value || 0), 0, 59)))
                                }
                                aria-label="Seconds"
                            />
                        </Styled.Label>

                        <Styled.RowWrap style={{ marginTop: 2 }}>
                            <Styled.PrimaryButton
                                type="button"
                                onClick={start}
                                disabled={isRunning || (Number(mm) || 0) * 60 + (Number(ss) || 0) <= 0}
                                title="Start the countdown"
                            >
                                ▶️ Start
                            </Styled.PrimaryButton>

                            {!isRunning ? (
                                <Styled.Button
                                    type="button"
                                    onClick={resume}
                                    disabled={isRunning || remaining <= 0}
                                    title="Resume"
                                >
                                    ⏯️ Resume
                                </Styled.Button>
                            ) : (
                                <Styled.Button type="button" onClick={pause} title="Pause">
                                    ⏸️ Pause
                                </Styled.Button>
                            )}

                            <Styled.Button type="button" onClick={reset} title="Reset to configured duration">
                                🔄 Reset
                            </Styled.Button>

                            <Styled.Button type="button" onClick={() => adjust(-10)} title="-10 seconds">
                                -10s
                            </Styled.Button>
                            <Styled.Button type="button" onClick={() => adjust(+10)} title="+10 seconds">
                                +10s
                            </Styled.Button>
                            <Styled.Button type="button" onClick={() => adjust(+60)} title="+1 minute">
                                +1m
                            </Styled.Button>
                        </Styled.RowWrap>
                    </Styled.FormRow>

                    <Styled.RowWrap style={{ marginTop: 10 }}>
                        <Styled.CheckboxRow title="Repeat timer when it finishes">
                            <input
                                type="checkbox"
                                checked={repeat}
                                onChange={(e) => setRepeat(e.target.checked)}
                                aria-label="Repeat"
                            />
                            Repeat
                        </Styled.CheckboxRow>

                        <Styled.CheckboxRow title="Play a short beep when time is up">
                            <input
                                type="checkbox"
                                checked={soundOn}
                                onChange={(e) => {
                                    setSoundOn(e.target.checked);
                                    if (e.target.checked) ensureAudio();
                                }}
                                aria-label="Sound alert"
                            />
                            Sound alert
                            <Styled.Button
                                type="button"
                                onClick={() => {
                                    ensureAudio();
                                    beepOnce();
                                }}
                                title="Test beep"
                                style={{ marginLeft: 6 }}
                            >
                                Test
                            </Styled.Button>
                        </Styled.CheckboxRow>

                        <Styled.CheckboxRow title="Show a desktop notification when time is up">
                            <input
                                type="checkbox"
                                checked={notifyOn}
                                onChange={async (e) => {
                                    const on = e.target.checked;
                                    if (on && "Notification" in window && Notification.permission !== "granted") {
                                        const res = await Notification.requestPermission();
                                        if (res !== "granted") return; // do not enable if denied
                                    }
                                    setNotifyOn(on);
                                }}
                                aria-label="Desktop notification"
                            />
                            Desktop notification
                        </Styled.CheckboxRow>
                    </Styled.RowWrap>
                </Styled.Card>

                {/* Big display */}
                <Styled.BigTimeCard aria-live="polite">
                    <Styled.BigTime>{formatTime(remaining)}</Styled.BigTime>
                    <Styled.ProgressWrap>
                        <Styled.ProgressTrack aria-hidden="true">
                            <Styled.ProgressFill $pct={pct} />
                        </Styled.ProgressTrack>
                    </Styled.ProgressWrap>

                    <Styled.MetaRow>
                        <Styled.Badge>#{label}</Styled.Badge> : <Styled.Badge $tone="muted">No label</Styled.Badge>}
                        <span>•</span>
                        <Styled.Badge>{isRunning ? "Running" : remaining > 0 ? "Paused" : "Finished"}</Styled.Badge>

                        {isRunning && endsAtText ? (
                            <>
                                <span>•</span>
                                <Styled.Badge>Ends at {endsAtText}</Styled.Badge>
                            </>
                        ) : null}

                        <span>•</span>
                        <Styled.Badge $tone="muted">Total {formatTime(total)}</Styled.Badge>

                        {delta !== 0 && (
                            <>
                                <span>•</span>
                                <Styled.Badge>Orig {formatTime(baseTotal)}</Styled.Badge>
                                <span>•</span>
                                <Styled.Badge $tone="muted">
                                    Δ {delta >= 0 ? "+" : "-"}{formatTime(Math.abs(delta))}
                                </Styled.Badge>
                            </>
                        )}
                    </Styled.MetaRow>

                </Styled.BigTimeCard>

                <Styled.FooterNote>
                    Data stays in your browser (LocalStorage). Works offline.
                </Styled.FooterNote>

                {/* Confirm Modal */}
                {confirm && (
                    <Styled.ModalOverlay onClick={() => setConfirm(null)}>
                        <Styled.ModalCard
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="confirm-title"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Styled.ModalTitle id="confirm-title">{confirm.title}</Styled.ModalTitle>
                            {confirm.message ? (
                                <Styled.ModalMessage>{confirm.message}</Styled.ModalMessage>
                            ) : null}
                            <Styled.ModalActions>
                                {!confirm.hideCancel && (
                                    <Styled.Button type="button" onClick={() => setConfirm(null)}>
                                        {confirm.cancelText || "Cancel"}
                                    </Styled.Button>
                                )}
                                <Styled.DangerButton type="button" onClick={confirm.onConfirm} autoFocus>
                                    {confirm.confirmText || "Confirm"}
                                </Styled.DangerButton>
                            </Styled.ModalActions>
                        </Styled.ModalCard>
                    </Styled.ModalOverlay>
                )}
            </Styled.Container>
        </Styled.Page>
    );
}

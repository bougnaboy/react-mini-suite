import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";
import { FaTrash, FaBroom, FaPlay, FaPause, FaHistory } from "react-icons/fa";

/* =========================================================
   Local storage keys (versioned)
   ========================================================= */
const LS_HISTORY = "coinFlipper_history_v1";
const LS_PREFS = "coinFlipper_prefs_v1";

/* =========================================================
   Helpers
   ========================================================= */
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

function rngFlip(pHeads) {
    return Math.random() < pHeads ? "H" : "T";
}

function formatISTLabel(iso) {
    try {
        const d = new Date(iso);
        const parts = new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
            timeZone: "Asia/Kolkata",
        }).formatToParts(d);
        const get = (t) => parts.find((p) => p.type === t)?.value || "";
        return `${get("month")} ${get("day")}, ${get("year")} ${get("hour")}:${get("minute")}:${get("second")} hrs`;
    } catch {
        return iso;
    }
}

function uid() {
    return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

/* =========================================================
   Core component
   ========================================================= */
const CoinFlipper = () => {
    /* ----------- prefs ------------- */
    const [prefs, setPrefs] = useState(() => {
        try {
            const v = JSON.parse(localStorage.getItem(LS_PREFS) || "null");
            return v ?? { pHeads: 50, batch: 10, autoRun: false, speed: 400 };
        } catch {
            return { pHeads: 50, batch: 10, autoRun: false, speed: 400 };
        }
    });

    /* ----------- history ----------- */
    const [history, setHistory] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(LS_HISTORY) || "[]");
        } catch {
            return [];
        }
    });

    /* ----------- UI states --------- */
    const [spinning, setSpinning] = useState(false);
    const [face, setFace] = useState("H");
    const [selectedIds, setSelectedIds] = useState({});
    const [modal, setModal] = useState({ open: false, title: "", message: "", onConfirm: null });
    const intervalRef = useRef(null);

    const p = clamp(Number(prefs.pHeads) || 0, 0, 100) / 100;
    const batchSize = clamp(Number(prefs.batch) || 1, 1, 500);

    /* ----------- effects ----------- */
    useEffect(() => {
        try { localStorage.setItem(LS_PREFS, JSON.stringify(prefs)); } catch { }
    }, [prefs]);

    useEffect(() => {
        try { localStorage.setItem(LS_HISTORY, JSON.stringify(history)); } catch { }
    }, [history]);

    useEffect(() => {
        if (prefs.autoRun) startAuto();
        return stopAuto;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ----------- stats ------------- */
    const stats = useMemo(() => {
        const total = history.length;
        let h = 0, t = 0;
        let currentStreak = { face: null, len: 0 };
        let longestStreak = { face: null, len: 0 };

        let runFace = null, runLen = 0;

        for (const item of history) {
            if (item.result === "H") h++; else t++;
            if (item.result === runFace) runLen++;
            else {
                if (runLen > (longestStreak.len || 0)) {
                    longestStreak = { face: runFace, len: runLen };
                }
                runFace = item.result; runLen = 1;
            }
        }
        if (runLen > (longestStreak.len || 0)) {
            longestStreak = { face: runFace, len: runLen };
        }
        currentStreak = { face: runFace, len: runLen || 0 };

        const hPct = total ? ((h / total) * 100).toFixed(2) : "0.00";
        const tPct = total ? ((t / total) * 100).toFixed(2) : "0.00";
        return { total, h, t, hPct, tPct, currentStreak, longestStreak };
    }, [history]);

    /* =========================================================
       Actions
       ========================================================= */
    function doFlipOnce(customP = p) {
        if (spinning) return;
        setSpinning(true);
        setTimeout(() => {
            const r = rngFlip(customP);
            setFace(r);
            setSpinning(false);
            setHistory((h) => [
                { id: uid(), result: r, weight: Math.round(customP * 100), ts: new Date().toISOString() },
                ...h,
            ]);
        }, 420);
    }

    function doFlipBatch() {
        const n = batchSize;
        const customP = p;
        if (!Number.isFinite(n) || n < 1) return;

        setSpinning(true);
        setTimeout(() => setSpinning(false), Math.min(600, n * 5 + 100));

        const rows = [];
        const batchId = uid();
        for (let i = 0; i < n; i++) {
            rows.push({
                id: uid(),
                result: rngFlip(customP),
                weight: Math.round(customP * 100),
                ts: new Date().toISOString(),
                batch: true,
                batchSize: n,
                batchId,
            });
        }
        setHistory((h) => [...rows.reverse(), ...h]);
    }

    function startAuto() {
        stopAuto();
        setPrefs((p0) => ({ ...p0, autoRun: true }));
        intervalRef.current = setInterval(() => {
            const rows = [];
            const n = Math.min(batchSize, 10);
            const batchId = "auto-" + uid();
            for (let i = 0; i < n; i++) {
                rows.push({
                    id: uid(),
                    result: rngFlip(p),
                    weight: Math.round(p * 100),
                    ts: new Date().toISOString(),
                    batch: true, batchSize: n, batchId,
                });
            }
            setFace(rows[0].result);
            setHistory((h) => [...rows.reverse(), ...h]);
        }, clamp(Number(prefs.speed) || 400, 100, 2000));
    }

    function stopAuto() {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setPrefs((p0) => ({ ...p0, autoRun: false }));
    }

    function toggleAuto() {
        if (prefs.autoRun) stopAuto();
        else startAuto();
    }

    function askClearAll() {
        setModal({
            open: true,
            title: "Clear all flips?",
            message: "This will remove the entire history. This action cannot be undone.",
            onConfirm: () => {
                setHistory([]);
                setSelectedIds({});
                setModal({ open: false });
            },
        });
    }

    function askDeleteSelected() {
        const picked = Object.keys(selectedIds).filter((k) => selectedIds[k]);
        if (picked.length === 0) return;
        setModal({
            open: true,
            title: `Delete ${picked.length} selected?`,
            message: "Only the selected rows will be removed from history.",
            onConfirm: () => {
                setHistory((h) => h.filter((r) => !picked.includes(r.id)));
                setSelectedIds({});
                setModal({ open: false });
            },
        });
    }

    function askRemoveOne(id) {
        setModal({
            open: true,
            title: "Remove this entry?",
            message: "This flip result will be permanently deleted from history.",
            onConfirm: () => {
                setHistory((h) => h.filter((r) => r.id !== id));
                setSelectedIds((s) => { const n = { ...s }; delete n[id]; return n; });
                setModal({ open: false });
            },
        });
    }

    function toggleSelectAll(e) {
        const checked = !!e.target.checked;
        if (!checked) return setSelectedIds({});
        const map = {};
        for (const row of history) map[row.id] = true;
        setSelectedIds(map);
    }

    function toggleRowSelect(id) {
        setSelectedIds((s) => ({ ...s, [id]: !s[id] }));
    }

    const hasSelection = Object.values(selectedIds).some(Boolean);

    /* =========================================================
       Render
       ========================================================= */
    return (
        <Styled.Wrapper>
            {/* Header */}
            <Styled.Header>
                <div>
                    <h1>Coin Flipper</h1>
                    <p>Weighted flips, batch simulation, streak stats, and a tidy history — all offline in your browser.</p>
                </div>
                <Styled.Badges>
                    <span className="badge">Weighted</span>
                    <span className="badge">Animated</span>
                    <span className="badge">Local-only</span>
                </Styled.Badges>
            </Styled.Header>

            <Styled.Layout>
                {/* LEFT: Coin + Controls */}
                <Styled.Left>
                    <Styled.Card>
                        <Styled.CoinBox>
                            <Styled.Coin className={spinning ? "spin" : ""} data-face={face}>
                                <div className="face front">H</div>
                                <div className="face back">T</div>
                            </Styled.Coin>
                        </Styled.CoinBox>

                        <Styled.Controls>
                            <div className="row">
                                <button onClick={() => doFlipOnce()} disabled={spinning}>Flip once</button>
                                <button className="ghost" onClick={doFlipBatch} disabled={spinning}>
                                    Flip × {batchSize}
                                </button>
                                <button onClick={toggleAuto} className={prefs.autoRun ? "danger" : ""}>
                                    {prefs.autoRun ? <><FaPause /> Stop Auto</> : <><FaPlay /> Start Auto</>}
                                </button>
                            </div>

                            <div className="grid">
                                <label className="field">
                                    <div className="lab">Heads probability</div>
                                    <div className="inline">
                                        <input
                                            type="range" min={0} max={100}
                                            value={prefs.pHeads}
                                            onChange={(e) => setPrefs((p0) => ({ ...p0, pHeads: clamp(+e.target.value, 0, 100) }))}
                                        />
                                        <span className="mono">{prefs.pHeads}%</span>
                                    </div>
                                </label>

                                <label className="field">
                                    <div className="lab">Batch size (max 500)</div>
                                    <input
                                        type="number" min={1} max={500}
                                        value={batchSize}
                                        onChange={(e) => setPrefs((p0) => ({ ...p0, batch: clamp(+e.target.value || 1, 1, 500) }))}
                                    />
                                </label>

                                <label className="field">
                                    <div className="lab">Auto speed (ms)</div>
                                    <input
                                        type="number" min={100} max={2000} step={50}
                                        value={prefs.speed}
                                        onChange={(e) => setPrefs((p0) => ({ ...p0, speed: clamp(+e.target.value || 400, 100, 2000) }))}
                                    />
                                </label>
                            </div>
                        </Styled.Controls>
                    </Styled.Card>
                </Styled.Left>

                {/* RIGHT: Stats + History */}
                <Styled.Right>
                    <Styled.Card>
                        <h3>Stats</h3>
                        <Styled.Stats>
                            <div className="item">
                                <div className="k">Total</div>
                                <div className="v">{stats.total}</div>
                            </div>
                            <div className="item">
                                <div className="k">Heads</div>
                                <div className="v">{stats.h} <span className="muted">({stats.hPct}%)</span></div>
                            </div>
                            <div className="item">
                                <div className="k">Tails</div>
                                <div className="v">{stats.t} <span className="muted">({stats.tPct}%)</span></div>
                            </div>
                            <div className="item">
                                <div className="k">Current Streak</div>
                                <div className="v">{stats.currentStreak.face || "-"} <span className="muted">× {stats.currentStreak.len || 0}</span></div>
                            </div>
                            <div className="item">
                                <div className="k">Longest Streak</div>
                                <div className="v">{stats.longestStreak.face || "-"} <span className="muted">× {stats.longestStreak.len || 0}</span></div>
                            </div>
                        </Styled.Stats>
                    </Styled.Card>

                    <Styled.Card>
                        <Styled.HdrRow>
                            <h3><FaHistory /> History</h3>

                            <div className="row-right">
                                <label className="chk">
                                    <input
                                        type="checkbox"
                                        onChange={toggleSelectAll}
                                        checked={history.length > 0 && Object.keys(selectedIds).length === history.length}
                                    />
                                    <span>Select all</span>
                                </label>

                                <button className="ghost" onClick={askDeleteSelected} disabled={!hasSelection}>
                                    <FaTrash /> Delete Selected
                                </button>
                                <button className="danger" onClick={askClearAll} disabled={history.length === 0}>
                                    <FaBroom /> Clear All
                                </button>
                            </div>
                        </Styled.HdrRow>

                        {history.length === 0 ? (
                            <Styled.Empty>No flips yet. Hit <strong>Flip once</strong> or run a batch.</Styled.Empty>
                        ) : (
                            <Styled.Table role="table" aria-label="Flip history">
                                <div className="thead" role="rowgroup">
                                    <div className="tr" role="row">
                                        <div className="th cbox" role="columnheader" />
                                        <div className="th" role="columnheader">Result</div>
                                        <div className="th" role="columnheader">Weight</div>
                                        <div className="th" role="columnheader">When</div>
                                        <div className="th" role="columnheader">Batch</div>
                                        <div className="th right" role="columnheader">Actions</div>
                                    </div>
                                </div>
                                <div className="tbody" role="rowgroup">
                                    {history.map((row) => (
                                        <div className="tr" role="row" key={row.id}>
                                            <div className="td cbox" role="cell">
                                                <input
                                                    type="checkbox"
                                                    checked={!!selectedIds[row.id]}
                                                    onChange={() => toggleRowSelect(row.id)}
                                                />
                                            </div>
                                            <div className="td" role="cell">
                                                <span className={`pill ${row.result === "H" ? "green" : "blue"}`}>
                                                    {row.result === "H" ? "Heads" : "Tails"}
                                                </span>
                                            </div>
                                            <div className="td" role="cell">{row.weight}%</div>
                                            <div className="td" role="cell">{formatISTLabel(row.ts)}</div>
                                            <div className="td" role="cell">
                                                {row.batch ? `Yes (${row.batchSize})` : "No"}
                                            </div>
                                            <div className="td right" role="cell">
                                                <button className="icon danger" title="Remove this entry" onClick={() => askRemoveOne(row.id)}>
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Styled.Table>
                        )}
                    </Styled.Card>
                </Styled.Right>
            </Styled.Layout>

            {/* Confirm Modal */}
            {modal.open && (
                <Styled.ModalBackdrop onClick={() => setModal({ open: false })}>
                    <Styled.Modal onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                        <h3>{modal.title}</h3>
                        <p className="muted">{modal.message}</p>
                        <div className="actions">
                            <button className="ghost" onClick={() => setModal({ open: false })}>Cancel</button>
                            <button
                                className="danger"
                                onClick={() => {
                                    try { modal.onConfirm?.(); } finally { /* closed in handlers */ }
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </Styled.Modal>
                </Styled.ModalBackdrop>
            )}
        </Styled.Wrapper>
    );
};

export default CoinFlipper;

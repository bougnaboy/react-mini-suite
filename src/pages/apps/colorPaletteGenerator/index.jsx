import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

/**
 * Color-Palette-Generator
 * - Randomize, lock, tweak, copy, and save palettes (localStorage)
 * - Now includes a custom confirm dialog before delete
 */

const DEFAULT_SWATCHES = 5;
const STORAGE_LAST = "cpg:last";
const STORAGE_SAVED = "cpg:saved";

const randByte = () => Math.floor(Math.random() * 256);
const toHex = (n) => n.toString(16).padStart(2, "0").toUpperCase();
const randomHex = () => `#${toHex(randByte())}${toHex(randByte())}${toHex(randByte())}`;

function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return { r: 0, g: 0, b: 0 };
    return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function luminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const srgb = [r, g, b].map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}
const textOn = (hex) => (luminance(hex) > 0.5 ? "#111" : "#fff");

const sanitizeHex = (value) => {
    if (!value) return "";
    let v = value.trim().toUpperCase();
    if (!v.startsWith("#")) v = "#" + v;
    if (/^#[0-9A-F]{6}$/.test(v)) return v;
    return "";
};

const emptyPalette = (n = DEFAULT_SWATCHES) =>
    Array.from({ length: n }, () => ({ hex: randomHex(), locked: false }));

export default function ColorPaletteGenerator() {
    const [swatches, setSwatches] = useState(() => {
        try {
            const last = JSON.parse(localStorage.getItem(STORAGE_LAST) || "null");
            return Array.isArray(last) && last.length ? last : emptyPalette();
        } catch {
            return emptyPalette();
        }
    });
    const [copied, setCopied] = useState("");
    const [saveName, setSaveName] = useState("");
    const [saved, setSaved] = useState(() => {
        try {
            const list = JSON.parse(localStorage.getItem(STORAGE_SAVED) || "[]");
            return Array.isArray(list) ? list : [];
        } catch {
            return [];
        }
    });

    // ❗ Confirm dialog state (holds the record to delete)
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_LAST, JSON.stringify(swatches));
    }, [swatches]);

    const canRemove = swatches.length > 3;
    const canAdd = swatches.length < 8;

    const lockedCount = useMemo(() => swatches.filter((s) => s.locked).length, [swatches]);

    const shuffle = () => {
        setSwatches((prev) => prev.map((s) => (s.locked ? s : { ...s, hex: randomHex() })));
    };

    const toggleLock = (idx) => {
        setSwatches((prev) => prev.map((s, i) => (i === idx ? { ...s, locked: !s.locked } : s)));
    };

    const updateHex = (idx, nextHex) => {
        const clean = sanitizeHex(nextHex);
        if (!clean) return;
        setSwatches((prev) => prev.map((s, i) => (i === idx ? { ...s, hex: clean } : s)));
    };

    const setFromColorInput = (idx, value) => {
        setSwatches((prev) => prev.map((s, i) => (i === idx ? { ...s, hex: value.toUpperCase() } : s)));
    };

    const copyHex = async (hex) => {
        try {
            await navigator.clipboard.writeText(hex);
            setCopied(hex);
            setTimeout(() => setCopied(""), 800);
        } catch {
            /* no-op */
        }
    };

    const addSwatch = () => {
        if (!canAdd) return;
        setSwatches((prev) => [...prev, { hex: randomHex(), locked: false }]);
    };

    const removeSwatch = () => {
        if (!canRemove) return;
        setSwatches((prev) => prev.slice(0, -1));
    };

    const clearLocks = () => {
        setSwatches((prev) => prev.map((s) => ({ ...s, locked: false })));
    };

    const savePalette = () => {
        const name = saveName.trim() || `Palette ${new Date().toLocaleString()}`;
        const record = { id: crypto.randomUUID(), name, swatches };
        const next = [record, ...saved].slice(0, 50);
        setSaved(next);
        localStorage.setItem(STORAGE_SAVED, JSON.stringify(next));
        setSaveName("");
    };

    const loadPalette = (record) => {
        if (!record?.swatches?.length) return;
        setSwatches(record.swatches);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const deletePalette = (id) => {
        const next = saved.filter((p) => p.id !== id);
        setSaved(next);
        localStorage.setItem(STORAGE_SAVED, JSON.stringify(next));
    };

    // Handlers for confirm dialog
    const handleAskDelete = (record) => setConfirmDelete(record);
    const handleCancelDelete = () => setConfirmDelete(null);
    const handleConfirmDelete = () => {
        if (confirmDelete?.id) deletePalette(confirmDelete.id);
        setConfirmDelete(null);
    };

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <h2>Color Palette Generator</h2>
                <p className="sub">Randomize, lock, tweak, and save palettes. Clean, offline, and fast.</p>
                <Styled.Controls>
                    <button onClick={shuffle} title="Shuffle (keeps locked)">Shuffle</button>
                    <button onClick={clearLocks} title="Unlock all">Unlock all</button>
                    <span className="spacer" />
                    <button onClick={addSwatch} disabled={!canAdd} title="Add swatch">+ Add</button>
                    <button onClick={removeSwatch} disabled={!canRemove} title="Remove last">− Remove</button>
                    <span className="meta">{swatches.length} swatches • {lockedCount} locked</span>
                </Styled.Controls>
            </Styled.Header>

            <Styled.Strip>
                {swatches.map((s, idx) => {
                    const hex = s.hex;
                    const textColor = textOn(hex);
                    const isCopied = copied === hex;
                    return (
                        <Styled.Swatch key={idx} $bg={hex} $locked={s.locked}>
                            <div className="top">
                                <span className="chip" style={{ color: textColor }}>{s.locked ? "Locked" : "Free"}</span>
                                <input
                                    aria-label="Pick color"
                                    type="color"
                                    value={hex}
                                    onChange={(e) => setFromColorInput(idx, e.target.value)}
                                />
                            </div>

                            <div className="mid">
                                <input
                                    className="hex"
                                    value={hex}
                                    onChange={(e) => updateHex(idx, e.target.value)}
                                    style={{ color: textColor }}
                                />
                            </div>

                            <div className="bottom">
                                <button className="ghost" onClick={() => toggleLock(idx)}>
                                    {s.locked ? "Unlock" : "Lock"}
                                </button>
                                <button className="ghost" onClick={() => copyHex(hex)}>
                                    {isCopied ? "Copied" : "Copy"}
                                </button>
                            </div>
                        </Styled.Swatch>
                    );
                })}
            </Styled.Strip>

            <Styled.SaveBar>
                <input
                    placeholder="Save as (optional name)"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                />
                <button onClick={savePalette}>Save Palette</button>
            </Styled.SaveBar>

            {saved.length > 0 && (
                <Styled.SavedSection>
                    <h3>Saved Palettes</h3>
                    <div className="grid">
                        {saved.map((rec) => (
                            <div key={rec.id} className="card">
                                <div className="row">
                                    {rec.swatches.map((s, i) => (
                                        <span key={i} style={{ background: s.hex }} className="mini" title={s.hex} />
                                    ))}
                                </div>
                                <div className="meta">
                                    <strong>{rec.name}</strong>
                                    <div className="actions">
                                        <button onClick={() => loadPalette(rec)}>Load</button>
                                        <button className="danger" onClick={() => handleAskDelete(rec)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Styled.SavedSection>
            )}

            {/* Inline confirm dialog (no portals, no alerts) */}
            {confirmDelete && (
                <Styled.ModalBackdrop onClick={handleCancelDelete}>
                    <Styled.ModalCard onClick={(e) => e.stopPropagation()}>
                        <h4>Delete this palette?</h4>
                        <p className="muted">“{confirmDelete.name}” will be permanently removed.</p>

                        <div className="preview">
                            {confirmDelete.swatches.map((s, i) => (
                                <span key={i} className="mini" style={{ background: s.hex }} title={s.hex} />
                            ))}
                        </div>

                        <div className="actions">
                            <button onClick={handleCancelDelete}>Cancel</button>
                            <button className="danger" onClick={handleConfirmDelete}>Delete</button>
                        </div>
                    </Styled.ModalCard>
                </Styled.ModalBackdrop>
            )}
        </Styled.Wrapper>
    );
}

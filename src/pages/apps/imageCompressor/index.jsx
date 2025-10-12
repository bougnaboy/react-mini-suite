import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";
import { toast } from "react-toastify";

/* --------------------------------------------
   Small utils
--------------------------------------------- */
const bytes = (n) => {
    if (!n && n !== 0) return "";
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(2)} MB`;
};

const idgen = (() => {
    let i = 0;
    return () => `img_${Date.now()}_${i++}`;
})();

const QUALITY_MIN = 10;  // to avoid 0 producing weird encodes
const QUALITY_MAX = 100;

const DEFAULTS = {
    quality: 80,
    format: "image/webp", // image/webp or image/jpeg
    maxEdge: 0,           // 0 = no resize; else limit longest edge (px)
    fillTransparentWithWhite: true, // for JPEG only
};

const SETTINGS_KEY = "imageCompressor_settings_v1";

/* Load/save settings */
function loadSettings() {
    try {
        const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
        if (!s) return DEFAULTS;
        return { ...DEFAULTS, ...s };
    } catch {
        return DEFAULTS;
    }
}
function saveSettings(s) {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { }
}

/* Read dimensions of an image file */
async function readImageDimensions(file) {
    try {
        if ("createImageBitmap" in window) {
            const bmp = await createImageBitmap(file);
            const w = bmp.width, h = bmp.height;
            bmp.close?.();
            return { width: w, height: h };
        }
    } catch { }
    const url = URL.createObjectURL(file);
    const dims = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
        };
        img.onerror = reject;
        img.src = url;
    });
    URL.revokeObjectURL(url);
    return dims;
}

/* Compute target size based on maxEdge */
function targetSize(width, height, maxEdge) {
    if (!maxEdge || maxEdge <= 0) return { tw: width, th: height, scale: 1 };
    const long = Math.max(width, height);
    if (long <= maxEdge) return { tw: width, th: height, scale: 1 };
    const scale = maxEdge / long;
    return { tw: Math.round(width * scale), th: Math.round(height * scale), scale };
}

/* Draw and compress to blob */
async function compressFile({
    file, dims, qualityPct, format, maxEdge, fillTransparentWithWhite
}) {
    const { width, height } = dims || (await readImageDimensions(file));
    const { tw, th } = targetSize(width, height, maxEdge);

    const srcUrl = URL.createObjectURL(file);
    const img = await new Promise((resolve, reject) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = reject;
        im.src = srcUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = tw; canvas.height = th;
    const ctx = canvas.getContext("2d");

    if (format === "image/jpeg" && fillTransparentWithWhite) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, tw, th);
    }
    ctx.drawImage(img, 0, 0, tw, th);

    const quality = Math.max(QUALITY_MIN, Math.min(QUALITY_MAX, qualityPct)) / 100;

    const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encode failed"))), format, quality);
    });

    URL.revokeObjectURL(srcUrl);
    return { blob, outWidth: tw, outHeight: th };
}

/* --------------------------------------------
   Component
--------------------------------------------- */
const ImageCompressor = () => {
    const fileInputRef = useRef(null);
    const dropRef = useRef(null);

    const [settings, setSettings] = useState(loadSettings);
    const [items, setItems] = useState([]); // {id, file, name, type, size, width, height, src, compressed?, status, err?}
    const [dragOver, setDragOver] = useState(false);

    useEffect(() => { saveSettings(settings); }, [settings]);

    const totalOriginal = useMemo(() => items.reduce((a, b) => a + (b.size || 0), 0), [items]);
    const totalCompressed = useMemo(
        () => items.reduce((a, b) => a + (b.compressed?.size || 0), 0),
        [items]
    );

    /* --------- File adders ---------- */
    const addFiles = async (fileList) => {
        const files = Array.from(fileList || []).filter(f => f.type.startsWith("image/"));
        if (!files.length) {
            toast?.error?.("Only image files are allowed.");
            return;
        }

        const newEntries = [];
        for (const file of files) {
            const dims = await readImageDimensions(file).catch(() => ({ width: 0, height: 0 }));
            const id = idgen();
            const src = URL.createObjectURL(file);
            newEntries.push({
                id,
                file,
                name: file.name,
                type: file.type,
                size: file.size,
                width: dims.width, height: dims.height,
                src,
                compressed: null,
                status: "idle",
            });
        }
        setItems(prev => [...prev, ...newEntries]);
        toast?.info?.(`${newEntries.length} image(s) added`);
    };

    const onFileChange = (e) => addFiles(e.target.files);

    /* --------- Drag & Drop ---------- */
    useEffect(() => {
        const el = dropRef.current;
        if (!el) return;

        const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
        const onDragLeave = () => setDragOver(false);
        const onDrop = (e) => {
            e.preventDefault();
            setDragOver(false);
            addFiles(e.dataTransfer.files);
        };

        el.addEventListener("dragover", onDragOver);
        el.addEventListener("dragleave", onDragLeave);
        el.addEventListener("drop", onDrop);
        return () => {
            el.removeEventListener("dragover", onDragOver);
            el.removeEventListener("dragleave", onDragLeave);
            el.removeEventListener("drop", onDrop);
        };
    }, []);

    /* --------- Confirm Modal ---------- */
    const [confirm, setConfirm] = useState({ open: false, title: "", message: "", onYes: null });
    const ask = (title, message, onYes) => setConfirm({ open: true, title, message, onYes });
    const closeConfirm = () => setConfirm({ open: false, title: "", message: "", onYes: null });

    // Body scroll lock + Esc/Enter keys while modal is open
    useEffect(() => {
        if (!confirm.open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKey = (e) => {
            if (e.key === "Escape") { e.preventDefault(); closeConfirm(); }
            if (e.key === "Enter") { e.preventDefault(); confirm.onYes?.(); }
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [confirm.open]); // eslint-disable-line react-hooks/exhaustive-deps

    /* --------- Remove / Clear ---------- */
    const removeOne = (id) => {
        const it = items.find(x => x.id === id);
        ask("Remove Image?", `Remove "${it?.name}" from the list?`, () => {
            setItems(prev => {
                const n = prev.filter(x => x.id !== id);
                if (it?.src) URL.revokeObjectURL(it.src);
                if (it?.compressed?.url) URL.revokeObjectURL(it.compressed.url);
                return n;
            });
            closeConfirm();
        });
    };

    const clearAll = () => {
        if (!items.length) { toast?.info?.("Nothing to clear."); return; }
        ask("Clear All?", "Remove all images from the list?", () => {
            setItems(prev => {
                prev.forEach(it => {
                    if (it.src) URL.revokeObjectURL(it.src);
                    if (it.compressed?.url) URL.revokeObjectURL(it.compressed.url);
                });
                return [];
            });
            closeConfirm();
        });
    };

    const resetSettings = () => {
        ask("Reset Settings?", "Quality, format and resize will be reset to defaults.", () => {
            setSettings(DEFAULTS);
            closeConfirm();
            toast?.success?.("Settings reset");
        });
    };

    /* --------- Compression ---------- */
    const doCompress = async (id) => {
        setItems(prev => prev.map(x => x.id === id ? { ...x, status: "compressing", err: "" } : x));
        const it = items.find(x => x.id === id);
        if (!it) return;

        try {
            const { blob, outWidth, outHeight } = await compressFile({
                file: it.file,
                dims: { width: it.width, height: it.height },
                qualityPct: settings.quality,
                format: settings.format,
                maxEdge: settings.maxEdge,
                fillTransparentWithWhite: settings.fillTransparentWithWhite,
            });

            const url = URL.createObjectURL(blob);
            setItems(prev => prev.map(x => x.id === id
                ? { ...x, status: "done", compressed: { blob, url, type: settings.format, size: blob.size, width: outWidth, height: outHeight } }
                : x
            ));
            toast?.success?.(`Compressed: ${it.name}`);
        } catch (err) {
            setItems(prev => prev.map(x => x.id === id ? { ...x, status: "error", err: String(err.message || err) } : x));
            toast?.error?.(`Failed: ${it.name}`);
        }
    };

    const compressAll = async () => {
        if (!items.length) { toast?.error?.("Add images first."); return; }
        for (const it of items) {
            // eslint-disable-next-line no-await-in-loop
            await doCompress(it.id);
        }
    };

    /* --------- Download ---------- */
    const downloadOne = async (id) => {
        const it = items.find(x => x.id === id);
        if (!it) return;
        if (!it.compressed) {
            await doCompress(id);
        }
        const comp = items.find(x => x.id === id)?.compressed;
        if (!comp) return;

        const base = it.name.replace(/\.[^.]+$/, "");
        const ext = settings.format === "image/webp" ? "webp" : "jpg";
        const suffixParts = [`q${settings.quality}`];
        if (settings.maxEdge > 0) suffixParts.push(`max${settings.maxEdge}`);
        const outName = `${base}-${suffixParts.join("-")}.${ext}`;

        const a = document.createElement("a");
        a.href = comp.url;
        a.download = outName;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    const downloadAll = async () => {
        if (!items.length) { toast?.info?.("Nothing to download."); return; }
        for (const it of items) {
            // eslint-disable-next-line no-await-in-loop
            await downloadOne(it.id);
            // eslint-disable-next-line no-await-in-loop
            await new Promise(r => setTimeout(r, 120));
        }
    };

    /* --------- UI Handlers ---------- */
    const onQualityChange = (e) => setSettings(s => ({ ...s, quality: Number(e.target.value) }));
    const onFormatChange = (e) => setSettings(s => ({ ...s, format: e.target.value }));
    const onMaxEdgeChange = (e) => setSettings(s => ({ ...s, maxEdge: Math.max(0, Number(e.target.value)) }));
    const onFillChange = (e) => setSettings(s => ({ ...s, fillTransparentWithWhite: !!e.target.checked }));

    /* --------- Render ---------- */
    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div>
                    <h1>Image Compressor</h1>
                    <p>Upload images, set quality, optionally resize, and download compressed copies.</p>
                </div>
                <Styled.Totals>
                    <span className="pill">Original: {bytes(totalOriginal)}</span>
                    <span className="pill">Compressed: {totalCompressed ? bytes(totalCompressed) : "—"}</span>
                </Styled.Totals>
            </Styled.Header>

            <Styled.Layout>
                {/* LEFT: Uploader + List */}
                <div className="left">
                    <Styled.Card>
                        <Styled.Uploader ref={dropRef} dragOver={dragOver}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={onFileChange}
                            />
                            <div className="area">
                                <div className="icon" aria-hidden>🖼️</div>
                                <div className="text">
                                    <strong>Drag & drop</strong> images here or
                                    <button type="button" className="link" onClick={() => fileInputRef.current?.click()}>
                                        browse
                                    </button>
                                </div>
                                <div className="hint">PNG, JPG, JPEG, WEBP…</div>
                            </div>
                        </Styled.Uploader>

                        <Styled.Actions>
                            <button type="button" onClick={compressAll} disabled={!items.length}>Compress All</button>
                            <button type="button" onClick={downloadAll} disabled={!items.some(i => i.compressed)}>Download All</button>
                            <div className="spacer" />
                            <button type="button" className="ghost danger" onClick={clearAll} disabled={!items.length}>Clear All</button>
                        </Styled.Actions>
                    </Styled.Card>

                    <Styled.List>
                        {items.map(it => (
                            <Styled.Item key={it.id} status={it.status}>
                                <div className="thumb">
                                    <img src={it.src} alt={it.name} />
                                </div>
                                <div className="meta">
                                    <div className="title" title={it.name}>{it.name}</div>
                                    <div className="sub">
                                        <span>{it.width}×{it.height}px</span>
                                        <span>•</span>
                                        <span>{bytes(it.size)}</span>
                                        <span>•</span>
                                        <span>{it.type || "image"}</span>
                                    </div>

                                    {it.compressed && (
                                        <div className="comp">
                                            <span className="badge">→ {it.compressed.width}×{it.compressed.height}px</span>
                                            <span className="badge">{bytes(it.compressed.size)}</span>
                                            <span className="badge">{settings.format === "image/webp" ? "WEBP" : "JPEG"}</span>
                                        </div>
                                    )}

                                    {it.err && <div className="err">{it.err}</div>}
                                </div>

                                <div className="right">
                                    <button type="button" onClick={() => doCompress(it.id)} disabled={it.status === "compressing"}>
                                        {it.status === "compressing" ? "Compressing…" : "Compress"}
                                    </button>
                                    <button
                                        type="button"
                                        className="ghost"
                                        onClick={() => downloadOne(it.id)}
                                        disabled={!it.compressed || it.status === "compressing"}
                                    >
                                        Download
                                    </button>
                                    <button
                                        type="button"
                                        className="ghost danger"
                                        onClick={() => removeOne(it.id)}
                                        disabled={it.status === "compressing"}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </Styled.Item>
                        ))}

                        {!items.length && (
                            <Styled.Empty>
                                <p>No images yet. Add some using the box above.</p>
                            </Styled.Empty>
                        )}
                    </Styled.List>
                </div>

                {/* RIGHT: Settings + Help */}
                <div className="right">
                    <Styled.Card>
                        <h3>Compression Settings</h3>
                        <Styled.Field>
                            <label htmlFor="quality">Quality: <strong>{settings.quality}</strong></label>
                            <input
                                id="quality" type="range"
                                min={QUALITY_MIN} max={QUALITY_MAX} step={1}
                                value={settings.quality} onChange={onQualityChange}
                            />
                            <div className="hint">Higher = better quality & larger size. Lower = more compression.</div>
                        </Styled.Field>

                        <Styled.Field>
                            <label htmlFor="format">Output Format</label>
                            <select id="format" value={settings.format} onChange={onFormatChange}>
                                <option value="image/webp">WEBP (usually smaller)</option>
                                <option value="image/jpeg">JPEG</option>
                            </select>
                        </Styled.Field>

                        <Styled.Field>
                            <label htmlFor="maxEdge">Resize (Max long edge)</label>
                            <input
                                id="maxEdge" type="number" min={0} step={10}
                                value={settings.maxEdge} onChange={onMaxEdgeChange}
                            />
                            <div className="hint">0 keeps original size. Otherwise longest side is limited to this many pixels.</div>
                        </Styled.Field>

                        {settings.format === "image/jpeg" && (
                            <Styled.Field className="inline">
                                <label className="checkbox">
                                    <input type="checkbox" checked={settings.fillTransparentWithWhite} onChange={onFillChange} />
                                    <span>Fill transparent areas with white (JPEG)</span>
                                </label>
                            </Styled.Field>
                        )}

                        <Styled.Actions>
                            <button type="button" className="ghost" onClick={resetSettings}>Reset Settings</button>
                        </Styled.Actions>
                    </Styled.Card>

                    <Styled.Card>
                        <h3>Notes</h3>
                        <ul className="notes">
                            <li>Canvas re-encode strips metadata (EXIF). That’s normal in browsers.</li>
                            <li>WEBP generally gives better size than JPEG for the same visual quality.</li>
                            <li>For PNGs with transparency → prefer WEBP; JPEG adds white by default (configurable).</li>
                        </ul>
                    </Styled.Card>
                </div>
            </Styled.Layout>

            {/* Confirm Modal */}
            {confirm.open && (
                <Styled.Modal role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc">
                    <div className="overlay" onClick={closeConfirm} />
                    <div className="sheet">
                        <h4 id="confirm-title">{confirm.title}</h4>
                        <p id="confirm-desc">{confirm.message}</p>
                        <div className="row">
                            <button
                                type="button"
                                className="primary"
                                autoFocus
                                onClick={() => { confirm.onYes?.(); }}
                            >
                                Yes
                            </button>
                            <button type="button" className="ghost" onClick={closeConfirm}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </Styled.Modal>
            )}
        </Styled.Wrapper>
    );
};

export default ImageCompressor;

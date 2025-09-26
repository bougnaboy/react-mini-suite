import React, { useMemo, useState } from "react";
import { Styled } from "./styled";

/**
 * Seeded RNG (deterministic) - keeps the same blob for the same seed.
 * Mulberry32: tiny, fast, good enough for UI randomness.
 */
function mulberry32(seed) {
    let t = seed >>> 0;
    return function () {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

function makeBlobPath({ seed, points, irregularity, smoothness, size }) {
    const rand = mulberry32(seed);
    const cx = size / 2;
    const cy = size / 2;
    const baseR = size * 0.36; // base radius
    const verts = [];

    // 1) Create polar points with jittered radius
    for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const jitter = (rand() * 2 - 1) * irregularity; // [-irr..+irr]
        const r = baseR * (1 + jitter);
        verts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
    }

    // 2) Catmull–Rom to Bézier conversion for a closed loop
    const path = [];
    for (let i = 0; i < points; i++) {
        const p0 = verts[(i - 1 + points) % points];
        const p1 = verts[i];
        const p2 = verts[(i + 1) % points];
        const p3 = verts[(i + 2) % points];

        // Controls
        const s = smoothness * 0.5; // dampen a bit for nicer blobs
        const c1x = p1[0] + (p2[0] - p0[0]) * s / 3;
        const c1y = p1[1] + (p2[1] - p0[1]) * s / 3;
        const c2x = p2[0] - (p3[0] - p1[0]) * s / 3;
        const c2y = p2[1] - (p3[1] - p1[1]) * s / 3;

        if (i === 0) path.push(`M ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`);
        path.push(
            `C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`
        );
    }
    path.push("Z");
    return path.join(" ");
}

const BlobGenerator = () => {
    // Defaults tuned to look good in your dark theme
    const [seed, setSeed] = useState(123456);
    const [points, setPoints] = useState(8);
    const [irregularity, setIrregularity] = useState(0.35);
    const [smoothness, setSmoothness] = useState(0.75);
    const [size, setSize] = useState(360); // preview box (square)
    const [fill, setFill] = useState("#22c55e"); // var(--accent) vibe
    const [stroke, setStroke] = useState("#e9e9e9"); // var(--text)
    const [strokeWidth, setStrokeWidth] = useState(2);

    const pathD = useMemo(
        () =>
            makeBlobPath({
                seed,
                points,
                irregularity,
                smoothness,
                size
            }),
        [seed, points, irregularity, smoothness, size]
    );

    const svgString = useMemo(() => {
        // Build a minimal, portable SVG string for copy/download/export
        return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <path d="${pathD}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
</svg>`.trim();
    }, [pathD, size, fill, stroke, strokeWidth]);

    const randomizeSeed = () => {
        // Use crypto if available for better randomness
        const next =
            typeof crypto !== "undefined" && crypto.getRandomValues
                ? crypto.getRandomValues(new Uint32Array(1))[0]
                : Math.floor(Math.random() * 1e9);
        setSeed(next);
    };

    const copySVG = async () => {
        try {
            await navigator.clipboard.writeText(svgString);
            // we have a global modal/toast in the app; this is non-blocking.
            // Optionally trigger it here if we expose a helper.
            alert("SVG copied to clipboard."); // replace with our global modal if desired
        } catch {
            alert("Copy failed. Select & copy from the textarea below.");
        }
    };

    const download = (content, filename, type = "image/svg+xml") => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadSVG = () => download(svgString, `blob-${seed}.svg`);

    const downloadPNG = async () => {
        // Rasterize SVG → Canvas → PNG
        const img = new Image();
        img.decoding = "sync";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            // Optional: clear to transparent
            ctx.clearRect(0, 0, size, size);
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((b) => {
                if (!b) return;
                const url = URL.createObjectURL(b);
                const a = document.createElement("a");
                a.href = url;
                a.download = `blob-${seed}.png`;
                a.click();
                URL.revokeObjectURL(url);
            }, "image/png");
        };
        img.onerror = () => alert("PNG export failed.");
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
    };

    const reset = () => {
        setSeed(123456);
        setPoints(8);
        setIrregularity(0.35);
        setSmoothness(0.75);
        setSize(360);
        setFill("#22c55e");
        setStroke("#e9e9e9");
        setStrokeWidth(2);
    };

    return (
        <Styled.Wrapper>
            <Styled.HeaderRow>
                <h2>Blob Generator</h2>
                <Styled.ButtonRow>
                    <Styled.Button onClick={randomizeSeed}>Randomize</Styled.Button>
                    <Styled.Button onClick={copySVG}>Copy SVG</Styled.Button>
                    <Styled.Button onClick={downloadSVG}>Download .svg</Styled.Button>
                    <Styled.Button onClick={downloadPNG}>Download .png</Styled.Button>
                    <Styled.Button $variant="ghost" onClick={reset}>
                        Reset
                    </Styled.Button>
                </Styled.ButtonRow>
            </Styled.HeaderRow>

            <Styled.Grid>
                {/* Preview */}
                <Styled.PreviewCard>
                    <Styled.Sizer $w={size} $h={size}>
                        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Blob Preview">
                            <path d={pathD} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                        </svg>
                    </Styled.Sizer>
                    <Styled.Help>Tip: Same seed ⇒ same blob. Export as SVG for crisp logos/backgrounds.</Styled.Help>
                </Styled.PreviewCard>

                {/* Controls */}
                <Styled.ControlsCard as="form" onSubmit={(e) => e.preventDefault()}>
                    <Styled.Field>
                        <label>Seed</label>
                        <input
                            type="number"
                            value={seed}
                            onChange={(e) => setSeed(parseInt(e.target.value || 0, 10))}
                        />
                    </Styled.Field>

                    <Styled.Field>
                        <label>Points: {points}</label>
                        <input
                            type="range"
                            min={3}
                            max={16}
                            value={points}
                            onChange={(e) => setPoints(parseInt(e.target.value, 10))}
                        />
                    </Styled.Field>

                    <Styled.Field>
                        <label>Irregularity: {irregularity.toFixed(2)}</label>
                        <input
                            type="range"
                            step="0.01"
                            min={0}
                            max={1}
                            value={irregularity}
                            onChange={(e) => setIrregularity(parseFloat(e.target.value))}
                        />
                    </Styled.Field>

                    <Styled.Field>
                        <label>Smoothness: {smoothness.toFixed(2)}</label>
                        <input
                            type="range"
                            step="0.01"
                            min={0}
                            max={1}
                            value={smoothness}
                            onChange={(e) => setSmoothness(parseFloat(e.target.value))}
                        />
                    </Styled.Field>

                    <Styled.Field>
                        <label>Preview Size: {size}px</label>
                        <input
                            type="range"
                            min={240}
                            max={520}
                            step={10}
                            value={size}
                            onChange={(e) => setSize(parseInt(e.target.value, 10))}
                        />
                    </Styled.Field>

                    <Styled.FieldRow>
                        <Styled.Field>
                            <label>Fill</label>
                            <input type="color" value={fill} onChange={(e) => setFill(e.target.value)} />
                        </Styled.Field>
                        <Styled.Field>
                            <label>Stroke</label>
                            <input type="color" value={stroke} onChange={(e) => setStroke(e.target.value)} />
                        </Styled.Field>
                        <Styled.Field>
                            <label>Stroke Width</label>
                            <input
                                type="number"
                                min={0}
                                step={0.5}
                                value={strokeWidth}
                                onChange={(e) => setStrokeWidth(parseFloat(e.target.value || 0))}
                            />
                        </Styled.Field>
                    </Styled.FieldRow>

                    <Styled.CodeBlock as="textarea" readOnly rows={6} value={svgString} />
                </Styled.ControlsCard>
            </Styled.Grid>
        </Styled.Wrapper>
    );
};

export default BlobGenerator;

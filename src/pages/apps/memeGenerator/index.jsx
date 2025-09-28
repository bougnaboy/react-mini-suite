import React, { useEffect, useRef, useState } from "react";
import { Styled } from "./styled";

const MemeGenerator = () => {
    const canvasRef = useRef(null);
    const imageRef = useRef(null);
    const printImgRef = useRef(null);

    const [imageSrc, setImageSrc] = useState("");
    const [topText, setTopText] = useState("TOP TEXT");
    const [bottomText, setBottomText] = useState("BOTTOM TEXT");
    const [fontSize, setFontSize] = useState(64);
    const [strokeWidth, setStrokeWidth] = useState(6);
    const [topOffsetPct, setTopOffsetPct] = useState(8);
    const [botOffsetPct, setBotOffsetPct] = useState(8);
    const [uppercase, setUppercase] = useState(true);

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setImageSrc(ev.target.result);
        reader.readAsDataURL(file);
    };

    const drawMeme = () => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img || !img.complete) return;

        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const finalTop = uppercase ? topText.toUpperCase() : topText;
        const finalBottom = uppercase ? bottomText.toUpperCase() : bottomText;

        const centerX = canvas.width / 2;
        const topY = (topOffsetPct / 100) * canvas.height;
        const bottomY = canvas.height - (botOffsetPct / 100) * canvas.height;

        ctx.textAlign = "center";
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = strokeWidth;
        ctx.font = `${fontSize}px Impact, "Arial Black", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;

        const drawLines = (str, baseY, baseline) => {
            const lines = str.split("\n").filter(Boolean);
            const lineHeight = fontSize * 1.25;
            ctx.textBaseline = baseline;
            if (baseline === "top") {
                lines.forEach((ln, i) => {
                    const y = baseY + i * lineHeight;
                    ctx.strokeText(ln, centerX, y);
                    ctx.fillText(ln, centerX, y);
                });
            } else {
                lines
                    .slice()
                    .reverse()
                    .forEach((ln, i) => {
                        const y = baseY - i * lineHeight;
                        ctx.strokeText(ln, centerX, y);
                        ctx.fillText(ln, centerX, y);
                    });
            }
        };

        if (finalTop.trim()) drawLines(finalTop, topY, "top");
        if (finalBottom.trim()) drawLines(finalBottom, bottomY, "bottom");
    };

    useEffect(() => {
        drawMeme();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageSrc, topText, bottomText, fontSize, strokeWidth, topOffsetPct, botOffsetPct, uppercase]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas || !imageSrc) return;
        const link = document.createElement("a");
        link.download = "meme.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    // Print only the meme (no new window)
    const handlePrint = () => {
        const canvas = canvasRef.current;
        const imgEl = printImgRef.current;
        if (!canvas || !imgEl || !imageSrc) return;

        const dataUrl = canvas.toDataURL("image/png");
        imgEl.onload = () => {
            window.print();
            // cleanup after print
            const after = () => {
                imgEl.src = "";
                imgEl.onload = null;
                window.removeEventListener("afterprint", after);
            };
            window.addEventListener("afterprint", after);
        };
        imgEl.src = dataUrl;
    };

    const handleReset = () => {
        setImageSrc("");
        setTopText("TOP TEXT");
        setBottomText("BOTTOM TEXT");
        setFontSize(64);
        setStrokeWidth(6);
        setTopOffsetPct(8);
        setBotOffsetPct(8);
        setUppercase(true);
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    return (
        <Styled.Wrapper>
            <Styled.PrintStyles />

            <header className="heading">
                <h2>MEME Generator</h2>
                <p className="sub">Upload an image, set top/bottom text, download a crisp PNG, or print just the meme.</p>
            </header>

            <Styled.Grid>
                <Styled.Controls aria-label="controls">
                    <fieldset>
                        <legend>Image</legend>
                        <input type="file" accept="image/*" onChange={handleFile} />
                        {!imageSrc && <p className="hint">Pick any JPG/PNG. Canvas scales to the image for sharp export.</p>}
                    </fieldset>

                    <fieldset>
                        <legend>Text</legend>
                        <label>
                            Top text
                            <textarea
                                value={topText}
                                onChange={(e) => setTopText(e.target.value)}
                                placeholder="TOP TEXT"
                                rows={2}
                            />
                        </label>
                        <label>
                            Bottom text
                            <textarea
                                value={bottomText}
                                onChange={(e) => setBottomText(e.target.value)}
                                placeholder="BOTTOM TEXT"
                                rows={2}
                            />
                        </label>

                        <div className="row">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={uppercase}
                                    onChange={(e) => setUppercase(e.target.checked)}
                                />
                                <span>UPPERCASE</span>
                            </label>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>Style</legend>
                        <label>
                            Font size: <b>{fontSize}px</b>
                            <input
                                type="range"
                                min={16}
                                max={128}
                                step={2}
                                value={fontSize}
                                onChange={(e) => setFontSize(+e.target.value)}
                            />
                        </label>

                        <label>
                            Stroke width: <b>{strokeWidth}px</b>
                            <input
                                type="range"
                                min={1}
                                max={16}
                                step={1}
                                value={strokeWidth}
                                onChange={(e) => setStrokeWidth(+e.target.value)}
                            />
                        </label>

                        <label>
                            Top offset: <b>{topOffsetPct}%</b>
                            <input
                                type="range"
                                min={2}
                                max={25}
                                step={1}
                                value={topOffsetPct}
                                onChange={(e) => setTopOffsetPct(+e.target.value)}
                            />
                        </label>

                        <label>
                            Bottom offset: <b>{botOffsetPct}%</b>
                            <input
                                type="range"
                                min={2}
                                max={25}
                                step={1}
                                value={botOffsetPct}
                                onChange={(e) => setBotOffsetPct(+e.target.value)}
                            />
                        </label>
                    </fieldset>

                    <Styled.ButtonBar>
                        <button onClick={handleDownload} disabled={!imageSrc}>Download PNG</button>
                        <button onClick={handlePrint} disabled={!imageSrc}>Print Meme</button>
                        <button onClick={handleReset} className="muted">Reset</button>
                    </Styled.ButtonBar>
                </Styled.Controls>

                <Styled.CanvasWrap aria-label="preview">
                    {!imageSrc && (
                        <div className="placeholder">
                            <div className="box">
                                <span>Preview</span>
                                <small>Upload an image to start</small>
                            </div>
                        </div>
                    )}

                    {imageSrc && (
                        <img
                            ref={imageRef}
                            src={imageSrc}
                            alt=""
                            style={{ display: "none" }}
                            onLoad={drawMeme}
                        />
                    )}
                    <canvas ref={canvasRef} />
                    <p className="note">Tip: Use line breaks in text areas for multi-line captions.</p>
                </Styled.CanvasWrap>
            </Styled.Grid>

            {/* print-only target */}
            <div id="memePrintArea" aria-hidden="true">
                <img ref={printImgRef} alt="Meme" />
            </div>
        </Styled.Wrapper>
    );
};

export default MemeGenerator;

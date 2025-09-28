import styled, { createGlobalStyle } from "styled-components";

const card = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,.25))";
const maxw = "var(--maxw, 1440px)";

const Wrapper = styled.section`
    max-width: ${maxw};
    margin: 0 auto;
    padding: 24px;
    color: ${text};

    .heading {
        margin-bottom: 16px;
        h2 {
            margin: 0 0 6px;
            font-weight: 700;
            letter-spacing: 0.3px;
        }
        .sub {
            color: ${muted};
            margin: 0;
        }
    }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 24px;

    @media (max-width: 960px) {
        grid-template-columns: 1fr;
    }
`;

const Controls = styled.div`
    background: ${card};
    border: 1px solid ${border};
    border-radius: ${radius};
    box-shadow: ${shadow};
    padding: 16px;

    fieldset {
        border: 1px dashed ${border};
        border-radius: 12px;
        padding: 12px;
        margin: 0 0 12px;
    }
    legend {
        color: ${muted};
        padding: 0 6px;
        font-size: 13px;
        letter-spacing: 0.2px;
    }
    label {
        display: grid;
        gap: 8px;
        margin: 10px 0;
        font-size: 14px;
    }
    input[type="file"] {
        width: 100%;
    }
    textarea {
        width: 100%;
        min-height: 56px;
        resize: vertical;
        background: #0e0e0e;
        color: ${text};
        border: 1px solid ${border};
        border-radius: 10px;
        padding: 10px 12px;
    }
    input[type="range"] {
        width: 100%;
    }
    .hint {
        color: ${muted};
        margin: 6px 0 0;
        font-size: 13px;
    }
    .row {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .switch {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        input {
            transform: translateY(1px);
        }
        span {
            color: ${text};
            font-size: 14px;
        }
    }
`;

const ButtonBar = styled.div`
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 8px;

    button {
        appearance: none;
        background: ${accent};
        color: #0b0b0b;
        border: 1px solid ${accent};
        border-radius: 12px;
        padding: 10px 14px;
        font-weight: 600;
        cursor: pointer;
    }
    .muted {
        background: transparent;
        color: ${muted};
        border-color: ${border};
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const CanvasWrap = styled.div`
    background: ${card};
    border: 1px solid ${border};
    border-radius: ${radius};
    box-shadow: ${shadow};
    padding: 16px;
    display: grid;
    gap: 10px;

    canvas {
        width: 100%;
        height: auto;
        border-radius: 12px;
        display: block;
        background: #000;
    }

    .note {
        color: ${muted};
        font-size: 13px;
        margin: 0;
    }

    .placeholder {
        border: 1px dashed ${border};
        border-radius: 12px;
        padding: 36px;
        display: grid;
        place-items: center;
        .box {
            text-align: center;
            color: ${muted};
        }
        .box span {
            display: block;
            font-weight: 700;
            margin-bottom: 6px;
            color: ${text};
        }
    }
`;

/* Global print CSS to show only the meme image */
const PrintStyles = createGlobalStyle`
  #memePrintArea { display: none; }

  @media print {
    @page { size: auto; margin: 0; }
    html, body { margin: 0 !important; padding: 0 !important; background: #000 !important; }
    body * { visibility: hidden !important; height: 0 !important; overflow: hidden !important; }

    #memePrintArea,
    #memePrintArea * {
      visibility: visible !important;
      display: block !important;
      height: auto !important;
      overflow: visible !important;
    }

    #memePrintArea {
      position: fixed;
      inset: 0;
      margin: 0;
      padding: 0;
      background: #000;
      border: 0;
      z-index: 999999;
    }

    #memePrintArea img {
      width: 100vw;
      max-height: 100vh;
      height: auto;
      object-fit: contain;
      margin: 0;
    }
  }
`;

export const Styled = {
    Wrapper,
    Grid,
    Controls,
    CanvasWrap,
    ButtonBar,
    PrintStyles,
};

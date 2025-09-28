import styled from "styled-components";

const card = "var(--card, #0f1012)";
const text = "var(--text, #eaeaea)";
const muted = "var(--muted, #a8a8a8)";
const border = "var(--border, #242424)";
const accent = "var(--accent, #22c55e)";
const danger = "var(--danger, #ef4444)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 10px 30px rgba(0,0,0,0.35))";

export const Styled = {
    Wrapper: styled.div`
        display: flex;
        flex-direction: column;
        gap: 16px;
        color: ${text};
        padding: 15px;
        max-width: 1440px;
        margin: auto;
    `,
    Header: styled.header`
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};

        .title {
            font-size: 20px;
            font-weight: 600;
            letter-spacing: 0.2px;
        }
        .actions {
            display: flex;
            gap: 10px;
        }
        button {
            padding: 8px 12px;
            border: 1px solid ${border};
            border-radius: 10px;
            background: #141414;
            color: ${text};
            font-size: 14px;
            cursor: pointer;
        }
        button:hover {
            border-color: ${accent};
        }
        button:active {
            transform: translateY(1px);
        }
    `,
    Body: styled.div`
        display: grid;
        grid-template-columns: 360px 1fr;
        gap: 16px;

        @media (max-width: 980px) {
            grid-template-columns: 1fr;
        }
    `,
    Sidebar: styled.aside`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 12px;

        select,
        input[type="text"],
        input[type="range"],
        input[type="color"],
        input[type="file"] {
            width: 100%;
        }

        input,
        select {
            background: #141414;
            color: ${text};
            border: 1px solid ${border};
            border-radius: 10px;
            padding: 8px 10px;
            font-size: 14px;
            outline: none;
        }

        .chips {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .chip {
            padding: 6px 10px;
            border: 1px solid ${border};
            border-radius: 10px;
            background: #161616;
            color: ${text};
            font-size: 13px;
            cursor: pointer;
        }
        .chip.active {
            border-color: ${accent};
            outline: 1px solid ${accent};
        }

        .swatches {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
        }
        .swatch {
            width: 32px;
            height: 24px;
            border: 1px solid ${border};
            border-radius: 8px;
            cursor: pointer;
        }
        .swatch.selected {
            outline: 2px solid ${accent};
        }

        .fileBtn {
            position: relative;
            overflow: hidden;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 8px 12px;
            border: 1px solid ${border};
            border-radius: 10px;
            background: #111;
            cursor: pointer;
            font-size: 14px;
            color: ${text};
            width: 100%;
            text-align: center;
        }
        .fileBtn input {
            position: absolute;
            inset: 0;
            opacity: 0;
            cursor: pointer;
        }
        .hint {
            color: ${muted};
            font-size: 12px;
            margin-top: 6px;
        }
    `,
    Group: styled.div`
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 8px 0;
    `,
    Row: styled.div`
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    `,
    Label: styled.label`
        font-size: 12px;
        color: ${muted};
    `,
    Stage: styled.div`
        display: grid;
        align-content: start;
        gap: 10px;
    `,
    CanvasWrap: styled.div`
        width: min(100%, 900px);
        margin: 0 auto;
        border: 1px solid ${border};
        border-radius: ${radius};
        overflow: hidden;
        background: linear-gradient(
                    45deg,
                    rgba(255, 255, 255, 0.03) 25%,
                    transparent 25%
                ) -8px 0/16px 16px,
            linear-gradient(
                    -45deg,
                    rgba(255, 255, 255, 0.03) 25%,
                    transparent 25%
                )
                0px 0/16px 16px,
            linear-gradient(
                    45deg,
                    transparent 75%,
                    rgba(255, 255, 255, 0.03) 75%
                ) -8px 8px/16px 16px,
            linear-gradient(
                    -45deg,
                    transparent 75%,
                    rgba(255, 255, 255, 0.03) 75%
                )
                0px 8px/16px 16px,
            #0b0b0b;
        transform-origin: top center;

        canvas {
            display: block;
            width: 100%;
            height: auto;
        }
    `,
    Hint: styled.div`
        text-align: center;
        color: ${muted};
        font-size: 14px;
        padding: 6px 0 2px;
    `,
    ModalBackdrop: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `,
    ModalCard: styled.div`
        width: min(420px, 92vw);
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;

        .title {
            font-weight: 600;
            margin-bottom: 6px;
            color: ${text};
        }
        .msg {
            color: ${muted};
            font-size: 14px;
            margin-bottom: 12px;
        }
        .row {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }

        button {
            padding: 8px 12px;
            border: 1px solid ${border};
            border-radius: 10px;
            background: #141414;
            color: ${text};
            cursor: pointer;
            font-size: 14px;
        }
        button:hover {
            border-color: ${accent};
        }
        .ghost {
            background: transparent;
        }
        .danger {
            background: #1a0f10;
            border-color: ${danger};
        }
    `,
};

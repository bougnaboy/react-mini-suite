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
        padding: 30px;
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
            align-items: center;
            gap: 10px;
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
        }
        .fileBtn input {
            position: absolute;
            inset: 0;
            opacity: 0;
            cursor: pointer;
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
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    `,
    Body: styled.div`
        display: grid;
        grid-template-columns: 320px 1fr;
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

        input[type="range"] {
            width: 100%;
        }
        .active {
            border-color: ${accent};
            outline: 1px solid ${accent};
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

        button {
            padding: 6px 10px;
            border-radius: 10px;
            border: 1px solid ${border};
            background: #161616;
            color: ${text};
            font-size: 13px;
            cursor: pointer;
        }
    `,
    Label: styled.label`
        font-size: 12px;
        color: ${muted};
    `,
    Separator: styled.hr`
        border: none;
        border-top: 1px solid ${border};
        margin: 10px 0;
        opacity: 0.6;
    `,
    Stage: styled.div`
        display: grid;
        align-content: start;
        gap: 10px;
    `,
    CanvasStack: styled.div`
        position: relative;
        width: 100%;
        max-width: 1200px;
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
        canvas + canvas {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
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

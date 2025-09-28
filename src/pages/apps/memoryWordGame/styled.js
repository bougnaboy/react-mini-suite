import styled from "styled-components";

const cardBg = "var(--card, #0f1012)";
const text = "var(--text, #eaeaea)";
const muted = "var(--muted, #a8a8a8)";
const border = "var(--border, #242424)";
const accent = "var(--accent, #22c55e)";
const danger = "var(--danger, #ef4444)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 10px 30px rgba(0,0,0,0.35))";

export const Styled = {
    Wrapper: styled.div`
        display: grid;
        gap: 16px;
        color: ${text};
        margin: auto;
        max-width: 1440px;
        padding: 15px;
    `,
    Header: styled.header`
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        background: ${cardBg};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};

        .title {
            font-size: 20px;
            font-weight: 600;
            letter-spacing: 0.2px;
        }
        .controls {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .sel {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: ${muted};
            font-size: 13px;
            select {
                background: #141414;
                color: ${text};
                border: 1px solid ${border};
                border-radius: 10px;
                padding: 6px 8px;
            }
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
    StatsBar: styled.div`
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        font-size: 14px;
        color: ${muted};
        padding: 4px 2px 0;
        b {
            color: ${text};
        }
    `,
    Banner: styled.div`
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        background: rgba(34, 197, 94, 0.12);
        border: 1px solid ${accent};
        color: ${text};
        border-radius: ${radius};
        padding: 10px 12px;

        button {
            padding: 6px 10px;
            border: 1px solid ${border};
            border-radius: 10px;
            background: #161616;
            color: ${text};
            cursor: pointer;
            font-size: 13px;
        }
    `,
    Grid: styled.div`
        display: grid;
        grid-template-columns: repeat(6, minmax(140px, 1fr));
        gap: 10px;

        @media (max-width: 1200px) {
            grid-template-columns: repeat(5, minmax(120px, 1fr));
        }
        @media (max-width: 980px) {
            grid-template-columns: repeat(4, minmax(110px, 1fr));
        }
        @media (max-width: 720px) {
            grid-template-columns: repeat(3, minmax(100px, 1fr));
        }
        @media (max-width: 520px) {
            grid-template-columns: repeat(2, minmax(100px, 1fr));
        }

        &[data-busy="1"] {
            pointer-events: none; /* avoid spamming clicks while flipping back */
        }
    `,
    Card: styled.button`
        appearance: none;
        border: 1px solid ${border};
        border-radius: ${radius};
        background: #0b0b0b;
        color: ${text};
        box-shadow: ${shadow};
        padding: 10px;
        text-align: left;
        cursor: pointer;
        transition: border-color 0.2s ease, transform 0.08s ease;

        &:hover {
            border-color: ${accent};
        }
        &:active {
            transform: translateY(1px);
        }
        &:disabled {
            opacity: 0.7;
            cursor: default;
        }

        .inner {
            display: grid;
            align-content: start;
            gap: 8px;
            min-height: 88px;
        }

        .tag {
            display: inline-block;
            font-size: 11px;
            color: ${muted};
            border: 1px dashed ${border};
            border-radius: 8px;
            padding: 2px 6px;
            width: fit-content;
            opacity: 0.9;
        }

        .face {
            font-size: 14px;
            line-height: 1.35;
            word-wrap: break-word;
            white-space: normal;
        }

        &[data-revealed="0"] .face {
            text-align: center;
            font-weight: 600;
            letter-spacing: 0.5px;
            font-size: 18px;
        }

        &[data-matched="1"] {
            border-color: ${accent};
            background: radial-gradient(
                    1200px circle at 20% -10%,
                    rgba(34, 197, 94, 0.12),
                    transparent 40%
                ),
                #0b0b0b;
        }
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
        background: ${cardBg};
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

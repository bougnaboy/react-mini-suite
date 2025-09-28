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
        max-width: 1440px;
        padding: 15px;
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
        }
        .actions {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        }
        .group {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .lbl {
            color: ${muted};
            font-size: 12px;
        }
        .segBtns {
            display: inline-flex;
            gap: 6px;
            background: #121212;
            padding: 4px;
            border: 1px solid ${border};
            border-radius: 10px;
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
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .segBtns button {
            padding: 6px 10px;
            font-size: 13px;
        }
        .segBtns .active {
            border-color: ${accent};
            outline: 1px solid ${accent};
        }
    `,
    Body: styled.div`
        display: grid;
        align-content: start;
        gap: 12px;
    `,
    Metrics: styled.div`
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;

        .metric {
            background: ${card};
            border: 1px solid ${border};
            border-radius: ${radius};
            box-shadow: ${shadow};
            padding: 10px;
            text-align: center;
        }
        .value {
            font-size: 20px;
            font-weight: 700;
        }
        .key {
            color: ${muted};
            font-size: 12px;
        }
        @media (max-width: 640px) {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    `,
    PassageCard: styled.div`
        position: relative;
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 14px;
        cursor: text;
    `,
    Passage: styled.div`
        line-height: 1.9;
        letter-spacing: 0.2px;
        font-size: 18px;
        user-select: none;

        span.ok {
            color: #c6f6d5;
        }
        span.err {
            color: #fca5a5;
            text-decoration: underline;
        }
        span.active {
            position: relative;
            color: ${text};
            background: rgba(255, 255, 255, 0.06);
            border-radius: 6px;
            outline: 1px dashed ${accent};
        }
    `,
    Overlay: styled.div`
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        display: grid;
        place-items: center;
        font-weight: 700;
        font-size: 28px;
        border-radius: ${radius};
    `,
    InputRow: styled.div`
        textarea {
            width: 100%;
            min-height: 96px;
            resize: vertical;
            padding: 12px;
            background: #141414;
            color: ${text};
            border: 1px solid ${border};
            border-radius: ${radius};
            outline: none;
        }
        textarea:focus {
            border-color: ${accent};
        }
        textarea::placeholder {
            color: ${muted};
        }
    `,
    ResultsCard: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 14px;

        .title {
            font-weight: 700;
            margin-bottom: 8px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px;
        }
        .item {
            border: 1px solid ${border};
            border-radius: 12px;
            padding: 10px;
            background: #121212;
            text-align: center;
        }
        .big {
            font-size: 20px;
            font-weight: 700;
        }
        .muted {
            color: ${muted};
            font-size: 12px;
        }

        .meta {
            display: flex;
            gap: 12px;
            margin-top: 10px;
            color: ${muted};
            font-size: 12px;
            flex-wrap: wrap;
        }

        @media (max-width: 640px) {
            .grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }
    `,

    /* --- Saved Results --- */
    History: styled.section`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 14px;

        .hTitle {
            font-weight: 700;
            margin-bottom: 10px;
        }
        .empty {
            color: ${muted};
            font-size: 14px;
        }

        .list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: grid;
            gap: 8px;
        }
        .row {
            display: grid;
            grid-template-columns: 96px 110px 1fr;
            gap: 10px;
            align-items: center;
            border: 1px solid ${border};
            border-radius: 12px;
            padding: 10px;
            background: #121212;
        }
        .stat {
            text-align: center;
        }
        .wpm {
            font-weight: 800;
            font-size: 22px;
        }
        .acc {
            font-weight: 700;
            font-size: 18px;
        }
        .label {
            color: ${muted};
            font-size: 11px;
            margin-top: 2px;
        }
        .meta {
            color: ${muted};
            font-size: 12px;
        }
        .meta .line {
            line-height: 1.3;
        }
        .snip {
            grid-column: 1 / -1; /* ← span full width */
            width: 100%;
            margin-top: 8px;
            color: ${text};
            font-size: 13px;
            line-height: 1.6;
            white-space: pre-wrap; /* keep line breaks from the passage */
            overflow-wrap: anywhere; /* avoid overflow on long words */
        }

        @media (max-width: 720px) {
            .row {
                grid-template-columns: 80px 90px 1fr;
            }
            .wpm {
                font-size: 20px;
            }
            .acc {
                font-size: 16px;
            }
        }
    `,

    /* Modal */
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

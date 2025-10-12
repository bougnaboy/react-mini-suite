import styled from "styled-components";

/* theme tokens */
const bg = "var(--bg)";
const card = "var(--card)";
const text = "var(--text)";
const muted = "var(--muted)";
const border = "var(--border)";
const radius = "var(--radius)";
const shadow = "var(--shadow)";
const accent = "var(--accent)";
const danger = "var(--danger, #e5484d)";

export const Styled = {
    Wrapper: styled.div`
        background: ${bg};
        color: ${text};
        min-height: 100%;
        padding: 16px;

        /* requested scaffold */
        max-width: 1440px;
        margin: 0 auto;

        display: grid;
        gap: 16px;
    `,

    Header: styled.header`
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;

        h1 {
            margin: 0 0 6px 0;
            font-size: 20px;
        }
        p {
            margin: 0;
            color: ${muted};
            font-size: 14px;
        }
    `,

    Badges: styled.div`
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        .badge {
            background: ${card};
            border: 1px solid ${border};
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 12px;
            box-shadow: ${shadow};
        }
    `,

    Layout: styled.div`
        display: grid;
        grid-template-columns: 1.7fr 1fr;
        gap: 16px;
        @media (max-width: 1100px) {
            grid-template-columns: 1fr;
        }
    `,

    GameCard: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 12px;
        display: grid;
        gap: 12px;
    `,

    CanvasWrap: styled.div`
        width: 100%;
        max-width: 820px;
        margin: 0 auto;

        canvas {
            width: 100%;
            height: auto;
            display: block;
            border-radius: calc(${radius} - 2px);
            border: 1px solid ${border};
            background: #cfefff;
            box-shadow: ${shadow};
            cursor: pointer; /* show it's clickable */
            touch-action: manipulation; /* better mobile taps */
        }
    `,

    Controls: styled.div`
        display: flex;
        gap: 10px;
        align-items: center;

        .spacer {
            flex: 1;
        }
        .score {
            display: flex;
            gap: 14px;
            font-size: 14px;
            span {
                color: ${muted};
            }
            strong {
                color: ${text};
            }
        }

        button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 10px 14px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            transition: border-color 0.15s ease, transform 0.02s ease-in-out;

            &:hover {
                border-color: ${accent};
            }
            &:active {
                transform: translateY(1px);
            }
            &:disabled {
                opacity: 0.55;
                cursor: not-allowed;
            }
        }
    `,

    FooterNote: styled.div`
        color: ${muted};
        font-size: 12px;
        text-align: center;
    `,

    Side: styled.aside`
        display: grid;
        gap: 16px;
    `,

    Card: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 14px;
        display: grid;
        gap: 12px;

        h3 {
            margin: 0;
            font-size: 16px;
        }
    `,

    Stats: styled.ul`
        list-style: none;
        margin: 0;
        padding: 0;

        li {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dashed ${border};
        }
        li:last-child {
            border-bottom: 0;
        }
        span {
            color: ${muted};
        }
        strong {
            color: ${text};
        }
    `,

    Actions: styled.div`
        display: flex;
        gap: 10px;
        flex-wrap: wrap;

        button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            transition: border-color 0.15s ease, transform 0.02s ease-in-out;
            &:hover {
                border-color: ${accent};
            }
            &:active {
                transform: translateY(1px);
            }
        }
        .danger {
            border-color: ${danger};
            color: ${danger};
            &:hover {
                border-color: ${danger};
            }
        }
    `,

    Field: styled.div`
        display: grid;
        gap: 6px;
        label {
            font-size: 13px;
            color: ${text};
        }
        input[type="range"] {
            width: 100%;
        }
    `,

    Help: styled.div`
        font-size: 12px;
        color: ${muted};
    `,

    /* Modal */
    ModalBackdrop: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: grid;
        place-items: center;
        z-index: 999;
    `,
    Modal: styled.div`
        width: min(520px, 92vw);
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;

        h4 {
            margin: 0 0 8px 0;
            font-size: 16px;
        }
        p {
            margin: 0 0 14px 0;
            color: ${muted};
        }

        .row {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            transition: border-color 0.15s ease, transform 0.02s ease-in-out;
            &:hover {
                border-color: ${accent};
            }
            &:active {
                transform: translateY(1px);
            }
        }
        .ghost {
            background: ${bg};
        }
        .danger {
            border-color: ${danger};
            color: ${danger};
        }
    `,
};

import styled from "styled-components";

const bg = "var(--bg)";
const card = "var(--card)";
const text = "var(--text)";
const muted = "var(--muted)";
const border = "var(--border)";
const radius = "var(--radius)";
const shadow = "var(--shadow)";
const accent = "var(--accent)";
const danger = "var(--danger, #e5484d)";

const Styled = {
    Wrapper: styled.div`
        max-width: 1440px;
        margin: 0 auto;
        display: grid;
        gap: 16px;
        padding: 16px;
        color: ${text};
        background: ${bg};
        min-height: 100%;
        outline: none; /* focus ring off */
        user-select: none; /* avoid accidental selection */
        touch-action: none; /* mobile: prevent swipe-scroll while playing */
        overscroll-behavior: contain;
    `,
    Header: styled.header`
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
        h1 {
            margin: 0 0 6px 0;
            font-size: 22px;
            line-height: 1.2;
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
        align-items: center;
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
        grid-template-columns: 2fr 1fr;
        gap: 16px;
        @media (max-width: 1020px) {
            grid-template-columns: 1fr;
        }
        .left,
        .right {
            display: grid;
            gap: 16px;
        }
    `,
    Card: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;
    `,
    SectionTitle: styled.h2`
        margin: 0 0 10px 0;
        font-size: 15px;
        font-weight: 600;
    `,
    Info: styled.div`
        padding: 10px 12px;
        border: 1px dashed ${border};
        border-radius: ${radius};
        color: ${muted};
        background: ${bg};
        .foodDot {
            display: inline-block;
            width: 10px;
            height: 10px;
            background: ${accent};
            border-radius: 50%;
            margin: 0 4px;
        }
    `,
    TopBar: styled.div`
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        .metric {
            display: grid;
        }
        .label {
            color: ${muted};
            font-size: 12px;
        }
        .spacer {
            flex: 1;
        }
    `,
    ControlsMini: styled.div`
        display: grid;
        grid-template-rows: auto auto auto;
        gap: 4px;
        align-items: center;
        justify-items: center;
        .row {
            display: grid;
            grid-template-columns: repeat(3, 28px);
            gap: 4px;
        }
        button {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            font: inherit;
            cursor: pointer;
            &:hover {
                border-color: ${accent};
            }
        }
    `,
    Board: styled.div`
        --size: ${(p) => p.$size || 20};
        display: grid;
        grid-template-columns: repeat(var(--size), 1fr);
        grid-template-rows: repeat(var(--size), 1fr);
        gap: 2px;
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        aspect-ratio: 1 / 1;
        width: 100%;
        .cell {
            background: ${bg};
            border-radius: 6px;
        }
        .cell.snake {
            background: rgba(255, 255, 255, 0.14);
        }
        .cell.head {
            background: ${text};
        }
        .cell.food {
            background: ${accent};
        }
    `,
    Actions: styled.div`
        margin-top: 14px;
        display: flex;
        gap: 10px;
        align-items: center;
        .spacer {
            flex: 1;
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
            transition: transform 0.02s ease-in-out, border-color 0.15s ease;
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
        .ghost {
            background: ${bg};
        }
        .danger {
            border-color: ${danger};
        }
        .primary {
            background: ${accent};
            border-color: ${accent};
            color: black;
        }
    `,
    Overlay: styled.div`
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        background: rgba(0, 0, 0, 0.2);
        z-index: 40;
        .panel {
            background: ${card};
            color: ${text};
            border: 1px solid ${border};
            border-radius: ${radius};
            padding: 16px;
            box-shadow: ${shadow};
            text-align: center;
            display: grid;
            gap: 10px;
        }
        .panel button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 10px 14px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
        }
        .panel button.primary {
            background: ${accent};
            border-color: ${accent};
            color: #fff;
        }
    `,
    ModalOverlay: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: grid;
        place-items: center;
        z-index: 50;
    `,
    Modal: styled.div`
        width: min(420px, 90vw);
        background: ${card};
        color: ${text};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;
        h3 {
            margin: 0 0 6px 0;
        }
        p {
            margin: 0 0 12px 0;
            color: ${muted};
        }
        .actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        .actions button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
        }
        .actions .ghost {
            background: ${bg};
        }
        .actions .danger {
            border-color: ${danger};
        }
    `,
};

export default Styled;

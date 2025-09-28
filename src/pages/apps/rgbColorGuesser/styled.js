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
        color: ${text};
        display: grid;
        gap: 14px;
        max-width: 1440px;
        padding: 15px;
        margin: auto;
    `,
    Header: styled.header`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 12px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;

        .title {
            font-weight: 600;
            font-size: 18px;
        }

        .controls {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            align-items: center;
        }
        select,
        button {
            background: #151515;
            color: ${text};
            border: 1px solid ${border};
            border-radius: 10px;
            padding: 8px 10px;
            font-size: 14px;
            cursor: pointer;
        }
        button:hover,
        select:hover {
            border-color: ${accent};
        }

        .seg {
            display: inline-flex;
            border: 1px solid ${border};
            border-radius: 10px;
            overflow: hidden;
        }
        .seg button {
            border: 0;
            border-right: 1px solid ${border};
            background: #101010;
        }
        .seg button:last-child {
            border-right: 0;
        }
        .seg .active {
            background: #1a1a1a;
            border-color: ${accent};
        }

        .toggle {
            display: inline-flex;
            gap: 6px;
            align-items: center;
            font-size: 13px;
            color: ${muted};
        }
        .toggle input {
            accent-color: #888;
        }
    `,
    Stats: styled.div`
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        .chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            border: 1px solid ${border};
            border-radius: 999px;
            background: #121212;
            font-size: 13px;
        }
        .ghost {
            opacity: 0.8;
        }
    `,
    Stage: styled.div`
        display: grid;
        gap: 14px;
    `,
    TargetCard: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 12px;

        .top {
            display: grid;
            grid-template-columns: 160px 1fr;
            gap: 12px;
            align-items: center;
        }
        .swatch {
            width: 100%;
            height: 96px;
            border-radius: 12px;
            border: 1px solid ${border};
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
        }
        .rgb {
            font-size: 16px;
            font-weight: 600;
        }
        .hex {
            font-size: 13px;
            color: ${muted};
        }
        .hint {
            margin-top: 4px;
            font-size: 12px;
        }
        .muted {
            color: ${muted};
        }
        .note {
            margin-top: 8px;
        }
        @media (max-width: 640px) {
            .top {
                grid-template-columns: 1fr;
            }
        }
    `,
    Options: styled.div`
        display: grid;
        grid-template-columns: repeat(${(p) => p.$cols || 3}, minmax(0, 1fr));
        gap: 10px;

        button {
            text-align: left;
            display: grid;
            grid-template-columns: 64px 1fr;
            gap: 10px;
            align-items: center;
            padding: 8px;
            background: ${card};
            border: 1px solid ${border};
            border-radius: 12px;
            box-shadow: ${shadow};
            cursor: pointer;
        }
        .box {
            width: 64px;
            height: 40px;
            border-radius: 8px;
            border: 1px solid ${border};
        }
        .code {
            font-size: 13px;
            color: ${muted};
        }
    `,
    Mixer: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 12px;
        display: grid;
        gap: 12px;

        .mixRow {
            display: grid;
            grid-template-columns: 160px 1fr;
            gap: 12px;
            align-items: center;
        }
        .mixSwatch {
            width: 100%;
            height: 96px;
            border-radius: 12px;
            border: 1px solid ${border};
        }
        .mixVals {
            font-size: 14px;
        }

        .sliders {
            display: grid;
            gap: 6px;
        }
        label {
            display: grid;
            grid-template-columns: 18px 1fr;
            gap: 10px;
            align-items: center;
        }
        input[type="range"] {
            width: 100%;
        }

        .act {
            display: flex;
            gap: 8px;
        }
    `,
    Reveal: styled.div`
        /* This entire block gets cloned for print (inside iframe) */
        .card {
            background: #fff;
            color: #111;
            border: 1px solid #ddd;
            border-radius: 12px;
            padding: 14px;
        }
        .title {
            margin: 0;
        }
        .top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }
        .pill {
            padding: 4px 10px;
            border-radius: 999px;
            border: 1px solid #ddd;
            font-size: 12px;
        }
        .ok {
            background: #eaffea;
            border-color: #c8f5c8;
            color: #0a7a2a;
        }
        .bad {
            background: #ffeeee;
            border-color: #f5c8c8;
            color: #8a1010;
        }

        .row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 10px;
        }
        .sw {
            display: grid;
            grid-template-columns: 64px 1fr;
            gap: 10px;
            align-items: center;
        }
        .box {
            width: 64px;
            height: 40px;
            border: 1px solid #aaa;
            border-radius: 6px;
        }
        .muted {
            color: #555;
            font-size: 12px;
        }
        .mt {
            margin-top: 6px;
        }
    `,
    ModalBackdrop: styled.div`
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: rgba(0, 0, 0, 0.6);
        display: grid;
        place-items: center;
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
        .ghost {
            background: transparent;
        }
        .danger {
            background: #1a0f10;
            border-color: ${danger};
        }
        button:hover {
            border-color: ${accent};
        }
    `,
};

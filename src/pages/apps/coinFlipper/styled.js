import styled, { keyframes } from "styled-components";

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
const good = "var(--good, #18a058)";
const info = "var(--info, #2b6cb0)";

/* coin spin */
const spin = keyframes`
  0%   { transform: rotateY(0deg);    }
  50%  { transform: rotateY(540deg);  }
  100% { transform: rotateY(1080deg); }
`;

export const Styled = {
    Wrapper: styled.div`
        display: grid;
        gap: 16px;
        padding: 16px;
        background: ${bg};
        color: ${text};
        min-height: 100%;
        max-width: 1440px;
        margin: 0 auto;
    `,

    Header: styled.header`
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;

        h1 {
            margin: 0 0 6px 0;
            font-size: 20px;
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
        grid-template-columns: 1.1fr 1.3fr;
        gap: 16px;
        @media (max-width: 1024px) {
            grid-template-columns: 1fr;
        }
    `,

    Left: styled.div`
        display: grid;
        gap: 16px;
    `,

    Right: styled.div`
        display: grid;
        gap: 16px;
    `,

    Card: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;

        h3 {
            margin: 0 0 12px 0;
            font-size: 16px;
        }
    `,

    CoinBox: styled.div`
        display: grid;
        place-items: center;
        padding: 24px 0;
    `,

    Coin: styled.div`
        width: 120px;
        height: 120px;
        position: relative;
        transform-style: preserve-3d;
        transition: transform 0.3s ease;
        perspective: 800px;

        &.spin {
            animation: ${spin} 0.42s ease-in-out both;
        }

        .face {
            position: absolute;
            inset: 0;
            display: grid;
            place-items: center;
            border-radius: 50%;
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            font-size: 56px;
            font-weight: 700;
            backface-visibility: hidden;
            box-shadow: ${shadow};
        }
        .front {
            transform: rotateY(0deg);
        }
        .back {
            transform: rotateY(180deg);
        }
    `,

    Controls: styled.div`
        display: grid;
        gap: 12px;

        .row {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            @media (max-width: 720px) {
                grid-template-columns: 1fr;
            }
        }

        .field {
            display: grid;
            gap: 6px;
        }
        .lab {
            font-size: 13px;
            color: ${muted};
        }

        .inline {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        .mono {
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        input[type="range"] {
            width: 100%;
        }

        input[type="number"] {
            width: 100%;
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: calc(${radius} - 2px);
            padding: 10px 12px;
            font: inherit;
            outline: none;
            transition: border-color 0.15s ease;
        }
        input[type="number"]:focus {
            border-color: ${accent};
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
            transition: transform 0.02s ease-in-out, border-color 0.15s ease,
                background 0.15s ease;
            display: inline-flex;
            gap: 8px;
            align-items: center;

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
            color: ${danger};
        }
    `,

    Stats: styled.div`
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 12px;
        @media (max-width: 1024px) {
            grid-template-columns: repeat(2, 1fr);
        }

        .item {
            border: 1px solid ${border};
            background: ${bg};
            border-radius: ${radius};
            padding: 12px;
            box-shadow: ${shadow};
            display: grid;
            gap: 6px;
        }
        .k {
            color: ${muted};
            font-size: 12px;
        }
        .v {
            font-weight: 600;
        }
        .muted {
            color: ${muted};
            font-weight: 400;
            font-size: 12px;
            margin-left: 4px;
        }
    `,

    HdrRow: styled.div`
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;

        .chk {
            display: inline-flex;
            gap: 8px;
            align-items: center;
            color: ${muted};
        }

        .row-right {
            display: inline-flex;
            align-items: center;
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
                display: inline-flex;
                gap: 8px;
                align-items: center;
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
                color: ${danger};
            }
        }
    `,

    Empty: styled.div`
        padding: 24px;
        border: 1px dashed ${border};
        border-radius: ${radius};
        color: ${muted};
        text-align: center;
    `,

    Table: styled.div`
        display: grid;
        gap: 0;

        .thead,
        .tbody {
            display: grid;
        }
        .tr {
            display: grid;
            grid-template-columns: 44px 1fr 1fr 1.4fr 1fr 80px;
            border-bottom: 1px solid ${border};
            align-items: center;
            min-height: 42px;
            @media (max-width: 900px) {
                grid-template-columns: 36px 1fr 1fr 1.4fr 1fr 72px;
            }
        }
        .th,
        .td {
            padding: 8px 10px;
        }
        .th {
            font-size: 12px;
            color: ${muted};
        }
        .td.right {
            text-align: right;
        }

        .pill {
            display: inline-block;
            padding: 4px 8px;
            font-size: 12px;
            border-radius: 999px;
            border: 1px solid ${border};
            background: ${bg};
        }
        .pill.green {
            color: ${good};
            border-color: ${good};
        }
        .pill.blue {
            color: ${info};
            border-color: ${info};
        }

        .cbox {
            text-align: center;
        }
        .icon {
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            padding: 6px 8px;
            border-radius: ${radius};
            cursor: pointer;
            transition: border-color 0.15s ease;
        }
        .icon:hover {
            border-color: ${accent};
        }
        .icon.danger {
            color: ${danger};
            border-color: ${danger};
        }
    `,

    /* Confirm Modal */
    ModalBackdrop: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        display: grid;
        place-items: center;
        z-index: 50;
    `,
    Modal: styled.div`
        width: min(480px, 92vw);
        background: ${card};
        color: ${text};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;

        h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
        }
        p.muted {
            color: ${muted};
            margin: 0 0 16px 0;
        }

        .actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
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

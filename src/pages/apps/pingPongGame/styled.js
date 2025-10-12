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

const ballCol = "var(--pong-ball, var(--accent))";
const paddleCol = "var(--pong-paddle, var(--card))";
const paddleBorderCol = "var(--pong-paddle-border, var(--border))";

export const Styled = {
    Wrapper: styled.div`
        max-width: 1440px;
        margin: 0 auto;
        padding: 16px;
        color: ${text};
        background: ${bg};
        display: grid;
        gap: 16px;
    `,

    Header: styled.div`
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
        grid-template-columns: 2fr 1fr;
        gap: 16px;

        @media (max-width: 1024px) {
            grid-template-columns: 1fr;
        }
    `,

    Card: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;
    `,

    Scorebar: styled.div`
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        padding-bottom: 8px;

        .side {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .side.right {
            justify-content: flex-end;
        }

        .score {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 36px;
            padding: 6px 10px;
            border: 1px solid ${border};
            border-radius: 999px;
            background: ${bg};
            font-weight: 600;
            box-shadow: ${shadow};
        }

        .center {
            font-size: 13px;
            color: ${muted};
        }
        .winner {
            color: ${accent};
            font-weight: 600;
        }
    `,

    Arena: styled.div`
        position: relative;
        width: 100%;

        /* ✅ Use aspect-ratio to keep JS height = DOM height */
        aspect-ratio: 16 / 9;
        min-height: 320px;
        max-height: 640px;

        border: 1px solid ${border};
        border-radius: ${radius};
        background: ${bg};
        box-shadow: inset 0 0 0 1px ${border};
        overflow: hidden;
        user-select: none;
        touch-action: none;
        cursor: crosshair;

        .net {
            position: absolute;
            left: 50%;
            top: 0;
            bottom: 0;
            width: 2px;
            background: ${border};
            transform: translateX(-1px);
            opacity: 0.7;
        }

        .paddle {
            position: absolute;
            width: 14px;
            height: 100px;
            background: ${card};
            border: 1px solid ${border};
            border-radius: 8px;
            box-shadow: ${shadow};
            /* transform set by JS */
        }

        .ball {
            position: absolute;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: ${ballCol};
            box-shadow: ${bg};
            border: 1px solid ${paddleBorderCol};
            /* transform set by JS */
        }
    `,

    Actions: styled.div`
        margin-top: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;

        .left,
        .right {
            display: flex;
            gap: 10px;
            align-items: center;
        }

        button {
            appearance: none;
            border: 1px solid ${border};
            background: ${paddleCol};
            border: 1px solid ${paddleBorderCol};
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
    `,

    Side: styled.aside`
        display: grid;
        gap: 16px;

        .tips {
            margin: 0;
            padding-left: 18px;
            color: ${muted};
            font-size: 14px;
        }
        .muted {
            color: ${muted};
        }
    `,

    FormRow: styled.div`
        display: grid;
        gap: 8px;
        margin-bottom: 12px;

        label {
            font-size: 13px;
        }
        .inline {
            display: flex;
            gap: 16px;
            align-items: center;
        }

        .radio {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
        }

        select,
        input[type="range"] {
            width: 100%;
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: calc(${radius} - 2px);
            padding: 8px 10px;
            font: inherit;
            outline: none;
        }

        .hint {
            font-size: 12px;
            color: ${muted};
        }
    `,

    HiList: styled.ul`
        list-style: none;
        margin: 0;
        padding: 0;

        li + li {
            margin-top: 8px;
        }

        .row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
        }
        .score {
            font-weight: 600;
        }
        .meta {
            color: ${muted};
            font-size: 12px;
        }
        .time {
            color: ${muted};
            font-size: 12px;
        }
    `,

    /* ----------------------- Modal ----------------------- */
    Modal: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: grid;
        place-items: center;
        z-index: 50;
    `,

    ModalCard: styled.div`
        width: min(520px, 92vw);
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;

        h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
        }
        .muted {
            color: ${muted};
            margin: 0 0 12px 0;
        }
    `,

    ModalActions: styled.div`
        display: flex;
        justify-content: flex-end;
        gap: 10px;

        button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 10px 14px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
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
        }
        .ghost {
            background: ${bg};
        }
    `,
};

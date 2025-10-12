import styled, { keyframes } from "styled-components";

/* Theme tokens */
const bg = "var(--bg)";
const card = "var(--card)";
const text = "var(--text)";
const muted = "var(--muted)";
const border = "var(--border)";
const radius = "var(--radius)";
const shadow = "var(--shadow)";
const accent = "var(--accent)";
const danger = "var(--danger, #e5484d)";

const chomp = keyframes`
  0%   { clip-path: polygon(50% 50%, 100% 0%, 100% 100%); }
  50%  { clip-path: polygon(50% 50%, 100% 49%, 100% 51%); }
  100% { clip-path: polygon(50% 50%, 100% 0%, 100% 100%); }
`;

export const Styled = {
    Wrapper: styled.div`
        background: ${bg};
        color: ${text};
        padding: 16px;
        min-height: 100%;
    `,

    /* Center the whole app area as requested */
    Container: styled.div`
        max-width: 1440px;
        margin: 0 auto;
        display: grid;
        gap: 12px;
    `,

    TopBar: styled.div`
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;

        .left h1 {
            margin: 0;
            font-size: 20px;
        }
        .subtitle {
            margin: 4px 0 0;
            color: ${muted};
            font-size: 13px;
        }

        .right {
            display: flex;
            gap: 12px;
            align-items: center;
        }
        .stat {
            background: ${card};
            border: 1px solid ${border};
            border-radius: ${radius};
            box-shadow: ${shadow};
            padding: 6px 10px;
        }
        .label {
            color: ${muted};
            font-size: 11px;
            display: block;
        }
        .value {
            font-weight: 600;
            font-size: 14px;
        }
        .life {
            display: inline-block;
            width: 12px;
            height: 12px;
            margin-left: 4px;
            background: #f2d648;
            border-radius: 50%;
            position: relative;
        }
        .life::after {
            content: "";
            position: absolute;
            left: 50%;
            top: 50%;
            width: 100%;
            height: 100%;
            transform: translate(-50%, -50%) rotate(-45deg);
            background: linear-gradient(to right, transparent 50%, ${bg} 50%);
            border-radius: 50%;
            mix-blend-mode: multiply;
            opacity: 0.8;
        }
    `,

    Toolbar: styled.div`
        display: flex;
        gap: 8px;
        align-items: center;
        button {
            appearance: none;
            background: ${card};
            border: 1px solid ${border};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            box-shadow: ${shadow};
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
            color: ${text};
        }
        .spacer {
            flex: 1;
        }
    `,

    Help: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 10px 12px;
        font-size: 13px;
        color: ${text};
        em {
            color: ${accent};
            font-style: normal;
        }
    `,

    Board: styled.div`
        position: relative;
        background: #0a0b0d;
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 10px;

        .row {
            display: grid;
            grid-template-columns: repeat(
                ${(p) => p.$cols},
                1fr
            ); /* ✅ transient prop */
        }

        .cell {
            width: 24px;
            height: 24px;
            display: grid;
            place-items: center;
            position: relative;
        }

        .wall {
            background: #122033;
            border: 1px solid #173052;
        }
        .floor {
            background: #0a0b0d;
        }

        .dot {
            width: 5px;
            height: 5px;
            background: #d6e2ff;
            border-radius: 50%;
            box-shadow: 0 0 4px rgba(214, 226, 255, 0.6);
        }
        .power-dot {
            width: 10px;
            height: 10px;
            background: ${accent};
            border-radius: 50%;
            box-shadow: 0 0 6px ${accent};
        }

        .pacman {
            width: 18px;
            height: 18px;
            background: #f2d648;
            border-radius: 50%;
            position: relative;
            animation: ${chomp} 0.24s infinite linear;
        }
        .dir-left {
            transform: rotate(180deg);
        }
        .dir-right {
            transform: rotate(0deg);
        }
        .dir-up {
            transform: rotate(-90deg);
        }
        .dir-down {
            transform: rotate(90deg);
        }

        .ghost {
            width: 18px;
            height: 18px;
            background: var(--ghost, #ff4d4f);
            border-radius: 4px 4px 0 0;
            position: relative;
            box-shadow: 0 0 6px rgba(255, 255, 255, 0.08) inset;
        }
        .ghost::before,
        .ghost::after {
            content: "";
            position: absolute;
            top: 4px;
            width: 4px;
            height: 4px;
            background: #fff;
            border-radius: 50%;
        }
        .ghost::before {
            left: 4px;
        }
        .ghost::after {
            right: 4px;
        }
        .ghost.frightened {
            background: #3fb6ff;
        }

        .overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.35);
            display: grid;
            place-items: center;
            border-radius: ${radius};
            pointer-events: none;
        }
        .overlay span {
            background: rgba(0, 0, 0, 0.6);
            color: #fff;
            padding: 6px 10px;
            border-radius: 8px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
    `,

    Footer: styled.div`
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: ${muted};
        font-size: 12px;
        .meta {
            padding: 6px 0;
        }
    `,

    /* Confirm Modal */
    ModalBackdrop: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: grid;
        place-items: center;
        z-index: 50;
    `,
    Modal: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;
        width: min(92vw, 420px);
        h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
        }
        p {
            margin: 0 0 12px 0;
            color: ${text};
            font-size: 14px;
        }
    `,
    ModalActions: styled.div`
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        button {
            appearance: none;
            background: ${card};
            border: 1px solid ${border};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            &:hover {
                border-color: ${accent};
            }
        }
        .ghost {
            background: ${bg};
        }
        .danger {
            border-color: ${danger};
        }
    `,
};

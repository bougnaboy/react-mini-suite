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

const Styled = {
    Wrapper: styled.div`
        max-width: 1440px;
        margin: 0 auto;
        display: grid;
        gap: 16px;
        padding: 16px;
        background: ${bg};
        color: ${text};
        min-height: 100%;
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
        color: ${muted};
        border-radius: ${radius};
        background: ${bg};
        kbd {
            background: ${card};
            border: 1px solid ${border};
            padding: 0 6px;
            border-radius: 4px;
        }
    `,
    Bar: styled.div`
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 12px;
        .col {
            display: grid;
        }
        .label {
            color: ${muted};
            font-size: 12px;
        }
        .val {
            font-weight: 600;
        }
        .spacer {
            flex: 1;
        }
        .hint {
            color: ${muted};
            font-size: 12px;
        }
    `,
    DiceGrid: styled.div`
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 12px;
        @media (max-width: 520px) {
            grid-template-columns: repeat(2, 1fr);
        }
    `,
    Die: styled.button`
        position: relative;
        aspect-ratio: 1 / 1;
        width: 100%;
        min-height: 70px;
        background: ${bg};
        border: 1px solid ${border};
        border-radius: 12px;
        box-shadow: ${shadow};
        cursor: pointer;
        padding: 8px;
        transition: border-color 0.15s ease, transform 0.05s ease;
        &:hover {
            border-color: ${accent};
        }
        &:active {
            transform: translateY(1px);
        }

        &[data-held="1"] {
            background: linear-gradient(
                180deg,
                rgba(0, 0, 0, 0.04),
                rgba(0, 0, 0, 0.08)
            );
            border-color: ${accent};
        }

        .num {
            position: absolute;
            bottom: 6px;
            right: 8px;
            font-weight: 700;
            font-size: 14px;
            opacity: 0.5;
        }
        .idx {
            position: absolute;
            top: 6px;
            left: 8px;
            font-weight: 600;
            font-size: 12px;
            opacity: 0.5;
        }

        .pips {
            height: 100%;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, 1fr);
            place-items: center;
        }
        .pip {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: ${text};
            opacity: 0.9;
            transform: translateZ(0);
            box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
            visibility: hidden;
        }

        /* Show only required pips for each value (classic layout) */
        .value-1 .pip:nth-child(5) {
            visibility: visible;
        }
        .value-2 .pip:nth-child(1),
        .value-2 .pip:nth-child(9) {
            visibility: visible;
        }
        .value-3 .pip:nth-child(1),
        .value-3 .pip:nth-child(5),
        .value-3 .pip:nth-child(9) {
            visibility: visible;
        }
        .value-4 .pip:nth-child(1),
        .value-4 .pip:nth-child(3),
        .value-4 .pip:nth-child(7),
        .value-4 .pip:nth-child(9) {
            visibility: visible;
        }
        .value-5 .pip:nth-child(1),
        .value-5 .pip:nth-child(3),
        .value-5 .pip:nth-child(5),
        .value-5 .pip:nth-child(7),
        .value-5 .pip:nth-child(9) {
            visibility: visible;
        }
        .value-6 .pip:nth-child(1),
        .value-6 .pip:nth-child(3),
        .value-6 .pip:nth-child(4),
        .value-6 .pip:nth-child(6),
        .value-6 .pip:nth-child(7),
        .value-6 .pip:nth-child(9) {
            visibility: visible;
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
    Stats: styled.div`
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        @media (max-width: 720px) {
            grid-template-columns: 1fr;
        }
        .label {
            color: ${muted};
            font-size: 12px;
        }
        strong {
            font-size: 16px;
        }
    `,
    /* Win overlay + confetti */
    WinOverlay: styled.div`
        position: fixed;
        inset: 0;
        pointer-events: auto;
        display: grid;
        place-items: center;
        background: rgba(0, 0, 0, 0.15);
        z-index: 40;

        .panel {
            background: ${card};
            border: 1px solid ${border};
            border-radius: ${radius};
            padding: 16px;
            box-shadow: ${shadow};
            text-align: center;
            z-index: 2;
            display: grid;
            gap: 10px;
        }
        .panel h3 {
            margin: 0;
        }
        .panel p {
            margin: 0;
            color: ${muted};
        }

        /* ✅ Button styling for Play Again */
        .panel button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 10px 14px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            text-decoration: none;
            transition: transform 0.02s ease-in-out, border-color 0.15s ease;
            outline: none;
            margin-top: 4px;
            width: fit-content;
            justify-self: center;
        }
        .panel button:hover {
            border-color: ${accent};
        }
        .panel button:active {
            transform: translateY(1px);
        }
        .panel button.primary {
            background: ${accent};
            border-color: ${accent};
            color: #fff;
        }

        .confetti {
            position: absolute;
            top: -10px;
            left: 50%;
            width: 8px;
            height: 12px;
            background: ${accent};
            transform: translateX(-50%);
            border-radius: 2px;
            animation: fall 2.6s linear infinite;
            opacity: 0.85;
        }
        .confetti:nth-child(odd) {
            background: #ffd166;
        }
        .confetti:nth-child(3n) {
            background: #06d6a0;
        }
        .confetti:nth-child(4n) {
            background: #ef476f;
        }
        .confetti:nth-child(5n) {
            background: #8ecae6;
        }

        @keyframes fall {
            0% {
                transform: translateY(-10vh) rotate(0deg);
            }
            100% {
                transform: translateY(110vh) rotate(720deg);
            }
        }
    `,

    /* Confirm modal */
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
            font-size: 16px;
        }
        p {
            margin: 0 0 12px 0;
            color: ${muted};
            font-size: 14px;
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

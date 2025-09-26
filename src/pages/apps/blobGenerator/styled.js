import styled from "styled-components";

// Reuse your global CSS variables (dark theme)
const cardBg = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,0.25))";

const glass = "inset 0 1px 0 rgba(255,255,255,0.04)";

const Card = styled.div`
    background: ${cardBg};
    border: 1px solid ${border};
    border-radius: ${radius};
    box-shadow: ${shadow};
    padding: 16px;
`;

const ButtonBase = styled.button`
    background: ${(p) => (p.$variant === "ghost" ? "transparent" : accent)};
    color: ${(p) => (p.$variant === "ghost" ? text : "#0b0b0b")};
    border: 1px solid ${(p) => (p.$variant === "ghost" ? border : accent)};
    padding: 10px 14px;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
    transition: transform 0.08s ease, opacity 0.2s ease, background 0.2s ease;
    user-select: none;
    &:hover {
        transform: translateY(-1px);
    }
    &:active {
        transform: translateY(0);
        opacity: 0.9;
    }
`;

export const Styled = {
    Wrapper: styled.div`
        max-width: var(--maxw, 1200px);
        margin: 0 auto;
        padding: 20px;
        color: ${text};
    `,

    HeaderRow: styled.div`
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 16px;

        h2 {
            margin: 0;
            font-size: 22px;
            letter-spacing: 0.3px;
        }
    `,

    ButtonRow: styled.div`
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    `,

    Button: ButtonBase,

    Grid: styled.div`
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;

        @media (max-width: 980px) {
            grid-template-columns: 1fr;
        }
    `,

    PreviewCard: styled(Card)`
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        gap: 12px;
    `,

    ControlsCard: styled(Card)`
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
    `,

    Sizer: styled.div`
        /* Transient props so they don't leak to the DOM */
        width: ${(p) => p.$w || 360}px;
        height: ${(p) => p.$h || 360}px;
        display: grid;
        place-items: center;
        background: radial-gradient(
                100% 100% at 0% 0%,
                rgba(255, 255, 255, 0.04),
                transparent
            ),
            ${cardBg};
        border: 1px dashed ${border};
        border-radius: ${radius};
        box-shadow: ${glass};
        overflow: hidden;

        svg {
            display: block;
        }
    `,

    Help: styled.div`
        color: ${muted};
        font-size: 12.5px;
    `,

    Field: styled.label`
        display: grid;
        gap: 6px;

        > span,
        > label {
            font-size: 13px;
            color: ${muted};
        }

        input[type="number"],
        input[type="text"],
        input[type="color"],
        textarea {
            background: #0e0e0e;
            color: ${text};
            border: 1px solid ${border};
            border-radius: 10px;
            padding: 10px 12px;
            outline: none;
        }

        input[type="range"] {
            width: 100%;
        }
    `,

    FieldRow: styled.div`
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 10px;

        @media (max-width: 640px) {
            grid-template-columns: 1fr;
        }
    `,

    CodeBlock: styled.textarea`
        width: 100%;
        min-height: 120px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
        font-size: 12.5px;
        line-height: 1.5;
        background: #0b0b0b;
        border: 1px solid ${border};
        color: ${text};
        border-radius: 12px;
        padding: 12px;
        resize: vertical;
    `,
};

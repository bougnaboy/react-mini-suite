import styled from "styled-components";

const cardBg = "var(--card, #111)";
const text = "var(--text, #eaeaea)";
const muted = "var(--muted, #a8a8a8)";
const border = "var(--border, #242424)";
const accent = "var(--accent, #22c55e)";
const danger = "var(--danger, #ef4444)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 10px 30px rgba(0,0,0,0.35))";

export const Styled = {
    Wrapper: styled.div`
        width: 100%;
        display: grid;
        place-items: start center;
        padding: 24px;
        color: ${text};
    `,
    Card: styled.section`
        width: min(680px, 100%);
        background: ${cardBg};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 20px;
    `,
    Header: styled.header`
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        h2 {
            margin: 0 0 4px;
            font-size: 20px;
        }
        .muted {
            color: ${muted};
            margin: 0;
            font-size: 12px;
        }
    `,
    Tools: styled.div`
        display: flex;
        gap: 8px;
        button {
            border: 1px solid ${border};
            background: transparent;
            color: ${text};
            border-radius: 10px;
            padding: 8px 12px;
            cursor: pointer;
        }
        button:hover {
            border-color: ${accent};
        }
    `,
    SentRow: styled.div`
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: 12px;
        margin: 10px 0 6px;
        .label {
            color: ${muted};
            margin-right: 6px;
        }
        .value.ok {
            color: ${accent};
        }
        .value.muted {
            color: ${muted};
        }
        .cooldown {
            color: ${muted};
            font-size: 12px;
        }
        button {
            border: 1px solid ${border};
            background: ${text};
            color: #111;
            border-radius: 10px;
            padding: 6px 10px;
            cursor: pointer;
        }
    `,
    Inputs: styled.div`
        display: grid;
        grid-auto-flow: column;
        gap: 10px;
        justify-content: start;
        margin: 14px 0 6px;
    `,
    DigitInput: styled.input`
        width: 50px;
        height: 56px;
        text-align: center;
        font-size: 22px;
        border-radius: 12px;
        border: 1px solid ${border};
        background: transparent;
        color: ${text};
        outline: none;
        &:focus {
            border-color: ${accent};
            box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
        }
        &::placeholder {
            color: ${muted};
        }
    `,
    Actions: styled.div`
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 8px;
        button {
            border: 1px solid ${border};
            background: ${text};
            color: #111;
            border-radius: 10px;
            padding: 8px 12px;
            cursor: pointer;
        }
        .ghost {
            background: transparent;
            color: ${text};
            border-color: ${border};
        }
        .hint {
            color: ${muted};
            font-size: 12px;
        }
        code {
            color: ${text};
            opacity: 0.9;
        }
    `,
    Message: styled.div`
        margin-top: 12px;
        font-size: 14px;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid ${border};
        &[data-tone="ok"] {
            border-color: ${accent};
        }
        &[data-tone="error"] {
            border-color: ${danger};
        }
        &[data-tone="info"] {
            border-color: ${border};
        }
    `,
};

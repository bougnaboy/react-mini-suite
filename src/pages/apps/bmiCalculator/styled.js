import styled from "styled-components";

const cardBg = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,0.25))";
const accent = "var(--accent, #22c55e)";
const danger = "var(--danger, #ef4444)";
const warn = "var(--warn, #f59e0b)";

const focusRing = `
  outline: none;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.35);
`;

const Wrapper = styled.section`
    max-width: 860px;
    margin: 0 auto;
    padding: 24px 16px 48px;
    color: ${text};

    h2 {
        font-size: 26px;
        margin: 0 0 16px;
        letter-spacing: 0.3px;
    }
`;

const Card = styled.div`
    background: ${cardBg};
    border: 1px solid ${border};
    border-radius: ${radius};
    box-shadow: ${shadow};
    padding: 16px;
`;

const Row = styled.div`
    display: grid;
    grid-template-columns: 180px 1fr;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    .label {
        color: ${muted};
        font-size: 14px;
    }

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
        .label {
            margin-bottom: -6px;
        }
    }
`;

const Select = styled.select`
    background: #0d0d0d;
    border: 1px solid ${border};
    color: ${text};
    font-size: 14px;
    padding: 10px 12px;
    border-radius: 12px;
    width: 100%;

    &:focus {
        ${focusRing}
    }
`;

const InputGroup = styled.div`
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    background: #0d0d0d;
    border: 1px solid ${border};
    border-radius: 12px;
    overflow: hidden;

    input {
        border: 0;
        background: transparent;
        color: ${text};
        padding: 12px 12px;
        font-size: 15px;
    }
    input:focus {
        ${focusRing}
    }

    .suffix {
        padding: 10px 12px;
        color: ${muted};
        border-left: 1px solid ${border};
        font-size: 13px;
        min-width: 48px;
        text-align: center;
    }
`;

const InputGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const Buttons = styled.div`
    margin-top: 8px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;

    button {
        border: 1px solid ${border};
        background: #0b0b0b;
        color: ${text};
        padding: 10px 14px;
        font-size: 14px;
        border-radius: 12px;
        cursor: pointer;
        transition: transform 0.05s ease;
    }
    button:hover {
        border-color: ${muted};
    }
    button:active {
        transform: translateY(1px);
    }
    .ghost {
        opacity: 0.9;
    }
`;

const ResultCard = styled.div`
    background: ${cardBg};
    border: 1px solid ${border};
    border-radius: ${radius};
    box-shadow: ${shadow};
    padding: 16px;
    margin-top: 16px;

    .resultTop {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
    }

    .muted {
        color: ${muted};
        font-size: 13px;
    }
    .bmiValue {
        font-size: 36px;
        line-height: 1;
        margin-top: 6px;
    }
`;

const Badge = styled.span`
    --bg: ${({ $tone }) =>
        $tone === "good"
            ? "rgba(34,197,94,.12)"
            : $tone === "bad"
            ? "rgba(239,68,68,.12)"
            : $tone === "warn"
            ? "rgba(245,158,11,.12)"
            : "rgba(148,163,184,.10)"};
    --fg: ${({ $tone }) =>
        $tone === "good"
            ? accent
            : $tone === "bad"
            ? danger
            : $tone === "warn"
            ? warn
            : muted};

    background: var(--bg);
    color: var(--fg);
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 8px 12px;
    font-size: 13px;
    border-radius: 999px;
    white-space: nowrap;
`;

const HelpText = styled.div`
    color: ${muted};
    font-size: 14px;

    p {
        margin: 8px 0;
    }
    strong {
        color: ${text};
    }

    .fine {
        font-size: 12px;
        color: ${muted};
        opacity: 0.9;
    }
`;

export const Styled = {
    Wrapper,
    Card,
    Row,
    Select,
    InputGroup,
    InputGrid,
    Buttons,
    ResultCard,
    Badge,
    HelpText,
};

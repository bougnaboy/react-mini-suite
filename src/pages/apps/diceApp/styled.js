import styled from "styled-components";

const cardBg = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,0.25))";

const focusRing = `
  outline: 2px solid ${accent};
  outline-offset: 2px;
`;

const Wrapper = styled.main`
    width: 100%;
    max-width: 920px;
    margin: 0 auto;
    padding: 24px;

    .header {
        margin-bottom: 16px;
        h3 {
            margin: 0 0 6px 0;
            color: ${text};
        }
        .sub {
            margin: 0;
            color: ${muted};
            font-size: 0.95rem;
        }
    }
`;

const Controls = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    background: ${cardBg};
    border: 1px solid ${border};
    border-radius: ${radius};
    padding: 12px 12px;
    box-shadow: ${shadow};

    label {
        color: ${muted};
        font-size: 0.9rem;
    }
`;

const Select = styled.select`
    background: #0f0f0f;
    color: ${text};
    border: 1px solid ${border};
    border-radius: 10px;
    padding: 8px 10px;
    min-width: 64px;
    &:focus {
        ${focusRing}
    }
`;

const Button = styled.button`
    --btn-bg: ${(p) => (p.$variant === "ghost" ? "transparent" : accent)};
    --btn-fg: ${(p) => (p.$variant === "ghost" ? text : "#0b0b0b")};
    --btn-bd: ${(p) => (p.$variant === "ghost" ? border : "transparent")};

    background: var(--btn-bg);
    color: var(--btn-fg);
    border: 1px solid var(--btn-bd);
    border-radius: 12px;
    padding: 10px 14px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 120ms ease, opacity 120ms ease, background 120ms ease;
    &:hover {
        transform: translateY(-1px);
        opacity: 0.95;
    }
    &:active {
        transform: translateY(0);
        opacity: 1;
    }
    &:focus-visible {
        ${focusRing}
    }
`;

const DiceRow = styled.section`
    margin-top: 16px;
    background: ${cardBg};
    border: 1px solid ${border};
    border-radius: ${radius};
    padding: 16px;
    box-shadow: ${shadow};
    min-height: 110px;

    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 12px;

    .placeholder {
        color: ${muted};
        align-self: center;
    }
`;

const Die = styled.div`
    background: #0e0e0e;
    border: 1px solid ${border};
    border-radius: 18px;
    min-height: 92px;
    display: grid;
    place-items: center;
    position: relative;

    .glyph {
        font-size: 44px;
        line-height: 1;
    }
    .value {
        position: absolute;
        right: 10px;
        bottom: 8px;
        font-size: 0.9rem;
        color: ${muted};
    }
`;

const StatsRow = styled.div`
    margin-top: 12px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;

    .stat {
        background: ${cardBg};
        border: 1px solid ${border};
        border-radius: ${radius};
        padding: 10px 12px;
        box-shadow: ${shadow};
        display: flex;
        align-items: center;
        justify-content: space-between;
        .label {
            color: ${muted};
            font-size: 0.9rem;
        }
        .value {
            color: ${text};
            font-weight: 700;
        }
    }

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

const History = styled.section`
    margin-top: 16px;

    h4 {
        margin: 0 0 8px 0;
        color: ${text};
    }
    .muted {
        color: ${muted};
    }
`;

const HistoryList = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 8px;

    li {
        background: ${cardBg};
        border: 1px solid ${border};
        border-radius: ${radius};
        padding: 10px 12px;
        box-shadow: ${shadow};
        display: grid;
        gap: 4px;
    }

    .line {
        display: flex;
        gap: 8px;
        align-items: center;
        .values {
            color: ${text};
            font-weight: 600;
        }
        .total {
            color: ${muted};
        }
    }

    .time {
        color: ${muted};
        font-size: 0.85rem;
    }
`;

export const Styled = {
    Wrapper,
    Controls,
    Select,
    Button,
    DiceRow,
    Die,
    StatsRow,
    History,
    HistoryList,
};

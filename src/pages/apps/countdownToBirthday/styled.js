import styled from "styled-components";

const text = "var(--text, #eaeaea)";
const muted = "var(--muted, #a8a8a8)";
const border = "var(--border, #242424)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,0.25))";
const maxw = "var(--maxw, 960px)";

const Wrapper = styled.section`
    max-width: ${maxw};
    margin: 0 auto;
    padding: 24px;
    color: ${text};

    .head {
        margin-bottom: 16px;
        h3 {
            margin: 0 0 6px;
        }
        .muted {
            color: ${muted};
            font-size: 0.95rem;
        }
    }
`;

const Card = styled.div`
    background: var(--card, #111);
    border: 1px solid ${border};
    border-radius: ${radius};
    box-shadow: ${shadow};
    padding: 16px;
    margin-bottom: 18px;
`;

const Row = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 12px;
    align-items: end;

    label {
        display: grid;
        gap: 8px;
    }

    .actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }

    @media (max-width: 720px) {
        grid-template-columns: 1fr;
        .actions {
            justify-content: flex-start;
        }
    }
`;

const Input = styled.input`
    background: #0f0f0f;
    color: ${text};
    border: 1px solid ${border};
    border-radius: 12px;
    padding: 12px 14px;
    outline: none;
    width: 100%;

    &:focus {
        border-color: ${accent};
        box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
    }
`;

const Button = styled.button`
    border: 1px solid ${(p) => (p.$tone === "ghost" ? border : accent)};
    background: ${(p) => (p.$tone === "ghost" ? "transparent" : accent)};
    color: ${(p) => (p.$tone === "ghost" ? text : "#041107")};
    padding: 11px 14px;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;

    &:hover {
        filter: brightness(1.05);
    }
`;

const Help = styled.p`
    margin: 8px 2px 0;
    color: ${muted};
    font-size: 0.95rem;
`;

const Countdown = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 18px;
    margin: 6px 0 14px;
    background: #0f0f0f;
    border: 1px solid ${border};
    border-radius: ${radius};

    .sep {
        opacity: 0.6;
        font-weight: 700;
        font-size: 1.6rem;
    }

    .block {
        text-align: center;
        min-width: 88px;
    }
    .block strong {
        display: block;
        font-size: clamp(28px, 6vw, 44px);
        line-height: 1.1;
        letter-spacing: 1px;
    }
    .block span {
        color: ${muted};
        font-size: 0.9rem;
    }

    @media (max-width: 560px) {
        gap: 10px;
        .block {
            min-width: 70px;
        }
    }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;

    @media (max-width: 720px) {
        grid-template-columns: repeat(2, 1fr);
    }
`;

const Stat = styled.div`
    background: var(--card, #111);
    border: 1px solid ${border};
    border-radius: 14px;
    padding: 12px;

    .label {
        display: block;
        color: ${muted};
        font-size: 0.9rem;
        margin-bottom: 6px;
    }
    .val {
        font-weight: 600;
        font-size: 1.05rem;
    }
`;

export const Styled = {
    Wrapper,
    Card,
    Row,
    Input,
    Button,
    Help,
    Countdown,
    Grid,
    Stat,
};

import styled from "styled-components";

const bg = "var(--bg, #0b0b0b)";
const card = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #a8a8a8)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const danger = "var(--danger, #ef4444)";
const info = "var(--info, #38bdf8)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,.25))";

const Wrapper = styled.div`
    color: ${text};
    max-width: 820px;
    margin: 0 auto;
    padding: 24px 16px;

    .head {
        margin-bottom: 16px;
        h2 {
            margin: 0 0 6px;
            font-weight: 600;
        }
        .sub {
            margin: 0;
            color: ${muted};
            font-size: 0.95rem;
        }
    }
`;

const Card = styled.section`
    background: ${card};
    border: 1px solid ${border};
    border-radius: ${radius};
    box-shadow: ${shadow};
    padding: 16px;
    margin-bottom: 20px;

    label {
        display: block;
        font-size: 0.95rem;
        color: ${muted};
        margin-bottom: 8px;
    }
`;

const Input = styled.input`
    width: 100%;
    background: ${bg};
    color: ${text};
    border: 1px solid ${border};
    border-radius: 12px;
    padding: 12px 14px;
    font-size: 1.05rem;
    outline: none;
    transition: border-color 0.15s ease;

    &:focus {
        border-color: ${accent};
    }
`;

const Row = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 12px;

    &.statusRow .len {
        margin-left: auto;
        color: ${muted};
        font-size: 0.9rem;
    }

    &.actions {
        justify-content: flex-end;
        gap: 8px;

        button {
            background: transparent;
            color: ${text};
            border: 1px solid ${border};
            border-radius: 10px;
            padding: 8px 12px;
            font-size: 0.95rem;
            cursor: pointer;
            transition: border-color 0.15s ease, transform 0.02s ease;

            &:hover {
                border-color: ${accent};
            }
            &:active {
                transform: translateY(1px);
            }
            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        }
    }
`;

// transient prop $tone to avoid unknown-prop warnings
const Pill = styled.span`
    display: inline-block;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 0.85rem;
    border: 1px solid ${border};
    background: ${({ $tone }) =>
        $tone === "ok"
            ? "rgba(34,197,94,.15)"
            : $tone === "bad"
            ? "rgba(239,68,68,.15)"
            : $tone === "info"
            ? "rgba(56,189,248,.15)"
            : "transparent"};
    color: ${({ $tone }) =>
        $tone === "ok"
            ? accent
            : $tone === "bad"
            ? danger
            : $tone === "info"
            ? info
            : muted};
`;

const Section = styled.section`
    h4 {
        margin: 0 0 10px;
        font-weight: 600;
    }
    .examples {
        list-style: none;
        padding: 0;
        margin: 0 0 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    .examples li button {
        background: ${card};
        border: 1px solid ${border};
        color: ${text};
        border-radius: 10px;
        padding: 6px 10px;
        cursor: pointer;
        font-size: 0.9rem;
    }
    .examples li button:hover {
        border-color: ${accent};
    }
    .note {
        color: ${muted};
        margin: 6px 0 0;
        font-size: 0.92rem;
    }
`;

export const Styled = { Wrapper, Card, Input, Row, Pill, Section };

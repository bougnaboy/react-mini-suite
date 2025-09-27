import styled from "styled-components";

const bg = "var(--bg, #0b0b0b)";
const card = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,0.25))";
const maxw = "var(--maxw, 1440px)";

export const Styled = {
    Wrapper: styled.div`
        max-width: ${maxw};
        margin: 0 auto;
        padding: 24px;

        header {
            margin-bottom: 16px;
            h2 {
                margin: 0 0 6px;
                font-weight: 700;
                letter-spacing: 0.3px;
            }
            .sub {
                margin: 0;
                color: ${muted};
                font-size: 0.95rem;
            }
        }
    `,

    DateRow: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 12px 16px;
        margin-bottom: 16px;

        display: grid;
        grid-template-columns: 220px 1fr auto;
        align-items: end;
        gap: 12px;

        label {
            display: grid;
            gap: 6px;
            span {
                font-size: 0.9rem;
                color: ${muted};
            }
            input[type="date"] {
                background: ${bg};
                color: ${text};
                border: 1px solid ${border};
                border-radius: 10px;
                padding: 10px 12px;
                outline: none;
            }
        }
        .pretty {
            /* border: 1px solid #f00; */
            align-self: end;
            color: ${text};
            font-weight: 600;
            height: 40px;
            display: flex;
            align-items: center;
        }
        .info {
            align-self: center;
            font-size: 0.9rem;
            color: ${muted};
            white-space: nowrap;
        }

        @media (max-width: 900px) {
            grid-template-columns: 1fr;
            .pretty,
            .info {
                align-self: start;
            }
        }
    `,

    Controls: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;
        margin-bottom: 20px;

        display: grid;
        grid-template-columns: repeat(4, minmax(160px, 1fr)) auto;
        gap: 12px;
        align-items: end;

        opacity: ${(p) => (p.$disabled ? 0.7 : 1)};

        label {
            display: grid;
            gap: 6px;
            span {
                font-size: 0.9rem;
                color: ${muted};
            }
            select {
                background: ${bg};
                color: ${text};
                border: 1px solid ${border};
                border-radius: 10px;
                padding: 10px 12px;
                outline: none;
            }
            select:disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }
        }

        .btns {
            display: flex;
            gap: 10px;
            align-items: center;

            button {
                border: 1px solid ${border};
                background: ${bg};
                color: ${text};
                border-radius: 10px;
                padding: 10px 14px;
                cursor: pointer;
                transition: transform 120ms ease, border-color 120ms ease,
                    opacity 120ms ease;
            }
            button:hover {
                transform: translateY(-1px);
                border-color: ${accent};
            }
            .save {
                background: ${accent};
                color: #0b0b0b;
                border-color: ${accent};
            }
            button:disabled {
                opacity: 0.45;
                cursor: not-allowed;
                transform: none;
            }
        }

        @media (max-width: 960px) {
            grid-template-columns: 1fr 1fr;
            .btns {
                grid-column: 1 / -1;
            }
        }
    `,

    PlanCard: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;

        .plan-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-bottom: 10px;

            .tag {
                margin-left: 8px;
                font-size: 0.8rem;
                background: ${accent};
                color: #0b0b0b;
                padding: 2px 8px;
                border-radius: 999px;
            }
            .tag.outline {
                background: transparent;
                color: ${accent};
                border: 1px solid ${accent};
            }

            .meta {
                display: flex;
                gap: 10px;
                color: ${muted};
                font-size: 0.9rem;
                flex-wrap: wrap;
            }
        }

        section {
            margin-top: 12px;
            h4 {
                margin: 0 0 8px;
            }
            ol {
                margin: 0;
                padding-left: 18px;
                display: grid;
                gap: 6px;
            }
            li {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                padding: 8px 10px;
                border: 1px solid ${border};
                border-radius: 10px;
                background: ${bg};
            }
            .ex {
                font-weight: 600;
            }
            .set {
                color: ${muted};
            }
        }

        .note {
            margin-top: 16px;
            color: ${muted};
            font-size: 0.9rem;
        }
    `,

    Empty: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;
        color: ${muted};
        margin-bottom: 16px;
    `,
};

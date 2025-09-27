import styled from "styled-components";

const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const cardBg = "var(--card, #111)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,0.25))";

export const Styled = {
    Wrapper: styled.section`
        width: 100%;
        max-width: 1000px;
        margin: 0 auto;
        padding: 24px;

        .header {
            margin-bottom: 12px;
            h2 {
                margin: 0 0 6px;
                font-weight: 700;
                line-height: 1.2;
                color: ${text};
            }
            .muted {
                margin: 0;
                color: ${muted};
                font-size: 14px;
            }
        }
    `,

    Toolbar: styled.div`
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 10px;
        align-items: center;
        margin: 14px 0 18px;

        input {
            background: ${cardBg};
            border: 1px solid ${border};
            color: ${text};
            border-radius: ${radius};
            padding: 12px 14px;
            outline: none;
            transition: border-color 120ms ease;
        }
        input:focus {
            border-color: ${accent};
        }

        .clearBtn {
            background: transparent;
            border: 1px solid ${border};
            color: ${muted};
            border-radius: ${radius};
            padding: 10px 14px;
            cursor: pointer;
        }
        .clearBtn:hover {
            border-color: ${accent};
            color: ${text};
        }

        .count {
            color: ${muted};
            font-size: 13px;
            user-select: none;
        }

        .visually-hidden {
            position: absolute !important;
            height: 1px;
            width: 1px;
            overflow: hidden;
            clip: rect(1px, 1px, 1px, 1px);
            white-space: nowrap;
        }
    `,

    Grid: styled.div`
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 12px;

        .empty {
            grid-column: 1 / -1;
            color: ${muted};
            padding: 24px;
            border: 1px dashed ${border};
            border-radius: ${radius};
            text-align: center;
        }

        .card {
            display: grid;
            grid-template-columns: 56px 1fr;
            align-items: center;
            gap: 10px;
            background: ${cardBg};
            border: 1px solid ${border};
            border-radius: ${radius};
            box-shadow: ${shadow};
            padding: 12px;
            text-align: left;
            cursor: pointer;
            position: relative;
            transition: transform 120ms ease, border-color 120ms ease;
        }
        .card:hover {
            transform: translateY(-2px);
            border-color: ${accent};
        }

        .emoji {
            font-size: 34px;
            line-height: 1;
        }

        .meta {
            display: grid;
            gap: 4px;
            .name {
                color: ${text};
                font-size: 15px;
                font-weight: 600;
            }
            .tags {
                color: ${muted};
                font-size: 12px;
            }
        }

        .copied {
            position: absolute;
            top: 8px;
            right: 10px;
            font-size: 12px;
            color: ${accent};
        }
    `,
};

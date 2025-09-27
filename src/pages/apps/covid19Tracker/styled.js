import styled from "styled-components";

const card = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const danger = "var(--danger, #ef4444)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,0.25))";

export const Styled = {
    Wrapper: styled.section`
        max-width: 1120px;
        margin: 0 auto;
        padding: 24px;
        color: ${text};

        .header {
            display: flex;
            gap: 16px;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;

            h2 {
                font-size: 20px;
                font-weight: 600;
                letter-spacing: 0.2px;
            }

            .controls {
                display: flex;
                align-items: center;
                gap: 10px;
                select {
                    background: ${card};
                    color: ${text};
                    border: 1px solid ${border};
                    padding: 8px 10px;
                    border-radius: 10px;
                    outline: none;
                }
                .refreshBtn {
                    background: ${accent};
                    color: #0b0b0b;
                    border: 0;
                    padding: 8px 12px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                }
                .refreshBtn[disabled] {
                    opacity: 0.6;
                    cursor: default;
                }
            }
        }

        .error {
            background: #1a1a1a;
            border: 1px solid ${border};
            color: ${danger};
            padding: 12px 14px;
            border-radius: ${radius};
            margin-bottom: 12px;
        }

        .statsGrid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 14px;
            @media (max-width: 1200px) {
                grid-template-columns: repeat(3, 1fr);
            }
            @media (max-width: 720px) {
                grid-template-columns: repeat(2, 1fr);
            }
            @media (max-width: 480px) {
                grid-template-columns: 1fr;
            }

            .card {
                background: ${card};
                border: 1px solid ${border};
                border-radius: ${radius};
                box-shadow: ${shadow};
                padding: 14px;
                display: flex;
                flex-direction: column;
                gap: 6px;
                min-height: 110px;
                h4 {
                    font-size: 12px;
                    color: ${muted};
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                }
                .big {
                    font-size: 22px;
                    font-weight: 700;
                    line-height: 1.2;
                }
                .delta {
                    font-size: 12px;
                    color: ${muted};
                }
            }

            .cases .big {
                color: #eab308;
            }
            .active .big {
                color: #60a5fa;
            }
            .recovered .big {
                color: #22c55e;
            }
            .deaths .big {
                color: #f87171;
            }
            .tests .big {
                color: #a78bfa;
            }
            .population .big {
                color: #f59e0b;
            }
        }

        .meta {
            margin-top: 14px;
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            color: ${muted};
            a {
                color: ${accent};
                text-decoration: none;
            }
        }

        .notice {
            margin-top: 14px;
            background: #0f0f0f;
            border: 1px solid ${border};
            border-left: 3px solid ${accent};
            border-radius: ${radius};
            padding: 12px 14px;
            color: ${muted};

            h5 {
                margin: 0 0 6px 0;
                color: ${text};
                font-size: 14px;
            }
            ul {
                margin: 6px 0 0 18px;
                padding: 0;
            }
            li {
                margin: 4px 0;
            }
        }

        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
    `,
};

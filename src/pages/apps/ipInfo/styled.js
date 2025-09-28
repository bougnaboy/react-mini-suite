import styled from "styled-components";

const card = "var(--card, #0f1012)";
const text = "var(--text, #eaeaea)";
const muted = "var(--muted, #a8a8a8)";
const border = "var(--border, #242424)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 10px 30px rgba(0,0,0,0.35))";

export const Styled = {
    Wrapper: styled.div`
        display: flex;
        flex-direction: column;
        gap: 16px;
        color: ${text};
        margin: auto;
        padding: 15px;
        max-width: 1440px;
    `,
    Header: styled.header`
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};

        .title {
            font-size: 20px;
            font-weight: 600;
            letter-spacing: 0.2px;
        }
        .actions {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        button {
            padding: 8px 12px;
            border: 1px solid ${border};
            border-radius: 10px;
            background: #141414;
            color: ${text};
            font-size: 14px;
            cursor: pointer;
        }
        button:hover {
            border-color: ${accent};
        }
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    `,
    Card: styled.section`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 14px;
    `,
    Grid: styled.div`
        display: grid;
        grid-template-columns: 180px 1fr;
        gap: 8px 12px;
        align-items: center;

        span {
            color: ${muted};
            font-size: 13px;
        }
        .val {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
        }
        code {
            background: #121212;
            border: 1px solid ${border};
            padding: 2px 6px;
            border-radius: 8px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas,
                "Liberation Mono", monospace;
            font-size: 13px;
            color: ${text};
        }
        a {
            color: ${text};
            border-bottom: 1px dotted ${muted};
            text-decoration: none;
        }
        .ua {
            word-break: break-all;
            opacity: 0.9;
        }
        button {
            padding: 6px 10px;
            border: 1px solid ${border};
            border-radius: 10px;
            background: #161616;
            color: ${text};
            font-size: 13px;
            cursor: pointer;
        }
        button:hover {
            border-color: ${accent};
        }
    `,
    FootNote: styled.div`
        margin-top: 10px;
        font-size: 12px;
        color: ${muted};
    `,
};

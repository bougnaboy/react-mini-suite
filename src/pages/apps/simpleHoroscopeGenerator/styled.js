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
        max-width: 1440px;
        padding: 15px;
        margin: auto;
    `,
    Header: styled.header`
        display: flex;
        justify-content: space-between;
        align-items: center;
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
            gap: 8px;
            align-items: center;
            flex-wrap: wrap;
        }
        select,
        input[type="date"],
        button {
            padding: 8px 10px;
            border: 1px solid ${border};
            border-radius: 10px;
            background: #141414;
            color: ${text};
            font-size: 14px;
            outline: none;
        }
        button:hover {
            border-color: ${accent};
        }
        button:active {
            transform: translateY(1px);
        }
    `,
    Body: styled.div`
        display: grid;
        gap: 16px;
    `,
    Card: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;

        .head .title {
            font-size: 18px;
            font-weight: 600;
        }
        .head .date {
            color: ${muted};
            font-size: 13px;
        }
        .line {
            font-size: 14px;
            line-height: 1.7;
            margin: 6px 0;
        }
    `,
    Separator: styled.hr`
        border: none;
        border-top: 1px solid ${border};
        margin: 10px 0 12px;
        opacity: 0.6;
    `,
    Meta: styled.div`
        margin-top: 10px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        color: ${muted};
        font-size: 13px;

        .pill {
            border: 1px solid ${border};
            border-radius: 999px;
            padding: 3px 8px;
        }
    `,
};

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
        padding: 15px;
        max-width: 1440px;
        margin: auto;
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
        .controls {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
        }
        input {
            width: 280px;
            max-width: 52vw;
            background: #0b0b0b;
            border: 1px solid ${border};
            border-radius: 10px;
            padding: 8px 10px;
            color: ${text};
            outline: none;
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
        .split {
            width: 8px;
        }
        .active {
            border-color: ${accent};
            outline: 1px solid ${accent};
        }
    `,
    Body: styled.div`
        display: grid;
        grid-template-columns: 320px 1fr;
        gap: 16px;

        @media (max-width: 980px) {
            grid-template-columns: 1fr;
        }
    `,
    Sidebar: styled.aside`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 12px;

        .row.head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;

            .saveButton {
                border: 1px solid #f00;
                padding: 8px 12px;
                border: 1px solid ${border};
                border-radius: 10px;
                background: #141414;
                color: ${text};
                font-size: 14px;
                cursor: pointer;

                &:hover {
                    border-color: ${accent};
                }
            }
        }
        .muted {
            color: ${muted};
            font-size: 13px;
        }
        .chips {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 8px;
        }
        .chip {
            display: inline-flex;
            align-items: center;
            border: 1px solid ${border};
            background: #121212;
            border-radius: 999px;
            overflow: hidden;
        }
        .chip .pick {
            padding: 6px 10px;
            color: ${text};
            background: transparent;
            border: none;
            cursor: pointer;
        }
        .chip .del {
            padding: 6px 10px;
            border-left: 1px solid ${border};
            background: #181818;
            color: ${muted};
            cursor: pointer;
        }
        .chip .del:hover {
            color: #ff6666;
        }
        .note {
            margin-top: 12px;
            color: ${muted};
            font-size: 12px;
        }
    `,
    Stage: styled.div`
        display: grid;
        align-content: start;
        gap: 12px;
    `,
    Error: styled.div`
        background: #2c0f12;
        border: 1px solid #5a1b21;
        color: #ff9aa2;
        border-radius: ${radius};
        padding: 10px 12px;
        font-size: 14px;
    `,
    Hint: styled.div`
        text-align: center;
        color: ${muted};
        font-size: 14px;
        padding: 20px 0;
    `,
    ForecastCard: styled.section`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 12px;

        .head {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            border-bottom: 1px solid ${border};
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        .city {
            font-size: 18px;
            font-weight: 600;
        }
        .meta {
            color: ${muted};
            font-size: 12px;
            margin-top: 2px;
        }
        .now {
            font-size: 22px;
            font-weight: 700;
        }

        .legend {
            display: grid;
            grid-template-columns: 1fr 1fr 80px;
            gap: 8px;
            color: ${muted};
            font-size: 12px;
            margin-bottom: 4px;
        }

        .rows {
            display: grid;
            grid-template-columns: 1fr 1fr 80px;
            gap: 8px;
        }
        .row {
            display: contents;
        }
        .d,
        .t,
        .p {
            padding: 8px 0;
            border-bottom: 1px dashed ${border};
        }
        .t {
            text-align: left;
        }
        .p {
            text-align: right;
        }
        .max {
            font-weight: 600;
        }
        .min {
            color: ${muted};
        }
        .sep {
            color: ${muted};
        }

        .actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
            margin-top: 10px;
        }
        .actions button {
            padding: 8px 12px;
            border: 1px solid ${border};
            border-radius: 10px;
            background: #141414;
            color: ${text};
            font-size: 14px;
            cursor: pointer;
        }
        .actions button:hover {
            border-color: ${accent};
        }
    `,
};

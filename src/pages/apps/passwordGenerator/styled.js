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
        margin: auto;
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
            gap: 8px;
        }

        button {
            padding: 8px 12px;
            border: 1px solid ${border};
            border-radius: 10px;
            background: #141414;
            color: ${text};
            cursor: pointer;
            font-size: 14px;
        }
        button:hover {
            border-color: ${accent};
        }
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
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

        input[type="range"] {
            width: 100%;
        }

        label {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 4px 0;
            font-size: 14px;
            color: ${text};
        }
    `,
    Group: styled.div`
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 8px 0;
    `,
    Row: styled.div`
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        .ghost {
            background: transparent;
        }
        button {
            padding: 8px 12px;
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
    Label: styled.div`
        font-size: 12px;
        color: ${muted};
    `,
    Separator: styled.hr`
        border: none;
        border-top: 1px solid ${border};
        margin: 10px 0;
        opacity: 0.6;
    `,
    Main: styled.div`
        display: grid;
        gap: 16px;
        align-content: start;
    `,
    OutputCard: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 12px;
        display: grid;
        gap: 10px;
    `,
    PassBox: styled.div`
        min-height: 56px;
        display: flex;
        align-items: center;
        padding: 10px 12px;
        border: 1px dashed ${border};
        border-radius: 10px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas,
            "Liberation Mono", monospace;
        font-size: 18px;
        letter-spacing: 0.5px;
        word-break: break-all;

        .muted {
            color: ${muted};
        }
    `,
    Bar: styled.div`
        height: 8px;
        border-radius: 999px;
        background: #171717;
        border: 1px solid ${border};
        overflow: hidden;

        span {
            display: block;
            height: 100%;
            background: ${accent};
            transition: width 0.25s ease;
            width: 0%;
        }
    `,
    HistoryCard: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 12px;

        .h-title {
            font-weight: 600;
            margin-bottom: 8px;
        }
        .muted {
            color: ${muted};
        }
    `,
    HistoryList: styled.ul`
        display: grid;
        gap: 8px;
        list-style: none;
        padding: 0;
        margin: 0;

        li {
            display: grid;
            gap: 2px;
            padding: 8px 10px;
            border: 1px solid ${border};
            border-radius: 10px;
            background: #111;
        }
        .pwd {
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas,
                "Liberation Mono", monospace;
            font-size: 14px;
            word-break: break-all;
        }
        .meta {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            color: ${muted};
            font-size: 12px;
        }
    `,
};

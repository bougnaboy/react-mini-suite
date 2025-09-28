import styled from "styled-components";

const card = "var(--card, #0f1012)";
const text = "var(--text, #eaeaea)";
const muted = "var(--muted, #a8a8a8)";
const border = "var(--border, #242424)";
const accent = "var(--accent, #22c55e)";
const danger = "var(--danger, #ef4444)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 10px 30px rgba(0,0,0,0.35))";

export const Styled = {
    Wrapper: styled.div`
        display: flex;
        flex-direction: column;
        gap: 16px;
        color: ${text};
        max-width: 1440px;
        margin: auto;
        padding: 15px;
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
        }
        .actions {
            display: flex;
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
    `,
    SectionTitle: styled.div`
        font-weight: 600;
        font-size: 13px;
        margin: 6px 0 8px;
        color: ${muted};
    `,
    Chips: styled.div`
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 10px;

        .chip {
            padding: 6px 10px;
            border: 1px solid ${border};
            border-radius: 999px;
            background: #131313;
            color: ${text};
            font-size: 13px;
            cursor: pointer;
            transition: border-color 0.15s ease;
        }
        .chip[data-active="1"] {
            border-color: ${accent};
            outline: 1px solid ${accent};
        }
    `,
    Row: styled.div`
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 8px 0 6px;

        .toggle {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: ${muted};
            user-select: none;
        }
        input[type="checkbox"] {
            width: 16px;
            height: 16px;
        }
    `,
    SmallMuted: styled.div`
        color: ${muted};
        font-size: 12px;
    `,
    Main: styled.div`
        display: grid;
        gap: 12px;
    `,
    Toolbar: styled.div`
        display: flex;
        gap: 10px;
        align-items: center;

        button {
            padding: 8px 12px;
            border: 1px solid ${border};
            border-radius: 10px;
            background: #161616;
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
    Card: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;

        .title {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 4px;
        }
        .meta {
            color: ${muted};
            font-size: 14px;
            margin-bottom: 8px;
        }
        .chips {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin: 8px 0 10px;
        }
        .chip {
            font-size: 12px;
            border: 1px solid ${border};
            padding: 4px 8px;
            border-radius: 999px;
            color: ${text};
        }
        .blurb {
            font-size: 14px;
            color: ${text};
            opacity: 0.95;
        }
        hr {
            border: none;
            border-top: 1px solid ${border};
            margin: 12px 0;
            opacity: 0.6;
        }
        .best {
            font-size: 13px;
            color: ${muted};
        }
    `,
    Hint: styled.div`
        text-align: center;
        color: ${muted};
        font-size: 14px;
        padding: 20px 0 6px;
    `,
    H2: styled.div`
        font-size: 16px;
        font-weight: 600;
        margin-top: 8px;
    `,
    HistoryGrid: styled.div`
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 10px;
    `,
    HistoryCard: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        padding: 12px;
        box-shadow: ${shadow};

        .t {
            font-weight: 600;
            margin-bottom: 4px;
        }
        .m {
            color: ${muted};
            font-size: 13px;
            margin-bottom: 8px;
        }
        .chips {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 10px;
        }
        .chip {
            font-size: 11px;
            border: 1px solid ${border};
            padding: 3px 8px;
            border-radius: 999px;
        }
        .row {
            display: flex;
            gap: 8px;
        }
        .ghost {
            background: transparent;
            border: 1px solid ${border};
            color: ${text};
        }
        button {
            padding: 6px 10px;
            border-radius: 10px;
            background: #161616;
            color: ${text};
            border: 1px solid ${border};
            cursor: pointer;
            font-size: 13px;
        }
        button:hover {
            border-color: ${accent};
        }
    `,
    ModalBackdrop: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `,
    ModalCard: styled.div`
        width: min(420px, 92vw);
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;

        .title {
            font-weight: 600;
            margin-bottom: 6px;
            color: ${text};
        }
        .msg {
            color: ${muted};
            font-size: 14px;
            margin-bottom: 12px;
        }
        .row {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
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
        .ghost {
            background: transparent;
        }
        .danger {
            background: #1a0f10;
            border-color: ${danger};
        }
    `,
};

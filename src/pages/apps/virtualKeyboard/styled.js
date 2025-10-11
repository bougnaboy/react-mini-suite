import styled from "styled-components";

/* theme tokens */
const bg = "var(--bg)";
const card = "var(--card)";
const text = "var(--text)";
const muted = "var(--muted)";
const border = "var(--border)";
const radius = "var(--radius)";
const shadow = "var(--shadow)";
const accent = "var(--accent)";
const danger = "var(--danger, #e5484d)";

export const Styled = {
    Wrapper: styled.div`
        /* page container */
        max-width: 1440px; /* as requested */
        margin: 0 auto; /* as requested */
        padding: 16px;
        background: ${bg};
        color: ${text};
        display: grid;
        gap: 16px;
        min-height: 100%;
    `,

    Header: styled.header`
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;

        h1 {
            margin: 0 0 6px 0;
            font-size: 20px;
            line-height: 1.2;
        }
        p {
            margin: 0;
            font-size: 14px;
            color: ${muted};
        }

        @media (max-width: 720px) {
            align-items: flex-start;
            flex-direction: column;
        }
    `,

    HeaderActions: styled.div`
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;

        .checkbox {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: ${text};
        }

        button {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            box-shadow: ${shadow};
        }
        .ghost {
            background: ${bg};
        }
    `,

    Layout: styled.div`
        display: grid;
        grid-template-columns: 1.5fr 1fr;
        gap: 16px;
        @media (max-width: 1024px) {
            grid-template-columns: 1fr;
        }
        .col {
            display: grid;
            gap: 16px;
            align-content: start;
        }
    `,

    Card: styled.section`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;
        overflow: hidden;

        h3 {
            margin: 0 0 12px 0;
            font-size: 16px;
        }
        .tips {
            margin: 0;
            padding-left: 18px;
            color: ${muted};
            font-size: 14px;
        }
    `,

    EditorHeader: styled.div`
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;
        .meta {
            display: flex;
            gap: 12px;
            color: ${muted};
            font-size: 13px;
        }
        .actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        button {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            transition: border-color 0.15s ease, transform 0.02s ease-in-out;
            &:hover {
                border-color: ${accent};
            }
            &:active {
                transform: translateY(1px);
            }
        }
        .ghost {
            background: ${bg};
        }
        .danger {
            border-color: ${danger};
            color: ${text};
        }
    `,

    Textarea: styled.textarea`
        width: 100%;
        min-height: 220px;
        resize: vertical;
        border: 1px solid ${border};
        background: ${bg};
        color: ${text};
        border-radius: calc(${radius} - 2px);
        padding: 12px;
        font: inherit;
        line-height: 1.5;
        outline: none;
        transition: border-color 0.15s ease;

        &:focus {
            border-color: ${accent};
        }
    `,

    Keyboard: styled.div`
        display: grid;
        gap: 8px;
        .row {
            display: flex;
            gap: 8px;
            flex-wrap: nowrap;
        }
        .row-aux {
            justify-content: flex-end;
        }
    `,

    Key: styled.button`
        position: relative;
        border: 1px solid ${border};
        background: ${bg};
        color: ${text};
        border-radius: calc(${radius} - 2px);
        padding: 10px 12px;
        min-width: ${(p) => (p.$space ? "240px" : p.$wide ? "88px" : "44px")};
        text-align: center;
        font: inherit;
        cursor: pointer;
        user-select: none;
        box-shadow: ${shadow};
        transition: border-color 0.12s ease, transform 0.02s ease-in-out,
            background 0.12s ease;

        &.active,
        &:hover {
            border-color: ${accent};
        }
        &:active {
            transform: translateY(1px);
        }

        @media (max-width: 860px) {
            min-width: ${(p) =>
                p.$space ? "140px" : p.$wide ? "68px" : "36px"};
            padding: 8px 10px;
        }
    `,

    SnippetForm: styled.form`
        display: grid;
        gap: 8px;

        input[type="text"] {
            width: 100%;
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: calc(${radius} - 2px);
            padding: 10px 12px;
            font: inherit;
            outline: none;
            transition: border-color 0.15s ease;
            &:focus {
                border-color: ${accent};
            }
        }

        .row {
            display: flex;
            gap: 8px;
        }
        button {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            &:hover {
                border-color: ${accent};
            }
        }
        .ghost {
            background: ${bg};
        }
        .danger {
            border-color: ${danger};
        }
    `,

    SnippetList: styled.ul`
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 10px;

        li {
            display: grid;
            gap: 8px;
            border: 1px solid ${border};
            border-radius: ${radius};
            padding: 10px;
            background: ${bg};
        }
        .info {
            display: grid;
            gap: 4px;
        }
        .info .date {
            color: ${muted};
            font-size: 12px;
        }
        .info .preview {
            color: ${muted};
            margin: 0;
            font-size: 13px;
            white-space: pre-wrap;
        }

        .buttons {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        .buttons button {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 6px 10px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            &:hover {
                border-color: ${accent};
            }
        }
        .buttons .ghost {
            background: ${bg};
        }
        .buttons .danger {
            border-color: ${danger};
        }
    `,

    Divider: styled.hr`
        border: none;
        border-top: 1px solid ${border};
        margin: 12px 0;
    `,

    /* ----------------- Confirm Modal ----------------- */
    ModalOverlay: styled.div`
        position: fixed;
        inset: 0;
        display: ${(p) => (p.hidden ? "none" : "grid")};
        place-items: center;
        background: rgba(0, 0, 0, 0.35);
        z-index: 60;
    `,

    Modal: styled.div`
        width: min(520px, 92vw);
        background: ${card};
        color: ${text};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;

        h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
        }
        .msg {
            margin: 0 0 12px 0;
            color: ${muted};
        }

        .actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }
        .actions button {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            &:hover {
                border-color: ${accent};
            }
        }
        .actions .ghost {
            background: ${bg};
        }
        .actions .danger {
            border-color: ${danger};
        }
    `,
};

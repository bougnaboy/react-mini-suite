import styled, { css } from "styled-components";

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

const Styled = {
    Wrapper: styled.div`
        max-width: 1440px;
        margin: 0 auto;
        display: grid;
        gap: 16px;
        padding: 16px;
        background: ${bg};
        color: ${text};
        min-height: 100%;
    `,

    Header: styled.header`
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
        h1 {
            margin: 0 0 6px 0;
            font-size: 20px;
            line-height: 1.2;
        }
        p {
            margin: 0;
            color: ${muted};
            font-size: 14px;
        }
    `,

    Badges: styled.div`
        display: flex;
        gap: 8px;
        align-items: center;
        .badge {
            background: ${card};
            border: 1px solid ${border};
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 12px;
            box-shadow: ${shadow};
        }
    `,

    Layout: styled.div`
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 16px;
        @media (max-width: 1100px) {
            grid-template-columns: 1fr;
        }
        .left,
        .right {
            display: grid;
            gap: 16px;
        }
    `,

    Card: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;
    `,

    Section: styled.section`
        & + & {
            margin-top: 16px;
        }
    `,

    SectionTitle: styled.h2`
        margin: 0 0 10px 0;
        font-size: 15px;
        font-weight: 600;
    `,

    Grid: styled.div`
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        @media (max-width: 720px) {
            grid-template-columns: 1fr;
        }
    `,

    Field: styled.div`
        display: grid;
        gap: 6px;

        label {
            font-size: 13px;
            color: ${text};
            display: inline-flex;
            align-items: center;
            gap: 6px;
            em {
                font-style: normal;
                color: ${danger};
            }
        }

        input[type="text"],
        input[type="date"] {
            width: 100%;
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: calc(${radius} - 2px);
            padding: 10px 12px;
            font: inherit;
            outline: none;
            transition: border-color 0.15s ease;
        }
        input:focus {
            border-color: ${accent};
        }

        ${(p) =>
            p.invalid &&
            css`
                input {
                    border-color: ${danger};
                }
            `}
    `,

    /* ✅ missing earlier */
    Error: styled.div`
        min-height: 16px;
        font-size: 12px;
        color: ${danger};
    `,

    Actions: styled.div`
        margin-top: 14px;
        display: flex;
        gap: 10px;
        align-items: center;
        .spacer {
            flex: 1;
        }
        button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 10px 14px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            transition: transform 0.02s ease-in-out, border-color 0.15s ease;
            &:hover {
                border-color: ${accent};
            }
            &:active {
                transform: translateY(1px);
            }
            &:disabled {
                opacity: 0.55;
                cursor: not-allowed;
            }
        }
        .ghost {
            background: ${bg};
        }
        .danger {
            border-color: ${danger};
        }
    `,

    Info: styled.div`
        padding: 10px 12px;
        border: 1px dashed ${border};
        color: ${muted};
        border-radius: ${radius};
        background: ${bg};
    `,

    Summary: styled.div`
        display: grid;
        grid-template-columns: 1fr;
        gap: 10px;
        .label {
            color: ${muted};
            font-size: 13px;
        }
        strong {
            font-size: 16px;
        }
    `,

    Divider: styled.hr`
        border: none;
        border-top: 1px solid ${border};
        margin: 8px 0;
    `,

    TableWrap: styled.div`
        overflow: auto;
        max-height: 540px;
        border: 1px solid ${border};
        border-radius: ${radius};
    `,

    Table: styled.table`
        width: 100%;
        border-collapse: collapse;
        min-width: 720px;
        background: ${card};
        color: ${text};
        thead th {
            position: sticky;
            top: 0;
            background: ${card};
            border-bottom: 1px solid ${border};
            text-align: left;
            padding: 10px 12px;
            font-weight: 600;
            font-size: 13px;
        }
        tbody td {
            padding: 10px 12px;
            border-top: 1px solid ${border};
            font-size: 13px;
        }
        tbody tr:nth-child(odd) td {
            background: rgba(0, 0, 0, 0.02);
        }
    `,

    Pagination: styled.div`
        margin-top: 8px;
        display: flex;
        gap: 10px;
        align-items: center;
        justify-content: flex-end;
        span {
            color: ${muted};
            font-size: 13px;
        }
        button {
            appearance: none;
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
            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        }
    `,

    SavedList: styled.ul`
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 10px;
        li {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 10px;
            border: 1px solid ${border};
            border-radius: ${radius};
            padding: 10px 12px;
            background: ${bg};
        }
        .meta {
            display: grid;
        }
        .meta .muted {
            color: ${muted};
            font-size: 12px;
        }
        .row {
            display: flex;
            gap: 8px;
        }
        .row button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 10px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
        }
        .row .danger {
            border-color: ${danger};
        }
    `,

    ModalOverlay: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: grid;
        place-items: center;
        z-index: 9999;
    `,
    Modal: styled.div`
        width: min(420px, 90vw);
        background: ${card};
        color: ${text};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;
        h3 {
            margin: 0 0 6px 0;
            font-size: 16px;
        }
        p {
            margin: 0 0 12px 0;
            color: ${muted};
            font-size: 14px;
        }
        .actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        .actions button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
        }
        .actions .ghost {
            background: ${bg};
        }
        .actions .danger {
            border-color: ${danger};
        }
    `,
};

export { Styled }; // optional named export
export default Styled; // default export

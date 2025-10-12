import styled, { createGlobalStyle } from "styled-components";

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

/* === print-only global styles === */
const PrintOnly = createGlobalStyle`
  @media print {
    /* hide everything */
    body * { visibility: hidden !important; }

    /* show only the list card */
    .ams-print-target, .ams-print-target * { visibility: visible !important; }
    .ams-print-target {
      position: absolute !important;
      left: 0; top: 0; width: 100%;
    }
  }

  @page { size: auto; margin: 12mm; }
`;

export const Styled = {
    Wrapper: styled.div`
        color: ${text};
        background: ${bg};
        min-height: 100%;
        padding: 16px;
        width: 100%;
        max-width: 1440px;
        margin: 0 auto;
    `,

    Header: styled.div`
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 12px;
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
        .badge {
            background: ${card};
            border: 1px solid ${border};
            padding: 6px 10px;
            border-radius: 999px;
            box-shadow: ${shadow};
            font-size: 12px;
        }
    `,

    Layout: styled.div`
        display: grid;
        gap: 16px;
        grid-template-columns: 1.2fr 1.8fr;
        @media (max-width: 1080px) {
            grid-template-columns: 1fr;
        }
    `,

    Card: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;
    `,

    SectionTitle: styled.h2`
        margin: 0 0 12px 0;
        font-size: 16px;
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

        &.span2 {
            grid-column: span 2;
            @media (max-width: 720px) {
                grid-column: span 1;
            }
        }

        label {
            font-size: 13px;
            color: ${text};
            display: inline-flex;
            gap: 6px;
            align-items: center;
            em {
                font-style: normal;
                color: ${danger};
            }
        }

        input[type="text"],
        input[type="email"],
        input[type="tel"],
        input[type="date"],
        input[type="time"],
        textarea,
        select {
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
        textarea {
            resize: vertical;
        }

        input:focus,
        select:focus,
        textarea:focus {
            border-color: ${accent};
        }

        ${(p) =>
            p.invalid && `input, select, textarea { border-color: ${danger}; }`}
    `,

    /* live error text */
    Error: styled.div`
        min-height: 16px;
        font-size: 12px;
        color: ${danger};
    `,

    RowHint: styled.div`
        display: flex;
        justify-content: flex-end;
        .muted {
            color: ${muted};
            font-size: 12px;
        }
    `,

    Actions: styled.div`
        margin-top: 16px;
        display: flex;
        gap: 10px;
        align-items: center;
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
        }
        .ghost {
            background: ${bg};
        }
    `,

    Side: styled.div`
        display: grid;
        gap: 16px;
    `,

    /* ✅ filters inputs/selects styled */
    Filters: styled.div`
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
        gap: 10px;
        margin-bottom: 10px;

        input[type="text"],
        input[type="date"],
        select {
            appearance: none;
            width: 100%;
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: calc(${radius} - 2px);
            padding: 10px 12px;
            font: inherit;
            outline: none;
            transition: border-color 0.15s ease, background 0.15s ease;
        }

        input::placeholder {
            color: ${muted};
            opacity: 0.9;
        }
        input:focus,
        select:focus {
            border-color: ${accent};
        }

        input[type="text"] {
            min-width: 200px;
        }

        @media (max-width: 980px) {
            grid-template-columns: 1fr 1fr;
        }
    `,

    ToolRow: styled.div`
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;

        .left,
        .right {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        button,
        label.import {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            transition: border-color 0.15s ease;
            &:hover {
                border-color: ${accent};
            }
        }

        .danger {
            border-color: ${danger};
            &:hover {
                border-color: ${danger};
            }
        }

        label.import {
            position: relative;
            overflow: hidden;
        }
        label.import input {
            position: absolute;
            inset: 0;
            opacity: 0;
            cursor: pointer;
        }
    `,

    Empty: styled.div`
        color: ${muted};
        font-size: 14px;
    `,

    GroupHeader: styled.div`
        margin: 12px 0 6px 0;
        font-weight: 600;
        font-size: 14px;
        color: ${text};
    `,

    Table: styled.div`
        border: 1px solid ${border};
        border-radius: ${radius};
        overflow: hidden;

        .tr {
            display: grid;
            grid-template-columns: 140px 1.2fr 140px 140px 140px 1fr 170px;
        }
        .th,
        .td {
            border-bottom: 1px solid ${border};
            padding: 10px 12px;
        }
        .thead .tr {
            background: ${bg};
            font-weight: 600;
        }
        .tbody .tr:last-child .td {
            border-bottom: none;
        }

        .td select {
            width: 100%;
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: calc(${radius} - 2px);
            padding: 6px 8px;
            font: inherit;
        }

        .td .primary {
            font-weight: 600;
        }
        .td .muted {
            color: ${muted};
        }
        .td .small {
            font-size: 12px;
        }
        .td .ellipsis {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .td.actions {
            display: flex;
            align-items: flex-start; /* <-- top align */
            gap: 8px;
        }
        .td.actions button {
            appearance: none;
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
        .td.actions .danger {
            border-color: ${danger};
            &:hover {
                border-color: ${danger};
            }
        }

        /* hide action controls when printing */
        @media print {
            .th.actions,
            .td.actions {
                display: none !important;
            }
        }

        @media (max-width: 980px) {
            .tr {
                grid-template-columns: 120px 1fr 120px 120px 120px 1fr 140px;
            }
        }
        @media (max-width: 720px) {
            .tr {
                grid-template-columns: 110px 1fr 110px 110px 110px 1fr 120px;
            }
        }
    `,

    /* modal */
    Modal: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: grid;
        place-items: center;
        z-index: 1000;
    `,
    ModalCard: styled.div`
        width: min(520px, 92vw);
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
    `,
    ModalActions: styled.div`
        display: flex;
        justify-content: flex-end;
        gap: 8px;
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
        }
        .ghost {
            background: ${bg};
        }
    `,

    /* mount as a component in JSX */
    PrintOnly,
};

export default Styled;

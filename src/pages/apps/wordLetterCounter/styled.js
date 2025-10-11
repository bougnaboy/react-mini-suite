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

/* Global print CSS: only print the element with .wlc-print-stats */
export const PrintOnly = createGlobalStyle`
  @media print {
    /* hide everything */
    body * { visibility: hidden !important; }

    /* show only stats card */
    .wlc-print-stats, .wlc-print-stats * {
      visibility: visible !important;
    }

    /* position it full page for clean print */
    .wlc-print-stats {
      position: absolute !important;
      inset: 0 !important;
      margin: 0 !important;
      border: none !important;
      box-shadow: none !important;
      background: #fff !important;
      padding: 24px !important;
    }
  }
`;

export const Styled = {
    Wrapper: styled.div`
        max-width: 1440px;
        margin: 0 auto;

        display: grid;
        gap: 16px;
        padding: 16px;
        color: ${text};
        background: ${bg};

        @media (max-width: 720px) {
            padding: 12px;
        }
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
            color: ${muted};
            font-size: 14px;
        }
    `,

    HeaderActions: styled.div`
        display: flex;
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
    `,

    Layout: styled.div`
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 16px;

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

        h3 {
            margin: 0 0 12px 0;
            font-size: 16px;
        }
        .muted {
            color: ${muted};
        }
    `,

    EditorCard: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;

        /* editor never prints due to global CSS (hidden by default) */
    `,

    TitleRow: styled.div`
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 12px;
        margin-bottom: 12px;

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

        .row-actions {
            display: flex;
            gap: 8px;
            align-items: center;

            button {
                appearance: none;
                border: 1px solid ${border};
                background: ${bg};
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
        }

        @media (max-width: 720px) {
            grid-template-columns: 1fr;
            .row-actions {
                flex-wrap: wrap;
            }
        }
    `,

    Dropdown: styled.div`
        select {
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: ${radius};
            padding: 8px 12px;
            font: inherit;
            outline: none;
            transition: border-color 0.15s ease;

            &:hover,
            &:focus {
                border-color: ${accent};
            }
        }
    `,

    Textarea: styled.textarea`
        width: 100%;
        min-height: 320px;
        border: 1px solid ${border};
        background: ${bg};
        color: ${text};
        border-radius: calc(${radius} - 2px);
        padding: 12px;
        font: inherit;
        line-height: 1.6;
        outline: none;
        resize: vertical;
        transition: border-color 0.15s ease;

        &:focus {
            border-color: ${accent};
        }
    `,

    EditorActions: styled.div`
        margin-top: 12px;
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
            transition: border-color 0.15s ease, transform 0.02s ease-in-out;

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
    `,

    Side: styled.aside`
        display: grid;
        gap: 16px;
    `,

    StatsGrid: styled.div`
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;

        .span2 {
            grid-column: span 2;
        }

        .label {
            color: ${muted};
            font-size: 12px;
        }
        .value {
            display: block;
            font-weight: 600;
            font-size: 16px;
            margin-top: 2px;
        }

        @media (max-width: 480px) {
            grid-template-columns: 1fr;
            .span2 {
                grid-column: span 1;
            }
        }
    `,

    SaveRow: styled.div`
        display: flex;
        gap: 10px;
        align-items: center;
        margin-bottom: 10px;

        .spacer {
            flex: 1;
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

    SaveList: styled.ul`
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 8px;

        li {
            border: 1px solid ${border};
            border-radius: ${radius};
            background: ${bg};
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: center;
            padding: 8px;
            gap: 8px;
        }
        li.active {
            border-color: ${accent};
        }

        .item {
            text-align: left;
            border: none;
            background: transparent;
            color: ${text};
            padding: 0;
            cursor: pointer;
        }
        .t {
            display: block;
            font-weight: 600;
        }
        .d {
            display: block;
            color: ${muted};
            font-size: 12px;
        }

        .actions {
            display: flex;
            gap: 8px;
        }
        .actions .ghost,
        .actions .danger {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 6px 10px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            transition: border-color 0.15s ease;

            &:hover {
                border-color: ${accent};
            }
        }
        .actions .danger {
            border-color: ${danger};
        }
    `,

    HiddenLive: styled.div`
        position: absolute;
        left: -9999px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
    `,

    ModalBackdrop: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: grid;
        place-items: center;
        z-index: 9999;
    `,

    ModalCard: styled.div`
        width: min(520px, 92vw);
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;

        h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
        }
        p.muted {
            color: ${muted};
            margin: 0 0 12px 0;
        }
    `,

    ModalActions: styled.div`
        display: flex;
        gap: 10px;
        justify-content: flex-end;

        button {
            appearance: none;
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
    `,
};

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
        /* center page content */
        max-width: 1440px;
        margin: 0 auto;

        display: grid;
        gap: 16px;
        padding: 16px;
        color: ${text};
        background: ${bg};
        min-height: 100%;
    `,

    Header: styled.div`
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;

        h1 {
            margin: 0 0 6px 0;
            font-size: 20px;
            line-height: 1.2;
        }
        .muted {
            color: ${muted};
            font-size: 14px;
            margin: 0;
        }
    `,

    Layout: styled.div`
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 16px;
        @media (max-width: 1100px) {
            grid-template-columns: 1fr;
        }
    `,

    Column: styled.div`
        display: grid;
        gap: 16px;
    `,

    Side: styled.aside`
        display: grid;
        gap: 16px;
    `,

    Card: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;
    `,

    SearchRow: styled.div`
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 8px;

        input {
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: calc(${radius} - 2px);
            padding: 10px 12px;
            font: inherit;
            outline: none;
        }
        input:focus {
            border-color: ${accent};
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
        }
        button:hover {
            border-color: ${accent};
        }
        button:active {
            transform: translateY(1px);
        }

        .ghost {
            background: ${bg};
        }
    `,

    Loading: styled.div`
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 16px 0;
        color: ${muted};
    `,

    Spinner: styled.div`
        width: 18px;
        height: 18px;
        border: 2px solid ${border};
        border-top-color: ${accent};
        border-radius: 50%;
        animation: spin 0.8s linear infinite;

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    `,

    Error: styled.div`
        margin-top: 12px;
        color: ${danger};
        font-size: 14px;
    `,

    ResultHeader: styled.div`
        margin-top: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid ${border};

        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;

        .word {
            margin: 0;
            font-size: 22px;
        }

        .phonetics {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 4px;
            .phonetic {
                font-size: 13px;
                color: ${muted};
                border: 1px dashed ${border};
                padding: 2px 6px;
                border-radius: 999px;
            }
        }

        .actions {
            display: flex;
            gap: 8px;
            button {
                appearance: none;
                border: 1px solid ${border};
                background: ${card};
                color: ${text};
                padding: 8px 10px;
                border-radius: ${radius};
                cursor: pointer;
                font: inherit;
            }
            button:hover {
                border-color: ${accent};
            }
            .ghost {
                background: ${bg};
            }
        }
    `,

    Definitions: styled.div`
        display: grid;
        gap: 16px;
        padding-top: 12px;

        .pos-block {
            padding-bottom: 12px;
            border-bottom: 1px dashed ${border};
        }

        .pos {
            font-weight: 600;
            font-size: 14px;
            color: ${text};
            margin-bottom: 8px;
        }

        .defs {
            margin: 0;
            padding-left: 20px;
            display: grid;
            gap: 10px;
        }

        .def {
            font-size: 14px;
            line-height: 1.45;
        }

        .example {
            margin-top: 2px;
            color: ${muted};
            font-size: 13px;
        }

        .chips {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 6px;
        }
        .chip {
            font-size: 12px;
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: 999px;
            padding: 2px 8px;
        }
        .chip.alt {
            border-style: dashed;
            opacity: 0.9;
        }
    `,

    Sources: styled.div`
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
        margin-top: 12px;

        span {
            color: ${muted};
            font-size: 13px;
        }
        a {
            color: ${text};
            border: 1px solid ${border};
            background: ${bg};
            padding: 4px 8px;
            border-radius: 999px;
            text-decoration: none;
            font-size: 12px;
        }
        a:hover {
            border-color: ${accent};
        }
    `,

    SideHeader: styled.div`
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        h3 {
            margin: 0;
            font-size: 16px;
        }
        .actions {
            display: flex;
            gap: 8px;
        }
        .actions .ghost {
            appearance: none;
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            padding: 8px 10px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
        }
        .actions .ghost:hover {
            border-color: ${accent};
        }
        .actions .ghost:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `,

    List: styled.div`
        display: grid;
        gap: 8px;

        .row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            border: 1px solid ${border};
            border-radius: ${radius};
            padding: 8px 10px;
            background: ${bg};
        }
        .link {
            border: none;
            background: transparent;
            color: ${text};
            text-decoration: underline;
            cursor: pointer;
            font: inherit;
            padding: 0;
        }
        .row-actions {
            display: flex;
            gap: 8px;
        }
        .ghost {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 6px 10px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
        }
        .ghost:hover {
            border-color: ${accent};
        }
    `,

    /* ===== Modal ===== */
    ModalBackdrop: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        display: grid;
        place-items: center;
        z-index: 40;
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
            padding: 10px 14px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
        }
        button:hover {
            border-color: ${accent};
        }
        .ghost {
            background: ${bg};
        }
    `,
};

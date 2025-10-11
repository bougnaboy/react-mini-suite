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
        color: ${text};
        background: ${bg};
        padding: 16px;
        min-height: 100%;
        /* requested app wrapper constraint */
        max-width: 1440px;
        margin: 0 auto;
        display: grid;
        gap: 16px;
    `,

    Header: styled.div`
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

    ActionsRow: styled.div`
        display: flex;
        gap: 8px;
        button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 10px 12px;
            border-radius: ${radius};
            cursor: pointer;
            box-shadow: ${shadow};
            &:hover {
                border-color: ${accent};
            }
        }
        .ghost {
            background: ${bg};
        }
    `,

    Layout: styled.div`
        display: grid;
        grid-template-columns: 1.4fr 2fr;
        gap: 16px;

        @media (max-width: 1100px) {
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

    Section: styled.section`
        & + & {
            margin-top: 16px;
        }

        /* Blacklist inline form */
        .inlineForm {
            display: flex;
            align-items: stretch;
            gap: 8px;
            max-width: 420px;
        }

        .inlineForm input[type="text"] {
            flex: 1;
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: ${radius};
            padding: 10px 12px;
            font: inherit;
            outline: none;
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .inlineForm input[type="text"]:focus {
            border-color: ${accent};
            box-shadow: 0 0 0 2px rgba(0, 0, 0, 0); /* subtle focus ring hook; theme-safe */
        }

        .inlineForm button {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 10px 14px;
            border-radius: ${radius};
            font: inherit;
            cursor: pointer;
            white-space: nowrap;
            min-width: 84px;
            transition: border-color 0.15s ease, transform 0.02s ease-in-out;
        }
        .inlineForm button:hover {
            border-color: ${accent};
        }
        .inlineForm button:active {
            transform: translateY(1px);
        }
    `,

    SectionTitle: styled.h2`
        margin: 0 0 10px 0;
        font-size: 15px;
        font-weight: 600;

        &.withActions {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;

            .right {
                display: flex;
                gap: 8px;
                align-items: center;
            }
            input[type="search"] {
                border: 1px solid ${border};
                background: ${bg};
                color: ${text};
                border-radius: ${radius};
                padding: 8px 10px;
                font: inherit;
                width: 220px;
            }
            button {
                appearance: none;
                border: 1px solid ${border};
                background: ${card};
                color: ${text};
                padding: 8px 10px;
                border-radius: ${radius};
                cursor: pointer;
                &:hover {
                    border-color: ${accent};
                }
            }
            .danger {
                border-color: ${danger};
                color: ${danger};
            }
        }
    `,

    Grid: styled.div`
        display: grid;
        gap: 12px;
        grid-template-columns: 1fr 1fr;

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
        }

        input[type="text"],
        input[type="number"] {
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: ${radius};
            padding: 10px 12px;
            font: inherit;
            outline: none;
            transition: border-color 0.15s ease;
            &:focus {
                border-color: ${accent};
            }
        }

        .checkbox {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
        }
    `,

    Chips: styled.div`
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .chip {
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: 999px;
            padding: 6px 10px;
            font-size: 13px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            user-select: none;
            transition: border-color 0.15s ease, background 0.15s ease;
        }
        .chip.active {
            background: ${card};
            border-color: ${accent};
        }
        .chip input {
            display: none;
        }

        .danger {
            border-color: ${danger};
            color: ${danger};
            background: ${bg};
        }

        &.pad-top {
            margin-top: 8px;
        }
    `,

    Help: styled.div`
        font-size: 12px;
        color: ${muted};
    `,

    Stack: styled.div`
        display: grid;
        gap: 16px;
    `,

    Empty: styled.div`
        color: ${muted};
        padding: 14px 0;
    `,

    Table: styled.div`
        border: 1px solid ${border};
        border-radius: ${radius};
        overflow: hidden;

        .thead,
        .tr {
            display: grid;
            grid-template-columns: 1.2fr 0.5fr 0.4fr 0.4fr 1.6fr;
            border-bottom: 1px solid ${border};
        }
        .thead {
            background: ${bg};
            font-weight: 600;
        }
        .th,
        .td {
            padding: 10px 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            min-height: 40px;
        }
        .is-sm {
            justify-content: flex-start;
        }

        .td.is-actions,
        .th.is-actions {
            justify-content: flex-end;
            gap: 8px;
        }

        .tbody .tr:last-child {
            border-bottom: none;
        }

        .mono {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
                "Liberation Mono", "Courier New", monospace;
        }

        button,
        a {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 10px;
            border-radius: ${radius};
            cursor: pointer;
            text-decoration: none;
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
            color: ${danger};
        }
        .split {
            display: inline-flex;
            gap: 6px;
        }
    `,

    Modal: styled.div`
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        z-index: 1000;

        .backdrop {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.4);
        }

        .sheet {
            position: relative;
            background: ${card};
            color: ${text};
            border: 1px solid ${border};
            border-radius: ${radius};
            box-shadow: ${shadow};
            padding: 16px;
            width: min(480px, 92vw);
            z-index: 1;

            h3 {
                margin: 0 0 8px 0;
                font-size: 16px;
            }
            p {
                margin: 0 0 16px 0;
                color: ${muted};
            }

            .row {
                display: flex;
                gap: 8px;
                justify-content: flex-end;

                button {
                    appearance: none;
                    border: 1px solid ${border};
                    background: ${card};
                    color: ${text};
                    padding: 8px 12px;
                    border-radius: ${radius};
                    cursor: pointer;
                    &:hover {
                        border-color: ${accent};
                    }
                }
                .danger {
                    border-color: ${danger};
                    color: ${danger};
                }
                .ghost {
                    background: ${bg};
                }
            }
        }
    `,
};

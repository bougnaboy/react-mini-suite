import styled from "styled-components";

const card = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,0.25))";

export const Styled = {
    Wrapper: styled.div`
        display: grid;
        gap: 16px;
        color-scheme: dark; /* help native form controls pick dark UI */
        max-width: 1440px;
        margin: auto;
        padding: 15px;

        /* ——— Shared inputs ——— */
        textarea,
        select,
        input[type="text"],
        input[type="number"] {
            width: 100%;
            color: ${text};
            background: transparent;
            border: 1px solid ${border};
            border-radius: 10px;
            padding: 8px 10px;
            outline: none;
            min-height: 40px; /* consistent control height */
            line-height: 1.35;
        }

        /* Dark dropdown popup (supported on Chromium/FF; no harm on others) */
        select option {
            background: ${card};
            color: ${text};
        }

        /* Remove native arrows, add a simple chevron */
        select {
            -webkit-appearance: none;
            appearance: none;
            padding-right: 34px; /* room for chevron */
            background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23e9e9e9' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
            background-repeat: no-repeat;
            background-position: right 10px center;
        }

        .header {
            display: grid;
            gap: 6px;
            h3 {
                margin: 0;
                color: ${text};
                letter-spacing: 0.2px;
            }
            .sub {
                color: ${muted};
                font-size: 0.95rem;
            }
        }

        .grid {
            display: grid;
            gap: 16px;
            grid-template-columns: 1fr;
        }

        .inputArea {
            display: grid;
            gap: 8px;
            background: ${card};
            border: 1px solid ${border};
            border-radius: ${radius};
            padding: 12px;
            box-shadow: ${shadow};

            .label {
                color: ${muted};
                font-size: 0.9rem;
            }
            textarea {
                min-height: 180px;
                resize: vertical;
                border-style: dashed;
                border-radius: 12px;
            }
        }

        .controls {
            display: grid;
            gap: 12px;
            background: ${card};
            border: 1px solid ${border};
            border-radius: ${radius};
            padding: 12px;
            box-shadow: ${shadow};

            /* align all fields nicely at bottom edge */
            .row {
                display: grid;
                gap: 12px;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                align-items: end;
            }

            .control {
                display: grid;
                gap: 6px;
                .ctlLabel {
                    color: ${muted};
                    font-size: 0.85rem;
                }

                &.chk label {
                    color: ${text};
                    font-size: 0.95rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                &.chk input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    accent-color: ${accent};
                }
            }

            .actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                margin-top: 2px; /* tight to the fields */
                button {
                    padding: 8px 12px;
                    border-radius: 12px;
                    border: 1px solid ${border};
                    background: ${card};
                    color: ${text};
                    cursor: pointer;
                }
                button:hover {
                    border-color: ${accent};
                }
                .danger {
                    border-color: #ef4444;
                }
            }
        }

        .summary {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            .pill {
                background: ${card};
                color: ${text};
                border: 1px solid ${border};
                border-radius: 999px;
                padding: 6px 10px;
            }
        }

        .results {
            background: ${card};
            border: 1px solid ${border};
            border-radius: ${radius};
            box-shadow: ${shadow};
            overflow: auto; /* scroll if large */
            max-height: 420px; /* keep page compact */
        }
    `,

    Table: styled.table`
        width: 100%;
        border-collapse: collapse;

        thead th {
            position: sticky; /* keep headers visible while scrolling */
            top: 0;
            text-align: left;
            padding: 10px 12px;
            font-weight: 600;
            color: ${text};
            background: ${card};
            border-bottom: 1px solid ${border};
            z-index: 1;
        }

        tbody td {
            padding: 10px 12px;
            border-bottom: 1px dashed ${border};
            color: ${text};
            vertical-align: top;
            word-break: break-word;
        }

        tbody tr:last-child td {
            border-bottom: none;
        }

        .item {
            width: 100%;
        }
        .count,
        .pct {
            white-space: nowrap;
        }
        .empty {
            color: ${muted};
            text-align: center;
            padding: 24px;
        }
    `,
};

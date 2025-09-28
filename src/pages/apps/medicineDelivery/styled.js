import styled, { createGlobalStyle } from "styled-components";

const card = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const danger = "var(--danger, #ef4444)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,0.25))";

/* Print ONLY the element with id=md-print-summary */
const PrintScope = createGlobalStyle`
  @media print {
    html, body { background: #fff !important; }
    body * { visibility: hidden !important; }
    #md-print-summary, #md-print-summary * { visibility: visible !important; }
    #md-print-summary {
      position: absolute; inset: 0; width: 100%;
      margin: 0; padding: 24px; box-sizing: border-box;
      background: #fff !important; color: #000 !important;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      white-space: pre-wrap; line-height: 1.5;
    }
  }
`;

const Wrapper = styled.main`
    color: ${text};
    max-width: var(--maxw, 1200px);
    margin: 0 auto;
    padding: 24px;

    .no-print {
        display: initial;
    }
    .only-print {
        display: none;
    }

    .header {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 12px;
        align-items: baseline;
        margin-bottom: 16px;

        h2 {
            margin: 0;
        }
        .meta {
            color: ${muted};
            font-size: 14px;
        }
    }

    .card {
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;
        margin-bottom: 16px;
    }

    .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }

    label {
        display: grid;
        gap: 6px;
        margin-bottom: 12px;

        span {
            color: ${muted};
            font-size: 12px;
            letter-spacing: 0.3px;
        }

        input,
        textarea,
        select {
            background: #0b0b0b;
            color: ${text};
            border: 1px solid ${border};
            border-radius: ${radius};
            padding: 10px 12px;
            outline: none;
        }

        textarea.summary {
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            white-space: pre;
            min-height: 200px;
        }
    }

    .items {
        display: grid;
        gap: 8px;
    }

    .item {
        display: grid;
        grid-template-columns: 32px 2fr 88px 120px 2fr 120px auto;
        gap: 8px;
        align-items: center;

        .index {
            width: 32px;
            height: 36px;
            display: grid;
            place-items: center;
            color: ${muted};
            border: 1px dashed ${border};
            border-radius: ${radius};
            font-size: 12px;
        }

        .name,
        .qty,
        .price,
        .notes {
            background: #0b0b0b;
            color: ${text};
            border: 1px solid ${border};
            border-radius: ${radius};
            padding: 8px 10px;
        }

        .qty,
        .price {
            text-align: right;
        }

        .amount {
            text-align: right;
            color: ${text};
            border: 1px dashed ${border};
            border-radius: ${radius};
            padding: 8px 10px;
            min-width: 110px;
        }

        .remove {
            background: transparent;
            color: ${danger};
            border: 1px solid ${danger};
            border-radius: ${radius};
            padding: 8px 10px;
            cursor: pointer;
        }
    }

    .row.bottom {
        display: flex;
        justify-content: flex-end;
        margin-top: 8px;
        .add {
            background: transparent;
            color: ${accent};
            border: 1px dashed ${accent};
            border-radius: ${radius};
            padding: 8px 12px;
            cursor: pointer;
        }
    }

    .totals {
        display: grid;
        gap: 12px;

        .controls {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }

        .figures {
            display: grid;
            gap: 6px;

            .line {
                display: grid;
                grid-template-columns: 1fr auto;
                gap: 12px;
                padding: 8px 0;
                border-bottom: 1px dashed ${border};
                &:last-child {
                    border-bottom: none;
                }
            }
            .grand {
                font-weight: 700;
            }
        }
    }

    .footer {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        margin-top: 8px;

        .actions {
            display: flex;
            gap: 8px;

            button {
                background: ${accent};
                color: #0b0b0b;
                border: 1px solid ${border};
                border-radius: ${radius};
                padding: 8px 12px;
                cursor: pointer;
                box-shadow: ${shadow};
            }
            .danger {
                background: transparent;
                color: ${danger};
                border: 1px solid ${danger};
            }
        }
    }

    .hint {
        color: ${muted};
        font-size: 12px;
        margin-top: 6px;
    }

    @media print {
        .no-print {
            display: none !important;
        }
        .only-print {
            display: block;
        }
    }

    @media (max-width: 920px) {
        .item {
            grid-template-columns: 24px 1.6fr 72px 90px 1.6fr 90px auto;
        }
    }
    @media (max-width: 720px) {
        .grid {
            grid-template-columns: 1fr;
        }
        .item {
            grid-template-columns: 24px 1fr 72px 90px 1fr 90px auto;
        }
    }
`;

export const Styled = { Wrapper, PrintScope };

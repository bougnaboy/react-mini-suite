import styled from "styled-components";

const bg = "var(--bg, #0b0b0b)";
const cardBg = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,0.25))";

export const Styled = {
    Wrapper: styled.div`
        max-width: var(--maxw, 1200px);
        margin: 0 auto;
        padding: var(--space-5, 32px) var(--space-4, 24px) var(--space-6, 48px);
        color: ${text};
    `,

    Header: styled.header`
        margin-bottom: var(--space-4, 24px);

        h1 {
            font-size: clamp(22px, 4vw, 30px);
            margin: 0 0 6px;
            line-height: 1.2;
        }
        p {
            color: ${muted};
            margin: 0;
        }
    `,

    Grid: styled.div`
        display: grid;
        grid-template-columns: 1fr minmax(360px, 520px);
        gap: var(--space-4, 24px);

        @media (max-width: 960px) {
            grid-template-columns: 1fr;
        }
    `,

    EditPanel: styled.section`
        background: ${cardBg};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;
    `,

    Field: styled.div`
        display: grid;
        gap: 8px;
        margin-bottom: 14px;

        label {
            color: ${muted};
            font-size: 13px;
        }

        input[type="text"],
        input:not([type]) {
            /* allow generic input usage */
        }

        input {
            background: ${bg};
            color: ${text};
            border: 1px solid ${border};
            border-radius: 12px;
            padding: 10px 12px;
            outline: none;
            &:focus {
                border-color: ${accent};
                box-shadow: 0 0 0 2px
                    color-mix(in srgb, ${accent} 32%, transparent);
            }
        }

        .row {
            display: flex;
            gap: 14px;
        }
        .radio {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 10px;
            border: 1px solid ${border};
            border-radius: 12px;
            input {
                accent-color: ${accent};
            }
            span {
                font-weight: 600;
            }
        }
    `,

    itemsHeader: styled.div`
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 32px;
        gap: 8px;
        padding: 8px 4px;
        color: ${muted};
        font-size: 13px;
        border-bottom: 1px dashed ${border};
        margin-top: 6px;
    `,

    Items: styled.div`
        display: grid;
        gap: 8px;
        margin-top: 8px;

        .itemRow {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 32px;
            gap: 8px;
            align-items: center;
        }

        input.name,
        input.unit,
        input.rate {
            background: ${bg};
            color: ${text};
            border: 1px solid ${border};
            border-radius: 12px;
            padding: 10px 12px;
            outline: none;
            &:focus {
                border-color: ${accent};
            }
        }

        .danger {
            background: transparent;
            color: ${muted};
            border: 1px solid ${border};
            border-radius: 10px;
            height: 36px;
            cursor: pointer;
            transition: all 0.12s ease;
            &:hover {
                color: #ffb4b4;
                border-color: #442020;
                background: #1a0f0f;
            }
        }
    `,

    Actions: styled.div`
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 14px;

        button {
            background: ${accent};
            color: #031a0d;
            border: 1px solid ${accent};
            border-radius: 12px;
            padding: 10px 14px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.05s ease;
            &:active {
                transform: translateY(1px);
            }
        }

        .ghost {
            background: transparent;
            color: ${text};
            border: 1px solid ${border};
        }
    `,

    PreviewCard: styled.section`
        background: ${cardBg};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 18px;

        header {
            margin-bottom: 8px;
            h2 {
                margin: 0;
                font-size: clamp(20px, 4vw, 26px);
                line-height: 1.2;
            }
            .muted {
                color: ${muted};
                margin: 4px 0 0;
                font-size: 14px;
            }
        }

        .table {
            display: grid;
            gap: 0;
        }

        .thead,
        .row {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 8px;
            padding: 10px 8px;
            align-items: center;
        }

        .thead {
            color: ${muted};
            font-size: 13px;
            border-bottom: 1px dashed ${border};
        }

        .tbody .row:nth-child(odd) {
            background: color-mix(in srgb, ${border} 30%, transparent);
        }

        .name,
        .unit,
        .rate {
            overflow-wrap: anywhere;
        }

        footer {
            margin-top: 12px;
            color: ${muted};
            font-size: 13px;
        }
    `,
};

/* -------- Print: only the preview card --------
   We hide everything by default and reveal #rateCardPrint.
*/
if (
    typeof document !== "undefined" &&
    !document.querySelector('style[data-rate-card-print="true"]')
) {
    const style = document.createElement("style");
    style.setAttribute("data-rate-card-print", "true");
    style.innerHTML = `
  @media print {
    body * { visibility: hidden !important; }

    #rateCardPrint, #rateCardPrint * { visibility: visible !important; }

    #rateCardPrint {
      position: absolute !important;
      inset: 0 auto auto 0 !important;
      left: 0; right: 0; top: 0;
      margin: 16mm auto !important;
      max-width: 180mm;
      background: #fff !important;
      color: #000 !important;
      border: none !important;
      box-shadow: none !important;
      padding: 30px !important;
    }

    /* white page + readable type */
    body { background: #fff !important; }
    #rateCardPrint .thead { color: #000 !important; border-color: #000 !important; }
    #rateCardPrint .tbody .row:nth-child(odd) { background: #f3f3f3 !important; }
    #rateCardPrint footer { color: #000 !important; }

    @page { margin: 12mm; }
  }`;
    document.head.appendChild(style);
}

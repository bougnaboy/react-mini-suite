// src/pages/apps/rupeeWords/styled.js
import styled from "styled-components";

const cardBg = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,0.25))";

export const Styled = {
    Wrapper: styled.div`
        max-width: var(--maxw, 960px);
        margin: 0 auto;
        padding: var(--space-5, 32px) var(--space-4, 24px) var(--space-6, 48px);
        color: ${text};
    `,

    Header: styled.header`
        margin-bottom: var(--space-5, 32px);

        h1 {
            font-size: clamp(22px, 4vw, 30px);
            line-height: 1.2;
            margin: 0 0 6px;
        }

        p {
            color: ${muted};
            margin: 0;
        }
    `,

    Panel: styled.section`
        display: grid;
        gap: var(--space-4, 24px);
    `,

    FormRow: styled.div`
        display: grid;
        gap: 10px;

        label {
            color: ${muted};
            font-size: 14px;
        }
    `,

    AmountInput: styled.input`
        background: ${cardBg};
        color: ${text};
        border: 1px solid ${border};
        border-radius: ${radius};
        padding: 14px 16px;
        font-size: 18px;
        outline: none;
        box-shadow: ${shadow};
        width: 100%;
        &:focus {
            border-color: ${accent};
            box-shadow: 0 0 0 2px color-mix(in srgb, ${accent} 30%, transparent);
        }
    `,

    Controls: styled.div`
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));

        select {
            width: 100%;
            background: ${cardBg};
            color: ${text};
            border: 1px solid ${border};
            border-radius: ${radius};
            padding: 10px 12px;
            outline: none;
            &:focus {
                border-color: ${accent};
            }
        }

        .checkbox {
            display: flex;
            align-items: center;
            gap: 10px;
            color: ${text};
            input {
                accent-color: ${accent};
                transform: translateY(1px);
            }
        }
    `,

    OutputCard: styled.div`
        background: ${cardBg};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 18px;

        .digits {
            display: flex;
            align-items: baseline;
            gap: 8px;
            color: ${muted};
            margin-bottom: 8px;

            strong {
                color: ${text};
                font-size: clamp(20px, 4vw, 28px);
                letter-spacing: 0.3px;
            }
        }

        .words {
            margin: 0;
            font-size: clamp(18px, 3.2vw, 22px);
            line-height: 1.5;
        }
    `,

    Actions: styled.div`
        display: flex;
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
    `,

    Note: styled.div`
        color: ${muted};
        font-size: 14px;
        p {
            margin: 0;
        }
    `,
};

/* ---- Print only the OutputCard (digits + words) ----
   Make sure the element has id="rupeeWordsPrint" in index.jsx
*/
if (
    typeof document !== "undefined" &&
    !document.querySelector('style[data-rupee-words-print="true"]')
) {
    const style = document.createElement("style");
    style.setAttribute("data-rupee-words-print", "true");
    style.innerHTML = `
  @media print {
    /* Hide everything by default */
    body * { visibility: hidden !important; }

    /* Show only the RupeeWords card and its descendants */
    #rupeeWordsPrint, #rupeeWordsPrint * { visibility: visible !important; }

    /* Position the card nicely for a single clean page */
    #rupeeWordsPrint {
      position: absolute !important;
      inset: 0 auto auto 0 !important;
      left: 0; right: 0; top: 0;
      margin: 20mm auto !important;
      max-width: 180mm;
      background: #fff !important;
      color: #000 !important;
      border: none !important;
      box-shadow: none !important;
      padding: 30px !important;
    }

    /* Never print UI controls or hints */
    .no-print { display: none !important; }

    /* Readable print typography */
    #rupeeWordsPrint .digits {
      color: #000 !important;
      margin-bottom: 6mm !important;
    }
    #rupeeWordsPrint .words {
      font-size: 22px !important;
      line-height: 1.6 !important;
      color: #000 !important;
    }

    /* White page */
    body { background: #fff !important; }

    /* Optional: remove default page margins if your browser honors @page */
    @page {
      margin: 12mm;
    }
  }`;
    document.head.appendChild(style);
}

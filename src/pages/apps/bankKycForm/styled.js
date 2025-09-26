import styled, { createGlobalStyle } from "styled-components";

const card = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,0.25))";
const maxw = "var(--maxw, 1100px)";

const labelCss = `
  display: block;
  font-size: 0.9rem;
  color: ${muted};
  margin-bottom: 6px;
`;

const inputCss = `
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: 1px solid ${border};
  color: ${text};
  border-radius: 10px;
  outline: none;
  transition: border-color .15s ease;
  &:focus { border-color: ${accent}; }
`;

/* 🔒 Print only this component’s summary (by id: #kyc-print-root) */
export const PrintOnlyGlobal = createGlobalStyle`
  @media print {
    @page {
      size: A4;
      margin: 12mm;
    }
    html, body {
      background: #fff !important;
    }
    /* Hide everything by default */
    body * {
      visibility: hidden !important;
    }
    /* Show only the KYC print root and its children */
    #kyc-print-root, #kyc-print-root * {
      visibility: visible !important;
    }
    /* Position the print root at the top-left of the page */
    #kyc-print-root {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      padding: 30px;
    }
  }
`;

export const Styled = {
    Wrapper: styled.div`
        width: 100%;
        display: grid;
        place-items: start center;
        padding: 24px;
    `,
    Header: styled.header`
        width: 100%;
        max-width: ${maxw};
        margin-bottom: 14px;
        h2 {
            margin: 0 0 6px;
        }
        p {
            color: ${muted};
            margin: 0;
        }
    `,
    Form: styled.form`
        width: 100%;
        max-width: ${maxw};
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 20px;

        /* Never print the interactive form */
        @media print {
            display: none !important;
        }
    `,
    Section: styled.section`
        & + & {
            margin-top: 22px;
        }
    `,
    SectionTitle: styled.h3`
        margin: 0 0 12px;
        font-size: 1.1rem;
    `,
    SubTitle: styled.h4`
        margin: 14px 0 10px;
        font-size: 1rem;
        color: ${muted};
    `,
    Grid: styled.div`
        display: grid;
        grid-template-columns: repeat(${(p) => p.$cols || 2}, 1fr);
        gap: 14px;

        .span2 {
            grid-column: span 2;
        }

        @media (max-width: 720px) {
            grid-template-columns: 1fr;
            .span2 {
                grid-column: auto;
            }
        }
    `,
    Field: styled.div`
        label {
            ${labelCss}
        }
        input,
        select {
            ${inputCss}
        }
    `,
    CopyRow: styled.div`
        margin-top: 10px;
        label {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: ${text};
            input {
                accent-color: ${accent};
            }
        }
    `,
    Declaration: styled.div`
        label {
            display: grid;
            grid-template-columns: 18px 1fr;
            align-items: start;
            gap: 10px;
            color: ${text};
            input {
                accent-color: ${accent};
                margin-top: 4px;
            }
        }
    `,
    Error: styled.div`
        color: #ef4444;
        font-size: 0.85rem;
        margin-top: 6px;
    `,
    ErrorBlock: styled.div`
        margin-top: 8px;
        color: #ef4444;
        font-size: 0.9rem;
    `,
    Success: styled.div`
        margin-top: 12px;
        padding: 10px 12px;
        border: 1px solid ${accent};
        background: rgba(34, 197, 94, 0.07);
        color: ${text};
        border-radius: 10px;
    `,
    Actions: styled.div`
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 18px;

        button {
            padding: 10px 14px;
            border-radius: 12px;
            border: 1px solid ${border};
            background: #161616;
            color: ${text};
            cursor: pointer;
            transition: transform 0.05s ease, border-color 0.15s ease;
            &:hover {
                border-color: ${accent};
            }
            &:active {
                transform: translateY(1px);
            }
        }
        .danger {
            background: #1a0f10;
            border-color: #7f1d1d;
            color: #fda4af;
        }
    `,
    PrintArea: styled.div`
        display: none;

        @media print {
            display: block;
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            color: #111;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            box-shadow: none !important;
            border: 0 !important;
        }

        h3 {
            text-align: center;
            margin-bottom: 12px;
            color: #111;
        }
    `,
    PrintGrid: styled.div`
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px 16px;
        font-size: 12pt;

        .span2 {
            grid-column: span 2;
        }

        @media print and (max-width: 700px) {
            grid-template-columns: 1fr;
        }
    `,
    PrintFooter: styled.div`
        margin-top: 16px;
        font-size: 12pt;

        .sign-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 40px;
        }
    `,
};

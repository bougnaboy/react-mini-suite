import styled, { createGlobalStyle } from "styled-components";

const cardBg = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const danger = "var(--danger, #ef4444)";
const radius = "var(--radius, 16px)";

export const Styled = {};

// Global print styles scoped to this page
Styled.PrintStyles = createGlobalStyle`
  /* Hide the print container on screen, show only in print */
  #printArea { display: none; }
  @media print {
    /* Hide everything by default */
    body * { visibility: hidden; }
    /* Show the ticket only */
    #printArea, #printArea * {
      visibility: visible;
      display: block;
    }
    #printArea {
      position: absolute;
      inset: 0;
      margin: 0;
      padding: 24px;
      background: #fff;
      color: #000;
    }
  }
`;

Styled.Wrapper = styled.div`
    max-width: var(--maxw, 1200px);
    margin: 0 auto;
    padding: 24px;
    color: ${text};
`;

Styled.Header = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
`;

Styled.Title = styled.h1`
    margin: 0;
    font-size: 22px;
    letter-spacing: 0.3px;
`;

Styled.Subtitle = styled.div`
    color: ${muted};
    font-size: 13px;
`;

Styled.Actions = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
`;

Styled.Button = styled.button`
    border: 1px solid ${border};
    background: ${(p) =>
        p.$variant === "danger"
            ? danger
            : p.$variant === "ghost"
            ? "transparent"
            : cardBg};
    color: ${text};
    padding: ${(p) => (p.$compact ? "6px 10px" : "8px 14px")};
    border-radius: 10px;
    cursor: pointer;
    opacity: ${(p) => (p.$active ? 1 : 0.9)};
    outline: none;
    &:hover {
        opacity: 1;
        border-color: ${accent};
    }
`;

Styled.FileLabel = styled.label`
    border: 1px dashed ${border};
    padding: 8px 12px;
    border-radius: 10px;
    cursor: pointer;
    display: inline-flex;
    gap: 8px;
    align-items: center;
    input {
        display: none;
    }
`;

Styled.Toolbar = styled.div`
    display: flex;
    gap: 12px;
    align-items: center;
    margin: 8px 0 16px;
`;

Styled.Search = styled.input`
    flex: 1;
    background: ${cardBg};
    color: ${text};
    border: 1px solid ${border};
    border-radius: 10px;
    padding: 10px 12px;
    outline: none;
`;

Styled.Board = styled.div`
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(4, minmax(220px, 1fr));
    @media (max-width: 1100px) {
        grid-template-columns: repeat(2, minmax(220px, 1fr));
    }
    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

Styled.Column = styled.section`
    border: 1px solid ${border};
    border-radius: ${radius};
    overflow: hidden;
    background: rgba(255, 255, 255, 0.02);
`;

Styled.ColumnHead = styled.div`
    padding: 10px 12px;
    border-bottom: 1px solid ${border};
    font-weight: 600;
    background: ${cardBg};
`;

Styled.ColBody = styled.div`
    padding: 12px;
    display: grid;
    gap: 10px;
`;

Styled.Empty = styled.div`
    color: ${muted};
    text-align: center;
    padding: 24px 8px;
    border: 1px dashed ${border};
    border-radius: 12px;
`;

Styled.Card = styled.article`
    border: 1px solid ${border};
    border-radius: 12px;
    padding: 10px 12px;
    background: ${cardBg};
    cursor: pointer;
    .row {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .between {
        justify-content: space-between;
    }
    .muted {
        color: ${muted};
        font-size: 12px;
        margin: 2px 0 6px;
    }
    .badge {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 999px;
        border: 1px solid ${border};
    }
`;

Styled.Modal = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: grid;
    place-items: center;
    z-index: 1000;
`;

Styled.SideModal = styled(Styled.Modal)`
    place-items: stretch end;
`;

Styled.Dialog = styled.div`
    width: min(880px, 96vw);
    max-height: 90vh;
    overflow: auto;
    background: #0c0c0c;
    border: 1px solid ${border};
    border-radius: 16px;
`;

Styled.SidePanel = styled(Styled.Dialog)`
    width: min(720px, 95vw);
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
`;

Styled.DialogHead = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-bottom: 1px solid ${border};
    h3 {
        margin: 0;
        font-size: 16px;
    }
    button {
        background: transparent;
        color: ${text};
        border: 0;
        font-size: 18px;
        cursor: pointer;
    }
`;

Styled.Form = styled.form`
    padding: 14px;
    display: grid;
    gap: 12px;
    label {
        display: grid;
        gap: 6px;
        font-size: 13px;
    }
    input,
    textarea {
        background: ${cardBg};
        color: ${text};
        border: 1px solid ${border};
        border-radius: 10px;
        padding: 8px 10px;
        outline: none;
    }
    .full {
        grid-column: 1 / -1;
    }
`;

Styled.Grid = styled.div`
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(2, minmax(180px, 1fr));
    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
    label {
        display: flex;

        span {
            width: 100px;
        }
        input {
            padding: 0 5px;
        }
    }
`;

Styled.DialogFoot = styled.div`
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
    padding: 12px 14px;
    border-top: 1px solid ${border};
`;

Styled.Detail = styled.div`
    padding: 12px 14px;
    .meta {
        display: grid;
        gap: 6px;
        margin-bottom: 10px;
        color: ${muted};
        font-size: 13px;
    }
`;

Styled.MoveRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 8px 0 12px;
    span {
        color: ${muted};
        font-size: 13px;
    }
`;

Styled.PrintContainer = styled.div`
    /* hidden on screen; revealed by @media print in PrintStyles */
    display: none;
    background: #fff;
    color: #000;
    padding: 6px 8px;
    h2 {
        margin: 0 0 6px;
    }
    .row {
        display: flex;
        justify-content: space-between;
    }
    .muted {
        color: #444;
        font-size: 12px;
    }
    .total {
        font-weight: 700;
    }
    .balance {
        font-weight: 700;
    }
`;

Styled.FooterNote = styled.div`
    margin-top: 10px;
    font-size: 12px;
    text-align: center;
    color: #333;
`;

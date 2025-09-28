import styled, { createGlobalStyle } from "styled-components";

// tokens aligned with your hub
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const cardBg = "var(--card, #111)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 6px 24px rgba(0,0,0,.3))";

/* Global print: show only the preview marked data-print="true" */
export const GlobalPrint = createGlobalStyle`
  @media print {
    /* force light page for print */
    :root { color-scheme: light !important; }
    html, body, #root, main, .App, .app, .layout {
      background: #fff !important;
      color: #111 !important;
    }

    /* hide everything... */
    body * { visibility: hidden !important; }

    /* ...except the current preview */
    [data-print="true"],
    [data-print="true"] * {
      visibility: visible !important;
    }

    /* make the preview fill the page and drop app chrome */
    [data-print="true"] {
      position: fixed !important;
      left: 0; top: 0;
      width: 100% !important;
      box-shadow: none !important;
      background: #fff !important;
      color: #111 !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    /* clean margins for PDF */
    @page { margin: 14mm; padding: 30px; }
  }
`;

const Wrapper = styled.div`
    color: ${text};
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
`;

const Header = styled.header`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;

    .title h1 {
        margin: 0;
        font-size: 24px;
    }
    .title .muted {
        color: ${muted};
    }
`;

const Actions = styled.div`
    display: flex;
    gap: 10px;
    flex-wrap: wrap;

    select {
        background: ${cardBg};
        color: ${text};
        border: 1px solid ${border};
        border-radius: 10px;
        padding: 8px 10px;
    }

    .btn {
        background: ${accent};
        color: #0b0b0b;
        border: 1px solid ${accent};
        border-radius: ${radius};
        padding: 8px 12px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: ${shadow};
    }
    .btn.ghost {
        background: transparent;
        color: ${text};
        border: 1px solid ${border};
    }
`;

const Layout = styled.div`
    display: grid;
    grid-template-columns: 420px 1fr;
    gap: 16px;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const FormCard = styled.section`
    background: ${cardBg};
    border: 1px solid ${border};
    border-radius: ${radius};
    padding: 16px;
    box-shadow: ${shadow};

    form {
        display: grid;
        gap: 10px;
    }
    .row {
        display: grid;
        gap: 6px;
    }
    .row.two {
        grid-template-columns: 1fr 1fr;
        gap: 10px;
    }
    .row.end {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }

    label {
        font-size: 12px;
        color: ${muted};
    }
    input,
    textarea {
        background: #0e0e0e;
        color: ${text};
        border: 1px solid ${border};
        border-radius: 10px;
        padding: 8px 10px;
        outline: none;
    }
    textarea {
        resize: vertical;
    }

    .photoRow {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
    }
    .mini {
        width: 40px;
        height: 40px;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid ${border};
    }
`;

const PreviewArea = styled.section`
    display: grid;
    gap: 16px;
`;

const Paper = styled.article`
    background: #fff;
    color: #111;
    border-radius: 12px;
    padding: 18px;
    box-shadow: ${shadow};
    min-height: 400px;

    &[hidden] {
        display: none !important;
    }

    .paper-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
    }
    .who h1 {
        margin: 0;
        font-size: 22px;
    }
    .who p {
        margin: 2px 0;
    }
    .muted {
        color: #555;
    }

    .avatar {
        width: 84px;
        height: 84px;
        object-fit: cover;
        border-radius: 10px;
    }

    .card {
        border: 1px solid #e8e8e8;
        border-radius: 10px;
        padding: 12px;
        margin: 10px 0;
    }

    .tags {
        margin-top: 6px;
    }
    .tag {
        display: inline-block;
        border: 1px solid #e1e1e1;
        border-radius: 999px;
        padding: 4px 10px;
        margin: 4px 6px 0 0;
        font-size: 12px;
        background: #fafafa;
    }

    .grid {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .proj h3 {
        margin: 0 0 4px 0;
        font-size: 15px;
    }
    .proj .muted {
        margin: 0 0 6px 0;
    }
    .proj a {
        text-decoration: none;
        color: #111;
        border: 1px dashed #ccc;
        border-radius: 8px;
        padding: 4px 8px;
    }

    .plain {
        list-style: none;
        padding-left: 0;
        margin: 6px 0 0 0;
    }
    .plain li {
        margin: 2px 0;
    }

    .two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }

    .card,
    .proj,
    .exp {
        break-inside: avoid;
        page-break-inside: avoid;
    }
`;

const PrintNote = styled.div`
    height: 0;
    overflow: hidden;
`;

export const Styled = {
    Wrapper,
    Header,
    Actions,
    Layout,
    FormCard,
    PreviewArea,
    Paper,
    PrintNote,
};

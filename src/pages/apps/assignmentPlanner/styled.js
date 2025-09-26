import styled from "styled-components";

const cardBg = "var(--card, #121212)";
const text = "var(--text, #eaeaea)";
const muted = "var(--muted, #a8a8a8)";
const border = "var(--border, #242424)";
const accent = "var(--accent, #22c55e)";
const danger = "var(--danger, #ef4444)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 28px rgba(0,0,0,0.30))";

export const Styled = {};

Styled.Wrapper = styled.div`
    max-width: var(--maxw, 1100px);
    margin: 0 auto;
    padding: 24px 16px 32px;
    color: ${text};
`;

Styled.Header = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
`;
Styled.Title = styled.h1`
    margin: 0;
    font-size: 22px;
    letter-spacing: 0.2px;
`;
Styled.Subtitle = styled.div`
    color: ${muted};
    font-size: 13px;
`;

Styled.Actions = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
`;

Styled.Button = styled.button`
    border: 1px solid ${border};
    background: ${(p) =>
        p.$variant === "danger"
            ? "linear-gradient(180deg,#2a1111,#200f0f)"
            : p.$variant === "ghost"
            ? "transparent"
            : "linear-gradient(180deg,#1a1a1a,#141414)"};
    color: ${text};
    padding: 8px 14px;
    border-radius: 10px;
    cursor: pointer;
    &:hover {
        border-color: ${(p) => (p.$variant === "danger" ? danger : accent)};
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
    gap: 10px;
    align-items: center;
    margin: 14px 0 10px;
    flex-wrap: wrap;
`;

Styled.Search = styled.input`
    flex: 1 1 280px;
    background: #0e0e0e;
    color: ${text};
    border: 1px solid ${border};
    border-radius: 10px;
    padding: 10px 12px;
    outline: none;
`;

Styled.Select = styled.select`
    height: 40px;
    background: #0e0e0e;
    color: ${text};
    border: 1px solid ${border};
    border-radius: 10px;
    padding: 0 10px;
    outline: none;
`;

Styled.Stats = styled.div`
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 10px;
    .muted {
        color: ${muted};
    }
    em {
        font-style: normal;
        color: ${text};
    }
`;

Styled.Card = styled.section`
    background: linear-gradient(180deg, #131313, #0f0f0f);
    border: 1px solid ${border};
    border-radius: ${radius};
    box-shadow: ${shadow};
    padding: 12px;
`;

Styled.Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    th,
    td {
        border-bottom: 1px solid ${border};
        padding: 10px;
        vertical-align: top;
    }
    th {
        color: ${muted};
        text-align: left;
    }
    td.num {
        text-align: right;
    }
`;

Styled.Empty = styled.div`
    border: 1px dashed ${border};
    padding: 16px;
    border-radius: 12px;
    color: ${muted};
    text-align: center;
`;

Styled.TitleCell = styled.div`
    cursor: pointer;
    .muted.small {
        font-size: 12px;
        color: ${muted};
        margin-top: 4px;
    }
    &:hover strong {
        text-decoration: underline;
    }
`;

Styled.Pill = styled.span`
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid ${border};
    text-transform: capitalize;
    &[data-prio="high"] {
        color: #ffcaca;
        border-color: #5a1a1a;
        background: #2a1111;
    }
    &[data-prio="med"] {
        color: #fff2c2;
        border-color: #5a4b1a;
        background: #2a2911;
    }
    &[data-prio="low"] {
        color: #c8ffd6;
        border-color: #1a5a2a;
        background: #112a1b;
    }
`;

Styled.InlineSelect = styled.select`
    background: #0e0e0e;
    color: ${text};
    border: 1px solid ${border};
    border-radius: 10px;
    padding: 6px 8px;
    outline: none;
`;

Styled.DueBadge = styled.div`
    display: inline-block;
    margin-top: 6px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    border: 1px solid ${border};
    color: ${(p) => (p.$overdue ? "#ffb3b3" : p.$soon ? "#ffe6b3" : "#c8ffd6")};
    background: ${(p) =>
        p.$overdue ? "#2a1111" : p.$soon ? "#2a2911" : "#112a1b"};
`;

Styled.Modal = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: grid;
    place-items: center;
    z-index: 1000;
`;
Styled.Dialog = styled.div`
    width: min(760px, 96vw);
    max-height: 90vh;
    overflow: auto;
    background: #0c0c0c;
    border: 1px solid ${border};
    border-radius: 16px;
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
    textarea,
    select {
        background: #0e0e0e;
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
Styled.Grid2 = styled.div`
    display: grid;
    gap: 10px;
    grid-template-columns: 1fr 1fr;
    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;
Styled.DialogFoot = styled.div`
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 12px 14px;
    border-top: 1px solid ${border};
`;

Styled.IconBtn = styled.button`
    border: 1px solid ${border};
    background: transparent;
    color: ${text};
    border-radius: 8px;
    padding: 4px 8px;
    cursor: pointer;
    margin-left: 6px;
    &:hover {
        border-color: ${danger};
        color: #fff;
    }
`;

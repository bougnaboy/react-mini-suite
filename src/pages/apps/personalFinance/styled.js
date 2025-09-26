import styled from "styled-components";

const text = "var(--text, #eaeaea)";
const muted = "var(--muted, #a8a8a8)";
const border = "var(--border, #242424)";
const accent = "var(--accent, #22c55e)";
const danger = "var(--danger, #ef4444)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 28px rgba(0,0,0,0.30))";

export const Styled = {};

/* Shell */
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

/* Toolbar */
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
Styled.MonthInput = styled.input`
    height: 40px;
    background: #0e0e0e;
    color: ${text};
    border: 1px solid ${border};
    border-radius: 10px;
    padding: 0 10px;
    outline: none;
    /* keep calendar icon visible on dark */
    &::-webkit-calendar-picker-indicator {
        filter: invert(1);
    }
`;

/* Stats */
Styled.Stats = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;
    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
`;
Styled.StatCard = styled.div`
    background: linear-gradient(180deg, #131313, #0f0f0f);
    border: 1px solid ${border};
    border-radius: ${radius};
    box-shadow: ${shadow};
    padding: 12px;

    .num {
        font-size: 18px;
        margin-top: 6px;
    }
`;

/* Grid */
Styled.Grid = styled.div`
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 24px;
    margin-bottom: 16px;
    @media (max-width: 980px) {
        grid-template-columns: 1fr;
    }
`;

/* Cards */
Styled.Card = styled.section`
    background: linear-gradient(180deg, #131313, #0f0f0f);
    border: 1px solid ${border};
    border-radius: ${radius};
    box-shadow: ${shadow};
    padding: 14px;
`;
Styled.CardHead = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
`;
Styled.CardTitle = styled.h2`
    margin: 0;
    font-size: 18px;
`;

Styled.Empty = styled.div`
    border: 1px dashed ${border};
    padding: 16px;
    border-radius: 12px;
    color: ${muted};
    text-align: center;
`;

/* Budgets */
Styled.BudgetList = styled.div`
    display: grid;
    gap: 10px;
`;
Styled.BudgetItem = styled.div`
    border: 1px solid ${(p) => (p.$over ? "#5a1a1a" : border)};
    background: #101010;
    border-radius: 12px;
    padding: 10px;
    .top {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 10px;
        align-items: center;
    }
    .name {
        height: 40px;
        background: #0e0e0e;
        color: ${text};
        border: 1px solid ${border};
        border-radius: 10px;
        padding: 0 10px;
        outline: none;
    }
    .amount {
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .amount .sym {
        color: ${muted};
    }
    .amount .num {
        width: 120px;
        height: 40px;
        background: #0e0e0e;
        color: ${text};
        border: 1px solid ${border};
        border-radius: 10px;
        padding: 0 10px;
        outline: none;
    }
`;
Styled.Progress = styled.div`
    margin-top: 8px;
    border: 1px solid ${border};
    border-radius: 999px;
    height: 10px;
    background: #0d0d0d;
    overflow: hidden;
    .bar {
        height: 100%;
        background: ${accent};
    }
`;
Styled.BudgetMeta = styled.div`
    margin-top: 6px;
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
`;

/* Accounts */
Styled.AccountList = styled.div`
    display: grid;
    gap: 8px;
`;
Styled.AccountItem = styled.div`
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 10px;
    align-items: center;
    border: 1px solid ${border};
    border-radius: 12px;
    padding: 8px 10px;
    background: #101010;
    .small {
        font-size: 12px;
    }
    .right {
        text-align: right;
    }
`;

/* Transaction form */
Styled.TxnForm = styled.form`
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(6, 1fr);
    @media (max-width: 980px) {
        grid-template-columns: 1fr 1fr;
    }
    label {
        display: grid;
        gap: 6px;
        font-size: 13px;
    }
    input,
    select {
        height: 40px;
        background: #0e0e0e;
        color: ${text};
        border: 1px solid ${border};
        border-radius: 10px;
        padding: 0 10px;
        outline: none;
    }
    input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(1);
    }
    .full {
        grid-column: 1 / -1;
    }
    .amountInput {
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .amountInput .sym {
        color: ${muted};
    }
    .actions {
        grid-column: 1 / -1;
        display: flex;
        justify-content: flex-end;
    }
`;

/* Table */
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
Styled.Pill = styled.span`
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid ${border};
    text-transform: capitalize;
    &[data-type="expense"] {
        color: #ffb3b3;
        border-color: #5a1a1a;
        background: #2a1111;
    }
    &[data-type="income"] {
        color: #c8ffd6;
        border-color: #1a5a2a;
        background: #112a1b;
    }
`;

Styled.IconBtn = styled.button`
    border: 1px solid ${border};
    background: transparent;
    color: ${text};
    border-radius: 8px;
    padding: 4px 8px;
    cursor: pointer;
    &:hover {
        border-color: ${danger};
        color: #fff;
    }
`;

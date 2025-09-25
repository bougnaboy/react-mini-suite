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
    padding: 24px 16px;
    color: ${text};
`;

Styled.Header = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
`;

Styled.Title = styled.h1`
    margin: 0;
    font-size: 22px;
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
            ? "linear-gradient(180deg, #2a1111, #200f0f)"
            : p.$variant === "ghost"
            ? "transparent"
            : "linear-gradient(180deg, #1a1a1a, #141414)"};
    color: ${text};
    padding: 8px 14px;
    border-radius: 10px;
    cursor: pointer;
    &:hover {
        border-color: ${(p) => (p.$variant === "danger" ? danger : accent)};
    }
`;

Styled.MetaRow = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    padding: 8px 0 12px;
    color: ${muted};
    font-size: 14px;
    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
`;

Styled.Card = styled.section`
    background: linear-gradient(180deg, #131313, #0f0f0f);
    border: 1px solid ${border};
    border-radius: ${radius};
    box-shadow: ${shadow};
    padding: 16px;
    margin-bottom: 22px;
`;

Styled.CardHead = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
`;
Styled.CardTitle = styled.h2`
    margin: 0;
    font-size: 18px;
`;

Styled.Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    th,
    td {
        border-bottom: 1px solid ${border};
        padding: 8px;
        font-size: 14px;
    }
    th {
        text-align: left;
        color: ${muted};
        font-weight: 600;
    }
    .num {
        text-align: right;
    }
    input,
    select {
        width: 100%;
        background: #101010;
        color: ${text};
        border: 1px solid ${border};
        border-radius: 10px;
        padding: 8px 10px;
        outline: none;
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

Styled.Totals = styled.div`
    margin-top: 12px;
    display: grid;
    gap: 12px;
    grid-template-columns: 1fr auto;
    @media (max-width: 840px) {
        grid-template-columns: 1fr;
    }

    .billdisc {
        label {
            color: ${muted};
            font-size: 13px;
            display: block;
            margin-bottom: 6px;
        }
        .row {
            display: flex;
            gap: 8px;
        }
        select,
        input {
            height: 42px;
            background: #101010;
            color: ${text};
            border: 1px solid ${border};
            border-radius: 10px;
            padding: 0 10px;
        }
        input {
            width: 140px;
        }
    }

    .sums {
        display: grid;
        gap: 6px;
        min-width: 260px;
        div {
            display: flex;
            justify-content: space-between;
            gap: 12px;
        }
        .grand {
            font-size: 18px;
            font-weight: 700;
        }
    }
`;

Styled.NoteBox = styled.textarea`
    margin-top: 12px;
    width: 100%;
    min-height: 70px;
    resize: vertical;
    background: #101010;
    color: ${text};
    border: 1px solid ${border};
    border-radius: 10px;
    padding: 10px;
`;

Styled.H2 = styled.h2`
    margin: 18px 0 8px;
    font-size: 18px;
`;
Styled.History = styled.div`
    display: grid;
    gap: 10px;
`;
Styled.Empty = styled.div`
    border: 1px dashed ${border};
    border-radius: 12px;
    padding: 18px;
    color: ${muted};
    text-align: center;
`;

Styled.HItem = styled.div`
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 12px;
    align-items: center;
    border: 1px solid ${border};
    border-radius: 12px;
    padding: 10px 12px;
    background: ${cardBg};
    .muted {
        color: ${muted};
        font-size: 13px;
    }
    .row {
        display: flex;
        gap: 8px;
    }
    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
`;

/* Modal */
Styled.Modal = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: grid;
    place-items: center;
    z-index: 1000;
`;
Styled.Dialog = styled.div`
    width: min(720px, 96vw);
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
        background: #101010;
        color: ${text};
        border: 1px solid ${border};
        border-radius: 10px;
        padding: 8px 10px;
        outline: none;
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

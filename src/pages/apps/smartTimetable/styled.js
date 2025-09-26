import styled from "styled-components";

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
    em {
        color: ${text};
        font-style: normal;
    }
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

Styled.Grid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-top: 14px;
    @media (max-width: 980px) {
        grid-template-columns: 1fr;
    }
`;

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

Styled.SubjectList = styled.div`
    display: grid;
    gap: 10px;
`;
Styled.SubjectItem = styled.div`
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 10px;
    align-items: center;
    border: 1px solid ${(p) => (p.$active ? accent : border)};
    border-radius: 12px;
    padding: 8px 10px;
    background: #101010;
    .fields {
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: 8px;
    }
    .fields .code,
    .fields .name {
        height: 40px;
        background: #0e0e0e;
        color: ${text};
        border: 1px solid ${border};
        border-radius: 10px;
        padding: 0 10px;
        outline: none;
    }
    .ops input[type="color"] {
        width: 36px;
        height: 36px;
        border: none;
        background: transparent;
        padding: 0;
        cursor: pointer;
    }
`;

Styled.ColorSwatch = styled.button`
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 1px solid ${border};
    cursor: pointer;
`;

Styled.Hint = styled.div`
    font-size: 12px;
    margin-top: 8px;
`;

Styled.SettingsRow = styled.div`
    display: grid;
    gap: 16px;
`;

Styled.DayToggles = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
    label {
        display: flex;
        gap: 6px;
        align-items: center;
        border: 1px solid ${border};
        border-radius: 999px;
        padding: 6px 10px;
        background: #0e0e0e;
    }
`;

Styled.PeriodList = styled.div`
    display: grid;
    gap: 8px;
    margin-top: 8px;
    .row {
        display: grid;
        grid-template-columns: 120px 1fr auto;
        gap: 8px;
        align-items: center;
    }
    .plabel,
    .ptime {
        height: 40px;
        background: #0e0e0e;
        color: ${text};
        border: 1px solid ${border};
        border-radius: 10px;
        padding: 0 10px;
        outline: none;
    }
`;

Styled.Row = styled.div`
    display: flex;
    gap: ${(p) => p.gap || 12}px;
    flex-wrap: wrap;
    margin-top: 8px;
`;

Styled.Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    th,
    td {
        border: 1px solid ${border};
        padding: 10px;
    }
    th {
        color: ${muted};
    }
    td {
        text-align: center;
        vertical-align: middle;
    }
    .muted {
        color: ${muted};
    }
`;

Styled.Cell = styled.div`
    display: inline-block;
    min-width: 64px;
    border: 1px solid ${border};
    background: #0e0e0e;
    color: ${text};
    border-radius: 10px;
    padding: 6px 8px;
    .sub {
        font-weight: 700;
    }
    .room {
        font-size: 12px;
        opacity: 0.85;
    }
`;
Styled.Dash = styled.span`
    color: ${muted};
`;

Styled.Empty = styled.div`
    border: 1px dashed ${border};
    padding: 16px;
    border-radius: 12px;
    color: ${muted};
    text-align: center;
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
    width: min(560px, 96vw);
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
Styled.DialogFoot = styled.div`
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 12px 14px;
    border-top: 1px solid ${border};
`;

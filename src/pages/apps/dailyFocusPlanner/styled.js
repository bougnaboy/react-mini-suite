import styled from "styled-components";

const bg = "var(--bg, #0b0b0b)";
const card = "var(--card, #121212)";
const text = "var(--text, #eaeaea)";
const muted = "var(--muted, #a8a8a8)";
const border = "var(--border, #242424)";
const accent = "var(--accent, #22c55e)";
const danger = "var(--danger, #ef4444)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 28px rgba(0,0,0,0.30))";
const maxw = "var(--maxw, 1100px)";

export const Styled = {};

Styled.Wrapper = styled.div`
    color: ${text};
    background: #000; /* keep dark shell parity */
    min-height: 100vh;
`;

Styled.Header = styled.header`
    max-width: ${maxw};
    margin: 0 auto;
    padding: 24px 16px 8px;
`;

Styled.TitleRow = styled.div`
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
    margin-top: 6px;
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

Styled.DatePill = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid ${border};
    border-radius: 999px;
    padding: 6px 12px;
    background: #101010;
    span {
        color: ${text};
    }
`;

Styled.CalendarIcon = styled.i`
    width: 16px;
    height: 16px;
    display: inline-block;
    background: currentColor;
    color: #fff; /* white icon as requested */
    -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 1 1 2 0v1zm12 7H5v10h14V9z"/></svg>')
        center / contain no-repeat;
    mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 1 1 2 0v1zm12 7H5v10h14V9z"/></svg>')
        center / contain no-repeat;
`;

Styled.Main = styled.main`
    max-width: ${maxw};
    margin: 0 auto;
    padding: 0 16px 28px;
`;

Styled.Grid = styled.div`
    display: grid;
    grid-template-columns: 1.2fr 2fr;
    gap: 24px;
    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

Styled.Card = styled.section`
    background: linear-gradient(180deg, #131313, #0f0f0f);
    border: 1px solid ${border};
    border-radius: ${radius};
    box-shadow: ${shadow};
    padding: 16px;
`;

Styled.CardHead = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
`;
Styled.CardTitle = styled.h2`
    margin: 0;
    font-size: 18px;
`;

Styled.TaskAdd = styled.div`
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px;
    margin-bottom: 10px;
    input {
        height: 42px;
        padding: 0 12px;
        border-radius: 12px;
        border: 1px solid ${border};
        background: #101010;
        color: ${text};
        outline: none;
    }
`;

Styled.TaskList = styled.div`
    display: grid;
    gap: 8px;
`;

Styled.TaskItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border: 1px solid ${border};
    border-radius: 12px;
    padding: 8px 10px;
    background: #101010;
    label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
    }
    input[type="checkbox"] {
        transform: translateY(1px);
    }
    .done {
        text-decoration: line-through;
        color: ${muted};
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

Styled.Empty = styled.div`
    border: 1px dashed ${border};
    border-radius: 12px;
    padding: 14px;
    color: ${muted};
    text-align: center;
`;

Styled.Slots = styled.div`
    display: grid;
    gap: 10px;
`;

Styled.SlotRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
`;

Styled.Slot = styled.div`
    display: grid;
    grid-template-columns: 70px 1fr;
    gap: 8px;
    align-items: center;
    input {
        height: 40px;
        background: #101010;
        color: ${text};
        border: 1px solid ${border};
        border-radius: 10px;
        padding: 0 10px;
        outline: none;
    }
`;

Styled.TimeLabel = styled.div`
    font-size: 13px;
    color: ${muted};
    font-weight: 600;
`;

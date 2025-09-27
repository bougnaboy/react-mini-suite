import styled from "styled-components";

const bg = "var(--bg, #0b0b0b)";
const card = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const danger = "var(--danger, #ef4444)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,0.25))";
const space2 = "var(--space-2, 10px)";
const space3 = "var(--space-3, 16px)";
const space4 = "var(--space-4, 24px)";

export const Styled = {
    Wrapper: styled.div`
        width: 100%;
        display: grid;
        place-items: start center;
        padding: ${space4};
        color: ${text};
    `,
    Card: styled.section`
        width: min(720px, 100%);
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: ${space4};
    `,
    Title: styled.h2`
        margin: 0 0 ${space2};
        font-size: 24px;
        line-height: 1.2;
    `,
    Subtitle: styled.p`
        margin: 0 0 ${space4};
        color: ${muted};
    `,
    Settings: styled.div`
        display: flex;
        gap: ${space3};
        align-items: flex-end;
        flex-wrap: wrap;
        margin-bottom: ${space3};
    `,
    Field: styled.div`
        display: grid;
        gap: 6px;
        min-width: 120px;
    `,
    Label: styled.label`
        font-size: 12px;
        color: ${muted};
    `,
    NumInput: styled.input`
        padding: 10px 12px;
        background: ${bg};
        color: ${text};
        border: 1px solid ${border};
        border-radius: ${radius};
        outline: none;
        width: 140px;
        &:focus {
            border-color: ${accent};
        }
        &::placeholder {
            color: ${muted};
        }
    `,
    RangeNote: styled.span`
        color: ${muted};
        border-left: 1px solid ${border};
        padding-left: ${space3};
    `,
    Row: styled.div`
        display: flex;
        gap: ${space3};
        margin-bottom: ${space3};
        flex-wrap: wrap;
    `,
    Input: styled.input`
        flex: 1 1 220px;
        min-width: 200px;
        padding: 12px 14px;
        background: ${bg};
        color: ${text};
        border: 1px solid ${border};
        border-radius: ${radius};
        outline: none;
        &:focus {
            border-color: ${accent};
        }
        &::placeholder {
            color: ${muted};
        }
    `,
    Button: styled.button`
        padding: 12px 16px;
        border-radius: ${radius};
        border: 1px solid ${border};
        background: ${(p) => (p.$variant === "ghost" ? "transparent" : accent)};
        color: ${(p) => (p.$variant === "ghost" ? text : "#0b0b0b")};
        cursor: pointer;
        transition: transform 0.02s ease-in-out, opacity 0.2s ease-in-out;
        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        &:active {
            transform: translateY(1px);
        }
    `,
    Meta: styled.div`
        display: flex;
        gap: ${space3};
        align-items: center;
        color: ${muted};
        margin-bottom: ${space2};
        span + span {
            border-left: 1px solid ${border};
            padding-left: ${space3};
        }
    `,
    Message: styled.p`
        margin: 0 0 ${space3};
        &.good {
            color: ${accent};
        }
        &.bad {
            color: ${danger};
        }
        &.warn {
            color: ${text};
        }
    `,
    H3: styled.h3`
        margin: ${space3} 0 ${space2};
        font-size: 16px;
        color: ${muted};
        font-weight: 600;
    `,
    History: styled.ul`
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: ${space2};
        li {
            border: 1px solid ${border};
            border-radius: ${radius};
            padding: 10px 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #0f0f0f;
        }
        span {
            color: ${muted};
        }
    `,
};

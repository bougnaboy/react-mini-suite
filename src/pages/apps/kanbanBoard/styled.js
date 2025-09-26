import styled, { css, keyframes } from "styled-components";

/* ---- Tokens (kept consistent with your previous app) ---- */
const border = "1px solid hsl(0 0% 100% / 0.14)";
const borderMuted = "1px solid hsl(0 0% 100% / 0.10)";
const focusRing = "0 0 0 3px hsl(0 0% 100% / 0.15)";

const flash = keyframes`
  from { box-shadow: 0 0 0 0 hsl(200 80% 60% / 0.0); }
  to   { box-shadow: 0 0 0 4px hsl(200 80% 60% / 0.35); }
`;

export const Styled = {
    /* Page */
    Page: styled.div`
        min-height: 100dvh;
    `,
    Container: styled.div`
        max-width: 1280px;
        margin: 0 auto;
        padding: 32px 18px 72px;
    `,

    /* Header */
    Header: styled.header`
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: end;
        margin: 12px 0 18px;
        flex-wrap: wrap;
    `,
    Title: styled.h1`
        font-size: clamp(28px, 3.5vw, 40px);
        line-height: 1.1;
        margin: 0 0 6px;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: inherit;
    `,
    Sub: styled.p`
        margin: 0;
        color: inherit;
        opacity: 0.8;
        font-size: 14px;
    `,
    BulletList: styled.ul`
        margin: 0;
        padding-left: 18px;
        list-style: disc outside;
        font-size: 14px;
        opacity: 0.85;
        line-height: 1.6;
    `,
    BulletItem: styled.li`
        margin: 2px 0;
    `,
    BadgeRow: styled.div`
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
    `,
    Tag: styled.span`
        font-size: 12px;
        padding: 6px 10px;
        border-radius: 999px;
        border: ${borderMuted};
        color: inherit;
        ${({ $tone }) =>
            $tone === "muted" &&
            css`
                opacity: 0.7;
            `}
    `,

    /* Cards + layout */
    Card: styled.div`
        border-radius: 16px;
        padding: 16px;
        border: ${border};
        background: transparent;
    `,
    FormRow: styled.div`
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: start;
        > * {
            min-width: 0;
        }
    `,
    RowWrap: styled.div`
        /* border: 1px solid #f00; */
        height: 90px;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        align-items: center;
    `,
    ButtonRow: styled.div`
        /* border: 1px solid #f00; */
        width: 100%;
        height: 75px;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        align-items: center;
        flex-wrap: wrap;
        margin-top: 8px;
    `,

    /* Inputs */
    Label: styled.label`
        display: grid;
        gap: 6px;
        font-size: 12px;
        opacity: 0.95;
        min-width: 0;
        flex: 1 1 220px;
    `,
    LabelText: styled.span`
        opacity: 0.85;
        font-weight: 600;
    `,
    Input: styled.input`
        background: transparent;
        color: inherit;
        border: ${border};
        border-radius: 10px;
        padding: 10px 12px;
        font-size: 14px;
        outline: none;
        caret-color: currentColor;
        min-width: 0;
        width: 100%;
        &::placeholder {
            color: hsl(0 0% 100% / 0.35);
        }
        &:focus-visible {
            box-shadow: ${focusRing};
            border-color: hsl(0 0% 100% / 0.35);
        }
    `,
    Textarea: styled.textarea`
        background: transparent;
        color: inherit;
        border: ${border};
        border-radius: 10px;
        padding: 10px 12px;
        font-size: 14px;
        outline: none;
        min-height: 80px;
        resize: vertical;
        width: 100%;
        &::placeholder {
            color: hsl(0 0% 100% / 0.35);
        }
        &:focus-visible {
            box-shadow: ${focusRing};
            border-color: hsl(0 0% 100% / 0.35);
        }
    `,
    Select: styled.select`
        background: transparent;
        color: inherit;
        border: ${border};
        border-radius: 10px;
        padding: 10px 12px;
        font-size: 14px;
        outline: none;
        min-width: 0;
        width: 100%;
        &:focus-visible {
            box-shadow: ${focusRing};
            border-color: hsl(0 0% 100% / 0.35);
        }
        option {
            color: #000;
        }
    `,
    DateInput: styled.input.attrs({ type: "date" })`
        background: transparent;
        color: inherit;
        border: ${border};
        border-radius: 10px;
        padding: 10px 12px;
        font-size: 14px;
        outline: none;
        min-width: 0;
        width: 100%;
        &:focus-visible {
            box-shadow: ${focusRing};
            border-color: hsl(0 0% 100% / 0.35);
        }
        &::-webkit-calendar-picker-indicator {
            filter: invert(1) opacity(0.85);
        }
    `,

    /* Buttons */
    PrimaryButton: styled.button`
        border: ${border};
        background: transparent;
        color: inherit;
        padding: 10px 14px;
        border-radius: 10px;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.05s ease;
        white-space: nowrap;
        max-width: max-content;
        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        &:active {
            transform: translateY(1px);
        }
        &:focus-visible {
            box-shadow: ${focusRing};
        }
    `,
    Button: styled.button`
        border: ${border};
        background: transparent;
        color: inherit;
        padding: 10px 14px;
        border-radius: 10px;
        cursor: pointer;
        white-space: nowrap;
        &:active {
            transform: translateY(1px);
        }
        &:focus-visible {
            box-shadow: ${focusRing};
        }
    `,
    DangerButton: styled.button`
        border: 1px solid hsl(0 70% 60% / 0.7);
        background: transparent;
        color: hsl(0 70% 70% / 0.9);
        padding: 10px 14px;
        border-radius: 10px;
        cursor: pointer;
        white-space: nowrap;
        &:active {
            transform: translateY(1px);
        }
        &:focus-visible {
            box-shadow: 0 0 0 3px hsl(0 70% 60% / 0.25);
        }
    `,

    /* Board grid */
    BoardGrid: styled.div`
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        align-items: start;
        margin-top: 12px;
        @media (width < 900px) {
            grid-template-columns: 1fr;
        }
    `,
    Column: styled.div`
        display: grid;
        grid-template-rows: auto 1fr;
        gap: 10px;
        border: ${border};
        border-radius: 14px;
        padding: 10px;
        background: transparent;
        min-height: 380px;
        position: relative;
    `,
    ColumnHeader: styled.div`
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    `,
    ColumnTitle: styled.h3`
        margin: 0;
        font-size: 18px;
        font-weight: 800;
        letter-spacing: -0.01em;
    `,
    ColumnMeta: styled.div`
        display: flex;
        gap: 6px;
        align-items: center;
        opacity: 0.85;
        font-size: 12px;
        flex-wrap: wrap;
    `,

    /* Task list */
    TaskList: styled.div`
        display: grid;
        gap: 10px;
        align-content: start;
        min-height: 280px;
    `,

    /* Task card */
    TaskCard: styled.div`
        border: 1px solid hsl(0 0% 100% / 0.18);
        border-radius: 12px;
        padding: 10px;
        background: linear-gradient(180deg, hsl(0 0% 100% / 0.06), transparent);
        display: grid;
        gap: 8px;
        user-select: none;
        ${({ $dragging }) =>
            $dragging &&
            css`
                opacity: 0.6;
                outline: 2px dashed hsl(200 80% 60% / 0.6);
            `}
        ${({ $flash }) =>
            $flash &&
            css`
                animation: ${flash} 420ms ease-out 0s 1 alternate;
            `}
    `,
    TaskTitle: styled.div`
        font-weight: 700;
        line-height: 1.3;
    `,
    TaskDesc: styled.div`
        opacity: 0.9;
        font-size: 13px;
    `,
    TaskMeta: styled.div`
        display: flex;
        gap: 6px;
        align-items: center;
        flex-wrap: wrap;
        font-size: 12px;
        opacity: 0.9;
    `,
    Chip: styled.span`
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        border: ${borderMuted};
        padding: 4px 8px;
        border-radius: 999px;
        white-space: nowrap;
    `,
    LabelDot: styled.span`
        width: 10px;
        height: 10px;
        border-radius: 999px;
        display: inline-block;
        background: ${({ $c }) => $c || "hsl(200 80% 60%)"};
        border: 1px solid hsl(0 0% 100% / 0.65);
    `,

    /* Drop indicator */
    DropIndicator: styled.div`
        height: 8px;
        border-radius: 6px;
        background: hsl(200 80% 60% / 0.5);
        outline: 2px solid hsl(200 80% 60% / 0.4);
    `,

    /* Footer + modal + toast */
    FooterNote: styled.p`
        margin: 18px 0 0;
        text-align: center;
        opacity: 0.75;
        font-size: 12px;
    `,
    ModalOverlay: styled.div`
        position: fixed;
        inset: 0;
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
        background: hsl(0 0% 100% / 0.03);
        backdrop-filter: blur(3px);
    `,
    ModalCard: styled.div`
        width: min(92vw, 560px);
        border-radius: 16px;
        padding: 16px;
        border: ${border};
        background: transparent;
    `,
    ModalTitle: styled.h3`
        margin: 2px 0 8px;
        font-size: 18px;
        font-weight: 700;
        color: inherit;
    `,
    ModalMessage: styled.p`
        margin: 0 0 14px;
        opacity: 0.85;
        line-height: 1.5;
    `,
    ModalActions: styled.div`
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 4px;
    `,
    Toast: styled.div`
        position: fixed;
        left: 50%;
        bottom: 24px;
        transform: translateX(-50%);
        z-index: 1000;
        padding: 8px 14px;
        border-radius: 999px;
        border: ${border};
        background: hsl(0 0% 100% / 0.08);
        backdrop-filter: blur(6px);
        font-size: 12px;
        color: inherit;
    `,
};

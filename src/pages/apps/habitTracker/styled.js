// styles.js
import styled, { css } from "styled-components";

const border = "1px solid hsl(0 0% 100% / 0.14)";
const borderMuted = "1px solid hsl(0 0% 100% / 0.10)";
const focusRing = "0 0 0 3px hsl(0 0% 100% / 0.15)";

export const Styled = {
    /* Page scaffold */
    Page: styled.div`
        min-height: 100dvh;
    `,
    Container: styled.div`
        max-width: 980px;
        margin: 0 auto;
        padding: 32px 18px 56px;
    `,
    Header: styled.header`
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: end;
        margin: 12px 0 18px;
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
        opacity: 0.75;
        font-size: 14px;
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
    DueHint: styled.span`
        margin-left: 6px;
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 999px;
        border: ${borderMuted};
    `,

    /* Cards & layout */
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
        align-items: center;
    `,
    FilterBar: styled.div`
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
        margin: 16px 0 10px;
        > * {
            min-width: 0;
        }
    `,
    RowWrap: styled.div`
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    `,
    ButtonRow: styled.div`
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        flex-wrap: wrap;
        margin-top: 8px;
    `,

    /* Inputs */
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
        flex: 1 1 220px;
        &::placeholder {
            color: hsl(0 0% 100% / 0.35);
        }
        &:focus-visible {
            box-shadow: ${focusRing};
            border-color: hsl(0 0% 100% / 0.35);
        }
        &[type="number"],
        &[type="date"],
        &[type="month"] {
            color-scheme: dark;
        }
        &[type="number"]::-webkit-outer-spin-button,
        &[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        &[type="number"] {
            -moz-appearance: textfield;
        }
        &[type="date"],
        &[type="month"] {
            padding-right: 40px;
        }
        &[type="date"]::-webkit-calendar-picker-indicator,
        &[type="month"]::-webkit-calendar-picker-indicator {
            filter: invert(1) brightness(1.2);
            opacity: 0.9;
            cursor: pointer;
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
        flex: 1 1 220px;
        &:focus-visible {
            box-shadow: ${focusRing};
            border-color: hsl(0 0% 100% / 0.35);
        }
        option {
            color: #000;
        }
    `,
    TextArea: styled.textarea`
        background: transparent;
        color: inherit;
        border: ${border};
        border-radius: 12px;
        padding: 10px 12px;
        font-size: 14px;
        min-height: 110px;
        resize: vertical;
        outline: none;
        &::placeholder {
            color: hsl(0 0% 100% / 0.35);
        }
        &:focus-visible {
            box-shadow: ${focusRing};
            border-color: hsl(0 0% 100% / 0.35);
        }
    `,
    Helper: styled.div`
        margin-top: 10px;
        font-size: 12px;
        opacity: 0.75;
    `,

    /* Buttons */
    PrimaryButton: styled.button`
        border: ${border};
        background: transparent;
        color: inherit;
        padding: 10px 14px;
        border-radius: 10px;
        font-weight: 600;
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
        &:active {
            transform: translateY(1px);
        }
        &:focus-visible {
            box-shadow: 0 0 0 3px hsl(0 70% 60% / 0.25);
        }
    `,

    /* List-like helpers (from your pattern) */
    List: styled.div`
        display: grid;
        gap: 10px;
    `,
    Empty: styled.div`
        padding: 36px;
        text-align: center;
        opacity: 0.75;
        border: ${border};
        border-style: dashed;
        border-radius: 16px;
        background: transparent;
    `,
    Item: styled.div`
        display: grid;
        grid-template-columns: ${({ $edit }) => ($edit ? "1fr" : "1fr auto")};
        gap: 12px;
        align-items: start;
        border: ${border};
        background: transparent;
        border-radius: 16px;
        padding: 12px;
    `,
    ItemLeft: styled.div`
        display: flex;
        gap: 12px;
        flex: 1;
    `,
    ItemRight: styled.div`
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
        justify-content: flex-end;
    `,
    ItemTitle: styled.div`
        font-weight: 700;
        line-height: 1.2;
        color: inherit;
    `,
    ItemMeta: styled.div`
        display: flex;
        gap: 8px;
        align-items: center;
        opacity: 0.8;
        font-size: 13px;
        margin-top: 4px;
        flex-wrap: wrap;
    `,
    IconButton: styled.button`
        background: transparent;
        border: ${border};
        border-radius: 10px;
        padding: 8px 10px;
        cursor: pointer;
        color: inherit;
        &:active {
            transform: translateY(1px);
        }
        &:focus-visible {
            box-shadow: ${focusRing};
        }
    `,
    Bullets: styled.ul`
        margin: 8px 0 0;
        padding: 0 0 0 18px;
        display: grid;
        gap: 6px;
        li {
            line-height: 1.4;
        }
    `,
    Fieldset: styled.fieldset`
        border: ${border};
        border-radius: 12px;
        padding: 12px;
        margin: 2px 0 0;
        background: transparent;
    `,
    Legend: styled.legend`
        padding: 0 6px;
        opacity: 0.9;
        font-weight: 600;
    `,
    FooterNote: styled.p`
        margin: 18px 0 0;
        text-align: center;
        opacity: 0.75;
        font-size: 12px;
    `,

    /* Modal */
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
        width: min(92vw, 520px);
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

    /* === Habit Grid (new, matches your visual language) === */
    GridOuter: styled.div`
        width: 100%;
        border: ${border};
        border-radius: 16px;
        background: transparent;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
    `,
    GridHeader: styled.div`
        position: sticky;
        top: 0;
        z-index: 3;
        display: grid;
        ${({ $cols }) =>
            css`
                grid-template-columns: 220px repeat(${$cols}, 46px);
            `}
        border-bottom: ${border};
        background: transparent;
        backdrop-filter: blur(0.5px);
    `,
    GHCell: styled.div`
        padding: 10px 12px;
        font-weight: 700;
        font-size: 13px;
        white-space: nowrap;
        &.sticky {
            position: sticky;
            left: 0;
            z-index: 4;
            background: transparent;
            box-shadow: 6px 0 10px -8px rgba(0, 0, 0, 0.25);
        }
        &.day {
            display: grid;
            place-items: center;
            border-left: ${border};
        }
    `,
    HabitRow: styled.div`
        display: grid;
        ${({ $cols }) =>
            css`
                grid-template-columns: 220px repeat(${$cols}, 46px);
            `}
        border-bottom: ${border};
        &:last-child {
            border-bottom: none;
        }
    `,
    HabitName: styled.div`
        position: sticky;
        left: 0;
        z-index: 2;
        background: transparent;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        box-shadow: 6px 0 10px -8px rgba(0, 0, 0, 0.2);
        .name {
            font-weight: 700;
            line-height: 1.1;
        }
        .sub {
            font-size: 11px;
            opacity: 0.8;
        }
        .actions {
            margin-left: auto;
            display: flex;
            gap: 8px;
        }
    `,
    DayCell: styled.button`
        border-left: ${border};
        background: transparent;
        display: grid;
        place-items: center;
        height: 42px;
        cursor: pointer;
        font-size: 12px;
        color: inherit;
        &:hover {
            background: hsl(0 0% 100% / 0.03);
        }
        ${({ $state }) =>
            $state === "done" &&
            css`
                box-shadow: inset 0 0 0 2px rgba(16, 185, 129, 0.55);
                background: rgba(16, 185, 129, 0.08);
                font-weight: 700;
            `}
        ${({ $state }) =>
            $state === "skip" &&
            css`
                box-shadow: inset 0 0 0 2px rgba(245, 158, 11, 0.55);
                background: rgba(245, 158, 11, 0.08);
                text-decoration: line-through;
                opacity: 0.95;
            `}
    `,
};

import styled, { css, keyframes } from "styled-components";

/* ---- Tokens ---- */
const border = "1px solid hsl(0 0% 100% / 0.14)";
const borderMuted = "1px solid hsl(0 0% 100% / 0.10)";
const focusRing = "0 0 0 3px hsl(0 0% 100% / 0.15)";

/* Flash highlight */
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
        max-width: 1120px;
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

    /* Badges */
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
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        align-items: center;
    `,
    ButtonRow: styled.div`
        display: flex;
        gap: 10px;
        justify-content: flex-end;
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

    /* Board */
    BoardCard: styled.div`
        margin-top: 12px;
        border-radius: 16px;
        border: ${border};
        background: transparent;
        padding: 12px;
    `,
    Board: styled.div`
        position: relative;
        min-height: 60vh;
        border-radius: 12px;
        border: ${border};
        overflow: hidden;
        background: radial-gradient(
                    circle at 1px 1px,
                    hsl(0 0% 100% / 0.06) 1px,
                    transparent 1px
                )
                0 0/16px 16px,
            linear-gradient(180deg, hsl(0 0% 100% / 0.03), transparent);
    `,

    /* Note */
    Note: styled.div`
        position: absolute;
        background: ${({ $bg }) => $bg || "#FFF59D"};
        border: 1px solid hsl(0 0% 0% / 0.15);
        border-radius: 10px;
        box-shadow: 0 8px 16px hsl(0 0% 0% / 0.25),
            inset 0 1px 0 hsl(0 0% 100% / 0.35);
        display: grid;
        grid-template-rows: auto 1fr; /* header then body */
        ${({ $dragging }) =>
            $dragging &&
            css`
                outline: 2px dashed hsl(200 80% 60% / 0.8);
                cursor: grabbing;
            `}
        ${({ $flash }) =>
            $flash &&
            css`
                animation: ${flash} 420ms ease-out 0s 1 alternate;
            `}
    align-items: start;
    `,

    /* Header */
    NoteHeader: styled.div`
        display: grid;
        grid-template-columns: auto 1fr auto; /* grip | title | actions */
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        min-height: 34px;
        border-bottom: 1px dashed hsl(0 0% 0% / 0.15);
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        background: linear-gradient(180deg, hsl(0 0% 100% / 0.25), transparent);
        overflow: hidden; /* clip scrollbar */
    `,

    /* Drag handle */
    NoteDrag: styled.div`
        width: 16px;
        height: 18px;
        margin-right: 8px;
        cursor: grab;
        user-select: none;
        opacity: 0.7;
        position: relative;
        &:before,
        &:after {
            content: "";
            position: absolute;
            left: 4px;
            right: 4px;
            height: 2px;
            background: hsl(0 0% 0% / 0.35);
            border-radius: 2px;
        }
        &:before {
            top: 5px;
        }
        &:after {
            bottom: 5px;
        }
    `,

    NoteTitle: styled.input`
        background: transparent;
        border: none;
        outline: none;
        font-weight: 700;
        font-size: 14px;
        color: hsl(0 0% 0% / 0.85);
        &::placeholder {
            color: hsl(0 0% 0% / 0.45);
        }
    `,

    NoteActions: styled.div`
        display: flex;
        align-items: center;
        gap: 6px;
        max-width: ${({ $w }) => $w || "240px"};
        overflow: hidden;
        position: relative;
        flex-shrink: 0;
        &::after {
            content: "";
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            width: 16px;
            pointer-events: none;
            background: linear-gradient(
                90deg,
                transparent,
                hsl(0 0% 100% / 0.25)
            );
        }
    `,
    IconButton: styled.button`
        background: transparent;
        border: 1px solid hsl(0 0% 0% / 0.2);
        border-radius: 8px;
        padding: 4px 6px;
        cursor: pointer;
        font-size: 14px;
        &:active {
            transform: translateY(1px);
        }
    `,

    NoteBody: styled.div`
        padding: 8px;
        overflow: hidden;
        user-select: text;
    `,
    NoteText: styled.textarea`
        width: 100%;
        height: 100%;
        min-height: 90px;
        background: transparent;
        border: none;
        outline: none;
        resize: none;
        font-size: 14px;
        color: hsl(0 0% 0% / 0.9);
        user-select: text;
        pointer-events: auto;
        cursor: text;
        &::placeholder {
            color: hsl(0 0% 0% / 0.45);
        }
    `,
    ResizeHandle: styled.div`
        position: absolute;
        right: 4px;
        bottom: 4px;
        width: 14px;
        height: 14px;
        border-right: 2px solid hsl(0 0% 0% / 0.35);
        border-bottom: 2px solid hsl(0 0% 0% / 0.35);
        border-radius: 2px;
        cursor: nwse-resize;
        opacity: 0.8;
    `,

    /* Color pickers */
    ColorRow: styled.div`
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: ${({ $nowrap }) => ($nowrap ? "nowrap" : "wrap")};
        overflow-x: ${({ $nowrap }) => ($nowrap ? "auto" : "visible")};
        max-width: ${({ $nowrap, $w }) => ($nowrap ? $w || "160px" : "none")};
        scrollbar-width: thin;
        &::-webkit-scrollbar {
            height: 6px;
        }
        &::-webkit-scrollbar-thumb {
            background: hsl(0 0% 0% / 0.35);
            border-radius: 999px;
        }
        &::-webkit-scrollbar-track {
            background: transparent;
        }
    `,
    ColorDot: styled.button`
        width: 26px;
        height: 26px;
        border-radius: 999px;
        border: 1px solid hsl(0 0% 100% / 0.4);
        background: ${({ $c }) => $c};
        cursor: pointer;
        outline: none;
        position: relative;
        ${({ $active }) =>
            $active &&
            css`
                box-shadow: 0 0 0 3px hsl(200 80% 60% / 0.35);
            `}
    `,
    TinyDot: styled.button`
        width: 16px;
        height: 16px;
        border-radius: 999px;
        border: 1px solid hsl(0 0% 0% / 0.25);
        background: ${({ $c }) => $c};
        cursor: pointer;
        outline: none;
        ${({ $active }) =>
            $active &&
            css`
                box-shadow: 0 0 0 2px hsl(200 80% 60% / 0.45);
            `}
    `,

    /* List + results */
    List: styled.div`
        display: grid;
        gap: 10px;
    `,
    SectionTitle: styled.h2`
        margin: 0;
        font-size: 18px;
        font-weight: 800;
        letter-spacing: -0.01em;
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
        grid-template-columns: 1fr auto;
        gap: 12px;
        align-items: start;
        border: ${border};
        background: transparent;
        border-radius: 16px;
        padding: 12px;
    `,
    ItemLeft: styled.div`
        display: grid;
        gap: 8px;
        min-width: 0;
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
        line-height: 1.3;
        color: inherit;
    `,
    ItemMeta: styled.div`
        display: flex;
        gap: 8px;
        align-items: center;
        opacity: 0.85;
        font-size: 13px;
        flex-wrap: wrap;
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

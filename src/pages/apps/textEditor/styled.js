import styled, { css, keyframes } from "styled-components";

/* ---- Tokens (same family as your previous apps) ---- */
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

    /* Cards + layout */
    Card: styled.div`
        border-radius: 16px;
        padding: 16px;
        border: ${border};
        background: transparent;
    `,
    RowWrap: styled.div`
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        align-items: center;
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

    /* Toolbar */
    Toolbar: styled.div`
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
    `,
    ToolButton: styled.button`
        border: ${border};
        background: transparent;
        color: inherit;
        padding: 8px 10px;
        border-radius: 10px;
        cursor: pointer;
        white-space: nowrap;
        font-size: 13px;
        &:active {
            transform: translateY(1px);
        }
        &:focus-visible {
            box-shadow: ${focusRing};
        }
        ${({ $active }) =>
            $active &&
            css`
                outline: 2px solid hsl(200 80% 60% / 0.55);
            `}
    `,
    Split: styled.span`
        display: inline-block;
        width: 1px;
        height: 24px;
        background: hsl(0 0% 100% / 0.14);
        margin: 0 4px;
    `,

    /* Editor wrapper */
    EditorCard: styled.div`
        border-radius: 16px;
        border: ${border};
        background: transparent;
        display: grid;
        grid-template-rows: auto 1fr;
        overflow: hidden;
    `,
    EditorToolbar: styled.div`
        padding: 10px;
        border-bottom: ${borderMuted};
        display: grid;
        gap: 8px;
    `,
    EditorArea: styled.div`
        padding: 16px;
        min-height: 50vh;
        line-height: 1.55;
        outline: none;
        /* readable content defaults */
        color: hsl(0 0% 0% / 0.92);
        background: hsl(0 0% 100% / 0.96);
        border-top: ${borderMuted};
        /* placeholder */
        &:empty:before {
            content: attr(data-placeholder);
            color: hsl(0 0% 0% / 0.45);
        }
        /* content styles */
        h1 {
            font-size: 28px;
            margin: 0 0 12px;
        }
        h2 {
            font-size: 22px;
            margin: 0 0 10px;
        }
        p {
            margin: 0 0 10px;
        }
        blockquote {
            border-left: 4px solid hsl(200 80% 60% / 0.7);
            padding-left: 10px;
            margin: 8px 0;
            color: hsl(0 0% 0% / 0.7);
            background: hsl(0 0% 0% / 0.03);
        }
        pre {
            background: hsl(0 0% 0% / 0.06);
            padding: 10px;
            border-radius: 8px;
            overflow: auto;
        }
        code {
            background: hsl(0 0% 0% / 0.06);
            padding: 2px 6px;
            border-radius: 6px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
                "Liberation Mono", "Courier New", monospace;
        }
        ul,
        ol {
            padding-left: 20px;
            margin: 6px 0;
        }
        a {
            color: #2563eb;
            text-decoration: underline;
        }
    `,

    /* Footer/meta */
    MetaRow: styled.div`
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
        justify-content: space-between;
        margin-top: 10px;
        font-size: 12px;
        opacity: 0.85;
    `,

    ButtonRow: styled.div`
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: flex-end;
        margin-top: 8px;
    `,
    PrimaryButton: styled.button`
        border: ${border};
        background: transparent;
        color: inherit;
        padding: 10px 14px;
        border-radius: 10px;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
        max-width: max-content;
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

    /* Modal + toast */
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
        animation: ${flash} 420ms ease-out 0s 1 alternate;
    `,

    /* --- Color UI --- */
    ColorRow: styled.div`
        display: flex;
        gap: 6px;
        align-items: center;
        flex-wrap: wrap;
    `,
    Swatch: styled.button`
        width: 20px;
        height: 20px;
        border-radius: 4px;
        border: ${borderMuted};
        background: ${({ $c }) => $c};
        cursor: pointer;
        &:active {
            transform: translateY(1px);
        }
    `,
    ColorInput: styled.input.attrs({ type: "color" })`
        width: 34px;
        height: 30px;
        padding: 0;
        border: ${borderMuted};
        border-radius: 8px;
        background: transparent;
        cursor: pointer;
    `,
};

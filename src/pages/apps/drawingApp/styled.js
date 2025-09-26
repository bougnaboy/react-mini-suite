import styled, { css, keyframes } from "styled-components";

/* ---- Shared tokens ---- */
const border = "1px solid hsl(0 0% 100% / 0.14)";
const borderMuted = "1px solid hsl(0 0% 100% / 0.10)";
const focusRing = "0 0 0 3px hsl(0 0% 100% / 0.15)";

/* Tiny pulse for toast */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const Styled = {
    /* Page chrome */
    Page: styled.div`
        min-height: 100dvh;
    `,
    Container: styled.div`
        max-width: 980px;
        margin: 0 auto;
        padding: 32px 18px 72px;
    `,

    /* Header + title area */
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

    /* Bullet list */
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

    /* Quick stats row */
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
        ${({ tone }) =>
            tone === "muted" &&
            css`
                opacity: 0.7;
            `}
    `,

    /* Cards and layout */
    Card: styled.div`
        border-radius: 16px;
        padding: 16px;
        border: ${border};
        background: transparent;
        position: relative;
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
        flex: 1 1 200px;
    `,
    LabelText: styled.span`
        opacity: 0.85;
        font-weight: 600;
    `,
    ColorRow: styled.div`
        display: flex;
        align-items: center;
        gap: 10px;
    `,
    ColorInput: styled.input`
        width: 46px;
        height: 34px;
        padding: 0;
        border: ${border};
        border-radius: 8px;
        background: transparent;
        cursor: pointer;
        &:focus-visible {
            box-shadow: ${focusRing};
        }
    `,
    Swatch: styled.span`
        width: 28px;
        height: 28px;
        border-radius: 8px;
        border: ${border};
        background: ${({ $c }) => $c || "transparent"};
    `,
    Range: styled.input`
        -webkit-appearance: none;
        width: 100%;
        height: 30px;
        border-radius: 999px;
        border: ${border};
        background: transparent;
        color: #aaa;
        text-align: center;
        outline: none;
        &::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #fff;
            border: ${border};
            cursor: pointer;
        }
        &::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #fff;
            border: ${border};
            cursor: pointer;
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
    Toggle: styled.button`
        border: ${border};
        background: ${({ $active }) =>
            $active ? "hsl(200 70% 55% / 0.18)" : "transparent"};
        color: inherit;
        padding: 10px 14px;
        border-radius: 10px;
        cursor: pointer;
        white-space: nowrap;
        &:focus-visible {
            box-shadow: ${focusRing};
        }
    `,

    /* Canvas area */
    CanvasCard: styled.div`
        margin-top: 12px;
        border-radius: 16px;
        border: ${border};
        background: transparent;
        padding: 12px;
    `,
    CanvasWrap: styled.div`
        width: 100%;
        height: min(70vh, 640px);
        border-radius: 12px;
        border: ${border};
        overflow: hidden;
        position: relative;
        background: linear-gradient(
            45deg,
            hsl(0 0% 100% / 0.03) 25%,
            transparent 25%,
            transparent 50%,
            hsl(0 0% 100% / 0.03) 50%,
            hsl(0 0% 100% / 0.03) 75%,
            transparent 75%,
            transparent
        );
        background-size: 22px 22px; /* subtle checker */
    `,
    Canvas: styled.canvas`
        display: block;
        width: 100%;
        height: 100%;
        cursor: crosshair;
        user-select: none;
        touch-action: none; /* smoother touch drawing */
    `,

    /* Footer note */
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

    /* Toast */
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
        animation: ${fadeUp} 160ms ease-out;
    `,
};

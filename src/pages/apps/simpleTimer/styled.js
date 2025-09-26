import styled, { css } from "styled-components";

const border = "1px solid hsl(0 0% 100% / 0.14)";
const borderMuted = "1px solid hsl(0 0% 100% / 0.10)";
const focusRing = "0 0 0 3px hsl(0 0% 100% / 0.15)";

export const Styled = {
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
        opacity: 0.75;
        font-size: 14px;
    `,

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
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
    `,

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
        &[type="number"]::-webkit-outer-spin-button,
        &[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        &[type="number"] {
            -moz-appearance: textfield;
        }
    `,
    CheckboxRow: styled.label`
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: ${borderMuted};
        border-radius: 10px;
        padding: 10px 12px;
        cursor: pointer;
        user-select: none;
        input {
            width: 16px;
            height: 16px;
            accent-color: currentColor;
            cursor: pointer;
        }
    `,

    ButtonRow: styled.div`
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        flex-wrap: wrap;
        margin-top: 8px;
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
        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `,
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

    BigTimeCard: styled.div`
        border-radius: 16px;
        padding: 22px 16px;
        border: ${border};
        background: transparent;
        display: grid;
        gap: 10px;
        justify-items: center;
        text-align: center;
    `,
    BigTime: styled.div`
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", monospace;
        font-size: clamp(42px, 12vw, 88px);
        letter-spacing: 0.04em;
        line-height: 1.1;
        font-weight: 800;
        color: inherit;
    `,
    MetaRow: styled.div`
        font-size: 12px;
        opacity: 0.8;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        justify-content: center;
    `,
    Badge: styled.span`
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

    ProgressWrap: styled.div`
        display: grid;
        gap: 6px;
        margin-top: 4px;
        width: min(680px, 100%);
    `,
    ProgressTrack: styled.div`
        height: 12px;
        border-radius: 999px;
        border: ${border};
        overflow: hidden;
        background: transparent;
    `,
    ProgressFill: styled.div`
        height: 100%;
        width: ${({ $pct }) => Math.max(0, Math.min(100, Number($pct) || 0))}%;
        background: linear-gradient(
            90deg,
            hsl(200 70% 50% / 0.9),
            hsl(140 70% 45% / 0.9)
        );
        transition: width 120ms ease;
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
};

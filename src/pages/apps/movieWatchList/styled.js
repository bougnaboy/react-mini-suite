import styled, { css } from "styled-components";

/** Same dark/transparent tokens as BookReadingList */
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

    Card: styled.div`
        border-radius: 16px;
        padding: 16px;
        border: ${border};
        background: transparent;
    `,

    FormRow: styled.div`
        display: grid;
        grid-template-columns: 1.2fr 140px 160px 140px 1.2fr auto;
        gap: 10px;
        @media (width < 980px) {
            grid-template-columns: 1fr 120px 1fr 1fr;
        }
        @media (width < 560px) {
            grid-template-columns: 1fr;
        }
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
        &::placeholder {
            color: hsl(0 0% 100% / 0.35);
        }
        &:focus-visible {
            box-shadow: ${focusRing};
            border-color: hsl(0 0% 100% / 0.35);
        }
        &[type="number"],
        &[type="date"] {
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
        width: 100%;
        display: block;
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

    PrimaryButton: styled.button`
        border: ${border};
        background: transparent;
        color: inherit;
        padding: 10px 14px;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.05s ease;
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

    Toolbar: styled.div`
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin: 16px 0;
        flex-wrap: wrap;
    `,
    RowWrap: styled.div`
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    `,
    Select: styled.select`
        background: transparent;
        color: inherit;
        border: ${border};
        border-radius: 10px;
        padding: 10px 12px;
        font-size: 14px;
        outline: none;
        &:focus-visible {
            box-shadow: ${focusRing};
            border-color: hsl(0 0% 100% / 0.35);
        }
        option {
            color: #000;
        } /* ensure native list readable */
    `,

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
        display: flex;
        flex-wrap: wrap;
        grid-template-columns: 72px 1fr auto;
        gap: 12px;
        align-items: start;
        background: transparent;
        border-radius: 16px;
        padding: 12px;
        border: ${border};
    `,
    ThumbWrap: styled.div`
        display: flex;
        align-items: center;
        justify-content: center;
    `,

    ItemLeft: styled.div`
        display: flex;
        gap: 12px;
        flex: 1;
        flex-wrap: wrap;
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
        span {
            opacity: 0.7;
            font-weight: 600;
        }
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

    StarButton: styled.button`
        background: transparent;
        border: ${border};
        border-radius: 10px;
        padding: 8px 10px;
        cursor: pointer;
        color: ${({ $filled }) =>
            $filled ? "#f5c518" : "inherit"}; /* IMDb gold */
        border-color: ${({ $filled }) =>
            $filled ? "hsl(46 90% 58% / 0.6)" : ""};
        &:hover {
            color: #f5c518;
            border-color: hsl(46 90% 58% / 0.6);
        }
        &:active {
            transform: translateY(1px);
        }
        &:focus-visible {
            box-shadow: ${focusRing};
        }
    `,

    FooterNote: styled.p`
        margin: 18px 0 0;
        text-align: center;
        opacity: 0.75;
        font-size: 12px;
    `,

    /* Modal (same as BookReadingList) */
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

import styled, { css, keyframes } from "styled-components";

/* ---- Tokens ---- */
const border = "1px solid hsl(0 0% 100% / 0.14)";
const borderMuted = "1px solid hsl(0 0% 100% / 0.10)";
const focusRing = "0 0 0 3px hsl(0 0% 100% / 0.15)";

/* Small pulse for hint placement */
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 hsl(200 80% 60% / 0.0); }
  50% { transform: scale(1.04); box-shadow: 0 0 0 6px hsl(200 80% 60% / 0.12); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 hsl(200 80% 60% / 0.0); }
`;

export const Styled = {
    /* Page */
    Page: styled.div`
        min-height: 100dvh;
    `,
    Container: styled.div`
        max-width: 980px;
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

    /* Badges & meta */
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
    MetaRow: styled.div`
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: 12px;
    `,

    /* Card & layout */
    Card: styled.div`
        border-radius: 16px;
        padding: 16px;
        border: ${border};
        background: transparent;
        position: relative;
    `,
    SectionTitle: styled.h2`
        margin: 0;
        font-size: 18px;
        font-weight: 800;
        letter-spacing: -0.01em;
    `,
    ButtonRow: styled.div`
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        flex-wrap: wrap;
        margin-top: 8px;
    `,

    /* Guess row */
    GuessRow: styled.div`
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        min-height: 48px;
        padding: 10px;
        border: ${border};
        border-radius: 12px;
        background: transparent;
    `,
    GuessTile: styled.button`
        border: ${border};
        background: transparent;
        color: inherit;
        border-radius: 10px;
        padding: 10px 14px;
        min-width: 42px;
        text-align: center;
        font-weight: 800;
        letter-spacing: 0.06em;
        cursor: pointer;
        ${({ $correct }) =>
            $correct &&
            css`
                box-shadow: 0 0 0 3px hsl(140 70% 45% / 0.25);
                border-color: hsl(140 70% 50% / 0.8);
            `}
        ${({ $pulse }) =>
            $pulse &&
            css`
                animation: ${pulse} 850ms ease;
            `}
    &:focus-visible {
            box-shadow: ${focusRing};
        }
    `,
    TileHintTitle: styled.span`
        position: absolute;
        top: 2px;
        right: 6px;
        font-size: 11px;
        opacity: 0.7;
    `,
    EmptySlot: styled.div`
        font-size: 13px;
        opacity: 0.75;
    `,

    /* Pool */
    PoolWrap: styled.div`
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        padding: 10px;
        border: ${border};
        border-radius: 12px;
        background: transparent;
        min-height: 52px;
    `,
    PoolTile: styled.button`
        border: ${border};
        background: transparent;
        color: inherit;
        border-radius: 10px;
        padding: 10px 14px;
        min-width: 42px;
        text-align: center;
        font-weight: 800;
        letter-spacing: 0.06em;
        cursor: pointer;
        &:active {
            transform: translateY(1px);
        }
        &:focus-visible {
            box-shadow: ${focusRing};
        }
    `,

    /* Inputs/buttons (shared) */
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

    /* Generic UI bits */
    Empty: styled.div`
        padding: 8px 12px;
        border-radius: 10px;
        border: ${border};
        border-style: dashed;
        opacity: 0.7;
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

    /* Toast */
    Toast: styled.div`
        position: absolute;
        left: 16px;
        bottom: 16px;
        z-index: 10;
        padding: 8px 14px;
        border-radius: 999px;
        border: ${border};
        background: hsl(0 0% 100% / 0.07);
        backdrop-filter: blur(6px);
        font-size: 12px;
        color: inherit;
    `,
};

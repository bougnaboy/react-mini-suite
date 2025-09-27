import styled from "styled-components";

const cardBg = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,0.25))";

export const Styled = {
    Wrapper: styled.div`
        max-width: var(--maxw, 1100px);
        margin: 0 auto;
        padding: 24px;
        color: ${text};
    `,

    Header: styled.header`
        display: grid;
        grid-template-columns: 1fr auto auto;
        align-items: center;
        gap: 12px;
        margin-bottom: 18px;

        .title {
            font-size: 22px;
            font-weight: 600;
            letter-spacing: 0.3px;
        }

        .meta {
            display: flex;
            gap: 12px;
            color: ${muted};
            font-size: 14px;
        }

        .actions button {
            background: ${accent};
            color: #0b0b0b;
            border: 1px solid ${border};
            padding: 8px 14px;
            border-radius: ${radius};
            font-weight: 600;
            cursor: pointer;
            box-shadow: ${shadow};
        }

        @media (max-width: 640px) {
            grid-template-columns: 1fr;
            .actions {
                order: 3;
            }
            .meta {
                order: 2;
            }
        }
    `,

    Grid: styled.div`
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
        background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.02),
            rgba(255, 255, 255, 0)
        );
        border: 1px solid ${border};
        border-radius: ${radius};
        padding: 16px;
    `,

    // Use transient props ($flipped, $matched) to avoid DOM prop warnings
    Card: styled.button`
        position: relative;
        width: 100%;
        aspect-ratio: 1 / 1;
        border: 1px solid ${border};
        border-radius: calc(${radius} - 4px);
        background: ${cardBg};
        perspective: 800px;
        cursor: pointer;
        outline: none;
        box-shadow: ${shadow};

        .inner {
            position: absolute;
            inset: 0;
            border-radius: inherit;
            transform-style: preserve-3d;
            transition: transform 0.35s ease;
            transform: rotateY(${(p) => (p.$flipped ? 180 : 0)}deg);
        }

        .front,
        .back {
            position: absolute;
            inset: 0;
            display: grid;
            place-items: center;
            font-size: clamp(28px, 4.5vw, 40px);
            backface-visibility: hidden;
            border-radius: inherit;
        }

        .back {
            color: ${muted};
        }

        .front {
            transform: rotateY(180deg);
            /* slight highlight on matched */
            box-shadow: ${(p) => (p.$matched ? "0 0 0 2px " + accent : "none")};
        }
    `,
};

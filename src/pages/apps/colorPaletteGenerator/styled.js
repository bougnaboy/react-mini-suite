import styled from "styled-components";

const bg = "var(--bg, #0b0b0b)";
const card = "var(--card, #111)";
const text = "var(--text, #eaeaea)";
const muted = "var(--muted, #a8a8a8)";
const border = "var(--border, #242424)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,0.25))";

export const Styled = {
    Wrapper: styled.div`
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px 16px 48px;
        color: ${text};
    `,

    Header: styled.header`
        margin-bottom: 16px;

        h2 {
            font-weight: 700;
            margin: 0 0 6px;
            letter-spacing: 0.3px;
        }

        .sub {
            margin: 0 0 12px;
            color: ${muted};
            font-size: 0.95rem;
        }
    `,

    Controls: styled.div`
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;

        button {
            background: ${card};
            border: 1px solid ${border};
            color: ${text};
            border-radius: 10px;
            padding: 8px 12px;
            cursor: pointer;
            box-shadow: ${shadow};
            transition: 120ms ease-in-out;
        }
        button:hover {
            border-color: ${accent};
        }
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .spacer {
            flex: 1;
        }
        .meta {
            color: ${muted};
            font-size: 0.9rem;
        }
    `,

    Strip: styled.div`
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
        margin: 18px 0 8px;
    `,

    Swatch: styled.div`
        background: ${(p) => p.$bg};
        border-radius: 16px;
        min-height: 180px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border: 1px solid ${border};
        box-shadow: ${shadow};
        overflow: hidden;
        outline: ${(p) => (p.$locked ? `2px dashed ${accent}` : "none")};

        .top,
        .bottom {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 8px 0;
            gap: 8px;
        }

        .bottom {
            padding: 0 8px 8px;
        }

        .chip {
            background: rgba(0, 0, 0, 0.25);
            padding: 4px 8px;
            border-radius: 999px;
            font-size: 0.8rem;
            border: 1px solid rgba(255, 255, 255, 0.15);
            user-select: none;
        }

        input[type="color"] {
            appearance: none;
            width: 32px;
            height: 32px;
            border: 1px solid rgba(0, 0, 0, 0.25);
            border-radius: 8px;
            background: transparent;
            cursor: pointer;
            padding: 0;
        }

        .mid {
            padding: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .hex {
            width: 120px;
            text-align: center;
            font-weight: 700;
            font-size: 1.1rem;
            background: rgba(0, 0, 0, 0.22);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 10px;
            padding: 8px 10px;
            outline: none;
        }

        .ghost {
            background: rgba(0, 0, 0, 0.22);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #fff;
            padding: 6px 10px;
            border-radius: 10px;
        }
        .ghost:hover {
            border-color: #fff;
        }
    `,

    SaveBar: styled.div`
        margin: 18px 0 10px;
        display: flex;
        gap: 10px;

        input {
            flex: 1;
            background: ${card};
            color: ${text};
            border: 1px solid ${border};
            border-radius: ${radius};
            padding: 10px 12px;
            outline: none;
        }

        button {
            background: ${accent};
            color: #041007;
            border: 1px solid ${accent};
            border-radius: ${radius};
            padding: 10px 14px;
            cursor: pointer;
            box-shadow: ${shadow};
        }
    `,

    SavedSection: styled.section`
        margin-top: 24px;

        h3 {
            margin: 0 0 10px;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 12px;
        }

        .card {
            background: ${card};
            border: 1px solid ${border};
            border-radius: ${radius};
            box-shadow: ${shadow};
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .row {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 6px;
        }

        .mini {
            height: 24px;
            border-radius: 8px;
            border: 1px solid rgba(0, 0, 0, 0.2);
        }

        .meta {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;

            strong {
                color: ${text};
            }
            .actions {
                display: flex;
                gap: 8px;
            }

            button {
                background: ${card};
                border: 1px solid ${border};
                color: ${text};
                border-radius: 10px;
                padding: 6px 10px;
                cursor: pointer;
            }
            button:hover {
                border-color: ${accent};
            }
            .danger:hover {
                border-color: #ef4444;
                color: #ef4444;
            }
        }
    `,

    // 🔒 Simple inline confirm dialog (no portals)
    ModalBackdrop: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        display: grid;
        place-items: center;
        z-index: 999;
    `,

    ModalCard: styled.div`
        width: min(520px, 92vw);
        background: ${card};
        color: ${text};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;

        h4 {
            margin: 0 0 6px;
        }
        .muted {
            color: ${muted};
            margin: 0 0 12px;
        }

        .preview {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 6px;
            margin-bottom: 14px;
        }
        .mini {
            height: 20px;
            border-radius: 8px;
            border: 1px solid rgba(0, 0, 0, 0.25);
        }

        .actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;

            button {
                background: ${card};
                border: 1px solid ${border};
                color: ${text};
                border-radius: 10px;
                padding: 8px 12px;
                cursor: pointer;
            }
            button:hover {
                border-color: ${accent};
            }
            .danger {
                border-color: #ef4444;
                color: #ef4444;
            }
            .danger:hover {
                background: rgba(239, 68, 68, 0.08);
            }
        }
    `,
};

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
        max-width: var(--maxw, 1200px);
        margin: 0 auto;
        padding: 24px;
        color: ${text};

        .header {
            margin-bottom: 12px;
            h2 {
                margin: 0 0 6px;
            }
            .muted {
                color: ${muted};
            }
            .status {
                display: flex;
                gap: 8px;
                margin-top: 8px;
            }
            .chip {
                border: 1px solid ${border};
                border-radius: 999px;
                padding: 4px 10px;
                font-size: 12px;
                background: #141414;
                color: ${muted};
            }
            .chip.ok {
                color: #0f1;
                border-color: #214;
            }
        }

        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        .panel {
            background: ${cardBg};
            border: 1px solid ${border};
            border-radius: ${radius};
            box-shadow: ${shadow};
            padding: 16px;
            display: flex;
            flex-direction: column;
            min-height: 420px;
        }

        /* Dropzone */
        .dropzone {
            border: 2px dashed ${border};
            border-radius: ${radius};
            padding: 18px;
            text-align: center;
            cursor: pointer;
            margin-bottom: 12px;
            transition: border-color 0.15s ease, background 0.15s ease;
        }
        .dropzone:hover {
            border-color: ${accent};
        }
        .dropzone.dragging {
            border-color: ${accent};
            background: rgba(34, 197, 94, 0.08);
        }
        .dz-inner .link {
            color: ${accent};
            text-decoration: underline;
        }

        /* Frames */
        .framesHead {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            h4 {
                margin: 0;
            }
            .spacer {
                flex: 1;
            }
        }

        .frames {
            list-style: none;
            margin: 0;
            padding: 0;
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
            overflow: auto;
        }

        .frame {
            display: grid;
            grid-template-columns: 96px 1fr;
            gap: 10px;
            border: 1px solid ${border};
            border-radius: 12px;
            padding: 8px;
            background: #0f0f0f;
            align-items: center;
        }

        .thumb {
            width: 96px;
            height: 72px;
            border-radius: 8px;
            overflow: hidden;
            background: #000;
            border: 1px solid ${border};
        }
        .thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .meta {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .meta .name {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: ${text};
        }

        .row {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .empty {
            color: ${muted};
            padding: 16px;
            text-align: center;
        }

        /* Settings + Output */
        .settings {
            margin-bottom: 12px;
        }
        .settings .row {
            margin: 8px 0;
            gap: 8px;
        }
        .settings label {
            width: 110px;
            color: ${muted};
        }
        .settings input {
            background: #0f0f0f;
            color: ${text};
            border: 1px solid ${border};
            border-radius: 10px;
            padding: 8px 10px;
            width: 140px;
            outline: none;
        }

        .actions {
            margin-top: 12px;
        }

        .output .preview {
            border: 1px dashed ${border};
            border-radius: 12px;
            padding: 12px;
            /* display: flex;
            align-items: center;
            justify-content: center; */
            min-height: 220px;
            background: #0c0c0c;

            img {
                margin: auto;
                margin-bottom: 15px;
            }

            .row {
                width: 100%;

                a {
                    display: flex;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }
        }
        .output img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            display: block;
        }
        .placeholder {
            color: ${muted};
        }

        /* Buttons */
        button,
        .primary,
        .ghost,
        .danger {
            font: inherit;
            padding: 8px 12px;
            border-radius: 10px;
            border: 1px solid ${border};
            background: #141414;
            color: ${text};
            cursor: pointer;
        }
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        button:hover:not(:disabled) {
            border-color: ${accent};
        }
        .primary,
        a.primary {
            background: ${accent};
            color: #08120b;
            border-color: ${accent};
            text-decoration: none;
            display: inline-block;
        }
        .ghost {
            background: #0f0f0f;
        }
        .danger {
            background: #1a0f0f;
            border-color: #3a1a1a;
            color: #f2c6c6;
        }
        .danger:hover {
            border-color: #c24141;
        }

        .muted {
            color: ${muted};
        }
        .small {
            font-size: 12px;
        }

        .error {
            color: #ff6b6b;
            margin-top: 8px;
        }

        .tips {
            margin-top: 10px;
        }

        @media (max-width: 900px) {
            .grid {
                grid-template-columns: 1fr;
            }
        }
    `,
};

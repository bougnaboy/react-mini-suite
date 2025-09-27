import styled, { createGlobalStyle } from "styled-components";

const card = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,.25))";
const space2 = "10px";
const space3 = "16px";
const space4 = "24px";

/* Global print rule: show only .print-area */
const PrintOnly = createGlobalStyle`
  @media print {
    body * { visibility: hidden !important; }
    .print-area, .print-area * { visibility: visible !important; }
    .print-area {
      position: absolute;
      inset: 0;
      width: 100%;
      margin: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
    }
  }
`;

const Wrapper = styled.div`
    width: 100%;
    display: grid;
    place-items: start center;
    padding: 15px;
`;

const Card = styled.section`
    width: min(920px, 100%);
    background: ${card};
    color: ${text};
    border: 1px solid ${border};
    border-radius: ${radius};
    box-shadow: ${shadow};
    padding: ${space4};
    margin: 0 auto;

    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: ${space3};
        margin-bottom: ${space3};

        h2 {
            margin: 0;
            font-weight: 600;
            letter-spacing: 0.2px;
        }
    }

    @media print {
        .no-print {
            display: none !important;
        }
    }
`;

const ModeSwitch = styled.div`
    display: inline-flex;
    background: #0d0d0d;
    border: 1px solid ${border};
    border-radius: 999px;
    padding: 4px;

    button {
        appearance: none;
        border: 0;
        background: transparent;
        color: ${muted};
        padding: 6px 12px;
        border-radius: 999px;
        cursor: pointer;
        font-weight: 600;
        transition: transform 0.06s ease;

        &.active {
            background: ${accent};
            color: #08150d;
        }
        &:active {
            transform: translateY(1px);
        }
    }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${space3};
    margin-top: ${space3};

    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
`;

const Field = styled.label`
    display: block;

    > label {
        display: block;
        font-size: 14px;
        color: ${muted};
        margin-bottom: 6px;
    }

    input,
    select {
        width: 100%;
        background: #0d0d0d;
        color: ${text};
        border: 1px solid ${border};
        border-radius: 10px;
        padding: 10px 12px;
        outline: none;
    }

    .row {
        display: grid;
        grid-template-columns: 1fr 120px;
        gap: 8px;
    }
`;

const Chips = styled.div`
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    button {
        border: 1px solid ${border};
        background: transparent;
        color: ${text};
        padding: 6px 10px;
        border-radius: 999px;
        cursor: pointer;

        &:hover {
            border-color: ${accent};
        }
        &:active {
            transform: translateY(1px);
        }
    }
`;

const Result = styled.div`
    margin-top: ${space4};
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: ${space3};

    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }

    > div {
        border: 1px dashed ${border};
        border-radius: 12px;
        padding: ${space3};
        background: #0d0d0d;

        span {
            display: block;
            color: ${muted};
            font-size: 13px;
            margin-bottom: 6px;
        }
        strong {
            font-size: 22px;
            letter-spacing: 0.2px;
        }
    }
`;

const Actions = styled.div`
    display: flex;
    gap: 10px;
    margin-top: ${space3};

    button {
        border: 1px solid ${border};
        background: transparent;
        color: ${text};
        padding: 8px 12px;
        border-radius: 10px;
        cursor: pointer;

        &:hover {
            border-color: ${accent};
        }
        &:active {
            transform: translateY(1px);
        }
    }
`;

const Note = styled.div`
    margin-top: ${space3};
    color: ${muted};

    pre {
        white-space: pre-wrap;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 12.5px;
        background: #0d0d0d;
        border: 1px solid ${border};
        border-radius: 10px;
        padding: 12px;
    }
`;

const ConfirmOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: grid;
    place-items: center;
    z-index: 1000;

    .modal {
        width: min(420px, 92vw);
        background: ${card};
        color: ${text};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: ${space4};

        h3 {
            margin: 0 0 ${space2};
            font-weight: 600;
        }
        p {
            margin: 0 0 ${space3};
            color: ${muted};
        }

        .actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;

            button {
                border: 1px solid ${border};
                background: transparent;
                color: ${text};
                padding: 8px 12px;
                border-radius: 10px;
                cursor: pointer;

                &:hover {
                    border-color: ${accent};
                }
                &.danger {
                    border-color: ${accent};
                    background: ${accent};
                    color: #08150d;
                }
            }
        }
    }
`;

export const Styled = {
    PrintOnly,
    Wrapper,
    Card,
    ModeSwitch,
    Grid,
    Field,
    Chips,
    Result,
    Actions,
    Note,
    ConfirmOverlay,
};

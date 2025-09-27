import styled from "styled-components";

const card = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,.25))";

export const Styled = {
    Wrapper: styled.section`
        max-width: var(--maxw, 1100px);
        margin: 0 auto;
        padding: 24px;

        .header {
            margin-bottom: 16px;
            h2 {
                margin: 0 0 6px 0;
                color: ${text};
                font-weight: 600;
            }
            .sub {
                margin: 0;
                color: ${muted};
            }
        }
    `,
    Grid: styled.div`
        display: grid;
        grid-template-columns: 360px 1fr;
        gap: 16px;

        @media (max-width: 900px) {
            grid-template-columns: 1fr;
        }
    `,
    Preview: styled.div`
        background: #222;
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        height: 260px;
        position: relative;

        .chip {
            position: absolute;
            right: 10px;
            bottom: 10px;
            background: ${card};
            border: 1px solid ${border};
            padding: 6px 10px;
            border-radius: 999px;
            color: ${text};
            font-size: 13px;
            opacity: 0.9;
        }
    `,
    Fields: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;

        label {
            display: block;
            margin-bottom: 12px;
        }
        span {
            display: block;
            font-size: 12px;
            color: ${muted};
            margin-bottom: 6px;
        }
        input[type="text"] {
            width: 100%;
            background: transparent;
            border: 1px solid ${border};
            border-radius: 10px;
            padding: 10px 12px;
            color: ${text};
            outline: none;
        }
        input[type="color"] {
            width: 48px;
            height: 36px;
            background: transparent;
            border: 1px solid ${border};
            border-radius: 10px;
            padding: 4px;
            cursor: pointer;
        }
        .row.two {
            display: grid;
            grid-template-columns: 140px 1fr;
            gap: 12px;
            align-items: end;
            margin-bottom: 12px;
        }
        .with-btn {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 8px;
            align-items: center;
            position: relative; /* for the copied chip */
        }
        button {
            border: 1px solid ${border};
            background: #1a1a1a;
            color: ${text};
            border-radius: 10px;
            height: 38px;
            padding: 0 12px;
            cursor: pointer;
        }
        .copied {
            position: absolute;
            right: 0;
            top: calc(100% + 4px);
            background: #1a1a1a;
            border: 1px solid ${border};
            color: ${text};
            border-radius: 999px;
            padding: 2px 10px;
            font-size: 12px;
            opacity: 0;
            pointer-events: none;
            transform: translateY(-4px);
            transition: opacity 0.18s ease, transform 0.18s ease;
        }
        .copied.show {
            opacity: 0.95;
            transform: translateY(0);
        }
        .error {
            margin: 6px 0 0 0;
            color: #ef4444;
            font-size: 13px;
        }
    `,
};

import styled from "styled-components";

/* theme tokens */
const bg = "var(--bg)";
const card = "var(--card)";
const text = "var(--text)";
const muted = "var(--muted)";
const border = "var(--border)";
const radius = "var(--radius)";
const shadow = "var(--shadow)";
const accent = "var(--accent)";
const danger = "var(--danger, #e5484d)";

export const Styled = {
    Wrapper: styled.div`
        color: ${text};
        background: ${bg};
        min-height: 100%;
        padding: 16px;
        max-width: 1440px; /* as requested */
        margin: 0 auto; /* centered layout */
        display: grid;
        gap: 16px;
    `,

    Header: styled.header`
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;

        h1 {
            margin: 0 0 6px;
            font-size: 20px;
            line-height: 1.2;
        }
        p {
            margin: 0;
            color: ${muted};
            font-size: 14px;
        }
    `,

    Totals: styled.div`
        display: flex;
        gap: 8px;
        align-items: center;
        .pill {
            border: 1px solid ${border};
            background: ${card};
            border-radius: 999px;
            padding: 6px 10px;
            box-shadow: ${shadow};
            font-size: 12px;
        }
    `,

    Layout: styled.div`
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 16px;

        @media (max-width: 1080px) {
            grid-template-columns: 1fr;
        }

        .left,
        .right {
            display: grid;
            gap: 16px;
        }
    `,

    Card: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;

        h3 {
            margin: 0 0 12px;
            font-size: 16px;
        }
        .notes {
            margin: 0;
            padding-left: 18px;
            color: ${muted};
            font-size: 14px;
        }
    `,

    Uploader: styled.div`
        position: relative;
        border: 1px dashed ${border};
        border-radius: ${radius};
        background: ${bg};
        padding: 18px;
        outline: ${(p) => (p.dragOver ? `2px dashed ${accent}` : "none")};

        input[type="file"] {
            position: absolute;
            inset: 0;
            opacity: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
        }

        .area {
            display: grid;
            justify-items: center;
            gap: 6px;
            text-align: center;
            .icon {
                font-size: 28px;
            }
            .text {
                font-size: 14px;
            }
            .hint {
                font-size: 12px;
                color: ${muted};
            }
            .link {
                margin-left: 6px;
                border: none;
                background: none;
                color: ${accent};
                text-decoration: underline;
                cursor: pointer;
                padding: 0;
                font: inherit;
            }
        }
    `,

    Actions: styled.div`
        margin-top: 12px;
        display: flex;
        gap: 10px;
        align-items: center;

        .spacer {
            flex: 1;
        }

        button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 10px 14px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            transition: transform 0.02s ease-in-out, border-color 0.15s ease;

            &:hover {
                border-color: ${accent};
            }
            &:active {
                transform: translateY(1px);
            }
            &:disabled {
                opacity: 0.55;
                cursor: not-allowed;
            }
        }
        .ghost {
            background: ${bg};
        }
        .danger {
            border-color: ${danger};
        }
    `,

    List: styled.div`
        display: grid;
        gap: 10px;
    `,

    Item: styled.div`
        display: grid;
        grid-template-columns: 100px 1fr auto;
        gap: 12px;
        align-items: center;
        border: 1px solid ${border};
        background: ${card};
        border-radius: ${radius};
        padding: 10px;

        .thumb img {
            width: 100px;
            height: 70px;
            object-fit: cover;
            border: 1px solid ${border};
            border-radius: 8px;
            background: ${bg};
        }

        .meta {
            display: grid;
            gap: 6px;
            .title {
                font-size: 14px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .sub {
                display: flex;
                gap: 8px;
                color: ${muted};
                font-size: 12px;
                flex-wrap: wrap;
            }
            .comp {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            .badge {
                background: ${bg};
                border: 1px solid ${border};
                border-radius: 999px;
                padding: 3px 8px;
                font-size: 12px;
            }
            .err {
                color: ${danger};
                font-size: 12px;
            }
        }

        .right {
            display: flex;
            gap: 8px;
            align-items: center;
            button {
                appearance: none;
                border: 1px solid ${border};
                background: ${card};
                color: ${text};
                padding: 8px 12px;
                border-radius: ${radius};
                cursor: pointer;
                font: inherit;
                transition: transform 0.02s ease-in-out, border-color 0.15s ease;

                &:hover {
                    border-color: ${accent};
                }
                &:active {
                    transform: translateY(1px);
                }
                &:disabled {
                    opacity: 0.55;
                    cursor: not-allowed;
                }
            }
            .ghost {
                background: ${bg};
            }
            .danger {
                border-color: ${danger};
            }
        }

        @media (max-width: 720px) {
            grid-template-columns: 64px 1fr;
            .right {
                grid-column: 1 / -1;
                justify-content: flex-start;
            }
            .thumb img {
                width: 64px;
                height: 50px;
            }
        }
    `,

    Empty: styled.div`
        border: 1px dashed ${border};
        color: ${muted};
        border-radius: ${radius};
        padding: 20px;
        text-align: center;
        font-size: 14px;
    `,

    Field: styled.div`
        display: grid;
        gap: 6px;
        margin-bottom: 12px;

        label {
            font-size: 13px;
            color: ${text};
        }
        .checkbox {
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        input[type="range"],
        input[type="number"],
        select {
            width: 100%;
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: calc(${radius} - 2px);
            padding: 10px 12px;
            font: inherit;
            outline: none;
            transition: border-color 0.15s ease;
            &:focus {
                border-color: ${accent};
            }
        }

        .inline {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .hint {
            color: ${muted};
            font-size: 12px;
        }
    `,

    /* Reset-proof modal */
    Modal: styled.div`
        position: fixed;
        inset: 0;
        z-index: 1000;

        &,
        * {
            box-sizing: border-box;
        }

        .overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
            backdrop-filter: blur(2px);
        }

        .sheet {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: min(460px, 92vw);
            background: var(--surface, ${card});
            color: ${text};
            border: 1px solid ${border};
            border-radius: ${radius};
            box-shadow: ${shadow};
            padding: 16px;
            display: grid;
            gap: 12px;
            animation: modalPop 0.16s ease-out both;
        }

        h4 {
            margin: 0;
            font-size: 18px;
            letter-spacing: 0.2px;
        }

        p {
            margin: 0;
            color: ${muted};
            font-size: 14px;
            line-height: 1.5;
        }

        .row {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 6px;
        }

        .row button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 38px;
            min-width: 96px;
            padding: 0 14px;
            border-radius: ${radius};
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            font: inherit;
            cursor: pointer;
            transition: transform 0.02s ease-in-out, border-color 0.15s ease,
                background 0.15s ease;
        }
        .row button:hover {
            border-color: ${accent};
        }
        .row button:active {
            transform: translateY(1px);
        }
        .row button:focus-visible {
            outline: 2px solid ${accent};
            outline-offset: 2px;
        }

        .row .ghost {
            background: ${bg};
        }
        .row .primary {
            background: ${accent};
            border-color: ${accent};
            color: var(--on-accent, #fff);
        }

        @keyframes modalPop {
            from {
                transform: translate(-50%, -48%) scale(0.98);
                opacity: 0.6;
            }
            to {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
        }
    `,
};

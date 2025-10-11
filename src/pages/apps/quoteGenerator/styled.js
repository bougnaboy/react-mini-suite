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
        background: ${bg};
        color: ${text};
        min-height: 100%;
        padding: 16px;
        /* app wrapper constraints */
        max-width: 1440px;
        margin: 0 auto;
        display: grid;
        gap: 16px;
    `,

    Header: styled.header`
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;

        h1 {
            margin: 0 0 6px 0;
            font-size: 20px;
            line-height: 1.2;
        }
        p {
            margin: 0;
            color: ${muted};
            font-size: 14px;
        }
    `,

    HeaderActions: styled.div`
        display: flex;
        gap: 8px;
        align-items: center;

        .select {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
        }
        select {
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: calc(${radius} - 2px);
            padding: 8px 10px;
            outline: none;
        }
        button {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            border-radius: ${radius};
            padding: 8px 12px;
            box-shadow: ${shadow};
            cursor: pointer;
            transition: border-color 0.15s ease, transform 0.02s ease-in-out;
            &:hover {
                border-color: ${accent};
            }
            &:active {
                transform: translateY(1px);
            }
            &:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
        }
        .ghost {
            background: ${bg};
        }
    `,

    Layout: styled.div`
        display: grid;
        grid-template-columns: 1.6fr 1fr;
        gap: 16px;

        @media (max-width: 1024px) {
            grid-template-columns: 1fr;
        }
    `,

    Card: styled.section`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;
    `,

    QuoteBlock: styled.div`
        blockquote {
            margin: 0 0 10px 0;
            font-size: 18px;
            line-height: 1.6;
        }
        .meta {
            display: flex;
            gap: 8px;
            align-items: baseline;
            color: ${muted};
            font-size: 14px;
        }
        .author {
            font-weight: 600;
            color: ${text};
        }
        .source {
            color: ${muted};
        }
    `,

    Actions: styled.div`
        margin-top: 12px;
        display: flex;
        gap: 10px;
        align-items: center;

        button {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            border-radius: ${radius};
            padding: 8px 12px;
            cursor: pointer;
            transition: border-color 0.15s ease, transform 0.02s ease-in-out;
            &:hover {
                border-color: ${accent};
            }
            &:active {
                transform: translateY(1px);
            }
        }
        .ghost {
            background: ${bg};
        }
    `,

    FootNote: styled.div`
        margin-top: 10px;
        .muted {
            color: ${muted};
            font-size: 13px;
        }
    `,

    Side: styled.aside`
        display: grid;
        gap: 16px;
    `,

    SideHeader: styled.div`
        display: grid;
        gap: 12px;

        h3 {
            margin: 0;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .count {
            display: inline-block;
            padding: 2px 8px;
            border: 1px solid ${border};
            background: ${bg};
            border-radius: 999px;
            font-size: 12px;
            color: ${muted};
        }

        .row {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 8px;
            align-items: center;
        }

        input[type="text"] {
            width: 100%;
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: calc(${radius} - 2px);
            padding: 8px 10px;
            outline: none;
            &:focus {
                border-color: ${accent};
            }
        }

        .btns {
            display: inline-flex;
            gap: 8px;
            align-items: center;
        }

        button,
        label.file {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            border-radius: ${radius};
            padding: 8px 12px;
            cursor: pointer;
            transition: border-color 0.15s ease, transform 0.02s ease-in-out;
            &:hover {
                border-color: ${accent};
            }
            &:active {
                transform: translateY(1px);
            }
        }

        .ghost {
            background: ${bg};
        }

        .danger {
            background: ${bg};
            border-color: ${danger};
            color: ${danger};
        }

        label.file {
            position: relative;
            overflow: hidden;
        }
        label.file input[type="file"] {
            position: absolute;
            inset: 0;
            opacity: 0;
            cursor: pointer;
        }
    `,

    List: styled.ul`
        list-style: none;
        margin: 12px 0 0 0;
        padding: 0;

        li {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 8px;
            padding: 12px 0;
            border-bottom: 1px solid ${border};
        }

        .content .text {
            margin: 0 0 6px 0;
            line-height: 1.5;
        }

        .content .meta {
            margin: 0;
            font-size: 13px;
            color: ${muted};
        }
        .content .author {
            color: ${text};
            font-weight: 600;
        }

        .itemBtns {
            display: inline-flex;
            gap: 8px;
            align-items: flex-start;
        }

        .itemBtns button {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            border-radius: ${radius};
            padding: 6px 10px;
            cursor: pointer;
            transition: border-color 0.15s ease, transform 0.02s ease-in-out;
            &:hover {
                border-color: ${accent};
            }
            &:active {
                transform: translateY(1px);
            }
        }
        .itemBtns .ghost {
            background: ${bg};
        }
        .itemBtns .danger {
            border-color: ${danger};
            color: ${danger};
            background: ${bg};
        }
    `,

    Empty: styled.div`
        padding: 12px 0;
        .muted {
            color: ${muted};
            font-size: 14px;
        }
    `,

    Modal: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        display: grid;
        place-items: center;
        z-index: 999;

        .box {
            width: min(520px, 92vw);
            background: ${card};
            color: ${text};
            border: 1px solid ${border};
            border-radius: ${radius};
            box-shadow: ${shadow};
            padding: 16px;
            display: grid;
            gap: 12px;
        }

        h4 {
            margin: 0;
            font-size: 16px;
        }
        p.muted {
            margin: 0;
            color: ${muted};
        }

        .row {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 10px;
            margin-top: 6px;
        }

        button {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            border-radius: ${radius};
            padding: 8px 12px;
            cursor: pointer;
            transition: border-color 0.15s ease, transform 0.02s ease-in-out;
            &:hover {
                border-color: ${accent};
            }
            &:active {
                transform: translateY(1px);
            }
        }
        .ghost {
            background: ${bg};
        }
        .danger {
            border-color: ${danger};
            color: ${danger};
            background: ${bg};
        }
    `,
};

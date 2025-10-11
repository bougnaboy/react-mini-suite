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
        display: grid;
        gap: 16px;
        padding: 16px;
        background: ${bg};
        color: ${text};
        min-height: 100%;
    `,

    Header: styled.header`
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;

        h1 {
            margin: 0 0 6px 0;
            font-size: 20px;
            line-height: 1.2;
        }
        p {
            margin: 0;
            font-size: 14px;
            color: ${muted};
        }
    `,

    Badges: styled.div`
        display: flex;
        gap: 8px;
        align-items: center;
        .badge {
            background: ${card};
            border: 1px solid ${border};
            border-radius: 999px;
            padding: 6px 10px;
            font-size: 12px;
            box-shadow: ${shadow};
        }
    `,

    Layout: styled.div`
        display: grid;
        grid-template-columns: 1.7fr 1fr;
        gap: 16px;
        @media (max-width: 1024px) {
            grid-template-columns: 1fr;
        }
    `,

    Card: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;
    `,

    Section: styled.section`
        & + & {
            margin-top: 16px;
        }
    `,

    SectionTitle: styled.h2`
        margin: 0 0 10px 0;
        font-size: 15px;
        font-weight: 600;
    `,

    Grid: styled.div`
        display: grid;
        gap: 12px;
        grid-template-columns: ${(p) =>
            p.cols === "3" ? "1fr 1fr 1fr" : "1fr 1fr"};
        @media (max-width: 720px) {
            grid-template-columns: 1fr;
        }
    `,

    Field: styled.div`
        display: grid;
        gap: 6px;

        &.span2 {
            grid-column: span 2;
            @media (max-width: 720px) {
                grid-column: span 1;
            }
        }

        label {
            font-size: 13px;
            color: ${text};
        }

        input[type="text"],
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
        }
        input:focus,
        select:focus {
            border-color: ${accent};
        }

        .inline {
            display: flex;
            gap: 14px;
            align-items: center;
            flex-wrap: wrap;
        }
        .checkbox {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
        }
    `,

    Chips: styled.div`
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        .chip {
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: 999px;
            padding: 6px 10px;
            font-size: 13px;
            cursor: pointer;
            user-select: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: border-color 0.15s ease, background 0.15s ease;
        }
        .chip.active {
            background: ${card};
            border-color: ${accent};
        }
        .chip.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .chip input {
            display: none;
        }
    `,

    Actions: styled.div`
        margin-top: 8px;
        display: flex;
        gap: 10px;
        align-items: center;

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
        }
        button:hover {
            border-color: ${accent};
        }
        button:active {
            transform: translateY(1px);
        }
        button:disabled {
            opacity: 0.55;
            cursor: not-allowed;
        }

        .ghost {
            background: ${bg};
        }
        .danger {
            border-color: ${danger};
            color: ${danger};
        }
    `,

    Jokes: styled.div`
        display: grid;
        gap: 12px;
        margin-top: 8px;
    `,

    JokeCard: styled.article`
        border: 1px solid ${border};
        border-radius: ${radius};
        background: ${bg};
        padding: 12px;

        .meta {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 6px;
            .pill {
                border: 1px solid ${border};
                background: ${card};
                border-radius: 999px;
                padding: 4px 8px;
                font-size: 12px;
            }
            .time {
                color: ${muted};
                font-size: 12px;
            }
        }

        .content {
            font-size: 15px;
            line-height: 1.55;
            white-space: pre-wrap;
            &.single {
                font-style: normal;
            }
            .setup {
                font-weight: 600;
            }
            .delivery {
                margin-top: 4px;
            }
        }

        .actions {
            margin-top: 10px;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            button {
                border: 1px solid ${border};
                background: ${card};
                color: ${text};
                border-radius: ${radius};
                padding: 8px 12px;
                font-size: 13px;
                cursor: pointer;
            }
            .ghost {
                background: ${bg};
            }
        }
    `,

    Side: styled.aside`
        display: grid;
        gap: 16px;
    `,

    List: styled.ul`
        list-style: none;
        margin: 0;
        padding: 0;
        li {
            display: grid;
            grid-template-columns: auto 1fr auto;
            gap: 8px;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px dashed ${border};
        }
        li:last-child {
            border-bottom: none;
        }

        .cat {
            font-size: 12px;
            border: 1px solid ${border};
            background: ${card};
            border-radius: 999px;
            padding: 2px 6px;
        }
        .txt {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 14px;
        }
        .row-actions {
            display: inline-flex;
            gap: 6px;
            .sm {
                padding: 6px 8px;
                font-size: 12px;
                border-radius: ${radius};
                border: 1px solid ${border};
                background: ${card};
                color: ${text};
                cursor: pointer;
            }
            .ghost {
                background: ${bg};
            }
            .danger {
                border-color: ${danger};
                color: ${danger};
            }
        }
        .muted {
            color: ${muted};
            font-size: 13px;
            padding: 6px 0;
        }
    `,

    Help: styled.div`
        color: ${muted};
        font-size: 14px;
    `,

    /* =========== Confirm Modal =========== */
    ModalOverlay: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
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

        h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
        }
        .msg {
            margin: 0 0 12px 0;
            color: ${muted};
            font-size: 14px;
        }
    `,
    ModalActions: styled.div`
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
        }
        .ghost {
            background: ${bg};
        }
        .danger {
            border-color: ${danger};
            color: ${danger};
        }
    `,
};

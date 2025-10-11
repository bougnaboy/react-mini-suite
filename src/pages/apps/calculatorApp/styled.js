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
    Page: styled.div`
        color: ${text};
        background: ${bg};
        min-height: 100%;
        padding: 16px;
    `,

    /* required: app wrapper centered */
    AppWrapper: styled.div`
        width: 100%;
        max-width: 1440px;
        margin: 0 auto;
        display: grid;
        gap: 16px;
    `,

    HeaderRow: styled.div`
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
            color: ${muted};
            font-size: 14px;
        }
    `,

    TopActions: styled.div`
        display: flex;
        gap: 8px;

        button {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            box-shadow: ${shadow};
            cursor: pointer;
        }
        .ghost {
            background: ${bg};
        }
    `,

    Layout: styled.div`
        display: grid;
        grid-template-columns: 1.25fr 1fr;
        gap: 16px;

        @media (max-width: 1100px) {
            grid-template-columns: 1fr;
        }
    `,

    Card: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;

        h3 {
            margin: 0 0 12px 0;
            font-size: 16px;
        }
    `,

    MemoryBar: styled.div`
        display: grid;
        grid-template-columns: repeat(5, auto) 1fr;
        gap: 8px;
        margin-bottom: 10px;

        button {
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            padding: 6px 10px;
            border-radius: ${radius};
            cursor: pointer;
        }
        .memval {
            justify-self: end;
            color: ${muted};
            font-size: 13px;
            align-self: center;
        }
    `,

    Display: styled.div`
        border: 1px solid ${border};
        background: ${bg};
        border-radius: ${radius};
        padding: 12px;
        margin-bottom: 12px;

        .expr {
            color: ${muted};
            font-size: 13px;
            min-height: 18px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            user-select: text;
        }
        .value {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
                "Liberation Mono", "Courier New", monospace;
            font-size: 28px;
            line-height: 1.2;
            padding-top: 6px;
            word-break: break-all;
            user-select: text;
        }
    `,

    ActionStrip: styled.div`
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin-bottom: 8px;

        button {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 10px 0;
            border-radius: ${radius};
            cursor: pointer;
            box-shadow: ${shadow};
        }
        .danger {
            border-color: ${danger};
        }
        .op {
            color: ${accent};
        }
    `,

    FunctionRow: styled.div`
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin-bottom: 8px;

        button {
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            padding: 8px 0;
            border-radius: ${radius};
            cursor: pointer;
        }
    `,

    Keypad: styled.div`
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;

        button {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 16px 0;
            border-radius: ${radius};
            cursor: pointer;
            font-size: 16px;
            box-shadow: ${shadow};
            transition: transform 0.02s ease-in-out, border-color 0.15s ease;
        }
        button:active {
            transform: translateY(1px);
        }
        .op {
            color: ${accent};
        }
        .eq {
            background: ${bg};
            border-color: ${accent};
        }
    `,

    HistoryList: styled.div`
        display: grid;
        gap: 8px;
        max-height: 460px;
        overflow: auto;
    `,

    HistoryItem: styled.div`
        border: 1px solid ${border};
        border-radius: ${radius};
        padding: 10px;
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
        align-items: center;
        background: ${bg};

        .lines {
            cursor: pointer;
            user-select: none;
        }

        .expr {
            color: ${muted};
            font-size: 13px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .res {
            font-family: ui-monospace, monospace;
            font-size: 15px;
            line-height: 1.3;
        }

        .remove {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            border-radius: ${radius};
            width: 32px;
            height: 32px;
            cursor: pointer;
            display: inline-grid;
            place-items: center;
        }
    `,

    Empty: styled.div`
        color: ${muted};
        font-size: 14px;
        padding: 6px 0 12px;
    `,

    ModalWrap: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: grid;
        place-items: center;
        z-index: 50;
    `,

    Modal: styled.div`
        width: min(420px, 92vw);
        background: ${card};
        color: ${text};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;

        h4 {
            margin: 0 0 6px;
            font-size: 16px;
        }
        p {
            margin: 0 0 12px;
            color: ${muted};
            font-size: 14px;
        }

        .actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }
        .actions .ghost {
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
        }
        .actions .danger {
            border: 1px solid ${danger};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
        }
    `,
};

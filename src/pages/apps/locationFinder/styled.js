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
        color: ${text};
        background: ${bg};
        min-height: 100%;
    `,

    Header: styled.div`
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

    Badges: styled.div`
        display: flex;
        gap: 8px;
        align-items: center;
        .badge {
            background: ${card};
            border: 1px solid ${border};
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 12px;
            box-shadow: ${shadow};
            white-space: nowrap;
        }
    `,

    Tabs: styled.div`
        display: flex;
        gap: 8px;
        .tab {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            box-shadow: ${shadow};
        }
        .tab.active {
            border-color: ${accent};
        }
    `,

    Layout: styled.div`
        display: grid;
        grid-template-columns: 1.6fr 1fr;
        gap: 16px;
        @media (max-width: 1080px) {
            grid-template-columns: 1fr;
        }
    `,

    Side: styled.aside`
        display: grid;
        gap: 16px;
    `,

    Card: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;
    `,

    SectionTitle: styled.h2`
        margin: 0 0 12px 0;
        font-size: 15px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
        .right {
            margin-left: auto;
        }
    `,

    SearchRow: styled.form`
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 8px;
        input {
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
        input:focus {
            border-color: ${accent};
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
            color: ${danger};
        }
    `,

    Results: styled.div`
        display: grid;
        gap: 8px;
    `,

    ResultItem: styled.div`
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
        align-items: center;
        border: 1px solid ${border};
        background: ${bg};
        border-radius: calc(${radius} - 2px);
        padding: 10px 12px;
        transition: border-color 0.15s ease, background 0.15s ease;
        cursor: pointer;
        &:hover {
            border-color: ${accent};
        }
        &.active {
            background: ${card};
            border-color: ${accent};
        }

        .main {
            display: grid;
            gap: 4px;
            .title {
                font-weight: 600;
                font-size: 14px;
            }
            .addr {
                color: ${muted};
                font-size: 13px;
            }
            .coords {
                color: ${muted};
                font-size: 12px;
            }
        }
        .actions {
            display: inline-flex;
            gap: 8px;
            align-items: center;
            button {
                border: 1px solid ${border};
                background: ${card};
                color: ${text};
                padding: 6px 10px;
                border-radius: ${radius};
                cursor: pointer;
                font: inherit;
                transition: border-color 0.15s ease;
            }
            .ghost {
                background: ${bg};
            }
        }
    `,

    List: styled.ul`
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 8px;
        li {
            border: 1px solid ${border};
            border-radius: calc(${radius} - 2px);
            background: ${bg};
            padding: 10px 12px;
            display: grid;
            gap: 6px;
        }
        .row {
            display: flex;
            gap: 8px;
            align-items: center;
            justify-content: space-between;
        }
        .mini {
            display: inline-flex;
            gap: 6px;
        }
        .link {
            text-align: left;
            background: transparent;
            border: none;
            color: ${text};
            font: inherit;
            cursor: pointer;
            padding: 0;
        }
        button.ghost {
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            padding: 6px 10px;
            border-radius: ${radius};
            cursor: pointer;
        }
        .danger {
            color: ${danger};
            border-color: ${danger};
        }
        small {
            color: ${muted};
        }
    `,

    /* Map wrapper now supports <img> and <iframe> fallback */
    MapWrap: styled.div`
        border: 1px solid ${border};
        border-radius: calc(${radius} - 2px);
        overflow: hidden;
        background: ${bg};
        margin-bottom: 10px;
        min-height: 200px;

        img,
        iframe {
            display: block;
            width: 100%;
            height: 360px;
            border: none;
        }

        @media (max-width: 520px) {
            img,
            iframe {
                height: 280px;
            }
        }
    `,

    KV: styled.div`
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin: 10px 0 8px 0;
        div {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border: 1px solid ${border};
            border-radius: calc(${radius} - 2px);
            padding: 8px 10px;
            background: ${bg};
            span {
                color: ${muted};
                font-size: 12px;
            }
            code {
                font-size: 13px;
            }
        }
        @media (max-width: 520px) {
            grid-template-columns: 1fr;
        }
    `,

    Actions: styled.div`
        margin-top: 8px;
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
        button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
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

    Muted: styled.div`
        color: ${muted};
        font-size: 14px;
    `,
    Error: styled.div`
        color: ${danger};
        font-size: 13px;
        margin-top: 6px;
        min-height: 16px;
    `,

    /* Confirm Modal */
    ModalOverlay: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: grid;
        place-items: center;
        z-index: 999;
    `,
    Modal: styled.div`
        width: min(480px, 92vw);
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
        p {
            margin: 0 0 12px 0;
            color: ${muted};
        }
    `,
    ModalActions: styled.div`
        display: flex;
        gap: 8px;
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

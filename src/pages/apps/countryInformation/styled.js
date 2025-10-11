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
        padding: 16px;
        min-height: 100%;
        max-width: 1440px;
        margin: 0 auto;
        display: grid;
        gap: 16px;
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
            color: ${muted};
            font-size: 14px;
        }
    `,

    Badges: styled.div`
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        .badge {
            background: ${card};
            border: 1px solid ${border};
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 12px;
            box-shadow: ${shadow};
        }
    `,

    Layout: styled.div`
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 16px;
        @media (max-width: 1120px) {
            grid-template-columns: 1fr;
        }
        .col {
            display: grid;
            gap: 16px;
        }
    `,

    Card: styled.section`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;

        h3 {
            margin: 0 0 12px 0;
            font-size: 16px;
        }
        .muted {
            color: ${muted};
        }
    `,

    SearchRow: styled.div`
        display: flex;
        gap: 8px;
        align-items: center;

        input {
            flex: 2;
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: calc(${radius} - 2px);
            padding: 10px 12px;
            font: inherit;
            outline: none;
        }
        input:focus {
            border-color: ${accent};
        }

        button {
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

        .spacer {
            flex: 1;
            min-width: 8px;
        }
    `,

    Suggestions: styled.div`
        margin-top: 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        button {
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 13px;
            cursor: pointer;
            &:hover {
                border-color: ${accent};
            }
        }
    `,

    Error: styled.div`
        margin-top: 10px;
        color: ${danger};
        font-size: 13px;
    `,

    List: styled.ul`
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 8px;
    `,

    ListItem: styled.li`
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
        border: 1px solid ${border};
        background: ${bg};
        border-radius: ${radius};
        overflow: hidden;

        /* ensure base color in dark themes */
        color: ${text};

        &[data-active="true"] {
            outline: 1.5px solid ${accent};
            outline-offset: 0;
        }

        .row {
            display: flex;
            gap: 12px;
            text-align: left;
            width: 100%;
            background: transparent;
            border: none;
            padding: 8px;
            cursor: pointer;

            /* button doesn't always inherit; force it */
            color: ${text};
        }
        /* children inherit */
        .row * {
            color: inherit;
        }

        img {
            width: 56px;
            height: 36px;
            object-fit: cover;
            border-radius: 6px;
            border: 1px solid ${border};
            background: ${card};
        }

        .meta {
            display: grid;
            gap: 2px;
            align-content: center;
        }
        .name {
            font-weight: 600;
        }
        .sub,
        .cap {
            color: ${muted};
            font-size: 13px;
        }

        .actions {
            display: flex;
            gap: 8px;
            align-items: center;
            padding: 8px;

            .small {
                padding: 6px 10px;
                border-radius: 999px;
                border: 1px solid ${border};
                background: ${card};
                color: ${text};
                cursor: pointer;
                &:hover {
                    border-color: ${accent};
                }
            }
            .danger {
                border-color: ${danger};
                color: ${danger};
            }
        }
    `,

    Detail: styled.div`
        display: grid;
        gap: 14px;

        .head {
            display: flex;
            gap: 12px;
            align-items: center;
        }
        .flag {
            width: 160px;
            height: 110px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid ${border};
            background: ${bg};
        }

        h2 {
            margin: 0 0 4px 0;
            font-size: 18px;
        }
    `,

    Grid: styled.div`
        ${(p) =>
            p.two
                ? `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      @media (max-width: 720px) { grid-template-columns: 1fr; }
      .row { display: contents; }
      .label { color: ${muted}; font-size: 13px; }
      .value { font-size: 14px; }
    `
                : `
      display: grid; gap: 8px;
    `}
    `,

    Chips: styled.div`
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 6px;

        button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            padding: 6px 10px;
            border-radius: 999px;
            cursor: pointer;
            font-size: 13px;
            &:hover {
                border-color: ${accent};
            }
            img {
                width: 20px;
                height: 14px;
                object-fit: cover;
                border: 1px solid ${border};
                border-radius: 3px;
            }
        }
    `,

    Links: styled.div`
        display: flex;
        gap: 12px;
        margin-top: 8px;

        a {
            color: ${text};
            border: 1px solid ${border};
            background: ${bg};
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 13px;
            text-decoration: none;
            &:hover {
                border-color: ${accent};
            }
        }
    `,

    Actions: styled.div`
        margin-top: 10px;
        display: flex;
        gap: 8px;
        align-items: center;
        .spacer {
            flex: 1;
        }
        button {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 10px 14px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            &:hover {
                border-color: ${accent};
            }
        }
        .danger {
            border-color: ${danger};
            color: ${danger};
        }
        .ghost {
            background: ${bg};
        }
    `,

    FlexHead: styled.div`
        display: flex;
        align-items: center;
        justify-content: space-between;
        h3 {
            margin: 0;
        }
        .right {
            display: flex;
            gap: 8px;
        }
        .small {
            color: ${danger};
            padding: 6px 10px;
            border-radius: 999px;
            border: 1px solid ${border};
            background: ${card};
            cursor: pointer;
            &:hover {
                border-color: ${accent};
            }
        }
        .ghost {
            background: ${bg};
        }
    `,

    FavList: styled.ul`
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 8px;

        li {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 8px;
            border: 1px solid ${border};
            background: ${bg};
            border-radius: ${radius};
            overflow: hidden;
        }
        .row {
            display: flex;
            gap: 12px;
            text-align: left;
            width: 100%;
            background: transparent;
            border: none;
            padding: 8px;
            cursor: pointer;
            color: ${text};
        }
        .row * {
            color: inherit;
        }

        img {
            width: 44px;
            height: 28px;
            object-fit: cover;
            border-radius: 4px;
            border: 1px solid ${border};
            background: ${card};
        }
        .meta {
            display: grid;
            gap: 2px;
            align-content: center;
        }
        .name {
            font-weight: 600;
        }
        .sub {
            color: ${muted};
            font-size: 13px;
        }

        .actions {
            display: flex;
            gap: 8px;
            align-items: center;
            padding: 8px;
            .small {
                padding: 6px 10px;
                border-radius: 999px;
                border: 1px solid ${border};
                background: ${card};
                color: ${text};
                cursor: pointer;
                &:hover {
                    border-color: ${accent};
                }
            }
            .danger {
                border-color: ${danger};
                color: ${danger};
            }
        }
    `,

    /* ---------- Modal ---------- */
    ModalOverlay: styled.div`
        position: fixed;
        inset: 0;
        background: color-mix(in oklab, black 40%, transparent);
        display: grid;
        place-items: center;
        z-index: 9999;
        padding: 16px;
    `,

    Modal: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        width: min(520px, 96vw);
        padding: 12px;

        header {
            padding: 4px 8px 8px;
        }
        h3 {
            margin: 0;
            font-size: 16px;
        }

        .body {
            padding: 0 8px 8px;
            color: ${text};
        }
        footer {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
            padding: 8px;
            button {
                border: 1px solid ${border};
                background: ${card};
                color: ${text};
                padding: 8px 12px;
                border-radius: ${radius};
                cursor: pointer;
                &:hover {
                    border-color: ${accent};
                }
            }
            .ghost {
            }
            .danger {
                border-color: ${danger};
                color: ${danger};
            }
        }
    `,
};

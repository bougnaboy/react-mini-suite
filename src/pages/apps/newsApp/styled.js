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

        /* App-level width constraints */
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

        .titles h1 {
            margin: 0 0 6px 0;
            font-size: 20px;
            line-height: 1.2;
        }
        .titles p {
            margin: 0;
            color: ${muted};
            font-size: 14px;
        }

        .actions {
            display: flex;
            gap: 8px;
        }

        .ghost {
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: ${radius};
            padding: 8px 12px;
            cursor: pointer;
        }
        .ghost:hover {
            border-color: ${accent};
        }
    `,

    Settings: styled.form`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 12px;
        display: grid;
        gap: 12px;

        .row {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
        }
        .row:nth-child(2) {
            grid-template-columns: 1fr auto;
            align-items: center;
        }
        .row.rowSmall {
            grid-template-columns: 1fr;
            align-items: center;
        }

        .field {
            display: grid;
            gap: 6px;
        }
        label {
            font-size: 12px;
        }
        input[type="password"],
        input[type="search"],
        select {
            width: 100%;
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: calc(${radius} - 2px);
            padding: 8px 10px;
            font: inherit;
            outline: none;
        }
        input:focus,
        select:focus {
            border-color: ${accent};
        }

        .chips {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .chip {
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: 999px;
            padding: 6px 10px;
            font-size: 13px;
            cursor: pointer;
            transition: border-color 0.15s ease, background 0.15s ease;
        }
        .chip.active {
            background: ${card};
            border-color: ${accent};
        }

        .searchWrap {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
            align-items: center;
        }
        .searchWrap input[type="search"] {
            max-width: 320px;
        }
        .searchWrap button {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
        }
        .searchWrap button:hover {
            border-color: ${accent};
        }

        .checkbox {
            display: inline-flex;
            gap: 8px;
            align-items: center;
            color: ${muted};
            font-size: 14px;
        }

        @media (max-width: 980px) {
            .row {
                grid-template-columns: 1fr 1fr;
            }
            .row:nth-child(2) {
                grid-template-columns: 1fr;
            }
        }
        @media (max-width: 560px) {
            .row {
                grid-template-columns: 1fr;
            }
        }
    `,

    StatusBar: styled.div`
        display: flex;
        justify-content: space-between;
        align-items: center;

        .left {
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
        }
        .meta {
            color: ${muted};
        }
        .err {
            color: ${danger};
            font-size: 13px;
        }

        .right {
            display: flex;
            gap: 8px;
        }
        .ghost {
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: ${radius};
            padding: 6px 10px;
            cursor: pointer;
        }
        .ghost:hover {
            border-color: ${accent};
        }
    `,

    Grid: styled.section`
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;

        @media (max-width: 1024px) {
            grid-template-columns: repeat(2, 1fr);
        }
        @media (max-width: 640px) {
            grid-template-columns: 1fr;
        }

        .card {
            background: ${card};
            border: 1px solid ${border};
            border-radius: ${radius};
            box-shadow: ${shadow};
            display: grid;
            grid-template-rows: auto 1fr auto;
            overflow: hidden;
        }

        .thumb {
            display: block;
            width: 100%;
            aspect-ratio: 16/9;
            border: 0;
            padding: 0;
            cursor: pointer;
            background: ${bg};
        }
        .thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .noimg {
            width: 100%;
            height: 100%;
            display: grid;
            place-items: center;
            color: ${muted};
            font-size: 13px;
            border-bottom: 1px solid ${border};
        }

        .body {
            padding: 12px;
        }
        h3 {
            margin: 0 0 6px 0;
            font-size: 16px;
            line-height: 1.3;
        }
        .desc {
            margin: 0 0 10px 0;
            color: ${muted};
            font-size: 14px;
        }
        .meta {
            display: flex;
            gap: 6px;
            align-items: center;
            color: ${muted};
            font-size: 12px;
        }
        .meta .dot {
            opacity: 0.6;
        }

        .actions {
            display: flex;
            gap: 8px;
            padding: 12px;
            border-top: 1px solid ${border};
        }
        .actions a,
        .actions button {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
            text-decoration: none;
            text-align: center;
            flex: 1;
        }
        .actions a:hover,
        .actions button:hover {
            border-color: ${accent};
        }
        .actions .primary {
            border-color: ${accent};
        }
    `,

    FooterBar: styled.div`
        display: flex;
        justify-content: center;
        padding: 8px 0;

        .loadMore {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 10px 16px;
            border-radius: ${radius};
            cursor: pointer;
        }
        .loadMore:hover {
            border-color: ${accent};
        }
    `,

    SideWrap: styled.section`
        display: grid;
        grid-template-columns: 2fr 3fr;
        gap: 12px;

        @media (max-width: 980px) {
            grid-template-columns: 1fr;
        }
    `,

    Panel: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 12px;

        h4 {
            margin: 0 0 10px 0;
            font-size: 15px;
        }

        .list {
            list-style: none;
            margin: 0;
            padding: 0;
            display: grid;
            gap: 8px;
        }
        .list li {
            border: 1px dashed ${border};
            border-radius: calc(${radius} - 3px);
            padding: 8px;
            display: grid;
            gap: 6px;
        }
        .list li .row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .src {
            color: ${muted};
            font-size: 12px;
        }
        .muted {
            color: ${muted};
        }

        .danger {
            border: 1px solid ${danger};
            color: ${danger};
            background: transparent;
            border-radius: 999px;
            padding: 4px 10px;
            cursor: pointer;
        }
        .danger:hover {
            filter: brightness(1.1);
        }
    `,

    ModalBackdrop: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        display: grid;
        place-items: center;
        z-index: 50;
        padding: 20px;
    `,

    ModalCard: styled.div`
        background: ${card};
        color: ${text};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        width: min(720px, 100%);
        max-height: 85vh;
        overflow: auto;
        display: grid;
        gap: 12px;
        padding: 12px;

        .head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
        }
        .head h3 {
            margin: 0;
            font-size: 18px;
        }

        .content img {
            width: 100%;
            height: auto;
            border-radius: calc(${radius} - 2px);
            border: 1px solid ${border};
            display: block;
            margin-bottom: 8px;
        }
        .content .desc {
            color: ${muted};
        }

        .metaLine {
            display: flex;
            gap: 8px;
            align-items: center;
            color: ${muted};
            font-size: 12px;
        }
        .metaLine .dot {
            opacity: 0.6;
        }

        .foot {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }
        .foot .ghost {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
        }
        .foot .ghost:hover {
            border-color: ${accent};
        }
        .foot .primary {
            border: 1px solid ${accent};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
        }
        .foot .danger {
            border: 1px solid ${danger};
            color: ${danger};
            background: transparent;
            border-radius: ${radius};
            padding: 8px 12px;
            cursor: pointer;
        }
    `,
};

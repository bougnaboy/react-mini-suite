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
        min-height: 100%;
        max-width: 1440px;
        margin: 0 auto;
        padding: 16px;
        display: grid;
        gap: 16px;
        background: ${bg};
        color: ${text};
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

    ActionsRow: styled.div`
        display: flex;
        gap: 8px;
        button {
            appearance: none;
            cursor: pointer;
            font: inherit;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            box-shadow: ${shadow};
            &:hover {
                border-color: ${accent};
            }
            &.ghost {
                background: ${bg};
            }
            &:disabled {
                opacity: 0.55;
                cursor: not-allowed;
            }
        }
    `,

    Controls: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 12px;
        display: grid;
        gap: 12px;

        .row {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .mini {
            font-size: 12px;
            color: ${muted};
        }
        input[type="color"] {
            width: 36px;
            height: 28px;
            padding: 0;
            border: 1px solid ${border};
            border-radius: ${radius};
            background: ${bg};
        }
        input[type="range"] {
            width: 220px;
        }
        .text {
            width: 120px;
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: calc(${radius} - 2px);
            padding: 8px 10px;
            font: inherit;
            outline: none;
        }
    `,

    ControlGroup: styled.div`
        display: grid;
        gap: 8px;

        .label {
            font-size: 13px;
            color: ${muted};
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
            font-size: 12px;
            cursor: pointer;
            box-shadow: ${shadow};
            transition: border-color 0.15s ease, background 0.15s ease,
                transform 0.02s ease-in-out;
            white-space: nowrap;
        }
        .chip:hover {
            border-color: ${accent};
        }
        .chip:active {
            transform: translateY(1px);
        }
        .chip.active {
            background: ${card};
            border-color: ${accent};
        }
        .hint {
            font-size: 12px;
            color: ${muted};
        }
    `,

    PreviewCard: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 12px;
        display: grid;
        gap: 12px;

        .imgWrap {
            width: 260px;
            height: 260px;
            display: grid;
            place-items: center;
            border: 1px solid ${border};
            border-radius: ${radius};
            background: ${bg};
            overflow: hidden;
        }
        .imgWrap img {
            width: 90%;
            height: 90%;
            object-fit: contain;
            display: block;
        }

        .row {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        .row a,
        .row button {
            appearance: none;
            cursor: pointer;
            font: inherit;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            box-shadow: ${shadow};
            transition: border-color 0.15s ease, transform 0.02s ease-in-out;
            text-decoration: none;
        }
        .row a:hover,
        .row button:hover {
            border-color: ${accent};
        }
        .row a:active,
        .row button:active {
            transform: translateY(1px);
        }

        .meta {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            font-size: 12px;
            color: ${muted};
        }
        .meta code {
            font-size: 12px;
        }
    `,

    Layout: styled.div`
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 16px;

        @media (max-width: 1024px) {
            grid-template-columns: 1fr;
        }
    `,

    Column: styled.div``,

    SectionTitle: styled.h2`
        margin: 0 0 10px 0;
        font-size: 15px;
        font-weight: 600;
    `,

    Grid: styled.div`
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;

        @media (max-width: 900px) {
            grid-template-columns: repeat(3, 1fr);
        }
        @media (max-width: 640px) {
            grid-template-columns: repeat(2, 1fr);
        }
    `,

    Tile: styled.button`
        border: 1px solid ${border};
        background: ${bg};
        border-radius: ${radius};
        overflow: hidden;
        padding: 0;
        cursor: pointer;
        box-shadow: ${shadow};

        img {
            width: 100%;
            height: 100%;
            display: block;
            aspect-ratio: 1 / 1;
            object-fit: contain;
        }
        &:hover {
            border-color: ${accent};
        }
    `,

    Side: styled.aside`
        display: grid;
        gap: 16px;
        align-content: start;
    `,

    SideCard: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 12px;
        display: grid;
        gap: 10px;
        /* border: 1px solid #f00; */
        align-items: flex-start;

        h3 {
            margin: 0;
            font-size: 15px;
        }

        .favlist {
            /* border: 1px solid #f00; */
            list-style: none;
            margin: 0;
            padding: 0;
            display: grid;
            gap: 8px;
        }
        .favlist li {
            display: grid;
            grid-template-columns: 56px 1fr auto;
            gap: 8px;
            align-items: flex-start;
        }
        .thumb {
            border: 1px solid ${border};
            background: ${bg};
            border-radius: ${radius};
            width: 56px;
            height: 56px;
            padding: 2px;
            display: grid;
            place-items: center;
            cursor: pointer;
        }
        .thumb img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        }
        .info {
            display: grid;
            gap: 2px;
        }
        .info .line {
            font-size: 13px;
        }
        .info .seed {
            font-size: 11px;
            color: ${muted};
        }
        .remove {
            appearance: none;
            cursor: pointer;
            font: inherit;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 6px 10px;
            border-radius: ${radius};
            transition: border-color 0.15s ease;
        }
        .remove:hover {
            border-color: ${danger};
        }

        .row {
            display: flex;
            gap: 8px;
        }
        .row .ghost {
            appearance: none;
            cursor: pointer;
            font: inherit;
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            box-shadow: ${shadow};
            transition: border-color 0.15s ease;
            height: 40px;
        }
        .row .ghost:hover {
            border-color: ${accent};
        }
    `,

    Empty: styled.div`
        color: ${muted};
        font-size: ${(p) => (p.small ? "12px" : "14px")};
        padding: ${(p) => (p.small ? "4px 0" : "8px 0")};
    `,

    ModalBackdrop: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: grid;
        place-items: center;
        z-index: 999;
        padding: 16px;
    `,

    Modal: styled.div`
        width: min(420px, 100%);
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;
        color: ${text};
        display: grid;
        gap: 12px;

        h4 {
            margin: 0;
            font-size: 16px;
        }
        p.muted {
            margin: 0;
            color: ${muted};
            font-size: 14px;
        }

        .actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }
        .actions button {
            appearance: none;
            cursor: pointer;
            font: inherit;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            box-shadow: ${shadow};
            transition: border-color 0.15s ease, transform 0.02s ease-in-out;
        }
        .actions button:hover {
            border-color: ${accent};
        }
        .actions .ghost {
            background: ${bg};
        }
        .actions button:active {
            transform: translateY(1px);
        }
    `,
};

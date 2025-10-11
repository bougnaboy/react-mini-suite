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
        grid-template-columns: 1.8fr 1fr;
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

        h3 {
            margin: 0 0 12px 0;
            font-size: 16px;
        }

        .status {
            list-style: none;
            margin: 0;
            padding: 0;
        }
        .status li {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 0;
            font-size: 14px;
        }
        .status li .dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: inline-block;
        }
        .status li.ok .dot {
            background: ${accent};
        }
        .status li.no .dot {
            background: ${danger};
        }

        .tips {
            margin: 0;
            padding-left: 18px;
            color: ${muted};
            font-size: 14px;
        }
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
        grid-template-columns: 1fr 1fr;
        gap: 12px;
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
            display: inline-flex;
            align-items: center;
            gap: 6px;
            em {
                font-style: normal;
                color: ${danger};
            }
        }

        input[type="text"],
        input[type="email"],
        input[type="tel"],
        input[type="url"],
        input[type="date"],
        input[type="file"],
        select,
        textarea {
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

        textarea {
            resize: vertical;
        }

        input:focus,
        select:focus,
        textarea:focus {
            border-color: ${accent};
        }

        .inline {
            display: flex;
            gap: 16px;
            align-items: center;
        }
        .radio {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
        }
        .checkbox {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
        }

        ${(p) =>
            p.invalid &&
            `
      input, select, textarea { border-color: ${danger}; }
    `}
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
        .chip input {
            display: none;
        }
    `,

    Counter: styled.div`
        text-align: right;
        font-size: 12px;
        color: ${(p) => (p.ok ? "var(--muted)" : danger)};
    `,

    Error: styled.div`
        min-height: 16px;
        font-size: 12px;
        color: ${danger};
    `,

    Help: styled.div`
        font-size: 12px;
        color: ${muted};
    `,

    Preview: styled.div`
        display: inline-flex;
        align-items: center;
        gap: 8px;
        img {
            display: block;
            width: 64px;
            height: 64px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid ${border};
            background: ${bg};
        }
    `,

    Actions: styled.div`
        margin-top: 16px;
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
    `,

    Side: styled.aside`
        display: grid;
        gap: 16px;
    `,

    Divider: styled.hr`
        border: none;
        border-top: 1px solid ${border};
        margin: 12px 0;
    `,
};

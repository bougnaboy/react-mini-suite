import styled from "styled-components";

/* tokens */
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
        /* requested constraint */
        max-width: 1440px;
        margin: 0 auto;
        display: grid;
        gap: 16px;
    `,

    Header: styled.div`
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;

        h1 {
            margin: 0 0 6px 0;
            font-size: 20px;
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
        button {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            border-radius: ${radius};
            padding: 8px 12px;
            cursor: pointer;
            &:hover {
                border-color: ${accent};
            }
            &.ghost {
                background: ${bg};
            }
        }
    `,

    Stats: styled.div`
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        @media (max-width: 900px) {
            grid-template-columns: repeat(2, 1fr);
        }
    `,

    Stat: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 12px;
        display: grid;
        gap: 6px;
        .label {
            color: ${muted};
            font-size: 12px;
        }
        .value {
            font-size: 18px;
            font-weight: 600;
        }
    `,

    Layout: styled.div`
        display: grid;
        grid-template-columns: 1.2fr 2fr;
        gap: 16px;
        @media (max-width: 1200px) {
            grid-template-columns: 1fr;
        }
    `,

    Card: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 14px;
    `,

    SectionTitle: styled.h2`
        margin: 0 0 10px 0;
        font-size: 15px;
        font-weight: 600;
    `,

    Grid: styled.div`
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        @media (max-width: 720px) {
            grid-template-columns: 1fr;
        }
        .span2 {
            grid-column: span 2;
            @media (max-width: 720px) {
                grid-column: span 1;
            }
        }
    `,

    Field: styled.div`
        display: grid;
        gap: 6px;

        label {
            font-size: 13px;
            em {
                color: ${danger};
                font-style: normal;
            }
        }
        input,
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

        ${(p) =>
            p.invalid &&
            `
      input, select, textarea { border-color: ${danger}; }
    `}
    `,

    Error: styled.div`
        min-height: 16px;
        color: ${danger};
        font-size: 12px;
    `,

    Actions: styled.div`
        margin-top: 12px;
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
            &:hover {
                border-color: ${accent};
            }
            &.danger {
                border-color: ${danger};
                color: ${danger};
            }
            &.ghost {
                background: ${bg};
            }
        }
    `,

    Toolbar: styled.div`
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 10px;
        .search {
            flex: 1;
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: ${radius};
            padding: 10px 12px;
            outline: none;
        }
        select {
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: ${radius};
            padding: 10px 12px;
        }
    `,

    List: styled.div`
        display: grid;
        gap: 12px;
    `,

    ProjectHeader: styled.div`
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        .titleArea {
            display: grid;
            gap: 6px;
        }
        h3 {
            margin: 0;
            font-size: 16px;
        }
        .meta {
            display: flex;
            gap: 8px;
            align-items: center;
            flex-wrap: wrap;
        }
        .tag {
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 999px;
            background: ${bg};
            border: 1px solid ${border};
        }
        .status {
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 999px;
            border: 1px solid ${border};
        }
        .status.endingsoon {
            border-color: var(--warning, #e6a700);
            color: var(--warning, #e6a700);
        }
        .status.funded {
            border-color: var(--success, #22a06b);
            color: var(--success, #22a06b);
        }
        .status.active {
            border-color: ${accent};
            color: ${accent};
        }
        .status.ended {
            border-color: ${muted};
            color: ${muted};
        }

        .archived {
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 6px;
            border: 1px dashed ${border};
            color: ${muted};
        }

        .actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
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
                &.ghost {
                    background: ${bg};
                }
                &.danger {
                    border-color: ${danger};
                    color: ${danger};
                }
            }
        }
    `,

    ProjectBody: styled.div`
        margin-top: 12px;
        display: grid;
        grid-template-columns: 240px 1fr;
        gap: 12px;
        @media (max-width: 900px) {
            grid-template-columns: 1fr;
        }
    `,

    ProjectMedia: styled.div`
        .placeholder {
            width: 100%;
            aspect-ratio: 4/3;
            background: linear-gradient(
                135deg,
                rgba(0, 0, 0, 0.08),
                transparent
            );
            border: 1px dashed ${border};
            border-radius: ${radius};
        }
        img {
            display: block;
            width: 100%;
            height: auto;
            aspect-ratio: 4/3;
            object-fit: cover;
            border: 1px solid ${border};
            border-radius: ${radius};
            background: ${bg};
        }
    `,

    ProjectMain: styled.div`
        display: grid;
        gap: 10px;
        .desc {
            margin: 0;
            color: ${text};
        }
    `,

    Progress: styled.div`
        display: grid;
        gap: 6px;
        .bar {
            height: 10px;
            background: ${bg};
            border: 1px solid ${border};
            border-radius: 999px;
            overflow: hidden;
        }
        .fill {
            height: 100%;
            background: ${accent};
            width: 0%;
        }
        .labels {
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: ${muted};
            font-size: 12px;
        }
    `,

    RowInfo: styled.div`
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        color: ${muted};
        font-size: 12px;
    `,

    Pledge: styled.form`
        margin-top: 6px;
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            @media (max-width: 720px) {
                grid-template-columns: 1fr;
            }
            .span2 {
                grid-column: span 2;
                @media (max-width: 720px) {
                    grid-column: span 1;
                }
            }
        }
    `,

    Pledges: styled.div`
        margin-top: 6px;
        display: grid;
        gap: 8px;
        .header {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        h4 {
            margin: 0;
            font-size: 14px;
        }
        ul {
            list-style: none;
            margin: 0;
            padding: 0;
            display: grid;
            gap: 8px;
        }
        li {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 8px;
            border: 1px solid ${border};
            border-radius: ${radius};
            padding: 10px;
            background: ${bg};
        }
        .left {
            display: grid;
            gap: 4px;
        }
        .name {
            font-weight: 600;
        }
        .msg {
            color: ${text};
        }
        .ts {
            color: ${muted};
            font-size: 12px;
        }
        .right {
            display: grid;
            align-content: center;
            gap: 8px;
            justify-items: end;
        }
        .amt {
            font-weight: 700;
        }
        .danger.small {
            border: 1px solid ${danger};
            color: ${danger};
            background: ${card};
            padding: 6px 10px;
            border-radius: ${radius};
            cursor: pointer;
        }
    `,

    Empty: styled.div`
        border: 1px dashed ${border};
        border-radius: ${radius};
        color: ${muted};
        text-align: center;
        padding: 20px;
        background: ${card};
    `,

    Modal: styled.div`
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        background: rgba(0, 0, 0, 0.4);
        z-index: 1000;

        .sheet {
            width: min(520px, 92vw);
            background: ${card};
            color: ${text};
            border: 1px solid ${border};
            border-radius: ${radius};
            box-shadow: ${shadow};
            padding: 16px;
            display: grid;
            gap: 10px;
        }

        h3 {
            margin: 0;
            font-size: 16px;
        }
        p {
            margin: 0;
            color: ${muted};
        }

        .actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
            margin-top: 6px;
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
                &.danger {
                    border-color: ${danger};
                    color: ${danger};
                }
                &.ghost {
                    background: ${bg};
                }
            }
        }
    `,
};

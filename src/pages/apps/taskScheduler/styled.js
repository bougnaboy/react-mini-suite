import styled, { css } from "styled-components";

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
const hi = "#ef476f";
const mid = "#ffd166";
const lo = "#06d6a0";

const Styled = {
    Wrapper: styled.div`
        max-width: 1440px;
        margin: 0 auto;
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
            font-size: 22px;
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
        }
    `,
    Layout: styled.div`
        display: grid;
        grid-template-columns: 1.2fr 2fr;
        gap: 16px;
        @media (max-width: 1100px) {
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
    `,
    SectionTitle: styled.h2`
        margin: 0 0 10px 0;
        font-size: 15px;
        font-weight: 600;
    `,
    Grid: styled.div`
        display: grid;
        grid-template-columns: 1fr 160px 160px;
        gap: 12px;
        @media (max-width: 860px) {
            grid-template-columns: 1fr 1fr;
        }
        .span-2 {
            grid-column: 1 / -1;
        }
    `,
    Field: styled.div`
        display: grid;
        gap: 6px;
        label {
            font-size: 13px;
            color: ${text};
            display: inline-flex;
            gap: 6px;
            align-items: center;
        }
        em {
            color: ${danger};
            font-style: normal;
        }
        input[type="text"],
        input[type="date"],
        textarea,
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
        textarea {
            resize: vertical;
        }
        input:focus,
        textarea:focus,
        select:focus {
            border-color: ${accent};
        }
        ${(p) =>
            p.invalid &&
            css`
                input,
                textarea,
                select {
                    border-color: ${danger};
                }
            `}
    `,
    Error: styled.div`
        min-height: 16px;
        font-size: 12px;
        color: ${danger};
    `,
    Actions: styled.div`
        margin-top: 14px;
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
            transition: transform 0.02s ease, border-color 0.15s ease;
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
        .primary {
            background: ${accent};
            color: #fff;
            border-color: ${accent};
        }
    `,
    FilterBar: styled.div`
        display: grid;
        grid-template-columns: 1fr 160px 160px;
        gap: 10px;
        align-items: center;
        input[type="text"],
        select {
            width: 100%;
            border: 1px solid ${border};
            background: ${bg};
            color: ${text};
            border-radius: calc(${radius} - 2px);
            padding: 10px 12px;
            font: inherit;
        }
        .stats {
            display: flex;
            gap: 12px;
            align-items: center;
            justify-content: flex-end;
            grid-column: 1 / -1;
            color: ${muted};
            font-size: 13px;
        }
        @media (max-width: 860px) {
            grid-template-columns: 1fr;
            .stats {
                justify-content: flex-start;
            }
        }
    `,
    Board: styled.div`
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
        /* ✅ don't stretch columns to equal height */
        align-items: start;
        /* mobile: single column */
        @media (max-width: 860px) {
            grid-template-columns: 1fr;
        }
    `,
    Column: styled.div`
        display: grid;
        gap: 10px;
        /* ✅ make children size to content; never stretch vertically */
        grid-auto-rows: auto;
        align-content: start;

        .col-head {
            /* chip-like header, not a giant card */
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 42px;
            padding: 8px 12px;
            border: 1px solid ${border};
            border-radius: ${radius};
            background: ${bg};
            color: ${text};
            /* prevent vertical stretching */
            align-self: start;
        }
        .col-head.high {
            border-color: #ef476f;
        }
        .col-head.medium {
            border-color: #ffd166;
        }
        .col-head.low {
            border-color: #06d6a0;
        }

        .col-body {
            display: grid;
            gap: 10px;
            /* ✅ allow it to be only as tall as content */
            align-self: start;
            min-height: 0;
        }
    `,
    Empty: styled.div`
        /* shrink-wrap so it doesn't fill the whole column */
        display: inline-block;
        padding: 10px 12px;
        color: ${muted};
        border: 1px dashed ${border};
        border-radius: ${radius};
        background: ${bg};
    `,
    TaskCard: styled.div`
        border: 1px solid ${border};
        border-radius: ${radius};
        padding: 12px;
        background: ${card};
        display: grid;
        gap: 8px;

        &[data-done="1"] .title {
            text-decoration: line-through;
            color: ${muted};
        }
        &[data-done="1"] {
            opacity: 0.9;
        }

        .row-1 {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 10px;
            align-items: center;
        }
        .check {
            display: inline-grid;
            grid-template-columns: 16px auto;
            align-items: center;
            gap: 8px;
        }
        .check input {
            display: none;
        }
        .check span {
            width: 16px;
            height: 16px;
            border: 1px solid ${border};
            border-radius: 4px;
            background: ${bg};
            position: relative;
        }
        .check input:checked + span {
            border-color: ${accent};
            background: ${accent};
        }
        .check input:checked + span::after {
            content: "";
            position: absolute;
            top: 2px;
            left: 5px;
            width: 4px;
            height: 8px;
            border: 2px solid black;
            border-left: 0;
            border-top: 0;
            transform: rotate(45deg);
        }

        .title {
            font-weight: 600;
            font-size: 15px;
        }

        .desc {
            color: ${muted};
            font-size: 13px;
            white-space: pre-wrap;
        }

        .row-2 {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }
        .meta {
            display: flex;
            gap: 8px;
            align-items: center;
        }
        .due {
            font-size: 12px;
            color: ${muted};
        }
        .due.overdue {
            color: ${danger};
        }
        .due.none {
            color: ${muted};
        }

        .prio {
            font-size: 12px;
            border-radius: 999px;
            padding: 4px 8px;
            border: 1px solid ${border};
            background: ${bg};
        }
        .prio.high {
            border-color: ${hi};
            color: ${hi};
        }
        .prio.medium {
            border-color: ${mid};
            color: #a98000;
        }
        .prio.low {
            border-color: ${lo};
            color: #0b7a64;
        }

        .actions {
            display: flex;
            gap: 8px;
        }
        .actions button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 6px 10px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
        }
        .actions .danger {
            border-color: ${danger};
        }
    `,
    /* modal */
    ModalOverlay: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: grid;
        place-items: center;
        z-index: 9999;
    `,
    Modal: styled.div`
        width: min(420px, 90vw);
        background: ${card};
        color: ${text};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;
        h3 {
            margin: 0 0 6px 0;
            font-size: 16px;
        }
        p {
            margin: 0 0 12px 0;
            color: ${muted};
            font-size: 14px;
        }
        .actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        .actions button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
        }
        .actions .ghost {
            background: ${bg};
        }
        .actions .danger {
            border-color: ${danger};
        }
    `,
};

export default Styled;

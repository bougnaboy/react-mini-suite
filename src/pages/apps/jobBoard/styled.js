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
        }
    `,
    Layout: styled.div`
        display: grid;
        grid-template-columns: 2fr 1fr;
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
        grid-template-columns: 1fr 1fr 1fr;
        gap: 12px;
        @media (max-width: 860px) {
            grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 640px) {
            grid-template-columns: 1fr;
        }
    `,
    Field: styled.div`
        display: grid;
        gap: 6px;
        label {
            font-size: 13px;
            color: ${text};
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        input[type="text"],
        input[type="password"],
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
    `,
    Actions: styled.div`
        margin-top: 14px;
        display: flex;
        gap: 10px;
        align-items: center;
        .spacer {
            flex: 1;
        }
        .muted {
            color: ${muted};
            font-size: 12px;
        }
        .muted.warn {
            color: ${danger};
        }
        button,
        a.primary {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 10px 14px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            text-decoration: none;
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
        }
        .primary {
            background: ${accent};
            color: black;
            border-color: ${accent};
        }
    `,
    Info: styled.div`
        padding: 10px 12px;
        border: 1px dashed ${border};
        color: ${muted};
        border-radius: ${radius};
        background: ${bg};
        &.warn {
            color: ${danger};
            border-style: solid;
        }
    `,
    Skeleton: styled.div`
        padding: 12px;
        border: 1px solid ${border};
        border-radius: ${radius};
        background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.04),
            rgba(0, 0, 0, 0.08),
            rgba(0, 0, 0, 0.04)
        );
        background-size: 200% 100%;
        animation: shimmer 1.2s infinite;
        @keyframes shimmer {
            0% {
                background-position: 200% 0;
            }
            100% {
                background-position: -200% 0;
            }
        }
    `,
    Empty: styled.div`
        padding: 12px;
        color: ${muted};
    `,
    Results: styled.div`
        display: grid;
        gap: 12px;
    `,
    JobCard: styled.div`
        border: 1px solid ${border};
        border-radius: ${radius};
        padding: 12px;
        background: ${bg};
        cursor: pointer;
        transition: border-color 0.15s ease;
        &:hover {
            border-color: ${accent};
        }
        .head {
            display: grid;
            grid-template-columns: auto 1fr auto;
            gap: 10px;
            align-items: center;
        }
        .logo {
            width: 44px;
            height: 44px;
            border: 1px solid ${border};
            border-radius: 8px;
            background: ${card};
            display: grid;
            place-items: center;
            overflow: hidden;
        }
        .logo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .logo .placeholder {
            width: 28px;
            height: 28px;
            border-radius: 6px;
            background: rgba(0, 0, 0, 0.08);
        }
        .meta h3 {
            margin: 0;
            font-size: 15px;
        }
        .meta .company,
        .meta .loc {
            margin: 2px 0 0 0;
            color: ${muted};
            font-size: 13px;
        }
        .actions {
            display: flex;
            gap: 8px;
        }
        .actions a,
        .actions button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            text-decoration: none;
        }
        .actions .primary {
            background: ${accent};
            color: black;
            border-color: ${accent};
        }
        .desc {
            margin: 10px 0 0 0;
            color: ${text};
            font-size: 14px;
            line-height: 1.35;
        }
        .desc.full {
            white-space: pre-wrap;
        }
    `,
    Tags: styled.div`
        margin-top: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        span {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            border-radius: 999px;
            padding: 4px 8px;
            font-size: 12px;
        }
        .muted {
            color: ${muted};
            border-style: dashed;
        }
    `,
    Pagination: styled.div`
        margin-top: 12px;
        display: flex;
        gap: 10px;
        align-items: center;
        justify-content: flex-end;
        span {
            color: ${muted};
            font-size: 13px;
        }
        button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            &:hover {
                border-color: ${accent};
            }
            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        }
    `,
    SavedList: styled.ul`
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 10px;
        li {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 10px;
            border: 1px solid ${border};
            border-radius: ${radius};
            padding: 10px 12px;
            background: ${bg};
        }
        .meta {
            display: grid;
            cursor: pointer;
        }
        .meta .muted {
            color: ${muted};
            font-size: 12px;
        }
        .row {
            display: flex;
            gap: 8px;
        }
        .row a,
        .row button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 10px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            text-decoration: none;
        }
        .row .danger {
            border-color: ${danger};
        }
    `,
    Divider: styled.hr`
        border: none;
        border-top: 1px solid ${border};
        margin: 10px 0;
    `,
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

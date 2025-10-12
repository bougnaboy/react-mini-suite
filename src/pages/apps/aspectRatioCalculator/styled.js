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

        /* app container constraints */
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
        grid-template-columns: 1.6fr 1fr;
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
        p.muted {
            color: ${muted};
            font-size: 13px;
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
        gap: 12px;
        grid-template-columns: ${(p) =>
            p.cols ? `repeat(${p.cols}, 1fr)` : "1fr 1fr"};

        .span2 {
            grid-column: span 2;
        }
        @media (max-width: 720px) {
            grid-template-columns: 1fr;
            .span2 {
                grid-column: span 1;
            }
        }
    `,

    Field: styled.div`
        display: grid;
        gap: 6px;
        align-items: end;

        label {
            font-size: 13px;
            color: ${text};
        }
        .checkbox {
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        code {
            background: ${bg};
            border: 1px solid ${border};
            padding: 0 6px;
            border-radius: 6px;
        }

        input[type="number"],
        input[type="text"],
        input[type="file"],
        input[type="range"],
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

        /* tiny mid cell for "×" or ":" rendered via attr() */
        &[mid]::before {
            content: attr(mid);
            display: inline-block;
            color: ${muted};
            font-size: 16px;
            padding: 10px 0;
        }
    `,

    /* NEW: Presets strip */
    Presets: styled.div`
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;

        button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            transition: border-color 0.15s ease;
        }
        button:hover {
            border-color: ${accent};
        }
        .ghost {
            background: ${bg};
        }
    `,

    DropZone: styled.div`
        position: relative;
        border: 1px dashed ${border};
        border-radius: ${radius};
        background: ${bg};
        padding: 16px;
        min-height: 88px;

        input[type="file"] {
            position: absolute;
            inset: 0;
            opacity: 0;
            cursor: pointer;
        }

        .dz-empty {
            display: grid;
            place-items: center;
            gap: 8px;
            color: ${muted};
            text-align: center;
        }
        .dz-empty .btnlike {
            display: inline-block;
            padding: 8px 12px;
            border-radius: ${radius};
            border: 1px solid ${border};
            background: ${card};
            cursor: pointer;
        }

        .dz-hasfile {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }
        .dz-hasfile .name {
            font-size: 14px;
        }
        .dz-hasfile .actions {
            display: flex;
            gap: 8px;
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

    PreviewWrap: styled.div`
        display: grid;
        place-items: center;
    `,

    PreviewBox: styled.div`
        position: relative;
        width: 60%;
        background: rgba(0, 0, 0, 0.06);
        border: 1px solid ${border};
        border-radius: ${radius};
        overflow: hidden;
        box-shadow: ${shadow};

        img,
        .placeholder {
            display: block;
            width: 100%;
            height: 100%;
        }

        .placeholder {
            display: grid;
            place-items: center;
            color: ${muted};
            font-size: 24px;
            font-weight: 600;
            letter-spacing: 1px;
        }

        &[data-grid="1"] .grid {
            position: absolute;
            inset: 0;
            background-image: linear-gradient(
                    to right,
                    rgba(255, 255, 255, 0.15) 1px,
                    transparent 1px
                ),
                linear-gradient(
                    to bottom,
                    rgba(255, 255, 255, 0.15) 1px,
                    transparent 1px
                );
            background-size: 20px 20px;
            pointer-events: none;
        }
    `,

    /* NEW: Side container */
    Side: styled.aside`
        display: grid;
        gap: 16px;
    `,

    SavedList: styled.ul`
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 10px;

        li {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border: 1px solid ${border};
            background: ${bg};
            border-radius: ${radius};
            padding: 10px 12px;
        }
        .meta {
            display: grid;
            gap: 2px;
        }
        .meta span {
            color: ${muted};
            font-size: 12px;
        }
        .row-actions {
            display: flex;
            gap: 8px;
        }
        .row-actions .ghost {
            background: ${bg};
            border: 1px solid ${border};
        }
        .row-actions button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 8px 12px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            transition: border-color 0.15s ease;
            &:hover {
                border-color: ${accent};
            }
        }
    `,

    Help: styled.div`
        font-size: 12px;
        color: ${muted};
    `,

    Error: styled.div`
        min-height: 16px;
        font-size: 12px;
        color: ${danger};
    `,

    /* Modal */
    ModalOverlay: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: grid;
        place-items: center;
        z-index: 40;
    `,
    ModalCard: styled.div`
        width: min(520px, 92vw);
        background: ${card};
        color: ${text};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;
        header h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
        }
        .modal-message {
            margin: 0 0 16px 0;
            color: ${muted};
        }
        .modal-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        .modal-actions .ghost {
            background: ${bg};
            border: 1px solid ${border};
        }
        .modal-actions button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 10px 14px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
            transition: border-color 0.15s ease;
            &:hover {
                border-color: ${accent};
            }
        }
    `,
};

import styled from "styled-components";

const card = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const danger = "var(--danger, #ef4444)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,.25))";

const Wrapper = styled.section`
    max-width: var(--maxw, 1200px);
    margin: 0 auto;
    padding: 24px;
    color: ${text};
`;

const Header = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;

    h2 {
        font-size: 20px;
        font-weight: 600;
        letter-spacing: 0.2px;
    }
`;

const Actions = styled.div`
    display: flex;
    gap: 10px;
    flex-wrap: wrap;

    button {
        border: 1px solid ${border};
        background: ${card};
        color: ${text};
        padding: 8px 12px;
        border-radius: 10px;
        box-shadow: ${shadow};
        cursor: pointer;
        transition: transform 0.06s ease-in-out, border-color 0.15s ease;

        &:hover {
            transform: translateY(-1px);
            border-color: ${accent};
        }
        &:active {
            transform: translateY(0);
        }

        &.danger {
            border-color: ${danger};
            &:hover {
                border-color: ${danger};
            }
        }
    }
`;

const Panels = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const Editor = styled.div`
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 8px;
    background: ${card};
    border: 1px solid ${border};
    border-radius: ${radius};
    box-shadow: ${shadow};
    min-height: 420px;

    label {
        padding: 10px 12px;
        font-size: 12px;
        color: ${muted};
        border-bottom: 1px solid ${border};
    }

    textarea {
        width: 100%;
        height: 100%;
        resize: vertical;
        min-height: 360px;
        padding: 14px;
        background: transparent;
        color: ${text};
        border: 0;
        outline: none;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas,
            "Liberation Mono", monospace;
        font-size: 14px;
        line-height: 1.55;
    }
`;

const Preview = styled.div`
    background: ${card};
    border: 1px solid ${border};
    border-radius: ${radius};
    box-shadow: ${shadow};
    padding: 14px;
    min-height: 420px;

    .preview {
        /* typographic defaults for rendered markdown */
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            margin: 10px 0;
            line-height: 1.25;
        }
        h1 {
            font-size: 26px;
        }
        h2 {
            font-size: 22px;
        }
        h3 {
            font-size: 18px;
        }
        p {
            margin: 8px 0;
        }
        ul,
        ol {
            margin: 8px 0 8px 20px;
        }
        li {
            margin: 4px 0;
        }
        blockquote {
            margin: 10px 0;
            padding: 8px 12px;
            border-left: 3px solid ${accent};
            color: ${muted};
            background: rgba(255, 255, 255, 0.02);
            border-radius: 8px;
        }
        code {
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid ${border};
            padding: 2px 6px;
            border-radius: 8px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas,
                monospace;
            font-size: 13px;
        }
        pre code {
            display: block;
            padding: 12px;
            overflow-x: auto;
            white-space: pre;
        }
        hr {
            border: none;
            border-top: 1px solid ${border};
            margin: 12px 0;
        }
        a {
            color: ${accent};
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        img {
            max-width: 100%;
            border-radius: 10px;
            border: 1px solid ${border};
        }
    }
`;

export const Styled = { Wrapper, Header, Actions, Panels, Editor, Preview };

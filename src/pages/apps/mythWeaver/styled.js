// /pages/apps/mythWeaver/styled.js
import styled, { createGlobalStyle } from "styled-components";

const card = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,0.25))";
const maxw = "var(--maxw, 1100px)";

/* Print only #mw-print, pinned to TOP with a light theme */
export const PrintStyles = createGlobalStyle`
  @media print {
    @page { margin: 18mm; }

    html, body {
      background: #fff !important;
      color: #000 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Hide everything visually but keep it in DOM */
    body * { visibility: hidden !important; }

    /* Show ONLY the result block */
    #mw-print, #mw-print * {
      visibility: visible !important;
    }

    /* Pin the result block to the top of the printable area */
    #mw-print {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      margin: 0 auto !important;
      width: min(700px, 100%) !important;
      background: #fff !important;
      color: #000 !important;
      box-shadow: none !important;
      border: none !important;
      padding: 15px !important;
      transform: none !important; /* ensure no inherited transforms */
    }

    #mw-print * {
      background: transparent !important;
      color: #000 !important;
      box-shadow: none !important;
      text-shadow: none !important;
      border-color: transparent !important;
    }

    /* Links plain */
    #mw-print a, #mw-print a:visited {
      color: #000 !important;
      text-decoration: none !important;
    }
  }
`;

const Wrapper = styled.div`
    color: ${text};
    max-width: ${maxw};
    margin: 0 auto;
    padding: 24px;

    .head {
        margin-bottom: 16px;
        h2 {
            font-weight: 700;
            letter-spacing: 0.3px;
        }
        .muted {
            color: ${muted};
            margin-top: 6px;
            font-size: 0.95rem;
        }
    }
`;

const Grid = styled.div`
    display: grid;
    gap: 16px;
    grid-template-columns: 1fr;

    @media (min-width: 900px) {
        grid-template-columns: 1.1fr 0.9fr;
    }
`;

const Group = styled.div`
    margin-bottom: 14px;
    label {
        display: block;
        margin-bottom: 6px;
        color: ${muted};
        font-size: 0.9rem;
    }
`;

const Row = styled.div`
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
`;

const Input = styled.input`
    background: ${card};
    border: 1px solid ${border};
    color: ${text};
    padding: 10px 12px;
    border-radius: ${radius};
    outline: none;
    transition: border-color 0.15s ease;

    &:focus {
        border-color: ${accent};
    }
`;

const Button = styled.button`
    background: ${accent};
    border: 1px solid ${accent};
    color: #07150e;
    font-weight: 600;
    padding: 10px 12px;
    border-radius: ${radius};
    cursor: pointer;
    box-shadow: ${shadow};
    white-space: nowrap;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    &.ghost {
        background: transparent;
        color: ${text};
        border-color: ${border};
        box-shadow: none;
    }
`;

/* Transient prop to avoid unknown-attr warning */
const Actions = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 10px;
    justify-content: ${(p) =>
        p.$align === "right" ? "flex-end" : "flex-start"};
    flex-wrap: wrap;
`;

const StoryCard = styled.article`
    background: ${card};
    border: 1px solid ${border};
    border-radius: ${radius};
    box-shadow: ${shadow};
    padding: 16px;

    .meta {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 8px;

        .tag {
            font-size: 0.8rem;
            color: ${muted};
            border: 1px dashed ${border};
            padding: 2px 8px;
            border-radius: 999px;
        }
    }

    h3 {
        margin: 6px 0 8px;
    }
    .storyBody p {
        line-height: 1.6;
    }
    .storyBody p.muted {
        color: ${muted};
    }

    .seed {
        margin-top: 14px;
        border-top: 1px dashed ${border};
        padding-top: 10px;

        h4 {
            margin: 0 0 8px;
            font-size: 0.95rem;
            color: ${muted};
        }
        ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: grid;
            gap: 6px;
        }
        li {
            font-size: 0.95rem;
        }
    }
`;

export const Styled = {
    Wrapper,
    Grid,
    Group,
    Row,
    Input,
    Button,
    Actions,
    StoryCard,
};

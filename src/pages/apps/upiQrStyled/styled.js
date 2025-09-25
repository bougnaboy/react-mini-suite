import styled, { createGlobalStyle } from "styled-components";

const bg = "var(--bg, #0b0b0b)";
const card = "var(--card, #121212)";
const text = "var(--text, #eaeaea)";
const muted = "var(--muted, #a8a8a8)";
const border = "var(--border, #242424)";
const accent = "var(--accent, #22c55e)";
const accent2 = "var(--accent-2, #10b981)";
const danger = "var(--danger, #ef4444)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 28px rgba(0,0,0,0.30))";
const maxw = "var(--maxw, 1100px)";

export const Styled = {};

Styled.GlobalStyles = createGlobalStyle`
  :root {
    --bg: #0b0b0b;
    --card: #121212;
    --text: #eaeaea;
    --muted: #a8a8a8;
    --border: #242424;
    --accent: #22c55e;
    --accent-2: #10b981;
    --danger: #ef4444;
    --radius: 16px;
    --shadow: 0 8px 28px rgba(0, 0, 0, 0.30);
    --maxw: 1100px;
  }

  /* Print-only QR (robust) */
  @media print {
    body { background: #fff; color: #000; }
    body * { visibility: hidden !important; }
    .qr-wrap, .qr-wrap * { visibility: visible !important; }
    .qr-wrap {
      position: fixed; inset: 0; display: grid; place-items: center; padding: 0 !important;
    }
    .qr {
      width: 600px !important; height: 600px !important; box-shadow: none !important;
    }
  }
`;

Styled.Wrapper = styled.div``;

Styled.SiteHeader = styled.header`
    max-width: ${maxw};
    margin: 0 auto;
    padding: 24px 16px;
    h1 {
        margin: 0 0 6px;
        letter-spacing: 0.2px;
    }
    .muted {
        color: ${muted};
    }
`;

Styled.SiteFooter = styled.footer`
    max-width: ${maxw};
    margin: 0 auto;
    padding: 24px 16px;
    small a {
        color: #fff;
        text-decoration: none;
        &:hover {
            text-decoration: underline;
        }
    }
`;

Styled.Container = styled.main`
    max-width: ${maxw};
    margin: 0 auto 36px;
    padding: 0 16px 24px;
`;

Styled.Layout = styled.div`
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 24px;
    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

Styled.Col = styled.div`
    display: grid;
    gap: 24px;
`;

Styled.Card = styled.section`
    background: linear-gradient(180deg, #131313, #0f0f0f);
    border: 1px solid ${border};
    border-radius: ${radius};
    box-shadow: ${shadow};
    padding: 24px;
    margin-bottom: 24px;

    &.sticky {
        position: sticky;
        top: 18px;
        @media (max-width: 1024px) {
            position: static;
        }
    }

    .presetsWrapper {
        margin-top: 20px;
        .presets {
            margin-top: 15px;
        }
    }
`;

Styled.CardHeader = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 16px;
`;

Styled.CardTitle = styled.h2`
    margin: 0 0 16px;
`;

Styled.Grid = styled.div`
    display: grid;
    gap: 16px;

    &.g-3 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    @media (max-width: 960px) {
        &.g-3 {
            grid-template-columns: 1fr 1fr;
        }
    }
    @media (max-width: 640px) {
        &.g-3 {
            grid-template-columns: 1fr;
        }
    }
`;

Styled.Field = styled.label`
    display: grid;
    gap: 6px;
    span {
        font-size: 13px;
        color: ${muted};
    }
    input {
        height: 42px;
        padding: 0 12px;
        border-radius: 12px;
        border: 1px solid ${border};
        background: #101010;
        color: ${text};
        outline: none;
        transition: border-color 0.18s, box-shadow 0.18s;
        &:focus {
            border-color: ${accent2};
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
        }
    }
`;

Styled.Chips = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`;

Styled.Chip = styled.button`
    padding: 6px 12px;
    border: 1px solid ${border};
    border-radius: 20px;
    font-size: 13px;
    color: ${muted};
    background: #0e0e0e;
    cursor: pointer;
    user-select: none;
    transition: border-color 0.18s, color 0.18s, transform 0.05s;
    &:hover {
        border-color: ${accent};
        color: #d9ffe9;
    }
    &:active {
        transform: translateY(1px);
    }
`;

Styled.QrWrap = styled.div`
    display: grid;
    place-items: center;
    padding: 16px;
`;

Styled.QrCanvas = styled.canvas`
    width: 420px;
    height: 420px;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
`;

Styled.Summary = styled.div`
    margin-top: 16px;
    display: grid;
    gap: 16px;
    background: #0f0f0f;
    border: 1px dashed ${border};
    border-radius: 12px;
    padding: 16px;
    .muted {
        color: ${muted};
    }
`;

Styled.Code = styled.code`
    display: block;
    width: 100%;
    border: 1px solid ${border};
    border-radius: 10px;
    background: #0a0a0a;
    padding: 10px;
    word-break: break-all;
    cursor: pointer;
`;

Styled.Actions = styled.div`
    margin-top: 16px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
`;

Styled.Button = styled.button`
    height: 42px;
    padding: 0 16px;
    border-radius: 10px;
    border: 1px solid ${border};
    background: ${(p) =>
        p.$variant === "danger"
            ? "linear-gradient(180deg, #2a1111, #200f0f)"
            : p.$variant === "secondary"
            ? "linear-gradient(180deg, #1a1a1a, #141414)"
            : "linear-gradient(180deg, #1a1a1a, #141414)"};
    color: ${text};
    cursor: pointer;
    transition: border-color 0.18s, transform 0.05s;
    &:hover {
        border-color: ${(p) => (p.$variant === "danger" ? danger : accent)};
    }
    &:active {
        transform: translateY(1px);
    }
`;

Styled.Toast = styled.div`
    position: fixed;
    bottom: 18px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(20, 20, 20, 0.95);
    color: #eaeaea;
    border: 1px solid #2a2a2a;
    padding: 10px 14px;
    border-radius: 10px;
    z-index: 9999;
    font: 14px system-ui;
`;

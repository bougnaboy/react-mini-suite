import styled from "styled-components";

const bg = "var(--bg, #0b0b0b)";
const card = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,.25))";
const maxw = "var(--maxw, 1200px)";

const space2 = "10px";
const space3 = "16px";
const space4 = "24px";
const space5 = "32px";
const space6 = "48px";

const Wrapper = styled.main`
    color: ${text};
    background: ${bg};
`;

const Hero = styled.section`
    display: grid;
    place-items: center;
    min-height: 46vh;
    padding: ${space6} ${space4};

    .content {
        width: 100%;
        max-width: ${maxw};
        text-align: center;
        margin: 0 auto;
        padding: ${space5};
        background: linear-gradient(
            180deg,
            rgba(34, 197, 94, 0.08),
            transparent 60%
        );
        border: 1px solid ${border};
        border-radius: ${radius};
    }

    .eyebrow {
        color: ${muted};
        letter-spacing: 0.12em;
        text-transform: uppercase;
        font-size: 12px;
        margin-bottom: ${space2};
    }

    h1 {
        font-size: clamp(28px, 5vw, 42px);
        line-height: 1.1;
        margin: 0 0 ${space3};
    }

    .tagline {
        color: ${muted};
        margin-bottom: ${space5};
        max-width: 720px;
        margin-inline: auto;
    }
`;

const Actions = styled.div`
    display: flex;
    gap: ${space3};
    justify-content: center;

    .btn {
        padding: 10px 16px;
        border-radius: 999px;
        border: 1px solid ${border};
        text-decoration: none;
        font-weight: 600;
        box-shadow: ${shadow};
    }

    .primary {
        background: ${accent};
        color: #08140d;
    }

    .ghost {
        background: transparent;
        color: ${text};
    }

    .btn:active {
        transform: translateY(1px);
    }
`;

const Section = styled.section`
    max-width: ${maxw};
    margin: 0 auto;
    padding: ${space6} ${space4};

    h2 {
        font-size: clamp(20px, 3.4vw, 28px);
        margin: 0 0 ${space3};
    }

    .sub {
        color: ${muted};
        margin-bottom: ${space5};
    }

    .note {
        color: ${muted};
        margin-top: ${space3};
        font-size: 14px;
    }
`;

const Grid = styled.div`
    --cols: ${(p) => p.cols || 3};
    display: grid;
    grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
    gap: ${space4};

    @media (max-width: 920px) {
        grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: 560px) {
        grid-template-columns: 1fr;
    }
`;

const Card = styled.article`
    background: ${card};
    border: 1px solid ${border};
    border-radius: ${radius};
    padding: ${space4};
    box-shadow: ${shadow};

    .icon {
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        border-radius: 10px;
        background: rgba(34, 197, 94, 0.12);
        color: ${accent};
        margin-bottom: ${space3};
        font-size: 20px;
    }

    h3 {
        margin: 0 0 ${space2};
        font-size: 18px;
    }

    p {
        color: ${muted};
    }
`;

const Chips = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: ${space3};
    padding: 0;
    margin: ${space4} 0 ${space2};
    list-style: none;

    li {
        border: 1px solid ${border};
        background: ${card};
        padding: 8px 12px;
        border-radius: 999px;
        color: ${text};
    }
`;

const Contact = styled.div`
    border: 1px solid ${border};
    background: ${card};
    border-radius: ${radius};
    padding: ${space4};
    max-width: 520px;

    .row {
        display: flex;
        align-items: center;
        gap: ${space3};
        margin-bottom: ${space2};
    }

    a {
        color: ${text};
        text-decoration: none;
    }
    .tiny {
        color: ${muted};
        margin-top: ${space3};
        font-size: 13px;
    }
`;

export const Styled = {
    Wrapper,
    Hero,
    Actions,
    Section,
    Grid,
    Card,
    Chips,
    Contact,
};

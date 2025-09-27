import styled from "styled-components";

const card = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,0.25))";

const Wrapper = styled.div`
    max-width: 900px;
    margin: 0 auto;
    padding: 24px;
    color: ${text};
`;

const Header = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 16px;

    h2 {
        margin: 0;
        font-weight: 700;
        letter-spacing: 0.2px;
    }
    .meta {
        color: ${muted};
        font-size: 14px;
    }
`;

const Card = styled.section`
    background: ${card};
    border: 1px solid ${border};
    border-radius: ${radius};
    box-shadow: ${shadow};
    padding: 20px;

    .fact {
        font-size: 20px;
        line-height: 1.6;
        margin: 8px 0 16px;
    }
`;

const Controls = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    button {
        appearance: none;
        border: 1px solid ${border};
        background: #0e0e0e;
        color: ${text};
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 14px;
        cursor: pointer;
        transition: transform 120ms ease, border-color 120ms ease;

        &:hover {
            transform: translateY(-1px);
            border-color: ${accent};
        }
        &:active {
            transform: translateY(0);
        }

        &.fav {
            min-width: 44px;
            text-align: center;
            font-size: 18px;
        }
        &.fav.on {
            border-color: ${accent};
            box-shadow: 0 0 0 2px
                color-mix(in oklab, ${accent} 30%, transparent);
        }
    }
`;

const Favs = styled.aside`
    margin-top: 22px;
    border-top: 1px dashed ${border};
    padding-top: 16px;

    .title {
        color: ${muted};
        font-size: 13px;
        margin-bottom: 8px;
    }
    ul {
        list-style: disc;
        padding-left: 20px;
        margin: 0;
    }
    li {
        margin: 6px 0;
    }
`;

export const Styled = { Wrapper, Header, Card, Controls, Favs };

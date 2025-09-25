import styled from "styled-components";

const cardBg = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";

const Wrapper = styled.div`
    color: ${text};
    padding: var(--space-5, 32px) var(--space-4, 24px);
`;

const HeaderBar = styled.div`
    display: flex;
    gap: 12px;
    align-items: baseline;
    margin-bottom: var(--space-4, 24px);

    h1 {
        font-size: clamp(18px, 2vw, 24px);
        font-weight: 700;
        letter-spacing: 0.2px;
    }
    .muted {
        color: ${muted};
        font-size: 12px;
    }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: var(--space-4, 24px);

    @media (max-width: 960px) {
        grid-template-columns: 1fr;
    }
`;

const Panel = styled.section`
    background: ${cardBg};
    border: 1px solid ${border};
    border-radius: ${radius};
    box-shadow: var(--shadow, 0 8px 30px rgba(0, 0, 0, 0.25));
    padding: var(--space-4, 24px);
`;

const Form = styled.form`
    display: grid;
    gap: var(--space-3, 16px);

    input[type="text"],
    input[type="color"],
    input[type="file"],
    select {
        width: 100%;
        background: #0f0f0f;
        color: ${text};
        border: 1px solid ${border};
        border-radius: 12px;
        padding: 10px 12px;
        outline: none;
    }
    input:focus,
    select:focus {
        border-color: ${accent};
        box-shadow: 0 0 0 3px color-mix(in srgb, ${accent} 30%, transparent);
    }
    label {
        color: ${muted};
        font-size: 12.5px;
    }
`;

const FieldRow = styled.div`
    display: grid;
    gap: 8px;
`;
const Row = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
`;

const SliderRow = styled.div`
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px;
    align-items: center;

    input[type="range"] {
        accent-color: ${accent};
    }
    span {
        color: ${muted};
        font-size: 12px;
    }
`;

const CheckRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    label {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    input[type="checkbox"] {
        accent-color: ${accent};
    }
`;

const CanvasBox = styled.div`
    display: grid;
    place-items: center;
    padding: 12px;
    border: 1px dashed ${border};
    border-radius: ${radius};
    background: #0f0f0f;

    canvas {
        /* border: 1px solid #f00; */
        width: min(420px, 80vw);
        height: auto;
    }
`;

const Actions = styled.div`
    margin-top: var(--space-3, 16px);
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`;

const Btn = styled.button`
    border-radius: 12px;
    padding: 10px 14px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid ${border};
    background: #161616;
    color: ${text};

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;
const PrimaryBtn = styled(Btn)`
    border-color: ${accent};
    background: color-mix(in srgb, ${accent} 16%, #161616);
`;
const SecondaryBtn = styled(Btn)``;
const GhostBtn = styled(Btn)`
    background: transparent;
`;

const TinyNote = styled.p`
    margin-top: 8px;
    color: ${muted};
    font-size: 12px;
`;

export const Styled = {
    Wrapper,
    HeaderBar,
    Grid,
    Panel,
    Form,
    FieldRow,
    Row,
    SliderRow,
    CheckRow,
    CanvasBox,
    Actions,
    PrimaryBtn,
    SecondaryBtn,
    GhostBtn,
    TinyNote,
};

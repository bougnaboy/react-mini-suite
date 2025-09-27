import styled from "styled-components";

const cardBg = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,0.25))";
const maxw = "var(--maxw, 1080px)";

const Wrapper = styled.div`
    max-width: ${maxw};
    margin: 0 auto;
    padding: 24px;
    color: ${text};
`;

const Header = styled.header`
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-end;

    .title {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    h2 {
        margin: 0;
        font-weight: 700;
        letter-spacing: 0.2px;
    }
`;

const Subtle = styled.div`
    color: ${muted};
    font-size: 0.95rem;
`;

const Toolbar = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
`;

const Flash = styled.div`
    background: #0f0f0f;
    border: 1px solid ${border};
    color: ${muted};
    border-radius: 10px;
    padding: 8px 12px;
    margin-bottom: 10px;
`;

const Card = styled.section`
    background: ${cardBg};
    border: 1px solid ${border};
    border-radius: ${radius};
    box-shadow: ${shadow};
    padding: 16px;
    margin-bottom: 16px;
`;

const Row = styled.div`
    display: grid;
    grid-template-columns: 1fr 180px 56px 180px;
    gap: 10px;
    align-items: end;

    .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    label {
        color: ${muted};
        font-size: 0.9rem;
    }

    @media (max-width: 720px) {
        grid-template-columns: 1fr 1fr;
        & > button {
            order: 3;
            width: 100%;
        }
    }
`;

const Input = styled.input`
    background: transparent;
    color: ${text};
    border: 1px solid ${border};
    border-radius: 10px;
    padding: 10px 12px;
    outline: none;
    font-size: 1.05rem;
    &:focus {
        border-color: ${accent};
    }
`;

const Select = styled.select`
    background: transparent;
    color: ${text};
    border: 1px solid ${border};
    border-radius: 10px;
    padding: 10px 12px;
    outline: none;
    font-size: 1.05rem;

    option {
        color: #111;
        background: #fff;
    }
`;

const Button = styled.button`
    height: 42px;
    align-self: end;
    background: ${accent};
    color: #0b0b0b;
    border: 1px solid ${border};
    border-radius: 10px;
    padding: 0 12px;
    cursor: pointer;
    font-weight: 600;

    &[disabled] {
        opacity: 0.7;
        cursor: not-allowed;
    }

    &[data-variant="ghost"] {
        background: transparent;
        color: ${text};
        border-color: ${border};
    }

    &:active {
        transform: translateY(1px);
    }
`;

const ResultRow = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed ${border};

    .result {
        font-size: 1.1rem;
    }
    .pair {
        margin-top: 4px;
        color: ${muted};
        font-size: 0.95rem;
    }
`;

const Copied = styled.span`
    margin-left: 10px;
    font-size: 0.92rem;
    color: ${muted};
`;

const Chips = styled.div`
    margin-top: 12px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    button {
        background: transparent;
        color: ${text};
        border: 1px dashed ${border};
        border-radius: 999px;
        padding: 6px 10px;
        cursor: pointer;
        font-size: 0.95rem;

        &:hover {
            border-style: solid;
            border-color: ${accent};
        }
    }
`;

const EditHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
        margin: 0;
        font-size: 1.05rem;
    }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;

    th,
    td {
        text-align: left;
        border-bottom: 1px solid ${border};
        padding: 10px 6px;
    }

    th {
        color: ${muted};
        font-weight: 600;
    }
`;

const RateInput = styled(Input)`
    width: 180px;
`;

const FooterRow = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    margin-top: 12px;

    code {
        background: #0f0f0f;
        border: 1px solid ${border};
        padding: 2px 6px;
        border-radius: 6px;
        margin: 0 4px;
    }
`;

const Small = styled.div`
    color: ${muted};
    font-size: 0.92rem;
`;

export const Styled = {
    Wrapper,
    Header,
    Subtle,
    Toolbar,
    Flash,
    Card,
    Row,
    Input,
    Select,
    Button,
    ResultRow,
    Copied,
    Chips,
    EditHeader,
    Table,
    RateInput,
    FooterRow,
    Small,
};

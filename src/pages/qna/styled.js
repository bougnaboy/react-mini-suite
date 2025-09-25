import styled from "styled-components";

const Wrapper = styled.div`
    max-width: 1440px;
    margin: auto;
    padding: 0 15px;
`;

const Heading = styled.h1`
    margin-bottom: 30px;
`;

const TopicsWrapper = styled.div`
    position: relative;
    z-index: 99;

    select {
        width: 100%;
        height: 40px;
        outline: none;

        option {
            width: 100%;
        }
    }
`;

const ContentWrapper = styled.div`
    padding: 15px;
`;

/* ===== QnA additions ===== */

const Section = styled.section`
    padding: 12px 0;
    border-bottom: 1px dashed var(--borderMuted, #2a2a2a);

    &:last-child {
        border-bottom: 0;
    }
`;

const SectionTitle = styled.h2`
    font-size: 18px;
    font-weight: 700;
    margin: 6px 0 12px;
    opacity: 0.9;
`;

const List = styled.ul`
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    margin: 0;
    padding: 0;

    @media (min-width: 900px) {
        grid-template-columns: 1fr 1fr;
    }
`;

const QCard = styled.li`
    list-style: none;
    padding: 14px;
    border: 1px solid var(--border, #2a2a2a);
    border-radius: 12px;
    background: var(--card, #0e0e0e);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.02) inset;

    display: grid;
    grid-template-rows: auto auto auto auto;
    gap: 8px;
`;

const QTitle = styled.h3`
    font-size: 16px;
    font-weight: 700;
    line-height: 1.35;
    margin: 0;
`;

const Answer = styled.p`
    margin: 0;
    color: var(--textMuted, #c9c9c9);
    line-height: 1.55;
`;

const Code = styled.pre`
    margin: 0;
    padding: 10px 12px;
    border-radius: 10px;
    background: #0a0a0a;
    border: 1px solid #222;
    overflow-x: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Courier New",
        monospace;
    font-size: 12.5px;
    line-height: 1.5;

    code {
        white-space: pre;
    }
`;

const MetaRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
`;

const Tag = styled.span`
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
`;

const Badge = styled.span`
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.04);
    text-transform: uppercase;
    letter-spacing: 0.3px;
`;

const NoteLink = styled.a`
    font-size: 12px;
    color: var(--link, #8ab4ff);
    text-decoration: none;
    border-bottom: 1px dashed transparent;

    &:hover {
        border-color: currentColor;
    }
`;

export const Styled = {
    Wrapper,
    Heading,
    TopicsWrapper,
    ContentWrapper,

    // QnA UI
    Section,
    SectionTitle,
    List,
    QCard,
    QTitle,
    Answer,
    Code,
    MetaRow,
    Tag,
    Badge,
    NoteLink,
};

import styled from "styled-components";

const cardBg = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,0.25))";

const focusRing = `
  outline: 2px solid ${accent};
  outline-offset: 2px;
`;

const baseButton = `
  display:inline-flex; align-items:center; justify-content:center;
  height:38px; padding:0 14px; border-radius:14px;
  border:1px solid ${border}; background:#151515; color:${text};
  cursor:pointer; transition:transform .04s ease, background .2s ease, border-color .2s ease;
  &:hover{ transform: translateY(-1px); }
  &:active{ transform: translateY(0); }
  &:focus-visible{ ${focusRing} }
`;

export const Styled = {
    Wrapper: styled.div`
        max-width: 980px;
        margin: 0 auto;
        padding: 24px;
        color: ${text};
    `,

    Header: styled.header`
        margin-bottom: 16px;
        .row {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: wrap;
        }
        h2 {
            margin: 0;
            font-size: 22px;
        }
        .date {
            color: ${muted};
            font-size: 14px;
        }
        .muted {
            color: ${muted};
            font-size: 14px;
            margin-top: 6px;
        }
    `,

    Toolbar: styled.form`
        display: flex;
        gap: 10px;
        margin: 12px 0 24px;
        input {
            flex: 1;
            height: 42px;
            border-radius: ${radius};
            border: 1px solid ${border};
            background: ${cardBg};
            color: ${text};
            padding: 0 12px;
        }
        input::placeholder {
            color: ${muted};
        }
    `,

    Button: styled.button`
        ${baseButton}
        ${({ $tone }) =>
            $tone === "accent"
                ? `
      background: ${accent};
      color: #0b0b0b;
      border-color: ${accent};
    `
                : `
      background: #1a1a1a;
    `}
    `,

    IconButton: styled.button`
        ${baseButton}
        width:38px;
        padding: 0;
        font-size: 16px;
        line-height: 1;
    `,

    TrackList: styled.div`
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
    `,

    Card: styled.section`
        background: ${cardBg};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 14px;
    `,

    CardTop: styled.div`
        display: flex;
        gap: 10px;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        .name {
            flex: 1;
            height: 38px;
            border-radius: 12px;
            border: 1px solid ${border};
            background: #151515;
            color: ${text};
            padding: 0 10px;
        }
    `,

    Actions: styled.div`
        display: flex;
        gap: 8px;
        align-items: center;
    `,

    Stats: styled.div`
        display: flex;
        gap: 10px;
        margin: 8px 0 12px;
    `,

    Stat: styled.div`
        flex: 0 0 auto;
        min-width: 90px;
        background: #141414;
        border: 1px solid ${border};
        border-radius: 12px;
        padding: 8px 10px;
        .label {
            color: ${muted};
            font-size: 12px;
        }
        .value {
            display: block;
            font-size: 18px;
            margin-top: 4px;
        }
    `,

    Heatmap: styled.div`
        display: grid;
        grid-template-columns: repeat(8, 12px);
        gap: 4px;
        align-content: start;
        margin-bottom: 8px;
        padding-top: 4px;
    `,

    Cell: styled.span`
        width: 12px;
        height: 12px;
        border-radius: 3px;
        border: 1px solid ${border};
        background: ${({ $on }) => ($on ? accent : "#1a1a1a")};
    `,

    Legend: styled.div`
        display: flex;
        align-items: center;
        gap: 8px;
        .dot {
            width: 10px;
            height: 10px;
            border-radius: 3px;
            display: inline-block;
            border: 1px solid ${border};
        }
        .on {
            background: ${accent};
        }
        .off {
            background: #1a1a1a;
        }
        .spacer {
            flex: 1;
        }
        .muted {
            color: ${muted};
            font-size: 12px;
        }
    `,

    Empty: styled.div`
        grid-column: 1 / -1;
        text-align: center;
        padding: 28px 10px;
        border: 1px dashed ${border};
        border-radius: ${radius};
        .muted {
            color: ${muted};
        }
    `,
};

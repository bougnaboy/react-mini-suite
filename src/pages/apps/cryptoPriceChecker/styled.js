import styled from "styled-components";

const card = "var(--card, #111)";
const text = "var(--text, #e9e9e9)";
const muted = "var(--muted, #b7b7b7)";
const border = "var(--border, #222)";
const accent = "var(--accent, #22c55e)";
const danger = "var(--danger, #ef4444)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 8px 30px rgba(0,0,0,0.25))";

export const Styled = {
    Wrapper: styled.section`
        color: ${text};
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 20px;
        max-width: 980px;
        margin: 0 auto;
    `,

    Header: styled.header`
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-end;
        margin-bottom: 16px;

        .title h2 {
            margin: 0 0 4px;
            font-weight: 700;
            letter-spacing: 0.3px;
        }
        .title .sub {
            margin: 0;
            color: ${muted};
            font-size: 14px;
        }
    `,

    Controls: styled.div`
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;

        label {
            display: flex;
            flex-direction: column;
            gap: 6px;
            font-size: 12px;
            color: ${muted};
        }
        select,
        input {
            background: #0c0c0c;
            color: ${text};
            border: 1px solid ${border};
            border-radius: 10px;
            padding: 8px 10px;
            min-width: 140px;
            outline: none;
        }
        input {
            min-width: 220px;
        }

        button {
            background: ${accent};
            color: #07110a;
            border: none;
            border-radius: 12px;
            padding: 10px 14px;
            font-weight: 700;
            cursor: pointer;
            transition: transform 120ms ease;
        }
        button:disabled {
            opacity: 0.7;
            cursor: default;
        }
        button:not(:disabled):active {
            transform: translateY(1px);
        }
    `,

    Table: styled.div`
        display: grid;
        border: 1px solid ${border};
        border-radius: 12px;
        overflow: hidden;
    `,

    Head: styled.div`
        display: grid;
        grid-template-columns: 1fr 180px 120px;
        gap: 0;
        background: #0e0e0e;
        color: ${muted};
        padding: 10px 14px;
        border-bottom: 1px solid ${border};
        font-size: 13px;

        span:nth-child(2),
        span:nth-child(3) {
            text-align: right;
        }
    `,

    Row: styled.div`
        display: grid;
        grid-template-columns: 1fr 180px 120px;
        padding: 14px;
        border-bottom: 1px solid ${border};
        align-items: center;

        &:last-child {
            border-bottom: none;
        }

        &.muted {
            color: ${muted};
        }
        &.error {
            color: ${danger};
        }

        .coin {
            display: inline-flex;
            align-items: baseline;
            gap: 10px;
        }
        .price {
            text-align: right;
            font-variant-numeric: tabular-nums;
        }
    `,

    Ticker: styled.span`
        color: ${muted};
        font-size: 12px;
        letter-spacing: 0.5px;
        border: 1px dashed ${border};
        border-radius: 10px;
        padding: 2px 8px;
    `,

    // transient prop $up avoids passing "up" to the DOM (prevents console warnings)
    Change: styled.span`
        text-align: right;
        font-variant-numeric: tabular-nums;
        color: ${({ $up }) =>
            $up == null ? "inherit" : $up ? accent : danger};
        font-weight: 700;
    `,

    StatusBar: styled.footer`
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        color: ${muted};
        font-size: 12px;
        padding-top: 12px;
    `,
};

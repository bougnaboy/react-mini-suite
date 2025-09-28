import styled from "styled-components";

const card = "var(--card, #0f1012)";
const text = "var(--text, #eaeaea)";
const muted = "var(--muted, #a8a8a8)";
const border = "var(--border, #242424)";
const accent = "var(--accent, #22c55e)";
const radius = "var(--radius, 16px)";
const shadow = "var(--shadow, 0 10px 30px rgba(0,0,0,0.35))";

export const Styled = {
    Wrapper: styled.div`
        display: grid;
        gap: 16px;
        color: ${text};
        padding: 15px;
        margin: auto;
        max-width: 1440px;
    `,
    Header: styled.header`
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 12px;
        align-items: center;
        padding: 12px 14px;
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};

        .title {
            font-size: 20px;
            font-weight: 600;
            letter-spacing: 0.2px;
        }
        .row {
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
            justify-content: flex-end;
        }

        .fileBtn {
            position: relative;
            overflow: hidden;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 8px 12px;
            border: 1px solid ${border};
            border-radius: 10px;
            background: #111;
            cursor: pointer;
            font-size: 14px;
            color: ${text};
        }
        .fileBtn input {
            position: absolute;
            inset: 0;
            opacity: 0;
            cursor: pointer;
        }

        button {
            padding: 8px 12px;
            border: 1px solid ${border};
            border-radius: 10px;
            background: #141414;
            color: ${text};
            font-size: 14px;
            cursor: pointer;
        }
        button:hover {
            border-color: ${accent};
        }
        button:active {
            transform: translateY(1px);
        }
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    `,
    Body: styled.div`
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 16px;
        @media (max-width: 1100px) {
            grid-template-columns: 1fr;
        }
    `,
    Left: styled.section`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 12px;
        min-height: 280px;
    `,
    Right: styled.section`
        display: grid;
        gap: 12px;
    `,
    NowPlaying: styled.div`
        display: grid;
        gap: 10px;

        .meta {
            display: grid;
            grid-template-columns: 56px 1fr;
            gap: 12px;
            align-items: center;
        }
        .art {
            width: 56px;
            height: 56px;
            border-radius: 10px;
            background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.05),
                rgba(0, 0, 0, 0.25)
            );
            display: grid;
            place-items: center;
            font-size: 22px;
            border: 1px solid ${border};
        }
        .texts .title {
            font-weight: 600;
        }
        .texts .sub {
            color: ${muted};
            font-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .controls {
            display: flex;
            gap: 8px;
            align-items: center;
        }
        .controls .spacer {
            flex: 1;
        }
        .controls button {
            padding: 8px 12px;
            border-radius: 10px;
            border: 1px solid ${border};
            background: #161616;
            color: ${text};
        }
        .controls .active {
            outline: 1px solid ${accent};
            border-color: ${accent};
        }

        .seek {
            display: grid;
            grid-template-columns: 48px 1fr 48px;
            gap: 8px;
            align-items: center;
        }
        .seek input[type="range"] {
            width: 100%;
        }
        .time {
            color: ${muted};
            font-size: 12px;
        }

        .volume {
            display: grid;
            grid-template-columns: 36px 1fr;
            gap: 8px;
            align-items: center;
        }
        .volume input[type="range"] {
            width: 100%;
        }
    `,
    Playlist: styled.ul`
        list-style: none;
        margin: 0;
        padding: 0;
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        min-height: 220px;

        .empty {
            padding: 14px;
            color: ${muted};
            font-size: 14px;
        }

        li {
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: center;
            gap: 8px;
            padding: 8px 10px;
            border-top: 1px solid ${border};
        }
        li:first-child {
            border-top: 0;
        }
        li.active {
            background: rgba(255, 255, 255, 0.03);
        }

        .title {
            text-align: left;
            background: transparent;
            border: 0;
            color: ${text};
            cursor: pointer;
            padding: 4px 0;
        }
        .title .idx {
            color: ${muted};
            margin-right: 6px;
        }

        .ops {
            display: flex;
            gap: 6px;
        }
        .ops button {
            padding: 6px 8px;
            border-radius: 8px;
            border: 1px solid ${border};
            background: #161616;
            color: ${text};
            font-size: 13px;
        }
    `,
    Tips: styled.div`
        color: ${muted};
        font-size: 12px;
        display: grid;
        gap: 4px;
    `,
    ModalBackdrop: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `,
    ModalCard: styled.div`
        width: min(420px, 92vw);
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;

        .title {
            font-weight: 600;
            margin-bottom: 6px;
            color: ${text};
        }
        .msg {
            color: ${muted};
            font-size: 14px;
            margin-bottom: 12px;
        }
        .row {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }

        button {
            padding: 8px 12px;
            border: 1px solid ${border};
            border-radius: 10px;
            background: #141414;
            color: ${text};
            cursor: pointer;
            font-size: 14px;
        }
        button:hover {
            border-color: ${accent};
        }
        .ghost {
            background: transparent;
        }
        .danger {
            background: #1b1010;
            border-color: #ef4444;
        }
    `,
};

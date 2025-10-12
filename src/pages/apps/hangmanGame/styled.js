import styled from "styled-components";

/* theme tokens */
const bg = "var(--bg)";
const card = "var(--card)";
const text = "var(--text)";
const muted = "var(--muted)";
const border = "var(--border)";
const radius = "var(--radius)";
const shadow = "var(--shadow)";
const accent = "var(--accent)";
const danger = "var(--danger, #e5484d)";

export const Styled = {
    Wrapper: styled.div`
        color: ${text};
        background: ${bg};
        min-height: 100%;
        padding: 16px;
        max-width: 1440px;
        margin: 0 auto;
        display: grid;
        gap: 16px;
    `,

    Banner: styled.div`
        border: 1px solid ${border};
        background: ${card};
        box-shadow: ${shadow};
        border-radius: ${radius};
        padding: 10px 12px;
        font-size: 14px;
    `,

    Header: styled.header`
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 12px;
        align-items: end;

        .titles h1 {
            margin: 0 0 6px 0;
            font-size: 20px;
        }
        .titles p {
            margin: 0;
            color: ${muted};
            font-size: 14px;
        }

        .controls {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
        }

        /* base pill for labels */
        label {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 4px 8px;
            border: 1px solid ${border};
            border-radius: 999px;
            background: ${card};
            color: ${text};
        }

        /* Difficulty pill — styled select + options for dark theme */
        label.difficulty {
            padding: 2px;
            gap: 0;
        }
        label.difficulty span {
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 13px;
        }
        label.difficulty select {
            border: none;
            background: transparent;
            color: ${text};
            font: inherit;
            padding: 6px 10px;
            border-left: 1px solid ${border};
            border-top-right-radius: 999px;
            border-bottom-right-radius: 999px;
            outline: none;
            appearance: none;

            /* 🔥 force dark popup on Chromium */
            color-scheme: dark;
            /* fallback: ensure the dropdown surface inherits theme */
            background-color: ${card};
        }
        /* Options inside the dropdown (works on Chrome/Firefox/Edge) */
        label.difficulty select option,
        label.difficulty select optgroup {
            background: ${card};
            color: ${text};
        }

        /* custom caret */
        label.difficulty select {
            background-image: linear-gradient(
                    45deg,
                    transparent 50%,
                    ${text} 50%
                ),
                linear-gradient(135deg, ${text} 50%, transparent 50%);
            background-position: calc(100% - 14px) 50%, calc(100% - 10px) 50%;
            background-size: 4px 4px, 4px 4px;
            background-repeat: no-repeat;
            padding-right: 28px;
        }
        label.difficulty:focus-within {
            border-color: ${accent};
            box-shadow: 0 0 0 2px
                color-mix(in oklab, ${accent} 25%, transparent);
        }

        .switch input {
            accent-color: ${accent};
        }

        button {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            border-radius: ${radius};
            padding: 8px 12px;
            cursor: pointer;
            transition: border-color 0.15s ease, transform 0.02s ease-in-out;
        }
        button:hover {
            border-color: ${accent};
        }
        button:active {
            transform: translateY(1px);
        }
        .ghost {
            background: ${bg};
        }
    `,

    Layout: styled.div`
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 16px;
        @media (max-width: 1100px) {
            grid-template-columns: 1fr;
        }
    `,

    Column: styled.div`
        display: grid;
        gap: 16px;
    `,

    Side: styled.aside`
        display: grid;
        gap: 16px;
    `,

    Card: styled.div`
        background: ${card};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
        padding: 16px;

        h3 {
            margin: 0 0 10px 0;
            font-size: 16px;
        }
        .muted {
            color: ${muted};
        }
        .danger {
            border-color: ${danger};
            color: ${danger};
        }

        /* 🔧 Custom Words form styling */
        .add-form {
            display: grid;
            gap: 10px;
        }
        .add-form .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        @media (max-width: 520px) {
            .add-form .grid {
                grid-template-columns: 1fr;
            }
        }
        .add-form label {
            display: inline-block;
            margin: 0 0 6px 0;
            font-size: 13px;
            color: ${text};
        }
        .add-form input[type="text"] {
            width: 100%;
            border: 1px solid ${border};
            background: ${bg}; /* dark-friendly */
            color: ${text};
            border-radius: calc(${radius} - 2px);
            padding: 10px 12px;
            font: inherit;
            outline: none;
            transition: border-color 0.15s ease;
            color-scheme: dark; /* force dark native UI where supported */
        }
        .add-form input[type="text"]::placeholder {
            color: ${muted};
            opacity: 0.8;
        }
        .add-form input[type="text"]:focus {
            border-color: ${accent};
            /* optional subtle ring */
            box-shadow: 0 0 0 2px
                color-mix(in oklab, ${accent} 20%, transparent);
        }
        .add-form .help {
            font-size: 12px;
            color: ${muted};
        }
        .add-form .error {
            font-size: 12px;
            color: ${danger};
        }
    `,

    TopRow: styled.div`
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 10px;
        align-items: center;
        margin-bottom: 8px;

        .category .label {
            color: ${muted};
            font-size: 12px;
        }
        .category .value {
            font-weight: 600;
            margin-left: 6px;
        }

        .status {
            font-size: 14px;
        }
        .status.won {
            color: var(--success, #2e7d32);
        }
        .status.lost {
            color: ${danger};
        }

        .lives {
            font-size: 14px;
        }
    `,

    Gallows: styled.div`
        position: relative;
        height: 220px;
        border: 1px dashed ${border};
        border-radius: ${radius};
        margin: 8px 0 12px 0;
        background: var(--panel, transparent);

        .post.base {
            position: absolute;
            left: 20px;
            right: 20px;
            bottom: 12px;
            height: 6px;
            background: ${text};
            opacity: 0.25;
            border-radius: 3px;
        }
        .post.pole {
            position: absolute;
            left: 40px;
            bottom: 18px;
            width: 6px;
            top: 20px;
            background: ${text};
            opacity: 0.25;
            border-radius: 3px;
        }
        .post.beam {
            position: absolute;
            left: 40px;
            top: 20px;
            right: 140px;
            height: 6px;
            background: ${text};
            opacity: 0.25;
            border-radius: 3px;
        }
        .post.rope {
            position: absolute;
            right: 140px;
            top: 26px;
            width: 2px;
            height: 26px;
            background: ${text};
            opacity: 0.8;
        }

        .man.head {
            position: absolute;
            right: 124px;
            top: 50px;
            width: 32px;
            height: 32px;
            border: 3px solid ${text};
            border-radius: 50%;
        }
        .man.body {
            position: absolute;
            right: 139px;
            top: 82px;
            width: 2px;
            height: 54px;
            background: ${text};
        }
        .man.arm.left {
            position: absolute;
            right: 139px;
            top: 92px;
            width: 40px;
            height: 2px;
            background: ${text};
            transform-origin: right center;
            transform: rotate(30deg);
        }
        .man.arm.right {
            position: absolute;
            right: 100px;
            top: 92px;
            width: 40px;
            height: 2px;
            background: ${text};
            transform-origin: left center;
            transform: rotate(-30deg);
        }
        .man.leg.left {
            position: absolute;
            right: 139px;
            top: 134px;
            width: 40px;
            height: 2px;
            background: ${text};
            transform-origin: right center;
            transform: rotate(40deg);
        }
        .man.leg.right {
            position: absolute;
            right: 101px;
            top: 134px;
            width: 40px;
            height: 2px;
            background: ${text};
            transform-origin: left center;
            transform: rotate(-40deg);
        }
    `,

    Word: styled.div`
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", monospace;
        letter-spacing: 6px;
        font-size: 28px;
        text-align: center;
        padding: 8px 0;
        user-select: none;
    `,

    Keyboard: styled.div`
        display: grid;
        gap: 6px;

        .row {
            display: flex;
            gap: 6px;
            justify-content: center;
            flex-wrap: nowrap;
        }
        .key {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            border-radius: 8px;
            padding: 10px 12px;
            min-width: 36px;
            text-align: center;
            cursor: pointer;
            font: inherit;
            user-select: none;
            transition: border-color 0.15s ease, transform 0.02s ease-in-out,
                background 0.15s ease;
        }
        .key:hover {
            border-color: ${accent};
        }
        .key:active {
            transform: translateY(1px);
        }
        .key.used {
            background: var(--surface, ${bg});
            opacity: 0.9;
        }
        .key.wrong {
            border-color: ${danger};
            color: ${danger};
        }
    `,

    Actions: styled.div`
        margin-top: 12px;
        display: flex;
        gap: 10px;
        align-items: center;

        .spacer {
            flex: 1;
        }

        button {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            border-radius: ${radius};
            padding: 8px 12px;
            cursor: pointer;
            font: inherit;
            transition: border-color 0.15s ease, transform 0.02s ease-in-out;
        }
        button:hover {
            border-color: ${accent};
        }
        button:active {
            transform: translateY(1px);
        }
        .ghost {
            background: ${bg};
        }
        .danger {
            border-color: ${danger};
            color: ${danger};
        }
    `,

    BadRow: styled.div`
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        .wrong {
            border: 1px solid ${danger};
            color: ${danger};
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 13px;
        }
    `,

    Stats: styled.div`
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;

        .label {
            color: ${muted};
            font-size: 12px;
        }
        .value {
            font-weight: 700;
        }
        div {
            padding: 8px;
            border: 1px solid ${border};
            border-radius: 10px;
            background: ${bg};
        }
    `,

    List: styled.div`
        display: grid;
        gap: 10px;

        .row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            border: 1px solid ${border};
            border-radius: ${radius};
            background: ${bg};
            padding: 8px 10px;
        }
        .meta .word {
            font-weight: 700;
        }
        .meta .cat {
            color: ${muted};
            font-size: 12px;
        }
        .tools button {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            border-radius: 8px;
            padding: 6px 10px;
            cursor: pointer;
        }
        .tools .danger {
            border-color: ${danger};
            color: ${danger};
        }
    `,

    Overlay: styled.div`
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: grid;
        place-items: center;
        z-index: 60;
    `,

    Modal: styled.div`
        width: min(520px, 92vw);
        background: ${card};
        color: ${text};
        border: 1px solid ${border};
        box-shadow: ${shadow};
        border-radius: ${radius};
        padding: 16px;

        h3 {
            margin: 0 0 8px 0;
            font-size: 18px;
        }
        p {
            margin: 0;
            color: ${muted};
        }
    `,

    ModalActions: styled.div`
        margin-top: 14px;
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        button {
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            border-radius: ${radius};
            padding: 8px 12px;
            cursor: pointer;
            font: inherit;
        }
        button:hover {
            border-color: ${accent};
        }
        .ghost {
            background: ${bg};
        }
    `,
};

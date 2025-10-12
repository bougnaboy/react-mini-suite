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
    Page: styled.div`
        color: ${text};
        background: ${bg};
        padding: 16px;
        max-width: 1440px;
        margin: 0 auto;
        display: grid;
        gap: 16px;
    `,

    Header: styled.header`
        display: grid;
        gap: 12px;
        h1 {
            margin: 0;
            font-size: 20px;
        }
        p {
            margin: 0;
            color: ${muted};
            font-size: 14px;
        }
    `,

    Controls: styled.div`
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;

        .ctrl {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: ${card};
            border: 1px solid ${border};
            border-radius: 999px;
            padding: 6px 10px;
            box-shadow: ${shadow};
        }
        .ctrl label {
            font-size: 12px;
            color: ${muted};
        }
        .ctrl input[type="range"] {
            width: 120px;
        }
        .ctrl .val {
            font-size: 12px;
            color: ${text};
        }

        .switch {
            display: inline-flex;
            gap: 8px;
            align-items: center;
            margin-left: 4px;
        }
        .switch span {
            font-size: 13px;
            color: ${muted};
        }

        .actions {
            display: inline-flex;
            gap: 8px;
            margin-left: auto;
        }
        .actions .ghost {
            background: ${bg};
            border: 1px solid ${border};
            border-radius: ${radius};
            padding: 8px 10px;
            cursor: pointer;
            font: inherit;
            color: ${text};
        }
        .actions .danger {
            border-color: ${danger};
            color: ${danger};
        }
    `,

    /* -------------------- HERO -------------------- */
    Hero: styled.section`
        position: relative;
        height: 68vh;
        border-radius: ${radius};
        overflow: hidden;
        border: 1px solid ${border};
        box-shadow: ${shadow};
        background: linear-gradient(180deg, #0e1218 0%, #0a0d14 100%);
    `,

    Layer: styled.div`
        position: absolute;
        inset: -10% -5% -10% -5%;
        will-change: transform;
        pointer-events: none;
        transition: transform 0.1s linear;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }

        /* Visible images to make motion obvious */
        &.sky {
            z-index: 1;
            background-image: url("https://images.unsplash.com/photo-1450849608889-6f787542c88a?q=80&w=1600&auto=format&fit=crop");
            filter: brightness(0.7) saturate(1.1);
        }
        &.mid {
            z-index: 2;
            background-image: url("https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1600&auto=format&fit=crop");
            mix-blend-mode: normal;
            filter: contrast(1.05) brightness(0.9);
            mask-image: linear-gradient(
                180deg,
                rgba(0, 0, 0, 1) 30%,
                rgba(0, 0, 0, 0) 95%
            );
            -webkit-mask-image: linear-gradient(
                180deg,
                rgba(0, 0, 0, 1) 30%,
                rgba(0, 0, 0, 0) 95%
            );
        }
        &.front {
            z-index: 3;
            background-image: url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1600&auto=format&fit=crop");
            filter: brightness(0.85) saturate(1.05);
            mask-image: linear-gradient(
                180deg,
                rgba(0, 0, 0, 1) 60%,
                rgba(0, 0, 0, 0) 100%
            );
            -webkit-mask-image: linear-gradient(
                180deg,
                rgba(0, 0, 0, 1) 60%,
                rgba(0, 0, 0, 0) 100%
            );
        }
    `,

    HeroContent: styled.div`
        position: relative;
        z-index: 5;
        display: grid;
        place-items: center;
        height: 100%;
        text-align: center;
        padding: 0 16px;

        h2 {
            margin: 0 0 8px 0;
            font-size: 26px;
        }
        p {
            margin: 0 0 14px 0;
            color: ${muted};
            font-size: 14px;
        }
        .cta {
            display: inline-block;
            padding: 10px 14px;
            border-radius: ${radius};
            background: ${card};
            color: ${text};
            border: 1px solid ${border};
            text-decoration: none;
        }
    `,

    /* -------------------- FIXED BACKGROUND SECTIONS -------------------- */
    ParallaxSection: styled.section`
        position: relative;
        min-height: 58vh;
        border-radius: ${radius};
        overflow: hidden;
        border: 1px solid ${border};
        box-shadow: ${shadow};
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
        /* iOS/mobile fallback */
        @media (max-width: 768px) {
            background-attachment: scroll;
        }

        .overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
                180deg,
                rgba(0, 0, 0, 0.25),
                rgba(0, 0, 0, 0.35)
            );
            color: white;
            display: grid;
            place-items: center;
            text-align: center;
            padding: 24px;
        }
        h3 {
            margin: 0 0 6px 0;
            font-size: 22px;
        }
        p {
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
        }
    `,

    /* -------------------- SCENES + FORM -------------------- */
    Section: styled.section`
        background: ${card};
        border: 1px solid ${border};
        box-shadow: ${shadow};
        border-radius: ${radius};
        padding: 16px;
        display: grid;
        gap: 16px;
    `,
    SectionHead: styled.div`
        display: grid;
        gap: 6px;
        h3 {
            margin: 0;
            font-size: 18px;
        }
        p {
            margin: 0;
            font-size: 14px;
            color: ${muted};
        }
    `,
    Form: styled.form`
        display: grid;
        gap: 12px;
        .grid {
            display: grid;
            gap: 12px;
            grid-template-columns: 2fr 3fr 1fr;
            @media (max-width: 920px) {
                grid-template-columns: 1fr;
            }
        }
        .field {
            display: grid;
            gap: 6px;
        }
        .field.invalid input {
            border-color: ${danger};
        }
        label {
            font-size: 13px;
        }
        em {
            color: ${danger};
            font-style: normal;
        }
        input[type="text"],
        input[type="url"],
        input[type="number"] {
            border: 1px solid ${border};
            border-radius: calc(${radius} - 2px);
            background: ${bg};
            color: ${text};
            padding: 10px 12px;
            font: inherit;
            outline: none;
        }
        input:focus {
            border-color: ${accent};
        }
        .error {
            min-height: 16px;
            font-size: 12px;
            color: ${danger};
        }
        .actions {
            display: flex;
            gap: 10px;
        }
        button {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 10px 14px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
        }
    `,

    /* -------------------- CARDS -------------------- */
    Cards: styled.div`
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(3, 1fr);
        @media (max-width: 1080px) {
            grid-template-columns: repeat(2, 1fr);
        }
        @media (max-width: 720px) {
            grid-template-columns: 1fr;
        }
    `,
    Card: styled.figure`
        margin: 0;
        height: 240px;
        border-radius: ${radius};
        background-size: cover;
        background-position: center;
        border: 1px solid ${border};
        box-shadow: ${shadow};
        overflow: hidden;
        position: relative;
        will-change: transform;

        .overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
                180deg,
                rgba(0, 0, 0, 0),
                rgba(0, 0, 0, 0.55)
            );
            display: grid;
            align-content: end;
            gap: 8px;
            padding: 12px;
            color: #fff;
        }
        h4 {
            margin: 0;
            font-size: 16px;
        }
        .muted {
            font-size: 12px;
            opacity: 0.9;
        }
        .cardActions {
            display: flex;
            gap: 8px;
        }

        .ghost {
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.35);
            color: #fff;
            border-radius: ${radius};
            padding: 6px 10px;
            font: inherit;
            cursor: pointer;
        }
        .small {
            font-size: 12px;
            padding: 6px 8px;
        }
        .danger {
            border-color: ${danger};
            color: #fff;
        }
    `,

    Empty: styled.div`
        border: 1px dashed ${border};
        border-radius: ${radius};
        padding: 24px;
        text-align: center;
        color: ${muted};
    `,

    /* -------------------- modal -------------------- */
    ModalOverlay: styled.div`
        position: fixed;
        inset: 0;
        z-index: 40;
        background: rgba(0, 0, 0, 0.35);
        display: grid;
        place-items: center;
    `,
    ModalCard: styled.div`
        width: min(520px, 92vw);
        background: ${card};
        color: ${text};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: ${shadow};
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
        gap: 10px;
        justify-content: flex-end;
        .ghost,
        .danger {
            appearance: none;
            border: 1px solid ${border};
            background: ${card};
            color: ${text};
            padding: 10px 14px;
            border-radius: ${radius};
            cursor: pointer;
            font: inherit;
        }
        .danger {
            border-color: ${danger};
            color: ${danger};
        }
    `,
};

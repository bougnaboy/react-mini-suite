import styled, { css } from "styled-components";

/* ---- Hover scrollbar with NO layout shift ----
   - Width is constant (12px), so content never moves.
   - Thumb fades from transparent → visible on hover.
   - scrollbar-gutter keeps layout stable in supporting browsers.
   - Works in Chromium/Safari (WebKit) + Firefox.
*/
const hoverScrollbarStable = css`
    /* Reserve space so nothing shifts */
    scrollbar-gutter: stable;

    /* Firefox: keep width thin, color transparent by default */
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;

    /* WebKit: fixed width always; invisible by default */
    &::-webkit-scrollbar {
        width: 12px;
        height: 12px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background: transparent; /* hidden look */
        border-radius: 8px;
        border: 3px solid transparent; /* inset effect */
        background-clip: content-box;
    }

    /* On hover: only change colors / opacity, not width */
    @media (hover: hover) {
        &:hover {
            scrollbar-color: #666 transparent; /* Firefox thumb color */
        }
        &:hover::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #3a3a3a, #666);
        }
        &::-webkit-scrollbar-thumb:hover {
            background: #808080;
        }
    }

    /* Touch devices: keep a visible thin thumb for usability */
    @media (hover: none) {
        scrollbar-width: thin;
        scrollbar-color: #555 transparent;
        &::-webkit-scrollbar-thumb {
            background: #555;
        }
    }
`;

const Wrapper = styled.div`
    position: relative;
`;

const Header = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 70px;
    background-color: #010409;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 30px;
    padding: 15px;
    border-bottom: 1px solid #333;
`;

const LogoLinkWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 30px;

    a {
        /* border: 1px solid #333; */
        /* border-radius: 6px; */
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        padding: 0 15px;

        color: #aaa;
        text-decoration: none;
        padding: 2px;
        &:hover {
            border-bottom: 1px solid #aaa;
        }
    }
`;

const NavLinkWrapper = styled.div`
    box-shadow: 0 0 1px 1px #333 inset;
    border-radius: 6px;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Heading = styled.h1`
    font-size: 14px;
    a {
        img {
            /* width: 100px; */
            height: 22px;
        }
    }
`;

const Main = styled.div`
    height: 100vh;
    padding-top: 70px;
    display: flex;
    align-items: stretch;
    overflow: hidden;
`;

const NavWrapper = styled.div`
    box-shadow: 0 0 1px 1px #333 inset;
    width: 0;
    flex: 0 0 0;
    transition: 0.2s ease;
    transition-property: width, flex;
    overflow: hidden;
    z-index: 999;
    background-color: #000;
    position: relative;

    &.active {
        flex: 0 0 250px;
        width: 250px;
    }

    @media (width < 1000px) {
        position: fixed;
        top: 70px;
        left: 0;
        height: calc(100vh - 70px);
    }

    .navInner {
        width: 250px;
        height: 100%;
        overflow-y: auto;
        ${hoverScrollbarStable}; /* ← updated mixin here */
        padding: 15px;
    }
`;

const Tuts = styled.div``;

const ContentWrapper = styled.div`
    box-shadow: 0 0 1px 1px #333 inset;
    width: 100%;
    overflow: auto;
    /* padding: 15px; */
    scroll-behavior: smooth !important;
    ${hoverScrollbarStable};
`;

const RoutesWrapper = styled.div`
    min-height: 100vh;
    /* border: 1px solid #f00; */
`;

const Footer = styled.div`
    padding: 15px;
`;

export const Styled = {
    Wrapper,
    Header,
    LogoLinkWrapper,
    NavLinkWrapper,
    Heading,
    Main,
    ContentWrapper,
    RoutesWrapper,
    NavWrapper,
    Tuts,
    Footer,
};

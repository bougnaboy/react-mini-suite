import ScrollToTop from './components/ScrollToTop'
import { Styled } from './App.styled'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { lazy, Suspense, useState } from 'react'
import { MdMenuOpen } from 'react-icons/md'
import { Box, CircularProgress } from '@mui/material'
import Footer from './components/footer'
import NavList from './components/navList'

import ar_logo from "./assets/ar_logo.png";

// ✅ Toasts
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* Pages */
const Home = lazy(() => import('./pages/home'));

const QrGenerator = lazy(() => import('./pages/apps/qrGenerator'));
const TokenPress = lazy(() => import("./pages/apps/tokenPress"));
const SealMaker = lazy(() => import("./pages/apps/sealMaker"));

const NotFound = lazy(() => import('./pages/notFound'));

const App = () => {
    const [displayNav, setDisplayNav] = useState(true);
    const handleDisplayNav = () => setDisplayNav(prev => !prev);

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <Styled.LogoLinkWrapper>
                    <Styled.NavLinkWrapper onClick={handleDisplayNav}>
                        <MdMenuOpen size={20} />
                    </Styled.NavLinkWrapper>
                    <NavLink to="/" title="Freelance Apps Hub">Freelance Apps Hub</NavLink>
                </Styled.LogoLinkWrapper>
                <Styled.Heading>
                    <a
                        href="https://www.ashishranjan.net"
                        target="_blank"
                        title="Ashish Ranjan"
                    >
                        <img src={ar_logo} alt="ar_logo" />
                    </a>
                </Styled.Heading>
            </Styled.Header>

            <Styled.Main>
                <Styled.NavWrapper className={`${displayNav ? "active" : ""}`}>
                    <div className="navInner">
                        <NavList />
                    </div>
                </Styled.NavWrapper>

                <Styled.ContentWrapper id="scroll-root" data-scroll-root>
                    <Styled.RoutesWrapper>
                        <Suspense
                            fallback={<Box
                                sx={{
                                    // border: "1px solid #f00",
                                    width: "100vw", height: "100vh",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}
                            ><CircularProgress /></Box>}>
                            <Routes>
                                {/* Basics */}
                                <Route path="/" element={<Navigate to="/home" />} />
                                <Route path="/home" element={<Home />} />

                                <Route path="/qr-generator" element={<QrGenerator />} />
                                <Route path="/token-press" element={<TokenPress />} />
                                <Route path="/seal-maker" element={<SealMaker />} />

                                {/* 404 */}
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </Suspense>
                    </Styled.RoutesWrapper>

                    <Styled.Footer>
                        <Footer />
                    </Styled.Footer>
                </Styled.ContentWrapper>
            </Styled.Main>

            <ScrollToTop />

            {/* ✅ Toasts live here (rendered once for the whole app) */}
            <ToastContainer position="bottom-center" autoClose={4000} newestOnTop />
        </Styled.Wrapper>
    )
}

export default App

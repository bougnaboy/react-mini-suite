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

const ReactWeatherApp = lazy(() => import("./pages/apps/reactWeatherApp"));
const RandomTravel = lazy(() => import("./pages/apps/randomTravel"));
const RgbColorGuesser = lazy(() => import("./pages/apps/rgbColorGuesser"));
const PhotoshopClone = lazy(() => import("./pages/apps/photoshopClone"));
const PersonalPortfolio = lazy(() => import("./pages/apps/personalPortfolio"));
const Otp = lazy(() => import("./pages/apps/otp"));
const MythWeaver = lazy(() => import("./pages/apps/mythWeaver"));
const MedicineDelivery = lazy(() => import("./pages/apps/medicineDelivery"));
const MarkdownPreviewer = lazy(() => import("./pages/apps/markdownPreviewer"));
const MemeGenerator = lazy(() => import("./pages/apps/memeGenerator"));
const LearningStreakTracker = lazy(() => import("./pages/apps/learningStreakTracker"));
const InterestRateCalculator = lazy(() => import("./pages/apps/interestRateCalculator"));
const ColorConverter = lazy(() => import("./pages/apps/colorConverter"));
const GuessTheNumber = lazy(() => import("./pages/apps/guessTheNumber"));
const GifGenerator = lazy(() => import("./pages/apps/gifGenerator"));
const FunFactGenerator = lazy(() => import("./pages/apps/funFactGenerator"));
const FruitMatcherGame = lazy(() => import("./pages/apps/fruitMatcherGame"));
const FrequencyGenerator = lazy(() => import("./pages/apps/frequencyGenerator"));
const FarmingLanding = lazy(() => import("./pages/apps/farmingLanding"));
const EmojiSearchApp = lazy(() => import("./pages/apps/emojiSearchApp"));
const DiceApp = lazy(() => import("./pages/apps/diceApp"));
const DailyWorkoutRandomizer = lazy(() => import("./pages/apps/dailyWorkoutRandomizer"));
const CurrencyConverter = lazy(() => import("./pages/apps/currencyConverter"));
const CryptoPriceChecker = lazy(() => import("./pages/apps/cryptoPriceChecker"));
const CreditCardValidator = lazy(() => import("./pages/apps/creditCardValidator"));
const Covid19Tracker = lazy(() => import("./pages/apps/covid19Tracker"));
const CountdownToBirthday = lazy(() => import("./pages/apps/countdownToBirthday"));
const ColorPaletteGenerator = lazy(() => import("./pages/apps/colorPaletteGenerator"));
const BlobGenerator = lazy(() => import("./pages/apps/blobGenerator"));
const BankKycForm = lazy(() => import("./pages/apps/bankKycForm"));
const BmiCalculator = lazy(() => import("./pages/apps/bmiCalculator"));
const CalorieCounter = lazy(() => import('./pages/apps/calorieCounter'));
const GroceryListManager = lazy(() => import('./pages/apps/groceryListManager'));
const HabitTracker = lazy(() => import('./pages/apps/habitTracker'));
const Journal = lazy(() => import('./pages/apps/journal'));
const MovieWatchList = lazy(() => import('./pages/apps/movieWatchList'));
const PasswordManager = lazy(() => import('./pages/apps/passwordManager'));
const RecipeBox = lazy(() => import('./pages/apps/recipeBox'));
const TodoListCrud = lazy(() => import('./pages/apps/todoListCrud'));
const WaterIntake = lazy(() => import('./pages/apps/waterIntake'));
const WorkoutPlanner = lazy(() => import('./pages/apps/workoutPlanner'));
const PackingListGenerator = lazy(() => import('./pages/apps/packingListGenerator'))
const PersonalGoalSetter = lazy(() => import('./pages/apps/personalGoalSetter'))
const SimpleTimer = lazy(() => import('./pages/apps/simpleTimer'))
const GiftIdeaList = lazy(() => import('./pages/apps/giftIdeaList'))
const QuoteCollector = lazy(() => import('./pages/apps/quoteCollector'))
const PersonalDashboard = lazy(() => import('./pages/apps/personalDashboard'))
const ColorPalettePicker = lazy(() => import('./pages/apps/colorPalettePicker'))
const UnitConverter = lazy(() => import('./pages/apps/unitConverter'))
const TicTacToeGame = lazy(() => import('./pages/apps/ticTacToeGame'))
const WordScrambleGame = lazy(() => import('./pages/apps/wordScrambleGame'))
const QuizApp = lazy(() => import('./pages/apps/quizApp'))
const DrawingApp = lazy(() => import('./pages/apps/drawingApp'))
const StickyNotesApp = lazy(() => import('./pages/apps/stickyNotesApp'))
const KanbanBoard = lazy(() => import('./pages/apps/kanbanBoard'))
const TextEditor = lazy(() => import('./pages/apps/textEditor'))

const BookReadingList = lazy(() => import("./pages/apps/bookReadingList"));
const PersonalFinance = lazy(() => import("./pages/apps/personalFinance"));
const SmartTimetable = lazy(() => import("./pages/apps/smartTimetable"));
const AssignmentPlanner = lazy(() => import("./pages/apps/assignmentPlanner"));
const DailyFocusPlanner = lazy(() => import("./pages/apps/dailyFocusPlanner"));
const ShopBilling = lazy(() => import("./pages/apps/shopBilling"));
const UpiQrStyled = lazy(() => import("./pages/apps/upiQrStyled"));
const ServiceJobCard = lazy(() => import("./pages/apps/serviceJobCard"));
const QrGenerator = lazy(() => import('./pages/apps/qrGenerator'));
const TokenPress = lazy(() => import("./pages/apps/tokenPress"));
const SealMaker = lazy(() => import("./pages/apps/sealMaker"));
const RupeeWords = lazy(() => import("./pages/apps/rupeeWords"));
const RateCard = lazy(() => import("./pages/apps/rateCard"));

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

                                <Route path="/react-weather-app" element={<ReactWeatherApp />} />
                                <Route path="/random-travel" element={<RandomTravel />} />
                                <Route path="/rgb-color-guesser" element={<RgbColorGuesser />} />
                                <Route path="/photoshop-clone" element={<PhotoshopClone />} />
                                <Route path="/personal-portfolio" element={<PersonalPortfolio />} />
                                <Route path="/otp" element={<Otp />} />
                                <Route path="/myth-weaver" element={<MythWeaver />} />
                                <Route path="/medicine-delivery" element={<MedicineDelivery />} />
                                <Route path="/markdown-previewer" element={<MarkdownPreviewer />} />
                                <Route path="/meme-generator" element={<MemeGenerator />} />
                                <Route path="/learning-streak-tracker" element={<LearningStreakTracker />} />
                                <Route path="/interest-rate-calculator" element={<InterestRateCalculator />} />
                                <Route path="/color-converter" element={<ColorConverter />} />
                                <Route path="/guess-the-number" element={<GuessTheNumber />} />
                                <Route path="/gif-generator" element={<GifGenerator />} />
                                <Route path="/fun-fact-generator" element={<FunFactGenerator />} />
                                <Route path="/fruit-matcher-game" element={<FruitMatcherGame />} />
                                <Route path="/frequency-generator" element={<FrequencyGenerator />} />
                                <Route path="/farming-landing" element={<FarmingLanding />} />
                                <Route path="/emoji-search-app" element={<EmojiSearchApp />} />
                                <Route path="/dice-app" element={<DiceApp />} />
                                <Route path="/daily-workout-randomizer" element={<DailyWorkoutRandomizer />} />
                                <Route path="/currency-converter" element={<CurrencyConverter />} />
                                <Route path="/crypto-price-checker" element={<CryptoPriceChecker />} />
                                <Route path="/credit-card-validator" element={<CreditCardValidator />} />
                                <Route path="/covid19-tracker" element={<Covid19Tracker />} />
                                <Route path="/countdown-to-birthday" element={<CountdownToBirthday />} />
                                <Route path="/color-palette-generator" element={<ColorPaletteGenerator />} />
                                <Route path="/blob-generator" element={<BlobGenerator />} />
                                <Route path="/bank-kyc-form" element={<BankKycForm />} />
                                <Route path="/bmi-calculator" element={<BmiCalculator />} />
                                <Route path="/book-reading-list" element={<BookReadingList />} />
                                <Route path="/calorie-counter" element={<CalorieCounter />} />
                                <Route path="/grocery-list-manager" element={<GroceryListManager />} />
                                <Route path="/habit-tracker" element={<HabitTracker />} />
                                <Route path="/journal" element={<Journal />} />
                                <Route path="/movie-watch-list" element={<MovieWatchList />} />
                                <Route path="/password-manager" element={<PasswordManager />} />
                                <Route path="/recipe-box" element={<RecipeBox />} />
                                <Route path="/todo-list-crud" element={<TodoListCrud />} />
                                <Route path="/water-intake" element={<WaterIntake />} />
                                <Route path="/workout-planner" element={<WorkoutPlanner />} />
                                <Route path="/packing-list-generator" element={<PackingListGenerator />} />
                                <Route path="/personal-goal-setter" element={<PersonalGoalSetter />} />
                                <Route path="/simple-timer" element={<SimpleTimer />} />
                                <Route path="/gift-idea-list" element={<GiftIdeaList />} />
                                <Route path="/quote-collector" element={<QuoteCollector />} />
                                <Route path="/personal-dashboard" element={<PersonalDashboard />} />
                                <Route path="/color-palette-picker" element={<ColorPalettePicker />} />
                                <Route path="/unit-converter" element={<UnitConverter />} />
                                <Route path="/tic-tac-toe-game" element={<TicTacToeGame />} />
                                <Route path="/word-scramble-game" element={<WordScrambleGame />} />
                                <Route path="/quiz-app" element={<QuizApp />} />
                                <Route path="/drawing-app" element={<DrawingApp />} />
                                <Route path="/sticky-notes-app" element={<StickyNotesApp />} />
                                <Route path="/kanban-board" element={<KanbanBoard />} />
                                <Route path="/text-editor" element={<TextEditor />} />

                                <Route path="/book-reading-list" element={<BookReadingList />} />
                                <Route path="/personal-finance" element={<PersonalFinance />} />
                                <Route path="/smart-timetable" element={<SmartTimetable />} />
                                <Route path="/assignment-planner" element={<AssignmentPlanner />} />
                                <Route path="/daily-focus-planner" element={<DailyFocusPlanner />} />
                                <Route path="/shop-billing" element={<ShopBilling />} />
                                <Route path="/upi-qr-styled" element={<UpiQrStyled />} />
                                <Route path="/service-job-card" element={<ServiceJobCard />} />
                                <Route path="/qr-generator" element={<QrGenerator />} />
                                <Route path="/token-press" element={<TokenPress />} />
                                <Route path="/seal-maker" element={<SealMaker />} />
                                <Route path="/rupee-words" element={<RupeeWords />} />
                                <Route path="rate-card" element={<RateCard />} />


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

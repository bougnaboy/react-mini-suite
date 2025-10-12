import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Styled } from "./styled";
import { MdClear } from "react-icons/md";

const STORAGE_KEY = "navSearch";

const NavListCore = () => {
    const navRef = useRef(null);
    const wrapperRef = useRef(null);
    const searchInputRef = useRef(null);
    const { pathname } = useLocation();

    // Restore persisted search
    const [search, setSearch] = useState(() => {
        try {
            return sessionStorage.getItem(STORAGE_KEY) ?? "";
        } catch {
            return "";
        }
    });

    const [matchCount, setMatchCount] = useState(0);

    // Keep the active NavLink centered/visible in the sidebar
    useEffect(() => {
        const el = navRef.current?.querySelector("a.active");
        if (!el) return;
        const id = requestAnimationFrame(() => {
            try {
                el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
            } catch {
                el.scrollIntoView();
            }
        });
        return () => cancelAnimationFrame(id);
    }, [pathname]);

    // Keyboard shortcuts: Cmd/Ctrl+K focus, Esc clear, Enter open first result
    useEffect(() => {
        function onKey(e) {
            const isMetaK = (e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K");
            if (isMetaK) {
                e.preventDefault();
                searchInputRef.current?.focus();
                searchInputRef.current?.select();
                return;
            }
            if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
                setSearch("");
                return;
            }
            if (e.key === "Enter" && document.activeElement === searchInputRef.current) {
                const first = wrapperRef.current?.querySelector('a:not([data-hidden="true"])');
                if (first) {
                    first.click(); // navigate
                }
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Apply filter to links + section headers whenever search changes
    useEffect(() => {
        // persist search
        try {
            sessionStorage.setItem(STORAGE_KEY, search);
        } catch { }

        const root = wrapperRef.current;
        if (!root) return;

        const q = search.trim().toLowerCase();
        const tokens = q.length ? q.split(/\s+/).filter(Boolean) : [];

        const links = Array.from(root.querySelectorAll("a[href]"));
        let visibleCount = 0;

        // Filter links
        links.forEach((a) => {
            const label = (a.textContent || "").toLowerCase();
            const title = (a.getAttribute("title") || "").toLowerCase();
            const hay = `${label} ${title}`;

            const isMatch =
                tokens.length === 0 ||
                tokens.every((t) => hay.includes(t));

            a.setAttribute("data-hidden", isMatch ? "false" : "true");
            if (isMatch) visibleCount += 1;
        });

        // Hide/show section headings that have zero visible links until next h3
        const headers = Array.from(root.querySelectorAll("h3.title"));
        headers.forEach((h) => {
            let hasVisible = false;
            let node = h.nextElementSibling;
            while (node && node.tagName !== "H3") {
                if (node.tagName === "A" && node.getAttribute("data-hidden") === "false") {
                    hasVisible = true;
                    break;
                }
                node = node.nextElementSibling;
            }
            h.setAttribute("data-hidden", hasVisible ? "false" : "true");
        });

        setMatchCount(visibleCount);
    }, [search]);

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };

    const clearSearch = () => setSearch("");

    useEffect(() => {
        searchInputRef.current.focus();
    }, []);

    return (
        <Styled.Nav ref={navRef} aria-label="JavaScript Core navigation">
            <div className="searchWraper">
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search topics (Ctrl + K)"
                    value={search}
                    onChange={handleSearchChange}
                    aria-label="Search topics"
                    aria-controls="navlinksWrapper"
                />
                {search.trim().length > 0 && (
                    <div className="clearIconWrapper" onClick={clearSearch} role="button" aria-label="Clear search" title="Clear">
                        <MdClear size={20} />
                    </div>
                )}
            </div>

            <div className="navlinksWrapper" id="navlinksWrapper" ref={wrapperRef} reversed>
                {/* <li><NavLink to="/home" title="Home" className={"home"}>Home</NavLink></li> */}

                <NavLink to="/appointment-management" title="Appointment Management">Appointment Management</NavLink>
                <NavLink to="/news-app" title="News App using React">News App</NavLink>
                <NavLink to="/flappy-bird-game" title="Flappy Bird Game">Flappy Bird Game</NavLink>
                <NavLink to="/parallax-page" title="Parallax Page">Parallax Page</NavLink>
                <NavLink to="/ping-pong-game" title="Ping Pong Game">Ping Pong Game</NavLink>
                <NavLink to="/pac-man-game" title="PacMan Game">PacMan Game</NavLink>
                <NavLink to="/crowdfunding-app" title="Crowdfunding App">Crowdfunding App</NavLink>
                <NavLink to="/hangman-game" title="Hangman Game">Hangman Game</NavLink>
                <NavLink to="/image-compressor" title="Image Compressor">Image Compressor</NavLink>
                <NavLink to="/aspect-ratio-calculator" title="Aspect Ratio Calculator">Aspect Ratio Calculator</NavLink>
                <NavLink to="/calculator-app" title="Calculator App">Calculator App</NavLink>
                <NavLink to="/country-information" title="Country Information">Country Information</NavLink>
                <NavLink to="/word-letter-counter" title="Word & Letter Counter">Word & Letter Counter</NavLink>
                <NavLink to="/virtual-keyboard" title="Virtual Keyboard">Virtual Keyboard</NavLink>
                <NavLink to="/quote-generator" title="Quote Generator">Quote Generator</NavLink>
                <NavLink to="/dictionary-app" title="Dictionary Application">Dictionary Application</NavLink>
                <NavLink to="/avatar-generator" title="Avatar Generator">Avatar Generator</NavLink>
                <NavLink to="/domain-name-generator" title="Domain Name Generator">Domain Name Generator</NavLink>
                <NavLink to="/location-finder" title="Location Finder">Location Finder</NavLink>
                <NavLink to="/coin-flipper" title="Coin Flipper">Coin Flipper</NavLink>
                <NavLink to="/jokes-generator" title="Jokes Generator">Jokes Generator</NavLink>
                <NavLink to="/submission-form" title="Submission Form">Submission Form</NavLink>

                <NavLink to="/password-generator" title="Password Generator">Password Generator</NavLink>
                <NavLink to="/react-music-player" title="React Music Player">React Music Player</NavLink>
                <NavLink to="/personalised-greeting-generator" title="Personalised Greeting Generator">Personalised Greeting Generator</NavLink>
                <NavLink to="/memory-word-game" title="Memory Word Game">Memory Word Game</NavLink>
                <NavLink to="/ip-info" title="IP Info">IP Info</NavLink>
                <NavLink to="/typing-test" title="Typing Test">Typing Test</NavLink>
                <NavLink to="/simple-horoscope-generator" title="Simple Horoscope Generator">Simple Horoscope Generator</NavLink>
                <NavLink to="/react-weather-app" title="React Weather App">React Weather App</NavLink>
                <NavLink to="/random-travel" title="Random Travel">Random Travel</NavLink>
                <NavLink to="/rgb-color-guesser" title="RGB Color Guesser">RGB Color Guesser</NavLink>
                <NavLink to="/photoshop-clone" title="Photoshop Clone">Photoshop Clone</NavLink>
                <NavLink to="/personal-portfolio" title="Personal Portfolio">Personal Portfolio</NavLink>
                <NavLink to="/otp" title="OTP">OTP</NavLink>
                <NavLink to="/myth-weaver" title="Myth-Weaver">Myth-Weaver</NavLink>
                <NavLink to="/medicine-delivery" title="Medicine Delivery">Medicine Delivery</NavLink>
                <NavLink to="/markdown-previewer" title="Markdown Previewer">Markdown Previewer</NavLink>
                <NavLink to="/meme-generator" title="MEME Generator">MEME Generator</NavLink>
                <NavLink to="/learning-streak-tracker" title="Learning Streak Tracker">Learning Streak Tracker</NavLink>
                <NavLink to="/interest-rate-calculator" title="Interest Rate Calculator">Interest Rate Calculator</NavLink>
                <NavLink to="/color-converter" title="HTML Color Converter">HTML Color Converter</NavLink>
                <NavLink to="/guess-the-number" title="Guess the Number">Guess the Number</NavLink>
                <NavLink to="/gif-generator" title="GIF Generator">GIF Generator</NavLink>
                <NavLink to="/fun-fact-generator" title="Fun-Fact Generator">Fun-Fact Generator</NavLink>
                <NavLink to="/fruit-matcher-game" title="Fruit Matcher Game">Fruit Matcher Game</NavLink>
                <NavLink to="/frequency-generator" title="Frequency Generator">Frequency Generator</NavLink>
                <NavLink to="/farming-landing" title="Farming Landing">Farming Landing</NavLink>
                <NavLink to="/emoji-search-app" title="Emoji Search App">Emoji Search App</NavLink>
                <NavLink to="/dice-app" title="Dice App">Dice App</NavLink>
                <NavLink to="/daily-workout-randomizer" title="Daily Workout Randomizer">Daily Workout Randomizer</NavLink>
                <NavLink to="/currency-converter" title="Currency Converter">Currency Converter</NavLink>
                <NavLink to="/crypto-price-checker" title="Crypto Price Checker">Crypto Price Checker</NavLink>
                <NavLink to="/credit-card-validator" title="Credit Card Validator">Credit Card Validator</NavLink>
                <NavLink to="/covid19-tracker" title="COVID-19 Tracker">COVID-19 Tracker</NavLink>
                <NavLink to="/countdown-to-birthday" title="Countdown To Birthday">Countdown To Birthday</NavLink>
                <NavLink to="/color-palette-generator" title="Color Palette Generator">Color Palette Generator</NavLink>
                <NavLink to="/blob-generator" title="Blob Generator">Blob Generator</NavLink>
                <NavLink to="/bank-kyc-form" title="Bank KYC Form">Bank KYC Form</NavLink>
                <NavLink to="/bmi-calculator" title="BMI Calculator">BMI Calculator</NavLink>
                <NavLink to="/book-reading-list" title="Book Reading List" >Book Reading List</NavLink>
                <NavLink to="/calorie-counter" title="Calorie Counter">Calorie Counter</NavLink>
                <NavLink to="/grocery-list-manager" title="Grocery List Manager">Grocery List Manager</NavLink>
                <NavLink to="/habit-tracker" title="Habit Tracker">Habit Tracker</NavLink>
                <NavLink to="/journal" title="Journal">Journal</NavLink>
                <NavLink to="/movie-watch-list" title="Movie Watch List">Movie Watch List</NavLink>
                <NavLink to="/password-manager" title="Password Manager">Password Manager</NavLink>
                <NavLink to="/recipe-box" title="Recipe Box">Recipe Box</NavLink>
                <NavLink to="/todo-list-crud" title="Todo List Crud">Todo List Crud</NavLink>
                <NavLink to="/water-intake" title="Water Intake">Water Intake</NavLink>
                <NavLink to="/workout-planner" title="Workout Planner">Workout Planner</NavLink>
                <NavLink to="/packing-list-generator" title="Packing List Generator">Packing List Generator</NavLink>
                <NavLink to="/personal-goal-setter" title="Personal Goal Setter">Personal Goal Setter</NavLink>
                <NavLink to="/simple-timer" title="Simple Timer">Simple Timer</NavLink>
                <NavLink to="/gift-idea-list" title="Gift Idea List">Gift Idea List</NavLink>
                <NavLink to="/quote-collector" title="Quote Collector">Quote Collector</NavLink>
                <NavLink to="/personal-dashboard" title="Personal Dashboard">Personal Dashboard</NavLink>
                <NavLink to="/color-palette-picker" title="Color Palette Picker">Color Palette Picker</NavLink>
                <NavLink to="/unit-converter" title="Unit Converter">Unit Converter</NavLink>
                <NavLink to="/tic-tac-toe-game" title="Tic-Tac-Toe Game">Tic-Tac-Toe Game</NavLink>
                <NavLink to="/word-scramble-game" title="Word Scramble Game">Word Scramble Game</NavLink>
                <NavLink to="/quiz-app" title="Quiz App">Quiz App</NavLink>
                <NavLink to="/drawing-app" title="Drawing App">Drawing App</NavLink>
                <NavLink to="/sticky-notes-app" title="Sticky Notes App">Sticky Notes App</NavLink>
                <NavLink to="/kanban-board" title="Kanban Board">Kanban Board</NavLink>
                <NavLink to="/text-editor" title="Text Editor">Text Editor</NavLink>

                <NavLink to="/personal-finance" title="Personal Finance">Personal Finance</NavLink>
                <NavLink to="/smart-timetable" title="Smart Timetable">Smart Timetable</NavLink>
                <NavLink to="/assignment-planner" title="Assignment Planner">Assignment Planner</NavLink>
                <NavLink to="/daily-focus-planner" title="Daily Focus Planner">Daily Focus Planner</NavLink>
                <NavLink to="/shop-billing" title="Shop Billing">Shop Billing</NavLink>
                <NavLink to="/upi-qr-styled" title="UPI QR Styled">UPI QR Styled</NavLink>
                <NavLink to="/service-job-card" title="Service Job Card">Service Job Card</NavLink>
                <NavLink to="/qr-generator" title="QR Generator">QR Generator</NavLink>
                <NavLink to="/token-press" title="Token Press">Token Press</NavLink>
                <NavLink to="/seal-maker" title="Seal Maker">Seal Maker</NavLink>
                <NavLink to="/rupee-words" title="Rupee Words">Rupee Words</NavLink>
                <NavLink to="/rate-card" title="Rate Card">Rate Card</NavLink>
            </div>

            {/* Minimal CSS hook: hide elements with data-hidden="true" if your Styled.Nav doesn't already */}
            <style>{`
        [data-hidden="true"] { display: none !important; }
      `}</style>
        </Styled.Nav >
    );
};

export default NavListCore;

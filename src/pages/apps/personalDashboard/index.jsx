import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

/* -------------------------
   Storage & helpers
------------------------- */
const STORAGE_KEY = "personalDashboard.v1";

/* Weather: simple mapping for icons/labels */
const WMAP = {
    // Open-Meteo weather codes (subset, friendly)
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Snow fall",
    80: "Rain showers",
    95: "Thunderstorm",
};

/* Short uid */
const uid = () =>
    crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

/* Safely read/write LocalStorage */
const safeGet = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}; }
    catch { return {}; }
};
const safeSet = (obj) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }
    catch { }
};

/* Format date helpers */
const pad2 = (n) => String(Math.max(0, n | 0)).padStart(2, "0");
const formatNiceDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "2-digit" }) : "";

/* -------------------------
   Main
------------------------- */
export default function PersonalDashboard() {
    const persisted = safeGet();

    /* ===== Header ===== */
    const [todos, setTodos] = useState(persisted.todos ?? []);
    const [quotes, setQuotes] = useState(
        persisted.quotes ?? [
            { id: uid(), text: "What we think, we become.", author: "Buddha" },
            { id: uid(), text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
            { id: uid(), text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
        ]
    );

    /* ===== Weather state ===== */
    const [city, setCity] = useState(persisted.city ?? "");
    const [weather, setWeather] = useState(persisted.weather ?? null);
    const [isFetching, setIsFetching] = useState(false);

    /* ===== To-Do form ===== */
    const [title, setTitle] = useState("");
    const [due, setDue] = useState(""); // YYYY-MM-DD
    const [notes, setNotes] = useState("");

    /* ===== To-Do filters (bottom "Results" block) ===== */
    const [query, setQuery] = useState("");
    const [fStatus, setFStatus] = useState("All"); // All | Active | Done
    const [sortBy, setSortBy] = useState("created"); // created | title | due

    /* ===== Quotes controls ===== */
    const [qText, setQText] = useState("");
    const [qAuthor, setQAuthor] = useState("");
    const [quoteIndex, setQuoteIndex] = useState(persisted.quoteIndex ?? 0);

    /* Persist everything important */
    useEffect(() => {
        safeSet({ todos, quotes, city, weather, quoteIndex });
    }, [todos, quotes, city, weather, quoteIndex]);

    /* Rotate quote index safely */
    const activeQuote = quotes.length
        ? quotes[(quoteIndex % quotes.length + quotes.length) % quotes.length]
        : null;

    /* -------------------------
       Weather: fetch helpers
    ------------------------- */
    const fetchByCoords = async (lat, lon) => {
        try {
            setIsFetching(true);
            // Open-Meteo free API (no key). Daily min/max + current.
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
            const res = await fetch(url);
            const data = await res.json();
            const out = {
                at: Date.now(),
                name: city || "Your location",
                lat, lon,
                temp: data?.current?.temperature_2m ?? null,
                code: data?.current?.weather_code ?? null,
                min: data?.daily?.temperature_2m_min?.[0] ?? null,
                max: data?.daily?.temperature_2m_max?.[0] ?? null,
            };
            setWeather(out);
        } catch {
            // Silently ignore; UI shows fallback
        } finally {
            setIsFetching(false);
        }
    };

    const geocodeAndFetch = async (name) => {
        try {
            if (!name.trim()) return;
            setIsFetching(true);
            // Open-Meteo geocoding
            const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
                name
            )}&count=1`;
            const res = await fetch(url);
            const data = await res.json();
            const loc = data?.results?.[0];
            if (!loc) return;
            await fetchByCoords(loc.latitude, loc.longitude);
        } catch {
            // ignore
        } finally {
            setIsFetching(false);
        }
    };

    const useMyLocation = () => {
        if (!("geolocation" in navigator)) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords || {};
                fetchByCoords(latitude, longitude);
            },
            () => { }
        );
    };

    /* -------------------------
       To-Do actions
    ------------------------- */
    const addTodo = (e) => {
        e?.preventDefault?.();
        const t = (title || "").trim();
        if (!t) return;
        const item = {
            id: uid(),
            title: t,
            due: due.trim(),
            notes: (notes || "").trim(),
            done: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            completedAt: "",
        };
        setTodos((prev) => [item, ...prev]);

        // reset form
        setTitle("");
        setDue("");
        setNotes("");
    };

    const toggleTodo = (id) => {
        setTodos((prev) =>
            prev.map((it) =>
                it.id === id
                    ? {
                        ...it,
                        done: !it.done,
                        completedAt: !it.done ? new Date().toISOString().slice(0, 10) : "",
                        updatedAt: Date.now(),
                    }
                    : it
            )
        );
    };

    const removeTodo = (id) => {
        askConfirm({
            onConfirm: () => setTodos((prev) => prev.filter((it) => it.id !== id)),
        });
    };

    /* Results pipeline for To-Do (for the bottom block) */
    const filteredTodos = useMemo(() => {
        let list = todos.slice();
        if (fStatus !== "All") {
            list = list.filter((t) => (fStatus === "Done" ? t.done : !t.done));
        }
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(
                (t) =>
                    (t.title || "").toLowerCase().includes(q) ||
                    (t.notes || "").toLowerCase().includes(q)
            );
        }
        if (sortBy === "title") {
            list.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === "due") {
            const huge = 8640000000000000; // max date
            list.sort(
                (a, b) =>
                    new Date(a.due || huge) - new Date(b.due || huge) ||
                    a.title.localeCompare(b.title)
            );
        } else {
            list.sort((a, b) => b.createdAt - a.createdAt); // newest
        }
        return list;
    }, [todos, fStatus, query, sortBy]);

    /* -------------------------
       Quotes actions
    ------------------------- */
    const addQuote = (e) => {
        e?.preventDefault?.();
        const t = (qText || "").trim();
        if (!t) return;
        setQuotes((prev) => [{ id: uid(), text: t, author: (qAuthor || "").trim() }, ...prev]);
        setQText("");
        setQAuthor("");
        setQuoteIndex(0);
    };

    const nextQuote = () => setQuoteIndex((i) => (i + 1) % (quotes.length || 1));
    const prevQuote = () =>
        setQuoteIndex((i) => (i - 1 + (quotes.length || 1)) % (quotes.length || 1));

    // confirm modal
    const [confirm, setConfirm] = useState(null);
    const askConfirm = (opts) =>
        setConfirm({
            title: "Delete task?",
            message: "This will remove it from your list.",
            confirmText: "Delete",
            cancelText: "Cancel",
            tone: "danger",
            hideCancel: false,
            onConfirm: null,
            ...opts,
        });

    const handleConfirm = () => {
        const fn = confirm?.onConfirm;
        setConfirm(null);
        if (typeof fn === "function") fn();
    };

    // optional: Esc to cancel, Enter to confirm
    useEffect(() => {
        if (!confirm) return;
        const onKey = (e) => {
            if (e.key === "Escape") setConfirm(null);
            if (e.key === "Enter") handleConfirm();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [confirm]);


    /* -------------------------
       Render
    ------------------------- */
    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        {/* Title */}
                        <Styled.Title>Personal Dashboard</Styled.Title>

                        {/* space below title */}
                        <div style={{ height: 8 }} />

                        {/* Para 1: what this project is */}
                        <Styled.Sub>
                            A simple homepage that surfaces your day at a glance — quick weather, a focused
                            to-do list, and rotating inspirational quotes. To-dos and quotes are saved locally
                            (offline-friendly).
                        </Styled.Sub>

                        {/* space below para 1 */}
                        <div style={{ height: 6 }} />

                        {/* Para 2: how to use (bullet list) */}
                        <Styled.BulletList aria-label="How to use steps">
                            <Styled.BulletItem>Type a task, optionally set a due date, then click Add.</Styled.BulletItem>
                            <Styled.BulletItem>Fetch weather by city or use your location (optional).</Styled.BulletItem>
                            <Styled.BulletItem>Add your own quotes or cycle through existing ones.</Styled.BulletItem>
                            <Styled.BulletItem>Scroll to the To-Do Results to search, filter, and sort your tasks.</Styled.BulletItem>
                        </Styled.BulletList>

                        {/* space below bullet list */}
                        <div style={{ height: 10 }} />
                    </div>

                    {/* Quick badges on the right */}
                    <Styled.BadgeRow>
                        <Styled.Tag $tone="muted">Tasks: {todos.length}</Styled.Tag>
                        <Styled.Tag>Quotes: {quotes.length}</Styled.Tag>
                        <Styled.Tag $tone="muted">{weather ? "Weather ready" : "Weather idle"}</Styled.Tag>
                    </Styled.BadgeRow>
                </Styled.Header>

                {/* ===================== TOP GRID: WEATHER + QUOTES ===================== */}
                <Styled.Grid>
                    {/* Weather card */}
                    <Styled.Col span={6}>
                        <Styled.Card>
                            <Styled.SectionTitle>Weather</Styled.SectionTitle>
                            <div style={{ height: 8 }} />
                            <Styled.FormRow>
                                <Styled.Label title="Enter a city name (e.g., Kolkata)">
                                    <Styled.LabelText>City</Styled.LabelText>
                                    <Styled.Input
                                        placeholder="e.g., Kolkata"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        aria-label="City"
                                    />
                                </Styled.Label>

                                <Styled.RowWrap style={{ marginTop: 2 }}>
                                    <Styled.PrimaryButton
                                        type="button"
                                        onClick={() => geocodeAndFetch(city)}
                                        disabled={!city.trim() || isFetching}
                                        title="Fetch weather by city name"
                                    >
                                        {isFetching ? "Fetching…" : "Fetch"}
                                    </Styled.PrimaryButton>
                                    <Styled.Button type="button" onClick={useMyLocation} title="Use current location">
                                        Use my location
                                    </Styled.Button>
                                </Styled.RowWrap>
                            </Styled.FormRow>

                            {/* Weather summary */}
                            <div style={{ marginTop: 10 }}>
                                {!weather ? (
                                    <Styled.Helper>
                                        Tip: Weather is optional. Enter a city and click Fetch, or use your location.
                                    </Styled.Helper>
                                ) : (
                                    <div>
                                        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                                            <Styled.BigNumber>
                                                {weather.temp != null ? Math.round(weather.temp) : "--"}°C
                                            </Styled.BigNumber>
                                            <div style={{ fontSize: 14, opacity: 0.9 }}>
                                                {WMAP[weather.code] || "—"}
                                            </div>
                                        </div>
                                        <Styled.ItemMeta style={{ marginTop: 6 }}>
                                            <Styled.Tag>#{weather.name}</Styled.Tag>
                                            <span>•</span>
                                            <Styled.Tag $tone="muted">
                                                Min {weather.min != null ? Math.round(weather.min) : "--"}° / Max{" "}
                                                {weather.max != null ? Math.round(weather.max) : "--"}°
                                            </Styled.Tag>
                                        </Styled.ItemMeta>
                                        <Styled.Helper style={{ marginTop: 8 }}>
                                            Cached locally at {new Date(weather.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.
                                        </Styled.Helper>
                                    </div>
                                )}
                            </div>
                        </Styled.Card>
                    </Styled.Col>

                    {/* Quotes card */}
                    <Styled.Col span={6}>
                        <Styled.Card>
                            <Styled.SectionTitle>Quotes</Styled.SectionTitle>
                            <div style={{ height: 8 }} />

                            {/* Active quote */}
                            {activeQuote ? (
                                <div style={{ display: "grid", gap: 6 }}>
                                    <div style={{ fontSize: "clamp(16px, 2.2vw, 20px)", lineHeight: 1.6 }}>
                                        "{activeQuote.text}"
                                    </div>
                                    <Styled.Muted>— {activeQuote.author || "Unknown"}</Styled.Muted>
                                </div>
                            ) : (
                                <Styled.Empty>No quotes yet. Add one below.</Styled.Empty>
                            )}

                            {/* Cycle buttons */}
                            <Styled.RowWrap style={{ marginTop: 10 }}>
                                <Styled.Button type="button" onClick={prevQuote} title="Previous quote">
                                    Previous
                                </Styled.Button>
                                <Styled.Button type="button" onClick={nextQuote} title="Next quote">
                                    Next
                                </Styled.Button>
                            </Styled.RowWrap>

                            {/* new quote (form) */}
                            <div style={{ marginTop: 12 }}>
                                <Styled.FormRow>
                                    <Styled.Label title="Quote text">
                                        <Styled.LabelText>Add Quote</Styled.LabelText>
                                        <Styled.TextArea
                                            placeholder='e.g., "Stay hungry, stay foolish."'
                                            value={qText}
                                            onChange={(e) => setQText(e.target.value)}
                                            aria-label="New quote text"
                                        />
                                    </Styled.Label>
                                    <Styled.Label title="Who said it?">
                                        <Styled.LabelText>Author</Styled.LabelText>
                                        <Styled.Input
                                            placeholder="e.g., Steve Jobs"
                                            value={qAuthor}
                                            onChange={(e) => setQAuthor(e.target.value)}
                                            aria-label="New quote author"
                                        />
                                    </Styled.Label>
                                </Styled.FormRow>

                                <Styled.ButtonRow>
                                    <Styled.PrimaryButton type="button" onClick={addQuote} disabled={!qText.trim()}>
                                        Add
                                    </Styled.PrimaryButton>
                                </Styled.ButtonRow>
                            </div>
                        </Styled.Card>
                    </Styled.Col>
                </Styled.Grid>

                {/* ===================== TODO: ADD FORM ===================== */}
                <div style={{ marginTop: 16 }} />
                <Styled.Card as="form" onSubmit={addTodo}>
                    <Styled.SectionTitle>To-Do</Styled.SectionTitle>
                    <div style={{ height: 8 }} />
                    <Styled.FormRow>
                        <Styled.Label title="Task title (required)">
                            <Styled.LabelText>Title *</Styled.LabelText>
                            <Styled.Input
                                placeholder="e.g., Prepare slides for demo"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                aria-label="Todo title"
                                required
                            />
                        </Styled.Label>

                        <Styled.Label title="Optional due date">
                            <Styled.LabelText>Due</Styled.LabelText>
                            <Styled.Input
                                type="date"
                                value={due}
                                onChange={(e) => setDue(e.target.value)}
                                aria-label="Due date"
                            />
                        </Styled.Label>
                    </Styled.FormRow>

                    <Styled.Label style={{ width: "100%", marginTop: 8 }} title="Optional notes">
                        <Styled.LabelText>Notes</Styled.LabelText>
                        <Styled.TextArea
                            placeholder="Details, links, or steps…"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            aria-label="Notes"
                        />
                    </Styled.Label>

                    {!title.trim() && <Styled.Helper>Tip: Title is required.</Styled.Helper>}

                    {/* Adding button at the VERY END */}
                    <Styled.ButtonRow>
                        <Styled.PrimaryButton type="submit" disabled={!title.trim()}>
                            Add
                        </Styled.PrimaryButton>
                    </Styled.ButtonRow>
                </Styled.Card>

                {/* ===================== TODO RESULTS (strict sequence) ===================== */}
                {/* Space ABOVE results */}
                <div style={{ marginTop: 24 }} />

                {/* Results heading */}
                <Styled.SectionTitle>Results</Styled.SectionTitle>

                {/* Space below heading */}
                <div style={{ height: 8 }} />

                {/* Filters block */}
                <Styled.Card>
                    <Styled.FormRow>
                        {/* Search */}
                        <Styled.Label title="Search across title and notes">
                            <Styled.LabelText>Search</Styled.LabelText>
                            <Styled.Input
                                placeholder="Search tasks…"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                aria-label="Search"
                            />
                        </Styled.Label>

                        {/* Status filter */}
                        <Styled.Label title="Filter by status">
                            <Styled.LabelText>Status</Styled.LabelText>
                            <Styled.Select
                                value={fStatus}
                                onChange={(e) => setFStatus(e.target.value)}
                                aria-label="Status"
                            >
                                {["All", "Active", "Done"].map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </Styled.Select>
                        </Styled.Label>

                        {/* Sort */}
                        <Styled.Label title="Sort the list">
                            <Styled.LabelText>Sort by</Styled.LabelText>
                            <Styled.Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                aria-label="Sort by"
                            >
                                <option value="created">Newest</option>
                                <option value="title">Title A–Z</option>
                                <option value="due">Due date (early → late)</option>
                            </Styled.Select>
                        </Styled.Label>
                    </Styled.FormRow>
                </Styled.Card>

                {/* Space below filters */}
                <div style={{ height: 10 }} />

                {/* Result list */}
                <Styled.List>
                    {filteredTodos.length === 0 && todos.length === 0 && (
                        <Styled.Empty>No tasks yet. Add your first!</Styled.Empty>
                    )}
                    {filteredTodos.length === 0 && todos.length > 0 && (
                        <Styled.Empty>No tasks match your current filters. Try adjusting them.</Styled.Empty>
                    )}

                    {filteredTodos.map((t) => (
                        <Styled.Item key={t.id} $done={t.done}>
                            <Styled.ItemLeft>
                                <Styled.ItemTitle>
                                    {t.done ? "✅ " : ""}{t.title}
                                </Styled.ItemTitle>
                                <Styled.ItemMeta>
                                    {t.due ? <Styled.Tag>Due {formatNiceDate(t.due)}</Styled.Tag> : <Styled.Tag $tone="muted">No due</Styled.Tag>}
                                    <span>•</span>
                                    <Styled.Tag $tone="muted">
                                        {t.done ? `Done ${t.completedAt || ""}` : "Active"}
                                    </Styled.Tag>
                                </Styled.ItemMeta>
                                {t.notes ? (
                                    <div style={{ marginTop: 4, fontSize: 13, opacity: 0.9 }}>{t.notes}</div>
                                ) : null}
                            </Styled.ItemLeft>
                            <Styled.ItemRight>
                                <Styled.Button type="button" onClick={() => toggleTodo(t.id)}>
                                    {t.done ? "Mark Active" : "Mark Done"}
                                </Styled.Button>
                                <Styled.Button type="button" onClick={() => removeTodo(t.id)}>
                                    Delete
                                </Styled.Button>
                            </Styled.ItemRight>
                        </Styled.Item>
                    ))}
                </Styled.List>

                <Styled.FooterNote>
                    To-Dos & Quotes are saved in LocalStorage. Weather is fetched on demand and cached locally.
                </Styled.FooterNote>

                {confirm && (
                    <Styled.ModalOverlay onClick={() => setConfirm(null)}>
                        <Styled.ModalCard
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="confirm-title"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Styled.ModalTitle id="confirm-title">
                                {confirm.title}
                            </Styled.ModalTitle>
                            {confirm.message ? (
                                <Styled.ModalMessage>{confirm.message}</Styled.ModalMessage>
                            ) : null}
                            <Styled.ModalActions>
                                {!confirm.hideCancel && (
                                    <Styled.Button type="button" onClick={() => setConfirm(null)}>
                                        {confirm.cancelText || "Cancel"}
                                    </Styled.Button>
                                )}
                                {confirm.tone === "danger" ? (
                                    <Styled.DangerButton type="button" onClick={handleConfirm} autoFocus>
                                        {confirm.confirmText || "Confirm"}
                                    </Styled.DangerButton>
                                ) : (
                                    <Styled.PrimaryButton type="button" onClick={handleConfirm} autoFocus>
                                        {confirm.confirmText || "Confirm"}
                                    </Styled.PrimaryButton>
                                )}
                            </Styled.ModalActions>
                        </Styled.ModalCard>
                    </Styled.ModalOverlay>
                )}

            </Styled.Container>
        </Styled.Page>
    );
}

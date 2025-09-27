import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

const EXERCISES = [
    { name: "Arm Circles", focus: "mobility", equipment: "BW", type: "time" },
    { name: "World's Greatest Stretch", focus: "mobility", equipment: "BW", type: "time" },
    { name: "Cat–Cow", focus: "mobility", equipment: "BW", type: "time" },
    { name: "Hip Openers", focus: "mobility", equipment: "BW", type: "time" },
    { name: "Ankle Rolls", focus: "mobility", equipment: "BW", type: "time" },

    { name: "Push-ups", focus: "upper", equipment: "BW", type: "reps" },
    { name: "Pike Push-ups", focus: "upper", equipment: "BW", type: "reps" },
    { name: "DB Shoulder Press", focus: "upper", equipment: "DB", type: "reps" },
    { name: "DB Rows", focus: "upper", equipment: "DB", type: "reps" },
    { name: "Band Pull-Aparts", focus: "upper", equipment: "RB", type: "reps" },

    { name: "Bodyweight Squats", focus: "lower", equipment: "BW", type: "reps" },
    { name: "Reverse Lunges", focus: "lower", equipment: "BW", type: "reps" },
    { name: "Glute Bridges", focus: "lower", equipment: "BW", type: "reps" },
    { name: "DB Goblet Squats", focus: "lower", equipment: "DB", type: "reps" },
    { name: "Band Squats", focus: "lower", equipment: "RB", type: "reps" },

    { name: "Plank", focus: "core", equipment: "BW", type: "time" },
    { name: "Dead Bug", focus: "core", equipment: "BW", type: "reps" },
    { name: "Hollow Hold", focus: "core", equipment: "BW", type: "time" },
    { name: "Russian Twists", focus: "core", equipment: "BW", type: "reps" },

    { name: "Burpees", focus: "full", equipment: "BW", type: "reps" },
    { name: "Mountain Climbers", focus: "full", equipment: "BW", type: "time" },
    { name: "DB Thrusters", focus: "full", equipment: "DB", type: "reps" },
];

const DUR_TO_COUNTS = {
    "10": { warmup: 2, main: 4, finisher: 1 },
    "20": { warmup: 3, main: 6, finisher: 1 },
    "30": { warmup: 4, main: 8, finisher: 1 },
};

const INTENSITY_PRESET = {
    easy: { reps: [8, 10, 12], time: [20, 25, 30] },
    medium: { reps: [10, 12, 15], time: [30, 35, 40] },
    hard: { reps: [12, 15, 20], time: [40, 45, 50] },
};

function todayISO() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}
function prettyDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][(m - 1) % 12];
    return `${month} ${String(d)}, ${y}`;
}
function isPast(iso) {
    return iso < todayISO();
}

function formatSet(ex, intensity) {
    const preset = INTENSITY_PRESET[intensity] || INTENSITY_PRESET.medium;
    if (ex.type === "reps") {
        const pick = preset.reps[Math.floor(Math.random() * preset.reps.length)];
        return `${pick} reps`;
    }
    const secs = preset.time[Math.floor(Math.random() * preset.time.length)];
    return `${secs}s`;
}
function pickUnique(list, count) {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, Math.max(0, Math.min(count, arr.length)));
}

export default function DailyWorkoutRandomizer() {
    const [filters, setFilters] = useState({
        equipment: "Any",
        focus: "full",
        duration: "20",
        intensity: "medium",
    });
    const [selectedDate, setSelectedDate] = useState(todayISO());
    const [plan, setPlan] = useState(null);
    const [loadedFromStorage, setLoadedFromStorage] = useState(false);
    const [noSavedMsg, setNoSavedMsg] = useState("");

    const isEditable = !isPast(selectedDate);
    const filteredList = useMemo(() => {
        const byFocus = EXERCISES.filter(e => {
            if (filters.focus === "full") return true;
            return e.focus === filters.focus || e.focus === "full" || (filters.focus !== "mobility" && e.focus === "mobility");
        });
        if (filters.equipment === "Any") return byFocus;
        return byFocus.filter(e => e.equipment === filters.equipment);
    }, [filters]);

    function buildPlan(forDate) {
        const counts = DUR_TO_COUNTS[filters.duration] || DUR_TO_COUNTS["20"];
        const warmups = EXERCISES.filter(e => e.focus === "mobility");
        const mains = filteredList.filter(e => e.focus !== "mobility");
        const finishers = EXERCISES.filter(e => ["core", "full"].includes(e.focus));

        const w = pickUnique(warmups.length ? warmups : EXERCISES, counts.warmup);
        const m = pickUnique(mains.length ? mains : EXERCISES, counts.main);
        const f = pickUnique(finishers.length ? finishers : EXERCISES, counts.finisher);

        const withSets = arr => arr.map(ex => ({ ...ex, set: formatSet(ex, filters.intensity) }));

        const next = {
            date: forDate,
            filters: { ...filters },
            warmup: withSets(w),
            main: withSets(m),
            finisher: withSets(f),
        };
        setPlan(next);
        setLoadedFromStorage(false);
        return next;
    }

    function loadSaved(iso) {
        const key = `dwr:plan:${iso}`;
        const raw = localStorage.getItem(key);
        if (!raw) {
            setPlan(null);
            setLoadedFromStorage(false);
            setNoSavedMsg("No saved plan for this date.");
            return null;
        }
        try {
            const saved = JSON.parse(raw);
            setPlan(saved);
            setLoadedFromStorage(true);
            setNoSavedMsg("");
            return saved;
        } catch {
            setPlan(null);
            setLoadedFromStorage(false);
            setNoSavedMsg("Saved data corrupted.");
            return null;
        }
    }

    useEffect(() => {
        const today = todayISO();
        setSelectedDate(today);
        const had = loadSaved(today);
        if (!had) buildPlan(today);
        // eslint-disable-next-line
    }, []);

    function handleDateChange(e) {
        const iso = e.target.value;
        setSelectedDate(iso);
        loadSaved(iso); // Past: view-only. Today/Future: user may Randomize/Save.
    }

    function handleSave() {
        if (!plan || !isEditable) return; // block past dates
        const key = `dwr:plan:${plan.date}`;
        localStorage.setItem(key, JSON.stringify(plan));
        setLoadedFromStorage(true);
        setNoSavedMsg("");
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    }

    function handleRandomize() {
        if (!isEditable) return; // block past dates
        buildPlan(selectedDate);
    }

    const canSave = plan && isEditable;

    return (
        <Styled.Wrapper>
            <header>
                <h2>Daily Workout Randomizer</h2>
                <p className="sub">View old plans. Add/Update only for today or future dates.</p>
            </header>

            <Styled.DateRow>
                <label>
                    <span>Date</span>
                    <input type="date" value={selectedDate} onChange={handleDateChange} />
                </label>
                <div className="pretty">{prettyDate(selectedDate)}</div>
                {!isEditable && <div className="info">Past date — view only.</div>}
            </Styled.DateRow>

            <Styled.Controls $disabled={!isEditable}>
                <label>
                    <span>Equipment</span>
                    <select name="equipment" value={filters.equipment} onChange={handleChange} disabled={!isEditable}>
                        <option value="Any">Any</option>
                        <option value="BW">Bodyweight</option>
                        <option value="DB">Dumbbells</option>
                        <option value="RB">Resistance Band</option>
                    </select>
                </label>

                <label>
                    <span>Focus</span>
                    <select name="focus" value={filters.focus} onChange={handleChange} disabled={!isEditable}>
                        <option value="full">Full Body</option>
                        <option value="upper">Upper</option>
                        <option value="lower">Lower</option>
                        <option value="core">Core</option>
                        <option value="mobility">Mobility</option>
                    </select>
                </label>

                <label>
                    <span>Duration</span>
                    <select name="duration" value={filters.duration} onChange={handleChange} disabled={!isEditable}>
                        <option value="10">10 min</option>
                        <option value="20">20 min</option>
                        <option value="30">30 min</option>
                    </select>
                </label>

                <label>
                    <span>Intensity</span>
                    <select name="intensity" value={filters.intensity} onChange={handleChange} disabled={!isEditable}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </label>

                <div className="btns">
                    <button onClick={handleRandomize} disabled={!isEditable}>Randomize</button>
                    <button onClick={handleSave} className="save" disabled={!canSave}>Save Plan</button>
                </div>
            </Styled.Controls>

            {!plan && noSavedMsg && <Styled.Empty>{noSavedMsg}</Styled.Empty>}

            {plan && (
                <Styled.PlanCard>
                    <div className="plan-head">
                        <div>
                            <strong>{prettyDate(plan.date)}</strong>
                            {loadedFromStorage ? <span className="tag">Loaded</span> : <span className="tag outline">New</span>}
                        </div>
                        <div className="meta">
                            <span>{plan.filters.equipment === "Any" ? "Any equipment" : plan.filters.equipment}</span>
                            <span>{plan.filters.focus} focus</span>
                            <span>{plan.filters.duration} min</span>
                            <span>{plan.filters.intensity}</span>
                        </div>
                    </div>

                    <section>
                        <h4>Warm-up</h4>
                        <ol>
                            {plan.warmup.map((ex, i) => (
                                <li key={`w-${i}`}>
                                    <span className="ex">{ex.name}</span>
                                    <span className="set">{ex.set}</span>
                                </li>
                            ))}
                        </ol>
                    </section>

                    <section>
                        <h4>Main</h4>
                        <ol>
                            {plan.main.map((ex, i) => (
                                <li key={`m-${i}`}>
                                    <span className="ex">{ex.name}</span>
                                    <span className="set">{ex.set}</span>
                                </li>
                            ))}
                        </ol>
                    </section>

                    <section>
                        <h4>Finisher</h4>
                        <ol>
                            {plan.finisher.map((ex, i) => (
                                <li key={`f-${i}`}>
                                    <span className="ex">{ex.name}</span>
                                    <span className="set">{ex.set}</span>
                                </li>
                            ))}
                        </ol>
                    </section>

                    <p className="note">Tip: Keep form clean. If anything hurts (pain, not effort), skip it.</p>
                </Styled.PlanCard>
            )}
        </Styled.Wrapper>
    );
}

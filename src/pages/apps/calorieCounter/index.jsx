import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

const STORAGE_KEY = "calorie-counter.v1";
const GOAL_KEY_V2 = "calorie-counter.goal.v2";      // new key to avoid stale values on deploy
const GOAL_KEY_LEGACY = "calorie-counter.goal";     // old key (fallback)
const DEFAULT_GOAL = 2000;
const UNIT = "kcal"; // UI label only. Switch to "cal" if you prefer.

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

const todayISO = () => {
    const t = new Date();
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, "0");
    const dd = String(t.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const fmtDateNice = (iso) => {
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

const loadMeals = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; }
    catch { return []; }
};

const loadGoal = () => {
    const v2 = Number(localStorage.getItem(GOAL_KEY_V2));
    if (Number.isFinite(v2) && v2 > 0) return v2;
    const legacy = Number(localStorage.getItem(GOAL_KEY_LEGACY));
    if (Number.isFinite(legacy) && legacy > 0) return legacy;
    return DEFAULT_GOAL;
};

export default function CalorieCounter() {
    // data
    const [meals, setMeals] = useState(loadMeals);
    const [goal, setGoal] = useState(loadGoal);

    // add form
    const [name, setName] = useState("");
    const [kcal, setKcal] = useState("");
    const [mealType, setMealType] = useState("Breakfast");
    const [date, setDate] = useState(todayISO());

    // filters/ui
    const [selectedDate, setSelectedDate] = useState(todayISO());
    const [query, setQuery] = useState("");
    const [editing, setEditing] = useState(null);

    // goal input (editable) mirrors current goal
    const [newGoal, setNewGoal] = useState(loadGoal());
    useEffect(() => setNewGoal(goal), [goal]);

    // confirm modal
    const [confirm, setConfirm] = useState(null); // {title, message, confirmText, cancelText, tone, onConfirm}
    const askConfirm = (opts) =>
        setConfirm({ title: "Are you sure?", message: "", confirmText: "Confirm", cancelText: "Cancel", tone: "default", ...opts });
    const handleConfirm = () => { const fn = confirm?.onConfirm; setConfirm(null); if (typeof fn === "function") fn(); };
    useEffect(() => {
        if (!confirm) return;
        const onKey = (e) => { if (e.key === "Escape") setConfirm(null); if (e.key === "Enter") handleConfirm(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [confirm]);

    // persist
    useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(meals)); }, [meals]);
    useEffect(() => { localStorage.setItem(GOAL_KEY_V2, String(goal)); }, [goal]);

    // derived
    const mealsForDay = useMemo(() => {
        let list = meals.filter((m) => m.date === selectedDate);
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter((m) => m.name.toLowerCase().includes(q));
        }
        const order = ["Breakfast", "Lunch", "Dinner", "Snack", "Other"];
        return [...list].sort((a, b) => {
            const oa = order.indexOf(a.mealType);
            const ob = order.indexOf(b.mealType);
            return oa !== ob ? oa - ob : b.createdAt - a.createdAt;
        });
    }, [meals, selectedDate, query]);

    const grouped = useMemo(() => {
        const map = new Map();
        for (const m of mealsForDay) {
            const key = m.mealType || "Other";
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(m);
        }
        return Array.from(map.entries());
    }, [mealsForDay]);

    const totalKcal = useMemo(
        () => meals.filter((m) => m.date === selectedDate).reduce((sum, m) => sum + (Number(m.kcal) || 0), 0),
        [meals, selectedDate]
    );
    const pctOfGoal = goal > 0 ? Math.min(999, Math.round((totalKcal / goal) * 100)) : 0;
    const remaining = Math.max(0, goal - totalKcal);
    const over = Math.max(0, totalKcal - goal);

    // actions
    const addMeal = (e) => {
        e.preventDefault();
        const n = name.trim();
        const cals = Math.max(0, Number(kcal) || 0);
        if (!n || !cals) return;
        const newMeal = { id: uid(), name: n, kcal: cals, mealType: mealType || "Other", date: date || todayISO(), createdAt: Date.now() };
        setMeals((prev) => [newMeal, ...prev]);
        setName(""); setKcal(""); setMealType("Breakfast"); setDate(selectedDate);
    };
    const removeMeal = (id) => setMeals((prev) => prev.filter((m) => m.id !== id));
    const startEdit = (id) => setEditing(id);
    const saveEdit = (id, patch) => { setMeals((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m))); setEditing(null); };
    const cancelEdit = () => setEditing(null);
    const clearDay = () => setMeals((prev) => prev.filter((m) => m.date !== selectedDate));

    const shiftDay = (delta) => {
        const d = new Date(`${selectedDate}T00:00:00`);
        d.setDate(d.getDate() + delta);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        setSelectedDate(`${yyyy}-${mm}-${dd}`);
    };

    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        <Styled.Title>Calorie Counter</Styled.Title>
                        <Styled.Sub>Log meals • Track daily calories • LocalStorage</Styled.Sub>
                    </div>

                    <div style={{ textAlign: "right" }}>
                        <Styled.Badge>{totalKcal} {UNIT} today</Styled.Badge>{" "}
                        <Styled.Badge $tone="muted">Goal: {goal} {UNIT} ({pctOfGoal}%)</Styled.Badge>
                        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
                            {over > 0 ? `Over by ${over} ${UNIT}` : `Remaining ${remaining} ${UNIT}`}
                        </div>
                    </div>
                </Styled.Header>

                {/* Add meal */}
                <Styled.Card as="form" onSubmit={addMeal}>
                    <Styled.FormRow>
                        <Styled.Input
                            placeholder="Meal name *"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            aria-label="Meal name"
                            required
                        />
                        <Styled.Input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            step="1"
                            placeholder={`Calories * (${UNIT})`}
                            value={kcal}
                            onChange={(e) => setKcal(e.target.value)}
                            aria-label="Calories"
                        />
                        <Styled.Select value={mealType} onChange={(e) => setMealType(e.target.value)} aria-label="Meal type">
                            <option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option><option>Other</option>
                        </Styled.Select>
                        <Styled.Input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Log date" />
                        <Styled.PrimaryButton type="submit" disabled={!name.trim() || !Number(kcal)}>Add</Styled.PrimaryButton>
                    </Styled.FormRow>
                    {(!name.trim() || !Number(kcal)) && <Styled.Helper>Tip: Enter meal name and calories.</Styled.Helper>}
                </Styled.Card>

                {/* Toolbar */}
                <Styled.Toolbar>
                    <Styled.RowWrap>
                        <Styled.Button type="button" onClick={() => shiftDay(-1)}>◀ Prev</Styled.Button>
                        <Styled.Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value || todayISO())} aria-label="Selected date" style={{ width: 160 }} />
                        <Styled.Button type="button" onClick={() => setSelectedDate(todayISO())}>Today</Styled.Button>
                        <Styled.Button type="button" onClick={() => shiftDay(1)}>Next ▶</Styled.Button>
                    </Styled.RowWrap>

                    <Styled.RowWrap>
                        <Styled.Input
                            placeholder={`Search meals on ${fmtDateNice(selectedDate)}…`}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            aria-label="Search meals"
                            style={{ minWidth: 220 }}
                        />

                        {/* Goal controls */}
                        <Styled.Input
                            type="number"
                            inputMode="numeric"
                            min="1"
                            step="50"
                            value={newGoal}
                            onChange={(e) => setNewGoal(Math.max(1, Number(e.target.value) || 0))}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && Number(newGoal) && newGoal !== goal) {
                                    askConfirm({
                                        title: "Update daily goal?",
                                        message: `Set goal to ${newGoal} ${UNIT}?`,
                                        confirmText: "Set goal",
                                        onConfirm: () => setGoal(Math.max(1, Number(newGoal))),
                                    });
                                }
                            }}
                            aria-label={`Daily goal (${UNIT})`}
                            style={{ width: 160 }}
                        />
                        <Styled.Button
                            type="button"
                            onClick={() => {
                                if (!Number(newGoal) || newGoal === goal) return;
                                askConfirm({
                                    title: "Update daily goal?",
                                    message: `Set goal to ${newGoal} ${UNIT}?`,
                                    confirmText: "Set goal",
                                    onConfirm: () => setGoal(Math.max(1, Number(newGoal))),
                                });
                            }}
                        >
                            Set goal
                        </Styled.Button>
                        <Styled.DangerButton
                            type="button"
                            onClick={() =>
                                askConfirm({
                                    title: "Reset goal?",
                                    message: `Reset goal to ${DEFAULT_GOAL} ${UNIT}?`,
                                    confirmText: "Reset",
                                    tone: "danger",
                                    onConfirm: () => { setGoal(DEFAULT_GOAL); setNewGoal(DEFAULT_GOAL); },
                                })
                            }
                        >
                            Reset
                        </Styled.DangerButton>
                    </Styled.RowWrap>

                    <Styled.RowWrap>
                        <Styled.DangerButton
                            type="button"
                            onClick={() =>
                                askConfirm({
                                    title: "Clear this day?",
                                    message: `Remove all meals on ${fmtDateNice(selectedDate)}?`,
                                    confirmText: "Clear day",
                                    tone: "danger",
                                    onConfirm: clearDay,
                                })
                            }
                        >
                            Clear day
                        </Styled.DangerButton>
                    </Styled.RowWrap>
                </Styled.Toolbar>

                {/* Meals list */}
                <Styled.List>
                    {mealsForDay.length === 0 && <Styled.Empty>No meals logged on {fmtDateNice(selectedDate)}.</Styled.Empty>}

                    {grouped.map(([type, arr]) => (
                        <div key={type}>
                            <Styled.GroupHeader>#{type}</Styled.GroupHeader>
                            {arr.map((m) =>
                                editing === m.id ? (
                                    <EditRow key={m.id} item={m} onCancel={cancelEdit} onSave={saveEdit} />
                                ) : (
                                    <Styled.Item key={m.id}>
                                        <Styled.ItemLeft>
                                            <div>
                                                <Styled.ItemTitle>{m.name}</Styled.ItemTitle>
                                                <Styled.ItemMeta>
                                                    <Styled.Tag>#{m.mealType}</Styled.Tag>
                                                    <span>•</span>
                                                    <span>{m.kcal} {UNIT}</span>
                                                    <span>•</span>
                                                    <span>{fmtDateNice(m.date)}</span>
                                                </Styled.ItemMeta>
                                            </div>
                                        </Styled.ItemLeft>

                                        <Styled.ItemRight>
                                            <Styled.IconButton onClick={() => startEdit(m.id)} aria-label="Edit">✏️</Styled.IconButton>
                                            <Styled.IconButton
                                                onClick={() =>
                                                    askConfirm({
                                                        title: "Delete meal?",
                                                        message: `Delete “${m.name}” (${m.kcal} ${UNIT})?`,
                                                        confirmText: "Delete",
                                                        tone: "danger",
                                                        onConfirm: () => removeMeal(m.id),
                                                    })
                                                }
                                                aria-label="Delete"
                                            >
                                                🗑️
                                            </Styled.IconButton>
                                        </Styled.ItemRight>
                                    </Styled.Item>
                                )
                            )}
                        </div>
                    ))}
                </Styled.List>

                <Styled.FooterNote>Data stays in your browser (localStorage). Refresh-safe.</Styled.FooterNote>

                {/* Confirm Modal */}
                {confirm && (
                    <Styled.ModalOverlay onClick={() => setConfirm(null)}>
                        <Styled.ModalCard role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(e) => e.stopPropagation()}>
                            <Styled.ModalTitle id="confirm-title">{confirm.title}</Styled.ModalTitle>
                            {confirm.message ? <Styled.ModalMessage>{confirm.message}</Styled.ModalMessage> : null}
                            <Styled.ModalActions>
                                <Styled.Button type="button" onClick={() => setConfirm(null)}>{confirm.cancelText || "Cancel"}</Styled.Button>
                                {confirm.tone === "danger" ? (
                                    <Styled.DangerButton type="button" onClick={handleConfirm} autoFocus>{confirm.confirmText || "Confirm"}</Styled.DangerButton>
                                ) : (
                                    <Styled.PrimaryButton type="button" onClick={handleConfirm} autoFocus>{confirm.confirmText || "Confirm"}</Styled.PrimaryButton>
                                )}
                            </Styled.ModalActions>
                        </Styled.ModalCard>
                    </Styled.ModalOverlay>
                )}
            </Styled.Container>
        </Styled.Page>
    );
}

function EditRow({ item, onCancel, onSave }) {
    const [n, setN] = useState(item.name);
    const [k, setK] = useState(item.kcal);
    const [t, setT] = useState(item.mealType || "Other");

    return (
        <Styled.Item
            as="form"
            onSubmit={(e) => {
                e.preventDefault();
                const name = n.trim();
                const kcal = Math.max(0, Number(k) || 0);
                if (!name || !kcal) return;
                onSave(item.id, { name, kcal, mealType: t });
            }}
        >
            <Styled.ItemLeft style={{ alignItems: "center" }}>
                <Styled.Input value={n} onChange={(e) => setN(e.target.value)} aria-label="Edit meal" placeholder="Meal name *" required />
                <Styled.Input type="number" min="0" step="1" value={k} onChange={(e) => setK(e.target.value)} aria-label="Edit calories" style={{ maxWidth: 140 }} />
                <Styled.Select value={t} onChange={(e) => setT(e.target.value)} aria-label="Edit type" style={{ maxWidth: 160 }}>
                    <option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option><option>Other</option>
                </Styled.Select>
            </Styled.ItemLeft>
            <Styled.ItemRight>
                <Styled.PrimaryButton type="submit">Save</Styled.PrimaryButton>
                <Styled.Button type="button" onClick={onCancel}>Cancel</Styled.Button>
            </Styled.ItemRight>
        </Styled.Item>
    );
}

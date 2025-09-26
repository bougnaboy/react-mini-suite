import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/* -------------------------
   Storage & helpers
------------------------- */
const STORAGE_KEY = "unitConverter.v1";

const formatDateNice = (ts) =>
    new Date(ts).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });

const formatTimeNice = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });


/* Short uid for history items */
const uid = () =>
    crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

/* Safe LocalStorage IO */
const safeGet = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? { history: [] }; }
    catch { return { history: [] }; }
};
const safeSet = (obj) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }
    catch { }
};

/* Clamp + number formatting */
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const formatNum = (n, decimals = 4) => {
    if (!isFinite(n)) return "—";
    const d = clamp(Number(decimals) || 0, 0, 12);
    const s = n.toFixed(d);
    return d ? s.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "") : s;
};

/* -------------------------
   Units & conversion tables
   (linear categories convert via a base unit using factorToBase)
------------------------- */
const CATS = {
    /* ---------- Length ---------- */
    length: {
        label: "Length",
        base: "m",
        units: {
            nm: { label: "Nanometer (nm)", factorToBase: 1e-9 },
            um: { label: "Micrometer (µm)", factorToBase: 1e-6 },
            mm: { label: "Millimeter (mm)", factorToBase: 0.001 },
            cm: { label: "Centimeter (cm)", factorToBase: 0.01 },
            m: { label: "Meter (m)", factorToBase: 1 },
            km: { label: "Kilometer (km)", factorToBase: 1000 },
            in: { label: "Inch (in)", factorToBase: 0.0254 },
            ft: { label: "Foot (ft)", factorToBase: 0.3048 },
            yd: { label: "Yard (yd)", factorToBase: 0.9144 },
            mi: { label: "Mile (mi)", factorToBase: 1609.344 },
            nmi: { label: "Nautical Mile (nmi)", factorToBase: 1852 },
        },
    },

    /* ---------- Mass ---------- */
    mass: {
        label: "Mass",
        base: "kg",
        units: {
            mg: { label: "Milligram (mg)", factorToBase: 1e-6 },
            g: { label: "Gram (g)", factorToBase: 0.001 },
            kg: { label: "Kilogram (kg)", factorToBase: 1 },
            t: { label: "Tonne (t)", factorToBase: 1000 },
            oz: { label: "Ounce (oz)", factorToBase: 0.028349523125 },
            lb: { label: "Pound (lb)", factorToBase: 0.45359237 },
            st: { label: "Stone (st)", factorToBase: 6.35029318 },
        },
    },

    /* ---------- Temperature (special) ---------- */
    temperature: {
        label: "Temperature",
        base: "K",
        units: {
            C: { label: "Celsius (°C)" },
            F: { label: "Fahrenheit (°F)" },
            K: { label: "Kelvin (K)" },
            R: { label: "Rankine (°R)" }, // extra
        },
    },

    /* ---------- Volume ---------- */
    volume: {
        label: "Volume",
        base: "L",
        units: {
            mL: { label: "Milliliter (mL)", factorToBase: 0.001 },
            L: { label: "Liter (L)", factorToBase: 1 },
            cm3: { label: "Cubic Centimeter (cm³)", factorToBase: 0.001 },
            m3: { label: "Cubic Meter (m³)", factorToBase: 1000 },
            tsp: { label: "Teaspoon US (tsp)", factorToBase: 0.00492892159375 },
            tbsp: { label: "Tablespoon US (tbsp)", factorToBase: 0.01478676478125 },
            "fl oz": { label: "Fluid Ounce US (fl oz)", factorToBase: 0.0295735295625 },
            cup: { label: "Cup US (cup)", factorToBase: 0.2365882365 },
            pt: { label: "Pint US (pt)", factorToBase: 0.473176473 },
            qt: { label: "Quart US (qt)", factorToBase: 0.946352946 },
            gal: { label: "Gallon US (gal)", factorToBase: 3.785411784 },
        },
    },

    /* ---------- Area ---------- */
    area: {
        label: "Area",
        base: "m²",
        units: {
            "cm²": { label: "Square Centimeter (cm²)", factorToBase: 0.0001 },
            "m²": { label: "Square Meter (m²)", factorToBase: 1 },
            "km²": { label: "Square Kilometer (km²)", factorToBase: 1_000_000 },
            "in²": { label: "Square Inch (in²)", factorToBase: 0.00064516 },
            "ft²": { label: "Square Foot (ft²)", factorToBase: 0.09290304 },
            "yd²": { label: "Square Yard (yd²)", factorToBase: 0.83612736 },
            acre: { label: "Acre", factorToBase: 4046.8564224 },
            ha: { label: "Hectare (ha)", factorToBase: 10_000 },
            "mi²": { label: "Square Mile (mi²)", factorToBase: 2_589_988.110336 },
        },
    },

    /* ---------- Speed ---------- */
    speed: {
        label: "Speed",
        base: "m/s",
        units: {
            "m/s": { label: "Meters per second (m/s)", factorToBase: 1 },
            "km/h": { label: "Kilometers per hour (km/h)", factorToBase: 1000 / 3600 },
            mph: { label: "Miles per hour (mph)", factorToBase: 0.44704 },
            "ft/s": { label: "Feet per second (ft/s)", factorToBase: 0.3048 },
            kn: { label: "Knot (kn)", factorToBase: 0.514444444 },
        },
    },

    /* ---------- Pressure ---------- */
    pressure: {
        label: "Pressure",
        base: "Pa",
        units: {
            Pa: { label: "Pascal (Pa)", factorToBase: 1 },
            kPa: { label: "Kilopascal (kPa)", factorToBase: 1000 },
            MPa: { label: "Megapascal (MPa)", factorToBase: 1e6 },
            bar: { label: "Bar", factorToBase: 1e5 },
            atm: { label: "Standard atmosphere (atm)", factorToBase: 101325 },
            mmHg: { label: "Millimeter of mercury (mmHg)", factorToBase: 133.322368 },
            psi: { label: "Pound-force per square inch (psi)", factorToBase: 6894.757293168 },
        },
    },

    /* ---------- Energy ---------- */
    energy: {
        label: "Energy",
        base: "J",
        units: {
            J: { label: "Joule (J)", factorToBase: 1 },
            kJ: { label: "Kilojoule (kJ)", factorToBase: 1000 },
            cal: { label: "Calorie (cal)", factorToBase: 4.184 },
            kcal: { label: "Kilocalorie (kcal)", factorToBase: 4184 },
            Wh: { label: "Watt-hour (Wh)", factorToBase: 3600 },
            kWh: { label: "Kilowatt-hour (kWh)", factorToBase: 3.6e6 },
            BTU: { label: "British thermal unit (BTU)", factorToBase: 1055.05585 },
        },
    },

    /* ---------- Power ---------- */
    power: {
        label: "Power",
        base: "W",
        units: {
            W: { label: "Watt (W)", factorToBase: 1 },
            kW: { label: "Kilowatt (kW)", factorToBase: 1000 },
            MW: { label: "Megawatt (MW)", factorToBase: 1e6 },
            hp: { label: "Horsepower (hp)", factorToBase: 745.699872 },
        },
    },

    /* ---------- Time ---------- */
    time: {
        label: "Time",
        base: "s",
        units: {
            ms: { label: "Millisecond (ms)", factorToBase: 0.001 },
            s: { label: "Second (s)", factorToBase: 1 },
            min: { label: "Minute (min)", factorToBase: 60 },
            h: { label: "Hour (h)", factorToBase: 3600 },
            day: { label: "Day", factorToBase: 86400 },
            week: { label: "Week", factorToBase: 604800 },
        },
    },

    /* ---------- Angle ---------- */
    angle: {
        label: "Angle",
        base: "rad",
        units: {
            rad: { label: "Radian (rad)", factorToBase: 1 },
            deg: { label: "Degree (°)", factorToBase: Math.PI / 180 },
            grad: { label: "Gradian (gon)", factorToBase: Math.PI / 200 },
        },
    },

    /* ---------- Data (decimal) ---------- */
    data: {
        label: "Data (decimal)",
        base: "B",
        units: {
            b: { label: "bit (b)", factorToBase: 1 / 8 },
            B: { label: "Byte (B)", factorToBase: 1 },
            kB: { label: "Kilobyte (kB)", factorToBase: 1e3 },
            MB: { label: "Megabyte (MB)", factorToBase: 1e6 },
            GB: { label: "Gigabyte (GB)", factorToBase: 1e9 },
            TB: { label: "Terabyte (TB)", factorToBase: 1e12 },
        },
    },
};

/* Sorted dropdown entries */
const sortedUnitEntries = (catKey) =>
    Object.entries(CATS[catKey].units).sort((a, b) =>
        (a[1].label || a[0]).localeCompare(b[1].label || b[0])
    );

/* SAFE linear conversion via base unit (guards missing units) */
const convertLinear = (catKey, from, to, value) => {
    const cat = CATS[catKey];
    if (!cat) return NaN;
    const fu = cat.units[from];
    const tu = cat.units[to];
    if (!fu || !tu) return NaN; // guard to avoid crash during category switches
    const toBase = (Number(value) || 0) * (fu.factorToBase || 1);
    return toBase / (tu.factorToBase || 1);
};

/* Temperature conversions (via Kelvin + Rankine support) */
const toKelvin = (u, v) => {
    v = Number(v) || 0;
    if (u === "K") return v;
    if (u === "C") return v + 273.15;
    if (u === "F") return (v - 32) * (5 / 9) + 273.15;
    if (u === "R") return v * (5 / 9);
    return v;
};
const fromKelvin = (u, vK) => {
    if (u === "K") return vK;
    if (u === "C") return vK - 273.15;
    if (u === "F") return (vK - 273.15) * (9 / 5) + 32;
    if (u === "R") return vK * (9 / 5);
    return vK;
};
const convertTemperature = (from, to, value) =>
    fromKelvin(to, toKelvin(from, value));

/* -------------------------
   Main
------------------------- */
export default function UnitConverter() {
    const persisted = safeGet();

    /* --- form state --- */
    const [category, setCategory] = useState("length");
    const [fromUnit, setFromUnit] = useState("m");
    const [toUnit, setToUnit] = useState("ft");
    const [value, setValue] = useState("");
    const [decimals, setDecimals] = useState(4);

    /* --- history (bottom) --- */
    const [history, setHistory] = useState(() => persisted.history || []);

    /* --- UI helpers --- */
    const [copied, setCopied] = useState(false);
    const copyTimer = useRef(null);

    // confirm modal
    const [confirm, setConfirm] = useState(null);
    const askConfirm = (opts) =>
        setConfirm({
            title: "Are you sure?",
            message: "",
            confirmText: "Confirm",
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
    useEffect(() => {
        if (!confirm) return;
        const onKey = (e) => {
            if (e.key === "Escape") setConfirm(null);
            if (e.key === "Enter") handleConfirm();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [confirm]);

    // persist history
    useEffect(() => safeSet({ history }), [history]);

    /* --- units list for current category --- */
    const units = useMemo(() => sortedUnitEntries(category), [category]);

    /* ensure from/to are valid whenever category changes */
    useEffect(() => {
        // pick two sensible defaults per category
        if (category === "length") { setFromUnit("m"); setToUnit("ft"); }
        else if (category === "mass") { setFromUnit("kg"); setToUnit("lb"); }
        else if (category === "temperature") { setFromUnit("C"); setToUnit("F"); }
        else if (category === "volume") { setFromUnit("L"); setToUnit("gal"); }
        else if (category === "area") { setFromUnit("m²"); setToUnit("ft²"); }
        else if (category === "speed") { setFromUnit("km/h"); setToUnit("mph"); }
        else if (category === "pressure") { setFromUnit("kPa"); setToUnit("psi"); }
        else if (category === "energy") { setFromUnit("kJ"); setToUnit("kcal"); }
        else if (category === "power") { setFromUnit("kW"); setToUnit("hp"); }
        else if (category === "time") { setFromUnit("min"); setToUnit("h"); }
        else if (category === "angle") { setFromUnit("deg"); setToUnit("rad"); }
        else if (category === "data") { setFromUnit("kB"); setToUnit("MB"); }
    }, [category]);

    /* --- computed result (live & safe) --- */
    const result = useMemo(() => {
        const v = Number(value);
        if (!isFinite(v)) return NaN;

        if (category === "temperature") {
            // units might not be ready during the very first render after switch; still safe
            return convertTemperature(fromUnit, toUnit, v);
        }

        return convertLinear(category, fromUnit, toUnit, v); // returns NaN if units invalid
    }, [category, fromUnit, toUnit, value]);

    /* --- actions --- */
    const swapUnits = () => {
        setFromUnit((prevFrom) => {
            const oldTo = toUnit;
            setToUnit(prevFrom);
            return oldTo;
        });
    };

    const doConvert = (e) => e?.preventDefault?.();

    const saveToHistory = () => {
        const v = Number(value);
        const r = Number(result);
        if (!isFinite(v) || !isFinite(r)) return;
        const item = {
            id: uid(),
            at: Date.now(),
            category,
            from: fromUnit,
            to: toUnit,
            value: v,
            result: r,
            decimals: clamp(Number(decimals) || 0, 0, 12),
        };
        setHistory((prev) => [item, ...prev]);
    };

    const removeOne = (id) => {
        askConfirm({
            title: "Delete entry?",
            message: "This will remove it from your history.",
            confirmText: "Delete",
            onConfirm: () => setHistory((prev) => prev.filter((x) => x.id !== id)),
        });
    };

    const clearAll = () => {
        if (!history.length) return;
        askConfirm({
            title: "Clear all history?",
            message: "This will delete every conversion record.",
            confirmText: "Clear All",
            onConfirm: () => setHistory([]),
        });
    };

    const copyLine = async () => {
        const v = Number(value);
        const r = Number(result);
        if (!isFinite(v) || !isFinite(r)) return;
        const txt = `${formatNum(v, decimals)} ${fromUnit} = ${formatNum(r, decimals)} ${toUnit}`;
        try {
            await navigator.clipboard.writeText(txt);
            if (copyTimer.current) clearTimeout(copyTimer.current);
            setCopied(true);
            copyTimer.current = setTimeout(() => setCopied(false), 1200);
        } catch { }
    };

    const copyHistoryItem = async (it) => {
        const txt = `${formatNum(it.value, it.decimals)} ${it.from} = ${formatNum(it.result, it.decimals)} ${it.to}`;
        try {
            await navigator.clipboard.writeText(txt);
            if (copyTimer.current) clearTimeout(copyTimer.current);
            setCopied(true);
            copyTimer.current = setTimeout(() => setCopied(false), 1200);
        } catch { }
    };

    /* -------------------------
       History Filters
    ------------------------- */
    const [q, setQ] = useState("");
    const [filterCat, setFilterCat] = useState("All");
    const [sortBy, setSortBy] = useState("newest"); // newest | oldest | category

    const filtered = useMemo(() => {
        let list = history.slice();

        if (filterCat !== "All") list = list.filter((x) => x.category === filterCat);

        if (q.trim()) {
            const s = q.toLowerCase();
            list = list.filter((x) =>
                String(x.from).toLowerCase().includes(s) ||
                String(x.to).toLowerCase().includes(s) ||
                String(x.value).toLowerCase().includes(s) ||
                String(x.result).toLowerCase().includes(s)
            );
        }

        if (sortBy === "oldest") list.sort((a, b) => a.at - b.at);
        else if (sortBy === "category") list.sort((a, b) => (a.category || "").localeCompare(b.category || "") || b.at - a.at);
        else list.sort((a, b) => b.at - a.at);

        return list;
    }, [history, q, filterCat, sortBy]);

    const resetFilters = () => {
        setQ("");
        setFilterCat("All");
        setSortBy("newest");
    };

    const stats = useMemo(() => ({
        categories: Object.keys(CATS).length,
        historyCount: history.length,
    }), [history.length]);

    useEffect(() => {
        document.title = "Unit Converter";
        return () => { document.title = "Unit Converter"; };
    }, []);

    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        <Styled.Title>Unit Converter</Styled.Title>
                        <div style={{ height: 8 }} />
                        <Styled.Sub>
                            A clean, offline-first unit converter with broad coverage: length, mass, temperature,
                            volume, area, speed, pressure, energy, power, time, angle, and data. Convert instantly,
                            copy the result, and keep a searchable history — everything stays in LocalStorage.
                        </Styled.Sub>
                        <div style={{ height: 6 }} />
                        <Styled.BulletList aria-label="How to use steps">
                            <Styled.BulletItem>Select a category, choose the from/to units, and enter a value.</Styled.BulletItem>
                            <Styled.BulletItem>Use Swap to flip units; pick decimal precision if needed.</Styled.BulletItem>
                            <Styled.BulletItem>Result updates live. Copy or Save to history.</Styled.BulletItem>
                        </Styled.BulletList>
                        <div style={{ height: 10 }} />
                    </div>
                    <Styled.BadgeRow>
                        <Styled.Tag>Categories: {stats.categories}</Styled.Tag>
                        <Styled.Tag $tone="muted">History: {stats.historyCount}</Styled.Tag>
                    </Styled.BadgeRow>
                </Styled.Header>

                {/* Converter */}
                <Styled.Card as="form" onSubmit={doConvert}>
                    <Styled.FormRow>
                        <Styled.Label title="Measurement category">
                            <Styled.LabelText>Category</Styled.LabelText>
                            <Styled.Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
                                {Object.entries(CATS).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </Styled.Select>
                        </Styled.Label>

                        <Styled.Label title="Convert from this unit">
                            <Styled.LabelText>From</Styled.LabelText>
                            <Styled.Select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} aria-label="From unit">
                                {units.map(([k, v]) => <option key={k} value={k}>{v.label || k}</option>)}
                            </Styled.Select>
                        </Styled.Label>

                        <Styled.Label title="Convert to this unit">
                            <Styled.LabelText>To</Styled.LabelText>
                            <Styled.Select value={toUnit} onChange={(e) => setToUnit(e.target.value)} aria-label="To unit">
                                {units.map(([k, v]) => <option key={k} value={k}>{v.label || k}</option>)}
                            </Styled.Select>
                        </Styled.Label>

                        <Styled.Label title="Numeric value to convert">
                            <Styled.LabelText>Value</Styled.LabelText>
                            <Styled.Input
                                type="number"
                                inputMode="decimal"
                                placeholder="Enter value"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                aria-label="Value"
                            />
                        </Styled.Label>

                        <Styled.Label title="Decimal places in display">
                            <Styled.LabelText>Decimals</Styled.LabelText>
                            <Styled.Select value={decimals} onChange={(e) => setDecimals(Number(e.target.value) || 0)} aria-label="Decimals">
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => <option key={n} value={n}>{n}</option>)}
                            </Styled.Select>
                        </Styled.Label>

                        <Styled.RowWrap style={{ alignSelf: "end" }}>
                            <Styled.Button type="button" onClick={swapUnits} title="Swap units">Swap</Styled.Button>
                        </Styled.RowWrap>
                    </Styled.FormRow>

                    {/* Live result */}
                    <Styled.ResultCard aria-live="polite">
                        <Styled.ResultValue>
                            {isFinite(Number(value)) && isFinite(result)
                                ? `${formatNum(Number(value), decimals)} ${fromUnit} = ${formatNum(result, decimals)} ${toUnit}`
                                : "—"}
                        </Styled.ResultValue>
                        <Styled.ResultMeta>
                            1 {fromUnit} ={" "}
                            {isFinite(result)
                                ? formatNum(
                                    category === "temperature"
                                        ? convertTemperature(fromUnit, toUnit, 1)
                                        : convertLinear(category, fromUnit, toUnit, 1),
                                    decimals
                                )
                                : "—"}{" "}
                            {toUnit}
                        </Styled.ResultMeta>

                        <Styled.RowWrap style={{ marginTop: 10 }}>
                            <Styled.Button type="button" onClick={copyLine} title="Copy result line">Copy</Styled.Button>
                            <Styled.PrimaryButton type="submit" title="Convert">Convert</Styled.PrimaryButton>
                            <Styled.Button type="button" onClick={saveToHistory} title="Save this conversion in history">Save to history</Styled.Button>
                        </Styled.RowWrap>
                    </Styled.ResultCard>
                </Styled.Card>

                {/* ------- Results (History) ------- */}
                <div style={{ marginTop: 24 }} />
                <Styled.SectionTitle>Results (History)</Styled.SectionTitle>
                <div style={{ height: 8 }} />
                <Styled.Card>
                    <Styled.FormRow>
                        <Styled.Label title="Search in units/values">
                            <Styled.LabelText>Search</Styled.LabelText>
                            <Styled.Input
                                placeholder="Search units/values…"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                aria-label="Search history"
                            />
                        </Styled.Label>

                        <Styled.Label title="Filter by category">
                            <Styled.LabelText>Category</Styled.LabelText>
                            <Styled.Select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} aria-label="Filter category">
                                <option value="All">All</option>
                                {Object.entries(CATS).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </Styled.Select>
                        </Styled.Label>

                        <Styled.Label title="Sort the list">
                            <Styled.LabelText>Sort by</Styled.LabelText>
                            <Styled.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort history">
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                                <option value="category">Category</option>
                            </Styled.Select>
                        </Styled.Label>

                        <Styled.RowWrap>
                            <Styled.Button type="button" onClick={resetFilters} title="Reset filters">Reset</Styled.Button>
                            <Styled.DangerButton type="button" onClick={clearAll} title="Delete all history">Clear All</Styled.DangerButton>
                        </Styled.RowWrap>
                    </Styled.FormRow>
                </Styled.Card>

                <div style={{ height: 10 }} />
                <Styled.List>
                    {filtered.length === 0 && history.length === 0 && (
                        <Styled.Empty>No history yet. Convert and save your first entry!</Styled.Empty>
                    )}
                    {filtered.length === 0 && history.length > 0 && (
                        <Styled.Empty>No results match your current filters. Try Reset.</Styled.Empty>
                    )}

                    {filtered.map((it) => (
                        <Styled.Item key={it.id}>
                            <Styled.ItemLeft>
                                <Styled.ItemTitle>
                                    {formatNum(it.value, it.decimals)} {it.from} = {formatNum(it.result, it.decimals)} {it.to}
                                </Styled.ItemTitle>
                                <Styled.ItemMeta>
                                    <Styled.Tag>#{CATS[it.category]?.label || it.category}</Styled.Tag>
                                    <span>•</span>
                                    <Styled.Tag $tone="muted">
                                        {formatDateNice(it.at)} • {formatTimeNice(it.at)}
                                    </Styled.Tag>
                                </Styled.ItemMeta>
                            </Styled.ItemLeft>
                            <Styled.ItemRight>
                                <Styled.Button onClick={() => copyHistoryItem(it)} title="Copy line">Copy</Styled.Button>
                                <Styled.Button onClick={() => removeOne(it.id)} title="Delete">Delete</Styled.Button>
                            </Styled.ItemRight>
                        </Styled.Item>
                    ))}
                </Styled.List>

                <Styled.FooterNote>Data stays in your browser (LocalStorage). Works offline.</Styled.FooterNote>

                {/* Confirm Modal */}
                {confirm && (
                    <Styled.ModalOverlay onClick={() => setConfirm(null)}>
                        <Styled.ModalCard role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(e) => e.stopPropagation()}>
                            <Styled.ModalTitle id="confirm-title">{confirm.title}</Styled.ModalTitle>
                            {confirm.message ? <Styled.ModalMessage>{confirm.message}</Styled.ModalMessage> : null}
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

            {/* Copied toast */}
            {copied && <Styled.Toast role="status" aria-live="polite">Copied</Styled.Toast>}
        </Styled.Page>
    );
}

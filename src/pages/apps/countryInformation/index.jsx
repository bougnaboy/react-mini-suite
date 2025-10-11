import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/* =========================================================
   REST Countries v3 helper
   ========================================================= */
const API = "https://restcountries.com/v3.1";
const FIELDS =
    "name,flags,capital,region,subregion,cca2,cca3,ccn3,cioc,independent,unMember,area,population,timezones,borders,maps,languages,currencies,idd,tld,latlng,coatOfArms,startOfWeek,car";

const CACHE_KEY = "countryInfo_cache_v1";
const FAV_KEY = "countryInfo_favorites_v1";

/* tiny helpers */
const fmtNumber = (n) => (typeof n === "number" ? n.toLocaleString("en-IN") : n);
const list = (arr) => (Array.isArray(arr) && arr.length ? arr.join(", ") : "—");

/* extract currencies as "INR (Indian Rupee)" */
function currenciesToText(obj) {
    if (!obj) return "—";
    try {
        return Object.entries(obj)
            .map(([code, val]) => `${code}${val?.name ? ` (${val.name})` : ""}`)
            .join(", ");
    } catch {
        return "—";
    }
}

/* extract languages as "English, Hindi" */
function languagesToText(obj) {
    if (!obj) return "—";
    try {
        return Object.values(obj).join(", ");
    } catch {
        return "—";
    }
}

/* phone code: idd.root + idd.suffixes */
function phoneCode(idd) {
    const r = idd?.root || "";
    const s = Array.isArray(idd?.suffixes) ? idd.suffixes[0] || "" : "";
    return r || s ? `${r}${s}` : "—";
}

/* =========================================================
   Confirm Modal (self-contained for this mini-app)
   ========================================================= */
function ConfirmModal({
    open,
    title = "Confirm",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onClose,
}) {
    if (!open) return null;
    return (
        <Styled.ModalOverlay role="dialog" aria-modal="true">
            <Styled.Modal>
                <header>
                    <h3>{title}</h3>
                </header>
                <div className="body">
                    <p>{message}</p>
                </div>
                <footer>
                    <button className="ghost" onClick={onClose}>{cancelText}</button>
                    <button
                        className="danger"
                        onClick={() => {
                            onConfirm?.();
                            onClose?.();
                        }}
                    >
                        {confirmText}
                    </button>
                </footer>
            </Styled.Modal>
        </Styled.ModalOverlay>
    );
}

/* =========================================================
   Main Component
   ========================================================= */
const SUGGESTED = ["India", "United States", "Germany", "Japan", "Australia", "France", "Brazil"];

const CountryInformation = () => {
    const [q, setQ] = useState("");
    const [results, setResults] = useState([]);           // countries array
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [selected, setSelected] = useState(null);       // selected country object
    const [favorites, setFavorites] = useState(() => {
        try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); } catch { return []; }
    });
    const [confirm, setConfirm] = useState({ open: false });

    // cache bucket
    const cacheRef = useRef({});
    useEffect(() => {
        try { cacheRef.current = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); }
        catch { cacheRef.current = {}; }
    }, []);

    // persist favorites
    useEffect(() => {
        try { localStorage.setItem(FAV_KEY, JSON.stringify(favorites)); } catch { }
    }, [favorites]);

    const detailRef = useRef(null);
    const inputRef = useRef(null);
    useEffect(() => { inputRef.current?.focus(); }, []);

    /* ---------------------------------------------
       Fetch helpers with cache
       --------------------------------------------- */
    async function fetchByName(name) {
        const key = `name:${name.toLowerCase()}`;
        if (cacheRef.current[key]) return cacheRef.current[key];

        const url = `${API}/name/${encodeURIComponent(name)}?fields=${FIELDS}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(res.status === 404 ? "No matches found." : "Request failed.");
        const data = await res.json();
        cacheRef.current[key] = data;
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(cacheRef.current)); } catch { }
        return data;
    }

    async function fetchByCodes(codes = []) {
        if (!codes.length) return [];
        const key = `alpha:${codes.sort().join(",")}`;
        if (cacheRef.current[key]) return cacheRef.current[key];
        const url = `${API}/alpha?codes=${codes.join(",")}&fields=name,cca3,flags`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load borders.");
        const data = await res.json();
        cacheRef.current[key] = data;
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(cacheRef.current)); } catch { }
        return data;
    }

    /* ---------------------------------------------
       Search handlers
       --------------------------------------------- */
    const doSearch = async (name) => {
        const query = (name ?? q).trim();
        if (!query) {
            setErr("Type a country name to search.");
            setResults([]);
            setSelected(null);
            return;
        }
        setLoading(true);
        setErr("");
        try {
            const data = await fetchByName(query);
            setResults(data);
            setSelected(data[0] || null);
        } catch (e) {
            setResults([]);
            setSelected(null);
            setErr(e.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter") doSearch();
        if (e.key === "Escape") {
            setQ("");
            setErr("");
            setResults([]);
            setSelected(null);
        }
    };

    /* ---------------------------------------------
       Favorite handlers
       --------------------------------------------- */
    const isFav = (cca3) => favorites.some((f) => f.cca3 === cca3);

    const addFav = (country) => {
        const item = {
            cca3: country?.cca3,
            name: country?.name?.common || "",
            flag: country?.flags?.png || country?.flags?.svg || "",
            region: country?.region || "",
            capital: Array.isArray(country?.capital) ? country.capital[0] : "",
        };
        if (!item.cca3) return;
        if (isFav(item.cca3)) return;
        const next = [item, ...favorites].slice(0, 100);
        setFavorites(next);
    };

    const removeFav = (cca3) => {
        setConfirm({
            open: true,
            title: "Remove Favorite?",
            message: "This country will be removed from your favorites.",
            confirmText: "Remove",
            onConfirm: () => setFavorites((arr) => arr.filter((f) => f.cca3 !== cca3)),
        });
    };

    const clearFavs = () => {
        if (!favorites.length) return;
        setConfirm({
            open: true,
            title: "Clear All Favorites?",
            message: "This will remove all saved favorites.",
            confirmText: "Clear",
            onConfirm: () => setFavorites([]),
        });
    };

    const clearCache = () => {
        setConfirm({
            open: true,
            title: "Clear Cached Results?",
            message: "Cached API responses will be cleared.",
            confirmText: "Clear Cache",
            onConfirm: () => {
                cacheRef.current = {};
                try { localStorage.removeItem(CACHE_KEY); } catch { }
            },
        });
    };

    /* ---------------------------------------------
       Neighbors (borders)
       --------------------------------------------- */
    const [borders, setBorders] = useState([]);
    useEffect(() => {
        let alive = true;
        async function run() {
            try {
                const codes = selected?.borders || [];
                if (!codes.length) { setBorders([]); return; }
                const data = await fetchByCodes(codes);
                if (alive) setBorders(data);
            } catch {
                if (alive) setBorders([]);
            }
        }
        run();
        return () => { alive = false; };
    }, [selected]);

    /* ---------------------------------------------
       Print single section
       --------------------------------------------- */
    const printDetails = () => {
        if (!detailRef.current) return;
        const w = window.open("", "_blank", "width=800,height=900");
        if (!w) return;
        const styles = `
      <style>
        :root { color-scheme: light dark; }
        body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 20px; }
        h1,h2,h3 { margin: 0 0 8px 0; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
        .row { display: contents; }
        .label { color: #666; }
        .value { color: #000; }
        .flag { max-width: 160px; border: 1px solid #ddd; border-radius: 8px; }
        @media (prefers-color-scheme: dark) {
          .value { color: #fff; }
          .label { color: #aaa; }
          .flag { border-color: #444; }
        }
      </style>
    `;
        w.document.write(`<html><head><title>Country Details</title>${styles}</head><body>${detailRef.current.innerHTML}</body></html>`);
        w.document.close();
        w.focus();
        w.print();
        w.close();
    };

    /* ---------------------------------------------
       Derived data for details panel
       --------------------------------------------- */
    const detail = useMemo(() => {
        const c = selected;
        if (!c) return null;
        const capital = list(c.capital);
        const tz = list(c.timezones);
        const langs = languagesToText(c.languages);
        const curr = currenciesToText(c.currencies);
        const coords = Array.isArray(c.latlng) ? c.latlng.map((x) => x.toFixed(2)).join(", ") : "—";
        const tld = list(c.tld);
        const area = fmtNumber(c.area);
        const pop = fmtNumber(c.population);
        return { capital, tz, langs, curr, coords, tld, area, pop };
    }, [selected]);

    return (
        <Styled.Wrapper>
            {/* Header */}
            <Styled.Header>
                <div>
                    <h1>Country Information</h1>
                    <p>Curious about countries? Type a name and get quick, reliable basics—flags, capital, languages, currencies, neighbors, and more.</p>
                </div>
                <Styled.Badges>
                    <span className="badge">Live API</span>
                    <span className="badge">Caching</span>
                    <span className="badge">Favorites</span>
                    <span className="badge">Print Section</span>
                </Styled.Badges>
            </Styled.Header>

            {/* Search Row */}
            <Styled.Card>
                <Styled.SearchRow>
                    <input
                        ref={inputRef}
                        type="text"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Start typing: India, United States, Japan..."
                        aria-label="Search country by name"
                    />
                    <button onClick={() => doSearch()} disabled={!q.trim() || loading}>
                        {loading ? "Searching..." : "Search"}
                    </button>
                    <button
                        className="ghost"
                        onClick={() => {
                            setQ("");
                            setErr("");
                            setResults([]);
                            setSelected(null);
                        }}
                    >
                        Clear
                    </button>
                    <div className="spacer" />
                    <button className="ghost" onClick={clearCache} title="Clear cached API responses">
                        Clear Cache
                    </button>
                </Styled.SearchRow>
                {!!err && <Styled.Error role="alert">{err}</Styled.Error>}

                {/* Suggestions */}
                <Styled.Suggestions>
                    {SUGGESTED.map((s) => (
                        <button key={s} onClick={() => { setQ(s); doSearch(s); }}>
                            {s}
                        </button>
                    ))}
                </Styled.Suggestions>
            </Styled.Card>

            <Styled.Layout>
                {/* Results List */}
                <Styled.Card>
                    <h3>Results {results.length ? `(${results.length})` : ""}</h3>
                    {!results.length && !loading && <p className="muted">No results yet. Try a search or click a suggestion.</p>}
                    <Styled.List>
                        {results.map((c) => {
                            const name = c?.name?.common || "—";
                            const sub = [c?.region, c?.subregion].filter(Boolean).join(" • ");
                            const cap = list(c?.capital);
                            const active = selected?.cca3 === c?.cca3;
                            const fav = isFav(c.cca3);
                            return (
                                <Styled.ListItem key={c.cca3} data-active={active}>
                                    <button className="row" onClick={() => setSelected(c)} title="View details">
                                        <img src={c?.flags?.png || c?.flags?.svg} alt={`${name} flag`} />
                                        <div className="meta">
                                            <div className="name">{name}</div>
                                            <div className="sub">{sub || "—"}</div>
                                            <div className="cap">Capital: {cap}</div>
                                        </div>
                                    </button>
                                    <div className="actions">
                                        {!fav ? (
                                            <button className="small" onClick={() => addFav(c)} title="Add to favorites">Save</button>
                                        ) : (
                                            <button className="small danger" onClick={() => removeFav(c.cca3)} title="Remove favorite">Remove</button>
                                        )}
                                    </div>
                                </Styled.ListItem>
                            );
                        })}
                    </Styled.List>
                </Styled.Card>

                {/* Right column */}
                <div className="col">
                    {/* Details */}
                    <Styled.Card>
                        <h3>Details</h3>
                        {!selected && <p className="muted">Select a country from results to see details.</p>}
                        {!!selected && (
                            <>
                                <Styled.Detail ref={detailRef}>
                                    <div className="head">
                                        <img
                                            className="flag"
                                            src={selected?.flags?.png || selected?.flags?.svg}
                                            alt={`${selected?.name?.common} flag`}
                                        />
                                        <div>
                                            <h2>{selected?.name?.common}</h2>
                                            <div className="muted">{selected?.name?.official || "—"}</div>
                                            <div className="muted">CCA3: {selected?.cca3 || "—"}</div>
                                        </div>
                                    </div>

                                    <Styled.Grid two>
                                        <div className="row">
                                            <div className="label">Region</div>
                                            <div className="value">{[selected?.region, selected?.subregion].filter(Boolean).join(" • ") || "—"}</div>
                                        </div>
                                        <div className="row">
                                            <div className="label">Capital</div>
                                            <div className="value">{detail.capital}</div>
                                        </div>
                                        <div className="row">
                                            <div className="label">Population</div>
                                            <div className="value">{detail.pop}</div>
                                        </div>
                                        <div className="row">
                                            <div className="label">Area</div>
                                            <div className="value">{detail.area} km²</div>
                                        </div>
                                        <div className="row">
                                            <div className="label">Languages</div>
                                            <div className="value">{detail.langs}</div>
                                        </div>
                                        <div className="row">
                                            <div className="label">Currencies</div>
                                            <div className="value">{detail.curr}</div>
                                        </div>
                                        <div className="row">
                                            <div className="label">Timezones</div>
                                            <div className="value">{detail.tz}</div>
                                        </div>
                                        <div className="row">
                                            <div className="label">Calling Code</div>
                                            <div className="value">{phoneCode(selected?.idd)}</div>
                                        </div>
                                        <div className="row">
                                            <div className="label">Top-level Domain</div>
                                            <div className="value">{detail.tld}</div>
                                        </div>
                                        <div className="row">
                                            <div className="label">Coordinates</div>
                                            <div className="value">{detail.coords}</div>
                                        </div>
                                        <div className="row">
                                            <div className="label">Independent</div>
                                            <div className="value">{selected?.independent ? "Yes" : "No"}</div>
                                        </div>
                                        <div className="row">
                                            <div className="label">UN Member</div>
                                            <div className="value">{selected?.unMember ? "Yes" : "No"}</div>
                                        </div>
                                    </Styled.Grid>

                                    {!!borders.length && (
                                        <>
                                            <h4>Borders</h4>
                                            <Styled.Chips>
                                                {borders.map((b) => (
                                                    <button
                                                        key={b.cca3}
                                                        onClick={() => {
                                                            const found = results.find((r) => r.cca3 === b.cca3);
                                                            if (found) setSelected(found);
                                                            else doSearch(b.name?.common || b.cca3);
                                                        }}
                                                    >
                                                        <img src={b?.flags?.png || b?.flags?.svg} alt="" />
                                                        <span>
                                                            {b?.name?.common} ({b?.cca3})
                                                        </span>
                                                    </button>
                                                ))}
                                            </Styled.Chips>
                                        </>
                                    )}

                                    <Styled.Links>
                                        {selected?.maps?.googleMaps && (
                                            <a href={selected.maps.googleMaps} target="_blank" rel="noreferrer">
                                                Open in Google Maps
                                            </a>
                                        )}
                                        {selected?.coatOfArms?.png && (
                                            <a href={selected.coatOfArms.png} target="_blank" rel="noreferrer">
                                                View Coat of Arms
                                            </a>
                                        )}
                                    </Styled.Links>
                                </Styled.Detail>

                                <Styled.Actions>
                                    {!isFav(selected?.cca3) ? (
                                        <button onClick={() => addFav(selected)}>Save to Favorites</button>
                                    ) : (
                                        <button className="danger" onClick={() => removeFav(selected?.cca3)}>
                                            Remove Favorite
                                        </button>
                                    )}
                                    <div className="spacer" />
                                    <button className="ghost" onClick={printDetails}>Print Details</button>
                                </Styled.Actions>
                            </>
                        )}
                    </Styled.Card>

                    {/* Favorites */}
                    <Styled.Card>
                        <Styled.FlexHead>
                            <h3>Favorites</h3>
                            <div className="right">
                                <button className="ghost small" onClick={clearFavs} disabled={!favorites.length}>
                                    Clear All
                                </button>
                            </div>
                        </Styled.FlexHead>

                        {!favorites.length && <p className="muted">No favorites yet.</p>}
                        <Styled.FavList>
                            {favorites.map((f) => (
                                <li key={f.cca3}>
                                    <button className="row" onClick={() => doSearch(f.name)} title="Open details">
                                        <img src={f.flag} alt="" />
                                        <div className="meta">
                                            <div className="name">{f.name}</div>
                                            <div className="sub">{[f.region, f.capital].filter(Boolean).join(" • ")}</div>
                                        </div>
                                    </button>
                                    <div className="actions">
                                        <button className="small danger" onClick={() => removeFav(f.cca3)}>Remove</button>
                                    </div>
                                </li>
                            ))}
                        </Styled.FavList>
                    </Styled.Card>
                </div>
            </Styled.Layout>

            {/* Confirm modal */}
            <ConfirmModal
                open={!!confirm.open}
                title={confirm.title}
                message={confirm.message}
                confirmText={confirm.confirmText}
                onConfirm={confirm.onConfirm}
                onClose={() => setConfirm({ open: false })}
            />
        </Styled.Wrapper>
    );
};

export default CountryInformation;

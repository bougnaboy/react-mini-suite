import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/* =========================================================
   Constants
   ========================================================= */
const NOMINATIM = "https://nominatim.openstreetmap.org";
const STATIC_MAP = "https://staticmap.openstreetmap.de/staticmap.php";

const RECENTS_KEY = "locationFinder_recents_v1";
const FAVS_KEY = "locationFinder_favorites_v1";
const LIMIT_RECENTS = 12;

/* =========================================================
   Utilities
   ========================================================= */
function classNames(...xs) { return xs.filter(Boolean).join(" "); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function f6(n) { return Number(n).toFixed(6); }

function buildStaticMapURL({ lat, lon, zoom = 14, w = 640, h = 360 }) {
    // OpenStreetMap static map (marker + center)
    const params = new URLSearchParams({
        center: `${lat},${lon}`,
        zoom: String(clamp(zoom, 1, 19)),
        size: `${w}x${h}`,
        markers: `${lat},${lon},lightblue1`,
        scale: "2",
    });
    return `${STATIC_MAP}?${params.toString()}`;
}

function buildOsmEmbedURL({ lat, lon, zoom = 14 }) {
    // OSM embed iframe needs a bbox; make a small box around point
    // bbox = left,bottom,right,top
    const span = 0.02; // ~few km window
    const left = (Number(lon) - span).toFixed(5);
    const right = (Number(lon) + span).toFixed(5);
    const top = (Number(lat) + span).toFixed(5);
    const bottom = (Number(lat) - span).toFixed(5);
    const bbox = `${left},${bottom},${right},${top}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lon}`)}#map=${clamp(zoom, 1, 19)}/${lat}/${lon}`;
}

function titleFromAddress(place) {
    return place?.display_name || `${place?.name || ""}`.trim();
}
function shortAddress(place) {
    const a = place?.address || {};
    const parts = [a.road, a.neighbourhood || a.suburb, a.city || a.town || a.village, a.state, a.country].filter(Boolean);
    return parts.join(", ");
}
function copy(text) { try { navigator.clipboard?.writeText(text); } catch { } }

/* Debounce hook */
function useDebouncedValue(value, delay) {
    const [v, setV] = useState(value);
    useEffect(() => { const t = setTimeout(() => setV(value), delay); return () => clearTimeout(t); }, [value, delay]);
    return v;
}

/* =========================================================
   API helpers (Nominatim)
   ========================================================= */
async function searchPlaces(query, signal) {
    if (!query?.trim()) return [];
    const url = new URL(`${NOMINATIM}/search`);
    url.searchParams.set("q", query.trim());
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "10");

    const res = await fetch(url.toString(), { signal });
    if (!res.ok) {
        if (res.status === 429) await sleep(600);
        throw new Error(`Search failed: ${res.status}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

async function reverseGeocode(lat, lon, signal) {
    const url = new URL(`${NOMINATIM}/reverse`);
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lon));
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    const res = await fetch(url.toString(), { signal });
    if (!res.ok) throw new Error(`Reverse failed: ${res.status}`);
    return await res.json();
}

/* =========================================================
   Confirm Modal (self-contained)
   ========================================================= */
function useConfirm() {
    const [state, setState] = useState({ open: false, title: "", message: "", action: null });
    const confirm = (title, message) =>
        new Promise((resolve) => {
            setState({
                open: true, title, message, action: (ok) => {
                    setState({ open: false, title: "", message: "", action: null });
                    resolve(ok);
                }
            });
        });
    const Modal = state.open ? (
        <Styled.ModalOverlay role="dialog" aria-modal="true">
            <Styled.Modal>
                <h3>{state.title || "Confirm"}</h3>
                <p>{state.message || "Are you sure?"}</p>
                <Styled.ModalActions>
                    <button className="ghost" onClick={() => state.action?.(false)}>Cancel</button>
                    <button className="danger" onClick={() => state.action?.(true)}>Yes, do it</button>
                </Styled.ModalActions>
            </Styled.Modal>
        </Styled.ModalOverlay>
    ) : null;
    return { confirm, Modal };
}

/* =========================================================
   MapPreview: image first, fallback to iframe
   ========================================================= */
const MapPreview = ({ lat, lon, title = "Map preview", zoom = 14 }) => {
    const [mode, setMode] = useState("img"); // 'img' | 'iframe'
    const lat6 = f6(lat), lon6 = f6(lon);

    useEffect(() => {
        // when coords change, retry image first
        setMode("img");
    }, [lat6, lon6]);

    if (!isFinite(Number(lat)) || !isFinite(Number(lon))) return null;

    const imgSrc = buildStaticMapURL({ lat: lat6, lon: lon6, zoom, w: 640, h: 360 });
    const iframeSrc = buildOsmEmbedURL({ lat: lat6, lon: lon6, zoom });

    return (
        <Styled.MapWrap>
            {mode === "img" ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <img
                    src={imgSrc}
                    alt={title}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    decoding="async"
                    onError={() => setMode("iframe")}
                />
            ) : (
                <iframe
                    title={title}
                    src={iframeSrc}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            )}
        </Styled.MapWrap>
    );
};

/* =========================================================
   Main Component
   ========================================================= */
const LocationFinder = () => {
    /* Search tab state */
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebouncedValue(query, 400);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [error, setError] = useState("");

    /* Selection and panels */
    const [activeTab, setActiveTab] = useState("search"); // 'search' | 'my'
    const [selected, setSelected] = useState(null);

    /* Recents & Favorites */
    const [recents, setRecents] = useState(() => {
        try { return JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]"); } catch { return []; }
    });
    const [favs, setFavs] = useState(() => {
        try { return JSON.parse(localStorage.getItem(FAVS_KEY) || "[]"); } catch { return []; }
    });

    /* My location */
    const [myLoc, setMyLoc] = useState(null);
    const [myLocErr, setMyLocErr] = useState("");
    const [myLocLoading, setMyLocLoading] = useState(false);

    const { confirm, Modal: ConfirmModal } = useConfirm();
    const abortRef = useRef(null);

    useEffect(() => { try { localStorage.setItem(RECENTS_KEY, JSON.stringify(recents)); } catch { } }, [recents]);
    useEffect(() => { try { localStorage.setItem(FAVS_KEY, JSON.stringify(favs)); } catch { } }, [favs]);

    /* run search */
    useEffect(() => {
        if (!debouncedQuery.trim()) { setResults([]); setError(""); return; }
        setLoading(true); setError("");
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        searchPlaces(debouncedQuery, abortRef.current.signal)
            .then((list) => setResults(list))
            .catch((e) => setError(e.message || "Search failed"))
            .finally(() => setLoading(false));

        return () => abortRef.current?.abort();
    }, [debouncedQuery]);

    const onSelectPlace = (p) => {
        setSelected(p);
        const key = `${p.osm_type || ""}:${p.osm_id || ""}`;
        setRecents((prev) => {
            const filtered = prev.filter((x) => x._key !== key);
            return [{ ...p, _key: key, _at: Date.now() }, ...filtered].slice(0, LIMIT_RECENTS);
        });
    };

    const onToggleFav = (p) => {
        const key = `${p.osm_type || ""}:${p.osm_id || ""}`;
        setFavs((prev) => {
            const exists = prev.some((x) => x._key === key);
            if (exists) return prev.filter((x) => x._key !== key);
            return [{ ...p, _key: key, _at: Date.now() }, ...prev];
        });
    };

    const isFav = useMemo(() => {
        if (!selected) return false;
        const key = `${selected.osm_type || ""}:${selected.osm_id || ""}`;
        return favs.some((x) => x._key === key);
    }, [selected, favs]);

    const clearRecents = async () => {
        const ok = await confirm("Clear recent searches?", "This will remove all recent places.");
        if (ok) setRecents([]);
    };
    const removeRecent = async (entry) => {
        const ok = await confirm("Remove this recent?", titleFromAddress(entry));
        if (ok) setRecents((prev) => prev.filter((x) => x._key !== entry._key));
    };
    const removeFavorite = async (entry) => {
        const ok = await confirm("Remove favorite?", titleFromAddress(entry));
        if (ok) setFavs((prev) => prev.filter((x) => x._key !== entry._key));
    };
    const clearFavorites = async () => {
        const ok = await confirm("Clear all favorites?", "You can always add them again later.");
        if (ok) setFavs([]);
    };

    const findMyLocation = async () => {
        setActiveTab("my");
        setMyLocLoading(true);
        setMyLocErr("");
        setMyLoc(null);

        const getPos = () => new Promise((resolve, reject) => {
            if (!navigator.geolocation) { reject(new Error("Geolocation not supported in this browser.")); return; }
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true, timeout: 15000, maximumAge: 0,
            });
        });

        try {
            const pos = await getPos();
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;

            const ac = new AbortController();
            const data = await reverseGeocode(lat, lon, ac.signal);
            const place = {
                ...data,
                lat: String(lat),
                lon: String(lon),
                display_name: data.display_name || `(${Number(lat).toFixed(5)}, ${Number(lon).toFixed(5)})`,
                osm_type: data.osm_type || "node",
                osm_id: data.osm_id || `${lat},${lon}`,
                address: data.address || {},
            };
            setMyLoc({ lat, lon, place });
        } catch (e) {
            setMyLocErr(e?.message || "Could not determine your location.");
        } finally {
            setMyLocLoading(false);
        }
    };

    const selectedLat = selected ? Number(selected.lat) : null;
    const selectedLon = selected ? Number(selected.lon) : null;

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div>
                    <h1>Location Finder</h1>
                    <p>Search any place, view quick maps, save favorites, and use your current location.</p>
                </div>
                <Styled.Badges>
                    <span className="badge">Nominatim Search</span>
                    <span className="badge">My Location</span>
                    <span className="badge">Recents & Favorites</span>
                </Styled.Badges>
            </Styled.Header>

            <Styled.Tabs role="tablist" aria-label="Location panels">
                <button
                    role="tab"
                    aria-selected={activeTab === "search"}
                    className={classNames("tab", activeTab === "search" && "active")}
                    onClick={() => setActiveTab("search")}
                >
                    Search
                </button>
                <button
                    role="tab"
                    aria-selected={activeTab === "my"}
                    className={classNames("tab", activeTab === "my" && "active")}
                    onClick={findMyLocation}
                >
                    My Location
                </button>
            </Styled.Tabs>

            <Styled.Layout>
                {/* LEFT: Search + Results */}
                <div>
                    <Styled.Card>
                        <Styled.SectionTitle>Search a place</Styled.SectionTitle>
                        <Styled.SearchRow onSubmit={(e) => e.preventDefault()}>
                            <input
                                aria-label="Search places"
                                placeholder="e.g., Patna Junction, India or 12 MG Road, Bengaluru"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button onClick={() => setQuery((q) => q.trim())} disabled={!query.trim() || loading} title="Search">Search</button>
                            <button className="ghost" onClick={() => { setQuery(""); setResults([]); setError(""); }} title="Clear">Clear</button>
                        </Styled.SearchRow>
                        {error && <Styled.Error role="alert">{error}</Styled.Error>}
                        {loading && <Styled.Muted>Searching…</Styled.Muted>}
                    </Styled.Card>

                    <Styled.Card>
                        <Styled.SectionTitle>Results</Styled.SectionTitle>
                        {!loading && !results.length && !error && <Styled.Muted>Type a query above to see results.</Styled.Muted>}
                        <Styled.Results>
                            {results.map((r) => {
                                const key = `${r.osm_type || ""}:${r.osm_id || ""}`;
                                const selectedKey = selected ? `${selected.osm_type || ""}:${selected.osm_id || ""}` : "";
                                const isActive = key === selectedKey;
                                const fav = favs.some((f) => f._key === key);
                                return (
                                    <Styled.ResultItem key={key} className={classNames(isActive && "active")} onClick={() => onSelectPlace(r)}>
                                        <div className="main">
                                            <strong className="title">{titleFromAddress(r)}</strong>
                                            <span className="addr">{shortAddress(r)}</span>
                                            <span className="coords">{Number(r.lat).toFixed(5)}, {Number(r.lon).toFixed(5)}</span>
                                        </div>
                                        <div className="actions" onClick={(e) => e.stopPropagation()}>
                                            <button className="ghost" onClick={() => copy(`${r.lat},${r.lon}`)} title="Copy coordinates">Copy</button>
                                            <button onClick={() => onToggleFav(r)} title={fav ? "Remove favorite" : "Add favorite"}>{fav ? "★" : "☆"}</button>
                                        </div>
                                    </Styled.ResultItem>
                                );
                            })}
                        </Styled.Results>
                    </Styled.Card>

                    <Styled.Card>
                        <Styled.SectionTitle>
                            Recent Searches
                            {!!recents.length && <button className="right ghost danger" onClick={clearRecents} title="Clear recents">Clear All</button>}
                        </Styled.SectionTitle>
                        {!recents.length && <Styled.Muted>No recent searches yet.</Styled.Muted>}
                        <Styled.List>
                            {recents.map((r) => (
                                <li key={r._key}>
                                    <button className="link" onClick={() => onSelectPlace(r)} title="Open">{titleFromAddress(r)}</button>
                                    <div className="row">
                                        <small>{shortAddress(r)}</small>
                                        <div className="mini">
                                            <button className="ghost" onClick={() => copy(`${r.lat},${r.lon}`)}>Copy</button>
                                            <button className="ghost danger" onClick={() => removeRecent(r)}>Delete</button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </Styled.List>
                    </Styled.Card>
                </div>

                {/* RIGHT: Selected / My Location / Favorites */}
                <Styled.Side>
                    <Styled.Card>
                        <Styled.SectionTitle>Selected</Styled.SectionTitle>
                        {!selected && <Styled.Muted>No place selected yet.</Styled.Muted>}
                        {selected && (
                            <>
                                <MapPreview lat={selectedLat} lon={selectedLon} title="Selected location map" />
                                <div className="title">{titleFromAddress(selected)}</div>
                                <div className="addr">{shortAddress(selected) || "—"}</div>
                                <Styled.KV>
                                    <div><span>Latitude</span><code>{f6(selectedLat)}</code></div>
                                    <div><span>Longitude</span><code>{f6(selectedLon)}</code></div>
                                </Styled.KV>
                                <Styled.Actions>
                                    <button className="ghost" onClick={() => copy(`${selectedLat},${selectedLon}`)}>Copy Coords</button>
                                    <button onClick={() => onToggleFav(selected)}>{isFav ? "Remove Favorite" : "Add Favorite"}</button>
                                </Styled.Actions>
                            </>
                        )}
                    </Styled.Card>

                    <Styled.Card>
                        <Styled.SectionTitle>My Location</Styled.SectionTitle>
                        <Styled.Actions>
                            <button onClick={findMyLocation} disabled={myLocLoading}>Use Current Location</button>
                        </Styled.Actions>
                        {myLocLoading && <Styled.Muted>Fetching your location…</Styled.Muted>}
                        {myLocErr && <Styled.Error role="alert">{myLocErr}</Styled.Error>}
                        {myLoc?.place && (
                            <>
                                <MapPreview lat={myLoc.lat} lon={myLoc.lon} title="My location map" />
                                <div className="title">{titleFromAddress(myLoc.place)}</div>
                                <div className="addr">{shortAddress(myLoc.place) || "—"}</div>
                                <Styled.KV>
                                    <div><span>Latitude</span><code>{f6(myLoc.lat)}</code></div>
                                    <div><span>Longitude</span><code>{f6(myLoc.lon)}</code></div>
                                </Styled.KV>
                                <Styled.Actions>
                                    <button className="ghost" onClick={() => copy(`${myLoc.lat},${myLoc.lon}`)}>Copy Coords</button>
                                    <button onClick={() => onToggleFav(myLoc.place)}>
                                        {favs.some((f) => f._key === `${myLoc.place.osm_type}:${myLoc.place.osm_id}`) ? "Remove Favorite" : "Add Favorite"}
                                    </button>
                                </Styled.Actions>
                            </>
                        )}
                    </Styled.Card>

                    <Styled.Card>
                        <Styled.SectionTitle>
                            Favorites
                            {!!favs.length && <button className="right ghost danger" onClick={clearFavorites} title="Clear favorites">Clear All</button>}
                        </Styled.SectionTitle>
                        {!favs.length && <Styled.Muted>No favorites yet.</Styled.Muted>}
                        <Styled.List>
                            {favs.map((r) => (
                                <li key={r._key}>
                                    <button className="link" onClick={() => setSelected(r)} title="Open">{titleFromAddress(r)}</button>
                                    <div className="row">
                                        <small>{shortAddress(r)}</small>
                                        <div className="mini">
                                            <button className="ghost" onClick={() => copy(`${r.lat},${r.lon}`)}>Copy</button>
                                            <button className="ghost danger" onClick={() => removeFavorite(r)}>Remove</button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </Styled.List>
                    </Styled.Card>
                </Styled.Side>
            </Styled.Layout>

            {ConfirmModal}
        </Styled.Wrapper>
    );
};

export default LocationFinder;

import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

const API_ROOT = "https://disease.sh/v3/covid-19";

function formatPretty(ts) {
    if (!ts) return "-";
    const d = new Date(ts);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const pad = (n) => String(n).padStart(2, "0");
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} hrs`;
}
function fmt(n) {
    if (n === null || n === undefined || Number.isNaN(n)) return "-";
    if (typeof n === "number") return n.toLocaleString("en-IN");
    const num = Number(n);
    return Number.isFinite(num) ? num.toLocaleString("en-IN") : String(n);
}
// "in 1d 2h 30m" (approx). If past, returns "any time now".
function approxFromNow(ts) {
    if (!ts) return "";
    const diff = ts - Date.now();
    if (diff <= 0) return "any time now";
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const parts = [];
    if (d) parts.push(`${d}d`);
    if (h) parts.push(`${h}h`);
    if (m || (!d && !h)) parts.push(`${m}m`);
    return `in ${parts.join(" ")}`;
}

// Build URL with optional cache-buster
function buildUrl(path, force) {
    const sep = path.includes("?") ? "&" : "?";
    return `${API_ROOT}${path}${force ? `${sep}v=${Date.now()}` : ""}`;
}

const scopes = [
    {
        key: "global",
        label: "Global",
        fetch: (force = false) =>
            fetch(buildUrl("/all", force), { cache: force ? "no-store" : "default" }).then(r => r.json()),
    },
    {
        key: "india",
        label: "India",
        fetch: (force = false) =>
            fetch(buildUrl("/countries/India?strict=true", force), { cache: force ? "no-store" : "default" }).then(r => r.json()),
    },
];

const Covid19Tracker = () => {
    const [scopeKey, setScopeKey] = useState("india");
    const [data, setData] = useState(null);
    const [updatedAt, setUpdatedAt] = useState(null);     // API timestamp
    const [refreshedAt, setRefreshedAt] = useState(null); // local refresh click time
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const scope = useMemo(() => scopes.find(s => s.key === scopeKey) || scopes[0], [scopeKey]);

    const load = async (opts = { useCacheFirst: true, force: false }) => {
        const { useCacheFirst, force } = opts;
        setErr("");
        setLoading(true);
        const cacheKey = `covid-cache:${scopeKey}`;

        try {
            if (useCacheFirst) {
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    const { data, updatedAt } = JSON.parse(cached);
                    setData(data);
                    setUpdatedAt(updatedAt);
                }
            }

            const fresh = await scope.fetch(force);

            const normalized = {
                cases: fresh.cases ?? 0,
                todayCases: fresh.todayCases ?? 0,
                deaths: fresh.deaths ?? 0,
                todayDeaths: fresh.todayDeaths ?? 0,
                recovered: fresh.recovered ?? 0,
                active:
                    fresh.active ??
                    Math.max(0, (fresh.cases || 0) - (fresh.recovered || 0) - (fresh.deaths || 0)),
                tests: fresh.tests ?? fresh.totalTests ?? null,
                population: fresh.population ?? null,
                source: "disease.sh",
            };

            const ts = fresh.updated ?? Date.now();
            setData(normalized);
            setUpdatedAt(ts);
            setRefreshedAt(Date.now());
            localStorage.setItem(cacheKey, JSON.stringify({ data: normalized, updatedAt: ts }));
        } catch {
            if (!data) setErr("Couldn't fetch live data. Showing nothing right now.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load({ useCacheFirst: true, force: false }); }, [scopeKey]);

    // Heuristic next windows (many sources are daily/weekly)
    const nextDaily = updatedAt ? updatedAt + 24 * 60 * 60 * 1000 : null;
    const nextWeekly = updatedAt ? updatedAt + 7 * 24 * 60 * 60 * 1000 : null;

    return (
        <Styled.Wrapper>
            <header className="header">
                <h2>COVID-19 Tracker</h2>
                <div className="controls">
                    <label className="sr-only" htmlFor="scope">Scope</label>
                    <select id="scope" value={scopeKey} onChange={(e) => setScopeKey(e.target.value)}>
                        {scopes.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                    <button
                        className="refreshBtn"
                        onClick={() => load({ useCacheFirst: false, force: true })}
                        disabled={loading}
                    >
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </header>

            {err && <div className="error">{err}</div>}

            <section className="statsGrid" aria-busy={loading}>
                <article className="card cases">
                    <h4>Total Cases</h4>
                    <p className="big">{fmt(data?.cases)}</p>
                    <span className="delta">+{fmt(data?.todayCases)} today</span>
                </article>
                <article className="card active">
                    <h4>Active</h4>
                    <p className="big">{fmt(data?.active)}</p>
                </article>
                <article className="card recovered">
                    <h4>Recovered</h4>
                    <p className="big">{fmt(data?.recovered)}</p>
                </article>
                <article className="card deaths">
                    <h4>Deaths</h4>
                    <p className="big">{fmt(data?.deaths)}</p>
                    <span className="delta">+{fmt(data?.todayDeaths)} today</span>
                </article>
                <article className="card tests">
                    <h4>Tests</h4>
                    <p className="big">{fmt(data?.tests)}</p>
                </article>
                <article className="card population">
                    <h4>Population</h4>
                    <p className="big">{fmt(data?.population)}</p>
                </article>
            </section>

            <footer className="meta">
                <span>Scope: <b>{scope.label}</b></span>
                <span>API updated: <b>{formatPretty(updatedAt)}</b></span>
                <span>Last refreshed: <b>{formatPretty(refreshedAt)}</b></span>
                <span>Source: <a href="https://disease.sh/" target="_blank" rel="noreferrer">disease.sh</a></span>
            </footer>

            {/* Update cadence notice (simple, honest copy) */}
            <aside className="notice" role="note" aria-live="polite">
                <h5>Update cadence</h5>
                <p>
                    Upstream providers now publish COVID numbers infrequently (often <b>daily</b> or <b>weekly</b>, not realtime).
                    If Refresh doesn't change values, the source hasn't updated yet.
                </p>
                <ul>
                    <li><b>Daily estimate:</b> {nextDaily ? `${formatPretty(nextDaily)} — ${approxFromNow(nextDaily)}` : "-"}</li>
                    <li><b>Weekly fallback:</b> {nextWeekly ? `${formatPretty(nextWeekly)} — ${approxFromNow(nextWeekly)}` : "-"}</li>
                </ul>
            </aside>
        </Styled.Wrapper>
    );
};

export default Covid19Tracker;

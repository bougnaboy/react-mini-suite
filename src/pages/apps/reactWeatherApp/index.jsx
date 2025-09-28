import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/**
 * React Weather App — simple, reliable, printable
 * - Search by city name (Open-Meteo Geocoding, no API key)
 * - Current & 7-day forecast (Open-Meteo Forecast)
 * - Unit toggle (°C / °F)
 * - Save cities (localStorage) + quick recall
 * - Print: only the forecast card, not the whole page (hidden iframe)
 *
 * Notes:
 * - Kept the code human and minimal; small helpers, straightforward state
 * - No keyboard shortcuts
 */

const LS_KEY = "reactWeatherApp.cities";
const LS_UNIT = "reactWeatherApp.unit";
const LS_LAST = "reactWeatherApp.last";

export default function ReactWeatherApp() {
    const [query, setQuery] = useState("");
    const [unit, setUnit] = useState(() => localStorage.getItem(LS_UNIT) || "C");
    const [location, setLocation] = useState(() => {
        const raw = localStorage.getItem(LS_LAST);
        return raw ? JSON.parse(raw) : null;
    });
    const [cities, setCities] = useState(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    const [data, setData] = useState(null); // { current, daily }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const printRef = useRef(null);

    useEffect(() => {
        localStorage.setItem(LS_UNIT, unit);
    }, [unit]);

    useEffect(() => {
        if (!location) return;
        // fetch on mount or when location changes
        fetchForecast(location);
        // persist last picked location
        localStorage.setItem(LS_LAST, JSON.stringify(location));
    }, [location]);

    async function searchCity() {
        const q = (query || "").trim();
        if (!q) return;
        setError("");
        setLoading(true);
        try {
            const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
                q
            )}&count=1&language=en&format=json`;
            const res = await fetch(url);
            const json = await res.json();
            if (!json.results || !json.results.length) {
                setError("City not found. Try a different name.");
                setLoading(false);
                return;
            }
            const r = json.results[0];
            const picked = {
                name: r.name,
                country: r.country,
                latitude: r.latitude,
                longitude: r.longitude,
                timezone: r.timezone || "auto",
            };
            setLocation(picked);
        } catch (e) {
            setError("Could not search right now. Check your connection.");
        } finally {
            setLoading(false);
        }
    }

    async function fetchForecast(loc) {
        setError("");
        setLoading(true);
        try {
            const { latitude, longitude, timezone } = loc;
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=${encodeURIComponent(
                timezone || "auto"
            )}`;
            const res = await fetch(url);
            const json = await res.json();

            const current = json.current_weather
                ? {
                    tempC: json.current_weather.temperature,
                    wind: json.current_weather.windspeed,
                    time: json.current_weather.time,
                }
                : null;

            const daily = (json.daily?.time || []).map((date, i) => ({
                date,
                minC: json.daily.temperature_2m_min?.[i] ?? null,
                maxC: json.daily.temperature_2m_max?.[i] ?? null,
                pop: json.daily.precipitation_probability_max?.[i] ?? null, // %
            }));

            setData({ current, daily, fetchedAt: new Date().toISOString() });
        } catch (e) {
            setError("Could not load forecast.");
        } finally {
            setLoading(false);
        }
    }

    function saveCurrentCity() {
        if (!location) return;
        const exists = cities.some(
            (c) =>
                c.latitude === location.latitude &&
                c.longitude === location.longitude &&
                c.name === location.name
        );
        if (exists) return;
        const next = [location, ...cities].slice(0, 8); // keep it tidy
        setCities(next);
        localStorage.setItem(LS_KEY, JSON.stringify(next));
    }

    function removeCity(idx) {
        const next = cities.filter((_, i) => i !== idx);
        setCities(next);
        localStorage.setItem(LS_KEY, JSON.stringify(next));
    }

    function pickCity(c) {
        setLocation(c);
    }

    function cToF(c) {
        return c == null ? null : (c * 9) / 5 + 32;
    }

    const view = useMemo(() => {
        if (!data) return null;
        const showC = unit === "C";
        const fmtTemp = (c) =>
            c == null ? "—" : Math.round(showC ? c : cToF(c)) + `°${unit}`;
        const days = (data.daily || []).map((d) => ({
            ...d,
            min: fmtTemp(d.minC),
            max: fmtTemp(d.maxC),
            day: new Date(d.date).toLocaleDateString("en-GB", {
                weekday: "short",
                day: "2-digit",
                month: "short",
            }),
        }));

        const nowTemp = data.current?.tempC ?? null;
        const now = nowTemp == null ? "—" : Math.round(showC ? nowTemp : cToF(nowTemp)) + `°${unit}`;
        return { now, days };
    }, [data, unit]);

    function handlePrint() {
        if (!location || !view) return;
        const cityTitle = `${location.name}${location.country ? ", " + location.country : ""}`;
        // Build a lightweight printable HTML with inline CSS (no app chrome)
        const dayRows = (view.days || [])
            .map(
                (d) => `
      <div class="row">
        <div class="d">${d.day}</div>
        <div class="t"><span class="max">${d.max}</span> / <span class="min">${d.min}</span></div>
        <div class="p">${d.pop != null ? d.pop + "%" : "—"}</div>
      </div>`
            )
            .join("");

        const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>Print Forecast</title>
    <style>
      @page { margin: 0; }
      html, body { margin: 0; padding: 0; background: #fff; }
      .card {
        box-sizing: border-box;
        width: 100%;
        max-width: 900px;
        margin: 0 auto;
        padding: 20px;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        color: #111;
      }
      .header {
        display: flex; align-items: baseline; justify-content: space-between;
        border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 12px;
      }
      .title { font-size: 22px; font-weight: 700; }
      .now { font-size: 20px; font-weight: 600; }
      .meta { font-size: 12px; color: #666; margin-top: 2px; }
      .grid { display: grid; grid-template-columns: 1fr auto auto; gap: 8px; }
      .row { display: contents; }
      .d { padding: 6px 0; border-bottom: 1px dashed #eee; }
      .t { padding: 6px 0; border-bottom: 1px dashed #eee; text-align: right; }
      .p { padding: 6px 0; border-bottom: 1px dashed #eee; text-align: right; }
      .max { font-weight: 600; }
      .min { color: #666; }
      .legend { display: grid; grid-template-columns: 1fr auto auto; gap: 8px; font-size: 12px; color: #666; margin-bottom: 4px; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <div>
          <div class="title">${cityTitle}</div>
          <div class="meta">7-day forecast • Printed from Freelance Apps Hub</div>
        </div>
        <div class="now">${view.now}</div>
      </div>

      <div class="legend">
        <div>Day</div><div>Temp</div><div>Rain%</div>
      </div>
      <div class="grid">
        ${dayRows}
      </div>
    </div>
    <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 400); };</script>
  </body>
</html>`;

        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        document.body.appendChild(iframe);
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();
    }

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div className="title">React Weather App</div>
                <div className="controls">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search city (e.g., Bengaluru, London)"
                        onKeyDown={(e) => e.key === "Enter" && searchCity()}
                    />
                    <button onClick={searchCity} disabled={loading}>
                        {loading ? "Searching..." : "Search"}
                    </button>
                    <div className="split" />
                    <button
                        className={unit === "C" ? "active" : ""}
                        onClick={() => setUnit("C")}
                        title="Show °C"
                    >
                        °C
                    </button>
                    <button
                        className={unit === "F" ? "active" : ""}
                        onClick={() => setUnit("F")}
                        title="Show °F"
                    >
                        °F
                    </button>
                </div>
            </Styled.Header>

            <Styled.Body>
                <Styled.Sidebar>
                    <div className="row head">
                        <div>Saved Cities</div>
                        <button
                            onClick={saveCurrentCity}
                            disabled={!location}
                            title="Save current city"
                            className="saveButton"
                        >
                            + Save
                        </button>
                    </div>

                    {cities.length === 0 && (
                        <div className="muted">No saved cities yet.</div>
                    )}

                    <div className="chips">
                        {cities.map((c, i) => (
                            <div className="chip" key={`${c.name}-${c.latitude}-${i}`}>
                                <button className="pick" onClick={() => pickCity(c)}>
                                    {c.name}
                                    {c.country ? `, ${c.country}` : ""}
                                </button>
                                <button
                                    className="del"
                                    title="Remove"
                                    onClick={() => removeCity(i)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="note">
                        Tip: Search a city → click **+ Save** to keep it here.
                    </div>
                </Styled.Sidebar>

                <Styled.Stage>
                    {error && <Styled.Error>{error}</Styled.Error>}

                    {!location && !loading && (
                        <Styled.Hint>Search a city to load the forecast.</Styled.Hint>
                    )}

                    {location && data && view && (
                        <Styled.ForecastCard ref={printRef}>
                            <div className="head">
                                <div>
                                    <div className="city">
                                        {location.name}
                                        {location.country ? `, ${location.country}` : ""}
                                    </div>
                                    <div className="meta">
                                        Updated:{" "}
                                        {new Date(data.fetchedAt).toLocaleString("en-GB", {
                                            hour12: false,
                                            year: "numeric",
                                            month: "short",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>
                                <div className="now">{view.now}</div>
                            </div>

                            <div className="legend">
                                <div>Day</div>
                                <div>Temp</div>
                                <div>Rain%</div>
                            </div>

                            <div className="rows">
                                {view.days.map((d) => (
                                    <div className="row" key={d.date}>
                                        <div className="d">{d.day}</div>
                                        <div className="t">
                                            <span className="max">{d.max}</span>{" "}
                                            <span className="sep">/</span>{" "}
                                            <span className="min">{d.min}</span>
                                        </div>
                                        <div className="p">{d.pop != null ? `${d.pop}%` : "—"}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="actions">
                                <button onClick={() => setLocation(null)}>Clear</button>
                                <button onClick={handlePrint}>Print</button>
                            </div>
                        </Styled.ForecastCard>
                    )}
                </Styled.Stage>
            </Styled.Body>
        </Styled.Wrapper>
    );
}

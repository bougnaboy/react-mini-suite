import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

// Lightweight seed data (curated, no external calls)
const DESTINATIONS = [
    { id: "goa", name: "Goa", country: "India", continent: "Asia", climate: ["Tropical"], budget: "mid", best: "Nov–Feb", blurb: "Beaches, cafes, easy scooter days." },
    { id: "jaipur", name: "Jaipur", country: "India", continent: "Asia", climate: ["Arid"], budget: "budget", best: "Oct–Mar", blurb: "Fort walks, bazaars, pink sunsets." },
    { id: "bali", name: "Bali", country: "Indonesia", continent: "Asia", climate: ["Tropical"], budget: "mid", best: "May–Sep", blurb: "Rice terraces, surf towns, temples." },
    { id: "tokyo", name: "Tokyo", country: "Japan", continent: "Asia", climate: ["Temperate"], budget: "luxury", best: "Mar–May, Oct–Nov", blurb: "Neon lanes, ramen bars, calm parks." },
    { id: "paris", name: "Paris", country: "France", continent: "Europe", climate: ["Temperate"], budget: "luxury", best: "Apr–Jun, Sep–Oct", blurb: "Museums, riverside walks, patisserie." },
    { id: "rome", name: "Rome", country: "Italy", continent: "Europe", climate: ["Mediterranean"], budget: "mid", best: "Apr–Jun, Sep–Oct", blurb: "Ruins + gelato + piazzas." },
    { id: "barcelona", name: "Barcelona", country: "Spain", continent: "Europe", climate: ["Mediterranean"], budget: "mid", best: "May–Jun, Sep", blurb: "Gaudí, tapas, beach tramways." },
    { id: "prague", name: "Prague", country: "Czechia", continent: "Europe", climate: ["Temperate"], budget: "budget", best: "Apr–Jun, Sep–Oct", blurb: "Old town bridges, cobblestone charm." },
    { id: "cappadocia", name: "Cappadocia", country: "Türkiye", continent: "Asia", climate: ["Arid"], budget: "mid", best: "Apr–Jun, Sep–Oct", blurb: "Balloon sunrises, cave stays." },
    { id: "istanbul", name: "Istanbul", country: "Türkiye", continent: "Europe", climate: ["Mediterranean"], budget: "mid", best: "Apr–Jun, Sep–Oct", blurb: "Bazaars, ferries, layered history." },
    { id: "dubai", name: "Dubai", country: "UAE", continent: "Asia", climate: ["Arid"], budget: "luxury", best: "Nov–Mar", blurb: "Skyline views, desert drives." },
    { id: "cairo", name: "Cairo", country: "Egypt", continent: "Africa", climate: ["Arid"], budget: "budget", best: "Oct–Apr", blurb: "Pyramids, Nile evenings, museums." },
    { id: "marrakesh", name: "Marrakesh", country: "Morocco", continent: "Africa", climate: ["Arid"], budget: "mid", best: "Mar–May, Sep–Nov", blurb: "Riads, souks, orange courtyards." },
    { id: "capeTown", name: "Cape Town", country: "South Africa", continent: "Africa", climate: ["Mediterranean"], budget: "mid", best: "Nov–Mar", blurb: "Table Mountain, ocean drives." },
    { id: "reykjavik", name: "Reykjavík", country: "Iceland", continent: "Europe", climate: ["Polar"], budget: "luxury", best: "Feb–Mar, Sep–Oct", blurb: "Auroras, lagoons, quiet roads." },
    { id: "bangkok", name: "Bangkok", country: "Thailand", continent: "Asia", climate: ["Tropical"], budget: "budget", best: "Nov–Feb", blurb: "Street food, canals, night markets." },
    { id: "siemReap", name: "Siem Reap", country: "Cambodia", continent: "Asia", climate: ["Tropical"], budget: "budget", best: "Nov–Feb", blurb: "Angkor sunrise cycles." },
    { id: "hanoi", name: "Hanoi", country: "Vietnam", continent: "Asia", climate: ["Tropical"], budget: "budget", best: "Oct–Apr", blurb: "Old quarter, coffee corners." },
    { id: "queenstown", name: "Queenstown", country: "New Zealand", continent: "Oceania", climate: ["Temperate", "Alpine"], budget: "luxury", best: "Dec–Mar", blurb: "Lakes, trails, adventure hubs." },
    { id: "sydney", name: "Sydney", country: "Australia", continent: "Oceania", climate: ["Temperate"], budget: "luxury", best: "Sep–Nov, Mar–May", blurb: "Harbour walks, coastal pools." },
    { id: "buenosAires", name: "Buenos Aires", country: "Argentina", continent: "South America", climate: ["Temperate"], budget: "mid", best: "Mar–May, Sep–Nov", blurb: "Cafés, tango, leafy avenues." },
    { id: "cusco", name: "Cusco", country: "Peru", continent: "South America", climate: ["Alpine"], budget: "mid", best: "May–Sep", blurb: "Inca stonework, crisp skies." },
    { id: "mexicoCity", name: "Mexico City", country: "Mexico", continent: "North America", climate: ["Temperate"], budget: "mid", best: "Mar–May, Sep–Nov", blurb: "Museums, tacos, neighborhoods." },
    { id: "vancouver", name: "Vancouver", country: "Canada", continent: "North America", climate: ["Temperate"], budget: "luxury", best: "Jun–Sep", blurb: "Mountains meet the sea." },
];

const CONTINENTS = ["Asia", "Europe", "Africa", "North America", "South America", "Oceania"];
const CLIMES = ["Tropical", "Temperate", "Arid", "Mediterranean", "Alpine", "Polar"];
const BUDGETS = ["any", "budget", "mid", "luxury"];

const LS_FILTERS = "randomTravel:filters";
const LS_HISTORY = "randomTravel:history";

export default function RandomTravel() {
    const [filters, setFilters] = useState(() => {
        const saved = localStorage.getItem(LS_FILTERS);
        return saved ? JSON.parse(saved) : { continents: [], climes: [], budget: "any", allowRepeats: false };
    });
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem(LS_HISTORY);
        return saved ? JSON.parse(saved) : [];
    });
    const [selected, setSelected] = useState(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const printRef = useRef(null);

    useEffect(() => { localStorage.setItem(LS_FILTERS, JSON.stringify(filters)); }, [filters]);
    useEffect(() => { localStorage.setItem(LS_HISTORY, JSON.stringify(history)); }, [history]);

    const filteredList = useMemo(() => {
        return DESTINATIONS.filter(d => {
            const okCont = filters.continents.length ? filters.continents.includes(d.continent) : true;
            const okClim = filters.climes.length ? d.climate.some(c => filters.climes.includes(c)) : true;
            const okBudget = filters.budget === "any" ? true : d.budget === filters.budget;
            return okCont && okClim && okBudget;
        });
    }, [filters]);

    function toggleFrom(list, val) {
        return list.includes(val) ? list.filter(x => x !== val) : [...list, val];
    }

    function spin() {
        let pool = filteredList;
        if (!filters.allowRepeats && history.length) {
            const taken = new Set(history.map(h => h.id));
            const notSeen = pool.filter(d => !taken.has(d.id));
            if (notSeen.length) pool = notSeen;
        }
        if (!pool.length) { setSelected(null); return; }
        const pick = pool[Math.floor(Math.random() * pool.length)];
        setSelected(pick);
    }

    function saveToHistory() {
        if (!selected) return;
        if (history.some(h => h.id === selected.id)) return;
        setHistory([{ ...selected, savedAt: Date.now() }, ...history]);
    }

    function removeFromHistory(id) {
        setHistory(history.filter(h => h.id !== id));
    }

    function clearHistory() {
        setHistory([]);
        setShowClearConfirm(false);
    }

    function resetFilters() {
        setFilters({ continents: [], climes: [], budget: "any", allowRepeats: false });
    }

    function handlePrintCard() {
        if (!printRef.current) return;
        const html = printRef.current.outerHTML;
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
        doc.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>Print</title>
    <style>
      @page { margin: 0; }
      html, body { margin:0; padding:0; background:#fff; }
      * { box-sizing: border-box; }
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
      .printCard {
        width: 100%;
        max-width: 720px;
        margin: 0 auto;
        padding: 16px;
      }
      .title { font-size: 22px; font-weight: 700; margin: 0 0 6px; }
      .meta { font-size: 14px; color: #444; margin-bottom: 10px; }
      .chips { display:flex; flex-wrap:wrap; gap:6px; margin: 8px 0 10px; }
      .chip { font-size:12px; border:1px solid #ddd; padding:4px 8px; border-radius:999px; }
      .blurb { font-size: 14px; color: #111; }
      hr { border: none; border-top: 1px solid #eee; margin: 12px 0; }
      .best { font-size: 13px; color:#333; }
    </style>
  </head>
  <body>
    ${html.replace('class="card"', 'class="printCard"')}
    <script>window.onload = () => { window.focus(); window.print(); setTimeout(()=>window.close(), 300); };</script>
  </body>
</html>`);
        doc.close();
    }

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div className="title">Random Travel Destination</div>
                <div className="actions">
                    <button onClick={resetFilters}>Reset Filters</button>
                    <button onClick={() => setShowClearConfirm(true)} disabled={!history.length}>Clear History</button>
                    <button onClick={handlePrintCard} disabled={!selected}>Print Pick</button>
                </div>
            </Styled.Header>

            <Styled.Body>
                <Styled.Sidebar>
                    <Styled.SectionTitle>Continents</Styled.SectionTitle>
                    <Styled.Chips>
                        {CONTINENTS.map(c => (
                            <button
                                key={c}
                                className="chip"
                                data-active={filters.continents.includes(c) ? "1" : ""}
                                onClick={() => setFilters({ ...filters, continents: toggleFrom(filters.continents, c) })}
                            >{c}</button>
                        ))}
                    </Styled.Chips>

                    <Styled.SectionTitle>Climate</Styled.SectionTitle>
                    <Styled.Chips>
                        {CLIMES.map(c => (
                            <button
                                key={c}
                                className="chip"
                                data-active={filters.climes.includes(c) ? "1" : ""}
                                onClick={() => setFilters({ ...filters, climes: toggleFrom(filters.climes, c) })}
                            >{c}</button>
                        ))}
                    </Styled.Chips>

                    <Styled.SectionTitle>Budget</Styled.SectionTitle>
                    <Styled.Chips>
                        {BUDGETS.map(b => (
                            <button
                                key={b}
                                className="chip"
                                data-active={filters.budget === b ? "1" : ""}
                                onClick={() => setFilters({ ...filters, budget: b })}
                            >{b === "any" ? "Any" : b[0].toUpperCase() + b.slice(1)}</button>
                        ))}
                    </Styled.Chips>

                    <Styled.Row>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={filters.allowRepeats}
                                onChange={(e) => setFilters({ ...filters, allowRepeats: e.target.checked })}
                            />
                            <span>Allow repeats when spinning</span>
                        </label>
                    </Styled.Row>

                    <Styled.SmallMuted>{filteredList.length} match{filteredList.length === 1 ? "" : "es"} now</Styled.SmallMuted>
                </Styled.Sidebar>

                <Styled.Main>
                    <Styled.Toolbar>
                        <button onClick={spin}>Spin</button>
                        <button onClick={saveToHistory} disabled={!selected || history.some(h => h.id === selected?.id)}>Save to History</button>
                    </Styled.Toolbar>

                    {selected ? (
                        <Styled.Card ref={printRef} className="card">
                            <div className="title">{selected.name}</div>
                            <div className="meta">{selected.country} • {selected.continent}</div>
                            <div className="chips">
                                {selected.climate.map(c => <span key={c} className="chip">{c}</span>)}
                                <span className="chip">{selected.budget}</span>
                            </div>
                            <p className="blurb">{selected.blurb}</p>
                            <hr />
                            <div className="best">Best months: {selected.best}</div>
                        </Styled.Card>
                    ) : (
                        <Styled.Hint>Select filters (optional) and hit <b>Spin</b>.</Styled.Hint>
                    )}

                    <Styled.H2>Saved Ideas</Styled.H2>
                    {!history.length ? (
                        <Styled.SmallMuted>No saved picks yet.</Styled.SmallMuted>
                    ) : (
                        <Styled.HistoryGrid>
                            {history.map(h => (
                                <Styled.HistoryCard key={h.id}>
                                    <div className="t">{h.name}</div>
                                    <div className="m">{h.country} • {h.continent}</div>
                                    <div className="chips">
                                        {h.climate.map(c => <span key={c} className="chip">{c}</span>)}
                                        <span className="chip">{h.budget}</span>
                                    </div>
                                    <div className="row">
                                        <button onClick={() => setSelected(h)}>View</button>
                                        <button className="ghost" onClick={() => removeFromHistory(h.id)}>Remove</button>
                                    </div>
                                </Styled.HistoryCard>
                            ))}
                        </Styled.HistoryGrid>
                    )}
                </Styled.Main>
            </Styled.Body>

            {showClearConfirm && (
                <Styled.ModalBackdrop onClick={() => setShowClearConfirm(false)}>
                    <Styled.ModalCard onClick={(e) => e.stopPropagation()}>
                        <div className="title">Clear saved ideas?</div>
                        <div className="msg">This removes all saved picks.</div>
                        <div className="row">
                            <button className="ghost" onClick={() => setShowClearConfirm(false)}>Cancel</button>
                            <button className="danger" onClick={clearHistory}>Yes, clear</button>
                        </div>
                    </Styled.ModalCard>
                </Styled.ModalBackdrop>
            )}
        </Styled.Wrapper>
    );
}

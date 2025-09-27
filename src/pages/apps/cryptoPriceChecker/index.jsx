import { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

// Default set covers common, high-liquidity coins you likely want to track.
// You can tweak this list later without touching the rest of the code.
const DEFAULT_COINS = [
    { id: "bitcoin", label: "Bitcoin", symbol: "BTC" },
    { id: "ethereum", label: "Ethereum", symbol: "ETH" },
    { id: "solana", label: "Solana", symbol: "SOL" },
    { id: "ripple", label: "XRP", symbol: "XRP" },
    { id: "cardano", label: "Cardano", symbol: "ADA" },
    { id: "dogecoin", label: "Dogecoin", symbol: "DOGE" },
    { id: "tron", label: "TRON", symbol: "TRX" },
    { id: "polygon", label: "Polygon", symbol: "MATIC" },
    { id: "litecoin", label: "Litecoin", symbol: "LTC" },
    { id: "polkadot", label: "Polkadot", symbol: "DOT" },
];

const LS_KEY_FIAT = "cryptoPriceChecker.fiat";
const LS_KEY_FILTER = "cryptoPriceChecker.filter";

// CoinGecko simple price endpoint — public, CORS-friendly.
// We request INR+USD together so toggling fiat is instant.
function buildUrl(coinIdsCsv) {
    const vs = "inr,usd";
    return `https://api.coingecko.com/api/v3/simple/price?ids=${coinIdsCsv}&vs_currencies=${vs}&include_24hr_change=true&precision=2`;
}

export default function CryptoPriceChecker() {
    const [coins] = useState(DEFAULT_COINS);
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);

    const [fiat, setFiat] = useState(() => localStorage.getItem(LS_KEY_FIAT) || "inr");
    const [filter, setFilter] = useState(() => localStorage.getItem(LS_KEY_FILTER) || "");

    const timerRef = useRef(null);

    const filteredCoins = useMemo(() => {
        const q = filter.trim().toLowerCase();
        if (!q) return coins;
        return coins.filter(c => c.label.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
    }, [coins, filter]);

    const nfmt = useMemo(() => {
        const locale = fiat === "inr" ? "en-IN" : "en-US";
        const currency = fiat.toUpperCase();
        return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 });
    }, [fiat]);

    async function fetchPrices() {
        setLoading(true);
        setError("");
        try {
            const ids = coins.map(c => c.id).join(",");
            const res = await fetch(buildUrl(ids), { headers: { "accept": "application/json" } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            setData(json);
            setLastUpdated(new Date());
        } catch (err) {
            setError("Couldn’t fetch prices. Check connection or try again.");
        } finally {
            setLoading(false);
        }
    }

    function handleFiatChange(e) {
        const v = e.target.value;
        setFiat(v);
        localStorage.setItem(LS_KEY_FIAT, v);
    }

    function handleFilterChange(e) {
        const v = e.target.value;
        setFilter(v);
        localStorage.setItem(LS_KEY_FILTER, v);
    }

    useEffect(() => {
        fetchPrices();
        // light, respectful polling (45s). Cleared on unmount.
        timerRef.current = setInterval(fetchPrices, 45_000);
        return () => clearInterval(timerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div className="title">
                    <h2>Crypto Price Checker</h2>
                    <p className="sub">Quick spot check for top coins • live from CoinGecko</p>
                </div>

                <Styled.Controls>
                    <label>
                        Fiat
                        <select value={fiat} onChange={handleFiatChange} aria-label="Fiat currency">
                            <option value="inr">INR (₹)</option>
                            <option value="usd">USD ($)</option>
                        </select>
                    </label>

                    <label>
                        Search
                        <input
                            type="text"
                            placeholder="BTC, ETH, Solana…"
                            value={filter}
                            onChange={handleFilterChange}
                            aria-label="Search coin"
                        />
                    </label>

                    <button onClick={fetchPrices} disabled={loading} title="Refresh now">
                        {loading ? "Refreshing…" : "Refresh"}
                    </button>
                </Styled.Controls>
            </Styled.Header>

            <Styled.Table role="table" aria-label="Crypto prices">
                <Styled.Head role="row" className="head">
                    <span>Coin</span>
                    <span>Price</span>
                    <span>24h</span>
                </Styled.Head>

                {error && (
                    <Styled.Row role="row" className="error">
                        <span>—</span>
                        <span>{error}</span>
                        <span>—</span>
                    </Styled.Row>
                )}

                {!error && loading && (
                    <Styled.Row role="row" className="muted">
                        <span>Loading…</span>
                        <span>—</span>
                        <span>—</span>
                    </Styled.Row>
                )}

                {!error &&
                    filteredCoins.map((c) => {
                        const row = data?.[c.id];
                        const price = row ? row[fiat] : null;
                        const change = row ? row[`${fiat}_24h_change`] : null;

                        const up = typeof change === "number" ? change >= 0 : null;
                        return (
                            <Styled.Row role="row" key={c.id}>
                                <span className="coin">
                                    <b>{c.label}</b>
                                    <Styled.Ticker>{c.symbol}</Styled.Ticker>
                                </span>

                                <span className="price">{price != null ? nfmt.format(price) : "—"}</span>

                                <Styled.Change role="cell" $up={up}>
                                    {change != null ? `${up ? "▲" : "▼"} ${Math.abs(change).toFixed(2)}%` : "—"}
                                </Styled.Change>
                            </Styled.Row>
                        );
                    })}
            </Styled.Table>

            <Styled.StatusBar>
                <span>Fiat: <b>{fiat.toUpperCase()}</b></span>
                <span>Coins: <b>{filteredCoins.length}</b></span>
                <span>
                    Updated: <b>{lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}</b>
                </span>
            </Styled.StatusBar>
        </Styled.Wrapper>
    );
}

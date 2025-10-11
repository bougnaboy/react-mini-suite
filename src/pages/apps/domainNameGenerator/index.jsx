import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/* =========================================================
   Small dictionaries
   ========================================================= */
const DEFAULT_PREFIXES = [
    "get", "go", "try", "my", "the", "real", "true", "hyper", "neo", "meta", "auto", "smart", "quick"
];
const DEFAULT_SUFFIXES = [
    "app", "hq", "hub", "lab", "labs", "base", "stack", "grid", "spark", "forge", "mint", "loop"
];
const DEFAULT_TLDS = [".com", ".in", ".dev", ".io", ".ai", ".co", ".app", ".net", ".org"];

const LS_KEYS = {
    FAVS: "domainGen_favs_v1",
    OPTS: "domainGen_opts_v1",
};

/* =========================================================
   Helpers
   ========================================================= */

/** quick slug-cleaning of tokens */
function cleanToken(s = "") {
    return String(s)
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/** score pronounceability: prefer shorter, more vowel presence, avoid >3 consonants streak */
function scoreWord(w) {
    const s = w.toLowerCase();
    let vowels = (s.match(/[aeiou]/g) || []).length;
    let penalties = 0;
    let streak = 0;
    for (const ch of s) {
        if (/[aeiou]/.test(ch)) {
            streak = 0;
        } else if (/[a-z]/.test(ch)) {
            streak++;
            if (streak >= 3) penalties += 1;
        }
    }
    const lenPenalty = Math.max(0, s.length - 10) * 0.5;
    return vowels * 2 - penalties - lenPenalty;
}

/** format combinator according to style */
function joinParts(a, b, { camel, hyphen, lower, withNumbers }) {
    const number = withNumbers ? Math.floor(Math.random() * 90 + 10) : null; // 2-digit optional
    if (camel) {
        const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);
        const base = `${a}${cap(b)}`;
        return number ? `${base}${number}` : base;
    }
    if (hyphen) {
        const base = `${a}-${b}`;
        return number ? `${base}${number}` : base;
    }
    // default lower or mixed
    const base = lower ? `${a}${b}`.toLowerCase() : `${a}${b}`;
    return number ? `${base}${number}` : base;
}

/** tiny id */
const uid = () => Math.random().toString(36).slice(2, 9);

/** registrar links */
function registrarLinks(domain) {
    const enc = encodeURIComponent(domain);
    return [
        { label: "Namecheap", href: `https://www.namecheap.com/domains/registration/results/?domain=${enc}` },
        { label: "Porkbun", href: `https://porkbun.com/checkout/search?q=${enc}` },
        { label: "Cloudflare", href: `https://dash.cloudflare.com/?to=/:account/registrar/domains/add?domain=${enc}` },
        { label: "DuckDuckGo", href: `https://duckduckgo.com/?q=buy+domain+${enc}` },
    ];
}

/* =========================================================
   Component
   ========================================================= */
const DomainNameGenerator = () => {
    /* ---------- options ---------- */
    const [keywords, setKeywords] = useState("logistics, delivery, fleet");
    const [prefixes, setPrefixes] = useState(DEFAULT_PREFIXES.join(", "));
    const [suffixes, setSuffixes] = useState(DEFAULT_SUFFIXES.join(", "));
    const [tlds, setTlds] = useState(DEFAULT_TLDS.reduce((acc, t) => ({ ...acc, [t]: true }), {}));

    const [style, setStyle] = useState({
        camel: false,
        hyphen: false,
        lower: true,
        withNumbers: false,
    });

    const [options, setOptions] = useState({
        maxLength: 18,
        perClick: 60,
        avoidDoubleLetters: true,
    });

    const [blacklist, setBlacklist] = useState(["test", "demo"]);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [favorites, setFavorites] = useState(() => {
        try { return JSON.parse(localStorage.getItem(LS_KEYS.FAVS) || "[]"); } catch { return []; }
    });

    /* Confirm modal state */
    const [modal, setModal] = useState({ open: false, intent: null, payload: null });

    /* load options if present */
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(LS_KEYS.OPTS) || "null");
            if (saved) {
                setKeywords(saved.keywords ?? keywords);
                setPrefixes(saved.prefixes ?? prefixes);
                setSuffixes(saved.suffixes ?? suffixes);
                setTlds(saved.tlds ?? tlds);
                setStyle(saved.style ?? style);
                setOptions(saved.options ?? options);
                setBlacklist(saved.blacklist ?? blacklist);
            }
        } catch { }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* persist options */
    useEffect(() => {
        const data = { keywords, prefixes, suffixes, tlds, style, options, blacklist };
        try { localStorage.setItem(LS_KEYS.OPTS, JSON.stringify(data)); } catch { }
    }, [keywords, prefixes, suffixes, tlds, style, options, blacklist]);

    const activeTlds = useMemo(
        () => Object.keys(tlds).filter((t) => !!tlds[t]),
        [tlds]
    );

    /* ---------- generator ---------- */
    const dict = useMemo(() => {
        const kw = cleanToken(keywords)
            .split(" ")
            .join(",")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        const pre = cleanToken(prefixes).split(" ").join(",")
            .split(",").map((s) => s.trim()).filter(Boolean);

        const suf = cleanToken(suffixes).split(" ").join(",")
            .split(",").map((s) => s.trim()).filter(Boolean);

        return { kw, pre, suf };
    }, [keywords, prefixes, suffixes]);

    const banned = useMemo(
        () => new Set(blacklist.map((b) => cleanToken(b))),
        [blacklist]
    );

    function combine(dict, style, opts) {
        const out = new Set();

        // pairwise combos: (prefix + kw), (kw + suffix), (kw + kw), (prefix + suffix)
        const combos = [];
        for (const a of [...dict.pre, ...dict.kw]) {
            for (const b of [...dict.kw, ...dict.suf]) {
                if (!a || !b) continue;
                if (a === b) continue;
                combos.push([a, b]);
            }
        }

        for (const [a0, b0] of combos) {
            const a = cleanToken(a0);
            const b = cleanToken(b0);
            if (!a || !b) continue;
            if (banned.has(a) || banned.has(b)) continue;

            let stem = joinParts(a, b, style);
            // avoid double letters at the seam: e.g., "app" + "portal" => "apportal"
            if (opts.avoidDoubleLetters) {
                stem = stem.replace(/([a-z])\1+/gi, "$1$1"); // compress long runs
                stem = stem.replace(/([a-z])\1-/gi, "$1-");  // at hyphen seam
            }

            if (opts.maxLength && stem.length > opts.maxLength) continue;

            // score and push stems
            const baseScore = scoreWord(stem);
            for (const t of activeTlds) {
                const domain = `${stem}${t}`;
                const s = baseScore + (t === ".com" ? 2 : 0) + (t === ".in" ? 1 : 0);
                out.add(JSON.stringify({ domain, stem, tld: t, s }));
            }
        }

        // return as list sorted by score then length
        const list = Array.from(out).map((x) => JSON.parse(x));
        list.sort((a, b) => (b.s - a.s) || (a.domain.length - b.domain.length));
        return list.slice(0, options.perClick);
    }

    const generate = () => {
        const list = combine(dict, style, options);
        setResults(list);
    };

    /* first render generate */
    useEffect(() => { generate(); /* eslint-disable-next-line */ }, []);

    /* ---------- actions ---------- */
    const toggleTld = (t) => setTlds((m) => ({ ...m, [t]: !m[t] }));

    const addBlacklist = (e) => {
        e.preventDefault();
        const v = cleanToken(e.target.elements.banned.value);
        if (!v) return;
        if (!blacklist.includes(v)) setBlacklist([...blacklist, v]);
        e.target.reset();
    };
    const removeBlacklist = (word) => {
        setBlacklist((arr) => arr.filter((x) => x !== word));
    };

    const copy = async (txt) => {
        try { await navigator.clipboard.writeText(txt); } catch { }
    };

    const favAdd = (item) => {
        const rec = { id: uid(), domain: item.domain, createdAt: new Date().toISOString() };
        setFavorites((arr) => {
            const next = [rec, ...arr.filter((x) => x.domain !== item.domain)];
            try { localStorage.setItem(LS_KEYS.FAVS, JSON.stringify(next)); } catch { }
            return next;
        });
    };
    const favRemove = (id) => {
        setFavorites((arr) => {
            const next = arr.filter((x) => x.id !== id);
            try { localStorage.setItem(LS_KEYS.FAVS, JSON.stringify(next)); } catch { }
            return next;
        });
    };
    const favClear = () => {
        setFavorites([]);
        try { localStorage.removeItem(LS_KEYS.FAVS); } catch { }
    };

    /* ---------- modal intents ---------- */
    const openModal = (intent, payload = null) => setModal({ open: true, intent, payload });
    const closeModal = () => setModal({ open: false, intent: null, payload: null });
    const confirmModal = () => {
        const { intent, payload } = modal;
        if (intent === "clearResults") setResults([]);
        if (intent === "clearFavs") favClear();
        if (intent === "removeFav" && payload?.id) favRemove(payload.id);
        closeModal();
    };

    /* ---------- import/export favorites ---------- */
    const fileRef = useRef(null);
    const exportFavs = () => {
        const blob = new Blob([JSON.stringify(favorites, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "domain-favorites.json";
        a.click();
        URL.revokeObjectURL(url);
    };
    const importFavs = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const items = JSON.parse(text);
            if (!Array.isArray(items)) return;
            // merge by domain
            const map = new Map();
            [...favorites, ...items].forEach((x) => map.set(x.domain, x));
            const next = Array.from(map.values()).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
            setFavorites(next);
            localStorage.setItem(LS_KEYS.FAVS, JSON.stringify(next));
        } catch { }
        e.target.value = "";
    };

    /* ---------- filtered views ---------- */
    const filteredResults = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return results;
        return results.filter((r) => r.domain.toLowerCase().includes(q));
    }, [results, query]);

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div>
                    <h1>Domain Name Generator</h1>
                    <p>Create short, pronounceable domain ideas with prefixes, suffixes, and your keywords.</p>
                </div>
                <Styled.ActionsRow>
                    <button onClick={generate}>Generate</button>
                    <button className="ghost" onClick={() => openModal("clearResults")}>Clear Results</button>
                </Styled.ActionsRow>
            </Styled.Header>

            <Styled.Layout>
                {/* LEFT: Controls */}
                <Styled.Card>
                    <Styled.Section>
                        <Styled.SectionTitle>Keywords</Styled.SectionTitle>
                        <Styled.Field className="span2">
                            <label htmlFor="keywords">Comma or space separated</label>
                            <input
                                id="keywords"
                                type="text"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                placeholder="e.g., logistics, delivery, fleet"
                            />
                            <Styled.Help>Examples: fintech, invoice, track, cargo</Styled.Help>
                        </Styled.Field>
                    </Styled.Section>

                    <Styled.Section>
                        <Styled.SectionTitle>Affixes</Styled.SectionTitle>
                        <Styled.Grid>
                            <Styled.Field>
                                <label htmlFor="prefixes">Prefixes</label>
                                <input
                                    id="prefixes"
                                    type="text"
                                    value={prefixes}
                                    onChange={(e) => setPrefixes(e.target.value)}
                                    placeholder="get, go, try, my, hyper"
                                />
                            </Styled.Field>
                            <Styled.Field>
                                <label htmlFor="suffixes">Suffixes</label>
                                <input
                                    id="suffixes"
                                    type="text"
                                    value={suffixes}
                                    onChange={(e) => setSuffixes(e.target.value)}
                                    placeholder="app, hub, lab, stack"
                                />
                            </Styled.Field>
                        </Styled.Grid>
                    </Styled.Section>

                    <Styled.Section>
                        <Styled.SectionTitle>TLDs</Styled.SectionTitle>
                        <Styled.Chips>
                            {DEFAULT_TLDS.map((t) => (
                                <label key={t} className={`chip ${tlds[t] ? "active" : ""}`}>
                                    <input type="checkbox" checked={!!tlds[t]} onChange={() => toggleTld(t)} />
                                    <span>{t}</span>
                                </label>
                            ))}
                        </Styled.Chips>
                    </Styled.Section>

                    <Styled.Section>
                        <Styled.SectionTitle>Style</Styled.SectionTitle>
                        <Styled.Chips>
                            <label className={`chip ${style.lower ? "active" : ""}`}>
                                <input
                                    type="checkbox"
                                    checked={style.lower}
                                    onChange={() => setStyle((s) => ({ ...s, lower: !s.lower }))}
                                /><span>lowercase</span>
                            </label>
                            <label className={`chip ${style.camel ? "active" : ""}`}>
                                <input
                                    type="checkbox"
                                    checked={style.camel}
                                    onChange={() => setStyle((s) => ({ ...s, camel: !s.camel }))}
                                /><span>camelCase</span>
                            </label>
                            <label className={`chip ${style.hyphen ? "active" : ""}`}>
                                <input
                                    type="checkbox"
                                    checked={style.hyphen}
                                    onChange={() => setStyle((s) => ({ ...s, hyphen: !s.hyphen }))}
                                /><span>hyphenated</span>
                            </label>
                            <label className={`chip ${style.withNumbers ? "active" : ""}`}>
                                <input
                                    type="checkbox"
                                    checked={style.withNumbers}
                                    onChange={() => setStyle((s) => ({ ...s, withNumbers: !s.withNumbers }))}
                                /><span>with numbers</span>
                            </label>
                        </Styled.Chips>
                    </Styled.Section>

                    <Styled.Section>
                        <Styled.SectionTitle>Limits & Filters</Styled.SectionTitle>
                        <Styled.Grid>
                            <Styled.Field>
                                <label htmlFor="maxLength">Max Length</label>
                                <input
                                    id="maxLength"
                                    type="number"
                                    min={6}
                                    max={30}
                                    value={options.maxLength}
                                    onChange={(e) => setOptions((o) => ({ ...o, maxLength: Number(e.target.value) }))}
                                />
                            </Styled.Field>
                            <Styled.Field>
                                <label htmlFor="perClick">Count / Generate</label>
                                <input
                                    id="perClick"
                                    type="number"
                                    min={10}
                                    max={200}
                                    value={options.perClick}
                                    onChange={(e) => setOptions((o) => ({ ...o, perClick: Number(e.target.value) }))}
                                />
                            </Styled.Field>
                            <Styled.Field>
                                <label className="checkbox">
                                    <input
                                        type="checkbox"
                                        checked={options.avoidDoubleLetters}
                                        onChange={() => setOptions((o) => ({ ...o, avoidDoubleLetters: !o.avoidDoubleLetters }))}
                                    />
                                    <span>Avoid long double-letter runs</span>
                                </label>
                            </Styled.Field>
                        </Styled.Grid>
                    </Styled.Section>

                    <Styled.Section>
                        <Styled.SectionTitle>Blacklist</Styled.SectionTitle>
                        <form onSubmit={addBlacklist} className="inlineForm">
                            <input name="banned" type="text" placeholder="word to ban" />
                            <button type="submit">Add</button>
                        </form>
                        <Styled.Chips className="pad-top">
                            {blacklist.map((w) => (
                                <button key={w} type="button" className="chip danger" onClick={() => removeBlacklist(w)}>
                                    <span>✕</span> {w}
                                </button>
                            ))}
                        </Styled.Chips>
                    </Styled.Section>
                </Styled.Card>

                {/* RIGHT: Results & Favs */}
                <Styled.Stack>
                    <Styled.Card>
                        <Styled.SectionTitle className="withActions">
                            <span>Results</span>
                            <div className="right">
                                <input
                                    type="search"
                                    placeholder="Search results…"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <button className="ghost" onClick={() => openModal("clearResults")}>Clear</button>
                            </div>
                        </Styled.SectionTitle>

                        {filteredResults.length === 0 ? (
                            <Styled.Empty>Nothing yet. Tweak options and hit Generate.</Styled.Empty>
                        ) : (
                            <Styled.Table role="table">
                                <div className="thead" role="row">
                                    <div className="th">Domain</div>
                                    <div className="th is-sm">TLD</div>
                                    <div className="th is-sm">Len</div>
                                    <div className="th is-sm">Score</div>
                                    <div className="th is-actions">Actions</div>
                                </div>
                                <div className="tbody">
                                    {filteredResults.map((r) => (
                                        <div key={r.domain} className="tr" role="row">
                                            <div className="td mono">{r.domain}</div>
                                            <div className="td is-sm">{r.tld}</div>
                                            <div className="td is-sm">{r.domain.replace(/^https?:\/\//, "").length}</div>
                                            <div className="td is-sm">{r.s.toFixed(2)}</div>
                                            <div className="td is-actions">
                                                <button onClick={() => copy(r.domain)} title="Copy">Copy</button>
                                                <button className="ghost" onClick={() => favAdd(r)} title="Add to Favorites">Save</button>
                                                <div className="split">
                                                    {registrarLinks(r.domain).map((lnk) => (
                                                        <a key={lnk.label} href={lnk.href} target="_blank" rel="noreferrer">{lnk.label}</a>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Styled.Table>
                        )}
                    </Styled.Card>

                    <Styled.Card>
                        <Styled.SectionTitle className="withActions">
                            <span>Favorites ({favorites.length})</span>
                            <div className="right">
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="application/json"
                                    onChange={importFavs}
                                    style={{ display: "none" }}
                                />
                                <button className="ghost" onClick={exportFavs}>Export</button>
                                <button className="ghost" onClick={() => fileRef.current?.click()}>Import</button>
                                <button className="danger" onClick={() => openModal("clearFavs")}>Clear All</button>
                            </div>
                        </Styled.SectionTitle>

                        {favorites.length === 0 ? (
                            <Styled.Empty>No favorites yet.</Styled.Empty>
                        ) : (
                            <Styled.Table role="table" className="cols3">
                                <div className="thead" role="row">
                                    <div className="th">Domain</div>
                                    <div className="th is-sm">Added</div>
                                    <div className="th is-actions">Actions</div>
                                </div>
                                <div className="tbody">
                                    {favorites.map((f) => (
                                        <div key={f.id} className="tr" role="row">
                                            <div className="td mono">{f.domain}</div>
                                            <div className="td is-sm">
                                                {new Date(f.createdAt).toLocaleString("en-IN", {
                                                    year: "numeric", month: "short", day: "2-digit",
                                                    hour: "2-digit", minute: "2-digit", hour12: false
                                                })}
                                            </div>
                                            <div className="td is-actions">
                                                <button onClick={() => copy(f.domain)}>Copy</button>
                                                <a className="ghost" href={registrarLinks(f.domain)[0].href} target="_blank" rel="noreferrer">
                                                    Buy
                                                </a>
                                                <button className="danger" onClick={() => openModal("removeFav", f)}>Remove</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Styled.Table>
                        )}
                    </Styled.Card>
                </Styled.Stack>
            </Styled.Layout>

            {/* Confirm Modal */}
            {modal.open && (
                <Styled.Modal role="dialog" aria-modal="true" aria-label="Confirm">
                    <div className="sheet">
                        <h3>Confirm</h3>
                        <p>
                            {modal.intent === "clearResults" && "Clear all generated results?"}
                            {modal.intent === "clearFavs" && "Clear all favorites? This cannot be undone."}
                            {modal.intent === "removeFav" && `Remove "${modal.payload?.domain}" from favorites?`}
                        </p>
                        <div className="row">
                            <button onClick={confirmModal} className={modal.intent === "clearFavs" || modal.intent === "removeFav" ? "danger" : ""}>
                                Yes
                            </button>
                            <button className="ghost" onClick={closeModal}>Cancel</button>
                        </div>
                    </div>
                    <div className="backdrop" onClick={closeModal} />
                </Styled.Modal>
            )}
        </Styled.Wrapper>
    );
};

export default DomainNameGenerator;

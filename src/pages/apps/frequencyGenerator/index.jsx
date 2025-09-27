import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

const LS_KEY = "frequencyGenerator:v1";

const defaultState = {
    inputText: "",
    mode: "words", // 'words' | 'characters' | 'lines' | 'custom'
    caseSensitive: false,
    stripPunctuation: true, // only for words
    includeSpaces: false,   // only for characters
    customDelimiter: ",",
    excludeList: "",        // comma-separated
    minCount: 1,
    sortBy: "countDesc",    // 'countDesc' | 'itemAsc'
};

function normalizeForWords(text, caseSensitive, stripPunctuation) {
    let output = text;
    if (stripPunctuation) output = output.replace(/[^\p{L}\p{N}\s]+/gu, " ");
    output = output.replace(/\s+/g, " ").trim();
    if (!caseSensitive) output = output.toLowerCase();
    return output;
}

function tokenize(input, opts) {
    const { mode, caseSensitive, stripPunctuation, includeSpaces, customDelimiter } = opts;
    if (!input) return [];

    if (mode === "words") {
        const t = normalizeForWords(input, caseSensitive, stripPunctuation);
        return t ? t.split(" ").filter(Boolean) : [];
    }

    if (mode === "characters") {
        const base = caseSensitive ? input : input.toLowerCase();
        const chars = Array.from(base);
        return includeSpaces ? chars : chars.filter((c) => c.trim() !== "");
    }

    if (mode === "lines") {
        const base = caseSensitive ? input : input.toLowerCase();
        return base.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    }

    const base = caseSensitive ? input : input.toLowerCase();
    const delim = customDelimiter || ",";
    return base.split(delim).map((s) => s.trim()).filter(Boolean);
}

function buildExcludeSet(excludeList, caseSensitive) {
    if (!excludeList) return new Set();
    const items = excludeList
        .split(",")
        .map((s) => (caseSensitive ? s.trim() : s.trim().toLowerCase()))
        .filter(Boolean);
    return new Set(items);
}

function FrequencyGenerator() {
    const [state, setState] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(LS_KEY) || "null");
            return saved ? { ...defaultState, ...saved } : defaultState;
        } catch {
            return defaultState;
        }
    });

    const {
        inputText,
        mode,
        caseSensitive,
        stripPunctuation,
        includeSpaces,
        customDelimiter,
        excludeList,
        minCount,
        sortBy,
    } = state;

    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify(state));
    }, [state]);

    const { rows, totalItems, uniqueItems } = useMemo(() => {
        const excludeSet = buildExcludeSet(excludeList, caseSensitive);
        const tokens = tokenize(inputText, {
            mode,
            caseSensitive,
            stripPunctuation,
            includeSpaces,
            customDelimiter,
        }).filter((t) => !excludeSet.has(t));

        const map = new Map();
        for (const token of tokens) map.set(token, (map.get(token) || 0) + 1);

        let list = Array.from(map.entries()).map(([item, count]) => ({ item, count }));
        const min = Number(minCount) || 1;
        list = list.filter((r) => r.count >= min);

        if (sortBy === "countDesc") {
            list.sort((a, b) => b.count - a.count || a.item.localeCompare(b.item));
        } else {
            list.sort((a, b) => a.item.localeCompare(b.item) || b.count - a.count);
        }

        return { rows: list, totalItems: tokens.length, uniqueItems: map.size };
    }, [inputText, mode, caseSensitive, stripPunctuation, includeSpaces, customDelimiter, excludeList, minCount, sortBy]);

    const set = (key, value) => setState((p) => ({ ...p, [key]: value }));

    function handleClear() {
        const ok = window.confirm(
            "Reset Frequency Generator?\n\nThis will clear the input and all options back to defaults."
        );
        if (!ok) return;
        setState(defaultState);
    }

    function toCSV() {
        const lines = [["Item", "Count", "Percent"]];
        for (const r of rows) {
            const pct = totalItems ? ((r.count / totalItems) * 100).toFixed(2) : "0.00";
            lines.push([r.item, String(r.count), pct]);
        }
        return lines.map((arr) => arr.map(csvEscape).join(",")).join("\n");
    }

    function csvEscape(s) {
        const needsQuotes = /[",\n]/.test(String(s));
        const val = String(s).replace(/"/g, '""');
        return needsQuotes ? `"${val}"` : val;
    }

    async function handleCopyCSV() {
        try {
            await navigator.clipboard.writeText(toCSV());
        } catch { }
    }

    function handleDownloadCSV() {
        const blob = new Blob([toCSV()], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "frequency.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    return (
        <Styled.Wrapper>
            <header className="header">
                <h3>Frequency Generator</h3>
                <p className="sub">Paste text or values → get clean frequency counts.</p>
            </header>

            <div className="grid">
                <section className="inputArea">
                    <label className="label" htmlFor="fg-text">Input</label>
                    <textarea
                        id="fg-text"
                        value={inputText}
                        onChange={(e) => set("inputText", e.target.value)}
                        placeholder="Paste text, CSV values, or any list…"
                    />
                </section>

                <section className="controls">
                    <div className="row">
                        <div className="control">
                            <span className="ctlLabel">Mode</span>
                            <select value={mode} onChange={(e) => set("mode", e.target.value)}>
                                <option value="words">Words</option>
                                <option value="characters">Characters</option>
                                <option value="lines">Lines</option>
                                <option value="custom">Custom delimiter</option>
                            </select>
                        </div>

                        {mode === "custom" && (
                            <div className="control">
                                <span className="ctlLabel">Delimiter</span>
                                <input
                                    type="text"
                                    value={customDelimiter}
                                    onChange={(e) => set("customDelimiter", e.target.value)}
                                    placeholder=","
                                />
                            </div>
                        )}

                        {mode === "words" && (
                            <div className="control chk">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={stripPunctuation}
                                        onChange={(e) => set("stripPunctuation", e.target.checked)}
                                    />
                                    Remove punctuation
                                </label>
                            </div>
                        )}

                        {mode === "characters" && (
                            <div className="control chk">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={includeSpaces}
                                        onChange={(e) => set("includeSpaces", e.target.checked)}
                                    />
                                    Include spaces
                                </label>
                            </div>
                        )}

                        <div className="control chk">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={caseSensitive}
                                    onChange={(e) => set("caseSensitive", e.target.checked)}
                                />
                                Case sensitive
                            </label>
                        </div>

                        <div className="control">
                            <span className="ctlLabel">Exclude (comma-separated)</span>
                            <input
                                type="text"
                                value={excludeList}
                                onChange={(e) => set("excludeList", e.target.value)}
                                placeholder="a, the, an"
                            />
                        </div>

                        <div className="control">
                            <span className="ctlLabel">Min count</span>
                            <input
                                type="number"
                                min={1}
                                value={minCount}
                                onChange={(e) => set("minCount", e.target.value)}
                            />
                        </div>

                        <div className="control">
                            <span className="ctlLabel">Sort</span>
                            <select value={sortBy} onChange={(e) => set("sortBy", e.target.value)}>
                                <option value="countDesc">Count (high → low)</option>
                                <option value="itemAsc">Item (A → Z)</option>
                            </select>
                        </div>
                    </div>

                    <div className="actions">
                        <button onClick={handleCopyCSV}>Copy CSV</button>
                        <button onClick={handleDownloadCSV}>Download CSV</button>
                        <button className="danger" onClick={handleClear}>Clear</button>
                    </div>
                </section>
            </div>

            <section className="summary">
                <div className="pill">Total items: <b>{totalItems}</b></div>
                <div className="pill">Unique: <b>{uniqueItems}</b></div>
                <div className="pill">Showing: <b>{rows.length}</b></div>
            </section>

            <section className="results">
                <Styled.Table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Count</th>
                            <th>%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => {
                            const pct = totalItems ? ((r.count / totalItems) * 100).toFixed(2) : "0.00";
                            return (
                                <tr key={r.item}>
                                    <td className="item">{r.item}</td>
                                    <td className="count">{r.count}</td>
                                    <td className="pct">{pct}</td>
                                </tr>
                            );
                        })}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={3} className="empty">No data yet. Paste text above.</td>
                            </tr>
                        )}
                    </tbody>
                </Styled.Table>
            </section>
        </Styled.Wrapper>
    );
}

export default FrequencyGenerator;

// src/pages/apps/rateCard/index.jsx
import { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";
import { toast } from "react-toastify";

/*
  RateCard — a tiny, printable service rate sheet.

  Scope:
  - Left: quick edit (business meta + simple rows)
  - Right: live preview (prints cleanly)
  - Local-only persistence (no backend)
  - Uses native window.confirm for destructive actions
*/

// ---- localStorage keys (kept explicit so it's easy to grep later)
const LS_META = "rateCard::meta";
const LS_ITEMS = "rateCard::items";

// ---- defaults (seed values keep the empty state useful)
const DEFAULT_META = {
    businessName: "Ashish Ranjan",
    subtitle: "Frontend & Integrations",
    currency: "INR_SYMBOL", // INR_SYMBOL -> "₹", INR_TEXT -> "Rs."
    footer: "Prices exclusive of GST.",
};

const DEFAULT_ITEMS = [
    { id: "srv-1", name: "Landing Page", unit: "per project", rate: "15000" },
    { id: "srv-2", name: "React App Setup", unit: "per project", rate: "12000" },
];

// ---- helpers
const currencySymbol = (currency) => (currency === "INR_TEXT" ? "Rs." : "₹");

// naive id generator (good enough for local tools)
const uid = () =>
    `srv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

// keep only 0-9 and . ; caller decides if empty is allowed
const sanitizeRate = (val) => (val ?? "").toString().replace(/[^\d.]/g, "");

export default function RateCard() {
    const [meta, setMeta] = useState(DEFAULT_META);
    const [items, setItems] = useState(DEFAULT_ITEMS);

    // ---- load persisted state (once)
    useEffect(() => {
        try {
            const m = JSON.parse(localStorage.getItem(LS_META) || "null");
            if (m) setMeta({ ...DEFAULT_META, ...m });
            const it = JSON.parse(localStorage.getItem(LS_ITEMS) || "null");
            if (Array.isArray(it) && it.length) setItems(it);
        } catch {
            // ignore parse errors, keep defaults
        }
    }, []);

    // ---- persist on change
    useEffect(() => {
        localStorage.setItem(LS_META, JSON.stringify(meta));
    }, [meta]);

    useEffect(() => {
        localStorage.setItem(LS_ITEMS, JSON.stringify(items));
    }, [items]);

    const symbol = useMemo(() => currencySymbol(meta.currency), [meta.currency]);

    // ---- handlers (simple + predictable)
    const handleMeta = (key, value) => setMeta((m) => ({ ...m, [key]: value }));

    const addRow = () => {
        setItems((prev) => [...prev, { id: uid(), name: "", unit: "", rate: "" }]);
    };

    const updateRow = (id, key, value) => {
        setItems((prev) =>
            prev.map((row) =>
                row.id === id
                    ? {
                        ...row,
                        [key]: key === "rate" ? sanitizeRate(value) : value,
                    }
                    : row
            )
        );
    };

    const deleteRow = (id) => {
        const ok = window.confirm(
            "Delete this row?\n\nThis action cannot be undone."
        );
        if (!ok) return;
        setItems((prev) => prev.filter((r) => r.id !== id));
        toast.info("Row removed");
    };

    const clearAll = () => {
        const ok = window.confirm(
            "Clear all data?\n\nThis will remove business info and all rows."
        );
        if (!ok) return;
        localStorage.removeItem(LS_META);
        localStorage.removeItem(LS_ITEMS);
        setMeta(DEFAULT_META);
        setItems(DEFAULT_ITEMS);
        toast.success("Reset complete");
    };

    const handlePrint = () => window.print();

    const rateHeader = `Rate (${symbol})`;

    return (
        <Styled.Wrapper>
            <Styled.Header className="no-print">
                <h1>RateCard</h1>
                <p>One-page, printable service rate sheet.</p>
            </Styled.Header>

            <Styled.Grid>
                {/* -------- Left: Edit panel -------- */}
                <Styled.EditPanel className="no-print" aria-label="Editor">
                    <Styled.Field>
                        <label htmlFor="biz">Business Name</label>
                        <input
                            id="biz"
                            value={meta.businessName}
                            onChange={(e) => handleMeta("businessName", e.target.value)}
                            placeholder="Your business name"
                        />
                    </Styled.Field>

                    <Styled.Field>
                        <label htmlFor="sub">Subtitle / Tagline (optional)</label>
                        <input
                            id="sub"
                            value={meta.subtitle}
                            onChange={(e) => handleMeta("subtitle", e.target.value)}
                            placeholder="e.g., Web, UI, Integrations"
                        />
                    </Styled.Field>

                    <Styled.Field>
                        <label>Currency</label>
                        <div className="row">
                            <label className="radio">
                                <input
                                    type="radio"
                                    checked={meta.currency === "INR_SYMBOL"}
                                    onChange={() => handleMeta("currency", "INR_SYMBOL")}
                                />
                                <span>₹</span>
                            </label>
                            <label className="radio">
                                <input
                                    type="radio"
                                    checked={meta.currency === "INR_TEXT"}
                                    onChange={() => handleMeta("currency", "INR_TEXT")}
                                />
                                <span>Rs.</span>
                            </label>
                        </div>
                    </Styled.Field>

                    <Styled.Field>
                        <label htmlFor="foot">Footer Note (optional)</label>
                        <input
                            id="foot"
                            value={meta.footer}
                            onChange={(e) => handleMeta("footer", e.target.value)}
                            placeholder="e.g., Prices exclusive of GST."
                        />
                    </Styled.Field>

                    <Styled.itemsHeader>
                        <span>Service</span>
                        <span>Unit</span>
                        <span>{rateHeader}</span>
                        <span />
                    </Styled.itemsHeader>

                    <Styled.Items>
                        {items.map((row) => (
                            <div key={row.id} className="itemRow">
                                <input
                                    className="name"
                                    placeholder="Service name"
                                    value={row.name}
                                    onChange={(e) => updateRow(row.id, "name", e.target.value)}
                                />
                                <input
                                    className="unit"
                                    placeholder="per hour / per project"
                                    value={row.unit}
                                    onChange={(e) => updateRow(row.id, "unit", e.target.value)}
                                />
                                <input
                                    className="rate"
                                    placeholder="0"
                                    inputMode="decimal"
                                    value={row.rate}
                                    onChange={(e) => updateRow(row.id, "rate", e.target.value)}
                                />
                                <button
                                    className="danger"
                                    type="button"
                                    onClick={() => deleteRow(row.id)}
                                    aria-label="Delete row"
                                    title="Delete row"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </Styled.Items>

                    <Styled.Actions className="no-print">
                        <button onClick={addRow}>Add Row</button>
                        <button onClick={clearAll} className="ghost">
                            Clear All
                        </button>
                        <button onClick={handlePrint}>Print</button>
                    </Styled.Actions>
                </Styled.EditPanel>

                {/* -------- Right: Preview (prints only this card) -------- */}
                <Styled.PreviewCard id="rateCardPrint" aria-label="Preview">
                    <header>
                        <h2>{meta.businessName || "—"}</h2>
                        {meta.subtitle ? <p className="muted">{meta.subtitle}</p> : null}
                    </header>

                    <div className="table">
                        <div className="thead">
                            <span>Service</span>
                            <span>Unit</span>
                            <span>{rateHeader}</span>
                        </div>

                        <div className="tbody">
                            {items.length === 0 ? (
                                <div className="row">
                                    <span>—</span>
                                    <span>—</span>
                                    <span>—</span>
                                </div>
                            ) : (
                                items.map((r) => (
                                    <div className="row" key={r.id}>
                                        <span className="name">{r.name || "—"}</span>
                                        <span className="unit">{r.unit || "—"}</span>
                                        <span className="rate">
                                            {r.rate ? `${symbol} ${r.rate}` : "—"}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {meta.footer ? <footer className="muted">{meta.footer}</footer> : null}
                </Styled.PreviewCard>
            </Styled.Grid>
        </Styled.Wrapper>
    );
}

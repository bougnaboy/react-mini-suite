import { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

/** ----------------------- Storage Keys ----------------------- */
const KEYS = {
    DRAFT: "sb_draft",
    SETTINGS: "sb_settings",
    HISTORY: "sb_history",
};

/** ----------------------- Currency --------------------------- */
const CURRENCY = {
    INR: { code: "INR", symbol: "₹", locale: "en-IN" },
    USD: { code: "USD", symbol: "$", locale: "en-US" },
};
const fmtMoney = (n, currency = "INR") => {
    const cfg = CURRENCY[currency] || CURRENCY.INR;
    const num = Number.isFinite(+n) ? +n : 0;
    return new Intl.NumberFormat(cfg.locale, {
        style: "currency",
        currency: cfg.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
};

/** ----------------------- Defaults --------------------------- */
const defaultSettings = {
    storeName: "Your Store",
    address: "Address line • Phone",
    phone: "",
    series: "SB",
    nextNumber: 1,
    currency: "INR", // "INR" | "USD"
};

const newItem = () => ({
    name: "",
    price: "",
    qty: "1",
    discType: "%", // "%", "₹", "$"
    discValue: "",
});

const newDraft = () => ({
    id: "DRAFT",
    createdAt: new Date().toISOString(),
    items: [newItem()],
    billDiscType: "%", // "%", "₹", "$"
    billDiscValue: "",
    note: "",
});

/** ----------------------- Helpers ---------------------------- */
const prettyDate = (d) =>
    new Date(d)
        .toLocaleString("en-GB", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        })
        .replace(",", "") + " hrs";

const load = (k, fb) => {
    try {
        const v = JSON.parse(localStorage.getItem(k) || "null");
        return v ?? fb;
    } catch {
        return fb;
    }
};
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

function escapeHtml(s = "") {
    return s.replace(
        /[&<>"']/g,
        (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
            c
        ])
    );
}

/** ----------------------- Math ------------------------------- */
function lineTotals(item) {
    const price = +item.price || 0;
    const qty = +item.qty || 0;
    const base = price * qty;
    const dval = +item.discValue || 0;
    const disc = item.discType === "%" ? (base * dval) / 100 : dval; // % vs absolute
    const total = Math.max(0, base - Math.min(disc, base));
    return { base, disc: Math.min(disc, base), total };
}

function billTotals(draft) {
    const lines = draft.items.map(lineTotals);
    const subTotal = lines.reduce((s, l) => s + l.total, 0);
    const bdv = +draft.billDiscValue || 0;
    const billDisc =
        draft.billDiscType === "%" ? (subTotal * bdv) / 100 : bdv;
    const billDiscAmt = Math.min(billDisc, subTotal);
    const grand = Math.max(0, subTotal - billDiscAmt);
    return {
        subTotal: round2(subTotal),
        billDiscAmt: round2(billDiscAmt),
        grand: round2(grand),
    };
}

const round2 = (n) => Math.round((+n || 0) * 100) / 100;

/** ----------------------- Print ------------------------------ */
function buildPrintHTML({ draft, settings, totals }) {
    const cur = CURRENCY[settings.currency] || CURRENCY.INR;
    const f = (n) =>
        new Intl.NumberFormat(cur.locale, {
            style: "currency",
            currency: cur.code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(Number.isFinite(+n) ? +n : 0);

    const rows = draft.items
        .filter((i) => (i.name || "").trim())
        .map((i) => {
            const t = lineTotals(i);
            return `
        <tr>
          <td>${escapeHtml(i.name)}</td>
          <td style="text-align:right">${f(+i.price || 0)}</td>
          <td style="text-align:right">${+i.qty || 0}</td>
          <td style="text-align:right">${i.discType}${+i.discValue || 0}</td>
          <td style="text-align:right">${f(t.total)}</td>
        </tr>`;
        })
        .join("");

    const billNo =
        draft.id === "DRAFT"
            ? "DRAFT"
            : `${settings.series}-${String(draft.number).padStart(4, "0")}`;

    const css = `
  @page { size: A5; margin: 10mm; }
  * { box-sizing: border-box; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial }
  h2,h3 { margin: 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { padding: 6px; border-bottom: 1px solid #ddd; font-size: 12px; }
  tfoot td { border: 0; }
  .meta { display:flex; justify-content:space-between; font-size:12px; margin:8px 0; }
  .muted { color:#555; font-size:12px; }
  .tot { font-weight:700 }
  `;

    return `<!doctype html>
<html>
<head><meta charset="utf-8"/><title>Bill ${billNo}</title><style>${css}</style></head>
<body>
  <h2>${escapeHtml(settings.storeName || "Your Store")}</h2>
  <div class="muted">${escapeHtml(settings.address || "")}</div>
  <div class="muted">${escapeHtml(settings.phone || "")}</div>
  <hr/>
  <div class="meta">
    <div><strong>Bill No:</strong> ${billNo}</div>
    <div><strong>Date:</strong> ${prettyDate(draft.createdAt)}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="text-align:left">Item</th>
        <th style="text-align:right">Price</th>
        <th style="text-align:right">Qty</th>
        <th style="text-align:right">Disc</th>
        <th style="text-align:right">Line Total</th>
      </tr>
    </thead>
    <tbody>${rows || `<tr><td colspan="5" class="muted">No items</td></tr>`}</tbody>
    <tfoot>
      <tr><td colspan="4" style="text-align:right">Sub-total</td><td style="text-align:right">${f(totals.subTotal)}</td></tr>
      <tr><td colspan="4" style="text-align:right">Bill Discount</td><td style="text-align:right">${f(totals.billDiscAmt)}</td></tr>
      <tr><td colspan="4" class="tot" style="text-align:right">Grand Total</td><td class="tot" style="text-align:right">${f(totals.grand)}</td></tr>
    </tfoot>
  </table>

  ${draft.note ? `<div class="muted" style="margin-top:8px"><strong>Note:</strong> ${escapeHtml(draft.note)}</div>` : ""}
  <p class="muted" style="text-align:center;margin-top:12px">Thank you!</p>
  <script>window.print();</script>
</body></html>`;
}

/** ----------------------- Component -------------------------- */
export default function ShopBilling() {
    const [settings, setSettings] = useState(() =>
        load(KEYS.SETTINGS, defaultSettings)
    );
    const [draft, setDraft] = useState(() => load(KEYS.DRAFT, newDraft()));
    const [history, setHistory] = useState(() => load(KEYS.HISTORY, []));
    const [showSettings, setShowSettings] = useState(false);

    // Persist
    useEffect(() => save(KEYS.SETTINGS, settings), [settings]);
    useEffect(() => save(KEYS.DRAFT, draft), [draft]);
    useEffect(() => save(KEYS.HISTORY, history), [history]);

    // Totals
    const totals = useMemo(() => billTotals(draft), [draft]);

    /** ---------- Row has-data check + remove ---------- */
    function hasRowData(it) {
        const hasName = (it.name || "").trim() !== "";
        const hasPrice = (+it.price || 0) > 0;
        const hasQty = (it.qty ?? "") !== "" && +it.qty !== 1;
        const hasDisc =
            (+it.discValue || 0) > 0 || (it.discType && it.discType !== "%");
        return hasName || hasPrice || hasQty || hasDisc;
    }

    const removeItem = (idx) =>
        setDraft((d) => {
            const item = d.items[idx];
            if (hasRowData(item)) {
                const ok = confirm("This row has data. Delete it?");
                if (!ok) return d;
            }
            const items = d.items.slice();
            items.splice(idx, 1);
            return { ...d, items: items.length ? items : [newItem()] };
        });

    /** ---------- Item + bill handlers ---------- */
    const addRow = () =>
        setDraft((d) => ({ ...d, items: [...d.items, newItem()] }));

    const updateItem = (idx, patch) =>
        setDraft((d) => {
            const items = d.items.slice();
            items[idx] = { ...items[idx], ...patch };
            return { ...d, items };
        });

    const handleNew = () => {
        if (!confirm("Start a new bill? Unsaved changes will be cleared.")) return;
        setDraft(newDraft());
    };

    const handleClear = () => {
        if (!confirm("Clear current draft?")) return;
        setDraft((d) => ({ ...newDraft(), createdAt: d.createdAt }));
    };

    const handleSave = () => {
        // assign number if first save
        let saved = draft;
        if (draft.id === "DRAFT") {
            const number = settings.nextNumber || 1;
            const id = `${settings.series}-${String(number).padStart(4, "0")}`;
            saved = { ...draft, id, number };
            setSettings((s) => ({ ...s, nextNumber: number + 1 }));
        }
        saved = {
            ...saved,
            createdAt: draft.createdAt || new Date().toISOString(),
        };

        // upsert history
        setHistory((h) => {
            const i = h.findIndex((b) => b.id === saved.id);
            if (i >= 0) {
                const next = h.slice();
                next[i] = { ...saved, totals: billTotals(saved) };
                return next;
            }
            return [{ ...saved, totals: billTotals(saved) }, ...h];
        });

        setDraft(saved);
        alert("Bill saved.");
    };

    const handlePrint = () => {
        const html = buildPrintHTML({ draft, settings, totals });
        const w = window.open("", "_blank", "width=720,height=900");
        if (!w) {
            alert("Popup blocked. Allow popups to print.");
            return;
        }
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.focus();
    };

    const openFromHistory = (id) => {
        const bill = history.find((b) => b.id === id);
        if (bill) {
            setDraft({
                id: bill.id,
                number: bill.number,
                createdAt: bill.createdAt,
                items: bill.items,
                billDiscType: bill.billDiscType,
                billDiscValue: bill.billDiscValue,
                note: bill.note || "",
            });
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const deleteFromHistory = (id) => {
        if (!confirm(`Delete ${id}?`)) return;
        setHistory((h) => h.filter((b) => b.id !== id));
    };

    const curSym = (CURRENCY[settings.currency] || CURRENCY.INR).symbol;

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div>
                    <Styled.Title>{settings.storeName || "Your Store"}</Styled.Title>
                    <Styled.Subtitle>
                        {settings.address || "Address line • Phone"}
                    </Styled.Subtitle>
                </div>

                <Styled.Actions>
                    <Styled.Button onClick={handleNew}>New</Styled.Button>
                    <Styled.Button onClick={handleSave}>Save</Styled.Button>
                    <Styled.Button onClick={handlePrint} $variant="ghost">
                        Print
                    </Styled.Button>
                    <Styled.Button onClick={handleClear} $variant="danger">
                        Clear
                    </Styled.Button>
                    <Styled.Button onClick={() => setShowSettings(true)} $variant="ghost">
                        Settings
                    </Styled.Button>
                </Styled.Actions>
            </Styled.Header>

            <Styled.MetaRow>
                <div>
                    <strong>Bill No:</strong>{" "}
                    {draft.id === "DRAFT"
                        ? "DRAFT"
                        : `${settings.series}-${String(draft.number).padStart(4, "0")}`}
                </div>
                <div>
                    <strong>Date/Time:</strong> {prettyDate(draft.createdAt)}
                </div>
                <div>
                    <strong>Currency:</strong> {curSym} {settings.currency}
                </div>
            </Styled.MetaRow>

            {/* Items */}
            <Styled.Card>
                <Styled.CardHead>
                    <Styled.CardTitle>Items</Styled.CardTitle>
                    <Styled.Button onClick={addRow} $variant="ghost">
                        + Add Row
                    </Styled.Button>
                </Styled.CardHead>

                <Styled.Table>
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th className="num">Price</th>
                            <th className="num">Qty</th>
                            <th className="num">Disc Type</th>
                            <th className="num">Disc Value</th>
                            <th className="num">Line Total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {draft.items.map((it, idx) => {
                            const t = lineTotals(it);
                            return (
                                <tr key={idx}>
                                    <td>
                                        <input
                                            value={it.name}
                                            placeholder="Item name"
                                            onChange={(e) => updateItem(idx, { name: e.target.value })}
                                        />
                                    </td>
                                    <td className="num">
                                        <input
                                            type="number"
                                            value={it.price}
                                            onChange={(e) => updateItem(idx, { price: e.target.value })}
                                        />
                                    </td>
                                    <td className="num">
                                        <input
                                            type="number"
                                            value={it.qty}
                                            onChange={(e) => updateItem(idx, { qty: e.target.value })}
                                        />
                                    </td>
                                    <td className="num">
                                        <select
                                            value={it.discType}
                                            onChange={(e) =>
                                                updateItem(idx, { discType: e.target.value })
                                            }
                                        >
                                            <option value="%">%</option>
                                            <option value="₹">₹</option>
                                            <option value="$">$</option>
                                        </select>
                                    </td>
                                    <td className="num">
                                        <input
                                            type="number"
                                            value={it.discValue}
                                            onChange={(e) =>
                                                updateItem(idx, { discValue: e.target.value })
                                            }
                                        />
                                    </td>
                                    <td className="num">
                                        {fmtMoney(t.total, settings.currency)}
                                    </td>
                                    <td className="num">
                                        <Styled.IconBtn
                                            onClick={() => removeItem(idx)}
                                            title="Remove"
                                        >
                                            ✕
                                        </Styled.IconBtn>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Styled.Table>

                {/* Bill-level discount + totals */}
                <Styled.Totals>
                    <div className="billdisc">
                        <label>Bill Discount</label>
                        <div className="row">
                            <select
                                value={draft.billDiscType}
                                onChange={(e) =>
                                    setDraft((d) => ({ ...d, billDiscType: e.target.value }))
                                }
                            >
                                <option value="%">%</option>
                                <option value="₹">₹</option>
                                <option value="$">$</option>
                            </select>
                            <input
                                type="number"
                                value={draft.billDiscValue}
                                onChange={(e) =>
                                    setDraft((d) => ({ ...d, billDiscValue: e.target.value }))
                                }
                            />
                        </div>
                    </div>

                    <div className="sums">
                        <div>
                            <span>Sub-total</span>
                            <strong>{fmtMoney(totals.subTotal, settings.currency)}</strong>
                        </div>
                        <div>
                            <span>Bill Discount</span>
                            <strong>{fmtMoney(totals.billDiscAmt, settings.currency)}</strong>
                        </div>
                        <div className="grand">
                            <span>Grand Total</span>
                            <strong>{fmtMoney(totals.grand, settings.currency)}</strong>
                        </div>
                    </div>
                </Styled.Totals>

                <Styled.NoteBox
                    placeholder="Note"
                    value={draft.note}
                    onChange={(e) =>
                        setDraft((d) => ({ ...d, note: e.target.value }))
                    }
                />
            </Styled.Card>

            {/* History */}
            <Styled.H2>Saved Bills</Styled.H2>
            <Styled.History>
                {history.length === 0 && (
                    <Styled.Empty>No saved bills yet.</Styled.Empty>
                )}
                {history.map((b) => (
                    <Styled.HItem key={b.id}>
                        <div>
                            <strong>{b.id}</strong>
                            <div className="muted">{prettyDate(b.createdAt)}</div>
                        </div>
                        <div className="muted">
                            {fmtMoney(b.totals?.grand || 0, settings.currency)}
                        </div>
                        <div className="row">
                            <Styled.Button
                                $variant="ghost"
                                onClick={() => openFromHistory(b.id)}
                            >
                                Open
                            </Styled.Button>
                            <Styled.Button
                                $variant="ghost"
                                onClick={() => {
                                    const html = buildPrintHTML({
                                        draft: b,
                                        settings,
                                        totals: b.totals || billTotals(b),
                                    });
                                    const w = window.open("", "_blank", "width=720,height=900");
                                    if (!w) return alert("Popup blocked");
                                    w.document.open();
                                    w.document.write(html);
                                    w.document.close();
                                    w.focus();
                                }}
                            >
                                Print
                            </Styled.Button>
                            <Styled.Button
                                $variant="danger"
                                onClick={() => deleteFromHistory(b.id)}
                            >
                                Delete
                            </Styled.Button>
                        </div>
                    </Styled.HItem>
                ))}
            </Styled.History>

            {/* Settings Modal */}
            {showSettings && (
                <Styled.Modal
                    onMouseDown={(e) =>
                        e.target === e.currentTarget && setShowSettings(false)
                    }
                >
                    <Styled.Dialog onMouseDown={(e) => e.stopPropagation()}>
                        <Styled.DialogHead>
                            <h3>Store Settings</h3>
                            <button onClick={() => setShowSettings(false)} aria-label="Close">
                                ✕
                            </button>
                        </Styled.DialogHead>

                        <Styled.Form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setShowSettings(false);
                            }}
                        >
                            <label>
                                <span>Store Name</span>
                                <input
                                    value={settings.storeName}
                                    onChange={(e) =>
                                        setSettings((s) => ({ ...s, storeName: e.target.value }))
                                    }
                                />
                            </label>
                            <label>
                                <span>Address</span>
                                <textarea
                                    rows={2}
                                    value={settings.address}
                                    onChange={(e) =>
                                        setSettings((s) => ({ ...s, address: e.target.value }))
                                    }
                                />
                            </label>
                            <label>
                                <span>Phone</span>
                                <input
                                    value={settings.phone}
                                    onChange={(e) =>
                                        setSettings((s) => ({ ...s, phone: e.target.value }))
                                    }
                                />
                            </label>
                            <Styled.Grid2>
                                <label>
                                    <span>Bill Series</span>
                                    <input
                                        value={settings.series}
                                        onChange={(e) =>
                                            setSettings((s) => ({
                                                ...s,
                                                series: e.target.value.toUpperCase().slice(0, 6),
                                            }))
                                        }
                                    />
                                </label>
                                <label>
                                    <span>Next Number</span>
                                    <input
                                        type="number"
                                        min={1}
                                        value={settings.nextNumber}
                                        onChange={(e) =>
                                            setSettings((s) => ({
                                                ...s,
                                                nextNumber: Math.max(1, +e.target.value || 1),
                                            }))
                                        }
                                    />
                                </label>
                            </Styled.Grid2>

                            <label>
                                <span>Currency</span>
                                <select
                                    value={settings.currency}
                                    onChange={(e) =>
                                        setSettings((s) => ({ ...s, currency: e.target.value }))
                                    }
                                >
                                    <option value="INR">₹ INR</option>
                                    <option value="USD">$ USD</option>
                                </select>
                            </label>

                            <Styled.DialogFoot>
                                <Styled.Button type="submit">Save</Styled.Button>
                                <Styled.Button
                                    $variant="ghost"
                                    type="button"
                                    onClick={() => setSettings(defaultSettings)}
                                >
                                    Reset Defaults
                                </Styled.Button>
                            </Styled.DialogFoot>
                        </Styled.Form>
                    </Styled.Dialog>
                </Styled.Modal>
            )}
        </Styled.Wrapper>
    );
}

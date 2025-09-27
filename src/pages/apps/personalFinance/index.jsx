import { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

/* ============================ Constants ============================ */
const KEYS = {
    SETTINGS: "pf_settings",
    ACCOUNTS: "pf_accounts",
    TXNS: "pf_transactions",
    BUDGETS: "pf_budgets",
};

const DEFAULT_SETTINGS = {
    currency: "INR", // INR | USD
    month: yyyyMM(new Date()),
};

const DEFAULT_ACCOUNTS = [
    { id: "CASH", name: "Cash", type: "Wallet", initial: 0 },
];

const DEFAULT_BUDGETS = [
    { id: "groceries", name: "Groceries", budget: 6000 },
    { id: "travel", name: "Travel", budget: 3000 },
    { id: "rent", name: "Rent", budget: 0 },
    { id: "food", name: "Food/Delivery", budget: 3000 },
    { id: "ent", name: "Entertainment", budget: 1500 },
];

function yyyyMM(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function todayInMonth(m) {
    const [y, mm] = m.split("-").map(Number);
    return `${y}-${String(mm).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
}
function uid() { return Math.random().toString(36).slice(2, 10); }

function load(key, fb) {
    try {
        const v = JSON.parse(localStorage.getItem(key) || "null");
        return v ?? fb;
    } catch {
        return fb;
    }
}
function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function sym(currency) {
    return currency === "INR" ? "₹" : "$";
}
function fmt(currency, n) {
    if (currency === "INR") {
        return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);
    }
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
}
function parseAmount(s) {
    const n = Number(s);
    return isNaN(n) ? 0 : n;
}

/* ============================= Component ============================= */
export default function PersonalFinance() {
    const [settings, setSettings] = useState(() => load(KEYS.SETTINGS, DEFAULT_SETTINGS));
    const [accounts, setAccounts] = useState(() => load(KEYS.ACCOUNTS, DEFAULT_ACCOUNTS));
    const [budgets, setBudgets] = useState(() => load(KEYS.BUDGETS, DEFAULT_BUDGETS));
    const [txns, setTxns] = useState(() => load(KEYS.TXNS, []));

    const [q, setQ] = useState("");
    const [typeFilter, setTypeFilter] = useState("all"); // all|expense|income
    const [catFilter, setCatFilter] = useState("all");
    const [accFilter, setAccFilter] = useState("all");
    const [sort, setSort] = useState("dateDesc"); // dateDesc|dateAsc|amountDesc|amountAsc

    // add txn draft
    const [draft, setDraft] = useState({
        date: todayInMonth(settings.month),
        type: "expense",
        accountId: accounts[0]?.id || "",
        categoryId: budgets[0]?.id || "",
        note: "",
        amount: "",
    });

    useEffect(() => save(KEYS.SETTINGS, settings), [settings]);
    useEffect(() => save(KEYS.ACCOUNTS, accounts), [accounts]);
    useEffect(() => save(KEYS.BUDGETS, budgets), [budgets]);
    useEffect(() => save(KEYS.TXNS, txns), [txns]);

    // derived
    const monthTxns = useMemo(() => {
        const list = txns.filter((t) => (t.date || "").startsWith(settings.month));
        return list;
    }, [txns, settings.month]);

    const categoriesMap = useMemo(() => {
        const m = new Map();
        budgets.forEach((b) => m.set(b.id, b));
        return m;
    }, [budgets]);

    const accountsMap = useMemo(() => {
        const m = new Map();
        accounts.forEach((a) => m.set(a.id, a));
        return m;
    }, [accounts]);

    const filtered = useMemo(() => {
        let list = monthTxns.slice();
        if (q.trim()) {
            const qq = q.toLowerCase();
            list = list.filter((t) =>
                [t.note, t.accountId, t.categoryId].join(" ").toLowerCase().includes(qq)
            );
        }
        if (typeFilter !== "all") list = list.filter((t) => t.type === typeFilter);
        if (catFilter !== "all") list = list.filter((t) => t.categoryId === catFilter);
        if (accFilter !== "all") list = list.filter((t) => t.accountId === accFilter);

        list.sort((a, b) => {
            if (sort === "dateDesc") return b.date.localeCompare(a.date);
            if (sort === "dateAsc") return a.date.localeCompare(b.date);
            if (sort === "amountDesc") return b.amount - a.amount;
            if (sort === "amountAsc") return a.amount - b.amount;
            return 0;
        });
        return list;
    }, [monthTxns, q, typeFilter, catFilter, accFilter, sort]);

    const stats = useMemo(() => {
        const income = monthTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const expense = monthTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        return { income, expense, net: income - expense };
    }, [monthTxns]);

    const budgetUse = useMemo(() => {
        const used = {};
        monthTxns.forEach((t) => {
            if (t.type !== "expense") return;
            used[t.categoryId] = (used[t.categoryId] || 0) + t.amount;
        });
        return used;
    }, [monthTxns]);

    /* ============================== Actions ============================== */
    function addTxn() {
        const amt = parseAmount(draft.amount);
        if (!draft.date || !draft.accountId || !draft.categoryId || !amt) {
            alert("Please fill date, account, category and a non-zero amount.");
            return;
        }
        const rec = {
            id: uid(),
            date: draft.date,
            type: draft.type, // expense|income
            accountId: draft.accountId,
            categoryId: draft.categoryId,
            note: draft.note.trim(),
            amount: amt,
        };
        setTxns((arr) => [rec, ...arr]);
        setDraft((d) => ({ ...d, note: "", amount: "" }));
    }

    function deleteTxn(id) {
        const t = txns.find((x) => x.id === id);
        const label = t
            ? `<td>${fmtTableDate(t.date)}</td> • ${t.type === "expense" ? "-" : "+"}${fmt(settings.currency, t.amount)}`
            : "";
        if (!confirm(`Delete this transaction?\n${label}`)) return;
        setTxns((arr) => arr.filter((x) => x.id !== id));
    }

    function addAccount() {
        const name = window.prompt("Account name (e.g., HDFC, UPI Wallet):", "");
        if (!name) return;
        const type = window.prompt("Type (e.g., Bank, Card, Wallet):", "Bank") || "Bank";
        const initial = parseAmount(window.prompt("Starting balance (optional):", "0"));
        const rec = { id: name.toUpperCase().replace(/\s+/g, "_"), name, type, initial };
        setAccounts((arr) => [rec, ...arr]);
        setDraft((d) => ({ ...d, accountId: rec.id }));
    }

    function deleteAccount(id) {
        const used = txns.some((t) => t.accountId === id);
        if (used) {
            if (!confirm("This account has transactions. Delete anyway? They'll stay but show the old account id.")) return;
        } else {
            if (!confirm("Delete this account?")) return;
        }
        setAccounts((arr) => arr.filter((a) => a.id !== id));
    }

    function addBudget() {
        const name = window.prompt("Category name:", "");
        if (!name) return;
        const budget = parseAmount(window.prompt("Monthly budget amount:", "0"));
        const rec = { id: name.toLowerCase().replace(/\s+/g, "-"), name, budget };
        setBudgets((arr) => [rec, ...arr]);
        setDraft((d) => ({ ...d, categoryId: rec.id }));
    }

    function updateBudget(id, patch) {
        setBudgets((arr) => arr.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    }

    function deleteBudget(id) {
        const used = txns.some((t) => t.categoryId === id);
        const extra = used ? " Transactions using this category will keep the id." : "";
        if (!confirm(`Delete this category?${extra}`)) return;
        setBudgets((arr) => arr.filter((b) => b.id !== id));
    }

    function handleExport() {
        const payload = {
            _type: "pf-dashboard",
            _v: 1,
            settings,
            accounts,
            budgets,
            txns,
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `pf-${settings.month}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    function handleImport(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const r = new FileReader();
        r.onload = () => {
            try {
                const text = String(r.result).replace(/^\uFEFF/, "");
                const data = JSON.parse(text);
                if (!confirm("Import will replace current data. Continue?")) return;
                setSettings(data.settings || DEFAULT_SETTINGS);
                setAccounts(Array.isArray(data.accounts) ? data.accounts : []);
                setBudgets(Array.isArray(data.budgets) ? data.budgets : []);
                setTxns(Array.isArray(data.txns) ? data.txns : []);
            } catch {
                alert("Invalid JSON.");
            } finally {
                e.target.value = "";
            }
        };
        r.readAsText(file);
    }

    function handleReset() {
        if (!confirm("Reset everything?")) return;
        setSettings(DEFAULT_SETTINGS);
        setAccounts(DEFAULT_ACCOUNTS);
        setBudgets(DEFAULT_BUDGETS);
        setTxns([]);
    }

    function handlePrint() {
        const cur = settings.currency;

        const css = `
    @page { size: A4; margin: 14mm; }
    body {
      font: 12px/1.45 -apple-system, system-ui, "Segoe UI", Roboto, Arial, sans-serif;
      color: #111;
    }
    h2 { margin: 0 0 10px; font-size: 18px; }

    .muted { color:#666; }

    /* summary cards */
    .grid { display:flex; gap:8px; margin:6px 0 10px; }
    .card { flex:1 1 0; border:1px solid #ccc; border-radius:8px; padding:8px 10px; }

    /* table */
    table { width:100%; border-collapse: collapse; table-layout: fixed; }
    col.date { width: 180px; }
    col.acc  { width: 140px; }
    col.cat  { width: 140px; }
    col.note { width: auto; }
    col.amt  { width: 110px; }

    thead th {
      text-align:left; color:#444; font-weight:600;
      border-bottom:1px solid #ccc; padding:6px 8px;
    }
    tbody td {
      border-top:1px solid #eee; padding:6px 8px; vertical-align: top;
    }
    td.right, th.right { text-align:right; }
    tbody tr:nth-child(even) { background:#f8f8f8; }
    td.note { word-break: break-word; }
    tr { page-break-inside: avoid; }
  `;

        const rows = filtered.map((t) => `
    <tr>
      <td>${fmtTableDate(t.date)}</td>
      <td>${escapeHtml(accountsMap.get(t.accountId)?.name || t.accountId)}</td>
      <td>${escapeHtml(categoriesMap.get(t.categoryId)?.name || t.categoryId)}</td>
      <td class="note">${escapeHtml(t.note || "")}</td>
      <td class="right">${t.type === "expense" ? "-" : "+"}${fmt(cur, t.amount)}</td>
    </tr>
  `).join("");

        const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Finance — ${settings.month}</title>
  <style>${css}</style>
</head>
<body>
  <h2>Personal Finance — ${settings.month}</h2>

  <div class="grid">
    <div class="card"><div class="muted">Income</div><div><strong>${fmt(cur, stats.income)}</strong></div></div>
    <div class="card"><div class="muted">Expense</div><div><strong>${fmt(cur, stats.expense)}</strong></div></div>
    <div class="card"><div class="muted">Net</div><div><strong>${fmt(cur, stats.net)}</strong></div></div>
  </div>

  <table>
    <colgroup>
      <col class="date"><col class="acc"><col class="cat"><col class="note"><col class="amt">
    </colgroup>
    <thead>
      <tr>
        <th>Date</th>
        <th>Account</th>
        <th>Category</th>
        <th>Note</th>
        <th class="right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td colspan="5" class="muted">No transactions</td></tr>`}
    </tbody>
  </table>

  <script>window.print()</script>
</body>
</html>`;

        const w = window.open("", "_blank", "width=900,height=1100");
        if (!w) return alert("Popup blocked.");
        w.document.open(); w.document.write(html); w.document.close(); w.focus();
    }


    function escapeHtml(s = "") {
        return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }

    function fmtTableDate(val) {
        if (!val) return "—";

        // If value already has time ("YYYY-MM-DDTHH:MM" or "...:SS")
        if (/\dT\d/.test(val)) {
            const d = new Date(val);
            if (!isNaN(d)) {
                const datePart = d.toLocaleDateString("en-US", {
                    month: "short", day: "2-digit", year: "numeric",
                });
                const timePart = d.toLocaleTimeString("en-US", {
                    hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit",
                });
                return `${datePart} ${timePart}`;
            }
        }

        // Plain date "YYYY-MM-DD" → display local midnight
        const [y, m, dd] = String(val).split("-").map(Number);
        if (!y || !m || !dd) return val;
        const d = new Date(y, m - 1, dd, 0, 0, 0);
        const datePart = d.toLocaleDateString("en-US", {
            month: "short", day: "2-digit", year: "numeric",
        });
        const timePart = d.toLocaleTimeString("en-US", {
            hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit",
        });
        return `${datePart} ${timePart}`;
    }


    /* =============================== UI =============================== */
    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div>
                    <Styled.Title>Personal Finance Dashboard</Styled.Title>
                    <Styled.Subtitle className="muted">
                        Monthly budgets, transactions & quick stats • autosave • ₹ / $
                    </Styled.Subtitle>
                </div>
                <Styled.Actions>
                    <Styled.FileLabel>
                        Import
                        <input type="file" accept=".json,application/json" onChange={handleImport} />
                    </Styled.FileLabel>
                    <Styled.Button onClick={handleExport} $variant="ghost">Export</Styled.Button>
                    <Styled.Button onClick={handlePrint} $variant="ghost">Print</Styled.Button>
                    <Styled.Button onClick={handleReset} $variant="danger">Reset</Styled.Button>
                </Styled.Actions>
            </Styled.Header>

            {/* Toolbar */}
            {/* Toolbar (top): ONLY currency + month now */}
            <Styled.Toolbar>
                <Styled.Select
                    value={settings.currency}
                    onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value }))}
                    title="Currency"
                >
                    <option value="INR">₹ INR</option>
                    <option value="USD">$ USD</option>
                </Styled.Select>

                <Styled.MonthInput
                    type="month"
                    value={settings.month}
                    onChange={(e) => {
                        const m = e.target.value || yyyyMM(new Date());
                        setSettings((s) => ({ ...s, month: m }));
                        setDraft((d) => ({ ...d, date: todayInMonth(m) }));
                    }}
                    title="Month"
                />
            </Styled.Toolbar>


            {/* Stats */}
            <Styled.Stats>
                <Styled.StatCard>
                    <div className="muted">Income</div>
                    <div className="num">{fmt(settings.currency, stats.income)}</div>
                </Styled.StatCard>
                <Styled.StatCard>
                    <div className="muted">Expense</div>
                    <div className="num">{fmt(settings.currency, stats.expense)}</div>
                </Styled.StatCard>
                <Styled.StatCard>
                    <div className="muted">Net</div>
                    <div className="num">{fmt(settings.currency, stats.net)}</div>
                </Styled.StatCard>
            </Styled.Stats>

            <Styled.Grid>
                {/* Budgets */}
                <Styled.Card>
                    <Styled.CardHead>
                        <Styled.CardTitle>Budgets</Styled.CardTitle>
                        <Styled.Button $variant="ghost" onClick={addBudget}>+ Add</Styled.Button>
                    </Styled.CardHead>

                    <Styled.BudgetList>
                        {budgets.length === 0 && <Styled.Empty>No categories yet.</Styled.Empty>}
                        {budgets.map((b) => {
                            const used = budgetUse[b.id] || 0;
                            const pct = b.budget > 0 ? Math.min(100, Math.round((used / b.budget) * 100)) : 0;
                            const over = b.budget > 0 && used > b.budget;
                            return (
                                <Styled.BudgetItem key={b.id} $over={over}>
                                    <div className="top">
                                        <input
                                            className="name"
                                            value={b.name}
                                            onChange={(e) => updateBudget(b.id, { name: e.target.value })}
                                        />
                                        <div className="amount">
                                            <span className="sym">{sym(settings.currency)}</span>
                                            <input
                                                className="num"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={b.budget}
                                                onChange={(e) => updateBudget(b.id, { budget: parseAmount(e.target.value) })}
                                            />
                                        </div>
                                        <Styled.IconBtn title="Delete" onClick={() => deleteBudget(b.id)}>✕</Styled.IconBtn>
                                    </div>
                                    <Styled.Progress>
                                        <div className="bar" style={{ width: `${pct}%` }} />
                                    </Styled.Progress>
                                    <Styled.BudgetMeta>
                                        <span className="muted">Used</span>
                                        <span>{fmt(settings.currency, used)}</span>
                                        <span className="muted">/ Budget</span>
                                        <span>{fmt(settings.currency, b.budget)}</span>
                                        <span className="muted">•</span>
                                        <span>{pct}%</span>
                                    </Styled.BudgetMeta>
                                </Styled.BudgetItem>
                            );
                        })}
                    </Styled.BudgetList>
                </Styled.Card>

                {/* Accounts */}
                <Styled.Card>
                    <Styled.CardHead>
                        <Styled.CardTitle>Accounts</Styled.CardTitle>
                        <Styled.Button $variant="ghost" onClick={addAccount}>+ Add</Styled.Button>
                    </Styled.CardHead>

                    <Styled.AccountList>
                        {accounts.map((a) => (
                            <Styled.AccountItem key={a.id}>
                                <div>
                                    <strong>{a.name}</strong>
                                    <div className="muted small">{a.type}</div>
                                </div>
                                <div className="right">
                                    <div className="muted">Starting</div>
                                    <div>{fmt(settings.currency, a.initial)}</div>
                                </div>
                                <Styled.IconBtn title="Delete account" onClick={() => deleteAccount(a.id)}>✕</Styled.IconBtn>
                            </Styled.AccountItem>
                        ))}
                    </Styled.AccountList>
                </Styled.Card>
            </Styled.Grid>

            {/* Add transaction */}
            <Styled.Card style={{ marginBottom: 15 }}>
                <Styled.CardHead>
                    <Styled.CardTitle>Add Transaction</Styled.CardTitle>
                </Styled.CardHead>

                <Styled.TxnForm
                    onSubmit={(e) => {
                        e.preventDefault();
                        addTxn();
                    }}
                >
                    <label>
                        <span>Date</span>
                        <input
                            type="date"
                            value={draft.date}
                            onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                        />
                    </label>
                    <label>
                        <span>Type</span>
                        <select
                            value={draft.type}
                            onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
                        >
                            <option value="expense">Expense (−)</option>
                            <option value="income">Income (+)</option>
                        </select>
                    </label>
                    <label>
                        <span>Account</span>
                        <select
                            value={draft.accountId}
                            onChange={(e) => setDraft((d) => ({ ...d, accountId: e.target.value }))}
                        >
                            {accounts.map((a) => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <span>Category</span>
                        <select
                            value={draft.categoryId}
                            onChange={(e) => setDraft((d) => ({ ...d, categoryId: e.target.value }))}
                        >
                            {budgets.map((b) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <span>Amount</span>
                        <div className="amountInput">
                            <span className="sym">{sym(settings.currency)}</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={draft.amount}
                                onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))}
                                placeholder="0.00"
                            />
                        </div>
                    </label>
                    <label className="full">
                        <span>Note</span>
                        <input
                            value={draft.note}
                            onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
                            placeholder="Optional"
                        />
                    </label>
                    <div className="actions">
                        <Styled.Button type="submit">Add</Styled.Button>
                    </div>
                </Styled.TxnForm>
            </Styled.Card>

            {/* Transactions table */}
            {/* Filters just above the Transactions table */}
            <Styled.Toolbar>
                <Styled.Search
                    placeholder="Search note / account / category…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />

                <Styled.Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} title="Type">
                    <option value="all">All types</option>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </Styled.Select>

                <Styled.Select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} title="Category">
                    <option value="all">All categories</option>
                    {budgets.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </Styled.Select>

                <Styled.Select value={accFilter} onChange={(e) => setAccFilter(e.target.value)} title="Account">
                    <option value="all">All accounts</option>
                    {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </Styled.Select>

                <Styled.Select value={sort} onChange={(e) => setSort(e.target.value)} title="Sort">
                    <option value="dateDesc">Date ↓</option>
                    <option value="dateAsc">Date ↑</option>
                    <option value="amountDesc">Amount ↓</option>
                    <option value="amountAsc">Amount ↑</option>
                </Styled.Select>
            </Styled.Toolbar>

            <Styled.Card>
                <Styled.CardHead>
                    <Styled.CardTitle>Transactions - {settings.month}</Styled.CardTitle>
                </Styled.CardHead>

                <Styled.Table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Account</th>
                            <th>Category</th>
                            <th>Note</th>
                            <th className="num">Amount</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7}><Styled.Empty>No matching transactions.</Styled.Empty></td>
                            </tr>
                        )}
                        {filtered.map((t) => (
                            <tr key={t.id}>
                                <td>{fmtTableDate(t.date)}</td>
                                <td>
                                    <Styled.Pill data-type={t.type}>{t.type}</Styled.Pill>
                                </td>
                                <td>{accountsMap.get(t.accountId)?.name || t.accountId}</td>
                                <td>{categoriesMap.get(t.categoryId)?.name || t.categoryId}</td>
                                <td className="muted">{t.note || "—"}</td>
                                <td className="num">
                                    {t.type === "expense" ? "-" : "+"}
                                    {fmt(settings.currency, t.amount)}
                                </td>
                                <td className="num">
                                    <Styled.IconBtn title="Delete" onClick={() => deleteTxn(t.id)}>✕</Styled.IconBtn>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Styled.Table>
            </Styled.Card>
        </Styled.Wrapper>
    );
}

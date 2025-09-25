import { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

// ---- Constants -------------------------------------------------------------
const STORAGE_KEYS = {
    JOBS: "sjc_jobs",
    SHOP: "sjc_shop",
    COUNTER_PREFIX: "sjc_counter_", // sjc_counter_YYYYMMDD -> number
};

const STATUSES = [
    { key: "new", label: "New" },
    { key: "inprogress", label: "In-Progress" },
    { key: "ready", label: "Ready" },
    { key: "picked", label: "Picked-Up" },
];

const emptyJob = {
    id: "",
    createdAt: "",
    status: "new",
    customerName: "",
    phone: "",
    itemType: "",
    brand: "",
    model: "",
    serial: "",
    issue: "",
    accessories: "",
    estimate: "",
    advance: "",
    tax: "",
    total: 0,
    balance: 0,
    promisedAt: "",
    notes: "",
};

const defaultShop = {
    name: "",
    phone: "",
    address: "",
};

// ---- Helpers ---------------------------------------------------------------
const yyyymmdd = (d = new Date()) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
        d.getDate()
    ).padStart(2, "0")}`;

const fmtINR = (n) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(Number.isFinite(+n) ? +n : 0);

function calcTotals(estimate, advance, tax) {
    const est = +estimate || 0;
    const adv = +advance || 0;
    const t = +tax || 0;
    const total = est + (est * t) / 100;
    const balance = total - adv;
    return { total, balance };
}

function loadLocal(key, fallback) {
    try {
        const v = JSON.parse(localStorage.getItem(key) || "null");
        return v ?? fallback;
    } catch {
        return fallback;
    }
}

function saveLocal(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// ---- Component -------------------------------------------------------------
export default function ServiceJobCard() {
    const [jobs, setJobs] = useState(() => loadLocal(STORAGE_KEYS.JOBS, []));
    const [shop, setShop] = useState(() =>
        loadLocal(STORAGE_KEYS.SHOP, defaultShop)
    );
    const [query, setQuery] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showShop, setShowShop] = useState(false);
    const [active, setActive] = useState(null); // selected job for detail modal
    const printRef = useRef(null);

    useEffect(() => saveLocal(STORAGE_KEYS.JOBS, jobs), [jobs]);
    useEffect(() => saveLocal(STORAGE_KEYS.SHOP, shop), [shop]);

    const filtered = useMemo(() => {
        if (!query.trim()) return jobs;
        const q = query.toLowerCase();
        return jobs.filter((j) =>
            [
                j.id,
                j.customerName,
                j.phone,
                j.itemType,
                j.brand,
                j.model,
                j.serial,
                j.issue,
                j.notes,
            ]
                .join(" ")
                .toLowerCase()
                .includes(q)
        );
    }, [jobs, query]);

    function nextId() {
        const d = yyyymmdd();
        const key = STORAGE_KEYS.COUNTER_PREFIX + d;
        const curr = +(localStorage.getItem(key) || "0");
        const next = curr + 1;
        localStorage.setItem(key, String(next));
        return `${d}-${String(next).padStart(3, "0")}`;
    }

    function createJob(data) {
        const id = nextId();
        const createdAt = new Date().toISOString();
        const { total, balance } = calcTotals(
            data.estimate,
            data.advance,
            data.tax
        );
        const job = { ...emptyJob, ...data, id, createdAt, total, balance };
        setJobs((arr) => [job, ...arr]);
        setShowNew(false);
        setActive(job);
    }

    function updateJob(patch) {
        setJobs((arr) =>
            arr.map((j) => (j.id === patch.id ? { ...j, ...patch } : j))
        );
    }

    function removeJob(id) {
        if (!confirm("Delete this job permanently?")) return;
        setJobs((arr) => arr.filter((j) => j.id !== id));
        setActive(null);
    }

    function moveJob(id, status) {
        updateJob({ id, status });
    }

    function handleImport(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result);
                if (!Array.isArray(data)) throw new Error("Invalid file");
                if (!confirm("Replace existing jobs with imported data?"))
                    return;
                setJobs(data);
            } catch {
                alert("Invalid JSON file.");
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    }

    function handleExport() {
        const blob = new Blob([JSON.stringify(jobs, null, 2)], {
            type: "application/json",
        });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `service-jobs-${yyyymmdd()}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    function resetAll() {
        if (!confirm("This will clear ALL jobs and shop settings. Continue?"))
            return;
        setJobs([]);
        setShop(defaultShop);
    }

    function openPrint() {
        const node = printRef.current;
        if (!node) {
            alert("Nothing to print.");
            return;
        }

        // Grab the ticket markup
        const ticket = node.innerHTML;

        // Minimal, self-contained print page
        const css = `
    @page { size: A5; margin: 10mm; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 0; padding: 12px; color: #000; }
    h2 { margin: 0 0 6px; font-size: 18px; }
    .muted { color: #444; font-size: 12px; }
    .row { display: flex; justify-content: space-between; gap: 12px; }
    hr { border: 0; border-top: 1px solid #000; margin: 8px 0; }
    .total, .balance { font-weight: 700; }
    .balance { margin-top: 4px; }
  `;

        const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Job #${active?.id || ""}</title>
      <style>${css}</style>
    </head>
    <body>${ticket}</body>
  </html>`;

        const w = window.open("", "_blank", "width=720,height=900");
        if (!w) {
            alert("Popup blocked. Please allow popups to print.");
            return;
        }
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.focus();
        w.print();
        w.close();
    }


    return (
        <Styled.Wrapper>
            <Styled.PrintStyles />

            <Styled.Header>
                <div>
                    <Styled.Title>Service Job Card</Styled.Title>
                    <Styled.Subtitle>Offline • LocalStorage</Styled.Subtitle>
                </div>

                <Styled.Actions>
                    <Styled.Button onClick={() => setShowNew(true)}>
                        New Job
                    </Styled.Button>
                    <Styled.Button
                        onClick={() => setShowShop(true)}
                        $variant="ghost"
                    >
                        Settings
                    </Styled.Button>

                    <Styled.FileLabel>
                        Import
                        <input
                            type="file"
                            accept="application/json"
                            onChange={handleImport}
                        />
                    </Styled.FileLabel>
                    <Styled.Button onClick={handleExport} $variant="ghost">
                        Export
                    </Styled.Button>
                    <Styled.Button onClick={resetAll} $variant="danger">
                        Reset All
                    </Styled.Button>
                </Styled.Actions>
            </Styled.Header>

            <Styled.Toolbar>
                <Styled.Search
                    placeholder="Search by ID, name, model, issue..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </Styled.Toolbar>

            <Styled.Board>
                {STATUSES.map((col) => {
                    const list = filtered.filter((j) => j.status === col.key);
                    return (
                        <Styled.Column key={col.key}>
                            <Styled.ColumnHead>{col.label}</Styled.ColumnHead>
                            <Styled.ColBody>
                                {list.length === 0 && (
                                    <Styled.Empty>
                                        Nothing here yet.
                                    </Styled.Empty>
                                )}
                                {list.map((j) => (
                                    <Styled.Card
                                        key={j.id}
                                        onClick={() => setActive(j)}
                                    >
                                        <div className="row between">
                                            <strong>#{j.id}</strong>
                                            <span
                                                className={`badge ${j.status}`}
                                            >
                                                {col.label}
                                            </span>
                                        </div>
                                        <div className="muted">
                                            {j.customerName} • {j.phone || "—"}
                                        </div>
                                        <div className="muted">
                                            {j.itemType || "Item"}{" "}
                                            {j.brand ? `• ${j.brand}` : ""}{" "}
                                            {j.model ? `• ${j.model}` : ""}
                                        </div>
                                        <div className="row between">
                                            <span>
                                                Total: {fmtINR(j.total)}
                                            </span>
                                            <span>
                                                Balance: {fmtINR(j.balance)}
                                            </span>
                                        </div>
                                    </Styled.Card>
                                ))}
                            </Styled.ColBody>
                        </Styled.Column>
                    );
                })}
            </Styled.Board>

            {/* New Job Modal */}
            {showNew && (
                <JobForm
                    onClose={() => setShowNew(false)}
                    onCreate={createJob}
                />
            )}

            {/* Shop Settings Modal */}
            {showShop && (
                <ShopSettings
                    value={shop}
                    onClose={() => setShowShop(false)}
                    onSave={(v) => setShop(v)}
                />
            )}

            {/* Job Detail Modal */}
            {active && (
                <JobDetail
                    job={active}
                    onClose={() => setActive(null)}
                    onUpdate={(patch) => {
                        const { total, balance } = calcTotals(
                            patch.estimate ?? active.estimate,
                            patch.advance ?? active.advance,
                            patch.tax ?? active.tax
                        );
                        const next = { ...active, ...patch, total, balance };
                        setActive(next);
                        updateJob(next);
                    }}
                    onDelete={removeJob}
                    onMove={(s) => moveJob(active.id, s)}
                    onPrint={openPrint}
                    printRef={printRef}
                    shop={shop}
                />
            )}
        </Styled.Wrapper>
    );
}

// ---- New Job Form ----------------------------------------------------------
function JobForm({ onClose, onCreate }) {
    const [form, setForm] = useState({
        customerName: "",
        phone: "",
        itemType: "",
        brand: "",
        model: "",
        serial: "",
        issue: "",
        accessories: "",
        estimate: "",
        advance: "",
        tax: "",
        promisedAt: "",
        notes: "",
    });

    const totals = useMemo(
        () => calcTotals(form.estimate, form.advance, form.tax),
        [form.estimate, form.advance, form.tax]
    );

    function change(e) {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    }

    function submit(e) {
        e.preventDefault();
        if (!form.customerName.trim()) {
            alert("Customer name is required.");
            return;
        }
        onCreate(form);
    }

    return (
        <Styled.Modal
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <Styled.Dialog onMouseDown={(e) => e.stopPropagation()}>
                <Styled.DialogHead>
                    <h3>New Job</h3>
                    <button onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </Styled.DialogHead>

                <Styled.Form onSubmit={submit}>
                    <Styled.Grid>
                        <label>
                            <span>Customer Name</span>
                            <input
                                name="customerName"
                                value={form.customerName}
                                onChange={change}
                            />
                        </label>
                        <label>
                            <span>Phone</span>
                            <input
                                name="phone"
                                value={form.phone}
                                onChange={change}
                            />
                        </label>

                        <label>
                            <span>Item Type</span>
                            <input
                                name="itemType"
                                value={form.itemType}
                                onChange={change}
                            />
                        </label>
                        <label>
                            <span>Brand</span>
                            <input
                                name="brand"
                                value={form.brand}
                                onChange={change}
                            />
                        </label>
                        <label>
                            <span>Model</span>
                            <input
                                name="model"
                                value={form.model}
                                onChange={change}
                            />
                        </label>
                        <label>
                            <span>Serial No.</span>
                            <input
                                name="serial"
                                value={form.serial}
                                onChange={change}
                            />
                        </label>

                        <label className="full">
                            <span>Issue / Problem</span>
                            <input
                                name="issue"
                                value={form.issue}
                                onChange={change}
                            />
                        </label>
                        <label className="full">
                            <span>Accessories (if any)</span>
                            <input
                                name="accessories"
                                value={form.accessories}
                                onChange={change}
                            />
                        </label>

                        <label>
                            <span>Estimate (₹)</span>
                            <input
                                name="estimate"
                                type="number"
                                value={form.estimate}
                                onChange={change}
                            />
                        </label>
                        <label>
                            <span>Advance (₹)</span>
                            <input
                                name="advance"
                                type="number"
                                value={form.advance}
                                onChange={change}
                            />
                        </label>
                        <label>
                            <span>Tax %</span>
                            <input
                                name="tax"
                                type="number"
                                value={form.tax}
                                onChange={change}
                            />
                        </label>

                        <label>
                            <span>Total (₹)</span>
                            <input
                                value={fmtINR(
                                    calcTotals(
                                        form.estimate,
                                        form.advance,
                                        form.tax
                                    ).total
                                )}
                                readOnly
                            />
                        </label>
                        <label>
                            <span>Balance (₹)</span>
                            <input
                                value={fmtINR(
                                    calcTotals(
                                        form.estimate,
                                        form.advance,
                                        form.tax
                                    ).balance
                                )}
                                readOnly
                            />
                        </label>

                        <label>
                            <span>Promised Date/Time</span>
                            <input
                                name="promisedAt"
                                type="datetime-local"
                                value={form.promisedAt}
                                onChange={change}
                            />
                        </label>
                        <label className="full">
                            <span>Notes</span>
                            <input
                                name="notes"
                                value={form.notes}
                                onChange={change}
                            />
                        </label>
                    </Styled.Grid>

                    <Styled.DialogFoot>
                        <Styled.Button type="submit">
                            Create & Add
                        </Styled.Button>
                        <Styled.Button
                            type="button"
                            onClick={onClose}
                            $variant="ghost"
                        >
                            Close
                        </Styled.Button>
                    </Styled.DialogFoot>
                </Styled.Form>
            </Styled.Dialog>
        </Styled.Modal>
    );
}

// ---- Shop Settings ---------------------------------------------------------
function ShopSettings({ value, onSave, onClose }) {
    const [shop, setShop] = useState(value);

    function change(e) {
        const { name, value } = e.target;
        setShop((s) => ({ ...s, [name]: value }));
    }

    return (
        <Styled.Modal
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <Styled.Dialog onMouseDown={(e) => e.stopPropagation()}>
                <Styled.DialogHead>
                    <h3>Shop Settings</h3>
                    <button onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </Styled.DialogHead>

                <Styled.Form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSave(shop);
                        onClose();
                    }}
                >
                    <label>
                        <span>Shop Name</span>
                        <input
                            name="name"
                            value={shop.name}
                            onChange={change}
                        />
                    </label>
                    <label>
                        <span>Phone</span>
                        <input
                            name="phone"
                            value={shop.phone}
                            onChange={change}
                        />
                    </label>
                    <label className="full">
                        <span>Address</span>
                        <textarea
                            name="address"
                            rows={3}
                            value={shop.address}
                            onChange={change}
                        />
                    </label>

                    <Styled.DialogFoot>
                        <Styled.Button type="submit">
                            Save Settings
                        </Styled.Button>
                        <Styled.Button
                            type="button"
                            $variant="ghost"
                            onClick={() => setShop(defaultShop)}
                        >
                            Clear
                        </Styled.Button>
                    </Styled.DialogFoot>
                </Styled.Form>
            </Styled.Dialog>
        </Styled.Modal>
    );
}

// ---- Job Detail + Print ----------------------------------------------------
function JobDetail({
    job,
    onClose,
    onUpdate,
    onDelete,
    onMove,
    onPrint,
    printRef,
    shop,
}) {
    function change(e) {
        const { name, value } = e.target;
        onUpdate({ [name]: value, id: job.id });
    }

    return (
        <Styled.SideModal
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <Styled.SidePanel onMouseDown={(e) => e.stopPropagation()}>
                <Styled.DialogHead>
                    <h3>Job Detail</h3>
                    <button onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </Styled.DialogHead>

                <Styled.Detail>
                    <div className="meta">
                        <div>
                            <strong>ID:</strong> #{job.id}
                        </div>
                        <div>
                            <strong>Status:</strong>{" "}
                            {STATUSES.find((s) => s.key === job.status)?.label}
                        </div>
                        <div>
                            <strong>Created:</strong>{" "}
                            {new Date(job.createdAt).toLocaleString()}
                        </div>
                    </div>

                    <Styled.Grid>
                        <label>
                            <span>Name</span>
                            <input
                                name="customerName"
                                value={job.customerName}
                                onChange={change}
                            />
                        </label>
                        <label>
                            <span>Phone</span>
                            <input
                                name="phone"
                                value={job.phone}
                                onChange={change}
                            />
                        </label>
                        <label>
                            <span>Type</span>
                            <input
                                name="itemType"
                                value={job.itemType}
                                onChange={change}
                            />
                        </label>
                        <label>
                            <span>Brand</span>
                            <input
                                name="brand"
                                value={job.brand}
                                onChange={change}
                            />
                        </label>
                        <label>
                            <span>Model</span>
                            <input
                                name="model"
                                value={job.model}
                                onChange={change}
                            />
                        </label>
                        <label>
                            <span>Serial</span>
                            <input
                                name="serial"
                                value={job.serial}
                                onChange={change}
                            />
                        </label>
                        <label className="full">
                            <span>Issue</span>
                            <input
                                name="issue"
                                value={job.issue}
                                onChange={change}
                            />
                        </label>
                        <label className="full">
                            <span>Accessories</span>
                            <input
                                name="accessories"
                                value={job.accessories}
                                onChange={change}
                            />
                        </label>

                        <label>
                            <span>Estimate (₹)</span>
                            <input
                                name="estimate"
                                type="number"
                                value={job.estimate}
                                onChange={change}
                            />
                        </label>
                        <label>
                            <span>Advance (₹)</span>
                            <input
                                name="advance"
                                type="number"
                                value={job.advance}
                                onChange={change}
                            />
                        </label>
                        <label>
                            <span>Tax %</span>
                            <input
                                name="tax"
                                type="number"
                                value={job.tax}
                                onChange={change}
                            />
                        </label>

                        <label>
                            <span>Total (₹)</span>
                            <input value={fmtINR(job.total)} readOnly />
                        </label>
                        <label>
                            <span>Balance (₹)</span>
                            <input value={fmtINR(job.balance)} readOnly />
                        </label>

                        <label>
                            <span>Promised</span>
                            <input
                                name="promisedAt"
                                type="datetime-local"
                                value={job.promisedAt || ""}
                                onChange={change}
                            />
                        </label>
                        <label className="full">
                            <span>Notes</span>
                            <input
                                name="notes"
                                value={job.notes}
                                onChange={change}
                            />
                        </label>
                    </Styled.Grid>

                    <Styled.MoveRow>
                        <span>Move:</span>
                        {STATUSES.map((s) => (
                            <Styled.Button
                                key={s.key}
                                onClick={() => onMove(s.key)}
                                $active={job.status === s.key}
                                $compact
                            >
                                {s.label}
                            </Styled.Button>
                        ))}
                    </Styled.MoveRow>

                    <Styled.DialogFoot>
                        <Styled.Button onClick={onPrint}>
                            Print Ticket
                        </Styled.Button>
                        <Styled.Button
                            $variant="danger"
                            onClick={() => onDelete(job.id)}
                        >
                            Delete
                        </Styled.Button>
                        <Styled.Button $variant="ghost" onClick={onClose}>
                            Close
                        </Styled.Button>
                    </Styled.DialogFoot>
                </Styled.Detail>

                {/* Hidden print area that becomes visible in print */}
                <Styled.PrintContainer id="printArea" ref={printRef}>
                    <h2>{shop.name || "Your Shop"}</h2>
                    <div className="muted">{shop.address}</div>
                    <div className="muted">{shop.phone}</div>
                    <hr />
                    <div className="row between">
                        <div>
                            <strong>Job ID:</strong> #{job.id}
                        </div>
                        <div>
                            <strong>Date:</strong>{" "}
                            {new Date(job.createdAt).toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <strong>Customer:</strong> {job.customerName} (
                        {job.phone || "—"})
                    </div>
                    <div>
                        <strong>Item:</strong> {job.itemType}{" "}
                        {job.brand && `• ${job.brand}`}{" "}
                        {job.model && `• ${job.model}`}
                    </div>
                    {job.serial && (
                        <div>
                            <strong>Serial:</strong> {job.serial}
                        </div>
                    )}
                    {job.issue && (
                        <div>
                            <strong>Issue:</strong> {job.issue}
                        </div>
                    )}
                    {job.accessories && (
                        <div>
                            <strong>Accessories:</strong> {job.accessories}
                        </div>
                    )}
                    <hr />
                    <div className="row between">
                        <div>Estimate</div>
                        <div>{fmtINR(job.estimate || 0)}</div>
                    </div>
                    <div className="row between">
                        <div>Tax (%)</div>
                        <div>{job.tax || 0}%</div>
                    </div>
                    <div className="row between">
                        <div>Advance</div>
                        <div>{fmtINR(job.advance || 0)}</div>
                    </div>
                    <div className="row between total">
                        <div>Total</div>
                        <div>{fmtINR(job.total)}</div>
                    </div>
                    <div className="row between balance">
                        <div>Balance</div>
                        <div>{fmtINR(job.balance)}</div>
                    </div>
                    {job.promisedAt && (
                        <div className="muted">
                            Promised:{" "}
                            {new Date(job.promisedAt).toLocaleString()}
                        </div>
                    )}
                    {job.notes && (
                        <div>
                            <strong>Notes:</strong> {job.notes}
                        </div>
                    )}
                    <Styled.FooterNote>
                        Thank you for your business.
                    </Styled.FooterNote>
                </Styled.PrintContainer>
            </Styled.SidePanel>
        </Styled.SideModal>
    );
}

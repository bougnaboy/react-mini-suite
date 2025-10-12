import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/* ===================== config ===================== */
const STORAGE_KEY = "appointmentManagement_records_v1";
const STAFFS = ["Unassigned", "Ashish", "Neha", "Rahul", "Priya", "Vikram"];
const SERVICES = ["Consultation", "Demo", "Support", "Delivery", "Follow-up"];
const STATUSES = ["Scheduled", "Confirmed", "Completed", "Cancelled"];

const initialForm = {
    id: null,
    date: "",
    start: "",
    end: "",
    clientName: "",
    phone: "",
    email: "",
    staff: "Unassigned",
    service: "Consultation",
    status: "Scheduled",
    notes: "",
};

const limits = { nameMin: 3, notesMax: 300 };

/* ===================== helpers ===================== */
const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
const isEmail = (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isINPhone = (v) => !v || /^[6-9]\d{9}$/.test(v);
const toMins = (hhmm) => {
    const [h, m] = String(hhmm || "00:00").split(":").map((x) => +x || 0);
    return h * 60 + m;
};
const fmtTime = (hhmm) => hhmm || "--:--";
const idGen = () => `apt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

const overlap = (a, b) => {
    if (a.date !== b.date) return false;
    if (a.staff !== b.staff) return false;
    const aS = toMins(a.start), aE = toMins(a.end);
    const bS = toMins(b.start), bE = toMins(b.end);
    return aS < bE && bS < aE;
};

/* ===================== Confirm Modal ===================== */
function ConfirmModal({ open, title = "Confirm", message, confirmText = "Yes", cancelText = "No", onConfirm, onClose }) {
    if (!open) return null;
    return (
        <Styled.Modal role="dialog" aria-modal="true" aria-label={title}>
            <Styled.ModalCard>
                <h3>{title}</h3>
                {message && <p className="muted">{message}</p>}
                <Styled.ModalActions>
                    <button onClick={onClose} className="ghost">{cancelText}</button>
                    <button onClick={onConfirm}>{confirmText}</button>
                </Styled.ModalActions>
            </Styled.ModalCard>
        </Styled.Modal>
    );
}

/* ===================== Component ===================== */
const AppointmentManagement = () => {
    const formRef = useRef(null);

    const [records, setRecords] = useState(() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
    });

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [editId, setEditId] = useState(null);

    // filters
    const [fText, setFText] = useState("");
    const [fStaff, setFStaff] = useState("");
    const [fStatus, setFStatus] = useState("");
    const [fFrom, setFFrom] = useState("");
    const [fTo, setFTo] = useState("");

    // confirm modal
    const [confirm, setConfirm] = useState({ open: false, payload: null, mode: "" });

    // persist
    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch { }
    }, [records]);

    /* ---------------- validation ---------------- */
    function validateField(name, value, ctx) {
        const v = typeof value === "string" ? clean(value) : value;
        switch (name) {
            case "clientName":
                if (!v) return "Client name is required.";
                if (v.length < limits.nameMin) return `Name must be at least ${limits.nameMin} characters.`;
                return "";
            case "date":
                if (!v) return "Date is required.";
                return "";
            case "start":
                if (!v) return "Start time is required.";
                if (ctx.end && toMins(v) >= toMins(ctx.end)) return "Start must be before end.";
                return "";
            case "end":
                if (!v) return "End time is required.";
                if (ctx.start && toMins(ctx.start) >= toMins(v)) return "End must be after start.";
                return "";
            case "phone":
                if (!isINPhone(v)) return "Phone must be 10-digit Indian number.";
                return "";
            case "email":
                if (!isEmail(v)) return "Enter a valid email.";
                return "";
            case "staff":
                if (!v) return "Pick a staff.";
                return "";
            case "service":
                if (!v) return "Pick a service.";
                return "";
            case "status":
                if (!v) return "Pick a status.";
                return "";
            case "notes":
                if (v.length > limits.notesMax) return `Notes must be under ${limits.notesMax} chars.`;
                return "";
            default:
                return "";
        }
    }

    function validateAll(ctx) {
        const e = {};
        Object.keys(ctx).forEach((k) => {
            if (k === "id") return;
            const msg = validateField(k, ctx[k], ctx);
            if (msg) e[k] = msg;
        });
        if (!e.date && !e.start && !e.end && !e.staff) {
            const clash = records.find(r => r.id !== ctx.id && overlap(r, ctx));
            if (clash) {
                e.start = e.start || "Overlaps with another appointment.";
                e.end = e.end || "Overlaps with another appointment.";
            }
        }
        return e;
    }

    const setField = (name, value) => {
        setForm((f) => {
            const next = { ...f, [name]: value };
            const msg = validateField(name, value, next);
            setErrors((prev) => ({ ...prev, [name]: msg }));
            return next;
        });
    };

    const onBlur = (e) => {
        const { name } = e.target;
        setTouched((t) => ({ ...t, [name]: true }));
        setErrors((prev) => ({ ...prev, [name]: validateField(name, form[name], form) }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const ctx = { ...form, id: editId || form.id || idGen() };
        const all = validateAll(ctx);
        setErrors(all);

        const bad = Object.values(all).some(Boolean);
        if (bad) {
            requestAnimationFrame(() => {
                const firstKey = Object.keys(all).find((k) => all[k]);
                if (!firstKey) return;
                const el = formRef.current?.querySelector(`[name="${firstKey}"]`);
                if (!el) return;
                try {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    setTimeout(() => el.focus({ preventScroll: true }), 120);
                } catch { el.focus(); }
            });
            return;
        }

        if (editId) setRecords((recs) => recs.map(r => (r.id === editId ? { ...ctx } : r)));
        else setRecords((recs) => [{ ...ctx }, ...recs].sort(sorter));

        resetForm();
    };

    const resetForm = () => {
        setForm(initialForm);
        setErrors({});
        setTouched({});
        setEditId(null);
    };

    const onEdit = (id) => {
        const r = records.find(x => x.id === id);
        if (!r) return;
        setForm({ ...r });
        setEditId(id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const askDelete = (id) => setConfirm({ open: true, mode: "delete", payload: id });
    const askClearAll = () => setConfirm({ open: true, mode: "clear", payload: null });

    const doConfirm = () => {
        if (confirm.mode === "delete" && confirm.payload) {
            setRecords(recs => recs.filter(r => r.id !== confirm.payload));
        } else if (confirm.mode === "clear") {
            setRecords([]);
        }
        setConfirm({ open: false, payload: null, mode: "" });
    };
    const closeConfirm = () => setConfirm({ open: false, payload: null, mode: "" });

    /* ---------------- list / filters ---------------- */
    const sorter = (a, b) => (a.date === b.date ? toMins(a.start) - toMins(b.start) : a.date < b.date ? -1 : 1);

    const filtered = useMemo(() => {
        let arr = [...records];
        if (fFrom) arr = arr.filter(r => r.date >= fFrom);
        if (fTo) arr = arr.filter(r => r.date <= fTo);
        if (fStaff) arr = arr.filter(r => r.staff === fStaff);
        if (fStatus) arr = arr.filter(r => r.status === fStatus);
        const q = clean(fText).toLowerCase();
        if (q) {
            arr = arr.filter(r =>
                [r.clientName, r.phone, r.email, r.service, r.staff, r.notes]
                    .map(x => String(x || "").toLowerCase())
                    .some(s => s.includes(q))
            );
        }
        arr.sort(sorter);
        return arr;
    }, [records, fFrom, fTo, fStaff, fStatus, fText]);

    const groups = useMemo(() => {
        const g = {};
        for (const r of filtered) (g[r.date] ||= []).push(r);
        Object.keys(g).forEach(k => g[k].sort(sorter));
        return g;
    }, [filtered]);

    const uniqueDates = Object.keys(groups).sort();

    const handlePrint = () => window.print();

    const handleExport = () => {
        const data = JSON.stringify(records, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "appointments.json"; a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            if (!Array.isArray(parsed)) throw new Error("Invalid file");
            const safe = parsed.filter(x => x && x.id && x.date && x.start && x.end && x.clientName);
            setRecords(safe.sort(sorter));
            e.target.value = "";
        } catch {
            alert("Import failed. Ensure valid JSON exported from this app.");
            e.target.value = "";
        }
    };

    const fmtDate = (iso) => {
        if (!iso) return "";
        // iso = "YYYY-MM-DD"
        const [y, m, d] = iso.split("-").map(Number);
        const dt = new Date(y, (m || 1) - 1, d || 1);
        return dt.toLocaleDateString(undefined, {
            month: "short",   // "Sep"
            day: "numeric",   // 20 (no leading zero)
            year: "numeric",  // 2025
        });
    };


    const error = (k) => touched[k] && errors[k];

    return (
        <Styled.Wrapper>
            {/* print-only global CSS */}
            <Styled.PrintOnly />

            <Styled.Header>
                <div>
                    <h1>Appointment Management System</h1>
                    <p>Schedule, manage, and view appointments. All data stays in your browser.</p>
                </div>
                <Styled.Badges>
                    <span className="badge">LocalStorage</span>
                    <span className="badge">Validation</span>
                    <span className="badge">Print</span>
                </Styled.Badges>
            </Styled.Header>

            <Styled.Layout>
                {/* LEFT: FORM */}
                <Styled.Card as="form" ref={formRef} onSubmit={onSubmit} noValidate>
                    <Styled.SectionTitle>{editId ? "Edit Appointment" : "New Appointment"}</Styled.SectionTitle>

                    <Styled.Grid>
                        <Styled.Field invalid={!!error("clientName")}>
                            <label htmlFor="clientName">Client Name <em>*</em></label>
                            <input
                                id="clientName" name="clientName" type="text"
                                value={form.clientName} onChange={(e) => setField("clientName", e.target.value)} onBlur={onBlur}
                                placeholder="e.g., John Doe" aria-invalid={!!error("clientName")}
                            />
                            <Styled.Error role="alert">{error("clientName") && errors.clientName}</Styled.Error>
                        </Styled.Field>

                        <Styled.Field invalid={!!error("date")}>
                            <label htmlFor="date">Date <em>*</em></label>
                            <input
                                id="date" name="date" type="date"
                                value={form.date} onChange={(e) => setField("date", e.target.value)} onBlur={onBlur}
                                aria-invalid={!!error("date")}
                            />
                            <Styled.Error role="alert">{error("date") && errors.date}</Styled.Error>
                        </Styled.Field>

                        <Styled.Field invalid={!!error("start")}>
                            <label htmlFor="start">Start Time <em>*</em></label>
                            <input
                                id="start" name="start" type="time"
                                value={form.start} onChange={(e) => setField("start", e.target.value)} onBlur={onBlur}
                                aria-invalid={!!error("start")}
                            />
                            <Styled.Error role="alert">{error("start") && errors.start}</Styled.Error>
                        </Styled.Field>

                        <Styled.Field invalid={!!error("end")}>
                            <label htmlFor="end">End Time <em>*</em></label>
                            <input
                                id="end" name="end" type="time"
                                value={form.end} onChange={(e) => setField("end", e.target.value)} onBlur={onBlur}
                                aria-invalid={!!error("end")}
                            />
                            <Styled.Error role="alert">{error("end") && errors.end}</Styled.Error>
                        </Styled.Field>

                        <Styled.Field invalid={!!error("phone")}>
                            <label htmlFor="phone">Phone</label>
                            <input
                                id="phone" name="phone" type="tel" inputMode="numeric" placeholder="9876543210"
                                value={form.phone} onChange={(e) => setField("phone", e.target.value)} onBlur={onBlur}
                                aria-invalid={!!error("phone")}
                            />
                            <Styled.Error role="alert">{error("phone") && errors.phone}</Styled.Error>
                        </Styled.Field>

                        <Styled.Field invalid={!!error("email")}>
                            <label htmlFor="email">Email</label>
                            <input
                                id="email" name="email" type="email" placeholder="user@example.com"
                                value={form.email} onChange={(e) => setField("email", e.target.value)} onBlur={onBlur}
                                aria-invalid={!!error("email")}
                            />
                            <Styled.Error role="alert">{error("email") && errors.email}</Styled.Error>
                        </Styled.Field>

                        <Styled.Field invalid={!!error("staff")}>
                            <label htmlFor="staff">Staff <em>*</em></label>
                            <select
                                id="staff" name="staff"
                                value={form.staff} onChange={(e) => setField("staff", e.target.value)} onBlur={onBlur}
                                aria-invalid={!!error("staff")}
                            >
                                {STAFFS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <Styled.Error role="alert">{error("staff") && errors.staff}</Styled.Error>
                        </Styled.Field>

                        <Styled.Field invalid={!!error("service")}>
                            <label htmlFor="service">Service <em>*</em></label>
                            <select
                                id="service" name="service"
                                value={form.service} onChange={(e) => setField("service", e.target.value)} onBlur={onBlur}
                                aria-invalid={!!error("service")}
                            >
                                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <Styled.Error role="alert">{error("service") && errors.service}</Styled.Error>
                        </Styled.Field>

                        <Styled.Field invalid={!!error("status")}>
                            <label htmlFor="status">Status <em>*</em></label>
                            <select
                                id="status" name="status"
                                value={form.status} onChange={(e) => setField("status", e.target.value)} onBlur={onBlur}
                                aria-invalid={!!error("status")}
                            >
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <Styled.Error role="alert">{error("status") && errors.status}</Styled.Error>
                        </Styled.Field>

                        <Styled.Field className="span2" invalid={!!error("notes")}>
                            <label htmlFor="notes">Notes</label>
                            <textarea
                                id="notes" name="notes" rows={4}
                                value={form.notes} onChange={(e) => setField("notes", e.target.value)} onBlur={onBlur}
                                placeholder="Context, preferences, address, etc."
                                aria-invalid={!!error("notes")}
                            />
                            <Styled.RowHint>
                                <span className="muted">{form.notes.length}/{limits.notesMax}</span>
                            </Styled.RowHint>
                            <Styled.Error role="alert">{error("notes") && errors.notes}</Styled.Error>
                        </Styled.Field>
                    </Styled.Grid>

                    <Styled.Actions>
                        {editId ? (
                            <>
                                <button type="submit">Update</button>
                                <button type="button" className="ghost" onClick={resetForm}>Cancel Edit</button>
                            </>
                        ) : (
                            <>
                                <button type="submit">Add Appointment</button>
                                <button type="button" className="ghost" onClick={resetForm}>Reset</button>
                            </>
                        )}
                    </Styled.Actions>
                </Styled.Card>

                {/* RIGHT: LIST/FILTERS */}
                <Styled.Side>
                    <Styled.Card>
                        <Styled.SectionTitle>Filters</Styled.SectionTitle>
                        <Styled.Filters>
                            <input
                                type="text" placeholder="Search (name/phone/email/staff/service/notes)…"
                                value={fText} onChange={(e) => setFText(e.target.value)}
                            />
                            <select value={fStaff} onChange={(e) => setFStaff(e.target.value)}>
                                <option value="">All Staff</option>
                                {STAFFS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
                                <option value="">All Statuses</option>
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <input type="date" value={fFrom} onChange={(e) => setFFrom(e.target.value)} />
                            <input type="date" value={fTo} onChange={(e) => setFTo(e.target.value)} />
                        </Styled.Filters>

                        <Styled.ToolRow>
                            <div className="left">
                                <button
                                    type="button"
                                    className="ghost"
                                    onClick={() => { setFText(""); setFStaff(""); setFStatus(""); setFFrom(""); setFTo(""); }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                            <div className="right">
                                <label className="import">
                                    <input type="file" accept="application/json" onChange={handleImport} />
                                    Import
                                </label>
                                <button type="button" className="ghost" onClick={handleExport}>Export</button>
                                <button type="button" onClick={handlePrint}>Print</button>
                                <button type="button" className="danger" onClick={askClearAll}>Clear All</button>
                            </div>
                        </Styled.ToolRow>
                    </Styled.Card>

                    {/* ✅ This card prints; rest of page hides on print */}
                    <Styled.Card className="ams-print-target">
                        <Styled.SectionTitle>
                            Appointments <small>({filtered.length})</small>
                        </Styled.SectionTitle>

                        {filtered.length === 0 && (
                            <Styled.Empty>Nothing to show. Add a few appointments or change filters.</Styled.Empty>
                        )}

                        {uniqueDates.map((d) => (
                            <div key={d}>
                                <Styled.GroupHeader>{fmtDate(d)}</Styled.GroupHeader>

                                <Styled.Table role="table" aria-label={`Appointments for ${fmtDate(d)}`}>
                                    <div className="thead" role="rowgroup">
                                        <div className="tr" role="row">
                                            <div className="th" role="columnheader">Time</div>
                                            <div className="th" role="columnheader">Client</div>
                                            <div className="th" role="columnheader">Staff</div>
                                            <div className="th" role="columnheader">Service</div>
                                            <div className="th" role="columnheader">Status</div>
                                            <div className="th" role="columnheader">Notes</div>
                                            <div className="th actions" role="columnheader">Actions</div>
                                        </div>
                                    </div>
                                    <div className="tbody" role="rowgroup">
                                        {groups[d].map((r) => (
                                            <div className="tr" role="row" key={r.id}>
                                                <div className="td" role="cell">{fmtTime(r.start)}–{fmtTime(r.end)}</div>
                                                <div className="td" role="cell">
                                                    <div className="primary">{r.clientName}</div>
                                                    <div className="muted small">
                                                        {r.phone ? `📞 ${r.phone}` : ""} {r.email ? ` · ✉️ ${r.email}` : ""}
                                                    </div>
                                                </div>
                                                <div className="td" role="cell">{r.staff}</div>
                                                <div className="td" role="cell">{r.service}</div>
                                                <div className="td" role="cell">
                                                    <select
                                                        value={r.status}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setRecords(recs => recs.map(x => x.id === r.id ? { ...x, status: val } : x));
                                                        }}
                                                    >
                                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                                <div className="td" role="cell">
                                                    <span title={r.notes || ""} className="ellipsis">{r.notes || "-"}</span>
                                                </div>
                                                <div className="td actions" role="cell">
                                                    <button type="button" className="ghost" onClick={() => onEdit(r.id)}>Edit</button>
                                                    <button type="button" className="danger" onClick={() => askDelete(r.id)}>Delete</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Styled.Table>
                            </div>
                        ))}
                    </Styled.Card>
                </Styled.Side>
            </Styled.Layout>

            <ConfirmModal
                open={confirm.open}
                title={confirm.mode === "clear" ? "Clear All Appointments" : "Delete Appointment"}
                message={confirm.mode === "clear"
                    ? "This will permanently remove all appointments from your browser."
                    : "This will remove the selected appointment."}
                confirmText="Confirm"
                cancelText="Cancel"
                onConfirm={doConfirm}
                onClose={closeConfirm}
            />
        </Styled.Wrapper>
    );
};

export default AppointmentManagement;

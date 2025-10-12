import React, { useEffect, useMemo, useRef, useState } from "react";
import Styled from "./styled"; // ✅ default import to avoid undefined

/* =========================
   LocalStorage keys
   ========================= */
const DRAFT_KEY = "mortgageCalculator_draft_v1";
const SAVED_KEY = "mortgageCalculator_saved_v1";

/* =========================
   Helpers
   ========================= */
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const toFloat = (v) => {
    const n = parseFloat(String(v ?? "").replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
};
const fmtINR = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n || 0);
const fmtNum = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n || 0);

function addMonths(startISO, m) {
    const d = new Date(startISO);
    d.setHours(12, 0, 0, 0);
    return new Date(d.getFullYear(), d.getMonth() + m, d.getDate());
}
function toMMMYYYY(date) {
    return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date);
}

/* EMI formula */
function calcMonthlyPayment(P, annualRatePct, years) {
    const n = Math.round(years * 12);
    const r = (annualRatePct / 100) / 12;
    if (n <= 0 || P <= 0) return 0;
    if (r === 0) return P / n;
    const pow = Math.pow(1 + r, n);
    return (P * r * pow) / (pow - 1);
}

function buildSchedule({ principal, annualRatePct, years, extraMonthly = 0, startISO }) {
    const n = Math.round(years * 12);
    const r = (annualRatePct / 100) / 12;
    const basePayment = calcMonthlyPayment(principal, annualRatePct, years);
    if (!basePayment) return { rows: [], basePayment: 0, totalInterest: 0, totalPaid: 0, months: 0, payoffDate: null };

    let balance = principal;
    let idx = 0;
    const rows = [];
    let totalInterest = 0;
    let totalPaid = 0;

    while (balance > 0 && idx < n + 600) {
        const date = addMonths(startISO, idx + 1);
        const interest = r === 0 ? 0 : balance * r;
        const paymentDue = basePayment + extraMonthly;
        let principalPaid = paymentDue - interest;
        if (principalPaid > balance) principalPaid = balance;

        const payment = principalPaid + interest;
        balance -= principalPaid;
        totalInterest += interest;
        totalPaid += payment;

        rows.push({
            i: idx + 1,
            date,
            payment,
            principal: principalPaid,
            interest,
            balance: Math.max(balance, 0),
        });

        if (balance <= 0) break;
        idx++;
    }
    return {
        rows,
        basePayment,
        totalInterest,
        totalPaid,
        months: rows.length,
        payoffDate: rows.length ? rows[rows.length - 1].date : null,
    };
}

function downloadCSV(rows) {
    const header = ["#", "Date", "Payment", "Principal", "Interest", "Balance"].join(",");
    const lines = rows.map(r =>
        [r.i, toMMMYYYY(r.date), r.payment.toFixed(2), r.principal.toFixed(2), r.interest.toFixed(2), r.balance.toFixed(2)].join(",")
    );
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mortgage_schedule_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

/* =========================
   Component
   ========================= */
const initialForm = {
    principal: "",
    annualRate: "",
    years: "",
    extraMonthly: "",
    startISO: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    otherMonthly: "",
};

const MortgageCalculator = () => {
    const [form, setForm] = useState(() => {
        try {
            const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
            return draft ? { ...initialForm, ...draft } : initialForm;
        } catch { return initialForm; }
    });
    const [touched, setTouched] = useState({});
    const [errors, setErrors] = useState({});
    const [saved, setSaved] = useState(() => {
        try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); } catch { return []; }
    });

    const [confirm, setConfirm] = useState({ open: false, type: "", payload: null, title: "", body: "" });

    const principal = toFloat(form.principal);
    const annualRate = clamp(toFloat(form.annualRate), 0, 200);
    const years = clamp(toFloat(form.years), 0, 100);
    const extraMonthly = Math.max(0, toFloat(form.extraMonthly));
    const otherMonthly = Math.max(0, toFloat(form.otherMonthly));

    useEffect(() => {
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch { }
    }, [form]);

    function validateAll(f) {
        const e = {};
        if (!f.principal || toFloat(f.principal) <= 0) e.principal = "Loan amount is required and must be > 0.";
        if (f.annualRate === "" || toFloat(f.annualRate) < 0) e.annualRate = "Annual rate must be ≥ 0.";
        if (!f.years || toFloat(f.years) <= 0) e.years = "Loan term (years) is required and must be > 0.";
        if (toFloat(f.extraMonthly) < 0) e.extraMonthly = "Extra monthly payment cannot be negative.";
        if (toFloat(f.otherMonthly) < 0) e.otherMonthly = "Other monthly costs cannot be negative.";
        if (!f.startISO) e.startISO = "Start date is required.";
        return { errors: e, hasErrors: Object.values(e).some(Boolean) };
    }

    const setField = (name, value) => {
        setForm((prev) => {
            const next = { ...prev, [name]: value };
            setErrors(validateAll(next).errors);
            return next;
        });
    };
    const onBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

    const valid = useMemo(() => validateAll(form), [form]);
    const schedule = useMemo(() => {
        if (valid.hasErrors) return null;
        return buildSchedule({
            principal,
            annualRatePct: annualRate,
            years,
            extraMonthly,
            startISO: form.startISO || new Date().toISOString().slice(0, 10),
        });
    }, [valid, principal, annualRate, years, extraMonthly, form.startISO]);

    const loadSample = () => {
        const sample = {
            principal: "5000000",
            annualRate: "8.5",
            years: "20",
            extraMonthly: "5000",
            otherMonthly: "3500",
            startISO: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
        };
        setForm(sample);
        setTouched({});
        setErrors(validateAll(sample).errors);
    };

    const askClear = () =>
        setConfirm({ open: true, type: "clear", title: "Clear inputs?", body: "This will reset all fields and remove the draft from this browser." });

    const doClear = () => {
        setForm(initialForm);
        setTouched({});
        setErrors({});
        try { localStorage.removeItem(DRAFT_KEY); } catch { }
        setConfirm({ open: false, type: "", payload: null, title: "", body: "" });
    };

    const savePlan = () => {
        if (valid.hasErrors) {
            setTouched({ principal: true, annualRate: true, years: true, extraMonthly: true, otherMonthly: true, startISO: true });
            return;
        }
        const name = prompt("Plan name?");
        if (!name) return;
        const entry = { name, savedAt: new Date().toISOString(), form };
        const next = [entry, ...saved];
        setSaved(next);
        try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)); } catch { }
    };

    const loadSaved = (idx) => {
        const it = saved[idx];
        if (!it) return;
        setForm(it.form);
        setTouched({});
        setErrors(validateAll(it.form).errors);
    };

    const askDeleteOne = (idx) =>
        setConfirm({ open: true, type: "delete-one", payload: idx, title: "Delete this saved plan?", body: "This action cannot be undone." });

    const doDeleteOne = () => {
        const idx = confirm.payload;
        const next = saved.filter((_, i) => i !== idx);
        setSaved(next);
        try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)); } catch { }
        setConfirm({ open: false, type: "", payload: null, title: "", body: "" });
    };

    const askClearAll = () =>
        setConfirm({ open: true, type: "clear-all", title: "Delete all saved plans?", body: "All saved plans will be permanently removed." });

    const doClearAll = () => {
        setSaved([]);
        try { localStorage.setItem(SAVED_KEY, "[]"); } catch { }
        setConfirm({ open: false, type: "", payload: null, title: "", body: "" });
    };

    const monthlyEMI = schedule?.basePayment || 0;
    const totalMonthlyOutflow = monthlyEMI + Math.max(0, toFloat(form.extraMonthly)) + Math.max(0, toFloat(form.otherMonthly));
    const payoffDateLabel = schedule?.payoffDate ? toMMMYYYY(schedule.payoffDate) : "-";
    const monthsTotal = schedule?.months || 0;

    const PAGE = 12;
    const [page, setPage] = useState(1);
    const pageCount = schedule ? Math.max(1, Math.ceil(schedule.rows.length / PAGE)) : 1;
    useEffect(() => setPage(1), [form, monthsTotal]);
    const pagedRows = useMemo(() => {
        if (!schedule) return [];
        const start = (page - 1) * PAGE;
        return schedule.rows.slice(start, start + PAGE);
    }, [schedule, page]);

    const printRef = useRef(null);
    const onPrint = () => {
        if (!printRef.current) return;
        const prev = document.body.innerHTML;
        const html = printRef.current.innerHTML;
        document.body.innerHTML = html;
        window.print();
        document.body.innerHTML = prev;
        window.location.reload();
    };

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div>
                    <h1>Mortgage Calculator</h1>
                    <p>Estimate monthly mortgage payments from loan amount, annual interest, and term. Includes amortization, save/load, CSV & print.</p>
                </div>
                <Styled.Badges>
                    <span className="badge">Local Draft</span>
                    <span className="badge">Saved Plans</span>
                    <span className="badge">CSV & Print</span>
                </Styled.Badges>
            </Styled.Header>

            <Styled.Layout>
                {/* Left column */}
                <div className="left">
                    <Styled.Card>
                        <Styled.Section>
                            <Styled.SectionTitle>Inputs</Styled.SectionTitle>
                            <Styled.Grid>
                                <Styled.Field invalid={touched.principal && !!errors.principal}>
                                    <label htmlFor="principal">Loan Amount <em>*</em></label>
                                    <input
                                        id="principal" name="principal" type="text" inputMode="decimal" placeholder="e.g., 5000000"
                                        value={form.principal} onChange={(e) => setField("principal", e.target.value)} onBlur={onBlur}
                                    />
                                    <Styled.Error>{touched.principal && errors.principal}</Styled.Error>
                                </Styled.Field>

                                <Styled.Field invalid={touched.annualRate && !!errors.annualRate}>
                                    <label htmlFor="annualRate">Annual Rate of Interest (%) <em>*</em></label>
                                    <input
                                        id="annualRate" name="annualRate" type="text" inputMode="decimal" placeholder="e.g., 8.5"
                                        value={form.annualRate} onChange={(e) => setField("annualRate", e.target.value)} onBlur={onBlur}
                                    />
                                    <Styled.Error>{touched.annualRate && errors.annualRate}</Styled.Error>
                                </Styled.Field>

                                <Styled.Field invalid={touched.years && !!errors.years}>
                                    <label htmlFor="years">Loan Term (years) <em>*</em></label>
                                    <input
                                        id="years" name="years" type="text" inputMode="decimal" placeholder="e.g., 20"
                                        value={form.years} onChange={(e) => setField("years", e.target.value)} onBlur={onBlur}
                                    />
                                    <Styled.Error>{touched.years && errors.years}</Styled.Error>
                                </Styled.Field>

                                <Styled.Field>
                                    <label htmlFor="extraMonthly">Extra Monthly Payment (optional)</label>
                                    <input
                                        id="extraMonthly" name="extraMonthly" type="text" inputMode="decimal" placeholder="e.g., 5000"
                                        value={form.extraMonthly} onChange={(e) => setField("extraMonthly", e.target.value)} onBlur={onBlur}
                                    />
                                    <Styled.Error>{touched.extraMonthly && errors.extraMonthly}</Styled.Error>
                                </Styled.Field>

                                <Styled.Field>
                                    <label htmlFor="otherMonthly">Other Monthly Costs (taxes/HOA etc.)</label>
                                    <input
                                        id="otherMonthly" name="otherMonthly" type="text" inputMode="decimal" placeholder="e.g., 3500"
                                        value={form.otherMonthly} onChange={(e) => setField("otherMonthly", e.target.value)} onBlur={onBlur}
                                    />
                                    <Styled.Error>{touched.otherMonthly && errors.otherMonthly}</Styled.Error>
                                </Styled.Field>

                                <Styled.Field>
                                    <label htmlFor="startISO">Start Date</label>
                                    <input
                                        id="startISO" name="startISO" type="date"
                                        value={form.startISO} onChange={(e) => setField("startISO", e.target.value)} onBlur={onBlur}
                                    />
                                    <Styled.Error>{touched.startISO && errors.startISO}</Styled.Error>
                                </Styled.Field>
                            </Styled.Grid>

                            <Styled.Actions>
                                <button type="button" className="ghost" onClick={loadSample}>Load Sample</button>
                                <button type="button" className="ghost danger" onClick={askClear}>Clear Inputs</button>
                                <div className="spacer" />
                                <button type="button" disabled={valid.hasErrors || !schedule} onClick={() => downloadCSV(schedule.rows)}>Export CSV</button>
                                <button type="button" disabled={valid.hasErrors || !schedule} onClick={onPrint}>Print Schedule</button>
                            </Styled.Actions>
                        </Styled.Section>
                    </Styled.Card>

                    <Styled.Card>
                        <Styled.SectionTitle>Amortization Schedule</Styled.SectionTitle>

                        {valid.hasErrors && <Styled.Info>Enter valid inputs to view the schedule.</Styled.Info>}

                        {!valid.hasErrors && schedule && (
                            <>
                                <Styled.TableWrap ref={printRef}>
                                    <Styled.Table>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Date</th>
                                                <th>Payment</th>
                                                <th>Principal</th>
                                                <th>Interest</th>
                                                <th>Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pagedRows.map((r) => (
                                                <tr key={r.i}>
                                                    <td>{r.i}</td>
                                                    <td>{toMMMYYYY(r.date)}</td>
                                                    <td>{fmtINR(r.payment)}</td>
                                                    <td>{fmtINR(r.principal)}</td>
                                                    <td>{fmtINR(r.interest)}</td>
                                                    <td>{fmtINR(r.balance)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Styled.Table>
                                </Styled.TableWrap>

                                <Styled.Pagination>
                                    <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
                                    <span>Page {page} / {pageCount}</span>
                                    <button disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>Next</button>
                                </Styled.Pagination>
                            </>
                        )}
                    </Styled.Card>
                </div>

                {/* Right column */}
                <div className="right">
                    <Styled.Card>
                        <Styled.SectionTitle>Summary</Styled.SectionTitle>
                        <Styled.Summary>
                            <div><span className="label">Monthly EMI</span><strong>{fmtINR(schedule?.basePayment || 0)}</strong></div>
                            <div><span className="label">+ Extra</span><strong>{fmtINR(extraMonthly)}</strong></div>
                            <div><span className="label">+ Other Costs</span><strong>{fmtINR(otherMonthly)}</strong></div>
                            <Styled.Divider />
                            <div><span className="label">Total Monthly Outflow</span><strong>{fmtINR(totalMonthlyOutflow)}</strong></div>
                            <Styled.Divider />
                            <div><span className="label">Total Interest</span><strong>{fmtINR(schedule?.totalInterest || 0)}</strong></div>
                            <div><span className="label">Total Paid</span><strong>{fmtINR(schedule?.totalPaid || 0)}</strong></div>
                            <div><span className="label">Months</span><strong>{fmtNum(schedule?.months || 0)}</strong></div>
                            <div><span className="label">Payoff Date</span><strong>{schedule?.payoffDate ? toMMMYYYY(schedule.payoffDate) : "-"}</strong></div>
                        </Styled.Summary>
                        <Styled.Actions>
                            <button type="button" onClick={savePlan} disabled={valid.hasErrors}>Save Plan</button>
                        </Styled.Actions>
                    </Styled.Card>

                    <Styled.Card>
                        <Styled.SectionTitle>Saved Plans</Styled.SectionTitle>
                        {saved.length === 0 ? (
                            <Styled.Info>No saved plans yet.</Styled.Info>
                        ) : (
                            <Styled.SavedList>
                                {saved.map((it, idx) => (
                                    <li key={idx}>
                                        <div className="meta">
                                            <strong>{it.name}</strong>
                                            <span className="muted">{new Date(it.savedAt).toLocaleString("en-IN")}</span>
                                        </div>
                                        <div className="row">
                                            <button onClick={() => loadSaved(idx)}>Load</button>
                                            <button className="danger" onClick={() => askDeleteOne(idx)}>Delete</button>
                                        </div>
                                    </li>
                                ))}
                            </Styled.SavedList>
                        )}
                        <Styled.Actions>
                            <button className="ghost danger" disabled={!saved.length} onClick={askClearAll}>Clear All</button>
                        </Styled.Actions>
                    </Styled.Card>
                </div>
            </Styled.Layout>

            {/* Confirm Modal */}
            {confirm.open && (
                <Styled.ModalOverlay onClick={() => setConfirm({ open: false, type: "", payload: null, title: "", body: "" })}>
                    <Styled.Modal onClick={(e) => e.stopPropagation()}>
                        <h3>{confirm.title}</h3>
                        <p>{confirm.body}</p>
                        <div className="actions">
                            <button className="ghost" onClick={() => setConfirm({ open: false, type: "", payload: null, title: "", body: "" })}>Cancel</button>
                            {confirm.type === "clear" && <button className="danger" onClick={doClear}>Clear</button>}
                            {confirm.type === "delete-one" && <button className="danger" onClick={doDeleteOne}>Delete</button>}
                            {confirm.type === "clear-all" && <button className="danger" onClick={doClearAll}>Delete All</button>}
                        </div>
                    </Styled.Modal>
                </Styled.ModalOverlay>
            )}
        </Styled.Wrapper>
    );
};

export default MortgageCalculator;

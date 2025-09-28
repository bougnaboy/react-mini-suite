import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

const STORAGE_KEY = "medicine-delivery-v2";

const rupee = (n) =>
    (Number.isFinite(+n) ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(+n) : "₹0.00");

const prettyDate = (d = new Date()) =>
    d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

const prettyDateInput = (val) => {
    if (!val) return "";
    try {
        const d = new Date(`${val}T00:00:00`);
        return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    } catch {
        return val;
    }
};

const emptyItem = () => ({ id: crypto.randomUUID(), name: "", qty: 1, price: 0, notes: "" });

function MedicineDelivery() {
    const [meta, setMeta] = useState({
        // Patient / delivery
        patientName: "",
        phone: "",
        address: "",
        priority: "Normal",
        slot: "Anytime Today",
        note: "",
        // Billing
        gstPct: 5,
        discountPct: 0,
        // Doctor & prescription
        doctorName: "",
        doctorRegNo: "",
        clinic: "",
        doctorPhone: "",
        rxId: "",
        rxDate: "",
        diagnosis: "",
        rxNotes: ""
    });
    const [items, setItems] = useState([emptyItem()]);

    // load
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const saved = JSON.parse(raw);
                // merge for forward-compat with new fields
                if (saved?.meta) setMeta((prev) => ({ ...prev, ...saved.meta }));
                if (Array.isArray(saved?.items) && saved.items.length) setItems(saved.items);
            }
        } catch { }
    }, []);

    // save
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ meta, items }));
    }, [meta, items]);

    const addItem = () => setItems((arr) => [...arr, emptyItem()]);
    const removeItem = (id) => {
        const t = items.find((x) => x.id === id);
        const label = t?.name?.trim() ? `“${t.name.trim()}”` : "this item";
        if (!window.confirm(`Remove ${label}?`)) return;
        setItems((arr) => arr.filter((x) => x.id !== id));
    };
    const updateItem = (id, key, value) => setItems((arr) => arr.map((x) => (x.id === id ? { ...x, [key]: value } : x)));

    const clearAll = () => {
        if (!window.confirm("Clear the entire form?")) return;
        setMeta({
            patientName: "",
            phone: "",
            address: "",
            priority: "Normal",
            slot: "Anytime Today",
            note: "",
            gstPct: 5,
            discountPct: 0,
            doctorName: "",
            doctorRegNo: "",
            clinic: "",
            doctorPhone: "",
            rxId: "",
            rxDate: "",
            diagnosis: "",
            rxNotes: ""
        });
        setItems([emptyItem()]);
        localStorage.removeItem(STORAGE_KEY);
    };

    // totals (discount before GST)
    const totals = useMemo(() => {
        const subtotal = items.reduce((sum, x) => sum + (Number(x.qty) || 0) * (Number(x.price) || 0), 0);
        const discountAmt = subtotal * ((Number(meta.discountPct) || 0) / 100);
        const taxable = Math.max(subtotal - discountAmt, 0);
        const gstAmt = taxable * ((Number(meta.gstPct) || 0) / 100);
        const grandTotal = taxable + gstAmt;
        return { subtotal, discountAmt, taxable, gstAmt, grandTotal };
    }, [items, meta.discountPct, meta.gstPct]);

    const summary = useMemo(() => {
        const lines = [];
        lines.push(`Medicine Delivery Request — ${prettyDate()}`);

        // Patient / delivery
        if (meta.patientName) lines.push(`Patient: ${meta.patientName}`);
        if (meta.phone) lines.push(`Phone: ${meta.phone}`);
        if (meta.address) lines.push(`Address: ${meta.address}`);
        lines.push(`Priority: ${meta.priority}`);
        lines.push(`Preferred Slot: ${meta.slot}`);
        if (meta.note) lines.push(`Note: ${meta.note}`);

        // Doctor / prescription
        if (meta.doctorName || meta.doctorRegNo || meta.clinic || meta.doctorPhone || meta.rxId || meta.rxDate || meta.diagnosis || meta.rxNotes) {
            lines.push("");
            lines.push("Doctor / Prescription:");
            if (meta.doctorName) lines.push(`Doctor: ${meta.doctorName}`);
            if (meta.doctorRegNo) lines.push(`Reg. No: ${meta.doctorRegNo}`);
            if (meta.clinic) lines.push(`Clinic/Hospital: ${meta.clinic}`);
            if (meta.doctorPhone) lines.push(`Doctor Phone: ${meta.doctorPhone}`);
            if (meta.rxId) lines.push(`Prescription ID: ${meta.rxId}`);
            if (meta.rxDate) lines.push(`Prescription Date: ${prettyDateInput(meta.rxDate)}`);
            if (meta.diagnosis) lines.push(`Diagnosis: ${meta.diagnosis}`);
            if (meta.rxNotes) lines.push(`Rx Notes: ${meta.rxNotes}`);
        }

        // Items
        lines.push("");
        lines.push("Items:");
        items.forEach((x, i) => {
            const name = x.name?.trim() || "(Unnamed)";
            const qty = Number(x.qty || 0);
            const price = Number(x.price || 0);
            const lineTotal = qty * price;
            const tail = x.notes?.trim() ? ` — ${x.notes.trim()}` : "";
            lines.push(`${i + 1}. ${name} × ${qty} @ ${rupee(price)} = ${rupee(lineTotal)}${tail}`);
        });

        // Totals
        lines.push("");
        lines.push(`Subtotal: ${rupee(totals.subtotal)}`);
        lines.push(`Discount (${meta.discountPct || 0}%): -${rupee(totals.discountAmt)}`);
        lines.push(`Taxable: ${rupee(totals.taxable)}`);
        lines.push(`GST (${meta.gstPct || 0}%): ${rupee(totals.gstAmt)}`);
        lines.push(`Grand Total: ${rupee(totals.grandTotal)}`);

        return lines.join("\n");
    }, [meta, items, totals]);

    const copySummary = async () => {
        try { await navigator.clipboard.writeText(summary); alert("Summary copied."); }
        catch { window.prompt("Copy the summary below:", summary); }
    };
    const printSummary = () => window.print();

    return (
        <>
            <Styled.PrintScope />

            <Styled.Wrapper id="md-print-area">
                <header className="header no-print">
                    <h2>Medicine Delivery</h2>
                    <div className="meta">{prettyDate()}</div>
                </header>

                {/* Patient / Delivery Info */}
                <section className="card">
                    <div className="grid">
                        <label>
                            <span>Patient Name</span>
                            <input value={meta.patientName} onChange={(e) => setMeta({ ...meta, patientName: e.target.value })} placeholder="e.g., Rahul Mehta" />
                        </label>
                        <label>
                            <span>Phone</span>
                            <input value={meta.phone} onChange={(e) => setMeta({ ...meta, phone: e.target.value })} placeholder="10-digit mobile" />
                        </label>
                    </div>

                    <label>
                        <span>Address</span>
                        <textarea rows={3} value={meta.address} onChange={(e) => setMeta({ ...meta, address: e.target.value })} placeholder="Flat / Street / Landmark / City / PIN" />
                    </label>

                    <div className="grid">
                        <label>
                            <span>Priority</span>
                            <select value={meta.priority} onChange={(e) => setMeta({ ...meta, priority: e.target.value })}>
                                <option>Normal</option><option>Urgent</option><option>Schedule</option>
                            </select>
                        </label>
                        <label>
                            <span>Preferred Slot</span>
                            <input value={meta.slot} onChange={(e) => setMeta({ ...meta, slot: e.target.value })} placeholder="e.g., Today 6–9 PM" />
                        </label>
                    </div>

                    <label>
                        <span>Note</span>
                        <input value={meta.note} onChange={(e) => setMeta({ ...meta, note: e.target.value })} placeholder="Gate code / don’t ring bell / etc." />
                    </label>
                </section>

                {/* Doctor & Prescription */}
                <section className="card">
                    <h3>Doctor & Prescription</h3>

                    <div className="grid">
                        <label>
                            <span>Doctor Name</span>
                            <input value={meta.doctorName} onChange={(e) => setMeta({ ...meta, doctorName: e.target.value })} placeholder="e.g., Dr. A. Sharma" />
                        </label>
                        <label>
                            <span>Reg. No</span>
                            <input value={meta.doctorRegNo} onChange={(e) => setMeta({ ...meta, doctorRegNo: e.target.value })} placeholder="e.g., MCI / KMC number" />
                        </label>
                    </div>

                    <div className="grid">
                        <label>
                            <span>Clinic / Hospital</span>
                            <input value={meta.clinic} onChange={(e) => setMeta({ ...meta, clinic: e.target.value })} placeholder="e.g., CityCare Clinic, Bengaluru" />
                        </label>
                        <label>
                            <span>Doctor Phone</span>
                            <input value={meta.doctorPhone} onChange={(e) => setMeta({ ...meta, doctorPhone: e.target.value })} placeholder="Optional" />
                        </label>
                    </div>

                    <div className="grid">
                        <label>
                            <span>Prescription ID</span>
                            <input value={meta.rxId} onChange={(e) => setMeta({ ...meta, rxId: e.target.value })} placeholder="e.g., RX-2025-0912" />
                        </label>
                        <label>
                            <span>Prescription Date</span>
                            <input type="date" value={meta.rxDate} onChange={(e) => setMeta({ ...meta, rxDate: e.target.value })} />
                        </label>
                    </div>

                    <label>
                        <span>Diagnosis</span>
                        <input value={meta.diagnosis} onChange={(e) => setMeta({ ...meta, diagnosis: e.target.value })} placeholder="Optional" />
                    </label>

                    <label>
                        <span>Rx Notes</span>
                        <input value={meta.rxNotes} onChange={(e) => setMeta({ ...meta, rxNotes: e.target.value })} placeholder="e.g., Take after food, avoid NSAIDs etc." />
                    </label>
                </section>

                {/* Medicines */}
                <section className="card">
                    <h3>Medicines</h3>

                    <div className="items">
                        {items.map((it, idx) => {
                            const qty = Number(it.qty) || 0;
                            const price = Number(it.price) || 0;
                            const lineTotal = qty * price;

                            return (
                                <div className="item" key={it.id}>
                                    <div className="index">{idx + 1}</div>

                                    <input className="name" placeholder="Medicine name (e.g., Dolo 650)" value={it.name}
                                        onChange={(e) => updateItem(it.id, "name", e.target.value)} />

                                    <input className="qty" type="number" min="0" step="1" value={it.qty}
                                        onChange={(e) => updateItem(it.id, "qty", e.target.value)} title="Quantity" />

                                    <input className="price" type="number" min="0" step="0.01" value={it.price}
                                        onChange={(e) => updateItem(it.id, "price", e.target.value)} title="Unit Price" placeholder="Price" />

                                    <input className="notes" placeholder="Notes (brand / strip / syrup / dosage)" value={it.notes}
                                        onChange={(e) => updateItem(it.id, "notes", e.target.value)} />

                                    <div className="amount">{rupee(lineTotal)}</div>

                                    <button className="remove no-print" onClick={() => removeItem(it.id)}>Remove</button>
                                </div>
                            );
                        })}
                    </div>

                    <div className="row bottom no-print">
                        <button className="add" onClick={addItem}>+ Add Item</button>
                    </div>
                </section>

                {/* Totals */}
                <section className="card">
                    <div className="totals">
                        <div className="controls">
                            <label>
                                <span>GST %</span>
                                <input type="number" min="0" step="0.5" value={meta.gstPct}
                                    onChange={(e) => setMeta({ ...meta, gstPct: e.target.value })} />
                            </label>
                            <label>
                                <span>Discount %</span>
                                <input type="number" min="0" step="0.5" value={meta.discountPct}
                                    onChange={(e) => setMeta({ ...meta, discountPct: e.target.value })} />
                            </label>
                        </div>

                        <div className="figures">
                            <div className="line"><div>Subtotal</div><div>{rupee(totals.subtotal)}</div></div>
                            <div className="line"><div>Discount ({meta.discountPct || 0}%)</div><div>-{rupee(totals.discountAmt)}</div></div>
                            <div className="line"><div>Taxable</div><div>{rupee(totals.taxable)}</div></div>
                            <div className="line"><div>GST ({meta.gstPct || 0}%)</div><div>{rupee(totals.gstAmt)}</div></div>
                            <div className="line grand"><div>Grand Total</div><div>{rupee(totals.grandTotal)}</div></div>
                        </div>
                    </div>
                </section>

                {/* Shareable Summary (prints only this) */}
                <section className="card">
                    <label>
                        <span>Shareable Summary</span>

                        {/* On-screen */}
                        <textarea className="summary no-print" rows={10} readOnly value={summary} />

                        {/* Print-only */}
                        <pre id="md-print-summary" className="only-print">{summary}</pre>
                    </label>
                    <p className="hint">Tip: copy and share with your chemist / delivery partner on WhatsApp or email.</p>
                </section>

                {/* Bottom actions */}
                <footer className="footer no-print">
                    <div className="spacer" />
                    <div className="actions">
                        <button onClick={copySummary}>Copy</button>
                        <button onClick={printSummary}>Print</button>
                        <button className="danger" onClick={clearAll}>Clear</button>
                    </div>
                </footer>
            </Styled.Wrapper>
        </>
    );
}

export default MedicineDelivery;

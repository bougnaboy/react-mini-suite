import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled, PrintOnlyGlobal } from "./styled";


const LOCAL_KEY = "bank-kyc-form:draft";

const initialForm = {
    // Personal
    fullName: "",
    fatherOrSpouseName: "",
    dob: "",
    gender: "Male",
    maritalStatus: "Single",
    // Contact
    mobile: "",
    email: "",
    // Identity
    aadhaar: "",
    pan: "",
    // Address
    presentAddress: { line1: "", line2: "", city: "", state: "", pincode: "" },
    sameAsPresent: false,
    permanentAddress: { line1: "", line2: "", city: "", state: "", pincode: "" },
    // Employment
    occupation: "Salaried",
    occupationOther: "",
    incomeRange: "0-3 LPA",
    // Nominee
    nominee: { name: "", relation: "Father", mobile: "", aadhaar: "" },
    // Declaration
    agree: false,
};

function validateMobile(v) { return /^[6-9]\d{9}$/.test(v.trim()); }
function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
function validatePincode(v) { return /^\d{6}$/.test(v.trim()); }
function validateAadhaar(v) { return /^\d{12}$/.test(v.trim()); }
function validatePAN(v) { return /^[A-Z]{5}\d{4}[A-Z]{1}$/.test(v.trim()); }

const BankKycForm = () => {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [validated, setValidated] = useState(false);
    const printRef = useRef(null);

    // Load draft
    useEffect(() => {
        try {
            const raw = localStorage.getItem(LOCAL_KEY);
            if (raw) setForm({ ...initialForm, ...JSON.parse(raw) });
        } catch { }
    }, []);

    // Autosave draft
    useEffect(() => {
        try { localStorage.setItem(LOCAL_KEY, JSON.stringify(form)); } catch { }
    }, [form]);

    // Any change invalidates previous validation
    useEffect(() => { setValidated(false); }, [form]);

    // Sync permanent address if sameAsPresent
    useEffect(() => {
        if (form.sameAsPresent) {
            setForm(prev => ({ ...prev, permanentAddress: { ...prev.presentAddress } }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        form.sameAsPresent,
        form.presentAddress.line1,
        form.presentAddress.line2,
        form.presentAddress.city,
        form.presentAddress.state,
        form.presentAddress.pincode,
    ]);

    const occupationIsOther = form.occupation === "Other";

    function setField(path, value) {
        setForm(prev => {
            const parts = path.split(".");
            const copy = { ...prev };
            let cursor = copy;
            for (let i = 0; i < parts.length - 1; i++) {
                const key = parts[i];
                cursor[key] = Array.isArray(cursor[key]) ? [...cursor[key]] : { ...cursor[key] };
                cursor = cursor[key];
            }
            cursor[parts[parts.length - 1]] = value;
            return copy;
        });
    }

    // Build and return error object
    function validateAll() {
        const e = {};
        if (!form.fullName.trim()) e.fullName = "Full name is required.";
        if (!form.dob) e.dob = "Date of birth is required.";

        if (!validateMobile(form.mobile)) e.mobile = "Enter a valid 10-digit mobile.";
        if (form.email && !validateEmail(form.email)) e.email = "Enter a valid email.";

        if (!validateAadhaar(form.aadhaar)) e.aadhaar = "Aadhaar must be 12 digits.";
        if (form.pan && !validatePAN(form.pan)) e.pan = "PAN must be like ABCDE1234F.";

        const pa = form.presentAddress;
        if (!pa.line1.trim()) e.presentAddress = "Present address Line 1 is required.";
        if (!pa.city.trim() || !pa.state.trim()) e.presentAddressCityState = "City & State are required (Present).";
        if (!validatePincode(pa.pincode)) e.presentPincode = "Valid 6-digit pincode (Present).";

        if (!form.sameAsPresent) {
            const pe = form.permanentAddress;
            if (!pe.line1.trim()) e.permanentAddress = "Permanent address Line 1 is required.";
            if (!pe.city.trim() || !pe.state.trim()) e.permanentCityState = "City & State are required (Permanent).";
            if (!validatePincode(pe.pincode)) e.permanentPincode = "Valid 6-digit pincode (Permanent).";
        }

        if (!form.nominee.name.trim()) e.nomineeName = "Nominee name is required.";
        if (form.nominee.mobile && !validateMobile(form.nominee.mobile)) e.nomineeMobile = "Nominee mobile should be a valid 10-digit number.";
        if (form.nominee.aadhaar && !validateAadhaar(form.nominee.aadhaar)) e.nomineeAadhaar = "Nominee Aadhaar should be 12 digits.";

        if (!form.agree) e.agree = "Please confirm the declaration.";
        return e;
    }

    // Scroll to first invalid field
    function scrollToFirstError(errs) {
        const priority = [
            "fullName", "dob", "mobile", "email", "aadhaar", "pan",
            "presentAddress", "presentAddressCityState", "presentPincode",
            "permanentAddress", "permanentCityState", "permanentPincode",
            "nomineeName", "nomineeMobile", "nomineeAadhaar", "agree"
        ];
        const idMap = {
            fullName: "fullName",
            dob: "dob",
            mobile: "mobile",
            email: "email",
            aadhaar: "aadhaar",
            pan: "pan",
            presentAddress: "pa1",
            presentAddressCityState: "pacity",
            presentPincode: "papin",
            permanentAddress: "pe1",
            permanentCityState: "pecity",
            permanentPincode: "pepin",
            nomineeName: "nomineeName",
            nomineeMobile: "nomineeMobile",
            nomineeAadhaar: "nomineeAadhaar",
            agree: "agree",
        };
        const firstKey = priority.find(k => errs[k]);
        if (!firstKey) return;
        const el = document.getElementById(idMap[firstKey]);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            setTimeout(() => el.focus?.({ preventScroll: true }), 300);
        }
    }

    function handleValidate(e) {
        if (e) e.preventDefault();
        const eObj = validateAll();
        setErrors(eObj);
        const ok = Object.keys(eObj).length === 0;
        setValidated(ok);
        if (!ok) scrollToFirstError(eObj);
    }

    function handlePrint() {
        if (!validated) {
            const proceed = window.confirm("Form is not validated or has errors. Print anyway?");
            if (!proceed) return;
        }
        window.print();
    }

    function handleReset() {
        const ok = window.confirm("Reset all fields and clear saved draft?");
        if (!ok) return;
        setForm(initialForm);
        setErrors({});
        setValidated(false);
        try { localStorage.removeItem(LOCAL_KEY); } catch { }
    }

    function handleExportJSON() {
        const blob = new Blob([JSON.stringify(form, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "bank-kyc-form.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    const printable = useMemo(() => {
        const occ = form.occupation === "Other" && form.occupationOther.trim()
            ? `Other (${form.occupationOther})`
            : form.occupation;
        return { ...form, occupationDisplay: occ };
    }, [form]);

    return (
        <Styled.Wrapper>
            {/* Mount once so only this component prints */}
            <PrintOnlyGlobal />

            <Styled.Header className="no-print">
                <h2>Bank KYC Form</h2>
                <p>Client-side form with validation, autosave, and print-ready summary.</p>
            </Styled.Header>

            {/* Pressing Enter validates only */}
            <Styled.Form onSubmit={handleValidate} className="no-print">
                {/* Personal */}
                <Styled.Section>
                    <Styled.SectionTitle>Personal Details</Styled.SectionTitle>
                    <Styled.Grid $cols={2}>
                        <Styled.Field>
                            <label htmlFor="fullName">Full Name *</label>
                            <input id="fullName" type="text" value={form.fullName}
                                onChange={(e) => setField("fullName", e.target.value)} placeholder="As per Aadhaar/PAN" autoComplete="name" />
                            {errors.fullName && <Styled.Error>{errors.fullName}</Styled.Error>}
                        </Styled.Field>

                        <Styled.Field>
                            <label htmlFor="fatherOrSpouseName">Father/Spouse Name</label>
                            <input id="fatherOrSpouseName" type="text" value={form.fatherOrSpouseName}
                                onChange={(e) => setField("fatherOrSpouseName", e.target.value)} />
                        </Styled.Field>

                        <Styled.Field>
                            <label htmlFor="dob">Date of Birth *</label>
                            <input id="dob" type="date" value={form.dob}
                                onChange={(e) => setField("dob", e.target.value)} />
                            {errors.dob && <Styled.Error>{errors.dob}</Styled.Error>}
                        </Styled.Field>

                        <Styled.Field>
                            <label htmlFor="gender">Gender</label>
                            <select id="gender" value={form.gender} onChange={(e) => setField("gender", e.target.value)}>
                                <option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option>
                            </select>
                        </Styled.Field>

                        <Styled.Field>
                            <label htmlFor="maritalStatus">Marital Status</label>
                            <select id="maritalStatus" value={form.maritalStatus} onChange={(e) => setField("maritalStatus", e.target.value)}>
                                <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
                            </select>
                        </Styled.Field>
                    </Styled.Grid>
                </Styled.Section>

                {/* Contact */}
                <Styled.Section>
                    <Styled.SectionTitle>Contact</Styled.SectionTitle>
                    <Styled.Grid $cols={2}>
                        <Styled.Field>
                            <label htmlFor="mobile">Mobile *</label>
                            <input id="mobile" type="tel" inputMode="numeric" placeholder="10-digit" value={form.mobile}
                                onChange={(e) => setField("mobile", e.target.value)} />
                            {errors.mobile && <Styled.Error>{errors.mobile}</Styled.Error>}
                        </Styled.Field>

                        <Styled.Field>
                            <label htmlFor="email">Email</label>
                            <input id="email" type="email" value={form.email}
                                onChange={(e) => setField("email", e.target.value)} />
                            {errors.email && <Styled.Error>{errors.email}</Styled.Error>}
                        </Styled.Field>
                    </Styled.Grid>
                </Styled.Section>

                {/* Identity */}
                <Styled.Section>
                    <Styled.SectionTitle>Identity</Styled.SectionTitle>
                    <Styled.Grid $cols={2}>
                        <Styled.Field>
                            <label htmlFor="aadhaar">Aadhaar *</label>
                            <input id="aadhaar" type="text" inputMode="numeric" maxLength={12} placeholder="12 digits"
                                value={form.aadhaar} onChange={(e) => setField("aadhaar", e.target.value.replace(/\D/g, ""))} />
                            {errors.aadhaar && <Styled.Error>{errors.aadhaar}</Styled.Error>}
                        </Styled.Field>

                        <Styled.Field>
                            <label htmlFor="pan">PAN</label>
                            <input id="pan" type="text" maxLength={10} value={form.pan}
                                onChange={(e) => setField("pan", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                                placeholder="ABCDE1234F" />
                            {errors.pan && <Styled.Error>{errors.pan}</Styled.Error>}
                        </Styled.Field>
                    </Styled.Grid>
                </Styled.Section>

                {/* Address */}
                <Styled.Section>
                    <Styled.SectionTitle>Address</Styled.SectionTitle>

                    <Styled.SubTitle>Present Address *</Styled.SubTitle>
                    <Styled.Grid $cols={2}>
                        <Styled.Field className="span2">
                            <label htmlFor="pa1">Line 1</label>
                            <input id="pa1" type="text" value={form.presentAddress.line1}
                                onChange={(e) => setField("presentAddress.line1", e.target.value)} />
                        </Styled.Field>
                        <Styled.Field className="span2">
                            <label htmlFor="pa2">Line 2</label>
                            <input id="pa2" type="text" value={form.presentAddress.line2}
                                onChange={(e) => setField("presentAddress.line2", e.target.value)} />
                        </Styled.Field>
                        <Styled.Field>
                            <label htmlFor="pacity">City</label>
                            <input id="pacity" type="text" value={form.presentAddress.city}
                                onChange={(e) => setField("presentAddress.city", e.target.value)} />
                        </Styled.Field>
                        <Styled.Field>
                            <label htmlFor="pastate">State</label>
                            <input id="pastate" type="text" value={form.presentAddress.state}
                                onChange={(e) => setField("presentAddress.state", e.target.value)} />
                        </Styled.Field>
                        <Styled.Field>
                            <label htmlFor="papin">Pincode</label>
                            <input id="papin" type="text" inputMode="numeric" maxLength={6}
                                value={form.presentAddress.pincode}
                                onChange={(e) => setField("presentAddress.pincode", e.target.value.replace(/\D/g, ""))} />
                        </Styled.Field>
                    </Styled.Grid>
                    {(errors.presentAddress || errors.presentAddressCityState || errors.presentPincode) && (
                        <Styled.ErrorBlock>
                            {errors.presentAddress || errors.presentAddressCityState || errors.presentPincode}
                        </Styled.ErrorBlock>
                    )}

                    <Styled.CopyRow>
                        <label>
                            <input type="checkbox" checked={form.sameAsPresent}
                                onChange={(e) => setField("sameAsPresent", e.target.checked)} />
                            <span>Permanent address is same as present</span>
                        </label>
                    </Styled.CopyRow>

                    {!form.sameAsPresent && (
                        <>
                            <Styled.SubTitle>Permanent Address *</Styled.SubTitle>
                            <Styled.Grid $cols={2}>
                                <Styled.Field className="span2">
                                    <label htmlFor="pe1">Line 1</label>
                                    <input id="pe1" type="text" value={form.permanentAddress.line1}
                                        onChange={(e) => setField("permanentAddress.line1", e.target.value)} />
                                </Styled.Field>
                                <Styled.Field className="span2">
                                    <label htmlFor="pe2">Line 2</label>
                                    <input id="pe2" type="text" value={form.permanentAddress.line2}
                                        onChange={(e) => setField("permanentAddress.line2", e.target.value)} />
                                </Styled.Field>
                                <Styled.Field>
                                    <label htmlFor="pecity">City</label>
                                    <input id="pecity" type="text" value={form.permanentAddress.city}
                                        onChange={(e) => setField("permanentAddress.city", e.target.value)} />
                                </Styled.Field>
                                <Styled.Field>
                                    <label htmlFor="pestate">State</label>
                                    <input id="pestate" type="text" value={form.permanentAddress.state}
                                        onChange={(e) => setField("permanentAddress.state", e.target.value)} />
                                </Styled.Field>
                                <Styled.Field>
                                    <label htmlFor="pepin">Pincode</label>
                                    <input id="pepin" type="text" inputMode="numeric" maxLength={6}
                                        value={form.permanentAddress.pincode}
                                        onChange={(e) => setField("permanentAddress.pincode", e.target.value.replace(/\D/g, ""))} />
                                </Styled.Field>
                            </Styled.Grid>
                            {(errors.permanentAddress || errors.permanentCityState || errors.permanentPincode) && (
                                <Styled.ErrorBlock>
                                    {errors.permanentAddress || errors.permanentCityState || errors.permanentPincode}
                                </Styled.ErrorBlock>
                            )}
                        </>
                    )}
                </Styled.Section>

                {/* Employment */}
                <Styled.Section>
                    <Styled.SectionTitle>Employment</Styled.SectionTitle>
                    <Styled.Grid $cols={2}>
                        <Styled.Field>
                            <label htmlFor="occupation">Occupation</label>
                            <select id="occupation" value={form.occupation} onChange={(e) => setField("occupation", e.target.value)}>
                                <option>Salaried</option><option>Self-Employed</option><option>Student</option>
                                <option>Homemaker</option><option>Retired</option><option>Other</option>
                            </select>
                        </Styled.Field>
                        {occupationIsOther && (
                            <Styled.Field>
                                <label htmlFor="occupationOther">Please specify</label>
                                <input id="occupationOther" type="text" value={form.occupationOther}
                                    onChange={(e) => setField("occupationOther", e.target.value)} />
                            </Styled.Field>
                        )}
                        <Styled.Field>
                            <label htmlFor="incomeRange">Annual Income Range</label>
                            <select id="incomeRange" value={form.incomeRange} onChange={(e) => setField("incomeRange", e.target.value)}>
                                <option>0-3 LPA</option><option>3-6 LPA</option><option>6-10 LPA</option>
                                <option>10-15 LPA</option><option>15-25 LPA</option><option>25+ LPA</option>
                            </select>
                        </Styled.Field>
                    </Styled.Grid>
                </Styled.Section>

                {/* Nominee */}
                <Styled.Section>
                    <Styled.SectionTitle>Nominee</Styled.SectionTitle>
                    <Styled.Grid $cols={2}>
                        <Styled.Field>
                            <label htmlFor="nomineeName">Name *</label>
                            <input id="nomineeName" type="text" value={form.nominee.name}
                                onChange={(e) => setField("nominee.name", e.target.value)} />
                            {errors.nomineeName && <Styled.Error>{errors.nomineeName}</Styled.Error>}
                        </Styled.Field>
                        <Styled.Field>
                            <label htmlFor="nomineeRelation">Relation</label>
                            <select id="nomineeRelation" value={form.nominee.relation}
                                onChange={(e) => setField("nominee.relation", e.target.value)}>
                                <option>Father</option><option>Mother</option><option>Spouse</option>
                                <option>Son</option><option>Daughter</option><option>Other</option>
                            </select>
                        </Styled.Field>
                        <Styled.Field>
                            <label htmlFor="nomineeMobile">Mobile</label>
                            <input id="nomineeMobile" type="tel" inputMode="numeric" value={form.nominee.mobile}
                                onChange={(e) => setField("nominee.mobile", e.target.value)} />
                            {errors.nomineeMobile && <Styled.Error>{errors.nomineeMobile}</Styled.Error>}
                        </Styled.Field>
                        <Styled.Field>
                            <label htmlFor="nomineeAadhaar">Aadhaar</label>
                            <input id="nomineeAadhaar" type="text" inputMode="numeric" maxLength={12}
                                value={form.nominee.aadhaar}
                                onChange={(e) => setField("nominee.aadhaar", e.target.value.replace(/\D/g, ""))} />
                            {errors.nomineeAadhaar && <Styled.Error>{errors.nomineeAadhaar}</Styled.Error>}
                        </Styled.Field>
                    </Styled.Grid>
                </Styled.Section>

                {/* Declaration */}
                <Styled.Section>
                    <Styled.SectionTitle>Declaration</Styled.SectionTitle>
                    <Styled.Declaration>
                        <label>
                            <input id="agree" type="checkbox" checked={form.agree}
                                onChange={(e) => setField("agree", e.target.checked)} />
                            <span>I hereby declare that the information provided is true and correct to the best of my knowledge.</span>
                        </label>
                    </Styled.Declaration>
                    {errors.agree && <Styled.Error>{errors.agree}</Styled.Error>}
                </Styled.Section>

                {/* Success banner */}
                {validated && Object.keys(errors).length === 0 && (
                    <Styled.Success className="no-print">All good ✅ — ready to print.</Styled.Success>
                )}

                {/* Actions */}
                <Styled.Actions className="no-print">
                    <button type="button" onClick={handleExportJSON}>Export JSON</button>
                    <button type="submit" onClick={handleValidate}>Validate</button>
                    <button type="button" onClick={handlePrint}>Print</button>
                    <button type="button" className="danger" onClick={handleReset}>Reset</button>
                </Styled.Actions>
            </Styled.Form>

            {/* PRINT SUMMARY (visible only in print) */}
            <Styled.PrintArea id="kyc-print-root" ref={printRef} className="print-only">
                <h3>Know Your Customer (KYC) Application</h3>
                <Styled.PrintGrid>
                    <div><b>Full Name:</b> {printable.fullName || "-"}</div>
                    <div><b>Father/Spouse:</b> {printable.fatherOrSpouseName || "-"}</div>
                    <div><b>DOB:</b> {printable.dob || "-"}</div>
                    <div><b>Gender:</b> {printable.gender || "-"}</div>
                    <div><b>Marital Status:</b> {printable.maritalStatus || "-"}</div>
                    <div><b>Mobile:</b> {printable.mobile || "-"}</div>
                    <div><b>Email:</b> {printable.email || "-"}</div>
                    <div><b>Aadhaar:</b> {printable.aadhaar || "-"}</div>
                    <div><b>PAN:</b> {printable.pan || "-"}</div>
                    <div className="span2"><b>Present Address:</b> {[printable.presentAddress.line1, printable.presentAddress.line2, printable.presentAddress.city, printable.presentAddress.state, printable.presentAddress.pincode].filter(Boolean).join(", ") || "-"}</div>
                    <div className="span2"><b>Permanent Address:</b> {[printable.permanentAddress.line1, printable.permanentAddress.line2, printable.permanentAddress.city, printable.permanentAddress.state, printable.permanentAddress.pincode].filter(Boolean).join(", ") || "-"}</div>
                    <div><b>Occupation:</b> {printable.occupationDisplay || "-"}</div>
                    <div><b>Income Range:</b> {printable.incomeRange || "-"}</div>
                    <div className="span2"><b>Nominee:</b> {[printable.nominee.name, printable.nominee.relation].filter(Boolean).join(" / ") || "-"}</div>
                    <div><b>Nominee Mobile:</b> {printable.nominee.mobile || "-"}</div>
                    <div><b>Nominee Aadhaar:</b> {printable.nominee.aadhaar || "-"}</div>
                </Styled.PrintGrid>
                <Styled.PrintFooter>
                    <div><b>Date:</b> {new Date().toLocaleDateString()}</div>
                    <div className="sign-row"><span>Customer Signature</span><span>Bank Official</span></div>
                </Styled.PrintFooter>
            </Styled.PrintArea>
        </Styled.Wrapper>
    );
};

export default BankKycForm;

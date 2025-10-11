import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";
import { toast } from "react-toastify";

/* -------------------- tiny helpers -------------------- */
const isHttpUrl = (v) =>
    /^(https?:\/\/)[\w.-]+(\.[\w.-]+)+(\/[\w\-._~:/?#[\]@!$&'()*+,;=.]+)?$/.test(v || "");
const isINPhone = (v) => /^[6-9]\d{9}$/.test(v || "");
const isPin = (v) => /^\d{6}$/.test(v || "");
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");
const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
function isAdult(dobStr) {
    try {
        const dob = new Date(dobStr);
        const today = new Date();
        if (Number.isNaN(dob.getTime())) return false;
        if (dob >= today) return false;
        const age =
            today.getFullYear() -
            dob.getFullYear() -
            (today.getMonth() < dob.getMonth() ||
                (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
                ? 1
                : 0);
        return age >= 18;
    } catch {
        return false;
    }
}

const MB = 1024 * 1024;
const ACCEPTED_RESUME = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
];
const ACCEPTED_IMAGE = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

/* -------------------- demo data -------------------- */
const COUNTRIES = [
    { code: "IN", label: "India" },
    { code: "US", label: "United States" },
    { code: "DE", label: "Germany" },
];
const STATES_BY_COUNTRY = {
    IN: ["Bihar", "Karnataka", "Maharashtra", "Delhi", "Uttar Pradesh"],
    US: ["California", "Texas", "New York"],
    DE: ["Bavaria", "Berlin", "Hamburg"],
};
const CITIES_BY_STATE = {
    Bihar: ["Patna", "Gaya", "Muzaffarpur"],
    Karnataka: ["Bengaluru", "Mysuru", "Mangaluru"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur"],
    Delhi: ["New Delhi", "Dwarka", "Saket"],
    "Uttar Pradesh": ["Lucknow", "Noida", "Varanasi"],

    California: ["San Francisco", "Los Angeles", "San Diego"],
    Texas: ["Austin", "Dallas", "Houston"],
    "New York": ["New York City", "Buffalo", "Albany"],

    Bavaria: ["Munich", "Nuremberg"],
    Berlin: ["Berlin"],
    Hamburg: ["Hamburg"],
};
const SKILLS = [
    "React", "Node.js", "Express", "MongoDB", "TypeScript",
    "Styled-Components", "MUI", "Redux", "Zustand", "Vite",
    "Jest", "Playwright"
];

/* -------------------- state + validation -------------------- */
const DRAFT_KEY = "submissionForm_draft_v1";
const SUBMIT_KEY = "submissionForm_submissions_v1";

const initialForm = {
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    country: "IN",
    state: "",
    city: "",
    address: "",
    pin: "",
    website: "",
    github: "",
    linkedin: "",
    skills: [],
    preferredContact: "email",
    availability: "full-time",
    portfolio: "",
    summary: "",
    terms: false,
};

const limits = {
    fullNameMin: 3,
    addressMin: 10,
    summaryMin: 50,
    summaryMax: 300,
};

function validateField(name, value, form) {
    const v = typeof value === "string" ? clean(value) : value;
    switch (name) {
        case "fullName":
            if (!v) return "Full name is required.";
            if (v.length < limits.fullNameMin) return `Full name must be at least ${limits.fullNameMin} characters.`;
            return "";
        case "email":
            if (!v) return "Email is required.";
            if (!isEmail(v)) return "Enter a valid email address.";
            return "";
        case "phone":
            if (!v) return "Phone is required.";
            if (!isINPhone(v)) return "Enter a valid 10-digit Indian mobile number.";
            return "";
        case "dob":
            if (!v) return "Date of birth is required.";
            if (!isAdult(v)) return "You must be at least 18 years old.";
            return "";
        case "country":
            if (!v) return "Country is required.";
            return "";
        case "state":
            if (!v) return "State is required.";
            return "";
        case "city":
            if (!v) return "City is required.";
            return "";
        case "address":
            if (!v) return "Address is required.";
            if (v.length < limits.addressMin) return `Address must be at least ${limits.addressMin} characters.`;
            return "";
        case "pin":
            if (!v) return "PIN code is required.";
            if (!isPin(v)) return "Enter a valid 6-digit PIN code.";
            return "";
        case "website":
            if (v && !isHttpUrl(v)) return "Website must start with http:// or https://";
            return "";
        case "github":
            if (v && !isHttpUrl(v)) return "GitHub URL must start with http:// or https://";
            return "";
        case "linkedin":
            if (v && !isHttpUrl(v)) return "LinkedIn URL must start with http:// or https://";
            return "";
        case "skills": {
            const count = (form.skills || []).length;
            if (count < 3) return "Pick at least 3 skills.";
            if (count > 8) return "Pick no more than 8 skills.";
            return "";
        }
        case "preferredContact":
            if (!v) return "Select a contact method.";
            return "";
        case "availability":
            if (!v) return "Select your availability.";
            return "";
        case "portfolio":
            if (v && !isHttpUrl(v)) return "Portfolio link must start with http:// or https://";
            return "";
        case "summary":
            if (!v) return "A short professional summary is required.";
            if (v.length < limits.summaryMin) return `Summary must be at least ${limits.summaryMin} characters.`;
            if (v.length > limits.summaryMax) return `Summary cannot exceed ${limits.summaryMax} characters.`;
            return "";
        case "terms":
            if (!v) return "You must agree to the terms to continue.";
            return "";
        default:
            return "";
    }
}

function validateAll(form) {
    const errors = {};
    Object.keys(form).forEach((k) => {
        const e = validateField(k, form[k], form);
        if (e) errors[k] = e;
    });
    return errors;
}

/* -------------------- component -------------------- */
const SubmissionForm = () => {
    const formRef = useRef(null);
    const [form, setForm] = useState(() => {
        try {
            const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
            return draft ? { ...initialForm, ...draft } : initialForm;
        } catch {
            return initialForm;
        }
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [resumeInfo, setResumeInfo] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const summaryCount = form.summary.length;
    const skillsCount = form.skills.length;
    const isSummaryOk = summaryCount >= limits.summaryMin && summaryCount <= limits.summaryMax;

    /* autosave */
    useEffect(() => {
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch { }
    }, [form]);

    /* cascades */
    const states = useMemo(() => STATES_BY_COUNTRY[form.country] || [], [form.country]);
    const cities = useMemo(() => CITIES_BY_STATE[form.state] || [], [form.state]);

    useEffect(() => {
        if (!states.includes(form.state)) {
            setForm((f) => ({ ...f, state: "", city: "" }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.country]);

    useEffect(() => {
        if (!cities.includes(form.city)) {
            setForm((f) => ({ ...f, city: "" }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.state]);

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

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox" && name === "terms") {
            setField("terms", !!checked);
            return;
        }
        if (type === "checkbox" && name === "skills") {
            setForm((f) => {
                const set = new Set(f.skills);
                if (checked) set.add(value); else set.delete(value);
                const next = { ...f, skills: Array.from(set) };
                setErrors((prev) => ({ ...prev, skills: validateField("skills", next.skills, next) }));
                return next;
            });
            return;
        }
        setField(name, value);
    };

    const onFileChange = (e) => {
        const { name, files } = e.target;
        const file = files && files[0];
        if (!file) return;

        if (name === "resume") {
            if (!ACCEPTED_RESUME.includes(file.type)) {
                setResumeInfo(null);
                setErrors((prev) => ({ ...prev, resume: "Upload a PDF/DOC/DOCX file." }));
                return;
            }
            if (file.size > 2 * MB) {
                setResumeInfo(null);
                setErrors((prev) => ({ ...prev, resume: "Resume must be under 2 MB." }));
                return;
            }
            setResumeInfo({ name: file.name, size: file.size });
            setErrors((prev) => ({ ...prev, resume: "" }));
            return;
        }

        if (name === "avatar") {
            if (!ACCEPTED_IMAGE.includes(file.type)) {
                setAvatarPreview(null);
                setErrors((prev) => ({ ...prev, avatar: "Upload JPG/PNG/WEBP image." }));
                return;
            }
            if (file.size > 1 * MB) {
                setAvatarPreview(null);
                setErrors((prev) => ({ ...prev, avatar: "Image must be under 1 MB." }));
                return;
            }
            const url = URL.createObjectURL(file);
            setAvatarPreview(url);
            setErrors((prev) => ({ ...prev, avatar: "" }));
        }
    };

    const clearDraft = () => {
        try { localStorage.removeItem(DRAFT_KEY); } catch { }
        setForm(initialForm);
        setErrors({});
        setTouched({});
        setResumeInfo(null);
        setAvatarPreview(null);
        toast?.info?.("Draft cleared");
    };

    const loadSample = () => {
        const example = {
            fullName: "Ashish Ranjan",
            email: "ashish@example.com",
            phone: "9876543210",
            dob: "1995-06-15",
            country: "IN",
            state: "Bihar",
            city: "Patna",
            address: "House 10, Gandhi Maidan Road, Patna",
            pin: "800001",
            website: "https://ashishranjan.in",
            github: "https://github.com/a2rp",
            linkedin: "https://linkedin.com/in/aashishranjan",
            skills: ["React", "Node.js", "MongoDB", "Styled-Components"],
            preferredContact: "email",
            availability: "full-time",
            portfolio: "https://a2rp.github.io",
            summary:
                "MERN-focused developer building production-grade, themeable dashboards and micro-apps. Strong on React (Vite + styled-components), Node/Express, and local-storage/MERN flows. Loves clean UX and print-ready designs.",
            terms: true,
        };
        setForm(example);
        setTouched({});
        setErrors(validateAll(example));
        toast?.info?.("Sample data loaded");
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const allErrors = validateAll(form);
        setErrors(allErrors);

        const hasErrors = Object.values(allErrors).some(Boolean);
        if (hasErrors) {
            // mark all touched and focus first error (only on submit)
            const t = {};
            Object.keys(form).forEach((k) => (t[k] = true));
            setTouched(t);

            // focus + scroll without causing global jumps on simple clicks
            requestAnimationFrame(() => {
                const firstKey = Object.keys(allErrors).find((k) => allErrors[k]);
                if (!firstKey) return;
                const el = formRef.current?.querySelector(`[name="${firstKey}"]`);
                if (!el) return;
                try {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    setTimeout(() => el.focus({ preventScroll: true }), 120);
                } catch {
                    el.focus();
                }
            });

            toast?.error?.("Fix errors before submitting");
            return;
        }

        // save submission
        try {
            const prev = JSON.parse(localStorage.getItem(SUBMIT_KEY) || "[]");
            const now = new Date();
            const record = {
                ...form,
                _meta: { createdAt: now.toISOString(), size: { resume: resumeInfo?.size || 0 } },
            };
            prev.unshift(record);
            localStorage.setItem(SUBMIT_KEY, JSON.stringify(prev));
            toast?.success?.("Submission saved locally");
        } catch {
            alert("Submission saved locally (fallback).");
        }

        // reset (keep country default)
        const keep = { country: form.country || "IN" };
        setForm({ ...initialForm, ...keep });
        setTouched({});
        setErrors({});
        setResumeInfo(null);
        setAvatarPreview(null);
        try { localStorage.removeItem(DRAFT_KEY); } catch { }
    };

    const errorCount = Object.values(errors).filter(Boolean).length;
    const isFormValid =
        errorCount === 0 &&
        Object.keys(form).every((k) => !validateField(k, form[k], form));

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div>
                    <h1>Submission Form</h1>
                    <p>All fields validated with live feedback. Draft auto-saves to your browser.</p>
                </div>
                <Styled.Badges>
                    <span className="badge">Autosave</span>
                    <span className="badge">Live Validation</span>
                    <span className="badge">2-Column Layout</span>
                </Styled.Badges>
            </Styled.Header>

            <Styled.Layout>
                <Styled.Card as="form" ref={formRef} onSubmit={onSubmit} noValidate>
                    {/* PERSONAL */}
                    <Styled.Section>
                        <Styled.SectionTitle>Personal</Styled.SectionTitle>
                        <Styled.Grid>
                            <Styled.Field invalid={touched.fullName && !!errors.fullName}>
                                <label htmlFor="fullName">Full Name <em>*</em></label>
                                <input
                                    id="fullName" name="fullName" type="text"
                                    value={form.fullName} onChange={onChange} onBlur={onBlur}
                                    placeholder="e.g., Ashish Ranjan"
                                    aria-invalid={!!(touched.fullName && errors.fullName)}
                                />
                                <Styled.Error role="alert">{touched.fullName && errors.fullName}</Styled.Error>
                            </Styled.Field>

                            <Styled.Field invalid={touched.dob && !!errors.dob}>
                                <label htmlFor="dob">Date of Birth <em>*</em></label>
                                <input
                                    id="dob" name="dob" type="date"
                                    value={form.dob} onChange={onChange} onBlur={onBlur}
                                    aria-invalid={!!(touched.dob && errors.dob)}
                                />
                                <Styled.Error role="alert">{touched.dob && errors.dob}</Styled.Error>
                            </Styled.Field>
                        </Styled.Grid>
                    </Styled.Section>

                    {/* CONTACT */}
                    <Styled.Section>
                        <Styled.SectionTitle>Contact</Styled.SectionTitle>
                        <Styled.Grid>
                            <Styled.Field invalid={touched.email && !!errors.email}>
                                <label htmlFor="email">Email <em>*</em></label>
                                <input
                                    id="email" name="email" type="email"
                                    value={form.email} onChange={onChange} onBlur={onBlur}
                                    placeholder="you@example.com"
                                    aria-invalid={!!(touched.email && errors.email)}
                                />
                                <Styled.Error role="alert">{touched.email && errors.email}</Styled.Error>
                            </Styled.Field>

                            <Styled.Field invalid={touched.phone && !!errors.phone}>
                                <label htmlFor="phone">Phone (India) <em>*</em></label>
                                <input
                                    id="phone" name="phone" type="tel"
                                    value={form.phone} onChange={onChange} onBlur={onBlur}
                                    placeholder="9876543210"
                                    aria-invalid={!!(touched.phone && errors.phone)}
                                />
                                <Styled.Error role="alert">{touched.phone && errors.phone}</Styled.Error>
                            </Styled.Field>

                            <Styled.Field invalid={touched.preferredContact && !!errors.preferredContact}>
                                <label>Preferred Contact <em>*</em></label>
                                <div className="inline">
                                    <label className="radio">
                                        <input
                                            type="radio" name="preferredContact" value="email"
                                            checked={form.preferredContact === "email"}
                                            onChange={onChange} onBlur={onBlur}
                                        />
                                        <span>Email</span>
                                    </label>
                                    <label className="radio">
                                        <input
                                            type="radio" name="preferredContact" value="phone"
                                            checked={form.preferredContact === "phone"}
                                            onChange={onChange} onBlur={onBlur}
                                        />
                                        <span>Phone</span>
                                    </label>
                                </div>
                                <Styled.Error role="alert">{touched.preferredContact && errors.preferredContact}</Styled.Error>
                            </Styled.Field>

                            <Styled.Field invalid={touched.availability && !!errors.availability}>
                                <label htmlFor="availability">Availability <em>*</em></label>
                                <select
                                    id="availability" name="availability"
                                    value={form.availability} onChange={onChange} onBlur={onBlur}
                                    aria-invalid={!!(touched.availability && errors.availability)}
                                >
                                    <option value="full-time">Full-time</option>
                                    <option value="part-time">Part-time</option>
                                    <option value="contract">Contract</option>
                                    <option value="internship">Internship</option>
                                </select>
                                <Styled.Error role="alert">{touched.availability && errors.availability}</Styled.Error>
                            </Styled.Field>
                        </Styled.Grid>
                    </Styled.Section>

                    {/* LOCATION */}
                    <Styled.Section>
                        <Styled.SectionTitle>Location</Styled.SectionTitle>
                        <Styled.Grid>
                            <Styled.Field invalid={touched.country && !!errors.country}>
                                <label htmlFor="country">Country <em>*</em></label>
                                <select
                                    id="country" name="country"
                                    value={form.country} onChange={onChange} onBlur={onBlur}
                                    aria-invalid={!!(touched.country && errors.country)}
                                >
                                    {COUNTRIES.map((c) => (
                                        <option key={c.code} value={c.code}>{c.label}</option>
                                    ))}
                                </select>
                                <Styled.Error role="alert">{touched.country && errors.country}</Styled.Error>
                            </Styled.Field>

                            <Styled.Field invalid={touched.state && !!errors.state}>
                                <label htmlFor="state">State <em>*</em></label>
                                <select
                                    id="state" name="state"
                                    value={form.state} onChange={onChange} onBlur={onBlur}
                                    aria-invalid={!!(touched.state && errors.state)}
                                >
                                    <option value="">Select state</option>
                                    {states.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <Styled.Error role="alert">{touched.state && errors.state}</Styled.Error>
                            </Styled.Field>

                            <Styled.Field invalid={touched.city && !!errors.city}>
                                <label htmlFor="city">City <em>*</em></label>
                                <select
                                    id="city" name="city"
                                    value={form.city} onChange={onChange} onBlur={onBlur}
                                    aria-invalid={!!(touched.city && errors.city)}
                                >
                                    <option value="">Select city</option>
                                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <Styled.Error role="alert">{touched.city && errors.city}</Styled.Error>
                            </Styled.Field>

                            <Styled.Field invalid={touched.pin && !!errors.pin}>
                                <label htmlFor="pin">PIN Code <em>*</em></label>
                                <input
                                    id="pin" name="pin" type="text" inputMode="numeric"
                                    value={form.pin} onChange={onChange} onBlur={onBlur}
                                    placeholder="6-digit"
                                    aria-invalid={!!(touched.pin && errors.pin)}
                                />
                                <Styled.Error role="alert">{touched.pin && errors.pin}</Styled.Error>
                            </Styled.Field>

                            <Styled.Field className="span2" invalid={touched.address && !!errors.address}>
                                <label htmlFor="address">Address <em>*</em></label>
                                <input
                                    id="address" name="address" type="text"
                                    value={form.address} onChange={onChange} onBlur={onBlur}
                                    placeholder="Street, Area, Landmark"
                                    aria-invalid={!!(touched.address && errors.address)}
                                />
                                <Styled.Error role="alert">{touched.address && errors.address}</Styled.Error>
                            </Styled.Field>
                        </Styled.Grid>
                    </Styled.Section>

                    {/* LINKS */}
                    <Styled.Section>
                        <Styled.SectionTitle>Links</Styled.SectionTitle>
                        <Styled.Grid>
                            <Styled.Field invalid={touched.website && !!errors.website}>
                                <label htmlFor="website">Website</label>
                                <input
                                    id="website" name="website" type="url"
                                    value={form.website} onChange={onChange} onBlur={onBlur}
                                    placeholder="https://..."
                                    aria-invalid={!!(touched.website && errors.website)}
                                />
                                <Styled.Error role="alert">{touched.website && errors.website}</Styled.Error>
                            </Styled.Field>

                            <Styled.Field invalid={touched.portfolio && !!errors.portfolio}>
                                <label htmlFor="portfolio">Portfolio</label>
                                <input
                                    id="portfolio" name="portfolio" type="url"
                                    value={form.portfolio} onChange={onChange} onBlur={onBlur}
                                    placeholder="https://..."
                                    aria-invalid={!!(touched.portfolio && errors.portfolio)}
                                />
                                <Styled.Error role="alert">{touched.portfolio && errors.portfolio}</Styled.Error>
                            </Styled.Field>

                            <Styled.Field invalid={touched.github && !!errors.github}>
                                <label htmlFor="github">GitHub</label>
                                <input
                                    id="github" name="github" type="url"
                                    value={form.github} onChange={onChange} onBlur={onBlur}
                                    placeholder="https://github.com/username"
                                    aria-invalid={!!(touched.github && errors.github)}
                                />
                                <Styled.Error role="alert">{touched.github && errors.github}</Styled.Error>
                            </Styled.Field>

                            <Styled.Field invalid={touched.linkedin && !!errors.linkedin}>
                                <label htmlFor="linkedin">LinkedIn</label>
                                <input
                                    id="linkedin" name="linkedin" type="url"
                                    value={form.linkedin} onChange={onChange} onBlur={onBlur}
                                    placeholder="https://linkedin.com/in/username"
                                    aria-invalid={!!(touched.linkedin && errors.linkedin)}
                                />
                                <Styled.Error role="alert">{touched.linkedin && errors.linkedin}</Styled.Error>
                            </Styled.Field>
                        </Styled.Grid>
                    </Styled.Section>

                    {/* SKILLS */}
                    <Styled.Section>
                        <Styled.SectionTitle>Skills <small>({skillsCount} selected)</small></Styled.SectionTitle>
                        <Styled.Chips invalid={touched.skills && !!errors.skills}>
                            {SKILLS.map((s) => {
                                const checked = form.skills.includes(s);
                                return (
                                    <label key={s} className={`chip ${checked ? "active" : ""}`}>
                                        <input
                                            type="checkbox" name="skills" value={s}
                                            checked={checked} onChange={onChange} onBlur={onBlur}
                                        />
                                        <span>{s}</span>
                                    </label>
                                );
                            })}
                        </Styled.Chips>
                        <Styled.Error role="alert" className="pad-top">
                            {touched.skills && errors.skills}
                        </Styled.Error>
                    </Styled.Section>

                    {/* FILES */}
                    <Styled.Section>
                        <Styled.SectionTitle>Files</Styled.SectionTitle>
                        <Styled.Grid>
                            <Styled.Field invalid={touched.resume && !!errors.resume}>
                                <label htmlFor="resume">Resume (PDF/DOC, &lt; 2MB)</label>
                                <input id="resume" name="resume" type="file" accept=".pdf,.doc,.docx"
                                    onChange={onFileChange} onBlur={onBlur} />
                                {resumeInfo && (
                                    <Styled.Help>
                                        {resumeInfo.name} — {(resumeInfo.size / MB).toFixed(2)} MB
                                    </Styled.Help>
                                )}
                                <Styled.Error role="alert">{touched.resume && errors.resume}</Styled.Error>
                            </Styled.Field>

                            <Styled.Field invalid={touched.avatar && !!errors.avatar}>
                                <label htmlFor="avatar">Profile Photo (JPG/PNG/WEBP, &lt; 1MB)</label>
                                <input id="avatar" name="avatar" type="file" accept="image/*"
                                    onChange={onFileChange} onBlur={onBlur} />
                                {avatarPreview && (
                                    <Styled.Preview>
                                        <img src={avatarPreview} alt="Avatar preview image" />
                                    </Styled.Preview>
                                )}
                                <Styled.Error role="alert">{touched.avatar && errors.avatar}</Styled.Error>
                            </Styled.Field>
                        </Styled.Grid>
                    </Styled.Section>

                    {/* SUMMARY */}
                    <Styled.Section>
                        <Styled.SectionTitle>Professional Summary</Styled.SectionTitle>
                        <Styled.Field className="span2" invalid={touched.summary && !!errors.summary}>
                            <label htmlFor="summary">Short summary <em>*</em></label>
                            <textarea
                                id="summary" name="summary" rows={5}
                                value={form.summary} onChange={onChange} onBlur={onBlur}
                                placeholder="What do you bring to the table? Keep it crisp."
                                aria-invalid={!!(touched.summary && errors.summary)}
                            />
                            <Styled.Counter ok={isSummaryOk}>
                                {summaryCount}/{limits.summaryMax}
                            </Styled.Counter>
                            <Styled.Error role="alert">{touched.summary && errors.summary}</Styled.Error>
                        </Styled.Field>

                        <Styled.Field className="span2 terms" invalid={touched.terms && !!errors.terms}>
                            <label className="checkbox">
                                <input
                                    type="checkbox" name="terms"
                                    checked={form.terms} onChange={onChange} onBlur={onBlur}
                                />
                                <span>I confirm that the above details are accurate. <em>*</em></span>
                            </label>
                            <Styled.Error role="alert">{touched.terms && errors.terms}</Styled.Error>
                        </Styled.Field>
                    </Styled.Section>

                    {/* ACTIONS */}
                    <Styled.Actions>
                        <button type="button" className="ghost" onClick={loadSample}>Load Sample</button>
                        <button type="button" className="ghost" onClick={clearDraft}>Clear Draft</button>
                        <div className="spacer" />
                        <button type="submit" disabled={!isFormValid}>Submit</button>
                    </Styled.Actions>
                </Styled.Card>

                {/* RIGHT PANEL */}
                <Styled.Side>
                    <Styled.Card>
                        <h3>Live Status</h3>
                        <ul className="status">
                            {[
                                ["Full Name", !errors.fullName && form.fullName],
                                ["DOB", !errors.dob && form.dob],
                                ["Email", !errors.email && form.email],
                                ["Phone", !errors.phone && form.phone],
                                ["Country", !errors.country && form.country],
                                ["State", !errors.state && form.state],
                                ["City", !errors.city && form.city],
                                ["PIN", !errors.pin && form.pin],
                                ["Skills (≥3)", !errors.skills && form.skills.length >= 3],
                                ["Summary", isSummaryOk],
                                ["Terms", !!form.terms],
                            ].map(([label, ok]) => (
                                <li key={label} className={ok ? "ok" : "no"}>
                                    <span className="dot" /> {label}
                                </li>
                            ))}
                        </ul>
                        <Styled.Divider />
                        <p className="muted">Errors: <strong>{Object.values(errors).filter(Boolean).length}</strong></p>
                    </Styled.Card>

                    <Styled.Card>
                        <h3>Tips</h3>
                        <ul className="tips">
                            <li>Ctrl/Cmd + K to open global search (if enabled).</li>
                            <li>Use <em>Load Sample</em> to see a valid example quickly.</li>
                            <li>Everything stays in your browser (localStorage).</li>
                        </ul>
                    </Styled.Card>
                </Styled.Side>
            </Styled.Layout>
        </Styled.Wrapper>
    );
};

export default SubmissionForm;

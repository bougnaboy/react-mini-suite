import React, { useEffect, useRef, useState } from "react";
import { Styled, GlobalPrint } from "./styled";

/**
 * Personal Portfolio
 * - Form → Portfolio & Resume previews.
 * - Save as PDF prints only the active preview (not the whole page).
 * - Photo: local file upload (compressed, stored as data URL in localStorage).
 */

const STORAGE_KEY = "personalPortfolioForm_v2";

const blankForm = {
    fullName: "Ashish Ranjan",
    title: "Full-stack JavaScript Developer",
    location: "Bengaluru, IN",
    email: "ashish@ashishranjan.net",
    phone: "",
    website: "https://ashishranjan.net",
    github: "https://github.com/a2rp",
    linkedin: "",
    summary:
        "I build clean, single-focus tools that solve real problems. Strong on React, Node/Express, and shipping fast with polish.",
    // local image (data URL)
    photoData: "",

    skillsCsv:
        "React (Vite), Styled-Components, Node/Express, MongoDB, HTML/SCSS/JS, GitHub Pages, Netlify/Cloudflare, LLM/AI (experiments)",

    projectsText: [
        "UPI QR Styled | Logo overlay, presets | /upi-qr-styled",
        "Shop Billing (Lite) | Fast line items + print | /shop-billing",
        "Daily Focus Planner | Half-hour blocks, printable | /daily-focus-planner",
        "Attendance Tracker (Lite) | Per-subject %, alerts | /attendance-tracker-lite",
        "Smart Timetable | Period grid | /smart-timetable",
        "Rate Card | Service price card | /rate-card",
    ].join("\n"),

    experienceText: [
        "Senior Frontend @ Freelance | 2016 - Present | Built 50+ focused tools; Shipped real-world UIs for schools, gyms, shops",
    ].join("\n"),

    educationText: "B.Tech (CSE) | XYZ University | 2014",

    achievementsText: "Top projects trending in local network; OSS contributions across multiple repos",
};

function parseCsvList(csv) {
    return csv.split(",").map((x) => x.trim()).filter(Boolean);
}
function parseProjects(multiline) {
    return multiline
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((row) => {
            const [title, note, link] = row.split("|").map((x) => (x || "").trim());
            return { title, note, link };
        });
}
function parseExperience(multiline) {
    return multiline
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((row) => {
            const [headline, period, bulletsLine] = row.split("|").map((x) => (x || "").trim());
            const bullets = (bulletsLine || "")
                .split(";")
                .map((b) => b.trim())
                .filter(Boolean);
            return { headline, period, bullets };
        });
}
function parseEducation(multiline) {
    return multiline
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((row) => {
            const [degree, institute, year] = row.split("|").map((x) => (x || "").trim());
            return { degree, institute, year };
        });
}

// Compress image to a reasonable size for storage/print
async function fileToDataUrlCompressed(file, maxSide = 512, quality = 0.9) {
    const dataUrl = await new Promise((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result);
        fr.onerror = rej;
        fr.readAsDataURL(file);
    });

    // If it's not an image, return original data URL
    if (!String(file.type).startsWith("image/")) return dataUrl;

    const img = await new Promise((res, rej) => {
        const image = new Image();
        image.onload = () => res(image);
        image.onerror = rej;
        image.src = dataUrl;
    });

    const { width, height } = img;
    const scale = Math.min(1, maxSide / Math.max(width, height));
    const outW = Math.max(1, Math.round(width * scale));
    const outH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, outW, outH);

    // Prefer JPEG to reduce size; Word/PDF print looks fine
    return canvas.toDataURL("image/jpeg", quality);
}

const PersonalPortfolio = () => {
    const [form, setForm] = useState(blankForm);
    const [activeView, setActiveView] = useState("portfolio"); // 'portfolio' | 'resume'
    const [printTarget, setPrintTarget] = useState(null); // 'portfolio' | 'resume' | null

    const portfolioRef = useRef(null);
    const resumeRef = useRef(null);

    // load/save
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setForm((p) => ({ ...p, ...JSON.parse(raw) }));
        } catch { }
    }, []);
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
        } catch { }
    }, [form]);

    useEffect(() => {
        const reset = () => setPrintTarget(null);
        window.addEventListener("afterprint", reset);
        return () => window.removeEventListener("afterprint", reset);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };

    const handlePhoto = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const dataUrl = await fileToDataUrlCompressed(file, 600, 0.92);
            setForm((p) => ({ ...p, photoData: dataUrl }));
        } catch {
            // ignore
        }
    };

    const removePhoto = () => setForm((p) => ({ ...p, photoData: "" }));

    const skills = parseCsvList(form.skillsCsv);
    const projects = parseProjects(form.projectsText);
    const experience = parseExperience(form.experienceText);
    const education = parseEducation(form.educationText);
    const achievements = parseCsvList(form.achievementsText);

    const handlePrint = () => {
        setPrintTarget(activeView);
        setTimeout(() => window.print(), 50);
    };

    return (
        <>
            <GlobalPrint />
            <Styled.Wrapper>
                <Styled.Header>
                    <div className="title">
                        <h1>Personal Portfolio</h1>
                        <p className="muted">Fill details → generate Portfolio & Resume → Save as PDF (prints only selected)</p>
                    </div>

                    <Styled.Actions>
                        <select
                            aria-label="View"
                            value={activeView}
                            onChange={(e) => setActiveView(e.target.value)}
                        >
                            <option value="portfolio">Portfolio</option>
                            <option value="resume">Resume</option>
                        </select>

                        <button className="btn" onClick={handlePrint} title="Save as PDF">
                            Save as PDF
                        </button>
                    </Styled.Actions>
                </Styled.Header>

                <Styled.Layout>
                    <Styled.FormCard>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="row">
                                <label>Full Name</label>
                                <input name="fullName" value={form.fullName} onChange={handleChange} />
                            </div>

                            <div className="row two">
                                <div>
                                    <label>Title</label>
                                    <input name="title" value={form.title} onChange={handleChange} />
                                </div>
                                <div>
                                    <label>Location</label>
                                    <input name="location" value={form.location} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="row two">
                                <div>
                                    <label>Email</label>
                                    <input name="email" value={form.email} onChange={handleChange} />
                                </div>
                                <div>
                                    <label>Phone</label>
                                    <input name="phone" value={form.phone} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="row">
                                <label>Website</label>
                                <input name="website" value={form.website} onChange={handleChange} />
                            </div>

                            <div className="row two">
                                <div>
                                    <label>GitHub</label>
                                    <input name="github" value={form.github} onChange={handleChange} />
                                </div>
                                <div>
                                    <label>LinkedIn</label>
                                    <input name="linkedin" value={form.linkedin} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="row">
                                <label>Photo (local file)</label>
                                <div className="photoRow">
                                    <input type="file" accept="image/*" onChange={handlePhoto} />
                                    {form.photoData ? (
                                        <>
                                            <img className="mini" alt="preview" src={form.photoData} />
                                            <button type="button" className="btn ghost" onClick={removePhoto}>
                                                Remove
                                            </button>
                                        </>
                                    ) : null}
                                </div>
                            </div>

                            <div className="row">
                                <label>Summary</label>
                                <textarea name="summary" rows={3} value={form.summary} onChange={handleChange} />
                            </div>

                            <div className="row">
                                <label>Skills (comma separated)</label>
                                <input name="skillsCsv" value={form.skillsCsv} onChange={handleChange} />
                            </div>

                            <div className="row">
                                <label>Projects (one per line: title | note | link)</label>
                                <textarea name="projectsText" rows={6} value={form.projectsText} onChange={handleChange} />
                            </div>

                            <div className="row">
                                <label>Experience (one per line: role @ company | period | bullet1; bullet2)</label>
                                <textarea name="experienceText" rows={5} value={form.experienceText} onChange={handleChange} />
                            </div>

                            <div className="row">
                                <label>Education (one per line: degree | institute | year)</label>
                                <textarea name="educationText" rows={3} value={form.educationText} onChange={handleChange} />
                            </div>

                            <div className="row">
                                <label>Achievements (comma separated)</label>
                                <input name="achievementsText" value={form.achievementsText} onChange={handleChange} />
                            </div>

                            <div className="row end">
                                <button
                                    className="btn ghost"
                                    type="button"
                                    onClick={() => setForm(blankForm)}
                                    title="Reset to sample"
                                >
                                    Reset sample
                                </button>
                                <button
                                    className="btn"
                                    type="button"
                                    onClick={() => { }}
                                    title="Update preview"
                                >
                                    Update preview
                                </button>
                            </div>
                        </form>
                    </Styled.FormCard>

                    <Styled.PreviewArea>
                        {/* PORTFOLIO */}
                        <Styled.Paper
                            ref={portfolioRef}
                            data-kind="portfolio"
                            data-print={printTarget === "portfolio"}
                            hidden={activeView !== "portfolio"}
                        >
                            <header className="paper-head">
                                <div className="who">
                                    <h1>{form.fullName}</h1>
                                    <p>{form.title}</p>
                                    <p className="muted">{form.location}</p>
                                </div>
                                {form.photoData ? (
                                    <img className="avatar" src={form.photoData} alt={form.fullName} />
                                ) : null}
                            </header>

                            <section className="card">
                                <p>{form.summary}</p>
                                <div className="tags">
                                    {skills.map((s) => (
                                        <span className="tag" key={s}>{s}</span>
                                    ))}
                                </div>
                            </section>

                            <section className="card">
                                <h2>Selected Projects</h2>
                                <div className="grid">
                                    {projects.map((p) => (
                                        <article className="proj" key={p.title}>
                                            <h3>{p.title}</h3>
                                            <p className="muted">{p.note}</p>
                                            {p.link ? (
                                                p.link.startsWith("/")
                                                    ? <a href={p.link} title={p.title}>Open</a>
                                                    : <a href={p.link} target="_blank" rel="noreferrer" title={p.title}>Open</a>
                                            ) : null}
                                        </article>
                                    ))}
                                </div>
                            </section>

                            <section className="card">
                                <h2>Links</h2>
                                <ul className="plain">
                                    {form.website && <li><a href={form.website} target="_blank" rel="noreferrer">Website</a></li>}
                                    {form.github && <li><a href={form.github} target="_blank" rel="noreferrer">GitHub</a></li>}
                                    {form.linkedin && <li><a href={form.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>}
                                    {form.email && <li><a href={`mailto:${form.email}`}>{form.email}</a></li>}
                                    {form.phone && <li>{form.phone}</li>}
                                </ul>
                            </section>
                        </Styled.Paper>

                        {/* RESUME */}
                        <Styled.Paper
                            ref={resumeRef}
                            data-kind="resume"
                            data-print={printTarget === "resume"}
                            hidden={activeView !== "resume"}
                        >
                            <header className="paper-head">
                                <div className="who">
                                    <h1>{form.fullName}</h1>
                                    <p>{form.title}</p>
                                    <p className="muted">
                                        {form.location} • {form.email} {form.phone ? `• ${form.phone}` : ""} {form.website ? `• ${form.website}` : ""}
                                    </p>
                                </div>
                                {form.photoData ? (
                                    <img className="avatar" src={form.photoData} alt={form.fullName} />
                                ) : null}
                            </header>

                            <section>
                                <h2>Summary</h2>
                                <p>{form.summary}</p>
                            </section>

                            <section>
                                <h2>Skills</h2>
                                <div className="tags">
                                    {skills.map((s) => (
                                        <span className="tag" key={s}>{s}</span>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h2>Experience</h2>
                                {experience.map((exp, idx) => (
                                    <article key={idx} className="exp">
                                        <h3>{exp.headline}</h3>
                                        <p className="muted">{exp.period}</p>
                                        {exp.bullets?.length ? (
                                            <ul>
                                                {exp.bullets.map((b, i) => <li key={i}>{b}</li>)}
                                            </ul>
                                        ) : null}
                                    </article>
                                ))}
                            </section>

                            <section>
                                <h2>Projects</h2>
                                <ul>
                                    {projects.map((p) => (
                                        <li key={p.title}>
                                            <strong>{p.title}:</strong> {p.note} {p.link ? (<em>— {p.link}</em>) : null}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section className="two-col">
                                <div>
                                    <h2>Education</h2>
                                    {education.map((e, i) => (
                                        <p key={i}><strong>{e.degree}</strong>, {e.institute} — {e.year}</p>
                                    ))}
                                </div>
                                <div>
                                    <h2>Achievements</h2>
                                    <ul>
                                        {achievements.map((a, i) => <li key={i}>{a}</li>)}
                                    </ul>
                                </div>
                            </section>
                        </Styled.Paper>
                    </Styled.PreviewArea>
                </Styled.Layout>

                <Styled.PrintNote aria-hidden data-active={!!printTarget}>
                    Printing only: {printTarget || "-"}
                </Styled.PrintNote>
            </Styled.Wrapper>
        </>
    );
};

export default PersonalPortfolio;

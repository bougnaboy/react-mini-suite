import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/* =========================================================
   Utils
   ========================================================= */
const CF_KEY = "crowdfunding_projects_v1";
const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function formatIST(iso) {
    try {
        const d = new Date(iso);
        const parts = new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
            timeZone: "Asia/Kolkata",
        }).formatToParts(d);
        const get = (t) => parts.find((p) => p.type === t)?.value || "";
        return `${get("month")} ${get("day")}, ${get("year")} ${get("hour")}:${get("minute")}:${get("second")} hrs`;
    } catch { return ""; }
}

const isHttpUrl = (v) => /^(https?:\/\/)/i.test(v || "");
const isFutureDate = (v) => {
    const d = new Date(v);
    const now = new Date();
    return d.toString() !== "Invalid Date" && d.getTime() > now.getTime();
};
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

/* =========================================================
   Sample Seed
   ========================================================= */
function seedProjectsIfEmpty() {
    try {
        const existing = JSON.parse(localStorage.getItem(CF_KEY) || "[]");
        if (existing.length) return existing;
    } catch { }
    const now = new Date();
    const days = (n) => new Date(now.getTime() + n * 86400000).toISOString();

    const seed = [
        {
            id: uid(),
            title: "Community Library Revamp",
            description: "Upgrade shelves, add kids corner, and digitize 2,000+ books for public access.",
            category: "Community",
            goal: 250000,
            deadline: days(20),
            image: "",
            createdAt: now.toISOString(),
            pledges: [
                { id: uid(), name: "Ashish", amount: 5000, message: "Books + kids = ❤️", createdAt: days(-1) },
                { id: uid(), name: "Neha", amount: 12000, message: "For the reading nook!", createdAt: days(-1) },
            ],
            archived: false,
        },
        {
            id: uid(),
            title: "Open-Source Tooling Fund",
            description: "Sponsor tests, docs, and DX enhancements for a suite of React utilities.",
            category: "Technology",
            goal: 180000,
            deadline: days(10),
            image: "",
            createdAt: now.toISOString(),
            pledges: [
                { id: uid(), name: "Dev Patel", amount: 9000, message: "Ship it.", createdAt: days(-2) },
            ],
            archived: false,
        },
        {
            id: uid(),
            title: "School STEM Lab",
            description: "Robotics kits, 3D printer, and sensors to power hands-on STEM learning.",
            category: "Education",
            goal: 400000,
            deadline: days(35),
            image: "",
            createdAt: now.toISOString(),
            pledges: [],
            archived: false,
        },
    ];
    try { localStorage.setItem(CF_KEY, JSON.stringify(seed)); } catch { }
    return seed;
}

/* =========================================================
   Derived helpers
   ========================================================= */
function calcRaised(project) {
    return (project.pledges || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
}

function projectStatus(project) {
    const now = Date.now();
    const end = new Date(project.deadline).getTime();
    const raised = calcRaised(project);
    if (raised >= project.goal) return "Funded";
    if (end < now) return "Ended";
    const daysLeft = Math.ceil((end - now) / 86400000);
    if (daysLeft <= 5) return "Ending Soon";
    return "Active";
}

/* =========================================================
   Component
   ========================================================= */
const CrowdfundingApp = () => {
    const [projects, setProjects] = useState(() => seedProjectsIfEmpty());
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [status, setStatus] = useState("All");
    const [sort, setSort] = useState("Newest");
    const [modal, setModal] = useState(null); // {type, payload}

    // new project form
    const [form, setForm] = useState({
        title: "", description: "", category: "", goal: "", deadline: "", image: "",
    });
    const [touched, setTouched] = useState({});
    const [errors, setErrors] = useState({});

    // per-project pledge form states
    const [pledgeForms, setPledgeForms] = useState({}); // id -> {name, amount, message, touched, errors}

    // persist
    useEffect(() => {
        try { localStorage.setItem(CF_KEY, JSON.stringify(projects)); } catch { }
    }, [projects]);

    const categories = useMemo(() => {
        const set = new Set(["Community", "Education", "Technology", "Health", "Arts"]);
        projects.forEach(p => p.category && set.add(p.category));
        return ["All", ...Array.from(set)];
    }, [projects]);

    // stats
    const stats = useMemo(() => {
        const total = projects.length;
        const totalRaised = projects.reduce((s, p) => s + calcRaised(p), 0);
        const totalGoal = projects.reduce((s, p) => s + (Number(p.goal) || 0), 0) || 1;
        const progressAvg = Math.round((totalRaised / totalGoal) * 100);
        const backers = new Set();
        projects.forEach(p => (p.pledges || []).forEach(pl => backers.add(pl.name || "Anonymous")));
        return { total, totalRaised, progressAvg, backers: backers.size };
    }, [projects]);

    // filters
    const list = useMemo(() => {
        let arr = [...projects];

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            arr = arr.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q)
            );
        }

        if (category !== "All") {
            arr = arr.filter(p => p.category === category);
        }

        if (status !== "All") {
            arr = arr.filter(p => projectStatus(p) === status);
        }

        switch (sort) {
            case "Ending Soon":
                arr.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
                break;
            case "Amount Raised":
                arr.sort((a, b) => calcRaised(b) - calcRaised(a));
                break;
            case "Goal":
                arr.sort((a, b) => b.goal - a.goal);
                break;
            case "Progress":
                arr.sort((a, b) => (calcRaised(b) / b.goal) - (calcRaised(a) / a.goal));
                break;
            default: // Newest
                arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return arr;
    }, [projects, search, category, status, sort]);

    /* -------------------- Validation -------------------- */
    function validateNew(fieldName, value, f = form) {
        const v = typeof value === "string" ? value.trim() : value;
        switch (fieldName) {
            case "title":
                if (!v) return "Title is required.";
                if (v.length < 3) return "Title must be at least 3 characters.";
                return "";
            case "description":
                if (!v) return "Description is required.";
                if (v.length < 20) return "Description should be at least 20 characters.";
                return "";
            case "category":
                if (!v) return "Category is required.";
                return "";
            case "goal": {
                const n = Number(v);
                if (!v) return "Goal is required.";
                if (!Number.isFinite(n) || n <= 0) return "Goal must be a positive number.";
                if (n < 1000) return "Keep a sensible minimum (≥ 1,000).";
                return "";
            }
            case "deadline":
                if (!v) return "Deadline is required.";
                if (!isFutureDate(v)) return "Deadline must be a future date.";
                return "";
            case "image":
                if (v && !isHttpUrl(v)) return "Image URL must start with http:// or https://";
                return "";
            default: return "";
        }
    }

    function validateAllNew(f = form) {
        const e = {};
        Object.keys(f).forEach((k) => {
            const msg = validateNew(k, f[k], f);
            if (msg) e[k] = msg;
        });
        return e;
    }

    /* -------------------- Handlers: New Project -------------------- */
    const onNewChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => {
            const next = { ...prev, [name]: value };
            setErrors((er) => ({ ...er, [name]: validateNew(name, value, next) }));
            return next;
        });
    };

    const onNewBlur = (e) => {
        const { name } = e.target;
        setTouched((t) => ({ ...t, [name]: true }));
        setErrors((er) => ({ ...er, [name]: validateNew(name, form[name]) }));
    };

    const addProject = (e) => {
        e.preventDefault();
        const eAll = validateAllNew(form);
        setErrors(eAll);
        const hasErrors = Object.values(eAll).some(Boolean);
        if (hasErrors) {
            // focus first error
            const key = Object.keys(eAll).find((k) => eAll[k]);
            const el = document.querySelector(`[name="${key}"]`);
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
            setTimeout(() => el?.focus({ preventScroll: true }), 100);
            return;
        }

        const p = {
            id: uid(),
            title: form.title.trim(),
            description: form.description.trim(),
            category: form.category.trim(),
            goal: Number(form.goal),
            deadline: new Date(form.deadline).toISOString(),
            image: form.image.trim(),
            createdAt: new Date().toISOString(),
            pledges: [],
            archived: false,
        };
        setProjects((arr) => [p, ...arr]);
        setForm({ title: "", description: "", category: "", goal: "", deadline: "", image: "" });
        setTouched({});
        setErrors({});
    };

    /* -------------------- Pledge per project -------------------- */
    const getPledgeForm = (id) => pledgeForms[id] || { name: "", amount: "", message: "", touched: {}, errors: {} };

    const validatePledge = (field, value, pf) => {
        const v = typeof value === "string" ? value.trim() : value;
        switch (field) {
            case "name":
                if (!v) return "Name is required.";
                if (v.length < 2) return "Name too short.";
                return "";
            case "amount": {
                const n = Number(v);
                if (!v) return "Amount is required.";
                if (!Number.isFinite(n) || n <= 0) return "Enter a positive amount.";
                if (n < 100) return "Minimum pledge is 100.";
                return "";
            }
            case "message":
                if (v && v.length > 180) return "Keep message under 180 chars.";
                return "";
            default: return "";
        }
    };

    const setPledgeField = (id, name, value) => {
        setPledgeForms((prev) => {
            const curr = getPledgeForm(id);
            const next = {
                ...curr,
                [name]: value,
                errors: { ...curr.errors, [name]: validatePledge(name, value, curr) },
            };
            return { ...prev, [id]: next };
        });
    };

    const pledgeBlur = (id, name) => {
        setPledgeForms((prev) => {
            const curr = getPledgeForm(id);
            const next = {
                ...curr,
                touched: { ...curr.touched, [name]: true },
                errors: { ...curr.errors, [name]: validatePledge(name, curr[name], curr) },
            };
            return { ...prev, [id]: next };
        });
    };

    const submitPledge = (id, e) => {
        e.preventDefault();
        const pf = getPledgeForm(id);
        const fields = ["name", "amount", "message"];
        const errs = {};
        fields.forEach((f) => {
            const msg = validatePledge(f, pf[f], pf);
            if (msg) errs[f] = msg;
        });

        if (Object.values(errs).some(Boolean)) {
            setPledgeForms((prev) => ({ ...prev, [id]: { ...pf, errors: errs, touched: { name: true, amount: true, message: true } } }));
            const key = Object.keys(errs).find((k) => errs[k]);
            const el = document.querySelector(`#pledge-${id}-${key}`);
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
            setTimeout(() => el?.focus({ preventScroll: true }), 100);
            return;
        }

        const pledge = {
            id: uid(),
            name: pf.name.trim(),
            amount: Number(pf.amount),
            message: pf.message.trim(),
            createdAt: new Date().toISOString(),
        };

        setProjects((arr) =>
            arr.map((p) => (p.id === id ? { ...p, pledges: [pledge, ...(p.pledges || [])] } : p))
        );
        setPledgeForms((prev) => ({ ...prev, [id]: { name: "", amount: "", message: "", touched: {}, errors: {} } }));
    };

    /* -------------------- Mutations -------------------- */
    const askClearAll = () => setModal({ type: "clearAll" });
    const clearAll = () => {
        setProjects([]);
        setModal(null);
    };

    const askDeleteProject = (proj) => setModal({ type: "deleteProject", payload: proj });
    const deleteProject = () => {
        const proj = modal?.payload;
        if (!proj) return setModal(null);
        setProjects((arr) => arr.filter((p) => p.id !== proj.id));
        setModal(null);
    };

    const askRemovePledge = (proj, pledge) => setModal({ type: "removePledge", payload: { proj, pledge } });
    const removePledge = () => {
        const { proj, pledge } = modal?.payload || {};
        if (!proj || !pledge) return setModal(null);
        setProjects((arr) =>
            arr.map((p) => (p.id === proj.id ? { ...p, pledges: (p.pledges || []).filter((pl) => pl.id !== pledge.id) } : p))
        );
        setModal(null);
    };

    const toggleArchive = (proj) => {
        setProjects((arr) =>
            arr.map((p) => (p.id === proj.id ? { ...p, archived: !p.archived } : p))
        );
    };

    /* -------------------- Render helpers -------------------- */
    const progressPct = (p) => clamp(Math.round((calcRaised(p) / (p.goal || 1)) * 100), 0, 999);

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div>
                    <h1>Crowdfunding App</h1>
                    <p>Create projects with goals, accept pledges, and track progress. Everything stays in your browser.</p>
                </div>
                <Styled.HeaderActions>
                    <button className="ghost" onClick={askClearAll} disabled={!projects.length}>Clear All</button>
                </Styled.HeaderActions>
            </Styled.Header>

            {/* Stats */}
            <Styled.Stats>
                <Styled.Stat>
                    <span className="label">Projects</span>
                    <span className="value">{stats.total}</span>
                </Styled.Stat>
                <Styled.Stat>
                    <span className="label">Backers</span>
                    <span className="value">{stats.backers}</span>
                </Styled.Stat>
                <Styled.Stat>
                    <span className="label">Raised</span>
                    <span className="value">{INR.format(stats.totalRaised)}</span>
                </Styled.Stat>
                <Styled.Stat>
                    <span className="label">Avg Progress</span>
                    <span className="value">{stats.progressAvg}%</span>
                </Styled.Stat>
            </Styled.Stats>

            <Styled.Layout>
                {/* New Project */}
                <Styled.Card as="form" onSubmit={addProject} noValidate>
                    <Styled.SectionTitle>New Project</Styled.SectionTitle>
                    <Styled.Grid>
                        <Styled.Field invalid={touched.title && !!errors.title}>
                            <label htmlFor="title">Title <em>*</em></label>
                            <input id="title" name="title" value={form.title} onChange={onNewChange} onBlur={onNewBlur} placeholder="Community Library Revamp" />
                            <Styled.Error>{touched.title && errors.title}</Styled.Error>
                        </Styled.Field>

                        <Styled.Field invalid={touched.category && !!errors.category}>
                            <label htmlFor="category">Category <em>*</em></label>
                            <select id="category" name="category" value={form.category} onChange={onNewChange} onBlur={onNewBlur}>
                                <option value="">Select</option>
                                <option>Community</option>
                                <option>Education</option>
                                <option>Technology</option>
                                <option>Health</option>
                                <option>Arts</option>
                            </select>
                            <Styled.Error>{touched.category && errors.category}</Styled.Error>
                        </Styled.Field>

                        <Styled.Field className="span2" invalid={touched.description && !!errors.description}>
                            <label htmlFor="description">Description <em>*</em></label>
                            <textarea id="description" name="description" rows={4} value={form.description} onChange={onNewChange} onBlur={onNewBlur} placeholder="What is this project about? Who benefits? What impact?" />
                            <Styled.Error>{touched.description && errors.description}</Styled.Error>
                        </Styled.Field>

                        <Styled.Field invalid={touched.goal && !!errors.goal}>
                            <label htmlFor="goal">Goal (INR) <em>*</em></label>
                            <input id="goal" name="goal" type="number" inputMode="numeric" value={form.goal} onChange={onNewChange} onBlur={onNewBlur} placeholder="100000" />
                            <Styled.Error>{touched.goal && errors.goal}</Styled.Error>
                        </Styled.Field>

                        <Styled.Field invalid={touched.deadline && !!errors.deadline}>
                            <label htmlFor="deadline">Deadline <em>*</em></label>
                            <input id="deadline" name="deadline" type="date" value={form.deadline} onChange={onNewChange} onBlur={onNewBlur} />
                            <Styled.Error>{touched.deadline && errors.deadline}</Styled.Error>
                        </Styled.Field>

                        <Styled.Field className="span2" invalid={touched.image && !!errors.image}>
                            <label htmlFor="image">Image URL</label>
                            <input id="image" name="image" value={form.image} onChange={onNewChange} onBlur={onNewBlur} placeholder="https://..." />
                            <Styled.Error>{touched.image && errors.image}</Styled.Error>
                        </Styled.Field>
                    </Styled.Grid>

                    <Styled.Actions>
                        <div className="spacer" />
                        <button type="submit">Add Project</button>
                    </Styled.Actions>
                </Styled.Card>

                {/* Browse / List */}
                <div>
                    <Styled.Toolbar>
                        <input
                            className="search"
                            placeholder="Search projects…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={status} onChange={(e) => setStatus(e.target.value)}>
                            {["All", "Active", "Ending Soon", "Funded", "Ended"].map((s) => <option key={s}>{s}</option>)}
                        </select>
                        <select value={sort} onChange={(e) => setSort(e.target.value)}>
                            {["Newest", "Ending Soon", "Amount Raised", "Goal", "Progress"].map((s) => <option key={s}>{s}</option>)}
                        </select>
                    </Styled.Toolbar>

                    <Styled.List>
                        {list.map((p) => {
                            const raised = calcRaised(p);
                            const pct = progressPct(p);
                            const stat = projectStatus(p);
                            const daysLeft = Math.max(0, Math.ceil((new Date(p.deadline) - new Date()) / 86400000));

                            const pf = getPledgeForm(p.id);
                            const pfErr = pf.errors || {};
                            const pfTouch = pf.touched || {};

                            return (
                                <Styled.Card key={p.id}>
                                    <Styled.ProjectHeader>
                                        <div className="titleArea">
                                            <h3>{p.title}</h3>
                                            <div className="meta">
                                                <span className="tag">{p.category || "General"}</span>
                                                <span className={`status ${stat.replace(" ", "").toLowerCase()}`}>{stat}</span>
                                                {p.archived && <span className="archived">Archived</span>}
                                            </div>
                                        </div>
                                        <div className="actions">
                                            <button className="ghost" onClick={() => toggleArchive(p)}>{p.archived ? "Unarchive" : "Archive"}</button>
                                            <button className="danger" onClick={() => askDeleteProject(p)}>Delete</button>
                                        </div>
                                    </Styled.ProjectHeader>

                                    <Styled.ProjectBody>
                                        <Styled.ProjectMedia>
                                            {p.image ? (
                                                <img src={p.image} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                                            ) : (
                                                <div className="placeholder" />
                                            )}
                                        </Styled.ProjectMedia>

                                        <Styled.ProjectMain>
                                            <p className="desc">{p.description}</p>

                                            <Styled.Progress>
                                                <div className="bar">
                                                    <div className="fill" style={{ width: `${pct}%` }} />
                                                </div>
                                                <div className="labels">
                                                    <span>{INR.format(raised)} raised</span>
                                                    <span>{pct}%</span>
                                                    <span>Goal: {INR.format(p.goal)}</span>
                                                </div>
                                            </Styled.Progress>

                                            <Styled.RowInfo>
                                                <div><strong>Deadline:</strong> {new Date(p.deadline).toDateString()} ({daysLeft} days)</div>
                                                <div><strong>Created:</strong> {formatIST(p.createdAt)}</div>
                                            </Styled.RowInfo>

                                            {/* Pledge form */}
                                            {!p.archived && stat !== "Ended" && (
                                                <Styled.Pledge onSubmit={(e) => submitPledge(p.id, e)} noValidate>
                                                    <div className="grid">
                                                        <Styled.Field invalid={pfTouch.name && !!pfErr.name}>
                                                            <label htmlFor={`pledge-${p.id}-name`}>Name <em>*</em></label>
                                                            <input
                                                                id={`pledge-${p.id}-name`} name="name"
                                                                value={pf.name} onChange={(e) => setPledgeField(p.id, "name", e.target.value)}
                                                                onBlur={() => pledgeBlur(p.id, "name")}
                                                                placeholder="Your name"
                                                            />
                                                            <Styled.Error>{pfTouch.name && pfErr.name}</Styled.Error>
                                                        </Styled.Field>

                                                        <Styled.Field invalid={pfTouch.amount && !!pfErr.amount}>
                                                            <label htmlFor={`pledge-${p.id}-amount`}>Amount (INR) <em>*</em></label>
                                                            <input
                                                                id={`pledge-${p.id}-amount`} name="amount" type="number" inputMode="numeric"
                                                                value={pf.amount} onChange={(e) => setPledgeField(p.id, "amount", e.target.value)}
                                                                onBlur={() => pledgeBlur(p.id, "amount")}
                                                                placeholder="e.g. 500"
                                                            />
                                                            <Styled.Error>{pfTouch.amount && pfErr.amount}</Styled.Error>
                                                        </Styled.Field>

                                                        <Styled.Field className="span2" invalid={pfTouch.message && !!pfErr.message}>
                                                            <label htmlFor={`pledge-${p.id}-message`}>Message</label>
                                                            <textarea
                                                                id={`pledge-${p.id}-message`} name="message" rows={2}
                                                                value={pf.message} onChange={(e) => setPledgeField(p.id, "message", e.target.value)}
                                                                onBlur={() => pledgeBlur(p.id, "message")}
                                                                placeholder="Say something nice (max 180 chars)"
                                                            />
                                                            <Styled.Error>{pfTouch.message && pfErr.message}</Styled.Error>
                                                        </Styled.Field>
                                                    </div>

                                                    <Styled.Actions>
                                                        <div className="spacer" />
                                                        <button type="submit">Pledge</button>
                                                    </Styled.Actions>
                                                </Styled.Pledge>
                                            )}

                                            {/* Pledges list */}
                                            {(p.pledges && p.pledges.length > 0) && (
                                                <Styled.Pledges>
                                                    <div className="header">
                                                        <h4>Recent Pledges</h4>
                                                        <span>{p.pledges.length}</span>
                                                    </div>
                                                    <ul>
                                                        {p.pledges.map((pl) => (
                                                            <li key={pl.id}>
                                                                <div className="left">
                                                                    <div className="name">{pl.name || "Anonymous"}</div>
                                                                    <div className="msg">{pl.message}</div>
                                                                    <div className="ts">{formatIST(pl.createdAt)}</div>
                                                                </div>
                                                                <div className="right">
                                                                    <div className="amt">{INR.format(pl.amount)}</div>
                                                                    <button className="danger small" onClick={() => askRemovePledge(p, pl)}>Remove</button>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </Styled.Pledges>
                                            )}
                                        </Styled.ProjectMain>
                                    </Styled.ProjectBody>
                                </Styled.Card>
                            );
                        })}

                        {!list.length && (
                            <Styled.Empty>
                                <p>No projects match your filters. Try clearing search or changing filters.</p>
                            </Styled.Empty>
                        )}
                    </Styled.List>
                </div>
            </Styled.Layout>

            {/* Confirm Modal */}
            {modal && (
                <Styled.Modal onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
                    <div className="sheet" role="dialog" aria-modal="true">
                        {modal.type === "clearAll" && (
                            <>
                                <h3>Clear all projects?</h3>
                                <p>This will remove everything from localStorage. This action cannot be undone.</p>
                                <div className="actions">
                                    <button onClick={() => setModal(null)} className="ghost">Cancel</button>
                                    <button onClick={clearAll} className="danger">Clear All</button>
                                </div>
                            </>
                        )}

                        {modal.type === "deleteProject" && (
                            <>
                                <h3>Delete project?</h3>
                                <p><strong>{modal.payload?.title}</strong> will be permanently removed.</p>
                                <div className="actions">
                                    <button onClick={() => setModal(null)} className="ghost">Cancel</button>
                                    <button onClick={deleteProject} className="danger">Delete</button>
                                </div>
                            </>
                        )}

                        {modal.type === "removePledge" && (
                            <>
                                <h3>Remove pledge?</h3>
                                <p>
                                    Remove <strong>{modal.payload?.pledge?.name}</strong>'s pledge of{" "}
                                    <strong>{INR.format(modal.payload?.pledge?.amount || 0)}</strong>?
                                </p>
                                <div className="actions">
                                    <button onClick={() => setModal(null)} className="ghost">Cancel</button>
                                    <button onClick={removePledge} className="danger">Remove</button>
                                </div>
                            </>
                        )}
                    </div>
                </Styled.Modal>
            )}
        </Styled.Wrapper>
    );
};

export default CrowdfundingApp;

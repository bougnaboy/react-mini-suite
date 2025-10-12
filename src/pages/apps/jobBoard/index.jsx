import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Styled from "./styled";

/* =========================
   Config + LocalStorage
   ========================= */
const ENV_KEY = import.meta.env.VITE_JSEARCH_API_KEY || "";
const API_HOST = "jsearch.p.rapidapi.com";
const API_URL = "https://jsearch.p.rapidapi.com/search";
const SAVED_KEY = "jobBoard_saved_v1";
const DRAFT_KEY = "jobBoard_draft_v1";
const APIKEY_KEY = "jobBoard_api_key";

/* =========================
   Helpers
   ========================= */
const fmtDate = (ts) => {
    if (!ts) return "-";
    const d = new Date(ts * 1000);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const since = (ts) => {
    if (!ts) return "";
    const diff = Date.now() - ts * 1000;
    const d = Math.floor(diff / (24 * 3600 * 1000));
    if (d <= 0) return "Today";
    if (d === 1) return "1 day ago";
    if (d < 30) return `${d} days ago`;
    const m = Math.floor(d / 30);
    return m === 1 ? "1 month ago" : `${m} months ago`;
};
const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);

/* fallback sample data */
const sampleJobs = [
    {
        job_id: "SAMPLE-1",
        employer_name: "SampleSoft",
        employer_logo: "",
        job_title: "Frontend Engineer (React)",
        job_city: "Bengaluru",
        job_country: "India",
        job_employment_type: "FULLTIME",
        job_is_remote: true,
        job_description:
            "Work on modern React apps with Vite and styled-components. Collaborate with design, write tests, ship features.",
        job_posted_at_timestamp: Math.floor(Date.now() / 1000) - 86400 * 5,
        job_apply_link: "https://example.com/apply",
        job_publisher: "LinkedIn",
        job_required_skills: ["React", "TypeScript", "Styled-Components", "Vite"],
        job_min_salary: 1200000, job_max_salary: 2200000, job_salary_currency: "INR",
    },
    {
        job_id: "SAMPLE-2",
        employer_name: "DataNest",
        employer_logo: "",
        job_title: "Backend Engineer (Node.js)",
        job_city: "Pune",
        job_country: "India",
        job_employment_type: "CONTRACTOR",
        job_is_remote: false,
        job_description:
            "APIs with Node/Express, databases, queues. Scale services and improve performance.",
        job_posted_at_timestamp: Math.floor(Date.now() / 1000) - 86400 * 11,
        job_apply_link: "https://example.com/apply2",
        job_publisher: "Indeed",
        job_required_skills: ["Node.js", "Express", "MongoDB", "Redis"],
    },
];

const fmtMoney = (n, c = "INR") => {
    if (!n && n !== 0) return "-";
    try { return new Intl.NumberFormat("en-IN", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n); }
    catch { return String(n); }
};

function buildQuery({ text, location, remote, type, experience }) {
    const parts = [];
    if (text) parts.push(text);
    if (location) parts.push(`in ${location}`);
    if (remote === "remote") parts.push("remote");
    if (type && type !== "any") {
        const map = { fulltime: "full time", parttime: "part time", contract: "contract", internship: "internship" };
        parts.push(map[type] || type);
    }
    if (experience && experience !== "any") {
        const map = { entry: "entry level", mid: "mid level", senior: "senior" };
        parts.push(map[experience] || experience);
    }
    const q = parts.join(" ").trim();
    return q.length ? q : "software developer";
}

/* =========================
   Component
   ========================= */
const JobBoard = () => {
    /* 🔑 API key (stored locally) */
    const [apiKey, setApiKey] = useState(() => {
        try { return localStorage.getItem(APIKEY_KEY) || ""; } catch { return ""; }
    });
    const activeKey = (apiKey || ENV_KEY || "").trim();

    /* filters / inputs */
    const [inputs, setInputs] = useState(() => {
        try {
            const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
            return draft ?? { text: "", location: "India", remote: "any", type: "any", experience: "any", sortBy: "date" };
        } catch {
            return { text: "", location: "India", remote: "any", type: "any", experience: "any", sortBy: "date" };
        }
    });

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [jobs, setJobs] = useState([]);
    const [hasMore, setHasMore] = useState(false);

    /* details + saved */
    const [detail, setDetail] = useState(null);
    const [saved, setSaved] = useState(() => {
        try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); } catch { return []; }
    });

    /* confirm modals */
    const [confirm, setConfirm] = useState({ open: false, type: "", payload: null, title: "", body: "" });

    /* 🔎 diagnostics */
    const [debugErr, setDebugErr] = useState(null);
    const [verifyMsg, setVerifyMsg] = useState("");

    /* autosave */
    useEffect(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(inputs)); } catch { } }, [inputs]);
    useEffect(() => { try { localStorage.setItem(APIKEY_KEY, apiKey); } catch { } }, [apiKey]);

    const query = useMemo(() => buildQuery(inputs), [inputs]);

    const searchRef = useRef(0);

    function normalizeJob(j) {
        return {
            ...j,
            job_id: j.job_id || cryptoRandom(),
            job_required_skills: j.job_required_skills || j.job_highlights?.Qualifications || [],
        };
    }
    function cryptoRandom() {
        try { return crypto.randomUUID(); } catch { return "J-" + Math.random().toString(36).slice(2); }
    }

    function formatAxiosError(e) {
        const status = e?.response?.status;
        const statusText = e?.response?.statusText;
        const data = e?.response?.data;
        const apiMsg = (data && (data.message || data.error)) ? ` • API: ${data.message || data.error}` : "";
        const text = `JSearch request failed${status ? ` (HTTP ${status}${statusText ? " " + statusText : ""})` : ""}.${apiMsg}`;
        return { text, status, data, headers: e?.response?.headers };
    }

    async function verifyKey() {
        setVerifyMsg("Verifying…");
        setDebugErr(null);
        if (!activeKey) { setVerifyMsg("No key provided."); return; }
        try {
            const { data } = await axios.get(API_URL, {
                params: { query: "developer", page: "1", num_pages: "1" },
                headers: { "x-rapidapi-key": activeKey, "x-rapidapi-host": API_HOST, accept: "application/json" },
                timeout: 15000, withCredentials: false, validateStatus: () => true,
            });
            if (data && Array.isArray(data.data)) setVerifyMsg(`OK ✓ received ${data.data.length} jobs`);
            else { setVerifyMsg("Unexpected response shape"); setDebugErr({ status: 200, data }); }
        } catch (e) {
            const info = formatAxiosError(e);
            setVerifyMsg(info.text); setDebugErr(info);
        }
    }

    async function fetchJobs(reset = false) {
        setErr("");
        setLoading(true);
        setDebugErr(null);
        const callId = ++searchRef.current;

        if (!activeKey) {
            if (callId === searchRef.current) {
                setErr("Enter your RapidAPI key to fetch live jobs. Showing sample results.");
                setJobs(reset ? sampleJobs : [...jobs, ...sampleJobs]);
                setHasMore(false);
                setLoading(false);
            }
            return;
        }

        try {
            const res = await axios.get(API_URL, {
                params: { query, page: String(page), num_pages: "1" },
                headers: { "x-rapidapi-key": activeKey, "x-rapidapi-host": API_HOST, accept: "application/json" },
                timeout: 15000, withCredentials: false, validateStatus: () => true,
            });

            if (res.status >= 200 && res.status < 300) {
                const list = Array.isArray(res?.data?.data) ? res.data.data : [];
                const clean = list.map(normalizeJob);
                if (callId === searchRef.current) {
                    setJobs((prev) => (reset ? clean : [...prev, ...clean]));
                    setHasMore(Boolean(list.length));
                }
            } else {
                const apiMsg = res?.data?.message || res?.data?.error || "";
                const text = `JSearch request failed (HTTP ${res.status}${res.statusText ? " " + res.statusText : ""}).${apiMsg ? " • API: " + apiMsg : ""}`;
                if (callId === searchRef.current) {
                    setErr(`${text} Showing sample results.`);
                    setDebugErr({ status: res.status, data: res.data, headers: res.headers });
                    setJobs(reset ? sampleJobs : [...jobs, ...sampleJobs]);
                    setHasMore(false);
                }
            }
        } catch (e) {
            const info = formatAxiosError(e);
            if (callId === searchRef.current) {
                setErr(`${info.text} Showing sample results.`);
                setDebugErr(info);
                setJobs(reset ? sampleJobs : [...jobs, ...sampleJobs]);
                setHasMore(false);
            }
        } finally {
            if (callId === searchRef.current) setLoading(false);
        }
    }

    /* re-run when query or key changes */
    useEffect(() => { setJobs([]); setPage(1); }, [query]);
    useEffect(() => {
        fetchJobs(true); /* reset */  // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, activeKey]);

    /* pagination */
    useEffect(() => {
        if (page === 1) return;
        fetchJobs(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    /* handlers */
    const setField = (name, value) => setInputs((s) => ({ ...s, [name]: value }));
    const onSubmit = (e) => { e.preventDefault(); setPage(1); fetchJobs(true); };

    const saveJob = (job) => {
        const exists = saved.some((j) => j.job_id === job.job_id);
        if (exists) return;
        const next = [job, ...saved].slice(0, 200);
        setSaved(next);
        try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)); } catch { }
    };

    const askRemoveSaved = (id) =>
        setConfirm({ open: true, type: "remove-saved", payload: id, title: "Remove saved job?", body: "This will remove the job from your saved list." });

    const doRemoveSaved = () => {
        const id = confirm.payload;
        const next = saved.filter((j) => j.job_id !== id);
        setSaved(next);
        try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)); } catch { }
        setConfirm({ open: false, type: "", payload: null, title: "", body: "" });
    };

    const askClearSaved = () =>
        setConfirm({ open: true, type: "clear-saved", title: "Clear all saved jobs?", body: "This will permanently remove all saved jobs." });

    const doClearSaved = () => {
        setSaved([]);
        try { localStorage.setItem(SAVED_KEY, "[]"); } catch { }
        setConfirm({ open: false, type: "", payload: null, title: "", body: "" });
    };

    const askClearKey = () =>
        setConfirm({ open: true, type: "clear-key", title: "Clear API key?", body: "This removes your saved RapidAPI key from this browser." });

    const doClearKey = () => {
        setApiKey("");
        try { localStorage.removeItem(APIKEY_KEY); } catch { }
        setConfirm({ open: false, type: "", payload: null, title: "", body: "" });
    };

    const resultCount = jobs.length;

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div>
                    <h1>Job Board</h1>
                    <p>Search jobs from LinkedIn, Indeed, Glassdoor, ZipRecruiter, BeBee, etc., in one place via RapidAPI JSearch.</p>
                </div>
                <Styled.Badges>
                    <span className="badge">RapidAPI</span>
                    <span className="badge">Saved Jobs</span>
                    <span className="badge">Detail Drawer</span>
                </Styled.Badges>
            </Styled.Header>

            <Styled.Layout>
                {/* LEFT */}
                <div className="left">
                    <Styled.Card>
                        <form onSubmit={onSubmit} noValidate>
                            <Styled.SectionTitle>Search</Styled.SectionTitle>

                            <Styled.Grid>
                                <Styled.Field>
                                    <label htmlFor="text">Role / keywords</label>
                                    <input
                                        id="text" name="text" type="text" placeholder='e.g., "frontend react", "data analyst"'
                                        value={inputs.text} onChange={(e) => setField("text", e.target.value)}
                                    />
                                </Styled.Field>

                                <Styled.Field>
                                    <label htmlFor="location">Location</label>
                                    <input
                                        id="location" name="location" type="text" placeholder="e.g., Bengaluru, India"
                                        value={inputs.location} onChange={(e) => setField("location", e.target.value)}
                                    />
                                </Styled.Field>

                                <Styled.Field>
                                    <label htmlFor="remote">Work mode</label>
                                    <select id="remote" name="remote" value={inputs.remote} onChange={(e) => setField("remote", e.target.value)}>
                                        <option value="any">Any</option>
                                        <option value="remote">Remote</option>
                                        <option value="onsite">On-site</option>
                                    </select>
                                </Styled.Field>

                                <Styled.Field>
                                    <label htmlFor="type">Job type</label>
                                    <select id="type" name="type" value={inputs.type} onChange={(e) => setField("type", e.target.value)}>
                                        <option value="any">Any</option>
                                        <option value="fulltime">Full-time</option>
                                        <option value="parttime">Part-time</option>
                                        <option value="contract">Contract</option>
                                        <option value="internship">Internship</option>
                                    </select>
                                </Styled.Field>

                                <Styled.Field>
                                    <label htmlFor="experience">Experience</label>
                                    <select id="experience" name="experience" value={inputs.experience} onChange={(e) => setField("experience", e.target.value)}>
                                        <option value="any">Any</option>
                                        <option value="entry">Entry</option>
                                        <option value="mid">Mid</option>
                                        <option value="senior">Senior</option>
                                    </select>
                                </Styled.Field>

                                <Styled.Field>
                                    <label htmlFor="sortBy">Sort by</label>
                                    <select id="sortBy" name="sortBy" value={inputs.sortBy} onChange={(e) => setField("sortBy", e.target.value)}>
                                        <option value="date">Posted date (newest)</option>
                                        <option value="relevance">Relevance</option>
                                    </select>
                                </Styled.Field>

                                {/* 🔑 API Key input */}
                                <Styled.Field>
                                    <label htmlFor="apiKey">RapidAPI Key</label>
                                    <input
                                        id="apiKey" name="apiKey" type="password"
                                        placeholder="Paste your RapidAPI key here"
                                        value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                                    />
                                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                                        Saved in this browser only. If left empty, the app uses your .env key{ENV_KEY ? " (found)" : " (not set)"}.
                                    </div>
                                </Styled.Field>
                            </Styled.Grid>

                            <Styled.Actions>
                                <button type="submit" disabled={loading}>Search</button>
                                <div className="spacer" />
                                {activeKey
                                    ? <span className="muted">{apiKey ? "Using saved key" : ".env key in use"}</span>
                                    : <span className="muted warn">No API key — showing fallback</span>
                                }
                                <button type="button" onClick={verifyKey}>Verify Key</button>
                                <button type="button" className="ghost danger" onClick={askClearKey} disabled={!apiKey}>Clear Key</button>
                                {ENV_KEY && !apiKey && (
                                    <button type="button" className="ghost" onClick={() => setApiKey(ENV_KEY)}>Use .env key</button>
                                )}
                            </Styled.Actions>

                            {verifyMsg && (
                                <div style={{ marginTop: 8, fontSize: 12, color: verifyMsg.startsWith("OK") ? "var(--text)" : "var(--danger, #e5484d)" }}>
                                    {verifyMsg}
                                </div>
                            )}
                        </form>
                    </Styled.Card>

                    <Styled.Card>
                        <Styled.SectionTitle>Results {resultCount ? `(${resultCount})` : ""}</Styled.SectionTitle>
                        {err && <Styled.Info className="warn">{err}</Styled.Info>}

                        {debugErr && (
                            <div style={{
                                marginTop: 8,
                                padding: 10,
                                border: "1px dashed var(--border)",
                                borderRadius: "var(--radius)",
                                background: "var(--bg)",
                                whiteSpace: "pre-wrap",
                                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                                fontSize: 12,
                                color: "var(--muted)"
                            }}>
                                <strong>Debug:</strong>
                                {"\n"}status: {String(debugErr.status ?? "n/a")}
                                {"\n"}message: {String(err)}
                                {"\n"}api payload: {JSON.stringify(debugErr.data ?? {}, null, 2)}
                            </div>
                        )}

                        {loading && <Styled.Skeleton>Loading jobs…</Styled.Skeleton>}
                        {!loading && jobs.length === 0 && (
                            <Styled.Empty>No jobs yet. Try searching with different keywords.</Styled.Empty>
                        )}

                        <Styled.Results>
                            {jobs.map((j) => (
                                <Styled.JobCard key={j.job_id} onClick={() => setDetail(j)}>
                                    <div className="head">
                                        <div className="logo">{j.employer_logo ? <img src={j.employer_logo} alt={j.employer_name} /> : <span className="placeholder" />}</div>
                                        <div className="meta">
                                            <h3 title={j.job_title}>{j.job_title}</h3>
                                            <p className="company">{j.employer_name || j.job_publisher || "—"}</p>
                                            <p className="loc">
                                                {j.job_city ? `${j.job_city}, ` : ""}{j.job_country || ""}
                                                {j.job_is_remote ? " • Remote" : ""}
                                            </p>
                                        </div>
                                        <div className="actions" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => saveJob(j)}>Save</button>
                                            <a className="primary" href={j.job_apply_link || "#"} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                                                Apply
                                            </a>
                                        </div>
                                    </div>

                                    <Styled.Tags>
                                        {j.job_employment_type && <span>{j.job_employment_type}</span>}
                                        {Array.isArray(j.job_required_skills) && j.job_required_skills.slice(0, 5).map((s) => <span key={s}>{s}</span>)}
                                        <span className="muted">Posted {since(j.job_posted_at_timestamp)}</span>
                                    </Styled.Tags>

                                    <p className="desc">{String(j.job_description || "").slice(0, 260)}{String(j.job_description || "").length > 260 ? "…" : ""}</p>
                                </Styled.JobCard>
                            ))}
                        </Styled.Results>

                        <Styled.Pagination>
                            <button disabled={loading || page <= 1} onClick={() => setPage((p) => clamp(p - 1, 1, 999))}>Prev</button>
                            <span>Page {page}</span>
                            <button disabled={loading || !hasMore} onClick={() => setPage((p) => p + 1)}>Next</button>
                        </Styled.Pagination>
                    </Styled.Card>
                </div>

                {/* RIGHT */}
                <div className="right">
                    <Styled.Card>
                        <Styled.SectionTitle>Saved Jobs</Styled.SectionTitle>
                        {saved.length === 0 ? (
                            <Styled.Info>No saved jobs yet.</Styled.Info>
                        ) : (
                            <Styled.SavedList>
                                {saved.map((j) => (
                                    <li key={j.job_id}>
                                        <div className="meta" onClick={() => setDetail(j)}>
                                            <strong>{j.job_title}</strong>
                                            <span className="muted">{j.employer_name || "—"}</span>
                                        </div>
                                        <div className="row">
                                            <a href={j.job_apply_link || "#"} target="_blank" rel="noreferrer">Apply</a>
                                            <button className="danger" onClick={() => askRemoveSaved(j.job_id)}>Remove</button>
                                        </div>
                                    </li>
                                ))}
                            </Styled.SavedList>
                        )}
                        <Styled.Actions>
                            <button className="ghost danger" disabled={!saved.length} onClick={askClearSaved}>Clear All</button>
                        </Styled.Actions>
                    </Styled.Card>

                    <Styled.Card>
                        <Styled.SectionTitle>Details</Styled.SectionTitle>
                        {!detail ? (
                            <Styled.Info>Select a job to view details.</Styled.Info>
                        ) : (
                            <div>
                                <h3 className="detail-title">{detail.job_title}</h3>
                                <p className="muted">{detail.employer_name || detail.job_publisher || "—"} • {detail.job_city ? `${detail.job_city}, ` : ""}{detail.job_country || ""}{detail.job_is_remote ? " • Remote" : ""}</p>
                                <Styled.Tags style={{ marginTop: 6, marginBottom: 10 }}>
                                    {detail.job_employment_type && <span>{detail.job_employment_type}</span>}
                                    <span className="muted">Posted {fmtDate(detail.job_posted_at_timestamp)} ({since(detail.job_posted_at_timestamp)})</span>
                                </Styled.Tags>
                                <p className="desc full">{detail.job_description || "—"}</p>

                                {Array.isArray(detail.job_required_skills) && detail.job_required_skills.length > 0 && (
                                    <>
                                        <Styled.Divider />
                                        <Styled.SectionTitle>Required skills</Styled.SectionTitle>
                                        <Styled.Tags>{detail.job_required_skills.map((s) => <span key={s}>{s}</span>)}</Styled.Tags>
                                    </>
                                )}

                                {(detail.job_min_salary || detail.job_max_salary) && (
                                    <>
                                        <Styled.Divider />
                                        <Styled.SectionTitle>Compensation</Styled.SectionTitle>
                                        <p className="muted">
                                            {detail.job_min_salary ? fmtMoney(detail.job_min_salary, detail.job_salary_currency) : "—"} –{" "}
                                            {detail.job_max_salary ? fmtMoney(detail.job_max_salary, detail.job_salary_currency) : "—"}
                                        </p>
                                    </>
                                )}

                                <Styled.Actions>
                                    <button onClick={() => saveJob(detail)}>Save</button>
                                    <a className="primary" href={detail.job_apply_link || "#"} target="_blank" rel="noreferrer">Apply</a>
                                </Styled.Actions>
                            </div>
                        )}
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
                            {confirm.type === "remove-saved" && <button className="danger" onClick={doRemoveSaved}>Remove</button>}
                            {confirm.type === "clear-saved" && <button className="danger" onClick={doClearSaved}>Delete All</button>}
                            {confirm.type === "clear-key" && <button className="danger" onClick={doClearKey}>Clear Key</button>}
                        </div>
                    </Styled.Modal>
                </Styled.ModalOverlay>
            )}
        </Styled.Wrapper>
    );
};

export default JobBoard;

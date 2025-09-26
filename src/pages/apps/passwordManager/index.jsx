// passwordManager/index.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

/** --------------------------------
 * Storage & helpers
 * --------------------------------*/
const STORAGE_KEY = "passwordManager.v1"; // [{id, site, username, password, url, tags:[], notes, createdAt, updatedAt}]
const SESSION_UNLOCK = "passwordManager.unlocked"; // "true" | ""

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

// very basic masking for display only
const mask = (s = "") => (s ? "•".repeat(Math.min(Math.max(s.length, 8), 18)) : "");

// naive generator (UI convenience only; not cryptographically strong)
const genPassword = (len = 16) => {
    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()_+-=[]{};:,./?";
    let out = "";
    const a = new Uint32Array(len);
    crypto.getRandomValues(a);
    for (let i = 0; i < len; i++) out += chars[a[i] % chars.length];
    return out;
};

const load = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};
const save = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

/** --------------------------------
 * Main
 * --------------------------------*/
export default function PasswordManager() {
    const [items, setItems] = useState(() => load());

    // lock screen (UI-only)
    const [unlocked, setUnlocked] = useState(
        () => sessionStorage.getItem(SESSION_UNLOCK) === "true"
    );
    const [master, setMaster] = useState("");
    const unlock = (e) => {
        e?.preventDefault?.();
        // UI-only gate. We do NOT store or verify a real password.
        sessionStorage.setItem(SESSION_UNLOCK, "true");
        setUnlocked(true);
        setMaster("");
    };
    const lock = () => {
        sessionStorage.removeItem(SESSION_UNLOCK);
        setUnlocked(false);
        setMaster("");
    };

    // add form
    const [site, setSite] = useState("");
    const [username, setUsername] = useState("");
    const [pwd, setPwd] = useState("");
    const [url, setUrl] = useState("");
    const [tags, setTags] = useState(""); // comma separated
    const [notes, setNotes] = useState("");
    const [showAddPwd, setShowAddPwd] = useState(false);

    // ui
    const [query, setQuery] = useState("");
    const [filterTag, setFilterTag] = useState("All");
    const [sortBy, setSortBy] = useState("updated"); // updated | site | username
    const [editing, setEditing] = useState(null);
    const [reveal, setReveal] = useState({}); // {id: true}
    const [confirm, setConfirm] = useState(null); // {title, message, tone, confirmText, cancelText, hideCancel, onConfirm}

    useEffect(() => save(items), [items]);

    const allTags = useMemo(() => {
        const set = new Set();
        items.forEach((it) => (it.tags || []).forEach((t) => set.add(t)));
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [items]);

    const filtered = useMemo(() => {
        let list = items;
        if (filterTag !== "All") list = list.filter((it) => (it.tags || []).includes(filterTag));
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter((it) => {
                return (
                    (it.site || "").toLowerCase().includes(q) ||
                    (it.username || "").toLowerCase().includes(q) ||
                    (it.url || "").toLowerCase().includes(q) ||
                    (it.tags || []).some((t) => t.toLowerCase().includes(q))
                );
            });
        }
        if (sortBy === "site") list = [...list].sort((a, b) => a.site.localeCompare(b.site));
        else if (sortBy === "username") list = [...list].sort((a, b) => a.username.localeCompare(b.username));
        else list = [...list].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        return list;
    }, [items, filterTag, query, sortBy]);

    const addItem = (e) => {
        e.preventDefault();
        const s = site.trim();
        if (!s) return;
        const data = {
            id: uid(),
            site: s,
            username: username.trim(),
            password: pwd,
            url: url.trim(),
            tags: tags
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean),
            notes: notes.trim(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setItems((prev) => [data, ...prev]);
        setSite(""); setUsername(""); setPwd(""); setUrl(""); setTags(""); setNotes("");
    };

    const startEdit = (id) => setEditing(id);
    const cancelEdit = () => setEditing(null);
    const saveEdit = (id, patch) => {
        setItems((prev) =>
            prev.map((it) => (it.id === id ? { ...it, ...patch, updatedAt: Date.now() } : it))
        );
        setEditing(null);
    };

    const duplicateItem = (id) => {
        const it = items.find((x) => x.id === id);
        if (!it) return;
        const copy = { ...it, id: uid(), site: `${it.site} (copy)`, createdAt: Date.now(), updatedAt: Date.now() };
        setItems((prev) => [copy, ...prev]);
    };

    const removeItem = (id) => {
        setConfirm({
            title: "Delete credential?",
            message: "This will remove it from your local list.",
            tone: "danger",
            confirmText: "Delete",
            onConfirm: () => setItems((prev) => prev.filter((it) => it.id !== id)),
        });
    };

    const clearAll = () => {
        setConfirm({
            title: "Clear all credentials?",
            message: "This action cannot be undone.",
            tone: "danger",
            confirmText: "Clear all",
            onConfirm: () => setItems([]),
        });
    };

    const copy = async (text, label = "Copied!") => {
        try {
            await navigator.clipboard.writeText(text || "");
            setConfirm({ title: label, hideCancel: true, confirmText: "OK" });
        } catch {
            setConfirm({ title: "Copy failed", hideCancel: true, confirmText: "OK" });
        }
    };

    const toggleReveal = (id) =>
        setReveal((r) => ({ ...r, [id]: !r[id] }));

    const handleConfirm = () => {
        const fn = confirm?.onConfirm;
        setConfirm(null);
        if (typeof fn === "function") fn();
    };
    useEffect(() => {
        if (!confirm) return;
        const onKey = (e) => {
            if (e.key === "Escape") setConfirm(null);
            if (e.key === "Enter") handleConfirm();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [confirm]);

    if (!unlocked) {
        return (
            <Styled.Page>
                <Styled.Container>
                    <Styled.Header>
                        <div>
                            <Styled.Title>Password Manager (Local)</Styled.Title>
                            <Styled.Sub>Master Password UI only — no real encryption. Data stays in your browser.</Styled.Sub>
                        </div>
                    </Styled.Header>

                    <Styled.LockWrap as="form" onSubmit={unlock}>
                        <Styled.Input
                            type="password"
                            placeholder="Enter master password to unlock (UI-only)"
                            value={master}
                            onChange={(e) => setMaster(e.target.value)}
                            autoFocus
                        />
                        <Styled.RowWrap>
                            <Styled.PrimaryButton type="submit">Unlock</Styled.PrimaryButton>
                            <Styled.Button type="button" onClick={() => { setMaster(""); }}>Clear</Styled.Button>
                        </Styled.RowWrap>
                        <Styled.LockBanner>
                            <div><strong>Important:</strong> This is a mini-project. The “master password” is only a visual gate and is <em>not</em> used for real encryption.</div>
                            <div style={{ marginTop: 6 }}>
                                For a production app, use <Styled.Mono>Web Crypto API</Styled.Mono> (PBKDF2/Argon2, AES-GCM) and never store secrets in plaintext.
                            </div>
                        </Styled.LockBanner>
                    </Styled.LockWrap>
                </Styled.Container>
            </Styled.Page>
        );
    }

    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        <Styled.Title>Password Manager (Local)</Styled.Title>
                        <Styled.Sub>Store website credentials locally. Master Password is a UI-only lock.</Styled.Sub>
                    </div>
                    <Styled.BadgeRow>
                        <Styled.Tag>Total: {items.length}</Styled.Tag>
                        <Styled.Button onClick={lock} title="Lock the manager">🔒 Lock</Styled.Button>
                        <Styled.DangerButton onClick={clearAll} title="Clear all credentials">Clear All</Styled.DangerButton>
                    </Styled.BadgeRow>
                </Styled.Header>

                {/* Add form */}
                <Styled.Card as="form" onSubmit={addItem}>
                    <Styled.FormRow>
                        <Styled.Input
                            placeholder="Site / App name * (e.g., GitHub)"
                            value={site}
                            onChange={(e) => setSite(e.target.value)}
                            required
                            style={{ flex: "2 1 280px" }}
                        />
                        <Styled.Input
                            placeholder="Username or Email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ flex: "1 1 220px" }}
                        />
                        <Styled.Input
                            type={showAddPwd ? "text" : "password"}
                            placeholder="Password"
                            value={pwd}
                            onChange={(e) => setPwd(e.target.value)}
                            style={{ flex: "1 1 220px" }}
                        />
                        <Styled.IconButton type="button" onClick={() => setShowAddPwd((v) => !v)} title={showAddPwd ? "Hide password" : "Show password"}>
                            {showAddPwd ? "🙈" : "👁️"}
                        </Styled.IconButton>
                        <Styled.IconButton type="button" onClick={() => setPwd(genPassword(16))} title="Generate strong password">
                            ⚙️
                        </Styled.IconButton>
                        <Styled.Input
                            type="url"
                            placeholder="Login URL (optional)"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            style={{ flex: "2 1 280px" }}
                        />
                        <Styled.Input
                            placeholder="Tags (comma separated)"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            style={{ flex: "2 1 280px" }}
                        />
                        <Styled.PrimaryButton type="submit" disabled={!site.trim()}>
                            Add
                        </Styled.PrimaryButton>
                    </Styled.FormRow>
                    <Styled.TextArea
                        placeholder="Notes (optional)…"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{ marginTop: 10, width: "100%" }}
                    />
                    {!site.trim() && <Styled.Helper>Tip: Site/App name is required.</Styled.Helper>}
                </Styled.Card>

                {/* Filter bar */}
                <Styled.FilterBar>
                    <Styled.Select
                        value={filterTag}
                        onChange={(e) => setFilterTag(e.target.value)}
                        aria-label="Filter by tag"
                        title="Filter by tag"
                        style={{ flex: "0 1 220px" }}
                    >
                        <option value="All">All tags</option>
                        {allTags.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </Styled.Select>

                    <Styled.Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        aria-label="Sort by"
                        title="Sort by"
                        style={{ flex: "0 1 220px" }}
                    >
                        <option value="updated">Recently updated</option>
                        <option value="site">Site A–Z</option>
                        <option value="username">Username A–Z</option>
                    </Styled.Select>

                    <Styled.Input
                        placeholder="Search site/username/url/tag…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search"
                        style={{ flex: "2 1 320px" }}
                    />
                </Styled.FilterBar>

                {/* List */}
                <Styled.List>
                    {filtered.length === 0 && (
                        <Styled.Empty>No credentials yet. Add your first above.</Styled.Empty>
                    )}
                    {filtered.map((it) => {
                        if (editing === it.id) {
                            return (
                                <EditRow
                                    key={it.id}
                                    item={it}
                                    onCancel={cancelEdit}
                                    onSave={saveEdit}
                                />
                            );
                        }
                        const revealed = !!reveal[it.id];
                        return (
                            <Styled.Item key={it.id}>
                                <Styled.ItemLeft>
                                    <div>
                                        <Styled.ItemTitle>{it.site}</Styled.ItemTitle>
                                        <Styled.ItemMeta>
                                            {it.username ? <Styled.Tag>@{it.username}</Styled.Tag> : <Styled.Tag tone="muted">No username</Styled.Tag>}
                                            <span>•</span>
                                            <Styled.Tag>{revealed ? (it.password || "") : mask(it.password)}</Styled.Tag>
                                            {it.url && (
                                                <>
                                                    <span>•</span>
                                                    <a href={it.url} target="_blank" rel="noreferrer">{new URL(it.url).hostname || it.url}</a>
                                                </>
                                            )}
                                            {(it.tags || []).length > 0 && (
                                                <>
                                                    <span>•</span>
                                                    {(it.tags || []).map((t) => <Styled.Tag key={t}>#{t}</Styled.Tag>)}
                                                </>
                                            )}
                                            <span>•</span>
                                            <Styled.DueHint>Updated {new Date(it.updatedAt || it.createdAt).toLocaleString()}</Styled.DueHint>
                                        </Styled.ItemMeta>
                                    </div>
                                </Styled.ItemLeft>

                                <Styled.ItemRight>
                                    <Styled.Button onClick={() => toggleReveal(it.id)} title={revealed ? "Hide password" : "Reveal password"}>
                                        {revealed ? "🙈 Hide" : "👁️ Reveal"}
                                    </Styled.Button>
                                    <Styled.Button onClick={() => copy(it.password, "Password copied")} title="Copy password">📋 Copy</Styled.Button>
                                    <Styled.IconButton onClick={() => copy(it.username, "Username copied")} title="Copy username">👤</Styled.IconButton>
                                    <Styled.IconButton onClick={() => it.url && copy(it.url, "URL copied")} title="Copy URL">🔗</Styled.IconButton>
                                    <Styled.IconButton onClick={() => duplicateItem(it.id)} title="Duplicate">📄</Styled.IconButton>
                                    <Styled.IconButton onClick={() => setEditing(it.id)} title="Edit">✏️</Styled.IconButton>
                                    <Styled.IconButton onClick={() => removeItem(it.id)} title="Delete">🗑️</Styled.IconButton>
                                </Styled.ItemRight>
                            </Styled.Item>
                        );
                    })}
                </Styled.List>

                <Styled.FooterNote>
                    Note: This demo uses <b>LocalStorage</b> and a UI-only lock. It does not encrypt your data.
                </Styled.FooterNote>

                {/* Confirm Modal */}
                {confirm && (
                    <Styled.ModalOverlay onClick={() => setConfirm(null)}>
                        <Styled.ModalCard role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(e) => e.stopPropagation()}>
                            <Styled.ModalTitle id="confirm-title">{confirm.title}</Styled.ModalTitle>
                            {confirm.message ? <Styled.ModalMessage>{confirm.message}</Styled.ModalMessage> : null}
                            <Styled.ModalActions>
                                {!confirm.hideCancel && (
                                    <Styled.Button type="button" onClick={() => setConfirm(null)}>
                                        {confirm.cancelText || "Cancel"}
                                    </Styled.Button>
                                )}
                                {confirm.tone === "danger" ? (
                                    <Styled.DangerButton type="button" onClick={handleConfirm} autoFocus>
                                        {confirm.confirmText || "Confirm"}
                                    </Styled.DangerButton>
                                ) : (
                                    <Styled.PrimaryButton type="button" onClick={handleConfirm} autoFocus>
                                        {confirm.confirmText || "OK"}
                                    </Styled.PrimaryButton>
                                )}
                            </Styled.ModalActions>
                        </Styled.ModalCard>
                    </Styled.ModalOverlay>
                )}
            </Styled.Container>
        </Styled.Page>
    );
}

/** --------------------------------
 * Edit Row
 * --------------------------------*/
function EditRow({ item, onCancel, onSave }) {
    const [site, setSite] = useState(item.site);
    const [username, setUsername] = useState(item.username || "");
    const [password, setPassword] = useState(item.password || "");
    const [url, setUrl] = useState(item.url || "");
    const [tags, setTags] = useState((item.tags || []).join(", "));
    const [notes, setNotes] = useState(item.notes || "");
    const [showPwd, setShowPwd] = useState(false);

    return (
        <Styled.Item as="form" $edit
            onSubmit={(e) => {
                e.preventDefault();
                if (!site.trim()) return;
                onSave(item.id, {
                    site: site.trim(),
                    username: username.trim(),
                    password,
                    url: url.trim(),
                    tags: tags.split(",").map((x) => x.trim()).filter(Boolean),
                    notes: notes.trim(),
                });
            }}
        >
            <Styled.ItemLeft>
                <Styled.FormRow>
                    <Styled.Input value={site} onChange={(e) => setSite(e.target.value)} placeholder="Site / App *" required style={{ flex: "2 1 280px" }} />
                    <Styled.Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username or Email" style={{ flex: "1 1 220px" }} />
                    <Styled.Input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={{ flex: "1 1 220px" }} />
                    <Styled.IconButton type="button" onClick={() => setShowPwd((v) => !v)} title={showPwd ? "Hide password" : "Show password"}>
                        {showPwd ? "🙈" : "👁️"}
                    </Styled.IconButton>
                    <Styled.IconButton type="button" onClick={() => setPassword(genPassword(16))} title="Generate strong password">⚙️</Styled.IconButton>
                    <Styled.Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Login URL" style={{ flex: "2 1 280px" }} />
                    <Styled.Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)" style={{ flex: "2 1 280px" }} />
                </Styled.FormRow>

                <Styled.TextArea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)…" />

                {/* Save/Cancel below inputs, right-aligned */}
                <Styled.ButtonRow>
                    <Styled.PrimaryButton type="submit">Save</Styled.PrimaryButton>
                    <Styled.Button type="button" onClick={onCancel}>Cancel</Styled.Button>
                </Styled.ButtonRow>
            </Styled.ItemLeft>
        </Styled.Item>
    );
}

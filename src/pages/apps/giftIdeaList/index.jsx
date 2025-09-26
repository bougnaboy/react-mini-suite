import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

/* -------------------------
   Storage & helpers
------------------------- */
const STORAGE_KEY = "giftIdeas.v1";
const STATUSES = ["Idea", "Considering", "To Buy", "Purchased", "Wrapped", "Gifted"];

const uid = () =>
    crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

const todayISO = () => {
    const t = new Date();
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, "0");
    const dd = String(t.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const formatNice = (iso) =>
    iso
        ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        })
        : "";

const daysUntil = (iso) => {
    if (!iso) return null;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const due = new Date(`${iso}T00:00:00`);
    const diff = Math.round((due - start) / (1000 * 60 * 60 * 24));
    return diff; // negative = past
};

const inr = (n) => {
    const v = Number(n);
    if (!isFinite(v)) return "";
    try {
        return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
    } catch {
        return `₹${v.toFixed(0)}`;
    }
};

const safeGet = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
    } catch {
        return [];
    }
};
const safeSet = (list) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch { }
};

/* -------------------------
   Main
------------------------- */
export default function GiftIdeaList() {
    const [ideas, setIdeas] = useState(() => safeGet());

    // add form
    const [title, setTitle] = useState("");
    const [recipient, setRecipient] = useState("");
    const [link, setLink] = useState("");
    const [price, setPrice] = useState("");
    const [status, setStatus] = useState("Idea");
    const [priority, setPriority] = useState(3); // 1..5
    const [occasion, setOccasion] = useState("");
    const [due, setDue] = useState(""); // YYYY-MM-DD
    const [notes, setNotes] = useState("");

    // filters
    const [query, setQuery] = useState("");
    const [filterRecipient, setFilterRecipient] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterOccasion, setFilterOccasion] = useState("All");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sortBy, setSortBy] = useState("created"); // created|title|recipient|price|priority|due|status

    const [editing, setEditing] = useState(null);
    const [confirm, setConfirm] = useState(null);

    // persist
    useEffect(() => {
        safeSet(ideas);
    }, [ideas]);

    // derived suggestions
    const allRecipients = useMemo(
        () => Array.from(new Set(ideas.map((i) => i.recipient).filter(Boolean))).sort(),
        [ideas]
    );
    const allOccasions = useMemo(
        () => Array.from(new Set(ideas.map((i) => i.occasion).filter(Boolean))).sort(),
        [ideas]
    );

    // stats
    const stats = useMemo(() => {
        const total = ideas.length;
        const purchased = ideas.filter((i) => i.status === "Purchased").length;
        const gifted = ideas.filter((i) => i.status === "Gifted").length;
        const plannedSpend = ideas
            .filter((i) => i.status !== "Gifted" && Number(i.price) > 0)
            .reduce((a, b) => a + Number(b.price), 0);
        return { total, purchased, gifted, plannedSpend };
    }, [ideas]);

    // filtering
    const filtered = useMemo(() => {
        let list = ideas.slice();

        if (filterRecipient !== "All") list = list.filter((i) => i.recipient === filterRecipient);
        if (filterStatus !== "All") list = list.filter((i) => i.status === filterStatus);
        if (filterOccasion !== "All") list = list.filter((i) => i.occasion === filterOccasion);

        const min = Number(minPrice);
        const max = Number(maxPrice);
        if (!Number.isNaN(min) && min > 0) list = list.filter((i) => Number(i.price) >= min);
        if (!Number.isNaN(max) && max > 0) list = list.filter((i) => Number(i.price) <= max);

        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(
                (i) =>
                    (i.title || "").toLowerCase().includes(q) ||
                    (i.recipient || "").toLowerCase().includes(q) ||
                    (i.occasion || "").toLowerCase().includes(q) ||
                    (i.notes || "").toLowerCase().includes(q)
            );
        }

        if (sortBy === "title") {
            list.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === "recipient") {
            list.sort((a, b) => a.recipient.localeCompare(b.recipient) || a.title.localeCompare(b.title));
        } else if (sortBy === "price") {
            list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        } else if (sortBy === "priority") {
            list.sort((a, b) => (Number(b.priority) || 0) - (Number(a.priority) || 0));
        } else if (sortBy === "due") {
            const maxDate = new Date("9999-12-31");
            list.sort(
                (a, b) =>
                    (a.due ? new Date(`${a.due}T00:00:00`) : maxDate) -
                    (b.due ? new Date(`${b.due}T00:00:00`) : maxDate) ||
                    a.title.localeCompare(b.title)
            );
        } else if (sortBy === "status") {
            const order = Object.fromEntries(STATUSES.map((s, idx) => [s, idx]));
            list.sort((a, b) => order[a.status] - order[b.status] || a.title.localeCompare(b.title));
        } else {
            list.sort((a, b) => b.createdAt - a.createdAt); // newest first
        }
        return list;
    }, [ideas, filterRecipient, filterStatus, filterOccasion, minPrice, maxPrice, query, sortBy]);

    const resetFilters = () => {
        setFilterRecipient("All");
        setFilterStatus("All");
        setFilterOccasion("All");
        setMinPrice("");
        setMaxPrice("");
        setQuery("");
        setSortBy("created");
    };

    // actions
    const addIdea = (e) => {
        e?.preventDefault?.();
        const t = title.trim();
        const r = recipient.trim();
        if (!t || !r) return;
        const idea = {
            id: uid(),
            title: t,
            recipient: r,
            link: link.trim(),
            price: Number(price) || 0,
            status,
            priority: Number(priority) || 3,
            occasion: occasion.trim(),
            due: due.trim(),
            notes: notes.trim(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            purchasedAt: status === "Purchased" ? todayISO() : "",
            giftedAt: status === "Gifted" ? todayISO() : "",
        };
        setIdeas((prev) => [idea, ...prev]);

        // // tune filters to see the newly added one
        // setFilterRecipient(r || "All");
        // setFilterStatus("All");
        // setFilterOccasion("All");
        // setSortBy("created");
        // setQuery("");

        // reset form
        setTitle("");
        setRecipient("");
        setLink("");
        setPrice("");
        setStatus("Idea");
        setPriority(3);
        setOccasion("");
        setDue("");
        setNotes("");
    };

    const startEdit = (id) => setEditing(id);
    const cancelEdit = () => setEditing(null);
    const saveEdit = (id, patch) => {
        setIdeas((prev) =>
            prev.map((i) =>
                i.id === id
                    ? {
                        ...i,
                        ...patch,
                        price: Number(patch.price ?? i.price) || 0,
                        priority: Number(patch.priority ?? i.priority) || 0,
                        purchasedAt:
                            (patch.status ?? i.status) === "Purchased" ? i.purchasedAt || todayISO() : "",
                        giftedAt:
                            (patch.status ?? i.status) === "Gifted" ? i.giftedAt || todayISO() : "",
                        updatedAt: Date.now(),
                    }
                    : i
            )
        );
        setEditing(null);
    };

    const removeOne = (id) => {
        setConfirm({
            title: "Delete gift idea?",
            message: "This will remove it from your list.",
            tone: "danger",
            confirmText: "Delete",
            onConfirm: () => {
                setIdeas((prev) => prev.filter((i) => i.id !== id));
                setConfirm(null);
            },
        });
    };

    const clearAll = () => {
        if (!ideas.length) return;
        setConfirm({
            title: "Clear all gift ideas?",
            message: "This will delete every idea from your list.",
            tone: "danger",
            confirmText: "Clear All",
            onConfirm: () => {
                setIdeas([]);
                resetFilters();
                setConfirm(null);
            },
        });
    };

    const duplicateOne = (id) => {
        const g = ideas.find((x) => x.id === id);
        if (!g) return;
        const copy = {
            ...g,
            id: uid(),
            title: `${g.title} (copy)`,
            status: "Idea",
            purchasedAt: "",
            giftedAt: "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setIdeas((prev) => [copy, ...prev]);
    };

    const quickStatus = (id, next) => {
        setIdeas((prev) =>
            prev.map((i) =>
                i.id === id
                    ? {
                        ...i,
                        status: next,
                        purchasedAt: next === "Purchased" ? i.purchasedAt || todayISO() : "",
                        giftedAt: next === "Gifted" ? i.giftedAt || todayISO() : "",
                        updatedAt: Date.now(),
                    }
                    : i
            )
        );
    };

    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        <Styled.Title>Gift Idea List</Styled.Title>
                        <Styled.Sub>
                            Keep thoughtful gift ideas organised by person, occasion, and priority. Track price,
                            link, status, and due dates-all stored locally in your browser.
                        </Styled.Sub>
                        <Styled.Sub style={{ marginTop: 6 }}>
                            How to use: add a gift idea with recipient, optional price and link. Filter by
                            recipient, occasion, status, or price range; sort by priority, due date, or more.
                            Mark items as Purchased or Gifted, duplicate similar ideas, and clear the list with a
                            confirmation when needed.
                        </Styled.Sub>
                    </div>
                    <Styled.BadgeRow>
                        <Styled.Tag>Total: {stats.total}</Styled.Tag>
                        <Styled.Tag>Purchased: {stats.purchased}</Styled.Tag>
                        <Styled.Tag>Gifted: {stats.gifted}</Styled.Tag>
                        <Styled.Tag $tone="muted">Planned spend: {inr(stats.plannedSpend)}</Styled.Tag>
                    </Styled.BadgeRow>
                </Styled.Header>

                {/* Add form */}
                <Styled.Card as="form" onSubmit={addIdea}>
                    <Styled.FormRow>
                        <Styled.Label title="What is the gift?">
                            <Styled.LabelText>Gift title *</Styled.LabelText>
                            <Styled.Input
                                placeholder="e.g., Wireless headphones"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                aria-label="Gift title"
                                required
                            />
                        </Styled.Label>

                        <Styled.Label title="Who is this for?">
                            <Styled.LabelText>Recipient *</Styled.LabelText>
                            <Styled.Input
                                placeholder="e.g., Mom"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                list="recipient-suggestions"
                                aria-label="Recipient"
                                required
                            />
                            <datalist id="recipient-suggestions">
                                {allRecipients.map((r) => (
                                    <option key={r} value={r} />
                                ))}
                            </datalist>
                        </Styled.Label>

                        <Styled.Label title="Optional web link to the product">
                            <Styled.LabelText>Link</Styled.LabelText>
                            <Styled.Input
                                placeholder="https://example.com/product"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                aria-label="Link"
                            />
                        </Styled.Label>

                        <Styled.Label title="Approximate price in INR">
                            <Styled.LabelText>Price (₹)</Styled.LabelText>
                            <Styled.Input
                                type="number"
                                inputMode="numeric"
                                placeholder="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
                                aria-label="Price"
                            />
                        </Styled.Label>

                        <Styled.Label title="Current status">
                            <Styled.LabelText>Status</Styled.LabelText>
                            <Styled.Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
                                {STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </Styled.Select>
                        </Styled.Label>

                        <Styled.Label title="Priority (1 low – 5 high)">
                            <Styled.LabelText>Priority</Styled.LabelText>
                            <Styled.Select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                aria-label="Priority"
                            >
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </Styled.Select>
                        </Styled.Label>

                        <Styled.Label title="Occasion name (optional)">
                            <Styled.LabelText>Occasion</Styled.LabelText>
                            <Styled.Input
                                placeholder="e.g., Birthday"
                                value={occasion}
                                onChange={(e) => setOccasion(e.target.value)}
                                list="occasion-suggestions"
                                aria-label="Occasion"
                            />
                            <datalist id="occasion-suggestions">
                                {["Birthday", "Anniversary", "Diwali", "Christmas", "New Year", "Graduation", "Housewarming"].map(
                                    (o) => (
                                        <option key={o} value={o} />
                                    )
                                )}
                            </datalist>
                        </Styled.Label>

                        <Styled.Label title="When is it needed by?">
                            <Styled.LabelText>Due date</Styled.LabelText>
                            <Styled.Input type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date" />
                        </Styled.Label>

                        <Styled.PrimaryButton type="submit" disabled={!title.trim() || !recipient.trim()}>
                            Add
                        </Styled.PrimaryButton>
                    </Styled.FormRow>

                    <Styled.Label style={{ width: "100%", marginTop: 8 }} title="Optional notes for this gift">
                        <Styled.LabelText>Notes</Styled.LabelText>
                        <Styled.TextArea
                            placeholder="Any details, sizes, colours, store names…"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            aria-label="Notes"
                        />
                    </Styled.Label>

                    {!title.trim() || !recipient.trim() ? (
                        <Styled.Helper>Tip: Gift title and recipient are required.</Styled.Helper>
                    ) : null}
                </Styled.Card>

                {/* List header + clear all */}
                <Styled.SectionBar>
                    <Styled.SectionTitle>Gift ideas</Styled.SectionTitle>
                    <Styled.DangerButton type="button" onClick={clearAll} title="Delete all ideas">
                        Clear All
                    </Styled.DangerButton>
                </Styled.SectionBar>

                <Styled.Divider />

                {/* Filter bar */}
                <Styled.FilterBar>
                    <Styled.Select
                        value={filterRecipient}
                        onChange={(e) => setFilterRecipient(e.target.value)}
                        aria-label="Filter by recipient"
                        title="Filter by recipient"
                        style={{ flex: "0 1 180px" }}
                    >
                        {["All", ...allRecipients].map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </Styled.Select>

                    <Styled.Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        aria-label="Filter by status"
                        title="Filter by status"
                        style={{ flex: "0 1 180px" }}
                    >
                        {["All", ...STATUSES].map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </Styled.Select>

                    <Styled.Select
                        value={filterOccasion}
                        onChange={(e) => setFilterOccasion(e.target.value)}
                        aria-label="Filter by occasion"
                        title="Filter by occasion"
                        style={{ flex: "0 1 220px" }}
                    >
                        <option value="All">All occasions</option>
                        {allOccasions.map((o) => (
                            <option key={o} value={o}>
                                {o}
                            </option>
                        ))}
                    </Styled.Select>

                    <Styled.Input
                        placeholder="Min ₹"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value.replace(/[^\d]/g, ""))}
                        aria-label="Min price"
                        style={{ flex: "0 1 110px" }}
                        title="Minimum price"
                    />
                    <Styled.Input
                        placeholder="Max ₹"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value.replace(/[^\d]/g, ""))}
                        aria-label="Max price"
                        style={{ flex: "0 1 110px" }}
                        title="Maximum price"
                    />

                    <Styled.Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        aria-label="Sort"
                        title="Sort"
                        style={{ flex: "0 1 220px" }}
                    >
                        <option value="created">Newest</option>
                        <option value="title">Title A–Z</option>
                        <option value="recipient">Recipient A–Z</option>
                        <option value="price">Price (low → high)</option>
                        <option value="priority">Priority (high → low)</option>
                        <option value="due">Due date (early → late)</option>
                        <option value="status">By status</option>
                    </Styled.Select>

                    <Styled.Input
                        placeholder="Search title/recipient/occasion/notes…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search"
                        style={{ flex: "2 1 320px" }}
                        title="Keyword search"
                    />

                    <Styled.Button type="button" onClick={resetFilters} title="Reset filters">
                        Reset
                    </Styled.Button>
                </Styled.FilterBar>

                <Styled.Divider />

                {/* List */}
                <Styled.List>
                    {filtered.length === 0 && ideas.length === 0 && (
                        <Styled.Empty>No gift ideas yet. Add your first!</Styled.Empty>
                    )}
                    {filtered.length === 0 && ideas.length > 0 && (
                        <Styled.Empty>No ideas match your current filters. Try Reset.</Styled.Empty>
                    )}

                    {filtered.map((g) => {
                        const dleft = daysUntil(g.due);
                        const dueHint =
                            dleft === null
                                ? null
                                : dleft === 0
                                    ? "Due today"
                                    : dleft > 0
                                        ? `Due in ${dleft} day${dleft === 1 ? "" : "s"}`
                                        : `${Math.abs(dleft)} day${Math.abs(dleft) === 1 ? "" : "s"} overdue`;

                        if (editing === g.id) {
                            return <EditRow key={g.id} item={g} onCancel={cancelEdit} onSave={saveEdit} />;
                        }

                        return (
                            <Styled.Item key={g.id}>
                                <Styled.ItemLeft>
                                    <div>
                                        <Styled.ItemTitle>{g.title}</Styled.ItemTitle>
                                        <Styled.ItemMeta>
                                            <Styled.Tag>#{g.recipient || "Unknown"}</Styled.Tag>
                                            <span>•</span>
                                            <Styled.Tag>#{g.status}</Styled.Tag>
                                            <span>•</span>
                                            <Styled.Tag>Priority {g.priority}</Styled.Tag>
                                            {g.occasion ? (
                                                <>
                                                    <span>•</span>
                                                    <Styled.Tag>#{g.occasion}</Styled.Tag>
                                                </>
                                            ) : null}
                                            {g.due ? (
                                                <>
                                                    <span>•</span>
                                                    <Styled.DueHint>
                                                        {formatNice(g.due)}{dueHint ? ` • ${dueHint}` : ""}
                                                    </Styled.DueHint>
                                                </>
                                            ) : null}
                                            {Number(g.price) > 0 ? (
                                                <>
                                                    <span>•</span>
                                                    <Styled.Tag>{inr(g.price)}</Styled.Tag>
                                                </>
                                            ) : null}
                                            {g.giftedAt ? (
                                                <>
                                                    <span>•</span>
                                                    <Styled.DueHint>Gifted {formatNice(g.giftedAt)}</Styled.DueHint>
                                                </>
                                            ) : g.purchasedAt ? (
                                                <>
                                                    <span>•</span>
                                                    <Styled.DueHint>Purchased {formatNice(g.purchasedAt)}</Styled.DueHint>
                                                </>
                                            ) : null}
                                        </Styled.ItemMeta>

                                        {g.notes ? (
                                            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.9 }}>{g.notes}</div>
                                        ) : null}
                                    </div>
                                </Styled.ItemLeft>

                                <Styled.ItemRight>
                                    {g.link ? (
                                        <Styled.Button
                                            onClick={() => window.open(g.link, "_blank", "noopener,noreferrer")}
                                            title="Open link"
                                        >
                                            Open link
                                        </Styled.Button>
                                    ) : null}

                                    {g.status !== "Purchased" && g.status !== "Gifted" ? (
                                        <Styled.Button onClick={() => quickStatus(g.id, "Purchased")} title="Mark as Purchased">
                                            Mark Purchased
                                        </Styled.Button>
                                    ) : null}

                                    {g.status !== "Gifted" ? (
                                        <Styled.Button onClick={() => quickStatus(g.id, "Gifted")} title="Mark as Gifted">
                                            Mark Gifted
                                        </Styled.Button>
                                    ) : null}

                                    <Styled.IconButton title="Duplicate" onClick={() => duplicateOne(g.id)}>
                                        📄
                                    </Styled.IconButton>
                                    <Styled.IconButton title="Edit" onClick={() => startEdit(g.id)}>
                                        ✏️
                                    </Styled.IconButton>
                                    <Styled.IconButton title="Delete" onClick={() => removeOne(g.id)}>
                                        🗑️
                                    </Styled.IconButton>
                                </Styled.ItemRight>
                            </Styled.Item>
                        );
                    })}
                </Styled.List>

                <Styled.FooterNote>
                    Data stays in your browser (LocalStorage). Refresh-safe.
                </Styled.FooterNote>

                {/* Confirm Modal */}
                {confirm && (
                    <Styled.ModalOverlay onClick={() => setConfirm(null)}>
                        <Styled.ModalCard
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="confirm-title"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Styled.ModalTitle id="confirm-title">{confirm.title}</Styled.ModalTitle>
                            {confirm.message ? <Styled.ModalMessage>{confirm.message}</Styled.ModalMessage> : null}
                            <Styled.ModalActions>
                                {!confirm.hideCancel && (
                                    <Styled.Button type="button" onClick={() => setConfirm(null)}>
                                        {confirm.cancelText || "Cancel"}
                                    </Styled.Button>
                                )}
                                <Styled.DangerButton type="button" onClick={confirm.onConfirm} autoFocus>
                                    {confirm.confirmText || "Confirm"}
                                </Styled.DangerButton>
                            </Styled.ModalActions>
                        </Styled.ModalCard>
                    </Styled.ModalOverlay>
                )}
            </Styled.Container>
        </Styled.Page>
    );
}

/* -------------------------
   Edit Row
------------------------- */
function EditRow({ item, onCancel, onSave }) {
    const [t, setT] = useState(item.title);
    const [r, setR] = useState(item.recipient);
    const [l, setL] = useState(item.link || "");
    const [p, setP] = useState(item.price || "");
    const [s, setS] = useState(item.status);
    const [pri, setPri] = useState(item.priority || 3);
    const [o, setO] = useState(item.occasion || "");
    const [d, setD] = useState(item.due || "");
    const [n, setN] = useState(item.notes || "");

    return (
        <Styled.Item as="form" $edit onSubmit={(e) => {
            e.preventDefault();
            if (!t.trim() || !r.trim()) return;
            onSave(item.id, {
                title: t.trim(),
                recipient: r.trim(),
                link: l.trim(),
                price: Number(p) || 0,
                status: s,
                priority: Number(pri) || 0,
                occasion: o.trim(),
                due: d,
                notes: n.trim(),
            });
        }}>
            <Styled.ItemLeft style={{ flexDirection: "column", gap: 12 }}>
                <Styled.FormRow>
                    <Styled.Label title="Edit gift title">
                        <Styled.LabelText>Gift title *</Styled.LabelText>
                        <Styled.Input value={t} onChange={(e) => setT(e.target.value)} placeholder="Gift title" required />
                    </Styled.Label>

                    <Styled.Label title="Edit recipient">
                        <Styled.LabelText>Recipient *</Styled.LabelText>
                        <Styled.Input value={r} onChange={(e) => setR(e.target.value)} placeholder="Recipient" required />
                    </Styled.Label>

                    <Styled.Label title="Edit link">
                        <Styled.LabelText>Link</Styled.LabelText>
                        <Styled.Input value={l} onChange={(e) => setL(e.target.value)} placeholder="https://…" />
                    </Styled.Label>

                    <Styled.Label title="Edit price">
                        <Styled.LabelText>Price (₹)</Styled.LabelText>
                        <Styled.Input
                            type="number"
                            inputMode="numeric"
                            value={p}
                            onChange={(e) => setP(e.target.value)}
                            placeholder="0"
                        />
                    </Styled.Label>

                    <Styled.Label title="Edit status">
                        <Styled.LabelText>Status</Styled.LabelText>
                        <Styled.Select value={s} onChange={(e) => setS(e.target.value)}>
                            {STATUSES.map((st) => (
                                <option key={st} value={st}>
                                    {st}
                                </option>
                            ))}
                        </Styled.Select>
                    </Styled.Label>

                    <Styled.Label title="Edit priority">
                        <Styled.LabelText>Priority</Styled.LabelText>
                        <Styled.Select value={pri} onChange={(e) => setPri(e.target.value)}>
                            {[1, 2, 3, 4, 5].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </Styled.Select>
                    </Styled.Label>

                    <Styled.Label title="Edit occasion">
                        <Styled.LabelText>Occasion</Styled.LabelText>
                        <Styled.Input value={o} onChange={(e) => setO(e.target.value)} placeholder="Occasion" />
                    </Styled.Label>

                    <Styled.Label title="Edit due date">
                        <Styled.LabelText>Due date</Styled.LabelText>
                        <Styled.Input type="date" value={d} onChange={(e) => setD(e.target.value)} />
                    </Styled.Label>
                </Styled.FormRow>

                <Styled.Label style={{ width: "100%" }} title="Edit notes">
                    <Styled.LabelText>Notes</Styled.LabelText>
                    <Styled.TextArea value={n} onChange={(e) => setN(e.target.value)} placeholder="Notes" />
                </Styled.Label>

                <Styled.ButtonRow>
                    <Styled.PrimaryButton type="submit">Save</Styled.PrimaryButton>
                    <Styled.Button type="button" onClick={onCancel}>
                        Cancel
                    </Styled.Button>
                </Styled.ButtonRow>
            </Styled.ItemLeft>
        </Styled.Item>
    );
}

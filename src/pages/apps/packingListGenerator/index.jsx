import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

/* -------------------------
   Storage & helpers
------------------------- */
const STORAGE_KEY = "packingList.v2"; // { items: [] }
const uid = () =>
(crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`);

// Backward-compatible loader (handles previous shapes)
const loadState = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("packingList.v1");
        if (!raw) return { items: [] };
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) return { items: parsed };            // legacy direct array
        if (Array.isArray(parsed.items)) return { items: parsed.items }; // { items: [] }
        if (parsed.current?.items && Array.isArray(parsed.current.items)) {
            return { items: parsed.current.items };                       // { current: { items: [] } }
        }
        return { items: [] };
    } catch {
        return { items: [] };
    }
};
const saveState = (s) => localStorage.setItem(STORAGE_KEY, JSON.stringify(s));

/* -------------------------
   Component
------------------------- */
export default function PackingListGenerator() {
    const [state, setState] = useState(() => loadState());

    // add item form
    const [label, setLabel] = useState("");
    const [category, setCategory] = useState("");
    const [qty, setQty] = useState("1");
    const [essential, setEssential] = useState(false);

    // ui filters
    const [query, setQuery] = useState("");
    const [view, setView] = useState("all"); // all | unpacked | essentials
    const [catFilter, setCatFilter] = useState("All");
    const [sortBy, setSortBy] = useState("status"); // status | label | category | qty
    const [editing, setEditing] = useState(null);

    // confirm modal
    const [confirm, setConfirm] = useState(null);
    const askConfirm = (opts) =>
        setConfirm({
            title: "Are you sure?",
            message: "",
            confirmText: "Confirm",
            cancelText: "Cancel",
            tone: "default",
            hideCancel: false,
            ...opts,
        });
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

    // persist
    useEffect(() => { saveState(state); }, [state]);

    // derived
    const allCategories = useMemo(() => {
        const set = new Set();
        state.items.forEach((it) => set.add(it.category || "Uncategorized"));
        return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
    }, [state.items]);

    const counts = useMemo(() => {
        const total = state.items.length;
        const packed = state.items.filter((it) => it.packed).length;
        return { total, packed, remaining: total - packed };
    }, [state.items]);

    const filtered = useMemo(() => {
        let list = state.items;

        if (view === "unpacked") list = list.filter((it) => !it.packed);
        if (view === "essentials") list = list.filter((it) => it.essential);

        if (catFilter !== "All")
            list = list.filter((it) => (it.category || "Uncategorized") === catFilter);

        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(
                (it) =>
                    (it.label || "").toLowerCase().includes(q) ||
                    (it.category || "").toLowerCase().includes(q)
            );
        }

        if (sortBy === "label")
            list = [...list].sort((a, b) => a.label.localeCompare(b.label));
        else if (sortBy === "category")
            list = [...list].sort((a, b) => (a.category || "").localeCompare(b.category || ""));
        else if (sortBy === "qty")
            list = [...list].sort((a, b) => (b.qty || 0) - (a.qty || 0));
        else {
            // status: unpacked first, essentials boosted, then label
            list = [...list].sort((a, b) => {
                const s = a.packed === b.packed ? 0 : a.packed ? 1 : -1;
                const e = a.essential === b.essential ? 0 : a.essential ? -1 : 1;
                return s || e || a.label.localeCompare(b.label);
            });
        }

        return list;
    }, [state.items, view, catFilter, query, sortBy]);

    /* -------------------------
       Actions
    ------------------------- */
    const addItem = (e) => {
        e.preventDefault?.();
        const name = label.trim();
        if (!name) return;
        const item = {
            id: uid(),
            label: name,
            category: category.trim() || "Uncategorized",
            qty: Math.max(1, Number(qty) || 1),
            essential: !!essential,
            packed: false,
        };
        setState((s) => ({ ...s, items: [item, ...s.items] }));
        setLabel(""); setCategory(""); setQty("1"); setEssential(false);
    };

    const togglePacked = (id) => {
        setState((s) => ({
            ...s,
            items: s.items.map((it) => (it.id === id ? { ...it, packed: !it.packed } : it)),
        }));
    };

    const incQty = (id, delta) => {
        setState((s) => ({
            ...s,
            items: s.items.map((it) =>
                it.id === id
                    ? { ...it, qty: Math.max(1, (Number(it.qty) || 1) + delta) }
                    : it
            ),
        }));
    };

    const removeItem = (id) => {
        askConfirm({
            title: "Remove item?",
            message: "This will delete the item from your list.",
            tone: "danger",
            confirmText: "Delete",
            onConfirm: () =>
                setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) })),
        });
    };

    const duplicateItem = (id) => {
        setState((s) => {
            const it = s.items.find((x) => x.id === id);
            if (!it) return s;
            const copy = { ...it, id: uid(), label: `${it.label} (copy)`, packed: false };
            return { ...s, items: [copy, ...s.items] };
        });
    };

    const startEdit = (id) => setEditing(id);
    const cancelEdit = () => setEditing(null);
    const saveEdit = (id, patch) => {
        setState((s) => ({
            ...s,
            items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
        }));
        setEditing(null);
    };

    const markAll = (packed) => {
        setState((s) => ({ ...s, items: s.items.map((it) => ({ ...it, packed })) }));
    };

    const clearList = () => {
        askConfirm({
            title: "Clear current list?",
            message: "This removes all items from your packing list.",
            tone: "danger",
            confirmText: "Clear",
            onConfirm: () => setState((s) => ({ ...s, items: [] })),
        });
    };

    /* -------------------------
       Render
    ------------------------- */
    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        <Styled.Title>Packing List Generator</Styled.Title>
                        <Styled.Sub>Build and manage your packing list. LocalStorage only.</Styled.Sub>
                    </div>
                    <Styled.BadgeRow>
                        <Styled.Tag>Total: {counts.total}</Styled.Tag>
                        <Styled.Tag>Packed: {counts.packed}</Styled.Tag>
                        <Styled.Tag $tone="muted">Left: {counts.remaining}</Styled.Tag>
                    </Styled.BadgeRow>
                </Styled.Header>

                {/* Add item */}
                <Styled.Card as="form" onSubmit={addItem}>
                    <Styled.FormRow>
                        <Styled.Input
                            placeholder="Item name * (e.g., Sunscreen)"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            required
                            style={{ flex: "2 1 320px" }}
                        />
                        <Styled.Input
                            placeholder="Category (e.g., Toiletries)"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            list="cat-suggestions"
                            style={{ flex: "1 1 220px" }}
                        />
                        <datalist id="cat-suggestions">
                            {Array.from(new Set(state.items.map(i => i.category).filter(Boolean))).map(c => (
                                <option key={c} value={c} />
                            ))}
                        </datalist>
                        <Styled.Input
                            type="number"
                            inputMode="numeric"
                            placeholder="Qty"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                            style={{ flex: "0 1 100px" }}
                        />
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <input type="checkbox" checked={essential} onChange={(e) => setEssential(e.target.checked)} />
                            Essential
                        </label>
                        <Styled.PrimaryButton type="submit" disabled={!label.trim()}>Add</Styled.PrimaryButton>
                    </Styled.FormRow>
                    {!label.trim() && <Styled.Helper>Tip: Item name is required.</Styled.Helper>}
                </Styled.Card>

                <Styled.Divider />

                {/* Filter bar */}
                <Styled.FilterBar>
                    <Styled.Select value={view} onChange={(e) => setView(e.target.value)} aria-label="View" title="View">
                        <option value="all">All</option>
                        <option value="unpacked">Unpacked</option>
                        <option value="essentials">Essentials</option>
                    </Styled.Select>

                    <Styled.Select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} aria-label="Category" title="Category">
                        {allCategories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </Styled.Select>

                    <Styled.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort" title="Sort">
                        <option value="status">Status (unpacked → packed)</option>
                        <option value="label">Label A-Z</option>
                        <option value="category">Category A-Z</option>
                        <option value="qty">Qty (high → low)</option>
                    </Styled.Select>

                    <Styled.Input
                        placeholder="Search label/category…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search"
                        style={{ flex: "2 1 320px" }}
                    />
                </Styled.FilterBar>

                {/* === Actions === */}
                <Styled.RowWrap style={{ justifyContent: "flex-end", margin: "6px 0 8px" }}>
                    <Styled.DangerButton type="button" onClick={clearList}>Clear List</Styled.DangerButton>
                    <Styled.Button type="button" onClick={() => markAll(true)} title="Mark all as packed">Mark All ✓</Styled.Button>
                    <Styled.Button type="button" onClick={() => markAll(false)} title="Mark all as unpacked">Unpack All</Styled.Button>
                </Styled.RowWrap>

                {/* List */}
                <Styled.List>
                    {filtered.length === 0 && <Styled.Empty>No items yet. Add your first item.</Styled.Empty>}
                    {filtered.map((it) => {
                        if (editing === it.id) {
                            return <EditRow key={it.id} item={it} onCancel={cancelEdit} onSave={saveEdit} />;
                        }

                        return (
                            <Styled.Item key={it.id}>
                                <Styled.ItemLeft>
                                    <div>
                                        <Styled.ItemTitle>
                                            <input
                                                type="checkbox"
                                                checked={it.packed}
                                                onChange={() => togglePacked(it.id)}
                                                title={it.packed ? "Unpack" : "Mark packed"}
                                            />
                                            <span style={{ textDecoration: it.packed ? "line-through" : "none", opacity: it.packed ? 0.75 : 1 }}>
                                                {it.label}
                                            </span>
                                        </Styled.ItemTitle>
                                        <Styled.ItemMeta>
                                            <Styled.Tag>#{it.category || "Uncategorized"}</Styled.Tag>
                                            <span>•</span>
                                            <Styled.QtyGroup>
                                                <button type="button" onClick={() => incQty(it.id, -1)} title="Decrease">-</button>
                                                <span>{it.qty || 1}</span>
                                                <button type="button" onClick={() => incQty(it.id, +1)} title="Increase">+</button>
                                            </Styled.QtyGroup>
                                            {it.essential && (
                                                <>
                                                    <span>•</span>
                                                    <Styled.Tag>Essential</Styled.Tag>
                                                </>
                                            )}
                                        </Styled.ItemMeta>
                                    </div>
                                </Styled.ItemLeft>

                                <Styled.ItemRight>
                                    <Styled.IconButton onClick={() => duplicateItem(it.id)} title="Duplicate">📄</Styled.IconButton>
                                    <Styled.IconButton onClick={() => startEdit(it.id)} title="Edit">✏️</Styled.IconButton>
                                    <Styled.IconButton onClick={() => removeItem(it.id)} title="Delete">🗑️</Styled.IconButton>
                                </Styled.ItemRight>
                            </Styled.Item>
                        );
                    })}
                </Styled.List>

                <Styled.FooterNote>
                    Data stays in your browser (<b>LocalStorage</b>). Quick, simple, refresh-safe.
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
                                        {confirm.confirmText || "Confirm"}
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

/* -------------------------
   Edit Row
------------------------- */
function EditRow({ item, onCancel, onSave }) {
    const [label, setLabel] = useState(item.label);
    const [category, setCategory] = useState(item.category || "");
    const [qty, setQty] = useState(String(item.qty || 1));
    const [essential, setEssential] = useState(!!item.essential);

    return (
        <Styled.Item
            as="form"
            $edit
            onSubmit={(e) => {
                e.preventDefault();
                if (!label.trim()) return;
                onSave(item.id, {
                    label: label.trim(),
                    category: category.trim() || "Uncategorized",
                    qty: Math.max(1, Number(qty) || 1),
                    essential,
                });
            }}
        >
            <Styled.ItemLeft style={{ flexDirection: "column", gap: 12 }}>
                <Styled.FormRow>
                    <Styled.Input
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="Item *"
                        required
                        style={{ flex: "2 1 320px" }}
                    />
                    <Styled.Input
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Category"
                        style={{ flex: "1 1 220px" }}
                    />
                    <Styled.Input
                        type="number"
                        inputMode="numeric"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        placeholder="Qty"
                        style={{ flex: "0 1 120px" }}
                    />
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <input type="checkbox" checked={essential} onChange={(e) => setEssential(e.target.checked)} />
                        Essential
                    </label>
                </Styled.FormRow>

                {/* Buttons */}
                <Styled.ButtonRow>
                    <Styled.PrimaryButton type="submit">Save</Styled.PrimaryButton>
                    <Styled.Button type="button" onClick={onCancel}>Cancel</Styled.Button>
                </Styled.ButtonRow>
            </Styled.ItemLeft>
        </Styled.Item>
    );
}

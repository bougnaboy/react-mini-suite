import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

const STORAGE_KEY = "grocery-list.v1";
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

const load = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
    } catch { return []; }
};

export default function GroceryListManager() {
    const [items, setItems] = useState(load);
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [qty, setQty] = useState(1);
    const [query, setQuery] = useState("");
    const [catFilter, setCatFilter] = useState("All");
    const [editing, setEditing] = useState(null);

    // confirm modal
    const [confirm, setConfirm] = useState(null);
    const askConfirm = (opts) =>
        setConfirm({ title: "Are you sure?", confirmText: "Confirm", cancelText: "Cancel", tone: "default", ...opts });
    const handleConfirm = () => { const fn = confirm?.onConfirm; setConfirm(null); if (fn) fn(); };
    useEffect(() => {
        if (!confirm) return;
        const onKey = (e) => { if (e.key === "Escape") setConfirm(null); if (e.key === "Enter") handleConfirm(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [confirm]);

    useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);

    const categories = useMemo(() => ["All", ...Array.from(new Set(items.map(i => i.category).filter(Boolean))).sort((a, b) => a.localeCompare(b))], [items]);

    const filtered = useMemo(() => {
        let list = items;
        if (catFilter !== "All") list = list.filter(i => (i.category || "").toLowerCase() === catFilter.toLowerCase());
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(i => i.name.toLowerCase().includes(q) || (i.category || "").toLowerCase().includes(q));
        }
        // sort: category asc, bought last, name asc
        return [...list].sort((a, b) => {
            const ca = (a.category || "~"), cb = (b.category || "~");
            if (ca !== cb) return ca.localeCompare(cb);
            if (a.bought !== b.bought) return a.bought - b.bought; // not bought first
            return a.name.localeCompare(b.name);
        });
    }, [items, catFilter, query]);

    const grouped = useMemo(() => {
        const map = new Map();
        for (const it of filtered) {
            const key = it.category || "Uncategorized";
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(it);
        }
        return Array.from(map.entries()); // [ [cat, items[]], ... ]
    }, [filtered]);

    const totals = useMemo(() => ({
        total: items.length,
        open: items.filter(i => !i.bought).length,
        bought: items.filter(i => i.bought).length
    }), [items]);

    const addItem = (e) => {
        e.preventDefault();
        const n = name.trim();
        const c = category.trim();
        const q = Number(qty) || 1;
        if (!n) return;
        setItems(prev => [{ id: uid(), name: n, category: c, qty: Math.max(1, q), bought: false, createdAt: Date.now() }, ...prev]);
        setName(""); setCategory(""); setQty(1);
    };

    const toggleBought = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, bought: !i.bought } : i));
    const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
    const startEdit = (id) => setEditing(id);
    const saveEdit = (id, patch) => { setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i)); setEditing(null); };
    const cancelEdit = () => setEditing(null);

    const incQty = (id, delta) => setItems(prev => prev.map(i => {
        if (i.id !== id) return i;
        const next = Math.max(1, (Number(i.qty) || 1) + delta);
        return { ...i, qty: next };
    }));

    const clearBought = () => setItems(prev => prev.filter(i => !i.bought));
    const markVisibleBought = () => {
        const visible = new Set(filtered.map(i => i.id));
        setItems(prev => prev.map(i => visible.has(i.id) ? { ...i, bought: true } : i));
    };

    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        <Styled.Title>Grocery List</Styled.Title>
                        <Styled.Sub>Categories • Quantities • LocalStorage</Styled.Sub>
                    </div>
                    <Styled.BadgeRow>
                        <Styled.Badge>{totals.open} to buy</Styled.Badge>
                        <Styled.Badge $tone="muted">{totals.bought} bought</Styled.Badge>
                    </Styled.BadgeRow>
                </Styled.Header>

                <Styled.Card as="form" onSubmit={addItem}>
                    <Styled.FormRow>
                        <Styled.Input
                            placeholder="Item name *"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            aria-label="Item name"
                            required
                        />
                        <Styled.Input
                            placeholder="Category (optional)"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            aria-label="Category"
                            list="cat-suggest"
                        />
                        <datalist id="cat-suggest">
                            {Array.from(new Set(items.map(i => i.category).filter(Boolean))).map(c => <option key={c} value={c} />)}
                        </datalist>
                        <Styled.Input
                            type="number"
                            inputMode="numeric"
                            min="1"
                            step="1"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                            aria-label="Quantity"
                            placeholder="Qty"
                        />
                        <Styled.PrimaryButton type="submit" disabled={!name.trim()}>Add</Styled.PrimaryButton>
                    </Styled.FormRow>
                    {!name.trim() && <Styled.Helper>Tip: Item name is required.</Styled.Helper>}
                </Styled.Card>

                <Styled.Toolbar>
                    <Styled.RowWrap>
                        <Styled.Select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} aria-label="Filter by category">
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </Styled.Select>

                        <Styled.Input
                            placeholder="Search item/category…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            aria-label="Search"
                        />
                    </Styled.RowWrap>

                    <Styled.RowWrap>
                        <Styled.Button
                            type="button"
                            onClick={() => askConfirm({
                                title: "Mark visible as bought?",
                                message: `Mark ${filtered.filter(i => !i.bought).length} item(s) as bought?`,
                                confirmText: "Mark bought",
                                onConfirm: markVisibleBought
                            })}
                        >
                            Mark visible bought
                        </Styled.Button>

                        <Styled.DangerButton
                            type="button"
                            onClick={() => askConfirm({
                                title: "Clear bought items?",
                                message: `Remove ${items.filter(i => i.bought).length} bought item(s)?`,
                                confirmText: "Clear bought",
                                tone: "danger",
                                onConfirm: clearBought
                            })}
                        >
                            Clear bought
                        </Styled.DangerButton>
                    </Styled.RowWrap>
                </Styled.Toolbar>

                {/* Grouped list */}
                <Styled.List>
                    {filtered.length === 0 && <Styled.Empty>No items. Add your first grocery!</Styled.Empty>}

                    {grouped.map(([cat, arr]) => (
                        <div key={cat}>
                            <Styled.GroupHeader>#{cat}</Styled.GroupHeader>
                            {arr.map(it => {
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
                                return (
                                    <Styled.Item key={it.id} $done={it.bought}>
                                        <Styled.ItemLeft>
                                            <Styled.Checkbox
                                                type="checkbox"
                                                checked={it.bought}
                                                onChange={() => toggleBought(it.id)}
                                                aria-label={`Mark ${it.name} ${it.bought ? "not bought" : "bought"}`}
                                            />
                                            <div>
                                                <Styled.ItemTitle $done={it.bought}>{it.name}</Styled.ItemTitle>
                                                <Styled.ItemMeta>
                                                    <Styled.Tag $tone={it.category ? undefined : "muted"}>
                                                        {it.category ? `#${it.category}` : "Uncategorized"}
                                                    </Styled.Tag>
                                                    <span>•</span>
                                                    <span>Qty: {it.qty}</span>
                                                </Styled.ItemMeta>
                                            </div>
                                        </Styled.ItemLeft>

                                        <Styled.ItemRight>
                                            <Styled.IconButton onClick={() => incQty(it.id, +1)} aria-label="Increase">＋</Styled.IconButton>
                                            <Styled.IconButton onClick={() => incQty(it.id, -1)} aria-label="Decrease">－</Styled.IconButton>
                                            <Styled.IconButton onClick={() => startEdit(it.id)} aria-label="Edit">✏️</Styled.IconButton>
                                            <Styled.IconButton
                                                onClick={() => askConfirm({
                                                    title: "Delete item?",
                                                    message: `Delete “${it.name}”?`,
                                                    confirmText: "Delete",
                                                    tone: "danger",
                                                    onConfirm: () => removeItem(it.id)
                                                })}
                                                aria-label="Delete"
                                            >
                                                🗑️
                                            </Styled.IconButton>
                                        </Styled.ItemRight>
                                    </Styled.Item>
                                );
                            })}
                        </div>
                    ))}
                </Styled.List>

                <Styled.FooterNote>Data stays in your browser (localStorage). Refresh-safe.</Styled.FooterNote>

                {/* Confirm Modal */}
                {confirm && (
                    <Styled.ModalOverlay onClick={() => setConfirm(null)}>
                        <Styled.ModalCard role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(e) => e.stopPropagation()}>
                            <Styled.ModalTitle id="confirm-title">{confirm.title}</Styled.ModalTitle>
                            {confirm.message ? <Styled.ModalMessage>{confirm.message}</Styled.ModalMessage> : null}
                            <Styled.ModalActions>
                                <Styled.Button type="button" onClick={() => setConfirm(null)}>
                                    {confirm.cancelText || "Cancel"}
                                </Styled.Button>
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

function EditRow({ item, onCancel, onSave }) {
    const [n, setN] = useState(item.name);
    const [c, setC] = useState(item.category || "");
    const [q, setQ] = useState(item.qty);

    return (
        <Styled.Item as="form" onSubmit={(e) => { e.preventDefault(); if (!n.trim()) return; onSave(item.id, { name: n.trim(), category: c.trim(), qty: Math.max(1, Number(q) || 1) }); }}>
            <Styled.ItemLeft style={{ alignItems: "center" }}>
                <Styled.Input value={n} onChange={(e) => setN(e.target.value)} placeholder="Item name *" aria-label="Edit name" required />
                <Styled.Input value={c} onChange={(e) => setC(e.target.value)} placeholder="Category" aria-label="Edit category" style={{ maxWidth: 180 }} />
                <Styled.Input type="number" min="1" step="1" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Edit quantity" style={{ maxWidth: 120 }} />
            </Styled.ItemLeft>
            <Styled.ItemRight>
                <Styled.PrimaryButton type="submit">Save</Styled.PrimaryButton>
                <Styled.Button type="button" onClick={onCancel}>Cancel</Styled.Button>
            </Styled.ItemRight>
        </Styled.Item>
    );
}

import { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

/** -------------------------
 *  Storage & helpers
 *  ------------------------- */
const STORAGE_KEY = "recipe-box.v1";
const FALLBACK_IMG = new URL("./noRecipe.png", document.baseURI).toString();

const uid = () =>
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
const toInt = (v) => Number(v) || 0;

const load = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
    } catch {
        return [];
    }
};

/** -------------------------
 *  App
 *  ------------------------- */
export default function RecipeBox() {
    const [recipes, setRecipes] = useState(load);

    // add form
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [servings, setServings] = useState("");
    const [prepMins, setPrepMins] = useState("");
    const [cookMins, setCookMins] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    // ui
    const [query, setQuery] = useState("");
    const [filterCat, setFilterCat] = useState("All");
    const [sortBy, setSortBy] = useState("created"); // created | title | category
    const [editing, setEditing] = useState(null);

    // confirm modal
    const [confirm, setConfirm] = useState(null); // {title, message, confirmText, cancelText, tone, hideCancel, onConfirm}
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

    useEffect(
        () => localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes)),
        [recipes]
    );

    // derived
    const allCategories = useMemo(
        () =>
            Array.from(
                new Set(recipes.map((r) => r.category).filter(Boolean))
            ).sort(),
        [recipes]
    );

    const filtered = useMemo(() => {
        let list = recipes;
        if (filterCat !== "All") list = list.filter((r) => r.category === filterCat);
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(
                (r) =>
                    r.title.toLowerCase().includes(q) ||
                    (r.category || "").toLowerCase().includes(q) ||
                    (r.tags || []).some((t) => t.toLowerCase().includes(q))
            );
        }
        if (sortBy === "title") {
            list = [...list].sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === "category") {
            list = [...list].sort(
                (a, b) =>
                    (a.category || "").localeCompare(b.category || "") ||
                    a.title.localeCompare(b.title)
            );
        } else {
            list = [...list].sort((a, b) => b.createdAt - a.createdAt);
        }
        return list;
    }, [recipes, filterCat, query, sortBy]);

    // actions
    const addRecipe = (e) => {
        e.preventDefault();
        const t = title.trim();
        if (!t) return;
        const rec = {
            id: uid(),
            title: t,
            category: category.trim(),
            servings: servings.trim(),
            prepMins: prepMins.trim(),
            cookMins: cookMins.trim(),
            imageUrl: imageUrl.trim(),
            tags: [],
            ingredients: [], // [{id,text}]
            steps: [], // [{id,text}]
            notes: "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setRecipes((prev) => [rec, ...prev]);
        setTitle("");
        setCategory("");
        setServings("");
        setPrepMins("");
        setCookMins("");
        setImageUrl("");
        setConfirm({
            title: "Saved",
            message: `Added “${t}”.`,
            confirmText: "OK",
            hideCancel: true,
        });
    };

    const startEdit = (id) => setEditing(id);
    const cancelEdit = () => setEditing(null);
    const saveEdit = (id, patch) => {
        setRecipes((prev) =>
            prev.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r))
        );
        setEditing(null);
        setConfirm({
            title: "Saved",
            message: "Recipe updated.",
            confirmText: "OK",
            hideCancel: true,
        });
    };
    const removeRecipe = (id) => {
        askConfirm({
            title: "Delete recipe?",
            message: "This will remove it from your Recipe Box.",
            confirmText: "Delete",
            tone: "danger",
            onConfirm: () =>
                setRecipes((prev) => prev.filter((r) => r.id !== id)),
        });
    };
    const duplicateRecipe = (id) => {
        const rec = recipes.find((r) => r.id === id);
        if (!rec) return;
        const copy = {
            ...rec,
            id: uid(),
            title: `${rec.title} (copy)`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setRecipes((prev) => [copy, ...prev]);
    };

    const totalMins = (r) => toInt(r.prepMins) + toInt(r.cookMins);

    return (
        <Styled.Page>
            <Styled.Container>
                <Styled.Header>
                    <div>
                        <Styled.Title>Recipe Box</Styled.Title>
                        <Styled.Sub>
                            Save your favorite recipes with ingredients & steps — LocalStorage.
                        </Styled.Sub>
                    </div>
                    <Styled.BadgeRow>
                        <Styled.Tag>Total: {recipes.length}</Styled.Tag>
                        <Styled.Tag>Categories: {allCategories.length || 0}</Styled.Tag>
                    </Styled.BadgeRow>
                </Styled.Header>

                {/* Add form */}
                <Styled.Card as="form" onSubmit={addRecipe}>
                    <Styled.FormRow>
                        <Styled.Input
                            placeholder="Recipe title *"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            style={{ flex: "2 1 320px" }}
                        />
                        <Styled.Input
                            placeholder="Category (e.g., Dessert)"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            list="cat-suggestions"
                        />
                        <datalist id="cat-suggestions">
                            {allCategories.map((c) => (
                                <option key={c} value={c} />
                            ))}
                        </datalist>
                        <Styled.Input
                            placeholder="Servings"
                            inputMode="numeric"
                            value={servings}
                            onChange={(e) => setServings(e.target.value)}
                            style={{ flex: "0 1 120px" }}
                        />
                        <Styled.Input
                            placeholder="Prep (min)"
                            inputMode="numeric"
                            value={prepMins}
                            onChange={(e) => setPrepMins(e.target.value)}
                            style={{ flex: "0 1 120px" }}
                        />
                        <Styled.Input
                            placeholder="Cook (min)"
                            inputMode="numeric"
                            value={cookMins}
                            onChange={(e) => setCookMins(e.target.value)}
                            style={{ flex: "0 1 120px" }}
                        />
                        <Styled.Input
                            placeholder="Image URL (optional)"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            style={{ flex: "1 1 260px" }}
                        />
                        <Styled.PrimaryButton type="submit" disabled={!title.trim()}>
                            Add
                        </Styled.PrimaryButton>
                    </Styled.FormRow>
                    {!title.trim() && <Styled.Helper>Tip: Title is required.</Styled.Helper>}
                    {/* <Styled.Helper>
                        Add <code>public/noRecipe.png</code> for a graceful image fallback.
                    </Styled.Helper> */}
                </Styled.Card>

                {/* Toolbar */}
                <Styled.Toolbar>
                    <Styled.RowWrap>
                        <Styled.Select
                            value={filterCat}
                            onChange={(e) => setFilterCat(e.target.value)}
                            aria-label="Filter by category"
                        >
                            <option value="All">All</option>
                            {allCategories.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </Styled.Select>
                        <Styled.Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            aria-label="Sort"
                        >
                            <option value="created">Newest</option>
                            <option value="title">Title A–Z</option>
                            <option value="category">By category</option>
                        </Styled.Select>
                        <Styled.Input
                            placeholder="Search title/category/tag…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            aria-label="Search"
                        />
                    </Styled.RowWrap>
                </Styled.Toolbar>

                {/* List */}
                <Styled.List>
                    {filtered.length === 0 && (
                        <Styled.Empty>No recipes yet. Add your first!</Styled.Empty>
                    )}

                    {filtered.map((r) => {
                        if (editing === r.id) {
                            return (
                                <EditRow
                                    key={r.id}
                                    recipe={r}
                                    onCancel={cancelEdit}
                                    onSave={saveEdit}
                                />
                            );
                        }

                        return (
                            <Styled.Item key={r.id} style={{ display: "flex", alignItems: "center", gap: "15px", width: "100%", border: "0px solid #f00" }}>
                                <Styled.ThumbWrap>
                                    <img
                                        src={(r.imageUrl && r.imageUrl.trim()) || FALLBACK_IMG}
                                        onError={(e) => {
                                            if (!e.currentTarget.dataset.fallback) {
                                                e.currentTarget.dataset.fallback = "1";
                                                e.currentTarget.src = FALLBACK_IMG;
                                            }
                                        }}
                                        alt={`${r.title} image`}
                                        width={72}
                                        height={72}
                                        style={{
                                            width: 72,
                                            height: 72,
                                            objectFit: "cover",
                                            borderRadius: 12,
                                        }}
                                    />
                                </Styled.ThumbWrap>

                                <Styled.ItemLeft style={{ width: "100%" }}>
                                    <div>
                                        <Styled.ItemTitle>{r.title}</Styled.ItemTitle>
                                        <Styled.ItemMeta>
                                            {r.category ? (
                                                <Styled.Tag>#{r.category}</Styled.Tag>
                                            ) : (
                                                <Styled.Tag tone="muted">No category</Styled.Tag>
                                            )}
                                            {totalMins(r) > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <Styled.DueHint>{totalMins(r)} min</Styled.DueHint>
                                                </>
                                            )}
                                            {r.servings && (
                                                <>
                                                    <span>•</span>
                                                    <Styled.Tag>{r.servings} servings</Styled.Tag>
                                                </>
                                            )}
                                            {r.ingredients?.length ? (
                                                <>
                                                    <span>•</span>
                                                    <Styled.Tag>
                                                        {r.ingredients.length} ingredients
                                                    </Styled.Tag>
                                                </>
                                            ) : null}
                                            {r.steps?.length ? (
                                                <>
                                                    <span>•</span>
                                                    <Styled.Tag>{r.steps.length} steps</Styled.Tag>
                                                </>
                                            ) : null}
                                        </Styled.ItemMeta>
                                    </div>
                                </Styled.ItemLeft>

                                <Styled.ItemRight style={{ width: "200px" }}>
                                    <Styled.IconButton
                                        title="Duplicate"
                                        onClick={() => duplicateRecipe(r.id)}
                                    >
                                        📄
                                    </Styled.IconButton>
                                    <Styled.IconButton title="Edit" onClick={() => startEdit(r.id)}>
                                        ✏️
                                    </Styled.IconButton>
                                    <Styled.IconButton
                                        title="Delete"
                                        onClick={() => removeRecipe(r.id)}
                                    >
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
                            <Styled.ModalTitle id="confirm-title">
                                {confirm.title}
                            </Styled.ModalTitle>
                            {confirm.message ? (
                                <Styled.ModalMessage>{confirm.message}</Styled.ModalMessage>
                            ) : null}
                            <Styled.ModalActions>
                                {!confirm.hideCancel && (
                                    <Styled.Button type="button" onClick={() => setConfirm(null)}>
                                        {confirm.cancelText || "Cancel"}
                                    </Styled.Button>
                                )}
                                {confirm.tone === "danger" ? (
                                    <Styled.DangerButton
                                        type="button"
                                        onClick={handleConfirm}
                                        autoFocus
                                    >
                                        {confirm.confirmText || "Confirm"}
                                    </Styled.DangerButton>
                                ) : (
                                    <Styled.PrimaryButton
                                        type="button"
                                        onClick={handleConfirm}
                                        autoFocus
                                    >
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

/** -------------------------
 *  Edit row
 *  ------------------------- */
function EditRow({ recipe, onCancel, onSave }) {
    const [t, setT] = useState(recipe.title);
    const [c, setC] = useState(recipe.category || "");
    const [s, setS] = useState(recipe.servings || "");
    const [prep, setPrep] = useState(recipe.prepMins || "");
    const [cook, setCook] = useState(recipe.cookMins || "");
    const [img, setImg] = useState(recipe.imageUrl || "");
    const [tags, setTags] = useState((recipe.tags || []).join(", "));
    const [notes, setNotes] = useState(recipe.notes || "");

    const [ingredients, setIngredients] = useState(
        recipe.ingredients?.length ? recipe.ingredients : []
    );
    const [steps, setSteps] = useState(recipe.steps?.length ? recipe.steps : []);

    // temp inputs
    const [ingText, setIngText] = useState("");
    const [stepText, setStepText] = useState("");

    const addIng = (e) => {
        e?.preventDefault?.();
        const txt = ingText.trim();
        if (!txt) return;
        setIngredients((prev) => [...prev, { id: uid(), text: txt }]);
        setIngText("");
    };
    const addStep = (e) => {
        e?.preventDefault?.();
        const txt = stepText.trim();
        if (!txt) return;
        setSteps((prev) => [...prev, { id: uid(), text: txt }]);
        setStepText("");
    };
    const removeIng = (id) =>
        setIngredients((prev) => prev.filter((x) => x.id !== id));
    const removeStep = (id) =>
        setSteps((prev) => prev.filter((x) => x.id !== id));

    return (
        <Styled.Item
            as="form"
            onSubmit={(e) => {
                e.preventDefault();
                if (!t.trim()) return;
                onSave(recipe.id, {
                    title: t.trim(),
                    category: c.trim(),
                    servings: s.trim(),
                    prepMins: prep.trim(),
                    cookMins: cook.trim(),
                    imageUrl: img.trim(),
                    tags: tags.split(",").map((x) => x.trim()).filter(Boolean),
                    ingredients,
                    steps,
                    notes,
                });
            }}
        >
            <Styled.ItemLeft>
                <Styled.FormRow>
                    <Styled.Input
                        value={t}
                        onChange={(e) => setT(e.target.value)}
                        placeholder="Title *"
                        required
                        style={{ flex: "2 1 320px" }}
                    />
                    <Styled.Input
                        value={c}
                        onChange={(e) => setC(e.target.value)}
                        placeholder="Category"
                    />
                    <Styled.Input
                        value={s}
                        onChange={(e) => setS(e.target.value)}
                        placeholder="Servings"
                        inputMode="numeric"
                        style={{ flex: "0 1 120px" }}
                    />
                    <Styled.Input
                        value={prep}
                        onChange={(e) => setPrep(e.target.value)}
                        placeholder="Prep (min)"
                        inputMode="numeric"
                        style={{ flex: "0 1 120px" }}
                    />
                    <Styled.Input
                        value={cook}
                        onChange={(e) => setCook(e.target.value)}
                        placeholder="Cook (min)"
                        inputMode="numeric"
                        style={{ flex: "0 1 120px" }}
                    />
                    <Styled.Input
                        value={img}
                        onChange={(e) => setImg(e.target.value)}
                        placeholder="Image URL"
                        style={{ flex: "1 1 260px" }}
                    />
                </Styled.FormRow>

                <Styled.RowWrap>
                    <Styled.Input
                        style={{ minWidth: 260, flex: 1 }}
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Tags (comma-separated)"
                    />
                </Styled.RowWrap>

                <Styled.Fieldset>
                    <Styled.Legend>Ingredients</Styled.Legend>
                    <Styled.RowWrap>
                        <Styled.Input
                            style={{ flex: 1, minWidth: 280 }}
                            placeholder="e.g., 2 cups flour"
                            value={ingText}
                            onChange={(e) => setIngText(e.target.value)}
                        />
                        <Styled.PrimaryButton type="button" onClick={addIng}>
                            Add
                        </Styled.PrimaryButton>
                    </Styled.RowWrap>
                    {ingredients.length === 0 && (
                        <Styled.Helper>No ingredients yet.</Styled.Helper>
                    )}
                    {ingredients.length > 0 && (
                        <Styled.Bullets as="ul">
                            {ingredients.map((x) => (
                                <li
                                    key={x.id}
                                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                                >
                                    <span style={{ flex: 1 }}>{x.text}</span>
                                    <Styled.IconButton title="Remove" onClick={() => removeIng(x.id)}>
                                        ✕
                                    </Styled.IconButton>
                                </li>
                            ))}
                        </Styled.Bullets>
                    )}
                </Styled.Fieldset>

                <Styled.Fieldset>
                    <Styled.Legend>Steps</Styled.Legend>
                    <Styled.RowWrap>
                        <Styled.Input
                            style={{ flex: 1, minWidth: 280 }}
                            placeholder="e.g., Preheat oven to 180°C"
                            value={stepText}
                            onChange={(e) => setStepText(e.target.value)}
                        />
                        <Styled.PrimaryButton type="button" onClick={addStep}>
                            Add
                        </Styled.PrimaryButton>
                    </Styled.RowWrap>
                    {steps.length === 0 && <Styled.Helper>No steps yet.</Styled.Helper>}
                    {steps.length > 0 && (
                        <Styled.Bullets as="ol">
                            {steps.map((x) => (
                                <li
                                    key={x.id}
                                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                                >
                                    <span style={{ flex: 1 }}>{x.text}</span>
                                    <Styled.IconButton title="Remove" onClick={() => removeStep(x.id)}>
                                        ✕
                                    </Styled.IconButton>
                                </li>
                            ))}
                        </Styled.Bullets>
                    )}
                </Styled.Fieldset>

                <Styled.TextArea
                    placeholder="Notes (optional)…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </Styled.ItemLeft>

            <Styled.ItemRight>
                <Styled.PrimaryButton type="submit">Save</Styled.PrimaryButton>
                <Styled.Button type="button" onClick={onCancel}>
                    Cancel
                </Styled.Button>
            </Styled.ItemRight>
        </Styled.Item>
    );
}

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

/** DiceBear v7 styles: https://api.dicebear.com/7.x/<style>/svg?seed=... */
const STYLES = [
    { key: "adventurer", label: "Adventurer" },
    { key: "bottts", label: "Bottts" },
    { key: "pixel-art", label: "Pixel Art" },
    { key: "identicon", label: "Identicon" },
    { key: "shapes", label: "Shapes" },
    { key: "initials", label: "Initials" },
];

const RECENTS_KEY = "avatarGen_recents_v1";
const FAVS_KEY = "avatarGen_favs_v1";

const randomSeed = () =>
    Math.random().toString(36).slice(2) + "-" + Math.floor(Math.random() * 1e6);

const avatarUrl = (style, seed, opts) => {
    const params = new URLSearchParams();
    params.set("seed", seed || "guest");
    params.set("size", String(opts.size || 240));
    // nice default background
    if (opts.bgKind === "solid") {
        params.set("backgroundType", "solid");
        params.set("backgroundColor", opts.bgColor.replace("#", ""));
    } else if (opts.bgKind === "gradient") {
        params.set("backgroundType", "gradientLinear");
    }
    if (opts.radius) params.set("radius", String(opts.radius));
    if (style === "initials" && opts.initials) {
        params.set("seed", opts.initials);
    }
    return `https://api.dicebear.com/7.x/${style}/svg?${params.toString()}`;
};

function useLocalList(key, initial = []) {
    const [list, setList] = useState(() => {
        try {
            const v = JSON.parse(localStorage.getItem(key) || "null");
            return Array.isArray(v) ? v : initial;
        } catch {
            return initial;
        }
    });
    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(list));
        } catch { }
    }, [key, list]);
    return [list, setList];
}

const AvatarGenerator = () => {
    const [style, setStyle] = useState(STYLES[0].key);
    const [seed, setSeed] = useState(randomSeed());
    const [opts, setOpts] = useState({
        size: 240,
        radius: 16,
        bgKind: "gradient", // "none" | "solid" | "gradient"
        bgColor: "#1f2937",
        initials: "AR",
    });

    const [recents, setRecents] = useLocalList(RECENTS_KEY, []);
    const [favs, setFavs] = useLocalList(FAVS_KEY, []);
    const [confirm, setConfirm] = useState(null); // {title, message, onConfirm}

    const url = useMemo(() => avatarUrl(style, seed, opts), [style, seed, opts]);

    // keep light recent history (unique by url)
    const pushRecent = useCallback(
        (entry) => {
            setRecents((prev) => {
                const dedup = prev.filter((x) => x.url !== entry.url);
                return [entry, ...dedup].slice(0, 24);
            });
        },
        [setRecents]
    );

    // when seed/style/url changes, push to recents
    useEffect(() => {
        const label =
            STYLES.find((s) => s.key === style)?.label || style;
        pushRecent({ url, style, label, seed, at: Date.now() });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    const nextAvatar = () => setSeed(randomSeed());

    const randomizeAll = () => {
        const s = STYLES[Math.floor(Math.random() * STYLES.length)].key;
        const kinds = ["none", "solid", "gradient"];
        const k = kinds[Math.floor(Math.random() * kinds.length)];
        const r = [0, 8, 12, 16, 24, 32][Math.floor(Math.random() * 6)];
        const col = ["#0ea5e9", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#1f2937"][
            Math.floor(Math.random() * 6)
        ];
        setStyle(s);
        setSeed(randomSeed());
        setOpts((o) => ({
            ...o,
            radius: r,
            bgKind: k,
            bgColor: col,
        }));
    };

    const addFav = () => {
        setFavs((prev) => {
            if (prev.some((x) => x.url === url)) return prev;
            return [{ url, style, seed, at: Date.now() }, ...prev].slice(0, 60);
        });
    };

    const removeFav = (u) => {
        setConfirm({
            title: "Remove favourite?",
            message: "This avatar will be removed from your favourites list.",
            onConfirm: () => setFavs((prev) => prev.filter((x) => x.url !== u)),
        });
    };

    const clearFavs = () => {
        if (!favs.length) return;
        setConfirm({
            title: "Clear all favourites?",
            message: "This will remove all saved avatars.",
            onConfirm: () => setFavs([]),
        });
    };

    const clearRecents = () => {
        if (!recents.length) return;
        setConfirm({
            title: "Clear recent list?",
            message: "This will clear the recent avatars list.",
            onConfirm: () => setRecents([]),
        });
    };

    const copyUrl = async () => {
        try {
            await navigator.clipboard.writeText(url);
        } catch { }
    };

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <div>
                    <h1>Avatar Generator</h1>
                    <p>
                        Pick a category and hit <strong>Next</strong> to roll a new avatar. No API keys. Download or
                        favourite the ones you like.
                    </p>
                </div>
                <Styled.ActionsRow>
                    <button className="ghost" onClick={clearRecents} disabled={!recents.length}>
                        Clear Recents
                    </button>
                    <button className="ghost" onClick={clearFavs} disabled={!favs.length}>
                        Clear Favourites
                    </button>
                </Styled.ActionsRow>
            </Styled.Header>

            {/* Controls */}
            <Styled.Controls>
                <Styled.ControlGroup>
                    <div className="label">Category</div>
                    <div className="chips">
                        {STYLES.map((s) => (
                            <button
                                key={s.key}
                                className={`chip ${style === s.key ? "active" : ""}`}
                                onClick={() => setStyle(s.key)}
                                type="button"
                                title={s.label}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </Styled.ControlGroup>

                <Styled.ControlGroup>
                    <div className="label">Background</div>
                    <div className="chips">
                        <button
                            className={`chip ${opts.bgKind === "none" ? "active" : ""}`}
                            onClick={() => setOpts((o) => ({ ...o, bgKind: "none" }))}
                            type="button"
                        >
                            None
                        </button>
                        <button
                            className={`chip ${opts.bgKind === "solid" ? "active" : ""}`}
                            onClick={() => setOpts((o) => ({ ...o, bgKind: "solid" }))}
                            type="button"
                        >
                            Solid
                        </button>
                        <button
                            className={`chip ${opts.bgKind === "gradient" ? "active" : ""}`}
                            onClick={() => setOpts((o) => ({ ...o, bgKind: "gradient" }))}
                            type="button"
                        >
                            Gradient
                        </button>
                    </div>

                    {opts.bgKind === "solid" && (
                        <div className="row">
                            <label className="mini">Color</label>
                            <input
                                type="color"
                                value={opts.bgColor}
                                onChange={(e) => setOpts((o) => ({ ...o, bgColor: e.target.value }))}
                            />
                        </div>
                    )}
                </Styled.ControlGroup>

                <Styled.ControlGroup>
                    <div className="label">Corners</div>
                    <input
                        type="range"
                        min="0"
                        max="32"
                        step="4"
                        value={opts.radius}
                        onChange={(e) => setOpts((o) => ({ ...o, radius: Number(e.target.value) }))}
                    />
                    <div className="hint">{opts.radius}px radius</div>
                </Styled.ControlGroup>

                {style === "initials" && (
                    <Styled.ControlGroup>
                        <div className="label">Initials</div>
                        <input
                            className="text"
                            type="text"
                            maxLength={3}
                            value={opts.initials}
                            onChange={(e) => setOpts((o) => ({ ...o, initials: e.target.value.toUpperCase() }))}
                            placeholder="e.g., AR"
                        />
                    </Styled.ControlGroup>
                )}
            </Styled.Controls>

            {/* Preview */}
            <Styled.PreviewCard>
                <div className="imgWrap">
                    {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                    <img src={url} alt="Generated avatar" />
                </div>

                <div className="row">
                    <button onClick={nextAvatar} title="Generate next avatar">Next</button>
                    <button className="ghost" onClick={randomizeAll} title="Randomize all settings">Randomize All</button>
                    <button className="ghost" onClick={addFav} title="Save to favourites">Add to Favourites</button>
                    <a className="ghost" href={url} download={`avatar-${style}-${seed}.svg`} title="Download SVG">
                        Download SVG
                    </a>
                    <button className="ghost" onClick={copyUrl} title="Copy URL">Copy URL</button>
                </div>

                <div className="meta">
                    <span>Style: <strong>{STYLES.find(s => s.key === style)?.label || style}</strong></span>
                    <span>Seed: <code>{seed}</code></span>
                </div>
            </Styled.PreviewCard>

            <Styled.Layout>
                {/* Recents */}
                <Styled.Column>
                    <Styled.SectionTitle>Recents</Styled.SectionTitle>
                    {!recents.length ? (
                        <Styled.Empty>Generate some avatars to see them here.</Styled.Empty>
                    ) : (
                        <Styled.Grid>
                            {recents.map((r) => (
                                <Styled.Tile key={r.url} onClick={() => { setSeed(r.seed); setStyle(r.style); }}>
                                    <img src={r.url} alt="recent avatar" />
                                </Styled.Tile>
                            ))}
                        </Styled.Grid>
                    )}
                </Styled.Column>

                {/* Favourites */}
                <Styled.Side>
                    <Styled.SideCard>
                        <h3>Favourites</h3>
                        {!favs.length ? <Styled.Empty small>No favourites yet.</Styled.Empty> : (
                            <ul className="favlist">
                                {favs.map((f) => (
                                    <li key={f.url}>
                                        <button className="thumb" onClick={() => { setSeed(f.seed); setStyle(f.style); }}>
                                            <img src={f.url} alt="favourite avatar" />
                                        </button>
                                        <div className="info">
                                            <div className="line">{STYLES.find(s => s.key === f.style)?.label || f.style}</div>
                                            <div className="seed"><code>{f.seed}</code></div>
                                        </div>
                                        <button className="remove" onClick={() => removeFav(f.url)} title="Remove">Remove</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="row">
                            <button className="ghost" disabled={!favs.length} onClick={clearFavs}>Clear Favourites</button>
                        </div>
                    </Styled.SideCard>
                </Styled.Side>
            </Styled.Layout>

            {/* Confirm Modal */}
            {confirm && (
                <Styled.ModalBackdrop onClick={() => setConfirm(null)} role="dialog" aria-modal="true">
                    <Styled.Modal onClick={(e) => e.stopPropagation()}>
                        <h4>{confirm.title || "Confirm"}</h4>
                        <p className="muted">{confirm.message || "Are you sure?"}</p>
                        <div className="actions">
                            <button className="ghost" onClick={() => setConfirm(null)}>Cancel</button>
                            <button onClick={() => { confirm.onConfirm?.(); setConfirm(null); }}>Yes, proceed</button>
                        </div>
                    </Styled.Modal>
                </Styled.ModalBackdrop>
            )}
        </Styled.Wrapper>
    );
};

export default AvatarGenerator;

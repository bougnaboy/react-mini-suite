import React, { useEffect, useRef, useState } from "react";
import { Styled } from "./styled";

/* -------------------- storage keys + utils -------------------- */
const LS_SCENES = "parallaxScenes_v1";
const LS_SETTINGS = "parallaxSettings_v1";

const safeRead = (k, fallback) => {
    try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v ?? fallback; }
    catch { return fallback; }
};
const safeWrite = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };

/* -------------------- defaults (speeds slightly punchier) -------------------- */
const DEFAULT_SETTINGS = {
    speeds: { sky: 0.20, mid: 0.40, front: 0.70, cards: 0.25 },
    reducedMotion: false,
};

const DEFAULT_SCENES = [
    {
        id: cryptoRandomId(), title: "Blue Ridge",
        imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
        speed: 0.25
    },
    {
        id: cryptoRandomId(), title: "Dune Lines",
        imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop",
        speed: 0.35
    },
    {
        id: cryptoRandomId(), title: "City Night",
        imageUrl: "https://images.unsplash.com/photo-1447433819943-74a20887a81e?q=80&w=1600&auto=format&fit=crop",
        speed: 0.18
    },
];

/* -------------------- id helper -------------------- */
function cryptoRandomId() {
    try { return [...crypto.getRandomValues(new Uint8Array(8))].map(b => b.toString(16).padStart(2, "0")).join(""); }
    catch { return Math.random().toString(36).slice(2, 10); }
}

/* -------------------- small confirm (no portal) -------------------- */
const Confirm = ({ open, title, body, confirmLabel = "Confirm", cancelLabel = "Cancel", onClose, onConfirm }) => {
    if (!open) return null;
    return (
        <Styled.ModalOverlay role="dialog" aria-modal="true">
            <Styled.ModalCard>
                <h3>{title}</h3>
                {body && <p className="muted">{body}</p>}
                <Styled.ModalActions>
                    <button className="ghost" onClick={onClose}>{cancelLabel}</button>
                    <button className="danger" onClick={onConfirm}>{confirmLabel}</button>
                </Styled.ModalActions>
            </Styled.ModalCard>
        </Styled.ModalOverlay>
    );
};

/* -------------------- scroll container detection helpers -------------------- */
const getStyle = (el) => (el ? window.getComputedStyle(el) : null);
const isScrollable = (el) => {
    if (!el) return false;
    const s = getStyle(el);
    if (!s) return false;
    const oy = s.overflowY;
    return (oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight;
};

/* -------------------- component -------------------- */
const ParallaxPage = () => {
    const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...safeRead(LS_SETTINGS, {}) }));
    // allow empty array to persist (after "Clear Scenes", defaults shouldn't repopulate)
    const [scenes, setScenes] = useState(() => { const v = safeRead(LS_SCENES, null); return Array.isArray(v) ? v : DEFAULT_SCENES; });

    const [form, setForm] = useState({ title: "", imageUrl: "", speed: 0.25 });
    const [errors, setErrors] = useState({});
    const [confirm, setConfirm] = useState({ open: false, mode: null, id: null });

    // hero layers
    const skyRef = useRef(null), midRef = useRef(null), frontRef = useRef(null);

    // page wrapper (for scroll ancestor detection)
    const pageRef = useRef(null);
    const scrollerRef = useRef(null);

    // cache cards (perf)
    const cardsRef = useRef([]);

    /* detect active scroll container (window vs inner scroller) */
    useEffect(() => {
        // manual override support: any ancestor with data-scroll-root
        const manual = document.querySelector("[data-scroll-root]");
        if (manual && isScrollable(manual)) {
            scrollerRef.current = manual;
            return;
        }
        // else: nearest scrollable ancestor of this page
        let el = pageRef.current;
        while (el && el !== document.body) {
            if (isScrollable(el)) { scrollerRef.current = el; break; }
            el = el.parentElement;
        }
        if (!scrollerRef.current) scrollerRef.current = null; // null => use window
    }, []);

    /* keep cards list fresh when scenes change */
    useEffect(() => {
        cardsRef.current = Array.from(document.querySelectorAll("[data-parallax-card='1']"));
    }, [scenes.length]);

    /* rAF loop: scroller-aware parallax; disabled on reduced motion */
    useEffect(() => {
        if (settings.reducedMotion) return;

        let raf = 0;
        const sky = skyRef.current, mid = midRef.current, front = frontRef.current;

        const readY = () => {
            const s = scrollerRef.current;
            if (s) return s.scrollTop;
            return window.pageYOffset || document.documentElement.scrollTop || 0;
        };
        const viewportH = () => (scrollerRef.current ? scrollerRef.current.clientHeight : window.innerHeight);

        const tick = () => {
            const y = readY();

            // hero layers (speeds from sliders)
            if (sky) sky.style.transform = `translate3d(0, ${-(y * settings.speeds.sky)}px, 0)`;
            if (mid) mid.style.transform = `translate3d(0, ${-(y * settings.speeds.mid)}px, 0)`;
            if (front) front.style.transform = `translate3d(0, ${-(y * settings.speeds.front)}px, 0)`;

            // cards parallax relative to viewport center (works for window or inner scroller)
            const vh = viewportH();
            for (const n of cardsRef.current) {
                const rect = n.getBoundingClientRect();      // relative to *visual* viewport
                const local = rect.top - vh / 2;             // distance from center
                const speed = Number(n.dataset.speed || settings.speeds.cards);
                const offset = Math.max(-30, Math.min(30, -local * speed * 0.05));
                n.style.transform = `translate3d(0, ${offset}px, 0)`;
            }

            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [settings.reducedMotion, settings.speeds]);

    /* persist */
    useEffect(() => safeWrite(LS_SETTINGS, settings), [settings]);
    useEffect(() => safeWrite(LS_SCENES, scenes), [scenes]);

    /* form validation */
    const validateForm = (f) => {
        const e = {};
        if (!String(f.title || "").trim()) e.title = "Title is required.";
        if (!String(f.imageUrl || "").trim()) e.imageUrl = "Image URL is required.";
        else if (!/^https?:\/\//i.test(f.imageUrl)) e.imageUrl = "Use a valid http(s) URL.";
        const s = Number(f.speed); if (Number.isNaN(s) || s < 0 || s > 1) e.speed = "Speed must be 0.00 - 1.00";
        return e;
    };

    /* handlers */
    const onAddScene = (e) => {
        e.preventDefault();
        const e1 = validateForm(form); setErrors(e1);
        if (Object.values(e1).some(Boolean)) return;
        setScenes(arr => [{ id: cryptoRandomId(), ...form }, ...arr]);
        setForm({ title: "", imageUrl: "", speed: 0.25 });
    };

    const onDeleteScene = (id) => setConfirm({ open: true, mode: "delete", id });
    const onClearAll = () => setConfirm({ open: true, mode: "clear", id: null });
    const onResetSpeeds = () => setConfirm({ open: true, mode: "reset", id: null });

    const doConfirm = () => {
        if (confirm.mode === "delete" && confirm.id) setScenes(arr => arr.filter(x => x.id !== confirm.id));
        if (confirm.mode === "clear") setScenes([]);
        if (confirm.mode === "reset") setSettings(s => ({ ...s, speeds: { ...DEFAULT_SETTINGS.speeds } }));
        setConfirm({ open: false, mode: null, id: null });
    };
    const closeConfirm = () => setConfirm({ open: false, mode: null, id: null });

    const setSpeed = (k, v) => setSettings(s => ({ ...s, speeds: { ...s.speeds, [k]: v } }));

    const toggleReduced = () => {
        const next = !settings.reducedMotion;
        setSettings(s => ({ ...s, reducedMotion: next }));
        if (next) {
            [skyRef, midRef, frontRef].forEach(r => r.current && (r.current.style.transform = "translate3d(0,0,0)"));
            cardsRef.current.forEach(n => (n.style.transform = "translate3d(0,0,0)"));
        }
    };

    const hasScenes = scenes.length > 0;

    return (
        <Styled.Page ref={pageRef}>
            <Styled.Header>
                <div>
                    <h1>Parallax Page</h1>
                    <p>Layered hero, fixed backgrounds, and a tiny scenes manager.</p>
                </div>

                <Styled.Controls>
                    <div className="ctrl">
                        <label htmlFor="sky">Sky</label>
                        <input id="sky" type="range" min="0" max="1" step="0.01"
                            value={settings.speeds.sky} onChange={(e) => setSpeed("sky", Number(e.target.value))} />
                        <span className="val">{settings.speeds.sky.toFixed(2)}</span>
                    </div>
                    <div className="ctrl">
                        <label htmlFor="mid">Mid</label>
                        <input id="mid" type="range" min="0" max="1" step="0.01"
                            value={settings.speeds.mid} onChange={(e) => setSpeed("mid", Number(e.target.value))} />
                        <span className="val">{settings.speeds.mid.toFixed(2)}</span>
                    </div>
                    <div className="ctrl">
                        <label htmlFor="front">Front</label>
                        <input id="front" type="range" min="0" max="1" step="0.01"
                            value={settings.speeds.front} onChange={(e) => setSpeed("front", Number(e.target.value))} />
                        <span className="val">{settings.speeds.front.toFixed(2)}</span>
                    </div>

                    <label className="switch">
                        <input type="checkbox" checked={settings.reducedMotion} onChange={toggleReduced} />
                        <span>Reduced Motion</span>
                    </label>

                    <div className="actions">
                        <button className="ghost" onClick={onResetSpeeds} title="Reset speeds">Reset Speeds</button>
                        <button className="ghost danger" onClick={onClearAll} title="Clear all scenes">Clear Scenes</button>
                    </div>
                </Styled.Controls>
            </Styled.Header>

            {/* HERO */}
            <Styled.Hero>
                {/* visible image layers (see styled.js) */}
                <Styled.Layer ref={skyRef} className="sky" aria-hidden />
                <Styled.Layer ref={midRef} className="mid" aria-hidden />
                <Styled.Layer ref={frontRef} className="front" aria-hidden />
                <Styled.HeroContent>
                    <h2>Subtle Depth, Smooth Scroll</h2>
                    <p>CSS + a pinch of JS. Respects <code>prefers-reduced-motion</code>.</p>
                    <a className="cta" href="#scenes">Explore Scenes</a>
                </Styled.HeroContent>
            </Styled.Hero>

            {/* FIXED BG SECTION 1 */}
            <Styled.ParallaxSection
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1600&auto=format&fit=crop')" }}>
                <div className="overlay">
                    <h3>Fixed Background</h3>
                    <p>Classic <code>background-attachment: fixed</code> gives a light parallax.</p>
                </div>
            </Styled.ParallaxSection>

            {/* SCENES */}
            <Styled.Section id="scenes">
                <Styled.SectionHead>
                    <h3>Scenes</h3>
                    <p>Add your own images and give them a speed.</p>
                </Styled.SectionHead>

                <Styled.Form onSubmit={onAddScene} noValidate>
                    <div className="grid">
                        <div className={`field ${errors.title ? "invalid" : ""}`}>
                            <label htmlFor="title">Title <em>*</em></label>
                            <input id="title" name="title" type="text"
                                value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="Sunrise in Ladakh" />
                            <div className="error">{errors.title || ""}</div>
                        </div>
                        <div className={`field ${errors.imageUrl ? "invalid" : ""}`}>
                            <label htmlFor="imageUrl">Image URL <em>*</em></label>
                            <input id="imageUrl" name="imageUrl" type="url"
                                value={form.imageUrl} onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                                placeholder="https://..." />
                            <div className="error">{errors.imageUrl || ""}</div>
                        </div>
                        <div className={`field ${errors.speed ? "invalid" : ""}`}>
                            <label htmlFor="speed">Speed (0-1)</label>
                            <input id="speed" name="speed" type="number" step="0.01" min="0" max="1"
                                value={form.speed} onChange={(e) => setForm(f => ({ ...f, speed: Number(e.target.value) }))} />
                            <div className="error">{errors.speed || ""}</div>
                        </div>
                    </div>
                    <div className="actions"><button type="submit">Add Scene</button></div>
                </Styled.Form>

                <Styled.Cards>
                    {hasScenes ? scenes.map(s => (
                        <Styled.Card key={s.id} data-parallax-card="1" data-speed={s.speed}
                            style={{ backgroundImage: `url('${s.imageUrl}')` }} role="figure" aria-label={s.title}>
                            <div className="overlay">
                                <div className="meta">
                                    <h4>{s.title}</h4>
                                    <span className="muted">speed: {Number(s.speed).toFixed(2)}</span>
                                </div>
                                <div className="cardActions">
                                    <button className="ghost danger small" onClick={() => onDeleteScene(s.id)}>Remove</button>
                                </div>
                            </div>
                        </Styled.Card>
                    )) : (
                        <Styled.Empty><p>No scenes yet. Add one above.</p></Styled.Empty>
                    )}
                </Styled.Cards>
            </Styled.Section>

            {/* FIXED BG SECTION 2 */}
            <Styled.ParallaxSection
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop')" }}>
                <div className="overlay">
                    <h3>Another Layer</h3>
                    <p>Mix fixed sections with layered hero for a richer feel.</p>
                </div>
            </Styled.ParallaxSection>

            {/* Confirm modal */}
            <Confirm
                open={confirm.open}
                title={
                    confirm.mode === "delete" ? "Remove this scene?" :
                        confirm.mode === "clear" ? "Clear all scenes?" :
                            confirm.mode === "reset" ? "Reset speeds to defaults?" : "Confirm"
                }
                body={
                    confirm.mode === "delete" ? "This will remove the selected scene." :
                        confirm.mode === "clear" ? "This will remove every scene in the grid." :
                            confirm.mode === "reset" ? "Sky/Mid/Front/Card speeds will be restored to initial values." : ""
                }
                confirmLabel={
                    confirm.mode === "delete" ? "Remove" :
                        confirm.mode === "clear" ? "Clear" :
                            confirm.mode === "reset" ? "Reset" : "Confirm"
                }
                onClose={closeConfirm}
                onConfirm={doConfirm}
            />
        </Styled.Page>
    );
};

export default ParallaxPage;

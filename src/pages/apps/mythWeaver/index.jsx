import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled, PrintStyles } from "./styled";

const STORAGE_KEY_SEED = "mythWeaver_seed";
const STORAGE_KEY_STORY = "mythWeaver_story";

function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function sentenceCase(s) {
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
}

const STOCK = {
    heroes: ["Aru", "Maya", "Vel", "Ila", "Ragh", "Tara", "Kian", "Nia", "Dev", "Asha"],
    companions: ["a river spirit", "an old wanderer", "a moonlit stag", "a curious child", "a silent monk"],
    places: ["the Verdant Vale", "the Red Dunes", "Tidewatch Cliffs", "Whispering Pines", "Old Stone City"],
    quests: ["restore the broken covenant", "bring rain to a silent sky", "mend a forgotten song", "return a stolen dawn", "lift a drifting curse"],
    foes: ["the Ash Warden", "a jealous king", "the Sleepless Serpent", "storm-eaten ghosts", "the Crow of Midnight"],
    artifacts: ["a reed flute", "an ember shard", "silver thread", "a cracked mirror", "salt of the first sea"],
    themes: ["humility over pride", "memory over fear", "kindness over strength", "patience over haste", "truth over comfort"]
};

function weave({ hero, companion, place, quest, foe, artifact, theme }) {
    const openers = [
        "In the old seasons,",
        "When roads still listened,",
        "Before maps forgot the edges,",
        "Under watchful constellations,"
    ];
    const bridges = [
        "and there",
        "where the wind kept counsel",
        "at the hush between heartbeats",
        "by the stone that remembers"
    ];
    const endings = [
        "so the land could breathe again.",
        "and the rumor of peace took root.",
        "until even the shadows learned to rest.",
        "and morning found a quieter name."
    ];

    const a = pick(openers);
    const b = pick(bridges);
    const e = pick(endings);

    const line1 = `${a} ${sentenceCase(hero)} set out for ${place} ${b}.`;
    const line2 = `With ${companion} beside them and ${artifact} in hand, the vow was simple: ${quest}.`;
    const line3 = `Yet ${foe} stood in the way, measuring worth by weight and noise.`;
    const line4 = `In the end, ${theme} won, ${e}`;

    return [line1, line2, line3, line4].join(" ");
}

export default function MythWeaver() {
    const [seed, setSeed] = useState({
        hero: "",
        companion: "",
        place: "",
        quest: "",
        foe: "",
        artifact: "",
        theme: ""
    });

    const [story, setStory] = useState("");
    const printRef = useRef(null);

    // load saved state
    useEffect(() => {
        try {
            const rawSeed = localStorage.getItem(STORAGE_KEY_SEED);
            const rawStory = localStorage.getItem(STORAGE_KEY_STORY);
            if (rawSeed) setSeed(JSON.parse(rawSeed));
            if (rawStory) setStory(rawStory);
        } catch { /* ignore */ }
    }, []);

    // persist seed/story
    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY_SEED, JSON.stringify(seed)); } catch { }
    }, [seed]);
    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY_STORY, story); } catch { }
    }, [story]);

    const isReady = useMemo(() => Object.values(seed).every(Boolean), [seed]);

    function randomizeField(field) {
        const map = {
            hero: STOCK.heroes,
            companion: STOCK.companions,
            place: STOCK.places,
            quest: STOCK.quests,
            foe: STOCK.foes,
            artifact: STOCK.artifacts,
            theme: STOCK.themes
        };
        setSeed(prev => ({ ...prev, [field]: pick(map[field]) }));
    }

    function randomizeAll() {
        const ok = window.confirm("Randomize all fields?");
        if (!ok) return;
        setSeed({
            hero: pick(STOCK.heroes),
            companion: pick(STOCK.companions),
            place: pick(STOCK.places),
            quest: pick(STOCK.quests),
            foe: pick(STOCK.foes),
            artifact: pick(STOCK.artifacts),
            theme: pick(STOCK.themes)
        });
    }

    function clearAll() {
        const ok = window.confirm("Clear everything?");
        if (!ok) return;
        setSeed({ hero: "", companion: "", place: "", quest: "", foe: "", artifact: "", theme: "" });
        setStory("");
    }

    function handleWeave() {
        setStory(weave(seed));
    }

    function handlePrint() {
        if (!story) return;
        // CSS-driven print: hide everything except #mw-print
        window.print();
    }

    return (
        <Styled.Wrapper>
            {/* Global print CSS to scope printing to the result block */}
            <PrintStyles />

            <header className="head">
                <h2>Myth-Weaver</h2>
                <p className="muted">Pick a few strands, weave a short myth, and print just the story.</p>
            </header>

            <Styled.Grid>
                <section>
                    <Styled.Group>
                        <label>Hero</label>
                        <Styled.Row>
                            <Styled.Input
                                value={seed.hero}
                                onChange={(e) => setSeed({ ...seed, hero: e.target.value })}
                                placeholder="e.g., Aru"
                            />
                            <Styled.Button type="button" onClick={() => randomizeField("hero")}>🎲</Styled.Button>
                        </Styled.Row>
                    </Styled.Group>

                    <Styled.Group>
                        <label>Companion</label>
                        <Styled.Row>
                            <Styled.Input
                                value={seed.companion}
                                onChange={(e) => setSeed({ ...seed, companion: e.target.value })}
                                placeholder="e.g., a river spirit"
                            />
                            <Styled.Button type="button" onClick={() => randomizeField("companion")}>🎲</Styled.Button>
                        </Styled.Row>
                    </Styled.Group>

                    <Styled.Group>
                        <label>Place</label>
                        <Styled.Row>
                            <Styled.Input
                                value={seed.place}
                                onChange={(e) => setSeed({ ...seed, place: e.target.value })}
                                placeholder="e.g., the Verdant Vale"
                            />
                            <Styled.Button type="button" onClick={() => randomizeField("place")}>🎲</Styled.Button>
                        </Styled.Row>
                    </Styled.Group>

                    <Styled.Group>
                        <label>Quest</label>
                        <Styled.Row>
                            <Styled.Input
                                value={seed.quest}
                                onChange={(e) => setSeed({ ...seed, quest: e.target.value })}
                                placeholder="e.g., restore the broken covenant"
                            />
                            <Styled.Button type="button" onClick={() => randomizeField("quest")}>🎲</Styled.Button>
                        </Styled.Row>
                    </Styled.Group>

                    <Styled.Group>
                        <label>Antagonist</label>
                        <Styled.Row>
                            <Styled.Input
                                value={seed.foe}
                                onChange={(e) => setSeed({ ...seed, foe: e.target.value })}
                                placeholder="e.g., the Ash Warden"
                            />
                            <Styled.Button type="button" onClick={() => randomizeField("foe")}>🎲</Styled.Button>
                        </Styled.Row>
                    </Styled.Group>

                    <Styled.Group>
                        <label>Artifact</label>
                        <Styled.Row>
                            <Styled.Input
                                value={seed.artifact}
                                onChange={(e) => setSeed({ ...seed, artifact: e.target.value })}
                                placeholder="e.g., a reed flute"
                            />
                            <Styled.Button type="button" onClick={() => randomizeField("artifact")}>🎲</Styled.Button>
                        </Styled.Row>
                    </Styled.Group>

                    <Styled.Group>
                        <label>Theme / Moral</label>
                        <Styled.Row>
                            <Styled.Input
                                value={seed.theme}
                                onChange={(e) => setSeed({ ...seed, theme: e.target.value })}
                                placeholder="e.g., humility over pride"
                            />
                            <Styled.Button type="button" onClick={() => randomizeField("theme")}>🎲</Styled.Button>
                        </Styled.Row>
                    </Styled.Group>

                    <Styled.Actions>
                        <Styled.Button type="button" onClick={randomizeAll}>Randomize All</Styled.Button>
                        <Styled.Button type="button" onClick={handleWeave} disabled={!isReady}>Weave Story</Styled.Button>
                        <Styled.Button type="button" className="ghost" onClick={clearAll}>Clear</Styled.Button>
                    </Styled.Actions>
                </section>

                <section>
                    <Styled.StoryCard>
                        <div className="meta">
                            <span className="tag">Myth-Weaver</span>
                        </div>

                        <h3>Story</h3>

                        {/* ONLY this block prints */}
                        <div id="mw-print" ref={printRef} className="storyBody">
                            <p className={story ? "" : "muted"}>
                                {story || "Your story will appear here."}
                            </p>
                        </div>

                        <div className="seed">
                            <h4>Strands</h4>
                            <ul>
                                <li><b>Hero:</b> {seed.hero || "—"}</li>
                                <li><b>Companion:</b> {seed.companion || "—"}</li>
                                <li><b>Place:</b> {seed.place || "—"}</li>
                                <li><b>Quest:</b> {seed.quest || "—"}</li>
                                <li><b>Antagonist:</b> {seed.foe || "—"}</li>
                                <li><b>Artifact:</b> {seed.artifact || "—"}</li>
                                <li><b>Theme:</b> {seed.theme || "—"}</li>
                            </ul>
                        </div>
                    </Styled.StoryCard>

                    <Styled.Actions $align="right">
                        <Styled.Button type="button" onClick={handlePrint} disabled={!story}>
                            Print Story Only
                        </Styled.Button>
                    </Styled.Actions>
                </section>
            </Styled.Grid>
        </Styled.Wrapper>
    );
}

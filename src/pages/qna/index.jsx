import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";
import { Box, CircularProgress } from "@mui/material";
import { TopicPicker } from "../../components/TopicPicker.jsx";

const Intro = lazy(() => import("./topics/Intro.jsx"));
const JsxRendering = lazy(() => import("./topics/JsxRendering.jsx"));
const Components = lazy(() => import("./topics/Components.jsx"));
const StateDataFlow = lazy(() => import("./topics/StateDataFlow.jsx"));
const CoreHooks = lazy(() => import("./topics/CoreHooks.jsx"));
const AdvancedHooks = lazy(() => import("./topics/AdvancedHooks.jsx"));
const DomEvents = lazy(() => import("./topics/DomEvents.jsx"));
const FormsValidation = lazy(() => import("./topics/FormsValidation.jsx"));
const Styling = lazy(() => import("./topics/Styling.jsx"));
const Routing = lazy(() => import("./topics/Routing.jsx"));
const SuspenseCodeSplit = lazy(() => import("./topics/SuspenseCodeSplit.jsx"));
const DataFetchingCaching = lazy(() => import("./topics/DataFetchingCaching.jsx"));
const StateManagement = lazy(() => import("./topics/StateManagement.jsx"));
const Performance = lazy(() => import("./topics/Performance.jsx"));
const Errors = lazy(() => import("./topics/Errors.jsx"));
const I18n = lazy(() => import("./topics/I18n.jsx"));
const Animations = lazy(() => import("./topics/Animations.jsx"));
const TypeScript = lazy(() => import("./topics/TypeScript.jsx"));
const Testing = lazy(() => import("./topics/Testing.jsx"));
const SsrRsc = lazy(() => import("./topics/SsrRsc.jsx"));
const BuildDx = lazy(() => import("./topics/BuildDx.jsx"));
const Security = lazy(() => import("./topics/Security.jsx"));
const Networking = lazy(() => import("./topics/Networking.jsx"));
const Pwa = lazy(() => import("./topics/Pwa.jsx"));
const ArchitecturePatterns = lazy(() => import("./topics/ArchitecturePatterns.jsx"));
const ReusableComponents = lazy(() => import("./topics/ReusableComponents.jsx"));
const ExternalIntegrations = lazy(() => import("./topics/ExternalIntegrations.jsx"));
const ToolingAroundReact = lazy(() => import("./topics/ToolingAroundReact.jsx"));
const Deployment = lazy(() => import("./topics/Deployment.jsx"));
const ModernReact = lazy(() => import("./topics/ModernReact.jsx"));
const AntiPatterns = lazy(() => import("./topics/AntiPatterns.jsx"));
const DocsCollaboration = lazy(() => import("./topics/DocsCollaboration.jsx"));

const TOPICS = [
    { id: "intro", title: "Intro", component: <Intro /> },
    { id: "jsx-rendering", title: "JSX & Rendering", component: <JsxRendering /> },
    { id: "components", title: "Components", component: <Components /> },
    { id: "state-data-flow", title: "State & Data Flow", component: <StateDataFlow /> },
    { id: "core-hooks", title: "Core Hooks", component: <CoreHooks /> },
    { id: "advanced-hooks", title: "Advanced Hooks", component: <AdvancedHooks /> },
    { id: "dom-events", title: "DOM & Events", component: <DomEvents /> },
    { id: "forms-validation", title: "Forms & Validation", component: <FormsValidation /> },
    { id: "styling", title: "Styling", component: <Styling /> },
    { id: "routing", title: "Routing", component: <Routing /> },
    { id: "suspense-code-split", title: "Suspense & Code Split", component: <SuspenseCodeSplit /> },
    { id: "data-fetching-caching", title: "Data Fetching & Caching", component: <DataFetchingCaching /> },
    { id: "state-management", title: "State Management", component: <StateManagement /> },
    { id: "performance", title: "Performance", component: <Performance /> },
    { id: "errors", title: "Errors", component: <Errors /> },
    { id: "i18n", title: "Internationalization (i18n)", component: <I18n /> },
    { id: "animations", title: "Animations", component: <Animations /> },
    { id: "typescript", title: "TypeScript", component: <TypeScript /> },
    { id: "testing", title: "Testing", component: <Testing /> },
    { id: "ssr-rsc", title: "SSR & RSC", component: <SsrRsc /> },
    { id: "build-dx", title: "Build & DX", component: <BuildDx /> },
    { id: "security", title: "Security", component: <Security /> },
    { id: "networking", title: "Networking", component: <Networking /> },
    { id: "pwa", title: "PWA", component: <Pwa /> },
    { id: "architecture-patterns", title: "Architecture & Patterns", component: <ArchitecturePatterns /> },
    { id: "reusable-components", title: "Reusable Components", component: <ReusableComponents /> },
    { id: "external-integrations", title: "External Integrations", component: <ExternalIntegrations /> },
    { id: "tooling-around-react", title: "Tooling Around React", component: <ToolingAroundReact /> },
    { id: "deployment", title: "Deployment", component: <Deployment /> },
    { id: "modern-react", title: "Modern React", component: <ModernReact /> },
    { id: "anti-patterns", title: "Anti-Patterns", component: <AntiPatterns /> },
    { id: "docs-collaboration", title: "Docs & Collaboration", component: <DocsCollaboration /> }
];

const findTopic = (id) => TOPICS.find((t) => t.id === id);
const firstId = TOPICS[0].id;

// Build a safe path using Vite's base (dev "/" or GH Pages "/<repo>/")
const basePath = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "/");
const assetPath = (p) => `${basePath}${p.startsWith("/") ? p.slice(1) : p}`;

// Registry of JSON files per topic
const TOPIC_JSON = {
    intro: [
        "qna/intro/what-is-react.json",
        "qna/intro/spa-vs-mpa.json",
        "qna/intro/project-setup.json",
        "qna/intro/env-files.json" // <-- NEW
    ]
};

// --------- QnA Renderer ----------
function QnaRenderer({ data }) {
    if (!data) return null;

    return (
        <>
            {(data.sections || []).map((section) => (
                <Styled.Section key={section.id}>
                    <Styled.SectionTitle>{section.title}</Styled.SectionTitle>

                    <Styled.List>
                        {(section.questions || []).map((q) => (
                            <Styled.QCard key={q.qid}>
                                <Styled.QTitle>{q.question}</Styled.QTitle>

                                {q.answer_short ? (
                                    <Styled.Answer>{q.answer_short}</Styled.Answer>
                                ) : null}

                                {q.code_short ? (
                                    <Styled.Code>
                                        <code>{q.code_short}</code>
                                    </Styled.Code>
                                ) : null}

                                <Styled.MetaRow>
                                    {q.difficulty ? <Styled.Badge>{q.difficulty}</Styled.Badge> : null}
                                    {Array.isArray(q.tags) &&
                                        q.tags.slice(0, 4).map((t) => <Styled.Tag key={t}>{t}</Styled.Tag>)}
                                    {q.notes_ref ? (
                                        <Styled.NoteLink href={q.notes_ref}>
                                            Open notes ↗
                                        </Styled.NoteLink>
                                    ) : null}
                                </Styled.MetaRow>
                            </Styled.QCard>
                        ))}
                    </Styled.List>
                </Styled.Section>
            ))}
        </>
    );
}

const QnA = () => {
    // initialize from URL hash if valid, else first topic
    const [selected, setSelected] = useState(() => {
        const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
        return findTopic(hash)?.id || firstId;
    });

    // --- Intro JSON state ---
    const [introData, setIntroData] = useState(null);
    const [introLoading, setIntroLoading] = useState(false);
    const [introError, setIntroError] = useState(null);

    // keep URL hash in sync
    useEffect(() => {
        const current = `#${encodeURIComponent(selected)}`;
        if (window.location.hash !== current) {
            window.history.pushState(null, "", current);
        }
    }, [selected]);

    // respond to back/forward
    useEffect(() => {
        const onHash = () => {
            const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
            if (findTopic(hash)) setSelected(hash);
        };
        window.addEventListener("hashchange", onHash);
        return () => window.removeEventListener("hashchange", onHash);
    }, []);

    // Reset intro state when leaving topic (optional cache)
    useEffect(() => {
        if (selected !== "intro") {
            setIntroLoading(false);
            setIntroError(null);
            // keep introData cached for instant return; uncomment next line to clear:
            // setIntroData(null);
        }
    }, [selected]);

    // Load Intro JSONs when Intro is selected
    useEffect(() => {
        if (selected !== "intro") return;
        if (introData || introLoading) return;

        (async () => {
            try {
                setIntroError(null);
                setIntroLoading(true);

                const list = TOPIC_JSON[selected] || [];
                if (!list.length) throw new Error(`No JSON registered for topic: ${selected}`);

                const urls = list.map((p) => assetPath(p));
                const res = await Promise.all(urls.map((u) => fetch(u, { cache: "no-store" })));
                const bad = res.find((r) => !r.ok);
                if (bad) throw new Error(`Failed to load ${bad.url} (${bad.status})`);

                const parsed = await Promise.all(
                    res.map(async (r) => {
                        try {
                            return await r.json();
                        } catch {
                            throw new Error(`Invalid JSON in ${r.url}`);
                        }
                    })
                );

                // merge: first file as base, concat sections, sum totals
                const base = parsed[0] || {};
                const merged = {
                    ...base,
                    total_questions: parsed.reduce((sum, f) => sum + (f.total_questions || 0), 0),
                    sections: parsed.flatMap((f) => f.sections || [])
                };

                setIntroData(merged);
            } catch (err) {
                setIntroError(err?.message || "Failed to load Intro data.");
            } finally {
                setIntroLoading(false);
            }
        })();
    }, [selected, introData, introLoading]);

    const Active = useMemo(() => findTopic(selected)?.component ?? null, [selected]);

    return (
        <Styled.Wrapper>
            <Styled.Heading>Questions and Answers</Styled.Heading>

            <Styled.TopicsWrapper>
                <label htmlFor="topic-select" style={{ display: "none" }}>
                    Select Topic
                </label>
                <TopicPicker
                    topics={TOPICS}
                    selected={selected}
                    onChange={(id) => setSelected(id)}
                />
            </Styled.TopicsWrapper>

            <Styled.ContentWrapper>
                <Suspense
                    fallback={
                        <Box style={{ padding: 16 }}>
                            <CircularProgress />
                        </Box>
                    }
                >
                    {selected === "intro" ? (
                        introLoading ? (
                            <Box style={{ padding: 16 }}>
                                <CircularProgress />
                            </Box>
                        ) : introError ? (
                            <Box style={{ padding: 16, color: "tomato" }}>{introError}</Box>
                        ) : introData ? (
                            <QnaRenderer data={introData} />
                        ) : (
                            <Box style={{ padding: 16 }}>No data.</Box>
                        )
                    ) : (
                        Active
                    )}
                </Suspense>
            </Styled.ContentWrapper>
        </Styled.Wrapper>
    );
};

export default QnA;

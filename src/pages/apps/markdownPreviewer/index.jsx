import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styled } from "./styled";

/* light, dependency-free markdown → html converter
   - supports: #..######, **bold**, _italic_, `inline`, ``` fenced ```
   - lists (-, *, 1.), > blockquotes, --- hr, links, images
   - escapes HTML first, then applies inline rules
   This is intentionally tiny and “good enough” for a personal previewer. */

const STORAGE_KEY = "markdown-previewer:text";

function escapeHtml(s = "") {
    return s
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function safeUrl(url = "") {
    return /^https?:\/\//i.test(url) ? url : "#";
}

function inlineMd(s) {
    // order matters: code → images → links → bold → italic
    let t = s;

    // inline code
    t = t.replace(/`([^`]+)`/g, (_, a) => `<code>${escapeHtml(a)}</code>`);

    // images ![alt](url)
    t = t.replace(/!\[([^\]]*?)\]\((.*?)\)/g, (_, alt, url) => {
        const u = safeUrl(url.trim());
        return `<img src="${u}" alt="${escapeHtml(alt)}" />`;
    });

    // links [text](url)
    t = t.replace(/\[([^\]]+)\]\((.*?)\)/g, (_, text, url) => {
        const u = safeUrl(url.trim());
        const label = escapeHtml(text);
        return `<a href="${u}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    });

    // bold **text**
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

    // italic _text_ (kept simple)
    t = t.replace(/(^|[^_])_([^_]+)_/g, (_, pre, a) => `${pre}<em>${a}</em>`);

    return t;
}

function mdToHtml(md = "") {
    const lines = md.replaceAll("\r\n", "\n").split("\n");

    let html = "";
    let inCode = false;
    let inUl = false;
    let inOl = false;
    let inQuote = false;

    const closeLists = () => {
        if (inUl) { html += "</ul>"; inUl = false; }
        if (inOl) { html += "</ol>"; inOl = false; }
    };

    const closeQuote = () => {
        if (inQuote) { html += "</blockquote>"; inQuote = false; }
    };

    for (let raw of lines) {
        const line = raw; // keep raw for code blocks

        // Fenced code
        if (/^\s*```/.test(line)) {
            if (!inCode) {
                closeLists();
                closeQuote();
                inCode = true;
                html += `<pre><code>`;
            } else {
                inCode = false;
                html += `</code></pre>`;
            }
            continue;
        }

        if (inCode) {
            html += escapeHtml(line) + "\n";
            continue;
        }

        // Horizontal rule
        if (/^\s*-{3,}\s*$/.test(line)) {
            closeLists();
            closeQuote();
            html += "<hr/>";
            continue;
        }

        // Blockquote
        if (/^\s*>\s+/.test(line)) {
            const content = line.replace(/^\s*>\s+/, "");
            if (!inQuote) {
                closeLists();
                inQuote = true;
                html += "<blockquote>";
            }
            html += `<p>${inlineMd(escapeHtml(content))}</p>`;
            continue;
        } else {
            closeQuote();
        }

        // Headings
        const m = line.match(/^\s*(#{1,6})\s+(.*)$/);
        if (m) {
            closeLists();
            const level = m[1].length;
            const text = inlineMd(escapeHtml(m[2]));
            html += `<h${level}>${text}</h${level}>`;
            continue;
        }

        // Unordered list
        if (/^\s*[-*]\s+/.test(line)) {
            const item = line.replace(/^\s*[-*]\s+/, "");
            if (!inUl) {
                closeQuote();
                closeLists();
                inUl = true;
                html += "<ul>";
            }
            html += `<li>${inlineMd(escapeHtml(item))}</li>`;
            continue;
        }

        // Ordered list
        if (/^\s*\d+\.\s+/.test(line)) {
            const item = line.replace(/^\s*\d+\.\s+/, "");
            if (!inOl) {
                closeQuote();
                closeLists();
                inOl = true;
                html += "<ol>";
            }
            html += `<li>${inlineMd(escapeHtml(item))}</li>`;
            continue;
        }

        // Paragraph or blank
        if (line.trim() === "") {
            closeLists();
            html += "<br/>";
        } else {
            closeLists();
            html += `<p>${inlineMd(escapeHtml(line))}</p>`;
        }
    }

    // close any remaining blocks
    if (inCode) html += "</code></pre>";
    if (inUl) html += "</ul>";
    if (inOl) html += "</ol>";
    if (inQuote) html += "</blockquote>";

    return html;
}

const SAMPLE = `# Markdown Previewer

Type on the left, preview on the right.

- **Bold**, _italic_, and \`inline code\`
- Lists, links, images, quotes

> Keep it simple.

\`\`\`
function hello() {
  console.log("hi");
}
\`\`\`

[OpenAI](https://openai.com)
`;

export default function MarkdownPreviewer() {
    const [text, setText] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ?? SAMPLE;
    });
    const [copied, setCopied] = useState(false);
    const saveTimer = useRef(null);

    // persist (debounced)
    useEffect(() => {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, text);
        }, 300);
        return () => clearTimeout(saveTimer.current);
    }, [text]);

    const html = useMemo(() => mdToHtml(text), [text]);

    const onClear = () => {
        if (!window.confirm("Clear the editor? This will remove current text.")) return;
        setText("");
        localStorage.removeItem(STORAGE_KEY);
    };

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {
            // ignore
        }
    };

    const onDownload = () => {
        const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "note.md";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);
    };

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <h2>Markdown Previewer</h2>
                <Styled.Actions>
                    <button onClick={onCopy}>{copied ? "Copied" : "Copy"}</button>
                    <button onClick={onDownload}>Download .md</button>
                    <button className="danger" onClick={onClear}>Clear</button>
                </Styled.Actions>
            </Styled.Header>

            <Styled.Panels>
                <Styled.Editor>
                    <label htmlFor="mdEditor">Editor</label>
                    <textarea
                        id="mdEditor"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        spellCheck="false"
                        placeholder="# Start typing…"
                    />
                </Styled.Editor>

                <Styled.Preview>
                    <div className="preview" dangerouslySetInnerHTML={{ __html: html }} />
                </Styled.Preview>
            </Styled.Panels>
        </Styled.Wrapper>
    );
}

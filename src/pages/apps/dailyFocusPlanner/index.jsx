import { useEffect, useMemo, useState } from "react";
import { Styled } from "./styled";

/* ------------------------------- Helpers ------------------------------- */
const STORAGE_PREFIX = "dfp_"; // dfp_YYYYMMDD

const yyyymmdd = (d) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
        d.getDate()
    ).padStart(2, "0")}`;

const prettyDate = (d) =>
    d
        .toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        })
        .replace(",", "");

const addDays = (d, n) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
};

// Build pairs like ["06:00","06:30"], ["07:00","07:30"], ... till 23:30
const buildPairs = (startHour = 6, endHour = 23) => {
    const pairs = [];
    for (let h = startHour; h <= endHour; h++) {
        const hh = String(h).padStart(2, "0");
        pairs.push([`${hh}:00`, `${hh}:30`]);
    }
    return pairs;
};

/* ------------------------------ Component ------------------------------ */
export default function DailyFocusPlanner() {
    const [date, setDate] = useState(() => new Date());
    const [tasks, setTasks] = useState([]);
    const [blocks, setBlocks] = useState({}); // {"06:00": "Gym", ...}
    const [newTask, setNewTask] = useState("");

    const key = useMemo(() => STORAGE_PREFIX + yyyymmdd(date), [date]);
    const pairs = useMemo(() => buildPairs(6, 23), []);

    // Load per-date state
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(key) || "null");
            if (saved) {
                setTasks(saved.tasks || []);
                setBlocks(saved.blocks || {});
            } else {
                setTasks([]);
                setBlocks({});
            }
        } catch {
            setTasks([]);
            setBlocks({});
        }
    }, [key]);

    // Persist per-date state
    useEffect(() => {
        const payload = { tasks, blocks };
        localStorage.setItem(key, JSON.stringify(payload));
    }, [key, tasks, blocks]);

    /* ------------------------------ Tasks ------------------------------ */
    const addTask = () => {
        const t = newTask.trim();
        if (!t) return;
        setTasks((arr) => [{ id: Date.now(), text: t, done: false }, ...arr]);
        setNewTask("");
    };

    // UPDATED: ask for confirmation before deleting a task
    const deleteTask = (id) =>
        setTasks((arr) => {
            const task = arr.find((t) => t.id === id);
            if (!task) return arr;
            const ok = confirm(`Delete task:\n"${task.text}"?`);
            if (!ok) return arr;
            return arr.filter((t) => t.id !== id);
        });

    const toggleTask = (id) =>
        setTasks((arr) => arr.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

    /* ---------------------------- Time Blocks --------------------------- */
    const setBlockValue = (slot, value) =>
        setBlocks((b) => ({ ...b, [slot]: value }));

    /* ------------------------------ Actions ----------------------------- */
    const handleResetDay = () => {
        if (!confirm("Clear all tasks and time blocks for this day?")) return;
        setTasks([]);
        setBlocks({});
    };

    const handlePrint = () => {
        // Build minimal print HTML (only planner)
        const css = `
      @page { size: A4; margin: 12mm; }
      * { box-sizing: border-box; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial; }
      h1,h2,h3 { margin: 0; }
      .muted { color: #555; font-size: 12px; }
      .head { display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px; }
      .grid { display:grid; grid-template-columns: 1.2fr 2fr; gap: 12px; }
      .card { border: 1px solid #ddd; border-radius: 10px; padding: 12px; }
      .tasks li { display:flex; align-items:center; gap:8px; margin: 4px 0; }
      .tasks .done { text-decoration: line-through; color: #666; }
      .slots { display:grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .slot { display:grid; grid-template-columns: 70px 1fr; gap: 8px; align-items:center; }
      .slot input { width:100%; border:1px solid #ccc; border-radius: 8px; padding: 6px 8px; }
      .time { font-weight: 600; }
    `;

        const tasksHtml = tasks
            .map(
                (t) => `<li><span class="${t.done ? "done" : ""}">${escapeHtml(t.text)}</span></li>`
            )
            .join("");

        const slotsHtml = buildPairs(6, 23)
            .map(([a, b]) => {
                const va = blocks[a] || "";
                const vb = blocks[b] || "";
                return `
        <div class="slot"><div class="time">${a}</div><input value="${escapeAttr(
                    va
                )}" readonly></div>
        <div class="slot"><div class="time">${b}</div><input value="${escapeAttr(
                    vb
                )}" readonly></div>`;
            })
            .join("");

        const html = `<!doctype html>
<html>
<head><meta charset="utf-8"/><title>Daily Focus - ${prettyDate(
            date
        )}</title><style>${css}</style></head>
<body>
  <div class="head">
    <h2>Daily Focus Planner</h2>
    <div class="muted">${prettyDate(date)}</div>
  </div>
  <div class="grid">
    <div class="card">
      <h3>Tasks</h3>
      <ul class="tasks">${tasksHtml || `<li class="muted">No tasks</li>`}</ul>
    </div>
    <div class="card">
      <h3>Time Blocks</h3>
      <div class="slots">${slotsHtml}</div>
    </div>
  </div>
  <script>window.print()</script>
</body>
</html>`;

        const w = window.open("", "_blank", "width=900,height=1100");
        if (!w) return alert("Popup blocked. Allow popups to print.");
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.focus();
    };

    function escapeHtml(s = "") {
        return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }
    function escapeAttr(s = "") {
        return escapeHtml(String(s)).replace(/"/g, "&quot;");
    }

    /* --------------------------------- UI -------------------------------- */
    return (
        <Styled.Wrapper>
            <Styled.Header className="no-print">
                <Styled.TitleRow>
                    <Styled.Title>Daily Focus Planner</Styled.Title>
                    <Styled.Actions>
                        <Styled.Button onClick={() => setDate(addDays(date, -1))} title="Previous day">⟨ Prev</Styled.Button>
                        <Styled.DatePill>
                            <Styled.CalendarIcon aria-hidden />
                            <span>{prettyDate(date)}</span>
                        </Styled.DatePill>
                        <Styled.Button onClick={() => setDate(addDays(date, 1))} title="Next day">Next ⟩</Styled.Button>
                        <Styled.Button onClick={handlePrint} $variant="ghost">Print</Styled.Button>
                        <Styled.Button onClick={handleResetDay} $variant="danger">Reset Day</Styled.Button>
                    </Styled.Actions>
                </Styled.TitleRow>
                <Styled.Subtitle className="muted">Autosaves per date • 30-minute blocks</Styled.Subtitle>
            </Styled.Header>

            <Styled.Main>
                <Styled.Grid>
                    {/* Left: Tasks */}
                    <Styled.Card>
                        <Styled.CardHead>
                            <Styled.CardTitle>Tasks</Styled.CardTitle>
                            <div />
                        </Styled.CardHead>

                        <Styled.TaskAdd>
                            <input
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                placeholder="Add a task and press Enter"
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTask())}
                            />
                            <Styled.Button onClick={addTask}>Add</Styled.Button>
                        </Styled.TaskAdd>

                        <Styled.TaskList>
                            {tasks.length === 0 && (
                                <Styled.Empty>No tasks yet.</Styled.Empty>
                            )}
                            {tasks.map((t) => (
                                <Styled.TaskItem key={t.id}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={t.done}
                                            onChange={() => toggleTask(t.id)}
                                        />
                                        <span className={t.done ? "done" : ""}>{t.text}</span>
                                    </label>
                                    <Styled.IconBtn onClick={() => deleteTask(t.id)} title="Delete">✕</Styled.IconBtn>
                                </Styled.TaskItem>
                            ))}
                        </Styled.TaskList>
                    </Styled.Card>

                    {/* Right: Time blocks */}
                    <Styled.Card>
                        <Styled.CardHead>
                            <Styled.CardTitle>Time Blocks</Styled.CardTitle>
                        </Styled.CardHead>

                        <Styled.Slots>
                            {pairs.map(([a, b]) => (
                                <Styled.SlotRow key={a}>
                                    <Styled.Slot>
                                        <Styled.TimeLabel>{a}</Styled.TimeLabel>
                                        <input
                                            value={blocks[a] || ""}
                                            onChange={(e) => setBlockValue(a, e.target.value)}
                                            placeholder="Plan / notes"
                                        />
                                    </Styled.Slot>
                                    <Styled.Slot>
                                        <Styled.TimeLabel>{b}</Styled.TimeLabel>
                                        <input
                                            value={blocks[b] || ""}
                                            onChange={(e) => setBlockValue(b, e.target.value)}
                                            placeholder="Plan / notes"
                                        />
                                    </Styled.Slot>
                                </Styled.SlotRow>
                            ))}
                        </Styled.Slots>
                    </Styled.Card>
                </Styled.Grid>
            </Styled.Main>
        </Styled.Wrapper>
    );
}

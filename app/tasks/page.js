"use client";

import { useState } from "react";
import { useStore, uid } from "@/lib/useStore";

const VIEWS = [
  { id: "today", label: "Today", icon: "⭐" },
  { id: "upcoming", label: "Upcoming", icon: "📅" },
  { id: "board", label: "Board", icon: "▦" }
];

const LANE_COLORS = ["#3b82f6", "#a855f7", "#ef4444", "#f97316", "#22c55e", "#06b6d4", "#eab308"];

export default function TasksPage() {
  const [state, update] = useStore("tasks");
  const [view, setView] = useState("today");
  const [laneId, setLaneId] = useState(null);
  const [newTask, setNewTask] = useState("");
  const [newTaskLane, setNewTaskLane] = useState("");

  if (!state) return <div className="muted">Loading…</div>;

  const activeLane = state.lanes.find((l) => l.id === laneId);

  const addTask = (lane, due) => {
    if (!newTask.trim()) return;
    update({
      ...state,
      tasks: [...state.tasks, { id: uid(), title: newTask.trim(), lane, done: false, due: due || null }]
    });
    setNewTask("");
  };

  const toggleTask = (id) =>
    update({ ...state, tasks: state.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) });

  const setLaneField = (field, value) =>
    update({ ...state, lanes: state.lanes.map((l) => (l.id === laneId ? { ...l, [field]: value } : l)) });

  const addLane = () => {
    const name = prompt("Lane name:");
    if (!name?.trim()) return;
    const id = uid();
    update({
      ...state,
      lanes: [
        ...state.lanes,
        { id, name: name.trim(), color: LANE_COLORS[state.lanes.length % LANE_COLORS.length], status: "", shortGoal: "", longGoal: "" }
      ]
    });
  };

  const openTasks = (laneIdArg) => state.tasks.filter((t) => t.lane === laneIdArg && !t.done);

  const taskRow = (t) => (
    <div key={t.id} className={`item-row ${t.done ? "done" : ""}`} style={{ cursor: "pointer" }} onClick={() => toggleTask(t.id)}>
      <span className={`checkbox ${t.done ? "checked" : ""}`} />
      <span className="item-title">{t.title}</span>
    </div>
  );

  return (
    <div className="tasks-layout">
      <nav className="tasks-nav">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            className={`nav-item ${view === v.id && !laneId ? "active" : ""}`}
            style={{ width: "100%", textAlign: "left" }}
            onClick={() => { setView(v.id); setLaneId(null); }}
          >
            <span>{v.icon}</span> {v.label}
          </button>
        ))}
        <div className="section-label">Lanes</div>
        {state.lanes.map((l) => (
          <button
            key={l.id}
            className={`nav-item ${laneId === l.id ? "active" : ""}`}
            style={{ width: "100%", textAlign: "left" }}
            onClick={() => setLaneId(l.id)}
          >
            <span className="dot" style={{ background: l.color }} /> {l.name}
          </button>
        ))}
        <button className="nav-item" style={{ width: "100%", textAlign: "left" }} onClick={addLane}>
          <span>＋</span> New lane
        </button>
      </nav>

      <section style={{ flex: 1 }}>
        {activeLane ? (
          <>
            <div className="page-head-row">
              <h1 className="page-title lane-head">
                <span className="dot" style={{ background: activeLane.color, width: 12, height: 12 }} />
                {activeLane.name}
              </h1>
              <span className="head-meta">{openTasks(activeLane.id).length} open</span>
            </div>

            <div className="goal-grid">
              {[
                ["status", "Current status"],
                ["shortGoal", "Short-term goal"],
                ["longGoal", "Long-term goal"]
              ].map(([field, label]) => (
                <div className="goal-box" key={field}>
                  <label>{label}</label>
                  <textarea
                    value={activeLane[field] || ""}
                    placeholder={field === "longGoal" ? "The big picture…" : "…"}
                    onChange={(e) => setLaneField(field, e.target.value)}
                  />
                </div>
              ))}
            </div>

            {state.tasks.filter((t) => t.lane === activeLane.id).map(taskRow)}

            <div className="add-row">
              <span>＋</span>
              <input
                placeholder="Add task"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask(activeLane.id)}
              />
            </div>
          </>
        ) : view === "board" ? (
          <>
            <h1 className="page-title">Board</h1>
            <div className="board-grid">
              {state.lanes.map((l) => (
                <div className="card" key={l.id}>
                  <div className="card-head">
                    <span className="card-title lane-head">
                      <span className="dot" style={{ background: l.color }} /> {l.name}
                    </span>
                    <span className="count-pill">{openTasks(l.id).length}</span>
                  </div>
                  {state.tasks.filter((t) => t.lane === l.id).map(taskRow)}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="page-head-row">
              <h1 className="page-title">{view === "today" ? "Today" : "Upcoming"}</h1>
              <span className="head-meta">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </span>
            </div>
            <div className="spacer" />
            {state.tasks.filter((t) => t.due === view && !t.done).length === 0 ? (
              <p className="empty-note">Nothing scheduled for {view === "today" ? "today" : "later"}</p>
            ) : (
              state.tasks.filter((t) => t.due === view).map(taskRow)
            )}
            <div className="add-row" style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
              <span>＋</span>
              <input
                placeholder="Add task"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask(newTaskLane || state.lanes[0]?.id, view)}
              />
              <select value={newTaskLane} onChange={(e) => setNewTaskLane(e.target.value)}>
                {state.lanes.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

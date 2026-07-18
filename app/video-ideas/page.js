"use client";

import { useState } from "react";
import { useStore, uid } from "@/lib/useStore";

export default function VideoIdeasPage() {
  const [state, update] = useStore("ideas");
  const [drafts, setDrafts] = useState({});
  const [editing, setEditing] = useState(null); // idea id being edited

  if (!state) return <div className="muted">Loading…</div>;

  const mutateBoard = (boardId, fn) =>
    update({
      ...state,
      boards: state.boards.map((b) => (b.id === boardId ? fn(b) : b))
    });

  const addIdea = (boardId) => {
    const title = (drafts[boardId] || "").trim();
    if (!title) return;
    mutateBoard(boardId, (b) => ({
      ...b,
      ideas: [...b.ideas, { id: uid(), title, done: false, script: "", description: "" }]
    }));
    setDrafts({ ...drafts, [boardId]: "" });
  };

  const toggle = (boardId, ideaId) =>
    mutateBoard(boardId, (b) => ({
      ...b,
      ideas: b.ideas.map((i) => (i.id === ideaId ? { ...i, done: !i.done } : i))
    }));

  const setIdeaField = (boardId, ideaId, field, value) =>
    mutateBoard(boardId, (b) => ({
      ...b,
      ideas: b.ideas.map((i) => (i.id === ideaId ? { ...i, [field]: value } : i))
    }));

  return (
    <>
      <h1 className="page-title">🎬 Video Ideas</h1>
      <p className="page-sub">
        Capture ideas quickly, then double-click one to add the title, script, and description.
      </p>

      <div className="board-grid">
        {state.boards.map((board) => (
          <div className="card" key={board.id}>
            <div className="card-head">
              <span className="card-title">{board.name}</span>
              <span className="count-pill">{board.ideas.filter((i) => !i.done).length}</span>
            </div>
            <div className="card-desc">{board.desc}</div>

            {board.ideas.map((idea) => (
              <div key={idea.id}>
                <div
                  className={`item-row ${idea.done ? "done" : ""}`}
                  onDoubleClick={() => setEditing(editing === idea.id ? null : idea.id)}
                >
                  <span
                    className={`checkbox ${idea.done ? "checked" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => toggle(board.id, idea.id)}
                  />
                  <span className="item-title">{idea.title}</span>
                </div>
                {editing === idea.id && (
                  <div className="card" style={{ marginTop: 8 }}>
                    <div className="goal-box">
                      <label>Title</label>
                      <input
                        style={{ width: "100%" }}
                        value={idea.title}
                        onChange={(e) => setIdeaField(board.id, idea.id, "title", e.target.value)}
                      />
                    </div>
                    <div className="goal-box" style={{ marginTop: 10 }}>
                      <label>Script</label>
                      <textarea
                        style={{ width: "100%", minHeight: 90 }}
                        value={idea.script}
                        onChange={(e) => setIdeaField(board.id, idea.id, "script", e.target.value)}
                      />
                    </div>
                    <div className="goal-box" style={{ marginTop: 10 }}>
                      <label>Description</label>
                      <textarea
                        style={{ width: "100%", minHeight: 60 }}
                        value={idea.description}
                        onChange={(e) => setIdeaField(board.id, idea.id, "description", e.target.value)}
                      />
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <button className="btn" onClick={() => setEditing(null)}>Done</button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="add-row">
              <span>＋</span>
              <input
                placeholder="Add an idea"
                value={drafts[board.id] || ""}
                onChange={(e) => setDrafts({ ...drafts, [board.id]: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addIdea(board.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

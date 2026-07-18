"use client";

import { useState } from "react";
import { useStore, uid } from "@/lib/useStore";

export default function ChannelsPage() {
  const [state, update] = useStore("channels");
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");

  if (!state) return <div className="muted">Loading…</div>;

  const categories = [...new Set(state.pool.map((c) => c.category))];

  const addChannel = () => {
    if (!newUrl.trim()) return;
    const url = newUrl.trim();
    const handleMatch = url.match(/@[\w.-]+/);
    update({
      ...state,
      pool: [
        ...state.pool,
        {
          id: uid(),
          name: newName.trim() || (handleMatch ? handleMatch[0] : url),
          handle: handleMatch ? handleMatch[0] : "",
          url: url.startsWith("http") ? url : `https://www.youtube.com/${url.startsWith("@") ? url : "@" + url}`,
          category: "Uncategorized",
          subs: "",
          notes: ""
        }
      ]
    });
    setNewName("");
    setNewUrl("");
  };

  const removeChannel = (id) => {
    update({ ...state, pool: state.pool.filter((c) => c.id !== id) });
  };

  return (
    <>
      <h1 className="page-title">📺 Channel Pool</h1>
      <p className="page-sub">
        AI-focused YouTube channels to pull ideas, trends, and newsletter sources from.
      </p>

      <div className="form-row">
        <input
          placeholder="Channel name (optional)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addChannel()}
          style={{ maxWidth: 220 }}
        />
        <input
          placeholder="Channel URL or @handle…"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addChannel()}
        />
        <button className="btn" onClick={addChannel}>Add channel</button>
      </div>

      <div className="stats-row">
        <span className="stat"><b>{state.pool.length}</b> channels</span>
        <span className="stat"><b>{categories.length}</b> categories</span>
      </div>

      {state.pool.length === 0 && <p className="empty-note">No channels yet — add one above.</p>}

      {categories.map((cat) => (
        <div key={cat}>
          <div className="spacer" />
          <h3>{cat}</h3>
          {state.pool
            .filter((c) => c.category === cat)
            .map((c) => (
              <div className="card draft-card" key={c.id}>
                <div className="card-head">
                  <span>
                    <b>{c.name}</b>{" "}
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="muted"
                      style={{ fontSize: 13, marginLeft: 6 }}
                    >
                      {c.handle || c.url}
                    </a>
                    {c.subs && <span className="draft-tag" style={{ marginLeft: 8 }}>{c.subs} subs</span>}
                  </span>
                  <button className="btn" onClick={() => removeChannel(c.id)}>Remove</button>
                </div>
                {c.notes && (
                  <div className="muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
                    {c.notes}
                  </div>
                )}
              </div>
            ))}
        </div>
      ))}
    </>
  );
}

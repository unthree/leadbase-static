"use client";

import { useState } from "react";
import { useStore, uid, apiFetch, StoreStatus } from "@/lib/useStore";

export default function VideoResearchPage() {
  const [state, update] = useStore("research");
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(null);

  if (!state || state.__error) return <StoreStatus state={state} />;

  const run = async () => {
    if (!topic.trim() || busy) return;
    setBusy(true);
    const res = await apiFetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "research", input: topic.trim() })
    });
    const result = await res.json();
    const entry = {
      id: uid(),
      topic: topic.trim(),
      output: result.text,
      ok: result.ok,
      model: result.model,
      at: new Date().toISOString()
    };
    update({ ...state, history: [entry, ...state.history] });
    setOpen(entry.id);
    setTopic("");
    setBusy(false);
  };

  return (
    <>
      <h1 className="page-title">🔍 Video Research</h1>
      <p className="page-sub">Drop in a topic — get titles, a hook, an outline, and thumbnail concepts.</p>

      <div className="form-row">
        <input
          placeholder="e.g. Why local AI models are about to win"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
        />
        <button className="btn primary" onClick={run} disabled={busy}>
          {busy ? "Researching…" : "Research"}
        </button>
      </div>

      {state.history.length === 0 && <p className="empty-note">No research yet.</p>}
      {state.history.map((h) => (
        <div className="card draft-card" key={h.id}>
          <div className="card-head">
            <span><b>{h.topic}</b></span>
            <button className="btn" onClick={() => setOpen(open === h.id ? null : h.id)}>
              {open === h.id ? "Close" : "Open"}
            </button>
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
            {new Date(h.at).toLocaleString()} · {h.model}
          </div>
          {open === h.id && <div className="mono-output">{h.output}</div>}
        </div>
      ))}
    </>
  );
}

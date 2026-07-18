"use client";

import { useState } from "react";
import { useStore, uid, apiFetch, StoreStatus } from "@/lib/useStore";

const STATUSES = ["prospect", "contacted", "negotiating", "closed", "passed"];

export default function SponsorshipsPage() {
  const [state, update] = useStore("sponsors");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState("");

  if (!state || state.__error) return <StoreStatus state={state} />;

  const add = () => {
    if (!name.trim()) return;
    update({
      ...state,
      prospects: [{ id: uid(), name: name.trim(), status: "prospect", notes: "" }, ...state.prospects]
    });
    setName("");
  };

  const setField = (id, field, value) =>
    update({
      ...state,
      prospects: state.prospects.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    });

  const suggest = async () => {
    setBusy(true);
    const res = await apiFetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "sponsors",
        input:
          "Channel: AI tools, agents, and build-in-public software content for creators and indie developers. Newsletter on the same topics."
      })
    });
    const result = await res.json();
    setSuggestions(result.text);
    setBusy(false);
  };

  return (
    <>
      <h1 className="page-title">🤝 Sponsorship Finder</h1>
      <p className="page-sub">Track sponsor prospects and let the agent surface new ones.</p>

      <div className="form-row">
        <input
          placeholder="Add a sponsor prospect…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button className="btn" onClick={add}>Add</button>
        <button className="btn primary" onClick={suggest} disabled={busy}>
          {busy ? "Thinking…" : "✦ Suggest sponsors"}
        </button>
      </div>

      {state.prospects.length === 0 && <p className="empty-note">No prospects yet.</p>}
      {state.prospects.map((p) => (
        <div className="item-row" key={p.id}>
          <span style={{ flex: 1 }}>{p.name}</span>
          <select value={p.status} onChange={(e) => setField(p.id, "status", e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      ))}

      {suggestions && <div className="mono-output">{suggestions}</div>}
    </>
  );
}

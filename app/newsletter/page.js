"use client";

import { useState } from "react";
import { useStore, uid } from "@/lib/useStore";

const TABS = ["Overview", "Drafts", "Sources", "Runs", "Settings"];

export default function NewsletterPage() {
  const [state, update] = useStore("newsletter");
  const [tab, setTab] = useState("Overview");
  const [newSource, setNewSource] = useState("");
  const [generating, setGenerating] = useState(false);
  const [openDraft, setOpenDraft] = useState(null);

  if (!state) return <div className="muted">Loading…</div>;

  const unused = state.sources.filter((s) => !s.used).length;
  const lastRun = state.runs[0];

  const addSource = () => {
    if (!newSource.trim()) return;
    update({
      ...state,
      sources: [...state.sources, { id: uid(), url: newSource.trim(), used: false, addedAt: new Date().toISOString() }]
    });
    setNewSource("");
  };

  const generateDraft = async () => {
    setGenerating(true);
    const material = state.sources
      .filter((s) => !s.used)
      .map((s) => `- ${s.url}`)
      .join("\n");
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "newsletter",
        input: `Source material:\n${material || "(no sources yet — write a short placeholder issue about building your own mission control)"}`
      })
    });
    const result = await res.json();
    const now = new Date();
    const [subject, ...rest] = (result.text || "").split("\n");
    const next = {
      ...state,
      runs: [
        { id: uid(), at: now.toISOString(), ok: result.ok, model: result.model },
        ...state.runs
      ]
    };
    if (result.ok) {
      next.drafts = [
        {
          id: uid(),
          title: subject.replace(/^Subject:\s*/i, "").trim() || "Untitled draft",
          body: rest.join("\n").trim(),
          date: now.toISOString()
        },
        ...state.drafts
      ];
      next.sources = state.sources.map((s) => ({ ...s, used: true }));
    } else {
      alert(result.text);
    }
    update(next);
    setGenerating(false);
  };

  return (
    <>
      <h1 className="page-title">Newsletter Studio</h1>
      <p className="page-sub">Your X + YouTube content, repurposed into ready-to-send drafts.</p>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <>
          <div className="stats-row">
            <span className="stat"><b>{state.sources.length}</b> sources</span>
            <span className="stat"><b>{unused}</b> unused</span>
            <span className="stat muted">
              Last run:{" "}
              {lastRun
                ? `${lastRun.ok ? "success" : "failed"} · ${new Date(lastRun.at).toLocaleString()}`
                : "never"}
            </span>
            <span style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              <button className="btn" onClick={() => setTab("Sources")}>⟳ Sync sources</button>
              <button className="btn primary" onClick={generateDraft} disabled={generating}>
                {generating ? "Generating…" : "✦ Generate draft"}
              </button>
            </span>
          </div>

          <div className="card">
            <div className="card-title">Finish setup</div>
            <div className="item-row">
              <span className="checkbox" />
              <span>
                Email delivery (Resend) <span className="draft-tag">DELIVERY</span>
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                  RESEND_API_KEY + NEWSLETTER_EMAIL_TO — emails you each finished draft
                </div>
              </span>
            </div>
          </div>

          <div className="spacer" />
          <h3>Latest drafts</h3>
          {state.drafts.length === 0 && <p className="empty-note">No drafts yet — add sources and hit Generate draft.</p>}
          {state.drafts.slice(0, 3).map((d) => (
            <div className="card draft-card" key={d.id}>
              <div className="card-head">
                <span>
                  <span className="draft-tag">draft</span>
                  <b>{d.title}</b>
                </span>
                <button className="btn" onClick={() => { setOpenDraft(d.id); setTab("Drafts"); }}>Open</button>
              </div>
              <div className="draft-body">
                {new Date(d.date).toLocaleDateString()} · {d.body.slice(0, 140)}…
              </div>
            </div>
          ))}
        </>
      )}

      {tab === "Drafts" && (
        <>
          {state.drafts.length === 0 && <p className="empty-note">No drafts yet.</p>}
          {state.drafts.map((d) => (
            <div className="card draft-card" key={d.id}>
              <div className="card-head">
                <span><span className="draft-tag">draft</span><b>{d.title}</b></span>
                <button className="btn" onClick={() => setOpenDraft(openDraft === d.id ? null : d.id)}>
                  {openDraft === d.id ? "Close" : "Open"}
                </button>
              </div>
              {openDraft === d.id && <div className="mono-output">{d.body}</div>}
            </div>
          ))}
        </>
      )}

      {tab === "Sources" && (
        <>
          <div className="form-row">
            <input
              placeholder="Paste a tweet URL, video link, or note…"
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSource()}
            />
            <button className="btn" onClick={addSource}>Add source</button>
          </div>
          {state.sources.length === 0 && <p className="empty-note">No sources yet.</p>}
          {state.sources.map((s) => (
            <div className="item-row" key={s.id}>
              <span className={`checkbox ${s.used ? "checked" : ""}`} />
              <span style={{ wordBreak: "break-all" }}>{s.url}</span>
              <span className="muted" style={{ marginLeft: "auto", fontSize: 12 }}>
                {s.used ? "used" : "unused"}
              </span>
            </div>
          ))}
        </>
      )}

      {tab === "Runs" && (
        <>
          {state.runs.length === 0 && <p className="empty-note">No runs yet.</p>}
          {state.runs.map((r) => (
            <div className="item-row" key={r.id}>
              <span className={`checkbox ${r.ok ? "checked" : ""}`} />
              <span>{r.ok ? "success" : "failed"} · {r.model}</span>
              <span className="muted" style={{ marginLeft: "auto", fontSize: 12 }}>
                {new Date(r.at).toLocaleString()}
              </span>
            </div>
          ))}
        </>
      )}

      {tab === "Settings" && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-title">Environment</div>
          <p className="muted" style={{ marginTop: 10, lineHeight: 1.6 }}>
            Configure in <code>.env.local</code>:
            <br />• <code>OPENAI_API_KEY</code> — key for your OpenAI-compatible provider
            <br />• <code>OPENAI_BASE_URL</code> — API base (defaults to api.openai.com/v1)
            <br />• <code>OPENAI_MODEL</code> — drafting model (e.g. gpt-5.6-sol)
            <br />• <code>HERMES_MODEL</code> — agent model (e.g. hermes-agent)
            <br />• <code>RESEND_API_KEY</code> + <code>NEWSLETTER_EMAIL_TO</code> — optional email delivery
          </p>
        </div>
      )}
    </>
  );
}

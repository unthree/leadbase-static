"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAppState, PLAN_LIMITS } from "@/lib/data/store";
import { Avatar, Badge, Button, Card, IconChip, Meter, Modal } from "@/components/ui";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <Card style={{ scrollMarginTop: 88 }}>
      <h2 id={id} className="lb-card__title lb-card__title--sm" style={{ margin: "0 0 14px" }}>{title}</h2>
      {children}
    </Card>
  );
}

export default function SettingsPage() {
  const {
    profile,
    portfolio,
    updateInterests,
    setAgentPaused,
    setApprovalMode,
    wipeBusiness,
    pushToast,
  } = useAppState();

  const [newInterest, setNewInterest] = useState("");
  const [wipeId, setWipeId] = useState<string>(portfolio[0]?.id ?? "");
  const [wipeOpen, setWipeOpen] = useState(false);
  const [wipeConfirm, setWipeConfirm] = useState("");
  const [delOpen, setDelOpen] = useState(false);
  const [delConfirm, setDelConfirm] = useState("");

  const limits = PLAN_LIMITS[profile.plan];
  const live = portfolio.filter((b) => b.status !== "archived");
  const activeCount = live.filter((b) => ["building", "testing", "active"].includes(b.status)).length;
  const savedCount = live.filter((b) => b.status === "researching").length;
  const wipeTarget = portfolio.find((b) => b.id === wipeId);

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ profile, portfolio }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leadbasepro-export.json";
    a.click();
    URL.revokeObjectURL(url);
    pushToast("success", "Export ready", "Your data downloaded as JSON.");
  };

  const pct = (n: number, d: number) => (d === Infinity ? 0 : Math.min(100, (n / d) * 100));
  const cap = (d: number) => (d === Infinity ? "∞" : d);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div className="lb-kicker">Account</div>
        <h1 style={{ fontFamily: "var(--lb-font-display)", fontWeight: 700, fontSize: "var(--lb-fs-30)", letterSpacing: "-.025em", margin: "6px 0 0" }}>Settings</h1>
      </div>

      <Section id="profile" title="Profile">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar name={profile.name} size={40} status="online" />
          <div>
            <div style={{ fontWeight: 600 }}>{profile.name}</div>
            <div style={{ fontSize: "var(--lb-fs-13)", color: "var(--lb-text-secondary)" }}>{profile.email}</div>
          </div>
        </div>
      </Section>

      <Section id="context" title="Context & interests">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {profile.interests.map((it) => (
            <span key={it} className="lb-badge lb-badge--neutral" style={{ gap: 6 }}>
              {it}
              <button aria-label={`Remove ${it}`} style={{ display: "inline-flex", background: "none", border: 0, cursor: "pointer", color: "inherit", padding: 0 }} onClick={() => updateInterests(profile.interests.filter((x) => x !== it))}>
                <X style={{ width: ".8rem", height: ".8rem" }} />
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <div className="lb-field__control" style={{ flex: 1, height: 40 }}>
            <input value={newInterest} placeholder="Add an interest…" onChange={(e) => setNewInterest(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && newInterest.trim()) { updateInterests([...profile.interests, newInterest.trim()]); setNewInterest(""); } }} />
          </div>
          <Button variant="secondary" iconLeft="Plus" onClick={() => { if (newInterest.trim()) { updateInterests([...profile.interests, newInterest.trim()]); setNewInterest(""); } }}>Add</Button>
        </div>
        <div className="lb-mono-label" style={{ marginBottom: 8 }}>Connected sources</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[{ n: "Gmail", ok: true }, { n: "Calendar", ok: true }, { n: "Notion", ok: false }].map((s) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "var(--lb-radius-md)", background: "var(--lb-surface-sunken)" }}>
              <span style={{ fontSize: "var(--lb-fs-14)", fontWeight: 500 }}>{s.n}</span>
              {s.ok ? <Badge variant="success">Connected</Badge> : <Badge variant="neutral">Coming soon</Badge>}
            </div>
          ))}
        </div>
      </Section>

      <Section id="agent" title="Agent controls">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: "var(--lb-fs-14)", fontWeight: 500 }}>{profile.agentPaused ? "Agent is paused" : "Agent is running"}</div>
            <div style={{ fontSize: "var(--lb-fs-12)", color: "var(--lb-text-secondary)" }}>{profile.agentPaused ? "No runs will start until you resume." : "Runs execute in your nightly window."}</div>
          </div>
          {profile.agentPaused ? (
            <Button variant="success" iconLeft="Play" onClick={() => setAgentPaused(false)}>Resume agent</Button>
          ) : (
            <Button variant="secondary" iconLeft="Pause" onClick={() => setAgentPaused(true)}>Pause agent</Button>
          )}
        </div>
        <div className="lb-mono-label" style={{ marginBottom: 8 }}>Outreach approval mode</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Button variant={profile.approvalMode === "every-message" ? "secondary" : "ghost"} size="sm" onClick={() => setApprovalMode("every-message")}>Approve every message</Button>
          <Button variant={profile.approvalMode === "batches-only" ? "secondary" : "ghost"} size="sm" onClick={() => setApprovalMode("batches-only")}>Approve batches only</Button>
        </div>
        <div className="lb-mono-label" style={{ marginBottom: 4 }}>Nightly run window</div>
        <div style={{ fontFamily: "var(--lb-font-mono)", fontSize: "var(--lb-fs-14)" }}>{profile.runWindow} (local)</div>
      </Section>

      <Section id="plan" title="Plan & billing">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Badge variant="brand">{profile.plan[0].toUpperCase() + profile.plan.slice(1)} plan</Badge>
          {profile.trialDaysLeft ? <span style={{ fontSize: "var(--lb-fs-13)", color: "var(--lb-text-secondary)" }}>Trial · {profile.trialDaysLeft} days left</span> : null}
        </div>
        {[
          { label: "Active builds", n: activeCount, d: limits.active },
          { label: "Saved opportunities", n: savedCount, d: limits.saved },
          { label: "Leads this month", n: 42, d: profile.plan === "solo" ? 50 : profile.plan === "operator" ? 250 : Infinity },
        ].map((u) => (
          <div key={u.label} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--lb-fs-13)", marginBottom: 6 }}>
              <span style={{ color: "var(--lb-text-secondary)" }}>{u.label}</span>
              <span style={{ fontFamily: "var(--lb-font-mono)" }}>{u.n} / {cap(u.d)}</span>
            </div>
            <Meter value={pct(u.n, u.d)} thin />
          </div>
        ))}
        <Button variant="gradient" iconLeft="CreditCard" onClick={() => pushToast("info", "Billing", "The Stripe customer portal arrives in Phase 5.")} style={{ marginTop: 6 }}>Manage plan</Button>
      </Section>

      <Section id="privacy" title="Data & privacy">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div><div style={{ fontSize: "var(--lb-fs-14)", fontWeight: 500 }}>Export all data</div><div style={{ fontSize: "var(--lb-fs-12)", color: "var(--lb-text-secondary)" }}>Everything the agent knows, as JSON.</div></div>
            <Button variant="secondary" size="sm" iconLeft="Download" onClick={exportData}>Export</Button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "var(--lb-fs-14)", fontWeight: 500 }}>Wipe a business</div>
              <div style={{ fontSize: "var(--lb-fs-12)", color: "var(--lb-text-secondary)" }}>Deletes its rows, leads, assets, and learned context.</div>
            </div>
            <select value={wipeId} onChange={(e) => setWipeId(e.target.value)} style={{ height: 32, borderRadius: "var(--lb-radius-md)", border: "1px solid var(--lb-border-default)", background: "var(--lb-surface-card)", color: "var(--lb-text-primary)", padding: "0 10px", fontFamily: "var(--lb-font-body)", fontSize: "var(--lb-fs-13)" }}>
              {portfolio.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <Button variant="danger" size="sm" disabled={!wipeTarget} onClick={() => { setWipeConfirm(""); setWipeOpen(true); }}>Wipe…</Button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div><div style={{ fontSize: "var(--lb-fs-14)", fontWeight: 500 }}>Delete account</div><div style={{ fontSize: "var(--lb-fs-12)", color: "var(--lb-text-secondary)" }}>Permanent — one dialog, no support ticket.</div></div>
            <Button variant="ghost" size="sm" onClick={() => { setDelConfirm(""); setDelOpen(true); }} style={{ color: "var(--lb-danger)" }}>Delete…</Button>
          </div>
        </div>
      </Section>

      <Modal
        open={wipeOpen}
        onClose={() => setWipeOpen(false)}
        title={`Wipe ${wipeTarget?.name ?? "business"}?`}
        subtitle="This is irreversible. Type the business name to confirm."
        icon={<IconChip tone="magenta" icon="TriangleAlert" size="lg" />}
        footer={
          <>
            <Button variant="ghost" onClick={() => setWipeOpen(false)}>Cancel</Button>
            <Button variant="danger" disabled={wipeConfirm !== wipeTarget?.name} onClick={() => { if (wipeTarget) wipeBusiness(wipeTarget.id); setWipeOpen(false); }}>Wipe permanently</Button>
          </>
        }
      >
        <div className="lb-field">
          <label className="lb-field__label">Type “{wipeTarget?.name}” to confirm</label>
          <div className="lb-field__control"><input data-autofocus value={wipeConfirm} onChange={(e) => setWipeConfirm(e.target.value)} /></div>
        </div>
      </Modal>

      <Modal
        open={delOpen}
        onClose={() => setDelOpen(false)}
        title="Delete your account?"
        subtitle="Every business, lead, and asset is permanently removed. Type DELETE to confirm."
        icon={<IconChip tone="magenta" icon="TriangleAlert" size="lg" />}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDelOpen(false)}>Cancel</Button>
            <Button variant="danger" disabled={delConfirm !== "DELETE"} onClick={() => { setDelOpen(false); pushToast("warn", "Account deletion", "Wired to your real account in Phase 5."); }}>Delete account</Button>
          </>
        }
      >
        <div className="lb-field">
          <label className="lb-field__label">Type DELETE</label>
          <div className="lb-field__control"><input data-autofocus value={delConfirm} onChange={(e) => setDelConfirm(e.target.value)} /></div>
        </div>
      </Modal>
    </div>
  );
}

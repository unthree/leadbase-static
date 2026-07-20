"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppState } from "@/lib/data/store";
import {
  Badge,
  BUSINESS_STATUS_PILL,
  Button,
  Callout,
  Card,
  EmptyState,
  IconChip,
  Meter,
  Modal,
  StatusPill,
  STATUS_PROGRESS,
  type ChipTone,
} from "@/components/ui";
import type { BusinessStatus, LeadStatus } from "@/lib/types";

const STEPS: BusinessStatus[] = ["researching", "building", "testing", "active"];
const ASSET_BADGE = {
  draft: { variant: "neutral" as const, label: "Draft" },
  ready: { variant: "neutral" as const, label: "Ready" },
  live: { variant: "success" as const, label: "Live" },
};
const LEAD_PILL: Record<LeadStatus, { status: "ok" | "pending" | "info" | "mute"; }> = {
  new: { status: "info" },
  engaged: { status: "pending" },
  won: { status: "ok" },
  lost: { status: "mute" },
};

export default function BuilderPage() {
  const params = useParams<{ businessId: string }>();
  const router = useRouter();
  const {
    portfolio,
    leads,
    assets,
    agentTasks,
    pendingBatchBusinessId,
    approveOutreachBatch,
    publishAsset,
    pushToast,
  } = useAppState();

  const [publishing, setPublishing] = useState<string | null>(null);
  const business = portfolio.find((b) => b.id === params.businessId);

  if (!business) {
    return (
      <EmptyState
        icon="SearchX"
        title="Business not found"
        hint="It may have been wiped or archived."
        action={<Button variant="secondary" size="sm" onClick={() => router.push("/portfolio")}>Back to portfolio</Button>}
      />
    );
  }

  const b = business;
  const pill = BUSINESS_STATUS_PILL[b.status];
  const currentStep = STEPS.indexOf(b.status === "archived" ? "active" : b.status);
  const bizLeads = leads.filter((l) => l.businessId === b.id);
  const bizAssets = assets.filter((a) => a.businessId === b.id);
  const pending = pendingBatchBusinessId === b.id;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div className="lb-kicker">Builder</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "6px 0 0" }}>
          <h1 style={{ fontFamily: "var(--lb-font-display)", fontWeight: 700, fontSize: "var(--lb-fs-30)", letterSpacing: "-.025em", margin: 0 }}>
            {b.name}
          </h1>
          <StatusPill status={pill.status} pulse={pill.pulse} label={b.status} />
        </div>
        <p style={{ color: "var(--lb-text-secondary)", fontSize: "var(--lb-fs-15)", marginTop: 6 }}>{b.note}</p>
      </div>

      {pending ? (
        <div style={{ marginBottom: 16 }}>
          <div className="lb-callout" style={{ alignItems: "center", justifyContent: "space-between", background: "var(--lb-surface-brand-soft)" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <IconChip tone="gradient" icon="Rocket" />
              <div><strong>Outreach batch #1 is ready.</strong> 25 personalized DMs, sent from your inbox, rate-limited.</div>
            </div>
            <Button variant="gradient" iconLeft="Check" onClick={() => approveOutreachBatch(b.id)}>
              Approve outreach batch
            </Button>
          </div>
        </div>
      ) : null}

      {/* Zone 1 — pipeline */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {STEPS.map((s, i) => {
            const done = i < currentStep;
            const current = i === currentStep;
            const tone: ChipTone = done ? "success" : current ? "brand" : "sky";
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <IconChip tone={tone} icon={done ? "CircleCheck" : current ? "CircleDot" : "Circle"} size="sm" />
                <span style={{ fontSize: "var(--lb-fs-13)", fontWeight: current ? 600 : 500, color: current ? "var(--lb-text-primary)" : "var(--lb-text-secondary)", textTransform: "capitalize" }}>{s}</span>
                {i < STEPS.length - 1 ? <span style={{ width: 24, height: 1, background: "var(--lb-border-default)", margin: "0 4px" }} /> : null}
              </div>
            );
          })}
        </div>
        <Meter value={STATUS_PROGRESS[b.status === "archived" ? "active" : b.status]} tone="gradient" />
        <div style={{ display: "flex", gap: 32, marginTop: 16 }}>
          <div><div className="lb-mono-label">Revenue</div><div style={{ fontFamily: "var(--lb-font-mono)", fontWeight: 600, fontSize: "var(--lb-fs-18)", marginTop: 3 }}>{b.revenue}</div></div>
          <div><div className="lb-mono-label">Buyer leads</div><div style={{ fontFamily: "var(--lb-font-mono)", fontWeight: 600, fontSize: "var(--lb-fs-18)", marginTop: 3 }}>{bizLeads.length || b.leads}</div></div>
          <div><div className="lb-mono-label">Conversion</div><div style={{ fontFamily: "var(--lb-font-mono)", fontWeight: 600, fontSize: "var(--lb-fs-18)", marginTop: 3 }}>—</div></div>
        </div>
      </Card>

      {/* Zone 2 — assets */}
      <Card style={{ marginBottom: 16 }}>
        <h2 className="lb-card__title lb-card__title--sm" style={{ margin: "0 0 12px" }}>Assets</h2>
        {bizAssets.length === 0 ? (
          b.status === "building" ? (
            <div>
              <div style={{ fontSize: "var(--lb-fs-13)", color: "var(--lb-text-secondary)", marginBottom: 10 }}>Agent is assembling this build:</div>
              {agentTasks.map((t) => (
                <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                  <span style={{ fontSize: "var(--lb-fs-14)" }}>{t.label}</span>
                  <Badge variant={t.state === "done" ? "success" : t.state === "running" ? "brand" : "neutral"}>{t.state}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: "var(--lb-fs-13)", color: "var(--lb-text-secondary)" }}>No assets yet.</div>
          )
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {bizAssets.map((a) => {
              const badge = ASSET_BADGE[a.state];
              return (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: "var(--lb-radius-md)", background: "var(--lb-surface-sunken)" }}>
                  <IconChip tone="brand" icon={a.icon as never} size="sm" />
                  <span style={{ flex: 1, fontSize: "var(--lb-fs-14)" }}>{a.title}</span>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => pushToast("info", "Editing", "Inline asset editing arrives in Phase 5.")}>Edit</Button>
                  {a.state !== "live" ? <Button variant="secondary" size="sm" onClick={() => setPublishing(a.id)}>Publish</Button> : null}
                  <Button variant="ghost" size="sm" onClick={() => pushToast("success", "Export ready", "Check your downloads.")}>Export</Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Zone 3 — leads */}
      <Card>
        <h2 className="lb-card__title lb-card__title--sm" style={{ margin: "0 0 12px" }}>Buyer leads</h2>
        {bizLeads.length === 0 ? (
          <EmptyState icon="Users" title="No buyer leads yet" hint="They'll appear as the agent's outreach gets replies, clicks, and booked calls." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Name", "Last signal", "Intent", "Value", "Status", ""].map((h) => (
                    <th key={h} className="lb-mono-label" style={{ textAlign: "left", padding: "6px 10px", borderBottom: "1px solid var(--lb-border-default)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bizLeads.map((l) => (
                  <tr key={l.id}>
                    <td style={{ padding: "10px", fontSize: "var(--lb-fs-14)", fontWeight: 500, borderBottom: "1px solid var(--lb-border-subtle)" }}>{l.name}</td>
                    <td style={{ padding: "10px", fontSize: "var(--lb-fs-13)", color: "var(--lb-text-secondary)", borderBottom: "1px solid var(--lb-border-subtle)" }}>{l.snippet}</td>
                    <td style={{ padding: "10px", borderBottom: "1px solid var(--lb-border-subtle)" }}>
                      <Badge variant={l.intent >= 0.8 ? "success" : l.intent >= 0.5 ? "warning" : "neutral"}>{l.intent.toFixed(2)}</Badge>
                    </td>
                    <td style={{ padding: "10px", fontSize: "var(--lb-fs-14)", fontFamily: "var(--lb-font-mono)", borderBottom: "1px solid var(--lb-border-subtle)" }}>${(l.valueCents / 100).toLocaleString()}</td>
                    <td style={{ padding: "10px", borderBottom: "1px solid var(--lb-border-subtle)" }}>
                      <StatusPill status={LEAD_PILL[l.status].status} label={l.status} />
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid var(--lb-border-subtle)" }}>
                      <Button variant="ghost" size="sm" onClick={() => pushToast("info", "Reply drafted", "Approve to send from your inbox.")}>Draft reply</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={!!publishing}
        onClose={() => setPublishing(null)}
        title="Publish to the world?"
        subtitle="This makes the asset live and visible to buyers — an outward-facing action."
        icon={<IconChip tone="gradient" icon="Globe" size="lg" />}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPublishing(null)}>Cancel</Button>
            <Button variant="gradient" data-autofocus onClick={() => { if (publishing) publishAsset(publishing); setPublishing(null); }}>
              Publish it
            </Button>
          </>
        }
      >
        <Callout icon="TriangleAlert" tone="warning">Buyers will be able to see this immediately. You can unpublish later from this page.</Callout>
      </Modal>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useAppState, useFeedTicker } from "@/lib/data/store";
import {
  ActionRow,
  ActivityRow,
  Badge,
  Button,
  Card,
  CardHead,
  Icon,
  Meter,
  ScoreBadge,
  StatCard,
  STATUS_PROGRESS,
  StatusPill,
  BUSINESS_STATUS_PILL,
  type IconName,
} from "@/components/ui";
import { SwarmMark } from "@/components/chat";
import { overnight, stats } from "@/lib/fixtures";

const SUGGESTIONS: Array<{ id: string; icon: IconName; text: string; meta: string; href: string }> = [
  { id: "g1", icon: "Rocket", text: "Approve outreach batch for OnboardLoop", meta: "25 leads ready", href: "/builder/p1" },
  { id: "g2", icon: "GitBranch", text: "Clone CivicHVAC playbook to Austin & Tampa", meta: "Est. +$1.6k/mo", href: "/portfolio" },
  { id: "g3", icon: "FlaskConical", text: "End the ListingPrompts price test", meta: "$29 winning at 1.8x", href: "/builder/p3" },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const router = useRouter();
  const { profile, opportunities, portfolio, agentFeed } = useAppState();
  useFeedTicker(true);

  const firstName = profile.name.split(" ")[0];
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const dashOpps = opportunities.filter((o) => o.status === "new").sort((a, b) => b.match - a.match).slice(0, 3);
  const building = portfolio.filter((p) => p.status === "building" || p.status === "testing").slice(0, 2);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 22 }}>
        <div>
          <div className="lb-kicker">{today}</div>
          <h1 style={{ fontFamily: "var(--lb-font-display)", fontWeight: 700, fontSize: "var(--lb-fs-30)", letterSpacing: "-.025em", margin: "6px 0 0" }}>
            {greeting()}, {firstName}
          </h1>
          <p style={{ color: "var(--lb-text-secondary)", fontSize: "var(--lb-fs-15)", marginTop: 6 }}>
            Your agent ran {overnight.loops} loops overnight and found{" "}
            <strong style={{ color: "var(--lb-text-primary)" }}>{overnight.newOpportunities} new opportunities</strong> and{" "}
            <strong style={{ color: "var(--lb-text-primary)" }}>{overnight.newLeads} buyer leads</strong>.
          </p>
        </div>
        <Button variant="gradient" iconLeft="Sparkles" onClick={() => router.push("/agent")}>
          Ask your agent
        </Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 16, marginBottom: 22 }}>
        {stats.map((s) => (
          <StatCard key={s.id} label={s.label} value={s.value} delta={s.delta} trend={s.trend} sub={s.sub} icon={s.icon as IconName} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.55fr) minmax(0,1fr)", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <CardHead
              title="New opportunities found"
              action={<a className="lb-card__link" onClick={() => router.push("/feed")}>View all <Icon name="ArrowRight" /></a>}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {dashOpps.map((o) => (
                <div
                  key={o.id}
                  onClick={() => router.push("/feed")}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", border: "1px solid var(--lb-border-subtle)", borderRadius: "var(--lb-radius-md)", cursor: "pointer" }}
                >
                  <ScoreBadge score={o.match} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "var(--lb-fs-15)" }}>{o.title}</div>
                    <div style={{ fontSize: "var(--lb-fs-12)", color: "var(--lb-text-secondary)", marginTop: 3 }}>
                      {o.buyer} · {o.revenue.split("·")[0].trim()}
                    </div>
                  </div>
                  <Icon name="ChevronRight" style={{ color: "var(--lb-text-muted)" }} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHead
              title="Micro-businesses building"
              sm
              action={<a className="lb-card__link" onClick={() => router.push("/portfolio")}>Portfolio</a>}
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 16 }}>
              {building.map((p) => {
                const pill = BUSINESS_STATUS_PILL[p.status];
                return (
                  <div key={p.id} onClick={() => router.push(`/builder/${p.id}`)} style={{ padding: 14, border: "1px solid var(--lb-border-subtle)", borderRadius: "var(--lb-radius-md)", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                      <StatusPill status={pill.status} pulse={pill.pulse} label={p.status} />
                    </div>
                    <div style={{ fontSize: "var(--lb-fs-12)", color: "var(--lb-text-secondary)", margin: "8px 0 10px" }}>{p.note}</div>
                    <Meter value={STATUS_PROGRESS[p.status]} thin tone="gradient" />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                      <span style={{ fontSize: "var(--lb-fs-12)", color: "var(--lb-text-secondary)" }}>{p.leads} leads</span>
                      <span style={{ fontSize: "var(--lb-fs-12)", fontWeight: 600, fontFamily: "var(--lb-font-mono)" }}>{p.revenue}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div className="lb-card__head" style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <SwarmMark size={22} spin={!profile.agentPaused} />
                <h2 className="lb-card__title lb-card__title--sm">Agent activity</h2>
              </div>
              {!profile.agentPaused ? <Badge variant="success" icon="Circle">Live</Badge> : <Badge variant="neutral">Paused</Badge>}
            </div>
            <div>
              {agentFeed.map((a) => (
                <ActivityRow key={a.id} kind={a.kind} text={a.text} time={a.time} />
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="lb-card__title lb-card__title--sm" style={{ margin: "0 0 12px" }}>Suggested next actions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SUGGESTIONS.map((g) => (
                <ActionRow key={g.id} icon={g.icon} title={g.text} meta={g.meta} onClick={() => router.push(g.href)} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

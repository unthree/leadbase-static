"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppState, useTaskTicker } from "@/lib/data/store";
import { Badge, Button, Card, IconChip, Meter, type ChipTone } from "@/components/ui";
import { ChatMessage, Composer, SwarmMark } from "@/components/chat";

const TASK_TONES: ChipTone[] = ["brand", "sky", "violet", "magenta"];
const ASSET_STATE_BADGE = {
  draft: { variant: "neutral" as const, label: "Draft" },
  ready: { variant: "neutral" as const, label: "Ready" },
  live: { variant: "success" as const, label: "Live" },
};

export default function AgentPage() {
  const router = useRouter();
  const { profile, chat, agentTasks, assets, sendChat, agentBusy } = useAppState();
  useTaskTicker(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat]);

  const running = agentTasks.filter((t) => t.state === "running").length;
  const statusLine = profile.agentPaused
    ? { text: "● Paused", color: "var(--lb-warning)" }
    : agentBusy || running > 0
      ? { text: "● Online · working", color: "var(--lb-success)" }
      : { text: "● Online · idle", color: "var(--lb-success)" };

  return (
    <div
      data-theme="dark"
      style={{ height: "100vh", display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)", background: "var(--lb-grad-dark-agent)", color: "var(--lb-text-primary)" }}
    >
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, borderRight: "1px solid var(--lb-border-default)" }}>
        <div style={{ height: 68, flex: "none", display: "flex", alignItems: "center", gap: 14, padding: "0 24px", borderBottom: "1px solid var(--lb-border-default)" }}>
          <SwarmMark size={24} spin={agentBusy} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontFamily: "var(--lb-font-display)", fontSize: "var(--lb-fs-15)" }}>Agent Workspace</div>
            <div style={{ fontSize: "var(--lb-fs-12)", color: statusLine.color }}>{statusLine.text}</div>
          </div>
          <Button variant="secondary" size="sm" iconLeft="LayoutDashboard" onClick={() => router.push("/dashboard")}>
            Dashboard
          </Button>
        </div>
        <div ref={scrollRef} className="lb-scroll" style={{ flex: 1, overflowY: "auto", padding: "26px 28px", display: "flex", flexDirection: "column", gap: 22 }}>
          {chat.map((m) => (
            <ChatMessage key={m.id} msg={m} userName={profile.name} />
          ))}
        </div>
        <div style={{ padding: "16px 28px 22px" }}>
          <Composer placeholder="Ask your agent to build, research, or launch…" onSend={sendChat} disabled={agentBusy} />
        </div>
      </div>

      <div className="lb-scroll" style={{ overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="lb-kicker">Workbench</div>
        <Card>
          <div className="lb-card__head" style={{ marginBottom: 6 }}>
            <h2 className="lb-card__title lb-card__title--sm">Tasks running</h2>
            <Badge variant="brand">{running} active</Badge>
          </div>
          {agentTasks.map((t, i) => (
            <div key={t.id} style={{ padding: "11px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: t.state === "running" && t.pct > 0 ? 8 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <IconChip tone={TASK_TONES[i % 4]} icon={t.icon as never} size="sm" />
                  <span style={{ fontSize: "var(--lb-fs-14)", fontWeight: 500 }}>{t.label}</span>
                </div>
                {t.state === "done" ? (
                  <Badge variant="success">Done</Badge>
                ) : t.state === "running" ? (
                  <Badge variant="brand" icon="LoaderCircle" spin>Running</Badge>
                ) : t.state === "failed" ? (
                  <Badge variant="danger">Failed</Badge>
                ) : (
                  <Badge variant="neutral">Queued</Badge>
                )}
              </div>
              {t.state === "running" && t.pct > 0 ? <Meter value={t.pct} thin tone="gradient" /> : null}
            </div>
          ))}
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--lb-font-display)", fontWeight: 700, fontSize: "var(--lb-fs-30)" }}>1,204</div>
              <div style={{ fontSize: "var(--lb-fs-12)", color: "var(--lb-text-secondary)" }}>Sources researched</div>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--lb-font-display)", fontWeight: 700, fontSize: "var(--lb-fs-30)" }}>25</div>
              <div style={{ fontSize: "var(--lb-fs-12)", color: "var(--lb-text-secondary)" }}>Leads found</div>
            </div>
          </Card>
        </div>

        <Card>
          <h2 className="lb-card__title lb-card__title--sm" style={{ margin: "0 0 12px" }}>Assets generated</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {assets.map((a) => {
              const b = ASSET_STATE_BADGE[a.state];
              return (
                <div
                  key={a.id}
                  onClick={() => router.push(`/builder/${a.businessId}`)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: "var(--lb-radius-md)", background: "var(--lb-surface-raised)", cursor: "pointer" }}
                >
                  <IconChip tone="brand" icon={a.icon as never} size="sm" />
                  <span style={{ flex: 1, fontSize: "var(--lb-fs-14)" }}>{a.title}</span>
                  <Badge variant={b.variant}>{b.label}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

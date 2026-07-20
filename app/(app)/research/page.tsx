"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAppState } from "@/lib/data/store";
import { Badge, Button, Card, EmptyState, IconChip, ScoreBadge, Tabs, type TabItem } from "@/components/ui";
import { signals, sources } from "@/lib/fixtures";

const TABS: TabItem[] = [
  { id: "signals", label: "Signals" },
  { id: "sources", label: "Sources" },
  { id: "archived", label: "Archived" },
];

export default function ResearchPage() {
  const { archivedOpportunities, restoreOpportunity } = useAppState();
  const [tab, setTab] = useState("signals");
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();
  const filteredSignals = useMemo(
    () => signals.filter((s) => !query || `${s.metric} ${s.source} ${s.tag}`.toLowerCase().includes(query)),
    [query]
  );
  const filteredSources = useMemo(
    () => sources.filter((s) => !query || `${s.title} ${s.domain}`.toLowerCase().includes(query)),
    [query]
  );

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div className="lb-kicker">Evidence library</div>
        <h1 style={{ fontFamily: "var(--lb-font-display)", fontWeight: 700, fontSize: "var(--lb-fs-30)", letterSpacing: "-.025em", margin: "6px 0 0" }}>Research</h1>
        <p style={{ color: "var(--lb-text-secondary)", fontSize: "var(--lb-fs-15)", marginTop: 6 }}>
          Every market signal and source your agent gathered — the evidence behind each opportunity.
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
        <Tabs items={TABS} active={tab} onChange={setTab} />
        {tab !== "archived" ? (
          <div className="lb-search" style={{ maxWidth: 280 }}>
            <Search />
            <input value={q} placeholder="Filter…" onChange={(e) => setQ(e.target.value)} aria-label="Filter research" />
          </div>
        ) : null}
      </div>

      {tab === "signals" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredSignals.map((s) => (
            <Card key={s.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <IconChip tone="sky" icon="Radio" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "var(--lb-fs-15)" }}>{s.metric}</div>
                  <div style={{ fontSize: "var(--lb-fs-12)", color: "var(--lb-text-secondary)", marginTop: 2 }}>{s.source} · {s.date}</div>
                </div>
                <Badge variant="neutral">{s.tag}</Badge>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {tab === "sources" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredSources.map((s) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: "var(--lb-radius-md)", background: "var(--lb-surface-card)", border: "1px solid var(--lb-border-default)" }}>
              <IconChip tone="sky" icon="Globe" size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "var(--lb-fs-14)", fontWeight: 500 }}>{s.title}</div>
                <div style={{ fontFamily: "var(--lb-font-mono)", fontSize: "var(--lb-fs-12)", color: "var(--lb-text-secondary)" }}>{s.domain} · {s.date}</div>
              </div>
              <Badge variant="neutral">{s.runLabel}</Badge>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "archived" ? (
        archivedOpportunities.length === 0 ? (
          <EmptyState icon="Archive" title="No archived opportunities" hint="Opportunities you skip for 30 days land here — restorable any time." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {archivedOpportunities.map((o) => (
              <Card key={o.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <ScoreBadge score={o.match} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "var(--lb-fs-15)" }}>{o.title}</div>
                    <div style={{ fontSize: "var(--lb-fs-12)", color: "var(--lb-text-secondary)", marginTop: 2 }}>{o.why}</div>
                  </div>
                  <Button variant="secondary" size="sm" iconLeft="RotateCcw" onClick={() => restoreOpportunity(o.id)}>Restore</Button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}

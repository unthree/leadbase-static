"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/lib/data/store";
import { Button, EmptyState, Icon, Tabs, type TabItem } from "@/components/ui";
import { OpportunityCard, BuildModal } from "@/components/cards";
import type { Opportunity } from "@/lib/types";

const BUILD_STEPS = [
  "Generate landing page + booking flow",
  "Draft 25 personalized outreach DMs",
  "Set up activation-leak lead magnet",
  "Schedule follow-up sub-agent",
];

const TABS: TabItem[] = [
  { id: "all", label: "All" },
  { id: "saas", label: "SaaS", icon: "Cloud" },
  { id: "local", label: "Local" },
  { id: "content", label: "Content" },
  { id: "service", label: "Service" },
];

function FeedInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { opportunities, rescan } = useAppState();
  const [selected, setSelected] = useState<Opportunity | null>(null);

  const tab = params.get("tab") ?? "all";
  const setTab = (id: string) => {
    const p = new URLSearchParams(Array.from(params.entries()));
    if (id === "all") p.delete("tab");
    else p.set("tab", id);
    router.replace(`/feed${p.toString() ? `?${p.toString()}` : ""}`);
  };

  const visible = useMemo(
    () => opportunities.filter((o) => o.status !== "archived"),
    [opportunities]
  );
  const filtered = useMemo(() => {
    const base = tab === "all" ? visible : visible.filter((o) => o.tags.some((t) => t.toLowerCase() === tab));
    return [...base].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.match - a.match);
  }, [visible, tab]);

  const tabsWithCount: TabItem[] = TABS.map((t) => (t.id === "all" ? { ...t, count: visible.length } : t));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 22 }}>
        <div>
          <div className="lb-kicker">Discovered for you</div>
          <h1 style={{ fontFamily: "var(--lb-font-display)", fontWeight: 700, fontSize: "var(--lb-fs-30)", letterSpacing: "-.025em", margin: "6px 0 0" }}>
            Opportunity Feed
          </h1>
          <p style={{ color: "var(--lb-text-secondary)", fontSize: "var(--lb-fs-15)", marginTop: 6 }}>
            Buyer-lead opportunities your agent surfaced from your interests, research, and live market signals.
          </p>
        </div>
        <Button variant="secondary" iconLeft="RefreshCw" onClick={rescan}>
          Rescan
        </Button>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
        <Tabs items={tabsWithCount} active={tab} onChange={setTab} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--lb-fs-12)", color: "var(--lb-text-secondary)" }}>
          <Icon name="ArrowDownUp" style={{ width: "1rem", height: "1rem" }} /> Sorted by match
        </div>
      </div>

      {filtered.length === 0 ? (
        visible.length === 0 ? (
          <EmptyState
            icon="Radar"
            title="Your agent hasn't found opportunities yet"
            hint="Connect your interests in Settings, or run a manual rescan to sweep fresh market data now."
            action={<Button variant="gradient" size="sm" iconLeft="RefreshCw" onClick={rescan}>Rescan</Button>}
          />
        ) : (
          <EmptyState icon="SearchX" title={`Nothing in ${tab} right now`} hint="Try another category or rescan your signals." />
        )
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 18 }}>
          {filtered.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} onBuild={setSelected} />
          ))}
        </div>
      )}

      <BuildModal opportunity={selected} onClose={() => setSelected(null)} buildSteps={BUILD_STEPS} />
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={null}>
      <FeedInner />
    </Suspense>
  );
}

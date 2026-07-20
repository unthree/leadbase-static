"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/lib/data/store";
import { Button, EmptyState, Tabs, type TabItem } from "@/components/ui";
import { PortfolioCard } from "@/components/cards";

const BASE_TABS: TabItem[] = [
  { id: "all", label: "All" },
  { id: "researching", label: "Researching" },
  { id: "building", label: "Building" },
  { id: "testing", label: "Testing" },
  { id: "active", label: "Active" },
];

function PortfolioInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { portfolio } = useAppState();

  const tab = params.get("tab") ?? "all";
  const setTab = (id: string) => {
    const p = new URLSearchParams(Array.from(params.entries()));
    if (id === "all") p.delete("tab");
    else p.set("tab", id);
    router.replace(`/portfolio${p.toString() ? `?${p.toString()}` : ""}`);
  };

  const live = portfolio.filter((b) => b.status !== "archived");
  const totalLeads = live.reduce((a, b) => a + b.leads, 0);
  const activeCount = live.filter((b) => b.status === "active").length;

  const tabs = useMemo<TabItem[]>(
    () => (tab === "archived" ? [...BASE_TABS, { id: "archived", label: "Archived" }] : BASE_TABS),
    [tab]
  );

  const items =
    tab === "all" ? live : portfolio.filter((b) => b.status === tab);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 22 }}>
        <div>
          <div className="lb-kicker">Your micro-business portfolio</div>
          <h1 style={{ fontFamily: "var(--lb-font-display)", fontWeight: 700, fontSize: "var(--lb-fs-30)", letterSpacing: "-.025em", margin: "6px 0 0" }}>
            Portfolio
          </h1>
          <p style={{ color: "var(--lb-text-secondary)", fontSize: "var(--lb-fs-15)", marginTop: 6 }}>
            {live.length} builds · {totalLeads} buyer leads · {activeCount} generating revenue.
          </p>
        </div>
        <Button variant="gradient" iconLeft="Plus" onClick={() => router.push("/feed")}>
          New from opportunity
        </Button>
      </div>

      <div style={{ marginBottom: 18 }}>
        <Tabs items={tabs} active={tab} onChange={setTab} pill />
      </div>

      {items.length === 0 ? (
        <EmptyState icon="Briefcase" title="Nothing here yet" hint="Save an opportunity from the feed, or build one directly — it will show up here." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 16 }}>
          {items.map((b) => (
            <PortfolioCard key={b.id} business={b} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={null}>
      <PortfolioInner />
    </Suspense>
  );
}

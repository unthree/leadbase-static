"use client";

// Composite cards: OpportunityCard (feed), PortfolioCard, BuildModal.
// Markup mirrors design-system/examples.html scenes 03, 04, 06.

import React from "react";
import { useRouter } from "next/navigation";
import type { Business, Opportunity } from "@/lib/types";
import { useAppState } from "@/lib/data/store";
import {
  Badge,
  BUSINESS_STATUS_PILL,
  Button,
  Callout,
  Card,
  IconChip,
  MetaItem,
  Modal,
  ScoreBadge,
  StatusPill,
} from "./ui";

const DIFF_VARIANT = { Low: "success", Medium: "warning", High: "danger" } as const;

export function OpportunityCard({
  opportunity,
  onBuild,
  highlight,
}: {
  opportunity: Opportunity;
  onBuild: (o: Opportunity) => void;
  highlight?: boolean;
}) {
  const { toggleSave } = useAppState();
  const o = opportunity;
  const built = o.status === "built";
  return (
    <Card
      style={highlight ? { outline: "2px solid var(--lb-brand)", outlineOffset: 2 } : undefined}
      data-opportunity-id={o.id}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <ScoreBadge score={o.match} size="md" label="Match" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 7 }}>
              {o.featured ? <Badge variant="brand" icon="Pin">Featured this week</Badge> : null}
              {o.tags.map((t) => (
                <Badge key={t} variant={t === "High intent" ? "gradient" : "neutral"}>
                  {t}
                </Badge>
              ))}
            </div>
            <h3
              style={{
                fontFamily: "var(--lb-font-display)",
                fontWeight: 700,
                fontSize: "var(--lb-fs-20)",
                letterSpacing: "-.02em",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {o.title}
            </h3>
          </div>
        </div>

        <Callout icon="Sparkles" tone="violet">
          <strong>Why you:</strong> {o.why}
        </Callout>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "12px 18px" }}>
          <MetaItem icon="UserRound" label="Buyer type">
            {o.buyer}
          </MetaItem>
          <MetaItem icon="Radio" label="Market signal">
            {o.signal}
          </MetaItem>
          <MetaItem icon="Gauge" label="Difficulty">
            <Badge variant={DIFF_VARIANT[o.difficulty]}>{o.difficulty}</Badge>
          </MetaItem>
          <MetaItem icon="Banknote" label="Revenue path">
            {o.revenue}
          </MetaItem>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
          <Button variant="gradient" iconLeft="Hammer" onClick={() => onBuild(o)} disabled={built}>
            {built ? "Building" : "Build micro-business"}
          </Button>
          <Button
            variant={o.saved ? "secondary" : "ghost"}
            iconLeft={o.saved ? "BookmarkCheck" : "Bookmark"}
            onClick={() => toggleSave(o.id)}
            disabled={built}
            title={built ? "Manage in Portfolio" : undefined}
          >
            {o.saved ? "Saved" : "Save to portfolio"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function PortfolioCard({ business }: { business: Business }) {
  const router = useRouter();
  const { approveMove, inProgressMoves } = useAppState();
  const b = business;
  const pill = BUSINESS_STATUS_PILL[b.status];
  const inProgress = inProgressMoves.includes(b.id);
  return (
    <Card flush hover>
      <div className={`lb-card__stripe lb-card__stripe--${b.gradient}`} />
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <h3
            style={{
              fontFamily: "var(--lb-font-display)",
              fontWeight: 700,
              fontSize: "var(--lb-fs-18)",
              letterSpacing: "-.02em",
              margin: 0,
            }}
          >
            {b.name}
          </h3>
          <StatusPill status={pill.status} pulse={pill.pulse} label={b.status} />
        </div>
        <div style={{ display: "flex", gap: 22 }}>
          <div>
            <div className="lb-mono-label">Revenue</div>
            <div style={{ fontFamily: "var(--lb-font-mono)", fontWeight: 600, fontSize: "var(--lb-fs-16)", marginTop: 3 }}>
              {b.revenue}
            </div>
          </div>
          <div>
            <div className="lb-mono-label">Buyer leads</div>
            <div style={{ fontFamily: "var(--lb-font-mono)", fontWeight: 600, fontSize: "var(--lb-fs-16)", marginTop: 3 }}>
              {b.leads}
            </div>
          </div>
        </div>
        <div style={{ fontSize: "var(--lb-fs-14)", color: "var(--lb-text-secondary)", lineHeight: 1.45 }}>{b.note}</div>
        {b.nextAction ? (
          <div className="lb-callout" style={{ padding: "11px 12px" }}>
            <span className="lb-callout__icon" style={{ color: "var(--lb-accent-violet)" }}>
              <IconChip tone="violet" icon="Sparkles" size="sm" />
            </span>
            <div style={{ fontSize: "var(--lb-fs-12)" }}>
              <strong style={{ display: "block" }}>Agent suggests</strong>
              {inProgress ? "In progress…" : b.nextAction}
            </div>
          </div>
        ) : null}
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="secondary" size="sm" full onClick={() => router.push(`/builder/${b.id}`)}>
            Open
          </Button>
          {b.nextAction && !inProgress ? (
            <Button variant="ghost" size="sm" iconLeft="Check" onClick={() => approveMove(b.id)}>
              Approve move
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export function BuildModal({
  opportunity,
  onClose,
  buildSteps,
}: {
  opportunity: Opportunity | null;
  onClose: () => void;
  buildSteps: string[];
}) {
  const router = useRouter();
  const { buildBusiness, canBuild } = useAppState();
  const o = opportunity;
  return (
    <Modal
      open={!!o}
      onClose={onClose}
      title="Build this micro-business?"
      subtitle="Your agent will spin up the landing page, lead magnet, and first outreach batch."
      icon={<IconChip tone="gradient" icon="Hammer" size="lg" />}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Not now
          </Button>
          {canBuild ? (
            <Button
              variant="gradient"
              iconLeft="Rocket"
              data-autofocus
              onClick={() => {
                if (!o) return;
                buildBusiness(o.id);
                onClose();
                router.push("/portfolio");
              }}
            >
              Build it
            </Button>
          ) : (
            <Button
              variant="gradient"
              iconLeft="ArrowUpRight"
              data-autofocus
              onClick={() => {
                onClose();
                router.push("/settings#plan");
              }}
            >
              Upgrade to build more
            </Button>
          )}
        </>
      }
    >
      {o ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: "var(--lb-radius-md)",
              background: "var(--lb-surface-sunken)",
            }}
          >
            <ScoreBadge score={o.match} size="sm" />
            <div>
              <div style={{ fontWeight: 600, fontSize: "var(--lb-fs-15)" }}>{o.title}</div>
              <div style={{ fontSize: "var(--lb-fs-12)", color: "var(--lb-text-secondary)", marginTop: 2 }}>{o.buyer}</div>
            </div>
          </div>
          <div>
            <div className="lb-mono-label" style={{ marginBottom: 8 }}>
              What your agent will do
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {buildSteps.map((st) => (
                <div key={st} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "var(--lb-fs-14)" }}>
                  <span style={{ color: "var(--lb-success)", display: "inline-flex" }}>
                    <IconChip tone="success" icon="CircleCheck" size="sm" />
                  </span>
                  {st}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

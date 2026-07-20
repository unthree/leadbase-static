"use client";

// App chrome: sidebar, topbar (search + notifications per SPEC §3.10),
// toast stack. Composed of lb-* classes only.

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CheckCircle2, Search, Sparkles, XCircle, AlertTriangle, X } from "lucide-react";
import { useAppState } from "@/lib/data/store";
import { Avatar, Badge, Icon, IconButton, IconChip, type IconName } from "./ui";
import { SwarmMark } from "./chat";

const NAV: Array<
  | { section: string }
  | { id: string; href: string; label: string; icon: IconName; badge?: "feed" }
> = [
  { section: "Workspace" },
  { id: "dashboard", href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { id: "feed", href: "/feed", label: "Opportunity Feed", icon: "Radar", badge: "feed" },
  { id: "portfolio", href: "/portfolio", label: "Portfolio", icon: "Briefcase" },
  { id: "research", href: "/research", label: "Research", icon: "Library" },
  { section: "Agent" },
  { id: "agent", href: "/agent", label: "AI Workspace", icon: "Sparkles" },
  { section: "Account" },
  { id: "settings", href: "/settings", label: "Settings", icon: "Settings" },
];

const TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  feed: "Opportunity Feed",
  portfolio: "Portfolio",
  research: "Research",
  settings: "Settings",
  builder: "Builder",
};

export function SidebarNav() {
  const pathname = usePathname();
  const { profile, opportunities } = useAppState();
  const newCount = opportunities.filter((o) => o.status === "new").length;
  const planLabel = profile.plan === "solo" ? "Solo plan" : profile.plan === "operator" ? "Operator plan" : "Studio plan";

  return (
    <nav className="lb-sidebar lb-scroll" aria-label="Main">
      <div className="lb-sidebar__brand">
        <SwarmMark size={24} />
        <span className="lb-sidebar__wordmark">
          Leadbase<b>Pro</b>
        </span>
      </div>
      {NAV.map((item, i) =>
        "section" in item ? (
          <div key={`s${i}`} className="lb-sidebar__section">
            {item.section}
          </div>
        ) : (
          <Link
            key={item.id}
            href={item.href}
            className={`lb-sidebar__item${pathname.startsWith(item.href) ? " is-active" : ""}`}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {item.badge === "feed" && newCount > 0 ? (
              <span className="lb-sidebar__item-badge">{newCount}</span>
            ) : null}
          </Link>
        )
      )}
      <div className="lb-sidebar__footer">
        <Avatar name={profile.name} size={34} status="online" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "var(--lb-fs-13)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {profile.name}
          </div>
          <div style={{ fontSize: "var(--lb-fs-12)", color: "var(--lb-text-secondary)" }}>
            {planLabel}
            {profile.trialDaysLeft ? ` · trial ${profile.trialDaysLeft}d` : ""}
          </div>
        </div>
        <span style={{ color: "var(--lb-text-muted)" }}>
          <Icon name="ChevronsUpDown" style={{ width: "1rem", height: "1rem" }} />
        </span>
      </div>
    </nav>
  );
}

function useOutsideClose(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return ref;
}

function GlobalSearch() {
  const router = useRouter();
  const { opportunities, portfolio, leads } = useAppState();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return null;
    return {
      opportunities: opportunities.filter((o) => o.title.toLowerCase().includes(query)).slice(0, 3),
      businesses: portfolio.filter((b) => b.name.toLowerCase().includes(query)).slice(0, 3),
      leads: leads.filter((l) => l.name.toLowerCase().includes(query)).slice(0, 3),
    };
  }, [q, opportunities, portfolio, leads]);

  const first = results
    ? results.opportunities[0]
      ? "/feed"
      : results.businesses[0]
        ? `/builder/${results.businesses[0].id}`
        : results.leads[0]
          ? `/builder/${results.leads[0].businessId}`
          : null
    : null;

  const go = (href: string) => {
    setOpen(false);
    setQ("");
    router.push(href);
  };

  return (
    <div ref={ref} style={{ position: "relative", flex: 1, maxWidth: 420, marginLeft: 8 }}>
      <div className="lb-search">
        <Search />
        <input
          value={q}
          placeholder="Search opportunities, builds, leads…"
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && first) go(first);
            if (e.key === "Escape") setOpen(false);
          }}
          aria-label="Global search"
        />
      </div>
      {open && results ? (
        <div
          className="lb-card"
          style={{ position: "absolute", top: 46, left: 0, right: 0, zIndex: 60, padding: 10, maxHeight: 360, overflowY: "auto" }}
        >
          {(["opportunities", "businesses", "leads"] as const).map((group) => {
            const rows = results[group];
            if (rows.length === 0) return null;
            return (
              <div key={group} style={{ marginBottom: 6 }}>
                <div className="lb-mono-label" style={{ padding: "6px 8px" }}>
                  {group}
                </div>
                {rows.map((r) => (
                  <button
                    key={r.id}
                    className="lb-action-row"
                    style={{ marginBottom: 4 }}
                    onClick={() =>
                      go(
                        group === "opportunities"
                          ? "/feed"
                          : group === "businesses"
                            ? `/builder/${r.id}`
                            : `/builder/${(r as { businessId: string }).businessId}`
                      )
                    }
                  >
                    <IconChip
                      tone={group === "opportunities" ? "sky" : group === "businesses" ? "brand" : "violet"}
                      icon={group === "opportunities" ? "Radar" : group === "businesses" ? "Briefcase" : "UserRound"}
                    />
                    <div>
                      <div className="lb-action-row__title">{"title" in r ? r.title : r.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
          {results.opportunities.length + results.businesses.length + results.leads.length === 0 ? (
            <div style={{ padding: 12, fontSize: "var(--lb-fs-13)", color: "var(--lb-text-secondary)" }}>
              No matches for “{q}”.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function NotificationsMenu() {
  const router = useRouter();
  const { notifications, unreadCount, markNotificationRead } = useAppState();
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));

  const sorted = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const pa = a.kind === "approval_needed" && !a.read ? 0 : 1;
      const pb = b.kind === "approval_needed" && !b.read ? 0 : 1;
      return pa - pb;
    });
  }, [notifications]);

  const kindIcon: Record<string, IconName> = {
    approval_needed: "BellRing",
    run_finished: "CircleCheck",
    lead_won: "Trophy",
    limit_reached: "Gauge",
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <IconButton label="Notifications" icon="Bell" dot={unreadCount > 0} onClick={() => setOpen((o) => !o)} />
      {open ? (
        <div className="lb-card" style={{ position: "absolute", top: 46, right: 0, width: 340, zIndex: 60, padding: 10 }}>
          <div className="lb-mono-label" style={{ padding: "4px 8px 8px" }}>
            Notifications
          </div>
          {sorted.map((n) => (
            <button
              key={n.id}
              className="lb-action-row"
              style={{ marginBottom: 4, opacity: n.read ? 0.6 : 1 }}
              onClick={() => {
                markNotificationRead(n.id);
                setOpen(false);
                router.push(n.href);
              }}
            >
              <IconChip
                tone={n.kind === "approval_needed" ? "magenta" : n.kind === "lead_won" ? "success" : "brand"}
                icon={kindIcon[n.kind] ?? "Bell"}
              />
              <div>
                <div className="lb-action-row__title" style={{ fontSize: "var(--lb-fs-13)" }}>
                  {n.text}
                </div>
                <div className="lb-action-row__meta">{n.time}</div>
              </div>
            </button>
          ))}
          {sorted.length === 0 ? (
            <div style={{ padding: 12, fontSize: "var(--lb-fs-13)", color: "var(--lb-text-secondary)" }}>
              You&apos;re all caught up.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAppState();
  const seg = pathname.split("/")[1] ?? "";
  const title = TITLES[seg] ?? "Dashboard";

  return (
    <header className="lb-topbar">
      <div className="lb-topbar__title">{title}</div>
      <GlobalSearch />
      <div className="lb-topbar__spacer" />
      <div className="lb-topbar__actions">
        <button className="lb-btn lb-btn--gradient lb-btn--sm" onClick={() => router.push("/agent")}>
          <Sparkles /> Agent
        </button>
        <IconButton label="Help" icon="LifeBuoy" />
        <NotificationsMenu />
        <Avatar name={profile.name} size={32} status="online" />
      </div>
    </header>
  );
}

export function ToastStack() {
  const { toasts, dismissToast } = useAppState();
  const icons = {
    success: <CheckCircle2 />,
    info: <Sparkles />,
    warn: <AlertTriangle />,
    danger: <XCircle />,
  };
  return (
    <div className="lb-toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`lb-toast lb-toast--${t.variant}`}>
          <span className="lb-toast__icon">{icons[t.variant]}</span>
          <div>
            <div className="lb-toast__title">{t.title}</div>
            <div className="lb-toast__msg">{t.message}</div>
          </div>
          <button className="lb-toast__close" aria-label="Dismiss" onClick={() => dismissToast(t.id)}>
            <X />
          </button>
        </div>
      ))}
    </div>
  );
}

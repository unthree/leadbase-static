"use client";

// The DataSource seam (mock implementation). Screens read state and call
// actions from here only — never fixtures or a backend client directly.
// Phase 5 swaps the internals of this provider for Supabase without
// touching any screen. Mock behaviors and timings follow SPEC §6.1.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as fx from "../fixtures";
import type {
  AgentActivity,
  AgentAsset,
  AgentTask,
  AppNotification,
  Business,
  ChatMessage,
  GradientKind,
  Lead,
  Opportunity,
  Profile,
  ToastVariant,
} from "../types";

const TOAST_MS = 4400;
const FEED_TICK_MS = 5200;
const TASK_TICK_MS = 1500;
const CHAT_REPLY_MS = 1300;
const RESCAN_RESULT_MS = 6000;
const RESCAN_COOLDOWN_MS = 10 * 60 * 1000;
const BUILD_STEP_MS = 15000; // 4 tasks ≈ 60s total per SPEC §6.1

export const PLAN_LIMITS: Record<Profile["plan"], { active: number; saved: number }> = {
  solo: { active: 1, saved: 10 },
  operator: { active: 3, saved: 25 },
  studio: { active: Infinity, saved: Infinity },
};

export interface Toast {
  id: number;
  variant: ToastVariant;
  title: string;
  message: string;
}

interface AppState {
  profile: Profile;
  opportunities: Opportunity[];
  archivedOpportunities: Opportunity[];
  portfolio: Business[];
  leads: Lead[];
  assets: AgentAsset[];
  agentFeed: AgentActivity[];
  agentTasks: AgentTask[];
  chat: ChatMessage[];
  notifications: AppNotification[];
  toasts: Toast[];
  agentBusy: boolean;
  pendingBatchBusinessId: string | null;
  inProgressMoves: string[];
  canBuild: boolean;
  unreadCount: number;
  // actions
  pushToast: (variant: ToastVariant, title: string, message: string) => void;
  dismissToast: (id: number) => void;
  toggleSave: (id: string) => void;
  buildBusiness: (id: string) => void;
  approveMove: (businessId: string) => void;
  rescan: () => void;
  sendChat: (text: string) => void;
  tickFeed: () => void;
  tickTasks: () => void;
  markNotificationRead: (id: string) => void;
  restoreOpportunity: (id: string) => void;
  approveOutreachBatch: (businessId: string) => void;
  publishAsset: (assetId: string) => void;
  updateInterests: (interests: string[]) => void;
  setAgentPaused: (paused: boolean) => void;
  setApprovalMode: (mode: Profile["approvalMode"]) => void;
  wipeBusiness: (businessId: string) => void;
}

const Ctx = createContext<AppState | null>(null);

const archivedSeed: Opportunity[] = [
  {
    id: "o-arch-1",
    title: "Notion templates for wedding planners",
    match: 58,
    why: "Related to a board you saved in March; demand cooled since.",
    buyer: "Independent wedding planners",
    signal: "Template marketplace searches flat MoM",
    difficulty: "Low",
    revenue: "$19 one-time · volume play",
    tags: ["Content"],
    status: "archived",
    saved: false,
  },
];

const GRADIENTS: GradientKind[] = ["swarm", "flow", "pulse"];

let uid = 100;
const nextId = (prefix: string) => `${prefix}${++uid}`;

const nowHHMM = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(fx.profile);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(fx.opportunities);
  const [archivedOpportunities, setArchived] = useState<Opportunity[]>(archivedSeed);
  const [portfolio, setPortfolio] = useState<Business[]>(fx.portfolio);
  const [leads, setLeads] = useState<Lead[]>(fx.leads);
  const [assets, setAssets] = useState<AgentAsset[]>(fx.assets);
  const [agentFeed, setAgentFeed] = useState<AgentActivity[]>(fx.agentFeedSeed);
  const [agentTasks, setAgentTasks] = useState<AgentTask[]>(fx.agentTasksSeed);
  const [chat, setChat] = useState<ChatMessage[]>(fx.chatSeed);
  const [notifications, setNotifications] = useState<AppNotification[]>(fx.notifications);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [agentBusy, setAgentBusy] = useState(false);
  const [pendingBatchBusinessId, setPendingBatch] = useState<string | null>("p1");
  const [inProgressMoves, setInProgressMoves] = useState<string[]>([]);

  const rescanReadyAt = useRef(0);
  const rescanPoolUsed = useRef(false);
  const feedPoolIdx = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const pushToast = useCallback((variant: ToastVariant, title: string, message: string) => {
    const id = ++uid;
    setToasts((t) => [...t, { id, variant, title, message }].slice(-3));
    later(() => setToasts((t) => t.filter((x) => x.id !== id)), TOAST_MS);
  }, [later]);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const activeCount = portfolio.filter((p) =>
    ["building", "testing", "active"].includes(p.status)
  ).length;
  const limits = PLAN_LIMITS[profile.plan];
  const canBuild = activeCount < limits.active;

  const addActivity = useCallback((a: Omit<AgentActivity, "id" | "time">) => {
    setAgentFeed((f) =>
      [{ ...a, id: nextId("af"), time: nowHHMM() }, ...f].slice(0, 6)
    );
  }, []);

  const toggleSave = useCallback((id: string) => {
    const opp = opportunities.find((o) => o.id === id);
    if (!opp) return;
    if (!opp.saved) {
      const savedCount = portfolio.filter((p) => p.status === "researching").length;
      if (savedCount >= limits.saved) {
        pushToast("warn", "Saved limit reached", `${profile.plan === "solo" ? "Solo" : "Operator"} allows ${limits.saved} saved opportunities. Upgrade for more.`);
        return;
      }
      setOpportunities((os) => os.map((o) => (o.id === id ? { ...o, saved: true, status: "saved" } : o)));
      setPortfolio((p) => [
        ...p,
        {
          id: nextId("p"),
          name: opp.title.length > 28 ? `${opp.title.slice(0, 28)}…` : opp.title,
          status: "researching",
          revenue: "—",
          leads: 0,
          note: "Saved from the feed; agent is validating demand.",
          nextAction: "Confirm ICP before building",
          gradient: GRADIENTS[p.length % 3],
          opportunityId: opp.id,
        },
      ]);
      pushToast("success", "Saved to portfolio", `${opp.title} — Researching.`);
    } else {
      setOpportunities((os) => os.map((o) => (o.id === id ? { ...o, saved: false, status: "new" } : o)));
      setPortfolio((p) => p.filter((b) => !(b.opportunityId === id && b.status === "researching")));
    }
  }, [opportunities, portfolio, limits.saved, profile.plan, pushToast]);

  const buildBusiness = useCallback((id: string) => {
    const opp = opportunities.find((o) => o.id === id);
    if (!opp || !canBuild) return;
    const bizId = nextId("p");
    setOpportunities((os) => os.map((o) => (o.id === id ? { ...o, status: "built" } : o)));
    setPortfolio((p) => [
      {
        id: bizId,
        name: opp.title.length > 28 ? `${opp.title.slice(0, 28)}…` : opp.title,
        status: "building",
        revenue: "—",
        leads: 0,
        note: "Agent is spinning up the landing page and outreach.",
        nextAction: null,
        gradient: GRADIENTS[p.length % 3],
        opportunityId: opp.id,
      },
      ...p.filter((b) => !(b.opportunityId === id && b.status === "researching")),
    ]);
    pushToast("info", "Agent is building", `${opp.title} — spinning up landing page + outreach.`);

    // Mock build run: 4 tasks, sequential, ~60s total (SPEC §6.1), then building → testing.
    const runTasks: AgentTask[] = fx.buildSteps.map((label, i) => ({
      id: nextId("t"),
      label,
      icon: ["layout-template", "send", "magnet", "list-checks"][i] ?? "circle",
      state: "queued",
      pct: 0,
    }));
    setAgentTasks(runTasks);
    setAgentBusy(true);
    runTasks.forEach((t, i) => {
      later(() => {
        setAgentTasks((ts) => ts.map((x) => (x.id === t.id ? { ...x, state: "running" } : x)));
      }, i * BUILD_STEP_MS);
      later(() => {
        setAgentTasks((ts) => ts.map((x) => (x.id === t.id ? { ...x, state: "done", pct: 100 } : x)));
        addActivity({ kind: i === 0 ? "build" : i === 3 ? "asset" : "leads", text: `${t.label} — done.` });
      }, (i + 1) * BUILD_STEP_MS);
    });
    later(() => {
      setAgentBusy(false);
      setPortfolio((p) =>
        p.map((b) =>
          b.id === bizId
            ? { ...b, status: "testing", note: "Assets live; first outreach batch awaiting approval.", nextAction: "Approve outreach batch #1", leads: 25 }
            : b
        )
      );
      setPendingBatch(bizId);
      setAssets((a) => [
        ...a,
        { id: nextId("as"), businessId: bizId, kind: "landing", icon: "layout-template", title: `${opp.title.split(" ").slice(0, 2).join(" ")} landing page`, state: "live" },
        { id: nextId("as"), businessId: bizId, kind: "magnet", icon: "file-text", title: "Lead magnet checklist.pdf", state: "ready" },
        { id: nextId("as"), businessId: bizId, kind: "outreach", icon: "mail", title: "Outreach sequence (3 emails)", state: "draft" },
      ]);
      setNotifications((n) => [
        { id: nextId("n"), kind: "approval_needed", text: `Outreach batch for ${opp.title} needs your approval.`, time: nowHHMM(), read: false, href: `/builder/${bizId}` },
        ...n,
      ]);
    }, 4 * BUILD_STEP_MS + 400);
  }, [opportunities, canBuild, pushToast, addActivity, later]);

  const approveMove = useCallback((businessId: string) => {
    const biz = portfolio.find((b) => b.id === businessId);
    if (!biz || !biz.nextAction) return;
    const action = biz.nextAction;
    setInProgressMoves((m) => [...m, businessId]);
    pushToast("success", "Move approved", `${biz.name} — ${action}`);
    addActivity({ kind: "build", text: `Started: ${action} (${biz.name}).` });
    later(() => {
      setInProgressMoves((m) => m.filter((x) => x !== businessId));
      setPortfolio((p) =>
        p.map((b) =>
          b.id === businessId
            ? { ...b, note: `Done: ${action}.`, nextAction: "Review results and pick the next experiment" }
            : b
        )
      );
    }, RESCAN_RESULT_MS);
  }, [portfolio, pushToast, addActivity, later]);

  const rescan = useCallback(() => {
    const now = Date.now();
    if (now < rescanReadyAt.current) {
      const mins = Math.ceil((rescanReadyAt.current - now) / 60000);
      pushToast("warn", "Rescan cooling down", `Try again in ~${mins} min.`);
      return;
    }
    rescanReadyAt.current = now + RESCAN_COOLDOWN_MS;
    pushToast("info", "Rescanning your signals", "Your agent is sweeping fresh market data.");
    later(() => {
      if (!rescanPoolUsed.current) {
        rescanPoolUsed.current = true;
        setOpportunities((os) => [...fx.rescanOpportunities, ...os]);
        addActivity({ kind: "research", text: "Manual rescan surfaced 2 fresh opportunities." });
      } else {
        addActivity({ kind: "research", text: "Rescan complete — no fresh signals since last sweep." });
      }
    }, RESCAN_RESULT_MS);
  }, [pushToast, addActivity, later]);

  const sendChat = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || agentBusy) return;
    const thinkingId = nextId("m");
    setChat((c) => [
      ...c.filter((m) => !m.thinking),
      { id: nextId("m"), author: "user", body: trimmed },
      { id: thinkingId, author: "agent", thinking: true, body: "Thinking through the best next move…" },
    ]);
    setAgentBusy(true);
    later(() => {
      setChat((c) =>
        c.map((m) =>
          m.id === thinkingId
            ? { id: thinkingId, author: "agent", body: "Got it. I'll queue that now and report back the moment there's a buyer-ready result. You'll see it land in your activity feed." }
            : m
        )
      );
      setAgentBusy(false);
    }, CHAT_REPLY_MS);
  }, [agentBusy, later]);

  const tickFeed = useCallback(() => {
    const pick = fx.activityPool[feedPoolIdx.current % fx.activityPool.length];
    feedPoolIdx.current += 1;
    addActivity(pick);
  }, [addActivity]);

  const tickTasks = useCallback(() => {
    setAgentTasks((ts) =>
      ts.map((t) =>
        t.state === "running" && t.pct < 100
          ? { ...t, pct: Math.min(100, t.pct + 2 + Math.round(Math.random() * 6)) }
          : t
      )
    );
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));
  }, []);

  const restoreOpportunity = useCallback((id: string) => {
    const opp = archivedOpportunities.find((o) => o.id === id);
    if (!opp) return;
    setArchived((a) => a.filter((o) => o.id !== id));
    setOpportunities((os) => [{ ...opp, status: "new" }, ...os]);
    pushToast("success", "Opportunity restored", `${opp.title} is back in your feed.`);
  }, [archivedOpportunities, pushToast]);

  const approveOutreachBatch = useCallback((businessId: string) => {
    if (pendingBatchBusinessId !== businessId) return;
    setPendingBatch(null);
    setPortfolio((p) =>
      p.map((b) =>
        b.id === businessId && b.status === "building"
          ? { ...b, status: "testing", note: "Batch #1 approved — sends queued from your inbox." }
          : b.id === businessId
            ? { ...b, note: "Batch #1 approved — sends queued from your inbox.", nextAction: "Review replies tomorrow morning" }
            : b
      )
    );
    pushToast("success", "Batch approved", "25 outreach DMs queued — sent from your connected inbox, rate-limited.");
    addActivity({ kind: "leads", text: "Outreach batch #1 approved; sends scheduled." });
    setNotifications((n) => n.map((x) => (x.href === `/builder/${businessId}` && x.kind === "approval_needed" ? { ...x, read: true } : x)));
  }, [pendingBatchBusinessId, pushToast, addActivity]);

  const publishAsset = useCallback((assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;
    setAssets((as) => as.map((a) => (a.id === assetId ? { ...a, state: "live" } : a)));
    pushToast("success", "Published", `${asset.title} is now live.`);
    addActivity({ kind: "asset", text: `Published: ${asset.title}.` });
  }, [assets, pushToast, addActivity]);

  const updateInterests = useCallback((interests: string[]) => {
    setProfile((p) => ({ ...p, interests }));
    pushToast("success", "Interests updated", "Your agent will use these on the next run.");
  }, [pushToast]);

  const setAgentPaused = useCallback((paused: boolean) => {
    setProfile((p) => ({ ...p, agentPaused: paused }));
    pushToast(paused ? "warn" : "success", paused ? "Agent paused" : "Agent resumed", paused ? "No runs will start until you resume." : "Runs resume in your nightly window.");
  }, [pushToast]);

  const setApprovalMode = useCallback((mode: Profile["approvalMode"]) => {
    setProfile((p) => ({ ...p, approvalMode: mode }));
    pushToast("success", "Approval mode updated", mode === "every-message" ? "You'll approve every message." : "You'll approve batches only.");
  }, [pushToast]);

  const wipeBusiness = useCallback((businessId: string) => {
    const biz = portfolio.find((b) => b.id === businessId);
    if (!biz) return;
    setPortfolio((p) => p.filter((b) => b.id !== businessId));
    setLeads((l) => l.filter((x) => x.businessId !== businessId));
    setAssets((a) => a.filter((x) => x.businessId !== businessId));
    pushToast("success", "Business wiped", `${biz.name} and everything the agent learned for it were deleted.`);
  }, [portfolio, pushToast]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = useMemo<AppState>(
    () => ({
      profile,
      opportunities,
      archivedOpportunities,
      portfolio,
      leads,
      assets,
      agentFeed,
      agentTasks,
      chat,
      notifications,
      toasts,
      agentBusy,
      pendingBatchBusinessId,
      inProgressMoves,
      canBuild,
      unreadCount,
      pushToast,
      dismissToast,
      toggleSave,
      buildBusiness,
      approveMove,
      rescan,
      sendChat,
      tickFeed,
      tickTasks,
      markNotificationRead,
      restoreOpportunity,
      approveOutreachBatch,
      publishAsset,
      updateInterests,
      setAgentPaused,
      setApprovalMode,
      wipeBusiness,
    }),
    [profile, opportunities, archivedOpportunities, portfolio, leads, assets, agentFeed, agentTasks, chat, notifications, toasts, agentBusy, pendingBatchBusinessId, inProgressMoves, canBuild, unreadCount, pushToast, dismissToast, toggleSave, buildBusiness, approveMove, rescan, sendChat, tickFeed, tickTasks, markNotificationRead, restoreOpportunity, approveOutreachBatch, publishAsset, updateInterests, setAgentPaused, setApprovalMode, wipeBusiness]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}

export function useFeedTicker(enabled: boolean) {
  const { tickFeed, profile } = useAppState();
  useEffect(() => {
    if (!enabled || profile.agentPaused) return;
    const t = setInterval(tickFeed, FEED_TICK_MS);
    return () => clearInterval(t);
  }, [enabled, profile.agentPaused, tickFeed]);
}

export function useTaskTicker(enabled: boolean) {
  const { tickTasks } = useAppState();
  useEffect(() => {
    if (!enabled) return;
    const t = setInterval(tickTasks, TASK_TICK_MS);
    return () => clearInterval(t);
  }, [enabled, tickTasks]);
}

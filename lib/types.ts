export type Difficulty = "Low" | "Medium" | "High";
export type OpportunityStatus = "new" | "saved" | "built" | "archived";
export type BusinessStatus = "researching" | "building" | "testing" | "active" | "archived";
export type GradientKind = "swarm" | "flow" | "pulse";
export type RunTaskState = "queued" | "running" | "done" | "failed";
export type AssetState = "draft" | "ready" | "live";
export type ActivityKind = "research" | "build" | "leads" | "asset";
export type LeadStatus = "new" | "engaged" | "won" | "lost";
export type Plan = "solo" | "operator" | "studio";
export type ToastVariant = "success" | "info" | "warn" | "danger";

export interface Opportunity {
  id: string;
  title: string;
  match: number;
  why: string;
  buyer: string;
  signal: string;
  difficulty: Difficulty;
  revenue: string;
  tags: string[];
  status: OpportunityStatus;
  saved: boolean;
  featured?: boolean;
}

export interface Business {
  id: string;
  name: string;
  status: BusinessStatus;
  revenue: string;
  leads: number;
  note: string;
  nextAction: string | null;
  gradient: GradientKind;
  opportunityId?: string;
}

export interface Lead {
  id: string;
  businessId: string;
  name: string;
  snippet: string;
  valueCents: number;
  intent: number;
  status: LeadStatus;
}

export interface AgentTask {
  id: string;
  label: string;
  icon: string;
  state: RunTaskState;
  pct: number;
}

export interface AgentActivity {
  id: string;
  kind: ActivityKind;
  text: string;
  time: string;
}

export interface AgentAsset {
  id: string;
  businessId: string;
  kind: "landing" | "magnet" | "outreach";
  icon: string;
  title: string;
  state: AssetState;
}

export interface ChatMessage {
  id: string;
  author: "user" | "agent";
  thinking?: boolean;
  body: string;
}

export interface Stat {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  sub: string;
  icon: string;
}

export interface Suggestion {
  id: string;
  icon: string;
  text: string;
  meta: string;
}

export interface MarketSignal {
  id: string;
  source: string;
  metric: string;
  date: string;
  opportunityId: string;
  tag: string;
}

export interface ResearchSource {
  id: string;
  title: string;
  domain: string;
  date: string;
  runLabel: string;
}

export interface AppNotification {
  id: string;
  kind: "run_finished" | "approval_needed" | "lead_won" | "limit_reached";
  text: string;
  time: string;
  read: boolean;
  href: string;
}

export interface Profile {
  name: string;
  email: string;
  plan: Plan;
  trialDaysLeft: number | null;
  interests: string[];
  goals: string[];
  agentPaused: boolean;
  approvalMode: "every-message" | "batches-only";
  runWindow: string;
}

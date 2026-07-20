// Mock data mirroring the canonical Leadbase Pro Dashboard mockup (.dc.html).
// Consumed only through lib/data — screens never import fixtures directly.
import type {
  AgentActivity,
  AgentAsset,
  AgentTask,
  AppNotification,
  Business,
  ChatMessage,
  Lead,
  MarketSignal,
  Opportunity,
  Profile,
  ResearchSource,
  Stat,
  Suggestion,
} from "../types";

export const profile: Profile = {
  name: "Maya Okoro",
  email: "maya@onboardloop.co",
  plan: "operator",
  trialDaysLeft: 9,
  interests: ["Product onboarding", "B2B SaaS", "Local lead-gen", "Real-estate tech"],
  goals: ["Reach $5k MRR across the portfolio", "Ship one new build per month"],
  agentPaused: false,
  approvalMode: "every-message",
  runWindow: "02:00–06:00",
};

export const stats: Stat[] = [
  { id: "score", label: "Opportunity score", value: "87", delta: "+6", trend: "up", sub: "vs last week", icon: "target" },
  { id: "leads", label: "Buyer leads ready", value: "1,284", delta: "+12%", trend: "up", sub: "42 new today", icon: "users" },
  { id: "builds", label: "Micro-businesses live", value: "5", delta: "+1", trend: "up", sub: "2 in testing", icon: "boxes" },
  { id: "mrr", label: "Portfolio MRR path", value: "$4.2k", delta: "-3%", trend: "down", sub: "across 5 builds", icon: "trending-up" },
];

export const opportunities: Opportunity[] = [
  {
    id: "o1",
    title: "Onboarding teardown service for seed SaaS",
    match: 92,
    why: "Matches your saved interest in product onboarding and your 6 years in B2B SaaS.",
    buyer: "Seed-stage SaaS founders",
    signal: "37 funding announcements this week in your ICP",
    difficulty: "Low",
    revenue: "$1.5–3k per teardown · retainer upsell",
    tags: ["SaaS", "Productized", "High intent"],
    status: "new",
    saved: false,
    featured: true,
  },
  {
    id: "o2",
    title: "Local HVAC lead-gen microsite network",
    match: 78,
    why: "Strong buyer-intent signals in home services; low competition in your region.",
    buyer: "HVAC & home-service owners",
    signal: "Search demand up 24% MoM in 3 metros",
    difficulty: "Medium",
    revenue: "$800/mo per market · 4 markets ready",
    tags: ["Local", "Recurring"],
    status: "new",
    saved: false,
  },
  {
    id: "o3",
    title: "AI prompt library for real-estate agents",
    match: 71,
    why: "You follow this niche and saved two related ideas last month.",
    buyer: "Independent realtors",
    signal: "12k agents searching 'listing AI' monthly",
    difficulty: "Low",
    revenue: "$29/mo subscription · content-led",
    tags: ["Content", "SaaS"],
    status: "new",
    saved: false,
  },
  {
    id: "o4",
    title: "Done-for-you cold email for fractional CFOs",
    match: 66,
    why: "Adjacent to your network; high deal sizes, low supply of operators.",
    buyer: "Fractional CFOs & bookkeepers",
    signal: "Rising 'fractional finance' hiring posts",
    difficulty: "Medium",
    revenue: "$2k setup · $1k/mo managed",
    tags: ["Service", "High ticket"],
    status: "new",
    saved: false,
  },
];

export const rescanOpportunities: Opportunity[] = [
  {
    id: "o5",
    title: "Churn-save email teardowns for subscription boxes",
    match: 74,
    why: "Overlaps your onboarding expertise; subscription operators are in your saved reading.",
    buyer: "DTC subscription operators",
    signal: "Churn mentions up 31% in operator forums this month",
    difficulty: "Low",
    revenue: "$900 per teardown · monthly retainer path",
    tags: ["Service", "SaaS"],
    status: "new",
    saved: false,
  },
  {
    id: "o6",
    title: "Booking-page optimization for local med-spas",
    match: 69,
    why: "Applies your conversion background to a high-margin local niche.",
    buyer: "Med-spa owners",
    signal: "Paid CPCs falling 18% — organic gap opening",
    difficulty: "Medium",
    revenue: "$1.2k setup · $400/mo maintenance",
    tags: ["Local", "Recurring"],
    status: "new",
    saved: false,
  },
];

export const portfolio: Business[] = [
  {
    id: "p1",
    name: "OnboardLoop",
    status: "building",
    revenue: "$0 → $3k/mo",
    leads: 18,
    note: "Landing live; first 25 DMs queued.",
    nextAction: "Approve outreach batch #1",
    gradient: "swarm",
    opportunityId: "o1",
  },
  {
    id: "p2",
    name: "CivicHVAC Leads",
    status: "active",
    revenue: "$2.4k/mo",
    leads: 132,
    note: "4 markets live, Phoenix converting best.",
    nextAction: "Clone playbook to 2 new metros",
    gradient: "flow",
  },
  {
    id: "p3",
    name: "ListingPrompts",
    status: "testing",
    revenue: "$420/mo",
    leads: 64,
    note: "A/B testing $19 vs $29 price point.",
    nextAction: "Pick winning price, scale content",
    gradient: "pulse",
  },
  {
    id: "p4",
    name: "CFO Outbound Co",
    status: "researching",
    revenue: "—",
    leads: 0,
    note: "Validating supply of fractional CFOs.",
    nextAction: "Confirm ICP before building",
    gradient: "swarm",
  },
];

export const leads: Lead[] = [
  { id: "l1", businessId: "p1", name: "Dana Whitfield", snippet: "Replied: 'send the teardown scope'", valueCents: 250000, intent: 0.87, status: "engaged" },
  { id: "l2", businessId: "p1", name: "Arun Patel", snippet: "Clicked payment link twice", valueCents: 180000, intent: 0.74, status: "engaged" },
  { id: "l3", businessId: "p1", name: "Sofia Reyes", snippet: "Booked intro call for Thursday", valueCents: 300000, intent: 0.91, status: "new" },
  { id: "l4", businessId: "p2", name: "Hank's Heating & Air", snippet: "Won: Phoenix exclusive", valueCents: 80000, intent: 1.0, status: "won" },
  { id: "l5", businessId: "p2", name: "Desert Cool LLC", snippet: "Asked for Tucson pricing", valueCents: 80000, intent: 0.62, status: "engaged" },
  { id: "l6", businessId: "p3", name: "Marcy Lin, Realtor", snippet: "Trialing at $29 tier", valueCents: 2900, intent: 0.55, status: "engaged" },
];

export const buildSteps: string[] = [
  "Generate landing page + booking flow",
  "Draft 25 personalized outreach DMs",
  "Set up activation-leak lead magnet",
  "Schedule follow-up sub-agent",
];

export const suggestions: Suggestion[] = [
  { id: "g1", icon: "rocket", text: "Approve outreach batch for OnboardLoop", meta: "25 leads ready" },
  { id: "g2", icon: "git-branch", text: "Clone CivicHVAC playbook to Austin & Tampa", meta: "Est. +$1.6k/mo" },
  { id: "g3", icon: "flask-conical", text: "End the ListingPrompts price test", meta: "$29 winning at 1.8x" },
];

export const agentFeedSeed: AgentActivity[] = [
  { id: "af-a", kind: "research", text: "Scanned 1,204 funding announcements, kept 37 matching your ICP.", time: "09:12" },
  { id: "af-b", kind: "build", text: "Drafted the OnboardLoop landing page and booking flow.", time: "09:18" },
  { id: "af-c", kind: "leads", text: "Found 25 seed founders shipping self-serve onboarding this month.", time: "09:24" },
  { id: "af-d", kind: "asset", text: "Generated the 'Activation Leak' lead-magnet checklist (PDF).", time: "09:31" },
];

export const activityPool: Array<Pick<AgentActivity, "kind" | "text">> = [
  { kind: "leads", text: "Verified 6 more buyer emails for the OnboardLoop batch." },
  { kind: "research", text: "Spotted 4 fresh funding rounds matching your ICP." },
  { kind: "build", text: "Refined the booking-page copy after an A/B insight." },
  { kind: "asset", text: "Drafted a follow-up email for non-openers." },
  { kind: "leads", text: "Found 3 fractional-CFO prospects in your network." },
  { kind: "research", text: "Search demand for 'listing AI' ticked up another 2%." },
];

export const agentTasksSeed: AgentTask[] = [
  { id: "t1", label: "Personalize 25 outreach DMs", icon: "send", state: "running", pct: 64 },
  { id: "t2", label: "Verify buyer emails (Hunter)", icon: "mail-check", state: "running", pct: 38 },
  { id: "t3", label: "Draft follow-up sequence", icon: "list-checks", state: "queued", pct: 0 },
  { id: "t4", label: "Build activation-leak checklist", icon: "magnet", state: "done", pct: 100 },
];

export const assets: AgentAsset[] = [
  { id: "as1", businessId: "p1", kind: "landing", icon: "layout-template", title: "OnboardLoop landing page", state: "live" },
  { id: "as2", businessId: "p1", kind: "magnet", icon: "file-text", title: "Activation Leak checklist.pdf", state: "ready" },
  { id: "as3", businessId: "p1", kind: "outreach", icon: "mail", title: "Outreach sequence (3 emails)", state: "draft" },
];

export const chatSeed: ChatMessage[] = [
  { id: "m1", author: "user", body: "Build the onboarding-teardown opportunity into a real micro-business and start finding buyers." },
  {
    id: "m2",
    author: "agent",
    body: "On it. I scoped OnboardLoop — teardowns for seed SaaS founders shipping self-serve onboarding. I built the landing page + booking flow, I'm drafting 25 personalized outreach DMs, and I'm generating the “Activation Leak” lead magnet.",
  },
  {
    id: "m3",
    author: "agent",
    body: "I found 25 seed founders who shipped onboarding changes this month and verified 18 emails so far. Want me to send batch #1 once you approve the script?",
  },
  { id: "m4", author: "user", body: "Yes — but soften the first line." },
  { id: "m5", author: "agent", thinking: true, body: "Rewriting outreach in a warmer tone…" },
];

export const signals: MarketSignal[] = [
  { id: "s1", source: "Crunchbase sweep", metric: "37 funding announcements matching ICP", date: "This week", opportunityId: "o1", tag: "SaaS" },
  { id: "s2", source: "Search trends", metric: "HVAC demand up 24% MoM in 3 metros", date: "This month", opportunityId: "o2", tag: "Local" },
  { id: "s3", source: "Keyword monitor", metric: "12k agents searching 'listing AI' monthly", date: "Ongoing", opportunityId: "o3", tag: "Content" },
  { id: "s4", source: "Job-post monitor", metric: "Rising 'fractional finance' hiring posts", date: "Last 2 weeks", opportunityId: "o4", tag: "Service" },
];

export const sources: ResearchSource[] = [
  { id: "src1", title: "State of SaaS Onboarding 2026", domain: "openviewpartners.com", date: "Jul 14", runLabel: "Nightly loop #241" },
  { id: "src2", title: "Seed rounds this week — B2B tools", domain: "crunchbase.com", date: "Jul 15", runLabel: "Nightly loop #242" },
  { id: "src3", title: "Home-services search demand index", domain: "semrush.com", date: "Jul 12", runLabel: "Rescan (manual)" },
  { id: "src4", title: "r/realtors — 'AI listing copy' thread", domain: "reddit.com", date: "Jul 10", runLabel: "Nightly loop #239" },
  { id: "src5", title: "Fractional CFO hiring, Q3 snapshot", domain: "linkedin.com", date: "Jul 9", runLabel: "Nightly loop #238" },
];

export const notifications: AppNotification[] = [
  { id: "n1", kind: "approval_needed", text: "Outreach batch #1 for OnboardLoop needs your approval.", time: "09:24", read: false, href: "/builder/p1" },
  { id: "n2", kind: "run_finished", text: "Nightly run finished — 12 new opportunities, 42 leads.", time: "06:02", read: false, href: "/dashboard" },
  { id: "n3", kind: "lead_won", text: "CivicHVAC won Hank's Heating & Air (Phoenix exclusive).", time: "Yesterday", read: true, href: "/builder/p2" },
];

export const overnight = { loops: 4, newOpportunities: 12, newLeads: 42 };

export const workbenchCounters = { sources: 1204, leads: 25 };

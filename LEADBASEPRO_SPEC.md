# LeadbasePro — Product & Functional Specification (v1.0)

> **What this is.** The authoritative definition of WHAT LeadbasePro does — every feature,
> behavior, rule, state, and data contract. The companion `LEADBASEPRO_BUILD_PLAN.md` defines
> the ORDER of execution; `design-system/examples.html` defines what screens LOOK like;
> `AGENTS.md` defines HOW the executor works. Where documents disagree, **this spec wins** on
> behavior, `examples.html` wins on visuals.
>
> **Sources.** Canonical interactive mockup (`Leadbase Pro Dashboard.dc.html`, including its
> full state logic), the second-generation shell (view enum: home, feed, builder, research,
> portfolio, agent, settings), and the Leadbase marketing site (pricing, lead definition,
> outreach and privacy rules). Every rule below is decided; a Decisions Register at the end
> lists the judgment calls so they can be audited in one pass.

---

## 1. Product definition

**LeadbasePro** is an AI-operator workspace. A user connects their context (interests, goals,
research, saved ideas, work signals). The agent continuously converts that context into:

1. **Opportunities** — scored micro-business hypotheses with real demand evidence.
2. **Micro-businesses** — opportunities the user chose to build; the agent assembles the
   storefront, lead magnet, and outreach, then operates them.
3. **Buyer-leads** — specific humans who signaled willingness to pay (a reply, a payment-link
   click, a booked call). *An email signup is NOT a buyer-lead.*

**Operating principle (autonomy contract):** the agent executes small moves autonomously and
logs them; every **irreversible or outward-facing move requires explicit user approval**.
Outward-facing = anything a third party can see (sending outreach, publishing a page, charging
money). This rule is global and non-negotiable in v1.

**Tagline behaviors the product must honor** (from marketing):
- "Ships while you sleep": a nightly agent run per active user produces the morning state.
- "You wake up to buyer-leads": the dashboard is a morning briefing, not an analytics dump.
- "Your domain, list, and content stay owned by you": all generated assets are exportable;
  deleting a business deletes everything the agent learned for it.

---

## 2. Users, auth, and session

### 2.1 Authentication
- Methods: **Google OAuth** and **email + password** (Supabase Auth).
- Password rules: min 8 chars; standard Supabase reset-by-email flow. No password strength
  meter in v1.
- Session: persistent (refresh-token) until sign-out. No "remember me" checkbox — always on.
- Unauthenticated access to any `(app)` route → redirect to `/login`. Authenticated visit to
  `/login` → redirect to `/dashboard`.
- After first-ever login, create a `profiles` row (plan `solo`, trial), then route to
  `/dashboard`. v1 has **no onboarding wizard**; interests are managed in Settings (§3.9).

### 2.2 Plans & entitlements (from marketing pricing)

| | **Solo** $29/mo | **Operator** $89/mo | **Studio** custom |
|---|---|---|---|
| Active micro-businesses (status `building`/`testing`/`active`) | 1 | 3 | Unlimited |
| Qualified buyer-leads surfaced / month | 50 | 250 | Unlimited |
| Saved (researching) opportunities | 10 | 25 | Unlimited |
| Nightly agent runs | ✓ | ✓ | ✓ (priority queue) |
| Morning brief | ✓ | ✓ | ✓ |
| Auto-built storefront + Stripe payment link | — | ✓ | ✓ |
| Outreach drafting + reply suggestions | — | ✓ | ✓ |
| Team workspace / roles | — | — | ✓ (post-v1) |

- **Trial:** every new account gets a 14-day free trial with **Operator** entitlements; at
  expiry without a subscription, account drops to read-only until a plan is chosen (data kept).
- **Limit behavior:** hitting a limit never destroys anything. Attempting to exceed it shows a
  toast (`warn`) + an upgrade CTA. Example: Solo user with 1 active business clicks "Build" →
  modal still opens, confirm button is replaced by "Upgrade to build more".
- Plan changes take effect immediately; Stripe webhook is the source of truth for `profiles.plan`.

---

## 3. Screens — functional specification

Navigation (sidebar, in order): **Workspace:** Dashboard, Opportunity Feed (badge = count of
unviewed opportunities), Portfolio · **Agent:** AI Workspace · plus **Builder**, **Research**,
**Settings** (§3.7–3.9). Topbar (standard views): view title, global search, gradient "Agent"
button → AI Workspace, help, notifications bell (magenta dot when unread > 0), avatar.

Every data-bearing surface implements **4 states**: loading (lb-skeleton), empty (lb-empty with
one CTA), error (inline retry, never a blank screen), populated.

### 3.1 Login (`/login`)
- Split layout: dark brand panel (spinning swarm mark, headline, value prop) + form panel.
- Actions: Continue with Google · email/password sign-in.
- Errors: invalid credentials → inline `lb-field__error` under password, form not cleared;
  network failure → toast (danger). Submit disabled while pending (spinner in button).
- Success → `/dashboard`.

### 3.2 Dashboard (`/dashboard`)
The **morning brief**. Content rules:

- **Greeting:** time-of-day aware ("Good morning/afternoon/evening, {firstName}") + date kicker.
- **Overnight summary line:** rendered from the most recent completed nightly `agent_run`:
  "Your agent ran {N} loops overnight and found **{X} new opportunities** and **{Y} buyer
  leads**." If no run yet (new account): "Your agent is warming up — connect your interests in
  Settings to start the first scan," with CTA → Settings.
- **4 stat cards** (fixed set, this order):
  1. *Opportunity score* — 0–100 composite: weighted mean of the top-5 current opportunities'
     match scores (60%) + week-over-week trend of new qualified leads (40%). Delta vs last week.
  2. *Buyer leads ready* — count of `leads.status IN ('new','engaged')`; sub = "{n} new today".
  3. *Micro-businesses live* — count status `active`; sub = "{n} in testing".
  4. *Portfolio MRR path* — sum of active businesses' modeled monthly revenue; delta vs last
     week; down-trend renders red with `trending-down`.
- **New opportunities found** (left, top): top **3** unviewed opportunities by match desc; row =
  ScoreBadge(46) + title + "{buyer} · {revenue first clause}". Row click → Feed, scrolled to and
  highlighting that card. "View all →" → Feed.
- **Micro-businesses building** (left, bottom): the **2** most recently updated with status
  `building` or `testing`; shows StatusPill, note, thin ProgressBar (§4.2 mapping), leads count,
  revenue. "Portfolio" link → Portfolio. Card click → Builder for that business.
- **Agent activity** (right, top): live feed, newest first, **max 6 rows** rendered; each row =
  colored kind chip (research=sky, build=violet, leads=brand, asset=magenta), one-line text,
  mono HH:MM timestamp. "Live" badge shows whenever a run is in state `running`. Realtime:
  new `agent_tasks` events append without reload (animate: rise 0.4s).
- **Suggested next actions** (right, bottom): exactly **3**, ranked by estimated revenue
  impact desc. Each = icon chip + action text + meta (impact estimate). Click → routes to the
  surface where the action is executed (approval → Builder; clone → Portfolio; etc.). Never a
  dead-end toast in production (mock phase may toast).

### 3.3 Opportunity Feed (`/feed`)
- Header: kicker "Discovered for you", title, subtitle, **Rescan** (secondary button).
- **Rescan:** enqueues a discovery run; button enters loading state (spinning icon, disabled)
  until the run completes or fails; on enqueue → toast (info) "Rescanning your signals".
  Rate-limit: 1 manual rescan per 10 minutes; a second attempt within the window → toast (warn)
  with time remaining.
- **Tabs:** All (count) · SaaS · Local · Content · Service. Filter = case-insensitive match on
  opportunity tags. Tab state is URL-persisted (`?tab=saas`).
- **Sort:** match desc, fixed. The "Sorted by match" caption is informational (no sort UI in v1).
- **Opportunity card** fields (all required): match ScoreBadge(56, labeled "Match") ·
  tag badges (tag "High intent" always renders gradient variant; others neutral) · title ·
  "Why you" callout (references the user's own context) · Buyer type · Market signal ·
  Difficulty badge (Low=success, Medium=warning, High=danger) · Revenue path.
- **Save to portfolio** (toggle): saving creates a portfolio row with status `researching`,
  toast (success) "Saved to portfolio — {title} — Researching." Button becomes secondary
  "Saved" with bookmark-check. Unsaving removes the researching row **only if** the business
  hasn't advanced past `researching`; otherwise the button is disabled with tooltip "Manage in
  Portfolio". Saved-limit reached → toast (warn) + upgrade CTA.
- **Build micro-business** → Build modal (§3.6).
- Opportunity lifecycle: `new` → (viewed) → `saved` and/or `built` → `archived`. Opportunities
  older than 30 days with no save/build auto-archive (recoverable via Research view). The feed
  badge in the sidebar = count of `new` (unviewed).
- Empty states: no opportunities at all → lb-empty "Your agent hasn't found opportunities yet"
  + Rescan CTA; a tab with no matches → "Nothing in {tab} right now."

### 3.4 Portfolio (`/portfolio`)
- Header: kicker, title, totals line = "{n} builds · {Σ leads} buyer leads · {n active}
  generating revenue." · **New from opportunity** (gradient) → Feed.
- **Pill tabs:** All · Researching · Building · Testing · Active (exact status filter,
  URL-persisted).
- **Business card:** top gradient stripe (rotates swarm → flow → pulse by creation order) ·
  name + StatusPill · Revenue (mono) · Buyer leads (mono) · note (latest agent status sentence)
  · "Agent suggests" callout (= the business's `next_action`) · buttons **Open** (secondary,
  → Builder §3.7) and **Approve move** (ghost).
- **Approve move:** executes `next_action` — creates an approved `agent_run` scoped to that
  action, toast (success) "Move approved — {name} — {action}". The callout then shows
  "In progress…" until the run completes and a new suggestion replaces it. If no pending
  suggestion, button hidden.
- **Status lifecycle & transitions** (single source of truth):

  `researching → building → testing → active`, plus `archived` from any state.
  - `researching → building`: **user action only** (Build confirm, §3.6).
  - `building → testing`: **automatic** when all build-phase assets exist (landing page +
    lead magnet + outreach sequence) AND the user has approved the first outreach batch.
  - `testing → active`: **automatic** when the business records its **first paid conversion**
    (Stripe payment or manually-logged sale).
  - `→ archived`: user action; also **agent-recommended** when a business has 0 paid-intent
    leads for 14 consecutive days (the kill rule, from marketing). Recommendation appears as a
    Suggested Action + in the business card callout; archiving is never automatic.
  - Archived businesses: hidden from tabs (visible via `?tab=archived`), assets kept, agent
    stops all work, learned audience is offered for reuse on the next build ("reuse audience"
    checkbox in the next Build modal).

### 3.5 AI Workspace (`/agent`)
Dark, full-height, two panes.

- **Header:** swarm mark · "Agent Workspace" · status line: "● Online · working on {name}"
  when a run is `running`, "● Online · idle" otherwise, "● Paused" if agent paused in Settings
  · "Dashboard" button → `/dashboard`.
- **Conversation (left):** persistent per-user thread (survives reload; one thread in v1).
  User messages right-aligned style-wise per design (avatar + plain bubble); agent messages in
  raised bubbles; agent "thinking" = spinner + status text, replaced in place by the reply.
  - Composer: Enter sends (Shift+Enter newline); empty input no-ops; input clears on send;
    send button disabled while the previous agent turn is streaming.
  - The agent can: answer, propose a plan, and **create runs/tasks** (visible in workbench).
    Any outward-facing step inside a plan pauses at an **approval message** — a special agent
    message with Approve / Modify / Skip buttons inline. Approve = the ONLY way outreach or
    publishing proceeds (autonomy contract §1).
- **Workbench (right):**
  - *Tasks running* card: every task of the currently-selected run: icon chip, label, state
    badge (Queued neutral / Running brand+spinner / Done success / Failed danger), thin
    progress bar while running. Counter badge = "{n} active".
  - Two stat tiles: "Sources researched" and "Leads found" — lifetime counters for the current
    business context (or global when idle).
  - *Assets generated* card: latest assets, each = icon chip, title, status badge
    (Draft neutral / Ready neutral / Live success). Click → asset detail in Builder.
- Realtime: task pct/state and new assets stream in live (Supabase realtime); no polling.

### 3.6 Build modal
Triggered from any "Build micro-business" button.

- Content: title "Build this micro-business?" · subtitle · the opportunity (ScoreBadge 46 +
  title + buyer) · "What your agent will do" checklist, exactly these 4 steps in v1:
  1. Generate landing page + booking flow
  2. Draft {25} personalized outreach DMs *(batch size = plan-scaled: Solo 10, Operator 25, Studio 50)*
  3. Set up lead magnet
  4. Schedule follow-up sub-agent
- Buttons: **Not now** (ghost, closes, no side effects) · **Build it** (gradient).
- **Confirm sequence:** close modal → create portfolio row (status `building`, linked to the
  opportunity, opportunity marked `built`) → enqueue a build `agent_run` with the 4 tasks →
  navigate to `/portfolio` (new card visible, optimistic) → toast (info) "Agent is building —
  {title} — spinning up landing page + outreach."
- Guard: active-business limit reached → confirm button replaced by "Upgrade to build more"
  (routes to Settings → Plan). Esc / scrim click closes. Focus is trapped; initial focus on
  "Build it".

### 3.7 Builder (`/builder/[businessId]`) — the business workspace
*(View exists in the v2 shell enum; spec decided from product logic.)*

The deep-dive for ONE micro-business. Layout: standard topbar (title = business name +
StatusPill) over three stacked zones:

1. **Pipeline header:** status stepper (researching → building → testing → active) with the
   §3.4 progress mapping; Revenue, Leads, Conversion stat row.
2. **Assets:** every generated asset (landing page, lead magnet, outreach sequence, follow-ups)
   as cards with status (Draft/Ready/Live), preview, and actions: *Edit* (opens content in an
   editable panel; edits create a new Draft version), *Publish* (Draft/Ready → Live; this is
   outward-facing ⇒ confirmation dialog), *Export* (download HTML/PDF/text — ownership rule §1).
3. **Leads table:** business's buyer-leads: name, snippet (last signal), intent score
   (0–1, two decimals), value, status (`new → engaged → won/lost`), and a per-lead action:
   *Draft reply* (agent drafts; user approves & sends — Operator+ only).
   Approving an outreach batch happens here (primary CTA when a batch is pending).

Empty (business just created): pipeline header + task list of the running build (mirror of
workbench) so the user watches it being assembled.

### 3.8 Research (`/research`) — the evidence library
*(View exists in the v2 shell enum; spec decided from product logic.)*

Read-only library of everything the agent has gathered. Two tabs:
- **Signals:** market signals backing opportunities (each: source, metric, date, linked
  opportunity). Filterable by tag; searchable.
- **Sources:** documents/pages the agent researched (favicon, title, domain, date, which
  run used it). This is where "1,204 sources researched" becomes inspectable — trust surface.
Archived opportunities are recoverable here (Restore → back to feed as `new`).

### 3.9 Settings (`/settings`)
Sections (single page, anchored):
1. **Profile:** name, avatar.
2. **Context & interests:** the agent's inputs — freeform interests/goals chips (add/remove),
   plus connected sources (Gmail, Calendar, Notion — OAuth connects; v1 ships the UI with
   Gmail/Calendar functional, others "Coming soon"). Removing an interest takes effect on the
   next run.
3. **Agent controls:** master pause/resume switch (paused = no runs, workspace header shows
   Paused) · outreach approval mode: **"Approve every message"** (default) or "Approve batches
   only" · nightly run window (default 02:00–06:00 user-local).
4. **Plan & billing:** current plan, usage vs limits (leads used / businesses active), upgrade/
   downgrade (Stripe customer portal), trial countdown when on trial.
5. **Data & privacy:** export all data (JSON + assets zip) · **wipe a business** (select →
   deletes its rows, leads, assets, learned context; irreversible, typed-confirmation dialog)
   · **delete account** (same pattern, full cascade). Both honor the marketing "one tap wipe"
   promise (one dialog, no support ticket).

### 3.10 Global surfaces
- **Search (topbar):** searches opportunities, businesses, and leads by title/name; dropdown
  of grouped results; Enter → first result. Client-side over the user's own rows in v1.
- **Notifications (bell):** dropdown list of events (run finished, approval needed, lead won,
  limit reached). Magenta dot = unread > 0. Item click routes to the relevant surface and
  marks read. Approval-needed items are pinned to the top.
- **Toasts:** top-right stack, auto-dismiss **4.4s**, manual close, max 3 visible (older
  collapse). Variants: success / info / warn / danger. Every async mutation fires exactly one
  toast on settle (success or failure).

---

## 4. Business rules (canonical values)

### 4.1 Match score (0–100)
Composite computed at discovery time:
- 40% **context fit** — similarity between opportunity and the user's interests/goals/history.
- 30% **demand evidence** — strength/recency of market signals.
- 20% **feasibility** — inverse of difficulty (time-to-first-dollar).
- 10% **economics** — modeled margin and revenue ceiling.
Display: ≥85 ring = success green · 70–84 = brand amber · 50–69 = sky · <50 = muted (and the
agent only surfaces <50 when the user rescans a sparse niche; nightly runs suppress them).
"Why you" must cite at least one concrete user-context fact — no generic flattery.

### 4.2 Status → progress mapping (ProgressBar everywhere)
`researching 25% · building 40% · testing 60% · active 100%` (from canonical logic).

### 4.3 Lead intent score (0.00–1.00)
Signal-based: reply to outreach +0.35 · payment-link click +0.30 · booked call +0.35 ·
page revisit (≥3 in 48h) +0.15 · saved/bookmarked only +0.05; capped at 1.00, decays −0.05 per
7 days of silence. Thresholds: **hot ≥ 0.80**, warm 0.50–0.79, cold < 0.50. Only hot + warm
count against the plan's monthly "qualified leads" quota.

### 4.4 Agent cadence
- **Nightly run** per active user in their configured window; produces: new opportunities
  (suppressing near-duplicates of anything seen in the last 30 days), lead updates, asset
  drafts, and the morning summary line.
- **One new business hypothesis per week maximum** enters the feed as a "featured" opportunity
  (marketing: "one business per Friday") — pinned top of feed for 7 days.
- **Kill rule:** 0 paid-intent (hot) leads for 14 consecutive days on a `testing`/`active`
  business → archive recommendation (§3.4). Repeats every 7 days until acted on.
- **Outreach:** always from the user's connected inbox, opt-in, rate-limited to 25 sends/day
  per business, and gated by the approval mode (§3.9.3). The agent NEVER sends without a
  standing or per-batch approval. Bounced/unsubscribed addresses are suppressed permanently.

### 4.5 Quotas & counters
Monthly quotas reset on the billing anniversary. Counters shown in Settings §3.9.4. When the
lead quota is exhausted, discovery keeps running but new leads queue invisibly and release on
reset/upgrade (nothing is lost; a warn toast + notification fires once at 100%).

---

## 5. Data contracts (mutations)

All server actions; optimistic UI where noted; every failure → toast (danger) + state rollback.

| Action | Input | Effect | Optimistic? |
|---|---|---|---|
| `saveOpportunity` | `opportunityId` | portfolio row (status `researching`), opp `saved=true` | Yes (button flips) |
| `unsaveOpportunity` | `opportunityId` | delete researching row; opp `saved=false` | Yes |
| `buildBusiness` | `opportunityId`, `reuseAudienceId?` | portfolio row `building`; opp `built`; enqueue build run (4 tasks) | Yes (card appears) |
| `approveMove` | `businessId` | approved run for `next_action`; clears suggestion | Yes (callout → "In progress…") |
| `archiveBusiness` | `businessId` | status `archived`; cancel runs | No (confirm dialog first) |
| `rescan` | — | discovery run enqueued (rate-limited 1/10min) | n/a |
| `sendChat` | `text` | message row; agent turn streamed | Yes (message appends) |
| `approveOutreachBatch` | `batchId` | marks approved; send tasks enqueue | No (explicit confirm) |
| `publishAsset` | `assetId` | status `live` | No (confirm dialog) |
| `updateInterests` | `chips[]` | profile update; next run uses them | Yes |
| `pauseAgent` / `resumeAgent` | — | halts/starts run scheduling | Yes (switch) |
| `wipeBusiness` | `businessId`, typed name | cascade delete | No (typed confirm) |

Realtime channels: `agent_runs`, `agent_tasks`, `leads`, `assets` (per-user, RLS-scoped).

---

## 6. Agent behavior: mock (Phases 1–5) vs real (Phase 6)

### 6.1 Mock (exact, from canonical logic — implement these numbers)
- Activity feed: on Dashboard, a new activity row every **5.2s** from a fixture pool, prepended,
  list capped at 6, timestamped now. Only ticks while Dashboard is visible.
- Workbench tasks: running tasks advance **+2–8% every 1.5s** until 100 → Done. Only while
  AI Workspace is visible.
- Chat: user send → thinking bubble ("Thinking through the best next move…") → replaced by a
  canned contextual reply after **1.3s**.
- Rescan: toast only; after 6s, 2 new fixture opportunities appear at the top of the feed.
- Build run: the 4 modal tasks appear in workbench queued, start sequentially (mock timers),
  complete over ~60s, then business auto-advances `building → testing` and 3 fixture assets
  appear.
- Toasts: 4.4s auto-dismiss.
- The mock lives behind the `DataSource` seam (`NEXT_PUBLIC_DATA=mock`) — screens must not know.

### 6.2 Real (Phase 6)
- Runs are LLM-planned task graphs executed by a queue (Supabase Edge Function worker):
  discovery, build, outreach, and nightly-summary run kinds.
- Tools: web search/research, lead sourcing + email verification, copy/asset generation,
  Stripe payment-link creation. Every tool call writes an `agent_tasks` row (that IS the
  activity feed — no separate logging).
- Chat = streamed LLM with tool use; approval messages (§3.5) are tool-call pauses.
- Guardrails: outreach gate (§4.4) enforced server-side (the send tool refuses without an
  approval record); per-user run budget caps; all agent writes RLS-scoped to the user.

---

## 7. Non-functional requirements
- **Perf:** LCP < 2.5s on dashboard (Server Components, no client fetch waterfalls);
  route transitions feel instant (prefetch on sidebar hover).
- **A11y:** WCAG AA; modal focus trap + Esc; toasts announced via `aria-live="polite"`;
  full keyboard nav; `prefers-reduced-motion` disables tickers/spinners' decorative motion.
- **Responsive:** 1280 (full) / 1080 (sidebar collapses per design system) / 720 (single
  column; workbench stacks under chat). No horizontal scroll ever.
- **Security:** RLS on every table; service-role key server-only; asset exports are
  signed-URL, time-limited; typed-confirmation on destructive actions.
- **Reliability:** failed runs surface in notifications with a Retry; the app never shows
  stale "running" longer than 10 min without a heartbeat (auto-mark failed).

---

## 8. Out of scope for v1 (explicit)
Team workspaces/roles (Studio) · multiple chat threads · mobile apps · custom integrations
beyond Gmail/Calendar · A/B testing UI (the agent may run tests; results appear as notes/
suggestions) · public marketplace of playbooks · white-labeling.

---

## 9. Decisions Register (audit in one pass)

| # | Decision | Basis |
|---|---|---|
| 1 | Trial = 14 days at Operator level | Marketing "Start free 14-day"; trial should demo the paid core |
| 2 | Active-business + saved + lead quotas per tier (§2.2 table) | Marketing pricing card bullets, rounded to enforceable counts |
| 3 | Buyer-lead = reply/pay-click/booked-call; signups excluded | Marketing FAQ, verbatim |
| 4 | Outreach: user's inbox, opt-in, 25/day/business, approval-gated | Marketing FAQ ("opt-in, rate-limited, own inbox, manual approval") |
| 5 | Kill rule: 14 days zero paid intent → recommend archive (never auto) | Marketing brief example ("kill Founder Yoga — 0 paid intent in 14 days") |
| 6 | Weekly featured hypothesis, pinned 7 days | Marketing "one business per Friday" |
| 7 | Status transitions: build=manual, testing=auto on assets+approval, active=auto on first sale | Inferred from mockup flow; keeps user in control at spend/publish points only |
| 8 | Progress mapping 25/40/60/100 | Canonical mockup code, verbatim |
| 9 | Match-score weights 40/30/20/10 and color bands | Chosen to make "why you" primary; bands match mockup colors (92 green, 78 amber, 71 sky) |
| 10 | Intent-score signal weights + hot ≥0.80 | Modeled on the marketing lead definition; only hot/warm consume quota |
| 11 | Mock timings 5.2s / 1.5s / +2–8% / 1.3s / 4.4s / cap 6 | Canonical mockup code, verbatim |
| 12 | Builder / Research / Settings scoped as §3.7–3.9 | v2 shell view enum (builder, research, settings); contents decided from product logic + ownership/privacy promises |
| 13 | Quota exhaustion queues leads invisibly, never drops | "Nothing lost" beats hard cutoff; single warn at 100% |
| 14 | One chat thread, no onboarding wizard, search client-side | v1 scope control; all three are additive later |
| 15 | Approval modes: per-message default, per-batch opt-in | Marketing "you can require manual approval for every message" |

— End of spec —

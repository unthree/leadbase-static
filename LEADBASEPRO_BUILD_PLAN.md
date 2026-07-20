# LeadbasePro — Build Plan

> **Purpose of this document.** A complete, execution-ready plan for building the LeadbasePro
> web app. Every phase is broken into small, independently-shippable tasks with explicit
> acceptance criteria, so the executor can pick up one task at a time without re-deriving context.
>
> **Document hierarchy.** `LEADBASEPRO_SPEC.md` defines WHAT to build (authoritative on all
> behavior — read the referenced § before each task); this plan defines the ORDER;
> `design-system/examples.html` defines what screens LOOK like; `AGENTS.md` defines HOW the
> executor works. On behavior conflicts the SPEC wins; on visuals `examples.html` wins.
>
> **Division of labor.** Planning/architecture authored with Claude (this doc). Execution by
> the assigned executor. Keep this file at the repo root as the single source of truth; update
> it as scope changes.

---

## 0. How to use this plan

1. Keep this file, `LEADBASEPRO_SPEC.md`, and `AGENTS.md` (Section 11) at the repo root.
2. Work **one task at a time**, in phase order. Each task has an ID like `P2-T3`.
3. For each task: re-read the SPEC sections it references, implement, stop when the acceptance
   criteria pass.
4. Track status in Linear (Section 10 — CSV is import-ready) and in `PROGRESS.md`.
5. Never touch `design-system/tokens.css` or `design-system/components.css` to fix a single
   screen — those are frozen (Section 5).

### Decision record (override any of these in one line before starting)

| Decision | Chosen | Override by saying |
|---|---|---|
| Frontend | **Next.js 14 + React (App Router), TypeScript** | "use vanilla" / "use Vite SPA" |
| Styling | **The existing `lb-*` design system as global CSS** (no Tailwind) | "use Tailwind" |
| Backend | **Supabase** (Postgres + Auth + Realtime + Storage) | "use Firebase" / "Node+Postgres" / "mock-only" |
| AI agent | **Simulated for MVP (Phases 1–5); real agent in Phase 6** | "real agent now" |
| Payments | **Stripe** (Checkout + Billing), wired in Phase 5 | "no payments yet" |
| Hosting | **Vercel** (frontend) + Supabase cloud | "self-host" |

---

## 1. Product overview

**LeadbasePro** is an AI-operator app: it turns a user's interests, goals, research, and daily
activity into **micro-businesses** and surfaces **buyer-leads** for them. The user approves
high-level moves; the agent executes the small ones.

### Core surfaces (already designed — see `design-system/examples.html`)

| # | Surface | Spec § | What it does |
|---|---|---|---|
| 1 | **Login** | 3.1 | Google OAuth + email/password. Dark scenic hero. |
| 2 | **Dashboard home** | 3.2 | Morning briefing: KPI stat cards, new opportunities, micro-businesses building, live agent activity, suggested actions. |
| 3 | **Opportunity Feed** | 3.3 | Agent-surfaced buyer-lead opportunities with match score, "why you", buyer type, market signal, difficulty, revenue path. Build / Save actions. |
| 4 | **Portfolio** | 3.4 | The user's micro-businesses by status (researching → building → testing → active), revenue + leads, agent suggestions. |
| 5 | **Agent Workspace** | 3.5 | Dark, chat-driven. Conversation with the agent + a live workbench (tasks running, sources researched, assets generated). |
| 6 | **Build modal** | 3.6 | Confirm "build this micro-business" → agent spins up landing page, lead magnet, outreach. |
| 7 | **Builder** | 3.7 | Deep-dive workspace for one micro-business: pipeline stepper, assets (edit/publish/export), leads table, batch approvals. |
| 8 | **Research** | 3.8 | Read-only evidence library: market signals + researched sources; restore archived opportunities. |
| 9 | **Settings** | 3.9 | Profile, interests/context, agent controls (pause, approval mode), plan & billing, data & privacy (export, wipe). |
| 10 | **Global surfaces** | 3.10 | Topbar search, notifications dropdown, toast stack. |

Surfaces 1–6 + toasts have a pixel reference in `design-system/examples.html`. **If a built screen
matches that file, it is visually correct.** Builder/Research/Settings (7–9) have no scene in
`examples.html`; compose them strictly from existing lb-* components per SPEC §3.7–3.9 —
introduce no new visual language.

---

## 2. Architecture

```
┌───────────────────────────────────────────────────────────────┐
│  Next.js (App Router) on Vercel                                │
│                                                                │
│  app/(auth)/login          ← Supabase Auth (Google + email)    │
│  app/(app)/dashboard       ← server components + client islands│
│  app/(app)/feed                                                │
│  app/(app)/portfolio                                           │
│  app/(app)/agent           ← chat + realtime workbench         │
│  app/api/agent/*           ← agent endpoints (mock → real)     │
│  app/api/stripe/*          ← checkout + webhook                │
│                                                                │
│  components/  ← thin React wrappers over lb-* classes          │
│  design-system/ tokens.css + components.css (FROZEN)           │
└───────────────┬───────────────────────────────────────────────┘
                │ @supabase/supabase-js  (+ realtime channels)
┌───────────────▼───────────────────────────────────────────────┐
│  Supabase                                                      │
│  Postgres (RLS on every table) · Auth · Realtime · Storage     │
│  Edge Functions (Phase 6: agent loop) · pg_cron (scheduling)   │
└────────────────────────────────────────────────────────────────┘
```

**Rendering rule.** Default to React **Server Components** for data-fetching pages; promote to
**Client Components** only where there's interactivity (tabs, modal, chat input, realtime feed,
toasts).

---

## 3. Repository structure (target)

```
leadbase-pro/
├─ AGENTS.md                      # executor working agreement (Section 11)
├─ LEADBASEPRO_BUILD_PLAN.md      # this file
├─ LEADBASEPRO_SPEC.md            # functional spec
├─ PROGRESS.md                    # verification ledger
├─ README.md
├─ .env.local.example
├─ next.config.mjs
├─ tsconfig.json
├─ package.json
├─ middleware.ts                  # auth gate for (app) routes
├─ app/
│  ├─ layout.tsx                  # imports the two design-system CSS files + fonts
│  ├─ globals.css                 # @import design-system/*; minimal app glue only
│  ├─ (auth)/login/page.tsx
│  ├─ (app)/
│  │  ├─ layout.tsx               # lb-shell: <SidebarNav/> + <Topbar/> + {children}
│  │  ├─ dashboard/page.tsx
│  │  ├─ feed/page.tsx
│  │  ├─ portfolio/page.tsx
│  │  ├─ builder/[businessId]/page.tsx
│  │  ├─ research/page.tsx
│  │  ├─ settings/page.tsx
│  │  └─ agent/page.tsx
│  └─ api/
│     ├─ agent/run/route.ts
│     ├─ agent/chat/route.ts
│     └─ stripe/{checkout,webhook}/route.ts
├─ components/                    # see Section 6 — one per lb-* component
├─ design-system/                 # tokens.css, components.css, examples.html (FROZEN)
├─ lib/
│  ├─ supabase/{client,server,middleware}.ts
│  ├─ types.ts                    # generated DB types
│  ├─ data/                       # DataSource seam (mock | supabase)
│  └─ fixtures/                   # mock data for Phases 1–4
├─ supabase/
│  ├─ migrations/                 # SQL (Section 8)
│  └─ seed.sql
└─ tests/                         # Playwright e2e + component tests
```

---

## 4. Environment & setup (Phase 0)

`.env.local.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server only, never shipped to client
STRIPE_SECRET_KEY=                  # Phase 5
STRIPE_WEBHOOK_SECRET=              # Phase 5
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DATA=mock               # mock | supabase
# Phase 6 (real agent):
OPENAI_API_KEY=
```
> Never hardcode secrets, never print them, never commit `.env.local`.

---

## 5. Design system integration (FROZEN contract)

The `design-system/` folder is **done and frozen**. Rules:

1. `tokens.css` and `components.css` are imported once in `app/layout.tsx`. Load order:
   fonts → `tokens.css` → `components.css` → `globals.css`.
2. **Never** add `!important`, never hardcode a hex/px that a token already covers, never edit the
   two CSS files to fix a single screen. If a genuinely new, reusable primitive is needed, add it
   below the "ADDITIONS" divider in `components.css` and a token in `tokens.css` — and note it in
   this plan.
3. React components are **thin wrappers** that emit `lb-*` markup. No CSS-in-JS, no Tailwind.
4. The rendered `design-system/examples.html` is the visual acceptance reference for every screen.

`app/layout.tsx` head (exact):
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<!-- then tokens.css, components.css, globals.css -->
```
`<body className="lb-app">` with `<div className="lb-grain" />` as first child.

---

## 6. Component library (React wrappers over lb-*)

Build these in Phase 1. Each is a small, typed, presentational component. Source of truth for markup
is `design-system/examples.html` (find the matching section). Props listed are the minimum.

| Component | Wraps lb-* | Key props |
|---|---|---|
| `Button` | `lb-btn` + variants | `variant: primary\|secondary\|ghost\|quiet\|danger\|success\|gradient`, `size`, `iconLeft`, `iconRight` |
| `Card` | `lb-card` | `padded?`, `accent?`, `stripe?: 'swarm'\|'flow'\|'pulse'` |
| `Badge` | `lb-badge` | `variant: neutral\|brand\|success\|warning\|danger\|info\|gradient` |
| `StatusPill` | `lb-status` + `lb-pulse` | `status: ok\|pending\|bad\|info\|mute`, `label` |
| `StatCard` | `lb-stat-card` | `label`, `value`, `delta`, `trend: up\|down`, `sub`, `icon` |
| `ScoreBadge` | `lb-score` | `score: number`, `size: sm\|md\|lg`, `label?` |
| `IconChip` | `lb-icon-chip` | `tone`, `size`, `icon` |
| `Tag` | `lb-tag` | `kind: think\|plan\|build\|find\|win\|kill` |
| `SidebarNav` | `lb-sidebar` | `items`, `activeId`, `footer` |
| `Topbar` | `lb-topbar` | `title`, `onAgent`, `user` |
| `SearchBar` | `lb-search` | `placeholder`, `onChange` |
| `Tabs` | `lb-tabs` (+`--pill`) | `items`, `active`, `onChange`, `variant?` |
| `Avatar` | `lb-avatar` | `name`, `size`, `status?` |
| `Meter` | `lb-meter` | `value`, `tone`, `thin?` |
| `Modal` | `lb-modal-scrim`+`lb-modal` | `open`, `onClose`, `title`, `subtitle`, `icon`, `footer` |
| `Toast` / `ToastStack` | `lb-toast` | `variant`, `title`, `message`, `onClose` |
| `ChatMessage` | `lb-msg` | `author: user\|agent`, `thinking?` |
| `Composer` | `lb-composer` | `placeholder`, `onSend` |
| `ActivityRow` | `lb-activity` | `tone`, `icon`, `text`, `time` |
| `ActionRow` | `lb-action-row` | `icon`, `title`, `meta`, `onClick` |
| `Callout` | `lb-callout` | `icon`, `children` |
| `MetaItem` | `lb-meta` | `icon`, `label`, `value` |
| `OpportunityCard` | composite | `opportunity`, `onBuild`, `onSave`, `saved` |
| `PortfolioCard` | composite | `business`, `onOpen`, `onApprove` |

Icons: **Lucide** (already used in `examples.html`). Use `lucide-react` in the Next app.

---

## 7. Phased roadmap

> Sizing: each task ≈ a single focused session. **DoD** = Definition of Done / acceptance.
> Phases 1–4 run entirely on **mock data** (`lib/fixtures/`) so the UI ships before any backend.

### Phase 0 — Foundation
| ID | Task | DoD |
|---|---|---|
| P0-T1 | Scaffold Next.js 14 + TS + App Router; add `.env.local.example`, `.gitignore`, `README`. | `npm run dev` serves an empty styled page; `npm run build` passes. |
| P0-T2 | Copy `design-system/` in; wire fonts + 3 CSS files in `app/layout.tsx`; add `lb-app` body + `lb-grain`. | A throwaway page using `lb-btn--gradient` + `lb-card` renders identically to examples.html. |
| P0-T3 | Add `middleware.ts` stub + `(auth)` and `(app)` route groups (empty pages). | Visiting `/dashboard` renders placeholder; `/login` renders placeholder. |
| P0-T4 | ESLint + Prettier + TypeScript strict; CI script (`lint`, `typecheck`, `build`). | All three pass clean on empty scaffold. |

### Phase 1 — Component library
| ID | Task | DoD |
|---|---|---|
| P1-T1 | Build presentational components in Section 6, group A: `Button, Card, Badge, StatusPill, IconChip, Tag, Avatar, Meter`. | A `/_kitchen-sink` page shows each variant; matches examples.html. |
| P1-T2 | Group B: `StatCard, ScoreBadge, SearchBar, Tabs, Topbar, SidebarNav`. | Same page extended; `ScoreBadge` ring matches at 71/78/92. |
| P1-T3 | Group C: `Modal, Toast, ToastStack, ChatMessage, Composer, ActivityRow, ActionRow, Callout, MetaItem`. | Modal opens/closes; toast auto-dismisses. |
| P1-T4 | Composites: `OpportunityCard, PortfolioCard`. | Render from a fixture object; pixel-match feed/portfolio scenes. |

### Phase 2 — App shell & navigation
| ID | Task | DoD |
|---|---|---|
| P2-T1 | `(app)/layout.tsx` = `lb-shell` with `SidebarNav` + `Topbar`; active-route highlighting. | Nav between routes; active item styled; responsive collapse < 1080px. |
| P2-T2 | Wire fixtures in `lib/fixtures/` (opportunities, portfolio, agent feed, stats, suggestions) typed in `lib/types.ts`. | Types compile; fixtures mirror the canonical `.dc.html` data. |
| P2-T3 | Global `ToastProvider` (context) + `useToast()`. | Any client component can fire a toast; stack renders top-right; 4.4s auto-dismiss per SPEC §3.10. |

### Phase 3 — Core screens (mock data)
| ID | Task | DoD |
|---|---|---|
| P3-T1 | **Dashboard home**: greeting, 4 StatCards, "new opportunities", "micro-businesses building", agent activity, suggested actions. | Matches scene 02; "View all" → `/feed`. |
| P3-T2 | **Opportunity Feed**: header, filter Tabs, sorted grid of `OpportunityCard`; Save toggles + toast; Build opens modal. | Matches scene 03; tab filter works on fixtures. |
| P3-T3 | **Build modal** flow: confirm → toast "agent is building" → optimistic add to portfolio → route to `/portfolio`. | Matches scene 06; new card appears in "Building". |
| P3-T4 | **Portfolio**: pill Tabs by status, 3-col `PortfolioCard` grid, agent-suggests callout, Open/Approve actions. | Matches scene 04; status filter works. |
| P3-T5 | **Agent Workspace (mock)**: dark layout, seeded conversation, Composer echo + canned reply, workbench (tasks w/ animating meters, counters, assets). Mock timings per SPEC §6.1. | Matches scene 05; task meters tick; chat append works. |
| P3-T6 | **Builder (mock)** `/builder/[businessId]`: pipeline stepper + stat row, assets list (Draft/Ready/Live, edit/publish/export stubs), leads table with intent scores, pending-batch approval CTA. Per SPEC §3.7. | Routes from Portfolio "Open" + dashboard building-cards; all 4 UI states; composed of existing lb-* only. |
| P3-T7 | **Research (mock)** `/research`: Signals + Sources tabs, filter/search, restore-archived-opportunity action. Per SPEC §3.8. | Both tabs render fixtures; restore returns an opp to feed as new. |
| P3-T8 | **Settings (mock)** `/settings`: profile, interests chips (add/remove), agent controls (pause switch, approval mode, run window), plan & usage meters, data & privacy (export, wipe w/ typed confirm). Per SPEC §3.9. | All sections render; pause flips workspace header state; wipe dialog requires typed name. |
| P3-T9 | **Global search + notifications (mock)**: topbar search dropdown (opportunities/businesses/leads, grouped), bell dropdown (unread dot, approval items pinned, click-through routes). Per SPEC §3.10. | Search filters fixtures live; notification click routes + marks read. |

### Phase 4 — Auth
| ID | Task | DoD |
|---|---|---|
| P4-T1 | Supabase project + `lib/supabase/{client,server,middleware}.ts`; env wiring. | `supabase` client instantiates server + client side. |
| P4-T2 | **Login page** (scene 01): Google OAuth + email/password via Supabase Auth. | Real Google login returns to `/dashboard`; session persists. |
| P4-T3 | `middleware.ts` protects `(app)`; unauthenticated → `/login`; signed-in `/login` → `/dashboard`. | Direct hit to `/portfolio` while logged out redirects. |
| P4-T4 | Sidebar footer + topbar avatar show the real user (name, avatar, plan). | Profile data from `auth.user` + `profiles` row. |

### Phase 5 — Data + persistence + billing
| ID | Task | DoD |
|---|---|---|
| P5-T1 | Apply DB migrations (Section 8) + RLS; generate `lib/types.ts` from schema. | Tables exist; RLS denies cross-user reads (tested). |
| P5-T2 | Replace fixtures with Supabase queries on each screen (server components). | Dashboard/feed/portfolio read live rows; empty states use `lb-empty`. |
| P5-T3 | Mutations: save opportunity, build (insert portfolio row), approve move; optimistic UI + revalidate. | Refresh persists; RLS-scoped to user. |
| P5-T4 | Realtime: subscribe to `agent_runs`/`agent_tasks`; live activity feed + workbench update without reload. | Inserting a row (SQL) appears in UI within ~1s. |
| P5-T5 | Stripe Checkout (Solo/Operator/Studio) + webhook → `profiles.plan`; gate features by plan + entitlement limits per SPEC §2.2 (limit hit → warn toast + upgrade CTA, never destructive). | Test-mode checkout upgrades plan; webhook verified; Solo build-limit guard works. |
| P5-T6 | Builder/Research/Settings on live data: assets CRUD + publish confirm, leads table realtime, signals/sources from agent runs, interests persist, agent pause/approval-mode persist. | All three views read/write Supabase; publish requires confirm; pause halts run scheduling. |
| P5-T7 | Data & privacy actions per SPEC §3.9.5: export-all (JSON + assets zip, signed URL), wipe business (typed confirm, cascade), delete account (cascade). | Export downloads; wipe removes rows/leads/assets/context; both RLS-scoped and irreversible-guarded. |

### Phase 6 — Real AI agent (replaces the mock)
> Largest, riskiest phase. Keep behind a feature flag; the mock stays as fallback.

| ID | Task | DoD |
|---|---|---|
| P6-T1 | Agent run model + queue (Supabase Edge Function or a worker): `agent_runs` state machine (queued→running→done/failed). | A run row transitions states and writes `agent_tasks`. |
| P6-T2 | Tooling layer: web research/search, lead sourcing, asset drafting (landing copy, checklist, outreach). Each tool logged to `agent_tasks`. | One tool executes end-to-end and persists an `assets` row. |
| P6-T3 | Opportunity discovery loop: from `profiles.interests` → ranked `opportunities` with match score + "why you". | A scheduled run produces real opportunity rows. |
| P6-T4 | Agent chat = real LLM with tool-use, streamed into `ChatMessage`; "thinking" state wired to stream. | Chat triggers a real run; workbench reflects it live. |
| P6-T5 | `pg_cron` nightly run per active user ("ran 4 loops overnight"); morning-brief summary on dashboard. | Overnight job populates next-day dashboard. |

### Phase 7 — Hardening & launch
| ID | Task | DoD |
|---|---|---|
| P7-T1 | Playwright e2e: login → feed → build → portfolio → builder → agent; cross-user RLS test. | Green in CI. |
| P7-T2 | a11y pass (focus traps in modal, keyboard nav, contrast), `prefers-reduced-motion`. | axe clean on each route. |
| P7-T3 | Loading skeletons (`lb-skeleton`), error boundaries, empty states everywhere. | No raw spinners; every async surface has a skeleton. |
| P7-T4 | Perf: server components by default, image opt, bundle audit; Lighthouse ≥ 90. | Report attached to the PR. |
| P7-T5 | Deploy to Vercel; Supabase prod; smoke test; rollback notes. | Live URL behind auth. |

---

## 8. Data model (Supabase / Postgres)

All tables have `id uuid pk default gen_random_uuid()`, `created_at timestamptz default now()`,
`user_id uuid references auth.users` and **RLS** `using (user_id = auth.uid())`.

```sql
-- profiles: 1:1 with auth.users
profiles(user_id pk, full_name, avatar_url, plan text default 'solo',
         interests jsonb default '[]', goals jsonb default '[]')

-- opportunities: agent-surfaced
opportunities(id, user_id, title, match int, why text, buyer text, signal text,
              difficulty text check (difficulty in ('Low','Medium','High')),
              revenue text, tags text[], status text default 'new', saved bool default false)

-- portfolio: micro-businesses
portfolio(id, user_id, name, status text check (status in
            ('researching','building','testing','active')),
          revenue text, leads int default 0, note text, next_action text,
          gradient text default 'swarm', opportunity_id uuid references opportunities)

-- leads: buyer-leads per business
leads(id, user_id, portfolio_id references portfolio, name, snippet, value_cents int,
      intent numeric, status text default 'new')

-- agent_runs: one agent execution
agent_runs(id, user_id, kind text, state text default 'queued', summary text,
           started_at, finished_at)

-- agent_tasks: sub-steps of a run (drives workbench + activity feed)
agent_tasks(id, user_id, run_id references agent_runs, label, kind text,
            state text default 'queued', pct int default 0)

-- assets: generated artifacts
assets(id, user_id, portfolio_id references portfolio, kind text, title,
       url text, state text default 'draft')
```
Realtime: enable on `agent_runs`, `agent_tasks`, `leads`.

---

## 9. Mock → real seam (so Phases 1–4 aren't throwaway)

Define a `DataSource` interface in `lib/data/index.ts` with two implementations:
`mockDataSource` (reads `lib/fixtures/`) and `supabaseDataSource` (Phase 5). Screens call the
interface, never the source directly. A single env flag (`NEXT_PUBLIC_DATA=mock|supabase`) swaps
them. This means **all Phase 3 screen work survives** the backend cutover untouched.

---

## 10. Linear setup

- **Project:** "LeadbasePro v1"
- **Milestones:** one per Phase (0–7).
- **Labels:** `phase-0`…`phase-7`, `design-system`, `frontend`, `backend`, `agent`, `billing`.
- **Cycle plan:** Phases 0–1 in cycle 1; 2–3 in cycle 2; 4–5 in cycle 3; 6 in cycle 4; 7 in cycle 5.

A ready-to-import file is saved next to this plan: **`leadbasepro-linear-import.csv`**
(columns: `Title, Description, Labels, Priority, Estimate`). Import via Linear → team →
Issues → ⋯ → Import → CSV. One issue per task ID.

---

## 11. AGENTS.md (kept at repo root as its own file)

```markdown
# LeadbasePro — executor working agreement

## Stack
Next.js 14 (App Router) · React · TypeScript (strict) · Supabase · the lb-* design system.
No Tailwind, no CSS-in-JS, no component libraries (MUI/Chakra/shadcn).

## Design system (FROZEN)
- Import order in app/layout.tsx: fonts → design-system/tokens.css → components.css → globals.css.
- NEVER edit tokens.css/components.css to fix a single screen. NEVER add !important.
- Every color/space/radius/font comes from a --lb-* token. No raw hex/px if a token exists.
- React components only emit lb-* class markup. Match design-system/examples.html exactly.
- Icons: lucide-react.

## Working rules
- One task (e.g. P3-T2) per change set. Read its DoD before coding; stop when it passes.
- Server Components by default; 'use client' only for interactivity.
- Screens read data through lib/data (DataSource interface), never a backend client directly.
- Never hardcode/print secrets. Never commit .env.local.
- Add a Playwright test for any new user-facing flow.
- Before finishing: `npm run lint && npm run typecheck && npm run build` must pass.

## Definition of done
Matches the corresponding scene in design-system/examples.html, DoD criteria met,
checks green, no console errors, responsive at 1280 / 1080 / 720 widths.
```

---

## 12. Testing & QA

- **Component:** render each Section-6 component against its `examples.html` counterpart.
- **E2E (Playwright):** the golden path (P7-T1) + auth redirects + RLS isolation (two users can't see
  each other's rows).
- **Visual:** keep `examples.html` as the human reference; spot-check each screen at 1280/1080/720.
- **Gates:** `lint`, `typecheck`, `build`, `test` required before merge.

---

## 13. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Real agent (Phase 6) balloons in scope/cost | Mock-first; ship Phases 1–5 as a usable product without it; flag-gate the real agent. |
| Executor drifts from the design system | `AGENTS.md` + frozen CSS + `examples.html` as pixel reference; reject any diff touching the two CSS files. |
| Backend rework invalidates UI work | `DataSource` seam (Section 9) — screens never change at cutover. |
| Auth/RLS leaks data across users | RLS on every table + an explicit cross-user Playwright test (P7-T1). |
| Secrets leakage | AGENTS.md rule + `.env.local` gitignored + service-role key server-only. |
| Scope creep on screens | `examples.html` is the contract; anything not in it is a new, separately-tracked task. |

---

## 14. Immediate next 5 tasks (start here)

1. **P0-T1** scaffold Next.js + TS.
2. **P0-T2** wire the frozen design system + fonts.
3. **P1-T1** build component group A.
4. **P1-T2** build component group B (incl. `ScoreBadge`).
5. **P3-T1** dashboard home on fixtures.

> Ship these five and you have a styled, navigable dashboard shell running on mock data — the
> fastest path to something you can click through and feel.

# LeadbasePro — Build Progress Ledger

> Canonical task tracker maintained by Claude (the reviewer). Mirrors the Linear project.
> Legend: `[ ]` not started · `[~]` Codex reports done, awaiting verification · `[x]` verified ✅ (safe to move to Done in Linear) · `[!]` failed verification, fix issued.

## Phase 0 — Foundation
- [x] P0-T1 Scaffold Next.js 14 + TS (App Router)
- [x] P0-T2 Wire frozen design system + fonts
- [x] P0-T3 Route groups + middleware stub
- [x] P0-T4 ESLint + Prettier + strict TS + CI

## Phase 1 — Component library
- [x] P1-T1 Component group A
- [x] P1-T2 Component group B
- [x] P1-T3 Component group C
- [x] P1-T4 Composite cards

## Phase 2 — App shell & navigation
- [x] P2-T1 App shell + navigation
- [x] P2-T2 Fixtures + types
- [x] P2-T3 Toast provider

## Phase 3 — Core screens (mock data)
- [x] P3-T1 Dashboard home (mock)
- [x] P3-T2 Opportunity Feed (mock)
- [x] P3-T3 Build modal flow
- [x] P3-T4 Portfolio (mock)
- [x] P3-T5 Agent Workspace (mock)
- [x] P3-T6 Builder screen (mock)
- [x] P3-T7 Research screen (mock)
- [x] P3-T8 Settings screen (mock)
- [x] P3-T9 Global search + notifications (mock)

## Phase 4 — Auth
- [ ] P4-T1 Supabase clients + env
- [ ] P4-T2 Login page + auth
- [ ] P4-T3 Auth middleware/route protection
- [ ] P4-T4 Real user in sidebar/topbar

## Phase 5 — Data + persistence + billing
- [ ] P5-T1 DB migrations + RLS + types
- [ ] P5-T2 Screens read live data
- [ ] P5-T3 Mutations + optimistic UI
- [ ] P5-T4 Realtime activity feed
- [ ] P5-T5 Stripe checkout + plan gating
- [ ] P5-T6 Builder/Research/Settings live data
- [ ] P5-T7 Data & privacy actions

## Phase 6 — Real AI agent
- [ ] P6-T1 Agent run model + queue
- [ ] P6-T2 Agent tooling layer
- [ ] P6-T3 Opportunity discovery loop
- [ ] P6-T4 Real agent chat (LLM + tools + stream)
- [ ] P6-T5 Nightly runs + morning brief

## Phase 7 — Hardening & launch
- [ ] P7-T1 Playwright golden-path e2e
- [ ] P7-T2 Accessibility pass
- [ ] P7-T3 Skeletons + error/empty states
- [ ] P7-T4 Performance + Lighthouse >= 90
- [ ] P7-T5 Deploy to Vercel + Supabase prod

## Verification log
| Date | Task | Verdict | Notes |
|---|---|---|---|
| 2026-07-20 | P0–P3 (20 tasks) | ✅ verified | lint+typecheck+build green (11 routes); Playwright golden-path + login e2e pass; 8 screens screenshotted, zero page errors |
| 2026-07-20 | code-review fixes | ✅ | tickTasks completes at 100% (SPEC 6.1); useTaskTicker respects agent pause; e2e green post-fix |

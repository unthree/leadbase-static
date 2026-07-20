# LeadbasePro

AI-operator workspace: turns your interests, goals, and activity into micro-businesses
with buyer-leads. Built per `LEADBASEPRO_SPEC.md` (behavior) and
`LEADBASEPRO_BUILD_PLAN.md` (order), on the frozen `design-system/` visual contract.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000 — mock data mode
```

Phases 0–3 run entirely on mock data (`NEXT_PUBLIC_DATA=mock`, the default — no accounts
needed). Phases 4+ require Supabase/Stripe env vars; see `.env.local.example`.

## Checks

```bash
npm run ci         # lint + typecheck + build
```

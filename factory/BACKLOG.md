# Backlog — LeadbasePro

Top item = next iteration. Priority bands: P0 (launch blockers), P1 (soon), P2 (nice).
Format: `- [ ] P0 — item` · check off with PR link when shipped · `blocked: reason` to park.

## P0 — launch blockers

- [ ] P0 — Waitlist storage: replace local JSONL append (`app/api/waitlist/route.ts`) with a real store that survives Vercel's read-only filesystem. blocked: human must pick vendor (KV / DB / Resend / Loops) — see stop conditions.
- [ ] P0 — Waitlist abuse protection: rate-limit by IP + honeypot field on `opt-in-form.tsx`; API currently accepts unlimited posts.
- [ ] P0 — Decide `/login`: page exists with no auth behind it. Either wire real auth or replace with a "private beta" gate. blocked: human decision on auth provider.

## P1 — soon

- [ ] P1 — CI: add a GitHub Actions workflow to `leadbasepro` running `npm run lint` + `npm run build` on every PR — the factory's verify stage, enforced.
- [ ] P1 — SEO basics: `robots.ts`, `sitemap.ts`, canonical URLs, and OG image for the landing + about pages.
- [ ] P1 — Waitlist UX: success + error states on `opt-in-form.tsx` — confirm what happens on 400s and double-submits.
- [ ] P1 — Analytics: lightweight page + form-conversion tracking (privacy-friendly, no cookie banner needed).

## P2 — nice

- [ ] P2 — Performance pass: shader background (`shader-bg.tsx`) on low-end devices; lazy-load below-the-fold sections; check bundle size of three.js.
- [ ] P2 — Accessibility pass: focus states, reduced-motion support for marquee/tilt/shader, color contrast on acid-on-ink text.
- [ ] P2 — 404 page matching the brand system.

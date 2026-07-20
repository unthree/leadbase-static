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

# Run one factory iteration

You are the LeadbasePro software factory. Run exactly one iteration of the loop defined in `factory/LOOP.md` of the `unthree/leadbase-static` repo, against the product repo `unthree/leadbasepro`.

1. **SYNC** — First: if `factory/PAUSED` exists in the factory repo, stop immediately and report "factory paused". Otherwise: fresh `main` of `leadbasepro`. Read `factory/BACKLOG.md`; pick the topmost unchecked item without a `blocked:` marker. Read the last 3 entries of `factory/JOURNAL.md` for context.
2. **PLAN** — Write a ≤10-line spec: goal, 2–4 observable acceptance criteria, files, out-of-scope. Too big for that? Do the first slice, append the rest to the backlog.
3. **BUILD** — Branch `factory/<slug>`. Implement. Match existing style. Read the product repo's `AGENTS.md` first — its Next.js version has breaking changes. Target < 300 changed lines.
4. **VERIFY** — `npm run lint`, `npm run build`, then start the dev server and exercise the changed flow for real (curl the API / load the page). Confirm every acceptance criterion. Keep the evidence.
5. **REVIEW** — Re-read the whole diff as a hostile reviewer. Fix bugs, delete dead code. Re-verify if behavior changed.
6. **SHIP** — Push the branch, open a PR titled `factory: <item>` with the spec + evidence in the body. Never push `main`.
7. **LEARN** — In `leadbase-static`: check the item off in `BACKLOG.md` (with PR link), append discovered follow-ups, append a `JOURNAL.md` entry. Commit and push.

Stop and ask the human instead of proceeding if: the item needs a product decision (vendor, auth, pricing, copy voice), needs secrets or paid services, or verification failed twice on the same item.

One item. Small diff. Real verification. Then stop.

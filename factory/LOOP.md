# The Factory Loop

Contract for one iteration. The agent runs stages in order and does not skip verification.

**Product repo:** `unthree/leadbasepro` (Next.js app — `npm run dev`, `npm run lint`, `npm run build`)
**Factory repo:** this one (`unthree/leadbase-static`) — backlog, journal, prompts.

## Stage 0 — SYNC

- **Pause check**: if `factory/PAUSED` exists in the factory repo, stop immediately and report "factory paused" — nothing else runs.
- Fresh checkout of `leadbasepro` `main`.
- Read `factory/BACKLOG.md` and the last 3 entries of `factory/JOURNAL.md`.
- Pick the **topmost unchecked item** that isn't marked `blocked:`. If it depends on an unmerged PR, take the next one.

## Stage 1 — PLAN

Write a spec of at most 10 lines:

- **Goal** — one sentence.
- **Acceptance criteria** — 2–4 observable checks ("submitting the form with a bad email shows an inline error").
- **Files** — best guess at what gets touched.
- **Out of scope** — what this iteration deliberately does not do.

If the backlog item is too big to satisfy this format, split it: do the first slice, append the rest as new backlog items.

## Stage 2 — BUILD

- Branch: `factory/<short-slug>` off `main`.
- Implement the spec. Match the codebase's existing style and conventions (see `AGENTS.md` in the product repo — the Next.js version there has breaking changes; read its bundled docs before using unfamiliar APIs).
- Keep the diff small — target under ~300 changed lines. Bigger means the plan was too big.

## Stage 3 — VERIFY

All of these, in order:

1. `npm run lint` — clean.
2. `npm run build` — succeeds.
3. **Exercise the change for real**: start `npm run dev` and hit the affected route/flow (curl for APIs, browser/screenshot for UI). Confirm each acceptance criterion.
4. Record the evidence (command output, response bodies, screenshot) for the PR body.

A change that passes lint/build but was never exercised is **not verified**. If verification fails, fix and re-verify. Two consecutive failed verify cycles → stop and escalate (see Stop conditions).

## Stage 4 — REVIEW

Re-read the full diff as a skeptical reviewer:

- Bugs, unhandled edge cases, broken imports.
- Dead code, needless abstraction, style drift.
- Anything the diff touches but the spec didn't intend.

Fix what you find, re-run Stage 3 if the fix is behavioral.

## Stage 5 — SHIP

- Commit(s) with clear messages; push the branch.
- Open a PR: title `factory: <backlog item>`, body = the Stage 1 spec + Stage 3 evidence.
- Do **not** merge to `main` yourself. Do not force-push over human commits.

## Stage 6 — LEARN

In the factory repo:

- `BACKLOG.md`: check the item off with the PR link. Append any follow-ups discovered during the iteration (as unchecked items, bottom of their priority band).
- `JOURNAL.md`: append one entry — date, item, PR link, result (shipped / blocked / split), and one lesson if there is one.
- Commit and push.

## Rules

- **One backlog item per iteration.** No drive-by fixes outside the spec; put them in the backlog instead.
- **Never push to `main`** in the product repo.
- **Small diffs win.** A shipped slice beats a stalled epic.
- **The journal is memory.** Future iterations only know what's written there.

## Stop conditions — escalate to the human instead of proceeding

- Acceptance criteria would require inventing product decisions (pricing, copy voice, auth provider, data storage vendor).
- The work needs secrets, paid services, or external accounts.
- Two consecutive verify failures on the same item.
- The backlog is empty (propose new items in the PR of the journal update, don't invent scope silently).

# LeadbasePro Software Factory

An automated build loop for [`unthree/leadbasepro`](https://github.com/unthree/leadbasepro) — the Leadbase marketing site and product. A coding agent (OpenAI Codex, Claude Code, or any agent that can read a repo and open PRs) runs the loop repeatedly; each iteration ships one small, verified improvement.

## The loop at a glance

```
SYNC → PLAN → BUILD → VERIFY → REVIEW → SHIP → LEARN → (repeat)
```

1. **Sync** — pull latest `main`, read `factory/BACKLOG.md`, pick the top unblocked item.
2. **Plan** — write a tiny spec: goal, acceptance criteria, files to touch.
3. **Build** — implement on a feature branch. Small diff, match existing style.
4. **Verify** — lint + build + actually exercise the change in the running app.
5. **Review** — self-review the diff for bugs and needless complexity; fix.
6. **Ship** — open a PR with the spec and verification evidence. Human merges.
7. **Learn** — check the item off, add discovered follow-ups to the backlog, log the iteration in `factory/JOURNAL.md`.

One item per iteration. The backlog is the queue, the journal is the memory, PRs are the output. The human's only jobs: merge PRs and occasionally reorder the backlog.

## Repo map

| File | Purpose |
|---|---|
| `factory/LOOP.md` | The full loop contract — stages, rules, stop conditions |
| `factory/BACKLOG.md` | Prioritized work queue for LeadbasePro |
| `factory/JOURNAL.md` | Append-only log of every iteration |
| `factory/prompts/run-loop.md` | The master prompt — paste into Codex or Claude to run one full iteration |
| `factory/CONTROL.md` | Remote-control protocol — how any GitHub-credentialed agent steers the factory |
| `factory/prompts/control-agent.md` | Standing instructions for a controller agent (ChatGPT/Hermes/phone) |
| `factory/PAUSED` | Kill switch — if this file exists, runs exit immediately (create to pause, delete to resume) |

## Running it

**OpenAI Codex / ChatGPT:** create a task on the `leadbasepro` repo whose instructions are the contents of `factory/prompts/run-loop.md`. Schedule it or fire it manually; each run = one iteration.

**Claude Code:** open a session with both repos and say "run one factory iteration" with `factory/prompts/run-loop.md` as the instruction, or wire it to a recurring Routine so iterations run on a schedule.

**Any agent:** the loop is plain markdown — no tooling lock-in. If the agent can clone, branch, run `npm run lint && npm run build`, and open a PR, it can run the factory.

## Remote control (ChatGPT / Hermes / phone)

The factory is steered entirely through GitHub, so any agent with a repo-scoped token is a
full controller — including chat-only agents that can't write code. Give the agent a
fine-grained PAT for the two repos and `factory/prompts/control-agent.md` as instructions,
and it can report status, queue and reorder work, unblock decisions, pause/resume the
factory, and merge `factory: *` PRs — from a desktop app or a text-message conversation.
Details and safety rails: `factory/CONTROL.md`.

# Remote control protocol

The factory's control surface is GitHub itself. Any agent that holds a GitHub token with
read/write access to `unthree/leadbase-static` and `unthree/leadbasepro` is a full
controller — ChatGPT/Hermes on desktop, an iMessage-driven phone agent, or a human with
the GitHub app. No other integration is needed.

All control state lives on branch `claude/software-factory-loop-mu4fwp` of
`unthree/leadbase-static` (the factory branch).

## Commands

| Command | How a controller executes it |
|---|---|
| **STATUS** | Read the tail of `factory/JOURNAL.md` + list open PRs on `leadbasepro`. |
| **RUN** | Execute one iteration yourself by following `factory/prompts/run-loop.md` (requires a coding-capable agent with repo access). |
| **QUEUE** | Append an unchecked item to the right priority band in `factory/BACKLOG.md`; commit and push. |
| **REORDER** | Move lines in `factory/BACKLOG.md` — top unchecked, unblocked item is always next. |
| **UNBLOCK** | Replace an item's `blocked: <reason>` with the decision (e.g. the chosen vendor); commit and push. |
| **PAUSE** | Create the file `factory/PAUSED` (any content) on the factory branch. Every run checks it first and exits immediately if present. |
| **RESUME** | Delete `factory/PAUSED`. |
| **APPROVE** | Merge a `factory: *` PR on `leadbasepro` (or comment on it — the next run reads PR feedback for its item before re-attempting). |

Anything not expressible above (change the schedule, change the loop itself) is a spec
change: edit `LOOP.md` / open an issue and a human or the maintaining Claude session
handles it.

## Controller setup (one-time, human does this)

1. Create a **fine-grained GitHub personal access token** at github.com/settings/personal-access-tokens:
   scoped to only `unthree/leadbase-static` + `unthree/leadbasepro`, with
   **Contents: read/write** and **Pull requests: read/write**.
2. Give that token to the controller agent (ChatGPT/Hermes config, or the phone agent's
   credential store). Never commit the token to either repo.
3. Give the agent `factory/prompts/control-agent.md` as its standing instructions.

## Safety rails (binding on every controller)

- Never push to `main` of `leadbasepro`. Product changes go through `factory: *` PRs only.
- Never edit `factory/JOURNAL.md` history — append only.
- A controller that cannot run code (chat-only) is limited to STATUS / QUEUE / REORDER /
  UNBLOCK / PAUSE / RESUME / APPROVE — it must not attempt RUN.
- When two controllers disagree (e.g. conflicting backlog edits), latest push wins;
  the journal records what actually ran.

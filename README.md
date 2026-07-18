# Personal OS — Mission Control

Your own custom software, in one place. A locally hosted Next.js app modeled on the
"Personal OS" mission-control pattern: every tool you'd otherwise pay for, rebuilt as
a page in your own workspace.

## Tools included

| Tool | What it does |
|---|---|
| **Newsletter Studio** | Collect sources (tweets, videos, notes) → AI generates ready-to-send drafts. Tabs: Overview, Drafts, Sources, Runs, Settings. |
| **Tasks** | Today / Upcoming / Board views, project lanes (each with current status, short-term goal, long-term goal), checkable tasks. |
| **Video Ideas** | Main Channel / Secondary Channel / Shorts boards. Quick-capture, double-click an idea to add title, script, and description. |
| **Video Research** | Enter a topic → titles, hook, outline, and thumbnail concepts. |
| **Channel Pool** | Curated AI-focused YouTube channels (seeded with 29, grouped by category) to pull ideas, trends, and newsletter sources from. Add/remove channels in the UI. |
| **Sponsorship Finder** | Track sponsor prospects by status; agent suggests new prospects. |
| **Automations** | Coming soon (scheduled runs, source sync, backups). |

All data persists to plain JSON files in `data/` — human-readable, git-trackable, easy to back up.

## Run it locally (Apple Silicon Mac or anywhere)

```bash
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev                  # http://localhost:3007
```

## AI configuration

The app talks to any **OpenAI-compatible** chat completions API. Set in `.env.local`:

```bash
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1   # or your gateway's URL
OPENAI_MODEL=gpt-5.6-sol                    # drafting/research model
HERMES_MODEL=hermes-agent                   # agent-style jobs (sponsor prospecting)
```

Set `OPENAI_MODEL` / `HERMES_MODEL` to the **exact model ids your provider exposes**.
If your provider serves models under different names, just change the two env vars —
no code changes needed.

## Deploy to Vercel (use it from your phone, anywhere)

```bash
npx vercel
```

Note: Vercel's filesystem is ephemeral, so the JSON file store resets between
deployments there. For a persistent hosted version, swap `lib/store.js` for
Vercel KV / Postgres / Turso (it's one file — `readStore`/`writeStore`).
For purely local use on your Mac, the JSON store is perfect.

## Backups — never lose this to a hard-drive crash

**The strategy (3-2-1 rule, adapted):**

1. **GitHub = source of truth.** Every commit you push is a full off-site copy of the
   code *and* your `data/*.json`. This alone survives a dead hard drive.
2. **Zip snapshots to cloud folders.** `npm run backup` commits + pushes to GitHub,
   zips the whole project (minus `node_modules`), and copies the zip into your
   iCloud Drive, Google Drive, and Obsidian vault folders if they exist.
   Edit the paths at the top of `scripts/backup.sh` to match your Mac.
3. **Time Machine** (or any whole-disk backup) covers anything not yet committed.

**Important:** do **not** put the live project folder itself inside iCloud/Google
Drive sync — cloud-sync clients corrupt live `.git` directories. Sync *zip snapshots*
(what the script does), and let git/GitHub handle the live code.

**Automate it (macOS):** run the backup nightly with a `launchd` job or a simple cron:

```bash
crontab -e
# nightly at 21:00
0 21 * * * cd /path/to/mission-control && npm run backup >> backups/backup.log 2>&1
```

## Stack

- Next.js 15 (App Router) + React 19, plain CSS, no UI framework
- JSON-file persistence (`data/`), zero database setup
- Provider-agnostic AI client (`lib/ai.js`)

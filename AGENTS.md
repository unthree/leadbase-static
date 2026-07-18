# Controlling Mission Control from external agents

Any agent that can make HTTP requests — a ChatGPT Custom GPT, a desktop agent,
an iMessage/SMS bot bridge, a cron script — can read and update this app
through its API. This file is written so you can paste it (or point an agent
at it) as operating instructions.

## Base URL and auth

- Base URL: your deployment, e.g. `https://mission-control-ecru-ten.vercel.app`
- Auth: send the access key on every request, either header works:
  - `x-api-key: <MC_API_KEY>`
  - `Authorization: Bearer <MC_API_KEY>`
- The key is whatever you set as the `MC_API_KEY` environment variable in
  Vercel. If `MC_API_KEY` is unset, the API is open (fine locally, not hosted).
- Machine-readable spec: `GET /api/openapi.json` (no auth required).

## Data model — five stores, each one JSON document

| Store | Contents |
|---|---|
| `tasks` | `{lanes: [{id,name,color,status,shortGoal,longGoal}], tasks: [{id,title,lane,done,due}]}` — `due` is `"today"`, `"upcoming"`, or `null` |
| `ideas` | `{boards: [{id,name,desc,ideas:[{id,title,done,script,description}]}]}` — boards: `main`, `secondary`, `shorts` |
| `newsletter` | `{sources: [{id,url,used,addedAt}], drafts: [{id,title,body,date}], runs: [...]}` |
| `research` | `{history: [{id,topic,output,ok,model,at}]}` |
| `sponsors` | `{prospects: [{id,name,status,notes}]}` — status: prospect/contacted/negotiating/closed/passed |

**The golden rule: GET → modify → PUT the whole document.** Never PUT a
partial object; whatever you PUT replaces the store entirely. Generate ids as
short random strings (e.g. 8 lowercase alphanumerics).

## Examples

Add a task to the Leadbase Pro lane for today:

```bash
KEY=your-mc-api-key
BASE=https://mission-control-ecru-ten.vercel.app

STATE=$(curl -s -H "x-api-key: $KEY" $BASE/api/state/tasks)
echo "$STATE" | jq '.tasks += [{"id":"a1b2c3d4","title":"Record intro video","lane":"leadbasepro","done":false,"due":"today"}]' \
  | curl -s -X PUT -H "x-api-key: $KEY" -H "Content-Type: application/json" -d @- $BASE/api/state/tasks
```

Capture a video idea on the Shorts board: GET `/api/state/ideas`, append to
the `ideas` array of the board with `id == "shorts"`, PUT back.

Run an AI job (uses the OPENAI_MODEL / HERMES_MODEL configured server-side):

```bash
curl -s -X POST -H "x-api-key: $KEY" -H "Content-Type: application/json" \
  -d '{"kind":"research","input":"Why local AI models are about to win"}' \
  $BASE/api/generate
```

`kind` is `newsletter`, `research`, or `sponsors`. The response is
`{ok, model, text}` — persisting the result (e.g. saving a draft) is the
caller's job via a PUT.

## Hooking up ChatGPT (Custom GPT Action)

1. ChatGPT → Explore GPTs → **Create** → Configure → **Create new action**.
2. Import schema from URL: `https://<your-app>.vercel.app/api/openapi.json`
3. Authentication: **API Key** → Auth Type: Custom → header name `x-api-key`
   → paste your `MC_API_KEY` value.
4. Instructions for the GPT: paste the "Data model" and "golden rule"
   sections above.

Now you can tell ChatGPT "add 'edit the sponsorship deck' to my Leadbase Pro lane for
today" from any device, including the ChatGPT mobile/desktop apps.

## Hooking up phone/iMessage or desktop agents

Any agent platform that supports webhooks, HTTP tools, or shell commands can
drive the same API — give it the base URL, the key, and this file as its
instructions. Nothing about the API is ChatGPT-specific.

## Updating the CODE (not just the data)

Code changes flow through GitHub, not this API:

1. The repo is `unthree/leadbase-static`; the deployed branch is connected to
   Vercel, so **every push auto-deploys** in ~40 seconds.
2. To let an agent modify the app itself, give it GitHub access (a
   fine-grained personal access token scoped to just this repo, Contents:
   read/write). The agent clones, edits, commits, pushes — Vercel does the rest.
3. Keep `MC_API_KEY` and other secrets in Vercel env vars, never in the repo.

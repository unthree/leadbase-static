#!/usr/bin/env bash
# One-command finisher for Mission Control.
#
# Usage:  bash scripts/finish-setup.sh <ACCESS_KEY> [BASE_URL]
#
# Does, in order:
#   1. Deploys the latest code to Vercel production.
#   2. Migrates any old "him" lane data to "leadbasepro" (Leadbase Pro).
#   3. Writes a persistence-test task, redeploys, and checks it survived —
#      proving whether the Upstash database is actually wired up.
#   4. Cleans up the test task and prints a pass/fail report.
#
# Prerequisite: the Upstash database must be CONNECTED to the mission-control
# project in Vercel (project -> Storage tab) or step 3 will report failure.

set -euo pipefail
cd "$(dirname "$0")/.."

KEY="${1:-${MC_API_KEY:-}}"
BASE="${2:-https://mission-control-ecru-ten.vercel.app}"
if [ -z "$KEY" ]; then
  read -r -p "Access key (MC_API_KEY): " KEY
fi

api_get()  { curl -sf -H "x-api-key: $KEY" "$BASE/api/state/tasks"; }
api_put()  { curl -sf -X PUT -H "x-api-key: $KEY" -H "Content-Type: application/json" -d @- "$BASE/api/state/tasks" > /dev/null; }

echo "==> 1/4 Deploying latest code to production"
npx vercel deploy --prod --yes

echo "==> 2/4 Migrating any old 'him' lane data to 'leadbasepro'"
STATE=$(api_get)
if printf '%s' "$STATE" | grep -q '"him"'; then
  printf '%s' "$STATE" | python3 -c '
import json, sys
d = json.load(sys.stdin)
for l in d.get("lanes", []):
    if l.get("id") == "him":
        l["id"], l["name"] = "leadbasepro", "Leadbase Pro"
for t in d.get("tasks", []):
    if t.get("lane") == "him":
        t["lane"] = "leadbasepro"
json.dump(d, sys.stdout)
' | api_put
  echo "    migrated old HIM data to Leadbase Pro."
else
  echo "    nothing to migrate."
fi

echo "==> 3/4 Persistence test: writing a marker task, then redeploying"
api_get | python3 -c '
import json, sys
d = json.load(sys.stdin)
d.setdefault("tasks", []).append({"id": "persist01", "title": "persistence test (auto)", "lane": "personalos", "done": False, "due": None})
json.dump(d, sys.stdout)
' | api_put
npx vercel deploy --prod --yes > /dev/null
sleep 3

echo "==> 4/4 Checking whether the marker survived the redeploy"
AFTER=$(api_get)
if printf '%s' "$AFTER" | grep -q '"persist01"'; then
  printf '%s' "$AFTER" | python3 -c '
import json, sys
d = json.load(sys.stdin)
d["tasks"] = [t for t in d.get("tasks", []) if t.get("id") != "persist01"]
json.dump(d, sys.stdout)
' | api_put
  echo ""
  echo "✅ PERSISTENCE OK — your data survives redeploys. Test task cleaned up."
  echo "   Mission Control is fully operational: $BASE"
else
  echo ""
  echo "❌ PERSISTENCE NOT ACTIVE — data still resets on each redeploy."
  echo "   Fix: vercel.com -> mission-control project -> Storage tab ->"
  echo "   connect 'upstash-kv-charcoal-blanket' to this project, then re-run:"
  echo "   bash scripts/finish-setup.sh <your-access-key>"
fi

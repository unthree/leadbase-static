#!/usr/bin/env bash
# Backs up Mission Control to multiple locations so a hard-drive crash
# can't take your work with it.
#
# Usage:  npm run backup        (or: bash scripts/backup.sh)
#
# What it does, in order:
#   1. Commits any uncommitted changes and pushes to GitHub (source of truth).
#   2. Creates a timestamped zip snapshot (code + data/, minus node_modules).
#   3. Copies the zip to iCloud Drive, Google Drive, and your Obsidian vault
#      if those folders exist on this Mac.
#
# Edit the destination paths below to match your machine.

set -euo pipefail
cd "$(dirname "$0")/.."

STAMP=$(date +%Y-%m-%d_%H%M)
NAME="mission-control-$STAMP.zip"

# ---- Destinations (edit these) ----------------------------------------
ICLOUD="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Backups/MissionControl"
GDRIVE="$HOME/Library/CloudStorage/GoogleDrive-*/My Drive/Backups/MissionControl"
OBSIDIAN="$HOME/Documents/Obsidian/Vault/MissionControl-Backups"
# ------------------------------------------------------------------------

echo "==> 1/3 Git push (GitHub is the source of truth)"
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -m "backup: snapshot $STAMP"
fi
git push || echo "   (push failed — check your network/remote, snapshot will still be made)"

echo "==> 2/3 Creating zip snapshot"
mkdir -p backups
zip -rq "backups/$NAME" . -x "node_modules/*" ".next/*" "backups/*" ".git/*"
echo "   backups/$NAME"

echo "==> 3/3 Copying to cloud folders (skips any that don't exist)"
for DEST_PATTERN in "$ICLOUD" $GDRIVE "$OBSIDIAN"; do
  # shellcheck disable=SC2086
  for DEST in $DEST_PATTERN; do
    if [ -d "$(dirname "$DEST")" ] || [ -d "$DEST" ]; then
      mkdir -p "$DEST"
      cp "backups/$NAME" "$DEST/"
      echo "   copied -> $DEST"
    fi
  done
done

echo "Done. Copies: GitHub (git) + local zip + any cloud folders found above."

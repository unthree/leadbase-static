# Morning Routine Automation — Agent Handoff Spec

This document is a complete, tool-agnostic handoff. Give it to any desktop
agent or assistant running on a Mac (or follow it manually) to set up the
daily morning message. Nothing in it depends on a specific AI vendor.

## Goal

Every morning at **6:30 AM**, send a message to the iMessage conversation
named **"M1 Hermes"** containing:

1. Today's routine checklist (from `daily-message-template.md`)
2. A link/reminder to open the tracker (`tracker.html` from this repo,
   served wherever the static site is hosted)
3. Yesterday's scoreboard line if available (videos filmed, inbox-zero,
   revenue action — the agent may fill this in or leave the placeholder)

## Constraints the agent must respect

- **iMessage can only be sent from macOS.** Use the Messages app via
  AppleScript (`send-imessage.applescript` in this folder). There is no
  cloud API for iMessage; do not attempt one.
- The Messages conversation is matched by **chat name "M1 Hermes"** first,
  falling back to a recipient handle if the named chat is not found. Edit
  `FALLBACK_HANDLE` in the script to a real phone number or Apple ID email
  before first run.
- macOS will prompt once for Automation permission
  (System Settings → Privacy & Security → Automation → allow the runner
  to control Messages). This must be approved interactively one time.

## Setup steps (what the agent should do)

1. Copy `send-imessage.applescript` somewhere stable, e.g.
   `~/Scripts/send-imessage.applescript`.
2. Edit `FALLBACK_HANDLE` in the script.
3. Test manually:
   `osascript ~/Scripts/send-imessage.applescript "Test from morning automation"`
4. Install the scheduler. Two options, pick one:
   - **launchd (recommended, survives reboots):** copy
     `com.morning.hermes.plist` to `~/Library/LaunchAgents/`, edit the
     script path inside it if needed, then run
     `launchctl load ~/Library/LaunchAgents/com.morning.hermes.plist`.
   - **Shortcuts app:** create a Personal Automation → Time of Day →
     6:30 AM → Run Shell Script → the `osascript` command above with the
     rendered message.
5. Each morning, before sending, render the message from
   `daily-message-template.md`: replace `{{DATE}}` with today's date and
   `{{SCOREBOARD}}` with yesterday's numbers if known (otherwise delete
   that line).

## Verification

- After setup, trigger one run manually and confirm the message arrives
  in the "M1 Hermes" chat.
- Check `launchctl list | grep com.morning.hermes` shows the job loaded.

## Files in this folder

| File | Purpose |
|---|---|
| `send-imessage.applescript` | Sends a message to the "M1 Hermes" chat |
| `com.morning.hermes.plist` | launchd job: runs daily at 6:30 AM |
| `daily-message-template.md` | The message body to render and send |

# Zero-Terminal Setup — Daily Morning Message via Shortcuts

No Terminal, no scripts, nothing to edit. This uses Apple's built-in
Shortcuts app and takes about 2 minutes of tapping. It works on
**iPhone alone** (recommended — runs even when the Mac is asleep) or on
a Mac. This path fully replaces the AppleScript/launchd files in this
folder; use one or the other, not both.

## Part 1 — Create the shortcut (~1 min)

1. Open the **Shortcuts** app.
2. Tap **+** to create a new shortcut. Name it **Morning Hermes**.
3. Add the action **Send Message**.
4. Tap the blue **Message** placeholder and paste the text from
   "The message" below.
5. Tap the **Recipient** field and choose the **M1 Hermes**
   conversation (start typing the name — existing chats appear).
6. Done. Tap the shortcut once now to test — the message should land
   in the M1 Hermes chat immediately.

## Part 2 — Schedule it for 6:30 AM daily (~1 min)

1. In Shortcuts, go to the **Automation** tab → **+** →
   **New Personal Automation**.
2. Choose **Time of Day** → 6:30 AM → **Daily** → Next.
3. Choose **Run Immediately** (iOS 17+/macOS 14+; on older versions,
   turn OFF "Ask Before Running").
4. Select the **Morning Hermes** shortcut. Done.

That's the whole install. Tomorrow at 6:30 AM the message sends itself.

## The message

Copy everything between the lines:

---
Good morning ☀️

Today's routine:
1. Activate — water + bed, no phone
2. P90X workout
3. Film a video (topic decided last night)
4. Email block — 20 min, inbox zero
5. One revenue action
6. Twitter — post first, 15 min timer
7. Read
8. Journal + plan tomorrow

Create before you consume.
---

Tip: add the **Current Date** action before Send Message and insert it
as a variable at the top of the message if you want the date included
automatically.

## Verify it worked

- Running the shortcut manually delivers the message to M1 Hermes. ✓
- The Automation tab shows "Daily, 6:30 AM → Morning Hermes". ✓
- After the first morning, check the automation ran (Automation tab
  shows last run). ✓

## If you later want the fancier version

The AppleScript/launchd files in this folder do the same thing from a
Mac and let a desktop agent inject a dynamic scoreboard into the
message each day. `HANDOFF.md` explains that path — hand it to any
desktop agent when you're ready.

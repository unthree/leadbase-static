-- Sends the given text to the iMessage conversation named "M1 Hermes".
-- Usage: osascript send-imessage.applescript "message text"
-- Falls back to FALLBACK_HANDLE if no chat with that name exists yet.

on run argv
	if (count of argv) < 1 then
		error "Usage: osascript send-imessage.applescript \"message text\""
	end if
	set theMessage to item 1 of argv
	set chatName to "M1 Hermes"
	-- EDIT ME: phone number (+15551234567) or Apple ID email for the chat
	set FALLBACK_HANDLE to "+15551234567"

	tell application "Messages"
		set targetChat to missing value
		repeat with c in chats
			try
				if name of c is chatName then
					set targetChat to c
					exit repeat
				end if
			end try
		end repeat
		if targetChat is not missing value then
			send theMessage to targetChat
		else
			set targetService to 1st account whose service type = iMessage
			set targetBuddy to participant FALLBACK_HANDLE of targetService
			send theMessage to targetBuddy
		end if
	end tell
end run

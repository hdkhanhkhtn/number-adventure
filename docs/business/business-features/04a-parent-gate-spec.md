# Parent Gate Specification (Security Entry Point)

## Purpose
Protect parent dashboard from accidental child access; allow parent to manage app settings safely.

## Access
- Small lock icon on child home screen (bottom-right corner, subtle)
- Tap lock → PIN prompt appears
- First time → setup PIN screen
- Subsequent access → PIN entry screen

## PIN Management
- 4-digit PIN (user sets on first access)
- Soft keyboard (numbers only, no letters)
- Entry feedback: dots hide digits for privacy
- Change PIN option in settings (requires old PIN first)
- Forgot PIN option (resets all progress with warning)

## Security
- 3 wrong PIN attempts → 30-second lockout
- Lockout timer visible ("Try again in XX seconds")
- After unlock, user can re-attempt
- LocalStorage only (no network transmission of PIN)

## Tone
Professional, trustworthy, not scary

| Context | Message |
|---------|---------|
| First setup | "Create a 4-digit PIN to protect your settings" |
| Wrong PIN | "Incorrect PIN. Try again." |
| Lockout | "Too many attempts. Please try again in 30 seconds." |

**Design Reference:** `Parent Gate Screen.html`

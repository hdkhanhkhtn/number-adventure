# Business Rules

## AI Question Generation

| Rule | Detail |
|---|---|
| Generation trigger | When GameSession starts → check DB cache |
| Cache hit | Reuse 5–10 stored AIQuestion records |
| Cache miss | Generate via `/api/ai/generate` → save to DB |
| AI endpoint | `${AI_ENDPOINT}` env var, model: `${AI_MODEL}` env var |
| Response format | Strict JSON with prompt, options[], correctAnswer |
| Validation | Backend validates before storing (schema check) |
| Reuse | Same questions reused across multiple sessions (reduces API calls) |
| Fallback | If AI fails, use static fallback questions from code |

## Difficulty Progression

| Rule | Detail |
|---|---|
| Default difficulty | `easy` for first play of any level |
| Auto-advance | After 3 consecutive ≥3-star rounds → bump to `medium` |
| Auto-reduce | After 2 consecutive <2-star rounds → drop back to `easy` |
| Manual override | Parent can set fixed difficulty in ChildSettings (stored in DB) |
| Star mapping | ≥90% correct → 3 stars, 70–89% → 2 stars, <70% → 1 star |

## Level Unlocking

- Level N+1 unlocks when Level N is completed (any star count ≥1)
- World N+1 unlocks when all levels in World N earn ≥1 star
- Locked levels show a padlock on the world map

## Reward Triggers

| Event | Reward |
|---|---|
| First completion of any level | 1 sticker (saved to ChildSticker) |
| 3-star on a level (first time) | 1 bonus sticker |
| 7-day streak | Special mascot badge sticker |
| All levels in a world completed | World trophy sticker |

## Session Tracking

- GameSession created on lesson start (`/api/sessions/start`)
- Each answer → GameAttempt record (`/api/sessions/attempt`)
- Session completed → stars calculated, streak updated (`/api/sessions/complete`)
- All data persisted in PostgreSQL, authoritative source
- React Context caches current session for fast UI updates

## Streak Rules

| Rule | Detail |
|---|---|
| Increment | If child plays ≥1 lesson per calendar day |
| Reset | If a full calendar day is skipped |
| Calculation | lastActivityDate in DB compared to today() |
| Display | StreakCard component (no /progress/streak route MVP) |
| Locations | Home screen, Parent dashboard, Reward screen |

## Parent Gate & Settings

| Rule | Detail |
|---|---|
| Access | Parent area locked behind 4-digit PIN |
| Setup | No PIN set → prompt to create on first tap |
| Lockout | Wrong PIN 3× → 30-second lockout (prevents brute-force) |
| Storage | PIN hashed in Parent.pin (DB, not client-side) |
| Settings stored | ChildSettings table (dailyMinutes, difficulty, language, audioEnabled, celebrationsOn) |

## Audio Rules

| Rule | Detail |
|---|---|
| Default | Audio enabled by default (ChildSettings.audioEnabled = true) |
| Toggle | Parent can disable in Settings (persists to DB) |
| Speech | Web Speech API (default), fallback to silent |
| SFX | Howler.js for sound effects (tap, correct, wrong, celebrate) |
| Fallback | If Web Speech unavailable → no audio, no error (graceful) |

## ParentReport Scope (MVP Phase C)

Include in report:
- Lessons completed (count)
- Total stars earned
- Skills practiced (tags from completed lessons)
- Recent activity (last 5 GameSession records)
- Recommended next step (next locked level or difficulty suggestion)

DO NOT include:
- Complex analytics dashboards
- Weekly/monthly charts (Phase 2+)
- AI-generated tips (Phase 2+)

---

## Multi-Child Profile Switching (Phase 3C)

| Rule | Detail |
|---|---|
| Max children | 10 per parent |
| Color allowlist | `['sun','sage','coral','lavender','sky']` (enforced on create/update) |
| Age range | 2–12 years |
| Active child | Stored in localStorage (`bap-active-child`); persists across sessions |
| Switching | Avatar tap → ChildSwitcherModal → switchChild() → SWITCH_CHILD reducer |
| State reset | Switching resets `currentWorldId = null` + `sessionActive = false` (prevents stale state) |
| IDOR protection | Every endpoint verifies `child.parentId === parentId` before returning data |

## Encouragement Messages (Phase 3C)

| Rule | Detail |
|---|---|
| Author | Parent writes message (ownership verified via parentId) |
| Length | 1–200 characters |
| Recipient | Child identified by childId |
| Display | Single unread message shown on child home screen (EncouragementBanner) |
| Read status | Tracked in DB; GET returns unread only; PATCH marks read |
| Fetch | Child-side GET is unauthenticated (checks childId exists); prevents orphaned messages |
| Dismiss | PATCH requires both id (messageId) + childId for ownership verification |

## Weekly Email Reports (Phase 3C)

| Rule | Detail |
|---|---|
| Schedule | Vercel Cron: Monday 09:00 UTC |
| Trigger | `/api/cron/weekly-report` with Bearer `CRON_SECRET` auth |
| Opt-in | `Parent.emailReports @default(true)` — parents opt OUT via unsubscribe token |
| Batching | Cursor-based pagination (50 parents per batch) to prevent OOM |
| Content | Child name, session count, accuracy %, total stars, streak days |
| Unsubscribe | HMAC-SHA256 signed token in email footer; click → `/api/parent/unsubscribe?token=...` → sets `emailReports = false` |
| Security | CRLF stripping on parent name (prevents email header injection); timingSafeEqual for token comparison |
| Fallback | If Resend send fails, error logged; cron returns `{ sent, failed }` counts |

## Progress Export (Phase 3C)

| Rule | Detail |
|---|---|
| Format | CSV or PDF (client-side only, no server storage) |
| Data | Child name, date range, lessons completed, stars earned, accuracy %, current streak |
| Trigger | Parent dashboard export button (post-Phase-3C analytics section) |
| Implementation | CSV: blob download; PDF: dynamic jsPDF import (SSR-safe) |
| Scope | Single child per export (selected from dropdown) |

## Family Leaderboard (Phase 3C)

| Rule | Detail |
|---|---|
| Visibility | Shown on parent dashboard only when ≥2 children in family |
| Ranking | Sorted by `totalStars` (all-time, descending) |
| Icons | 👑 rank 1st, 🥈 rank 2nd, 🥉 rank 3rd; numeric rank 4+ |
| Data | Child name, avatar color, total stars |
| Note | N+1 query pattern (fetches `/api/report/:childId` per child); deferred to Phase 4 for server-side aggregation endpoint |

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

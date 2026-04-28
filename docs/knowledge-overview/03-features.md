# Feature List — MVP

## Child Features

| Feature | Route | Data Source | Status |
|---|---|---|---|
| **Onboarding (Multi-Step Wizard)** | `/onboarding` | Client (POST `/api/children`) | Phase 3A ✅ |
| **Home Screen** | `/home` | `/api/progress` (streak, stats); EncouragementBanner | Phase 3C ✅ |
| **World Map** | `/worlds/:worldId` | Static config + `/api/progress` | Phase 1 ✅ |
| **Game: Hear & Tap** | `/play/hear-tap/:lessonId` | `/api/ai/generate` (cached) or DB Lesson | Phase 1 ✅ |
| **Game: Number Order** | `/play/number-order/:lessonId` | `/api/ai/generate` (cached) or DB Lesson | Phase 1 ✅ |
| **Game: Build the Number** | `/play/build-number/:lessonId` | `/api/ai/generate` (cached) or DB Lesson | Phase 1 ✅ |
| **Game: Even or Odd** | `/play/even-odd/:lessonId` | `/api/ai/generate` (cached) or DB Lesson | Phase 1 ✅ |
| **Game: Add/Take (Math Kitchen)** | `/play/add-take/:lessonId` | `/api/ai/generate` (cached) or DB Lesson | Phase 1 ✅ |
| **Game: Count Objects** | `/play/count-objects/:lessonId` | DB Lesson (World 6: Counting Meadow) | Phase 3B ✅ |
| **Game: Number Writing** | `/play/number-writing/:lessonId` | DB Lesson (World 7: Writing Workshop) | Phase 3B ✅ |
| **Reward / Celebration** | overlay after session | Calculated from GameSession | Phase 1 ✅ |
| **Sticker Collection** | `/stickers` | `/api/children/:id/stickers` | Phase 1 ✅ |
| **StreakCard** | part of home/dashboard | `/api/progress` | Phase 1 ✅ |
| **Settings (Volume, Contrast, Motion)** | part of parent settings | `/api/children/[id]/settings` | Phase 3A ✅ |
| **Settings (Bedtime, Break Reminder, Hints, Game Rotation)** | part of parent settings | `/api/children/[id]/settings` | Phase 3A ✅ |

## Parent Features

| Feature | Route | Data Source | Status |
|---|---|---|---|
| **Parent Gate (PIN)** | `/parent` (verify at `/api/auth/pin`) | Parent.pin (DB) | Phase 1 ✅ |
| **Progress Dashboard** | `/parent/dashboard` | `/api/parent-report`, Family Leaderboard | Phase 3C ✅ |
| **Settings (Difficulty, Language, Audio, Celebrations)** | `/parent/settings` | `/api/children/:id/settings` | Phase 1 ✅ |
| **Multi-Child Profile Switcher** | Home screen (tap avatar) | `/api/parent/children` | Phase 3C ✅ |
| **Parent-to-Child Encouragement Messages** | Home screen (EncouragementBanner) | `/api/parent/encouragement` | Phase 3C ✅ |
| **Weekly Progress Email Report** | Cron (Monday 09:00 UTC) | `/api/cron/weekly-report` + Resend | Phase 3C ✅ |
| **Email Unsubscribe** | `/?unsubscribed=1` | `/api/parent/unsubscribe` (HMAC token) | Phase 3C ✅ |
| **Progress Export (CSV + PDF)** | Parent dashboard export button | Client-side jsPDF blob download | Phase 3C ✅ |
| **Family Leaderboard** | `/parent/dashboard` (2+ children) | All-time stars rank per child | Phase 3C ✅ |

## Backend API

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/register` | POST | Register parent account |
| `/api/auth/login` | POST | Parent email + password login |
| `/api/auth/session` | GET | Get current child session |
| `/api/auth/pin` | POST | Verify parent PIN (gate) |
| `/api/children` | GET, POST | Child profiles |
| `/api/children/:id/settings` | PUT | Update ChildSettings |
| `/api/children/:id/stickers` | GET | Earned stickers |
| `/api/sessions/start` | POST | Create GameSession, trigger AI generation |
| `/api/sessions/attempt` | POST | Record GameAttempt |
| `/api/sessions/complete` | POST | Mark session complete, calc stars, update streak |
| `/api/ai/generate` | POST | Generate/cache AIQuestions |
| `/api/progress` | GET | Fetch user progress (sessions, streak, stickers) |
| `/api/parent-report` | GET | Simple parent report (lessons, stars, skills, activity) |
| `/api/stickers` | GET | All stickers + earned status |

## Out of Scope (MVP)

- `/parent/progress` detail drill-down page (deferred to Phase 2 — parent dashboard covers high-level report)
- Cloud sync / multi-device
- Multiplayer / leaderboards
- In-app purchases
- AI-generated tips (Phase 2+)
- Weekly email reports (Phase 2+)
- Teacher/classroom mode (Phase 3+)

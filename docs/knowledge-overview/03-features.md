# Feature List — MVP

## Child Features

| Feature | Route | Data Source | Priority |
|---|---|---|---|
| Onboarding | `/onboarding` | Client (POST `/api/children`) | Must |
| Home Screen | `/home` | `/api/progress` (streak, stats) | Must |
| World Map | `/worlds/:worldId` | Static config + `/api/progress` | Must |
| Hear & Tap Game | `/play/hear-tap/:lessonId` | `/api/ai/generate` (cached) | Must |
| Number Order Game | `/play/number-order/:lessonId` | `/api/ai/generate` (cached) | Must |
| Build the Number Game | `/play/build-number/:lessonId` | `/api/ai/generate` (cached) | Must |
| Even or Odd Game | `/play/even-odd/:lessonId` | `/api/ai/generate` (cached) | Must |
| Add/Take (Math Kitchen) | `/play/add-take/:lessonId` | `/api/ai/generate` (cached) | Must |
| Reward / Celebration | overlay after session | Calculated from GameSession | Must |
| Sticker Collection | `/stickers` | `/api/children/:id/stickers` | Should |
| StreakCard | part of home/dashboard | `/api/progress` | Should |

## Parent Features

| Feature | Route | Data Source | Priority |
|---|---|---|---|
| Parent Gate (PIN) | `/parent` (verify at `/api/auth/pin`) | Parent.pin (DB) | Must |
| Progress Dashboard | `/parent/dashboard` | `/api/parent-report` | Must |
| Settings | `/parent/settings` | `/api/children/:id/settings` | Must |

## Backend API

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/session` | GET | Get current child session |
| `/api/auth/pin` | POST | Verify parent PIN |
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

- User authentication (password-based)
- Cloud sync / multi-device
- Multiplayer / leaderboards
- In-app purchases
- AI-generated tips (Phase 2+)
- Weekly email reports (Phase 2+)
- Teacher/classroom mode (Phase 3+)

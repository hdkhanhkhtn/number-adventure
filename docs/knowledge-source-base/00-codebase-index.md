# Codebase Index — Bap Number Adventure

Full-stack Next.js application with PostgreSQL backend, AI content generation, and child-safe game design.

## Architecture Overview

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14+ App Router | Client UI, page routing |
| **Backend** | Next.js API Routes | RESTful endpoints |
| **Database** | PostgreSQL + Prisma | Persistent data storage |
| **AI Integration** | https://9router.../v1 | Question generation |
| **Styling** | TailwindCSS | Mobile-first, responsive |
| **Audio** | Web Speech API + Howler.js | Text-to-speech + SFX |
| **Deployment** | Docker + VPS | Containerized, scalable |

## Directory Map

### Source Code (`app/`, `components/`, `lib/`)

**Frontend Routing (`app/`)**
- Root layout: context providers, theme setup
- `(child)`: child-facing routes (home, worlds, games)
- `(parent)`: parent-facing routes (dashboard, settings)
- Routes: `/worlds/:worldId` (world map), `/play/:gameType/:lessonId` (game screen)

**API Routes (`app/api/`)**
- `auth/`: child session, parent PIN verification
- `children/`: child profiles, settings
- `sessions/`: game session start, attempt tracking, completion
- `ai/`: AI question generation, caching
- `progress/`: fetch user progress, streak
- `parent-report/`: simple parent report
- `stickers/`: sticker inventory, unlock tracking

**Reusable Components (`components/`)**
- `ui/`: NumberTile, Button, Card, StreakCard, etc.
- `game/`: GameContainer, QuestionDisplay, AnswerGrid, Reward
- `layout/`: AppShell, IOSFrame, Headers

**Game Logic (`lib/game-engine/`)**
- Question generator per game type
- Answer validator (correct/wrong check)
- Difficulty calculator (easy → medium → hard)

**Database Layer (`lib/db/`)**
- Prisma client singleton
- DB migrations stored in `prisma/migrations/`

**AI Client (`lib/ai/`)**
- Request formatter for 9router API
- Response validation (JSON schema)
- Caching logic (check DB before calling API)

**Services (`lib/services/`)**
- AudioService: Web Speech API + Howler.js fallback
- Streak calculator

**Hooks (`lib/hooks/`)**
- `useProgress`: fetch + cache user progress
- `useGame`: game round state, scoring
- `useSession`: track GameSession + GameAttempt
- `useAudio`: play SFX, speak text

**Static Data (`data/`)**
- Game configs: hear-tap, number-order, build-number, even-odd, add-take
- World definitions: world-1-farm, world-2-space, world-3-ocean, etc.

### Database Schema (`prisma/`)

**Core Tables:**
- `Parent(id, email, passwordHash, pin)` — Parent accounts
- `Child(id, parentId, name, age, avatarColor)` — Child profiles
- `ChildSettings(childId, dailyMinutes, difficulty, language, audioEnabled)` — Child preferences
- `Lesson(id, worldId, gameType, title, order, skillTags)` — Static lesson reference
- `GameSession(id, childId, lessonId, startedAt, completedAt, stars, accuracy)` — Play session
- `GameAttempt(id, sessionId, questionId, answeredCorrectly, timeMs)` — Per-question result
- `AIQuestion(id, lessonId, gameType, prompt, options, correctAnswer)` — Cached AI content
- `Sticker(id, name, world, imageUrl, unlockCondition)` — Sticker definitions
- `ChildSticker(childId, stickerId, earnedAt)` — Earned stickers
- `Streak(childId, currentStreak, longestStreak, lastActivityDate)` — Daily streak tracking

### Design & Assets (`handoff/`, `public/`)

- Design prototypes in `handoff/number-adventure/project/` (HTML + CSS)
- Design tokens: `tokens.css` (colors, spacing, fonts)
- Audio files: `public/audio/` (SFX, voice)
- Images: `public/images/` (mascot, backgrounds, stickers)

### Documentation (`docs/`)

**Project Overview:**
- `knowledge-overview/01-project-identity.md` — Product goals, target users
- `knowledge-overview/02-tech-stack.md` — Tech choices and rationale
- `knowledge-overview/03-features.md` — MVP scope, games, reward system

**Architecture:**
- `knowledge-architecture/01-system-overview.md` — Full-stack diagram
- `knowledge-architecture/02-component-map.md` — Component hierarchy
- `knowledge-architecture/03-data-flow.md` — User → UI → API → DB flow

**Domain Model:**
- `knowledge-domain/01-game-types.md` — Game mechanics per type
- `knowledge-domain/02-data-models.md` — Database schema + TS types
- `knowledge-domain/03-business-rules.md` — AI generation, difficulty, streak, rewards

**Source Base:**
- `knowledge-source-base/01-directory-structure.md` — Full folder tree
- `knowledge-source-base/02-entry-points.md` — App entry, routing
- `knowledge-source-base/03-module-map.md` — Key modules, dependencies

**Implementation:**
- `implementation/` — Dev guides, task breakdown, handoff checklist

**Business Docs:**
- `business/business-prd/` — Product requirements
- `business/business-features/` — Feature specs (games, UI states, rewards)
- `business/business-workflows/` — User flows (child play, parent management)

**Standards:**
- `knowledge-standards/01-code-style.md` — Naming, formatting, structure
- `knowledge-standards/02-git-conventions.md` — Git workflow, commits
- `knowledge-standards/03-testing-standards.md` — Unit, integration, E2E tests

**Decisions:**
- `decisions/` — Architecture Decision Records (ADRs)

**Runbooks:**
- `runbooks/01-development-setup.md` — Local dev setup
- `runbooks/02-deployment.md` — Docker + VPS deployment

**Planning:**
- `sprints/roadmap.md` — Phase 1 MVP milestones, Phase 2–3 future

## Key Data Flows

### Game Session Flow
1. Child taps lesson → `/play/:gameType/:lessonId`
2. Call `/api/sessions/start` → create GameSession + fetch/generate AIQuestions
3. Render 5–10 questions in loop
4. Per answer → POST `/api/sessions/attempt` → save GameAttempt
5. After all questions → POST `/api/sessions/complete` → calculate stars, update Streak, check sticker unlock
6. Reward screen → show stars, StreakCard, sticker unlock
7. Return to home → fetch `/api/progress` → update ProgressContext

### AI Generation Flow
1. Lesson start → `/api/ai/generate`
2. Check AIQuestion table for cached questions
3. If cache miss → POST to https://9router.../v1 (model: advance-model)
4. Validate JSON response
5. Store in AIQuestion table (5–10 questions)
6. Return to client, render in game

### Parent Report Flow
1. Parent taps dashboard
2. Call `/api/parent-report`
3. Return: lessons completed, stars, skills, recent activity, next step
4. Display simple report (no heavy analytics)

## Configuration

**Game Types:** `hear-tap`, `number-order`, `build-number`, `even-odd`, `add-take`

**Worlds:** 5 static worlds (Farm, Space, Ocean, Jungle, Math Kitchen)
- Math Kitchen = World (NOT a game type)
- AddTake = Game type within Math Kitchen world

**Difficulty:** easy → medium → hard (auto-adjust based on performance)

**Audio:** Web Speech API (default) → fallback: silent (graceful)

**Deployment:** Docker (PostgreSQL + Next.js), Nginx (optional reverse proxy), VPS target

## Development Quick Start

```bash
# Setup
npm install
npx prisma migrate dev  # Run migrations

# Backend
node_modules/.bin/next dev  # Runs on localhost:3000, includes API routes

# Database
docker-compose up -d     # PostgreSQL on localhost:5432

# Build
npm run build
npm run start            # Production mode

# Tests
npm test                 # Jest + Testing Library
```

## Common Tasks

| Task | File/Command |
|------|------|
| Add new game type | `data/game-config/[type].ts` + game component |
| Add world | `data/worlds/world-N.ts` + route in `app/(child)/worlds` |
| Modify AI generation | `lib/ai/generate.ts` + `/api/ai/generate` endpoint |
| Update rewards | `lib/services/reward-calculator.ts` + `business-rules.md` |
| Change audio | `lib/services/audio.ts` + `useAudio` hook |
| Parent feature | `app/(parent)/` + API route + ChildSettings table |

## Security Considerations

- Parent PIN hashed in DB (Parent.pin)
- No sensitive data in localStorage
- API validation for all AI responses
- SQL injection prevention via Prisma ORM
- CORS configured for API routes (same-origin default)

## Performance Notes

- AI questions cached in DB (5–10 per lesson, reused across sessions)
- React Context prevents unnecessary re-renders
- Howler.js lazy-loads audio
- Web Speech API runs client-side (no network latency for speech)
- Prisma lazy loading on relations (explicit `include` for joins)

## Future Enhancements (Phase 2+)

- Google Text-to-Speech integration (optional)
- CMS for static game configs
- Multi-child household support (parent management)
- Weekly email reports for parents
- Leaderboards (friends only)
- PWA offline support
- Classroom mode (teacher dashboard)


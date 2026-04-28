# System Overview

## Architecture Pattern

Full-stack: Next.js (frontend + API Routes) with PostgreSQL backend. React Context for client state, Prisma for database access, AI-generated questions cached in DB.

```
Client (Browser)                     Server (Next.js)                 External Services
├── Next.js App (App Router)         ├── API Routes                  │
│   ├── (child) — child screens      │   ├── /api/auth               │
│   ├── (parent) — parent screens    │   ├── /api/children           │
│   └── Providers                    │   ├── /api/sessions           │ AI Service
│       ├── GameProgressContext      │   ├── /api/ai/generate        ├──► https://9router
│       │   └── isHydrated flag      │   ├── /api/parent/            │    /v1
│       ├── AudioContext             │   ├── /api/cron/weekly-report │
│       └── ThemeContext             │   └── /api/progress           │ Email Service
│                                    │                               ├──► Resend API
│                                    ├── Database (Prisma ORM)       │    /emails/send
│  localStorage (settings,           │   └── PostgreSQL              │
│  activeChildId, onboarding state)  │       ├── Parent              │ TTS Service (opt)
│                                    │       ├── Child               ├──► Google Cloud
└────────────────────────────────────┤       ├── ChildSettings       │    Text-to-Speech
                                     │       ├── Lesson              │
                                     │       ├── GameSession         │
                                     │       ├── GameAttempt         │
                                     │       ├── AIQuestion (cached) │
                                     │       ├── Sticker             │
                                     │       ├── ChildSticker        │
                                     │       ├── Streak              │
                                     │       ├── EncouragementMsg     │
                                     │       └── World               │
                                     │                               │
                                     └── lib/ai, lib/db, lib/services,
                                         lib/email, lib/export,
                                         lib/schemas, lib/lesson-loader
```

## Module Boundaries

| Module | Responsibility | Depends On |
|---|---|---|
| `app/` | Routes, layouts, page shells | components, lib, api |
| `components/ui/` | Atomic UI elements + SkeletonScreen | none |
| `components/game/` | Game-specific UI (5 types + 2 new types) | components/ui, lib/game-engine |
| `components/layout/` | App shell, iOS frame | components/ui |
| `components/screens/` | Complex screens: child switcher, encouragement banner, family leaderboard, save-progress banner | components/ui, lib/api |
| `lib/game-engine/` | Question gen, validation, difficulty | data/ |
| `lib/hooks/` | useAudio, useGame, useProgress, useSettings | lib/game-engine, contexts |
| `lib/db/` | Prisma client setup | none |
| `lib/ai/` | AI request/response client | lib/db |
| `lib/services/` | AudioService, others | none |
| `lib/utils/` | Pure helpers | none |
| `lib/email/` | Resend init, React Email templates, HMAC tokens | Resend SDK |
| `lib/export/` | CSV/PDF export (client-side jsPDF) | jsPDF SDK |
| `lib/schemas/` | Zod validation schemas (Lesson, etc.) | zod |
| `lib/lesson-loader.ts` | Feature-flagged lesson loader (DB vs static) | lib/db, lib/schemas |
| `data/` | Static game config, worlds, fallback lessons | none |
| `app/api/` | API routes, validation, logic | lib/db, lib/ai, lib/email, prisma |

## Data Persistence

- **PostgreSQL (authoritative)** — all user progress, sessions, questions, settings
- **React Context (cache)** — current session state, UI state
- **localStorage (fallback)** — temp cache, offline tolerance (future)
- **AI Cache** — questions stored in `AIQuestion` table, reused per lesson

## Audio Architecture

```
AudioService (TypeScript singleton)
  ├── Web Speech API (default)       — speak(text)
  ├── Howler.js                      — play SFX
  └── Optional: Google TTS           — playFile(url)

Trigger points:
  ├── Page load      → ambient music (optional)
  ├── Question load  → speak prompt via Web Speech
  ├── Answer submit  → play SFX (correct/wrong)
  └── Reward unlock  → play celebration sound
```

## Lesson Loading Pipeline (Phase 3B)

```
LessonLoader.ts (feature-flagged)
  ├── IF NEXT_PUBLIC_USE_DB_LESSONS=true
  │   ├── Query Prisma.lesson.findUnique()
  │   ├── Cache: unstable_cache(1h) on server
  │   └── Validate schema via lesson-schema.ts
  └── ELSE (fallback)
      └── Return static lesson from data/lessons/ (fallback JSON)

Usage:
  ├── Game screen: await lessonLoader.get(lessonId)
  ├── Validation: ZodSchema.parse(lesson)
  └── Render: gameEngine.generateQuestions(lesson)
```

## Email & Parent Reporting (Phase 3C)

```
Weekly Report Flow (Vercel Cron, Monday 09:00 UTC)
  1. GET /api/cron/weekly-report (Bearer CRON_SECRET)
  2. Fetch parent list (cursor-based batching)
  3. FOR each parent WHERE emailReports = true:
     ├── Fetch all children + GameSession data (week)
     ├── Calculate: lessons, stars, accuracy %, streak
     ├── Render: weekly-report-template.tsx (React Email)
     ├── Send: await resend.emails.send({to, html})
     └── Log: success/failure
  4. Response: { sent: N, failed: 0, errors: [] }

Unsubscribe Flow:
  1. Email: footer link with HMAC token
  2. GET /api/parent/unsubscribe?token=<hmac>
     ├── Verify: timingSafeEqual(token, hash(parentId + CRON_SECRET))
     ├── Update: Parent.emailReports = false
     └── Redirect: /?unsubscribed=1

Token Generation: HMAC-SHA256(parentId, CRON_SECRET)
```

## Settings Persistence (Phase 3A)

```
useSettings Hook Flow:
  1. Mount: GET /api/children/[id]/settings
  2. Update: localStorage.setItem("bap-settings", JSON)
  3. Debounce: 300ms timer on each change
  4. Sync: PATCH /api/children/[id]/settings (debounced)
     ├── Authenticated: DB write
     └── Guest: localStorage only

Hydration Guard:
  ├── GameProgressContext.isHydrated flag
  ├── All child pages wrap with: { isHydrated ? <Page /> : <SkeletonScreen /> }
  └── Prevents SSR/CSR mismatch warnings
```

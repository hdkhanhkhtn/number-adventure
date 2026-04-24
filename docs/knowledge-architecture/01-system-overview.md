# System Overview

## Architecture Pattern

Full-stack: Next.js (frontend + API Routes) with PostgreSQL backend. React Context for client state, Prisma for database access, AI-generated questions cached in DB.

```
Client (Browser)                     Server (Next.js)                 External
├── Next.js App (App Router)         ├── API Routes                  │
│   ├── (child) — child screens      │   ├── /api/auth               │
│   ├── (parent) — parent screens    │   ├── /api/children           │
│   └── Providers                    │   ├── /api/sessions           │ AI Service
│       ├── GameProgressContext      │   ├── /api/ai/generate        ├──► https://9router
│       ├── AudioContext             │   └── /api/progress           │    /v1
│       └── ThemeContext             │                               │
│                                    ├── Database (Prisma ORM)       │
│                                    │   └── PostgreSQL              │
│                                    │       ├── Parent              │
└────────────────────────────────────┤       ├── Child               │
                                     │       ├── ChildSettings       │
                                     │       ├── Lesson (static)     │
                                     │       ├── GameSession         │
                                     │       ├── GameAttempt         │
                                     │       ├── AIQuestion (cached) │
                                     │       ├── Sticker             │
                                     │       ├── ChildSticker        │
                                     │       └── Streak              │
                                     │                               │
                                     └── lib/ai, lib/db, lib/services
```

## Module Boundaries

| Module | Responsibility | Depends On |
|---|---|---|
| `app/` | Routes, layouts, page shells | components, lib, api |
| `components/ui/` | Atomic UI elements | none |
| `components/game/` | Game-specific UI | components/ui, lib/game-engine |
| `components/layout/` | App shell, iOS frame | components/ui |
| `lib/game-engine/` | Question gen, validation, difficulty | data/ |
| `lib/hooks/` | useAudio, useGame, useProgress | lib/game-engine, contexts |
| `lib/db/` | Prisma client setup | none |
| `lib/ai/` | AI request/response client | lib/db |
| `lib/services/` | AudioService, others | none |
| `lib/utils/` | Pure helpers | none |
| `data/` | Static game config, worlds | none |
| `app/api/` | API routes, validation, logic | lib/db, lib/ai, prisma |

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

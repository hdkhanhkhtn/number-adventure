# Phase A: Foundation -- Project Setup + Design System + DB Schema + API Scaffold

## Context Links

- Prototype tokens: `src/tokens.css` (152 lines -- 25+ CSS vars, 3 themes, 8 keyframes)
- Prototype UI components: `src/ui.jsx` (337 lines -- 11 components)
- Prototype mascot: `src/mascot.jsx` (85 lines -- BapMascot SVG + BapMini)
- Prototype app shell: `src/app.jsx` (204 lines -- flat router, state, DevNav)
- Design tokens reference: `handoff/number-adventure/project/tokens.css`
- Architecture spec: `docs/prompts/28_define_docs_planning_architecture.md`

## Overview

- **Priority:** P0 -- everything depends on this phase
- **Status:** Pending
- **Description:** Initialize Next.js 14 project, port design tokens to Tailwind, create all shared UI components, set up Prisma + PostgreSQL schema (10 tables), create Docker Compose for local dev, scaffold API route structure, create 3 React Context providers (UI cache only), create static game config data files.

## Key Insights

- Prototype uses global `window.*` assignments -- Next.js uses ES module imports
- All 11 UI components use inline style objects -- convert to Tailwind classes
- BapMascot is pure SVG, no external assets -- port directly
- 3 theme variants (garden/candy/sunny) via CSS `[data-theme]` attribute
- Fonts: Fredoka + Baloo 2 (child), Be Vietnam Pro (parent) -- load via `next/font/google`
- PostgreSQL is source of truth; Context providers are UI cache + session state only
- Static game config lives in `src/data/game-config/` (not DB) -- worlds, game types, lesson templates, skills, sticker defs

## Requirements

### Functional
- Next.js 14 project with App Router, TypeScript strict, Tailwind CSS
- All design tokens from `src/tokens.css` available as Tailwind classes
- All 11 UI components + BapMascot ported to typed React components
- Prisma schema with 10 tables: Parent, Child, ChildSettings, Lesson, GameSession, GameAttempt, AIQuestion, Sticker, ChildSticker, Streak
- Docker Compose: PostgreSQL 16 + Next.js app (dev mode)
- API route scaffold: `/api/auth/*`, `/api/children`, `/api/worlds`, `/api/lessons/*`, `/api/sessions/*`, `/api/ai/*`, `/api/progress/*`, `/api/report/*`, `/api/streaks/*`, `/api/stickers/*`
- 3 Context providers: GameProgressContext (UI cache), AudioContext (stub), ThemeContext
- Static game config in `src/data/game-config/`
- Root layout with font loading and provider wrapping
- Redirect `/` to `/home`

### Non-functional
- TypeScript strict mode, no `any` types
- Each component file under 200 lines
- All components export typed props interfaces
- Prisma migrations runnable with `npx prisma migrate dev`

## Architecture

```
app/
  layout.tsx              -- Root layout (providers, fonts, metadata)
  page.tsx                -- Redirect to /home
  globals.css             -- CSS custom properties from tokens.css
  api/
    auth/
      login/route.ts      -- POST /api/auth/login
      register/route.ts   -- POST /api/auth/register
    children/route.ts     -- GET/POST /api/children
    worlds/route.ts       -- GET /api/worlds (reads static config)
    lessons/
      [lessonId]/route.ts -- GET /api/lessons/:lessonId
    sessions/
      route.ts            -- POST /api/sessions (start)
      [id]/
        route.ts          -- PATCH /api/sessions/:id (complete)
        attempts/route.ts -- POST /api/sessions/:id/attempts
    ai/
      generate-questions/route.ts -- POST /api/ai/generate-questions
    progress/
      [childId]/route.ts  -- GET /api/progress/:childId
    report/
      [childId]/route.ts  -- GET /api/report/:childId
    streaks/
      [childId]/route.ts  -- GET/POST /api/streaks/:childId
    stickers/
      [childId]/route.ts  -- GET /api/stickers/:childId

components/
  ui/
    num-tile.tsx, big-button.tsx, icon-btn.tsx, progress-bar.tsx,
    card.tsx, star-row.tsx, garden-bg.tsx, speaker-icon.tsx,
    sparkles.tsx, confetti.tsx, tag.tsx, bap-mascot.tsx, toggle.tsx,
    streak-card.tsx

lib/
  types/
    common.ts             -- Shared types
    api.ts                -- API request/response types
  utils/
    cn.ts                 -- className merge utility
  prisma.ts               -- Prisma client singleton

context/
  game-progress-context.tsx  -- UI cache + session state (NOT source of truth)
  audio-context.tsx          -- Stub for Phase D
  theme-context.tsx          -- Theme switching
  providers.tsx              -- Composite provider wrapper

src/
  data/
    game-config/
      worlds.ts           -- World definitions (static)
      game-types.ts       -- Game type definitions (static)
      lesson-templates.ts -- Lesson template configs (static)
      skills.ts           -- Skill definitions (static)
      sticker-defs.ts     -- Sticker definitions (static)

prisma/
  schema.prisma           -- 10 tables

docker-compose.yml        -- PostgreSQL 16 + app
.env.example              -- DB URL, AI endpoint
tailwind.config.ts        -- Extended theme with all design tokens
```

## Related Code Files

### Files to Create

| File | Source | Lines Est. |
|------|--------|-----------|
| `app/layout.tsx` | new | 60 |
| `app/page.tsx` | new | 10 |
| `app/globals.css` | `src/tokens.css` | 150 |
| `tailwind.config.ts` | new, maps tokens.css vars | 120 |
| `prisma/schema.prisma` | new | 180 |
| `lib/prisma.ts` | new | 15 |
| `docker-compose.yml` | new | 30 |
| `.env.example` | new | 10 |
| `components/ui/num-tile.tsx` | `src/ui.jsx` lines 4-73 | 90 |
| `components/ui/big-button.tsx` | `src/ui.jsx` lines 76-127 | 80 |
| `components/ui/icon-btn.tsx` | `src/ui.jsx` lines 130-160 | 50 |
| `components/ui/progress-bar.tsx` | `src/ui.jsx` lines 163-188 | 45 |
| `components/ui/card.tsx` | `src/ui.jsx` lines 191-209 | 35 |
| `components/ui/star-row.tsx` | `src/ui.jsx` lines 212-228 | 35 |
| `components/ui/garden-bg.tsx` | `src/ui.jsx` lines 231-247 | 40 |
| `components/ui/speaker-icon.tsx` | `src/ui.jsx` lines 250-258 | 25 |
| `components/ui/sparkles.tsx` | `src/ui.jsx` lines 261-284 | 50 |
| `components/ui/confetti.tsx` | `src/ui.jsx` lines 287-309 | 45 |
| `components/ui/tag.tsx` | `src/ui.jsx` lines 312-331 | 30 |
| `components/ui/bap-mascot.tsx` | `src/mascot.jsx` full | 100 |
| `components/ui/toggle.tsx` | `src/screens-reward-parent.jsx` lines 339-350 | 30 |
| `components/ui/streak-card.tsx` | new (from StreakScreen pattern) | 60 |
| `lib/types/common.ts` | new | 80 |
| `lib/types/api.ts` | new | 60 |
| `lib/utils/cn.ts` | new | 10 |
| `context/game-progress-context.tsx` | new (UI cache only) | 100 |
| `context/audio-context.tsx` | new (stub) | 40 |
| `context/theme-context.tsx` | new | 50 |
| `context/providers.tsx` | new | 30 |
| `src/data/game-config/worlds.ts` | `src/screens-home.jsx` L132-138 | 50 |
| `src/data/game-config/game-types.ts` | new | 40 |
| `src/data/game-config/lesson-templates.ts` | new | 60 |
| `src/data/game-config/skills.ts` | new | 30 |
| `src/data/game-config/sticker-defs.ts` | `src/app.jsx` L5-12 | 40 |
| API route files (11 files) | new | ~30 each |

## Implementation Steps

### Step 1: Project Initialization

1. Check if `package.json` exists. If not, run from project root:
   ```bash
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
   ```
   If project already exists, verify `next`, `typescript`, `tailwindcss` are in dependencies.

2. Install additional dependencies:
   ```bash
   npm install framer-motion clsx tailwind-merge @prisma/client
   npm install -D prisma @types/node
   ```

3. Verify `tsconfig.json` has `"strict": true`.

### Step 2: Docker Compose + Environment

1. Create `docker-compose.yml`:
   ```yaml
   version: '3.8'
   services:
     db:
       image: postgres:16-alpine
       ports:
         - '5432:5432'
       environment:
         POSTGRES_USER: bap
         POSTGRES_PASSWORD: bap_dev_pass
         POSTGRES_DB: bap_number_adventure
       volumes:
         - pgdata:/var/lib/postgresql/data
     app:
       build: .
       ports:
         - '3000:3000'
       environment:
         DATABASE_URL: postgresql://bap:bap_dev_pass@db:5432/bap_number_adventure
         AI_ENDPOINT: https://9router.remotestaff.vn/v1
         AI_MODEL: advance-model
       depends_on:
         - db
   volumes:
     pgdata:
   ```

2. Create `.env.example`:
   ```
   DATABASE_URL=postgresql://bap:bap_dev_pass@localhost:5432/bap_number_adventure
   AI_ENDPOINT=https://9router.remotestaff.vn/v1
   AI_MODEL=advance-model
   AI_API_KEY=<your-api-key>
   ```

3. Create `.env` (gitignored) with same values for local dev.

4. Verify `.env` is in `.gitignore` (never commit secrets):
   ```bash
   grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore
   ```

### Step 3: Prisma Schema

Create `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Parent {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  pinHash      String?  // bcrypt hashed 4-digit parent gate
  name         String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  children     Child[]
}

model Child {
  id           String         @id @default(cuid())
  name         String
  age          Int
  color        String         @default("sage")
  parentId     String
  parent       Parent         @relation(fields: [parentId], references: [id])
  settings     ChildSettings?
  sessions     GameSession[]
  stickers     ChildSticker[]
  streak       Streak?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}

model ChildSettings {
  id          String @id @default(cuid())
  childId     String @unique
  child       Child  @relation(fields: [childId], references: [id])
  dailyMin    Int    @default(15)
  quietHours  Boolean @default(false)
  difficulty  String @default("easy")
  kidLang     String @default("en")
  parentLang  String @default("vi")
  sfx         Boolean @default(true)
  music       Boolean @default(true)
  voice       Boolean @default(true)
  voiceStyle  String @default("Friendly")
}

model Lesson {
  id        String        @id @default(cuid())
  worldId   String
  gameType  String
  order     Int
  title     String
  difficulty String       @default("easy")
  sessions  GameSession[]
  questions AIQuestion[]
  createdAt DateTime      @default(now())
}

model GameSession {
  id          String        @id @default(cuid())
  childId     String
  child       Child         @relation(fields: [childId], references: [id])
  lessonId    String
  lesson      Lesson        @relation(fields: [lessonId], references: [id])
  status      String        @default("in_progress")
  stars       Int           @default(0)
  startedAt   DateTime      @default(now())
  completedAt DateTime?
  attempts    GameAttempt[]
}

model GameAttempt {
  id         String      @id @default(cuid())
  sessionId  String
  session    GameSession @relation(fields: [sessionId], references: [id])
  questionId String?
  question   AIQuestion? @relation(fields: [questionId], references: [id])
  answer     String
  correct    Boolean
  timeMs     Int         @default(0)
  createdAt  DateTime    @default(now())
}

model AIQuestion {
  id         String        @id @default(cuid())
  lessonId   String
  lesson     Lesson        @relation(fields: [lessonId], references: [id])
  gameType   String
  payload    Json
  difficulty String        @default("easy")
  attempts   GameAttempt[]
  createdAt  DateTime      @default(now())
}

model Sticker {
  id       String         @id @default(cuid())
  emoji    String
  name     String
  worldId  String
  rarity   String         @default("common")
  children ChildSticker[]
}

model ChildSticker {
  id        String   @id @default(cuid())
  childId   String
  child     Child    @relation(fields: [childId], references: [id])
  stickerId String
  sticker   Sticker  @relation(fields: [stickerId], references: [id])
  earnedAt  DateTime @default(now())

  @@unique([childId, stickerId])
}

model Streak {
  id           String   @id @default(cuid())
  childId      String   @unique
  child        Child    @relation(fields: [childId], references: [id])
  currentStreak Int     @default(0)
  longestStreak Int     @default(0)
  lastPlayDate DateTime?
  updatedAt    DateTime @updatedAt
}
```

Run migration:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Step 4: Prisma Client Singleton

Create `lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Step 5: Design Tokens (globals.css + tailwind.config.ts)

1. Copy all `:root` CSS custom properties from `src/tokens.css` into `app/globals.css`.
2. Copy `[data-theme="candy"]` and `[data-theme="sunny"]` blocks.
3. Copy all `@keyframes` (bobble, pop-in, wiggle, sparkle, slide-up, confetti-fall, pulse-soft, shimmer).
4. Copy utility classes (`.no-select`, `.scroll`, `.bobble`, `.pop-in`, `.wiggle`, `.pulse-soft`).
5. Add Tailwind directives at top: `@tailwind base; @tailwind components; @tailwind utilities;`

6. In `tailwind.config.ts`, extend theme:
   ```typescript
   colors: {
     cream: { DEFAULT: 'var(--cream)', 2: 'var(--cream-2)' },
     parchment: 'var(--parchment)',
     sage: { DEFAULT: 'var(--sage)', ink: 'var(--sage-ink)' },
     forest: 'var(--forest)',
     sky: { DEFAULT: 'var(--sky)', ink: 'var(--sky-ink)' },
     lavender: { DEFAULT: 'var(--lavender)', ink: 'var(--lavender-ink)' },
     sun: { DEFAULT: 'var(--sun)', ink: 'var(--sun-ink)' },
     coral: { DEFAULT: 'var(--coral)', ink: 'var(--coral-ink)' },
     berry: { DEFAULT: 'var(--berry)', ink: 'var(--berry-ink)' },
     ink: { DEFAULT: 'var(--ink)', soft: 'var(--ink-soft)', faint: 'var(--ink-faint)' },
     surface: { DEFAULT: 'var(--surface)', 2: 'var(--surface-2)' },
     card: 'var(--card)',
     correct: 'var(--correct)',
     'gentle-miss': 'var(--gentle-miss)',
   },
   borderRadius: {
     sm: 'var(--r-sm)', md: 'var(--r-md)', lg: 'var(--r-lg)',
     xl: 'var(--r-xl)', pill: 'var(--r-pill)',
   },
   boxShadow: {
     card: 'var(--shadow-card)', pop: 'var(--shadow-pop)', tile: 'var(--shadow-tile)',
   },
   fontFamily: {
     kid: ['var(--font-kid)'], num: ['var(--font-num)'], parent: ['var(--font-parent)'],
   },
   ```

### Step 6: Shared Types

Create `lib/types/common.ts` with all shared types (ThemeColor, TileColor, ButtonColor, TileSize, etc.) -- same as old plan but add DB-aligned types:
```typescript
// ... existing types (ThemeColor, TileState, MascotMood, etc.) ...

export type GameType = 'hear-tap' | 'build-number' | 'even-odd' | 'number-order' | 'add-take';
export type WorldId = 'number-garden' | 'counting-castle' | 'even-odd-house' | 'number-sequence' | 'math-kitchen';
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';
```

Create `lib/types/api.ts`:
```typescript
export interface CreateSessionRequest {
  childId: string;
  lessonId: string;
}
export interface CompleteSessionRequest {
  stars: number;
}
export interface SubmitAttemptRequest {
  questionId?: string;
  answer: string;
  correct: boolean;
  timeMs?: number;
}
export interface GenerateQuestionsRequest {
  lessonId: string;
  gameType: string;
  difficulty: string;
  count?: number;
}
export interface GenerateQuestionsResponse {
  questions: Array<{ id: string; payload: Record<string, unknown> }>;
}
```

### Step 7: Utility

Create `lib/utils/cn.ts`:
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Step 8: Static Game Config

Create `src/data/game-config/worlds.ts`:
```typescript
import type { WorldId } from '@/lib/types/common';

export interface WorldConfig {
  id: WorldId;
  name: string;
  subtitle: string;
  color: string;
  emoji: string;
  gameTypes: string[];
  lessonCount: number;
  unlockOrder: number;
}

export const WORLDS: WorldConfig[] = [
  { id: 'number-garden', name: 'Number Garden', subtitle: 'Tens & ones', color: 'sage', emoji: '🌻', gameTypes: ['hear-tap', 'build-number'], lessonCount: 9, unlockOrder: 0 },
  { id: 'counting-castle', name: 'Counting Castle', subtitle: 'Number sequences', color: 'lavender', emoji: '🏰', gameTypes: ['number-order'], lessonCount: 9, unlockOrder: 1 },
  { id: 'even-odd-house', name: 'Even-Odd House', subtitle: 'Even & odd numbers', color: 'sky', emoji: '🏠', gameTypes: ['even-odd'], lessonCount: 9, unlockOrder: 2 },
  { id: 'number-sequence', name: 'Number Sequence', subtitle: 'Patterns & series', color: 'sun', emoji: '🔢', gameTypes: ['number-order'], lessonCount: 9, unlockOrder: 3 },
  { id: 'math-kitchen', name: 'Math Kitchen', subtitle: 'Add & subtract', color: 'coral', emoji: '🍳', gameTypes: ['add-take'], lessonCount: 9, unlockOrder: 4 },
];
```

Create `src/data/game-config/game-types.ts`, `lesson-templates.ts`, `skills.ts`, `sticker-defs.ts` with typed exports matching the game structure.

### Step 9: Port UI Components

Same as old plan Step 5, with addition of `StreakCard`:

**StreakCard** (`components/ui/streak-card.tsx`): New component (no separate StreakScreen route).
- Props: `{ currentStreak: number; longestStreak: number; weekData?: boolean[] }`
- Shows fire emoji, streak count, 7-day dot calendar
- Reused in HomeScreen, ParentDashboard, RewardScreen

All other components: NumTile, BigButton, IconBtn, ProgressBar, Card, StarRow, GardenBg, SpeakerIcon, Sparkles, Confetti, Tag, BapMascot, Toggle -- ported identically from prototype using Tailwind classes.

### Step 10: Context Providers (UI Cache Only)

**GameProgressContext** (`context/game-progress-context.tsx`):
- State shape: `{ childId: string | null; profile: Profile | null; settings: Settings; currentWorldId: WorldId | null }`
- Actions: `SET_CHILD`, `SET_PROFILE`, `UPDATE_SETTINGS`, `SET_WORLD`
- localStorage: write-through cache. On mount, load from localStorage for instant display; fetch from DB to reconcile.
- **NOT source of truth** -- all writes go through API endpoints, then update local state.

**AudioContext** (`context/audio-context.tsx`):
- Stub for Phase D -- provides `{ sfxEnabled: boolean; musicEnabled: boolean; voiceEnabled: boolean; voiceStyle: string; kidLang: string; speak: (n: number) => void }`
- `speak()` wraps `window.speechSynthesis` as placeholder

**ThemeContext** (`context/theme-context.tsx`):
- State: `{ theme: 'garden' | 'candy' | 'sunny'; setTheme: (t) => void }`
- On theme change, set `document.documentElement.setAttribute('data-theme', theme)`

**Providers** (`context/providers.tsx`):
- Wrap children in `ThemeProvider > AudioProvider > GameProgressProvider`

### Step 11: API Route Scaffold

Create API route files with basic structure. Each route file exports the appropriate HTTP method handlers (`GET`, `POST`, `PATCH`). Phase A creates the files with input validation and empty/stub responses. Phase B and C fill in the real logic.

Example `app/api/sessions/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // TODO: implement in Phase B
    return NextResponse.json({ message: 'not implemented' }, { status: 501 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Step 12: Root Layout + Entry Page

**`app/layout.tsx`:**
- Import Fredoka, Baloo_2, Be_Vietnam_Pro from `next/font/google`
- Import `globals.css`
- Import `Providers` from `context/providers.tsx`
- Set metadata: `title: 'Bap Number Adventure'`, viewport mobile-first
- Wrap `{children}` in `<Providers>`
- Apply font CSS variables to `<html>` or `<body>`

**`app/page.tsx`:**
- `redirect('/home')` from `next/navigation`

### Step 13: Verify Build

```bash
docker-compose up -d db
npx prisma migrate dev --name init
npx prisma generate
npm run build
```
Must compile with zero errors. Database must accept connections.

## Todo List

- [ ] Initialize Next.js 14 project or verify existing setup
- [ ] Install deps (framer-motion, clsx, tailwind-merge, @prisma/client, prisma)
- [ ] Create `docker-compose.yml` + `.env.example` + `.env`
- [ ] Create `prisma/schema.prisma` with 10 tables
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Create `lib/prisma.ts`
- [ ] Create `app/globals.css` with all tokens, keyframes, utilities
- [ ] Create `tailwind.config.ts` with full theme extension
- [ ] Create `lib/types/common.ts` + `lib/types/api.ts`
- [ ] Create `lib/utils/cn.ts`
- [ ] Create `src/data/game-config/worlds.ts`
- [ ] Create `src/data/game-config/game-types.ts`
- [ ] Create `src/data/game-config/lesson-templates.ts`
- [ ] Create `src/data/game-config/skills.ts`
- [ ] Create `src/data/game-config/sticker-defs.ts`
- [ ] Port all 13 UI components + StreakCard (14 files total)
- [ ] Create `context/game-progress-context.tsx` (UI cache)
- [ ] Create `context/audio-context.tsx` (stub)
- [ ] Create `context/theme-context.tsx`
- [ ] Create `context/providers.tsx`
- [ ] Scaffold 11 API route files (stub responses)
- [ ] Create `app/layout.tsx` + `app/page.tsx`
- [ ] Run `npm run build` -- zero errors
- [ ] Verify DB connection with `npx prisma studio`

## Acceptance Criteria

1. `npm run build` completes with zero TypeScript errors
2. `docker-compose up -d db` starts PostgreSQL and `npx prisma migrate dev` succeeds
3. `npx prisma studio` opens and shows all 10 tables
4. `npm run dev` starts and `/` redirects to `/home` (404 OK since page not created yet)
5. Every UI component has typed props interface exported
6. All 25+ CSS custom properties from `src/tokens.css` present in `globals.css`
7. All 3 theme variants (garden/candy/sunny) work via `data-theme` attribute
8. GameProgressContext reads/writes localStorage as cache
9. ThemeContext sets `data-theme` on `<html>` element
10. All API route files respond (even if 501 stub)
11. Static game config files export typed data
12. Each file under 200 lines

## Dependencies

- None -- this is the foundation phase

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Tailwind can't express all inline dynamic styles | Medium | Medium | Keep color maps as const objects, use style prop for computed values |
| Font loading differences between CDN and next/font | Low | Low | Test font rendering, fallback stack matches prototype |
| localStorage SSR mismatch (hydration error) | High | Medium | Use `useEffect` for localStorage reads, not `useState` initializer |
| PostgreSQL connection fails in Docker | Low | High | Test docker-compose locally, provide fallback .env for direct connection |
| Prisma schema migration conflicts | Low | Medium | Single initial migration, no incremental changes in Phase A |

## Security Considerations

- `.env` with DB credentials is gitignored
- API routes have try/catch error handling (no stack traces in responses)
- No real auth yet (scaffold only) -- real auth implemented in Phase B/C
- Parent gate is client-side math challenge -- not true security, by design

## Next Steps

- Phase B: Child screens + game engine + API integration (depends on this phase)
- Phase C: Parent area + report + settings API (depends on this phase, parallel with B)

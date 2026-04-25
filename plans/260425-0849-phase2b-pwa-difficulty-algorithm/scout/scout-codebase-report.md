# Scout Report: Codebase Inventory (Phase 2B PWA + Difficulty)

Date: 2026-04-25 | Focus: PWA compatibility, session/progress endpoints, difficulty tracking

---

## 1. next.config.ts

**File**: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/next.config.ts`

```typescript
// Lines 1-24 (full file)
import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

**Status**: ✅ PWA-ready. No PWA-specific config yet (no manifest handler, sw routes). Standalone mode supports self-contained deployment.

---

## 2. prisma/schema.prisma (GameSession, GameAttempt, ChildSettings)

**File**: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/prisma/schema.prisma`

**ChildSettings** (lines 40–54):
```prisma
model ChildSettings {
  id         String  @id @default(cuid())
  childId    String  @unique
  dailyMin   Int     @default(15)
  difficulty String  @default("easy")  // easy | medium | hard
  kidLang    String  @default("en")    // en | vi
  parentLang String  @default("vi")
  sfx        Boolean @default(true)
  music      Boolean @default(true)
  voice      Boolean @default(true)
  voiceStyle String  @default("Friendly")
  quietHours Boolean @default(false)

  child Child @relation(fields: [childId], references: [id], onDelete: Cascade)
}
```

**GameSession** (lines 69–84):
```prisma
model GameSession {
  id          String    @id @default(cuid())
  childId     String
  lessonId    String
  status      String    @default("in_progress") // in_progress | completed | abandoned
  stars       Int       @default(0)
  startedAt   DateTime  @default(now())
  completedAt DateTime?

  child    Child         @relation(fields: [childId], references: [id], onDelete: Cascade)
  lesson   Lesson        @relation(fields: [lessonId], references: [id])
  attempts GameAttempt[]

  @@index([childId])
  @@index([lessonId])
}
```

**GameAttempt** (lines 86–99):
```prisma
model GameAttempt {
  id         String   @id @default(cuid())
  sessionId  String
  questionId String?
  answer     String
  correct    Boolean
  timeMs     Int      @default(0)
  createdAt  DateTime @default(now())

  session  GameSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  question AIQuestion? @relation(fields: [questionId], references: [id])

  @@index([sessionId])
}
```

**Key Points**:
- `difficulty` is **string enum** (easy|medium|hard), not structured type
- GameSession tracks **stars** (0–3 assumed) per session
- GameAttempt stores **correct boolean** + **timeMs** — enough for adaptive logic
- No "difficulty adjustment" field in session (immutable from lesson)

---

## 3. app/api/sessions/route.ts

**File**: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/app/api/sessions/route.ts`

```typescript
// Full file (lines 1–25)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/** POST /api/sessions — start a new game session */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { childId?: string; lessonId?: string };
    const { childId, lessonId } = body;

    if (!childId || !lessonId) {
      return NextResponse.json({ error: 'childId and lessonId are required' }, { status: 400 });
    }

    const session = await prisma.gameSession.create({
      data: { childId, lessonId, status: 'in_progress' },
    });

    return NextResponse.json({ sessionId: session.id }, { status: 201 });
  } catch (e) {
    console.error('[api/sessions POST] Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Key Points**:
- Returns only `sessionId` (no difficulty info)
- Creates immutable session linked to lesson (no per-session difficulty override)
- Guest users handled in `useGameSession` hook (Phase B local-only pattern)

---

## 4. app/api/progress/[childId]/route.ts

**File**: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/app/api/progress/[childId]/route.ts`

```typescript
// Lines 1–35 (relevant core logic)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WORLDS } from '@/src/data/game-config/worlds';
import { getLessonsForWorld } from '@/src/data/game-config/lesson-templates';

type Params = { params: Promise<{ childId: string }> };

/** GET /api/progress/:childId — world-level progress summary */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { childId } = await params;

    // Get all completed sessions for this child
    const sessions = await prisma.gameSession.findMany({
      where: { childId, status: 'completed' },
      include: { lesson: true },
    });

    // Build per-world progress
    const worldProgress = WORLDS.map((world, idx) => {
      const worldLessons = getLessonsForWorld(world.id as Parameters<typeof getLessonsForWorld>[0]);
      const lessonIds = new Set(worldLessons.map((l) => l.id));

      // Best stars per lesson
      const starsByLesson: Record<string, number> = {};
      for (const session of sessions) {
        if (lessonIds.has(session.lessonId)) {
          const prev = starsByLesson[session.lessonId] ?? 0;
          if (session.stars > prev) starsByLesson[session.lessonId] = session.stars;
        }
      }

      const completedLessons = Object.keys(starsByLesson).length;
      const totalStars = Object.values(starsByLesson).reduce((s, n) => s + n, 0);
      const maxStars = worldLessons.length * 3;
```

**Continued** (lines 36–81):
```typescript
      // Unlock rule: first world always unlocked; subsequent worlds unlock when prev has >= 5 completed lessons
      const unlocked = idx === 0 || (() => {
        const prevWorld = WORLDS[idx - 1];
        const prevLessons = getLessonsForWorld(prevWorld.id as Parameters<typeof getLessonsForWorld>[0]);
        const prevIds = new Set(prevLessons.map((l) => l.id));
        const prevCompleted = sessions.filter(
          (s) => prevIds.has(s.lessonId) && s.stars > 0,
        );
        const uniquePrev = new Set(prevCompleted.map((s) => s.lessonId));
        return uniquePrev.size >= 5;
      })();

      return {
        worldId: world.id,
        name: world.name,
        color: world.color,
        bg: world.bg,
        emoji: world.emoji,
        unlocked,
        completedLessons,
        totalLessons: worldLessons.length,
        totalStars,
        maxStars,
        starsByLesson,
      };
    });

    // Weekly activity (past 7 days)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentSessions = sessions.filter((s) => s.completedAt && s.completedAt >= weekAgo);
    const activeDays = new Set(
      recentSessions
        .filter((s) => s.completedAt)
        .map((s) => s.completedAt!.toISOString().slice(0, 10)),
    );

    const weekDays: boolean[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      return activeDays.has(d.toISOString().slice(0, 10));
    });

    return NextResponse.json({ worldProgress, weekDays });
  } catch (e) {
    console.error('[api/progress/childId GET] Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Key Points**:
- Aggregates **best stars per lesson** (tracks mastery)
- World unlock rule: **≥5 lessons completed in previous world**
- Weekly activity breakdown for streak/engagement
- No difficulty-based filtering (sessions inherit lesson difficulty)

---

## 5. lib/game-engine/types.ts

**File**: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/lib/game-engine/types.ts`

```typescript
// Full file (lines 1–53)
// Game engine types — pure, no React dependencies

export interface HearTapQuestion {
  target: number;
  options: number[];
}

export interface BuildNumberQuestion {
  target: number;
}

export interface EvenOddQuestion {
  number: number;
  isEven: boolean;
}

export interface NumberOrderQuestion {
  seq: number[];
  hideIdx: number;
  target: number;
  options: number[];
}

export interface AddTakeQuestion {
  a: number;
  b: number;
  op: '+' | '-';
  target: number;
  options: number[];
}

export type AnyQuestion =
  | HearTapQuestion
  | BuildNumberQuestion
  | EvenOddQuestion
  | NumberOrderQuestion
  | AddTakeQuestion;

// Canonical definition lives in lib/types/common — re-exported here for convenience
export type { GameType } from '@/lib/types/common';

export interface GameState {
  round: number;
  hearts: number;
  totalRounds: number;
}

export interface GameResult {
  stars: number;
  correct: number;
  total: number;
}
```

**Key Points**:
- 5 game types defined (hear-tap, build-number, even-odd, number-order, add-take)
- Questions store **target + options** (for adaptive generation)
- GameState tracks **hearts** (lives system)
- No difficulty adjustment in question types (immutable structure)

---

## 6. lib/hooks/use-game-session.ts

**File**: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/lib/hooks/use-game-session.ts`

```typescript
// Full file (lines 1–82)
'use client';

import { useState, useCallback } from 'react';

interface SubmitAttemptRequest {
  questionId?: string;
  answer: string;
  correct: boolean;
  timeMs?: number;
}

interface SessionResult {
  session: { id: string; stars: number };
  streak: { currentStreak: number; longestStreak: number };
  sticker?: { id: string; emoji: string; name: string } | null;
}

/** Manages game session lifecycle: start → attempts → complete */
export function useGameSession(childId: string, lessonId: string) {
  const [sessionId, setSessionId] = useState<string | null>(null);

  const startSession = useCallback(async (): Promise<string | null> => {
    // Guest users (Phase B local-only) skip DB session creation to avoid FK violations.
    // Phase C will wire real auth and remove this guard.
    if (childId.startsWith('guest_')) return null;

    // Clear stale session ID from previous game before setting a new one
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('currentSessionId');
    }
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, lessonId }),
      });
      if (!res.ok) return null;
      const data = await res.json() as { sessionId: string };
      setSessionId(data.sessionId);
      // Persist in case of refresh
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('currentSessionId', data.sessionId);
      }
      return data.sessionId;
    } catch {
      return null;
    }
  }, [childId, lessonId]);

  const submitAttempt = useCallback(async (attempt: SubmitAttemptRequest): Promise<void> => {
    const sid = sessionId ?? sessionStorage.getItem('currentSessionId');
    if (!sid) return;
    try {
      await fetch(`/api/sessions/${sid}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attempt),
      });
    } catch {
      // Non-critical: attempt tracking failure shouldn't break gameplay
    }
  }, [sessionId]);

  const completeSession = useCallback(async (stars: number): Promise<SessionResult | null> => {
    const sid = sessionId ?? sessionStorage.getItem('currentSessionId');
    if (!sid) return null;
    try {
      const res = await fetch(`/api/sessions/${sid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars }),
      });
      if (!res.ok) return null;
      sessionStorage.removeItem('currentSessionId');
      return res.json() as Promise<SessionResult>;
    } catch {
      return null;
    }
  }, [sessionId]);

  return { sessionId, startSession, submitAttempt, completeSession };
}
```

**Key Points**:
- **Phase B guard**: Guest users (`guest_*`) skip DB session creation
- Session ID persisted in **sessionStorage** (survives page refresh)
- Tracks **timeMs** per attempt (for difficulty decision)
- `completeSession` returns **streak data** (ready for social features)
- Attempt failures are non-critical (don't block gameplay)

---

## 7. context/game-progress-context.tsx (first 60 lines)

**File**: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/context/game-progress-context.tsx`

```typescript
// Lines 1–60
'use client';

import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { ChildProfile, ChildSettings, WorldId } from '@/lib/types/common';

// ── State shape ──────────────────────────────────────────────
interface GameProgressState {
  childId: string | null;
  profile: ChildProfile | null;
  settings: Partial<ChildSettings>;
  currentWorldId: WorldId | null;
  sessionActive: boolean;
}

const INITIAL_STATE: GameProgressState = {
  childId: null,
  profile: null,
  settings: {},
  currentWorldId: null,
  sessionActive: false,
};

// ── Actions ──────────────────────────────────────────────────
type Action =
  | { type: 'SET_CHILD'; payload: { childId: string; profile: ChildProfile } }
  | { type: 'SET_PROFILE'; payload: ChildProfile }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<ChildSettings> }
  | { type: 'SET_WORLD'; payload: WorldId | null }
  | { type: 'SET_SESSION_ACTIVE'; payload: boolean }
  | { type: 'CLEAR' };

function reducer(state: GameProgressState, action: Action): GameProgressState {
  switch (action.type) {
    case 'SET_CHILD':
      return { ...state, childId: action.payload.childId, profile: action.payload.profile };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_WORLD':
      return { ...state, currentWorldId: action.payload };
    case 'SET_SESSION_ACTIVE':
      return { ...state, sessionActive: action.payload };
    case 'CLEAR':
      return INITIAL_STATE;
    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────
interface GameProgressContextValue {
  state: GameProgressState;
  setChild: (childId: string, profile: ChildProfile) => void;
  setProfile: (profile: ChildProfile) => void;
  updateSettings: (settings: Partial<ChildSettings>) => void;
  setWorld: (worldId: WorldId | null) => void;
  setSessionActive: (active: boolean) => void;
  clear: () => void;
}
```

**Key Points**:
- State shape includes `settings` (for difficulty tracking)
- `sessionActive` flag supports pause/resume logic
- Reducer pattern allows easy integration with difficulty state changes

---

## 8. public/ directory

**File**: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/public/`

```
total 40
-rw-r--r--  file.svg       (391 bytes)
-rw-r--r--  globe.svg      (1035 bytes)
-rw-r--r--  next.svg       (1375 bytes)
-rw-r--r--  vercel.svg     (385 bytes)
-rw-r--r--  window.svg     (128 bytes)
```

**Status**: ❌ **MISSING PWA files**
- No `manifest.json` (PWA metadata)
- No `sw.js` or service worker
- No app icons (no favicon.ico found)
- Needs icons for: apple-touch-icon, android icons (192px, 512px)

---

## 9. package.json (dependencies section)

**File**: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/package.json`

```json
{
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "bcryptjs": "^3.0.3",
    "clsx": "^2.1.1",
    "framer-motion": "^12.38.0",
    "next": "16.2.4",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "tailwind-merge": "^3.5.0"
  }
}
```

**Status**: ✅ No PWA library installed (ready for workbox/next-pwa integration)
- Next 16.2.4 has built-in PWA support
- No conflicts with existing deps

---

## 10. app/layout.tsx (viewport/metadata section, first 40 lines)

**File**: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/app/layout.tsx`

```typescript
// Lines 1–40
import type { Metadata, Viewport } from 'next';
import { Fredoka, Baloo_2, Be_Vietnam_Pro } from 'next/font/google';
import { Providers } from '@/context/providers';
import './globals.css';

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
});

const baloo2 = Baloo_2({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-baloo2',
  display: 'swap',
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bắp Number Adventure',
  description: 'Fun number learning game for kids',
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};
```

**Status**: ✅ PWA-ready viewport + metadata structure
- ❌ No manifest link in metadata
- ❌ No theme-color
- ❌ No apple-mobile-web-app tags
- `viewportFit: 'cover'` good for notch support

---

## API Endpoints Overview

Other discovered routes (available for difficulty/progress tracking):
- `POST /api/sessions` — create session ✓ (reviewed)
- `PATCH /api/sessions/[id]` — update session (stars, status)
- `POST /api/sessions/[id]/attempts` — log attempt
- `GET /api/progress/[childId]` — world/lesson progress ✓ (reviewed)
- `GET /api/lessons/[lessonId]` — fetch lesson config
- `PATCH /api/children/[id]/settings` — update difficulty + lang
- `GET /api/report/[childId]` — child performance report
- `GET /api/streaks/[childId]` — streak tracking

---

## Summary

**PWA Readiness**:
- ✅ Next.js config supports standalone output
- ✅ Viewport metadata configured correctly
- ✅ Layout structure ready for manifest/icons
- ❌ Missing: manifest.json, service worker, app icons

**Difficulty Algorithm Ready**:
- ✅ ChildSettings stores difficulty (easy|medium|hard)
- ✅ GameAttempt logs timeMs + correct/incorrect
- ✅ Progress API tracks stars per lesson (mastery signal)
- ✅ Session immutable once created (integrity)
- ⚠️ No dynamic difficulty adjustment fields (can be added to Lesson or Question payload)

**Session Tracking**:
- ✅ useGameSession hook manages lifecycle with sessionStorage backup
- ✅ Guest mode guard for Phase B (local-only)
- ✅ Attempt logging non-critical (resilient)
- ✅ Complete callback returns streak data

**Next Steps for Phase 2B**:
1. Create `public/manifest.json` + PWA metadata
2. Implement service worker (offline support)
3. Add icon assets (192px, 512px, favicon)
4. Extend Lesson/AIQuestion with difficulty adjustment strategy
5. Create difficulty adapter in game-engine to mutate question params based on accuracy

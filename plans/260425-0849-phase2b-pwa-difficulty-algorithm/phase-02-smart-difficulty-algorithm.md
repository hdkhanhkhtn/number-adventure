# Phase 02 -- Smart Difficulty Algorithm (Sliding Window Accuracy)

## Context Links

- Parent plan: `plans/260425-0849-phase2b-pwa-difficulty-algorithm/plan.md`
- Research: `plans/260425-0849-phase2b-pwa-difficulty-algorithm/research/researcher-difficulty-algorithm.md`
- Scout: `plans/260425-0849-phase2b-pwa-difficulty-algorithm/scout/scout-codebase-report.md`
- Phase 2A dependency: `plans/260425-0849-phase2a-audio-difficulty-worlds-api/phase-02-difficulty-auto-adjust.md`
- Depends on: Phase 2A's `DifficultyProfile` model + `POST /api/sessions/complete` endpoint

## Overview

- **Priority:** P1
- **Status:** pending
- **Parallel with:** Phase 01 (PWA) -- fully independent
- **Description:** Implement sliding-window accuracy algorithm (N=10 attempts) per (childId, gameType) that adjusts difficulty band (easy/medium/hard). Extends Phase 2A's `DifficultyProfile` table with new columns. Anti-oscillation via 1-session cooldown + 2-consecutive-trigger requirement. SM-2 `easeFactor` acts as promotion veto. Parent `ChildSettings.difficulty` remains hard ceiling.

## Key Insights

- Sliding window (N=10 attempts) is superior to session averages for ages 4-7: session lengths are variable (2-15 questions), and session averages dilute recency signal.
- ZPD-based thresholds: easy->medium at 80%, medium->hard at 85%, hard->medium at 55%, medium->easy at 50%.
- Anti-oscillation requires BOTH cooldown (1 session after any change) AND consecutive confirmation (2 windows trigger before promotion).
- SM-2 `easeFactor` (from Phase 2A) acts as a slow-loop veto: if easeFactor < 1.5, child is struggling to retain long-term, so block promotion even if recent accuracy is high.
- Minimum data gate: 10 completed attempts AND 2 distinct completed sessions before any adjustment fires.
- Guest users (`childId.startsWith('guest_')`) skip algorithm entirely -- use `ChildSettings.difficulty` default.
- `GameSession` has no `gameType` field directly -- it's accessed via `session.lesson.gameType`.

## Requirements

### Functional
- F1: Sliding window computes accuracy over last 10 `GameAttempt` rows per (childId, gameType), ordered by `createdAt DESC`
- F2: Promotion thresholds: easy->medium >= 80%, medium->hard >= 85%
- F3: Demotion thresholds: hard->medium <= 55%, medium->easy <= 50%
- F4: Minimum data gate: >= 10 attempts AND >= 2 distinct completed sessions before first adjustment
- F5: Anti-oscillation cooldown: `bandLockedUntil` set to current session ID after any change; no adjustment fires while lock is active
- F6: Anti-oscillation confirmation: `consecutiveTriggers` must reach 2 before promotion executes
- F7: SM-2 veto: if `DifficultyProfile.easeFactor < 1.5`, block any promotion
- F8: Parent ceiling: `ChildSettings.difficulty` caps auto-adjusted band; never promotes above it
- F9: Extend `DifficultyProfile` with `currentBand`, `windowAccuracy`, `bandLockedUntil`, `consecutiveTriggers`
- F10: Logic fires inside existing `POST /api/sessions/complete` (Phase 2A) after SM-2 update
- F11: `GET /api/children/[childId]/difficulty` returns current band per gameType
- F12: Guest users skip algorithm, use `ChildSettings.difficulty` default

### Non-Functional
- NF1: Prisma migration is additive only (ALTER TABLE ADD COLUMN) on existing `DifficultyProfile` table
- NF2: Sliding window query uses composite index for performance
- NF3: Files under 200 lines each

## Architecture

```
Session completion flow (extended):
  1. Client calls POST /api/sessions/complete { sessionId }
  2. Server: mark session completed (existing)
  3. Server: compute session accuracy from GameAttempts (existing)
  4. Server: run SM-2 update on DifficultyProfile (existing Phase 2A)
  5. Server: [NEW] compute sliding-window accuracy (last 10 attempts)
  6. Server: [NEW] check data gate (>= 10 attempts, >= 2 sessions)
  7. Server: [NEW] check cooldown lock (bandLockedUntil != current session)
  8. Server: [NEW] evaluate thresholds + consecutive triggers
  9. Server: [NEW] check SM-2 veto (easeFactor < 1.5 blocks promotion)
  10. Server: [NEW] apply parent ceiling
  11. Server: [NEW] write updated band + windowAccuracy + triggers
  12. Return: { session, difficulty: { previous, current, accuracy, band } }

Difficulty read flow:
  1. Client calls GET /api/children/[childId]/difficulty
  2. Server: query all DifficultyProfile rows for childId
  3. Return: { profiles: [{ gameType, currentBand, windowAccuracy }] }
```

## Related Code Files

### Files to CREATE

| File | Purpose | Est. Lines |
|------|---------|------------|
| `lib/game-engine/sliding-window-adjuster.ts` | Pure function: compute sliding-window band adjustment | ~90 |
| `app/api/children/[childId]/difficulty/route.ts` | GET endpoint: return current difficulty bands per gameType | ~45 |

### Files to MODIFY

| File | Current Lines | Change |
|------|--------------|--------|
| `prisma/schema.prisma` | ~148 (after Phase 2A) | Add 4 columns to `DifficultyProfile`; add composite index on `GameAttempt` |
| `app/api/sessions/complete/route.ts` | ~95 (Phase 2A creates this) | Add sliding-window logic after SM-2 update |

## Implementation Steps

### Step 1: Extend `DifficultyProfile` in Prisma schema

Path: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/prisma/schema.prisma`

Phase 2A creates this model with these fields:
```prisma
model DifficultyProfile {
  id                String   @id @default(cuid())
  childId           String
  gameType          String
  easeFactor        Float    @default(2.5)
  interval          Int      @default(1)
  streak            Int      @default(0)
  consecutiveFails  Int      @default(0)
  currentDifficulty String   @default("easy")
  totalSessions     Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  child Child @relation(fields: [childId], references: [id], onDelete: Cascade)

  @@unique([childId, gameType])
  @@index([childId])
}
```

**Add these 4 columns** (after `totalSessions`):

```prisma
  // Phase 2B: sliding-window band adjustment
  currentBand         String   @default("easy")     // easy | medium | hard — sliding-window result
  windowAccuracy      Float    @default(0)           // accuracy over last 10 attempts (0.0-1.0)
  bandLockedUntil     String?                        // sessionId that triggered last change; lock until new session
  consecutiveTriggers Int      @default(0)           // consecutive windows meeting promotion threshold
```

**Add composite index** on `GameAttempt` for efficient sliding-window query (add after `@@index([sessionId])` in `GameAttempt` model):

```prisma
  @@index([sessionId, createdAt(sort: Desc)])
```

Full `GameAttempt` model after change:
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
  @@index([sessionId, createdAt(sort: Desc)])
}
```

### Step 2: Run migration

```bash
cd /Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure
npx prisma migrate dev --name add-sliding-window-fields
npx prisma generate
```

Verify migration is additive:
```bash
cat prisma/migrations/*add-sliding-window*/migration.sql | grep -E "^(ALTER|CREATE|DROP)"
# Expected: ALTER TABLE "DifficultyProfile" ADD COLUMN ... (4 lines)
#           CREATE INDEX ... (1 line for composite)
# NO DROP statements
```

### Step 3: Create `lib/game-engine/sliding-window-adjuster.ts`

Path: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/lib/game-engine/sliding-window-adjuster.ts`

```typescript
/**
 * Sliding-window difficulty band adjuster.
 * Complements Phase 2A's SM-2 algorithm:
 *   - SM-2 controls repetition scheduling (slow loop, across days/weeks)
 *   - Sliding window controls difficulty band (fast loop, within 10 attempts)
 *
 * Pure function — no DB calls.
 */

import type { Difficulty } from '@/lib/types/common';

// ── Configuration ─────────────────────────────────────────────
const WINDOW_SIZE = 10;
const MIN_ATTEMPTS = 10;
const MIN_SESSIONS = 2;

const PROMOTE_THRESHOLDS: Record<Difficulty, number> = {
  easy: 0.80,   // easy -> medium
  medium: 0.85, // medium -> hard
  hard: 1.01,   // hard -> (none) — can't promote beyond hard
};

const DEMOTE_THRESHOLDS: Record<Difficulty, number> = {
  easy: -0.01,  // easy -> (none) — can't demote below easy
  medium: 0.50, // medium -> easy
  hard: 0.55,   // hard -> medium
};

const CONSECUTIVE_TRIGGERS_REQUIRED = 2;
const EASE_FACTOR_VETO_THRESHOLD = 1.5;

// ── Types ─────────────────────────────────────────────────────
export interface SlidingWindowInput {
  recentAttempts: { correct: boolean; sessionId: string }[];
  distinctSessionCount: number;
  totalAttemptCount: number;
  currentBand: Difficulty;
  consecutiveTriggers: number;
  bandLockedUntil: string | null;
  currentSessionId: string;
  easeFactor: number;
  parentCeiling: Difficulty;
}

export interface SlidingWindowResult {
  newBand: Difficulty;
  windowAccuracy: number;
  consecutiveTriggers: number;
  bandLockedUntil: string | null;
  changed: boolean;
}

const BAND_ORDER: Difficulty[] = ['easy', 'medium', 'hard'];

function bandIndex(d: Difficulty): number {
  return BAND_ORDER.indexOf(d);
}

// ── Core Algorithm ────────────────────────────────────────────
export function computeSlidingWindowAdjustment(
  input: SlidingWindowInput,
): SlidingWindowResult {
  const {
    recentAttempts,
    distinctSessionCount,
    totalAttemptCount,
    currentBand,
    consecutiveTriggers,
    bandLockedUntil,
    currentSessionId,
    easeFactor,
    parentCeiling,
  } = input;

  // Default: no change
  const noChange: SlidingWindowResult = {
    newBand: currentBand,
    windowAccuracy: 0,
    consecutiveTriggers,
    bandLockedUntil,
    changed: false,
  };

  // Gate 1: minimum data
  if (totalAttemptCount < MIN_ATTEMPTS || distinctSessionCount < MIN_SESSIONS) {
    return noChange;
  }

  // Gate 2: need full window
  if (recentAttempts.length < WINDOW_SIZE) {
    return noChange;
  }

  // Compute accuracy over window
  const windowSlice = recentAttempts.slice(0, WINDOW_SIZE);
  const correctCount = windowSlice.filter((a) => a.correct).length;
  const windowAccuracy = correctCount / WINDOW_SIZE;

  // Gate 3: cooldown lock — skip if locked to this session
  if (bandLockedUntil === currentSessionId) {
    return { ...noChange, windowAccuracy };
  }

  const idx = bandIndex(currentBand);
  let newBand = currentBand;
  let newTriggers = consecutiveTriggers;
  let newLock = bandLockedUntil;

  // Check promotion
  const promoteThreshold = PROMOTE_THRESHOLDS[currentBand];
  if (windowAccuracy >= promoteThreshold && idx < BAND_ORDER.length - 1) {
    // SM-2 veto: easeFactor < 1.5 means retention is lagging
    if (easeFactor < EASE_FACTOR_VETO_THRESHOLD) {
      // Block promotion, reset triggers
      return { newBand: currentBand, windowAccuracy, consecutiveTriggers: 0, bandLockedUntil, changed: false };
    }

    newTriggers = consecutiveTriggers + 1;
    if (newTriggers >= CONSECUTIVE_TRIGGERS_REQUIRED) {
      newBand = BAND_ORDER[idx + 1];
      newTriggers = 0;
      newLock = currentSessionId; // cooldown lock
    }
  }
  // Check demotion (only if not promoting)
  else {
    const demoteThreshold = DEMOTE_THRESHOLDS[currentBand];
    if (windowAccuracy <= demoteThreshold && idx > 0) {
      // Demotion is immediate (no consecutive triggers required for safety)
      newBand = BAND_ORDER[idx - 1];
      newTriggers = 0;
      newLock = currentSessionId;
    } else {
      // Neither promoting nor demoting — reset trigger count
      newTriggers = 0;
    }
  }

  // Apply parent ceiling
  const ceilingIdx = bandIndex(parentCeiling);
  if (bandIndex(newBand) > ceilingIdx) {
    newBand = parentCeiling;
  }

  return {
    newBand,
    windowAccuracy,
    consecutiveTriggers: newTriggers,
    bandLockedUntil: newLock,
    changed: newBand !== currentBand,
  };
}
```

### Step 4: Integrate into `POST /api/sessions/complete`

Path: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/app/api/sessions/complete/route.ts`

This file is created by Phase 2A. Phase 2B adds sliding-window logic AFTER the SM-2 upsert (Step 8 in Phase 2A).

**Add import at top:**
```typescript
import { computeSlidingWindowAdjustment } from '@/lib/game-engine/sliding-window-adjuster';
import type { Difficulty } from '@/lib/types/common';
```

**Add after the SM-2 upsert block (Phase 2A step 8), before the return statement:**

```typescript
    // ── Phase 2B: Sliding-window band adjustment ──────────────
    // 9. Query last 10 attempts for this child+gameType
    const recentAttempts = await prisma.gameAttempt.findMany({
      where: {
        session: {
          childId: session.childId,
          lesson: { gameType },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { correct: true, sessionId: true },
    });

    // 10. Count distinct completed sessions and total attempts
    const sessionStats = await prisma.gameSession.aggregate({
      where: {
        childId: session.childId,
        lesson: { gameType },
        status: 'completed',
      },
      _count: { id: true },
    });
    const distinctSessionCount = sessionStats._count.id;

    const attemptStats = await prisma.gameAttempt.aggregate({
      where: {
        session: {
          childId: session.childId,
          lesson: { gameType },
        },
      },
      _count: { id: true },
    });
    const totalAttemptCount = attemptStats._count.id;

    // 11. Read current profile (already upserted by SM-2 above)
    const profile = await prisma.difficultyProfile.findUnique({
      where: { childId_gameType: { childId: session.childId, gameType } },
    });

    if (profile) {
      const windowResult = computeSlidingWindowAdjustment({
        recentAttempts,
        distinctSessionCount,
        totalAttemptCount,
        currentBand: (profile.currentBand ?? profile.currentDifficulty) as Difficulty,
        consecutiveTriggers: profile.consecutiveTriggers ?? 0,
        bandLockedUntil: profile.bandLockedUntil,
        currentSessionId: sessionId,
        easeFactor: profile.easeFactor,
        parentCeiling,
      });

      // 12. Update profile with sliding-window results
      await prisma.difficultyProfile.update({
        where: { childId_gameType: { childId: session.childId, gameType } },
        data: {
          currentBand: windowResult.newBand,
          windowAccuracy: windowResult.windowAccuracy,
          consecutiveTriggers: windowResult.consecutiveTriggers,
          bandLockedUntil: windowResult.bandLockedUntil,
        },
      });
    }
```

**Update the return statement** to include band info:

Replace the existing return (Phase 2A) with:
```typescript
    const finalProfile = await prisma.difficultyProfile.findUnique({
      where: { childId_gameType: { childId: session.childId, gameType } },
    });

    return NextResponse.json({
      session: updated,
      difficulty: {
        previous: result.previous,
        current: result.state.currentDifficulty,
        accuracy: Math.round(accuracy * 100),
        changed: result.changed,
        band: finalProfile?.currentBand ?? 'easy',
        windowAccuracy: finalProfile?.windowAccuracy ?? 0,
      },
    });
```

### Step 5: Create `GET /api/children/[childId]/difficulty` endpoint

Path: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/app/api/children/[childId]/difficulty/route.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ childId: string }> };

/**
 * GET /api/children/:childId/difficulty
 * Returns current difficulty band per gameType from DifficultyProfile.
 * Falls back to ChildSettings.difficulty for game types with no profile.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { childId } = await params;

    // Guest users: return default from ChildSettings
    if (childId.startsWith('guest_')) {
      return NextResponse.json({
        profiles: [],
        defaultDifficulty: 'easy',
      });
    }

    const [profiles, settings] = await Promise.all([
      prisma.difficultyProfile.findMany({
        where: { childId },
        select: {
          gameType: true,
          currentBand: true,
          currentDifficulty: true,
          windowAccuracy: true,
          easeFactor: true,
          consecutiveTriggers: true,
          totalSessions: true,
        },
      }),
      prisma.childSettings.findUnique({
        where: { childId },
        select: { difficulty: true },
      }),
    ]);

    const defaultDifficulty = settings?.difficulty ?? 'easy';

    return NextResponse.json({
      profiles: profiles.map((p) => ({
        gameType: p.gameType,
        currentBand: p.currentBand ?? p.currentDifficulty,
        windowAccuracy: p.windowAccuracy ?? 0,
        easeFactor: p.easeFactor,
        consecutiveTriggers: p.consecutiveTriggers ?? 0,
        totalSessions: p.totalSessions,
      })),
      defaultDifficulty,
    });
  } catch (e) {
    console.error('[api/children/childId/difficulty GET] Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Step 6: Verify

```bash
cd /Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure
npx prisma generate
npx tsc --noEmit
npm run lint
```

## Todo List

- [ ] Add `currentBand`, `windowAccuracy`, `bandLockedUntil`, `consecutiveTriggers` to `DifficultyProfile` in `prisma/schema.prisma`
- [ ] Add composite index `@@index([sessionId, createdAt(sort: Desc)])` to `GameAttempt`
- [ ] Run `npx prisma migrate dev --name add-sliding-window-fields`
- [ ] Verify migration SQL is additive only (ALTER ADD COLUMN, CREATE INDEX)
- [ ] Create `lib/game-engine/sliding-window-adjuster.ts` (pure function)
- [ ] Update `app/api/sessions/complete/route.ts` -- add sliding-window logic after SM-2
- [ ] Create `app/api/children/[childId]/difficulty/route.ts` (GET endpoint)
- [ ] Run `npx prisma generate`
- [ ] Run `npx tsc --noEmit` -- passes
- [ ] Run `npm run lint` -- passes

## Success Criteria

1. `npx prisma migrate dev` succeeds; migration SQL contains only `ALTER TABLE ADD COLUMN` and `CREATE INDEX` statements
2. `npx tsc --noEmit` passes with zero errors
3. `computeSlidingWindowAdjustment()` with 10 attempts at 90% accuracy + consecutiveTriggers=1 returns promoted band
4. `computeSlidingWindowAdjustment()` with 10 attempts at 40% accuracy returns demoted band immediately
5. `computeSlidingWindowAdjustment()` with `bandLockedUntil === currentSessionId` returns no change (cooldown active)
6. `computeSlidingWindowAdjustment()` with `easeFactor < 1.5` and 90% accuracy returns no promotion (SM-2 veto)
7. `computeSlidingWindowAdjustment()` with `parentCeiling = 'easy'` never returns `'medium'` or `'hard'`
8. `computeSlidingWindowAdjustment()` with only 5 attempts returns no change (minimum data gate)
9. `POST /api/sessions/complete` response includes `band` and `windowAccuracy` fields
10. `GET /api/children/[childId]/difficulty` returns array of profiles with `currentBand` per gameType
11. `GET /api/children/guest_xxx/difficulty` returns empty profiles and `defaultDifficulty: 'easy'`
12. No file exceeds 200 lines

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Phase 2A not yet implemented when Phase 2B executes | High | Blocking | Phase 2B migration is additive on Phase 2A table; if Phase 2A missing, migration fails. **Execute Phase 2A first.** |
| Sliding-window query slow on large `GameAttempt` table | Low | Medium | Composite index `(sessionId, createdAt DESC)` added; query uses `take: 10` limit. For very large datasets, add `@@index([childId, gameType])` on `GameSession`. |
| `bandLockedUntil` using sessionId string risks stale locks | Low | Low | Lock is checked by equality (`=== currentSessionId`); any new session has a new ID, so lock naturally expires after 1 session. |
| Race condition between SM-2 upsert and sliding-window update | Low | Low | Both writes happen in same request handler sequentially; Prisma serializes within the same connection. |
| `currentBand` vs `currentDifficulty` field confusion | Medium | Medium | `currentDifficulty` = SM-2 result (Phase 2A), `currentBand` = sliding-window result (Phase 2B). Game engine should read `currentBand` for question generation. Document clearly in code comments. |

## Security Considerations

- `GET /api/children/[childId]/difficulty` should validate that requesting parent owns this child (same auth pattern as existing `GET /api/progress/[childId]`; currently no auth middleware).
- No sensitive data in new columns (game state only). Cascade delete on child removal via existing FK.
- Guest users explicitly handled: algorithm skipped, default difficulty returned.
- `parentCeiling` read from server-side DB only, not from client request body.

## Next Steps

- Write unit tests for `computeSlidingWindowAdjustment()` pure function (dedicated test phase)
- Client integration: read `currentBand` from `GET /api/children/[childId]/difficulty` to pass into `loadQuestions()` difficulty param
- Parent Dashboard (Phase 2C): surface `windowAccuracy` and `currentBand` per gameType on child detail screen
- Consider adding `@@index([childId, gameType])` on `GameSession` if query performance degrades with scale

# Phase 03 -- Worlds & Levels API (GET /api/worlds + GET /api/worlds/[worldId]/lessons)

## Context Links

- Parent plan: `plans/260425-0849-phase2a-audio-difficulty-worlds-api/plan.md`
- Scout: `plans/260425-0849-phase2a-audio-difficulty-worlds-api/scout/scout-codebase-report.md`
- Brainstorm: `plans/reports/brainstorms/BRAINSTORM-phase2-content-expansion.md`
- Static data: `src/data/game-config/worlds.ts` (5 worlds), `src/data/game-config/lesson-templates.ts` (45 lessons)

## Overview

- **Priority:** P1
- **Status:** pending
- **Parallel with:** Phase 01 (no shared files)
- **Description:** Replace the 501 stub in `GET /api/worlds` with real implementation merging static `WORLDS` config with child's unlock status from DB. Create new `GET /api/worlds/[worldId]/lessons` endpoint returning lessons + child star ratings. Unlock rule: world N unlocked if world N-1 has any lesson with >=1 star (world 0 always unlocked).

## Key Insights

- Static world configs in `src/data/game-config/worlds.ts` (5 worlds, `unlockOrder` 0-4).
- Static lesson templates in `src/data/game-config/lesson-templates.ts` (45 lessons, 9 per world).
- Stars already tracked via `GameSession.stars` per `lessonId`. Best star = `MAX(GameSession.stars)` per lesson per child.
- Lesson records exist in DB via seed script. `Lesson.id` matches `LessonTemplate.id`.
- `childId` currently passed as query param (no auth middleware yet -- matches existing API patterns like `POST /api/sessions`).
- No new DB tables needed. All data derivable from existing `GameSession` + static configs.

## Requirements

### Functional
- F1: `GET /api/worlds?childId=X` returns all 5 worlds with `unlocked: boolean` and aggregate stats
- F2: World 0 (`number-garden`) always unlocked
- F3: World N unlocked if any lesson in world N-1 has `bestStars >= 1` for this child
- F4: Each world in response includes `completedLessons` count and `totalStars` sum
- F5: `GET /api/worlds/[worldId]/lessons?childId=X` returns lessons for that world with child's best star rating per lesson
- F6: Lessons sorted by `order` ascending
- F7: Return 400 if `childId` missing, 404 if `worldId` invalid

### Non-Functional
- NF1: No new DB tables or migrations
- NF2: Single DB query per endpoint (aggregate in one Prisma call)
- NF3: Files under 200 lines each

## Architecture

```
GET /api/worlds?childId=abc
  1. Fetch all GameSessions for childId, grouped by lesson.worldId
  2. For each world in WORLDS config:
     - Compute bestStars per lesson (MAX stars)
     - completedLessons = count of lessons with bestStars >= 1
     - totalStars = SUM of bestStars across lessons
     - unlocked = unlockOrder === 0 OR previous world has completedLessons >= 1
  3. Return array of WorldResponse objects

GET /api/worlds/[worldId]/lessons?childId=abc
  1. Validate worldId against WORLDS config
  2. Get LESSON_TEMPLATES for worldId
  3. Fetch GameSessions for childId + lessons in this world
  4. For each lesson: bestStars = MAX(session.stars) or 0
  5. Return array of LessonResponse objects sorted by order
```

## Related Code Files

### Files to CREATE

| File | Purpose | Est. Lines |
|------|---------|------------|
| `app/api/worlds/[worldId]/lessons/route.ts` | GET handler: lessons + child star ratings | ~75 |
| `lib/api/worlds-query-helpers.ts` | Shared query logic: fetch best stars per lesson for a child | ~55 |

### Files to MODIFY

| File | Current Lines | Change |
|------|--------------|--------|
| `app/api/worlds/route.ts` | 13 | Replace 501 stub with full implementation |

## Implementation Steps

### Step 1: Create shared query helper

Path: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/lib/api/worlds-query-helpers.ts`

```typescript
import { prisma } from '@/lib/prisma';

export interface LessonStarRecord {
  lessonId: string;
  bestStars: number;
}

/**
 * Fetch best star rating per lesson for a given child.
 * Returns map: lessonId -> bestStars (max stars across all sessions).
 * Single DB query using groupBy.
 */
export async function getBestStarsForChild(
  childId: string,
  lessonIds?: string[],
): Promise<Map<string, number>> {
  const where: Record<string, unknown> = {
    childId,
    status: 'completed',
  };
  if (lessonIds && lessonIds.length > 0) {
    where.lessonId = { in: lessonIds };
  }

  const grouped = await prisma.gameSession.groupBy({
    by: ['lessonId'],
    where,
    _max: { stars: true },
  });

  const map = new Map<string, number>();
  for (const row of grouped) {
    map.set(row.lessonId, row._max.stars ?? 0);
  }
  return map;
}

/**
 * Check if a world is unlocked for a child.
 * World 0 always unlocked. World N unlocked if world N-1 has any lesson with bestStars >= 1.
 */
export function isWorldUnlocked(
  worldUnlockOrder: number,
  completedLessonsByWorld: Map<string, number>,
  worldIdByOrder: Map<number, string>,
): boolean {
  if (worldUnlockOrder === 0) return true;
  const prevWorldId = worldIdByOrder.get(worldUnlockOrder - 1);
  if (!prevWorldId) return false;
  return (completedLessonsByWorld.get(prevWorldId) ?? 0) >= 1;
}
```

### Step 2: Rewrite `GET /api/worlds`

Path: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/app/api/worlds/route.ts`

Replace entire file:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { WORLDS } from '@/src/data/game-config/worlds';
import { LESSON_TEMPLATES } from '@/src/data/game-config/lesson-templates';
import { getBestStarsForChild, isWorldUnlocked } from '@/lib/api/worlds-query-helpers';

interface WorldResponse {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  bg: string;
  emoji: string;
  unlockOrder: number;
  unlocked: boolean;
  lessonCount: number;
  completedLessons: number;
  totalStars: number;
}

/** GET /api/worlds?childId=X — list worlds with unlock status + progress */
export async function GET(request: NextRequest) {
  try {
    const childId = request.nextUrl.searchParams.get('childId');
    if (!childId) {
      return NextResponse.json({ error: 'childId query param is required' }, { status: 400 });
    }

    // Fetch best stars for all lessons for this child (single query)
    const allLessonIds = LESSON_TEMPLATES.map((l) => l.id);
    const starMap = await getBestStarsForChild(childId, allLessonIds);

    // Build world-order lookup
    const worldIdByOrder = new Map<number, string>();
    for (const w of WORLDS) {
      worldIdByOrder.set(w.unlockOrder, w.id);
    }

    // Compute per-world stats
    const completedByWorld = new Map<string, number>();
    const starsByWorld = new Map<string, number>();

    for (const lesson of LESSON_TEMPLATES) {
      const best = starMap.get(lesson.id) ?? 0;
      if (best >= 1) {
        completedByWorld.set(lesson.worldId, (completedByWorld.get(lesson.worldId) ?? 0) + 1);
      }
      starsByWorld.set(lesson.worldId, (starsByWorld.get(lesson.worldId) ?? 0) + best);
    }

    const worlds: WorldResponse[] = WORLDS.map((w) => ({
      id: w.id,
      name: w.name,
      subtitle: w.subtitle,
      color: w.color,
      bg: w.bg,
      emoji: w.emoji,
      unlockOrder: w.unlockOrder,
      unlocked: isWorldUnlocked(w.unlockOrder, completedByWorld, worldIdByOrder),
      lessonCount: w.lessonCount,
      completedLessons: completedByWorld.get(w.id) ?? 0,
      totalStars: starsByWorld.get(w.id) ?? 0,
    }));

    return NextResponse.json({ worlds });
  } catch (e) {
    console.error('[api/worlds GET] Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Step 3: Create `GET /api/worlds/[worldId]/lessons`

Path: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/app/api/worlds/[worldId]/lessons/route.ts`

First create the directory structure:

```bash
mkdir -p app/api/worlds/\[worldId\]/lessons
```

Then create the route file:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getWorld } from '@/src/data/game-config/worlds';
import { getLessonsForWorld } from '@/src/data/game-config/lesson-templates';
import { getBestStarsForChild } from '@/lib/api/worlds-query-helpers';
import type { WorldId } from '@/lib/types/common';

type Params = { params: Promise<{ worldId: string }> };

interface LessonResponse {
  id: string;
  worldId: string;
  gameType: string;
  order: number;
  title: string;
  difficulty: string;
  questionCount: number;
  passingStars: number;
  bestStars: number;
  completed: boolean;
}

/** GET /api/worlds/[worldId]/lessons?childId=X — lessons with child progress */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { worldId } = await params;
    const childId = request.nextUrl.searchParams.get('childId');

    if (!childId) {
      return NextResponse.json({ error: 'childId query param is required' }, { status: 400 });
    }

    // Validate worldId
    const world = getWorld(worldId as WorldId);
    if (!world) {
      return NextResponse.json({ error: `World '${worldId}' not found` }, { status: 404 });
    }

    // Get lesson templates for this world (sorted by order)
    const templates = getLessonsForWorld(worldId as WorldId);
    const lessonIds = templates.map((l) => l.id);

    // Fetch best stars for these lessons (single query)
    const starMap = await getBestStarsForChild(childId, lessonIds);

    const lessons: LessonResponse[] = templates.map((l) => {
      const bestStars = starMap.get(l.id) ?? 0;
      return {
        id: l.id,
        worldId: l.worldId,
        gameType: l.gameType,
        order: l.order,
        title: l.title,
        difficulty: l.difficulty,
        questionCount: l.questionCount,
        passingStars: l.passingStars,
        bestStars,
        completed: bestStars >= l.passingStars,
      };
    });

    return NextResponse.json({ worldId, worldName: world.name, lessons });
  } catch (e) {
    console.error('[api/worlds/[worldId]/lessons GET] Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Step 4: Verify

```bash
npx tsc --noEmit
npm run lint
```

## Todo List

- [ ] Create `lib/api/worlds-query-helpers.ts`
- [ ] Rewrite `app/api/worlds/route.ts` (replace 501 stub)
- [ ] Create `app/api/worlds/[worldId]/lessons/` directory
- [ ] Create `app/api/worlds/[worldId]/lessons/route.ts`
- [ ] Run `npx tsc --noEmit` -- passes
- [ ] Run `npm run lint` -- passes

## Success Criteria

1. `npx tsc --noEmit` passes with zero errors
2. `GET /api/worlds?childId=X` returns 5 worlds with `unlocked`, `completedLessons`, `totalStars` fields
3. World 0 (`number-garden`) always has `unlocked: true`
4. World 1 has `unlocked: true` only if child has >=1 star on any lesson in world 0
5. `GET /api/worlds/invalid-id/lessons?childId=X` returns 404
6. `GET /api/worlds/number-garden/lessons?childId=X` returns 9 lessons sorted by `order`, each with `bestStars` and `completed`
7. Missing `childId` returns 400 on both endpoints
8. No new DB migrations needed
9. No file exceeds 200 lines
10. Single `groupBy` query per endpoint (no N+1 queries)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Lesson IDs in templates don't match seeded DB lesson IDs | Medium | High | `LESSON_TEMPLATES.id` values (e.g., `ng-01`) must match `Lesson.id` in seed script. Verify with `SELECT id FROM "Lesson" LIMIT 5` |
| `groupBy` returns no rows for child with no sessions | None | None | `starMap.get()` returns undefined, defaulted to 0 |
| `WorldId` type mismatch from dynamic route param | Low | Low | Cast `worldId as WorldId` after validation via `getWorld()` |
| Large number of GameSessions for heavy user | Low | Low | `groupBy` is O(sessions) but aggregated by DB engine; 45 lessons max = small result set |

## Security Considerations

- `childId` passed as query param (no auth middleware). Matches existing API patterns. Future: validate childId belongs to authenticated parent session.
- No write operations -- read-only endpoints. No mutation risk.
- No sensitive data exposed (world names, star counts, lesson titles are non-sensitive).

## Rollback

```bash
git checkout -- app/api/worlds/route.ts
rm -f lib/api/worlds-query-helpers.ts
rm -rf app/api/worlds/\[worldId\]/
```

## Next Steps

- Phase 2B: Connect World Map UI to `GET /api/worlds` (replace mock data)
- Phase 2C: Connect lesson selection screen to `GET /api/worlds/[worldId]/lessons`
- Future: add `GET /api/worlds/[worldId]/lessons/[lessonId]` for individual lesson detail if needed

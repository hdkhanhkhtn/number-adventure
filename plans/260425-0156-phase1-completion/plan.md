# Phase 1 Completion -- Remaining Tasks

**User request**: Create detailed implementation plan for remaining Phase 1 tasks.
**Source**: Scout findings from P1+P2 research
**Created**: 2026-04-25

---

## Overview

| Phase | Name | Scope | Status | Depends On |
|-------|------|-------|--------|------------|
| A | StreakCard integration | 4 files | Pending | None |
| B | Difficulty wiring | 2 files | Pending | None |
| C | Roadmap sync | 1 file | Pending | A+B |

Phases A and B are independent and can be executed in parallel.

---

## Phase A: StreakCard Integration

### Files to Modify

1. `app/(child)/home/page.tsx` (72 lines)
2. `components/screens/home-screen.tsx` (129 lines)
3. `app/(child)/reward/page.tsx` (64 lines)
4. `components/screens/reward-content.tsx` (85 lines)

### Implementation Steps

**Step A1**: `app/(child)/home/page.tsx` -- read `longestStreak` from API response

The streaks API (`app/api/streaks/[childId]/route.ts` line 13) already returns
`{ currentStreak, longestStreak, lastPlayDate }`. The home page (line 33) only
destructures `currentStreak`.

Change line 18: add `longestStreak` state:

```typescript
const [streak, setStreak] = useState(0);
const [longestStreak, setLongestStreak] = useState(0);
```

Change line 33: destructure both fields:

```typescript
.then((d: { currentStreak?: number; longestStreak?: number }) => {
  setStreak(d.currentStreak ?? 0);
  setLongestStreak(d.longestStreak ?? 0);
})
```

Add `longestStreak` prop to `<HomeScreen>` at line 55:

```tsx
<HomeScreen
  profile={{ name: profile.name, color: profile.color as MascotColor }}
  streak={streak}
  longestStreak={longestStreak}
  weekDays={weekDays}
  ...
/>
```

**Step A2**: `components/screens/home-screen.tsx` -- replace inline streak with `<StreakCard>`

Add import at top (after existing imports):

```typescript
import { StreakCard } from '@/components/ui/streak-card';
```

Add `longestStreak` to `HomeScreenProps` interface (line 14):

```typescript
longestStreak: number;
```

Add `longestStreak` to destructured props (line 29).

Replace the inline `🔥 {streak}` badge (lines 53-60):

```tsx
{/* Existing inline badge: */}
<div style={{ display: 'flex', alignItems: 'center', gap: 4, ... }}>
  🔥 <span>{streak}</span>
</div>
```

Replace with a simpler streak badge in the top bar (keep compact for header):

```tsx
<div style={{
  display: 'flex', alignItems: 'center', gap: 4,
  padding: '8px 12px', borderRadius: 999, background: '#FFE6A8',
  border: '2px solid #2D3A2E', boxShadow: '0 3px 0 #C89220',
  fontWeight: 700, color: '#5E3A00',
}}>
  🔥 <span>{streak}</span>
</div>
```

The top bar badge stays as-is (it is compact and appropriate for a header).

Replace the "Weekly progress" section at the bottom (lines 101-125) with `<StreakCard>`:

```tsx
<StreakCard currentStreak={streak} longestStreak={longestStreak} weekData={weekDays} />
```

This replaces 25 lines of inline weekly progress with a single component call. The
`StreakCard` already renders the same 7-day dot calendar + streak count + longest
streak display.

**Step A3**: `app/(child)/reward/page.tsx` -- pass streak to `RewardContent`

The `SessionResult` interface (line 9) needs `streak` field matching what
`completeSession` returns. Currently missing. The `useGameSession` hook returns
`streak: { currentStreak, longestStreak }` in the `SessionResult`.

Update `SessionResult` interface (line 9):

```typescript
interface SessionResult {
  session: { stars: number };
  sticker?: { emoji: string; name: string } | null;
  streak?: { currentStreak: number; longestStreak: number } | null;
  correct?: number;
  total?: number;
}
```

Pass streak to `<RewardContent>` at line 42:

```tsx
<RewardContent
  stars={stars}
  correct={correct}
  total={total}
  sticker={result.sticker ?? null}
  streak={result.streak ?? null}
  profileName={profile.name}
  profileColor={profile.color as MascotColor}
  onContinue={...}
/>
```

**Step A4**: `components/screens/reward-content.tsx` -- add streak prop + render StreakCard

Add import:

```typescript
import { StreakCard } from '@/components/ui/streak-card';
```

Add to `RewardContentProps` interface (after `sticker`):

```typescript
streak?: { currentStreak: number; longestStreak: number } | null;
```

Add `streak` to destructured props (line 24).

Render `<StreakCard>` after the sticker section (after line 77), before the "Next"
button:

```tsx
{streak && streak.currentStreak > 0 && (
  <div style={{ marginTop: 14, width: '100%' }}>
    <StreakCard
      currentStreak={streak.currentStreak}
      longestStreak={streak.longestStreak}
    />
  </div>
)}
```

### Todo List

- [ ] A1: Add longestStreak state to home/page.tsx
- [ ] A2: Import StreakCard and replace weekly progress in home-screen.tsx
- [ ] A3: Add streak field to SessionResult in reward/page.tsx
- [ ] A4: Add streak prop + StreakCard render in reward-content.tsx
- [ ] Verify: no TypeScript errors (`npx tsc --noEmit`)

### Acceptance Criteria

- [ ] Home screen bottom section renders `<StreakCard>` with currentStreak + longestStreak + weekData
- [ ] Reward screen renders `<StreakCard>` when streak data is present and currentStreak > 0
- [ ] Guest users: streak is null -> StreakCard not rendered (graceful)
- [ ] No TypeScript errors
- [ ] All files stay under 200 lines

---

## Phase B: Difficulty Wiring

### Files to Modify

1. `lib/game-engine/question-loader.ts` (41 lines)
2. `app/(child)/play/[gameType]/[lessonId]/page.tsx` (96 lines)

### Current State

- `loadQuestions` (question-loader.ts:24-41) accepts `(lessonId, gameType, count)` -- no `difficulty` param
- `loadQuestions` POSTs `{ lessonId, gameType, count }` to `/api/ai/generate-questions`
- The AI route (generate-questions/route.ts:27) already reads `difficulty` from request body and defaults to `'easy'`
- `LESSON_TEMPLATES` has `difficulty: 'easy' | 'medium' | 'hard'` per lesson
- Play page (line 57) calls `loadQuestions(lessonId, validGameType, lesson?.questionCount ?? 5)` -- no difficulty

### Implementation Steps

**Step B1**: `lib/game-engine/question-loader.ts` -- add `difficulty` parameter

Add `difficulty` param to `loadQuestions` signature (line 24):

```typescript
export async function loadQuestions(
  lessonId: string,
  gameType: GameType,
  count = 5,
  difficulty: 'easy' | 'medium' | 'hard' = 'easy',
): Promise<AnyQuestion[]> {
```

Add `difficulty` to the POST body (line 32):

```typescript
body: JSON.stringify({ lessonId, gameType, count, difficulty }),
```

**Step B2**: `app/(child)/play/[gameType]/[lessonId]/page.tsx` -- pass lesson difficulty

Change line 57 from:

```typescript
const qs = await loadQuestions(lessonId, validGameType, lesson?.questionCount ?? 5);
```

To:

```typescript
const qs = await loadQuestions(
  lessonId, validGameType, lesson?.questionCount ?? 5, lesson?.difficulty ?? 'easy',
);
```

### Todo List

- [ ] B1: Add difficulty param to loadQuestions signature and POST body
- [ ] B2: Pass lesson.difficulty in play page
- [ ] Verify: no TypeScript errors (`npx tsc --noEmit`)

### Acceptance Criteria

- [ ] `loadQuestions` accepts 4th param `difficulty` with default `'easy'`
- [ ] AI endpoint receives difficulty in POST body
- [ ] Play page passes `lesson.difficulty` from `LESSON_TEMPLATES`
- [ ] No TypeScript errors

---

## Phase C: Roadmap Sync

### File to Modify

- `docs/sprints/roadmap.md`

### Changes

Update Milestones 5-9 statuses to reflect actual codebase state:

**M5 (Onboarding)**: All 3 tasks -> "Deferred" (guest flow is MVP-intentional; real
onboarding deferred to Phase 2)

**M6 (Child Home & Nav)**:
- 6.1 Home screen -> "Done (Phase A: StreakCard integrated)"
- 6.2 World Map -> "Done"
- 6.3 Level List -> "Done"
- 6.4 Sticker Book -> "Done"
- 6.5 StreakCard component -> "Done"

**M7 (Game Engine & AI)**:
- 7.1 Config-driven engine -> "Done"
- 7.2 AI question generation -> "Done"
- 7.3 Difficulty scaling -> "Done (Phase B)"
- 7.4 useGame hook -> "Done"
- 7.5 useSession hook -> "Done"
- 7.6 useAudio hook -> "Done (TTS); SFX deferred to Phase 2"
- 7.7 Level config data -> "Done"

**M8 (Mini-Games)**: All 5 tasks -> "Done"

**M9 (Reward & Celebration)**:
- 9.1 Reward screen -> "Done"
- 9.2 Confetti + animations -> "Done"
- 9.3 Sticker unlock flow -> "Done"
- 9.4 StreakCard on reward -> "Done (Phase A)"

### Todo List

- [ ] Update M5-M9 statuses per above
- [ ] Verify consistency with actual file contents

### Acceptance Criteria

- [ ] Roadmap accurately reflects codebase state
- [ ] No remaining "Todo" for tasks that are implemented

---

## Key Constraints

- Every file must stay under 200 lines
- Follow existing code style (inline styles, `var()` CSS variables)
- Guest flow: streak may be null/undefined -- handle gracefully
- No new dependencies
- Verify with `npx tsc --noEmit` after each phase

## Verification Command

```bash
cd /Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure && npx tsc --noEmit
```

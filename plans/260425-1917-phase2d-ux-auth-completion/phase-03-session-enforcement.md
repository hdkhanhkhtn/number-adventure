# Phase 03 — Session Time Enforcement

## Context Links

- [Parent plan](./plan.md)
- Settings tab (dailyMin): `components/screens/parent-settings-time-tab.tsx`
- Game progress context: `context/game-progress-context.tsx`
- Play page: `app/(child)/play/[gameType]/[lessonId]/page.tsx`
- Reward page: `app/(child)/reward/page.tsx`
- Settings defaults: `components/screens/parent-settings-content.tsx` (line 20: `dailyMin: 15`)

## Overview

- **Priority**: P0
- **Status**: pending
- **Description**: Enforce the `dailyMin` setting so that when the daily time limit elapses, the child sees a friendly "Time's up!" screen. The cutoff happens after the current question completes (not mid-question). A new hook `useSessionTimer` tracks elapsed play time per day, and a `TimeUpOverlay` component renders when triggered.

## Key Insights

- `dailyMin` is already stored in `ChildSettings` (DB) and in `state.settings` (context); default is 15
- No existing time tracking mechanism — must create one
- Play time must persist across page navigations within a day (use localStorage with date key)
- The overlay must NOT hard-stop mid-question — wait for the current answer before showing
- `sessionActive` flag already exists in `GameProgressState` (context) — can be used to gate timer

## Requirements

### Functional
- FR1: Track cumulative play time per day (midnight reset) in localStorage
- FR2: When cumulative time >= `dailyMin` minutes, set a `timeUp` flag
- FR3: `timeUp` flag is checked after each question answer (not mid-question)
- FR4: When `timeUp` is true, show a fullscreen overlay: "Great job! Time's up for today!" with BapMascot (happy mood), a "Go Home" button
- FR5: Overlay blocks further gameplay — child must return to home
- FR6: Timer only runs when a game is actively being played (not on home/world screens)

### Non-Functional
- NFR1: Timer granularity: 1-second intervals via `setInterval`
- NFR2: Time persists in localStorage key `bap-playtime-{YYYY-MM-DD}` (auto-expires next day)
- NFR3: No server-side enforcement in Phase 2D (client-only, server enforcement deferred)

## Architecture

```
useSessionTimer(dailyMin)
  → reads localStorage bap-playtime-{today}
  → starts 1s interval when game is active
  → increments elapsed seconds in localStorage
  → returns { elapsedMin, timeUp, markQuestionComplete }

Play page (page.tsx)
  → calls useSessionTimer(state.settings.dailyMin ?? 15)
  → passes timeUp check into game completion flow
  → after each question answer, if timeUp → show TimeUpOverlay

TimeUpOverlay
  → fixed fullscreen z-50
  → BapMascot (happy) + message + "Go Home" button
  → button navigates to /home
```

## Related Code Files

### CREATE
- `lib/hooks/use-session-timer.ts` — daily play time tracking hook
- `components/screens/time-up-overlay.tsx` — "Time's up" fullscreen overlay

### MODIFY
- `app/(child)/play/[gameType]/[lessonId]/page.tsx` — integrate timer hook, show overlay when timeUp

## Implementation Steps

### Step 1: Create `lib/hooks/use-session-timer.ts`

```typescript
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

function todayKey(): string {
  return `bap-playtime-${new Date().toISOString().slice(0, 10)}`;
}

function getElapsed(): number {
  return parseInt(localStorage.getItem(todayKey()) ?? '0', 10);
}

function setElapsed(seconds: number): void {
  localStorage.setItem(todayKey(), String(seconds));
}

export function useSessionTimer(dailyMin: number) {
  const [elapsedSec, setElapsedSec] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = getElapsed();
    setElapsedSec(stored);
    if (stored >= dailyMin * 60) setTimeUp(true);
  }, [dailyMin]);

  // Run timer
  useEffect(() => {
    if (timeUp) return;
    intervalRef.current = setInterval(() => {
      setElapsedSec(prev => {
        const next = prev + 1;
        setElapsed(next);
        if (next >= dailyMin * 60) setTimeUp(true);
        return next;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [dailyMin, timeUp]);

  const elapsedMin = Math.floor(elapsedSec / 60);
  return { elapsedMin, elapsedSec, timeUp };
}
```

### Step 2: Create `components/screens/time-up-overlay.tsx`

- Fixed fullscreen div with `z-50`, semi-transparent backdrop `bg-black/40`
- Centered card with BapMascot (happy mood, size 80), message text, "Go Home" button
- Button calls `router.push('/home')`
- Style matches existing overlay pattern (see `parent-gate.tsx` for reference)

Key elements:
- Heading: "Giỏi lắm! Hết giờ rồi!" / "Great job! Time's up!"
- Subtext: "Hẹn gặp lại ngày mai nhé!" / "See you tomorrow!"
- Single CTA button: "Về trang chủ" → navigates to `/home`

### Step 3: Integrate timer in play page

In `app/(child)/play/[gameType]/[lessonId]/page.tsx`:

1. Import `useSessionTimer` and `TimeUpOverlay`
2. Call `const { timeUp } = useSessionTimer(state.settings?.dailyMin ?? 15)`
3. Add state: `const [showTimeUp, setShowTimeUp] = useState(false)`
4. In the `handleComplete` callback (after game ends), check `timeUp` — if true, set `showTimeUp = true` instead of navigating to reward
5. Also check `timeUp` between questions in each game component by passing a `checkTimeUp` prop
6. Render `{showTimeUp && <TimeUpOverlay />}` at the bottom of the JSX

The check happens at natural pause points:
- After `onComplete` fires (all questions done)
- The timer itself sets `timeUp=true` but the overlay only shows after the current question resolves

### Step 4: Prevent re-entry when time is up

On the play page, check `timeUp` on mount (before loading questions). If already exceeded, redirect to home immediately with `router.replace('/home')` — prevents child from starting a new game when daily limit is already met.

## Todo List

- [ ] Create `lib/hooks/use-session-timer.ts` with localStorage-backed daily timer
- [ ] Create `components/screens/time-up-overlay.tsx` with BapMascot + message + CTA
- [ ] Integrate `useSessionTimer` in `app/(child)/play/[gameType]/[lessonId]/page.tsx`
- [ ] Show `TimeUpOverlay` after current question when `timeUp` is true
- [ ] Block new game start when daily limit already reached
- [ ] Test: timer increments and persists across page navigations
- [ ] Test: overlay appears after dailyMin elapsed (not mid-question)
- [ ] Test: child cannot start new game when time is already up
- [ ] Test: timer resets at midnight (new date key)

## Success Criteria

1. Play time tracked per day in localStorage; survives page refresh
2. When `dailyMin` elapsed, overlay shows after current question (not mid-question)
3. Child cannot start new game when daily limit already met
4. Timer resets at midnight automatically (date-keyed storage)
5. Default 15 min works when settings not configured

## Risk Assessment

- **localStorage unavailable**: SSR guard via `typeof window !== 'undefined'` check. Timer silently disabled.
- **Child manipulates localStorage**: Acceptable — this is client-only enforcement. Server enforcement deferred.
- **Timezone edge case**: Uses `new Date().toISOString().slice(0, 10)` (UTC). For local-day accuracy, use `toLocaleDateString('en-CA')` instead. Implementer should choose local date.

## Security Considerations

- Client-only enforcement — not a security boundary. A determined user can clear localStorage.
- Server-side enforcement (API rejecting session creation after daily limit) deferred to Phase 3.
- No sensitive data in timer storage (just integer seconds).

## Next Steps

- Phase 2E: Server-side session time enforcement via API
- Phase 2E: "Session Complete" screen variant (distinct from time-up overlay)

# Phase 03 — Session Complete & Streak Detail Screens

## Context Links

- [Parent plan](./plan.md)
- [Screen Detail Research](./research/researcher-screens-detail.md) — sections C & E
- [Phase 2D celebration overlays](../260425-1917-phase2d-ux-auth-completion/phase-05-celebration-overlays.md) — daily-goal-overlay.tsx (FR9-FR12)
- Reward page: `app/(child)/reward/page.tsx` (67 lines)
- Reward content: `components/screens/reward-content.tsx` (93 lines, grows to ~108 after Phase 02)
- Streak card: `components/ui/streak-card.tsx` (88 lines)
- StreakCardProps: `{ currentStreak: number; longestStreak: number; weekData?: boolean[] }`

## Overview

- **Priority**: P2
- **Status**: pending
- **Depends on**: Phase 2D's `components/screens/daily-goal-overlay.tsx` and `lib/hooks/use-session-timer.ts` must exist
- **Description**: Two "summary/celebration" screens — (A) Session Complete screen shown on the reward page when daily goal is met (reuses Phase 2D's `DailyGoalOverlay`), (B) Streak Detail bottom-sheet opened by tapping the streak card.

## Key Insights

- **Session Complete IS Phase 2D's daily-goal overlay.** Research confirmed the concepts are identical — "daily goal reached" celebration shown post-reward. Phase 2E's job is to wire it into the reward page flow, not create a second component. If Phase 2D already wires it in `reward/page.tsx`, Phase 2E only verifies and enhances the flow.
- **Streak Detail** follows the same bottom-sheet pattern as Sticker Detail (Phase 02). A monthly calendar extends the 7-day `weekData` pattern to ~30 cells.
- `StreakCard` currently has no `onClick`/`onTap` prop. Adding one is a 3-line change.
- The streak card is used in two places: `reward-content.tsx` (line 83) and `parent-dashboard-content.tsx` (line 116). Both should wire the `onTap` prop.

## Requirements

### Functional — Session Complete
- FR1: After game completion, if `dailyMin` has been met for the day, show `DailyGoalOverlay` on top of the reward page
- FR2: Check is gated by localStorage `bap-daily-goal-{YYYY-MM-DD}` — shows only once per day
- FR3: `DailyGoalOverlay` displays: Confetti, BapMascot (celebrate), "Daily goal reached!" heading, elapsed/target minutes, "Go Home" button
- FR4: On "Go Home": set localStorage flag, navigate to `/home`
- FR5: If Phase 2D already wires this in `reward/page.tsx`, skip wiring; only verify behavior

### Functional — Streak Detail Sheet
- FR6: Tapping `StreakCard` opens a bottom-sheet with expanded streak view
- FR7: Sheet content: monthly dot-calendar (current month, ~30-31 cells), current streak count, longest streak, BapMascot
- FR8: Monthly calendar cells: filled (gold + star) for completed days, empty for missed/future days
- FR9: Dismiss by tapping backdrop or close button
- FR10: Sheet slides up from bottom (same animation pattern as sticker detail sheet)

### Non-Functional
- NFR1: `StreakCard` gains optional `onTap?: () => void` prop — backward compatible
- NFR2: Streak detail sheet under 100 lines
- NFR3: Monthly calendar derives data from `weekData` pattern — extended to current month via day-of-month calculation
- NFR4: No new npm packages

## Architecture

```
Session Complete:
  reward/page.tsx (RewardInner)
  -> after result loads, check: dailyGoalMet flag in result OR derive from timer
  -> check localStorage: bap-daily-goal-{YYYY-MM-DD}
  -> if met AND not flagged today: render <DailyGoalOverlay /> on top
  -> onContinue: set localStorage flag + router.push('/home')

Streak Detail Sheet:
  StreakCard: add onTap prop -> wraps entire card in onClick
  reward-content.tsx: StreakCard onTap={() => setShowStreakDetail(true)}
  parent-dashboard-content.tsx: StreakCard onTap={() => setShowStreakDetail(true)}
  -> render <StreakDetailSheet ... onClose={...} />
```

## Related Code Files

### CREATE
- `components/ui/streak-detail-sheet.tsx` — bottom-sheet with monthly streak calendar

### MODIFY
- `app/(child)/reward/page.tsx` — wire DailyGoalOverlay check (if not already done by Phase 2D) (add ~15 lines)
- `components/ui/streak-card.tsx` — add optional `onTap` prop + onClick wrapper (add ~5 lines)
- `components/screens/reward-content.tsx` — wire StreakCard onTap to open streak detail (add ~10 lines)
- `components/screens/parent-dashboard-content.tsx` — wire StreakCard onTap to open streak detail (add ~10 lines)

### DEPENDS ON (from Phase 2D — must exist before this phase)
- `components/screens/daily-goal-overlay.tsx` — created by Phase 2D Step 5
- `lib/hooks/use-session-timer.ts` — created by Phase 2D Phase 03

## Implementation Steps

### Step 1: Add `onTap` prop to `components/ui/streak-card.tsx`

Minimal change — add prop + wrap card div with onClick:

```tsx
// Update StreakCardProps interface:
export interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  weekData?: boolean[];
  onTap?: () => void;  // NEW
}

// Update function signature:
export function StreakCard({ currentStreak, longestStreak, weekData = [], onTap }: StreakCardProps) {

// Add onClick + cursor to the root div:
<div
  onClick={onTap}
  style={{
    // ...existing styles...
    cursor: onTap ? 'pointer' : 'default',  // NEW
  }}
>
```

This is a 3-line diff. File stays at 88 lines.

### Step 2: Create `components/ui/streak-detail-sheet.tsx`

Props: `currentStreak: number`, `longestStreak: number`, `weekData?: boolean[]`, `onClose: () => void`, `visible: boolean`

Monthly calendar logic:
- Get current month's day count: `new Date(year, month + 1, 0).getDate()`
- Get first day of month's weekday offset: `new Date(year, month, 1).getDay()`
- For each day, determine completed status. Since API only provides 7-day `weekData`, derive completed days by mapping `weekData` backwards from today. Days before the 7-day window default to `false`.

```tsx
'use client';

import { BapMascot } from '@/components/ui/bap-mascot';

interface StreakDetailSheetProps {
  currentStreak: number;
  longestStreak: number;
  weekData?: boolean[];
  visible: boolean;
  onClose: () => void;
}

export function StreakDetailSheet({
  currentStreak, longestStreak, weekData = [], visible, onClose,
}: StreakDetailSheetProps) {
  if (!visible) return null;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = new Date(year, month, 1).getDay(); // 0=Sun
  const today = now.getDate();

  // Map weekData (7 bools, Mon-Sun) to day-of-month completed set
  const completedDays = new Set<number>();
  const dayOfWeek = now.getDay(); // 0=Sun
  // weekData[0]=Mon ... weekData[6]=Sun; map backwards from today
  for (let i = 0; i < weekData.length; i++) {
    if (weekData[i]) {
      // weekData[i] = Monday(0)..Sunday(6)
      // Calculate how many days ago this weekday was
      const weekdayIndex = i + 1; // 1=Mon..7=Sun
      const diff = ((dayOfWeek || 7) - weekdayIndex + 7) % 7;
      const dayNum = today - diff;
      if (dayNum >= 1 && dayNum <= daysInMonth) completedDays.add(dayNum);
    }
  }

  const monthName = now.toLocaleString('en', { month: 'long' });
  const blanks = Array.from({ length: firstDayOffset }, (_, i) => (
    <div key={`b${i}`} />
  ));

  const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    const done = completedDays.has(d);
    const isFuture = d > today;
    return (
      <div key={d} style={{
        aspectRatio: '1', borderRadius: 8, display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600,
        background: done ? '#FFD36E' : isFuture ? '#F5F3ED' : '#F0EADD',
        border: `1.5px solid ${done ? '#C79528' : 'rgba(46,90,58,0.1)'}`,
        color: done ? '#5E3A00' : isFuture ? '#C0B9A8' : '#6B7A6C',
      }}>
        {done ? '⭐' : d}
      </div>
    );
  });

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'flex-end', animation: 'fade-in 0.2s ease-out',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: '#FFF8EC', borderRadius: '24px 24px 0 0',
        padding: '20px 20px 36px', boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
        maxHeight: '70vh', overflowY: 'auto',
      }}>
        {/* Drag handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(46,90,58,0.2)', margin: '0 auto 16px' }} />
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <BapMascot size={48} mood="happy" />
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#5E3A00' }}>🔥 {currentStreak}</div>
            <div style={{ fontSize: 12, color: '#6B7A6C' }}>Best: {longestStreak} days</div>
          </div>
        </div>
        {/* Month label */}
        <div style={{ fontSize: 14, fontWeight: 700, color: '#2D3A2E', marginBottom: 8 }}>{monthName} {year}</div>
        {/* Weekday headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#9AA69A' }}>{d}</div>
          ))}
        </div>
        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {blanks}
          {dayCells}
        </div>
      </div>
    </div>
  );
}
```

Target: ~95 lines.

### Step 3: Wire streak detail in `components/screens/reward-content.tsx`

Add import, state, and pass `onTap` to StreakCard:

```tsx
// Add import at top:
import { StreakDetailSheet } from '@/components/ui/streak-detail-sheet';

// Inside RewardContent, add state:
const [showStreakDetail, setShowStreakDetail] = useState(false);

// Modify the existing StreakCard render (line 83) — add onTap prop:
<StreakCard
  currentStreak={streak.currentStreak}
  longestStreak={streak.longestStreak}
  onTap={() => setShowStreakDetail(true)}
/>

// Add before the closing sticker overlay (or before closing </div>):
{streak && (
  <StreakDetailSheet
    visible={showStreakDetail}
    currentStreak={streak.currentStreak}
    longestStreak={streak.longestStreak}
    onClose={() => setShowStreakDetail(false)}
  />
)}
```

Adds ~10 lines. File reaches ~118 lines (with Phase 02 changes included).

### Step 4: Wire streak detail in `components/screens/parent-dashboard-content.tsx`

Same pattern — add import, state, onTap, and sheet render:

```tsx
// Add import:
import { StreakDetailSheet } from '@/components/ui/streak-detail-sheet';

// Add state inside ParentDashboardContent:
const [showStreakDetail, setShowStreakDetail] = useState(false);

// Modify existing StreakCard (line 116) — add onTap:
<StreakCard
  currentStreak={streak.currentStreak}
  longestStreak={streak.longestStreak}
  onTap={() => setShowStreakDetail(true)}
/>

// Add before closing </div> of the return:
<StreakDetailSheet
  visible={showStreakDetail}
  currentStreak={streak.currentStreak}
  longestStreak={streak.longestStreak}
  onClose={() => setShowStreakDetail(false)}
/>
```

Adds ~10 lines. File reaches ~143 lines.

### Step 5: Wire Session Complete in `app/(child)/reward/page.tsx`

**Prerequisite check**: If Phase 2D already wires `DailyGoalOverlay` into `reward/page.tsx` (per Phase 2D Step 6), skip this step. Only implement if Phase 2D's daily-goal integration is missing from the reward page.

If wiring is needed:

```tsx
// Add imports:
import { DailyGoalOverlay } from '@/components/screens/daily-goal-overlay';

// Inside RewardInner, after result is set:
const todayStr = new Date().toISOString().slice(0, 10);
const dailyMin = 15; // TODO: read from state.settings?.dailyMin ?? 15 once Phase 2D settings exist
const dailyGoalKey = `bap-daily-goal-${todayStr}`;

// Derive dailyGoalMet from result data (Phase 2D may add this to SessionResult):
const dailyGoalMet = result?.dailyGoalMet ?? false;

const [showDailyGoal, setShowDailyGoal] = useState(false);

useEffect(() => {
  if (dailyGoalMet && !localStorage.getItem(dailyGoalKey)) {
    setShowDailyGoal(true);
  }
}, [dailyGoalMet, dailyGoalKey]);

// Add after <RewardContent /> render:
{showDailyGoal && (
  <DailyGoalOverlay
    elapsedMin={dailyMin}
    dailyMin={dailyMin}
    onContinue={() => {
      localStorage.setItem(dailyGoalKey, '1');
      router.push('/home');
    }}
  />
)}
```

Adds ~20 lines. File grows from 67 to ~87 lines.

**Note**: The `dailyGoalMet` boolean should ideally come from the session completion API response. If Phase 2D's `useSessionTimer` hook exposes `elapsedMin`, use `elapsedMin >= dailyMin` instead of a boolean flag.

## Todo List

- [ ] Modify `components/ui/streak-card.tsx` — add optional `onTap` prop
- [ ] Create `components/ui/streak-detail-sheet.tsx`
- [ ] Modify `components/screens/reward-content.tsx` — wire StreakCard onTap + streak detail sheet
- [ ] Modify `components/screens/parent-dashboard-content.tsx` — wire StreakCard onTap + streak detail sheet
- [ ] Check if Phase 2D already wires DailyGoalOverlay in reward page; if not, wire it
- [ ] Verify: tapping streak card in reward page opens monthly calendar sheet
- [ ] Verify: tapping streak card in parent dashboard opens monthly calendar sheet
- [ ] Verify: monthly calendar shows correct days for current month with completed markers
- [ ] Verify: daily goal overlay shows once per day when daily quota met
- [ ] Run `npx next build` — no compile errors

## Success Criteria

1. StreakCard is tappable in both reward page and parent dashboard
2. Streak detail sheet slides up showing monthly calendar with gold stars on completed days
3. Backdrop tap closes streak detail sheet
4. Session complete overlay shows when daily goal met (once per day)
5. "Go Home" dismisses overlay, sets localStorage, navigates to `/home`
6. All modified files under 200 lines

## Risk Assessment

- **Phase 2D dependency**: If Phase 2D's `daily-goal-overlay.tsx` does not exist yet, Session Complete cannot be wired. Mitigation: Phase 03 can be partially executed (streak detail first, session complete after Phase 2D ships).
- **weekData limited to 7 days**: Monthly calendar only shows completed markers for the current week. Days before the 7-day window show as empty even if completed. Mitigation: acceptable for MVP; a future API endpoint could return full-month data.
- **Streak card backward compat**: `onTap` is optional. Existing usages without `onTap` continue to work — card is just not clickable. No breaking change.

## Security Considerations

- No sensitive data in localStorage flags (boolean markers only)
- No new API calls — all data from existing props
- Calendar display is read-only, no user input

## Next Steps

- When Phase 2D ships `daily-goal-overlay.tsx`, verify Session Complete wiring works end-to-end
- Future enhancement: API endpoint returning full-month completion data for richer calendar

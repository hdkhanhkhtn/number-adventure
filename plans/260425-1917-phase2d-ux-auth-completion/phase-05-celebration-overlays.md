# Phase 05 — Celebration & Confirmation Overlays

## Context Links

- [Parent plan](./plan.md)
- [Overlay research](./research/researcher-testing-overlay.md) — section 2 (Overlay Patterns)
- Worlds page: `app/(child)/worlds/page.tsx`
- World detail: `app/(child)/worlds/[worldId]/page.tsx`
- Reward page: `app/(child)/reward/page.tsx`
- Play page: `app/(child)/play/[gameType]/[lessonId]/page.tsx`
- Existing decoratives: `components/ui/sparkles.tsx`, `components/ui/confetti.tsx`
- BapMascot: `components/ui/bap-mascot.tsx`
- GameHud (has onClose): `components/game/game-hud.tsx`

## Overview

- **Priority**: P1
- **Status**: pending
- **Description**: Three overlay/modal UIs that close critical retention loops. (A) Exit game confirmation modal — prevents accidental progress loss. (B) World unlock celebration — rewards milestone moments. (C) Daily goal complete screen — celebrates meeting daily play target.

## Key Insights

- No global overlay/modal system exists — all overlays use `useState` local boolean + fixed div (see `parent-gate.tsx`)
- `Confetti` and `Sparkles` are inline decorative components, pointer-events:none — already used in `reward-content.tsx` and `worlds/page.tsx`
- `BapMascot` accepts `mood` prop — use `'excited'` for celebrations
- World unlock state must be detected on first access — compare current progress with previously-seen progress
- Daily goal check: compare `elapsedMin` from `useSessionTimer` against `dailyMin` setting

## Requirements

### Functional — Exit Game Confirmation (Item 7)
- FR1: When child taps the back/exit button in `GameHud` during active gameplay, show confirmation modal
- FR2: Modal text: "Quit game? Your progress will be lost."
- FR3: Two buttons: "Stay" (dismiss modal, continue game) and "Quit" (navigate to world detail or home)
- FR4: Modal does not appear on reward screen or after game completion

### Functional — World Unlock Celebration (Item 8)
- FR5: When child navigates to a world that was just unlocked (first-time access), show celebration overlay
- FR6: Overlay shows Confetti + Sparkles + BapMascot (excited mood) + world name
- FR7: Auto-dismiss after 2.5 seconds OR dismiss on tap
- FR8: Track "seen" unlock celebrations in localStorage to avoid re-showing

### Functional — Daily Goal Complete (Item 9)
- FR9: After a game session completes, if `dailyMin` has been met for the day, show celebration screen
- FR10: Screen shows: "Daily goal reached!" + BapMascot (excited) + Confetti + star count
- FR11: "Go Home" button returns to `/home`
- FR12: Only shows once per day (localStorage flag `bap-daily-goal-{YYYY-MM-DD}`)

### Non-Functional
- NFR1: All overlays use fixed position, z-50, pointer-events auto (blocks interaction below)
- NFR2: Overlays render inline via `useState` — no portal, no context provider
- NFR3: Animations via Framer Motion `AnimatePresence` where already imported; CSS fallback otherwise

## Architecture

```
Exit Confirmation:
  GameHud.onClose → instead of direct exit, set showExitConfirm=true
  ExitConfirmModal renders conditionally in play page
  Stay → dismiss; Quit → completeSession(abandoned) + router navigate

World Unlock Celebration:
  worlds/[worldId]/page.tsx on mount
  → check localStorage bap-seen-unlock-{worldId}
  → if not seen AND world was recently unlocked → show overlay 2.5s
  → set localStorage flag after dismissal

Daily Goal Complete:
  reward/page.tsx (post-game)
  → check useSessionTimer.elapsedMin >= dailyMin
  → check localStorage bap-daily-goal-{date} not set
  → if both true → show DailyGoalOverlay instead of normal reward
  → set localStorage flag
```

## Related Code Files

### CREATE
- `components/game/exit-confirm-modal.tsx` — "Quit game?" confirmation overlay
- `components/screens/world-unlock-overlay.tsx` — confetti celebration for new world
- `components/screens/daily-goal-overlay.tsx` — "Daily goal reached!" celebration

### MODIFY
- `app/(child)/play/[gameType]/[lessonId]/page.tsx` — wire exit confirmation modal
- `app/(child)/worlds/[worldId]/page.tsx` — add world unlock celebration check
- `app/(child)/reward/page.tsx` — add daily goal check after game completion

## Implementation Steps

### Step 1: Create `components/game/exit-confirm-modal.tsx`

Props: `onStay: () => void`, `onQuit: () => void`.

```tsx
export function ExitConfirmModal({ onStay, onQuit }: { onStay: () => void; onQuit: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.4)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#FFF8EC', borderRadius: 24, padding: '28px 24px',
        maxWidth: 300, width: '85%', textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🤔</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#2D3A2E', marginBottom: 8 }}>
          Quit game?
        </div>
        <div style={{ fontSize: 14, color: '#6B7A6C', marginBottom: 20 }}>
          Your progress will be lost.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onQuit} style={{
            flex: 1, padding: 12, borderRadius: 14, fontSize: 15, fontWeight: 700,
            background: '#F0EADC', color: '#6B7A6C', border: 'none', cursor: 'pointer',
          }}>Quit</button>
          <button onClick={onStay} style={{
            flex: 1, padding: 12, borderRadius: 14, fontSize: 15, fontWeight: 700,
            background: '#2E5A3A', color: '#fff', border: 'none', cursor: 'pointer',
          }}>Stay</button>
        </div>
      </div>
    </div>
  );
}
```

### Step 2: Wire exit confirmation in play page

In `app/(child)/play/[gameType]/[lessonId]/page.tsx`:

1. Add state: `const [showExitConfirm, setShowExitConfirm] = useState(false)`
2. Change `onExit` callback passed to game components: instead of `() => router.back()`, use `() => setShowExitConfirm(true)`
3. Render at bottom of JSX:

```tsx
{showExitConfirm && (
  <ExitConfirmModal
    onStay={() => setShowExitConfirm(false)}
    onQuit={() => { completeSession({ stars: 0 }); router.push(`/worlds/${lesson?.worldId ?? ''}`); }}
  />
)}
```

### Step 3: Create `components/screens/world-unlock-overlay.tsx`

Props: `worldName: string`, `worldEmoji: string`, `onDismiss: () => void`.

- Fixed fullscreen z-50, semi-transparent backdrop
- `Confetti count={40}` + `Sparkles count={14} color="#FFB84A"`
- `BapMascot size={80} mood="excited"`
- World name + "Unlocked!" text
- Auto-dismiss via `useEffect(() => { const t = setTimeout(onDismiss, 2500); return () => clearTimeout(t); }, [])`
- Also dismiss on tap (onClick on backdrop)

### Step 4: Wire world unlock celebration in `app/(child)/worlds/[worldId]/page.tsx`

1. On mount, after progress loads, check if world is unlocked
2. Check localStorage: `bap-seen-unlock-{worldId}`
3. If world is unlocked AND flag not set:
   - Set `showUnlockCelebration = true`
   - On dismiss: `localStorage.setItem('bap-seen-unlock-{worldId}', '1')`

```tsx
const [showUnlockCelebration, setShowUnlockCelebration] = useState(false);

useEffect(() => {
  if (!worldData?.unlocked) return;
  const key = `bap-seen-unlock-${worldId}`;
  if (!localStorage.getItem(key)) {
    setShowUnlockCelebration(true);
  }
}, [worldData?.unlocked, worldId]);

const handleDismissUnlock = () => {
  setShowUnlockCelebration(false);
  localStorage.setItem(`bap-seen-unlock-${worldId}`, '1');
};
```

### Step 5: Create `components/screens/daily-goal-overlay.tsx`

Props: `elapsedMin: number`, `dailyMin: number`, `onContinue: () => void`.

- Fixed fullscreen z-50, gradient backdrop
- Confetti + Sparkles + BapMascot (excited, size 80)
- "Daily goal reached!" heading
- "{elapsedMin} / {dailyMin} minutes played today" subtext
- "Go Home" button calling `onContinue`

### Step 6: Wire daily goal check in `app/(child)/reward/page.tsx`

1. Import `useSessionTimer` (from Phase 03) to get `elapsedMin` and `timeUp`
2. Read `dailyMin` from `state.settings?.dailyMin ?? 15`
3. Check localStorage flag: `bap-daily-goal-{today-date}`
4. If `elapsedMin >= dailyMin` AND flag not set:
   - Show `DailyGoalOverlay` instead of (or after) normal reward
   - On continue: set flag, navigate to `/home`

```tsx
const showDailyGoal = elapsedMin >= dailyMin && !localStorage.getItem(`bap-daily-goal-${todayStr}`);

// After reward display:
{showDailyGoal && (
  <DailyGoalOverlay
    elapsedMin={elapsedMin} dailyMin={dailyMin}
    onContinue={() => {
      localStorage.setItem(`bap-daily-goal-${todayStr}`, '1');
      router.push('/home');
    }}
  />
)}
```

## Todo List

- [ ] Create `components/game/exit-confirm-modal.tsx`
- [ ] Wire exit confirmation in play page `onExit` callback
- [ ] Create `components/screens/world-unlock-overlay.tsx`
- [ ] Wire world unlock check in `app/(child)/worlds/[worldId]/page.tsx`
- [ ] Create `components/screens/daily-goal-overlay.tsx`
- [ ] Wire daily goal check in `app/(child)/reward/page.tsx`
- [ ] Test: tapping exit during game shows confirmation; "Stay" resumes; "Quit" navigates away
- [ ] Test: first visit to unlocked world shows celebration; second visit does not
- [ ] Test: daily goal overlay shows once per day when dailyMin met
- [ ] Test: auto-dismiss on world unlock after 2.5s

## Success Criteria

1. Exit button during active game shows confirmation modal (not immediate exit)
2. "Stay" dismisses modal, game continues; "Quit" abandons session and navigates
3. First access to newly unlocked world shows confetti celebration for 2.5s
4. Celebration does not re-show on subsequent visits (localStorage flag)
5. After game completion, if dailyMin met, daily goal celebration shows before home
6. Daily goal celebration shows only once per day

## Risk Assessment

- **World unlock detection**: Relies on progress API already loading `unlocked` status. If world was unlocked before this code deploys, all worlds appear "just unlocked". Mitigate: on first deploy, seed localStorage flags for all currently-unlocked worlds via a one-time migration script in the world detail page.
- **Exit modal during answer animation**: If child taps exit while answer feedback is animating, modal appears on top. Acceptable — "Stay" resumes normally.

## Security Considerations

- No sensitive data in localStorage flags (just boolean markers)
- Exit confirmation prevents accidental session abandonment (UX, not security)
- No API calls in overlay components themselves — all state is local

## Next Steps

- Phase 2E: Sticker Earn Moment overlay (similar pattern to daily goal)
- Phase 2E: Session Complete screen variant

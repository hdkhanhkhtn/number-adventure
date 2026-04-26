# Research: Component Tests & Overlay Patterns

## Area 1: Component Tests for Interactive Game UIs

### Established Pattern (from `game-hud.test.tsx`)

- Location: `__tests__/components/{subdir}/` — NOT co-located
- File naming: `*.test.tsx` (not `*.spec.tsx`) — matches `testMatch` glob in `jest.config.ts`
- Test environment declared via docblock: `@jest-environment jsdom` (game-hud uses default node env from jest.config; component tests that need DOM need `@jest-environment jsdom`)
- Imports: `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`
- Mocking pattern: `jest.mock('@/components/...')` inline stubs returning simplified JSX

### Framer Motion in Tests

`number-writing-game.tsx` uses `motion.button` from framer-motion. Framer Motion v6+ requires `jest.mock('framer-motion')` or it errors in jsdom. Standard approach:

```ts
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, ...props }: any) =>
      React.createElement('button', { onClick, ...props }, children),
    div: ({ children, ...props }: any) =>
      React.createElement('div', props, children),
  },
  AnimatePresence: ({ children }: any) => children,
}));
```

### Mocking `useGame` and `useAudio`

```ts
// Mock useGame — return controlled state + handlers
jest.mock('@/lib/hooks/use-game', () => ({
  useGame: jest.fn(),
}));

beforeEach(() => {
  (useGame as jest.Mock).mockReturnValue({
    currentQuestion: mockQuestions[0],
    round: 0,
    hearts: 3,
    answerFeedback: null,
    handleAnswer: jest.fn(),
  });
});

// Mock useAudio — no-op (audio not testable in jsdom)
jest.mock('@/lib/hooks/use-audio', () => ({
  useAudio: () => ({ play: jest.fn(), stop: jest.fn() }),
}));
```

### Testing Tap Interactions

```ts
it('calls handleAnswer when answer button tapped', async () => {
  const handleAnswer = jest.fn();
  (useGame as jest.Mock).mockReturnValue({ ...defaults, handleAnswer });
  const user = userEvent.setup();
  render(<CountObjectsGame questions={mockQuestions} onComplete={jest.fn()} onExit={jest.fn()} />);
  await user.click(screen.getByRole('button', { name: /^3$/i }));
  expect(handleAnswer).toHaveBeenCalledWith(3);
});
```

### Testing Completion Trigger

`useGame` calls `onComplete` internally when `round >= totalRounds`. In component tests, trigger by mocking `useGame` to immediately invoke `onComplete`:

```ts
it('fires onComplete after all questions answered', () => {
  const onComplete = jest.fn();
  (useGame as jest.Mock).mockImplementation((_qs, cb) => {
    cb({ stars: 3, correct: 5, total: 5 }); // simulate instant completion
    return { currentQuestion: null, round: 5, hearts: 3, answerFeedback: null, handleAnswer: jest.fn() };
  });
  render(<CountObjectsGame questions={mockQ} onComplete={onComplete} onExit={jest.fn()} />);
  expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ stars: 3 }));
});
```

### New test file locations

- `__tests__/components/game/count-objects-game.test.tsx`
- `__tests__/components/game/number-writing-game.test.tsx`

---

## Area 2: Overlay/Celebration Screen Patterns

### Current Celebration Pattern

- `Confetti` and `Sparkles` are **purely decorative, pointer-events: none** components with CSS animations. They are embedded inline inside screen components (e.g., `reward-content.tsx`, `worlds/page.tsx`, `count-objects-game.tsx`).
- `Sparkles` used inline in worlds page for ambient effects; in `reward-content` for burst effect.
- **No existing modal/overlay system** — no Context-based global overlay, no `<dialog>`, no portal pattern found.

### Recommendation: Option B — Modal overlay rendered conditionally in parent component

**Reasoning:**
- Existing `reward/page.tsx` uses **route-based navigation** (sessionStorage handoff + `router.push('/reward')`). For `World Unlock` this adds friction (full page transition for a transient celebration).
- No global Context overlay exists; introducing one (Option C) is overengineering for 2 screens (YAGNI).
- Option A (new routes) means the parent loses context needed to show "which world unlocked".
- Option B matches how `Sparkles` is already used: conditionally rendered in `worlds/page.tsx` when a world is unlocked.

**Pattern to follow (matches existing code style):**

```tsx
// In worlds/page.tsx or [worldId]/page.tsx
const [showUnlockCelebration, setShowUnlockCelebration] = useState(false);
const [unlockedWorldName, setUnlockedWorldName] = useState('');

// After progress update that triggers unlock:
setShowUnlockCelebration(true);

// Render overlay conditionally:
{showUnlockCelebration && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <Confetti count={40} />
    <Sparkles count={14} color="#FFB84A" />
    <WorldUnlockCard
      worldName={unlockedWorldName}
      onContinue={() => setShowUnlockCelebration(false)}
    />
  </div>
)}
```

**Daily Goal Complete** — same pattern, state lives in whichever page triggers the check (likely `reward/page.tsx` or a post-game route). No new route needed.

**Anti-pattern to avoid:** Do NOT use `sessionStorage` for overlay state (already used for game results — adding more creates fragile coordination). Keep overlay state local via `useState`.

---

## Unresolved Questions

1. Where exactly is world-unlock status checked? In `worlds/page.tsx` on progress load, or after game completion? Determines which component owns `showUnlockCelebration` state.
2. Does `useAudio` hook exist at `@/lib/hooks/use-audio`? Grep showed no usage in game files — confirm hook name before mocking.
3. Jest config `testEnvironment: 'node'` is global default — component tests need `@jest-environment jsdom` docblock confirmed in each test file.

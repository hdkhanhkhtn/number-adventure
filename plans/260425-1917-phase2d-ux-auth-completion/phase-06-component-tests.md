# Phase 06 — Component Tests for New Game UIs

## Context Links

- [Parent plan](./plan.md)
- [Testing research](./research/researcher-testing-overlay.md) — section 1 (Component Tests)
- Existing test pattern: `__tests__/components/game/game-hud.test.tsx`
- CountObjectsGame: `app/(child)/play/[gameType]/[lessonId]/count-objects-game.tsx`
- NumberWritingGame: `app/(child)/play/[gameType]/[lessonId]/number-writing-game.tsx`
- useGame hook: `lib/hooks/use-game.ts`
- useSoundEffects hook: `lib/hooks/use-sound-effects.ts`
- Jest config: `jest.config.ts`
- Game types: `lib/game-engine/types.ts`

## Overview

- **Priority**: P0
- **Status**: pending
- **Description**: Add component-level tests for `CountObjectsGame` and `NumberWritingGame` — the two game UIs added in Phase 2C that currently have engine tests but no UI tests. Tests verify render, tap interaction, and completion callback. Mock `framer-motion`, `useGame`, and `useSoundEffects` at module level.

## Key Insights

- `game-hud.test.tsx` establishes the project test pattern: `@jest-environment jsdom` docblock, `@testing-library/react` + `userEvent`, inline `jest.mock()` for child components
- `CountObjectsGame` uses `useGame` (from `@/lib/hooks/use-game`), `useSoundEffects`, `NumTile`, `GameContainer`, `GameHud`, `Sparkles`
- `NumberWritingGame` additionally imports `motion` from `framer-motion` for `motion.button` — requires module mock
- Both components accept `{ questions, onComplete, onExit, onAttempt }` props
- `useGame` returns `{ round, hearts, question, totalRounds, handleCorrect, handleWrong }` — mock this to control test state
- `useSoundEffects` returns `{ playCorrect, playWrong, playLevelComplete }` — mock with `jest.fn()` no-ops
- `CountObjectsQuestion` has `{ type, target, choices, variant, emoji }` shape
- `NumberWritingQuestion` has `{ type, digit, dotCount }` shape; component uses `DIGIT_SVG_PATHS`

## Requirements

### Functional
- FR1: `count-objects-game.test.tsx` — test: renders question prompt, renders answer choices, correct tap calls handleCorrect, wrong tap calls handleWrong, completion fires onComplete
- FR2: `number-writing-game.test.tsx` — test: renders digit display, renders dot buttons, correct dot tap sequence completes digit, wrong dot tap calls handleWrong, completion fires onComplete
- FR3: Both test files use `@jest-environment jsdom` docblock
- FR4: Both mock `framer-motion`, `useGame`, `useSoundEffects`, and UI sub-components

### Non-Functional
- NFR1: Tests run via `npx jest __tests__/components/game/` without errors
- NFR2: Each test file targets 5-8 test cases covering render, interaction, completion
- NFR3: No flaky async tests — use `userEvent.setup()` for synchronous-like interaction

## Architecture

```
__tests__/components/game/
  ├── game-hud.test.tsx          (existing)
  ├── count-objects-game.test.tsx (new)
  └── number-writing-game.test.tsx (new)

Each test file:
  1. Docblock: @jest-environment jsdom
  2. Module mocks: framer-motion, useGame, useSoundEffects, sub-components
  3. Mock data: sample questions matching type schema
  4. Test suite: describe block with 5-8 it() cases
```

## Related Code Files

### CREATE
- `__tests__/components/game/count-objects-game.test.tsx`
- `__tests__/components/game/number-writing-game.test.tsx`

### READ (for reference, no modification)
- `app/(child)/play/[gameType]/[lessonId]/count-objects-game.tsx`
- `app/(child)/play/[gameType]/[lessonId]/number-writing-game.tsx`
- `lib/hooks/use-game.ts` — return type for mock shape
- `lib/game-engine/types.ts` — question type definitions
- `__tests__/components/game/game-hud.test.tsx` — pattern reference

## Implementation Steps

### Step 1: Create `__tests__/components/game/count-objects-game.test.tsx`

```typescript
/**
 * @jest-environment jsdom
 *
 * Tests for CountObjectsGame — tap the correct count from visual objects
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
```

**Module mocks** (before imports of tested component):

```typescript
// Mock framer-motion (not directly used by CountObjectsGame but may be transitive)
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_t, prop) => React.forwardRef(({ children, ...p }: any, ref: any) =>
      React.createElement(prop as string, { ...p, ref }, children)),
  }),
  AnimatePresence: ({ children }: any) => children,
}));

// Mock useGame — return controlled state
const mockHandleCorrect = jest.fn();
const mockHandleWrong = jest.fn();
jest.mock('@/lib/hooks/use-game', () => ({
  useGame: jest.fn(),
}));

// Mock useSoundEffects — no-op audio
jest.mock('@/lib/hooks/use-sound-effects', () => ({
  useSoundEffects: () => ({
    playCorrect: jest.fn(), playWrong: jest.fn(), playLevelComplete: jest.fn(),
  }),
}));

// Mock sub-components to isolate
jest.mock('@/components/game/game-container', () => ({
  GameContainer: ({ children }: any) => <div data-testid="game-container">{children}</div>,
}));
jest.mock('@/components/game/game-hud', () => ({
  GameHud: ({ onClose }: any) => <button data-testid="game-hud-close" onClick={onClose}>X</button>,
}));
jest.mock('@/components/ui/sparkles', () => ({
  Sparkles: () => null,
}));
jest.mock('@/components/ui/num-tile', () => ({
  NumTile: ({ n, onClick, state: tileState }: any) => (
    <button data-testid={`num-tile-${n}`} onClick={() => onClick?.()} data-state={tileState}>
      {n}
    </button>
  ),
}));
```

**Mock question data**:

```typescript
const mockQuestions = [
  { type: 'count-objects' as const, target: 3, choices: [1, 2, 3, 4], variant: 'apple' as const, emoji: '🍎' },
  { type: 'count-objects' as const, target: 5, choices: [3, 4, 5, 6], variant: 'star' as const, emoji: '⭐' },
];
```

**Test cases** (5-7 cases):

1. `renders game container and HUD` — check `data-testid="game-container"` and hud-close present
2. `renders answer choice tiles for current question` — verify 4 NumTile buttons rendered with correct numbers
3. `renders object emoji for current question` — check emoji text visible
4. `calls handleCorrect when correct answer tapped` — mock useGame, tap correct tile, assert handleCorrect called
5. `calls handleWrong when wrong answer tapped` — tap wrong tile, assert handleWrong called
6. `calls onExit when HUD close button clicked` — click close button, assert onExit called
7. `fires onComplete when useGame triggers completion` — mock useGame to invoke onComplete callback, assert prop called

### Step 2: Create `__tests__/components/game/number-writing-game.test.tsx`

```typescript
/**
 * @jest-environment jsdom
 *
 * Tests for NumberWritingGame — tap dots in sequence to trace a digit
 */
```

**Module mocks** — same pattern as Step 1, plus:

```typescript
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_t, prop) => React.forwardRef(({ children, ...p }: any, ref: any) =>
      React.createElement(prop as string, { ...p, ref }, children)),
  }),
  AnimatePresence: ({ children }: any) => children,
}));

// Mock DIGIT_SVG_PATHS (returns simple path data)
jest.mock('@/lib/game-engine/dot-paths', () => ({
  DIGIT_SVG_PATHS: {
    0: { dots: [{ x: 50, y: 50, label: 1 }, { x: 100, y: 100, label: 2 }], path: 'M50,50 L100,100' },
    1: { dots: [{ x: 50, y: 50, label: 1 }], path: 'M50,50' },
    // ... minimal mock for test digits
  },
}));
```

**Mock question data**:

```typescript
const mockQuestions = [
  { type: 'number-writing' as const, digit: 1, dotCount: 3 },
  { type: 'number-writing' as const, digit: 2, dotCount: 5 },
];
```

**Test cases** (5-7 cases):

1. `renders game container and HUD` — verify container and HUD present
2. `renders digit display showing target number` — check digit "1" visible
3. `renders dot buttons for tracing` — check dot elements rendered (by role or test-id)
4. `tapping correct next dot marks it as completed` — tap dot with label matching `nextLabel`, verify state change
5. `tapping wrong dot calls handleWrong` — tap out-of-sequence dot, assert handleWrong called
6. `calls onExit when HUD close clicked` — assert onExit callback
7. `fires onComplete after all questions traced` — mock useGame completion, assert onComplete called

### Step 3: Run tests and verify

```bash
cd /Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure
npx jest __tests__/components/game/ --verbose
```

Verify all tests pass. Fix any import path or mock shape mismatches.

### Step 4: Verify no regressions in existing game-hud tests

```bash
npx jest __tests__/components/game/game-hud.test.tsx --verbose
```

Ensure the existing 14 tests still pass unchanged.

## Todo List

- [ ] Create `__tests__/components/game/count-objects-game.test.tsx` with 5-7 test cases
- [ ] Create `__tests__/components/game/number-writing-game.test.tsx` with 5-7 test cases
- [ ] Mock `framer-motion` at module level in both files
- [ ] Mock `useGame` with controllable return values
- [ ] Mock `useSoundEffects` as no-ops
- [ ] Mock sub-components (`GameContainer`, `GameHud`, `NumTile`, `Sparkles`)
- [ ] Mock `DIGIT_SVG_PATHS` for number-writing tests
- [ ] Run `npx jest __tests__/components/game/ --verbose` — all tests pass
- [ ] Verify existing `game-hud.test.tsx` still passes (no regressions)

## Success Criteria

1. `npx jest __tests__/components/game/count-objects-game.test.tsx` — all tests pass
2. `npx jest __tests__/components/game/number-writing-game.test.tsx` — all tests pass
3. `npx jest __tests__/components/game/game-hud.test.tsx` — existing 14 tests still pass
4. Each test file covers: render, tap interaction (correct + wrong), exit, completion
5. No new npm packages added for testing
6. Tests run in under 10 seconds total

## Risk Assessment

- **Mock shape mismatch**: `useGame` return type may differ from expected mock shape. Verify against `lib/hooks/use-game.ts` return type before writing mocks.
- **framer-motion Proxy mock**: The Proxy-based mock for `motion` may not handle all element types. If specific elements fail, add explicit entries (`motion.button`, `motion.div`, `motion.svg`).
- **DIGIT_SVG_PATHS structure**: Mock must match actual exported shape. Read `lib/game-engine/dot-paths.ts` to confirm `{ dots: DotPoint[], path: string }` structure.
- **Component import path**: Game components live in `app/(child)/play/[gameType]/[lessonId]/` — jest moduleNameMapper (`@/`) must resolve correctly. Verify in `jest.config.ts`.

## Security Considerations

- Tests do not interact with real APIs or databases
- No sensitive data in mock question data
- Test files are excluded from production builds (in `__tests__/` directory)

## Next Steps

- After all Phase 2D items complete, run full test suite: `npx jest --verbose`
- Phase 2E: add integration tests for auth flow (PIN verify + session)

# Phase 01 -- Game Registry Refactor

## Context Links

- Parent plan: `plans/260425-1100-phase2c-worlds-game-types-audio/plan.md`
- Current switch-case: `lib/game-engine/question-loader.ts`
- GameType union: `lib/types/common.ts` (lines 21-26)
- Question types: `lib/game-engine/types.ts`
- Play page GAME_MAP: `app/(child)/play/[gameType]/[lessonId]/page.tsx` (lines 26-32)
- AI endpoint: `app/api/ai/generate-questions/route.ts`
- Existing engines: `lib/game-engine/{hear-tap,build-number,even-odd,number-order,add-take}-engine.ts`

## Overview

- **Priority**: P1 (blocking -- Phases 02/03 depend on this)
- **Status**: pending
- **Description**: Replace hardcoded GameType union and switch-case dispatch with a central
  `GAME_REGISTRY` object. GameType becomes derived from registry keys. Adding a new game type
  without updating the registry produces an immediate compile error.

## Key Insights

- All 5 engine files follow identical pattern: export `generateXxxQuestion()` + `generateXxxQuestions(count)`
- `question-loader.ts` switch has no difficulty param -- functions ignore it (except hear-tap uses `max`)
- Play page already has `GAME_MAP` -- registry-like but uses direct imports
- AI endpoint has `QUESTION_SCHEMAS` and `isValidQuestion` switch -- both need registry entries
- `VALID_GAME_TYPES` array appears in both play page and AI route -- will be derived from registry

## Requirements

### Functional
- R1: Central `GAME_REGISTRY` object in `lib/game-engine/registry.ts`
- R2: `GameType` derived from `keyof typeof GAME_REGISTRY` (no hardcoded union)
- R3: `question-loader.ts` switch replaced with registry lookup
- R4: All 5 existing games continue to work identically
- R5: `assertNever` helper for exhaustiveness checking

### Non-Functional
- NF1: Zero runtime behavior change -- pure refactor
- NF2: `npx tsc --noEmit` passes
- NF3: Adding a game key to registry without matching engine = compile error

## Architecture

```
GAME_REGISTRY (lib/game-engine/registry.ts)
  keys: 'hear-tap' | 'build-number' | 'even-odd' | 'number-order' | 'add-take'
  values: { generateQuestions(count, difficulty) }
         |
         v
GameType = keyof typeof GAME_REGISTRY  (lib/types/common.ts -- derived)
         |
         v
question-loader.ts: GAME_REGISTRY[gameType].generateQuestions(count, difficulty)
```

## Related Code Files

### Files to CREATE
- `lib/game-engine/registry.ts` -- GAME_REGISTRY + GameEngine interface + assertNever

### Files to MODIFY
- `lib/types/common.ts` -- derive GameType from registry
- `lib/game-engine/types.ts` -- add re-export of GameEngine, keep AnyQuestion as-is
- `lib/game-engine/question-loader.ts` -- replace switch with registry lookup
- `lib/game-engine/hear-tap-engine.ts` -- add GameEngine-conforming default export
- `lib/game-engine/build-number-engine.ts` -- add GameEngine-conforming default export
- `lib/game-engine/even-odd-engine.ts` -- add GameEngine-conforming default export
- `lib/game-engine/number-order-engine.ts` -- add GameEngine-conforming default export
- `lib/game-engine/add-take-engine.ts` -- add GameEngine-conforming default export

## Implementation Steps

### Step 1: Create `lib/game-engine/registry.ts`

```typescript
import type { AnyQuestion } from './types';

// ── GameEngine interface ──────────────────────────────────
export interface GameEngine {
  generateQuestions(count: number, difficulty?: 'easy' | 'medium' | 'hard'): AnyQuestion[];
}

// ── assertNever helper ────────────────────────────────────
export function assertNever(x: never): never {
  throw new Error(`Unhandled value: ${JSON.stringify(x)}`);
}

// ── Engine imports ────────────────────────────────────────
import { hearTapEngine } from './hear-tap-engine';
import { buildNumberEngine } from './build-number-engine';
import { evenOddEngine } from './even-odd-engine';
import { numberOrderEngine } from './number-order-engine';
import { addTakeEngine } from './add-take-engine';

// ── Central registry ──────────────────────────────────────
export const GAME_REGISTRY = {
  'hear-tap': hearTapEngine,
  'build-number': buildNumberEngine,
  'even-odd': evenOddEngine,
  'number-order': numberOrderEngine,
  'add-take': addTakeEngine,
} satisfies Record<string, GameEngine>;
```

### Step 2: Update each engine file to export a `GameEngine` object

Each file keeps its existing named exports (backward compatible) and adds a new named export.

**`lib/game-engine/hear-tap-engine.ts`** -- append after existing code:

```typescript
import type { GameEngine } from './registry';

export const hearTapEngine: GameEngine = {
  generateQuestions: (count, difficulty) => {
    const maxMap = { easy: 10, medium: 20, hard: 100 };
    return generateHearTapQuestions(count, maxMap[difficulty ?? 'easy']);
  },
};
```

**`lib/game-engine/build-number-engine.ts`** -- append:

```typescript
import type { GameEngine } from './registry';

export const buildNumberEngine: GameEngine = {
  generateQuestions: (count) => generateBuildNumberQuestions(count),
};
```

**`lib/game-engine/even-odd-engine.ts`** -- append:

```typescript
import type { GameEngine } from './registry';

export const evenOddEngine: GameEngine = {
  generateQuestions: (count) => generateEvenOddQuestions(count),
};
```

**`lib/game-engine/number-order-engine.ts`** -- append:

```typescript
import type { GameEngine } from './registry';

export const numberOrderEngine: GameEngine = {
  generateQuestions: (count) => generateNumberOrderQuestions(count),
};
```

**`lib/game-engine/add-take-engine.ts`** -- append:

```typescript
import type { GameEngine } from './registry';

export const addTakeEngine: GameEngine = {
  generateQuestions: (count) => generateAddTakeQuestions(count),
};
```

**IMPORTANT: Circular import note.** Each engine imports `GameEngine` type from `registry.ts`,
and `registry.ts` imports the engine objects from each engine file. This is safe because:
- The `GameEngine` import is a **type-only** import (erased at runtime)
- Use `import type { GameEngine }` to make this explicit and avoid any runtime circular dependency

Change all engine files to use `import type`:
```typescript
import type { GameEngine } from './registry';
```

### Step 3: Derive GameType in `lib/types/common.ts`

Replace the hardcoded union (lines 21-26):

**Before:**
```typescript
export type GameType =
  | 'hear-tap'
  | 'build-number'
  | 'even-odd'
  | 'number-order'
  | 'add-take';
```

**After:**
```typescript
import type { GAME_REGISTRY } from '@/lib/game-engine/registry';

export type GameType = keyof typeof GAME_REGISTRY;
```

**IMPORTANT: Circular import consideration.** `registry.ts` imports engines, engines import
`types.ts` for question interfaces, and `types.ts` re-exports `GameType` from `common.ts`.
If `common.ts` imports from `registry.ts`, we get a circular chain. The safe solution:
use a **type-only** import. TypeScript erases type-only imports at compile time, so no
runtime circular dependency exists.

Verify the import uses `import type` (not `import`).

### Step 4: Replace switch in `lib/game-engine/question-loader.ts`

**Full replacement:**

```typescript
import type { AnyQuestion } from './types';
import type { GameType } from '@/lib/types/common';
import { GAME_REGISTRY } from './registry';

/** Generate questions locally based on game type (fallback when AI is unavailable) */
export function generateLocalQuestions(
  gameType: GameType,
  count: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'easy',
): AnyQuestion[] {
  const engine = GAME_REGISTRY[gameType];
  return engine.generateQuestions(count, difficulty);
}

/**
 * Load questions for a lesson: tries AI endpoint first, falls back to local engine.
 * Called from client components (browser).
 */
export async function loadQuestions(
  lessonId: string,
  gameType: GameType,
  count = 5,
  difficulty: 'easy' | 'medium' | 'hard' = 'easy',
): Promise<AnyQuestion[]> {
  try {
    const res = await fetch('/api/ai/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, gameType, count, difficulty }),
    });
    if (!res.ok) throw new Error('AI generation failed');
    const data = await res.json() as { questions: { id: string; payload: AnyQuestion }[] };
    return data.questions.map((q) => q.payload);
  } catch {
    return generateLocalQuestions(gameType, count, difficulty);
  }
}
```

Key change: `generateLocalQuestions` now accepts `difficulty` and passes it through.

### Step 5: Update AI endpoint VALID_GAME_TYPES

In `app/api/ai/generate-questions/route.ts`, replace the hardcoded array (lines 8-10):

**Before:**
```typescript
const VALID_GAME_TYPES: GameType[] = [
  'hear-tap', 'build-number', 'even-odd', 'number-order', 'add-take',
];
```

**After:**
```typescript
import { GAME_REGISTRY } from '@/lib/game-engine/registry';

const VALID_GAME_TYPES = Object.keys(GAME_REGISTRY) as GameType[];
```

### Step 6: Update Play page VALID_GAME_TYPES

In `app/(child)/play/[gameType]/[lessonId]/page.tsx`, replace line 17:

**Before:**
```typescript
const VALID_GAME_TYPES: GameType[] = ['hear-tap', 'build-number', 'even-odd', 'number-order', 'add-take'];
```

**After:**
```typescript
import { GAME_REGISTRY } from '@/lib/game-engine/registry';

const VALID_GAME_TYPES = Object.keys(GAME_REGISTRY) as GameType[];
```

Note: The `GAME_MAP` component registry on the play page stays as-is for now. It maps
GameType to React components (not engines). New game components will be added in Phases 02/03.

## Todo List

- [ ] Create `lib/game-engine/registry.ts` with GameEngine interface + GAME_REGISTRY + assertNever
- [ ] Add `hearTapEngine` export to `lib/game-engine/hear-tap-engine.ts`
- [ ] Add `buildNumberEngine` export to `lib/game-engine/build-number-engine.ts`
- [ ] Add `evenOddEngine` export to `lib/game-engine/even-odd-engine.ts`
- [ ] Add `numberOrderEngine` export to `lib/game-engine/number-order-engine.ts`
- [ ] Add `addTakeEngine` export to `lib/game-engine/add-take-engine.ts`
- [ ] Derive `GameType` from registry in `lib/types/common.ts`
- [ ] Replace switch-case in `lib/game-engine/question-loader.ts`
- [ ] Update `VALID_GAME_TYPES` in `app/api/ai/generate-questions/route.ts`
- [ ] Update `VALID_GAME_TYPES` in play page
- [ ] Run `npx tsc --noEmit` -- must pass
- [ ] Manually test: navigate to each of 5 game types, verify questions load

## Success Criteria

1. `npx tsc --noEmit` passes with zero errors
2. All 5 existing game types load questions and render correctly
3. `question-loader.ts` contains zero switch statements
4. `GameType` in `common.ts` is derived (no hardcoded union)
5. Adding a key to `GAME_REGISTRY` without a matching engine = compile error
6. Removing a key from `GAME_REGISTRY` makes downstream code using that key error

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Circular import at runtime | Medium | Build fails | Use `import type` for all cross-module type imports |
| Engine signature mismatch | Low | Compile error | `satisfies Record<string, GameEngine>` catches at definition site |
| Play page GAME_MAP out of sync | Low | Runtime 404 | GAME_MAP still uses direct imports -- unaffected by registry |

## Security Considerations

- No user input handling changes
- No API contract changes
- No authentication/authorization impact
- Pure internal refactor

## Next Steps

- Phase 02: Add `count-objects` engine + component to registry
- Phase 03: Add `number-writing` engine + component to registry

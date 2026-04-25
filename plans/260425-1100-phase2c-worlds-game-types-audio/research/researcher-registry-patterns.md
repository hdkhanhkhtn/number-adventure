## Research Report: Game Engine Registry Patterns & Extensible GameType (TypeScript)

### Executive Summary
For a Next.js 14 App Router project with ~7 engines and strict TypeScript: use an **object literal registry typed with `Record` + validated with `satisfies`** — it gives compile-time exhaustiveness, best tree-shaking, and minimal complexity. Extend `GameType` as a plain union and derive it from registry keys using `keyof typeof REGISTRY` to keep a single source of truth.

---

### Topic 1 — Game Engine Registry Patterns

#### Pattern Comparison

| Criterion | A) `Map<GameType, Engine>` | B) `Record<GameType, Engine>` | C) Class + Decorators |
|---|---|---|---|
| Exhaustiveness check | None — `Map.set()` is runtime-only | **Yes** — missing key = compile error | Requires metadata reflection, complex setup |
| Tree-shaking | Poor — `Map` class + all entries bundled | **Best** — static object, unused engines can be eliminated by bundler | Poor — decorators emit metadata, prevent elimination |
| Add new engine | `registry.set(...)` call anywhere | Add key to object + update `GameType` | Add class + decorator — scattered changes |
| Strict mode compat | Passes, but no compile guarantee | **Full** — `Record<GameType, GameEngine>` enforces all keys present | Requires `experimentalDecorators` or TS 5 decorator spec |
| Complexity (~7 engines) | Overkill | **Minimal** | Significant boilerplate |

#### Why `Record` wins for exhaustiveness

```typescript
// If GameType = 'hear-tap' | 'build-number' | 'even-odd' | ...
// Record<GameType, GameEngine> requires ALL keys to be present.
// Adding 'count-objects' to GameType without adding it here = compile error.
const REGISTRY: Record<GameType, GameEngine> = {
  'hear-tap': hearTapEngine,
  'build-number': buildNumberEngine,
  // missing 'count-objects' → TS error: Property 'count-objects' is missing
};
```

`Map` has no such guarantee — `registry.set(...)` is checked at runtime only.
- Source: [TypeScript: Record vs Map — DEV Community](https://dev.to/safal_bhandari/typescript-choosing-between-record-and-map-for-key-value-data-514a) — Confidence: High

#### Tree-shaking: Record vs Map

Next.js 14 uses webpack (stable) or Turbopack (beta). Both can eliminate dead code from ES module static object literals. `Map` instances require runtime class evaluation and prevent static analysis of entries. A `Record` object literal with named imports per engine allows bundlers to drop engines not referenced elsewhere.

```typescript
// Preferred — static, tree-shakeable per engine module
import { hearTapEngine } from './engines/hear-tap';
import { buildNumberEngine } from './engines/build-number';

const REGISTRY: Record<GameType, GameEngine> = {
  'hear-tap': hearTapEngine,
  'build-number': buildNumberEngine,
};
```
- Source: [Tree-Shaking Reference Guide — Smashing Magazine](https://www.smashingmagazine.com/2021/05/tree-shaking-reference-guide/) — Confidence: High

#### Recommended pattern for ~7 engines

Use **Pattern B** (`Record`) with `satisfies` for belt-and-suspenders checking:

```typescript
export type GameType = keyof typeof REGISTRY; // derived — single source of truth

const REGISTRY = {
  'hear-tap': hearTapEngine,
  'build-number': buildNumberEngine,
  'even-odd': evenOddEngine,
  'number-order': numberOrderEngine,
  'add-take': addTakeEngine,
} satisfies Record<string, GameEngine>;

// Adding new engine: just add entry above; GameType updates automatically.
export function getEngine(type: GameType): GameEngine {
  return REGISTRY[type];
}
```

Decorators (Pattern C) are appropriate only for IoC containers and DI frameworks, not for a fixed 7-engine game registry. `Map` (Pattern A) fits dynamic runtime collections, not static config.

---

### Topic 2 — Extensible GameType with Discriminated Unions

#### Adding new types without breaking existing switches

The risk: adding `'count-objects'` to `GameType` silently falls through any existing `switch` with a `default` case. The fix is compile-time exhaustiveness enforcement.

**Step 1 — `assertNever` for switch exhaustiveness:**

```typescript
function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}

function handleGame(type: GameType) {
  switch (type) {
    case 'hear-tap': return ...;
    case 'build-number': return ...;
    // Adding 'count-objects' without a case here → TS error on assertNever line
    default: return assertNever(type);
  }
}
```
- Source: [Discriminated Unions and Exhaustiveness Checking — FullStory](https://www.fullstory.com/blog/discriminated-unions-and-exhaustiveness-checking-in-typescript/) — Confidence: High

**Step 2 — `satisfies never` inline pattern (TS 4.9+):**

```typescript
// In a handler function using control flow narrowing:
function handleGame(type: GameType) {
  if (type === 'hear-tap') return ...;
  if (type === 'build-number') return ...;
  // Force compile error if any GameType case unhandled:
  type satisfies never; // ← error here if 'count-objects' not handled above
}
```

This pattern is self-documenting and avoids a thrown runtime error.
- Source: [TypeScript `satisfies never` — DEV Community](https://dev.to/cefn/typescript-satisfies-never-exhaustiveness-checking-in-typescript-49-58fh) — Confidence: High

#### `satisfies` for registry completeness check

```typescript
// Option A: Type annotation (enforces all keys at definition site)
const REGISTRY: Record<GameType, GameEngine> = { ... };

// Option B: satisfies (keeps inferred type narrow, still enforces structure)
const REGISTRY = { ... } satisfies Record<GameType, GameEngine>;
// Advantage of B: REGISTRY['hear-tap'] infers HearTapEngine, not GameEngine
```

Prefer `satisfies` when you want both completeness enforcement AND per-engine type inference downstream.
- Source: [TypeScript Narrowing Handbook](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) — Confidence: High

#### Deriving `GameType` from registry keys

```typescript
// REGISTRY is source of truth; GameType is derived
const REGISTRY = { ... } satisfies Record<string, GameEngine>;
export type GameType = keyof typeof REGISTRY;
// Adding 'count-objects' to REGISTRY → GameType automatically includes it
// All exhaustive switches immediately get a compile error until handled
```

This is strictly better than maintaining `GameType` as a separate standalone union — one edit point, zero drift.

#### Extending `AnyQuestion` discriminated union

```typescript
// Current
type AnyQuestion =
  | { type: 'hear-tap'; number: number; audioUrl: string }
  | { type: 'build-number'; digits: number[] }
  | { type: 'even-odd'; number: number };

// Add new shape — no existing cases break
type AnyQuestion =
  | { type: 'hear-tap'; number: number; audioUrl: string }
  | { type: 'build-number'; digits: number[] }
  | { type: 'even-odd'; number: number }
  | { type: 'count-objects'; objects: string[]; answer: number }  // new
  | { type: 'number-writing'; prompt: string; answer: string };   // new
```

Existing switches that use `assertNever` in default will produce compile errors until new cases are handled — exactly the desired behavior.
- Source: [How to Handle Discriminated Unions in TypeScript — OneUptime](https://oneuptime.com/blog/post/2026-01-24-typescript-discriminated-unions/view) — Confidence: High

#### Should `GameType` be standalone or derived?

Derived from registry keys (`keyof typeof REGISTRY`) is preferred when:
- Registry is the authoritative source
- You want single-edit-point when adding engines

Standalone union is acceptable only if `GameType` needs to exist independently of any registry (e.g., stored in DB, API contract). For this game engine use case, **derive from registry**.

---

### Recommendations

1. **Registry**: Use `Record<GameType, GameEngine>` object literal with `satisfies` for type safety + narrow inference. Keep each engine in its own module file for tree-shaking.
2. **GameType**: Derive as `keyof typeof REGISTRY` — eliminates the standalone union entirely.
3. **Exhaustiveness**: Use `assertNever` in switch default cases for all existing game handlers. Add `satisfies never` inline where switch is not used.
4. **Adding engines**: Single edit — add entry to `REGISTRY`. TypeScript propagates the error to all unhandled switches immediately.
5. **AnyQuestion union**: Simply append new `| { type: '...', ... }` members. Existing shapes are never modified.

---

### Sources

1. [TypeScript: Choosing Between Record and Map — DEV Community](https://dev.to/safal_bhandari/typescript-choosing-between-record-and-map-for-key-value-data-514a)
2. [TypeScript `satisfies never` Exhaustiveness Checking — DEV Community](https://dev.to/cefn/typescript-satisfies-never-exhaustiveness-checking-in-typescript-49-58fh)
3. [Discriminated Unions and Exhaustiveness Checking — FullStory](https://www.fullstory.com/blog/discriminated-unions-and-exhaustiveness-checking-in-typescript/)
4. [TypeScript Narrowing Handbook — typescriptlang.org](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
5. [How to Handle Discriminated Unions in TypeScript — OneUptime](https://oneuptime.com/blog/post/2026-01-24-typescript-discriminated-unions/view)
6. [Tree-Shaking Reference Guide — Smashing Magazine](https://www.smashingmagazine.com/2021/05/tree-shaking-reference-guide/)
7. [TypeScript Exhaustiveness Checking — GeeksforGeeks](https://www.geeksforgeeks.org/typescript/typescript-exhaustiveness-checking/)

---

### Unresolved Questions

1. Does the current codebase already have a `switch` on `GameType` anywhere that would need `assertNever` added? (Scout should verify.)
2. Are individual engine modules already separate files, or bundled? Tree-shaking benefit only materializes with separate imports.
3. Is `experimentalDecorators` currently enabled? (Relevant if decorator pattern is revisited later.)
4. Does `AnyQuestion` currently live in one file or spread across engine modules? Centralized is required for discriminated union to work correctly.

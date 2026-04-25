# Improvement Plan — Phase 2C Code Review Findings

**Branch:** `feature/phase-2c-registry-new-game-types`
**Date:** 2026-04-25
**Status:** Actionable fix list, grouped by priority

---

## P0 — CRITICAL (block merge)

### NW1: `handleWrong()` auto-advances number-writing questions

- **Files:** `lib/hooks/use-game.ts` (lines 7-9, 16-19, 57-65), `app/(child)/play/[gameType]/[lessonId]/number-writing-game.tsx` (line 33)
- **Problem:** `handleWrong()` at line 62 calls `setTimeout(() => advance(next), 900)`, unconditionally advancing to the next round. For number-writing, a wrong dot tap should NOT skip the entire question; the child should retry the same dot.
- **Fix:**
  1. In `lib/hooks/use-game.ts`, add `autoAdvanceOnWrong?: boolean` to `UseGameOptions` (default `true`).
  2. In `handleWrong`, guard the `setTimeout` with `if (options.autoAdvanceOnWrong !== false)`.
  3. In `number-writing-game.tsx` line 33, pass `{ autoAdvanceOnWrong: false }` as third arg to `useGame`.
  4. In `number-writing-game.tsx` `onDotTap` (line 76), the existing `handleWrong()` call then only decrements hearts without advancing.
- **Effort:** S
- **Risk of NOT fixing:** Child skips entire digit trace on a single wrong tap; makes the game unplayable for its intended purpose.

---

## P1 — HIGH (should fix)

### A4: `isValidQuestion` uses weak `typeof obj.type === 'string'` check

- **File:** `app/api/ai/generate-questions/route.ts`, lines 79-82
- **Problem:** For `count-objects` and `number-writing` cases, `obj.type` is checked as `typeof === 'string'` instead of matching the specific discriminant value. AI-generated garbage with `type: "foo"` passes validation.
- **Fix:** Change line 80 to `return obj.type === 'count-objects' && ...` and line 82 to `return obj.type === 'number-writing' && ...`.
- **Effort:** S
- **Risk of NOT fixing:** Malformed AI responses leak into game, causing runtime crashes in game components.

### A1: `body.count` can produce `NaN`

- **File:** `app/api/ai/generate-questions/route.ts`, line 32
- **Problem:** `Math.min(body.count ?? 5, 50)` — if `body.count` is a non-numeric string, `Math.min(NaN, 50) = NaN`. Engine `.from({ length: NaN })` returns `[]`, game starts with zero questions and stalls.
- **Fix:** Replace line 32 with: `const rawCount = Number(body.count); const count = Math.min(Number.isFinite(rawCount) ? rawCount : 5, 50);`
- **Effort:** S
- **Risk of NOT fixing:** Any invalid `count` payload causes silent game stall with no questions.

### C1: Deterministic fill loop in `generateChoices` can infinite-loop

- **File:** `lib/game-engine/count-objects-engine.ts`, lines 33-39
- **Problem:** The fallback `while (choices.size < 4)` loop alternates `fill` values but the increment logic (`fill = fill > 0 ? -fill : -fill + 1; fill++;`) is convoluted. When `answer` is near boundary (e.g. `answer=1, min=1, max=2`), most candidates fail the range check and the loop may spin far more than expected.
- **Fix:** Replace lines 33-39 with a bounded counter approach:
  ```typescript
  for (let offset = 1; choices.size < 4 && offset <= max - min + 5; offset++) {
    if (answer + offset <= max) choices.add(answer + offset);
    if (answer - offset >= min) choices.add(answer - offset);
  }
  ```
- **Effort:** S
- **Risk of NOT fixing:** Potential infinite loop in edge cases (easy difficulty, answer=1, range 1-5).

### T1: No tests for count-objects or number-writing engines

- **Files to create:** `__tests__/game-engine/count-objects-engine.test.ts`, `__tests__/game-engine/number-writing-engine.test.ts`
- **Problem:** Every other engine has a test file in `__tests__/game-engine/`. These two new engines have zero test coverage.
- **Fix:** Write test suites covering:
  - `count-objects-engine`: question shape, answer in range per difficulty, choices contain answer, exactly 4 choices, batch generation
  - `number-writing-engine`: question shape, digit in range per difficulty, dotPath matches `DOT_PATHS[digit]`, totalDots matches dotPath length, batch generation
- **Effort:** M
- **Risk of NOT fixing:** Regressions in question generation go undetected; violates project TDD standard.

### P1-page: `useEffect` deps suppressed with eslint-disable

- **File:** `app/(child)/play/[gameType]/[lessonId]/page.tsx`, line 68
- **Problem:** `// eslint-disable-line react-hooks/exhaustive-deps` with no explanatory comment. The ref guard (`hasStarted`) makes this intentional, but the rationale is not documented.
- **Fix:** Replace the comment with: `// eslint-disable-line react-hooks/exhaustive-deps -- intentionally runs once; hasStarted ref guards against StrictMode double-invoke`
- **Effort:** S
- **Risk of NOT fixing:** Future developers may "fix" the deps and introduce duplicate session creation.

---

## P2 — MEDIUM (acceptable tech debt, document)

### A2: `difficulty` not validated

- **File:** `app/api/ai/generate-questions/route.ts`, line 31
- **Problem:** `difficulty` from request body is passed through without validating against `'easy' | 'medium' | 'hard'`.
- **Fix:** After line 31, add: `if (!['easy','medium','hard'].includes(difficulty)) return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 });`
- **Effort:** S

### A3: `AI_ENDPOINT` not URL-validated

- **File:** `app/api/ai/generate-questions/route.ts`, line 101
- **Problem:** `endpoint` from env is concatenated directly into fetch URL without URL validation.
- **Fix:** Wrap in `try { new URL(endpoint) } catch { return null; }` before the fetch call at line 99.
- **Effort:** S

### SEC1: No deduplication before `prisma.aIQuestion.create`

- **File:** `app/api/ai/generate-questions/route.ts`, lines 48-54
- **Problem:** Duplicate questions from AI can be stored. Not a bug but wastes DB rows.
- **Fix:** Add `upsert` keyed on `lessonId + gameType + JSON hash`, or add unique constraint. Document as future improvement if not fixing now.
- **Effort:** M

### C2: `choices.size < 4` not asserted after generation

- **File:** `lib/game-engine/count-objects-engine.ts`, line 57
- **Problem:** If all fill strategies fail, `choices` could have fewer than 4 items.
- **Fix:** After line 57, add: `if (choices.length < 4) throw new Error('Failed to generate 4 choices');`
- **Effort:** S

### N1: `DOT_PATHS[digit]` no undefined guard

- **File:** `lib/game-engine/number-writing-engine.ts`, line 19
- **Problem:** If `digit` is outside 0-9 (shouldn't happen with current ranges but no guard), `dotPath` is `undefined`.
- **Fix:** After line 19, add: `if (!dotPath) throw new Error(\`No dot path for digit \${digit}\`);`
- **Effort:** S

### DATA2: `counting-meadow` uses same color as `number-sequence`

- **File:** `src/data/game-config/worlds.ts`, lines 54 and 76-77
- **Problem:** Both `number-sequence` and `counting-meadow` use `color: 'sun'` and `bg: '#FFE6A8'`. Adjacent worlds in the list look identical.
- **Fix:** Change `counting-meadow` to `color: 'sage'`, `bg: '#C8E6C0'` (green meadow theme, matches "meadow" semantics). Available colors from `TileColor`: `'sun' | 'sage' | 'sky' | 'lavender' | 'coral' | 'berry' | 'cream'`.
- **Effort:** S

---

## Summary

| Priority | Count | Effort |
|----------|-------|--------|
| P0 (CRIT) | 1 | S |
| P1 (HIGH) | 5 | 1M + 4S |
| P2 (MED) | 6 | 1M + 5S |
| **Total** | **12** | ~3-4 hours |

**Recommended merge sequence:** Fix P0 (NW1) and P1 (A4, A1, C1) first, then T1 tests, then P2 batch.

# Code Review: Phase 2C — Registry & New Game Types

## Verdict: ❌ CHANGES REQUIRED (1 CRIT blocking merge)

## Executive Summary
Phase 2C introduces two new game types (count-objects, number-writing) and a registry/routing layer with generally solid structure. One critical logic bug in `handleWrong()` makes number-writing unplayable — a wrong tap skips the entire digit trace instead of allowing retry. Five high-severity issues (weak AI response validation, NaN risk, potential infinite loop, missing test coverage, undocumented eslint suppression) must be addressed before this branch can ship safely.

## Risk Assessment
| Risk | Severity | Business Impact | Mitigation |
|------|----------|-----------------|------------|
| Wrong tap skips digit trace | CRIT | Number-writing game unplayable for children | Add `autoAdvanceOnWrong` flag to `useGame` |
| Malformed AI questions leak into game | HIGH | Runtime crash in game components | Validate exact discriminant in `isValidQuestion` |
| NaN question count silently stalls game | HIGH | Game starts with 0 questions, no feedback | Sanitize `body.count` before `Math.min` |
| Infinite loop in `generateChoices` | HIGH | App hang on easy-difficulty edge cases | Replace while-loop with bounded offset loop |
| Zero test coverage on new engines | HIGH | Regressions undetected; violates TDD standard | Write unit tests for both engines |

## Critical Issues (1) — MUST fix before merge
| # | File:Line | Description | Fix | Effort |
|---|-----------|-------------|-----|--------|
| NW1 | `lib/hooks/use-game.ts:62` / `number-writing-game.tsx:33` | `handleWrong()` unconditionally schedules `advance(next)` — wrong dot tap skips entire digit trace | Add `autoAdvanceOnWrong?: boolean` option (default `true`); guard `setTimeout` behind it; pass `{ autoAdvanceOnWrong: false }` in number-writing-game | S |

## High Issues (5) — SHOULD fix
| # | File:Line | Description | Fix | Effort |
|---|-----------|-------------|-----|--------|
| A4 | `app/api/ai/generate-questions/route.ts:80,82` | `isValidQuestion` checks `typeof obj.type === 'string'` — any string passes for count-objects/number-writing cases | Change to `obj.type === 'count-objects'` and `obj.type === 'number-writing'` exact matches | S |
| A1 | `app/api/ai/generate-questions/route.ts:32` | `Math.min(body.count ?? 5, 50)` — non-numeric string yields `NaN`, game silently stalls with 0 questions | Replace with `Number.isFinite(rawCount) ? rawCount : 5` guard before `Math.min` | S |
| C1 | `lib/game-engine/count-objects-engine.ts:33-39` | Convoluted `fill` increment in `while (choices.size < 4)` can spin indefinitely near range boundaries | Replace with bounded `for (offset = 1; choices.size < 4 && offset <= max - min + 5; offset++)` | S |
| T1 | `__tests__/game-engine/` (missing) | count-objects and number-writing engines have zero test coverage; all other engines have test files | Create `count-objects-engine.test.ts` and `number-writing-engine.test.ts` with shape, range, choices, batch tests | M |
| P1-page | `app/(child)/play/[gameType]/[lessonId]/page.tsx:68` | `eslint-disable react-hooks/exhaustive-deps` with no rationale — future devs may "fix" it and introduce double session creation | Replace comment with explanation: `-- intentionally runs once; hasStarted ref guards against StrictMode double-invoke` | S |

## Medium Issues (6) — Tech debt acceptable
| # | File:Line | Description | Fix | Effort |
|---|-----------|-------------|-----|--------|
| A2 | `app/api/ai/generate-questions/route.ts:31` | `difficulty` not validated against enum | Add `!['easy','medium','hard'].includes(difficulty)` guard, return 400 | S |
| A3 | `app/api/ai/generate-questions/route.ts:101` | `AI_ENDPOINT` env var concatenated into fetch URL without URL validation | Wrap in `try { new URL(endpoint) } catch { return null }` before fetch | S |
| SEC1 | `app/api/ai/generate-questions/route.ts:48-54` | No deduplication before `prisma.aIQuestion.create` — duplicate AI responses bloat DB | Add upsert keyed on `lessonId + gameType + JSON hash`, or document as backlog | M |
| C2 | `lib/game-engine/count-objects-engine.ts:57` | No assertion that `choices` has exactly 4 items after generation | Add `if (choices.length < 4) throw new Error('Failed to generate 4 choices')` | S |
| N1 | `lib/game-engine/number-writing-engine.ts:19` | `DOT_PATHS[digit]` has no undefined guard — out-of-range digit silently produces `undefined` | Add `if (!dotPath) throw new Error(\`No dot path for digit ${digit}\`)` | S |
| DATA2 | `src/data/game-config/worlds.ts:54,76-77` | `counting-meadow` world uses same `color: 'sun'` / `bg: '#FFE6A8'` as `number-sequence` — worlds look identical | Change `counting-meadow` to `color: 'sage'`, `bg: '#C8E6C0'` | S |

## Already Fixed
| # | Description | Commit |
|---|-------------|--------|
| D1 | Digit 8 overlapping dot z-index — `zIndex: isNext ? 3 : isCompleted ? 1 : 2` ensures "next" dot always renders on top at shared coordinate (50,45) | `1108909` |
| color | `count-objects-game.tsx` changed `variant="sage"` → `variant="sun"` to match counting-meadow world design | `1108909` |

## Security Summary
Vulnerabilities: 2 by severity — 1 MEDIUM (unvalidated AI endpoint URL, SSRF surface), 1 LOW (duplicate AI data storage) | OWASP: A03 Injection (endpoint URL), A04 Insecure Design (no dedup)

## Performance Summary
Bottlenecks: 1 | Impact: Potential infinite loop in `count-objects-engine.ts` `generateChoices` on easy-difficulty edge cases (answer=1, range 1-2) — would block the Node.js event loop until browser timeout

## Plan Compliance
Phases verified: Phase 2C registry + two new game types present | Deviations: Missing test files for both new engines (T1); violates project TDD standard requiring tests alongside every new engine

## Recommended Actions
1. Fix `handleWrong()` auto-advance bug (NW1) — Owner: developer — Priority: P0
2. Fix `isValidQuestion` weak type check (A4) — Owner: developer — Priority: P1
3. Fix `body.count` NaN path (A1) — Owner: developer — Priority: P1
4. Replace unbounded while-loop in `generateChoices` (C1) — Owner: developer — Priority: P1
5. Write unit tests for count-objects and number-writing engines (T1) — Owner: developer — Priority: P1
6. Document eslint-disable in page.tsx (P1-page) — Owner: developer — Priority: P1
7. Address P2 batch (A2, A3, C2, N1, DATA2) in follow-up commit — Owner: developer — Priority: P2
8. Track SEC1 deduplication as backlog item — Owner: developer — Priority: P3

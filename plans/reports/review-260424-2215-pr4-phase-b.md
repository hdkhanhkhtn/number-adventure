# Code Review Findings — PR #4 Phase B

**Branch**: `feature/phase-b-child-screens-games` → `main`
**Reviewer**: code-reviewer subagent
**Date**: 2026-04-24

---

## Plan Alignment: PARTIAL

Phase B plan deliverables are implemented (5 mini-games, child screens, game engine, session API).
Two plan items are not satisfied:

- **TDD Iron Law violated**: Zero test files exist anywhere in the project. Game engine functions (`score-calculator`, all 5 local engines, `question-loader`) are pure functions and were plan-listed as testable — none have tests.
- **`/api/auth/register` and `/api/children` POST are stubs returning 501**: The onboarding flow in `layout.tsx` calls both. They are marked "TODO Phase C" but the layout code treats their 501 responses as hard failures that trigger the `local_${Date.now()}` fallback — making the DB-registration path dead on arrival for every user.

---

## Findings Table

| # | Dim | Sev | File:Line | Issue | Fix |
|---|-----|-----|-----------|-------|-----|
| 1 | CORRECTNESS | CRIT | `app/(child)/layout.tsx:51` | Guest `childId` (`local_${Date.now()}`) is stored and later passed to `POST /api/sessions` which performs `prisma.gameSession.create({ data: { childId } })`. Schema enforces `GameSession → Child` FK (`onDelete: Cascade`). Any guest session write will throw a Prisma FK violation, silently caught, returning 500. Session tracking is completely broken for all users until Phase C auth is wired. | Either (a) skip session creation when childId starts with `local_`, or (b) create a real guest `Child` row before proceeding. |
| 2 | CORRECTNESS | CRIT | `app/(child)/layout.tsx:31-46` | Both `POST /api/auth/register` and `POST /api/children` return HTTP 501 (stub). The layout calls them sequentially and throws on the first 501, immediately falling back to `local_` ID. The DB registration path is unreachable — this is not graceful degradation, it is silent permanent failure for every user. | Either remove the stub calls for Phase B (go straight to local profile) or implement minimal guest registration inline. The current code gives false confidence that registration is attempted. |
| 3 | SECURITY | CRIT | `app/(child)/layout.tsx:34` | The `password: 'guest'` literal is hardcoded in client-side JS bundle. Even though the endpoint is a stub, this pattern will ship a plaintext known-weak password into the compiled JS when Phase C is wired. | Use a randomly generated token per device (e.g., `crypto.randomUUID()`), never a dictionary word. |
| 4 | SECURITY | CRIT | `middleware.ts:25-33` | The middleware checks only for cookie existence (`bap-session` present = pass). No signature/JWT validation is performed. Any request with `Cookie: bap-session=anything` bypasses the guard. All session, progress, sticker, and attempt API routes are effectively open. IDOR: `GET /api/progress/:childId` accepts any `childId` with no ownership check — one child's data is readable by spoofing another's ID. | This is marked Phase C but the IDOR comment in middleware notes it must be fixed per-route. Block merge if data privacy is a requirement before Phase C. |
| 5 | CORRECTNESS | WARN | `app/api/ai/generate-questions/route.ts:109` | `parsed.questions.slice(0, count) as AnyQuestion[]` casts unvalidated AI JSON. If the AI returns objects missing required fields (e.g., `options` array on a `HearTapQuestion`), the payload is stored in DB and served to game components where `q.options.map(...)` will throw at runtime, crashing the game. | Add per-game-type structural validation before the cast. Minimum: check that required top-level keys exist and have the correct primitive types. |
| 6 | CORRECTNESS | WARN | `app/(child)/reward/page.tsx:36` | `correct` count is fabricated: `stars===3 ? 5 : stars===2 ? 4 : 3`. This is not the actual number of correct answers. `GameResult.correct` is computed correctly in `buildGameResult` (line 14: `totalRounds - heartsLost`) and is present in the `sessionStorage` payload via `play/page.tsx:62`. The field is just not read. | Read `result.session.correct` (or pass `GameResult.correct` through the stored payload) instead of mapping from stars. Requires adding `correct` to the `SessionResult` interface in `reward/page.tsx`. |
| 7 | CORRECTNESS | WARN | `lib/hooks/use-game.ts:29-40` | `advance` captures `round` and `totalRounds` in its `useCallback` deps. `handleWrong` calls `setTimeout(() => advance(next), 900)` — if the component unmounts within that 900ms window (e.g., user hits exit), `advance` fires on an unmounted component, calling `onComplete` which calls `router.push`. No cleanup cancels the pending timer. | Store the timeout ID in a `useRef` and clear it in a cleanup function, or check `completedRef.current` inside the callback (already present — partially mitigates the `onComplete` double-call, but `setRound` still fires). |
| 8 | CORRECTNESS | WARN | `app/(child)/play/[gameType]/[lessonId]/page.tsx:47-56` | `startSession` is excluded from `useEffect` deps via eslint-disable comment. In React Strict Mode (dev), effects run twice, creating two `GameSession` rows for one lesson play. `startSession` is a `useCallback` that depends on `childId`/`lessonId` — if `childId` changes (context rehydrates), the second call uses a stale `lessonId`. | Use a `useRef` started-guard (`hasStarted.current`) to ensure `startSession` runs exactly once regardless of Strict Mode double-invocation. |
| 9 | CORRECTNESS | WARN | `lib/game-engine/score-calculator.ts:13` | `buildGameResult` computes `correct = totalRounds - (3 - hearts)`. This assumes exactly 3 initial hearts. `useGame` accepts `initialHearts` as an option — if a caller passes `initialHearts: 5`, the `correct` count underflows. The `initialHearts` default is 3 everywhere today, but the abstraction leaks. | Pass `initialHearts` to `buildGameResult`, or compute lost hearts from the delta `(initialHearts - finalHearts)`. |
| 10 | PERFORMANCE | WARN | `app/api/sessions/[id]/route.ts:95-123` (`awardSticker`) | Race condition: two concurrent PATCH requests for the same session (possible from network retry) both pass `stars === 3`, both fetch owned stickers before either inserts, both pick the same unowned sticker, and both attempt `prisma.childSticker.create`. The `@@unique([childId, stickerId])` constraint on `ChildSticker` causes the second to throw — caught silently, returning 500 for the retry. The unique constraint saves data integrity, but the 500 response misleads the caller. | Add `skipDuplicates: true` to `createMany`, or use `upsert`, or handle the unique-constraint error code (`P2002`) explicitly and return 200. |
| 11 | ARCHITECTURE | WARN | `lib/game-engine/types.ts:39-44` + `lib/types/common.ts:21-26` | `GameType` is defined identically in two files. `lesson-templates.ts` imports from `lib/types/common`; the play page and AI route import from `lib/game-engine/types`. No type error today (structural identity), but future divergence will be silent. | Keep one definition in `lib/types/common.ts`. Re-export from `lib/game-engine/types.ts`: `export type { GameType } from '@/lib/types/common'`. |
| 12 | CORRECTNESS | INFO | `app/(child)/home/page.tsx:19` | `stickerTotal = 40` hardcoded. `STICKER_DEFS` has exactly 40 entries today, but the constant will drift silently if stickers are added/removed. | `import { STICKER_DEFS } from '@/src/data/game-config/sticker-defs'` and use `STICKER_DEFS.length`. |
| 13 | CORRECTNESS | INFO | `app/api/sessions/[id]/route.ts` | No guard against completing an already-completed session. A second PATCH on the same session ID re-runs `updateStreak` and potentially awards a second sticker (blocked by unique constraint but throws). | Check `session.status === 'completed'` before processing and return 409 if already complete. |
| 14 | CODE QUALITY | INFO | `app/api/*/route.ts` (all 7 route files) | All `catch` blocks swallow the actual error: `catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }`. No error is logged. In production, diagnosing DB failures is impossible without logs. | Add `console.error(e)` (or a logger) before returning 500. |
| 15 | CODE QUALITY | INFO | `app/(child)/worlds/page.tsx`, `worlds/[worldId]/page.tsx`, `home/page.tsx` | Fetch calls in `useEffect` have no loading state beyond the happy path. A failed `/api/progress` call silently renders all worlds locked. No retry, no error boundary, no user feedback. | Add `error` state; show a retry button or error message when fetch fails. |
| 16 | CODE QUALITY | INFO | `lib/hooks/use-game-session.ts:43,57` | `submitAttempt` and `completeSession` fall back to `sessionStorage.getItem('currentSessionId')` when `sessionId` state is null. This can happen legitimately on page refresh, but it also masks the case where `startSession` silently failed (FK violation). A stale session ID from a previous game could be used unintentionally. | Clear `currentSessionId` from sessionStorage on `startSession` call (before setting the new one), not only on `completeSession`. |

---

## Details (CRIT + WARN)

### [#1] Guest childId causes FK violation on every session write

- **File**: `app/(child)/layout.tsx:49-54`, `app/api/sessions/route.ts:15-17`
- **Issue**: Schema line 78 — `GameSession.child` is a required relation to `Child` with `onDelete: Cascade`. Prisma will throw `P2003` (FK constraint failed) when `childId = 'local_1714...'` does not match any `Child.id`. The error is caught at `sessions/route.ts:21`, returning a generic 500. The client (`use-game-session.ts:29`) treats non-ok response as `null` and proceeds — the game runs but no session is ever created. All streak, sticker award, and progress tracking is silently broken for every user under current Phase B state.
- **Fix**: The simplest Phase B fix is to skip `startSession` call when `childId.startsWith('local_')`. Mark session features as pending Phase C auth.

### [#2 + #3] Registration path is a dead stub with a weak hardcoded password

- **File**: `app/(child)/layout.tsx:31-46`, `app/api/auth/register/route.ts:7-9`, `app/api/children/route.ts:16-19`
- **Issue**: Both endpoints return 501 unconditionally. The `throw new Error('Registration failed')` on line 37 is triggered on every single profile setup. The `catch` block then creates `local_` IDs — so every user is permanently a guest. Additionally, `password: 'guest'` is a plain-text dictionary word compiled into the JS bundle. When Phase C wires real auth, this literal becomes a known-weak credential in source history.
- **Fix**: Remove the registration calls from Phase B layout (go directly to local profile). The password literal must be removed before Phase C ships.

### [#4] Middleware auth is cookie-presence-only; all data APIs are IDOR-accessible

- **File**: `middleware.ts:25-33`, `app/api/progress/[childId]/route.ts`, `app/api/sessions/route.ts`
- **Issue**: `sessionToken` is checked for existence but not validated. Any HTTP client that includes `Cookie: bap-session=x` can access all API routes. `GET /api/progress/:childId` returns another child's full lesson history with no ownership check. `POST /api/sessions` accepts any `childId`. If this app goes to production before Phase C, any user can enumerate other children's data by iterating cuid-format IDs.
- **Fix**: This is a known Phase C TODO per the middleware comment. The IDOR risk must be documented as a merge condition: this PR must not reach a public/staging environment accessible to real users.

### [#5] AI output cast to AnyQuestion[] without structural validation

- **File**: `app/api/ai/generate-questions/route.ts:105-109`
- **Issue**: `const parsed = JSON.parse(content) as { questions?: unknown[] }` — the `unknown[]` elements are cast directly to `AnyQuestion[]` on line 109 with the comment "Basic structure validation" (which does nothing). The payload is then persisted to DB and returned to the client. Game components perform direct field access: `q.options.map(...)` (HearTapGame), `q.seq[q.hideIdx]` (NumberOrderGame). A malformed AI response missing these fields crashes at render with an unhandled TypeError.
- **Fix**: Write a type-guard per game type. Minimum example for `hear-tap`: `typeof q.target === 'number' && Array.isArray(q.options) && q.options.length >= 2`. Reject questions that fail the guard rather than passing them through.

### [#6] Fabricated `correct` count on reward screen

- **File**: `app/(child)/reward/page.tsx:36`
- **Issue**: `const correct = stars === 3 ? 5 : stars === 2 ? 4 : 3` — this mapping is unrelated to actual game performance. `buildGameResult` correctly computes `correct = totalRounds - heartsLost` and this value flows into `GameResult.correct`. `play/page.tsx:61-63` stores `sessionResult ?? { session: { stars } }` in sessionStorage — `GameResult.correct` is not included in the stored shape. The reward page reads `result.session.stars` but has no path to `correct`.
- **Fix**: Extend the stored sessionStorage payload to include `correct` from `GameResult`, or store the full `GameResult` alongside the session result. Then read `result.correct` directly.

### [#7] Pending setTimeout in useGame not cancelled on unmount

- **File**: `lib/hooks/use-game.ts:49-56`
- **Issue**: `handleWrong` schedules `setTimeout(() => advance(next), 900)`. If the user taps the exit button (`onExit → router.back()`) within 900ms of a wrong answer, the component unmounts but the timer fires. `advance` calls `onComplete(buildGameResult(...))` which calls the `handleComplete` callback in `play/page.tsx:58`, which calls `completeSession` and `router.push('/reward...')`. This causes a navigation side-effect from an unmounted component tree.
- **Fix**: Return cleanup from `useCallback` is not possible, but the hook can expose a cleanup function, or the timer ID can be stored in a ref and cancelled in the game component's `useEffect` cleanup.

### [#8] Suppressed useEffect deps risk double session on Strict Mode

- **File**: `app/(child)/play/[gameType]/[lessonId]/page.tsx:47-56`
- **Issue**: `startSession` is excluded from deps. In React Strict Mode (dev), effects mount → unmount → remount. The `cancelled` ref guards `setQuestions` from the first invocation but does not guard `startSession`. Result: two `POST /api/sessions` calls on mount in dev, two rows in `GameSession` table per lesson play. In production this is not triggered, but it corrupts dev data and makes streak/progress testing unreliable.
- **Fix**: Add a `useRef` started guard: `if (hasStarted.current) return; hasStarted.current = true;` at the top of the effect body.

### [#9] `buildGameResult` assumes exactly 3 initial hearts

- **File**: `lib/game-engine/score-calculator.ts:13`
- **Issue**: `const lost = 3 - hearts` hardcodes the starting heart count. `useGame` accepts `initialHearts` option. If a future game type uses 5 hearts, `buildGameResult` returns `correct = totalRounds - (3 - 5) = totalRounds + 2` (overflow). This is a correctness time-bomb in an extensible abstraction.
- **Fix**: `buildGameResult` should accept `initialHearts` as a parameter.

### [#10] Sticker award race condition on concurrent PATCH

- **File**: `app/api/sessions/[id]/route.ts:95-123`
- **Issue**: `awardSticker` performs a read-then-write (fetch owned stickers, pick unowned, create). Under concurrent requests, two requests can read the same empty owned-set and both attempt to insert the same `(childId, stickerId)` pair. The DB unique constraint (`@@unique([childId, stickerId])`) prevents the duplicate, but the second request receives an unhandled Prisma `P2002` error caught as a generic 500. The response to the caller is misleading — the sticker was awarded, but the response says failure.
- **Fix**: Catch Prisma error code `P2002` explicitly in `awardSticker` and return `null` (already-owned is fine). Alternatively use `prisma.childSticker.upsert`.

---

## Positives

- **Game engine architecture is clean**: Pure functions in `lib/game-engine/` are well-separated from React. The `useGame<Q>` generic hook is a correct and reusable abstraction.
- **FK-safe sticker schema**: `@@unique([childId, stickerId])` on `ChildSticker` is correctly placed — prevents double-award at the DB level even without application-level guards.
- **`completedRef` in useGame**: Prevents double-completion calls correctly — `if (completedRef.current) return` at the top of `advance` is the right pattern.
- **AI fallback chain**: `question-loader.ts` cleanly falls back to local generators when the AI endpoint is unavailable. The separation is correct.
- **`count = Math.min(body.count ?? 5, 50)` in generate-questions**: Good input bounding — prevents a caller from requesting 10,000 AI questions.
- **`cancelled` flag in play page useEffect**: Correct race-condition guard on async question loading.
- **Streak logic**: Timezone handling for `lastPlayDate` (zero-hour normalization) is correct and the three-case logic (same day / consecutive / broken) is sound.
- **`worldId` unlock rule**: `uniquePrev.size >= 5` correctly de-duplicates lessons across multiple session attempts.

---

## Workshopman Domain Checks

- [x] Multi-tenant isolation: N/A — single-tenant child app; no workspace isolation required
- [ ] API contracts preserved: `/api/auth/register` and `/api/children` return 501 — callers in `layout.tsx` treat this as a hard error. Contract is broken by design (Phase C TODO) but creates a permanently non-functional onboarding path in Phase B.
- [x] No secrets exposed: `AI_API_KEY` and `AI_ENDPOINT` are read from `process.env` server-side only — correct. Exception: `password: 'guest'` literal in client bundle (Issue #3).

---

## Summary

```
CRIT: 4 | WARN: 7 | INFO: 5
```

**CRIT issues** (must fix before merge to any shared/public environment):
1. Guest `childId` FK violation — all session/streak/sticker tracking is broken
2. Registration path is permanently dead (both APIs return 501) — onboarding is broken by design
3. `password: 'guest'` literal in client bundle
4. Middleware auth is cookie-presence-only — IDOR exposure on all data APIs

**Verdict: REQUEST CHANGES**

Issues #1 and #2 make Phase B's core session tracking non-functional for all users in its current state. Issues #3 and #4 are security debt that must be acknowledged with explicit Phase C merge conditions before this reaches any user-accessible environment. The code quality of the game engine itself is good; the problems are concentrated in the onboarding/auth boundary and reward data accuracy.

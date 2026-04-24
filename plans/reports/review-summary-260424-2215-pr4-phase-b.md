# Code Review: PR #4 Phase B

**Branch**: `feature/phase-b-child-screens-games` → `main`
**Date**: 2026-04-24
**Scope**: 48 files, +2520 / -85 lines — child screens, 5 mini-games, game engine, session/progress APIs

## Verdict: CHANGES REQUIRED

---

## Executive Summary

Phase B delivers a well-structured game engine and 5 functional mini-games, but the onboarding/auth boundary is broken by design: both registration APIs return 501, causing every user to fall back to a local guest ID that violates the database FK constraint on `GameSession.childId` — silently disabling all session, streak, and sticker tracking. Two additional security issues (plaintext password in client bundle, middleware IDOR) must be acknowledged before this branch approaches any user-accessible environment.

---

## Risk Assessment

| Risk | Sev | Business Impact |
|------|-----|-----------------|
| FK violation on guest childId | CRIT | Session/streak/sticker tracking broken for 100% of users |
| Dead registration path (501 stubs) | CRIT | Onboarding permanently falls back to local mode; DB path unreachable |
| `password: 'guest'` in client bundle | CRIT | Known-weak credential compiled into JS; security debt that will ship with Phase C |
| IDOR on all data APIs | CRIT | Any caller with a cookie header can read any child's progress data by ID |
| Unvalidated AI question cast | WARN | Malformed AI response crashes game at render; no user recovery |
| Fabricated correct count on reward screen | WARN | Misleading performance data shown to child and parent |
| Unmounted component side-effects | WARN | Navigation triggered from unmounted tree on fast exit |
| Zero test coverage | WARN | TDD Iron Law violated; pure functions ship with no regression safety net |

---

## Critical Issues (4) — Must Fix

1. **Guest childId FK violation** (`layout.tsx:51`, `sessions/route.ts:15`) — `local_${Date.now()}` is passed to `prisma.gameSession.create`; schema enforces `GameSession → Child` FK; Prisma throws `P2003`; all session tracking silently broken for every user. Fix: skip `startSession` when `childId.startsWith('local_')`.

2. **Dead registration path** (`layout.tsx:31-46`) — `POST /api/auth/register` and `POST /api/children` both return 501 unconditionally; layout treats this as a hard error and always falls back to local ID. DB onboarding is unreachable by design. Fix: remove the registration calls from Phase B layout entirely; go straight to local profile storage until Phase C.

3. **`password: 'guest'` in client bundle** (`layout.tsx:34`) — plaintext dictionary-word credential compiled into the JS bundle. When Phase C wires real auth, this becomes a known-weak credential in git history. Fix: remove the literal now; use `crypto.randomUUID()` or defer credential handling to Phase C.

4. **Middleware IDOR** (`middleware.ts:25-33`) — session token checked for existence only, no JWT validation. Any HTTP client with `Cookie: bap-session=x` bypasses auth. `GET /api/progress/:childId` accepts any `childId` with no ownership check — one user can read all children's data. Fix: document explicit merge condition; this branch must not reach any user-accessible environment before Phase C auth.

---

## Warnings (7) — Should Fix

1. **Unvalidated AI question cast** (`generate-questions/route.ts:109`) — `parsed.questions as AnyQuestion[]` with no field checking; malformed AI output stored to DB and served to game components; `q.options.map(...)` throws at render. Add per-type structural type-guards.

2. **Fabricated `correct` count on reward screen** (`reward/page.tsx:36`) — `stars===3 ? 5 : stars===2 ? 4 : 3` is unrelated to actual performance. `GameResult.correct` is computed correctly in `buildGameResult` but not included in the sessionStorage payload. Extend stored payload; read directly.

3. **Unmounted setTimeout in useGame** (`use-game.ts:49-56`) — `handleWrong` fires `setTimeout(advance, 900)`; user exit within 900ms causes `router.push` from unmounted tree. Store timer ID in `useRef`; cancel in game component cleanup.

4. **Suppressed useEffect deps / double session** (`play/page.tsx:47-56`) — `startSession` excluded from deps via eslint-disable; React Strict Mode double-invokes the effect, creating two `GameSession` rows per play. Add `useRef` started-guard.

5. **`buildGameResult` hardcodes initial hearts** (`score-calculator.ts:13`) — `const lost = 3 - hearts` breaks if any game uses `initialHearts !== 3`. Add `initialHearts` parameter.

6. **Sticker award race condition** (`sessions/[id]/route.ts:95-123`) — concurrent PATCH requests both pass `stars === 3`; read-then-write race causes second request to hit unique constraint and return 500 even though the sticker was awarded. Catch `P2002` explicitly or use `upsert`.

7. **Duplicate `GameType` definition** (`lib/game-engine/types.ts:39`, `lib/types/common.ts:21`) — structurally identical today but two separate sources of truth; future divergence will be silent. Re-export from one canonical location.

---

## Suggestions (5) — Optional

1. **`stickerTotal` hardcoded to 40** (`home/page.tsx:19`) — use `STICKER_DEFS.length` to avoid silent drift.

2. **No idempotency guard on session completion** (`sessions/[id]/route.ts`) — second PATCH re-runs streak update and sticker award. Check `session.status === 'completed'` first; return 409 if already done.

3. **Silent catch blocks in all API routes** — `catch { return 500 }` with no logging; diagnosing DB failures in production is impossible. Add `console.error(e)` before returning 500.

4. **No error state in world/home fetch effects** — failed API call silently renders all worlds locked. Add `error` state with retry button.

5. **Stale session ID fallback in use-game-session** (`use-game-session.ts:43,57`) — `submitAttempt`/`completeSession` fall back to sessionStorage when state is null; a stale ID from a previous game could be used. Clear `currentSessionId` at the start of `startSession`.

---

## Security Summary

| Finding | Severity | Phase |
|---------|----------|-------|
| `password: 'guest'` in client bundle | CRIT | Fix now — before Phase C wires auth |
| Cookie-presence-only middleware (no JWT) | CRIT | Phase C — must not reach users before fix |
| IDOR on `/api/progress/:childId` | CRIT | Phase C — must not reach users before fix |
| AI secret keys server-side only | OK | Correct — `process.env` server-side |

---

## Plan Compliance

| Plan Item | Status |
|-----------|--------|
| 5 mini-games implemented | PASS |
| Child screens (home, worlds, reward, stickers) | PASS |
| Game engine (types, engines, loader, scorer) | PASS |
| Session/progress/streak/sticker APIs | PARTIAL — APIs exist but session creation broken (FK) |
| TDD Iron Law | FAIL — zero test files; game engine and hooks have no tests |
| Auth/onboarding (Phase C scope) | DEFERRED — stubs present but must not break Phase B |

---

## Recommended Actions

1. Fix guest childId FK bypass — skip `startSession` when `childId.startsWith('local_')` — **Owner: dev — Priority: P0**
2. Remove dead registration calls from Phase B layout — **Owner: dev — Priority: P0**
3. Remove `password: 'guest'` literal from client bundle — **Owner: dev — Priority: P0**
4. Add code comment to middleware acknowledging IDOR risk + team sign-off that branch stays off user-accessible infra — **Owner: dev + tech lead — Priority: P0**
5. Add minimum unit tests: `calculateStars`, `buildGameResult`, all 5 question generators — **Owner: dev — Priority: P1**
6. Fix fabricated `correct` count on reward screen (WARN #6) — **Owner: dev — Priority: P1**
7. Add `useRef` started-guard in play page effect (WARN #4) — **Owner: dev — Priority: P1**
8. Add per-type structural validation in AI question endpoint (WARN #5) — **Owner: dev — Priority: P1**
9. Remaining WARN items (#7 timer cleanup, #9 initialHearts, #10 race condition, #11 GameType dedup) — **Owner: dev — Priority: P2**
10. INFO items (hardcoded stickerTotal, error states, silent catch blocks) — **Owner: dev — Priority: P2**

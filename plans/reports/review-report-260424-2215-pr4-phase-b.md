# Improvement Plan — PR #4 Phase B

**Branch**: `feature/phase-b-child-screens-games` → `main`
**Based on**: scout-260424-2215 + review-260424-2215

---

## Must Fix Before Merge (CRIT)

| # | Issue | File:Line | Fix | Effort |
|---|-------|-----------|-----|--------|
| 1 | Guest `childId` (`local_${Date.now()}`) passed to `prisma.gameSession.create` — schema enforces `GameSession → Child` FK (`onDelete: Cascade`), Prisma throws `P2003`, all session/streak/sticker tracking is silently broken for every user | `app/(child)/layout.tsx:51-52`, `app/api/sessions/route.ts:15-17` | Skip `startSession` call when `childId.startsWith('local_')` — mark session features pending Phase C auth | XS |
| 2 | Both `POST /api/auth/register` and `POST /api/children` return HTTP 501 unconditionally; `layout.tsx` treats 501 as a hard error and always falls back to `local_` ID — DB registration path is permanently unreachable for every user | `app/(child)/layout.tsx:31-46`, `app/api/auth/register/route.ts:7-9`, `app/api/children/route.ts:16-19` | Remove registration calls from Phase B layout; go directly to local profile storage until Phase C auth is implemented | S |
| 3 | `password: 'guest'` literal hardcoded in client-side JS bundle; when Phase C wires real auth this ships a known-weak plaintext credential in source history | `app/(child)/layout.tsx:34` | Remove password literal now; use `crypto.randomUUID()` or defer auth credential entirely to Phase C | XS |
| 4 | Middleware checks only cookie existence (`bap-session` present = pass); no JWT/signature validation — any request with `Cookie: bap-session=x` bypasses the guard; `GET /api/progress/:childId` has no ownership check (IDOR: any `childId` readable by unauthenticated caller) | `middleware.ts:25-33`, `app/api/progress/[childId]/route.ts` | Document explicit merge condition: this branch must not reach any user-accessible environment until Phase C auth is in place; add code comment to middleware with IDOR risk acknowledged | XS |

---

## Should Fix (WARN)

| # | Issue | File:Line | Fix | Effort |
|---|-------|-----------|-----|--------|
| 5 | AI response cast directly to `AnyQuestion[]` with no structural validation; malformed AI output (missing `options`, wrong types) stored to DB and served to game components — `q.options.map(...)` throws at render, crashing the game | `app/api/ai/generate-questions/route.ts:109` | Add per-game-type type-guard before cast; minimum: check required top-level keys and primitive types; reject questions failing the guard | S |
| 6 | `correct` count on reward screen is fabricated (`stars===3 ? 5 : stars===2 ? 4 : 3`); `GameResult.correct` is correctly computed in `buildGameResult` but not included in the sessionStorage payload | `app/(child)/reward/page.tsx:36`, `app/(child)/play/[gameType]/[lessonId]/page.tsx:61-63` | Extend sessionStorage payload to include `GameResult.correct`; read `result.correct` directly in reward page | XS |
| 7 | `handleWrong` schedules `setTimeout(() => advance(next), 900)`; if user exits within 900ms the component unmounts but the timer fires, triggering `completeSession` + `router.push` from unmounted tree | `lib/hooks/use-game.ts:49-56` | Store timer ID in a `useRef`; cancel it in the game component's `useEffect` cleanup | S |
| 8 | `startSession` excluded from `useEffect` deps via eslint-disable; in React Strict Mode (dev) effects run twice — `startSession` runs twice, creating two `GameSession` rows per lesson play; corrupts dev data and makes streak/progress testing unreliable | `app/(child)/play/[gameType]/[lessonId]/page.tsx:47-56` | Add `useRef` started-guard (`if (hasStarted.current) return; hasStarted.current = true`) at top of effect body | XS |
| 9 | `buildGameResult` hardcodes `const lost = 3 - hearts`; if any future game uses `initialHearts !== 3`, `correct` count underflows/overflows | `lib/game-engine/score-calculator.ts:13` | Add `initialHearts` parameter to `buildGameResult`; compute `lost = initialHearts - hearts` | XS |
| 10 | Concurrent PATCH on same session: race in `awardSticker` read-then-write — both requests pick same unowned sticker, DB unique constraint `@@unique([childId, stickerId])` blocks second insert; second request receives unhandled `P2002` returned as 500 even though sticker was awarded | `app/api/sessions/[id]/route.ts:95-123` | Catch `P2002` explicitly and return `null` (already-awarded is OK), or use `prisma.childSticker.upsert` | XS |
| 11 | `GameType` defined identically in two files; imports split across codebase; future divergence will be silent with no type error | `lib/game-engine/types.ts:39-44`, `lib/types/common.ts:21-26` | Keep single definition in `lib/types/common.ts`; re-export from `lib/game-engine/types.ts`: `export type { GameType } from '@/lib/types/common'` | XS |

---

## Optional (INFO)

| # | Issue | File:Line | Fix | Effort |
|---|-------|-----------|-----|--------|
| 12 | `stickerTotal = 40` hardcoded; will drift silently if sticker config changes | `app/(child)/home/page.tsx:19` | Import `STICKER_DEFS` and use `STICKER_DEFS.length` | XS |
| 13 | No guard against completing an already-completed session; second PATCH re-runs `updateStreak` and attempts duplicate sticker award (throws P2002) | `app/api/sessions/[id]/route.ts` | Check `session.status === 'completed'` before processing; return 409 if already complete | XS |
| 14 | All `catch` blocks in API routes swallow the actual error; no logging — diagnosing DB failures in production is impossible | `app/api/*/route.ts` (all 7 route files) | Add `console.error(e)` before returning 500 in every catch block | XS |
| 15 | Fetch calls in `useEffect` have no error state; failed `/api/progress` silently renders all worlds locked with no user feedback | `app/(child)/worlds/page.tsx`, `worlds/[worldId]/page.tsx`, `home/page.tsx` | Add `error` state; show retry button or error message when fetch fails | S |
| 16 | `submitAttempt`/`completeSession` fall back to `sessionStorage.getItem('currentSessionId')` when state is null; a stale session ID from a previous game could be used unintentionally | `lib/hooks/use-game-session.ts:43,57` | Clear `currentSessionId` from sessionStorage at the start of `startSession`, not only on `completeSession` | XS |

---

## Zero Test Coverage

The entire game engine (`score-calculator`, all 5 local engines, `question-loader`) and both hooks are pure functions/logic with no test files. This violates the TDD Iron Law stated in CLAUDE.md.

Minimum test surface before merge:
- `calculateStars`: edge cases (0 hearts, full hearts, max lost)
- `buildGameResult`: correct/lost computation for each heart count
- All 5 question generators: output shape matches expected question type
- `question-loader`: fallback path triggered when AI endpoint unavailable

Effort: M (2-4h)

---

## Merge Conditions

1. CRIT #1 resolved: guest `childId` no longer passed to session API (skip or guard).
2. CRIT #2 resolved: dead registration calls removed from Phase B layout.
3. CRIT #3 resolved: `password: 'guest'` literal removed from client bundle.
4. CRIT #4 acknowledged: explicit code comment + team agreement that this branch does not reach any user-accessible/staging environment before Phase C auth lands.
5. Minimum unit tests added for `calculateStars` and `buildGameResult` (WARN #9 also closed by tests).

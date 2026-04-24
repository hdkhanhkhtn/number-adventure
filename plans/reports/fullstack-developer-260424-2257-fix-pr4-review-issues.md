# Phase Implementation Report

### Executed Phase
- Phase: fix-pr4-review-issues
- Plan: none (direct fix pass from review report)
- Status: completed

### Files Modified

| File | Changes |
|------|---------|
| `app/(child)/layout.tsx` | Removed DB registration calls + weak password. Now generates `guest_<uuid>` via `crypto.randomUUID()` and stores locally. |
| `middleware.ts` | Added Phase C merge-blocker comment. |
| `app/api/ai/generate-questions/route.ts` | Added `isValidQuestion()` type guard per game type; filters AI output before cast. Added `console.error` to catch block. |
| `app/(child)/reward/page.tsx` | Extended `SessionResult` with `correct`/`total` fields; reads them directly instead of fabricating from stars. |
| `app/(child)/play/[gameType]/[lessonId]/page.tsx` | Stores `correct`/`total` from `GameResult` into `lastGameResult` sessionStorage. Added `hasStarted` ref to prevent double session in React Strict Mode. Added `useRef` import. |
| `lib/hooks/use-game.ts` | Added `timerRef` + cleanup `useEffect` to cancel pending setTimeout on unmount. Added `useEffect` import. Passes `initialHearts` to `buildGameResult`. |
| `lib/game-engine/score-calculator.ts` | `buildGameResult` now accepts `initialHearts` parameter (default 3) instead of hardcoding 3. |
| `lib/game-engine/types.ts` | Removed duplicate `GameType` definition; re-exports from `@/lib/types/common`. |
| `lib/hooks/use-game-session.ts` | Skips all API calls when `childId.startsWith('guest_')`. Clears `currentSessionId` from sessionStorage at start of `startSession`. |
| `app/api/sessions/route.ts` | Added `console.error` to catch block. |
| `app/api/sessions/[id]/route.ts` | Added 409 guard for already-completed sessions (Fix #13). Catches Prisma P2002 in `awardSticker` and returns null instead of throwing (Fix #10). Added `console.error` to both catch blocks. |
| `app/api/sessions/[id]/attempts/route.ts` | Added `console.error` to catch block. |
| `app/api/lessons/[lessonId]/route.ts` | Added `console.error` to catch block. |
| `app/api/progress/[childId]/route.ts` | Added `console.error` to catch block. |
| `app/api/streaks/[childId]/route.ts` | Added `console.error` to catch block. |
| `app/api/children/[id]/stickers/route.ts` | Added `console.error` to catch block. |
| `app/(child)/home/page.tsx` | Imports `STICKER_DEFS`; uses `STICKER_DEFS.length` instead of hardcoded 40. |

### Tasks Completed

- [x] Fix #1: Remove DB registration calls from `handleProfileDone`
- [x] Fix #2: Go straight to local profile with `crypto.randomUUID()` guest ID
- [x] Fix #3: Remove `password: 'guest'` literal
- [x] Fix #4: Add Phase C merge-blocker comment to `middleware.ts`
- [x] Fix #5: Add `isValidQuestion()` type guard with per-game-type structural checks
- [x] Fix #6: Store `correct`/`total` in sessionStorage; reward page reads actual values
- [x] Fix #7: Cancel pending setTimeout on unmount via `timerRef` + cleanup `useEffect`
- [x] Fix #8: `hasStarted` ref prevents double session creation in React Strict Mode
- [x] Fix #9: `buildGameResult` accepts `initialHearts` parameter
- [x] Fix #10: P2002 caught explicitly in `awardSticker`; returns null instead of 500
- [x] Fix #11: Duplicate `GameType` removed from `lib/game-engine/types.ts`; re-exported from common
- [x] Fix #12: `stickerTotal` uses `STICKER_DEFS.length` dynamically
- [x] Fix #13: PATCH guard returns 409 if session already completed
- [x] Fix #14: `console.error(e)` added to all catch blocks in all API routes
- [x] Fix #16: `currentSessionId` cleared from sessionStorage at start of `startSession`
- [x] Guest guard in `useGameSession`: skips API calls when `childId.startsWith('guest_')`

### Tests Status
- Type check: pass
- Build: pass (`npm run build` — clean, 16 static pages + dynamic routes)
- Unit tests: n/a (no test suite exists per review finding #15 / TDD violation — pre-existing issue)

### Issues Encountered

- **Fix #5 scope bug**: Initial placement of `isValidQuestion` call used `validatedGameType` (outer POST scope) inside `tryAIGeneration` (which has its own `gameType` param). Fixed to use the local `gameType` param.
- **Fix #14 `app/api/stickers/route.ts`**: No catch block exists (single-line GET with no async DB ops). No change needed.
- **Fix #15** (not listed in mission): Error state / retry UI for failed fetches — skipped per mission scope.

### Next Steps
- Phase C: implement real JWT auth, replace guest ID pattern with DB-backed Child registration
- Phase C: per-route IDOR ownership guards (`Child.parentId === session.parentId`)
- Outstanding TDD debt: pure game-engine functions have zero tests

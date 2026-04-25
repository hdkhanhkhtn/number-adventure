# Code Review: Phase 2B — PWA + Sliding-Window Difficulty

**Date**: 2026-04-25
**Reviewer**: code-reviewer (Golden Triangle)
**Branch**: feature/phase-2b-pwa-difficulty-algorithm
**PR**: #10

---

## Verdict: ⚠️ APPROVED WITH CONDITIONS

No blocking security holes or data-loss bugs. Two medium-priority correctness issues and one security gap must be addressed before or shortly after merge (flagged as WARNINGS). No CRITICALs.

---

## Executive Summary

The Phase 2B implementation is well-structured: the sliding-window adjuster is a clean pure function with good test coverage (26 cases), the PWA integration follows serwist/Next.js conventions, and the offline queue is straightforward. The main concerns are: (1) the `noChange` sentinel silently returns `windowAccuracy: 0` even when a valid window can be computed (data-gate early return, line 96), causing misleading downstream telemetry; (2) the difficulty endpoint `GET /api/children/[childId]/difficulty` has no ownership check — any authenticated user can query any `childId`; (3) the `trySyncNow` serial-drain loop has a subtle failure mode when the server returns a non-ok status for a middle item in the queue, leaving all subsequent items permanently stuck.

---

## Findings

### CRITICAL (must fix before merge)

_None._

---

### WARNINGS (should fix)

| # | Dim | File:Line | Issue | Recommended Fix |
|---|-----|-----------|-------|-----------------|
| W1 | SECURITY | `app/api/children/[childId]/difficulty/route.ts:12` | No IDOR guard. Any authenticated session can call `GET /api/children/<any-childId>/difficulty` and read another child's full difficulty + easeFactor profile. The middleware only checks cookie existence, not ownership. | Add ownership check: read `parentId` from session cookie, verify `Child.parentId === parentId` before returning data. Pattern is already shown in `middleware.ts` comments ("each route handler must additionally validate"). |
| W2 | CORRECTNESS | `lib/game-engine/sliding-window-adjuster.ts:86-96` | The `noChange` constant hard-codes `windowAccuracy: 0`. The two data-gate returns (lines 96, 101) therefore return `windowAccuracy: 0` regardless of whether a window-slice could have been computed. This means after the first 10 attempts are gathered, but before `distinctSessionCount >= 2`, the stored `windowAccuracy` will be `0` (misleading). The locked-cooldown path at line 111 correctly spreads `windowAccuracy` back in, but the prior two gates do not. | Compute `windowAccuracy` before the data-gate checks if `recentAttempts.length >= WINDOW_SIZE`, then pass the real value through in early-return paths. Or document clearly that `windowAccuracy: 0` is intentional sentinel for "not enough data" and add a separate `hasEnoughData: boolean` field to avoid confusion. |
| W3 | CORRECTNESS | `lib/pwa/offline-attempt-queue.ts:73` | The drain loop `break`s on any non-ok HTTP response, leaving all subsequent queued items unprocessed indefinitely — even if the failure is a permanent 404 (stale sessionId). A session may be deleted server-side while attempts are still queued; those attempts will block the queue forever. | On `res.status === 404` (or any 4xx), delete the item and continue. Only `break` (retry later) on 5xx or network errors. |

---

### SUGGESTIONS (could improve)

| # | Dim | File:Line | Issue | Recommended Fix |
|---|-----|-----------|-------|-----------------|
| S1 | PERFORMANCE | `lib/game-engine/session-difficulty-updater.ts:60-99` | There are **5 sequential DB round-trips** per session completion: `childSettings.findUnique` → `difficultyProfile.findUnique` → `difficultyProfile.upsert` (SM-2) → `Promise.all([4 queries])` → `difficultyProfile.update` (band). The profile is fetched twice (`existing` at line 43, `profile` at line 98). The second fetch re-reads the same row just written by the upsert. | After the upsert in the SM-2 block, pass `result.state` directly to `computeSlidingWindowAdjustment` (you already have the values). Remove the `prisma.difficultyProfile.findUnique` from the `Promise.all` block — saves one DB round-trip and removes the stale-read risk. |
| S2 | PERFORMANCE | `app/api/sessions/[id]/route.ts:82-100` | `sessionStats` aggregate counts ALL completed sessions for (childId, gameType) every time a session ends. As session count grows this is an increasingly expensive full-scan aggregate. There is already a `DifficultyProfile.totalSessions` counter maintained by the SM-2 updater. | Use `profile.totalSessions` instead of re-aggregating. Remove the `gameSession.aggregate` call from the parallel block. Similarly consider using `GameAttempt.@@index([sessionId, createdAt(sort: Desc)])` more explicitly rather than the unbounded aggregate for attempt count. |
| S3 | ARCHITECTURE | `app/api/sessions/[id]/route.ts:161` | File is 163 lines with 3 responsibilities: session PATCH handler, streak logic, sticker award logic. It is at the 200-line file size limit per project rules (file already slightly over with trailing blank lines). | Extract `updateStreak` and `awardSticker` into `lib/game-engine/streak-updater.ts` and `lib/game-engine/sticker-awarder.ts`. The PATCH handler then becomes ~50 lines of orchestration. |
| S4 | SECURITY | `nginx/nginx.conf:19` | The CSP is `worker-src 'self'` only. There is no `script-src`, `default-src`, or `connect-src` directive. This means XSS attacks can exfiltrate to any domain. | Extend CSP to at minimum: `default-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data:; font-src 'self' https://fonts.gstatic.com;`. The Google Fonts URLs cached by the SW also need to be in `font-src`. |
| S5 | CORRECTNESS | `lib/game-engine/sliding-window-adjuster.ts:120-123` | When the SM-2 ease-factor veto fires, `consecutiveTriggers` is reset to `0` in the return value. But the return at line 123 does NOT set `bandLockedUntil = currentSessionId`. This means a veto fires, resets the counter, but doesn't lock — so the next session immediately starts accumulating triggers again without any cooldown penalty. The behavior is arguably correct per design but it is asymmetric with promotion (which locks) and is not documented. | Either add a comment explicitly noting "veto does not lock — child just needs to accumulate two consecutive windows again" or apply a half-lock for one session to prevent rapid re-accumulation. Ensure tests cover this path. |
| S6 | CORRECTNESS | `lib/pwa/offline-attempt-queue.ts:51` | `navigator.onLine` check is synchronous and can return `true` even when a captive-portal network is active (no real connectivity). The drain will then attempt fetches, fail, and re-queue — but the error is silently swallowed. | This is a known limitation of the Web API. Add a comment documenting the limitation, and consider a small timeout + AbortController (e.g., 8s) so the fetch does not hang indefinitely on captive portals. |
| S7 | STYLE | `app/sw.ts:36-44` | The `urlPattern` for API caching (`/api/(worlds|progress)`) will also match `/api/worlds/create`, `/api/worlds-admin`, etc. if those routes are added later. | Use `^/api/(worlds|progress)(/|$)` to anchor the pattern to exact prefix matches. |
| S8 | ARCHITECTURE | `components/pwa/pwa-register.tsx` | `PwaRegister` is a 3-line passthrough that only mounts `IosInstallPrompt`. The serwist plugin auto-registers the SW without a component. This file adds an extra indirection with no value. | Consider inlining `<IosInstallPrompt />` directly in `layout.tsx` unless additional PWA components are planned for Phase C. |
| S9 | SECURITY | `nginx/nginx.conf:55` | `manifest.json` is served with `public, max-age=86400` (24h). If the manifest needs to change urgently (e.g., theme, icon URL), browsers will serve stale data for up to 24h. | Use `public, max-age=3600, stale-while-revalidate=86400` or switch to a shorter max-age for the manifest. |

---

## Security Summary

**Passed**: No secrets committed. SW scope is `'self'` only. Auth middleware correctly blocks unauthed API access. IDOR guard exists in middleware comments and pattern — but **route handlers are not implementing it** (W1). Sticker award correctly catches P2002 race condition.

**Gap (W1)**: `GET /api/children/[childId]/difficulty` — any authenticated user can enumerate difficulty profiles for arbitrary `childId` values. The session/PATCH handler also does not verify ownership before completing the session, though this is noted as a Phase C TODO.

**Gap (S4)**: Nginx CSP is minimal (`worker-src 'self'` only). A more complete CSP should be in place before production deployment.

---

## Performance Summary

**Passed**: Parallel `Promise.all` for the 4 sliding-window queries is correct. `GameAttempt` has a composite index on `(sessionId, createdAt DESC)` matching the `findMany` query pattern. `take: 10` correctly limits the window fetch.

**Issues**: 5 sequential DB calls per session completion (S1, S2). Double-read of `DifficultyProfile` row (S1). `gameSession.aggregate` can be replaced by the already-maintained `totalSessions` counter (S2).

---

## What's Done Well

1. **Pure function design** — `computeSlidingWindowAdjustment` has zero side effects; all state is passed in and returned. This makes it trivially testable and the 26-test suite validates it thoroughly.
2. **Anti-oscillation via consecutive triggers** — requiring 2 consecutive windows before promotion prevents thrashing, a common failure mode in simple threshold systems.
3. **SM-2 veto on promotion** — guarding the fast loop with the slow loop's `easeFactor` is a thoughtful cross-algorithm interaction.
4. **Parent ceiling enforcement** — applied at the end of both SM-2 and sliding-window paths, not just one.
5. **Double-complete guard** — `session.status === 'completed'` check with 409 prevents streak/sticker double-award on retried PATCH calls.
6. **Offline queue design** — IndexedDB singleton pattern with lazy init, ordered drain with break-on-error, and online/visibility dual-trigger are all correct.
7. **Test coverage for new API** — `children-difficulty.test.ts` and `sessions-patch-difficulty.test.ts` cover happy path, fallback, and error cases. `ios-install-prompt.test.tsx` covers all display-logic branches.
8. **SW disabled in dev** — `disable: process.env.NODE_ENV === "development"` prevents common caching frustrations during development.
9. **Stale session guard in startSession** — `sessionStorage.removeItem('currentSessionId')` before starting a new session prevents stale session bleed.

---

## Recommended Actions

**Before merge (P0)**:
- None blocking.

**Shortly after merge / next PR (P1)**:
1. **W1** — Add IDOR check to `GET /api/children/[childId]/difficulty` (and audit all other `childId`-parameterized routes for the same pattern).
2. **W2** — Fix `noChange.windowAccuracy = 0` or document clearly with a field rename.
3. **W3** — Fix offline queue drain to skip (delete) 404 items rather than blocking the whole queue.

**Backlog (P2)**:
4. **S1+S2** — Remove redundant DB round-trips in `session-difficulty-updater.ts`.
5. **S3** — Split `app/api/sessions/[id]/route.ts` to stay under 200 lines.
6. **S4** — Extend Nginx CSP to cover `script-src`, `connect-src`, `font-src`.
7. **S7** — Anchor SW API cache URL pattern.

---

## Unresolved Questions

1. Is the veto-without-lock behavior in the SM-2 ease-factor veto path (S5) intentional by design? If so, a comment in the code would suffice.
2. Phase C auth refactor (JWT/NextAuth) is noted in `middleware.ts` line 36 as a TODO. Is there a plan file for this? The IDOR gap (W1) will be naturally resolved there but should not wait until Phase C.
3. The `bandLockedUntil` field stores a `sessionId` string rather than a timestamp. This means the lock has no absolute expiry — if a child never starts a new session, the lock persists indefinitely. Is this the intended behavior?

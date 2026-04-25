# Review Report: Phase 2A — Detailed Findings

**PR:** hdkhanhkhtn/number-adventure#9 → main
**Branch:** feature/phase-2a-audio-difficulty-worlds-api
**Reviewer:** code-reviewer subagent
**Date:** 2026-04-25

---

## Critical Issues (MUST fix before merge)

### CRIT-01 — Client-provided stars bypass server-side scoring
**File:** `app/api/sessions/[id]/route.ts` line 31–32
**Severity:** CRIT
**Description:**
The PATCH handler reads `stars` directly from the client request body and only clamps it to `[0, 3]`. Any authenticated session can send `{ stars: 3 }` and receive max stars, max sticker probability, and max difficulty credit — regardless of actual performance.
```ts
const stars = Math.min(3, Math.max(0, body.stars ?? 0));
```
The dead `/api/sessions/complete` route has the correct server-side approach (`computeStars(accuracy)`) but is never called.

**Impact:** Game integrity — difficulty auto-adjustment is computed from `session.attempts` (correct data) but sticker awarding and the public star count are based on the spoofable client value.

**Fix:** Compute stars server-side from `session.attempts` in the PATCH handler, same as `computeStars()` in `complete/route.ts`. Remove or deprecate the `stars` body field. Delete `complete/route.ts` dead code.

```ts
// Replace line 31-32 with:
const correct = session.attempts.filter(a => a.correct).length;
const accuracy = session.attempts.length > 0 ? correct / session.attempts.length : 0;
const stars = computeStars(accuracy); // reuse helper from complete/route.ts
```

---

## Warnings (SHOULD fix)

### HIGH-01 — `lang` interpolated into URL without sanitization
**File:** `lib/audio/google-tts-provider.ts` line 22
**Severity:** HIGH
**Description:**
`options?.lang` (typed as `string`, no validation) is interpolated directly into the fetch URL:
```ts
const src = `/audio/tts/${lang}/${slug}.mp3`;
```
A caller passing `lang = '../../'` constructs `/audio/tts/../../.mp3`. In the browser, Next.js serves only `/public/*`, so filesystem traversal is not possible, but the URL becomes malformed and produces unpredictable 404s or route collisions. The `slug` half is properly sanitized via `textToSlug`, but `lang` is not.

**Fix:** Validate lang against an allowlist before interpolation:
```ts
const ALLOWED_LOCALES = new Set(['en-US', 'vi-VN']);
const lang = ALLOWED_LOCALES.has(options?.lang ?? '') ? options.lang! : 'en-US';
```

### HIGH-02 — `ctx.resume()` unhandled promise rejection (both audio files)
**Files:** `lib/audio/sfx-sprite-map.ts` line 37, `lib/audio/google-tts-provider.ts` line 36
**Severity:** HIGH
**Description:**
Both files call `ctx.resume().then(...)` without a `.catch()`. On iOS 15+ and some Android browsers, `AudioContext.resume()` can reject with `NotAllowedError` when called without a sufficiently recent user gesture. This produces an unhandled promise rejection warning in the console and silently drops the audio.

**Fix:**
```ts
ctx.resume().then(() => howl.play(key)).catch(() => {/* audio blocked */});
```

### HIGH-03 — `app/api/sessions/complete/route.ts` is dead code (known)
**Severity:** HIGH
**Description:**
The file implements a complete session flow including server-side star computation, SM-2 update, and duplicate-completion guard — but is never called by any client. The live PATCH route in `[id]/route.ts` is the active path but has the client-provided stars flaw (CRIT-01). Leaving dead routes in the codebase creates maintenance hazard and reviewer confusion.

**Fix:** Merge the `computeStars()` logic into the PATCH handler and delete `complete/route.ts`.

### MED-01 — IDOR: no ownership verification in sessions or worlds routes
**Files:** `app/api/sessions/[id]/route.ts`, `app/api/worlds/route.ts`, `app/api/worlds/[worldId]/lessons/route.ts`
**Severity:** MED (partially pre-existing, partially new in Phase 2A)
**Description:**
The middleware verifies that a `bap-session` cookie exists but does NOT validate that the `childId` query param belongs to the authenticated parent. The middleware comment acknowledges this: _"each route handler must additionally validate that the requested resource belongs to the authenticated parent"_. The new worlds routes added in Phase 2A do not implement this check. Sessions routes also lack it.

An authenticated user with a valid `bap-session` cookie can call `GET /api/worlds?childId=OTHER_CHILD_ID` and receive another family's progress data.

**Note:** This is a pre-existing pattern across Phase 1 routes and the middleware explicitly notes it as a TODO. Phase 2A does not introduce new risk beyond extending the unprotected surface area.

**Fix (short-term):** Add parent-ownership check in worlds routes:
```ts
const parentId = request.cookies.get('parentId')?.value;
// Verify child belongs to this parent via prisma.child.findFirst({ where: { id: childId, parentId } })
```

### MED-02 — Promote and demote blocks use sequential `if` not `else if`
**File:** `lib/game-engine/difficulty-adjuster.ts` lines 67–75
**Severity:** MED
**Description:**
The two adjustment blocks are plain `if` statements, not `else if`. If both `streak >= 3` AND `consecutiveFails >= 2` were true simultaneously in the incoming state (possible via DB corruption or state deserialization error), both blocks would fire in the same call: promotion would set `newDifficulty = idx+1`, then demotion would override it with `idx-1`, and the demote would operate on the original `idx` (not the promoted index).

In practice this cannot occur organically because streak and consecutiveFails are mutually exclusive in normal operation. But the code makes no defensive assertion, and the sequential-if structure is a latent bug if state ever becomes inconsistent.

**Fix:** Use `else if` and/or add an assertion:
```ts
if (streak >= PROMOTE_STREAK_REQUIRED && idx < DIFFICULTY_ORDER.length - 1) {
  newDifficulty = DIFFICULTY_ORDER[idx + 1];
  streak = 0;
} else if (consecutiveFails >= DEMOTE_STREAK_REQUIRED && idx > 0) {
  newDifficulty = DIFFICULTY_ORDER[idx - 1];
  consecutiveFails = 0;
}
```

### MED-03 — `sfx-sprite-map.ts` is a module-level singleton without SSR guard
**File:** `lib/audio/sfx-sprite-map.ts`
**Severity:** MED
**Description:**
The file has no `'use client'` directive and imports `howler` at module level. When Next.js server-side renders any component that transitively imports this module, Howler will attempt to initialize in Node.js (where `window`/`AudioContext` do not exist) and may throw. The file is currently only imported from `use-sound-effects.ts` which is `'use client'`, but this is fragile — any future server component import breaks the build.

**Fix:** Add a guard in `getSfxHowl()`:
```ts
export function getSfxHowl(): Howl | null {
  if (typeof window === 'undefined') return null;
  // ... existing code
}
```
Or add `'use client'` at the top of the file.

### MED-04 — `playSfx` has no invalid key guard
**File:** `lib/audio/sfx-sprite-map.ts` line 30
**Severity:** LOW/MED
**Description:**
`playSfx(key: string)` accepts any string. If an unknown key is passed (typo, future refactor), Howler logs an error but does not throw. This is silent failure. With a typed key type, the TypeScript compiler would catch misuse at compile time.

**Fix:**
```ts
export type SfxKey = keyof typeof SFX_SPRITE_MAP;
export function playSfx(key: SfxKey): void { ... }
```

---

## Suggestions (COULD improve)

### LOW-01 — `generateLocalQuestions` default case silently falls back to hear-tap
**File:** `lib/game-engine/question-loader.ts` line 30
**Description:** An unknown `gameType` silently returns `generateHearTapQuestions` with no log or warning. This will confuse debugging when a new game type is added and not registered.
**Suggestion:** Add `console.warn` in the default case before the fallback.

### LOW-02 — `DifficultyProfile.gameType` stored as plain `String`, no DB constraint
**File:** `prisma/schema.prisma` line 150
**Description:** Prisma stores `gameType` as plain `String`. Any value can be written. The enum constraint exists only at the TypeScript layer. Consider `@@map` or a Prisma enum for stronger integrity, or at minimum a DB-level check constraint.

### LOW-03 — Naming mismatch: `completedByWorld` vs `completedLessonsByWorld`
**File:** `lib/api/worlds-query-helpers.ts` line 44, `app/api/worlds/route.ts` line 59
**Description:** The function parameter is named `completedLessonsByWorld` but the caller passes a variable named `completedByWorld`. Semantics are identical but the naming mismatch adds cognitive overhead.
**Suggestion:** Rename the caller variable to `completedLessonsByWorld` for consistency.

### LOW-04 — `generate-tts-audio.ts` uses `// @ts-nocheck`
**File:** `scripts/generate-tts-audio.ts` line 1
**Description:** `@ts-nocheck` suppresses ALL TypeScript errors for the file. The actual unsafe cast is only on line 75 (`response.audioContent as Buffer`). The rest of the file is typeable.
**Suggestion:** Remove `@ts-nocheck`, add targeted `// eslint-disable-next-line` or use `Buffer.from(response.audioContent as Uint8Array)` with proper typing.

### LOW-05 — PATCH route: 5 sequential DB queries, no transaction
**File:** `app/api/sessions/[id]/route.ts`
**Description:** The PATCH handler performs 5+ sequential Prisma queries (session update, streak update, sticker award, difficulty profile upsert) with no database transaction. If the process dies mid-way, the session is marked `completed` but streak/sticker/difficulty are not updated — partially inconsistent state. For a children's game this is acceptable, but worth noting for future hardening.
**Suggestion:** Wrap the core updates in `prisma.$transaction` when partial failure is unacceptable.

### LOW-06 — `SFX_SPRITE_MAP` offsets are not validated against sprite file duration
**File:** `lib/audio/sfx-sprite-map.ts`
**Description:** The sprite offsets (`[startMs, durationMs]`) are hardcoded constants with no documentation of the expected total sprite file duration (3500 + 1000 = 4500ms). If the sprite file is regenerated with different timing, all sounds break silently.
**Suggestion:** Add a comment with the total expected duration: `// total: 4500ms — must match sfx-sprite.mp3 generated by [tool]`.

### INFO-01 — `complete/route.ts` `computeStars` thresholds differ from `score-calculator.ts`
**File:** `app/api/sessions/complete/route.ts` line 111–116 vs `lib/game-engine/score-calculator.ts`
**Description:** Dead code issue aside, the two star-computation approaches use different inputs: `complete/route.ts` uses accuracy (0–1), while `score-calculator.ts` uses remaining hearts (0–3). They are not equivalent. If server-side scoring is adopted, the accuracy-based approach in `complete/route.ts` should be the canonical one, and the hearts-to-stars client logic should be removed.

---

## Positive Notes

- **SM-2 implementation is clean and pure.** `adjustDifficulty` is a pure function with no side effects, excellent for testing. The 26-test suite achieves good coverage including all boundary conditions.
- **`getBestStarsForChild` is efficient.** Single `groupBy` query instead of N+1 per lesson.
- **`isWorldUnlocked` is a clean pure function** with clear semantics and easy to test.
- **`awardSticker` handles the duplicate-award race condition properly** via P2002 catch on unique constraint.
- **Session double-completion guard** (`status === 'completed'` → 409) prevents streak/sticker double-award.
- **`google-tts-provider.ts` stop/unload before new play** prevents audio overlap correctly.
- **TTS script** graceful no-op when `GOOGLE_APPLICATION_CREDENTIALS` not set — good DX.
- **`playSfx` iOS guard** for suspended AudioContext is correct — just needs `.catch()`.
- **Worlds API** has clean separation: static config in `WORLDS`/`LESSON_TEMPLATES`, dynamic progress in one DB query.
- **`DifficultyProfile` schema** has `@@unique([childId, gameType])` enabling safe upserts and `@@index([childId])` for lookup performance.

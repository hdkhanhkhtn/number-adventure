# Code Review: Phase 2A — PR #9

**Branch:** feature/phase-2a-audio-difficulty-worlds-api → main
**Reviewer:** code-reviewer subagent (Golden Triangle)
**Date:** 2026-04-25
**Full report:** `plans/reports/reviews/REVIEW-REPORT-phase2a.md`

---

## Verdict: APPROVED WITH CONDITIONS

One critical issue (client-provided stars) must be fixed before merge. Two high-severity items should be fixed in the same PR. All other findings are non-blocking.

---

## Executive Summary

Phase 2A delivers three well-scoped subsystems: Howler-based audio pipeline, SM-2 difficulty auto-adjustment, and Worlds/Lessons API. The core logic is sound — the pure `adjustDifficulty` function is well-tested (26 tests, good boundary coverage), DB queries are efficient (single `groupBy` for star lookups), and the audio architecture correctly handles iOS AudioContext unlocking. The main concern is a game integrity flaw where the active session-completion endpoint accepts client-supplied star ratings instead of computing them from verified attempt data.

---

## Issues Found

| # | Severity | File | Description |
|---|----------|------|-------------|
| 1 | CRIT | `app/api/sessions/[id]/route.ts:31` | Stars accepted from client body — game score can be spoofed |
| 2 | HIGH | `lib/audio/google-tts-provider.ts:22` | `lang` param interpolated into URL without sanitization |
| 3 | HIGH | `lib/audio/sfx-sprite-map.ts:37` + `google-tts-provider.ts:36` | `ctx.resume().then()` has no `.catch()` — unhandled rejection on iOS 15+ |
| 4 | HIGH | `app/api/sessions/complete/route.ts` | Dead code (never called) — creates maintenance confusion |
| 5 | MED | `app/api/worlds/route.ts`, `app/api/sessions/[id]/route.ts` | No IDOR ownership check — childId not verified against auth parent |
| 6 | MED | `lib/game-engine/difficulty-adjuster.ts:67–75` | Promote + demote are sequential `if`, not `else if` — latent dual-fire bug |
| 7 | MED | `lib/audio/sfx-sprite-map.ts` | No `'use client'` directive / no SSR guard — Howler init will crash in Node.js context |
| 8 | LOW | `lib/audio/sfx-sprite-map.ts:30` | `playSfx` accepts `string` not typed `SfxKey` — invalid keys silently fail |
| 9 | LOW | `lib/game-engine/question-loader.ts:30` | Default case silently falls back to hear-tap, no warning |
| 10 | LOW | `scripts/generate-tts-audio.ts:1` | `@ts-nocheck` suppresses all TS errors for one file |
| 11 | INFO | `app/api/sessions/[id]/route.ts` | 5+ sequential DB queries, no transaction — partial inconsistency possible |

**Totals:** 1 CRIT · 3 HIGH · 2 MED · 3 LOW · 1 INFO

---

## Security Summary

**CRIT:** Client-provided star rating in PATCH `/api/sessions/:id`. Any authenticated user can send `{ stars: 3 }` and receive perfect-score treatment (3-star record, sticker eligibility, difficulty promotion credit).

**MED:** IDOR risk across all new routes. Middleware only validates cookie existence; no route checks that `childId` belongs to the authenticated parent. This is a pre-existing pattern across Phase 1 routes (documented in middleware as TODO Phase C) — Phase 2A extends the same unprotected surface.

**LOW:** `lang` URL interpolation in `google-tts-provider.ts`. In-browser context limits exploitability to malformed 404 requests; no server-side filesystem access is possible.

---

## Performance Summary

All clear. No N+1 queries found:
- `getBestStarsForChild` uses a single Prisma `groupBy` query for all lessons.
- Worlds route builds all world stats in one in-memory pass over `LESSON_TEMPLATES`.
- `DifficultyProfile` has appropriate `@@unique` and `@@index([childId])` for upsert lookups.

SM-2 is a pure in-memory computation with no additional query cost.

---

## Recommended Actions

**Before merge (blocking):**
1. Fix CRIT-01: Compute stars server-side in PATCH handler from `session.attempts`. Extract `computeStars(accuracy)` into a shared utility and delete `complete/route.ts`.
2. Fix HIGH-02: Add `.catch(() => {})` to both `ctx.resume().then()` calls.
3. Fix HIGH-03 / MED-03: Add `'use client'` or an SSR guard (`typeof window !== 'undefined'`) to `sfx-sprite-map.ts`.

**In this PR (non-blocking but high value):**
4. Fix HIGH-01: Add allowlist validation for `lang` in `google-tts-provider.ts`.
5. Fix MED-02: Change sequential `if/if` to `else if` in `difficulty-adjuster.ts` promote/demote blocks.
6. Fix MED-04: Type `playSfx` key param as `SfxKey = keyof typeof SFX_SPRITE_MAP`.

**Defer to Phase C:**
7. MED-01: IDOR ownership verification (pre-existing, tracked in middleware TODO comment).
8. LOW-04: Remove `@ts-nocheck` from TTS script.
9. LOW-05: Wrap PATCH handler DB operations in a transaction.

---

## Known Issues (pre-confirmed, not blocking)

- `public/audio/sfx-sprite.mp3` binary not yet generated — SFX silent in dev.
- `DifficultyProfile` DB migration not applied in dev (P1010 access denied) — must be run manually.
- Worlds API not yet wired to frontend — Phase 2B task.
- All 194 tests pass, `tsc` clean.

---
title: "Phase 2A -- Audio Pipeline, Difficulty Auto-Adjust, Worlds API"
description: "Howler.js SFX, build-time vi-VN TTS, SM-2 difficulty algorithm, worlds/lessons API"
status: pending
priority: P1
effort: 3d
branch: main
tags: [audio, difficulty, worlds, api, phase2]
created: 2026-04-25
---

# Phase 2A -- Audio Pipeline, Difficulty Auto-Adjust, Worlds API

## User Request (Verbatim)

Implement three features: (1) Howler.js SFX with build-time Google Cloud TTS for vi-VN + en MP3s and offline fallback chain, (2) SM-2 difficulty auto-adjustment wired into all 5 local engines with DifficultyProfile Prisma model and POST /api/sessions/complete, (3) Worlds & Levels API endpoints (GET /api/worlds, GET /api/worlds/[worldId]/lessons) with unlock logic.

## Dependencies

- Research: `research/researcher-audio-pipeline.md` (Howler.js, GCP TTS, iOS constraints)
- Research: `research/researcher-difficulty-algo.md` (SM-2, Prisma upsert, thresholds)
- Scout: `scout/scout-codebase-report.md` (gap analysis, file inventory)
- Brainstorm: `plans/reports/brainstorms/BRAINSTORM-phase2-content-expansion.md`

## Phase Overview

| Phase | Name | Status | Parallel? | Depends On |
|-------|------|--------|-----------|------------|
| 01 | Audio Pipeline | pending | yes (with 03) | none |
| 02 | Difficulty Auto-Adjust | pending | no | Phase 01 (session hook) |
| 03 | Worlds & Levels API | pending | yes (with 01) | none |

Phases 01 and 03 are independent -- can execute in parallel.
Phase 02 depends on Phase 01 only for the `useSoundEffects` integration in session completion flow.

## Key Decisions (✅ Validated 2026-04-25)

1. **MP3 only** -- no WebM (iOS Safari incompatible). ✅ confirmed
2. **Build-time TTS via Google Cloud TTS** -- GCP credentials in env, graceful skip if absent. ✅ confirmed
3. **SM-2 variant thresholds** -- <65% demote, 65-85% hold, >85% for 3 sessions promote. ✅ confirmed
4. **Parent override = hard ceiling** -- `ChildSettings.difficulty` caps auto-adjust; child can be below but never above parent setting. ✅ confirmed
5. **Demotion requires 2 consecutive bad sessions** -- avoids penalising one-off distracted sessions. ✅ confirmed
6. **World unlock** -- complete ALL lessons in previous world with ≥1 star each. ✅ confirmed
7. **Audio fallback chain** -- static MP3 → Web Speech API vi-VN → silence. ✅ confirmed

## Verification Command

```bash
npx tsc --noEmit
```

## Rollback Strategy

- Phase 01: `git revert` (no DB changes)
- Phase 02: `npx prisma migrate reset` + `git revert`
- Phase 03: `git revert` (no DB changes)

## Files Created (Summary)

See individual phase files for complete lists.

| Phase | New Files | Modified Files |
|-------|-----------|----------------|
| 01 | 4 | 3 |
| 02 | 3 | 6 |
| 03 | 2 | 1 |

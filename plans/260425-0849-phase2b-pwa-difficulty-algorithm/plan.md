---
title: "Phase 2B -- PWA + Smart Difficulty Algorithm"
description: "Service worker offline support, install prompt, sliding-window accuracy-based difficulty adjustment"
status: pending
priority: P1
effort: 2.5d
branch: main
tags: [pwa, difficulty, offline, service-worker, phase2]
created: 2026-04-25
---

# Phase 2B -- PWA + Smart Difficulty Algorithm

## User Request (Verbatim)

Implement two features: (1) PWA with `@serwist/next` v9 service worker, offline GameAttempt buffering via IndexedDB, web app manifest, iOS install prompt UI, and Nginx/Docker adjustments; (2) Smart difficulty algorithm using sliding-window accuracy (N=10) per (childId, gameType) with anti-oscillation, extending Phase 2A's `DifficultyProfile` model.

## Dependencies

- Research: `research/researcher-pwa.md` (Serwist, iOS constraints, caching, manifest)
- Research: `research/researcher-difficulty-algorithm.md` (sliding window, ZPD thresholds, anti-oscillation)
- Scout: `scout/scout-codebase-report.md` (file inventory, gap analysis)
- Phase 2A: `plans/260425-0849-phase2a-audio-difficulty-worlds-api/phase-02-difficulty-auto-adjust.md` (DifficultyProfile table, SM-2 algorithm, `POST /api/sessions/complete`)

## Phase Overview

| Phase | Name | Status | Parallel? | Depends On |
|-------|------|--------|-----------|------------|
| 01 | PWA Service Worker | pending | yes | none |
| 02 | Smart Difficulty Algorithm | pending | yes (with 01) | Phase 2A DifficultyProfile table |

Phases 01 and 02 are INDEPENDENT -- can execute in parallel.
Phase 02 requires Phase 2A's `DifficultyProfile` model and `POST /api/sessions/complete` to exist.

## Key Decisions

1. **`@serwist/next` v9** -- TypeScript-first, App Router native, active maintenance.
2. **IndexedDB via `idb`** -- offline GameAttempt queue; drain on `online`/`visibilitychange`/session start.
3. **No Background Sync API** -- iOS unsupported; use event-based fallback only.
4. **Sliding window N=10** -- per (childId, gameType), attempt-level signal (not session average).
5. **Extend DifficultyProfile** -- add `currentBand`, `windowAccuracy`, `bandLockedUntil`, `consecutiveTriggers` (additive migration).
6. **SM-2 override** -- if `easeFactor < 1.5`, block promotion (retention lag overrides recency).
7. **Parent ceiling** -- `ChildSettings.difficulty` caps auto-adjust; never promote above it.

## Verification Command

```bash
npx tsc --noEmit && npm run lint
```

## Rollback Strategy

- Phase 01: `npm uninstall @serwist/next serwist idb` + `git revert` (no DB changes)
- Phase 02: Prisma migration rollback + `git revert`

## Files Summary

| Phase | New Files | Modified Files |
|-------|-----------|----------------|
| 01 | 5 | 4 |
| 02 | 2 | 2 |

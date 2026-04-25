---
title: "Phase 2C -- Game Registry Refactor + New Game Types"
description: "Central game engine registry with 2 new game types: Counting Objects and Number Writing"
status: pending
priority: P2
effort: 3d
branch: main
tags: [refactor, game-engine, registry, count-objects, number-writing, phase2]
created: 2026-04-25
---

# Phase 2C -- Game Registry Refactor + New Game Types

## User Request (verbatim)

Replace per-file import switch-case pattern with a central registry. Add 2 new game types:
`count-objects` (count emoji items, tap correct number) and `number-writing` (tap numbered dots
in sequence to trace a digit). All 5 existing games must continue working.

## Phase Table

| Phase | Name | File | Status | Parallel? | Depends On |
|-------|------|------|--------|-----------|------------|
| 01 | Game Registry Refactor | `phase-01-game-registry-refactor.md` | pending | no | none |
| 02 | Counting Objects Engine + UI | `phase-02-count-objects-game.md` | pending | yes* | Phase 01 |
| 03 | Number Writing Engine + UI | `phase-03-number-writing-game.md` | pending | yes* | Phase 01 |

*Phases 02 and 03 are independent of each other -- can run in parallel after Phase 01.

## Key Dependencies

- `lib/types/common.ts` -- GameType union (currently hardcoded, will become derived)
- `lib/game-engine/question-loader.ts` -- switch-case to replace with registry lookup
- `lib/game-engine/types.ts` -- AnyQuestion union, question interfaces
- `app/(child)/play/[gameType]/[lessonId]/page.tsx` -- GAME_MAP component registry
- `app/api/ai/generate-questions/route.ts` -- QUESTION_SCHEMAS + isValidQuestion
- `src/data/game-config/game-types.ts` -- GAME_TYPES config array
- `src/data/game-config/lesson-templates.ts` -- LESSON_TEMPLATES + WorldId union
- `src/data/game-config/worlds.ts` -- WORLDS config array + WorldId

## Verification Command

```bash
npx tsc --noEmit
```

## No DB Migration Required

All changes are pure code refactor + new static data in seed/config files.
New worlds added to `WorldId` union and `WORLDS` array. New lessons added to `LESSON_TEMPLATES`.

## Design Note

No existing handoff designs for count-objects or number-writing.
Follow existing design system: `GameContainer`, `GameHud`, `NumTile`, `BigButton`, `Sparkles`.

## Rollback

Pure code changes. `git revert` sufficient for any phase.

# SCOUT REPORT — Phase 2C: Registry & New Game Types

**Branch:** `feature/phase-2c-registry-new-game-types` vs `main`  
**Date:** 2026-04-25  
**Changed files:** 20 | **Insertions:** 761 | **Deletions:** 48

---

## Section A: All Changed Files (by Type)

### Created (4 new files)
- `lib/game-engine/registry.ts` — Central game engine registry (32 lines) — maps game type→engine
- `lib/game-engine/dot-paths.ts` — Static digit dot coordinates for number-writing (107 lines)
- `app/(child)/play/[gameType]/[lessonId]/count-objects-game.tsx` — UI for count-objects game (111 lines)
- `app/(child)/play/[gameType]/[lessonId]/number-writing-game.tsx` — UI for number-writing game (215 lines)

### Modified (16 files)
- **Engine files** (7 total): hear-tap, build-number, even-odd, number-order, add-take, count-objects, number-writing — each modified to export `GameEngine` interface +9-40 lines
- **Types** — `lib/game-engine/types.ts` (+24 lines): added `CountObjectsQuestion`, `DotPoint`, `NumberWritingQuestion`, updated `AnyQuestion` union
- **Question loader** — `lib/game-engine/question-loader.ts` (refactored): moved to registry-based lookup, -22 lines
- **Router page** — `app/(child)/play/[gameType]/[lessonId]/page.tsx` (+17 lines): added imports for new games, updated `GAME_MAP` object
- **AI API** — `app/api/ai/generate-questions/route.ts` (+21 lines): added validation schemas for count-objects & number-writing; uses `GAME_REGISTRY` for validation
- **Data configs** — `src/data/game-config/game-types.ts` (+16 lines), `lesson-templates.ts` (+22 lines), `worlds.ts` (+22 lines): added 2 new games to definitions
- **Common types** — `lib/types/common.ts` (+13 lines): added `WorldId` entries for counting-meadow & writing-workshop
- **Test file** — `__tests__/game-engine/question-loader.test.ts` (+26 lines): added tests for count-objects & number-writing generation

---

## Section B: Dependency Graph (Imports)

```
registry.ts (ROOT)
  ├─ imports: {hear-tap,build-number,even-odd,number-order,add-take,count-objects,number-writing}-engine
  ├─ exports: GAME_REGISTRY, GameEngine interface, assertNever()
  └─ used by:
     ├─ lib/types/common.ts (derives GameType)
     ├─ lib/game-engine/question-loader.ts (engine lookup)
     ├─ app/api/ai/generate-questions/route.ts (validates game types)
     └─ app/(child)/play/[gameType]/[lessonId]/page.tsx (VALID_GAME_TYPES, GAME_MAP)

types.ts
  ├─ imports: registry.GameEngine interface
  ├─ exports: *Question interfaces, AnyQuestion union, GameState, GameResult
  └─ used by:
     ├─ page.tsx
     ├─ question-loader.ts
     ├─ api/generate-questions/route.ts
     ├─ all game component files

question-loader.ts
  ├─ imports: GAME_REGISTRY, types
  ├─ exports: generateLocalQuestions(), loadQuestions()
  └─ used by: page.tsx, api/generate-questions/route.ts

dot-paths.ts
  ├─ imports: types.DotPoint
  ├─ exports: DOT_PATHS, DIGIT_SVG_PATHS
  └─ used by: number-writing-engine.ts

number-writing-engine.ts
  ├─ imports: dot-paths.DOT_PATHS
  └─ exported in: registry.ts

page.tsx (ROUTER)
  ├─ imports: GAME_REGISTRY, *-game components
  ├─ uses: VALID_GAME_TYPES, GAME_MAP
  └─ props interface → GameProps used by all 7 game components

count-objects-game.tsx & number-writing-game.tsx
  ├─ imports: types.{CountObjectsQuestion,NumberWritingQuestion,GameResult}
  └─ implements: GameProps interface
```

---

## Section C: Blast Radius (Downstream Consumers)

### High Impact
- **page.tsx**: Router dispatch — **MUST** register all games in `GAME_MAP` before this file, otherwise route 404s
- **api/generate-questions/route.ts**: AI endpoint validation — **MUST** have matching schemas in `QUESTION_SCHEMAS` for each game type

### Medium Impact
- **question-loader.ts**: Falls back to local generation if AI fails — **MUST** have engine registered in `GAME_REGISTRY`
- **lib/types/common.ts**: Derives `GameType` from registry — automatically updated if new games added

### Low Impact
- Test file: tests `generateLocalQuestions` → automatically includes new games if engine exists
- Data configs: mostly data-driven, no code impact

---

## Section D: Architecture Layer Mapping

```
TYPES LAYER
  └─ lib/types/common.ts — GameType, WorldId, Difficulty
  └─ lib/game-engine/types.ts — *Question interfaces

ENGINE LAYER
  ├─ lib/game-engine/registry.ts — central registry (KEY FILE)
  ├─ lib/game-engine/*-engine.ts — 7 engines
  └─ lib/game-engine/question-loader.ts — orchestrator

DATA LAYER
  └─ src/data/game-config/ — game-types.ts, lesson-templates.ts, worlds.ts

API LAYER
  └─ app/api/ai/generate-questions/route.ts — uses registry + validator

ROUTER LAYER
  └─ app/(child)/play/[gameType]/[lessonId]/page.tsx — uses GAME_REGISTRY → GAME_MAP

UI LAYER
  └─ app/(child)/play/[gameType]/[lessonId]/{game}-game.tsx — 7 game components
```

---

## Section E: Consistency Gaps

### Expected but Missing
1. **No static game registry in data config** — games defined in 3 places (engine registry, game-types.ts, lesson-templates.ts) with no cross-reference check. Risk: games in registry but missing from UI config.
2. **No world<→gameType validation** — lesson-templates defines worlds & game types, but no constraint checking if assigned game is appropriate for world.
3. **No QUESTION_SCHEMAS fallback validation** — API assumes schema is defined for all game types in `GAME_REGISTRY`. If new game added without schema, AI validation silently fails without error.

---

## Section F: High-Risk Review Areas

### CRITICAL (must verify)
1. **registry.ts completeness** — all 7 engines imported and re-exported?
2. **page.tsx GAME_MAP** — matches all games in registry + types? Missing entry = 404.
3. **api/generate-questions QUESTION_SCHEMAS** — all game types have entries? Missing = AI validation fails.
4. **types.ts AnyQuestion union** — includes all new question types? Missing = type safety lost.

### HIGH (test these paths)
1. **Question generation flow** — page.tsx → loadQuestions() → GAME_REGISTRY → engine → questions
2. **AI fallback** — try AI endpoint first, if fails revert to local generation
3. **number-writing.tsx with dot-paths** — dots render correctly, tap sequence tracks (novel interaction)
4. **count-objects.tsx emoji rendering** — emoji items display & choices shuffle correctly

### MEDIUM (design review)
1. **GameProps interface stability** — all 7 game components implement same props? Consistent onAttempt/onComplete signatures?
2. **Error handling** — page.tsx: what if validGameType is invalid? (guards to "Unknown game type" div — acceptable)

---

## Summary
Phase 2C introduces centralized game registry architecture with 2 new games (count-objects, number-writing). **Blast radius** is confined to: registry → types → question-loader → router page → game components. **High-risk areas**: registry completeness, GAME_MAP sync, QUESTION_SCHEMAS sync. **Consistency gap**: no automated cross-reference check between registry, game-types config, and lesson templates.


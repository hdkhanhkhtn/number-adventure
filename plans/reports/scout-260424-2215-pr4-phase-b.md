# Scout Report — PR #4 Phase B

**Branch**: `feature/phase-b-child-screens-games` → `main`
**Stats**: 48 files changed, +2520 / -85 lines (85 deletions are plan doc updates)

---

## Changed Files

| File | Type | +Lines | Purpose |
|------|------|--------|---------|
| `app/(child)/layout.tsx` | New | +77 | Onboarding gate: splash → welcome → profile setup → children |
| `app/(child)/home/page.tsx` | New | +61 | Home screen: fetches streak, weekDays, sticker count |
| `app/(child)/worlds/page.tsx` | New | +75 | World map list; fetches `/api/progress/:childId` |
| `app/(child)/worlds/[worldId]/page.tsx` | New | +97 | Level select; zigs-zag layout; lesson lock logic |
| `app/(child)/play/[gameType]/[lessonId]/page.tsx` | New | +90 | Router: loads questions, starts session, dispatches to game component |
| `app/(child)/play/.../hear-tap-game.tsx` | New | +86 | Game 1: hear number → tap tile; uses SpeechSynthesis |
| `app/(child)/play/.../build-number-game.tsx` | New | +80 | Game 2: place tens/ones sticks to hit target |
| `app/(child)/play/.../even-odd-game.tsx` | New | +81 | Game 3: sort number into even/odd house |
| `app/(child)/play/.../number-order-game.tsx` | New | +77 | Game 4: fill the gap in a sequence |
| `app/(child)/play/.../add-take-game.tsx` | New | +88 | Game 5: apple visual + equation, pick answer |
| `app/(child)/reward/page.tsx` | New | +62 | Reads `lastGameResult` from sessionStorage, shows stars/sticker |
| `app/(child)/stickers/page.tsx` | New | +74 | Sticker collection grid |
| `lib/game-engine/types.ts` | New | +56 | Pure types: 5 question shapes, GameState, GameResult |
| `lib/game-engine/question-loader.ts` | New | +41 | `loadQuestions`: tries AI endpoint, falls back to local engine |
| `lib/game-engine/score-calculator.ts` | New | +16 | `calculateStars` + `buildGameResult` from hearts |
| `lib/game-engine/hear-tap-engine.ts` | New | +13 | Local question generator |
| `lib/game-engine/build-number-engine.ts` | New | +10 | Local question generator |
| `lib/game-engine/even-odd-engine.ts` | New | +11 | Local question generator |
| `lib/game-engine/number-order-engine.ts` | New | +18 | Local question generator |
| `lib/game-engine/add-take-engine.ts` | New | +19 | Local question generator |
| `lib/hooks/use-game.ts` | New | +59 | Generic `useGame<Q>`: round, hearts, advance, correct/wrong handlers |
| `lib/hooks/use-game-session.ts` | New | +74 | Session lifecycle hook: start → submitAttempt → completeSession |
| `components/game/game-container.tsx` | New | +27 | Full-screen wrapper with `GardenBg` |
| `components/game/game-hud.tsx` | New | +30 | Hearts + progress bar + close button |
| `components/game/basket.tsx` | New | +45 | Even/Odd basket UI component |
| `components/game/slot-column.tsx` | New | +47 | Tens/Ones column with +/- buttons |
| `components/game/ten-stick.tsx` | New | +12 | Visual: rod of 10 |
| `components/game/one-dot.tsx` | New | +12 | Visual: single dot |
| `components/screens/home-screen.tsx` | New | +129 | Home screen layout (mascot, streak, quick-tiles) |
| `components/screens/splash-screen.tsx` | New | +51 | Animated splash with 2s auto-advance |
| `components/screens/welcome-screen.tsx` | New | +76 | Language picker + start/existing-profile CTA |
| `components/screens/profile-setup.tsx` | New | +115 | Name/age/color form + avatar preview |
| `components/screens/level-node.tsx` | New | +68 | Circular level badge with stars/lock state |
| `components/screens/world-card.tsx` | New | +75 | World card with progress bar |
| `components/screens/reward-content.tsx` | New | +85 | Stars + sticker reveal + continue button |
| `components/screens/quick-tile.tsx` | New | +34 | Home screen shortcut tile |
| `components/screens/stat-display.tsx` | New | +20 | Streak/stat badge |
| `app/api/sessions/route.ts` | Modified | +15 | POST: create game session |
| `app/api/sessions/[id]/route.ts` | Modified | +115 | GET + PATCH: complete session, update streak, award sticker |
| `app/api/sessions/[id]/attempts/route.ts` | Modified | +36 | POST: record attempt |
| `app/api/progress/[childId]/route.ts` | Modified | +80 | GET: world progress + weekly activity |
| `app/api/streaks/[childId]/route.ts` | Modified | +15 | GET: streak data |
| `app/api/stickers/route.ts` | Modified | +11 | GET: all sticker defs |
| `app/api/children/[id]/stickers/route.ts` | Modified | +28 | GET: child's sticker count |
| `app/api/lessons/[lessonId]/route.ts` | Modified | +34 | GET: lesson metadata |
| `app/api/ai/generate-questions/route.ts` | Modified | +110 | POST: AI or local generation + DB cache |
| `plans/...phase-B-child-screens-games.md` | Docs | - | Plan doc updated |
| `plans/.../plan.md` | Docs | - | Plan status updated |

---

## Architecture Layer Map

| Layer | Status | Files |
|-------|--------|-------|
| Routes (`app/(child)/`) | All new | 12 route files across home, worlds, play, reward, stickers |
| Screen components (`components/screens/`) | All new | 9 presentational screens |
| Game components (`components/game/`) | All new | 6 reusable game UI primitives |
| UI components (`components/ui/`) | Phase A — unchanged | `GardenBg`, `NumTile`, `BigButton`, `IconBtn`, etc. |
| Game engine (`lib/game-engine/`) | All new | 7 files: types + 5 engines + loader + scorer |
| Hooks (`lib/hooks/`) | All new | `use-game.ts`, `use-game-session.ts` |
| Context (`context/`) | Phase A — unchanged | `game-progress-context`, `audio-context`, `providers` |
| Data config (`src/data/game-config/`) | Phase A — unchanged | `lesson-templates`, `worlds`, `sticker-defs`, `game-types`, `skills` |
| API routes (`app/api/`) | Expanded | Sessions, progress, streaks, stickers, lessons, AI |
| Types (`lib/types/common.ts`) | Phase A — unchanged | Shared type definitions |

---

## Blast Radius

### Phase B depends on (Phase A / pre-existing):

| Dependency | Used by |
|------------|---------|
| `context/game-progress-context` | All 7 route pages + layout — central state for childId + profile |
| `lib/types/common.ts` | layout, home page, reward page, world page, game-engine (indirectly) |
| `src/data/game-config/lesson-templates` | play page, progress API, lessons API, world detail page |
| `src/data/game-config/worlds` | worlds page, world detail page, progress API |
| `src/data/game-config/sticker-defs` | sessions PATCH route, stickers API |
| `lib/prisma` | All API routes — DB client |
| `components/ui/*` (GardenBg, NumTile, BigButton, IconBtn, Sparkles, SpeakerIcon, etc.) | Game screens and route pages |
| `app/api/auth/register` + `app/api/children` | layout.tsx onboarding flow — calls these to register guest parent + child |

### Phase A code now depended on by Phase B:

The following Phase A items become load-bearing after this PR merges; regressions in them break Phase B:
- `game-progress-context.setChild()` — called by layout after profile setup
- `GardenBg`, `IconBtn`, `NumTile`, `BigButton`, `Sparkles`, `SpeakerIcon` — used across all new game/screen components
- `prisma.gameSession`, `prisma.streak`, `prisma.childSticker`, `prisma.sticker`, `prisma.aIQuestion` — all accessed by the expanded API routes

---

## Consistency Gaps

1. **Zero test files** — No `*.test.ts` or `*.spec.ts` anywhere in the project (outside `node_modules`). The entire game engine (`score-calculator`, all 5 engines, `question-loader`) and the two hooks are pure functions/logic that are trivially testable but have no tests.

2. **Duplicate `GameType` definition** — Defined identically in both `lib/game-engine/types.ts` (line 39) and `lib/types/common.ts` (line 21). Imports split between the two: play page and AI route import from `lib/game-engine/types`; `lesson-templates.ts` imports from `lib/types/common`. No type error today because they're structurally identical, but this is a DRY violation and future drift risk.

3. **Guest `childId` leaks into Prisma** — `app/(child)/layout.tsx` falls back to `local_${Date.now()}` as `childId` when DB registration fails, then passes it into `useGameSession`. The session POST and PATCH will attempt `prisma.gameSession.create({ data: { childId: 'local_1234...' } })` — this will fail with a Prisma FK violation if `Child` table enforces referential integrity on `childId`. No error surface is shown to the user.

4. **`startSession` + `loadQuestions` missing from `useEffect` deps** — `play/[gameType]/[lessonId]/page.tsx` line 56 has `// eslint-disable-line react-hooks/exhaustive-deps`. `startSession` is excluded from deps (it changes on every render due to `useCallback` depending on `childId`/`lessonId`). This could cause stale-closure double-session creation on strict mode double-mount in dev.

5. **`correct` count in reward page is fabricated** — `reward/page.tsx` line 36 derives `correct` from `stars` with hardcoded mapping (`stars===3 → 5, stars===2 → 4, stars===1 → 3`) rather than using the actual attempt count from the session result. The `GameResult.correct` field exists in the type but is not passed through `completeSession` → reward page.

6. **No `loading` / `error` state in world/home pages** — `/worlds`, `/worlds/[worldId]`, and `/home` all fire fetch calls in `useEffect` but only have happy-path state. A failing `/api/progress` call silently renders zero progress (all worlds locked except first). No retry, no error banner.

7. **`stickerTotal` hardcoded to 40** in `home/page.tsx` line 19 — not derived from `STICKER_DEFS` length. Will drift if sticker config changes.

---

## High-Risk Areas

| Risk | Area | Severity |
|------|------|----------|
| FK violation on guest childId | `layout.tsx` fallback → session API | High — crashes silently, session tracking broken for offline-registered users |
| Double-advance on wrong answer | `use-game.ts` `handleWrong` + `hear-tap-game` calling `handleWrong` (which internally calls `setTimeout(advance, 900)`) | Medium — `hear-tap` calls `handleWrong()` directly (correct), but `add-take-game` also calls `handleWrong()` after wrapping in no setTimeout of its own — double-advance not triggered; however `hear-tap` calls `handleWrong()` which sets a 900ms timeout AND the component does nothing else, so timing is fine. Low severity confirmed. |
| Stale closure on session start | `play/page.tsx` useEffect deps suppressed | Medium — in React Strict Mode dev, `startSession` is called twice, creating two sessions for one lesson |
| AI response not validated | `generate-questions/route.ts` line 109 casts parsed JSON directly to `AnyQuestion[]` with no field validation | Medium — malformed AI output passes through to client, causing undefined-access in game components |
| Fabricated `correct` count | `reward/page.tsx` | Low-Medium — wrong stat displayed to child; misleading parent dashboard data |
| Duplicate `GameType` type | `lib/game-engine/types.ts` vs `lib/types/common.ts` | Low — currently structurally identical, but no single source of truth |

---

## Focus Areas for Review (Priority Order)

1. **Guest childId → FK violation** (`layout.tsx` lines 51-52, `sessions/route.ts` line 16): Confirm whether `Child` table has FK constraint on `GameSession.childId`. If yes, the fallback path will always fail silently on DB write.

2. **AI question validation gap** (`generate-questions/route.ts` line 109): The cast `parsed.questions.slice(0, count) as AnyQuestion[]` does zero field checking. A bad AI response (missing `options`, wrong types) will reach game components and crash at render time.

3. **`useEffect` deps suppression** (`play/page.tsx` line 56): Verify that `startSession` is stable enough across renders, or move session start outside the effect or use a ref guard.

4. **`correct` count in reward** (`reward/page.tsx` line 36): Should read from `GameResult.correct` (available in sessionStorage payload) rather than star-to-count mapping.

5. **`stickerTotal` hardcoded** (`home/page.tsx` line 19): Replace with `STICKER_DEFS.length` or a constant from `sticker-defs.ts`.

6. **Duplicate `GameType`**: Consolidate to one source — recommend keeping in `lib/types/common.ts` and re-exporting from `lib/game-engine/types.ts`, or vice versa.

7. **Missing tests**: Game engines and `score-calculator` are pure functions — add unit tests before this merges. `calculateStars` edge cases (0 hearts, >3 hearts) and `buildGameResult` need coverage.

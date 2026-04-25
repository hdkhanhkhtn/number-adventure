# Scout Report — Phase 2A Codebase Analysis

## 1. Prisma Schema (`prisma/schema.prisma`)

- `ChildSettings.difficulty: String @default("easy")` — stores "easy"|"medium"|"hard"
- `Lesson.worldId` — String (no FK constraint), `.difficulty` — String (no enum)
- `GameSession.stars: Int`, `status: String` — no completion timestamp hook
- `GameAttempt.correct: Boolean` — accuracy computable from existing data ✅
- **Missing:** `DifficultyProfile` table (needed for auto-adjustment)
- **Missing:** session completion endpoint (`/api/sessions/complete`)

## 2. Audio System

**`lib/audio/audio-service.ts`:**
- Provider chain: `[GoogleTTSProvider, WebSpeechProvider]`
- STYLE_MAP: `Friendly {rate:0.85, pitch:1.1}` | `Slow {rate:0.65}` | `Adult {rate:1.0}`
- Language: `kidLang === 'vi' ? 'vi-VN' : 'en-US'`

**`lib/hooks/use-sound-effects.ts`:**
- `playCorrect()`, `playWrong()`, `playLevelComplete()` — all TODO stubs ❌

## 3. Game Engine

**`lib/game-engine/question-loader.ts`:**
- Accepts `difficulty` param, passes to AI API — ✅
- `generateLocalQuestions(gameType, count)` — does NOT accept difficulty ❌
- All 5 local engines (hear-tap, build-number, even-odd, number-order, add-take) use random ranges ignoring difficulty

**`lib/game-engine/hear-tap-engine.ts`:**
- `generateHearTapQuestion(max = 20)` — hardcoded max, not difficulty-aware ❌

**`src/data/game-config/game-types.ts`:**
- `numberRange: { easy: [1,10], medium: [1,20], hard: [1,100] }` per game type ✅
- These ranges exist but are NOT wired into local generators

## 4. Worlds & Levels

**`src/data/game-config/worlds.ts`:**
- 5 worlds with static unlock order (0-4), colors, gameTypes arrays
- `getWorld(id)` helper exists

**`src/data/game-config/lesson-templates.ts`:**
- 45 lessons (9 per world × 5 worlds), 3 easy + 3 medium + 3 hard each
- Fields: `id, worldId, gameType, order, title, difficulty, questionCount, passingStars`

**`app/api/worlds/route.ts`:**
- Returns `{ error: 'Not implemented', status: 501 }` — complete stub ❌

## 5. Session API

**`app/api/sessions/route.ts`:**
- `POST /api/sessions` → creates GameSession with status='in_progress' ✅
- No completion endpoint exists ❌ (`/api/sessions/complete` missing)

## Key Gaps for Phase 2A

| Gap | Impact | Files |
|-----|--------|-------|
| SFX stub (Howler.js) | No audio feedback | `lib/hooks/use-sound-effects.ts` |
| Local engines ignore difficulty | Auto-adjust has no effect | All 5 `*-engine.ts` files |
| `/api/worlds` not implemented | World map broken | `app/api/worlds/route.ts` |
| No `/api/sessions/complete` | Can't track completion | Missing file |
| No `DifficultyProfile` table | Can't persist SM-2 state | `prisma/schema.prisma` |
| Pre-recorded audio missing | Offline audio fails | `public/audio/` (empty) |

## Unresolved Questions

1. Should `ChildSettings.difficulty` remain as parent override or be superseded by `DifficultyProfile`?
2. Is there a `/api/sessions/:id/complete` route elsewhere not found?
3. Are GCP credentials available for build-time TTS generation?

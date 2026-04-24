# Module Map

## `lib/game-engine/`

| File | Responsibility |
|---|---|
| `question-generator.ts` | Generates `Question[]` from a `GameConfig`. Pure function, no side effects. |
| `answer-validator.ts` | `validate(answer, question): boolean`. Handles all game types. |
| `difficulty-calculator.ts` | `calcDifficulty(history): Difficulty`. Reads round history, returns next difficulty. |

**Key invariant:** game-engine modules are pure functions — no React, no localStorage, no audio. Easily unit-testable.

## `lib/hooks/`

| File | Responsibility |
|---|---|
| `useGame.ts` | Orchestrates a game round: loads config, generates questions, advances state, records result. |
| `useProgress.ts` | Read/write `ProgressStore` from `ProgressContext`. Exposes `save()`, `load()`, `getLevel()`. |
| `useAudio.ts` | Wraps `AudioContext`. Exposes `play(sfxKey)`, `speak(number)`, `setEnabled()`. |

## `lib/utils/`

| File | Responsibility |
|---|---|
| `number-helpers.ts` | `isEven()`, `randomInRange()`, `shuffle()`, `generateSequence()` |
| `storage.ts` | `loadProgress()`, `saveProgress()` — localStorage wrapper with schema validation |

## `data/`

| Path | Content |
|---|---|
| `data/game-config/hear-tap.ts` | Default `GameConfig` for Hear & Tap per difficulty |
| `data/game-config/number-order.ts` | Default config for Number Order |
| `data/game-config/build-number.ts` | Default config for Build the Number |
| `data/game-config/even-odd.ts` | Default config for Even or Odd |
| `data/game-config/math-kitchen.ts` | Default config for Math Kitchen |
| `data/levels/world-1.ts` | `Level[]` definitions for World 1 |
| `data/levels/world-2.ts` | `Level[]` definitions for World 2 |

## `public/`

| Path | Content |
|---|---|
| `public/audio/sfx/` | correct.mp3, wrong.mp3, tap.mp3, celebrate.mp3, sticker.mp3 |
| `public/audio/voice/` | 0.mp3 … 20.mp3 (spoken numbers) |
| `public/images/mascot/` | bap-idle.svg, bap-celebrate.svg, bap-sad.svg, bap-think.svg |
| `public/images/stickers/` | sticker-01.svg … sticker-NN.svg |
| `public/images/worlds/` | world-1-bg.jpg, world-2-bg.jpg, ... |

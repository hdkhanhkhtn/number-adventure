# Phase 2C Scout Report: Worlds, Game Types & Audio

**Date:** 2026-04-25 | **Scope:** GameType union, question payloads, world/lesson structure, audio system, ChildSettings

---

## GameType Union & Extensibility

**Canonical definition:** `lib/types/common.ts` (lines 21–26)

Five game types defined:
- `hear-tap` — Listen and select number
- `build-number` — Drag tens/ones to build number
- `even-odd` — Sort into even/odd houses
- `number-order` — Arrange numbers in sequence
- `add-take` — Add/subtract operations (Math Kitchen)

**Key:** GameType is a closed union. To add a new game type:
1. Extend union in `lib/types/common.ts`
2. Add GameTypeConfig entry to `GAME_TYPES[]` in `src/data/game-config/game-types.ts`
3. Add question interface to `lib/game-engine/types.ts`
4. Create game component and add to GAME_MAP in `app/(child)/play/.../page.tsx`
5. Add LessonTemplate entries to `src/data/game-config/lesson-templates.ts`

---

## Question Payload Shapes

All defined in `lib/game-engine/types.ts`. AnyQuestion union includes:

| Game Type | Interface | Payload Fields |
|-----------|-----------|----------------|
| hear-tap | HearTapQuestion | target: number; options: number[] |
| build-number | BuildNumberQuestion | target: number |
| even-odd | EvenOddQuestion | number: number; isEven: boolean |
| number-order | NumberOrderQuestion | seq: number[]; hideIdx: number; target: number; options: number[] |
| add-take | AddTakeQuestion | a: number; b: number; op: '+'\|'-'; target: number; options: number[] |

**Storage:** AIQuestion.payload is JSON field in Prisma (flexible schema). Difficulty always alongside: `difficulty: 'easy' | 'medium' | 'hard'`

---

## World & Lesson Data Structure

### Worlds (static in `src/data/game-config/worlds.ts`)

Five worlds unlock in order (unlockOrder):
1. **Number Garden** (0) — hear-tap, build-number | 9 lessons
2. **Counting Castle** (1) — number-order | 9 lessons
3. **Even-Odd House** (2) — even-odd | 9 lessons
4. **Number Sequence** (3) — number-order | 9 lessons
5. **Math Kitchen** (4) — add-take | 9 lessons

Each world has: id, name, subtitle, color (TileColor), bg (hex), emoji, gameTypes[], lessonCount, unlockOrder

### Lessons (static in `src/data/game-config/lesson-templates.ts`)

LessonTemplate shape:
```
id: string (e.g. 'ng-01')
worldId: WorldId
gameType: GameType
order: number (1–9 per world)
title: string
difficulty: Difficulty
questionCount: number (8–15)
passingStars: number (1–2)
```

45 lessons total (5 worlds × 9 lessons). Pattern: 3 easy, 3 medium, 3 hard per world. Difficulty gate: must earn min passingStars to unlock next.

---

## Audio System Architecture

### Provider Chain (`lib/audio/audio-service.ts`)

- **Priority:** GoogleTTSProvider first (higher quality), WebSpeechProvider fallback
- **Public methods:** `playNumber(n)`, `playText(text)`, `stop()`, `updateConfig(partial)`
- **Language detection:** `kidLang === 'vi' ? 'vi-VN' : 'en-US'`
- **Style tuning (STYLE_MAP):**
  - Friendly: rate 0.85, pitch 1.1
  - Slow: rate 0.65, pitch 1.0
  - Adult: rate 1.0, pitch 0.9

### Audio Context (`context/audio-context.tsx`)

Provides AudioContextValue with:
- **Settings toggles:** sfxEnabled, musicEnabled, voiceEnabled, voiceStyle, kidLang
- **Speak helpers:** speakNumber(n), speakText(text), speak(n|string)
- **Control:** setters for all toggles, stop() method
- **Instance:** AudioService singleton, config updates patched via updateConfig

**Defaults:** voice/sfx/music all true, Friendly style, 'en' language

### Audio Config Types (`lib/audio/types.ts`)

- VoiceStyle: 'Friendly' | 'Slow' | 'Adult'
- AudioConfig: voiceEnabled, sfxEnabled, musicEnabled, voiceStyle, kidLang
- AudioProvider interface: speak(text, options?), stop(), isAvailable()
- SpeakOptions: lang?, rate?, pitch?

---

## ChildSettings (Database)

Schema model in `prisma/schema.prisma` (lines 40–54):

```prisma
model ChildSettings {
  id         String  @id
  childId    String  @unique
  dailyMin   Int     @default(15)
  difficulty String  @default("easy")      // easy | medium | hard
  kidLang    String  @default("en")        // Language for game narration
  parentLang String  @default("vi")        // Parent settings UI language
  sfx        Boolean @default(true)
  music      Boolean @default(true)
  voice      Boolean @default(true)        // TTS enabled
  voiceStyle String  @default("Friendly")  // Friendly | Slow | Adult
  quietHours Boolean @default(false)       // Unused in current codebase
  child      Child   @relation(...)
}
```

**Key:** kidLang is the active field for audio language routing (vi-VN vs en-US in AudioService).

---

## Sound Effects Status

Hook location: `lib/hooks/use-sound-effects.ts`

**Current state:** Stubs only. Hook exposes:
- playCorrect() — TODO: Play via Howler.js
- playWrong() — TODO: Play via Howler.js
- playLevelComplete() — TODO: Play via Howler.js

**Integration point:** Uses AudioCtx.sfxEnabled check; awaits Howler.js library in Phase 2.

---

## Key Gaps for Phase 2C

1. **SFX implementation** — Howler.js integration missing; stubs present
2. **Music system** — No background music loader or provider; only toggles in schema/context
3. **Language detection in game UI** — kidLang drives audio but not UI text strings
4. **Audio assets** — No audio file paths, CDN URLs, or asset registry
5. **World/game type mapping validation** — No constraint check that lesson.gameType matches world.gameTypes
6. **Difficulty progression** — passingStars gate logic exists in schema but no enforcement in game flow

---

## Files to Create (Phase 2C)

- `lib/audio/howler-provider.ts` — Howler.js SFX wrapper
- `lib/audio/music-service.ts` — Background music loader/player
- `src/data/audio-assets/sfx-registry.ts` — SFX file paths and metadata
- `src/data/audio-assets/music-registry.ts` — Music tracks per world/mood
- `lib/hooks/use-music.ts` — Music context hook (parallel to useSoundEffects)

## Files to Modify (Phase 2C)

- `lib/game-engine/types.ts` — No changes needed (extensible)
- `src/data/game-config/game-types.ts` — Add future game types here
- `src/data/game-config/worlds.ts` — Add world configs (static list complete)
- `lib/audio/audio-service.ts` — Consider music playback orchestration
- `context/audio-context.tsx` — May add musicService ref and hook
- `app/(child)/play/.../page.tsx` — Will integrate SFX/music on attempt/complete
- `lib/game-engine/question-loader.ts` — Validate gameType ∈ world.gameTypes

---

## Unresolved Questions

- Where do audio/music asset files live? CDN path strategy?
- What Howler.js version and configuration?
- Music trigger strategy — world enter, lesson start, or round-based?
- Language translations for UI strings — separate i18n system or embed in templates?
- Difficulty gate enforcement — client-side validation only or server-side?

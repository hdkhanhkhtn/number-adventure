# MAILBOX — Phase 2A Implementation (2026-04-25)

> Append-only. Never edit prior entries.

---

## [T00] DECISION | Tech Lead → All
**Phase**: Pre-flight
**Task**: Branch Setup
**Content**:
Branch `feature/phase-2a-audio-difficulty-worlds-api` created from `main`.
Implementation phases:
- Phase 01 (Audio Pipeline) — independent, no DB changes
- Phase 03 (Worlds & Levels API) — independent, no DB changes — parallel with Phase 01
- Phase 02 (Difficulty Auto-Adjust) — requires Phase 01 SFX hook; runs after

Shared Task List:
| ID | Status | Description | Files |
|----|--------|-------------|-------|
| T01 | pending | Install howler + tsx deps | package.json |
| T02 | pending | Create tsconfig.scripts.json | tsconfig.scripts.json |
| T03 | pending | Create sfx-sprite-map.ts | lib/audio/sfx-sprite-map.ts |
| T04 | pending | Rewrite use-sound-effects.ts | lib/hooks/use-sound-effects.ts |
| T05 | pending | Rewrite google-tts-provider.ts | lib/audio/google-tts-provider.ts |
| T06 | pending | Create generate-tts-audio.ts | scripts/generate-tts-audio.ts |
| T07 | pending | Add generate:audio script | package.json |
| T08 | pending | Create public/audio dirs | public/audio/ |
| T09 | pending | Create worlds-query-helpers.ts | lib/api/worlds-query-helpers.ts |
| T10 | pending | Rewrite worlds/route.ts | app/api/worlds/route.ts |
| T11 | pending | Create worlds/[worldId]/lessons/route.ts | app/api/worlds/[worldId]/lessons/route.ts |
| T12 | pending | Add DifficultyProfile to schema | prisma/schema.prisma |
| T13 | pending | Run prisma migrate | DB |
| T14 | pending | Create difficulty-adjuster.ts | lib/game-engine/difficulty-adjuster.ts |
| T15 | pending | Create sessions/complete/route.ts | app/api/sessions/complete/route.ts |
| T16 | pending | Update question-loader.ts | lib/game-engine/question-loader.ts |
| T17-21 | pending | Update 5 game engines | lib/game-engine/*-engine.ts |
| T22 | pending | tsc --noEmit verification | — |

---

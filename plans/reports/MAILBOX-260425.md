# MAILBOX — Phase D Implementation | 2026-04-25

> Feature: Phase D — AudioService + Tests + Accessibility + Docker Deploy
> Plan: plans/260424-1457-phase1-mvp-implementation/phase-D-audio-qa-polish.md
> Triangle: tech-lead (TL) | fullstack-developer (Exec) | code-reviewer (Rev)

---

## [260425-0200] TASK_ASSIGNMENT | tech-lead → all

**Phase**: 6 — Implementation
**Task**: Shared Task List

### Shared Task List

| ID  | Status     | Task                                              | Files                                                     | Wave |
|-----|------------|---------------------------------------------------|-----------------------------------------------------------|------|
| T1  | 📋 pending | AudioService architecture (lib/audio/ 4 files)   | lib/audio/types.ts, audio-service.ts, web-speech-provider.ts, google-tts-provider.ts | 1 |
| T2  | 📋 pending | Audio hooks (use-audio.ts, use-sound-effects.ts) | lib/hooks/use-audio.ts, lib/hooks/use-sound-effects.ts    | 1 |
| T3  | 📋 pending | Update audio-context.tsx → wire AudioService     | context/audio-context.tsx                                 | 1 |
| T4  | 📋 pending | Wire useAudio into HearTap game                  | app/(child)/play/[gameType]/[lessonId]/hear-tap-game.tsx   | 2 |
| T5  | 📋 pending | Wire useSoundEffects into all 5 games            | app/(child)/play/[gameType]/[lessonId]/*.tsx               | 2 |
| T6  | 📋 pending | Touch events + ARIA + keyboard on UI components  | components/ui/num-tile.tsx, big-button.tsx, icon-btn.tsx, components/game/game-hud.tsx | 2 |
| T7  | 📋 pending | Framer Motion: pop-in, wiggle, slide-up          | components/ui/num-tile.tsx, components/game/game-hud.tsx   | 2 |
| T8  | 📋 pending | Missing API tests                                | __tests__/api/ai-generate.test.ts, report.test.ts         | 3 |
| T9  | 📋 pending | UI component tests                               | __tests__/components/ui/*.test.tsx, game/game-hud.test.tsx | 3 |
| T10 | 📋 pending | nginx/nginx.conf                                 | nginx/nginx.conf                                           | 1 |
| T11 | 📋 pending | scripts/seed.sh + prisma/seed.ts                 | scripts/seed.sh, prisma/seed.ts                           | 1 |

### Execution Plan
- Wave 1 (parallel): T1+T2+T3 (audio system) + T10+T11 (docker/deploy)
- Wave 2 (sequential): T4+T5+T6+T7 (game integration, depends on Wave 1 audio)
- Wave 3 (parallel): T8+T9 (tests, after Wave 2)

---

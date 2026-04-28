---
title: "Phase 3 — Stability, Content & Growth"
description: "Fix navigation, complete onboarding, AI content pipeline, multi-child, email reports"
status: pending
priority: P1
effort: 9d
branch: main
tags: [navigation, onboarding, ai-content, multi-child, email, phase3]
created: 2026-04-26
---

# Phase 3 — Stability, Content & Growth

## User Request

> Fix navigation/flow issues, complete settings, expand content with AI pipeline, add social features.

## Research

- [Phase 3A Research](research/researcher-phase3a-navigation-onboarding.md)
- [Phase 3B+3C Research](research/researcher-phase3bc-ai-pipeline-social.md)
- [Scout Report](scout/scout-phase3-codebase.md)

## Dependencies

- Phase 2 Complete (all milestones done)
- Prisma schema: `Parent.children[]`, `ChildSettings`, `Lesson`, `GameSession`, `Streak` tables exist
- `game-progress-context.tsx` handles localStorage hydration
- `(child)/layout.tsx` has 4-step onboarding state machine

## Phases

| # | Phase | File | Status | Priority | Effort |
|---|-------|------|--------|----------|--------|
| 1 | Navigation & Onboarding Redesign | [phase-01](phase-01-navigation-onboarding-redesign.md) | In Progress — Code gaps remain (see phase-01) | Critical | ~3d |
| 2 | AI Content Pipeline & World Expansion | [phase-02](phase-02-ai-content-pipeline-world-expansion.md) | Code Complete — Operational steps pending | High | ~3d |
| 3 | Social & Multi-Profile | [phase-03](phase-03-social-multi-profile.md) | Complete (2026-04-28) | Medium | ~3d |

## Execution Order

Phase 1 (3A) is blocking — blank screen fix and onboarding are Critical.
Phase 2 (3B) and Phase 3 (3C) are independent; can execute in parallel after Phase 1 completes.

## Key Constraints

- Next.js 16 App Router + TypeScript + Tailwind + Prisma + PostgreSQL
- Mobile-first, touch-first, child-safe (no external links)
- `useProgress` hook does NOT exist — use `GameProgressContext` directly
- Settings: separate `useSettings` hook to avoid re-renders on game events
- Guest IDs: `guest_<uuid>` prefix in localStorage
- All new API routes must validate `session.parentId`

## Risk Summary

| Risk | Mitigation |
|------|-----------|
| Blank screen regression on other pages | Apply guard pattern to ALL child pages |
| Guest→DB migration data loss | Copy-then-delete strategy; never block gameplay |
| AI-generated lesson quality | Zod validation + `--dry-run` flag on generator script |
| Email deliverability | Use Resend + node-cron (self-hosted); include unsubscribe link |

---

## Validation Summary

**Validated:** 2026-04-26  
**Questions asked:** 5

### Confirmed Decisions

| Decision | Confirmed Choice |
|---|---|
| Deployment platform | Self-hosted VPS — use `node-cron` (not Vercel Cron) for weekly email |
| Guest session storage | Written to DB under guest child record — migration must copy GameSession, GameAttempt, ChildSticker rows |
| New settings persistence | Sync to `ChildSettings` DB table — requires Prisma migration to add new columns |
| AI lesson generator | Use existing `AI_ENDPOINT` (9router) — no new `@anthropic-ai/sdk` dependency |
| Phase 3C scope | All 5 tasks in scope: multi-child (3C-01), encouragement (3C-02), email (3C-03), PDF/CSV export (3C-04), leaderboard (3C-05) |

### Action Items

- [ ] **phase-01**: Update 3A-05 — new settings (volume, contrast, bedtime, hints) sync to `ChildSettings` DB via `PATCH /api/children/[id]/settings` instead of localStorage-only
- [ ] **phase-01**: Update `useSettings` hook — reads from DB on mount, debounced writes to API
- [ ] **phase-01**: Add Prisma migration for new `ChildSettings` columns: `volume`, `highContrast`, `reduceMotion`, `bedtimeEnabled`, `bedtimeHour`, `bedtimeMinute`, `breakReminderEnabled`, `breakReminderInterval`, `gameHints`, `gameRotation`
- [ ] **phase-02**: Replace `@anthropic-ai/sdk` with `AI_ENDPOINT` fetch in `scripts/generate-lessons.ts`
- [ ] **phase-03**: Replace Vercel Cron with `node-cron` package for weekly email scheduler; deploy as background worker or standalone script
- [ ] **phase-03**: Migration endpoint must copy DB rows (GameSession, GameAttempt, ChildSticker, Streak) from guest child → new parent-linked child in a Prisma transaction

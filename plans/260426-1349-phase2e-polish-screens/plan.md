---
title: "Phase 2E — Polish Completion"
description: "7 missing UX screens: orientation overlays, sticker moments, session/streak screens, offline state"
status: pending
priority: P2
effort: 5d
branch: main
tags: [ux, screens, stickers, offline, pwa, streak, phase2e]
created: 2026-04-26
---

# Phase 2E — Polish Completion

## Goal

Add 7 remaining UX screens (22 -> 29 of 33 designed screens). These are polish & retention features — not blockers, but gap-closers for a professional product feel.

## Phase Summary

| # | Phase | Priority | Effort | Status | Depends On |
|---|-------|----------|--------|--------|------------|
| 1 | [Orientation Overlays](./phase-01-orientation-overlays.md) | P2 | 1d | pending | none |
| 2 | [Sticker Screens](./phase-02-sticker-screens.md) | P2 | 1d | pending | none |
| 3 | [Session & Streak Screens](./phase-03-session-streak-screens.md) | P2 | 1.5d | pending | Phase 2D daily-goal-overlay |
| 4 | [Offline State](./phase-04-offline-state.md) | P2 | 1.5d | pending | none |

## Dependencies

- **Phase 01, 02, 04** are independent of Phase 2D — can start immediately
- **Phase 03** depends on Phase 2D's `daily-goal-overlay.tsx` and `useSessionTimer` existing
- All 4 phases are independent of each other — can run in parallel

## Key Technical Decisions

- All overlays: `useState` local boolean + fixed fullscreen div (matches `parent-gate`, `exit-confirm-modal` pattern)
- localStorage-gated one-time flows: same pattern as `ios-install-prompt.tsx`
- `BapMascot` mood: use `'celebrate'` (not `'excited'` — only 5 moods: happy/wink/think/sleep/celebrate)
- Bottom-sheets: CSS transition or Framer Motion `AnimatePresence` (no new deps)
- Offline: serwist `fallbacks.document` in `next.config.ts` + `useOnline` hook (two-tier)
- No new npm packages required

## Validation Summary

**Validated:** 2026-04-26 | **Questions asked:** 6

### Confirmed Decisions

| Decision | Confirmed Choice |
|---|---|
| World Intro dismiss | Explicit "Let's Go!" button tap — child acknowledges before entering world map |
| Streak calendar data | Current week only, empty cells for rest of month — full-month API is future scope |
| OfflineToast mount point | `app/layout.tsx` (root) — single mount, shows on all pages |
| Phase 03 scope | Verify Phase 2D wiring exists; Phase 2E adds streak detail sheet only. No double-wiring. |
| Sticker earn trigger | First earn only — API returns null if sticker already in ChildSticker; no client-side guard needed |
| Implementation order | Phase 2E starts AFTER Phase 2D ships — avoid conflicts, finish P0 blockers first |

### Action Items

- [ ] **Phase 01**: Update "Dependencies" line — all 4 phases start AFTER Phase 2D ships (not "can start immediately")
- [ ] **Phase 02**: Clarify sticker earn trigger: API-driven (null sticker prop = already earned = no overlay). No `ChildSticker` check on client.
- [ ] **Phase 03**: Scope = streak detail sheet only. If Phase 2D wired `DailyGoalOverlay` in reward page, Phase 2E does not rewire. Add explicit verification step before implementation.
- [ ] **Phase 04**: `OfflineToast` mounts in `app/layout.tsx`, not AppShell. Update "Related Code Files" to add `app/layout.tsx` to the modified list.

## Source Reports

- [Intro/Onboarding Research](./research/researcher-intro-onboarding.md)
- [Screen Detail Research](./research/researcher-screens-detail.md)
- [Scout Report](./scout/)
- [Phase 2D Plan](../260425-1917-phase2d-ux-auth-completion/plan.md)

## New Files Created (8)

| File | Phase |
|------|-------|
| `components/screens/world-intro-overlay.tsx` | 01 |
| `components/screens/parent-onboarding-overlay.tsx` | 01 |
| `components/screens/sticker-earn-overlay.tsx` | 02 |
| `components/ui/sticker-detail-sheet.tsx` | 02 |
| `components/ui/streak-detail-sheet.tsx` | 03 |
| `app/offline/page.tsx` | 04 |
| `lib/hooks/use-online.ts` | 04 |
| `components/ui/offline-toast.tsx` | 04 |

## Files Modified (7)

| File | Phase |
|------|-------|
| `app/(child)/worlds/page.tsx` | 01 |
| `components/screens/parent-dashboard-content.tsx` | 01 |
| `components/screens/reward-content.tsx` | 02 |
| `app/(child)/stickers/page.tsx` | 02 |
| `app/(child)/reward/page.tsx` | 03 |
| `components/ui/streak-card.tsx` | 03 |
| `next.config.ts` | 04 |

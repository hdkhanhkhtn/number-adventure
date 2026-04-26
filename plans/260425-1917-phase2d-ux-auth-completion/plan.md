---
title: "Phase 2D — Shippable MVP Gate"
description: "Auth hardening, guest persistence, session enforcement, missing UX screens, and quality closure"
status: pending
priority: P0
effort: 8d
branch: main
tags: [auth, ux, testing, parent-settings, phase2d]
created: 2026-04-26
---

# Phase 2D — Shippable MVP Gate

## Goal

Close all gaps that break parent trust, child retention, or security. After Phase 2D the app is shippable: auth is real, progress persists, sessions end gracefully, parents see useful UI on day 1, and two new game UIs have component tests.

## Phase Summary

| # | Phase | Priority | Effort | Status |
|---|-------|----------|--------|--------|
| 1 | [Auth Hardening](./phase-01-auth-hardening.md) | P0 | 2d | pending |
| 2 | [Guest-to-DB Persistence](./phase-02-guest-persistence.md) | P0 | 1.5d | pending |
| 3 | [Session Time Enforcement](./phase-03-session-enforcement.md) | P0 | 1d | pending |
| 4 | [Parent Dashboard & Settings](./phase-04-parent-dashboard-settings.md) | P0 | 1.5d | pending |
| 5 | [Celebration & Confirmation Overlays](./phase-05-celebration-overlays.md) | P1 | 1d | pending |
| 6 | [Component Tests](./phase-06-component-tests.md) | P0 | 1d | pending |

## Dependencies

- Phase 1 (auth) must complete before Phase 2 (guest persistence uses parentId cookie).
- Phase 3 (session enforcement) depends on settings being readable (already implemented).
- Phases 4, 5, 6 are independent of each other; can run in parallel after Phase 1.

## Key Technical Decisions

- `bcryptjs` (pure JS, already installed) — no native bindings, no Edge runtime issues
- `LRUCache` from `lru-cache` for in-memory rate limiting — no Redis needed
- `parent-gate` httpOnly cookie (30 min TTL) for PIN session
- Overlay pattern: `useState` local boolean + fixed fullscreen div z-50 (matches existing codebase)
- No new packages required

## Phase 2E — Deferred Items

These items are documented but NOT planned in detail:

1. First Day Intro (World Intro) overlay
2. Parent Onboarding first-run flow
3. Session Complete screen variant (distinct from reward)
4. Sticker Earn Moment overlay
5. Sticker Detail screen
6. Streak standalone page
7. Offline / No Connection state screen

Decision gate: if Phase 2D ships and passes stakeholder review, Phase 2E runs immediately. Otherwise deferred to Phase 3.

## Validation Summary

**Validated:** 2026-04-26 | **Questions asked:** 5

### Confirmed Decisions

| Decision | Confirmed Choice | Rationale |
|---|---|---|
| PIN null behavior | Force "Tạo PIN phụ huynh" wizard | Auto-pass leaves parent area completely unprotected; one-time setup, familiar from screen-time apps |
| Parent-gate cookie TTL | 30 minutes | Session-only breaks PWA UX (app stays open in background); 24h too permissive if child gets device |
| Security tab access | Require PIN gate first | PIN change + reset progress are highest-impact actions; forgetting PIN → separate recovery flow |
| Reset progress scope | Sessions + stars + stickers only | Keep profile, settings, streak, difficulty profile; delete GameSession, GameAttempt, ChildSticker |
| Phase 2E scope | Decide after 2D ships | Explicit go/no-go gate; real usage data may reprioritize vs Phase 3 social features |

### Action Items (Phase File Updates Required)

- [ ] **Phase 01**: Change FR4 — `pinHash null` → redirect to "Tạo PIN phụ huynh" wizard (single-screen: enter 4 digits → confirm → `POST /api/auth/pin/setup`), not auto-pass
- [ ] **Phase 01**: Add `POST /api/auth/pin/setup` endpoint (first-time PIN creation, no current-PIN required)
- [ ] **Phase 04**: Add "Forgot PIN" recovery flow to Security tab — `POST /api/auth/pin/reset` verifies account password (`bcrypt.compare` against `Parent.passwordHash`), then allows PIN reset without current PIN
- [ ] **Phase 04**: Security tab hidden behind PIN gate (rendered only when `gateUnlocked === true` from session API)
- [ ] **Phase 04**: Reset scope confirmed — `DELETE /api/children/{childId}/progress` removes GameSession, GameAttempt, ChildSticker; preserves Child, ChildSettings, Streak, DifficultyProfile

## Source Reports

- [Brainstorm](../reports/brainstorms/BRAINSTORM-phase2-remaining.md)
- [Scout](../reports/scouts/SCOUT-phase2-remaining.md)
- [Auth Research](./research/researcher-auth-impl.md)
- [Testing/Overlay Research](./research/researcher-testing-overlay.md)

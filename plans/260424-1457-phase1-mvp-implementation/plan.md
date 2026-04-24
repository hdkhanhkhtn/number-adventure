# Phase 1 MVP: Full-Stack Bap Number Adventure (Next.js + PostgreSQL + AI)

**Request:** Build Bap Number Adventure as a full-stack Next.js 14+ app with PostgreSQL backend, AI-generated game content, and Docker deployment.

**Source:** `src/` folder (8 JSX prototype files + 1 CSS file)
**Target:** Next.js 14 App Router, TypeScript strict, Tailwind CSS, Prisma ORM, PostgreSQL, AI endpoint, Docker

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| ORM | Prisma |
| Database | PostgreSQL |
| AI | https://9router.remotestaff.vn/v1 (advance-model) |
| Audio | Web Speech API (MVP), Google TTS (optional) |
| Animation | Framer Motion + CSS keyframes |
| State | React Context (UI cache only -- DB is source of truth) |
| Deployment | Docker + PostgreSQL + Nginx on VPS |

---

## Phase Dependency Graph

```
Phase A (Foundation + DB + API scaffold)
  |          \
  v           v
Phase B      Phase C
(Child +     (Parent +
 Games +      Dashboard +
 API)         Report + API)
  |           |
  v           v
Phase D (Audio + Tests + Deploy)
```

- **Phase A** -- no dependencies, runs first
- **Phase B** -- depends on Phase A (UI components, DB schema, API base)
- **Phase C** -- depends on Phase A (parallel with B)
- **Phase D** -- depends on B + C complete

---

## Phase Summary

| Phase | Name | Scope | Status | Depends On |
|-------|------|-------|--------|------------|
| A | [Foundation + DB](./phase-A-foundation.md) | ~40 files | Pending | None |
| B | [Child Screens + Games + API](./phase-B-child-screens-games.md) | ~35 files | Pending | A |
| C | [Parent Area + Report + API](./phase-C-parent-area.md) | ~18 files | Pending | A |
| D | [Audio + Tests + Deploy](./phase-D-audio-qa-polish.md) | ~20 files | Pending | B, C |

---

## Key Decisions (All Resolved)

1. **Source of truth:** PostgreSQL (not localStorage) -- localStorage is cache only
2. **Static game config:** `src/data/game-config/` (worlds, game types, lesson templates, skills, sticker defs)
3. **Audio:** Web Speech API (MVP), Google TTS optional upgrade
4. **ParentReport:** IN SCOPE Phase C (simple, not heavy analytics)
5. **StreakScreen:** NO route -- `StreakCard` component only (in Home, Dashboard, Reward)
6. **Math Kitchen = World, AddTake = Game type** (separate entities, not merged)
7. **Routing:** `/worlds/[worldId]` and `/play/[gameType]/[lessonId]` (not `/child/game/[gameId]`)
8. **AI questions:** Generated 5-10 per lesson start, validated by backend, stored in `AIQuestion` DB table
9. **Backend:** Next.js API Routes + Prisma ORM
10. **Deployment:** Docker + PostgreSQL + Nginx on VPS

---

## DB Tables (Phase A)

Parent, Child, ChildSettings, Lesson, GameSession, GameAttempt, AIQuestion, Sticker, ChildSticker, Streak

## API Endpoints (across Phase A-C)

Auth, Children, Worlds, Lessons, Sessions, Attempts, AI generation, Progress, Report, Streaks, Stickers

# Architecture Revision Summary — Bap Number Adventure MVP v2

**Date:** April 24, 2026  
**Trigger:** 11 Critical Resolved Decisions from design architecture spec  
**Status:** ✅ Complete

## Overview

Updated all documentation to reflect the evolution from **frontend-only (localStorage)** to **full-stack (PostgreSQL + API Routes + AI Integration)** architecture.

## Critical Changes Implemented

### 1. Data Persistence
- **Old:** localStorage only (client-side state, no backend)
- **New:** PostgreSQL as source of truth + React Context cache + localStorage fallback

### 2. Backend Infrastructure
- **Old:** None (pure frontend)
- **New:** Next.js API Routes + Prisma ORM + PostgreSQL
  - Endpoints: auth, children, sessions, ai, progress, parent-report, stickers

### 3. AI Content Generation
- **Old:** Static questions in code
- **New:** Dynamic generation via `${AI_ENDPOINT}` env var (model: advance-model)
  - 5–10 questions generated per lesson start
  - Cached in AIQuestion table, reused across sessions
  - Validated JSON before storing

### 4. Database Tables (10 core)
- Parent (accounts, PIN)
- Child (profiles, age, avatar)
- ChildSettings (preferences: difficulty, language, audio, daily limits)
- Lesson (static reference to lessons per world)
- GameSession (play session tracking: start, completion, stars)
- GameAttempt (per-question result tracking)
- AIQuestion (cached AI-generated content)
- Sticker, ChildSticker (reward inventory)
- Streak (daily streak tracking)

### 5. Routing Structure
- **Old:** `/child/game/[gameId]`
- **New:** `/worlds/:worldId` + `/play/:gameType/:lessonId`
- **New:** `/api/*` for all backend endpoints

### 6. Game Architecture
- **Clarified:** Math Kitchen = World (not game type)
- **Clarified:** AddTake = Game type within Math Kitchen
- **Not merged:** They are separate concepts (world vs. game type)

### 7. Parent Report
- **Decision:** Include in MVP Phase C
- **Scope:** Simple report only (no heavy analytics)
  - Lessons completed, stars earned, skills practiced, recent activity, recommended next step

### 8. Streak System
- **Decision:** No dedicated `/progress/streak` route in MVP
- **Instead:** StreakCard component shown in:
  - Home screen
  - Parent dashboard
  - Reward screen

### 9. Audio Strategy
- **Priority 1 (MVP):** Web Speech API for text-to-speech
- **Priority 2 (Phase 2+):** Google Text-to-Speech (optional)
- **Priority 3 (Phase 2+):** AI-generated audio (if verified)
- **All:** Howler.js for SFX, graceful fallback to silent

### 10. Deployment
- **New:** Docker-based (PostgreSQL + Next.js containers)
- **Target:** VPS deployment
- **Optional:** Nginx reverse proxy

### 11. API-Driven UI
- All progress fetched from `/api/progress` on app load
- Game sessions created via `/api/sessions/*`
- AI questions generated on demand via `/api/ai/generate`
- Parent report fetched from `/api/parent-report`

## Documentation Files Updated

### Core Architecture (7 files)

| File | Change | Impact |
|------|--------|--------|
| `docs/knowledge-overview/02-tech-stack.md` | Added: PostgreSQL, Prisma, API Routes, Docker, AI endpoint (9router) | Frontend → Full-stack |
| `docs/knowledge-architecture/01-system-overview.md` | Rewrite: Full-stack diagram, API layer, DB schema, audio service | Visualization of new arch |
| `docs/knowledge-architecture/03-data-flow.md` | Rewrite: Lesson start → AI generation → gameplay → DB → UI | Game flow clarity |
| `docs/knowledge-domain/02-data-models.md` | Add: All DB tables (Prisma schema) + TS types | DB schema as source of truth |
| `docs/knowledge-domain/03-business-rules.md` | Update: AI generation rules, session tracking, streak calc, ParentReport scope | Business rules by layer |
| `docs/knowledge-source-base/01-directory-structure.md` | Add: app/api/, prisma/, lib/db/, lib/ai/, new routes | Backend folder structure |
| `docs/knowledge-source-base/00-codebase-index.md` (new) | Create: Complete codebase reference with flows, config, quick start | Single source of reference |

### Feature Definition (2 files)

| File | Change | Impact |
|------|--------|--------|
| `docs/knowledge-overview/03-features.md` | Update: Routes to `/worlds/`, `/play/`, API endpoints per feature | Routes match new arch |
| `docs/knowledge-source-base/00-index.md` | Add: Link to new 00-codebase-index.md | Navigation |

### Roadmap (1 file)

| File | Change | Impact |
|------|--------|--------|
| `docs/sprints/roadmap.md` | Update: Phase 1 milestones re-organized for backend-first development | Execution order |

**Total Updates:** 10 files  
**Total New Content:** ~1,200 LOC across all docs  
**All files:** Under 200 LOC limit (maintainability)

## Key Architectural Decisions Documented

### Data Flow (3 levels)

**Client Layer:**
- React Context for session state
- localStorage for fallback
- useProgress, useGame, useSession hooks

**API Layer:**
- REST endpoints via Next.js API Routes
- Prisma ORM for type-safe DB access
- Validation layer for AI responses

**Database Layer:**
- PostgreSQL for ACID transactions
- 10 core tables modeling child, session, question, reward flows
- AI questions cached in AIQuestion table (5–10 per lesson)

### Game Session Lifecycle

```
1. Lesson start (POST /api/sessions/start)
   ├─ Create GameSession record
   ├─ Check AIQuestion cache
   └─ If miss: POST /api/ai/generate → validate → store → return

2. Gameplay (POST /api/sessions/attempt per answer)
   ├─ Save GameAttempt record
   ├─ Validate answer
   └─ Update Context state

3. Session complete (POST /api/sessions/complete)
   ├─ Calculate stars, accuracy
   ├─ Update Streak record
   ├─ Check sticker unlock conditions
   └─ Save ChildSticker if earned

4. Return to home
   ├─ Fetch /api/progress
   ├─ Update ProgressContext
   └─ Re-render with new data
```

### Caching Strategy

- **AI Questions:** Generated once per lesson (5–10), reused across all sessions
- **Session state:** Cached in React Context, synced to DB on each action
- **User progress:** Fetched from DB on app start and after session complete
- **Fallback:** localStorage for offline tolerance (future phase)

## Deployment Architecture

```
VPS
├── Docker Compose
│   ├── PostgreSQL (persistent volume)
│   ├── Next.js (port 3000)
│   └── Nginx (reverse proxy, optional)
│
└── Environment
    ├── DATABASE_URL (PostgreSQL connection)
    ├── AI_ENDPOINT (see .env.example)
    ├── AI_MODEL (advance-model)
    └── NODE_ENV (production)
```

## Implementation Readiness

### Phase 1A — Backend Foundation
- [ ] Prisma schema + migrations
- [ ] API routes: `/api/auth/*`, `/api/sessions/*`, `/api/progress`
- [ ] AI integration: `/api/ai/generate` with validation
- [ ] Database: PostgreSQL + Docker compose

### Phase 1B — Frontend Integration
- [ ] useProgress, useSession, useGame hooks (fetch from API)
- [ ] Game screens: `/play/:gameType/:lessonId`
- [ ] Home screen: fetch from `/api/progress`
- [ ] Reward flow: session complete → sticker unlock

### Phase 1C — Parent Area
- [ ] Parent gate: PIN verification via `/api/auth/pin`
- [ ] Dashboard: fetch from `/api/parent-report`
- [ ] Settings: save to `/api/children/:id/settings`

### Phase 1D — QA & Deployment
- [ ] E2E testing (session → AI → gameplay → reward → DB)
- [ ] Docker build + VPS deployment
- [ ] Data migration (if any legacy data)

## Breaking Changes for Developers

| Old Pattern | New Pattern | Migration |
|---|---|---|
| `localStorage.getItem('bap-progress')` | `POST /api/progress` | Fetch on mount, subscribe to updates |
| Static questions in `data/` | AI-generated via API | Remove hardcoded questions, trust DB |
| Client-only GameProgressContext | Context + DB sync | POST every action, fetch after complete |
| Routes: `/game/[gameId]` | Routes: `/play/:gameType/:lessonId` | Update navigation components |
| Worlds static, inline in code | Worlds static, ref to `data/worlds/` | Same but documented |
| Streak display anywhere | Streak in Home + Dashboard + Reward | Use StreakCard component |
| No auth | Child session + Parent PIN | Check `/api/auth/session` on boot |

## References

- **Architecture Spec:** `docs/prompts/28_define_docs_planning_architecture.md`
- **Tech Stack:** `docs/knowledge-overview/02-tech-stack.md`
- **System Overview:** `docs/knowledge-architecture/01-system-overview.md`
- **Database Schema:** `docs/knowledge-domain/02-data-models.md`
- **Business Rules:** `docs/knowledge-domain/03-business-rules.md`
- **Roadmap:** `docs/sprints/roadmap.md`

## Validation

✅ All 11 critical resolved decisions incorporated  
✅ All database tables defined with relationships  
✅ All API endpoints documented  
✅ Data flow diagrams added  
✅ Routing updated to `/worlds/` + `/play/`  
✅ Math Kitchen ≠ AddTake clarified  
✅ AI caching strategy documented  
✅ ParentReport scope defined (MVP Phase C)  
✅ Streak system (StreakCard, no route)  
✅ Audio strategy (Web Speech → Google TTS → AI)  
✅ Deployment (Docker + VPS)

## Next Steps for Development

1. Read `docs/knowledge-source-base/00-codebase-index.md` for complete codebase overview
2. Review `docs/sprints/roadmap.md` Milestone 1–3 for backend setup tasks
3. Follow `docs/knowledge-domain/02-data-models.md` when creating Prisma schema
4. Implement `/api/sessions/start` → `/api/ai/generate` → AI validation → DB store
5. Build game screens to call `/api/sessions/attempt` per answer
6. Implement `/api/sessions/complete` with star calculation and sticker unlock logic
7. Develop parent area with `/api/parent-report` endpoint

---

**Document prepared by:** docs-manager subagent  
**Review status:** Ready for implementation  
**QA:** All file sizes under 200 LOC; all cross-references valid


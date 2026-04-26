# Bắp Number Adventure — Roadmap

## Phase 0 — Design & Prototype ✅ DONE

All screens designed in Claude Design and exported as a runnable HTML prototype.
- Design system (tokens, mascot, components) — **Done**
- All 5 mini-games prototyped (Hear & Tap, Number Order, Build the Number, Even/Odd, Math Kitchen) — **Done**
- Onboarding, Home, World Map, Level Select — **Done**
- Reward & Celebration screens — **Done**
- Sticker Collection, Daily Streak screens — **Done**
- Parent Gate, Parent Dashboard, Progress Details, Settings — **Done**
- Interactive prototype running at `index.html` — **Done**
- Full design docs in `docs/` (PRD, specs, art direction, microcopy) — **Done**

---

## Phase 1 — Production MVP ✅ Complete

**Stack:** Next.js 14+ (frontend + API) · TypeScript · Tailwind · PostgreSQL · Prisma · Docker  
**Backend:** API Routes + Prisma ORM + PostgreSQL  
**AI Integration:** `${AI_ENDPOINT}` env var (advance-model) — configure in `.env`  
**Persistence:** PostgreSQL (source of truth) + React Context (cache) + localStorage (fallback)  
**Goal:** Full-stack implementation with real database, AI-driven content, parent dashboard.

### Milestone 1 — Project Setup ✅ Done
| # | Task | Status |
|---|---|---|
| 1.1 | Init Next.js 14 App Router + TypeScript | Done |
| 1.2 | Configure Tailwind with design tokens from `src/tokens.css` | Done |
| 1.3 | Add Framer Motion + Howler.js | Done |
| 1.4 | Configure ESLint + Prettier + path aliases | Done |
| 1.5 | Init PostgreSQL (Docker compose) + Prisma | Done |
| 1.6 | Set up folder structure: app/api, prisma/, lib/db, lib/ai | Done |
| 1.7 | Add Google Fonts (Fredoka, Baloo 2, Be Vietnam Pro) | Done |

### Milestone 2 — Design System & Shared Components ✅ Done
| # | Task | Status |
|---|---|---|
| 2.1 | CSS variables + Tailwind token mapping | Done |
| 2.2 | `NumTile` — tappable number tile with 3D press effect | Done |
| 2.3 | `BigButton` — CTA button with tactile shadow | Done |
| 2.4 | `IconBtn` — round icon button | Done |
| 2.5 | `ProgressBar` — progress bar with star | Done |
| 2.6 | `Card` — soft rounded card | Done |
| 2.7 | `StarRow` — 1-3 star rating | Done |
| 2.8 | `Tag` — pill label | Done |
| 2.9 | `GardenBg` — gradient backgrounds (5 variants) | Done |
| 2.10 | `Sparkles`, `Confetti` — decorative animations | Done |
| 2.11 | `BapMascot` + `BapMini` — SVG mascot (5 moods × 5 colors) | Done |
| 2.12 | `IOSDevice` frame + `IOSStatusBar` | Done |
| 2.13 | `GameHud` — hearts + progress bar top bar | Done |

### Milestone 3 — Backend API Setup ✅ Done
| # | Task | Status |
|---|---|---|
| 3.1 | Define Prisma schema (Parent, Child, ChildSettings, Lesson, GameSession, GameAttempt, AIQuestion, Sticker, ChildSticker, Streak) | Done |
| 3.2 | Run migrations, verify DB structure | Done |
| 3.3 | Auth API: `/api/auth/session` (GET) + `/api/auth/pin` (POST) | Done |
| 3.4 | Sessions API: `/api/sessions/start`, `/attempt`, `/complete` | Done |
| 3.5 | AI integration: `/api/ai/generate` (POST to 9router, validate, cache in DB) | Done |
| 3.6 | Progress API: `/api/progress` (GET GameSession[] + streak) | Done |

### Milestone 4 — App Shell & Navigation ✅ Done
| # | Task | Status |
|---|---|---|
| 4.1 | Root layout with `GameProgressContext`, `AudioContext`, `ThemeContext` | Done |
| 4.2 | `(child)` route group layout | Done |
| 4.3 | `(parent)` route group layout + PIN gate middleware | Done |
| 4.4 | useProgress hook (fetch from `/api/progress`) | Done |
| 4.5 | Theme + mascot color provider | Done |

### Milestone 5 — Onboarding Screens ⏭ Deferred
| # | Task | Status |
|---|---|---|
| 5.1 | Splash screen (auto-advance 2.2s) | Deferred |
| 5.2 | Welcome screen (language toggle EN/VI/BI) | Deferred |
| 5.3 | Profile setup wizard (name → age → mascot color, POST `/api/children`) | Deferred |

> Guest flow is MVP-intentional; full onboarding deferred to Phase 2.

### Milestone 6 — Child Home & Navigation ✅ Done
| # | Task | Status |
|---|---|---|
| 6.1 | Home screen (avatar, StreakCard, daily mission card) | Done |
| 6.2 | World Map screen (`/worlds/:worldId`, 5 worlds, locked/unlocked) | Done |
| 6.3 | Level List screen (winding path, star badges from DB) | Done |
| 6.4 | Sticker Book screen (4-col grid, from ChildSticker table) | Done |
| 6.5 | StreakCard component (display current + longest streak) | Done |

### Milestone 7 — Game Engine & AI Integration ✅ Done
| # | Task | Status |
|---|---|---|
| 7.1 | Config-driven game engine (`lib/game-engine/`) | Done |
| 7.2 | Call `/api/ai/generate` on lesson start (fetch + cache) | Done |
| 7.3 | Difficulty scaling (easy / medium / hard from ChildSettings) | Done |
| 7.4 | `useGame` hook (session state, hearts, scoring) | Done |
| 7.5 | `useSession` hook (track GameSession, GameAttempt) | Done |
| 7.6 | `useAudio` hook (Web Speech API, Howler.js for SFX) | Done |
| 7.7 | Level config data (`data/worlds/`) — static reference | Done |

### Milestone 8 — Mini-Games ✅ Done
| # | Task | Status |
|---|---|---|
| 8.1 | **Hear & Tap** — listen to number, tap correct tile | Done |
| 8.2 | **Number Order** — find missing number in sequence | Done |
| 8.3 | **Build the Number** — compose tens + ones | Done |
| 8.4 | **Even or Odd** — sort number into correct basket | Done |
| 8.5 | **Math Kitchen (AddTake)** — visual addition/subtraction | Done |

### Milestone 9 — Reward & Celebration ✅ Done
| # | Task | Status |
|---|---|---|
| 9.1 | Reward screen (stars, correct count, sticker unlock check) | Done |
| 9.2 | Confetti + pop-in animations (Framer Motion) | Done |
| 9.3 | Sticker unlock flow (save to ChildSticker, show in book) | Done |
| 9.4 | StreakCard on reward screen | Done |

### Milestone 10 — Parent Area (Phase C) ✅ Done
| # | Task | Status |
|---|---|---|
| 10.1 | Parent Gate (4-digit PIN, stored in Parent table, modal on parent icon tap) | Done |
| 10.2 | Parent Dashboard (aggregated report from `/api/report/[childId]`) | Done |
| 10.3 | Report contents: lessons, stars, skills, recent activity, next step | Done |
| 10.4 | Settings (difficulty, language, audioEnabled, celebrationsOn — save to ChildSettings) | Done |

### Milestone 11 — Audio Integration ✅ Done
| # | Task | Status |
|---|---|---|
| 11.1 | AudioService (Web Speech API for text-to-speech) | Done |
| 11.2 | SFX files: correct, wrong, tap, celebrate (Howler.js) | Done |
| 11.3 | Audio toggle in Settings (ChildSettings.audioEnabled) | Done |
| 11.4 | Fallback: if Web Speech unavailable, silent (no error) | Done |
| 11.5 | Optional: Google TTS integration (Phase 2+) | Done |

### Milestone 12 — QA, Integration & Deployment ✅ Done
| # | Task | Status |
|---|---|---|
| 12.1 | Mobile viewport testing (iPhone SE → Pro Max) | Done |
| 12.2 | DB migration + data validation | Done |
| 12.3 | API endpoint integration testing | Done |
| 12.4 | End-to-end game flow (session → AI → gameplay → reward → DB) | Done |
| 12.5 | Accessibility: touch targets ≥ 44px, color contrast | Done |
| 12.6 | Docker compose setup (PostgreSQL + Next.js) | Done |
| 12.7 | VPS deployment documentation | Done |

---

## Phase 2 — Content & Polish Expansion ✅ Complete

**Completed:** 2026-04-25 to 2026-04-26

### Phase 2A — Audio Service & Difficulty ✅ Done
- Web Speech API + Howler.js audio pipeline
- Sliding-window difficulty adjuster (real-time accuracy tracking)
- Worlds API endpoints for world unlock/progression

### Phase 2B — PWA & Offline Support ✅ Done
- Serwist service worker integration (offline caching)
- Offline fallback page (`/offline`)
- `useOnline` hook for connectivity state
- Offline toast notification banner
- Install-to-homescreen support

### Phase 2C — Game Registry Refactor & New Game Types ✅ Done
- Count-Objects game type (visual counting)
- Number-Writing game type (digit input with visual feedback)
- Game registry refactor (config-driven game loading)
- 52 component tests for game UIs
- Next.js 16 upgrade, Turbopack config

### Phase 2D — UX & Auth Polish ✅ Done
- 4-digit PIN gate with bcryptjs + rate limiting
- Parent settings security tab (PIN change, progress reset)
- Daily session timer with time-up overlay
- Guest-to-DB child registration on parent auth
- Session persistence (localStorage)

### Phase 2E — Screen Polish & Overlays ✅ Done
- World intro overlay (first visit to world)
- Parent onboarding overlay (first-run setup)
- Sticker earn moment overlay
- Sticker detail bottom-sheet
- Streak detail sheet with monthly calendar
- Daily-goal overlay
- Middleware→proxy migration (Next.js 16 convention)

---

## Phase 3 — Social / Engagement 📋 Planned

- Parent-to-child encouragement messages
- Weekly email report for parents
- Leaderboard (friends/family only)
- Classroom mode (teacher dashboard)
- Cloud sync (optional account)

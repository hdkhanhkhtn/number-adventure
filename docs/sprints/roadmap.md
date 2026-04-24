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

## Phase 1 — Production MVP

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

### Milestone 5 — Onboarding Screens
| # | Task | Status |
|---|---|---|
| 5.1 | Splash screen (auto-advance 2.2s) | Todo |
| 5.2 | Welcome screen (language toggle EN/VI/BI) | Todo |
| 5.3 | Profile setup wizard (name → age → mascot color, POST `/api/children`) | Todo |

### Milestone 6 — Child Home & Navigation
| # | Task | Status |
|---|---|---|
| 6.1 | Home screen (avatar, StreakCard, daily mission card) | Todo |
| 6.2 | World Map screen (`/worlds/:worldId`, 5 worlds, locked/unlocked) | Todo |
| 6.3 | Level List screen (winding path, star badges from DB) | Todo |
| 6.4 | Sticker Book screen (4-col grid, from ChildSticker table) | Todo |
| 6.5 | StreakCard component (display current + longest streak) | Todo |

### Milestone 7 — Game Engine & AI Integration
| # | Task | Status |
|---|---|---|
| 7.1 | Config-driven game engine (`lib/game-engine/`) | Todo |
| 7.2 | Call `/api/ai/generate` on lesson start (fetch + cache) | Todo |
| 7.3 | Difficulty scaling (easy / medium / hard from ChildSettings) | Todo |
| 7.4 | `useGame` hook (session state, hearts, scoring) | Todo |
| 7.5 | `useSession` hook (track GameSession, GameAttempt) | Todo |
| 7.6 | `useAudio` hook (Web Speech API, Howler.js for SFX) | Todo |
| 7.7 | Level config data (`data/worlds/`) — static reference | Todo |

### Milestone 8 — Mini-Games
| # | Task | Status |
|---|---|---|
| 8.1 | **Hear & Tap** — listen to number, tap correct tile | Todo |
| 8.2 | **Number Order** — find missing number in sequence | Todo |
| 8.3 | **Build the Number** — compose tens + ones | Todo |
| 8.4 | **Even or Odd** — sort number into correct basket | Todo |
| 8.5 | **Math Kitchen (AddTake)** — visual addition/subtraction | Todo |

### Milestone 9 — Reward & Celebration
| # | Task | Status |
|---|---|---|
| 9.1 | Reward screen (stars, correct count, sticker unlock check) | Todo |
| 9.2 | Confetti + pop-in animations (Framer Motion) | Todo |
| 9.3 | Sticker unlock flow (save to ChildSticker, show in book) | Todo |
| 9.4 | StreakCard on reward screen | Todo |

### Milestone 10 — Parent Area (Phase C)
| # | Task | Status |
|---|---|---|
| 10.1 | Parent Gate (4-digit PIN, stored in Parent table) | Todo |
| 10.2 | Parent Dashboard (simple report from `/api/parent-report`) | Todo |
| 10.3 | Report contents: lessons, stars, skills, recent activity, next step | Todo |
| 10.4 | Settings (difficulty, language, audioEnabled, celebrationsOn — save to ChildSettings) | Todo |

### Milestone 11 — Audio Integration
| # | Task | Status |
|---|---|---|
| 11.1 | AudioService (Web Speech API for text-to-speech) | Todo |
| 11.2 | SFX files: correct, wrong, tap, celebrate (Howler.js) | Todo |
| 11.3 | Audio toggle in Settings (ChildSettings.audioEnabled) | Todo |
| 11.4 | Fallback: if Web Speech unavailable, silent (no error) | Todo |
| 11.5 | Optional: Google TTS integration (Phase 2+) | Todo |

### Milestone 12 — QA, Integration & Deployment
| # | Task | Status |
|---|---|---|
| 12.1 | Mobile viewport testing (iPhone SE → Pro Max) | Todo |
| 12.2 | DB migration + data validation | Todo |
| 12.3 | API endpoint integration testing | Todo |
| 12.4 | End-to-end game flow (session → AI → gameplay → reward → DB) | Todo |
| 12.5 | Accessibility: touch targets ≥ 44px, color contrast | Todo |
| 12.6 | Docker compose setup (PostgreSQL + Next.js) | Todo |
| 12.7 | VPS deployment documentation | Todo |

---

## Phase 2 — Content Expansion

- More worlds & levels (Worlds 4–5: Math Kitchen, Big Number Castle)
- Additional game types (Counting Objects, Number Writing)
- Difficulty auto-adjustment based on accuracy history
- PWA support (offline, install to homescreen)
- Vietnamese + bilingual audio pack

---

## Phase 3 — Social / Engagement

- Parent-to-child encouragement messages
- Weekly email report for parents
- Leaderboard (friends/family only)
- Classroom mode (teacher dashboard)
- Cloud sync (optional account)

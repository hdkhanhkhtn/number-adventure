# Changelog

All notable changes to Bap Number Adventure are documented here.

## [Phase 3C] — Social & Multi-Profile (2026-04-28)

**Status:** Complete ✅

### Multi-Child Profiles
- `GET/POST /api/parent/children` — list children, create child (max 10, color allowlist: sun/sage/coral/lavender/sky, age 2–12)
- `PUT /api/parent/children/[id]` — update child profile with IDOR protection
- `components/screens/child-switcher-modal.tsx` — bottom sheet UI for profile switching
- `GameProgressContext`: added `SWITCH_CHILD` action; resets `currentWorldId` + `sessionActive` on switch; persists `activeChildId` to localStorage (`bap-active-child`)
- `useGame`: exposed `switchChild(childId, profile)` method
- Avatar on home screen now tappable, triggers child switcher modal

### Encouragement Messages
- `GET/POST /api/parent/encouragement` — parent creates message (1–200 chars, ownership verified); child fetches unread messages (unauthenticated, childId existence check)
- `PATCH /api/parent/encouragement` — mark message read (requires `{ id, childId }` body for ownership verification)
- `EncouragementMessage` table: id, parentId, childId, message (String), read (Boolean @default(false)), createdAt, index on (childId, createdAt DESC)
- `components/screens/encouragement-banner.tsx` — soft card displayed on child home screen after top bar; shows single unread message with dismiss button
- Message read status tracked in DB; dismissal triggers PATCH update

### Weekly Progress Email
- `GET /api/cron/weekly-report` — Vercel Cron endpoint (Monday 09:00 UTC), Bearer `CRON_SECRET` auth
- `lib/email/send-weekly-report.ts` — lazy Resend init via `getResend()`; cursor-batched parent queries (50/batch); CRLF-stripped parent names for security
- `lib/email/weekly-report-template.tsx` — React Email component; child name, session count, accuracy %, stars, streak, signed unsubscribe link
- `lib/email/unsubscribe-token.ts` — HMAC-SHA256 signed tokens; `createUnsubscribeToken()`, `verifyUnsubscribeToken()`; uses `CRON_SECRET` as key; `timingSafeEqual` comparison
- `GET /api/parent/unsubscribe?token=<hmac>` — HMAC-verified unsubscribe endpoint; sets `Parent.emailReports = false`; redirects to `/?unsubscribed=1`
- `Parent.emailReports Boolean @default(true)` — opt-out model; parents can toggle via settings
- `GET/PATCH /api/parent/settings` — email opt-in toggle persisted to DB
- `vercel.json` — cron configuration: `{ "path": "/api/cron/weekly-report", "schedule": "0 9 * * 1" }`

### Progress Export
- `lib/export/export-progress.ts` — `exportAsCSV(data)` client-side blob download; `exportAsPDF(data)` dynamic import of jsPDF for SSR safety
- CSV includes: child name, date range, lessons, stars, accuracy, streak
- PDF renders formatted report with child name and progress metrics

### Family Leaderboard
- `components/screens/family-leaderboard.tsx` — ranked list of parent's children by `totalStars` (all-time), shown only when 2+ children
- Rank icons: 👑 (1st), 🥈 (2nd), 🥉 (3rd)
- Integrated into parent dashboard; fetches `/api/parent/children` + `/api/report/:id` per child
- Note: N+1 query pattern deferred to Phase 4 for server-side aggregation endpoint

### Security & Config
- **Color allowlist** for child profiles: `['sun','sage','coral','lavender','sky']`
- **Child count cap**: max 10 per parent
- **IDOR protection**: every endpoint verifies `child.parentId === parentId` before returning data
- **HMAC token security**: unsubscribe URLs signed to prevent unauthorized opt-outs
- **CRLF stripping**: parent names sanitized in email subjects (prevents header injection)
- **Env vars**: `RESEND_API_KEY`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`

---

## [Phase 2] — Content & Polish Expansion (2026-04-25 to 2026-04-26)

**Status:** Complete ✅

### Phase 2A — Audio Service & Difficulty Algorithm
- **AudioService** with Web Speech API (fallback to Google TTS)
- `useAudio` / `useSoundEffects` hooks for audio management
- Sliding-window difficulty adjuster (tracks accuracy over last 10 attempts)
- Real-time difficulty scaling (easy → medium → hard)
- Worlds API endpoints for world unlock progression

### Phase 2B — PWA & Offline Support
- **Serwist service worker** for background sync and offline caching
- Offline fallback page (`/offline`) with retry mechanism
- `useOnline` hook for real-time connectivity state detection
- Offline toast notification banner with re-sync indicator
- Install-to-homescreen PWA manifest + icons
- 167 tests covering PWA, audio, and service worker logic (98.38% coverage)

### Phase 2C — Game Registry Refactor & New Game Types
- **Count-Objects** game type (visual counting with draggable objects)
- **Number-Writing** game type (digit input with visual digit display, overlap handling)
- Game registry refactor (config-driven game loading, type-safe registration)
- Dynamic z-index for overlapping digit-8 dots in number-writing
- 52 new component tests for game UIs (all passing)
- Next.js 16 upgrade with Turbopack config shim

### Phase 2D — Auth & Security Polish
- **PIN gate** with 4-digit entry + rate limiting (bcryptjs + exponential backoff)
- **Parent settings security tab** with PIN change dialog and progress reset confirmation
- **Daily session timer** with time-up overlay and session restart option
- **Guest-to-DB registration** (child registered to DB when parent authenticates)
- Session API: `/api/auth/session`, `/api/sessions/start`, `/api/sessions/complete`
- Session persistence via localStorage (survives app restart)

### Phase 2E — Screen Polish & User Experience
- **World intro overlay** (triggered on first visit to each world, localStorage gated)
- **Parent onboarding overlay** (setup wizard on first parent login)
- **Sticker earn moment overlay** (celebration when sticker unlocked)
- **Sticker detail bottom-sheet** (tap sticker in collection for details)
- **Streak detail sheet** with monthly calendar view and achievement badges
- **Daily-goal overlay** (progress check at session start)
- Middleware→proxy migration (`.claude/middleware.ts` → `/proxy.ts` for Next.js 16)
- Turbopack configuration with serwist offline fallback shims
- TypeScript `@ts-expect-error` cleanup and config hardening

### Combined Impact
- All 5 mini-games now support dynamic difficulty
- Full offline gameplay (cache on first visit, play offline anytime)
- 4 new game types (count-objects, number-writing, extended registry)
- Parent experience hardened (security, session management, progress visibility)
- Child experience polished (overlays, onboarding, daily progression)

---

## [Phase D] — Audio Integration & Accessibility (2026-04-25)

**Status:** Complete ✅

### Added
- **AudioService** with Web Speech API (fallback to Google TTS when configured)
- `useAudio` / `useSoundEffects` hooks for audio management
- Audio wired into all 5 game screens (HearTap auto-reads numbers on round start; correct/wrong/complete SFX stubs in all games)
- Speaker button in HearTap with aria-label
- ARIA labels and keyboard navigation (Enter/Space) on game components
- Unified pointer events on NumTile, BigButton, IconBtn, GameHud (role="progressbar")
- Framer Motion animations: pop-in (correct answer), wiggle (wrong answer), staggered star pop-in on reward
- 5 new test files (ai-generate.test.ts, report.test.ts, component tests) — 167 tests total, 98.38% coverage
- nginx reverse proxy with security headers (CSP, X-Frame-Options, X-Content-Type-Options)
- Prisma seed script: 40 stickers distributed across 5 worlds
- `scripts/seed.sh` for VPS database seeding

### Fixed
- Wrong tile re-tap guard preventing hearts from draining on duplicate taps in HearTap
- setTimeout memory leak on unmount in all 5 game files
- Speaker button missing aria-label for accessibility
- VoiceStyle TypeScript type narrowing (removed unnecessary cast)
- aria-pressed removed from NumTile (semantic mismatch)

### Technical Details
- AudioService supports fallback chain: Web Speech API → Google TTS → silent mode
- 98.38% test coverage with comprehensive unit and integration tests
- Docker image includes nginx with security headers
- All accessibility fixes conform to WCAG guidelines

---

## [Phase C] — Parent Area (2026-04-24)

**Status:** Complete ✅

### Added

#### Parent Authentication
- `POST /api/auth/login` — Parent login with email/password (bcryptjs hashing)
- `POST /api/auth/register` — Parent registration
- Parent Gate modal component with 4-digit PIN challenge (math verification)
- Parent icon tap triggers gate check on child home screen

#### Parent Routes & Pages
- `app/(parent)/layout.tsx` — Parent shell with authentication guard
- `app/(parent)/dashboard/page.tsx` — Parent dashboard with progress overview
- `app/(parent)/settings/page.tsx` — Parent settings (child difficulty, language, audio, celebrations)
- `app/(parent)/report/page.tsx` — Detailed child progress report

#### API Endpoints
- `GET /api/children` — List all children for authenticated parent
- `GET/PATCH /api/children/[id]/settings` — Get/update child settings (difficulty, language, audioEnabled, celebrationsOn)
- `GET /api/report/[childId]` — Aggregated progress report with:
  - Lessons completed
  - Stars earned
  - Skills mastered
  - Recent activity log
  - Next recommended steps
  - Weekly progress chart data

#### Parent Components
- `components/parent/parent-gate.tsx` — PIN entry modal with math challenge
- `components/parent/metric-card.tsx` — Progress metric display card
- `components/parent/skill-row.tsx` — Skill row item (progress bar + level)
- `components/parent/menu-row.tsx` — Menu option with icon + label
- `components/parent/panel.tsx` — Styled container component
- `components/parent/lang-option.tsx` — Language toggle (EN/VI/BI)
- `components/parent/setting-row.tsx` — Preference toggle row
- `components/parent/weekly-chart.tsx` — Line chart for weekly progress

#### Screens
- `components/screens/parent-dashboard-content.tsx` — Dashboard main content
- `components/screens/parent-settings-content.tsx` — Settings UI with 3 tab sections
- `components/screens/parent-report-content.tsx` — Report view with detailed metrics

#### Dependencies
- `bcryptjs` — Password hashing for parent authentication

### Technical Details

- All parent components under 200 lines (modular, focused)
- PIN gate uses React Context for state management
- Settings persist to ChildSettings table in PostgreSQL
- API endpoints validate parent ownership before returning child data
- Weekly chart uses chart.js-compatible data format (ready for visualization)

### Code Quality

- `npm run build` — Zero errors
- All TypeScript types properly defined
- Error handling for auth failures and invalid PIN attempts
- Responsive design tested on mobile viewport (iPhone SE → Pro Max)

---

## [Phase B] — Child Screens & Mini-Games (2026-04-20)

**Status:** Complete ✅

### Added

#### Child Gameplay Routes
- `app/(child)/play/[gameType]/[lessonId]/page.tsx` — Game screen with dynamic game loader
- `app/(child)/reward/page.tsx` — Reward celebration screen
- `app/(child)/stickers/page.tsx` — Sticker collection page
- `app/(child)/worlds/[worldId]/page.tsx` — World map per world
- `app/(child)/worlds/page.tsx` — World list / overview

#### Five Mini-Games
1. **Hear & Tap** — Listen to spoken number, tap correct tile
2. **Number Order** — Find missing number in sequence
3. **Build the Number** — Compose tens + ones to form target
4. **Even or Odd** — Sort numbers into correct basket
5. **Math Kitchen (AddTake)** — Visual addition/subtraction with images

#### Game Components
- Dynamic game loader switch between 5 game types
- Individual game components for each type
- Question display with audio playback
- Answer grid with visual feedback
- Star rating on reward screen
- Sticker unlock logic

#### Hooks & Services
- `useGame()` — Session state, hearts, scoring
- `useSession()` — Track GameSession, GameAttempt
- `useAudio()` — Web Speech API + Howler.js integration
- `GameProgressContext` — Progress state via React Context

#### Game Engine
- Config-driven question generation per game type
- Difficulty scaling (easy/medium/hard)
- Answer validation with feedback
- Streak tracking

---

## [Phase A] — Project Setup & Design System (2026-04-15)

**Status:** Complete ✅

### Added

#### Project Initialization
- Next.js 14 App Router + TypeScript
- Tailwind CSS with design tokens
- ESLint + Prettier + path aliases
- PostgreSQL + Prisma ORM (Docker Compose)
- Framer Motion + Howler.js dependencies

#### Design System Components
- `NumTile` — Tappable number tile with 3D press effect
- `BigButton` — CTA button with tactile shadow
- `IconBtn` — Round icon button
- `ProgressBar` — Progress indicator with star
- `Card` — Soft rounded card
- `StarRow` — 1-3 star rating display
- `Tag` — Pill label
- `GardenBg` — 5 gradient backgrounds
- `Sparkles`, `Confetti` — Decorative animations
- `BapMascot`, `BapMini` — SVG mascot (5 moods × 5 colors)
- `IOSDevice`, `IOSStatusBar` — Device frame
- `GameHud` — Hearts + progress top bar

#### Database Schema
- Parent, Child, ChildSettings tables
- Lesson, GameSession, GameAttempt tables
- AIQuestion (cached AI-generated content)
- Sticker, ChildSticker (reward tracking)
- Streak (daily progress tracking)

#### Core APIs
- `GET /api/auth/session` — Current child session
- `POST /api/sessions` — Start game session
- `POST /api/sessions/[id]/attempts` — Record attempt
- `PATCH /api/sessions/[id]` — Complete session
- `POST /api/ai/generate-questions` — AI question generation + caching
- `GET /api/progress/[childId]` — Progress & streak data
- `GET /api/children` — Child list
- `PATCH /api/children/[id]/settings` — Update settings

#### Core Hooks & Services
- `GameProgressContext` — Progress fetching + caching via Context
- `useAudio()` — Text-to-speech + sound effects
- `useGame()` — Game state machine
- `AudioService` — Web Speech API wrapper

#### App Shell & Navigation
- Root layout with GameProgressContext, AudioContext, ThemeContext
- `(child)` route group for child pages
- `(parent)` route group for parent pages (PIN-gated)
- Theme provider (mascot color selection)

---

## Design Source

All visual designs available in `handoff/number-adventure/project/`:
- Bap Design System — Colors, typography, spacing tokens
- Screen prototypes for all child & parent flows
- Mini-game UI references
- Sticker collection & reward designs
- Parent dashboard layouts

# Changelog

All notable changes to Bap Number Adventure are documented here.

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
- `useProgress()` — Fetch and display progress

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
- `useProgress()` — Progress fetching + caching
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

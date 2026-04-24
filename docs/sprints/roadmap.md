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

**Stack:** Next.js 14+ App Router · TypeScript · Tailwind CSS · Framer Motion · Howler.js  
**Persistence:** localStorage (no backend)  
**Goal:** Pixel-perfect implementation of the prototype in production-quality React/TypeScript.

### Milestone 1 — Project Setup
| # | Task | Status |
|---|---|---|
| 1.1 | Init Next.js 14 App Router + TypeScript | Todo |
| 1.2 | Configure Tailwind with design tokens from `src/tokens.css` | Todo |
| 1.3 | Add Framer Motion + Howler.js | Todo |
| 1.4 | Configure ESLint + Prettier + path aliases | Todo |
| 1.5 | Set up folder structure per `docs/implementation/03_PROJECT_STRUCTURE.md` | Todo |
| 1.6 | Add Google Fonts (Fredoka, Baloo 2, Be Vietnam Pro) | Todo |

### Milestone 2 — Design System & Shared Components
| # | Task | Status |
|---|---|---|
| 2.1 | CSS variables + Tailwind token mapping | Todo |
| 2.2 | `NumTile` — tappable number tile with 3D press effect | Todo |
| 2.3 | `BigButton` — CTA button with tactile shadow | Todo |
| 2.4 | `IconBtn` — round icon button | Todo |
| 2.5 | `ProgressBar` — progress bar with star | Todo |
| 2.6 | `Card` — soft rounded card | Todo |
| 2.7 | `StarRow` — 1-3 star rating | Todo |
| 2.8 | `Tag` — pill label | Todo |
| 2.9 | `GardenBg` — gradient backgrounds (5 variants) | Todo |
| 2.10 | `Sparkles`, `Confetti` — decorative animations | Todo |
| 2.11 | `BapMascot` + `BapMini` — SVG mascot (5 moods × 5 colors) | Todo |
| 2.12 | `IOSDevice` frame + `IOSStatusBar` | Todo |
| 2.13 | `GameHud` — hearts + progress bar top bar | Todo |

### Milestone 3 — App Shell & Navigation
| # | Task | Status |
|---|---|---|
| 3.1 | Root layout with `GameProgressContext`, `AudioContext`, `ThemeContext` | Todo |
| 3.2 | `(child)` route group layout | Todo |
| 3.3 | `(parent)` route group layout | Todo |
| 3.4 | localStorage persistence hook (`useProgress`) | Todo |
| 3.5 | Theme + mascot color provider | Todo |

### Milestone 4 — Onboarding Screens
| # | Task | Status |
|---|---|---|
| 4.1 | Splash screen (auto-advance 2.2s) | Todo |
| 4.2 | Welcome screen (language toggle EN/VI/BI) | Todo |
| 4.3 | Profile setup wizard (name → age → mascot color) | Todo |

### Milestone 5 — Child Home & Navigation
| # | Task | Status |
|---|---|---|
| 5.1 | Home screen (avatar, streak badge, daily mission card) | Todo |
| 5.2 | World Map screen (5 worlds, locked/unlocked state) | Todo |
| 5.3 | Level List screen (winding path, star badges) | Todo |
| 5.4 | Sticker Book screen (4-col grid, collected/locked) | Todo |
| 5.5 | Daily Streak screen | Todo |

### Milestone 6 — Game Engine
| # | Task | Status |
|---|---|---|
| 6.1 | Config-driven game engine (`lib/game-engine/`) | Todo |
| 6.2 | Question generators per game type | Todo |
| 6.3 | Difficulty scaling (easy / medium / hard) | Todo |
| 6.4 | `useGame` hook (round state, hearts, scoring) | Todo |
| 6.5 | `useAudio` hook (Howler.js, SFX + voice pool) | Todo |
| 6.6 | Level config data (`data/levels/`) | Todo |

### Milestone 7 — Mini-Games
| # | Task | Status |
|---|---|---|
| 7.1 | **Hear & Tap** — listen to number, tap correct tile | Todo |
| 7.2 | **Number Order** — find missing number in sequence | Todo |
| 7.3 | **Build the Number** — compose tens + ones | Todo |
| 7.4 | **Even or Odd** — sort number into correct basket | Todo |
| 7.5 | **Math Kitchen** (Add / Take Away) — visual equation | Todo |

### Milestone 8 — Reward & Celebration
| # | Task | Status |
|---|---|---|
| 8.1 | Reward screen (stars, correct count, coins, sticker unlock) | Todo |
| 8.2 | Confetti + pop-in animations | Todo |
| 8.3 | Sticker unlock flow | Todo |

### Milestone 9 — Parent Area
| # | Task | Status |
|---|---|---|
| 9.1 | Parent Gate (math puzzle) | Todo |
| 9.2 | Parent Dashboard (metrics, weekly chart, skills) | Todo |
| 9.3 | Progress Details (per-game breakdown, AI tip) | Todo |
| 9.4 | Settings (time limit, quiet hours, difficulty, language, audio) | Todo |

### Milestone 10 — Audio Integration
| # | Task | Status |
|---|---|---|
| 10.1 | Number pronunciation audio files (0–20, EN + VI) | Todo |
| 10.2 | SFX: correct, wrong, tap, celebrate | Todo |
| 10.3 | Optional background music (loop, toggle) | Todo |
| 10.4 | Web Speech API fallback for number reading | Todo |

### Milestone 11 — QA & Polish
| # | Task | Status |
|---|---|---|
| 11.1 | Mobile viewport testing (iPhone SE → Pro Max) | Todo |
| 11.2 | Animation performance audit | Todo |
| 11.3 | Accessibility: touch targets ≥ 44px, color contrast | Todo |
| 11.4 | localStorage edge cases (quota, corrupt data) | Todo |
| 11.5 | Cross-browser testing (Safari, Chrome, Firefox) | Todo |

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

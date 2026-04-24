# Bap Number Adventure

> Mobile-first educational number game for children age 3–7
> Built with Next.js 14 · TypeScript · TailwindCSS

---

## Overview

**Bap Number Adventure** is a gamified learning app that teaches children numbers through 5 interactive mini-games, a world map progression system, and a reward/sticker collection mechanic. Parents can track progress via a dedicated dashboard.

---

## Features

| Feature | Description |
|---|---|
| **Child Home** | Welcoming home screen with mascot Bắp, daily greeting |
| **World Map** | Visual progression through game worlds/levels |
| **Hear & Tap** | Listen to a number, tap the correct answer |
| **Number Order** | Find the missing number in a sequence |
| **Build the Number** | Drag digits to build a target number |
| **Even or Odd** | Sort numbers into Even/Odd houses |
| **Math Kitchen** | Simple addition/subtraction cooking theme |
| **Rewards** | Stickers, celebrations, streak tracking |
| **Parent Dashboard** | Progress overview, daily stats, settings |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| Animation | Framer Motion |
| Audio | Web Audio API / Howler.js |
| Testing | Jest + Testing Library |

---

## Project Structure

```
app/
  (child)/home/           # Child home screen
  (child)/world/          # World map
  (child)/game/[gameId]/  # Game screen

  (parent)/dashboard/     # Parent dashboard
  (parent)/settings/      # Settings

components/
  ui/                     # Button, Card, NumberTile, ProgressBar
  game/                   # GameContainer, Question, AnswerGrid
  layout/                 # AppShell, IOSFrame

lib/
  game-engine/            # Question generation, validation, difficulty
  hooks/                  # useAudio, useGame, useProgress
  utils/                  # helpers

data/
  game-config/            # Game type configs
  levels/                 # Level data

public/
  audio/                  # SFX and voice
  images/                 # Mascot, stickers, backgrounds
```

---

## Design Source

Design prototypes are in `handoff/number-adventure/project/`:

- `Bắp Number Adventure.html` — master reference
- `Bắp Design System.html` — tokens, colors, typography
- `Bắp IA & User Flows.html` — navigation, user flows
- Individual screen HTMLs per feature
- `tokens.css` — design tokens

Source component prototypes: `src/` (app.jsx, games.jsx, ui.jsx, ...)

---

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run tests
npm test

# Build
npm run build
```

---

## UX Principles

- **Mobile-first** — portrait, touch-optimized
- **Touch-first** — tap & drag, min 48×48px touch targets
- **Audio-first** — every interaction has audio; voice reads numbers
- **Child-safe** — no external links, no ads, parent gate for settings

---

## Documentation

| Location | Purpose |
|---|---|
| `docs/implementation/` | Implementation guides & task breakdown |
| `docs/knowledge-overview/` | Project overview, tech stack |
| `docs/knowledge-architecture/` | System architecture |
| `docs/knowledge-domain/` | Game logic, data models |
| `docs/knowledge-standards/` | Code standards |
| `docs/business/` | PRD, features, user flows |
| `docs/sprints/` | Sprint plans, roadmap |
| `plans/` | Implementation plans |

---

## AI Workspace

This project uses Claude Code with a full AI workspace:

```bash
claude          # Start session
/cook           # Implement a feature
/fix            # Fix a bug
/plan           # Create implementation plan
/review         # Code review
/test           # Run / write tests
```

See `CLAUDE.md` for full AI workspace context.

---

_Bap Number Adventure — Learning numbers, one adventure at a time._

# System Overview

## Architecture Pattern

Next.js App Router single-page application, client-side game logic, localStorage for persistence.

```
Browser
  └── Next.js App (App Router)
        ├── (child) route group — child-facing screens
        │     ├── /home
        │     ├── /world
        │     └── /game/[gameId]
        ├── (parent) route group — parent-facing screens
        │     ├── /dashboard
        │     └── /settings
        └── Shared Providers
              ├── GameProgressContext   ← localStorage persistence
              ├── AudioContext          ← Howler.js singleton
              └── ThemeContext          ← design tokens
```

## Module Boundaries

| Module | Responsibility | Depends On |
|---|---|---|
| `app/` | Routing, layouts, page shells | components, lib |
| `components/ui/` | Atomic UI elements | none |
| `components/game/` | Game-specific UI | components/ui, lib/game-engine |
| `components/layout/` | App shell, iOS frame | components/ui |
| `lib/game-engine/` | Question gen, validation, difficulty | data/ |
| `lib/hooks/` | useAudio, useGame, useProgress | lib/game-engine, contexts |
| `lib/utils/` | Pure helpers | none |
| `data/` | Static config & level data | none |

## Persistence

- **localStorage** — progress, stickers, settings, streak
- No backend / API in MVP
- Data shape: `{ progress: {}, stickers: [], settings: {}, streak: {} }`

## Audio Architecture

```
AudioContext (React Context)
  └── Howler.js instance
        ├── sfx pool (correct, wrong, tap, celebrate)
        └── voice pool (number pronunciation 0-20)
```

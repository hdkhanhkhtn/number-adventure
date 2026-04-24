# Development Setup

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 18 | `nvm install 18` |
| npm | ≥ 9 | bundled with Node |
| Git | any | `brew install git` |

## Initial Setup

```bash
# 1. Clone the repo (if using git)
git clone <repo-url> bap-number-adventure
cd bap-number-adventure

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
# → http://localhost:3000
```

## Project Scripts

```bash
npm run dev          # Start Next.js dev server (hot reload)
npm run build        # Production build
npm run start        # Serve production build
npm run lint         # ESLint check
npm run type-check   # TypeScript check (tsc --noEmit)
npm test             # Jest (watch mode)
npm test -- --coverage   # Jest with coverage report
```

## Design Token Setup (one-time)

```bash
# Read tokens from handoff
cat handoff/number-adventure/project/tokens.css

# Map each CSS variable into tailwind.config.ts
# under theme.extend.colors, theme.extend.fontFamily, etc.
```

## Environment Variables

No `.env` required for MVP — fully client-side, no API keys.

## VS Code Setup

Recommended extensions:
- Tailwind CSS IntelliSense
- ESLint
- Prettier
- TypeScript Hero

Open workspace: `NumberAdventure.code-workspace`

## Viewing Design Prototypes

```bash
# Open any design HTML directly in browser
open handoff/number-adventure/project/Bắp\ Number\ Adventure.html
open handoff/number-adventure/project/Bắp\ Design\ System.html
```

Do NOT implement by copying HTML — rebuild in React + Tailwind.

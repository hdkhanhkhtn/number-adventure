# Tech Stack

## Core

| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 14+ (App Router) | File-based routing, RSC, good DX |
| Language | TypeScript | Type safety, better IDE support |
| Styling | TailwindCSS | Rapid UI, consistent tokens |
| State | React Context + useReducer | Simple, no extra dependency for MVP |
| Animation | Framer Motion | Smooth child-friendly animations |
| Audio | Web Audio API / Howler.js | Cross-browser audio, low latency |

## Testing

| Tool | Purpose |
|---|---|
| Jest | Unit & integration tests |
| Testing Library | Component testing |

## Tooling

| Tool | Purpose |
|---|---|
| ESLint | Linting |
| Prettier | Formatting |
| TypeScript | Type checking |

## Design Tokens
Source: `handoff/number-adventure/project/tokens.css`
Applied via: Tailwind config (`tailwind.config.ts`)

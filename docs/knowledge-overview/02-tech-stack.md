# Tech Stack

## Frontend (Client)

| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 14+ (App Router) | File-based routing, RSC, good DX |
| Language | TypeScript | Type safety, better IDE support |
| Styling | TailwindCSS | Rapid UI, consistent design tokens |
| State | React Context + useReducer | Simple, no extra dependency |
| Animation | Framer Motion | Smooth, child-friendly animations |
| Audio | Web Speech API (MVP) → Google TTS (opt) | Speech synthesis, fallback support |
| Audio SFX | Howler.js | Cross-browser, low-latency audio |

## Backend (Server)

| Layer | Technology | Reason |
|---|---|---|
| API | Next.js API Routes | Unified monorepo, built-in |
| Language | TypeScript | Type safety, same as frontend |
| Database | PostgreSQL | Reliable, ACID transactions |
| ORM | Prisma | Type-safe DB access, migrations |
| Database Client | `@prisma/client` | Auto-generated types from schema |

## AI Integration

| Service | Endpoint | Purpose |
|---|---|---|
| AI Content API | https://9router.remotestaff.vn/v1 | Generate game questions (JSON) |
| Model | advance-model | Question generation |
| Response | Validated JSON | Cached in DB, reused per lesson |

## Deployment

| Tool | Purpose |
|---|---|
| Docker | Containerization |
| Nginx | Reverse proxy (optional) |
| PostgreSQL (Docker) | Database container |
| Next.js | Unified frontend + API |
| VPS | Target environment |

## Testing

| Tool | Purpose |
|---|---|
| Jest | Unit & integration tests |
| Testing Library | Component testing |

## Tooling

| Tool | Purpose |
|---|---|
| ESLint | Linting |
| Prettier | Code formatting |
| TypeScript | Type checking |

## Design Tokens
Source: `handoff/number-adventure/project/tokens.css`
Applied via: Tailwind config (`tailwind.config.ts`)

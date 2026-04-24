# Scout Report: PR #3 — Phase A Foundation

## Files Reviewed

| File | Layer | Lines |
|------|-------|-------|
| prisma/schema.prisma | DB | 136 |
| context/game-progress-context.tsx | State | 127 |
| context/audio-context.tsx | State | 67 |
| context/theme-context.tsx | State | 55 |
| context/providers.tsx | State | 18 |
| lib/types/common.ts | Types | 80 |
| lib/types/api.ts | Types | 92 |
| lib/prisma.ts | DB client | 13 |
| lib/utils/cn.ts | Util | 7 |
| app/layout.tsx | Infra | 52 |
| app/page.tsx | Infra | 6 |
| app/globals.css | Design | 231 |
| components/layout/app-shell.tsx | Layout | 38 |
| components/ui/num-tile.tsx | UI | 98 |
| components/ui/big-button.tsx | UI | 89 |
| components/ui/bap-mascot.tsx | UI | 103 |
| components/ui/streak-card.tsx | UI | 88 |
| components/ui/index.ts | UI barrel | 42 |
| All 14 app/api/**/route.ts | API | ~12 each |
| src/data/game-config/worlds.ts | Config | 77 |
| src/data/game-config/game-types.ts | Config | 63 |
| src/data/game-config/lesson-templates.ts | Config | 74 |
| src/data/game-config/skills.ts | Config | 86 |
| src/data/game-config/sticker-defs.ts | Config | 58 |
| package.json | Infra | 31 |
| docker-compose.yml | Infra | 32 |
| tsconfig.json | Infra | - |
| next.config.ts | Infra | 7 (empty) |
| .env.example | Infra | 4 |

---

## Architecture Layer Map

| Layer | Files |
|-------|-------|
| **DB** | prisma/schema.prisma, lib/prisma.ts |
| **API** | app/api/**/ (14 route stubs) |
| **State** | context/game-progress-context.tsx, context/audio-context.tsx, context/theme-context.tsx, context/providers.tsx |
| **UI** | components/ui/* (14 components + barrel), components/layout/app-shell.tsx |
| **Types** | lib/types/common.ts, lib/types/api.ts |
| **Config** | src/data/game-config/* (5 static files) |
| **Infra** | package.json, tsconfig.json, next.config.ts, docker-compose.yml, .env.example, app/layout.tsx, app/globals.css |

---

## Dependency Graph

```
app/layout.tsx
  → context/providers.tsx
      → context/theme-context.tsx   (reads/writes localStorage "bap-theme")
      → context/audio-context.tsx   (stub, Web Speech API)
      → context/game-progress-context.tsx  (reads/writes localStorage "bap-progress-cache")
  → app/globals.css

context/game-progress-context.tsx
  → lib/types/common.ts  (ChildProfile, ChildSettings, WorldId)

context/theme-context.tsx
  → lib/types/common.ts  (ThemeName)

components/ui/num-tile.tsx
  → lib/types/common.ts  (TileSize, TileColor, TileState)

components/ui/big-button.tsx
  → lib/types/common.ts  (ButtonColor, ButtonSize)

components/ui/bap-mascot.tsx
  → lib/types/common.ts  (MascotMood, MascotColor)

components/ui/streak-card.tsx
  → (no imports — standalone, uses CSS vars from globals.css)

src/data/game-config/worlds.ts
  → lib/types/common.ts  (WorldId, TileColor)

src/data/game-config/game-types.ts
  → lib/types/common.ts  (GameType, WorldId)

src/data/game-config/lesson-templates.ts
  → lib/types/common.ts  (GameType, WorldId, Difficulty)

src/data/game-config/skills.ts
  → lib/types/common.ts  (WorldId, GameType)

src/data/game-config/sticker-defs.ts
  → lib/types/common.ts  (StickerDef)

All app/api/**/route.ts
  → next/server only (NextResponse) — no prisma imports yet (stubs)

lib/prisma.ts
  → @prisma/client
```

**Central hub**: `lib/types/common.ts` — imported by 7+ files. Changes here cascade widely.

---

## Blast Radius Assessment

| Change | Files that break |
|--------|-----------------|
| prisma/schema.prisma field added/renamed | lib/prisma.ts (re-gen), all Phase C/D route implementations, game-progress-context if mapping types change |
| lib/types/common.ts type changed | context/game-progress-context.tsx, context/theme-context.tsx, all 4 game-config files, all 4 UI components importing types |
| context/providers.tsx nesting order changed | All child components consuming any context — theme must wrap audio which wraps game-progress |
| context/game-progress-context.tsx localStorage key "bap-progress-cache" renamed | Existing browser sessions lose cached progress silently |
| app/globals.css CSS variable renamed (e.g. --r-lg) | streak-card.tsx (hardcodes --r-lg, --shadow-card), any other components using var() |
| app/globals.css @theme inline block changed | All Tailwind utility classes using mapped color/radius tokens fail at build time |
| components/ui/index.ts barrel modified | Any consumer using named imports from "@/components/ui" breaks |

---

## High-Risk Hotspots

| Severity | File | Issue |
|----------|------|-------|
| CRITICAL | All 14 app/api/**/route.ts | Zero auth guards — every handler ignores the request body and returns 501. When Phase C implements them, there is NO framework in place for auth checking. Risk: first implementation of any route can accidentally ship without session validation. |
| CRITICAL | middleware.ts | MISSING — no Next.js middleware exists. Without it, all /api routes are fully public with no auth layer, no rate limiting, no CORS policy. |
| HIGH | context/game-progress-context.tsx:82 | Unsafe JSON.parse of localStorage data cast directly to `Partial<GameProgressState>` with no schema validation. Malformed/injected cache data will silently corrupt childId and profile state. |
| HIGH | context/audio-context.tsx | voiceStyle and kidLang are hardcoded to 'Friendly'/'en' in provider value despite being in the interface. ChildSettings.kidLang and voiceStyle from GameProgress context are not wired in. Audio context is disconnected from child settings. |
| HIGH | docker-compose.yml:25 | AI_ENDPOINT and AI_MODEL hardcoded to production remote endpoint (https://9router.remotestaff.vn/v1, "advance-model") in the compose file. Dev environment hits production AI endpoint by default. |
| HIGH | .env.example | AI_API_KEY placeholder present but SESSION_SECRET, JWT_SECRET, NEXTAUTH_SECRET are absent. No session infrastructure secret is specified anywhere in the project. |
| MEDIUM | lib/types/api.ts:57 | SubmitAttemptRequest.correct is a client-supplied boolean. The server is trusted to set correct=true/false from the client. When routes are implemented, this must be server-computed, not client-reported — otherwise scores are trivially cheatable. |
| MEDIUM | context/game-progress-context.tsx | sessionActive flag is in state but no session timeout, no auto-clear on child switch, no guard against stale childId after logout. |
| MEDIUM | prisma/schema.prisma | Lesson table has worldId (String) with no FK relation to any World model. Worlds exist only in static config (src/data/game-config/worlds.ts), not in DB. World unlock logic cannot be enforced at DB layer. |
| MEDIUM | prisma/schema.prisma | ChildSettings.difficulty and Lesson.gameType are plain String with no DB enum constraint. Type safety exists only in TypeScript; bad data from direct DB writes would pass. |
| MEDIUM | app/globals.css:154 | `overflow: hidden` on body — this blocks scroll on the entire page. Fine for single-screen game views but will cause invisible content on any screen taller than viewport without explicit scroll containers. |
| MEDIUM | components/ui/num-tile.tsx | Press/release animations use direct DOM style mutations via `e.currentTarget.style` rather than React state. This works but bypasses React's render cycle — if the component re-renders mid-press, styles reset unexpectedly. |
| LOW | next.config.ts | Completely empty config. No image domain allowlist, no strict mode, no bundle analyzer. Needs attention before production. |
| LOW | lib/prisma.ts | Uses globalThis singleton pattern (correct for dev HMR) but logs are set to ['error','warn'] in dev — query logs disabled. Debugging slow queries in dev will be harder. |
| LOW | app/layout.tsx | Loads 3 Google Fonts (Fredoka, Baloo_2, Be_Vietnam_Pro). All three are loaded but globals.css only references --font-kid and --font-num as single stacks. The CSS var does not map to the Next.js font CSS variable names (--font-fredoka, --font-baloo2). Fonts may fall back to system fonts at runtime. |

---

## Missing Files / Coverage Gaps

| Missing | Why It Matters |
|---------|---------------|
| middleware.ts | No auth protection on any API route. Critical prerequisite before Phase C ships. |
| lib/auth/ (session/JWT utils) | No auth primitives exist. Phase C register/login routes will need to invent these — risk of inconsistent implementations. |
| lib/validation/ or zod schemas | No request validation layer. All API routes currently ignore request body. When implemented, each developer will validate differently unless a shared schema layer exists. |
| Dockerfile | docker-compose.yml has an `app` service with `build: .` but no Dockerfile exists. `docker-compose up` will fail for the app service. |
| app/(child)/home/page.tsx, world/page.tsx, game/[gameId]/page.tsx | app/page.tsx redirects to /home but no /home route exists — redirect leads to 404 in current state. |
| app/(parent)/dashboard/page.tsx, settings/page.tsx | Parent routes from CLAUDE.md spec are absent. |
| Zero application test files | No unit tests, no integration tests for any application code (only .claude/skills internal tests exist). Iron Law: no production code without failing test first — this entire PR violates TDD. |
| prisma/migrations/ | No migration files present. Schema exists but no migration history. Collaborators cannot run `prisma migrate deploy`. |
| lib/types/common.ts: `WeekProgress.days` | Documented as "7 booleans Mon–Sun" but there is no validation that the array is exactly length 7. Any consumer must defensively handle under/over-length arrays. |

---

## Summary for Phase 2 Reviewers

Priority order for review:

1. **MISSING MIDDLEWARE** — most critical structural gap. All API routes are unprotected. Flag as blocker for Phase C.

2. **API ROUTE STUBS** — all 14 routes return 501 with no request parsing. Confirm this is intentional Phase A scaffold (acceptable) and that each route has a correct HTTP method signature. Note: routes with dynamic segments ([id], [childId]) have handler functions with no params at all — they will not receive the route params when implemented without adding the params argument.

3. **`SubmitAttemptRequest.correct` is client-controlled** — architectural flaw in api.ts that must be resolved before sessions/attempts route is implemented in Phase B.

4. **Audio ↔ Settings disconnect** — audio-context.tsx hardcodes voiceStyle='Friendly' and kidLang='en' regardless of child settings. Either the context is intentionally a stub (acceptable, fix in Phase D) or it is a bug now.

5. **CSS font variable mismatch** — app/layout.tsx registers `--font-fredoka`, `--font-baloo2` via next/font. globals.css references `'Fredoka'` by name string, not by the CSS variable. The fonts will work from Google CDN but the Next.js font optimization (self-hosting, preloading) is not actually applied.

6. **Prisma schema World gap** — no World table in DB. worldId in Lesson is an orphan string. Static config and DB are split sources of truth for world definitions. Acceptable for Phase A but must be reconciled before world unlock logic ships.

7. **localStorage cache injection** — game-progress-context.tsx parses localStorage without validation. Low exploit surface in a child app but worth noting for the review.

8. **No Dockerfile** — docker-compose `app` service is broken. Dev team cannot use Docker for the app layer.

---

## Unresolved Questions

- Are the dynamic route handlers missing params intentionally (just returning 501 regardless of id)? When Phase B/C adds implementation, params must be added: `async function GET(req: Request, { params }: { params: { id: string } })`.
- Is the absence of a World DB table intentional for Phase A, or will worlds be seeded into Lesson.worldId later?
- Is `correct` in SubmitAttemptRequest meant to be validated server-side, or is client-trust acceptable for an offline-first child app?
- Font loading: is the team aware Google Fonts CDN is used rather than Next.js self-hosted optimization due to the CSS var mismatch?

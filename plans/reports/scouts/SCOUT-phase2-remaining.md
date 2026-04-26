# Scout Report: Phase 2 Remaining Work

**Scope**: Gaps, incomplete features, integration points for Phase 2 planning
**Date**: 2026-04-25

---

## 1. Onboarding Route Gap

No dedicated `/onboarding` route exists. The onboarding flow is embedded in
`app/(child)/layout.tsx` as a client-side state machine (`OnboardStep`: splash → welcome → setup → ready).

- `SplashScreen`, `WelcomeScreen`, `ProfileSetup` components are implemented in `components/screens/`
- Root `app/page.tsx` redirects directly to `/home` (no onboarding route)
- On first load, the child layout checks `state.childId` (localStorage); if absent, shows splash → welcome → profile wizard
- Guest profile is stored as `guest_<UUID>` in localStorage; DB registration deferred to Phase C (`// Phase B: DB registration is deferred to Phase C`)
- **Gap**: "First Day Intro (World Intro)" screen from MVP list has no implementation — not a component, not a route state

---

## 2. Design Handoff vs Implemented Routes

MVP screen list (`Bắp MVP Screen List.html`) defines 33 screens. Mapping against app routes and components:

| Screen | Status |
|---|---|
| Splash Screen | Implemented — `components/screens/splash-screen.tsx` |
| Welcome Screen | Implemented — `components/screens/welcome-screen.tsx` |
| Profile Setup | Implemented — `components/screens/profile-setup.tsx` |
| **First Day Intro (World Intro)** | **MISSING** — no component, no route |
| Home Screen | Implemented — `app/(child)/home/page.tsx` |
| **Streak Screen** | **MISSING** — `streak-card.tsx` exists as widget, but no full Streak Screen route/modal |
| **Daily Goal Complete** | **MISSING** — no component |
| World Map | Implemented — `app/(child)/worlds/page.tsx` |
| Level List | Implemented — `app/(child)/worlds/[worldId]/page.tsx` |
| **World Unlock Celebration** | **MISSING** — no animation/modal on world unlock |
| Hear & Tap / Build Number / Even-Odd / Number Order / Add-Take | Implemented |
| Game Reward Screen | Implemented — `app/(child)/reward/page.tsx` |
| **Sticker Earn Moment** | **MISSING** — no sticker-earn overlay/animation |
| **Session Complete / Time Limit** | **MISSING** — no component |
| Sticker Book | Implemented — `app/(child)/stickers/page.tsx` |
| **Sticker Detail** | **MISSING** — no detail view |
| Parent Gate (PIN) | Partially implemented — `components/parent/parent-gate.tsx` exists (client-side only) + `api/auth/pin/route.ts` returns 501 |
| Parent Dashboard | Implemented — `app/(parent)/dashboard/page.tsx` |
| Progress Report | Implemented — `app/(parent)/report/page.tsx` |
| **Parent Onboarding** | **MISSING** — no component or route |
| Settings (Time/Lang/Audio) | Implemented — 3 tabs in `app/(parent)/settings/page.tsx` |
| **Settings — Profile & Security** | **MISSING** — 4th settings tab (PIN change, profile reset) not implemented |
| **Exit Game Confirmation Modal** | **MISSING** |
| **Reset Progress Confirmation** | **MISSING** |
| **Offline / No Connection State** | **MISSING** — PWA caching done but no offline UI screen |
| **Empty State — Parent Dashboard (New User)** | **MISSING** — dashboard loads real data but no empty state |
| **Notification Permission Request** | **MISSING** |

Summary: 11 screens missing, 22 implemented.

---

## 3. Game Types Coverage

7 game types registered in `src/data/game-config/game-types.ts` (lines 18-75):

| Game Type | Engine | UI Component | Tests |
|---|---|---|---|
| `hear-tap` | `hear-tap-engine.ts` | `hear-tap-game.tsx` | Yes |
| `build-number` | `build-number-engine.ts` | `build-number-game.tsx` | Yes |
| `even-odd` | `even-odd-engine.ts` | `even-odd-game.tsx` | Yes |
| `number-order` | `number-order-engine.ts` | `number-order-game.tsx` | Yes |
| `add-take` | `add-take-engine.ts` | `add-take-game.tsx` | Yes |
| `count-objects` | `count-objects-engine.ts` | `count-objects-game.tsx` | Yes |
| `number-writing` | `number-writing-engine.ts` | `number-writing-game.tsx` | Yes |

All 7 types are wired end-to-end with lesson data. No engine-to-UI gaps.

---

## 4. Lesson / Content Depth

`src/data/game-config/lesson-templates.ts` — 63 lessons total across 7 worlds, 9 per world:

| World | Lessons | Difficulties |
|---|---|---|
| number-garden | 9 (ng-01..09) | 3 easy, 3 medium, 3 hard |
| counting-castle | 9 (cc-01..09) | 3/3/3 |
| even-odd-house | 9 (eo-01..09) | 3/3/3 |
| number-sequence | 9 (ns-01..09) | 3/3/3 |
| math-kitchen | 9 (mk-01..09) | 3/3/3 |
| counting-meadow | 9 (cm-01..09) | 3/3/3 |
| writing-workshop | 9 (ww-01..09) | 3/3/3 |

Content is rich — full 3-tier progression for all 7 worlds. No sparse worlds.

---

## 5. Parent Dashboard Gaps

Implemented screens: Dashboard (`/parent/dashboard`), Progress Report (`/parent/report`), Settings (`/parent/settings` with 3 tabs).

Missing:
- **Settings — Profile & Security tab**: `parent-settings-content.tsx` defines `type Tab = 'time' | 'lang' | 'audio'` — no 4th tab for PIN change, name edit, or reset progress (line 12)
- **Parent Onboarding**: no first-run flow for parents
- **Empty state**: dashboard content loads API data; no empty/skeleton for new users
- **Streak page**: `streak-card.tsx` is a widget in dashboard, not a standalone Streak Screen

---

## 6. TODO / FIXME Markers

Only 2 markers found — both in auth stubs:

| File | Line | Content |
|---|---|---|
| `app/api/auth/pin/route.ts` | 9 | `// TODO: implement in Phase C (with rate limiting + bcrypt compare)` — returns 501 |
| `app/api/auth/session/route.ts` | 7 | `// TODO: implement in Phase C` — returns 501 |

No `@ts-ignore`, `FIXME`, or `HACK` markers anywhere in source.

---

## 7. Test Coverage

All 7 game engines tested: `__tests__/game-engine/` has dedicated files for count-objects-engine and number-writing-engine.

`question-loader.test.ts` (lines 63-79) verifies both new types via `generateLocalQuestions`.

Other test files:
- API: 7 files (ai-generate, children-difficulty, report, sessions x3, streaks)
- Components: game-hud, ios-install-prompt, big-button, num-tile
- PWA: offline-attempt-queue

**Gap**: No component tests for new game UI files (`count-objects-game.tsx`, `number-writing-game.tsx`). Engine-level tests exist; UI-level do not.

---

## 8. API Completeness

20 API route files exist. All are implemented except:

| Route | Status |
|---|---|
| `POST /api/auth/pin` | Stub — 501, TODO Phase C |
| `GET /api/auth/session` | Stub — 501, TODO Phase C |
| `GET /api/auth/login` | Implemented |
| `POST /api/auth/register` | Implemented |
| All other routes | Implemented |

No orphaned stub files beyond the 2 auth routes above.

---

## Integration Points

| Point | File | Notes |
|---|---|---|
| Onboarding → DB | `app/(child)/layout.tsx:32` | Guest UUID in localStorage; DB call deferred to Phase C |
| Parent PIN gate | `components/parent/parent-gate.tsx` | Client-only 4-digit check; `api/auth/pin` is 501 |
| World unlock celebration | `app/(child)/worlds/[worldId]/page.tsx` | Unlock tracked but no celebration UI triggered |
| Session time limit | `app/(parent)/settings` | dailyMin stored; no UI enforces/displays session-end |

---

## Unresolved Questions

1. Phase C scope: is auth (PIN verify, session, real DB registration for guest users) in Phase 2 or Phase 3?
2. Which of the 11 missing screens are MVP-critical vs. nice-to-have for Phase 2?
3. Component tests for `count-objects-game.tsx` and `number-writing-game.tsx` — should they be added in the same phase as the engines, or deferred?
4. `number-sequence` world reuses `number-order` game type — is this intentional long-term, or should it get its own engine?

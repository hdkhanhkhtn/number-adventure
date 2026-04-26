# Research: Phase 2E Screen Implementation Patterns

Date: 2026-04-26

---

## A: Sticker Earn Moment Overlay

**Current state**: `reward/page.tsx` reads `sessionStorage('lastGameResult')` which already contains `sticker?: { emoji, name }`. `RewardContent` renders a static purple banner inline (animated via CSS `pop-in 0.5s delay 0.5s`). There is no dedicated celebratory moment — the sticker just appears in the reward layout.

**Recommended pattern**: Inject the overlay INSIDE `RewardContent` (or as a sibling rendered by `reward/page.tsx`) — NOT via a separate `sessionStorage` flag pass.

Reason: the sticker data is already in `result.sticker` on the reward page. A secondary flag would add redundancy. The reward page renders after the game completes, so timing is correct.

**Exact injection point**: `components/screens/reward-content.tsx`, add a local `useState(false)` for `stickerMomentDone`. On mount, if `sticker` prop is truthy, delay ~800ms (after stars animate) then set `showStickerMoment=true`. Render a fixed fullscreen overlay with:
- `Confetti` (already imported, `count={30}`)
- `BapMascot mood="excited"` (already imported)
- Large sticker emoji + name
- Tap-anywhere to dismiss (sets `stickerMomentDone=true`, hides overlay)

One-time per session: the overlay is local state — dismissed state lives in component, not localStorage.

**Key components already available**:
- `components/ui/confetti.tsx` — already imported in `reward-content.tsx`
- `components/ui/bap-mascot.tsx` — already imported, supports `mood="excited"` (verify mood exists; `celebrate` confirmed, check if `excited` is accepted or use `celebrate`)
- `components/ui/sparkles.tsx` — already imported

**File to modify**: `components/screens/reward-content.tsx` (currently 93 lines — add ~25 lines max, stays under 120).

---

## B: Sticker Detail Screen

**Current state**: `app/(child)/stickers/page.tsx` (74 lines) — 4-col grid, no tap handler, no detail UI.

**Recommendation: modal/sheet overlay on the sticker book page** (NOT a route).

Reasons:
- YAGNI: a separate route `/stickers/[stickerId]` requires a new page file, dynamic segment, and navigation push/pop. Overkill for showing emoji + name + unlock date.
- Existing pattern: no detail routes exist for any child-facing entity — reward uses a flat page, worlds use a `[worldId]` route only because worlds have real sub-content.
- Mobile UX: a bottom-sheet sliding up matches child-friendly patterns and keeps the sticker book visible in background (orientation cue).

**Pattern**:
- Add `selectedSticker: StickerEntry | null` state to `StickersPage`
- Grid items: add `onClick={() => s.earned && setSelectedSticker(s)}` (locked stickers show nothing / a "keep playing!" message)
- Sheet overlay: fixed bottom panel, slides up via Framer Motion `AnimatePresence` + `y` transform, or CSS transition. Shows: large emoji (80px), name, "Earned!" badge. Tap backdrop or X to close.

**File to modify**: `app/(child)/stickers/page.tsx` (74 lines → will reach ~130; still under 200 limit).

---

## C: Session Complete vs Time-Up Screen

**Finding**: Phase 2D's `phase-05-celebration-overlays.md` defines "Daily Goal Complete" (FR9–FR12) as the `dailyMin`-reached overlay shown in `reward/page.tsx`. However, `useSessionTimer` (referenced in Phase 2D plan) does NOT yet exist — `lib/hooks/` contains only `use-audio`, `use-game-session`, `use-game`, `use-sound-effects`. The Phase 2D timer hook is not yet implemented.

**Recommendation**: Phase 2E's "Session Complete" screen IS the same concept as Phase 2D's daily-goal overlay — they share intent (day's play is done). They should be one component, not two.

Distinction to preserve:
- **Time-up overlay** (Phase 2D, in-game): shown when `dailyMin` reached mid-game, interrupts gameplay → navigates to reward
- **Session Complete screen** (Phase 2E, post-reward): shown after reward page if daily quota met for the day

Phase 2E's scope = the post-reward "Session Complete" variant = `DailyGoalOverlay` from Phase 2D plan. Build it once, reuse.

**Exact inject point**: `app/(child)/reward/page.tsx` — after `result` is set, check `result.streak` or a `dailyGoalMet` flag in `lastGameResult` (add this field to the session complete API response). Show `DailyGoalOverlay` as a fixed overlay on top of `RewardContent`.

---

## D: Offline / No Connection Screen

**Finding**: `next.config.ts` uses `withSerwistInit({ swSrc: 'app/sw.ts', swDest: 'public/sw.js' })`. No `fallbacks` option is configured — serwist's offline fallback page is NOT set up. No `app/offline/` route exists. `navigator.onLine` is not used anywhere in app code.

**Recommendation**: Create `/offline` route as standard PWA fallback (serwist will serve it when navigation fails offline), PLUS a `useOfflineDetection` hook for in-app banner.

**Two-tier strategy** (KISS):

1. **Fallback page** `app/offline/page.tsx` — precached via serwist manifest, served by SW when fetch fails. Shows BapMascot + "No connection" message + retry button. Add to serwist config:
   ```ts
   // next.config.ts — withSerwistInit options
   fallbacks: { document: '/offline' }
   ```
   
2. **In-app banner** for API failures (session sync, sticker fetch): a small `useOnline` hook wrapping `window.addEventListener('offline/online')`, surfaced as a toast/banner in the game layout. Only shows for network-dependent actions — gameplay itself works offline (audio cached, questions generated client-side).

**Do NOT** use a full-screen blocking overlay for offline state — gameplay works offline (confirmed by serwist `CacheFirst` for audio, `NetworkFirst` with fallback for APIs). Only session sync fails; that can be queued.

**Files to create**:
- `app/offline/page.tsx` — static offline fallback (simple, ~40 lines)
- `lib/hooks/use-online.ts` — `navigator.onLine` + event listeners hook

**File to modify**: `next.config.ts` — add `fallbacks: { document: '/offline' }` to serwist init options.

---

## E: Streak Screen (Standalone)

**Current state**: `components/ui/streak-card.tsx` (88 lines) — shows 7-day dot calendar + flame count + longest streak. Used inline in `reward-content.tsx`. No full streak screen or `/streak` route exists.

**Recommendation: bottom-sheet modal triggered from streak card tap** (NOT a new route).

Reasons:
- `streak-card.tsx` is already embedded in multiple contexts (reward page). A route would require passing streak data via URL params or a fetch — added complexity for a display-only screen.
- The monthly calendar and streak history data are already available from the session result's `streak` field. No new API endpoint needed for a modal.
- Pattern matches sticker detail recommendation (consistency).

**Additional data to show** beyond the widget:
- Monthly dot-calendar (current month, ~30 cells) — derived from existing `weekData` pattern, extended to month
- Longest streak highlight
- "Best day" or streak recovery tip (optional copy)

**Pattern**:
- Add `onTap` prop to `StreakCard` component
- In reward page / home, wire tap → `showStreakDetail=true`
- `StreakDetailSheet` component: bottom-sheet with monthly view, closes on backdrop tap or swipe-down

**File to modify**: `components/ui/streak-card.tsx` (add optional `onTap` prop, ~3 lines change).
**File to create**: `components/ui/streak-detail-sheet.tsx` (~80 lines).

---

## Summary Table

| Screen | Pattern | Inject Point | Files |
|---|---|---|---|
| Sticker Earn Moment | Fixed overlay in reward page | `components/screens/reward-content.tsx` | modify 1 file |
| Sticker Detail | Bottom-sheet modal | `app/(child)/stickers/page.tsx` | modify 1 file |
| Session Complete | Same as Phase 2D DailyGoalOverlay | `app/(child)/reward/page.tsx` | create overlay + modify page |
| Offline screen | PWA fallback page + useOnline hook | `app/offline/page.tsx`, `next.config.ts` | create 2, modify 1 |
| Streak Screen | Bottom-sheet modal | streak-card tap → sheet | create 1, modify 1 |

---

## Unresolved Questions

1. Does `BapMascot` accept `mood="excited"` or only `mood="celebrate"`? Needs verification in `components/ui/bap-mascot.tsx` before implementing sticker overlay.
2. Does the session complete API (`/api/children/[id]/sessions`) currently return a `dailyGoalMet` boolean, or must Phase 2E derive it client-side from `elapsedMin >= dailyMin`? (Phase 2D timer hook not yet implemented.)
3. For the monthly streak calendar in the streak detail sheet — is the full month's completion data available from an existing API endpoint, or does the API only return 7-day `weekData`? A new API may be needed.

# Phase 1: Navigation & Onboarding Redesign (3A)

## Context Links

- [Research: Navigation & Onboarding](research/researcher-phase3a-navigation-onboarding.md)
- [Scout: Codebase Analysis](scout/scout-phase3-codebase.md)
- [Plan Overview](plan.md)

## Overview

- **Priority:** Critical / High
- **Status:** In Progress — code gaps remain (see Remaining Work below)
- **Effort:** ~3 days
- **Description:** Fix blank screens, stabilize back navigation, complete onboarding wizard, add guest-to-DB migration prompt, finish settings page.

## Key Insights

- `home/page.tsx` line 53: `if (!profile) return null` causes blank screen
- `worlds/page.tsx` has same pattern — no guard, no redirect
- Layout does NOT expose `isHydrated` to child pages; context hydrates via `useEffect`
- Guest IDs use `guest_<uuid>` prefix; TODO comment at `layout.tsx` line 31 marks upgrade point
- Settings should use dedicated `useSettings` hook (not `game-progress-context`) to avoid game re-renders
- `router.replace('/')` preferred over `router.push('/')` to prevent back-nav loops

## Requirements

### Functional

- FR-01: No blank screen on any child page when profile is null — redirect to onboarding
- FR-02: Guest users see "Save your progress" banner when parent is logged in
- FR-03: POST `/api/children/migrate` merges guest data into DB child
- FR-04: Onboarding persists partial state across refresh (mid-wizard resume)
- FR-05: Back navigation uses `router.back()` with history guard; `router.replace` after game completion
- FR-06: Deep-link to `/play/...` without profile redirects to `/`
- FR-07: Volume slider (debounced), high-contrast toggle, reduce-motion toggle
- FR-08: Bedtime mode, daily break reminder, game hints toggle
- FR-09: Parent game rotation control (auto / favorites / all)

### Non-Functional

- NFR-01: No blank flash on first paint — show skeleton or splash
- NFR-02: Settings writes debounced (300ms) to avoid excessive localStorage writes
- NFR-03: High-contrast class applied to `<html>` element, not component-local

## Architecture

```
guest plays → localStorage (childId = "guest_xxx")
   ↓
parent logs in → cookie detected
   ↓
banner: "Save your progress" → parent auth gate
   ↓
POST /api/children/migrate { guestId, parentId }
   ↓
server: copy sessions/stickers → new DB child → return newChildId
   ↓
client: setChild(newChildId) → localStorage updated → guest data cleared
```

## Related Code Files

### MODIFY

| File | Changes |
|------|---------|
| `app/(child)/home/page.tsx` | Replace `if (!profile) return null` with skeleton + redirect guard |
| `app/(child)/worlds/page.tsx` | Add same profile guard pattern |
| `app/(child)/play/[gameType]/[lessonId]/page.tsx` | Add profile guard; redirect to `/` if no childId |
| `app/(child)/stickers/page.tsx` | Add profile guard |
| `app/(child)/reward/page.tsx` | Add profile guard |
| `app/(child)/layout.tsx` | Add partial-state persistence; guest upgrade banner logic |
| `context/game-progress-context.tsx` | Expose `isHydrated` flag from provider |
| `components/screens/home-screen.tsx` | Add "Save progress" banner slot |
| `components/screens/parent-settings-content.tsx` | Add game rotation tab |

### CREATE

| File | Purpose |
|------|---------|
| `lib/hooks/use-settings.ts` | Dedicated settings hook with localStorage sync + debounce |
| `app/api/children/migrate/route.ts` | POST endpoint: merge guest child into DB child |
| `components/screens/save-progress-banner.tsx` | Dismissible "Save your progress" banner |
| `components/screens/parent-settings-gameplay-tab.tsx` | Game rotation + hints toggle tab |
| `components/ui/skeleton-screen.tsx` | Reusable loading skeleton for child pages |

## Implementation Steps

### Task 3A-01: Fix blank screen (Critical)

1. In `context/game-progress-context.tsx`, add `isHydrated` state:
   - Add `const [isHydrated, setIsHydrated] = useState(false)` after useReducer
   - Set `setIsHydrated(true)` after localStorage load in useEffect
   - Expose `isHydrated` in context value
2. In `app/(child)/home/page.tsx`, replace line 53 `if (!profile) return null`:
   ```typescript
   const { state, isHydrated } = useGameProgress();
   if (!isHydrated) return <SkeletonScreen />;
   if (!state.childId || !state.profile) {
     router.replace('/');
     return null;
   }
   ```
3. Apply same guard pattern to: `worlds/page.tsx`, `stickers/page.tsx`, `reward/page.tsx`
4. In `play/[gameType]/[lessonId]/page.tsx` line 54, add guard before `startSession()`:
   ```typescript
   if (!state.childId) { router.replace('/'); return null; }
   ```

### Task 3A-02: Guest-to-DB migration (Critical) — INCOMPLETE

**Current state:** `app/api/children/migrate/route.ts` EXISTS but only creates a new Child record. It does NOT copy game data.

1. Update `app/api/children/migrate/route.ts` to use a Prisma `$transaction`:
   ```typescript
   const result = await prisma.$transaction(async (tx) => {
     // 1. Create new child under parent
     const newChild = await tx.child.create({ data: { parentId, name, age, color } });
     // 2. Copy GameSession rows: UPDATE guestChild sessions → newChild.id
     await tx.gameSession.updateMany({
       where: { childId: guestChildId },
       data: { childId: newChild.id },
     });
     // 3. Copy GameAttempt rows linked to those sessions
     await tx.gameAttempt.updateMany({
       where: { session: { childId: newChild.id } },
       data: {}, // already linked via session
     });
     // 4. Copy ChildSticker rows
     await tx.childSticker.updateMany({
       where: { childId: guestChildId },
       data: { childId: newChild.id },
     });
     // 5. Copy Streak rows
     await tx.streak.updateMany({
       where: { childId: guestChildId },
       data: { childId: newChild.id },
     });
     // 6. Delete guest child record
     await tx.child.delete({ where: { id: guestChildId } });
     return newChild;
   });
   ```
   - Accepts `{ guestId: string }` body
   - Validates parent session from cookie
   - Wraps entire copy-then-delete in a single Prisma `$transaction` to prevent partial migration
   - Returns `{ child: { id, name, age, color } }`
2. In `app/(child)/layout.tsx`, after hydration check:
   - Detect `state.childId?.startsWith('guest_')` AND parent cookie exists
   - Show `<SaveProgressBanner>` — dismissible, re-shows after 3 sessions
   - On tap: open parent auth gate → on success → call `/api/children/migrate`
   - On success: `setChild(newChildId, profile)` → clear guest localStorage

### Task 3A-03: Onboarding redesign (High)

1. In `app/(child)/layout.tsx`, persist onboard step to localStorage:
   ```typescript
   const ONBOARD_KEY = 'bap-onboard-step';
   // On mount: read saved step from localStorage
   // On step change: write to localStorage
   // On completion: remove key
   ```
2. Add language selection persistence (save `lang` to localStorage key `bap-lang`)
3. Skip splash on repeat visits: check `localStorage.getItem('bap-splash-seen')`

### Task 3A-04: Navigation polish (High)

1. Back navigation helper in all child pages:
   ```typescript
   const handleBack = () => {
     window.history.length > 1 ? router.back() : router.push('/worlds');
   };
   ```
2. In `play/.../page.tsx` `handleComplete`: use `router.replace` (not `push`) after game
3. Add `framer-motion` page transition wrapper in `(child)/layout.tsx` (AnimatePresence)

### Task 3A-05: Settings — volume, contrast, motion (Medium)

1. Create `lib/hooks/use-settings.ts`:
   ```typescript
   type AppSettings = {
     volume: number;        // 0-100
     highContrast: boolean;
     reduceMotion: boolean;
     bedtime: { enabled: boolean; hour: number; minute: number };
     breakReminder: { enabled: boolean; intervalMinutes: number };
     gameHints: boolean;
     gameRotation: 'auto' | 'favorites' | 'all';
   };
   ```
   - Read from `localStorage` key `bap-settings`
   - Debounce writes (300ms) via `useMemo(() => debounce(save, 300), [])`
2. Add volume slider to `parent-settings-audio-tab.tsx`
3. Add high-contrast toggle — applies `class="high-contrast"` to `document.documentElement`
4. Add reduce-motion toggle — applies `class="reduce-motion"` to `document.documentElement`

### Task 3A-06: Settings — bedtime, break, hints (Medium)

1. Add bedtime mode to settings tab: time picker (hour/minute), enabled toggle
2. Add break reminder: interval selector (10/15/20/30 min), enabled toggle
3. Add game hints toggle (show/hide hint button in game UI)
4. All persisted via `useSettings` hook

### Task 3A-07: Parent game rotation (Medium)

1. Create `components/screens/parent-settings-gameplay-tab.tsx`
2. Radio group: Auto / Favorites / All Games
3. Persist to `useSettings` → read in game engine to filter available game types

## Todo List

- [x] 3A-01: Fix blank screen — expose `isHydrated`, add guard to all child pages
- [ ] 3A-02: Guest→DB migration endpoint — **INCOMPLETE** (file exists but does NOT copy GameSession, GameAttempt, ChildSticker, Streak)
- [x] 3A-03: Onboarding partial-state persistence + splash skip
- [x] 3A-04: Back navigation helper + `router.replace` after game + page transitions
- [x] 3A-05: `useSettings` hook + volume slider + contrast + reduce-motion — **PARTIAL** (hook exists with localStorage, DB sync missing)
- [x] 3A-06: Bedtime mode + break reminder + game hints toggle
- [x] 3A-07: Parent game rotation control

## Remaining Work

### Gap 3A-R1 (CRITICAL): Incomplete data migration in `app/api/children/migrate/route.ts`

**Current state:** File exists but only creates a new Child record. Does NOT copy GameSession, GameAttempt, ChildSticker, Streak from guest child to new child.

**File:** `app/api/children/migrate/route.ts`

**What to change:**
1. Wrap entire migration in `prisma.$transaction(async (tx) => { ... })`
2. After creating new Child, `updateMany` on GameSession, ChildSticker, Streak to reassign `childId` from guestChildId to newChild.id
3. GameAttempt rows are linked via session FK, so they follow automatically (verify schema)
4. Delete guest child record last, inside the transaction
5. If any step fails, transaction rolls back — no partial data loss

**Acceptance criteria:**
- Guest user's GameSession, GameAttempt, ChildSticker, Streak rows all appear under new parent-linked child after migration
- If migration fails mid-way, no data is lost (transaction rollback)
- API returns 200 with `{ child: { id, name, age, color } }` on success

---

### Gap 3A-R2 (HIGH): Play page guard fires too late

**File:** `app/(child)/play/[gameType]/[lessonId]/page.tsx`

**Current state:** Guard at line ~110 runs AFTER `startSession()` at line ~56. The fallback `childId ?? 'guest'` creates ghost sessions with literal string `'guest'` as childId.

**What to change:**
1. Move the `if (!state.childId) { router.replace('/'); return null; }` guard BEFORE the `useGameSession` hook initialization or before `startSession()` call
2. Remove the `childId ?? 'guest'` fallback — if no childId, redirect instead of creating a session

**Acceptance criteria:**
- Navigating to `/play/hear-tap/ng-01` without a profile redirects to `/` without creating a ghost session
- No DB rows with `childId = 'guest'`

---

### Gap 3A-R3 (HIGH): Prisma `ChildSettings` missing new columns

**File:** `prisma/schema.prisma` — `ChildSettings` model

**Current columns:** dailyMin, difficulty, kidLang, parentLang, sfx, music, voice, voiceStyle, quietHours

**Columns to add:**
```prisma
volume               Int      @default(80)
highContrast         Boolean  @default(false)
reduceMotion         Boolean  @default(false)
bedtimeEnabled       Boolean  @default(false)
bedtimeHour          Int      @default(21)
bedtimeMinute        Int      @default(0)
breakReminderEnabled Boolean  @default(false)
breakReminderIntervalMin Int  @default(20)
gameHints            Boolean  @default(true)
gameRotation         String   @default("auto")
```

**Migration command:** `npx prisma migrate dev --name add-child-settings-app-prefs`

**Acceptance criteria:**
- `npx prisma migrate dev` succeeds without error
- `npx prisma studio` shows new columns on ChildSettings table with correct defaults
- Existing rows gain default values for all new columns

---

### Gap 3A-R4 (HIGH): `use-settings.ts` not synced to DB

**File:** `lib/hooks/use-settings.ts`

**Current state:** Reads/writes ONLY to localStorage key `bap-settings`. No DB interaction.

**What to change:**
1. On mount, after hydration, if `childId` is set (non-guest):
   ```typescript
   useEffect(() => {
     if (!childId || childId.startsWith('guest_')) return;
     fetch(`/api/children/${childId}/settings`)
       .then(res => res.json())
       .then(dbSettings => {
         // merge DB settings over localStorage defaults
         setSettings(prev => ({ ...prev, ...dbSettings }));
       })
       .catch(() => { /* use localStorage fallback silently */ });
   }, [childId]);
   ```
2. On settings update, debounced PATCH to DB:
   ```typescript
   const debouncedSync = useMemo(() => debounce((updated: AppSettings) => {
     if (!childId || childId.startsWith('guest_')) return;
     fetch(`/api/children/${childId}/settings`, {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(updated),
     }).catch(() => { /* silent — localStorage is source of truth for guests */ });
   }, 300), [childId]);
   ```

**Acceptance criteria:**
- Logged-in child: settings load from DB on mount, writes sync to DB on change (debounced 300ms)
- Guest child: settings read/write localStorage only (no API calls)
- Network failure: graceful fallback to localStorage, no error shown to user

---

### Gap 3A-R5 (HIGH): `/api/children/[id]/settings` PATCH whitelist incomplete

**File:** `app/api/children/[id]/settings/route.ts` (or equivalent settings PATCH endpoint)

**Current allowed keys:** `['dailyMin','difficulty','kidLang','parentLang','sfx','music','voice','voiceStyle','quietHours']`

**Keys to add:** `volume`, `highContrast`, `reduceMotion`, `bedtimeEnabled`, `bedtimeHour`, `bedtimeMinute`, `breakReminderEnabled`, `breakReminderIntervalMin`, `gameHints`, `gameRotation`

**What to change:** Add the 10 new keys to the allowed whitelist array. After the Prisma migration (3A-R3), the `prisma.childSettings.update()` call will write them to DB.

**Acceptance criteria:**
- `PATCH /api/children/{id}/settings` with body `{ "volume": 50, "gameRotation": "favorites" }` returns 200 and persists to DB
- Unknown keys are still rejected (whitelist filtering)
- All 19 keys (9 original + 10 new) accepted

---

### Implementation Order for Remaining Gaps

1. **3A-R3** first (Prisma migration) — all other gaps depend on DB columns existing
2. **3A-R5** next (API whitelist) — unblocks DB sync
3. **3A-R4** next (useSettings DB sync) — depends on 3A-R3 + 3A-R5
4. **3A-R1** (migration transaction) — independent, can parallel with 3A-R4/R5
5. **3A-R2** (play page guard) — independent, can parallel with others

## Success Criteria

- No blank screens on any child route when profile is null or context not hydrated
- Guest user sees "Save progress" banner after parent login; migration creates DB child
- Onboarding state survives browser refresh mid-wizard
- Back button works correctly from all screens (no infinite loops)
- Settings changes persist across sessions and apply immediately (high-contrast, volume)
- All new API routes return proper error codes (400, 401, 500)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Guard pattern missed on future pages | Blank screen recurrence | Create shared `useChildGuard()` hook wrapping the pattern |
| Guest migration fails mid-transfer | Data loss | Wrap in transaction; only delete guest data after confirmed copy |
| Onboarding localStorage conflicts with progress cache | State corruption | Use separate keys (`bap-onboard-step` vs `bap-progress-cache`) |

## Security Considerations

- `/api/children/migrate`: validate parent session cookie; prevent migrating another parent's guest
- Settings stored in localStorage only — no sensitive data (no auth tokens)
- Bedtime/break are client-side only — no server enforcement needed for MVP

## Next Steps

- After Phase 1 complete, Phase 2 (AI Content) and Phase 3 (Social) can start in parallel
- `useSettings` hook created here is consumed by Phase 2 (TTS volume) and Phase 3 (email opt-in)

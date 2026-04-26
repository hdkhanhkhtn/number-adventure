# Phase 02 — Guest-to-DB Registration

## Context Links

- [Parent plan](./plan.md)
- [Scout report](../reports/scouts/SCOUT-phase2-remaining.md) — section 1 (Onboarding Route Gap)
- Child layout: `app/(child)/layout.tsx` (line 32: `guest_<UUID>` comment)
- Children API: `app/api/children/route.ts` (`POST /api/children`)
- Game session hook: `lib/hooks/use-game-session.ts` (line 38: guest guard)
- Progress context: `context/game-progress-context.tsx`

## Overview

- **Priority**: P0
- **Status**: pending
- **Description**: Complete the registration path so that when a parent-authenticated user creates a child profile via ProfileSetup, the child is persisted to the database (not just localStorage). Existing `guest_<UUID>` users who later authenticate should also be migrated.

## Key Insights

- `handleProfileDone` in `app/(child)/layout.tsx` currently generates `guest_<UUID>` and stores in context/localStorage only
- `POST /api/children` already exists and works — requires `parentId` cookie
- `useGameSession` already skips DB calls when `childId.startsWith('guest_')` — once real ID is set, sessions auto-wire
- The registration path only activates when a `parentId` cookie is present (parent logged in). Guest users without parent auth continue to use localStorage (graceful degradation)
- `setChild(childId, profile)` in `game-progress-context.tsx` updates both context state and localStorage

## Requirements

### Functional
- FR1: When `parentId` cookie exists during ProfileSetup submit, POST to `/api/children` with `{ name, age, color }` and store the returned DB `childId` (not guest UUID)
- FR2: When `parentId` cookie is absent, fall back to current `guest_<UUID>` behavior (no regression)
- FR3: After DB registration, `useGameSession` should automatically create real sessions (guest guard passes)
- FR4: Existing guest users who later log in as parent should be prompted to re-register child (or auto-migrate)

### Non-Functional
- NFR1: No flash or layout shift during registration API call
- NFR2: Registration failure falls back to guest mode with console warning (never blocks onboarding)

## Architecture

```
ProfileSetup.onDone
  → ChildLayout.handleProfileDone(profile)
    → check: parentId cookie present?
      YES → POST /api/children { name, age, color }
           → on success: setChild(response.child.id, profile)
           → on failure: fallback to guest_<UUID>, log warning
      NO  → setChild(guest_<UUID>, profile)  [existing behavior]
```

## Related Code Files

### MODIFY
- `app/(child)/layout.tsx` — update `handleProfileDone` to POST to `/api/children` when parentId cookie exists

### NO CHANGE
- `app/api/children/route.ts` — already handles POST correctly
- `context/game-progress-context.tsx` — `setChild` already works with any string ID
- `lib/hooks/use-game-session.ts` — guest guard already works; real childId auto-enables DB sessions

## Implementation Steps

### Step 1: Update `handleProfileDone` in `app/(child)/layout.tsx`

Replace the synchronous guest-only path with an async function that attempts DB registration:

```typescript
const handleProfileDone = async (profile: { name: string; age: number; color: MascotColor }) => {
  // Attempt DB registration if parent is authenticated
  try {
    const res = await fetch('/api/children', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: profile.name, age: profile.age, color: profile.color }),
      credentials: 'include', // sends parentId cookie
    });
    if (res.status === 201) {
      const { child } = await res.json();
      setChild(child.id, { id: child.id, ...profile });
      setStep('ready');
      return;
    }
    // 401 = no parent session → expected for guest flow; fall through
  } catch {
    console.warn('[onboarding] DB registration failed, using guest mode');
  }

  // Fallback: guest mode (no parent auth or API failure)
  const guestId = `guest_${crypto.randomUUID()}`;
  setChild(guestId, { id: guestId, ...profile });
  setStep('ready');
};
```

### Step 2: Handle async state in ProfileSetup callback

The `ProfileSetup` component calls `onDone` synchronously. Since `handleProfileDone` is now async, wrap the call site:
- `ProfileSetup` already accepts `onDone: (profile) => void` — the async function is compatible (returns void implicitly)
- Add a loading state to prevent double-submit during the API call

In `app/(child)/layout.tsx`, add `const [registering, setRegistering] = useState(false)` and wrap:

```typescript
const handleProfileDone = async (profile: ...) => {
  if (registering) return;
  setRegistering(true);
  try { /* ...existing logic from Step 1... */ }
  finally { setRegistering(false); }
};
```

Pass `registering` to ProfileSetup if a loading indicator is desired (optional — the API call is fast).

### Step 3: Verify guest-to-DB migration edge case

For existing `guest_<UUID>` users who later log in as parent:
- They already have a `childId` in localStorage starting with `guest_`
- On next app load, `state.childId` is truthy → onboarding skipped
- Sessions continue to skip DB (guest guard in `useGameSession`)
- **Simple solution**: In `layout.tsx`, after hydration, if `state.childId?.startsWith('guest_')` AND a `parentId` cookie exists, show a "Save your progress" prompt that re-runs registration
- **Phase 2D scope**: Add a TODO comment for this migration prompt; the auto-registration on ProfileSetup handles new users. Full migration UX deferred to Phase 2E.

## Todo List

- [ ] Update `handleProfileDone` in `app/(child)/layout.tsx` to attempt POST `/api/children`
- [ ] Add `registering` loading state to prevent double-submit
- [ ] Verify fallback to guest mode when no parentId cookie
- [ ] Verify fallback to guest mode when API returns error
- [ ] Test: parent-authenticated user creates child → real DB `childId` stored
- [ ] Test: guest user (no parent) creates child → `guest_<UUID>` stored (no regression)
- [ ] Test: after DB registration, game sessions create real DB rows
- [ ] Add TODO comment for guest-to-DB migration prompt (Phase 2E)

## Success Criteria

1. Parent-authenticated user completing ProfileSetup gets a real DB `childId` (not `guest_*`)
2. `useGameSession` creates real DB sessions for DB-registered children
3. Guest users without parent auth continue to work (no regression)
4. API failure during registration falls back to guest mode gracefully
5. No double-submit possible during registration

## Risk Assessment

- **Race condition**: Parent logs in after child profile already created as guest. Handled by deferring migration prompt to Phase 2E; new users always get DB registration.
- **API latency**: `/api/children` POST adds ~100-200ms to onboarding. Acceptable; add loading state.
- **Cookie availability**: `credentials: 'include'` sends httpOnly cookies. `parentId` cookie has `path: '/'` so it's available on all routes.

## Security Considerations

- `POST /api/children` requires `parentId` cookie (server-validated) — no IDOR risk
- Guest fallback does not expose any parent data
- Child profile data (name, age, color) is non-sensitive

## Next Steps

- Phase 2E: Guest-to-DB migration prompt for existing guest users who later log in
- Phase 3: Remove guest mode entirely once auth flow is mandatory

# Research: First Day Intro & Parent Onboarding — Phase 2E

Date: 2026-04-26 | Researcher: researcher subagent

---

## Findings

### A: First Day Intro (World Intro) Overlay

**Existing state machine** (`app/(child)/layout.tsx`):
- `OnboardStep = 'splash' | 'welcome' | 'setup' | 'ready'`
- `setStep('ready')` → renders `{children}` (worlds page and everything else)
- Already skips onboarding if `state.childId` exists (hydration guard, line 25-26)
- `state.childId` is the single gating signal — stored in localStorage via `game-progress-context`

**Option analysis:**

| Option | Pros | Cons |
|--------|------|------|
| Add `'world-intro'` step to layout state machine | Consistent with existing pattern; layout already controls gate | Layout is child-wide; world intro is worlds-screen-specific |
| Trigger overlay on worlds page (localStorage flag) | Scoped to where it makes sense; zero layout change | Needs own hydration guard; slightly more code |
| Separate route `/intro` | Cleanest URL | Overkill; breaks back-button expectations for kids |

**Recommendation: Option 2 — overlay on worlds page, localStorage-gated**

Rationale:
- World intro explains the world map → belongs on the world map page
- The layout's `ready` step already handles auth/profile. World intro is content orientation, not auth.
- Pattern already established: `ios-install-prompt.tsx` uses `localStorage.getItem(STORAGE_KEY)` to show once
- Hydration pattern: read flag inside `useEffect` (same as `theme-context.tsx` line 19-21) to avoid SSR mismatch

**Implementation sketch:**
- File to modify: `app/(child)/worlds/page.tsx`
- Add `useState<boolean>(false)` for `showWorldIntro`
- In `useEffect`, after hydration: `if (!localStorage.getItem('bap-world-intro-seen')) setShowWorldIntro(true)`
- On dismiss: `localStorage.setItem('bap-world-intro-seen', 'true'); setShowWorldIntro(false)`
- New component: `components/screens/world-intro-overlay.tsx` (fullscreen animated overlay, `position: fixed`)
- No change to `app/(child)/layout.tsx` or `OnboardStep` enum

---

### B: Parent Onboarding First-Run Flow

**Existing parent flow:**
- Parent gate → `app/(parent)/dashboard/page.tsx` → renders `<ParentDashboardContent />`
- `ParentDashboardContent` immediately loads metrics; no empty-state or onboarding check
- No localStorage flag for `bap-parent-onboarded` anywhere in codebase
- `report` state starts as `null`; guest users (childId starts with `guest_`) skip the API fetch entirely

**Phase 2D "empty state" overlap:**
- Phase 2D adds an empty state when `report === null` and user is guest — informational placeholder
- Phase 2E "Parent Onboarding" is a distinct, one-time welcome flow that sets expectations (what the dashboard shows, how to interpret metrics, CTA to start playing)
- They are complementary: empty state = ongoing state when no data; onboarding overlay = first-run orientation

**Option analysis:**

| Option | Pros | Cons |
|--------|------|------|
| Modal/overlay on first dashboard load (localStorage flag) | No route change; consistent with world-intro approach; can co-exist with empty state | Must coordinate render order with empty state |
| Wizard route `/parent/onboarding` | Cleanest separation | Adds route; complicates redirect logic from parent gate |
| Inline empty-state doubles as onboarding | Zero extra code | Conflates two different UX moments |

**Recommendation: Option 1 — modal overlay in `ParentDashboardContent`, localStorage-gated**

Rationale:
- Matches world-intro pattern (consistent approach across both screens)
- `ParentDashboardContent` already has `useEffect` → easy insertion point
- localStorage key: `bap-parent-onboarded`
- Check: `if (!localStorage.getItem('bap-parent-onboarded')) setShowOnboarding(true)`
- Does NOT conflict with Phase 2D empty state: onboarding renders first/on top; after dismiss, empty state is visible beneath
- Render order: `showOnboarding` overlay → dismiss → normal dashboard with potential empty state

**Implementation sketch:**
- File to modify: `components/screens/parent-dashboard-content.tsx`
- Add `showOnboarding` state, check localStorage in `useEffect`
- New component: `components/screens/parent-onboarding-overlay.tsx`
- On dismiss: `localStorage.setItem('bap-parent-onboarded', 'true'); setShowOnboarding(false)`

---

## Summary

| Screen | Approach | New Files | Modified Files |
|--------|----------|-----------|----------------|
| World Intro | Overlay on worlds page, localStorage `bap-world-intro-seen` | `world-intro-overlay.tsx` | `app/(child)/worlds/page.tsx` |
| Parent Onboarding | Overlay in dashboard content, localStorage `bap-parent-onboarded` | `parent-onboarding-overlay.tsx` | `components/screens/parent-dashboard-content.tsx` |

Both use the same localStorage-gated `useEffect` pattern established by `ios-install-prompt.tsx`.
Neither requires route changes or state machine modifications.

---

## Unresolved Questions

1. Does world intro need a skip button, or auto-dismiss after animation? (design file not checked)
2. Should `bap-parent-onboarded` be reset when profile changes (e.g., new child setup)? Not critical for Phase 2E.
3. Phase 2D empty state render timing — does it render before or after the API call resolves? Need to confirm `parent-dashboard-content.tsx` empty state implementation when Phase 2D lands to ensure no z-index conflicts.

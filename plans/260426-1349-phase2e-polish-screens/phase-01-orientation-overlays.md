# Phase 01 — Orientation Overlays (First Day Intro + Parent Onboarding)

## Context Links

- [Parent plan](./plan.md)
- [Intro/Onboarding Research](./research/researcher-intro-onboarding.md)
- localStorage pattern reference: `components/pwa/ios-install-prompt.tsx` (lines 22-30)
- Worlds page: `app/(child)/worlds/page.tsx` (76 lines)
- Dashboard content: `components/screens/parent-dashboard-content.tsx` (133 lines)
- BapMascot moods: `'happy' | 'wink' | 'think' | 'sleep' | 'celebrate'` (from `lib/types/common.ts`)

## Overview

- **Priority**: P2
- **Status**: pending
- **Description**: Two one-time orientation overlays — (A) World Intro for first-time child players on the worlds page, (B) Parent Onboarding welcome flow on the parent dashboard. Both use the same localStorage-gated `useEffect` pattern from `ios-install-prompt.tsx`.

## Key Insights

- The child layout's `OnboardStep` state machine (`splash -> welcome -> setup -> ready`) handles auth/profile gating. World intro is content orientation, not auth — belongs on the worlds page, not in layout.
- Parent onboarding overlay renders above any Phase 2D empty state (z-index coordination: overlay z-50 vs empty state z-0).
- Hydration safety: read localStorage inside `useEffect` only (same pattern as `theme-context.tsx`, `ios-install-prompt.tsx`).

## Requirements

### Functional — World Intro Overlay
- FR1: On first visit to worlds page (no `bap-world-intro-seen` in localStorage), show fullscreen overlay
- FR2: Overlay content: BapMascot (`celebrate`), "Welcome to the World Map!" heading, brief copy explaining worlds/lessons, "Let's Go!" dismiss button
- FR3: On dismiss: set `localStorage.setItem('bap-world-intro-seen', 'true')`, hide overlay
- FR4: Subsequent visits skip overlay entirely

### Functional — Parent Onboarding Overlay
- FR5: On first visit to parent dashboard (no `bap-parent-onboarded` in localStorage), show fullscreen overlay
- FR6: Overlay content: BapMascot, "Welcome, Parent!" heading, 2-3 bullet points about dashboard features, "Got it" dismiss button
- FR7: On dismiss: set `localStorage.setItem('bap-parent-onboarded', 'true')`, hide overlay
- FR8: Overlay renders at z-50, above any Phase 2D empty state beneath

### Non-Functional
- NFR1: Both overlays use `useState` + fixed div pattern (no portal, no context provider)
- NFR2: Smooth fade-in via CSS `animation: fade-in 0.3s ease-out`
- NFR3: No new npm packages

## Architecture

```
World Intro:
  worlds/page.tsx mount
  -> useEffect: if !localStorage('bap-world-intro-seen') -> setShowWorldIntro(true)
  -> render <WorldIntroOverlay onDismiss={...} />
  -> onDismiss: localStorage.set + setState(false)

Parent Onboarding:
  ParentDashboardContent mount
  -> useEffect: if !localStorage('bap-parent-onboarded') -> setShowOnboarding(true)
  -> render <ParentOnboardingOverlay onDismiss={...} />
  -> onDismiss: localStorage.set + setState(false)
```

## Related Code Files

### CREATE
- `components/screens/world-intro-overlay.tsx` — fullscreen overlay for world map orientation
- `components/screens/parent-onboarding-overlay.tsx` — fullscreen overlay for parent dashboard welcome

### MODIFY
- `app/(child)/worlds/page.tsx` — add localStorage check + render overlay (add ~12 lines)
- `components/screens/parent-dashboard-content.tsx` — add localStorage check + render overlay (add ~12 lines)

## Implementation Steps

### Step 1: Create `components/screens/world-intro-overlay.tsx`

Props: `onDismiss: () => void`

```tsx
'use client';

import { BapMascot } from '@/components/ui/bap-mascot';
import { BigButton } from '@/components/ui/big-button';
import { Sparkles } from '@/components/ui/sparkles';

interface WorldIntroOverlayProps {
  onDismiss: () => void;
}

export function WorldIntroOverlay({ onDismiss }: WorldIntroOverlayProps) {
  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fade-in 0.3s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFF8EC', borderRadius: 28, padding: '32px 24px',
          maxWidth: 320, width: '85%', textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          border: '3px solid #2D3A2E',
          animation: 'pop-in 0.4s ease-out',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <Sparkles count={8} color="#FFB84A" />
        <div className="bobble" style={{ marginBottom: 12 }}>
          <BapMascot size={100} mood="celebrate" />
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#2D3A2E', marginBottom: 8 }}>
          Welcome to the World Map!
        </div>
        <div style={{ fontSize: 14, color: '#6B7A6C', lineHeight: 1.5, marginBottom: 20 }}>
          Each world has fun number lessons. Complete lessons to earn stars and unlock new worlds!
        </div>
        <BigButton color="sage" size="lg" onClick={onDismiss}>
          Let&apos;s Go!
        </BigButton>
      </div>
    </div>
  );
}
```

Target: ~50 lines.

### Step 2: Wire world intro in `app/(child)/worlds/page.tsx`

Add import + state + useEffect + conditional render:

```tsx
// Add import at top:
import { WorldIntroOverlay } from '@/components/screens/world-intro-overlay';

// Inside WorldsPage component, after existing useState lines:
const [showWorldIntro, setShowWorldIntro] = useState(false);

// Add new useEffect after existing useEffect:
useEffect(() => {
  if (!localStorage.getItem('bap-world-intro-seen')) {
    setShowWorldIntro(true);
  }
}, []);

// Add handler:
const dismissWorldIntro = () => {
  localStorage.setItem('bap-world-intro-seen', 'true');
  setShowWorldIntro(false);
};

// Add before closing </div> of the return JSX:
{showWorldIntro && <WorldIntroOverlay onDismiss={dismissWorldIntro} />}
```

### Step 3: Create `components/screens/parent-onboarding-overlay.tsx`

Props: `onDismiss: () => void`

Same structural pattern as world-intro-overlay but with parent-themed content:
- Heading: "Chao mung Cha Me!" (Vietnamese)
- Bullet points explaining dashboard sections (metrics, activity chart, skills, settings)
- "Da hieu!" dismiss button
- Uses `BapMascot size={80} mood="happy"` (parent context = calmer mood)
- Background: white (#fff) with parent font styling (`fontFamily: 'var(--font-parent)'`)

Target: ~55 lines.

### Step 4: Wire parent onboarding in `components/screens/parent-dashboard-content.tsx`

Add import + state + useEffect + conditional render:

```tsx
// Add import:
import { ParentOnboardingOverlay } from '@/components/screens/parent-onboarding-overlay';

// Inside ParentDashboardContent, after existing useState:
const [showOnboarding, setShowOnboarding] = useState(false);

// Add new useEffect (separate from the fetch useEffect):
useEffect(() => {
  if (!localStorage.getItem('bap-parent-onboarded')) {
    setShowOnboarding(true);
  }
}, []);

// Add handler:
const dismissOnboarding = () => {
  localStorage.setItem('bap-parent-onboarded', 'true');
  setShowOnboarding(false);
};

// Add at end of return JSX, before closing </div>:
{showOnboarding && <ParentOnboardingOverlay onDismiss={dismissOnboarding} />}
```

## Todo List

- [ ] Create `components/screens/world-intro-overlay.tsx`
- [ ] Modify `app/(child)/worlds/page.tsx` — add localStorage check + render overlay
- [ ] Create `components/screens/parent-onboarding-overlay.tsx`
- [ ] Modify `components/screens/parent-dashboard-content.tsx` — add localStorage check + render overlay
- [ ] Verify: first visit to worlds page shows world intro overlay
- [ ] Verify: dismissing overlay sets localStorage; refresh does not re-show
- [ ] Verify: first visit to parent dashboard shows onboarding overlay
- [ ] Verify: overlay renders above any Phase 2D empty state (z-50)
- [ ] Run `npx next build` — no compile errors

## Success Criteria

1. First-time child user sees world intro overlay on worlds page; subsequent visits skip it
2. First-time parent sees onboarding overlay on dashboard; subsequent visits skip it
3. Both overlays dismiss on button tap; world intro also dismisses on backdrop tap
4. No hydration mismatch (localStorage read inside `useEffect` only)
5. Both files under 60 lines; modified files stay under 200 lines

## Risk Assessment

- **localStorage cleared**: User sees intro again. Acceptable — it is a one-time orientation, not harmful to re-show.
- **Phase 2D empty state z-index conflict**: Parent onboarding overlay at z-50 renders above any z-0 empty state. No conflict if Phase 2D uses z-0 or no z-index for empty state.

## Security Considerations

- No sensitive data in localStorage flags (only boolean markers: `'true'`)
- No API calls in overlay components
- No user input collected

## Next Steps

- Phase 02 (Sticker Screens) can run in parallel — no shared files
- Phase 04 (Offline State) can run in parallel — no shared files

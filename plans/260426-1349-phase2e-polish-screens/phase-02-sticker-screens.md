# Phase 02 — Sticker Screens (Earn Moment + Detail Sheet)

## Context Links

- [Parent plan](./plan.md)
- [Screen Detail Research](./research/researcher-screens-detail.md) — sections A & B
- Reward content: `components/screens/reward-content.tsx` (93 lines)
- Stickers page: `app/(child)/stickers/page.tsx` (74 lines)
- Confetti: `components/ui/confetti.tsx` — `ConfettiProps { count?: number }`
- BapMascot moods: `'happy' | 'wink' | 'think' | 'sleep' | 'celebrate'` (from `lib/types/common.ts`)
- Reward page: `app/(child)/reward/page.tsx` — passes `sticker` prop from `sessionStorage('lastGameResult')`

## Overview

- **Priority**: P2
- **Status**: pending
- **Description**: Two sticker-domain screens — (A) Sticker Earn Moment overlay on the reward page when a new sticker is unlocked, (B) Sticker Detail bottom-sheet on the sticker book page when tapping an earned sticker.

## Key Insights

- `RewardContent` already renders a static purple banner for new stickers (lines 65-79). The earn moment overlay adds a fullscreen celebratory layer on top, triggered with an 800ms delay after mount (post-star animation).
- Sticker earn moment is local state — dismissed state lives in component, not localStorage. It shows once per session result (sticker data comes from `sessionStorage`).
- Sticker detail uses a bottom-sheet pattern (not a route) — consistent with streak detail in Phase 03.
- `StickerEntry` interface already defined in `app/(child)/stickers/page.tsx` lines 10-15.

## Requirements

### Functional — Sticker Earn Moment
- FR1: When `RewardContent` receives a truthy `sticker` prop, show fullscreen celebration overlay 800ms after mount
- FR2: Overlay content: `Confetti count={30}`, `BapMascot mood="celebrate"`, large sticker emoji (80px), sticker name, "NEW STICKER!" label
- FR3: Tap anywhere on overlay to dismiss (sets local `stickerMomentDone` state)
- FR4: After dismiss, the existing inline sticker banner in `RewardContent` remains visible

### Functional — Sticker Detail Sheet
- FR5: Tapping an earned sticker in the sticker grid opens a bottom-sheet detail view
- FR6: Sheet content: large emoji (80px), sticker name, "Earned!" badge with green background
- FR7: Tapping locked stickers does nothing (no sheet, no error)
- FR8: Dismiss sheet by tapping backdrop or close button
- FR9: Sheet slides up from bottom with CSS transition (`transform: translateY`)

### Non-Functional
- NFR1: Earn moment overlay uses `position: fixed; z-index: 50` — same pattern as all overlays
- NFR2: Sticker detail sheet: fixed bottom panel, max-height 40vh, border-radius top corners
- NFR3: No new npm packages
- NFR4: `reward-content.tsx` stays under 130 lines; `stickers/page.tsx` stays under 150 lines

## Architecture

```
Sticker Earn Moment:
  RewardContent mount
  -> if sticker prop truthy: setTimeout(800ms) -> setStickerMoment(true)
  -> render <StickerEarnOverlay emoji={sticker.emoji} name={sticker.name} onDismiss={...} />
  -> onDismiss: setStickerMomentDone(true), hide overlay

Sticker Detail Sheet:
  StickersPage
  -> add selectedSticker state (StickerEntry | null)
  -> grid item onClick: if earned -> setSelectedSticker(s)
  -> render <StickerDetailSheet sticker={selectedSticker} onClose={...} />
  -> onClose: setSelectedSticker(null)
```

## Related Code Files

### CREATE
- `components/screens/sticker-earn-overlay.tsx` — fullscreen celebration when new sticker earned
- `components/ui/sticker-detail-sheet.tsx` — bottom-sheet detail for sticker book

### MODIFY
- `components/screens/reward-content.tsx` — add 800ms delayed overlay trigger + render (add ~15 lines)
- `app/(child)/stickers/page.tsx` — add selectedSticker state + onClick + render sheet (add ~20 lines)

## Implementation Steps

### Step 1: Create `components/screens/sticker-earn-overlay.tsx`

Props: `emoji: string`, `name: string`, `onDismiss: () => void`

```tsx
'use client';

import { Confetti } from '@/components/ui/confetti';
import { BapMascot } from '@/components/ui/bap-mascot';
import { Sparkles } from '@/components/ui/sparkles';

interface StickerEarnOverlayProps {
  emoji: string;
  name: string;
  onDismiss: () => void;
}

export function StickerEarnOverlay({ emoji, name, onDismiss }: StickerEarnOverlayProps) {
  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(93, 63, 148, 0.7)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        animation: 'fade-in 0.3s ease-out',
      }}
    >
      <Confetti count={30} />
      <Sparkles count={10} color="#FFB84A" />
      <div className="bobble" style={{ marginBottom: 16 }}>
        <BapMascot size={90} mood="celebrate" />
      </div>
      <div style={{
        fontSize: 80, animation: 'pop-in 0.5s ease-out',
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
      }}>
        {emoji}
      </div>
      <div style={{
        marginTop: 12, fontSize: 13, fontWeight: 700,
        color: '#FFE6A8', letterSpacing: 1,
      }}>
        NEW STICKER!
      </div>
      <div style={{
        marginTop: 4, fontSize: 22, fontWeight: 700,
        color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }}>
        {name}
      </div>
      <div style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
        Tap anywhere to continue
      </div>
    </div>
  );
}
```

Target: ~55 lines.

### Step 2: Wire sticker earn moment in `components/screens/reward-content.tsx`

Add import, state, useEffect for delayed trigger, and conditional render:

```tsx
// Add import at top:
import { StickerEarnOverlay } from '@/components/screens/sticker-earn-overlay';

// Inside RewardContent component, before the return:
const [stickerMomentDone, setStickerMomentDone] = useState(false);
const [showStickerMoment, setShowStickerMoment] = useState(false);

useEffect(() => {
  if (!sticker || stickerMomentDone) return;
  const timer = setTimeout(() => setShowStickerMoment(true), 800);
  return () => clearTimeout(timer);
}, [sticker, stickerMomentDone]);

// Add before closing </div> of the return JSX (after the BigButton div):
{showStickerMoment && sticker && (
  <StickerEarnOverlay
    emoji={sticker.emoji}
    name={sticker.name}
    onDismiss={() => { setStickerMomentDone(true); setShowStickerMoment(false); }}
  />
)}
```

This adds ~15 lines. File grows from 93 to ~108 lines.

### Step 3: Create `components/ui/sticker-detail-sheet.tsx`

Props: `sticker: { emoji: string; name: string } | null`, `onClose: () => void`

```tsx
'use client';

interface StickerDetailSheetProps {
  sticker: { emoji: string; name: string } | null;
  onClose: () => void;
}

export function StickerDetailSheet({ sticker, onClose }: StickerDetailSheetProps) {
  if (!sticker) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'flex-end',
        animation: 'fade-in 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', background: '#FFF8EC',
          borderRadius: '24px 24px 0 0', padding: '28px 24px 36px',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
          animation: 'slide-up 0.3s ease-out',
          textAlign: 'center',
        }}
      >
        <div style={{
          width: 40, height: 4, borderRadius: 2, background: 'rgba(46,90,58,0.2)',
          margin: '0 auto 20px',
        }} />
        <div style={{
          fontSize: 80, marginBottom: 12,
          animation: 'pop-in 0.4s ease-out',
        }}>
          {sticker.emoji}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#2D3A2E', marginBottom: 8 }}>
          {sticker.name}
        </div>
        <div style={{
          display: 'inline-block', padding: '6px 16px', borderRadius: 999,
          background: '#EDF7EC', fontSize: 13, fontWeight: 700, color: '#2F6A3C',
        }}>
          Earned!
        </div>
      </div>
    </div>
  );
}
```

Target: ~55 lines. Add `@keyframes slide-up` in the component or rely on global CSS if `slide-up` already exists. If not, add inline style with `@keyframes` via a `<style>` tag or use `transform` with transition. Simplest: use `animation` with a CSS keyframe. Check if `slide-up` exists in global CSS; if not, replace with inline `transform: translateY(0)` from initial `translateY(100%)` using a React state transition pattern.

### Step 4: Wire sticker detail in `app/(child)/stickers/page.tsx`

Add import, state, onClick handler, and sheet render:

```tsx
// Add import at top:
import { StickerDetailSheet } from '@/components/ui/sticker-detail-sheet';

// Inside StickersPage, after existing useState lines:
const [selectedSticker, setSelectedSticker] = useState<StickerEntry | null>(null);

// Modify the grid item div — add onClick:
// Change: <div key={s.id} style={{...}}>
// To:     <div key={s.id} onClick={() => s.earned && setSelectedSticker(s)} style={{..., cursor: s.earned ? 'pointer' : 'default'}}>

// Add before closing </div> of the return JSX:
<StickerDetailSheet
  sticker={selectedSticker ? { emoji: selectedSticker.emoji, name: selectedSticker.name } : null}
  onClose={() => setSelectedSticker(null)}
/>
```

This adds ~10 lines. File grows from 74 to ~85 lines.

## Todo List

- [ ] Create `components/screens/sticker-earn-overlay.tsx`
- [ ] Modify `components/screens/reward-content.tsx` — add delayed overlay trigger
- [ ] Create `components/ui/sticker-detail-sheet.tsx`
- [ ] Modify `app/(child)/stickers/page.tsx` — add selectedSticker + onClick + sheet
- [ ] Verify: earning a sticker shows celebration overlay 800ms after reward mount
- [ ] Verify: tapping overlay dismisses it; inline sticker banner still visible
- [ ] Verify: tapping earned sticker in sticker book opens detail sheet
- [ ] Verify: tapping locked sticker does nothing
- [ ] Verify: tapping backdrop closes sticker detail sheet
- [ ] Run `npx next build` — no compile errors

## Success Criteria

1. New sticker earned -> reward page shows celebration overlay after 800ms delay
2. Overlay shows confetti + mascot + large emoji + sticker name
3. Tap anywhere dismisses overlay; inline purple banner remains
4. Sticker book: tap earned sticker -> bottom sheet slides up with large emoji + name + "Earned!" badge
5. Tap backdrop or drag handle area closes sheet
6. Locked stickers are not tappable
7. All modified files stay under 200 lines

## Risk Assessment

- **Animation keyframe availability**: `pop-in` and `fade-in` already used in codebase. `slide-up` may not exist globally. Mitigation: define inline or verify in global CSS before implementing. Fallback: use Framer Motion `AnimatePresence` if already imported in the target file.
- **Sticker prop timing**: `sticker` arrives from `sessionStorage` parsed in `reward/page.tsx`. If sessionStorage is empty (direct URL access), no sticker prop = no overlay. This is correct behavior.

## Security Considerations

- No sensitive data exposed — sticker emoji and name are display-only
- No API calls in overlay or sheet components
- No localStorage writes (earn moment is session-scoped local state)

## Next Steps

- Phase 03 (Session & Streak) is independent — can run in parallel
- Phase 04 (Offline) is independent — can run in parallel

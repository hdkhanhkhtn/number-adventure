# Phase 04 — Offline State (PWA Fallback + useOnline Hook)

## Context Links

- [Parent plan](./plan.md)
- [Screen Detail Research](./research/researcher-screens-detail.md) — section D
- Service worker: `app/sw.ts` (68 lines) — serwist config, no `fallbacks` set
- Next config: `next.config.ts` (41 lines) — `withSerwistInit` without `fallbacks`
- PWA install prompt pattern: `components/pwa/ios-install-prompt.tsx`
- Existing hooks: `lib/hooks/use-audio.ts`, `use-game.ts`, `use-game-session.ts`, `use-sound-effects.ts`

## Overview

- **Priority**: P2
- **Status**: pending
- **Description**: Two-tier offline handling — (A) a static `/offline` page served by the service worker when navigation fails offline, (B) a `useOnline` hook + toast banner for in-app network status feedback. Gameplay works offline (audio cached, questions generated client-side); only API sync (progress save, sticker fetch) fails.

## Key Insights

- serwist's `withSerwistInit` accepts `fallbacks: { document: '/offline' }` — the SW automatically serves this page when a navigation request fails offline. The page must be precached.
- `navigator.onLine` + `online`/`offline` events provide real-time network status. The hook wraps these into a reactive boolean.
- The offline toast should be non-blocking — a small banner at the top, not a fullscreen blocker. Gameplay is fully offline-capable.
- The `/offline` route is only reached when the user navigates to a NEW page while offline and that page is not cached. Cached pages (all visited pages) still work.

## Requirements

### Functional — Offline Fallback Page
- FR1: Create `app/offline/page.tsx` — static page with BapMascot, "No connection" message, retry button
- FR2: Configure serwist to serve this page as navigation fallback: `fallbacks: { document: '/offline' }` in `next.config.ts`
- FR3: Retry button calls `window.location.reload()` — if online, normal navigation resumes
- FR4: Page must work without JS hydration (static content, inline styles) — SW serves it as raw HTML

### Functional — useOnline Hook
- FR5: Create `lib/hooks/use-online.ts` — returns `{ isOnline: boolean }`
- FR6: Hook listens to `window.addEventListener('online')` and `window.addEventListener('offline')`
- FR7: Initial value from `navigator.onLine` (read in `useEffect` to avoid SSR mismatch)
- FR8: Cleanup removes event listeners on unmount

### Functional — Offline Toast Banner
- FR9: Create `components/ui/offline-toast.tsx` — thin banner shown when `isOnline === false`
- FR10: Banner text: "You're offline — progress will sync when connected"
- FR11: Banner renders at top of viewport, fixed position, z-40 (below overlays at z-50)
- FR12: Auto-hides when connection returns (reactive via `useOnline`)

### Non-Functional
- NFR1: Offline page under 50 lines — minimal, static, no heavy components
- NFR2: `useOnline` hook under 30 lines
- NFR3: Toast banner under 40 lines
- NFR4: No new npm packages
- NFR5: Offline page uses inline styles only (no Tailwind classes that might not be precached)

## Architecture

```
Tier 1 — PWA Navigation Fallback:
  User navigates to uncached page while offline
  -> SW intercepts navigation request
  -> Network fetch fails
  -> SW serves /offline page from precache
  -> User sees BapMascot + "No connection" + retry button

Tier 2 — In-App Toast Banner:
  App is loaded (cached pages work offline)
  -> useOnline hook detects network loss via browser events
  -> OfflineToast renders fixed banner at top
  -> When network returns, banner auto-hides
  -> Progress sync resumes silently (existing API calls retry)
```

## Related Code Files

### CREATE
- `app/offline/page.tsx` — static offline fallback page
- `lib/hooks/use-online.ts` — reactive online/offline status hook
- `components/ui/offline-toast.tsx` — non-blocking offline banner

### MODIFY
- `next.config.ts` — add `fallbacks: { document: '/offline' }` to `withSerwistInit` options
- `app/(child)/layout.tsx` — render `<OfflineToast />` in child layout (visible across all child pages)

## Implementation Steps

### Step 1: Create `app/offline/page.tsx`

Static page — no data fetching, no context, minimal imports. Uses inline styles to guarantee rendering even without CSS cache.

```tsx
export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#F5F3ED', fontFamily: 'system-ui, sans-serif',
      padding: '24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 80, marginBottom: 16 }}>🌽</div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2D3A2E', marginBottom: 8 }}>
        No Connection
      </h1>
      <p style={{ fontSize: 15, color: '#6B7A6C', lineHeight: 1.5, maxWidth: 280, marginBottom: 24 }}>
        Bap needs the internet to load new pages. Check your connection and try again!
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '14px 32px', borderRadius: 16, fontSize: 16, fontWeight: 700,
          background: '#2E5A3A', color: '#fff', border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 0 #1B3A24',
        }}
      >
        Try Again
      </button>
      <p style={{ marginTop: 32, fontSize: 12, color: '#9AA69A' }}>
        Your progress is saved locally and will sync when you reconnect.
      </p>
    </div>
  );
}
```

Target: ~35 lines. Note: the `onClick` handler requires client-side JS. Add a `<noscript>` fallback or accept that the button only works after hydration. For PWA users, JS is always available (SW serves cached JS bundles). No `'use client'` directive needed if we use an inline `onClick` — actually, `onClick` requires client component. Add `'use client'` at the top.

Correction: Add `'use client';` as line 1.

### Step 2: Create `lib/hooks/use-online.ts`

```tsx
'use client';

import { useState, useEffect } from 'react';

/** Reactive hook for browser online/offline status */
export function useOnline(): { isOnline: boolean } {
  const [isOnline, setIsOnline] = useState(true); // SSR-safe default

  useEffect(() => {
    // Read actual status after hydration
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}
```

Target: 25 lines.

### Step 3: Create `components/ui/offline-toast.tsx`

```tsx
'use client';

import { useOnline } from '@/lib/hooks/use-online';

/** Non-blocking banner shown when device goes offline */
export function OfflineToast() {
  const { isOnline } = useOnline();

  if (isOnline) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
      padding: '6px 16px',
      background: '#FFF3E0',
      borderBottom: '1px solid #FFB74D',
      textAlign: 'center',
      fontSize: 12, fontWeight: 600, color: '#E65100',
      animation: 'fade-in 0.3s ease-out',
    }}>
      You&apos;re offline — progress will sync when connected
    </div>
  );
}
```

Target: 25 lines.

### Step 4: Modify `next.config.ts` — add serwist fallback

Change the `withSerwistInit` call to include `fallbacks`:

```typescript
// BEFORE (lines 4-9):
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

// AFTER:
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    document: '/offline',
  },
});
```

This is a 3-line addition. File grows from 41 to 44 lines.

### Step 5: Add `OfflineToast` to child layout

In `app/(child)/layout.tsx`, import and render the toast so it appears across all child pages.

Find the location where `{children}` is rendered (after the `'ready'` step). Add the toast component as a sibling:

```tsx
// Add import:
import { OfflineToast } from '@/components/ui/offline-toast';

// In the JSX where children are rendered (after onboarding state machine resolves to 'ready'):
<>
  <OfflineToast />
  {children}
</>
```

The toast renders at fixed top position, so it does not affect layout flow. It only appears when `navigator.onLine` is false.

**Decision**: Only add to child layout, NOT parent layout. Parent dashboard is less critical for offline awareness (parents expect online connectivity). If needed later, add to parent layout in a follow-up.

## Todo List

- [ ] Create `app/offline/page.tsx` — static offline fallback page
- [ ] Create `lib/hooks/use-online.ts` — online/offline status hook
- [ ] Create `components/ui/offline-toast.tsx` — non-blocking offline banner
- [ ] Modify `next.config.ts` — add `fallbacks: { document: '/offline' }` to serwist config
- [ ] Modify `app/(child)/layout.tsx` — render `<OfflineToast />` in child layout
- [ ] Verify: disconnect network, navigate to uncached page -> `/offline` page is served
- [ ] Verify: reconnect network, tap "Try Again" -> page reloads normally
- [ ] Verify: disconnect network while on cached page -> orange toast banner appears at top
- [ ] Verify: reconnect network -> toast auto-hides
- [ ] Run `npx next build` — no compile errors
- [ ] Test in production build: `npx next start`, load app, kill server, navigate -> offline page

## Success Criteria

1. Navigating to an uncached page while offline shows `/offline` fallback with BapMascot + retry
2. "Try Again" button reloads; if online, navigation resumes normally
3. Going offline while on a cached page shows non-blocking orange toast at top
4. Reconnecting auto-hides the toast (no manual dismiss needed)
5. Gameplay continues working offline (audio cached, questions client-generated)
6. `next.config.ts` change is a 3-line addition only
7. All new files under 40 lines each

## Risk Assessment

- **serwist `fallbacks` option**: The `withSerwistInit` wrapper may not support `fallbacks` directly — it depends on the serwist version. Mitigation: check `node_modules/@serwist/next/index.d.ts` for the `fallbacks` type before implementing. If not supported, add the fallback manually in `app/sw.ts` using serwist's `NavigationRoute` with a `fallback` handler.
- **`navigator.onLine` reliability**: Some browsers report false positives (connected to router but no internet). Mitigation: acceptable for a toast banner — it is informational, not blocking. No critical logic depends on it.
- **Offline page JS hydration**: The retry button uses `onClick` which requires JS. In the unlikely case JS bundles are not cached, the button is non-functional. Mitigation: add a `<meta http-equiv="refresh" content="10">` tag as a no-JS fallback auto-retry.

## Security Considerations

- No sensitive data on the offline page
- No API calls from offline page or toast
- `useOnline` only reads browser API — no network requests
- No localStorage writes

## Next Steps

- If serwist `fallbacks` is not supported in `withSerwistInit`, implement fallback route handling directly in `app/sw.ts` using `setCatchHandler` or `NavigationRoute`
- Future: queue failed API writes (progress save) in IndexedDB for sync when reconnected (background sync API)

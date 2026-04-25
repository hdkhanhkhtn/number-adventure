# Phase 01 -- PWA Service Worker + Offline Support + Install Prompt

## Context Links

- Parent plan: `plans/260425-0849-phase2b-pwa-difficulty-algorithm/plan.md`
- Research: `plans/260425-0849-phase2b-pwa-difficulty-algorithm/research/researcher-pwa.md`
- Scout: `plans/260425-0849-phase2b-pwa-difficulty-algorithm/scout/scout-codebase-report.md`
- Depends on: nothing (independent of Phase 02)

## Overview

- **Priority:** P1
- **Status:** pending
- **Parallel with:** Phase 02 (Smart Difficulty Algorithm)
- **Description:** Install `@serwist/next` v9, create service worker with per-asset caching strategies, create web app manifest, add iOS meta tags, implement offline GameAttempt buffering via IndexedDB, create iOS "Add to Home Screen" instructional UI, update Nginx headers and verify Docker build.

## Key Insights

- `@serwist/next` v9 is TypeScript-first, supports App Router natively, and works with `output: 'standalone'`.
- iOS Safari does NOT support `beforeinstallprompt` or Background Sync API -- must use custom instructional UI and event-based sync.
- `RangeRequestsPlugin` needed for Safari audio seeking on cached MP3s.
- Serwist writes `sw.js` to `public/sw.js`; Next.js standalone copies `public/` to `.next/standalone/public/` automatically.
- iOS requires `apple-touch-icon` `<link>` tags in HTML (does NOT read manifest `icons`).
- Total cached audio must stay under 30MB (iOS Safari storage limit).

## Requirements

### Functional
- F1: Service worker registers at `/sw.js` and caches assets per strategy table
- F2: `/audio/*.mp3` cached with CacheFirst + RangeRequestsPlugin
- F3: `/_next/static/*` auto-precached by Serwist (CacheFirst)
- F4: `/api/worlds`, `/api/progress/*` cached with NetworkFirst (5s timeout)
- F5: Google Fonts cached with StaleWhileRevalidate (stylesheets) + CacheFirst (webfonts)
- F6: Offline GameAttempt writes queued to IndexedDB; drained on `online`, `visibilitychange`, session start
- F7: `manifest.json` with `display: standalone`, `orientation: portrait`, all required icon sizes
- F8: iOS-specific `<head>` meta tags (apple-mobile-web-app-capable, apple-touch-icon, theme-color)
- F9: Custom iOS "Add to Home Screen" instructional banner (dismissible, show after 3rd visit)
- F10: Nginx serves `/sw.js` with `Service-Worker-Allowed: /` header
- F11: Docker build copies `sw.js` correctly in standalone output

### Non-Functional
- NF1: No breaking changes to existing `output: 'standalone'` Docker build
- NF2: SW disabled in development (`process.env.NODE_ENV === 'development'`)
- NF3: Files under 200 lines each
- NF4: Total cached audio < 30MB

## Architecture

```
Build pipeline:
  next build → Serwist injects precache manifest → public/sw.js generated
  Docker: COPY public/ → .next/standalone/public/ (sw.js included)

Runtime:
  Browser loads page → layout.tsx registers SW via Serwist auto-registration
  SW intercepts: audio (CacheFirst), API (NetworkFirst), static (CacheFirst), fonts (SWR)

Offline flow:
  submitAttempt() → navigator.onLine check
    online  → POST /api/sessions/:id/attempts (normal)
    offline → queueAttempt() → IndexedDB "bap-offline-queue"
  Sync triggers: online event, visibilitychange (!hidden), startSession()
    → trySyncNow() → drain queue → POST each attempt → delete from IDB on success
```

## Related Code Files

### Files to CREATE

| File | Purpose | Est. Lines |
|------|---------|------------|
| `app/sw.ts` | Serwist service worker entry point with caching strategies | ~55 |
| `public/manifest.json` | Web app manifest (name, icons, display, orientation) | ~35 |
| `lib/pwa/offline-attempt-queue.ts` | IndexedDB queue for offline GameAttempt buffering + sync | ~75 |
| `components/pwa/ios-install-prompt.tsx` | iOS "Add to Home Screen" instructional banner | ~80 |
| `components/pwa/pwa-register.tsx` | Client component: registers SW, mounts iOS prompt | ~40 |

### Files to MODIFY

| File | Current Lines | Change |
|------|--------------|--------|
| `next.config.ts` | 24 | Wrap with `withSerwistInit`, add `/sw.js` headers |
| `app/layout.tsx` | 53 | Add manifest link, apple-touch-icon, theme-color, apple-mobile-web-app meta, mount `<PwaRegister />` |
| `nginx/nginx.conf` | 43 | Add `location = /sw.js` block with `Service-Worker-Allowed` + `worker-src 'self'` CSP |
| `lib/hooks/use-game-session.ts` | 82 | Integrate offline queue in `submitAttempt` + call `trySyncNow` in `startSession` |

## Implementation Steps

### Step 1: Install dependencies

```bash
cd /Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure
npm i @serwist/next@9 idb@8
npm i -D serwist@9
```

Verify peer deps:
```bash
npm ls @serwist/next serwist idb
```

### Step 2: Create `public/manifest.json`

Path: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/public/manifest.json`

```json
{
  "name": "Bắp Number Adventure",
  "short_name": "Bắp",
  "description": "Game học số cho trẻ em",
  "id": "/",
  "start_url": "/child/home",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#FF6B35",
  "background_color": "#FFF9F0",
  "categories": ["education", "kids", "games"],
  "icons": [
    { "src": "/icons/icon-72.png",  "sizes": "72x72",   "type": "image/png" },
    { "src": "/icons/icon-96.png",  "sizes": "96x96",   "type": "image/png" },
    { "src": "/icons/icon-128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

**Icon assets required:** Create `public/icons/` directory with all 8 icon sizes. Use Bap mascot as source. Generate with ImageMagick:
```bash
mkdir -p public/icons
# From a 512px source image:
for size in 72 96 120 128 144 152 180 192 384 512; do
  convert public/icons/icon-source.png -resize ${size}x${size} public/icons/icon-${size}.png
done
```

Note: `icon-120.png` and `icon-180.png` are for `apple-touch-icon` only (not in manifest).

### Step 3: Create `app/sw.ts` (service worker entry)

Path: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/app/sw.ts`

```typescript
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";
import type { RuntimeCaching } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: Array<{ url: string; revision: string | null }>;
};

const runtimeCaching: RuntimeCaching[] = [
  // Audio files: CacheFirst (large, immutable, offline-critical)
  {
    urlPattern: /\/audio\/.+\.mp3$/i,
    handler: "CacheFirst",
    options: {
      cacheName: "audio-cache",
      expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
      cacheableResponse: { statuses: [0, 200] },
      rangeRequests: true,
    },
  },
  // API: worlds + progress -> NetworkFirst with 5s timeout
  {
    urlPattern: /\/api\/(worlds|progress)/i,
    handler: "NetworkFirst",
    options: {
      cacheName: "api-cache",
      networkTimeoutSeconds: 5,
      expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
  // Google Fonts stylesheets -> StaleWhileRevalidate
  {
    urlPattern: /^https:\/\/fonts\.googleapis\.com/i,
    handler: "StaleWhileRevalidate",
    options: { cacheName: "google-fonts-stylesheets" },
  },
  // Google Fonts webfonts -> CacheFirst (immutable)
  {
    urlPattern: /^https:\/\/fonts\.gstatic\.com/i,
    handler: "CacheFirst",
    options: {
      cacheName: "google-fonts-webfonts",
      expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
  ...defaultCache,
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
});

serwist.addEventListeners();
```

### Step 4: Update `next.config.ts`

Path: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/next.config.ts`

Replace entire file:

```typescript
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
```

### Step 5: Create `lib/pwa/offline-attempt-queue.ts`

Path: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/lib/pwa/offline-attempt-queue.ts`

```typescript
import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'bap-offline-queue';
const DB_VERSION = 1;
const STORE_NAME = 'attempts';

interface QueuedAttempt {
  id?: number; // auto-increment key
  sessionId: string;
  questionId?: string;
  answer: string;
  correct: boolean;
  timeMs?: number;
  queuedAt: number; // Date.now()
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      },
    });
  }
  return dbPromise;
}

/** Queue a failed attempt for later sync */
export async function queueAttempt(
  sessionId: string,
  attempt: { questionId?: string; answer: string; correct: boolean; timeMs?: number },
): Promise<void> {
  try {
    const db = await getDB();
    await db.add(STORE_NAME, {
      sessionId,
      ...attempt,
      queuedAt: Date.now(),
    } satisfies Omit<QueuedAttempt, 'id'>);
  } catch (err) {
    console.warn('[offline-queue] Failed to queue attempt:', err);
  }
}

/** Drain queued attempts -- call when online */
export async function trySyncNow(): Promise<void> {
  if (typeof navigator === 'undefined' || !navigator.onLine) return;

  try {
    const db = await getDB();
    const all = await db.getAll(STORE_NAME) as QueuedAttempt[];
    if (all.length === 0) return;

    for (const item of all) {
      try {
        const res = await fetch(`/api/sessions/${item.sessionId}/attempts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: item.questionId,
            answer: item.answer,
            correct: item.correct,
            timeMs: item.timeMs,
          }),
        });
        if (res.ok && item.id != null) {
          await db.delete(STORE_NAME, item.id);
        } else {
          break; // stop on first failure, retry later
        }
      } catch {
        break; // network error, stop draining
      }
    }
  } catch (err) {
    console.warn('[offline-queue] Sync failed:', err);
  }
}

/** Get count of queued items (for UI indicator) */
export async function getQueuedCount(): Promise<number> {
  try {
    const db = await getDB();
    return await db.count(STORE_NAME);
  } catch {
    return 0;
  }
}
```

### Step 6: Integrate offline queue into `use-game-session.ts`

Path: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/lib/hooks/use-game-session.ts`

Changes to `submitAttempt`:
- Import `queueAttempt` and `trySyncNow` from `@/lib/pwa/offline-attempt-queue`
- In `submitAttempt`, catch fetch errors and queue to IndexedDB
- In `startSession`, call `trySyncNow()` before creating new session

Exact edits:

**Add import at top (after line 2):**
```typescript
import { queueAttempt, trySyncNow } from '@/lib/pwa/offline-attempt-queue';
```

**Replace `submitAttempt` callback (lines 78-90):**
```typescript
const submitAttempt = useCallback(async (attempt: SubmitAttemptRequest): Promise<void> => {
  const sid = sessionId ?? sessionStorage.getItem('currentSessionId');
  if (!sid) return;
  try {
    const res = await fetch(`/api/sessions/${sid}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attempt),
    });
    if (!res.ok) throw new Error('Attempt POST failed');
  } catch {
    // Offline or failed -- queue for later sync
    await queueAttempt(sid, attempt);
  }
}, [sessionId]);
```

**Add `trySyncNow()` call in `startSession` (after the guest guard, before fetch):**
```typescript
// Drain any queued offline attempts before starting new session
await trySyncNow();
```

**Add sync listeners in hook body (after state declarations, before callbacks):**
```typescript
// Register sync triggers (online + visibilitychange)
useEffect(() => {
  const handleOnline = () => { trySyncNow(); };
  const handleVisibility = () => { if (!document.hidden) trySyncNow(); };
  window.addEventListener('online', handleOnline);
  document.addEventListener('visibilitychange', handleVisibility);
  return () => {
    window.removeEventListener('online', handleOnline);
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}, []);
```

Add `useEffect` to the import on line 3:
```typescript
import { useState, useCallback, useEffect } from 'react';
```

### Step 7: Create `components/pwa/ios-install-prompt.tsx`

Path: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/components/pwa/ios-install-prompt.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'bap-ios-install-dismissed';
const VISIT_COUNT_KEY = 'bap-visit-count';
const MIN_VISITS_TO_SHOW = 3;

function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isStandalone = 'standalone' in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone;
  return isIOS && !isStandalone;
}

export function IosInstallPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isIOSSafari()) return;
    if (localStorage.getItem(STORAGE_KEY) === 'true') return;

    // Track visit count
    const count = parseInt(localStorage.getItem(VISIT_COUNT_KEY) ?? '0', 10) + 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(count));

    if (count >= MIN_VISITS_TO_SHOW) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 pb-safe">
      <div className="bg-white rounded-2xl shadow-lg border border-cream-200 p-4 mx-auto max-w-sm">
        <div className="flex items-start gap-3">
          <span className="text-3xl">🌽</span>
          <div className="flex-1">
            <p className="font-fredoka font-semibold text-sage-800 text-sm">
              Install Bap Number Adventure
            </p>
            <p className="text-xs text-sage-600 mt-1 leading-relaxed">
              Tap the{' '}
              <span className="inline-flex items-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="inline-block mx-0.5">
                  <path d="M12 3v12m0-12l4 4m-4-4L8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>{' '}
              Share button, then &quot;Add to Home Screen&quot;
            </p>
          </div>
          <button
            onClick={dismiss}
            className="text-sage-400 hover:text-sage-600 p-1 -mt-1 -mr-1"
            aria-label="Dismiss install prompt"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Step 8: Create `components/pwa/pwa-register.tsx`

Path: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/components/pwa/pwa-register.tsx`

```tsx
'use client';

import { IosInstallPrompt } from './ios-install-prompt';

/**
 * PWA registration component.
 * Serwist auto-registers the SW via its next plugin.
 * This component mounts the iOS install prompt.
 */
export function PwaRegister() {
  return <IosInstallPrompt />;
}
```

### Step 9: Update `app/layout.tsx`

Path: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/app/layout.tsx`

**Add import (after line 3):**
```typescript
import { PwaRegister } from '@/components/pwa/pwa-register';
```

**Replace `metadata` export (lines 27-31):**
```typescript
export const metadata: Metadata = {
  title: 'Bắp Number Adventure',
  description: 'Fun number learning game for kids',
  icons: { icon: '/favicon.ico' },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Bắp',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};
```

**Replace `viewport` export (lines 33-39):**
```typescript
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FF6B35',
};
```

**Add apple-touch-icon links and PwaRegister in the `<body>` (lines 47-49):**

Replace `<body>` section:
```tsx
<head>
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180.png" />
  <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
  <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120.png" />
</head>
<body>
  <Providers>{children}</Providers>
  <PwaRegister />
</body>
```

### Step 10: Update `nginx/nginx.conf`

Path: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/nginx/nginx.conf`

**Add after the `location /api/health` block (line 41), before the closing `}` of the `server` block:**

```nginx
    # Service Worker — must be served from root scope
    location = /sw.js {
      proxy_pass http://nextapp;
      add_header Service-Worker-Allowed /;
      add_header Cache-Control "no-cache, no-store, must-revalidate";
      add_header Content-Type "application/javascript; charset=utf-8";
    }

    # Manifest
    location = /manifest.json {
      proxy_pass http://nextapp;
      add_header Cache-Control "public, max-age=86400";
    }
```

**Add CSP `worker-src` to security headers (after line 18):**
```nginx
    add_header Content-Security-Policy   "worker-src 'self'"               always;
```

### Step 11: Verify Docker build

The existing `Dockerfile` (line 39) already copies `public/`:
```dockerfile
COPY --from=builder /app/public ./public
```

Since Serwist generates `public/sw.js` during `npm run build` (which runs in the builder stage), and `public/` is copied to the runner stage, `sw.js` is automatically included. No Dockerfile changes needed.

**Verification command:**
```bash
docker build -t bap-test . && docker run --rm bap-test ls -la public/sw.js
```

### Step 12: Create placeholder icon assets

```bash
mkdir -p /Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/public/icons
```

Use `ai-multimodal` + `imagemagick` skill to generate Bap mascot icons at required sizes: 72, 96, 120, 128, 144, 152, 180, 192, 384, 512px.

If no source image available, create a temporary placeholder:
```bash
cd /Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure
for size in 72 96 120 128 144 152 180 192 384 512; do
  convert -size ${size}x${size} xc:"#FF6B35" -fill white -gravity center \
    -pointsize $((size/3)) -annotate 0 "B" public/icons/icon-${size}.png
done
```

### Step 13: Final verification

```bash
cd /Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure
npx tsc --noEmit
npm run lint
npm run build  # verify sw.js is generated in public/
ls -la public/sw.js  # must exist after build
```

## Todo List

- [ ] Run `npm i @serwist/next@9 idb@8` and `npm i -D serwist@9`
- [ ] Create `public/manifest.json` with all icon entries
- [ ] Create `public/icons/` directory with all icon sizes (72-512px)
- [ ] Create `app/sw.ts` with caching strategies
- [ ] Update `next.config.ts` -- wrap with `withSerwistInit`, add `/sw.js` headers
- [ ] Create `lib/pwa/offline-attempt-queue.ts` -- IndexedDB queue + sync
- [ ] Create `components/pwa/ios-install-prompt.tsx` -- iOS install banner
- [ ] Create `components/pwa/pwa-register.tsx` -- client wrapper
- [ ] Update `app/layout.tsx` -- manifest, apple-touch-icon, theme-color, `<PwaRegister />`
- [ ] Update `lib/hooks/use-game-session.ts` -- integrate offline queue + sync listeners
- [ ] Update `nginx/nginx.conf` -- `/sw.js` location + `worker-src 'self'` CSP
- [ ] Verify `npm run build` generates `public/sw.js`
- [ ] Verify `npx tsc --noEmit` passes
- [ ] Verify `npm run lint` passes
- [ ] Test Docker build: `sw.js` present in runner image `public/`

## Success Criteria

1. `npm run build` completes; `public/sw.js` exists in output
2. `npx tsc --noEmit` passes with zero errors
3. Browser DevTools > Application > Service Workers shows registered SW at `/sw.js`
4. Lighthouse PWA audit: "Installable" badge passes (manifest + SW + icons)
5. In Chrome DevTools > Application > Cache Storage: `audio-cache`, `api-cache`, `google-fonts-*` caches appear after page load
6. Toggle DevTools offline mode: cached API data still loads; GameAttempt POSTs queue to IndexedDB (visible in Application > IndexedDB > `bap-offline-queue`)
7. Go back online: queued attempts drain automatically (POST requests appear in Network tab)
8. iOS Safari: custom "Add to Home Screen" banner appears after 3 visits; dismisses permanently on close
9. Docker: `docker build -t bap-test .` succeeds; `docker run --rm bap-test ls public/sw.js` outputs file info
10. Nginx: `curl -I https://host/sw.js` returns `Service-Worker-Allowed: /` header

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Serwist v9 peer dep conflict with Next 16.2.4 | Medium | High | Check `npm ls` after install; if conflict, pin `serwist@9.0.0` exact version |
| `workbox-range-requests` incompatible with Serwist v9 | Low | Medium | Serwist v9 bundles range request support internally via `rangeRequests: true` option -- no separate plugin needed |
| iOS Safari purges SW cache after 7 days inactivity | Medium | Low | Audio re-downloads on next visit; UX is slower but not broken. Consider re-precache on visibilitychange. |
| CSP `worker-src` conflicts with other headers | Low | Medium | Audit existing CSP in `next.config.ts` and `nginx.conf`; current setup has no CSP header, so addition is safe |
| Total audio cache exceeds 30MB iOS limit | Medium | Medium | Limit `maxEntries: 100` in audio cache config; monitor with `navigator.storage.estimate()` |

## Security Considerations

- SW scope limited to `/` -- no cross-origin interception
- `worker-src 'self'` CSP prevents third-party SW registration
- `Cache-Control: no-cache` on `sw.js` ensures browser always checks for updates
- Offline queue stores only non-sensitive game data (answer, correct, timeMs) -- no PII
- IndexedDB `bap-offline-queue` auto-cleared by browser on storage pressure

## Next Steps

- Generate production icon assets from Bap mascot design (replace placeholders)
- Add `screenshots` field to manifest for richer install experience (optional)
- Consider Periodic Background Sync for proactive content refresh (Chrome only, deferred)
- Monitor cache sizes via `navigator.storage.estimate()` in parent dashboard (Phase 2C)

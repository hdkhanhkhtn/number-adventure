# Research Report: PWA for Next.js 14 App Router (iOS + Android, Children's Game)

**Date:** 2026-04-25 | **Confidence:** High (official docs) / Medium (iOS specifics from MDN + known caveats)

---

## Q1: Library Choice — `@serwist/next` vs `@ducanh2912/next-pwa` vs manual Workbox

**Recommendation: `@serwist/next` v9**

| Library | App Router | `output:standalone` | Maintenance | Notes |
|---|---|---|---|---|
| `@serwist/next` v9 | Native | Works (manual copy needed — see Q6) | Active (fork of next-pwa) | TypeScript-first, best DX |
| `@ducanh2912/next-pwa` v10 | Partial | Fragile with standalone | Slower updates | Legacy patterns |
| Manual Workbox | Full control | Works | N/A | Most effort, best for edge cases |

**Minimal `next.config.ts` change:**

```ts
// next.config.ts
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",        // your SW source
  swDest: "public/sw.js",   // output (must be in public/)
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist({
  output: "standalone",
  // ...rest of config
});
```

Install: `npm i @serwist/next@9 && npm i -D serwist@9`
- Source: [serwist.pages.dev/docs/next/getting-started](https://serwist.pages.dev/docs/next/getting-started)

---

## Q2: iOS Safari Service Worker Constraints

**Missing vs Chrome (iOS < 16.4):**
- `beforeinstallprompt` event — NOT supported (never will be on iOS)
- Background Sync API — NOT supported on any iOS version
- Push notifications — limited/broken before iOS 16.4
- `navigator.standalone` — use this instead of install prompt detection
- Web Share Target — not supported
- Periodic Background Sync — not supported

**iOS 16.4 fixes (2023):**
- PWA installable from Chrome/Edge/Firefox via Share menu (previously Safari only)
- Push Notifications API now works
- Still NO `beforeinstallprompt`

**Custom "Add to Home Screen" instructional UI must include:**
1. Show ONLY on iOS Safari: `!!navigator.userAgent.match(/iphone|ipad|ipod/i) && !('standalone' in window.navigator && window.navigator.standalone)`
2. Visual: Safari share icon (box with arrow up) screenshot
3. Text: "Tap the Share button → then 'Add to Home Screen'"
4. Dismissible (localStorage flag to not re-show)
5. Show after 3rd visit or after 30s engagement (don't show on first load)

---

## Q3: Caching Strategy per Asset Type

| Asset | Strategy | Rationale |
|---|---|---|
| `/audio/*.mp3` (Howler sprites) | **CacheFirst** + `CacheableResponsePlugin({statuses:[0,200]})` + `RangeRequestsPlugin` | Large, immutable, offline critical. RangeRequestsPlugin needed for Safari audio seeking |
| `/_next/static/*` (JS/CSS) | **CacheFirst** | Content-hashed filenames = safe permanent cache. Serwist precaches these automatically via manifest injection |
| `/api/worlds`, `/api/progress/*` | **NetworkFirst** with 5s timeout fallback to cache | Needs freshness; offline fallback must exist |
| Google Fonts `fonts.googleapis.com` | **StaleWhileRevalidate** | Fast serve + background update. Cache fonts.gstatic.com separately with **CacheFirst** (immutable) |

**sw.ts example:**
```ts
import { defaultCache } from "@serwist/next/worker";
import { Serwist, CacheFirst, NetworkFirst, StaleWhileRevalidate } from "serwist";
import { CacheableResponsePlugin } from "serwist/plugins";
import { RangeRequestsPlugin } from "workbox-range-requests"; // peer dep

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    { matcher: /\/audio\/.+\.mp3$/i, handler: new CacheFirst({
        cacheName: "audio-cache",
        plugins: [new CacheableResponsePlugin({ statuses: [0, 200] }), new RangeRequestsPlugin()],
      }),
    },
    { matcher: /\/api\/(worlds|progress)/i, handler: new NetworkFirst({ networkTimeoutSeconds: 5, cacheName: "api-cache" }) },
    { matcher: /^https:\/\/fonts\.googleapis\.com/i, handler: new StaleWhileRevalidate({ cacheName: "google-fonts-stylesheets" }) },
    { matcher: /^https:\/\/fonts\.gstatic\.com/i, handler: new CacheFirst({ cacheName: "google-fonts-webfonts" }) },
    ...defaultCache,
  ],
});
serwist.addEventListeners();
```

---

## Q4: Offline GameAttempt Buffering + Sync

**Background Sync API availability:**
- Chrome/Android: Supported
- iOS Safari (all versions): NOT supported — no workaround at SW level

**Recommended pattern (works cross-platform):**

```ts
// lib/offline-queue.ts — IndexedDB-backed queue
import { openDB } from "idb"; // npm i idb

const DB_NAME = "bap-offline-queue";
async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) { db.createObjectStore("attempts", { autoIncrement: true }); },
  });
}

export async function queueAttempt(attempt: GameAttempt) {
  const db = await getDB();
  await db.add("attempts", attempt);
  await trySyncNow(); // immediate if online
}

export async function trySyncNow() {
  if (!navigator.onLine) return;
  const db = await getDB();
  const all = await db.getAll("attempts");
  for (const attempt of all) {
    try {
      await fetch("/api/sessions/attempt", { method: "POST", body: JSON.stringify(attempt) });
      await db.delete("attempts", attempt.id);
    } catch { break; } // stop on first failure
  }
}
```

**Fallback sync triggers (iOS-safe):**
- `window.addEventListener("online", trySyncNow)` — fires when connectivity restored
- On app focus: `document.addEventListener("visibilitychange", () => !document.hidden && trySyncNow())`
- On game session start: call `trySyncNow()` before posting new attempt

Background Sync API (`sync` event in SW): register for Chrome only as enhancement, fall back silently on iOS.

---

## Q5: Web App Manifest for Children's Game

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
    { "src": "/icons/icon-72.png",   "sizes": "72x72",   "type": "image/png" },
    { "src": "/icons/icon-96.png",   "sizes": "96x96",   "type": "image/png" },
    { "src": "/icons/icon-128.png",  "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144.png",  "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152.png",  "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192.png",  "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-384.png",  "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512.png",  "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "screenshots": [
    { "src": "/screenshots/home.png", "sizes": "390x844", "type": "image/png", "form_factor": "narrow" }
  ]
}
```

**iOS-specific `<head>` tags (in `app/layout.tsx` — manifest alone is not enough for iOS):**
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Bắp" />
<link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180.png" />
<link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
<link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120.png" />
```

Critical: iOS uses `apple-touch-icon` from `<link>` tags, NOT manifest icons. Both needed.

---

## Q6: Docker + `output: standalone` — Where does `sw.js` live?

**Problem:** Serwist writes `sw.js` to `public/sw.js`. With `output: standalone`, Next.js copies `public/` into `.next/standalone/public/`. The standalone server (`server.js`) serves static files from here.

**Answer: Yes, `sw.js` must be in the Docker image.**

Build flow:
1. `next build` → Serwist injects precache manifest → `public/sw.js` generated
2. Next copies `public/` → `.next/standalone/public/sw.js`
3. Docker image copies `.next/standalone/` as the runtime

**Dockerfile addition:**
```dockerfile
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# sw.js is inside public/ → already included above
```

Verify: `sw.js` must be served at origin root (`/sw.js`), NOT under `/_next/`. Set `swDest: "public/sw.js"` (not `public/sw/sw.js`).

Also set `Content-Type: application/javascript` and `Service-Worker-Allowed: /` headers for `/sw.js` in `next.config.ts` headers config.

---

## Sources
1. [Serwist Next.js Getting Started](https://serwist.pages.dev/docs/next/getting-started) — official, current
2. [MDN: Making PWAs Installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) — official
3. [web.dev: Add Manifest](https://web.dev/articles/add-manifest) — Google, current
4. [Chrome Workbox Caching Strategies](https://developer.chrome.com/docs/workbox/caching-strategies-overview) — official
5. iOS 16.4 PWA notes: MDN compatibility data + Apple release notes

## Unresolved Questions
- Exact Serwist v9 behavior with `output:standalone` in CI (no reproduction tested — manual verification recommended after first build)
- `workbox-range-requests` version compatibility with Serwist v9 (check peer deps after install)
- Whether `Content-Security-Policy` headers in the project conflict with SW registration — audit headers config before shipping

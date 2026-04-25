/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
  Serwist,
  ExpirationPlugin,
  CacheableResponsePlugin,
} from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: Array<{ url: string; revision: string | null }>;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Audio files: CacheFirst (large, immutable, offline-critical for gameplay)
    {
      urlPattern: /\/audio\/.+\.mp3$/i,
      handler: new CacheFirst({
        cacheName: "audio-cache",
        plugins: [
          new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
          new CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
      }),
    },
    // API: worlds + progress — NetworkFirst with fallback for offline browsing
    {
      urlPattern: /\/api\/(worlds|progress)/i,
      handler: new NetworkFirst({
        cacheName: "api-cache",
        networkTimeoutSeconds: 5,
        plugins: [
          new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 }),
          new CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
      }),
    },
    // Google Fonts stylesheets — StaleWhileRevalidate
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/i,
      handler: new StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
      }),
    },
    // Google Fonts webfonts — CacheFirst (immutable after download)
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com/i,
      handler: new CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 }),
          new CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();

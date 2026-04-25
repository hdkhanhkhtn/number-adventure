# BRAINSTORM — Phase 2 Content Expansion
**Date:** 2026-04-26 | **Status:** Final Synthesis

---

## 1. Implementation Priority Order

Dependencies flow left → right. Each item must be unblocked before dependents start.

```
[P0] Audio pipeline (Howler.js SFX + vi-VN TTS static files)
       └─► [P1a] PWA install (manifest + serwist)
       └─► [P1b] Difficulty auto-adjust (algorithm + DB migration)
                  └─► [P1c] Worlds 4-5 content (lessons use difficulty-aware engines)
       └─► [P1d] Worlds API endpoint (GET /api/worlds — currently 501)
                  └─► [P1c]
[P1e] Counting Objects game (new game type — blocked by game-type registry refactor)
[P2]  Number Writing game (UX prototype validation gate before any code)
```

**Concrete sequence:**
1. Audio (SFX + TTS build script) — unblocks everything else
2. Worlds API + difficulty engine fix — unblocks World 4-5 content
3. PWA manifest + serwist — parallel with step 2 (no shared files)
4. Difficulty auto-adjust migration + algorithm — can parallel with PWA
5. Game-type registry refactor — prerequisite for step 6
6. Counting Objects game type
7. Worlds 4-5 lesson data authoring
8. Number Writing (only after UX prototype validated externally)

---

## 2. Difficulty Auto-Adjustment Architecture

**DB changes needed:** Add `DifficultyProfile` table (no changes to existing Lesson/ChildSettings).

```prisma
model DifficultyProfile {
  id          String   @id @default(cuid())
  childId     String
  gameType    String   // hear-tap | build-number | etc.
  difficulty  String   @default("easy")
  sessionCount Int     @default(0)
  avgAccuracy Float    @default(0.0)
  updatedAt   DateTime @updatedAt

  child Child @relation(fields: [childId], references: [id], onDelete: Cascade)
  @@unique([childId, gameType])
}
```

**Algorithm (post-session only, never mid-session):**
```
accuracy = correct / total for completed session

IF accuracy < 0.50 AND sessionCount >= 2:
  drop difficulty tier (hard→medium→easy, floor at easy)
  reset sessionCount = 0

ELSE IF accuracy >= 0.50 AND accuracy <= 0.85:
  stay (ZPD sweet spot), increment sessionCount

ELSE IF accuracy > 0.85 AND sessionCount >= 5:
  advance difficulty tier (easy→medium→hard, ceil at hard)
  reset sessionCount = 0

ELSE:
  increment sessionCount only
```

**Parent override:** `ChildSettings.difficulty` is the CEILING. Auto-adjust may choose equal or lower, never higher. If parent sets "easy", auto-adjust is locked at easy regardless of accuracy. Read `ChildSettings.difficulty` before writing auto-adjust result.

**Session loading logic:** `loadQuestions()` in `question-loader.ts` already accepts `difficulty` param. Read `DifficultyProfile` in API route before generating questions. Local engine fallback uses `DifficultyProfile.difficulty` if available, else `ChildSettings.difficulty`.

**Engine fix required:** All 5 local generators (hear-tap, build-number, even-odd, number-order, add-take) use hardcoded `max` defaults. Must wire `difficulty` → number range via `GAME_TYPES.numberRange` lookup:
- easy: 1–10
- medium: 1–20
- hard: 1–50 (or domain-specific for add-take)

---

## 3. PWA Strategy

**Step-by-step:**

1. **Manifest** — create `/public/manifest.json`: name, short_name, icons (192/512px), theme_color from tokens.css, display: standalone, start_url: /child/home
2. **Serwist setup** — `npm install @serwist/next serwist`; add `withSerwist()` wrapper in `next.config.ts` (compatible with `output: 'standalone'` — verified)
3. **Service worker** — create `app/sw.ts` with two cache strategies:
   - `CacheFirst` for `/audio/**`, `/images/**` (static assets, long TTL)
   - `StaleWhileRevalidate` for `/_next/static/**` JS chunks
   - `NetworkFirst` for API routes (never cache game session data)
4. **Asset budget** — cap `/audio/**` at 25MB, `/images/**` at 5MB. Enforce via build-time script checking `public/` size.
5. **iOS install UX** — no `beforeinstallprompt` on Safari/iOS. Detect iOS via `navigator.userAgent` + `!window.matchMedia('(display-mode: standalone)')`. Show custom bottom-sheet: "Tap Share → Add to Home Screen" with illustrated step guide. Trigger on 3rd session or after first lesson complete.
6. **next.config.ts change** — `output: 'standalone'` stays; serwist handles service worker registration automatically.

---

## 4. Audio Pipeline

**SFX (Howler.js sprite sheet approach):**

File: `public/audio/sfx-sprite.mp3` + `public/audio/sfx-sprite.webm`
Sprite map (approximate offsets):
```
correct:        [0, 800]      // cheerful chime
wrong:          [900, 600]    // gentle thud
level-complete: [1600, 1500]  // fanfare
tap:            [3200, 200]   // soft click
star-earn:      [3500, 1000]  // sparkle
```

`use-sound-effects.ts` — replace 3 TODOs with real Howler.js calls:
```ts
import Howl from 'howler';
const sfx = new Howl({ src: ['/audio/sfx-sprite.webm', '/audio/sfx-sprite.mp3'], sprite: SPRITE_MAP });
```
Single `Howl` instance, lazy init on first user gesture (iOS autoplay policy).

**vi-VN TTS pre-generation (build-time script):**
- Script: `scripts/generate-tts-audio.ts`
- Use `@google-cloud/text-to-speech` SDK; voice: `vi-VN-Standard-A`
- Generate: numbers 0–100, ordinals, game instruction phrases (~150 strings total)
- Output: `public/audio/tts/{locale}/{text-slug}.mp3` + `.webm`
- Run once at build; committed to repo (git-lfs if > 50MB, likely ~8MB total)
- `AudioService` updated: GoogleTTSProvider checks `/audio/tts/vi-VN/{slug}.webm` first (static fetch) before calling Cloud API — zero API cost at runtime

**Web Speech API vi-VN fallback:** Already implemented in `web-speech-provider.ts`. No changes needed. `AudioService` priority chain: static TTS file → Web Speech API. Google Cloud API only needed for build-time generation script (server-side, not browser).

---

## 5. Worlds & Levels

**Existing model:** `Lesson` has `worldId`, `gameType`, `order`, `difficulty`. No `Unit` tier yet. The `WorldId` type already defines 5 worlds in `lib/types/common.ts`.

**Recommended approach — no new DB table for Phase 2:**
- Add `Unit` as a static config concept (TypeScript const, not DB row). Units are logical groupings of 3 lessons displayed in the World Map UI only.
- Keep `Lesson` as the atomic DB entity. Add `unitIndex` field (Int, 0-indexed) to `Lesson` for grouping.
- World unlock: already tracked via `GameSession.stars` per `lessonId`. World Map API aggregates stars per worldId. Persist world unlock threshold: first lesson ≥ 1 star unlocks world.
- Mastery (3 stars) tracked via `MAX(GameSession.stars)` per lesson — no new field needed.

**Worlds API (`/api/worlds/route.ts`) implementation:**
```
GET /api/worlds → return: WorldId[], each with { unlocked: bool, lessons: [{ id, order, stars }] }
Stars = MAX(GameSession.stars) WHERE childId = session.childId
World unlocked if world index = 0 OR previous world has any lesson with stars >= 1
```

**Worlds 4-5 content authoring:**
- World 4 (`number-sequence`): `number-order` game type, difficulty medium/hard, sequences with gaps, reverse order
- World 5 (`math-kitchen`): `add-take` game type, word problems format, difficulty medium/hard
- 9 lessons per world, 3 per unit (easy/medium/hard spread). Seed via Prisma seed script — no manual DB entries.

---

## 6. New Game Types

### Counting Objects (P1)

**Approach:** Pure React, no library. Set-based tap state.

```
CountingObjectsQuestion { targetCount: number; objects: ObjectItem[]; }
ObjectItem { id: string; emoji: string; tapped: boolean; }
```

**UX:** Grid of emoji objects (animals/fruits per world theme), 64px min touch targets. Child taps each object → it "pops" (scale + opacity animation via Framer Motion). Counter badge shows tapped count. Auto-advance when `tappedCount === targetCount`. Wrong state not possible (no "submit") — natural discovery UX.

**Engine:** `generateCountingQuestion(maxCount: number): CountingObjectsQuestion`. Difficulty maps: easy 1-5, medium 6-10, hard 11-20.

**Integration:** Add `counting-objects` to `GameType` union in `lib/types/common.ts`. Add engine file. Add case in `question-loader.ts`. Add to world config (World 1-2, easy difficulty).

**Game-type registry refactor (prerequisite):** Extract a `GAME_REGISTRY` object in a new `lib/game-engine/game-registry.ts` that maps `GameType → { engine, component, numberRange }`. Replaces 5 manual switch cases across question-loader, score-calculator, and game routing. Single step needed before adding counting-objects or any future game type.

### Number Writing (P2 — gated)

**Gate condition:** UX prototype tested with 4-7yr before any code written.

**Recommended approach if gate passes:** Guided tracing via Canvas API + SVG reference path. On each stroke, measure average distance from child's path to SVG reference path using point-sampling (every 10px). Threshold: < 20px average = correct. No ML, no external library.

**Phased build:**
- Phase 2C: Canvas drawing infrastructure + hit-test utility only (no full game)
- Phase 3A: Full Number Writing game if prototype validates

**If gate fails:** Replace with "Number Matching" variant (drag number tiles to match shown numeral) — same learning goal, lower implementation risk.

---

## 7. Trade-off Summary Table

| Feature | Approach Chosen | Alternative Considered | Reason | Risk |
|---|---|---|---|---|
| Audio SFX | Howler.js sprite sheet | Individual MP3 files | Fewer HTTP requests, single cache entry, iOS reliable | Low |
| vi-VN TTS | Pre-generated static MP3 at build time | Runtime Google TTS API | Zero API cost/latency in-app, works offline | Medium (build script maintenance) |
| TTS fallback | Web Speech API (already implemented) | None | Already exists, no work needed | Low |
| PWA | @serwist/next v9+ | next-pwa (abandoned) | Active maintenance, Next.js App Router native support | Low |
| iOS install | Custom instructional bottom-sheet | None (iOS limitation) | No native prompt available on iOS Safari | Low |
| Difficulty adjust | Custom SM-2 variant, post-session only | spaced-repetition library | KISS — 15 lines of logic, no dep needed | Low |
| Unit grouping | Static TS config (no DB table) | DB Unit model | YAGNI — UI grouping only, no query logic needed | Low |
| World unlock | Stars aggregation from GameSession | Separate unlock flags | DRY — data already exists, no new DB writes | Low |
| Counting Objects | Pure React + Framer Motion | External drag library | Already have Framer Motion, sufficient for tap-pop UX | Low |
| Number Writing | Canvas + SVG path proximity (gated) | ML handwriting recognition | Proportionate to project scale; ML is YAGNI | High (UX validation needed) |
| Game-type registry | GAME_REGISTRY static object | Continue switch cases | DRY — eliminates 5+ duplicated switch blocks | Low |

---

## 8. Recommended Phase 2 Sequence

### Phase 2A — Foundation (Unblocks everything)
- [ ] Audio: Howler.js SFX sprite + 3 TODOs in `use-sound-effects.ts`
- [ ] Audio: build-time TTS script for vi-VN numbers 0-100 + key phrases
- [ ] Audio: update `GoogleTTSProvider` to check static files first
- [ ] Difficulty engines: wire `difficulty` param → number range in all 5 generators
- [ ] Worlds API: implement `GET /api/worlds` (stars aggregation + unlock logic)
- [ ] DB migration: add `DifficultyProfile` table

### Phase 2B — PWA + Content
- [ ] PWA: manifest.json + serwist setup + cache strategies
- [ ] PWA: iOS install instructional UI component
- [ ] Difficulty auto-adjust: post-session trigger in `use-game-session.ts`
- [ ] Game-type registry refactor (`GAME_REGISTRY` in `game-registry.ts`)
- [ ] Counting Objects: engine + UI component + world integration (Worlds 1-2)
- [ ] Worlds 4-5: lesson data seed script (18 lessons, medium/hard difficulty)

### Phase 2C — Polish + Gated Features
- [ ] World Map: persist unlock state via Worlds API (connect UI to real data)
- [ ] Parent Dashboard: surface difficulty profile data per child per game type
- [ ] Number Writing: Canvas drawing infrastructure only (no game) — IF UX prototype validated
- [ ] Audio asset budget check script (CI step, block build if > 30MB)
- [ ] E2E test: offline gameplay via Playwright with network throttling

---

## 9. Open Questions

1. **Number Writing UX prototype** — Who runs the test with 4-7yr children, and what is the timeline? This gates Phase 2C scope. If no test planned, drop Number Writing from Phase 2 entirely.
2. **Audio file format** — Does target deployment platform (VPS) serve `.webm` with correct MIME type? Needs `Content-Type: audio/webm` header verification. If not configured, Howler.js falls back to MP3 (add `.mp3` as primary).
3. **TTS build script credentials** — Google Cloud service account for build-time generation: stored as CI secret or committed `.env`? Must not enter Docker image. CI secret approach recommended but needs confirmation.
4. **PWA + standalone output compatibility** — `@serwist/next` v9 with `output: 'standalone'` has a known caveat: service worker file must be manually copied to `standalone/public/`. Needs verification against current Next.js 14 version in use.
5. **World 4-5 content scope** — Are 9 lessons per world (matching Worlds 1-3) confirmed, or is a reduced set (e.g., 6) acceptable for Phase 2 MVP?
6. **Counting Objects emoji set** — Should objects be world-themed (garden flowers for World 1, castle stones for World 2) or generic across all? Affects asset/content authoring scope.
7. **DifficultyProfile initialization** — On first session for a new child, `DifficultyProfile` row doesn't exist. Fallback to `ChildSettings.difficulty`. Confirm this is acceptable or should a row be created on child profile creation.

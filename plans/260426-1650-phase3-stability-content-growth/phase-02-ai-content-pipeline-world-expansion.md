# Phase 2: AI Content Pipeline & World Expansion (3B)

## Context Links

- [Research: AI Pipeline & Social](research/researcher-phase3bc-ai-pipeline-social.md)
- [Scout: Codebase Analysis](scout/scout-phase3-codebase.md)
- [Plan Overview](plan.md)

## Overview

- **Priority:** High
- **Status:** Code Complete — Operational steps pending (data generation + TTS audio)
- **Effort:** ~3 days
- **Description:** Build offline AI lesson generator, migrate lessons from static TS to DB with feature flag, generate Google TTS audio pack, populate Worlds 6+7.

## Key Insights

- Static lessons live in `src/data/game-config/lesson-templates.ts` (63 lessons, 9 per world, 7 worlds)
- `Lesson` table exists in Prisma schema but is seeded from static data
- AI question pipeline already exists at `app/api/ai/generate-questions/route.ts` (9router + local fallback)
- Claude Batch API: 50% cost discount, 24h async — ideal for bulk 50-100 lesson gen
- Google WaveNet free tier covers 202 files (0-100 EN+VI); ~3MB total, fine for `public/`
- `scripts/generate-tts-audio.ts` already exists — needs completion/verification
- Feature flag pattern: `NEXT_PUBLIC_USE_DB_LESSONS=true` env var controls switchover
- `unstable_cache` from Next.js for in-memory DB lesson cache (1h TTL)

## Requirements

### Functional

- FR-01: Offline script generates lesson content (title, description, objectives) via Claude/Gemini API
- FR-02: Generated lessons validated with Zod before DB write
- FR-03: `--dry-run` flag prints generated content without writing to DB
- FR-04: Dynamic lesson loading from DB with static fallback when DB empty
- FR-05: Feature flag `NEXT_PUBLIC_USE_DB_LESSONS` controls static vs DB source
- FR-06: TTS audio files for numbers 0-100 in EN and VI
- FR-07: World 6 (Counting Meadow) and World 7 (Writing Workshop) have full 9-lesson sets
- FR-08: Admin seed script: JSON config input -> AI expand -> DB upsert

### Non-Functional

- NFR-01: Generator script gated behind `NODE_ENV !== 'production'`
- NFR-02: DB lesson cache: 1h TTL via `unstable_cache`
- NFR-03: TTS files committed to repo (3MB acceptable); larger future packs use external storage
- NFR-04: Lesson seed is idempotent (upsert by worldId+order)

## Architecture

```
scripts/generate-lessons.ts
  ↓ Claude Batch API (or Gemini Flash)
  ↓ Zod validation
  ↓ prisma/seed-lessons.json
  ↓ prisma/seed.ts → prisma.lesson.upsert()

Runtime:
  NEXT_PUBLIC_USE_DB_LESSONS=true
    → lib/lesson-loader.ts
      → unstable_cache(prisma.lesson.findMany)
      → fallback: LESSON_TEMPLATES (static)
    → game engine consumes lessons
```

## Related Code Files

### MODIFY

| File | Changes |
|------|---------|
| `src/data/game-config/lesson-templates.ts` | Add World 6+7 lesson templates (static fallback) |
| `src/data/game-config/worlds.ts` | Verify World 6+7 entries exist with correct `lessonCount` |
| `app/(child)/play/[gameType]/[lessonId]/page.tsx` | Use `lessonLoader` instead of direct `LESSON_TEMPLATES.find()` |
| `prisma/schema.prisma` | Add `description`, `objectives`, `published` fields to Lesson model |
| `scripts/generate-tts-audio.ts` | Complete/verify — add VI voice, rate limiting, error handling |

### CREATE

| File | Purpose |
|------|---------|
| `scripts/generate-lessons.ts` | AI lesson content generator (Claude Batch API + Zod) |
| `scripts/seed-lessons.ts` | Read `seed-lessons.json` -> `prisma.lesson.upsert()` |
| `prisma/seed-lessons.json` | Generated lesson data (output of generator) |
| `lib/lesson-loader.ts` | Feature-flagged lesson loader (DB with static fallback) |
| `lib/schemas/lesson-schema.ts` | Zod validation schema for AI-generated lessons |

## Implementation Steps

### Task 3B-01: AI lesson generator script (High)

1. Create `lib/schemas/lesson-schema.ts`:
   ```typescript
   import { z } from 'zod';
   export const LessonSchema = z.object({
     slug: z.string().min(3),
     worldId: z.string(),
     gameType: z.string(),
     order: z.number().int().min(1).max(9),
     title: z.string().max(80),
     description: z.string().max(300),
     objectives: z.array(z.string()).min(1).max(5),
     difficulty: z.enum(['easy', 'medium', 'hard']),
     questionCount: z.number().int().min(5).max(20),
     passingStars: z.number().int().min(1).max(3),
   });
   ```
2. Create `scripts/generate-lessons.ts`:
   - Accept args: `--world <worldId>` (generate for specific world) or `--all`
   - Accept `--dry-run` flag (print to stdout, skip file write)
   - Guard: `if (process.env.NODE_ENV === 'production') process.exit(1)`
   - Build structured prompt for Claude:
     ```
     Generate 9 math lessons for children ages 3-8 for world "{worldName}".
     Game type: {gameType}. Difficulty tiers: 3 easy, 3 medium, 3 hard.
     Return JSON array matching this schema: {LessonSchema}
     ```
   - Call Claude API (`@anthropic-ai/sdk`): use `messages.create()` for single world, `messages.batches.create()` for `--all`
   - Parse response JSON, validate each lesson with `LessonSchema.safeParse()`
   - Log validation errors; write valid lessons to `prisma/seed-lessons.json`
3. Add npm script: `"generate:lessons": "tsx scripts/generate-lessons.ts"`

### Task 3B-02: Dynamic lesson loading (High)

1. Add fields to `Lesson` model in `prisma/schema.prisma`:
   ```prisma
   model Lesson {
     id           String   @id @default(cuid())
     worldId      String
     gameType     String
     order        Int
     title        String
     description  String?
     objectives   Json?     // string[]
     difficulty   String   @default("easy")
     questionCount Int     @default(8)
     passingStars  Int     @default(1)
     published    Boolean  @default(false)
     createdAt    DateTime @default(now())
     // ... existing relations
   }
   ```
2. Run `npx prisma migrate dev --name add-lesson-metadata`
3. Create `scripts/seed-lessons.ts`:
   - Read `prisma/seed-lessons.json`
   - For each lesson: `prisma.lesson.upsert({ where: { worldId_order }, create, update })`
   - Add compound unique `@@unique([worldId, order])` to Lesson model
4. Create `lib/lesson-loader.ts`:
   ```typescript
   import { unstable_cache } from 'next/cache';
   import { prisma } from '@/lib/db';
   import { LESSON_TEMPLATES } from '@/src/data/game-config/lesson-templates';

   const USE_DB = process.env.NEXT_PUBLIC_USE_DB_LESSONS === 'true';

   const getDbLessons = unstable_cache(
     async () => prisma.lesson.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
     ['lessons'],
     { revalidate: 3600 }
   );

   export async function loadLessons(worldId?: string) {
     if (USE_DB) {
       const dbLessons = await getDbLessons();
       if (dbLessons.length > 0) {
         return worldId ? dbLessons.filter(l => l.worldId === worldId) : dbLessons;
       }
     }
     // Static fallback
     return worldId ? LESSON_TEMPLATES.filter(l => l.worldId === worldId) : LESSON_TEMPLATES;
   }

   export function loadLessonSync(lessonId: string) {
     return LESSON_TEMPLATES.find(l => l.id === lessonId) ?? null;
   }
   ```
5. Update `app/(child)/play/[gameType]/[lessonId]/page.tsx`:
   - Replace `LESSON_TEMPLATES.find((l) => l.id === lessonId)` with `loadLessonSync(lessonId)`
   - Keep synchronous for client component; async loader used in world/lesson list pages

### Task 3B-03: Google TTS audio pack (High)

1. Verify `scripts/generate-tts-audio.ts` exists and review
2. Complete script to handle both EN and VI:
   ```typescript
   const VOICES = {
     en: { languageCode: 'en-US', name: 'en-US-Wavenet-D' },
     vi: { languageCode: 'vi-VN', name: 'vi-VN-Wavenet-A' },
   };
   for (const [lang, voice] of Object.entries(VOICES)) {
     for (let i = 0; i <= 100; i++) {
       const text = lang === 'vi' ? numberToVietnamese(i) : i.toString();
       // synthesize and save to public/audio/numbers/{lang}/{i}.mp3
       await new Promise(r => setTimeout(r, 100)); // rate limit
     }
   }
   ```
3. Create directories: `public/audio/numbers/en/`, `public/audio/numbers/vi/`
4. Run script once offline; commit generated MP3 files (202 files, ~3MB)
5. Add npm script: `"generate:tts": "tsx scripts/generate-tts-audio.ts"`

### Task 3B-04: World 6 — Counting Meadow lessons (Medium)

1. Verify `worlds.ts` has World 6 entry (`counting-meadow`, gameType: `count-objects`)
2. Add 9 lesson templates to `lesson-templates.ts`:
   - cm-01 to cm-03: easy (count 1-5, count 1-10, count shapes)
   - cm-04 to cm-06: medium (count 1-20, count groups, count mixed)
   - cm-07 to cm-09: hard (count 1-50, count fast, count master)
3. Run AI generator for World 6: `npm run generate:lessons -- --world counting-meadow`
4. Seed to DB: `npm run seed:lessons`

### Task 3B-05: World 7 — Writing Workshop lessons (Medium)

1. Verify `worlds.ts` has World 7 entry (`writing-workshop`, gameType: `number-writing`)
2. Add 9 lesson templates to `lesson-templates.ts`:
   - ww-01 to ww-03: easy (write 0-5, write 0-9, trace digits)
   - ww-04 to ww-06: medium (write 10-20, write teens, write two-digit)
   - ww-07 to ww-09: hard (write to 50, write to 99, speed write)
3. Run AI generator for World 7: `npm run generate:lessons -- --world writing-workshop`
4. Seed to DB: `npm run seed:lessons`

### Task 3B-06: Admin seed script (Medium)

1. Create JSON config format:
   ```json
   {
     "worlds": [
       { "id": "counting-meadow", "gameType": "count-objects", "lessonCount": 9 }
     ]
   }
   ```
2. Script reads config -> calls AI generator per world -> validates -> seeds DB
3. Add npm script: `"seed:worlds": "tsx scripts/seed-lessons.ts"`

## Todo List

- [x] 3B-01: Create Zod schema + AI lesson generator script with `--dry-run`
- [x] 3B-02: Add Lesson metadata fields + migration + lesson-loader.ts + feature flag
- [x] 3B-03: Complete TTS script (EN+VI) — script generates 0-100, WaveNet voices, Unicode vi-VN; run `npm run generate:audio` with GOOGLE_APPLICATION_CREDENTIALS to produce 202 MP3 files
- [x] 3B-04: World 6 Counting Meadow — 9 static templates in lesson-templates.ts (cm-01..09); run `npm run generate:lessons -- --world counting-meadow` + `npm run seed:lessons` when AI credentials available
- [x] 3B-05: World 7 Writing Workshop — 9 static templates in lesson-templates.ts (ww-01..09); run `npm run generate:lessons -- --world writing-workshop` + `npm run seed:lessons` when AI credentials available
- [x] 3B-06: Admin pipeline: `prisma/seed-worlds-config.json` + `scripts/seed-worlds.ts` + `npm run seed:worlds` — orchestrates generate + seed per world

## Remaining Operational Steps

All code infrastructure is complete. The following runtime/operations tasks must be executed to activate the pipeline:

### Step 1: Generate lesson data

**Command:** `npm run generate:lessons -- --all`

**Prerequisites:** Set env vars in `.env`:
- `AI_ENDPOINT` — 9router endpoint URL
- `AI_API_KEY` — API key for 9router
- `AI_MODEL` — model identifier

**Output:** `prisma/seed-lessons.json` (generated lesson content validated by Zod)

**Verify:** File exists and contains valid JSON array of lessons per world.

---

### Step 2: Seed lessons to DB

**Command:** `npm run seed:lessons`

**Prerequisites:** Step 1 complete; PostgreSQL running; `DATABASE_URL` set in `.env`

**Output:** Lesson rows upserted to DB (idempotent via `@@unique([worldId, order])`)

**Verify:** `npx prisma studio` → Lesson table shows rows for all 7 worlds, 9 lessons each = 63 rows

---

### Step 3: Generate TTS audio

**Command:** `npm run generate:audio`

**Prerequisites:** `GOOGLE_APPLICATION_CREDENTIALS` set in `.env` (path to Google Cloud service account JSON)

**Output:** 202 MP3 files at `public/audio/tts/en-US/{0..100}.mp3` and `public/audio/tts/vi-VN/{0..100}.mp3`

**Note:** Script uses 60ms rate limit between API calls. Full generation takes ~12 seconds.

**Verify:** `ls public/audio/tts/en-US/ | wc -l` should output `101`; same for `vi-VN`

---

### Step 4: Verify audio path in useAudio hook

**IMPORTANT:** The TTS script outputs to `public/audio/tts/{locale}/{n}.mp3`, NOT `public/audio/numbers/{lang}/{n}.mp3` as originally planned in the phase doc.

**Action:** Check `lib/hooks/use-audio.ts` (or wherever TTS playback is implemented) and confirm it references:
- `public/audio/tts/en-US/{n}.mp3` for English
- `public/audio/tts/vi-VN/{n}.mp3` for Vietnamese

If the hook references `public/audio/numbers/`, update the path to `public/audio/tts/`.

---

### Step 5: Activate DB lesson loading

**Action:** Set in `.env`:
```
NEXT_PUBLIC_USE_DB_LESSONS=true
```

**Verify:** Start dev server (`npm run dev`), navigate to any world — lessons should load from DB via `unstable_cache` (1h TTL). If DB is empty, static fallback activates transparently.

---

## Success Criteria

- `npm run generate:lessons -- --world number-garden --dry-run` outputs valid JSON
- `NEXT_PUBLIC_USE_DB_LESSONS=true` loads lessons from DB; `false` uses static templates
- All 202 TTS files exist at `public/audio/tts/{en-US,vi-VN}/{0..100}.mp3`
- Worlds 6+7 each have 9 playable lessons (3 easy, 3 medium, 3 hard)
- Lesson seed script is idempotent (re-run produces no duplicates)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| AI generates invalid lesson structure | Seed fails | Zod validation; `--dry-run` to preview |
| Claude API rate limit during batch | Generation stalls | Use Batch API (24h async window); or Gemini Flash fallback |
| TTS Vietnamese voice quality poor | Bad UX for VI users | Test `vi-VN-Wavenet-A` quality manually before committing |
| DB lesson loading slower than static | Perceived latency | `unstable_cache` (1h TTL); static fallback always available |

## Security Considerations

- Generator script: never run in production (`NODE_ENV` guard)
- API keys (Claude, Google TTS) stored in `.env` only; `.env` in `.gitignore`
- `seed-lessons.json` contains no sensitive data; safe to commit
- DB lessons marked `published: false` by default; require manual publish

## Next Steps

- After TTS files committed, verify `useAudio` hook references `public/audio/tts/{locale}/{n}.mp3` path (NOT `numbers/`)
- Feature flag allows gradual rollout: enable DB lessons per world
- Future: larger audio packs (phrases, sentences) should use Vercel Blob or Cloudflare R2

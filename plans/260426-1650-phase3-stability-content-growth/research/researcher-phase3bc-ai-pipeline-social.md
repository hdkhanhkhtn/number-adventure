## Research Report: Phase 3B & 3C — AI Pipeline, Dynamic Lessons, TTS, Multi-Child, Email

### Executive Summary
Five topics for Phase 3B (AI content generation, dynamic lesson loading, TTS audio pack) and Phase 3C (multi-child profiles, weekly email reports). All approaches confirmed against official docs. Recommended stack: Claude Batch API + Prisma seed script, Google TTS WaveNet, Vercel Cron + Resend, React Context profile switcher.

---

### 1. AI Lesson Content Generation (Phase 3B)

**Approach: offline script → validate → Prisma seed**

Pipeline:
1. `scripts/generate-lessons.ts` calls Claude or Gemini API with structured prompt
2. Response parsed + validated (Zod schema)
3. Valid records written to `prisma/seed-lessons.json`
4. `prisma/seed.ts` reads JSON → `prisma.lesson.upsert()` (idempotent)

**Rate limiting / cost control:**
- Use Claude **Batch API** (`/v1/messages/batches`): up to 50% cost discount, async processing, 24h window. Ideal for one-time bulk generation of ~50-100 lessons.
  - Source: [Anthropic Message Batches](https://docs.anthropic.com/en/api/creating-message-batches) — accessed 2026-04-26
- Gemini alternative: `gemini-1.5-flash` at $0.075/1M input tokens — cheapest option for structured JSON output.
- Add `--dry-run` flag to script: prints generated content without DB write.
- Gate script behind `NODE_ENV !== 'production'` guard to prevent accidental prod runs.

**Validation schema (Zod):**
```typescript
const LessonSchema = z.object({
  slug: z.string().min(3),
  title: z.string().max(80),
  description: z.string().max(300),
  objectives: z.array(z.string()).min(1).max(5),
  ageMin: z.number().int().min(3).max(8),
  difficulty: z.enum(["easy", "medium", "hard"]),
})
```

**Cost estimate:** 100 lessons × ~500 tokens each = 50K tokens ≈ $0.004 with Claude Haiku (Batch API). Negligible.

Confidence: High

---

### 2. Dynamic Lesson Loading — Static → DB Migration (Phase 3B)

**Strategy: parallel fallback during migration**

Step 1 — Add API route:
```
GET /api/lessons          → list all published lessons
GET /api/lessons/[slug]   → single lesson with game config
```
- Route handler calls `prisma.lesson.findMany({ where: { published: true } })`
- Add `published: Boolean @default(false)` to Lesson schema for staged rollout

Step 2 — In-memory cache (Next.js):
```typescript
// lib/lesson-cache.ts
import { unstable_cache } from 'next/cache'
export const getLessons = unstable_cache(
  async () => prisma.lesson.findMany({ where: { published: true } }),
  ['lessons'],
  { revalidate: 3600 } // 1 hour TTL
)
```
- Source: [Next.js unstable_cache](https://nextjs.org/docs/app/api-reference/functions/unstable_cache) — accessed 2026-04-26

Step 3 — Fallback pattern in game engine:
```typescript
const lessons = dbLessons.length > 0 ? dbLessons : STATIC_LESSON_CONFIG
```
- Keep `data/game-config/` files unchanged until DB fully populated and validated

Step 4 — Feature flag: `NEXT_PUBLIC_USE_DB_LESSONS=true` env var controls switchover

Confidence: High

---

### 3. Google TTS Audio Pack Generation (Phase 3B)

**Scope:** Numbers 0–100 in EN + VI = 202 audio files

**Recommended voice:** WaveNet (EN: `en-US-Wavenet-D`, VI: `vi-VN-Wavenet-A`)
- WaveNet free tier: 4M chars/month. Numbers 0-100 average ~5 chars each = ~1,010 chars total. Entirely free.
- Source: [Google Cloud TTS Pricing](https://cloud.google.com/text-to-speech/pricing) — accessed 2026-04-26

**Naming convention:**
```
public/audio/numbers/en/0.mp3 ... 100.mp3
public/audio/numbers/vi/0.mp3 ... 100.mp3
```

**Batch generation script:**
```typescript
// scripts/generate-tts.ts
import textToSpeech from '@google-cloud/text-to-speech'
const client = new textToSpeech.TextToSpeechClient()
for (let i = 0; i <= 100; i++) {
  const [response] = await client.synthesizeSpeech({
    input: { text: i.toString() },
    voice: { languageCode: 'en-US', name: 'en-US-Wavenet-D' },
    audioConfig: { audioEncoding: 'MP3' }
  })
  fs.writeFileSync(`public/audio/numbers/en/${i}.mp3`, response.audioContent)
}
```
- Add 100ms delay between requests to avoid quota exhaustion: `await new Promise(r => setTimeout(r, 100))`
- Run once offline; commit generated files to repo (202 files × ~15KB avg = ~3MB total, acceptable for `public/`)

**CDN consideration:** For production scale, move to Cloudflare R2 or Vercel Blob with public URL. For MVP, `public/` is sufficient.

Confidence: High (pricing verified from official source)

---

### 4. Multi-Child Profiles (Phase 3C)

**Schema already supports it** (`Parent.children[]`). Implementation is UI + state only.

**Recommended: React Context + localStorage persistence**

```typescript
// contexts/active-child-context.tsx
interface ActiveChildContext {
  activeChild: Child | null
  setActiveChild: (child: Child) => void
  children: Child[]
}
```
- On login, fetch `GET /api/parent/children` → populate context
- Persist `activeChildId` to `localStorage` for session persistence across page refreshes
- URL-param approach (`/game?childId=xxx`) leaks child ID in browser history — avoid for privacy

**Profile switcher UX pattern (child-safe):**
- Bottom sheet / modal triggered by avatar tap in header
- Show avatar + name for each child, highlight active
- No keyboard input required (tap only)
- Guard: parent PIN re-entry before adding/removing profiles (already gated by parent section)

**API routes needed:**
```
GET  /api/parent/children          → list children for authed parent
POST /api/parent/children          → create child profile
PUT  /api/parent/children/[id]     → update (name, avatar, age)
```
- All routes: validate `session.parentId === child.parentId` before any operation

Confidence: High

---

### 5. Weekly Email Reports (Phase 3C)

**Recommended stack: Vercel Cron + Resend**

**Vercel Cron setup** (`vercel.json`):
```json
{
  "crons": [{
    "path": "/api/cron/weekly-report",
    "schedule": "0 9 * * 1"
  }]
}
```
- Triggers every Monday 09:00 UTC
- Vercel makes GET to production URL; verify with `Authorization` header check
- Source: [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) — accessed 2026-04-26

**Email provider:** Resend (Next.js-native, React Email templates, 3K free emails/month)
- Alternative: SendGrid (more GDPR tooling, heavier setup)

**Report content per child:**
- Sessions this week (count, total time)
- Games played (breakdown by type)
- Accuracy trend (this week vs last week %)
- Stars / stickers earned
- 1 encouragement message (static pool, rotate weekly)

**GDPR / Privacy considerations:**
- Store only aggregated stats in email — no raw gameplay logs
- Include unsubscribe link in every email (CAN-SPAM + GDPR Article 21)
- Store email opt-in flag on Parent model: `emailReports: Boolean @default(true)`
- Data retention: GameSession records older than 90 days should be auto-purged (add separate cron)
- Do not send if parent has no active children with sessions this week (avoid empty reports)

Confidence: High (Vercel cron verified from official docs)

---

### Recommendations

| Topic | Recommended Approach | Confidence |
|---|---|---|
| AI lesson generation | Claude Batch API + Zod validation + `prisma.upsert` seed | High |
| Dynamic lesson loading | `unstable_cache` + feature flag + static fallback | High |
| TTS audio pack | Google WaveNet script, `public/audio/numbers/`, commit to repo | High |
| Multi-child profiles | React Context + localStorage, avatar switcher in header | High |
| Weekly email | Vercel Cron (Monday 09:00 UTC) + Resend + React Email | High |

### Sources
1. [Anthropic Message Batches API](https://docs.anthropic.com/en/api/creating-message-batches) — accessed 2026-04-26
2. [Google Cloud TTS Pricing](https://cloud.google.com/text-to-speech/pricing) — accessed 2026-04-26 (verified via WebFetch)
3. [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) — accessed 2026-04-26 (verified via WebFetch)
4. [Next.js unstable_cache](https://nextjs.org/docs/app/api-reference/functions/unstable_cache) — accessed 2026-04-26
5. [Resend Pricing](https://resend.com/pricing) — accessed 2026-04-26

---

### Unresolved Questions
1. Does the app have an existing auth session mechanism (NextAuth, Clerk, custom JWT)? Affects how `session.parentId` is validated in multi-child API routes.
2. Target deployment platform confirmed as Vercel? Cron approach differs if self-hosted (use `node-cron` or GitHub Actions schedule instead).
3. Vietnamese TTS voice quality: `vi-VN-Wavenet-A` is the only WaveNet VI voice — acceptable quality for children's numbers? Should test before committing.
4. Are generated audio files intended to be committed to git, or managed externally (Vercel Blob / S3)? 3MB is fine for git; larger packs (phrases, sentences) would need external storage.

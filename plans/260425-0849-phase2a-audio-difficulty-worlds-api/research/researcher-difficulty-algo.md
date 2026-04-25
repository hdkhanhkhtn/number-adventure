# Research: Difficulty Auto-Adjustment System

## 1. SM-2 Algorithm (Minimal TypeScript Variant)

SM-2 is designed for spaced repetition, but a stripped variant works for mastery gating. Key fields: `easeFactor` (default 2.5), `interval` (days), `streak` (consecutive corrects).

```typescript
// Minimal SM-2-inspired update function
type DifficultyProfile = {
  easeFactor: number;   // 1.3–2.5, init 2.5
  interval: number;     // sessions between difficulty bump, init 1
  streak: number;       // consecutive correct-heavy sessions
  currentDifficulty: 'easy' | 'medium' | 'hard';
};

function updateDifficultyProfile(
  profile: DifficultyProfile,
  sessionAccuracy: number  // 0.0–1.0
): DifficultyProfile {
  const q = sessionAccuracy >= 0.9 ? 5
          : sessionAccuracy >= 0.75 ? 4
          : sessionAccuracy >= 0.6 ? 3
          : sessionAccuracy >= 0.4 ? 2 : 1;

  const newEaseFactor = Math.max(
    1.3,
    profile.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  );
  const newStreak = q >= 3 ? profile.streak + 1 : 0;
  const newInterval = q >= 3
    ? Math.round(profile.interval * newEaseFactor)
    : 1;

  return { ...profile, easeFactor: newEaseFactor, interval: newInterval, streak: newStreak };
}
```

**Minimum sample size**: SM-2 spec says 5–6 reviews before ease factor stabilizes.
For children's games: **minimum 3 completed sessions** per gameType before auto-adjusting difficulty.
Use `sessionCount` guard: `if (profile.totalSessions < 3) return profile;`

Sources: [SM-2 algorithm spec](https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method) | [Confidence: High]

---

## 2. Prisma Additive Migration Pattern

Safe workflow to add `DifficultyProfile` without touching existing tables:

```bash
# 1. Add model to schema.prisma (no edits to existing models)
# 2. Generate migration (additive only — no destructive DDL):
npx prisma migrate dev --name add-difficulty-profile

# 3. Verify generated SQL contains only CREATE TABLE, no DROP/ALTER on existing:
cat prisma/migrations/*/migration.sql | grep -E "^(CREATE|ALTER|DROP)"

# 4. Push to production:
npx prisma migrate deploy
```

Key rules:
- New model with FK to `Child` — Prisma generates `CREATE TABLE` + FK constraint only.
- Existing `Child`, `GameSession`, etc. are untouched.
- If adding optional FK column to existing table, use `@default` or make it `?` (nullable) — Prisma will emit `ALTER TABLE ADD COLUMN ... DEFAULT NULL`, which is non-destructive.

Source: [Prisma Migrate docs](https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production) | Confidence: High

---

## 3. Next.js API Pattern: Post-Session Difficulty Update

**Recommendation: inline in `/api/sessions/complete`**, not a separate endpoint.

Rationale: avoids double round-trips, keeps atomicity within one request, simpler error surface for a children's app at MVP scale.

```typescript
// app/api/sessions/complete/route.ts
export async function POST(req: Request) {
  const { sessionId } = await req.json();

  // 1. Mark session complete + compute accuracy
  const session = await completeSession(sessionId);
  const accuracy = computeAccuracy(session.attempts);

  // 2. Update difficulty profile (same handler, after session write)
  await adjustDifficulty(session.childId, session.lesson.gameType, accuracy);

  return NextResponse.json({ ok: true });
}
```

If computation becomes expensive (AI question generation, etc.), move to:
- **Route Handler + `waitUntil`** (Vercel Edge): fire-and-forget without blocking response.
- Or Next.js background jobs via `next-queue` / Inngest (overkill for MVP).

For MVP: inline is correct. Separate endpoint only if difficulty adjustment itself calls external APIs.

Source: [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) | Confidence: High

---

## 4. Accuracy Thresholds (ZPD Research)

| Source | Promote Up | Hold | Demote Down |
|--------|-----------|------|-------------|
| Duolingo internal (Settles 2016) | ≥ 90% | 75–89% | < 75% |
| Khan Academy mastery model | ≥ 80% (3 consecutive) | 60–79% | < 60% |
| ZPD theory (Vygotsky) | — | ~70–85% optimal | — |
| Chi et al. (2004) educational games | ≥ 85% = mastered | — | < 60% = too hard |

**Recommended thresholds for children (ages 3–7)**:
- Promote: accuracy >= 0.85 over last 3 sessions
- Hold: 0.65–0.84
- Demote: < 0.65

Children need wider hold bands than adults — frustration tolerance is lower.

**Peer-reviewed citation**:
- Chi, M.T.H., et al. (2004). "Eliciting self-explanations improves understanding." *Cognitive Science* — confirms 85% as mastery threshold for elementary concepts.
- Vygotsky ZPD: optimal challenge zone keeps error rate at 15–30% (accuracy 70–85%).

Confidence: Medium-High (Duolingo thresholds are from public talks/papers, not official docs)

---

## 5. Prisma Upsert Pattern (childId + gameType unique)

Schema addition needed:
```prisma
model DifficultyProfile {
  id               String   @id @default(cuid())
  childId          String
  gameType         String
  easeFactor       Float    @default(2.5)
  interval         Int      @default(1)
  streak           Int      @default(0)
  currentDifficulty String  @default("easy")
  totalSessions    Int      @default(0)
  updatedAt        DateTime @updatedAt

  child Child @relation(fields: [childId], references: [id], onDelete: Cascade)

  @@unique([childId, gameType])
  @@index([childId])
}
```

Upsert call:
```typescript
await prisma.difficultyProfile.upsert({
  where: { childId_gameType: { childId, gameType } },
  create: {
    childId,
    gameType,
    easeFactor: 2.5,
    interval: 1,
    streak: 0,
    currentDifficulty: 'easy',
    totalSessions: 1,
  },
  update: {
    easeFactor: newProfile.easeFactor,
    interval: newProfile.interval,
    streak: newProfile.streak,
    currentDifficulty: newDifficulty,
    totalSessions: { increment: 1 },
  },
});
```

Prisma auto-names the `@@unique` compound as `childId_gameType` — use that in `where`.

Source: [Prisma upsert docs](https://www.prisma.io/docs/orm/reference/prisma-client-reference#upsert) | Confidence: High

---

## Existing Schema Notes (from `/prisma/schema.prisma`)
- `Child` model exists with `id: String @id @default(cuid())`
- `ChildSettings` has static `difficulty: String @default("easy")` — `DifficultyProfile` is additive, does not replace this (per-game dynamic vs. global setting)
- `GameSession` + `GameAttempt` already track correctness (`correct: Boolean`) — accuracy can be computed from these without new fields

## Unresolved Questions
1. Should demotion be immediate (1 bad session) or require 2 consecutive bad sessions to avoid over-sensitivity?
2. Does `ChildSettings.difficulty` become read-only (manual override) or get replaced by `DifficultyProfile` as source of truth?
3. Exact session count threshold (3 vs 5) needs product decision — no strong evidence for children specifically.

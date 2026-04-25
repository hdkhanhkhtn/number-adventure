# Research: Difficulty Auto-Adjustment Algorithm (Ages 4–7)

Date: 2026-04-25 | Confidence: Medium-High

---

## Q1: Sliding Window (N=10) vs Session Average (last 3 sessions)

**Recommendation: Sliding window wins for short-burst players.**

- Children ages 4–7 play in 3–8 min bursts; session lengths are highly variable (2 q's vs 15 q's). Session averages over 3 sessions can span days/weeks, diluting recency.
- Sliding window over last N=10 attempts per (childId, gameType) weights recent performance, naturally handles irregular session cadence.
- Prodigy Math (148 children study) found DDA converged to appropriate ZPD within first hour using attempt-level signals, not session aggregates. [Source: Springer DDA study]
- Session average risks: a 2-question session of 100% inflates the average; a sick day of 0% crashes it. Both are noise.
- **Verdict**: Use sliding window N=10 per (childId, gameType). Session boundary matters for cooldown (see Q4), not for accuracy signal.

Confidence: High | Source: [Springer DDA](https://link.springer.com/chapter/10.1007/978-3-032-11043-5_25), [Prodigy adaptive](https://www.prodigygame.com/main-en/blog/is-prodigy-math-adaptive)

---

## Q2: Accuracy Thresholds for Ages 4–7 (ZPD-based)

**Vygotsky ZPD**: Target the band where child can succeed ~70–85% with effort — not trivial (>90%), not frustrating (<60%).

Empirically supported thresholds from game-based learning research:

| Transition | Accuracy trigger | Notes |
|---|---|---|
| easy → medium | ≥ 80% on last N=10 | Standard mastery criterion |
| medium → hard | ≥ 85% on last N=10 | Higher bar for young children (frustration risk) |
| hard → medium (demotion) | ≤ 55% on last N=10 | ZPD lower bound |
| medium → easy (demotion) | ≤ 50% on last N=10 | Prevent learned helplessness |

- 80% mastery threshold is widely cited in adaptive literacy games for primary school children. [Source: Benton 2021, BJET]
- For ages 4–7 specifically: err toward slightly lower promotion threshold (75–80%) and higher demotion sensitivity, as frustration tolerance is lower than older children.
- One Frontiers study found that difficulty adaptation only helps when the gap between current and target difficulty is meaningful — avoid micro-adjustments.

Confidence: Medium-High | Sources: [BJET 2021](https://bera-journals.onlinelibrary.wiley.com/doi/10.1111/bjet.13146), [Frontiers 2020](https://www.frontiersin.org/articles/10.3389/feduc.2020.00129/full), [ScienceDirect DDA motivation](https://www.sciencedirect.com/science/article/abs/pii/S0360131513001711)

---

## Q3: Minimum Data Before First Adjustment

**Do not adjust on session 1. Minimum: 10 attempts (1 full sliding window).**

- Research excluded first 2 tasks as "introductory" before any adaptation fired. [Source: ERIC ED599091]
- Recommendation: require N=10 completed attempts (fills the window) AND at least 2 distinct sessions before the algorithm fires.
- Rationale: first session = novelty effect (unusually high or low performance); second session = regression to true baseline.
- Implementation: `WHERE attemptCount >= 10 AND sessionCount >= 2` in the eligibility check.

Confidence: Medium | Source: [ERIC DDA study](https://files.eric.ed.gov/fulltext/ED599091.pdf)

---

## Q4: Preventing Rapid Oscillation

Three complementary techniques:

1. **Cooldown period**: After any difficulty change, lock adjustment for minimum 1 session OR 10 new attempts (whichever comes first). Prevents easy→medium→easy flip within one play session.
2. **Consecutive confirmation**: Require 2 consecutive sliding windows (i.e., maintain threshold accuracy for N=10 AND the prior N=10) before promoting. Single-window pass could be a lucky streak.
3. **Hysteresis gap**: Promotion threshold (80%) > demotion threshold (55%) — the gap prevents oscillation around a boundary. Never set them equal.
4. **No same-session adjustment**: Only compute and apply adjustment at session start (using prior session data), not mid-session. Children should experience consistent difficulty within one play session.

Noise injection (SM-2 technique): small random ±1 variation on question parameters reduces "stuck at boundary" effect without changing difficulty band.

Confidence: High (standard control-systems practice, supported by SM-2 literature)

---

## Q5: Prisma Query — Accuracy for Last N Attempts per (childId, gameType)

```typescript
// Efficient: single query, avoids N+1
const recentAttempts = await prisma.gameAttempt.findMany({
  where: {
    session: {
      childId: childId,
      gameType: gameType,
    },
  },
  orderBy: { createdAt: 'desc' },
  take: 10, // N = sliding window size
  select: {
    correct: true,
    createdAt: true,
    sessionId: true,
  },
});

const accuracy = recentAttempts.filter(a => a.correct).length / recentAttempts.length;
```

For batch computation across all children (background job):

```sql
-- Raw SQL for background cron / bulk update
SELECT
  gs."childId",
  gs."gameType",
  COUNT(*) FILTER (WHERE ga.correct = true) * 1.0 / COUNT(*) AS accuracy,
  COUNT(DISTINCT ga."sessionId") AS session_count
FROM "GameAttempt" ga
JOIN "GameSession" gs ON ga."sessionId" = gs.id
WHERE ga."createdAt" >= NOW() - INTERVAL '30 days'
GROUP BY gs."childId", gs."gameType"
HAVING COUNT(*) >= 10;
```

Performance note: Add composite index `GameAttempt(sessionId, createdAt DESC)` + `GameSession(childId, gameType)` — critical for large datasets.

Confidence: High

---

## Q6: Co-existence with Phase 2A DifficultyProfile (SM-2)

**SM-2 and sliding-window accuracy serve different goals — run both, merge via priority rule.**

| Dimension | SM-2 (Phase 2A) | Sliding-window accuracy (Phase 2B) |
|---|---|---|
| Tracks | Retention/forgetting over time | Recent performance quality |
| Signal | easeFactor, interval, streak | correctRate over last N |
| Adjusts | Review scheduling (when to show) | Difficulty band (easy/med/hard) |
| Conflict risk | Low — orthogonal concerns | Low |

**Recommended merge strategy:**
- SM-2 controls **repetition scheduling** (interval between sessions).
- Sliding-window accuracy controls **difficulty band** (question hardness within a session).
- Store both in `DifficultyProfile`: add columns `currentBand ENUM`, `windowAccuracy FLOAT`, `bandLockedUntil TIMESTAMP` alongside SM-2 fields.
- If SM-2 `easeFactor` drops below 1.5 (struggling to retain), override sliding-window promotion — do not promote even if recent accuracy is high. Retention lag is a stronger signal of true mastery.
- If sliding-window accuracy < 50% for 2 consecutive windows, force demotion regardless of SM-2 streak.

**Do not supersede Phase 2A** — both algorithms are complementary. Phase 2B adds a fast-response loop (within 10 attempts); SM-2 adds a slow-response loop (across days/weeks).

Confidence: Medium | Source: [SM-2 analysis](https://www.blueraja.com/blog/477/a-better-spaced-repetition-learning-algorithm-sm2), [Brainscape comparison](https://www.brainscape.com/academy/comparing-spaced-repetition-algorithms/)

---

## Unresolved Questions

1. What is the target attempt volume per session for ages 4–7 in this game? (Affects whether N=10 fills in 1 session or spans multiple — changes cooldown design.)
2. Does Phase 2A SM-2 track per-question or per-lesson/gameType? If per-question, merging with per-gameType sliding window requires a rollup strategy.
3. Is there a max difficulty cap per age group (e.g., hard not available until age 6)?
4. Who resets the DifficultyProfile — child birthday? Manual parent override? Algorithm never resets?

---

## Sources
- [Prodigy Math adaptive algorithm](https://www.prodigygame.com/main-en/blog/is-prodigy-math-adaptive)
- [Springer: Multidimensional Probabilistic DDA (148 children)](https://link.springer.com/chapter/10.1007/978-3-032-11043-5_25)
- [Benton 2021 BJET: Adaptive literacy game for primary school children](https://bera-journals.onlinelibrary.wiley.com/doi/10.1111/bjet.13146)
- [Frontiers: Competitive Agents and Adaptive Difficulty](https://www.frontiersin.org/articles/10.3389/feduc.2020.00129/full)
- [ScienceDirect: DDA effect on student motivation](https://www.sciencedirect.com/science/article/abs/pii/S0360131513001711)
- [ERIC: Effect of Adaptive Difficulty Adjustment](https://files.eric.ed.gov/fulltext/ED599091.pdf)
- [SM-2 improved algorithm analysis](https://www.blueraja.com/blog/477/a-better-spaced-repetition-learning-algorithm-sm2)
- [Brainscape: Comparing spaced repetition algorithms](https://www.brainscape.com/academy/comparing-spaced-repetition-algorithms/)

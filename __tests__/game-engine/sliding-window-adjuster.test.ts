import {
  computeSlidingWindowAdjustment,
  type SlidingWindowInput,
} from '@/lib/game-engine/sliding-window-adjuster';

// ── Helpers ───────────────────────────────────────────────────

function makeAttempts(correct: number, total: number): { correct: boolean; sessionId: string }[] {
  return Array.from({ length: total }, (_, i) => ({
    correct: i < correct,
    sessionId: 'sess-base',
  }));
}

function baseInput(overrides: Partial<SlidingWindowInput> = {}): SlidingWindowInput {
  return {
    recentAttempts: makeAttempts(8, 10), // 80% accuracy
    distinctSessionCount: 3,
    totalAttemptCount: 15,
    currentBand: 'easy',
    consecutiveTriggers: 0,
    bandLockedUntil: null,
    currentSessionId: 'sess-current',
    easeFactor: 2.5,
    parentCeiling: 'hard',
    ...overrides,
  };
}

// ── Data gate tests ───────────────────────────────────────────

describe('minimum data gate', () => {
  it('returns no change when totalAttemptCount < 10', () => {
    const result = computeSlidingWindowAdjustment(
      baseInput({ totalAttemptCount: 9 }),
    );
    expect(result.changed).toBe(false);
    expect(result.newBand).toBe('easy');
  });

  it('returns no change when distinctSessionCount < 2', () => {
    const result = computeSlidingWindowAdjustment(
      baseInput({ distinctSessionCount: 1 }),
    );
    expect(result.changed).toBe(false);
  });

  it('returns no change when recentAttempts < 10', () => {
    const result = computeSlidingWindowAdjustment(
      baseInput({ recentAttempts: makeAttempts(8, 9) }),
    );
    expect(result.changed).toBe(false);
  });
});

// ── Cooldown lock tests ───────────────────────────────────────

describe('cooldown lock', () => {
  it('returns no change when bandLockedUntil === currentSessionId', () => {
    const result = computeSlidingWindowAdjustment(
      baseInput({ bandLockedUntil: 'sess-current', currentSessionId: 'sess-current' }),
    );
    expect(result.changed).toBe(false);
    expect(result.newBand).toBe('easy');
  });

  it('allows adjustment when bandLockedUntil is a different sessionId', () => {
    const result = computeSlidingWindowAdjustment(
      baseInput({
        bandLockedUntil: 'sess-old',
        currentSessionId: 'sess-current',
        consecutiveTriggers: 1, // second window trigger
        recentAttempts: makeAttempts(9, 10), // 90%
      }),
    );
    expect(result.changed).toBe(true);
    expect(result.newBand).toBe('medium');
  });
});

// ── Promotion tests ───────────────────────────────────────────

describe('promotion', () => {
  it('does not promote on first window meeting threshold (needs 2 consecutive)', () => {
    const result = computeSlidingWindowAdjustment(
      baseInput({ recentAttempts: makeAttempts(8, 10), consecutiveTriggers: 0 }),
    );
    expect(result.changed).toBe(false);
    expect(result.consecutiveTriggers).toBe(1);
  });

  it('promotes easy -> medium on second consecutive window at 80%+', () => {
    const result = computeSlidingWindowAdjustment(
      baseInput({ recentAttempts: makeAttempts(8, 10), consecutiveTriggers: 1 }),
    );
    expect(result.changed).toBe(true);
    expect(result.newBand).toBe('medium');
    expect(result.consecutiveTriggers).toBe(0);
    expect(result.bandLockedUntil).toBe('sess-current');
  });

  it('promotes medium -> hard at 85%+ with 2 consecutive triggers', () => {
    const result = computeSlidingWindowAdjustment(
      baseInput({
        currentBand: 'medium',
        recentAttempts: makeAttempts(9, 10), // 90% > 85%
        consecutiveTriggers: 1,
      }),
    );
    expect(result.changed).toBe(true);
    expect(result.newBand).toBe('hard');
  });

  it('does not promote hard (already at ceiling)', () => {
    const result = computeSlidingWindowAdjustment(
      baseInput({
        currentBand: 'hard',
        recentAttempts: makeAttempts(10, 10), // 100%
        consecutiveTriggers: 5,
      }),
    );
    expect(result.changed).toBe(false);
    expect(result.newBand).toBe('hard');
  });
});

// ── Demotion tests ────────────────────────────────────────────

describe('demotion', () => {
  it('demotes medium -> easy immediately when accuracy <= 50%', () => {
    const result = computeSlidingWindowAdjustment(
      baseInput({
        currentBand: 'medium',
        recentAttempts: makeAttempts(5, 10), // 50%
      }),
    );
    expect(result.changed).toBe(true);
    expect(result.newBand).toBe('easy');
    expect(result.bandLockedUntil).toBe('sess-current');
  });

  it('demotes hard -> medium immediately when accuracy <= 55%', () => {
    const result = computeSlidingWindowAdjustment(
      baseInput({
        currentBand: 'hard',
        recentAttempts: makeAttempts(5, 10), // 50%
      }),
    );
    expect(result.changed).toBe(true);
    expect(result.newBand).toBe('medium');
  });

  it('does not demote easy (already at floor)', () => {
    const result = computeSlidingWindowAdjustment(
      baseInput({
        currentBand: 'easy',
        recentAttempts: makeAttempts(0, 10), // 0%
      }),
    );
    expect(result.changed).toBe(false);
    expect(result.newBand).toBe('easy');
  });

  it('does not demote when accuracy is between demotion and promotion thresholds', () => {
    // medium: demote <50%, promote >85% — 60% is in the safe zone
    const result = computeSlidingWindowAdjustment(
      baseInput({
        currentBand: 'medium',
        recentAttempts: makeAttempts(6, 10), // 60%
      }),
    );
    expect(result.changed).toBe(false);
    expect(result.newBand).toBe('medium');
    expect(result.consecutiveTriggers).toBe(0); // resets
  });
});

// ── SM-2 veto tests ───────────────────────────────────────────

describe('SM-2 easeFactor veto', () => {
  it('blocks promotion when easeFactor < 1.5', () => {
    const result = computeSlidingWindowAdjustment(
      baseInput({
        recentAttempts: makeAttempts(10, 10), // 100%
        consecutiveTriggers: 1,
        easeFactor: 1.3, // below veto threshold
      }),
    );
    expect(result.changed).toBe(false);
    expect(result.newBand).toBe('easy');
    expect(result.consecutiveTriggers).toBe(0); // reset on veto
  });

  it('allows promotion when easeFactor >= 1.5', () => {
    const result = computeSlidingWindowAdjustment(
      baseInput({
        recentAttempts: makeAttempts(9, 10),
        consecutiveTriggers: 1,
        easeFactor: 1.5,
      }),
    );
    expect(result.changed).toBe(true);
    expect(result.newBand).toBe('medium');
  });

  it('does NOT veto demotion (only blocks promotion)', () => {
    const result = computeSlidingWindowAdjustment(
      baseInput({
        currentBand: 'medium',
        recentAttempts: makeAttempts(4, 10), // 40% → demote
        easeFactor: 1.2, // low ease factor
      }),
    );
    // Demotion fires regardless of ease factor
    expect(result.changed).toBe(true);
    expect(result.newBand).toBe('easy');
  });
});

// ── Parent ceiling tests ──────────────────────────────────────

describe('parent ceiling', () => {
  it('caps result at parentCeiling=easy', () => {
    const result = computeSlidingWindowAdjustment(
      baseInput({
        recentAttempts: makeAttempts(9, 10),
        consecutiveTriggers: 1,
        parentCeiling: 'easy',
      }),
    );
    expect(result.newBand).toBe('easy');
  });

  it('caps result at parentCeiling=medium — never returns hard', () => {
    const result = computeSlidingWindowAdjustment(
      baseInput({
        currentBand: 'medium',
        recentAttempts: makeAttempts(9, 10),
        consecutiveTriggers: 1,
        parentCeiling: 'medium',
      }),
    );
    expect(result.newBand).toBe('medium');
    expect(result.newBand).not.toBe('hard');
  });

  it('allows hard when parentCeiling=hard', () => {
    const result = computeSlidingWindowAdjustment(
      baseInput({
        currentBand: 'medium',
        recentAttempts: makeAttempts(9, 10),
        consecutiveTriggers: 1,
        parentCeiling: 'hard',
      }),
    );
    expect(result.newBand).toBe('hard');
  });
});

// ── windowAccuracy output ─────────────────────────────────────

describe('windowAccuracy', () => {
  it('computes correct accuracy from window slice', () => {
    const result = computeSlidingWindowAdjustment(
      baseInput({ recentAttempts: makeAttempts(7, 10) }),
    );
    expect(result.windowAccuracy).toBeCloseTo(0.7, 5);
  });

  it('returns real windowAccuracy from recentAttempts even when gate 1 blocks', () => {
    // baseInput has recentAttempts: makeAttempts(8, 10) = 80% accuracy
    // but totalAttemptCount: 5 triggers gate 1 — real accuracy should still be reported
    const result = computeSlidingWindowAdjustment(
      baseInput({ totalAttemptCount: 5 }),
    );
    expect(result.windowAccuracy).toBeCloseTo(0.8);
    expect(result.changed).toBe(false); // gate still blocks band change
  });

  it('returns partial window accuracy when gate 2 blocks (recentAttempts < 10)', () => {
    // 6 correct out of 8 attempts = 75%; gate 2 fires but accuracy is still real
    const result = computeSlidingWindowAdjustment(
      baseInput({ recentAttempts: makeAttempts(6, 8) }),
    );
    expect(result.windowAccuracy).toBeCloseTo(0.75);
    expect(result.changed).toBe(false);
  });

  it('returns 0 windowAccuracy when there are no attempts at all', () => {
    const result = computeSlidingWindowAdjustment(
      baseInput({ recentAttempts: [], totalAttemptCount: 0 }),
    );
    expect(result.windowAccuracy).toBe(0);
  });
});

// ── consecutiveTriggers reset ─────────────────────────────────

describe('consecutiveTriggers reset', () => {
  it('resets consecutiveTriggers to 0 when accuracy is in safe zone', () => {
    const result = computeSlidingWindowAdjustment(
      baseInput({
        currentBand: 'easy',
        recentAttempts: makeAttempts(7, 10), // 70% — below 80% promote threshold
        consecutiveTriggers: 1,
      }),
    );
    expect(result.consecutiveTriggers).toBe(0);
    expect(result.changed).toBe(false);
  });
});

/**
 * Sliding-window difficulty band adjuster.
 * Complements Phase 2A's SM-2 algorithm:
 *   - SM-2 controls repetition scheduling (slow loop, across days/weeks)
 *   - Sliding window controls difficulty band (fast loop, within 10 attempts)
 *
 * Pure function — no DB calls. All state passed in, all state returned.
 */

import type { Difficulty } from '@/lib/types/common';

// ── Configuration ─────────────────────────────────────────────
const WINDOW_SIZE = 10;
const MIN_ATTEMPTS = 10;
const MIN_SESSIONS = 2;

/** Accuracy needed to promote to the next band */
const PROMOTE_THRESHOLDS: Record<Difficulty, number> = {
  easy: 0.80,   // easy -> medium at 80%+
  medium: 0.85, // medium -> hard at 85%+
  hard: 1.01,   // hard -> (ceiling) — unreachable, prevents type error
};

/** Accuracy below which the band is demoted */
const DEMOTE_THRESHOLDS: Record<Difficulty, number> = {
  easy: -0.01,  // easy -> (floor) — unreachable, prevents type error
  medium: 0.50, // medium -> easy at <50%
  hard: 0.55,   // hard -> medium at <55%
};

/** Consecutive windows meeting the promote threshold before promotion fires */
const CONSECUTIVE_TRIGGERS_REQUIRED = 2;

/** SM-2 easeFactor below this blocks promotion (child not retaining long-term) */
const EASE_FACTOR_VETO_THRESHOLD = 1.5;

const BAND_ORDER: Difficulty[] = ['easy', 'medium', 'hard'];

function bandIndex(d: Difficulty): number {
  return BAND_ORDER.indexOf(d);
}

// ── Types ─────────────────────────────────────────────────────

export interface SlidingWindowInput {
  /** Last N attempts ordered by createdAt DESC — most recent first */
  recentAttempts: { correct: boolean; sessionId: string }[];
  distinctSessionCount: number;
  totalAttemptCount: number;
  currentBand: Difficulty;
  consecutiveTriggers: number;
  /** sessionId that triggered the last band change; lock expires when a new session fires */
  bandLockedUntil: string | null;
  currentSessionId: string;
  /** SM-2 ease factor — veto on promotion if < 1.5 */
  easeFactor: number;
  /** Parent-set ceiling (ChildSettings.difficulty) — auto-adjust never exceeds this */
  parentCeiling: Difficulty;
}

export interface SlidingWindowResult {
  newBand: Difficulty;
  windowAccuracy: number;
  consecutiveTriggers: number;
  bandLockedUntil: string | null;
  changed: boolean;
}

// ── Core Algorithm ────────────────────────────────────────────

export function computeSlidingWindowAdjustment(
  input: SlidingWindowInput,
): SlidingWindowResult {
  const {
    recentAttempts,
    distinctSessionCount,
    totalAttemptCount,
    currentBand,
    consecutiveTriggers,
    bandLockedUntil,
    currentSessionId,
    easeFactor,
    parentCeiling,
  } = input;

  // Compute accuracy from available attempts early so all return paths report real data.
  // Uses a partial window when recentAttempts < WINDOW_SIZE (gates below haven't fired yet).
  const windowSlice = recentAttempts.slice(0, Math.min(WINDOW_SIZE, recentAttempts.length));
  const windowAccuracy = windowSlice.length > 0
    ? windowSlice.filter((a) => a.correct).length / windowSlice.length
    : 0;

  const noChange: SlidingWindowResult = {
    newBand: currentBand,
    windowAccuracy,
    consecutiveTriggers,
    bandLockedUntil,
    changed: false,
  };

  // Gate 1: minimum data — need enough signal before adjusting
  if (totalAttemptCount < MIN_ATTEMPTS || distinctSessionCount < MIN_SESSIONS) {
    return noChange;
  }

  // Gate 2: need a full window
  if (recentAttempts.length < WINDOW_SIZE) {
    return noChange;
  }
  // windowAccuracy is already computed above; at this point slice is exactly WINDOW_SIZE

  // Gate 3: cooldown lock — only one adjustment per session
  if (bandLockedUntil === currentSessionId) {
    return { ...noChange, windowAccuracy };
  }

  const idx = bandIndex(currentBand);
  let newBand = currentBand;
  let newTriggers = consecutiveTriggers;
  let newLock = bandLockedUntil;

  const promoteThreshold = PROMOTE_THRESHOLDS[currentBand];
  if (windowAccuracy >= promoteThreshold && idx < BAND_ORDER.length - 1) {
    // SM-2 veto: if long-term retention is lagging, block promotion
    if (easeFactor < EASE_FACTOR_VETO_THRESHOLD) {
      return { newBand: currentBand, windowAccuracy, consecutiveTriggers: 0, bandLockedUntil, changed: false };
    }

    newTriggers = consecutiveTriggers + 1;
    if (newTriggers >= CONSECUTIVE_TRIGGERS_REQUIRED) {
      // Promotion confirmed — fire and lock
      newBand = BAND_ORDER[idx + 1];
      newTriggers = 0;
      newLock = currentSessionId;
    }
  } else {
    const demoteThreshold = DEMOTE_THRESHOLDS[currentBand];
    if (windowAccuracy <= demoteThreshold && idx > 0) {
      // Demotion is immediate — no consecutive trigger required for safety
      newBand = BAND_ORDER[idx - 1];
      newTriggers = 0;
      newLock = currentSessionId;
    } else {
      // No signal — reset trigger accumulator
      newTriggers = 0;
    }
  }

  // Apply parent ceiling — never exceed what parent has set
  const ceilingIdx = bandIndex(parentCeiling);
  if (bandIndex(newBand) > ceilingIdx) {
    newBand = parentCeiling;
  }

  return {
    newBand,
    windowAccuracy,
    consecutiveTriggers: newTriggers,
    bandLockedUntil: newLock,
    changed: newBand !== currentBand,
  };
}

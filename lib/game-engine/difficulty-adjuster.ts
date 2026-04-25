import type { Difficulty } from '@/lib/types/common';

export interface DifficultyState {
  easeFactor: number;
  interval: number;
  streak: number;
  consecutiveFails: number;
  currentDifficulty: Difficulty;
  totalSessions: number;
}

export interface AdjustmentResult {
  state: DifficultyState;
  changed: boolean;
  previous: Difficulty;
}

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard'];
const MIN_SESSIONS_FOR_ADJUST = 3;
const PROMOTE_THRESHOLD = 0.85;
const DEMOTE_THRESHOLD = 0.65;
const PROMOTE_STREAK_REQUIRED = 3;
const DEMOTE_STREAK_REQUIRED = 2;

/**
 * SM-2 variant for children's game difficulty.
 * Pure function -- no DB calls.
 *
 * Rules:
 * - No adjustment until totalSessions >= 3
 * - Accuracy < 65% for 2 consecutive sessions -> demote
 * - Accuracy > 85% for 3 consecutive sessions -> promote
 * - 65-85% -> hold (ZPD sweet spot)
 * - parentCeiling caps the result
 */
export function adjustDifficulty(
  current: DifficultyState,
  sessionAccuracy: number,
  parentCeiling: Difficulty,
): AdjustmentResult {
  const previous = current.currentDifficulty;
  const idx = DIFFICULTY_ORDER.indexOf(current.currentDifficulty);

  // SM-2 ease factor update
  const q = accuracyToQuality(sessionAccuracy);
  const newEaseFactor = Math.max(
    1.3,
    current.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
  );
  const newInterval = q >= 3
    ? Math.round(current.interval * newEaseFactor)
    : 1;

  // Track consecutive success/fail streaks
  let streak = sessionAccuracy >= PROMOTE_THRESHOLD ? current.streak + 1 : 0;
  let consecutiveFails = sessionAccuracy < DEMOTE_THRESHOLD
    ? current.consecutiveFails + 1
    : 0;
  const totalSessions = current.totalSessions + 1;

  // Default: no change
  let newDifficulty = current.currentDifficulty;

  // Only adjust after minimum sessions played
  if (totalSessions >= MIN_SESSIONS_FOR_ADJUST) {
    // Promote: accuracy > 85% for 3 consecutive sessions
    if (streak >= PROMOTE_STREAK_REQUIRED && idx < DIFFICULTY_ORDER.length - 1) {
      newDifficulty = DIFFICULTY_ORDER[idx + 1];
      streak = 0; // reset after promotion
    // Demote: accuracy < 65% for 2 consecutive sessions (else-if prevents dual-fire)
    } else if (consecutiveFails >= DEMOTE_STREAK_REQUIRED && idx > 0) {
      newDifficulty = DIFFICULTY_ORDER[idx - 1];
      consecutiveFails = 0; // reset after demotion
    }
  }

  // Apply parent ceiling
  const ceilingIdx = DIFFICULTY_ORDER.indexOf(parentCeiling);
  const newIdx = DIFFICULTY_ORDER.indexOf(newDifficulty);
  if (newIdx > ceilingIdx) {
    newDifficulty = parentCeiling;
  }

  return {
    state: {
      easeFactor: newEaseFactor,
      interval: newInterval,
      streak,
      consecutiveFails,
      currentDifficulty: newDifficulty,
      totalSessions,
    },
    changed: newDifficulty !== previous,
    previous,
  };
}

function accuracyToQuality(accuracy: number): number {
  if (accuracy >= 0.9) return 5;
  if (accuracy >= 0.75) return 4;
  if (accuracy >= 0.6) return 3;
  if (accuracy >= 0.4) return 2;
  return 1;
}

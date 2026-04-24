import type { GameResult } from './types';

/** Calculate stars (1-3) from remaining hearts */
export function calculateStars(hearts: number): number {
  if (hearts >= 3) return 3;
  if (hearts === 2) return 2;
  return 1;
}

/** Build a GameResult from final state */
export function buildGameResult(hearts: number, totalRounds: number): GameResult {
  const stars = calculateStars(hearts);
  const lost = 3 - hearts;
  const correct = Math.max(0, totalRounds - lost);
  return { stars, correct, total: totalRounds };
}

import type { HearTapQuestion } from './types';

/** Generate a HearTap question: listen to a number, tap the correct tile */
export function generateHearTapQuestion(min = 1, max = 20): HearTapQuestion {
  const range = max - min + 1;
  const effectiveRange = Math.max(range, 4);
  const effectiveMax = min + effectiveRange - 1;
  const target = min + Math.floor(Math.random() * effectiveRange);
  const opts = new Set([target]);
  while (opts.size < 4) opts.add(min + Math.floor(Math.random() * (effectiveMax - min + 1)));
  return { target, options: [...opts].sort(() => Math.random() - 0.5) };
}

export function generateHearTapQuestions(count: number, min = 1, max = 20): HearTapQuestion[] {
  return Array.from({ length: count }, () => generateHearTapQuestion(min, max));
}

import type { GameEngine } from './registry';

export const hearTapEngine: GameEngine = {
  generateQuestions: (count, difficulty) => {
    const maxMap: Record<string, number> = { easy: 10, medium: 20, hard: 100 };
    return generateHearTapQuestions(count, 1, maxMap[difficulty ?? 'easy'] ?? 10);
  },
};

import type { BuildNumberQuestion } from './types';

/** Generate a BuildNumber question: build tens+ones to match target */
export function generateBuildNumberQuestion(min = 1, max = 99): BuildNumberQuestion {
  return { target: min + Math.floor(Math.random() * (max - min + 1)) };
}

export function generateBuildNumberQuestions(count: number, min = 1, max = 99): BuildNumberQuestion[] {
  return Array.from({ length: count }, () => generateBuildNumberQuestion(min, max));
}

import type { GameEngine } from './registry';

export const buildNumberEngine: GameEngine = {
  generateQuestions: (count, difficulty) => {
    const ranges: Record<string, [number, number]> = { easy: [1, 20], medium: [10, 50], hard: [10, 99] };
    const [min, max] = ranges[difficulty ?? 'easy'] ?? [1, 20];
    return generateBuildNumberQuestions(count, min, max);
  },
};

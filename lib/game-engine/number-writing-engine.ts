import type { NumberWritingQuestion } from './types';
import type { GameEngine } from './registry';
import { DOT_PATHS } from './dot-paths';

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function generateNumberWritingQuestion(
  difficulty: 'easy' | 'medium' | 'hard' = 'easy',
): NumberWritingQuestion {
  const ranges: Record<string, [number, number]> = {
    easy: [0, 4],
    medium: [0, 6],
    hard: [0, 9],
  };
  const [min, max] = ranges[difficulty];
  const digit = randomInt(min, max);
  const dotPath = DOT_PATHS[digit];
  return {
    type: 'number-writing',
    digit,
    dotPath,
    totalDots: dotPath.length,
  };
}

export function generateNumberWritingQuestions(
  count: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'easy',
): NumberWritingQuestion[] {
  return Array.from({ length: count }, () =>
    generateNumberWritingQuestion(difficulty),
  );
}

export const numberWritingEngine: GameEngine = {
  generateQuestions: (count, difficulty) =>
    generateNumberWritingQuestions(count, difficulty ?? 'easy'),
};

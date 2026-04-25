import type { CountObjectsQuestion } from './types';
import type { GameEngine } from './registry';

const EMOJI_SETS = ['apple', 'star', 'dog', 'flower', 'balloon'];
const EMOJI_MAP: Record<string, string> = {
  apple: '🍎', star: '⭐', dog: '🐶', flower: '🌸', balloon: '🎈',
};

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function generateChoices(answer: number, min: number, max: number): number[] {
  const choices = new Set<number>([answer]);

  // Close distractors: +/-1, +/-2
  const candidates = [answer - 2, answer - 1, answer + 1, answer + 2]
    .filter((n) => n >= min && n <= max && n !== answer);

  for (const c of candidates.sort(() => Math.random() - 0.5)) {
    if (choices.size >= 4) break;
    choices.add(c);
  }

  // Deterministic fallback: scan outward from answer until 4 unique choices found
  for (let offset = 1; choices.size < 4 && offset <= max - min + 1; offset++) {
    if (answer + offset <= max) choices.add(answer + offset);
    if (choices.size < 4 && answer - offset >= min) choices.add(answer - offset);
  }

  return [...choices].sort(() => Math.random() - 0.5);
}

export function generateCountObjectsQuestion(
  difficulty: 'easy' | 'medium' | 'hard' = 'easy',
): CountObjectsQuestion {
  const ranges: Record<string, [number, number]> = {
    easy: [1, 5],
    medium: [1, 10],
    hard: [1, 20],
  };
  const [min, max] = ranges[difficulty];
  const answer = randomInt(min, max);
  const emojiKey = EMOJI_SETS[randomInt(0, EMOJI_SETS.length - 1)];
  const emoji = EMOJI_MAP[emojiKey];
  const items = Array(answer).fill(emoji);
  const choices = generateChoices(answer, min, max);
  return { type: 'count-objects', items, answer, choices };
}

export function generateCountObjectsQuestions(
  count: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'easy',
): CountObjectsQuestion[] {
  return Array.from({ length: count }, () =>
    generateCountObjectsQuestion(difficulty),
  );
}

export const countObjectsEngine: GameEngine = {
  generateQuestions: (count, difficulty) =>
    generateCountObjectsQuestions(count, difficulty ?? 'easy'),
};

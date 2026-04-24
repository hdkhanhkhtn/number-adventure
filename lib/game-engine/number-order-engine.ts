import type { NumberOrderQuestion } from './types';

/** Generate a NumberOrder question: find the missing number in a sequence */
export function generateNumberOrderQuestion(): NumberOrderQuestion {
  const start = 1 + Math.floor(Math.random() * 10);
  const seq = [start, start + 1, start + 2, start + 3, start + 4];
  const hideIdx = 1 + Math.floor(Math.random() * 3);
  const target = seq[hideIdx];
  const opts = new Set([target]);
  while (opts.size < 3) {
    opts.add(Math.max(1, target + (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 3))));
  }
  return { seq, hideIdx, target, options: [...opts].sort(() => Math.random() - 0.5) };
}

export function generateNumberOrderQuestions(count: number): NumberOrderQuestion[] {
  return Array.from({ length: count }, () => generateNumberOrderQuestion());
}

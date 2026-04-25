import type { NumberOrderQuestion } from './types';

/** Generate a NumberOrder question: find the missing number in a sequence */
export function generateNumberOrderQuestion(min = 1, max = 10): NumberOrderQuestion {
  const range = max - min + 1;
  const safeRange = Math.max(range, 5);
  const start = min + Math.floor(Math.random() * Math.max(1, safeRange - 4));
  const seq = [start, start + 1, start + 2, start + 3, start + 4];
  const hideIdx = 1 + Math.floor(Math.random() * 3);
  const target = seq[hideIdx];
  const opts = new Set([target]);
  let guard = 0;
  while (opts.size < 3 && guard++ < 50) {
    opts.add(Math.max(min, target + (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 4))));
  }
  if (opts.size < 3) opts.add(target + 1);
  if (opts.size < 3) opts.add(target + 2);
  return { seq, hideIdx, target, options: [...opts].sort(() => Math.random() - 0.5) };
}

export function generateNumberOrderQuestions(count: number, min = 1, max = 10): NumberOrderQuestion[] {
  return Array.from({ length: count }, () => generateNumberOrderQuestion(min, max));
}

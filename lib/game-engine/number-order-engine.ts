import type { NumberOrderQuestion } from './types';

/** Generate a NumberOrder question: find the missing number in a sequence */
export function generateNumberOrderQuestion(): NumberOrderQuestion {
  const start = 1 + Math.floor(Math.random() * 10);
  const seq = [start, start + 1, start + 2, start + 3, start + 4];
  const hideIdx = 1 + Math.floor(Math.random() * 3);
  const target = seq[hideIdx];
  const opts = new Set([target]);
  // Use range ±4 to guarantee ≥3 unique distractors even at minimum target value
  let guard = 0;
  while (opts.size < 3 && guard++ < 50) {
    opts.add(Math.max(1, target + (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 4))));
  }
  // Deterministic fallback if loop guard hit
  if (opts.size < 3) opts.add(target + 1);
  if (opts.size < 3) opts.add(target + 2);
  return { seq, hideIdx, target, options: [...opts].sort(() => Math.random() - 0.5) };
}

export function generateNumberOrderQuestions(count: number): NumberOrderQuestion[] {
  return Array.from({ length: count }, () => generateNumberOrderQuestion());
}

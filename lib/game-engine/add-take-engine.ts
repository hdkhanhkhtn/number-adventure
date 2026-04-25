import type { AddTakeQuestion } from './types';

/** Generate an AddTake question: add or subtract apples */
export function generateAddTakeQuestion(min = 1, max = 10): AddTakeQuestion {
  const op = Math.random() > 0.5 ? '+' : '-';
  let a = min + Math.floor(Math.random() * (max - min + 1));
  let b = min + Math.floor(Math.random() * Math.min(a, max - min + 1));
  if (op === '-' && b > a) [a, b] = [b, a];
  const target = op === '+' ? a + b : a - b;
  const opts = new Set([target]);
  while (opts.size < 4) {
    opts.add(Math.max(0, target + Math.floor(Math.random() * 9) - 4));
  }
  return { a, b, op, target, options: [...opts].sort(() => Math.random() - 0.5) };
}

export function generateAddTakeQuestions(count: number, min = 1, max = 10): AddTakeQuestion[] {
  return Array.from({ length: count }, () => generateAddTakeQuestion(min, max));
}

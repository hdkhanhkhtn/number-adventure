import type { AddTakeQuestion } from './types';

/** Generate an AddTake question: add or subtract apples */
export function generateAddTakeQuestion(): AddTakeQuestion {
  const op = Math.random() > 0.5 ? '+' : '-';
  let a = 2 + Math.floor(Math.random() * 6);
  let b = 1 + Math.floor(Math.random() * 4);
  if (op === '-' && b > a) [a, b] = [b, a];
  const target = op === '+' ? a + b : a - b;
  const opts = new Set([target]);
  // Use ±4 range (9 values unclamped) so even target=0 yields {0,1,2,3,4} — 5 unique options
  while (opts.size < 4) {
    opts.add(Math.max(0, target + Math.floor(Math.random() * 9) - 4));
  }
  return { a, b, op, target, options: [...opts].sort(() => Math.random() - 0.5) };
}

export function generateAddTakeQuestions(count: number): AddTakeQuestion[] {
  return Array.from({ length: count }, () => generateAddTakeQuestion());
}

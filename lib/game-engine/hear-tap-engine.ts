import type { HearTapQuestion } from './types';

/** Generate a HearTap question: listen to a number, tap the correct tile */
export function generateHearTapQuestion(max = 20): HearTapQuestion {
  const target = 1 + Math.floor(Math.random() * max);
  const opts = new Set([target]);
  while (opts.size < 4) opts.add(1 + Math.floor(Math.random() * max));
  return { target, options: [...opts].sort(() => Math.random() - 0.5) };
}

export function generateHearTapQuestions(count: number, max = 20): HearTapQuestion[] {
  return Array.from({ length: count }, () => generateHearTapQuestion(max));
}

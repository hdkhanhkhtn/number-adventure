import type { EvenOddQuestion } from './types';

/** Generate an EvenOdd question: is this number even or odd? */
export function generateEvenOddQuestion(min = 1, max = 20): EvenOddQuestion {
  const range = max - min + 1;
  const number = min + Math.floor(Math.random() * range);
  return { number, isEven: number % 2 === 0 };
}

export function generateEvenOddQuestions(count: number, min = 1, max = 20): EvenOddQuestion[] {
  return Array.from({ length: count }, () => generateEvenOddQuestion(min, max));
}

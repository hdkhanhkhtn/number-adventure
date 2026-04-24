import type { EvenOddQuestion } from './types';

/** Generate an EvenOdd question: is this number even or odd? */
export function generateEvenOddQuestion(): EvenOddQuestion {
  const number = 2 + Math.floor(Math.random() * 18);
  return { number, isEven: number % 2 === 0 };
}

export function generateEvenOddQuestions(count: number): EvenOddQuestion[] {
  return Array.from({ length: count }, () => generateEvenOddQuestion());
}

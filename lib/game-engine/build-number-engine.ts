import type { BuildNumberQuestion } from './types';

/** Generate a BuildNumber question: build tens+ones to match target */
export function generateBuildNumberQuestion(): BuildNumberQuestion {
  return { target: 11 + Math.floor(Math.random() * 60) };
}

export function generateBuildNumberQuestions(count: number): BuildNumberQuestion[] {
  return Array.from({ length: count }, () => generateBuildNumberQuestion());
}

// Game engine types — pure, no React dependencies

export interface HearTapQuestion {
  target: number;
  options: number[];
}

export interface BuildNumberQuestion {
  target: number;
}

export interface EvenOddQuestion {
  number: number;
  isEven: boolean;
}

export interface NumberOrderQuestion {
  seq: number[];
  hideIdx: number;
  target: number;
  options: number[];
}

export interface AddTakeQuestion {
  a: number;
  b: number;
  op: '+' | '-';
  target: number;
  options: number[];
}

export interface CountObjectsQuestion {
  type: 'count-objects';
  items: string[];      // emoji array, length = correct answer
  answer: number;       // correct count
  choices: number[];    // 4 choices including answer
}

export interface DotPoint {
  x: number;     // percentage (0-100) of SVG viewBox width
  y: number;     // percentage (0-100) of SVG viewBox height
  label: number; // tap order (1-based)
}

export interface NumberWritingQuestion {
  type: 'number-writing';
  digit: number;          // 0-9
  dotPath: DotPoint[];    // sequence of dots defining tap order
  totalDots: number;      // convenience: dotPath.length
}

export type AnyQuestion =
  | HearTapQuestion
  | BuildNumberQuestion
  | EvenOddQuestion
  | NumberOrderQuestion
  | AddTakeQuestion
  | CountObjectsQuestion
  | NumberWritingQuestion;

// Canonical definition lives in lib/types/common — re-exported here for convenience
export type { GameType } from '@/lib/types/common';

export interface GameState {
  round: number;
  hearts: number;
  totalRounds: number;
}

export interface GameResult {
  stars: number;
  correct: number;
  total: number;
}

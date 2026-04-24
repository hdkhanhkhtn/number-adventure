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

export type AnyQuestion =
  | HearTapQuestion
  | BuildNumberQuestion
  | EvenOddQuestion
  | NumberOrderQuestion
  | AddTakeQuestion;

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

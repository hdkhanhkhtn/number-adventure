import type { AnyQuestion } from './types';

// ── GameEngine interface ──────────────────────────────────
export interface GameEngine {
  generateQuestions(count: number, difficulty?: 'easy' | 'medium' | 'hard'): AnyQuestion[];
}

// ── assertNever helper ────────────────────────────────────
export function assertNever(x: never): never {
  throw new Error(`Unhandled value: ${JSON.stringify(x)}`);
}

// ── Engine imports ────────────────────────────────────────
import { hearTapEngine } from './hear-tap-engine';
import { buildNumberEngine } from './build-number-engine';
import { evenOddEngine } from './even-odd-engine';
import { numberOrderEngine } from './number-order-engine';
import { addTakeEngine } from './add-take-engine';
import { countObjectsEngine } from './count-objects-engine';
import { numberWritingEngine } from './number-writing-engine';

// ── Central registry ──────────────────────────────────────
export const GAME_REGISTRY = {
  'hear-tap': hearTapEngine,
  'build-number': buildNumberEngine,
  'even-odd': evenOddEngine,
  'number-order': numberOrderEngine,
  'add-take': addTakeEngine,
  'count-objects': countObjectsEngine,
  'number-writing': numberWritingEngine,
} satisfies Record<string, GameEngine>;

import type { AnyQuestion, GameType } from './types';
import type { Difficulty } from '@/lib/types/common';
import { generateHearTapQuestions } from './hear-tap-engine';
import { generateBuildNumberQuestions } from './build-number-engine';
import { generateEvenOddQuestions } from './even-odd-engine';
import { generateNumberOrderQuestions } from './number-order-engine';
import { generateAddTakeQuestions } from './add-take-engine';
import { getGameType } from '@/src/data/game-config/game-types';

/** Get [min, max] number range for a game type at given difficulty */
function getRange(gameType: GameType, difficulty: Difficulty): [number, number] {
  const config = getGameType(gameType);
  if (!config) return [1, 10];
  return config.numberRange[difficulty];
}

/** Generate questions locally based on game type + difficulty */
export function generateLocalQuestions(
  gameType: GameType,
  count: number,
  difficulty: Difficulty = 'easy',
): AnyQuestion[] {
  const [min, max] = getRange(gameType, difficulty);
  switch (gameType) {
    case 'hear-tap':     return generateHearTapQuestions(count, min, max);
    case 'build-number': return generateBuildNumberQuestions(count, min, max);
    case 'even-odd':     return generateEvenOddQuestions(count, min, max);
    case 'number-order': return generateNumberOrderQuestions(count, min, max);
    case 'add-take':     return generateAddTakeQuestions(count, min, max);
    default:             return generateHearTapQuestions(count, min, max);
  }
}

/**
 * Load questions for a lesson: tries AI endpoint first, falls back to local engine.
 * Called from client components (browser).
 */
export async function loadQuestions(
  lessonId: string,
  gameType: GameType,
  count = 5,
  difficulty: Difficulty = 'easy',
): Promise<AnyQuestion[]> {
  try {
    const res = await fetch('/api/ai/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, gameType, count, difficulty }),
    });
    if (!res.ok) throw new Error('AI generation failed');
    const data = await res.json() as { questions: { id: string; payload: AnyQuestion }[] };
    return data.questions.map((q) => q.payload);
  } catch {
    return generateLocalQuestions(gameType, count, difficulty);
  }
}

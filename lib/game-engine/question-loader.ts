import type { AnyQuestion, GameType } from './types';
import { generateHearTapQuestions } from './hear-tap-engine';
import { generateBuildNumberQuestions } from './build-number-engine';
import { generateEvenOddQuestions } from './even-odd-engine';
import { generateNumberOrderQuestions } from './number-order-engine';
import { generateAddTakeQuestions } from './add-take-engine';

/** Generate questions locally based on game type (fallback when AI is unavailable) */
export function generateLocalQuestions(gameType: GameType, count: number): AnyQuestion[] {
  switch (gameType) {
    case 'hear-tap':     return generateHearTapQuestions(count);
    case 'build-number': return generateBuildNumberQuestions(count);
    case 'even-odd':     return generateEvenOddQuestions(count);
    case 'number-order': return generateNumberOrderQuestions(count);
    case 'add-take':     return generateAddTakeQuestions(count);
    default:             return generateHearTapQuestions(count);
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
): Promise<AnyQuestion[]> {
  try {
    const res = await fetch('/api/ai/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, gameType, count }),
    });
    if (!res.ok) throw new Error('AI generation failed');
    const data = await res.json() as { questions: { id: string; payload: AnyQuestion }[] };
    return data.questions.map((q) => q.payload);
  } catch {
    return generateLocalQuestions(gameType, count);
  }
}

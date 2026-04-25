import type { AnyQuestion, GameType } from './types';
import type { Difficulty } from '@/lib/types/common';
import { GAME_REGISTRY } from './registry';

/** Generate questions locally based on game type + difficulty */
export function generateLocalQuestions(
  gameType: GameType,
  count: number,
  difficulty: Difficulty = 'easy',
): AnyQuestion[] {
  const engine = GAME_REGISTRY[gameType as keyof typeof GAME_REGISTRY];
  if (!engine) return [];
  return engine.generateQuestions(count, difficulty);
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

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { InputJsonValue } from '@prisma/client/runtime/library';
import { generateLocalQuestions } from '@/lib/game-engine/question-loader';
import { GAME_REGISTRY } from '@/lib/game-engine/registry';
import type { GameType, AnyQuestion } from '@/lib/game-engine/types';

const VALID_GAME_TYPES = Object.keys(GAME_REGISTRY) as GameType[];

const QUESTION_SCHEMAS: Record<GameType, string> = {
  'hear-tap':       '{"target": number, "options": number[4]}',
  'build-number':   '{"target": number (11-70)}',
  'even-odd':       '{"number": number (2-19), "isEven": boolean}',
  'number-order':   '{"seq": number[5], "hideIdx": number (1-3), "target": number, "options": number[3]}',
  'add-take':       '{"a": number, "b": number, "op": "+" | "-", "target": number, "options": number[4]}',
  'count-objects':  '{"type": "count-objects", "items": ["emoji"], "answer": number, "choices": [number, number, number, number]}',
  'number-writing': '{"type": "number-writing", "digit": number (0-9), "dotPath": [{"x": number, "y": number, "label": number}], "totalDots": number}',
};

/** POST /api/ai/generate-questions — generate and cache AI questions for a lesson */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      lessonId?: string;
      gameType?: string;
      difficulty?: string;
      count?: number;
    };

    const { lessonId, gameType, difficulty = 'easy' } = body;
    const rawCount = body.count;
    const count = Math.min(Number.isFinite(rawCount) && rawCount! > 0 ? rawCount! : 5, 50);

    if (!lessonId || !gameType) {
      return NextResponse.json({ error: 'lessonId and gameType are required' }, { status: 400 });
    }
    if (!VALID_GAME_TYPES.includes(gameType as GameType)) {
      return NextResponse.json({ error: 'Invalid gameType' }, { status: 400 });
    }

    const validatedGameType = gameType as GameType;

    // Try AI generation first; pass difficulty so fallback uses the correct number range
    const questions = await tryAIGeneration(validatedGameType, difficulty, count)
      ?? generateLocalQuestions(validatedGameType, count, difficulty as 'easy' | 'medium' | 'hard');

    // Store in AIQuestion table
    const created = await Promise.all(
      questions.map((payload) =>
        prisma.aIQuestion.create({
          data: { lessonId, gameType: validatedGameType, payload: payload as unknown as InputJsonValue, difficulty },
        }),
      ),
    );

    return NextResponse.json({
      questions: created.map((q) => ({ id: q.id, payload: q.payload })),
    });
  } catch (e) {
    console.error('[api/ai/generate-questions] Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function isValidQuestion(gameType: GameType, q: unknown): q is AnyQuestion {
  if (!q || typeof q !== 'object') return false;
  const obj = q as Record<string, unknown>;
  switch (gameType) {
    case 'hear-tap':
      return typeof obj.target === 'number' && Array.isArray(obj.options) && obj.options.length >= 2;
    case 'build-number':
      return typeof obj.target === 'number';
    case 'even-odd':
      return typeof obj.number === 'number' && typeof obj.isEven === 'boolean';
    case 'number-order':
      return Array.isArray(obj.seq) && typeof obj.hideIdx === 'number' && Array.isArray(obj.options);
    case 'add-take':
      return typeof obj.a === 'number' && typeof obj.b === 'number' && Array.isArray(obj.options);
    case 'count-objects':
      return obj.type === 'count-objects' && Array.isArray(obj.items) && typeof obj.answer === 'number' && Array.isArray(obj.choices);
    case 'number-writing':
      return obj.type === 'number-writing' && typeof obj.digit === 'number' && Array.isArray(obj.dotPath) && typeof obj.totalDots === 'number';
    default:
      return false;
  }
}

async function tryAIGeneration(
  gameType: GameType,
  difficulty: string,
  count: number,
): Promise<AnyQuestion[] | null> {
  const endpoint = process.env.AI_ENDPOINT;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;

  if (!endpoint || !apiKey || !model) return null;

  try {
    const schema = QUESTION_SCHEMAS[gameType];
    const res = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You generate math game questions for children aged 3-6. Output ONLY valid JSON.',
          },
          {
            role: 'user',
            content: `Generate ${count} ${gameType} questions at ${difficulty} difficulty. Output a JSON object: {"questions": [${schema}, ...]}`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return null;

    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as { questions?: unknown[] };
    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) return null;

    return parsed.questions.filter(q => isValidQuestion(gameType, q)).slice(0, count) as AnyQuestion[];
  } catch {
    return null;
  }
}

/**
 * Tests for POST /api/ai/generate-questions — generate and cache AI questions
 * Mocks Prisma and fetch; tests route handler logic.
 */
import { NextRequest } from 'next/server';

// Mock Prisma before importing the route handler
jest.mock('@/lib/prisma', () => ({
  prisma: {
    aIQuestion: {
      create: jest.fn(),
    },
  },
}));

// Mock the local question generator
jest.mock('@/lib/game-engine/question-loader', () => ({
  generateLocalQuestions: jest.fn((gameType, count) => {
    const questions = [];
    for (let i = 0; i < count; i++) {
      if (gameType === 'hear-tap') {
        questions.push({ target: 5 + i, options: [1, 2, 5 + i, 8] });
      } else if (gameType === 'build-number') {
        questions.push({ target: 10 + i });
      } else if (gameType === 'even-odd') {
        questions.push({ number: 5 + i, isEven: (5 + i) % 2 === 0 });
      } else if (gameType === 'number-order') {
        questions.push({ seq: [1, 2, 3, 4, 5], hideIdx: 1, target: 2, options: [1, 2, 3] });
      } else if (gameType === 'add-take') {
        questions.push({ a: 1, b: 2, op: '+', target: 3, options: [1, 2, 3, 4] });
      }
    }
    return questions;
  }),
}));

import { POST } from '@/app/api/ai/generate-questions/route';
import { prisma } from '@/lib/prisma';
import { generateLocalQuestions } from '@/lib/game-engine/question-loader';

const mockCreate = prisma.aIQuestion.create as jest.Mock;
const mockGenerateLocal = generateLocalQuestions as jest.Mock;

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/ai/generate-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockCreate.mockReset();
  mockGenerateLocal.mockClear();
  jest.clearAllMocks();
});

describe('POST /api/ai/generate-questions', () => {
  it('returns 400 when lessonId is missing', async () => {
    const req = makeRequest({ gameType: 'hear-tap', difficulty: 'easy' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/lessonId.*required/i);
  });

  it('returns 400 when gameType is missing', async () => {
    const req = makeRequest({ lessonId: 'lesson-1', difficulty: 'easy' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/gameType.*required/i);
  });

  it('returns 400 when gameType is invalid', async () => {
    const req = makeRequest({ lessonId: 'lesson-1', gameType: 'invalid-game' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Invalid gameType/i);
  });

  it('falls back to local generation when AI is not configured', async () => {
    mockGenerateLocal.mockReturnValueOnce([
      { target: 5, options: [1, 2, 5, 8] },
      { target: 10, options: [5, 8, 10, 15] },
    ]);
    mockCreate
      .mockResolvedValueOnce({ id: 'q-1', payload: { target: 5, options: [1, 2, 5, 8] } })
      .mockResolvedValueOnce({ id: 'q-2', payload: { target: 10, options: [5, 8, 10, 15] } });

    const req = makeRequest({ lessonId: 'lesson-1', gameType: 'hear-tap', count: 2 });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.questions).toHaveLength(2);
    expect(body.questions[0].id).toBe('q-1');
    expect(mockGenerateLocal).toHaveBeenCalledWith('hear-tap', 2);
  });

  it('creates questions in prisma with correct data', async () => {
    mockGenerateLocal.mockReturnValueOnce([{ target: 5, options: [1, 2, 5, 8] }]);
    mockCreate.mockResolvedValueOnce({ id: 'q-abc', payload: { target: 5, options: [1, 2, 5, 8] } });

    const req = makeRequest({
      lessonId: 'lesson-123',
      gameType: 'hear-tap',
      difficulty: 'medium',
      count: 1,
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        lessonId: 'lesson-123',
        gameType: 'hear-tap',
        payload: { target: 5, options: [1, 2, 5, 8] },
        difficulty: 'medium',
      },
    });
  });

  it('clamps count to max 50', async () => {
    mockGenerateLocal.mockReturnValueOnce(Array(50).fill(null).map((_, i) => ({ target: i + 1, options: [1, 2, 3, 4] })));
    mockCreate.mockResolvedValue({ id: 'q-x', payload: {} });

    const req = makeRequest({
      lessonId: 'lesson-1',
      gameType: 'build-number',
      count: 100,
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockGenerateLocal).toHaveBeenCalledWith('build-number', 50);
  });

  it('defaults count to 5 when not provided', async () => {
    mockGenerateLocal.mockReturnValueOnce(
      Array(5).fill(null).map((_, i) => ({ target: i + 1, options: [1, 2, 3, 4] })),
    );
    mockCreate.mockResolvedValue({ id: 'q-x', payload: {} });

    const req = makeRequest({ lessonId: 'lesson-1', gameType: 'even-odd' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockGenerateLocal).toHaveBeenCalledWith('even-odd', 5);
  });

  it('returns 500 when prisma throws', async () => {
    mockGenerateLocal.mockReturnValueOnce([{ target: 5, options: [1, 2, 5, 8] }]);
    mockCreate.mockRejectedValueOnce(new Error('DB error'));

    const req = makeRequest({ lessonId: 'lesson-1', gameType: 'hear-tap', count: 1 });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('Internal server error');
  });

  it('supports all valid game types', async () => {
    const gameTypes = ['hear-tap', 'build-number', 'even-odd', 'number-order', 'add-take'];

    for (const gameType of gameTypes) {
      mockGenerateLocal.mockReturnValueOnce([{}]);
      mockCreate.mockResolvedValueOnce({ id: `q-${gameType}`, payload: {} });

      const req = makeRequest({ lessonId: 'lesson-1', gameType, count: 1 });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }
  });

  it('returns array of questions with id and payload', async () => {
    mockGenerateLocal.mockReturnValueOnce([
      { target: 5, options: [1, 2, 5, 8] },
      { target: 10, options: [5, 8, 10, 15] },
    ]);
    mockCreate
      .mockResolvedValueOnce({ id: 'q-1', payload: { target: 5, options: [1, 2, 5, 8] } })
      .mockResolvedValueOnce({ id: 'q-2', payload: { target: 10, options: [5, 8, 10, 15] } });

    const req = makeRequest({ lessonId: 'lesson-1', gameType: 'hear-tap', count: 2 });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.questions).toHaveLength(2);
    expect(body.questions[0]).toHaveProperty('id');
    expect(body.questions[0]).toHaveProperty('payload');
    expect(body.questions[1]).toHaveProperty('id');
    expect(body.questions[1]).toHaveProperty('payload');
  });
});

/**
 * Tests for POST /api/sessions — create game session
 * Mocks Prisma only; tests real route handler logic.
 */
import { NextRequest } from 'next/server';

// Mock Prisma before importing the route handler
jest.mock('@/lib/prisma', () => ({
  prisma: {
    gameSession: {
      create: jest.fn(),
    },
  },
}));

import { POST } from '@/app/api/sessions/route';
import { prisma } from '@/lib/prisma';

const mockCreate = prisma.gameSession.create as jest.Mock;

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockCreate.mockReset();
});

describe('POST /api/sessions', () => {
  it('returns 201 with sessionId on valid input', async () => {
    mockCreate.mockResolvedValueOnce({ id: 'session-abc' });

    const req = makeRequest({ childId: 'child-1', lessonId: 'lesson-1' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.sessionId).toBe('session-abc');
  });

  it('calls prisma.gameSession.create with correct data', async () => {
    mockCreate.mockResolvedValueOnce({ id: 'session-xyz' });

    const req = makeRequest({ childId: 'child-2', lessonId: 'lesson-5' });
    await POST(req);

    expect(mockCreate).toHaveBeenCalledWith({
      data: { childId: 'child-2', lessonId: 'lesson-5', status: 'in_progress' },
    });
  });

  it('returns 400 when childId is missing', async () => {
    const req = makeRequest({ lessonId: 'lesson-1' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/childId/i);
  });

  it('returns 400 when lessonId is missing', async () => {
    const req = makeRequest({ childId: 'child-1' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/lessonId/i);
  });

  it('returns 400 when body is empty', async () => {
    const req = makeRequest({});
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 500 when prisma throws', async () => {
    mockCreate.mockRejectedValueOnce(new Error('DB connection failed'));

    const req = makeRequest({ childId: 'child-1', lessonId: 'lesson-1' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('Internal server error');
  });
});

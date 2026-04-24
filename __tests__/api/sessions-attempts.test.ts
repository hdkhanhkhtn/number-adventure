/**
 * Tests for POST /api/sessions/:id/attempts — submit game attempt
 */
import { NextRequest } from 'next/server';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    gameSession: {
      findUnique: jest.fn(),
    },
    gameAttempt: {
      create: jest.fn(),
    },
  },
}));

import { POST } from '@/app/api/sessions/[id]/attempts/route';
import { prisma } from '@/lib/prisma';

const mockSessionFind = prisma.gameSession.findUnique as jest.Mock;
const mockAttemptCreate = prisma.gameAttempt.create as jest.Mock;

function makeRequest(sessionId: string, body: unknown): NextRequest {
  return new NextRequest(`http://localhost/api/sessions/${sessionId}/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  mockSessionFind.mockReset();
  mockAttemptCreate.mockReset();
});

describe('POST /api/sessions/:id/attempts', () => {
  it('returns 201 with attemptId on valid input', async () => {
    mockSessionFind.mockResolvedValueOnce({ id: 'session-1' });
    mockAttemptCreate.mockResolvedValueOnce({ id: 'attempt-abc' });

    const req = makeRequest('session-1', { answer: '5', correct: true, timeMs: 1200 });
    const res = await POST(req, makeParams('session-1'));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.attemptId).toBe('attempt-abc');
  });

  it('creates attempt with correct data', async () => {
    mockSessionFind.mockResolvedValueOnce({ id: 'session-1' });
    mockAttemptCreate.mockResolvedValueOnce({ id: 'attempt-xyz' });

    const req = makeRequest('session-1', {
      questionId: 'q-1',
      answer: '7',
      correct: false,
      timeMs: 800,
    });
    await POST(req, makeParams('session-1'));

    expect(mockAttemptCreate).toHaveBeenCalledWith({
      data: {
        sessionId: 'session-1',
        questionId: 'q-1',
        answer: '7',
        correct: false,
        timeMs: 800,
      },
    });
  });

  it('defaults questionId to null when omitted', async () => {
    mockSessionFind.mockResolvedValueOnce({ id: 'session-1' });
    mockAttemptCreate.mockResolvedValueOnce({ id: 'attempt-1' });

    const req = makeRequest('session-1', { answer: '3', correct: true });
    await POST(req, makeParams('session-1'));

    const callArg = mockAttemptCreate.mock.calls[0][0];
    expect(callArg.data.questionId).toBeNull();
  });

  it('defaults timeMs to 0 when omitted', async () => {
    mockSessionFind.mockResolvedValueOnce({ id: 'session-1' });
    mockAttemptCreate.mockResolvedValueOnce({ id: 'attempt-1' });

    const req = makeRequest('session-1', { answer: '3', correct: true });
    await POST(req, makeParams('session-1'));

    const callArg = mockAttemptCreate.mock.calls[0][0];
    expect(callArg.data.timeMs).toBe(0);
  });

  it('defaults correct to false when omitted', async () => {
    mockSessionFind.mockResolvedValueOnce({ id: 'session-1' });
    mockAttemptCreate.mockResolvedValueOnce({ id: 'attempt-1' });

    const req = makeRequest('session-1', { answer: '3' });
    await POST(req, makeParams('session-1'));

    const callArg = mockAttemptCreate.mock.calls[0][0];
    expect(callArg.data.correct).toBe(false);
  });

  it('returns 400 when answer is missing', async () => {
    const req = makeRequest('session-1', { correct: true });
    const res = await POST(req, makeParams('session-1'));

    expect(res.status).toBe(400);
  });

  it('returns 404 when session does not exist', async () => {
    mockSessionFind.mockResolvedValueOnce(null);

    const req = makeRequest('bad-id', { answer: '5' });
    const res = await POST(req, makeParams('bad-id'));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toMatch(/session not found/i);
  });

  it('returns 500 when prisma throws', async () => {
    mockSessionFind.mockRejectedValueOnce(new Error('DB error'));

    const req = makeRequest('session-1', { answer: '5' });
    const res = await POST(req, makeParams('session-1'));

    expect(res.status).toBe(500);
  });
});

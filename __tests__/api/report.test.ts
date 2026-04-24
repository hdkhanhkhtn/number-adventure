/**
 * Tests for GET /api/report/[childId] — aggregate child progress report
 * Mocks Prisma; tests route handler logic including auth, data aggregation, and calculations.
 */
import { NextRequest } from 'next/server';

// Mock Prisma before importing the route handler
jest.mock('@/lib/prisma', () => ({
  prisma: {
    child: {
      findUnique: jest.fn(),
    },
    gameSession: {
      count: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
    gameAttempt: {
      findMany: jest.fn(),
    },
    streak: {
      findUnique: jest.fn(),
    },
  },
}));

import { GET } from '@/app/api/report/[childId]/route';
import { prisma } from '@/lib/prisma';

const mockChildFindUnique = prisma.child.findUnique as jest.Mock;
const mockSessionCount = prisma.gameSession.count as jest.Mock;
const mockSessionAggregate = prisma.gameSession.aggregate as jest.Mock;
const mockSessionFindMany = prisma.gameSession.findMany as jest.Mock;
const mockAttemptFindMany = prisma.gameAttempt.findMany as jest.Mock;
const mockStreakFindUnique = prisma.streak.findUnique as jest.Mock;

function makeRequest(childId: string, parentId?: string): NextRequest {
  const req = new NextRequest(`http://localhost/api/report/${childId}`, {
    method: 'GET',
  });

  // Set cookie manually if parentId is provided
  if (parentId) {
    Object.defineProperty(req.cookies, 'get', {
      value: jest.fn((name: string) => name === 'parentId' ? { value: parentId } : undefined),
    });
  }

  return req;
}

beforeEach(() => {
  mockChildFindUnique.mockReset();
  mockSessionCount.mockReset();
  mockSessionAggregate.mockReset();
  mockSessionFindMany.mockReset();
  mockAttemptFindMany.mockReset();
  mockStreakFindUnique.mockReset();
});

describe('GET /api/report/[childId]', () => {
  it('returns 401 when parentId cookie is missing', async () => {
    const req = makeRequest('child-1');
    const res = await GET(req, { params: Promise.resolve({ childId: 'child-1' }) });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toMatch(/Unauthorized/i);
  });

  it('returns 403 when child not found', async () => {
    mockChildFindUnique.mockResolvedValueOnce(null);

    const req = makeRequest('child-1', 'parent-1');
    const res = await GET(req, { params: Promise.resolve({ childId: 'child-1' }) });
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toMatch(/Forbidden/i);
  });

  it('returns 403 when parentId does not match', async () => {
    mockChildFindUnique.mockResolvedValueOnce({ parentId: 'parent-2' });

    const req = makeRequest('child-1', 'parent-1');
    const res = await GET(req, { params: Promise.resolve({ childId: 'child-1' }) });
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toMatch(/Forbidden/i);
  });

  it('returns 200 with aggregated report for valid child', async () => {
    mockChildFindUnique.mockResolvedValueOnce({ parentId: 'parent-1' });
    mockSessionCount.mockResolvedValueOnce(10);
    mockSessionAggregate.mockResolvedValueOnce({ _sum: { stars: 50 } });
    mockSessionFindMany
      .mockResolvedValueOnce([]) // 7-day sessions
      .mockResolvedValueOnce([]); // 90-day sessions
    mockAttemptFindMany.mockResolvedValueOnce([]);
    mockStreakFindUnique.mockResolvedValueOnce({ currentStreak: 5, longestStreak: 10 });

    const req = makeRequest('child-1', 'parent-1');
    const res = await GET(req, { params: Promise.resolve({ childId: 'child-1' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveProperty('lessonsCompleted', 10);
    expect(body).toHaveProperty('totalStars', 50);
    expect(body).toHaveProperty('recentActivity');
    expect(body).toHaveProperty('games');
    expect(body).toHaveProperty('streak');
    expect(body).toHaveProperty('recommendedNext');
  });

  it('calculates per-game stats correctly', async () => {
    mockChildFindUnique.mockResolvedValueOnce({ parentId: 'parent-1' });
    mockSessionCount.mockResolvedValueOnce(2);
    mockSessionAggregate.mockResolvedValueOnce({ _sum: { stars: 0 } });
    mockSessionFindMany
      .mockResolvedValueOnce([]) // 7-day sessions
      .mockResolvedValueOnce([
        { lesson: { gameType: 'hear-tap' } },
        { lesson: { gameType: 'hear-tap' } },
        { lesson: { gameType: 'build-number' } },
      ]); // 90-day sessions
    mockAttemptFindMany.mockResolvedValueOnce([
      { correct: true, session: { lesson: { gameType: 'hear-tap' } } },
      { correct: true, session: { lesson: { gameType: 'hear-tap' } } },
      { correct: false, session: { lesson: { gameType: 'build-number' } } },
    ]);
    mockStreakFindUnique.mockResolvedValueOnce(null);

    const req = makeRequest('child-1', 'parent-1');
    const res = await GET(req, { params: Promise.resolve({ childId: 'child-1' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.games).toHaveLength(2);

    const hearTap = body.games.find((g: any) => g.type === 'hear-tap');
    expect(hearTap).toMatchObject({
      type: 'hear-tap',
      label: 'Hear & Tap',
      playCount: 2,
      accuracy: 100,
    });

    const buildNumber = body.games.find((g: any) => g.type === 'build-number');
    expect(buildNumber).toMatchObject({
      type: 'build-number',
      label: 'Build the Number',
      playCount: 1,
      accuracy: 0,
    });
  });

  it('returns streak data when streak exists', async () => {
    mockChildFindUnique.mockResolvedValueOnce({ parentId: 'parent-1' });
    mockSessionCount.mockResolvedValueOnce(0);
    mockSessionAggregate.mockResolvedValueOnce({ _sum: { stars: 0 } });
    mockSessionFindMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    mockAttemptFindMany.mockResolvedValueOnce([]);
    mockStreakFindUnique.mockResolvedValueOnce({
      currentStreak: 7,
      longestStreak: 14,
    });

    const req = makeRequest('child-1', 'parent-1');
    const res = await GET(req, { params: Promise.resolve({ childId: 'child-1' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.streak).toEqual({ currentStreak: 7, longestStreak: 14 });
  });

  it('returns default streak when streak is null', async () => {
    mockChildFindUnique.mockResolvedValueOnce({ parentId: 'parent-1' });
    mockSessionCount.mockResolvedValueOnce(0);
    mockSessionAggregate.mockResolvedValueOnce({ _sum: { stars: 0 } });
    mockSessionFindMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    mockAttemptFindMany.mockResolvedValueOnce([]);
    mockStreakFindUnique.mockResolvedValueOnce(null);

    const req = makeRequest('child-1', 'parent-1');
    const res = await GET(req, { params: Promise.resolve({ childId: 'child-1' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.streak).toEqual({ currentStreak: 0, longestStreak: 0 });
  });

  it('identifies weakest skill based on lowest accuracy', async () => {
    mockChildFindUnique.mockResolvedValueOnce({ parentId: 'parent-1' });
    mockSessionCount.mockResolvedValueOnce(3);
    mockSessionAggregate.mockResolvedValueOnce({ _sum: { stars: 0 } });
    mockSessionFindMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { lesson: { gameType: 'hear-tap' } },
        { lesson: { gameType: 'build-number' } },
        { lesson: { gameType: 'even-odd' } },
      ]);
    mockAttemptFindMany.mockResolvedValueOnce([
      { correct: true, session: { lesson: { gameType: 'hear-tap' } } },
      { correct: true, session: { lesson: { gameType: 'hear-tap' } } },
      { correct: true, session: { lesson: { gameType: 'build-number' } } },
      { correct: true, session: { lesson: { gameType: 'build-number' } } },
      { correct: false, session: { lesson: { gameType: 'even-odd' } } },
      { correct: false, session: { lesson: { gameType: 'even-odd' } } },
    ]);
    mockStreakFindUnique.mockResolvedValueOnce(null);

    const req = makeRequest('child-1', 'parent-1');
    const res = await GET(req, { params: Promise.resolve({ childId: 'child-1' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.recommendedNext).toBe('Even / Odd');
  });

  it('returns null for recommendedNext when no games played', async () => {
    mockChildFindUnique.mockResolvedValueOnce({ parentId: 'parent-1' });
    mockSessionCount.mockResolvedValueOnce(0);
    mockSessionAggregate.mockResolvedValueOnce({ _sum: { stars: 0 } });
    mockSessionFindMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    mockAttemptFindMany.mockResolvedValueOnce([]);
    mockStreakFindUnique.mockResolvedValueOnce(null);

    const req = makeRequest('child-1', 'parent-1');
    const res = await GET(req, { params: Promise.resolve({ childId: 'child-1' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.recommendedNext).toBeNull();
  });

  it('returns 500 when database error occurs', async () => {
    mockChildFindUnique.mockRejectedValueOnce(new Error('DB connection failed'));

    const req = makeRequest('child-1', 'parent-1');
    const res = await GET(req, { params: Promise.resolve({ childId: 'child-1' }) });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('Internal server error');
  });

  it('calculates 7-day recent activity correctly', async () => {
    const now = Date.now();
    const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);

    mockChildFindUnique.mockResolvedValueOnce({ parentId: 'parent-1' });
    mockSessionCount.mockResolvedValueOnce(1);
    mockSessionAggregate.mockResolvedValueOnce({ _sum: { stars: 5 } });
    mockSessionFindMany
      .mockResolvedValueOnce([
        { completedAt: threeDaysAgo },
        { completedAt: threeDaysAgo },
      ])
      .mockResolvedValueOnce([]);
    mockAttemptFindMany.mockResolvedValueOnce([]);
    mockStreakFindUnique.mockResolvedValueOnce(null);

    const req = makeRequest('child-1', 'parent-1');
    const res = await GET(req, { params: Promise.resolve({ childId: 'child-1' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.recentActivity).toHaveLength(7);
    // 3 days ago should have accumulated score
    expect(body.recentActivity[3]).toBe(10); // 2 sessions * 5 points each
  });

  it('calculates accuracy as 0 when total attempts is 0', async () => {
    mockChildFindUnique.mockResolvedValueOnce({ parentId: 'parent-1' });
    mockSessionCount.mockResolvedValueOnce(1);
    mockSessionAggregate.mockResolvedValueOnce({ _sum: { stars: 0 } });
    mockSessionFindMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { lesson: { gameType: 'hear-tap' } },
      ]);
    mockAttemptFindMany.mockResolvedValueOnce([]);
    mockStreakFindUnique.mockResolvedValueOnce(null);

    const req = makeRequest('child-1', 'parent-1');
    const res = await GET(req, { params: Promise.resolve({ childId: 'child-1' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    const hearTap = body.games.find((g: any) => g.type === 'hear-tap');
    expect(hearTap.accuracy).toBe(0);
  });
});

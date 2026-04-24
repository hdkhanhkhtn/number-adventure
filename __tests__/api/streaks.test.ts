/**
 * Tests for GET /api/streaks/:childId — retrieve streak data
 */
import { NextRequest } from 'next/server';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    streak: {
      findUnique: jest.fn(),
    },
  },
}));

import { GET } from '@/app/api/streaks/[childId]/route';
import { prisma } from '@/lib/prisma';

const mockStreakFind = prisma.streak.findUnique as jest.Mock;

function makeRequest(childId: string): NextRequest {
  return new NextRequest(`http://localhost/api/streaks/${childId}`);
}

function makeParams(childId: string) {
  return { params: Promise.resolve({ childId }) };
}

beforeEach(() => {
  mockStreakFind.mockReset();
});

describe('GET /api/streaks/:childId', () => {
  it('returns streak data when record exists', async () => {
    mockStreakFind.mockResolvedValueOnce({
      currentStreak: 5,
      longestStreak: 10,
      lastPlayDate: new Date('2026-04-24T00:00:00.000Z'),
    });

    const res = await GET(makeRequest('child-1'), makeParams('child-1'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.currentStreak).toBe(5);
    expect(body.longestStreak).toBe(10);
    expect(body.lastPlayDate).toBe('2026-04-24T00:00:00.000Z');
  });

  it('returns zeros and null when no streak record exists', async () => {
    mockStreakFind.mockResolvedValueOnce(null);

    const res = await GET(makeRequest('new-child'), makeParams('new-child'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.currentStreak).toBe(0);
    expect(body.longestStreak).toBe(0);
    expect(body.lastPlayDate).toBeNull();
  });

  it('queries by the correct childId', async () => {
    mockStreakFind.mockResolvedValueOnce(null);

    await GET(makeRequest('child-99'), makeParams('child-99'));

    expect(mockStreakFind).toHaveBeenCalledWith({
      where: { childId: 'child-99' },
    });
  });

  it('returns 500 when prisma throws', async () => {
    mockStreakFind.mockRejectedValueOnce(new Error('Connection lost'));

    const res = await GET(makeRequest('child-1'), makeParams('child-1'));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('Internal server error');
  });
});

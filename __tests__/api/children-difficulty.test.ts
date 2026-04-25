/**
 * Tests for GET /api/children/[childId]/difficulty
 * Plan checkpoint coverage: SC-8, SC-9, SC-11 from phase-02-smart-difficulty-algorithm.md
 */

import { GET } from '@/app/api/children/[childId]/difficulty/route';
import { NextRequest } from 'next/server';

// ── Mock prisma ───────────────────────────────────────────────
const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();

jest.mock('@/lib/prisma', () => ({
  prisma: {
    difficultyProfile: { findMany: (...a: unknown[]) => mockFindMany(...a) },
    childSettings: { findUnique: (...a: unknown[]) => mockFindUnique(...a) },
  },
}));

function makeRequest(childId: string) {
  return new NextRequest(`http://localhost/api/children/${childId}/difficulty`);
}

function makeParams(childId: string) {
  return { params: Promise.resolve({ childId }) };
}

// ── Tests ─────────────────────────────────────────────────────

describe('GET /api/children/[childId]/difficulty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SC-11: Guest users return empty profiles + defaultDifficulty: 'easy'
  it('returns empty profiles for guest user without hitting DB', async () => {
    const res = await GET(makeRequest('guest_abc123'), makeParams('guest_abc123'));
    const body = await res.json() as { profiles: unknown[]; defaultDifficulty: string };

    expect(res.status).toBe(200);
    expect(body.profiles).toEqual([]);
    expect(body.defaultDifficulty).toBe('easy');
    expect(mockFindMany).not.toHaveBeenCalled();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  // SC-8/SC-10: Returns profiles with currentBand per gameType
  it('returns profiles with currentBand for authenticated child', async () => {
    mockFindMany.mockResolvedValue([
      {
        gameType: 'hear-tap',
        currentBand: 'medium',
        currentDifficulty: 'easy',
        windowAccuracy: 0.82,
        easeFactor: 2.5,
        consecutiveTriggers: 0,
        totalSessions: 5,
      },
    ]);
    mockFindUnique.mockResolvedValue({ difficulty: 'hard' });

    const res = await GET(makeRequest('child-001'), makeParams('child-001'));
    const body = await res.json() as {
      profiles: { gameType: string; currentBand: string; windowAccuracy: number }[];
      defaultDifficulty: string;
    };

    expect(res.status).toBe(200);
    expect(body.profiles).toHaveLength(1);
    expect(body.profiles[0].gameType).toBe('hear-tap');
    expect(body.profiles[0].currentBand).toBe('medium');
    expect(body.profiles[0].windowAccuracy).toBeCloseTo(0.82);
    expect(body.defaultDifficulty).toBe('hard');
  });

  // Falls back to currentDifficulty when currentBand is null (pre-Phase-2B rows)
  it('falls back to currentDifficulty when currentBand is null', async () => {
    mockFindMany.mockResolvedValue([
      {
        gameType: 'even-odd',
        currentBand: null,
        currentDifficulty: 'medium',
        windowAccuracy: null,
        easeFactor: 2.1,
        consecutiveTriggers: null,
        totalSessions: 3,
      },
    ]);
    mockFindUnique.mockResolvedValue(null);

    const res = await GET(makeRequest('child-002'), makeParams('child-002'));
    const body = await res.json() as {
      profiles: { currentBand: string; windowAccuracy: number; consecutiveTriggers: number }[];
      defaultDifficulty: string;
    };

    expect(body.profiles[0].currentBand).toBe('medium'); // fallback
    expect(body.profiles[0].windowAccuracy).toBe(0);     // null → 0
    expect(body.profiles[0].consecutiveTriggers).toBe(0); // null → 0
    expect(body.defaultDifficulty).toBe('easy');          // null settings → 'easy'
  });

  // Returns multiple profiles (one per gameType)
  it('returns one profile per gameType', async () => {
    mockFindMany.mockResolvedValue([
      { gameType: 'hear-tap', currentBand: 'easy', currentDifficulty: 'easy', windowAccuracy: 0.5, easeFactor: 2.5, consecutiveTriggers: 0, totalSessions: 2 },
      { gameType: 'even-odd', currentBand: 'medium', currentDifficulty: 'medium', windowAccuracy: 0.8, easeFactor: 2.3, consecutiveTriggers: 1, totalSessions: 4 },
    ]);
    mockFindUnique.mockResolvedValue({ difficulty: 'hard' });

    const res = await GET(makeRequest('child-003'), makeParams('child-003'));
    const body = await res.json() as { profiles: unknown[] };

    expect(body.profiles).toHaveLength(2);
  });

  // Returns 500 on DB error
  it('returns 500 on unexpected DB error', async () => {
    mockFindMany.mockRejectedValue(new Error('DB connection lost'));
    mockFindUnique.mockResolvedValue(null);

    const res = await GET(makeRequest('child-err'), makeParams('child-err'));
    expect(res.status).toBe(500);
  });
});

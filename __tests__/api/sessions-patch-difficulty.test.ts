/**
 * Tests for PATCH /api/sessions/:id — Phase 2B additions
 * Verifies that the response includes band + windowAccuracy from sliding-window.
 * Plan checkpoint: SC-7 from phase-02-smart-difficulty-algorithm.md
 */

import { NextRequest } from 'next/server';

// ── Prisma mock ───────────────────────────────────────────────
const mockSessionFindUnique = jest.fn();
const mockSessionUpdate = jest.fn();
const mockStreakFindUnique = jest.fn();
const mockStreakCreate = jest.fn();
const mockStreakUpdate = jest.fn();
const mockChildStickerFindMany = jest.fn();
const mockProfileFindUnique = jest.fn();
const mockProfileUpsert = jest.fn();
const mockProfileUpdate = jest.fn();
const mockAttemptFindMany = jest.fn();
const mockSessionAggregate = jest.fn();
const mockAttemptAggregate = jest.fn();
const mockSettingsFindUnique = jest.fn();

jest.mock('@/lib/prisma', () => ({
  prisma: {
    gameSession: {
      findUnique: (...a: unknown[]) => mockSessionFindUnique(...a),
      update: (...a: unknown[]) => mockSessionUpdate(...a),
      aggregate: (...a: unknown[]) => mockSessionAggregate(...a),
    },
    streak: {
      findUnique: (...a: unknown[]) => mockStreakFindUnique(...a),
      create: (...a: unknown[]) => mockStreakCreate(...a),
      update: (...a: unknown[]) => mockStreakUpdate(...a),
    },
    childSticker: {
      findMany: (...a: unknown[]) => mockChildStickerFindMany(...a),
    },
    difficultyProfile: {
      findUnique: (...a: unknown[]) => mockProfileFindUnique(...a),
      upsert: (...a: unknown[]) => mockProfileUpsert(...a),
      update: (...a: unknown[]) => mockProfileUpdate(...a),
    },
    gameAttempt: {
      findMany: (...a: unknown[]) => mockAttemptFindMany(...a),
      aggregate: (...a: unknown[]) => mockAttemptAggregate(...a),
    },
    childSettings: {
      findUnique: (...a: unknown[]) => mockSettingsFindUnique(...a),
    },
    sticker: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    },
    child: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
  },
}));

import { PATCH } from '@/app/api/sessions/[id]/route';

function makeRequest(id: string, body: unknown) {
  return new NextRequest(`http://localhost/api/sessions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

// ── Shared fixtures ───────────────────────────────────────────

// guest_ prefix bypasses auth check so tests don't need cookie setup
const SESSION = {
  id: 'sess-001',
  childId: 'guest_child-001',
  lessonId: 'lesson-001',
  status: 'in_progress',
  stars: 0,
  startedAt: new Date(),
  completedAt: null,
  attempts: [
    { correct: true }, { correct: true }, { correct: true },
    { correct: true }, { correct: true }, { correct: true },
    { correct: true }, { correct: true }, { correct: true },
    { correct: false },
  ], // 90% accuracy → 3 stars
  lesson: { worldId: 'world-1', gameType: 'hear-tap' },
};

const UPDATED_SESSION = { ...SESSION, status: 'completed', stars: 3, completedAt: new Date() };
const STREAK = { currentStreak: 3, longestStreak: 5 };
const PROFILE = {
  id: 'prof-1', childId: 'child-001', gameType: 'hear-tap',
  easeFactor: 2.5, interval: 1, streak: 0, consecutiveFails: 0,
  currentDifficulty: 'easy', totalSessions: 2,
  currentBand: 'easy', windowAccuracy: 0, bandLockedUntil: null, consecutiveTriggers: 1,
};

function setupHappyPath() {
  mockSessionFindUnique.mockResolvedValue(SESSION);
  mockSessionUpdate.mockResolvedValue(UPDATED_SESSION);
  mockStreakFindUnique.mockResolvedValue(null);
  mockStreakCreate.mockResolvedValue(STREAK);
  mockChildStickerFindMany.mockResolvedValue([]);
  mockSettingsFindUnique.mockResolvedValue({ difficulty: 'hard' });
  mockProfileFindUnique.mockResolvedValue(PROFILE);
  mockProfileUpsert.mockResolvedValue(PROFILE);
  mockProfileUpdate.mockResolvedValue({ ...PROFILE, currentBand: 'medium', windowAccuracy: 0.9 });
  // Sliding-window queries
  mockAttemptFindMany.mockResolvedValue(
    Array.from({ length: 10 }, (_, i) => ({ correct: i < 9, sessionId: 'sess-001' })),
  );
  mockSessionAggregate.mockResolvedValue({ _count: { id: 3 } });
  mockAttemptAggregate.mockResolvedValue({ _count: { id: 15 } });
}

// ── Tests ─────────────────────────────────────────────────────

describe('PATCH /api/sessions/:id — Phase 2B response shape', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupHappyPath();
  });

  // SC-7: response includes band + windowAccuracy
  it('includes band and windowAccuracy in difficulty response', async () => {
    const res = await PATCH(makeRequest('sess-001', { stars: 3 }), makeParams('sess-001'));
    const body = await res.json() as {
      difficulty: { band: string; windowAccuracy: number; current: string; accuracy: number };
    };

    expect(res.status).toBe(200);
    expect(body.difficulty).toBeDefined();
    expect(body.difficulty.band).toBeDefined();
    expect(typeof body.difficulty.windowAccuracy).toBe('number');
    expect(typeof body.difficulty.accuracy).toBe('number');
  });

  // Band is promoted when consecutive triggers fire
  it('returns promoted band after consecutive triggers', async () => {
    // consecutiveTriggers=1 + 90% accuracy → should promote to medium
    const res = await PATCH(makeRequest('sess-001', { stars: 3 }), makeParams('sess-001'));
    const body = await res.json() as { difficulty: { band: string } };

    // Profile update was called with medium
    expect(mockProfileUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ currentBand: 'medium' }),
      }),
    );
    expect(body.difficulty.band).toBe('medium');
  });

  // Sliding-window update called with correct data gate queries
  it('queries recent attempts and session/attempt counts for sliding window', async () => {
    await PATCH(makeRequest('sess-001', { stars: 3 }), makeParams('sess-001'));

    expect(mockAttemptFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { correct: true, sessionId: true },
      }),
    );
    expect(mockSessionAggregate).toHaveBeenCalled();
    expect(mockAttemptAggregate).toHaveBeenCalled();
  });

  // Already-completed session returns 409, no difficulty update
  it('returns 409 without running difficulty update on already-completed session', async () => {
    mockSessionFindUnique.mockResolvedValue({ ...SESSION, status: 'completed' });

    const res = await PATCH(makeRequest('sess-001', { stars: 3 }), makeParams('sess-001'));
    expect(res.status).toBe(409);
    expect(mockProfileUpsert).not.toHaveBeenCalled();
  });

  // No attempts → difficulty returns null, band not in response
  it('returns null difficulty when session has no attempts', async () => {
    mockSessionFindUnique.mockResolvedValue({ ...SESSION, attempts: [] });

    const res = await PATCH(makeRequest('sess-001', { stars: 2 }), makeParams('sess-001'));
    const body = await res.json() as { difficulty: null | object };

    expect(res.status).toBe(200);
    expect(body.difficulty).toBeNull();
  });

  // Session not found → 404
  it('returns 404 when session does not exist', async () => {
    mockSessionFindUnique.mockResolvedValue(null);

    const res = await PATCH(makeRequest('sess-999', { stars: 1 }), makeParams('sess-999'));
    expect(res.status).toBe(404);
  });
});

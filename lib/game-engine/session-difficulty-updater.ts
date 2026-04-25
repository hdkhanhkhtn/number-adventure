/**
 * Session difficulty updater — runs after a session completes.
 * Combines two loops:
 *   1. SM-2 algorithm (slow loop): updates easeFactor, interval, streak
 *   2. Sliding-window adjuster (fast loop): updates currentBand from last 10 attempts
 */

import { prisma } from '@/lib/prisma';
import { adjustDifficulty } from '@/lib/game-engine/difficulty-adjuster';
import type { DifficultyState } from '@/lib/game-engine/difficulty-adjuster';
import { computeSlidingWindowAdjustment } from '@/lib/game-engine/sliding-window-adjuster';
import type { Difficulty } from '@/lib/types/common';

export interface DifficultyUpdateResult {
  previous: Difficulty;
  current: Difficulty;
  accuracy: number;
  changed: boolean;
  band: string;
  windowAccuracy: number;
}

export async function updateDifficultyProfile(
  session: {
    childId: string;
    attempts: { correct: boolean }[];
    lesson: { gameType: string };
  },
  sessionId: string,
): Promise<DifficultyUpdateResult | null> {
  const { attempts, childId, lesson } = session;
  if (!attempts.length) return null;

  const correct = attempts.filter((a) => a.correct).length;
  const accuracy = correct / attempts.length;
  const { gameType } = lesson;

  // Parent difficulty ceiling (caps auto-adjustment; default 'hard')
  const settings = await prisma.childSettings.findUnique({ where: { childId } });
  const parentCeiling: Difficulty = (settings?.difficulty ?? 'hard') as Difficulty;

  // Fetch existing SM-2 profile or use defaults
  const existing = await prisma.difficultyProfile.findUnique({
    where: { childId_gameType: { childId, gameType } },
  });
  const state: DifficultyState = existing
    ? {
        easeFactor: existing.easeFactor,
        interval: existing.interval,
        streak: existing.streak,
        consecutiveFails: existing.consecutiveFails,
        currentDifficulty: existing.currentDifficulty as Difficulty,
        totalSessions: existing.totalSessions,
      }
    : { easeFactor: 2.5, interval: 1, streak: 0, consecutiveFails: 0, currentDifficulty: 'easy', totalSessions: 0 };

  // ── SM-2 update ───────────────────────────────────────────────────────
  const result = adjustDifficulty(state, accuracy, parentCeiling);

  await prisma.difficultyProfile.upsert({
    where: { childId_gameType: { childId, gameType } },
    create: {
      childId, gameType,
      easeFactor: result.state.easeFactor,
      interval: result.state.interval,
      streak: result.state.streak,
      consecutiveFails: result.state.consecutiveFails,
      currentDifficulty: result.state.currentDifficulty,
      totalSessions: result.state.totalSessions,
    },
    update: {
      easeFactor: result.state.easeFactor,
      interval: result.state.interval,
      streak: result.state.streak,
      consecutiveFails: result.state.consecutiveFails,
      currentDifficulty: result.state.currentDifficulty,
      totalSessions: result.state.totalSessions,
    },
  });

  // ── Sliding-window band adjustment ────────────────────────────────────
  const [recentAttempts, sessionStats, attemptStats, profile] = await Promise.all([
    prisma.gameAttempt.findMany({
      where: { session: { childId, lesson: { gameType } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { correct: true, sessionId: true },
    }),
    prisma.gameSession.aggregate({
      where: { childId, lesson: { gameType }, status: 'completed' },
      _count: { id: true },
    }),
    prisma.gameAttempt.aggregate({
      where: { session: { childId, lesson: { gameType } } },
      _count: { id: true },
    }),
    prisma.difficultyProfile.findUnique({
      where: { childId_gameType: { childId, gameType } },
    }),
  ]);

  let band = existing?.currentBand ?? 'easy';
  let windowAccuracy = 0;

  if (profile) {
    const windowResult = computeSlidingWindowAdjustment({
      recentAttempts,
      distinctSessionCount: sessionStats._count.id,
      totalAttemptCount: attemptStats._count.id,
      currentBand: (profile.currentBand ?? profile.currentDifficulty) as Difficulty,
      consecutiveTriggers: profile.consecutiveTriggers ?? 0,
      bandLockedUntil: profile.bandLockedUntil,
      currentSessionId: sessionId,
      easeFactor: profile.easeFactor,
      parentCeiling,
    });

    await prisma.difficultyProfile.update({
      where: { childId_gameType: { childId, gameType } },
      data: {
        currentBand: windowResult.newBand,
        windowAccuracy: windowResult.windowAccuracy,
        consecutiveTriggers: windowResult.consecutiveTriggers,
        bandLockedUntil: windowResult.bandLockedUntil,
      },
    });

    band = windowResult.newBand;
    windowAccuracy = windowResult.windowAccuracy;
  }

  return {
    previous: result.previous,
    current: result.state.currentDifficulty,
    accuracy,
    changed: result.changed,
    band,
    windowAccuracy,
  };
}

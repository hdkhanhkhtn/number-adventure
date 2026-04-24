'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameResult } from '@/lib/game-engine/types';
import { buildGameResult } from '@/lib/game-engine/score-calculator';

interface UseGameOptions {
  totalRounds?: number;
  initialHearts?: number;
}

/**
 * Generic game state hook — manages round progression, hearts, and completion.
 * Works with any question type via generic <Q>.
 */
export function useGame<Q>(
  questions: Q[],
  onComplete: (result: GameResult) => void,
  options: UseGameOptions = {},
) {
  const { initialHearts = 3 } = options;
  const [round, setRound] = useState(0);
  const [hearts, setHearts] = useState(initialHearts);
  const completedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const question = questions[round] ?? null;
  const totalRounds = questions.length;

  // Cleanup pending timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const advance = useCallback(
    (currentHearts: number) => {
      if (completedRef.current) return;
      if (round + 1 >= totalRounds) {
        completedRef.current = true;
        onComplete(buildGameResult(currentHearts, totalRounds, initialHearts));
      } else {
        setRound((r) => r + 1);
      }
    },
    [round, totalRounds, onComplete, initialHearts],
  );

  const handleCorrect = useCallback(() => {
    setHearts((h) => {
      advance(h);
      return h;
    });
  }, [advance]);

  const handleWrong = useCallback(() => {
    setHearts((h) => {
      const next = Math.max(0, h - 1);
      // Advance on wrong too — game continues regardless
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => advance(next), 900);
      return next;
    });
  }, [advance]);

  return { round, hearts, question, totalRounds, handleCorrect, handleWrong };
}

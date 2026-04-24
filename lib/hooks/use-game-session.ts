'use client';

import { useState, useCallback } from 'react';

interface SubmitAttemptRequest {
  questionId?: string;
  answer: string;
  correct: boolean;
  timeMs?: number;
}

interface SessionResult {
  session: { id: string; stars: number };
  streak: { currentStreak: number; longestStreak: number };
  sticker?: { id: string; emoji: string; name: string } | null;
}

/** Manages game session lifecycle: start → attempts → complete */
export function useGameSession(childId: string, lessonId: string) {
  const [sessionId, setSessionId] = useState<string | null>(null);

  const startSession = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, lessonId }),
      });
      if (!res.ok) return null;
      const data = await res.json() as { sessionId: string };
      setSessionId(data.sessionId);
      // Persist in case of refresh
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('currentSessionId', data.sessionId);
      }
      return data.sessionId;
    } catch {
      return null;
    }
  }, [childId, lessonId]);

  const submitAttempt = useCallback(async (attempt: SubmitAttemptRequest): Promise<void> => {
    const sid = sessionId ?? sessionStorage.getItem('currentSessionId');
    if (!sid) return;
    try {
      await fetch(`/api/sessions/${sid}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attempt),
      });
    } catch {
      // Non-critical: attempt tracking failure shouldn't break gameplay
    }
  }, [sessionId]);

  const completeSession = useCallback(async (stars: number): Promise<SessionResult | null> => {
    const sid = sessionId ?? sessionStorage.getItem('currentSessionId');
    if (!sid) return null;
    try {
      const res = await fetch(`/api/sessions/${sid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars }),
      });
      if (!res.ok) return null;
      sessionStorage.removeItem('currentSessionId');
      return res.json() as Promise<SessionResult>;
    } catch {
      return null;
    }
  }, [sessionId]);

  return { sessionId, startSession, submitAttempt, completeSession };
}

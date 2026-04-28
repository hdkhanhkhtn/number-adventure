'use client';

import { useState, useCallback, useEffect } from 'react';
import { queueAttempt, trySyncNow } from '@/lib/pwa/offline-attempt-queue';

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

  // Register sync triggers: drain offline queue when connectivity returns
  useEffect(() => {
    const handleOnline = () => { void trySyncNow(); };
    const handleVisibility = () => { if (!document.hidden) void trySyncNow(); };
    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const startSession = useCallback(async (): Promise<string | null> => {
    // Guest users (Phase B local-only) skip DB session creation to avoid FK violations.
    // Phase C will wire real auth and remove this guard.
    // Guard against empty childId (null-coalesced sentinel) and guest sessions
    if (!childId || childId.startsWith('guest_')) return null;

    // Drain any queued offline attempts before creating a new session
    await trySyncNow();

    // Clear stale session ID from previous game before setting a new one
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('currentSessionId');
    }
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
      const res = await fetch(`/api/sessions/${sid}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attempt),
      });
      if (!res.ok) throw new Error('Attempt POST failed');
    } catch {
      // Offline or server error — queue locally for sync when back online
      await queueAttempt(sid, attempt);
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

'use client';
import { useState, useEffect, useRef } from 'react';

function todayKey(): string {
  return `bap-playtime-${new Date().toLocaleDateString('en-CA')}`;
}

function getElapsed(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(todayKey()) ?? '0', 10);
}

function saveElapsed(seconds: number): void {
  localStorage.setItem(todayKey(), String(seconds));
}

export function useSessionTimer(dailyMin: number) {
  const [elapsedSec, setElapsedSec] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const stored = getElapsed();
    setElapsedSec(stored);
    if (stored >= dailyMin * 60) setTimeUp(true);
  }, [dailyMin]);

  useEffect(() => {
    if (timeUp) return;
    intervalRef.current = setInterval(() => {
      setElapsedSec(prev => {
        const next = prev + 1;
        saveElapsed(next);
        if (next >= dailyMin * 60) setTimeUp(true);
        return next;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [dailyMin, timeUp]);

  return { elapsedMin: Math.floor(elapsedSec / 60), elapsedSec, timeUp };
}

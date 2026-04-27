'use client';

import { useState, useEffect, useMemo } from 'react';

export type AppSettings = {
  volume: number;          // 0-100
  highContrast: boolean;
  reduceMotion: boolean;
  bedtime: { enabled: boolean; hour: number; minute: number };
  breakReminder: { enabled: boolean; intervalMinutes: number };
  gameHints: boolean;
  gameRotation: 'auto' | 'favorites' | 'all';
};

const SETTINGS_KEY = 'bap-settings';

const DEFAULT_SETTINGS: AppSettings = {
  volume: 80,
  highContrast: false,
  reduceMotion: false,
  bedtime: { enabled: false, hour: 20, minute: 0 },
  breakReminder: { enabled: false, intervalMinutes: 20 },
  gameHints: true,
  gameRotation: 'auto',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppSettings>;
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch { /* private browsing or corrupt data */ }
    setHydrated(true);
  }, []);

  // Apply high-contrast class to <html> immediately when setting changes
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle('high-contrast', settings.highContrast);
  }, [hydrated, settings.highContrast]);

  // Apply reduce-motion class to <html> immediately when setting changes
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle('reduce-motion', settings.reduceMotion);
  }, [hydrated, settings.reduceMotion]);

  // Debounced save to localStorage (300ms)
  const saveDebounced = useMemo(
    () => debounce((s: AppSettings) => {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
      } catch { /* private browsing */ }
    }, 300),
    []
  );

  // TODO(phase-3a-06)[important]: shallow merge loses nested sub-keys (bedtime.hour/minute, breakReminder.intervalMinutes)
  // if caller passes partial nested obj e.g. update({ bedtime: { enabled: true } }) — see BACKLOG.md #9 / GH #21
  const update = (patch: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      saveDebounced(next);
      return next;
    });
  };

  return { settings, update, hydrated };
}

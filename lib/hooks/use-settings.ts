'use client';

import { useState, useEffect, useMemo } from 'react';
import { useGameProgress } from '@/context/game-progress-context';

export type AppSettings = {
  volume: number;          // 0-100
  highContrast: boolean;
  reduceMotion: boolean;
  bedtime: { enabled: boolean; hour: number; minute: number };
  breakReminder: { enabled: boolean; intervalMinutes: number };
  gameHints: boolean;
  gameRotation: 'auto' | 'favorites' | 'all';
};

/** Patch type for useSettings.update() — allows partial nested objects */
export type AppSettingsPatch = Partial<Omit<AppSettings, 'bedtime' | 'breakReminder'>> & {
  bedtime?: Partial<AppSettings['bedtime']>;
  breakReminder?: Partial<AppSettings['breakReminder']>;
};

const DEFAULT_SETTINGS: AppSettings = {
  volume: 80,
  highContrast: false,
  reduceMotion: false,
  bedtime: { enabled: false, hour: 21, minute: 0 },
  breakReminder: { enabled: false, intervalMinutes: 20 },
  gameHints: true,
  gameRotation: 'auto',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout>;
  const debounced = ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T & { cancel: () => void };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

export function useSettings() {
  const { state } = useGameProgress();
  const childId = state.childId;

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage — namespaced per child to prevent cross-child contamination on
  // shared family devices. Runs on mount and when childId first becomes available.
  useEffect(() => {
    try {
      const settingsKey = childId ? `bap-settings-${childId}` : 'bap-settings';
      // One-time migration: copy legacy global key to child-specific key then remove legacy
      if (childId) {
        const legacyRaw = localStorage.getItem('bap-settings');
        if (legacyRaw && !localStorage.getItem(settingsKey)) {
          localStorage.setItem(settingsKey, legacyRaw);
          localStorage.removeItem('bap-settings');
        }
      }
      const raw = localStorage.getItem(settingsKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppSettings>;
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch { /* private browsing or corrupt data */ }
    setHydrated(true);
  }, [childId]);

  // Fetch DB settings after hydration when child is authenticated (non-guest)
  useEffect(() => {
    if (!hydrated) return;
    if (!childId || childId.startsWith('guest_')) return;
    fetch(`/api/children/${childId}/settings`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.settings) return;
        const s = data.settings;
        // Merge DB values into settings (DB wins over localStorage defaults)
        setSettings(prev => ({
          ...prev,
          ...(s.volume != null && { volume: s.volume }),
          ...(s.highContrast != null && { highContrast: s.highContrast }),
          ...(s.reduceMotion != null && { reduceMotion: s.reduceMotion }),
          ...(s.bedtimeEnabled != null && {
            bedtime: {
              enabled: s.bedtimeEnabled,
              hour: s.bedtimeHour ?? 21,
              minute: s.bedtimeMinute ?? 0,
            },
          }),
          ...(s.breakReminderEnabled != null && {
            breakReminder: {
              enabled: s.breakReminderEnabled,
              intervalMinutes: s.breakReminderIntervalMin ?? 20,
            },
          }),
          ...(s.gameHints != null && { gameHints: s.gameHints }),
          ...(s.gameRotation != null && { gameRotation: s.gameRotation }),
        }));
      })
      .catch(() => { /* ignore — localStorage fallback is already loaded */ });
  }, [hydrated, childId]);

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

  // Debounced save to localStorage (300ms) + fire-and-forget PATCH to DB
  const saveDebounced = useMemo(
    () => debounce((s: AppSettings, cId: string | null) => {
      try {
        const settingsKey = cId ? `bap-settings-${cId}` : 'bap-settings';
        localStorage.setItem(settingsKey, JSON.stringify(s));
      } catch { /* private browsing */ }
      // Persist to DB for authenticated (non-guest) children
      if (cId && !cId.startsWith('guest_')) {
        fetch(`/api/children/${cId}/settings`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            volume: s.volume,
            highContrast: s.highContrast,
            reduceMotion: s.reduceMotion,
            bedtimeEnabled: s.bedtime.enabled,
            bedtimeHour: s.bedtime.hour,
            bedtimeMinute: s.bedtime.minute,
            breakReminderEnabled: s.breakReminder.enabled,
            breakReminderIntervalMin: s.breakReminder.intervalMinutes,
            gameHints: s.gameHints,
            gameRotation: s.gameRotation,
          }),
        }).catch(() => {}); // silent fail — localStorage is still persisted
      }
    }, 300),
    []
  );

  // Cancel pending debounce on unmount — prevents stale writes after context switch
  useEffect(() => {
    return () => { saveDebounced.cancel(); };
  }, [saveDebounced]);

  // Deep-merge nested objects so callers can pass partial sub-objects safely
  // e.g. update({ bedtime: { enabled: true } }) preserves hour/minute
  const update = (patch: AppSettingsPatch) => {
    setSettings(prev => {
      // Cast is safe: prev satisfies AppSettings and we deep-merge each nested struct
      const next = {
        ...prev,
        ...patch,
        bedtime: { ...prev.bedtime, ...(patch.bedtime ?? {}) },
        breakReminder: { ...prev.breakReminder, ...(patch.breakReminder ?? {}) },
      } as AppSettings;
      saveDebounced(next, childId);
      return next;
    });
  };

  return { settings, update, hydrated };
}

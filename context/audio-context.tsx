'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AudioService } from '@/lib/audio/audio-service';
import type { AudioConfig, VoiceStyle } from '@/lib/audio/types';

// ── Context value shape ─────────────────────────────────────────────────────

interface AudioContextValue {
  // Settings toggles (mirrors DB ChildSettings)
  sfxEnabled: boolean;
  musicEnabled: boolean;
  voiceEnabled: boolean;
  voiceStyle: string;
  kidLang: string;
  setSfxEnabled: (v: boolean) => void;
  setMusicEnabled: (v: boolean) => void;
  setVoiceEnabled: (v: boolean) => void;
  setVoiceStyle: (v: string) => void;
  setKidLang: (v: string) => void;
  // AudioService methods
  speakNumber: (n: number) => void;
  speakText: (text: string) => void;
  stop: () => void;
  // Backward-compat alias used by existing components
  speak: (n: number | string) => void;
}

// ── Default context (SSR-safe no-ops) ───────────────────────────────────────

const NOOP = () => undefined;

export const AudioCtx = createContext<AudioContextValue>({
  sfxEnabled: true,
  musicEnabled: true,
  voiceEnabled: true,
  voiceStyle: 'Friendly',
  kidLang: 'en',
  setSfxEnabled: NOOP,
  setMusicEnabled: NOOP,
  setVoiceEnabled: NOOP,
  setVoiceStyle: NOOP,
  setKidLang: NOOP,
  speakNumber: NOOP,
  speakText: NOOP,
  stop: NOOP,
  speak: NOOP,
});

// ── Provider ────────────────────────────────────────────────────────────────

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceStyle, setVoiceStyle] = useState<string>('Friendly');
  const [kidLang, setKidLang] = useState<string>('en');

  // Build AudioConfig from current state — memoized to avoid object churn
  const audioConfig = useMemo<AudioConfig>(() => ({
    voiceEnabled,
    sfxEnabled,
    musicEnabled,
    voiceStyle: (voiceStyle as VoiceStyle) ?? 'Friendly',
    kidLang,
  }), [voiceEnabled, sfxEnabled, musicEnabled, voiceStyle, kidLang]);

  // AudioService instance — created once on client, updated via updateConfig
  // useRef keeps the same instance across renders; only config is patched
  const serviceRef = useRef<AudioService | null>(null);

  useEffect(() => {
    // Guard: only instantiate in browser (Web Speech API is client-only)
    if (typeof window === 'undefined') return;
    if (!serviceRef.current) {
      serviceRef.current = new AudioService(audioConfig);
    } else {
      serviceRef.current.updateConfig(audioConfig);
    }
  }, [audioConfig]);

  // ── Speak helpers ───────────────────────────────────────────────────────

  const speakNumber = (n: number) => {
    serviceRef.current?.playNumber(n);
  };

  const speakText = (text: string) => {
    serviceRef.current?.playText(text);
  };

  const stop = () => {
    serviceRef.current?.stop();
  };

  // Backward-compat: existing components call speak(n) where n is number | string
  const speak = (n: number | string) => {
    if (typeof n === 'number') {
      speakNumber(n);
    } else {
      speakText(n);
    }
  };

  // ── Memoized context value ──────────────────────────────────────────────

  const value = useMemo<AudioContextValue>(() => ({
    sfxEnabled,
    musicEnabled,
    voiceEnabled,
    voiceStyle,
    kidLang,
    setSfxEnabled,
    setMusicEnabled,
    setVoiceEnabled,
    setVoiceStyle,
    setKidLang,
    speakNumber,
    speakText,
    stop,
    speak,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [sfxEnabled, musicEnabled, voiceEnabled, voiceStyle, kidLang]);

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

// ── Hook (backward-compat) ──────────────────────────────────────────────────

/** Direct hook — kept for components that import from audio-context directly */
export function useAudio(): AudioContextValue {
  return useContext(AudioCtx);
}

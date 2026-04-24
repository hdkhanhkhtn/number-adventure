'use client';

import { createContext, useContext, useState } from 'react';

// Stub for Phase D — full Web Audio / Howler implementation comes later
interface AudioContextValue {
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
  /** Read a number aloud using Web Speech API (placeholder for Phase D) */
  speak: (n: number | string) => void;
}

const AudioCtx = createContext<AudioContextValue>({
  sfxEnabled: true,
  musicEnabled: true,
  voiceEnabled: true,
  voiceStyle: 'Friendly',
  kidLang: 'en',
  setSfxEnabled: () => undefined,
  setMusicEnabled: () => undefined,
  setVoiceEnabled: () => undefined,
  setVoiceStyle: () => undefined,
  setKidLang: () => undefined,
  speak: () => undefined,
});

const LANG_MAP: Record<string, string> = {
  en: 'en-US',
  vi: 'vi-VN',
};

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceStyle, setVoiceStyle] = useState('Friendly');
  const [kidLang, setKidLang] = useState('en');

  function speak(n: number | string) {
    if (!voiceEnabled) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(String(n));
    utterance.lang = LANG_MAP[kidLang] ?? 'en-US';
    utterance.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return (
    <AudioCtx.Provider
      value={{
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
        speak,
      }}
    >
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio(): AudioContextValue {
  return useContext(AudioCtx);
}

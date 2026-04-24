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
  speak: () => undefined,
});

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  function speak(n: number | string) {
    if (!voiceEnabled) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(String(n));
    utterance.lang = 'en-US';
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
        voiceStyle: 'Friendly',
        kidLang: 'en',
        setSfxEnabled,
        setMusicEnabled,
        setVoiceEnabled,
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

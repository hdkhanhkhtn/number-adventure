'use client';
// Thin hook wrapper over AudioContext — import this in game components for speak helpers
import { useContext } from 'react';
import { AudioCtx } from '@/context/audio-context';

export function useAudio() {
  const ctx = useContext(AudioCtx);
  return {
    speakNumber:  (n: number) => ctx.speakNumber(n),
    speakText:    (t: string) => ctx.speakText(t),
    stop:         () => ctx.stop(),
    voiceEnabled: ctx.voiceEnabled,
    sfxEnabled:   ctx.sfxEnabled,
  };
}

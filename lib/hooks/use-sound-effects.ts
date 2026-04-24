'use client';
// Sound effects hook — stub implementations, real SFX via Howler.js in Phase 2
import { useContext } from 'react';
import { AudioCtx } from '@/context/audio-context';

export function useSoundEffects() {
  const { sfxEnabled } = useContext(AudioCtx);

  const playCorrect = () => {
    if (!sfxEnabled) return;
    // TODO: Play correct-answer SFX via Howler.js
  };

  const playWrong = () => {
    if (!sfxEnabled) return;
    // TODO: Play wrong-answer SFX via Howler.js
  };

  const playLevelComplete = () => {
    if (!sfxEnabled) return;
    // TODO: Play level-complete SFX via Howler.js
  };

  return { playCorrect, playWrong, playLevelComplete };
}

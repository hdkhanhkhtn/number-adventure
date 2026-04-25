'use client';

import { useCallback, useContext } from 'react';
import { AudioCtx } from '@/context/audio-context';
import { playSfx } from '@/lib/audio/sfx-sprite-map';

export function useSoundEffects() {
  const { sfxEnabled } = useContext(AudioCtx);

  const playCorrect = useCallback(() => {
    if (!sfxEnabled) return;
    playSfx('correct');
  }, [sfxEnabled]);

  const playWrong = useCallback(() => {
    if (!sfxEnabled) return;
    playSfx('wrong');
  }, [sfxEnabled]);

  const playLevelComplete = useCallback(() => {
    if (!sfxEnabled) return;
    playSfx('level-complete');
  }, [sfxEnabled]);

  const playTap = useCallback(() => {
    if (!sfxEnabled) return;
    playSfx('tap');
  }, [sfxEnabled]);

  const playStarEarn = useCallback(() => {
    if (!sfxEnabled) return;
    playSfx('star-earn');
  }, [sfxEnabled]);

  return { playCorrect, playWrong, playLevelComplete, playTap, playStarEarn };
}

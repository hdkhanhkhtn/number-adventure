import { Howl, Howler } from 'howler';

/** Sprite offset map: [startMs, durationMs] */
export const SFX_SPRITE_MAP = {
  correct:          [0, 800],
  wrong:            [900, 600],
  'level-complete': [1600, 1500],
  tap:              [3200, 200],
  'star-earn':      [3500, 1000],
} as const;

export type SfxKey = keyof typeof SFX_SPRITE_MAP;

let sfxHowl: Howl | null = null;

/** Lazy-init singleton Howl for SFX sprite. Returns null in SSR (Node.js). */
export function getSfxHowl(): Howl | null {
  if (typeof window === 'undefined') return null; // SSR guard
  if (!sfxHowl) {
    sfxHowl = new Howl({
      src: ['/audio/sfx-sprite.mp3'],
      sprite: SFX_SPRITE_MAP as unknown as Record<string, [number, number]>,
      preload: true,
      onloaderror: (_id: number, err: unknown) => {
        console.error('[SFX] Sprite load error:', err);
      },
    });
  }
  return sfxHowl;
}

/** Play a sprite key with iOS AudioContext unlock guard */
export function playSfx(key: SfxKey): void {
  const howl = getSfxHowl();
  if (!howl || howl.state() === 'unloaded') return;

  // iOS: resume suspended AudioContext before playing
  const ctx = Howler.ctx;
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().then(() => howl.play(key)).catch(() => {});
  } else {
    howl.play(key);
  }
}

import { Howl, Howler } from 'howler';

/** Sprite offset map: [startMs, durationMs] */
export const SFX_SPRITE_MAP: Record<string, [number, number]> = {
  correct:        [0, 800],
  wrong:          [900, 600],
  'level-complete': [1600, 1500],
  tap:            [3200, 200],
  'star-earn':    [3500, 1000],
};

let sfxHowl: Howl | null = null;

/** Lazy-init singleton Howl for SFX sprite. Call after first user gesture. */
export function getSfxHowl(): Howl {
  if (!sfxHowl) {
    sfxHowl = new Howl({
      src: ['/audio/sfx-sprite.mp3'],
      sprite: SFX_SPRITE_MAP,
      preload: true,
      onloaderror: (_id: number, err: unknown) => {
        console.error('[SFX] Sprite load error:', err);
      },
    });
  }
  return sfxHowl;
}

/** Play a sprite key with iOS AudioContext unlock guard */
export function playSfx(key: string): void {
  const howl = getSfxHowl();
  if (howl.state() === 'unloaded') return;

  // iOS: resume suspended AudioContext before playing
  const ctx = Howler.ctx;
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().then(() => howl.play(key));
  } else {
    howl.play(key);
  }
}

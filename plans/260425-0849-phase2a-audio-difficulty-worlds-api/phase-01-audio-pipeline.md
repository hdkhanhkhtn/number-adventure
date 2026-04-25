# Phase 01 -- Audio Pipeline (Howler.js SFX + Build-Time TTS + Fallback Chain)

## Context Links

- Parent plan: `plans/260425-0849-phase2a-audio-difficulty-worlds-api/plan.md`
- Research: `plans/260425-0849-phase2a-audio-difficulty-worlds-api/research/researcher-audio-pipeline.md`
- Scout: `plans/260425-0849-phase2a-audio-difficulty-worlds-api/scout/scout-codebase-report.md`

## Overview

- **Priority:** P1
- **Status:** pending
- **Parallel with:** Phase 03 (no shared files)
- **Description:** Replace 3 TODO stubs in `use-sound-effects.ts` with Howler.js sprite playback. Create build-time script to pre-generate vi-VN + en-US number audio via Google Cloud TTS. Update `GoogleTTSProvider` to serve pre-recorded static MP3s with Web Speech API fallback.

## Key Insights

- Howler.js v2 auto-unlocks AudioContext on first user gesture (iOS). No manual unlock needed.
- iOS Safari does NOT support WebM audio. MP3 only for this project.
- Sprite files must stay under 30s total duration (iOS 16+ decode buffer limit).
- `prebuild` npm hook runs automatically before `build`. Use `tsx` (zero-config) over `ts-node`.
- Google TTS `vi-VN-Standard-A` voice. MP3 encoding for universal compat.
- GCP credentials: build-time only, never shipped to client. Pre-generated MP3s committed to repo.

## Requirements

### Functional
- F1: `playCorrect()`, `playWrong()`, `playLevelComplete()` produce audible SFX
- F2: New `playTap()` and `playStarEarn()` SFX available
- F3: SFX respects `sfxEnabled` toggle from AudioContext
- F4: Build script generates MP3 files for numbers 0-20 in vi-VN and en-US
- F5: `GoogleTTSProvider.speak("5")` plays `/audio/tts/vi-VN/5.mp3` (static file) instead of API call
- F6: Fallback chain: static MP3 -> Web Speech API -> silence (no crash)
- F7: Audio works offline (pre-recorded files, no network calls)

### Non-Functional
- NF1: SFX sprite file < 30s total, < 500KB
- NF2: Total TTS audio assets < 5MB
- NF3: No runtime Google Cloud API calls from browser
- NF4: Files under 200 lines each

## Architecture

```
User taps answer
  -> useSoundEffects().playCorrect()
    -> Howl instance (singleton, lazy-init)
      -> plays sprite key 'correct' from /public/audio/sfx-sprite.mp3

AudioService.playNumber(5)
  -> GoogleTTSProvider.speak("5", {lang:"vi-VN"})
    -> fetch /audio/tts/vi-VN/5.mp3 (static)
      -> play via Howl (single file, no sprite)
    -> on 404: fall through to WebSpeechProvider
  -> WebSpeechProvider.speak("5") (browser TTS)
```

## Related Code Files

### Files to CREATE

| File | Purpose | Est. Lines |
|------|---------|------------|
| `lib/audio/sfx-sprite-map.ts` | Sprite offset constants + Howl singleton factory | ~45 |
| `scripts/generate-tts-audio.ts` | Build-time GCP TTS script for numbers 0-20 | ~90 |
| `public/audio/sfx-sprite.mp3` | SFX sprite (binary, sourced/authored externally) | binary |
| `tsconfig.scripts.json` | Separate tsconfig for scripts (CommonJS module) | ~8 |

### Files to MODIFY

| File | Current Lines | Change |
|------|--------------|--------|
| `lib/hooks/use-sound-effects.ts` | 26 | Replace 3 TODO stubs with Howler.js calls, add `playTap`/`playStarEarn` |
| `lib/audio/google-tts-provider.ts` | 21 | Implement static MP3 fetch + Howl playback |
| `package.json` | 49 | Add `howler`, `@types/howler`, `tsx` deps; add `generate:audio` script |

## Implementation Steps

### Step 1: Install dependencies

```bash
npm install howler
npm install -D @types/howler tsx
```

Add to `package.json` scripts:
```json
"generate:audio": "tsx scripts/generate-tts-audio.ts"
```

### Step 2: Create `tsconfig.scripts.json`

Path: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/tsconfig.scripts.json`

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./dist-scripts",
    "noEmit": false
  },
  "include": ["scripts/**/*"]
}
```

### Step 3: Create SFX sprite map

Path: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/lib/audio/sfx-sprite-map.ts`

```typescript
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
```

### Step 4: Rewrite `use-sound-effects.ts`

Path: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/lib/hooks/use-sound-effects.ts`

Replace entire file:

```typescript
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
```

### Step 5: Rewrite `google-tts-provider.ts` to serve static MP3s

Path: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/lib/audio/google-tts-provider.ts`

Replace entire file:

```typescript
import { Howl, Howler } from 'howler';
import type { AudioProvider, SpeakOptions } from './types';

/**
 * GoogleTTSProvider — serves pre-generated static MP3 files.
 * Files live at /audio/tts/{locale}/{text-slug}.mp3
 * Falls back to unavailable if file doesn't exist (WebSpeechProvider picks up).
 */
export class GoogleTTSProvider implements AudioProvider {
  private currentHowl: Howl | null = null;

  isAvailable(): boolean {
    // Available in browser only — static files served from /public
    return typeof window !== 'undefined';
  }

  async speak(text: string, options?: SpeakOptions): Promise<void> {
    if (!this.isAvailable()) return;

    const lang = options?.lang ?? 'en-US';
    const slug = this.textToSlug(text);
    const src = `/audio/tts/${lang}/${slug}.mp3`;

    return new Promise<void>((resolve) => {
      this.stop();
      this.currentHowl = new Howl({
        src: [src],
        rate: options?.rate ?? 1.0,
        onend: () => { this.currentHowl = null; resolve(); },
        onloaderror: () => { this.currentHowl = null; resolve(); },
        onplayerror: () => { this.currentHowl = null; resolve(); },
      });

      const ctx = Howler.ctx;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => this.currentHowl?.play());
      } else {
        this.currentHowl.play();
      }
    });
  }

  stop(): void {
    if (this.currentHowl) {
      this.currentHowl.stop();
      this.currentHowl.unload();
      this.currentHowl = null;
    }
  }

  /** Convert text/number to filename slug: "12" -> "12", "Hello" -> "hello" */
  private textToSlug(text: string): string {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
}
```

### Step 6: Create build-time TTS generation script

Path: `/Users/khanhhd/WorkSpace/Khanh/BapProjects/NumberAdventure/scripts/generate-tts-audio.ts`

```typescript
/**
 * Build-time script: generate MP3 files for numbers 0-20 in vi-VN and en-US.
 * Requires GOOGLE_APPLICATION_CREDENTIALS env var pointing to GCP service account JSON.
 * Run: npm run generate:audio
 *
 * Output: public/audio/tts/{locale}/{number}.mp3
 * Skips files that already exist (incremental).
 */
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const PUBLIC_AUDIO = join(__dirname, '..', 'public', 'audio', 'tts');

interface LocaleConfig {
  code: string;
  voice: string;
  numberWords: Record<number, string>;
}

const LOCALES: LocaleConfig[] = [
  {
    code: 'vi-VN',
    voice: 'vi-VN-Standard-A',
    numberWords: {
      0: 'Khong', 1: 'Mot', 2: 'Hai', 3: 'Ba', 4: 'Bon',
      5: 'Nam', 6: 'Sau', 7: 'Bay', 8: 'Tam', 9: 'Chin', 10: 'Muoi',
      11: 'Muoi mot', 12: 'Muoi hai', 13: 'Muoi ba', 14: 'Muoi bon',
      15: 'Muoi lam', 16: 'Muoi sau', 17: 'Muoi bay', 18: 'Muoi tam',
      19: 'Muoi chin', 20: 'Hai muoi',
    },
  },
  {
    code: 'en-US',
    voice: 'en-US-Standard-C',
    numberWords: {
      0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four',
      5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten',
      11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen',
      15: 'Fifteen', 16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen',
      19: 'Nineteen', 20: 'Twenty',
    },
  },
];

async function main() {
  const hasCredentials = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!hasCredentials) {
    console.log('[generate-tts] GOOGLE_APPLICATION_CREDENTIALS not set. Skipping TTS generation.');
    console.log('[generate-tts] Audio will use Web Speech API fallback at runtime.');
    return;
  }

  const client = new TextToSpeechClient();
  let generated = 0;
  let skipped = 0;

  for (const locale of LOCALES) {
    const dir = join(PUBLIC_AUDIO, locale.code);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    for (let n = 0; n <= 20; n++) {
      const outPath = join(dir, `${n}.mp3`);
      if (existsSync(outPath)) { skipped++; continue; }

      const text = locale.numberWords[n] ?? String(n);
      const [response] = await client.synthesizeSpeech({
        input: { text },
        voice: { languageCode: locale.code, name: locale.voice },
        audioConfig: { audioEncoding: 'MP3' },
      });

      if (response.audioContent) {
        writeFileSync(outPath, response.audioContent as Buffer);
        generated++;
        console.log(`[generate-tts] ${locale.code}/${n}.mp3`);
      }
    }
  }

  console.log(`[generate-tts] Done: ${generated} generated, ${skipped} skipped (already exist).`);
}

main().catch((err) => {
  console.error('[generate-tts] Error:', err);
  process.exit(1);
});
```

### Step 7: Create placeholder SFX sprite

The `public/audio/sfx-sprite.mp3` file is a binary audio asset that must be authored externally (e.g., via Audacity or ffmpeg from royalty-free SFX samples). For development, create the directory and a placeholder note:

```bash
mkdir -p public/audio/tts/vi-VN public/audio/tts/en-US
# Place sfx-sprite.mp3 in public/audio/ (sourced from sound designer or royalty-free library)
```

**Temporary dev fallback:** If `sfx-sprite.mp3` doesn't exist, the `onloaderror` callback in `sfx-sprite-map.ts` logs a warning but does not crash. SFX is silently unavailable until the file is provided.

### Step 8: Verify

```bash
npx tsc --noEmit
npm run lint
```

## Todo List

- [ ] Install `howler`, `@types/howler`, `tsx`
- [ ] Create `tsconfig.scripts.json`
- [ ] Create `lib/audio/sfx-sprite-map.ts`
- [ ] Rewrite `lib/hooks/use-sound-effects.ts` (replace TODO stubs)
- [ ] Rewrite `lib/audio/google-tts-provider.ts` (static MP3 fetch)
- [ ] Create `scripts/generate-tts-audio.ts` (build-time TTS)
- [ ] Add `generate:audio` to `package.json` scripts
- [ ] Create `public/audio/` directory structure
- [ ] Source/author `sfx-sprite.mp3` (external task)
- [ ] Run `npx tsc --noEmit` -- passes
- [ ] Run `npm run lint` -- passes

## Success Criteria

1. `npx tsc --noEmit` passes with zero errors
2. `useSoundEffects()` returns 5 callable functions (correct, wrong, levelComplete, tap, starEarn)
3. `GoogleTTSProvider.speak("5", {lang:"vi-VN"})` attempts to load `/audio/tts/vi-VN/5.mp3`
4. If MP3 file missing, `onloaderror` resolves promise (no crash), WebSpeechProvider fallback activates
5. `npm run generate:audio` either generates files (with GCP creds) or exits cleanly without creds
6. No file exceeds 200 lines

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| SFX sprite MP3 not available at dev time | High | Medium | `onloaderror` handles gracefully; audio silent until asset provided |
| GCP credentials not available in CI | Medium | Low | Script skips generation when `GOOGLE_APPLICATION_CREDENTIALS` unset; fallback to Web Speech API |
| Howler.js bundle size | Low | Low | Howler.js is ~12KB gzipped; acceptable for a game |
| iOS AudioContext suspend on cold start | Medium | Medium | `playSfx()` checks `ctx.state === 'suspended'` and calls `resume()` before play |

## Security Considerations

- GCP service account key NEVER committed to repo. Use env var `GOOGLE_APPLICATION_CREDENTIALS`.
- Build script runs server-side only. No GCP credentials in client bundle.
- Pre-generated MP3s are public static assets -- no auth needed (numbers 0-20, non-sensitive).

## Rollback

```bash
npm uninstall howler @types/howler tsx
git checkout -- lib/hooks/use-sound-effects.ts lib/audio/google-tts-provider.ts package.json
rm -f lib/audio/sfx-sprite-map.ts tsconfig.scripts.json scripts/generate-tts-audio.ts
rm -rf public/audio/
```

## Next Steps

- Phase 02 uses `useSoundEffects()` in session completion flow (plays `playLevelComplete` on finish)
- Phase 2B (PWA): cache `public/audio/**` with CacheFirst strategy via serwist
- SFX sprite asset: assign to sound designer or source from royalty-free library (freesound.org)

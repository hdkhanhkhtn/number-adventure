# Research: Howler.js + Google Cloud TTS Audio Pipeline (Next.js 14 / TypeScript)

Date: 2026-04-25 | Packages: `howler@2.x`, `@google-cloud/text-to-speech@5.x`

---

## 1. Howler.js v2 Audio Sprites (TypeScript)

Sprite map: `{ key: [offsetMs, durationMs] }` or `{ key: [offsetMs, durationMs, loop] }`.

```typescript
import Howl from 'howler'; // types: @types/howler

const sfx = new Howl({
  src: ['/audio/numbers.mp3'],          // MP3 only (see §5 re: WebM)
  sprite: {
    num_1: [0, 800],
    num_2: [1000, 800],
    correct: [2000, 1200],
  },
  onload: () => setLoaded(true),
  onloaderror: (_id, err) => console.error('Howl load error', err),
});

const id = sfx.play('num_1');           // returns numeric soundId
sfx.on('end', (id) => { /* cleanup */ });
```

Loading state: use `onload` callback or check `sfx.state()` — returns `'unloaded' | 'loading' | 'loaded'`.

---

## 2. Google Cloud TTS — Node.js Script

Package: `@google-cloud/text-to-speech` (v5+). Use in a plain Node/ts-node script, NOT an API route.

```typescript
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { writeFileSync } from 'fs';

const client = new TextToSpeechClient();

const [res] = await client.synthesizeSpeech({
  input: { text: 'Số một' },
  voice: { languageCode: 'vi-VN', ssmlGender: 'NEUTRAL' },
  audioConfig: { audioEncoding: 'MP3' },   // use 'MP3' for universal compat
});

writeFileSync('public/audio/so-mot.mp3', res.audioContent as Buffer);
```

AudioEncoding options:
- `'MP3'` — best for Howler.js on all platforms incl. iOS
- `'OGG_OPUS'` — good for Android/Chrome, NOT Safari
- `'WEBM_OPUS'` — NOT supported on iOS (see §5)

Vietnamese voice: `languageCode: 'vi-VN'`, available voices: `vi-VN-Standard-A/B/C/D`, `vi-VN-Wavenet-A/B/C/D`.

---

## 3. Build-time Audio Generation Script (Next.js 14)

Pattern: `scripts/generate-audio.ts` executed via `ts-node` before `next build`.

```jsonc
// package.json
{
  "scripts": {
    "generate:audio": "ts-node --project tsconfig.scripts.json scripts/generate-audio.ts",
    "prebuild": "npm run generate:audio",
    "build": "next build"
  }
}
```

`prebuild` runs automatically before `build` in npm. For yarn/pnpm, call explicitly.

`tsconfig.scripts.json` — separate config to avoid `moduleResolution: bundler` conflicts:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "module": "commonjs", "moduleResolution": "node" },
  "include": ["scripts/**/*"]
}
```

Alternative: use `tsx` instead of `ts-node` (faster, zero config):
```
"generate:audio": "tsx scripts/generate-audio.ts"
```
`tsx` pkg: `npm i -D tsx`.

---

## 4. Howler.js Mobile Safari / iOS Constraints

- `autoUnlock: true` (default) — Howler attaches a one-time touchstart/pointerdown listener that calls `AudioContext.resume()`. This handles iOS 9-16+ unlock automatically.
- **Gotcha**: `autoUnlock` fires on FIRST user gesture globally. If your game has a splash screen with no audio, it still unlocks fine. But if audio plays before any tap, it silently fails — check `Howler.ctx.state === 'running'` before play.
- **Sprite offset gotcha on iOS 16+**: iOS 16+ has stricter decode buffering. Sprite offsets > ~30s into a file can glitch. Keep sprite files under 30s total or split into multiple sprite files.
- **Web Audio vs HTML5**: Howler uses Web Audio API by default. Force HTML5 with `html5: true` as fallback for problematic devices, but lose sprite support.

```typescript
// Safe play with unlock check
function playSprite(howl: Howl, key: string) {
  if (Howler.ctx?.state === 'suspended') {
    Howler.ctx.resume().then(() => howl.play(key));
  } else {
    howl.play(key);
  }
}
```

---

## 5. WebM vs MP3 for Howler.js

**iOS Safari does NOT support WebM audio** (any iOS version). Only supports MP3, AAC, and Opus-in-CAF.

Recommendation for this project (children's mobile-first game):

```typescript
// DO NOT use WebM as primary for mobile game
src: ['/audio/numbers.mp3']   // MP3 only — safe for all targets

// If you want Opus quality on Android/Chrome:
src: ['/audio/numbers.ogg', '/audio/numbers.mp3']  // OGG fallback
// NOT webm first — iOS has no WebM support
```

`src` array order: Howler picks FIRST format the browser `canPlayType` accepts. Put preferred codec first. For universal mobile support: `['.ogg', '.mp3']` — iOS picks MP3, Android/Chrome picks OGG.

**Decision for this project**: generate MP3 only from Google TTS (`audioEncoding: 'MP3'`). No WebM needed.

---

## Sources

- Howler.js v2 README: https://github.com/goldfire/howler.js#documentation (accessed 2026-04-25)
- Google Cloud TTS Node.js client: https://googleapis.dev/nodejs/text-to-speech/latest/ (accessed 2026-04-25)
- MDN Audio codec compatibility (iOS Safari WebM): https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Audio_codecs (accessed 2026-04-25)
- Confidence: High for §1,§2,§5 (official docs). Medium for §3 (established pattern). Medium for §4 (iOS 16+ sprite offset is community-observed, not formally documented).

---

## Unresolved Questions

- Which Vietnamese TTS voices (Standard vs Wavenet) sound most natural for young children? Needs audio audition.
- Should sprite file be one large MP3 (all numbers 0-20 + SFX) or multiple per game type? Depends on final asset count.
- `prebuild` hook: does the CI/CD pipeline (GitHub Actions) have GCP credentials for audio generation, or should audio be pre-committed to repo?

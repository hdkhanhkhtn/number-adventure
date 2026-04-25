# Research Report: Bilingual Audio (vi-VN) — Bap Number Adventure

## Executive Summary
GCP TTS provides Neural2, WaveNet, Standard, and Chirp3 HD tiers for vi-VN. Vietnamese number
pronunciation has 4 well-documented edge cases that TTS handles inconsistently; pre-rendering all
0-100 tokens at build time is safest. Howler.js v2 requires separate `Howl` instances per language
— `src` cannot be hot-swapped on a live instance — making dual-sprite-map the correct pattern.

---

## Topic 1: Vietnamese Number Audio (vi-VN)

### 1.1 Available GCP TTS Voices for vi-VN

Tiers confirmed as available for vi-VN (source: GCP docs, confirmed Chirp3 HD note):

| Tier | Voice IDs (examples) | Gender | Notes |
|---|---|---|---|
| Standard | vi-VN-Standard-A, -B, -C, -D | F/M | Lowest quality, robotic |
| WaveNet | vi-VN-Wavenet-A, -B, -C, -D | F/M | Good quality, neural prosody |
| Neural2 | vi-VN-Neural2-A, -D | F/M | Best naturalness pre-Chirp |
| Chirp3 HD | vi-VN-Chirp3-HD-* (31 new locales incl. vi-VN) | varies | Highest quality; custom pronunciation NOT supported for vi-VN |

Recommendation for kids game: **Neural2-A (female)** — warm, clear, child-directed intonation.
Chirp3 HD is tempting but the lack of custom pronunciation support is a blocker for the edge cases
below. WaveNet-A is a solid fallback if Neural2 quota is a concern.

Source: [GCP TTS Supported Voices](https://docs.cloud.google.com/text-to-speech/docs/list-voices-and-types),
[GCP TTS Release Notes](https://docs.cloud.google.com/text-to-speech/docs/release-notes)

Confidence: Medium — full vi-VN voice table was truncated in fetch; verify live at the docs URL above.

### 1.2 Vietnamese Number Pronunciation Edge Cases

These are context-dependent phonetic rules TTS may or may not handle correctly:

| Rule | Example | Standard form | Modified form | TTS risk |
|---|---|---|---|---|
| 1 in unit place after 20+ | 21, 31… | một | **mốt** | High — tone mark differs |
| 5 in unit place after 10+ | 15, 25… | năm | **lăm** (N) / nhăm (S) | High — lexical swap |
| 4 in unit place after 20+ | 24, 34… | bốn | **tư** (Sino-Vietnamese) | Medium |
| mười after tens place | 20, 30… | mười | **mươi** | Medium — tonal reduction |
| Gap marker (North vs South) | 103, 205 | linh (N) | **lẻ** (S) | Medium |

Assessment: Neural2/WaveNet models trained on natural speech corpora typically handle `mươi`
correctly (it is structurally required), but `mốt` and `lăm` require the TTS input to already
contain the correct surface form because the models do not apply Vietnamese morphophonological
rules automatically. **Pre-render using correct surface forms in the SSML/text input**, not the
citation forms.

Source: [Vietnamese Numerals — Wikipedia](https://en.wikipedia.org/wiki/Vietnamese_numerals),
[Migaku — Vietnamese Numbers](https://migaku.com/blog/language-fun/vietnamese-numbers)

Confidence: High (rules are well-documented linguistics; TTS behaviour is Medium — needs empirical test).

### 1.3 Audio File Naming Convention

Recommended: `public/audio/{lang}/{type}-{value}.{ext}`

```
public/audio/
  vi/
    num-0.mp3   … num-100.mp3     (101 files)
    phrase-correct.mp3
    phrase-try-again.mp3
    phrase-great-job.mp3
    instr-hear-tap.mp3
    instr-number-order.mp3
    ...
  en/
    num-0.mp3   … num-100.mp3
    phrase-correct.mp3
    ...
```

Pattern `{lang}/num-{n}.mp3` is preferred over `{lang}-num-{n}.mp3` because directory grouping
allows `rm -rf public/audio/vi/` for rebuild, CDN prefix caching per language, and clear glob
patterns (`audio/vi/num-*.mp3`).

### 1.4 Build-Time Generation — File Count and Size Estimate

| Category | Count (vi) | Count (en) | Notes |
|---|---|---|---|
| Numbers 0–100 | 101 | 101 | one token each |
| Math operator phrases | ~10 | ~10 | plus, minus, equals, etc. |
| Game instructions | ~15 | ~15 | per game type × 5 games |
| Feedback phrases | ~8 | ~8 | correct, wrong, try again… |
| **Total per language** | **~134** | **~134** | |
| **Grand total** | **~268 MP3s** | | |

Size estimate: GCP TTS MP3 at 24 kHz, ~1–3 s clips → ~30–80 KB each.
Total: 268 × ~55 KB avg ≈ **~15 MB** uncompressed. With Brotli on CDN, effective transfer ~8–10 MB.

Confidence: Medium (clip duration varies; benchmark a sample batch first).

---

## Topic 2: Howler.js v2 + Audio Sprites

### 2.1 Separate Sprite Maps vs Single Combined Sprite

Recommended: **separate sprite maps per language** (`vi-sprite.mp3` + `en-sprite.mp3`).

Rationale:
- A combined sprite would be 15–20 min of audio — exceeds mobile decode buffer limits.
- Separate maps allow lazy-load: only load the active language's sprite on init.
- Language switches load the other sprite on demand (see 2.2).
- Separate sprites can be rebuilt independently (e.g., re-record vi without touching en).

Source: [Howler.js Docs](https://howlerjs.com/),
[Audio Sprites with Howler.js — Nomisoft](https://www.nomisoft.co.uk/articles/audio-sprites-with-howler-js)

Confidence: High.

### 2.2 Runtime Language Switch Pattern

`Howl.src` cannot be swapped on a live instance — Howler.js v2 does not expose a `setSrc()` method.
The correct pattern is **two pre-constructed `Howl` instances**, swap active reference:

```typescript
// lib/hooks/use-audio.ts
const howls: Record<'vi' | 'en', Howl> = {
  vi: new Howl({ src: ['/audio/vi/sprite.mp3'], sprite: viSprite, preload: false }),
  en: new Howl({ src: ['/audio/en/sprite.mp3'], sprite: enSprite, preload: false }),
}

function playNumber(n: number, lang: 'vi' | 'en') {
  howls[lang].load()           // no-op if already loaded
  howls[lang].play(`num-${n}`)
}
```

Lazy `load()` on first use avoids loading both sprites at startup.

Source: [Howler.js GitHub](https://github.com/goldfire/howler.js/),
[Audio Sprites — Medium](https://medium.com/game-development-stuff/how-to-create-audiosprites-to-use-with-howler-js-beed5d006ac1)

Confidence: High.

### 2.3 Fallback Chain

Recommended chain: **sprite → individual MP3 fetch → Web Speech API → silence**

Web Speech API vi-VN status:
- Android Chrome: supported (good quality, uses Google TTS backend)
- iOS Safari: supported as of iOS 14+ via `SpeechSynthesisUtterance`, but voice quality is robotic
  and the vi-VN voice may not be installed by default — user must have it in device settings.
- Verdict: Web Speech API is an acceptable last-resort for vi-VN but unreliable on iOS; do not
  rely on it as primary fallback. Individual MP3 file fetch is more reliable.

```typescript
// Fallback order
1. howls[lang].play(spriteId)          // primary
2. new Audio(`/audio/${lang}/num-${n}.mp3`).play()  // if sprite not loaded
3. speechSynthesis.speak(utterance)    // if audio files unavailable
4. silent (noop)                       // last resort
```

Confidence: Medium (iOS Web Speech API vi-VN empirical behaviour varies by OS version).

---

## Topic 3: ChildSettings.language Integration

### 3.1 'bi' (Bilingual) Mode — Sequential vs Choice

Recommended: **sequential playback (en → vi, short pause between)**.

Rationale for kids game context: the educational goal is to reinforce the pairing.
Sequential "three / ba" gives the child both forms without extra UI complexity.
A child-choice toggle adds cognitive load inappropriate for the 4–8 age group.

Implementation:
```typescript
async function playBilingual(n: number) {
  await playAndWait('en', `num-${n}`)  // "three"
  await delay(300)                      // natural pause
  await playAndWait('vi', `num-${n}`)  // "ba"
}
```

### 3.2 Language Switch UX

Recommended: **immediate effect for audio, next question start for on-screen text**.

- Audio: switch active `Howl` reference immediately — next `play()` call uses new language.
- On-screen labels (number words): update on next question render to avoid mid-question jarring.
- No need to restart lesson; effect within current session is acceptable.

Confidence: Medium (UX recommendation based on children's app design conventions, not cited study).

---

## Sources

1. [GCP TTS Supported Voices & Types](https://docs.cloud.google.com/text-to-speech/docs/list-voices-and-types)
2. [GCP TTS Release Notes](https://docs.cloud.google.com/text-to-speech/docs/release-notes)
3. [Vietnamese Numerals — Wikipedia](https://en.wikipedia.org/wiki/Vietnamese_numerals)
4. [Vietnamese Numbers Edge Cases — Migaku](https://migaku.com/blog/language-fun/vietnamese-numbers)
5. [Vietnamese Numbers 1–100 — Preply](https://preply.com/en/blog/vietnamese-numbers-how-to-count/)
6. [Howler.js Official Site](https://howlerjs.com/)
7. [Howler.js GitHub](https://github.com/goldfire/howler.js/)
8. [Audio Sprites with Howler.js — Nomisoft](https://www.nomisoft.co.uk/articles/audio-sprites-with-howler-js)
9. [Audio Sprites Tutorial — Medium](https://medium.com/game-development-stuff/how-to-create-audiosprites-to-use-with-howler-js-beed5d006ac1)

---

## Unresolved Questions

1. **Empirical TTS test needed**: Do Neural2-A and WaveNet-A correctly output "mốt" (not "một")
   when given the text "hai mươi mốt"? Must be verified by generating sample clips.
2. **Chirp3 HD vi-VN voice IDs**: Exact voice name strings not confirmed — GCP docs page was
   truncated during fetch. Verify at docs.cloud.google.com/text-to-speech/docs/list-voices-and-types.
3. **Sprite tooling**: Which audiosprite generator to use (audiosprite npm, ffmpeg manual, GCP
   batch + stitch)? Build pipeline not yet defined.
4. **iOS Web Speech API vi-VN**: Real-device test on iOS 16/17 Safari needed to confirm fallback
   quality is acceptable vs silent fallback being preferred.
5. **'bi' mode audio timing**: 300 ms pause between EN and VI is a guess; UX test with target age
   group (4–8) needed to find optimal gap.

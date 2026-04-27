#!/usr/bin/env tsx
/**
 * generate-tts-audio.ts
 * Offline script: generates MP3 files for numbers 0-100 in en-US and vi-VN
 * using Google Cloud Text-to-Speech WaveNet voices.
 *
 * Prerequisites:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
 *
 * Usage:
 *   npm run generate:audio
 *   npm run generate:audio -- --force   (re-generate existing files)
 *
 * Output: public/audio/tts/{locale}/{n}.mp3  (202 files total)
 * Files are named numerically (e.g. 1.mp3) to match GoogleTTSProvider slug lookup.
 * Incremental by default — skips files that already exist.
 */

import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

// ── Safety guard ──────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  console.error('ERROR: generate-tts-audio must not run in production.');
  process.exit(1);
}

const FORCE = process.argv.includes('--force');
const PUBLIC_AUDIO = join(__dirname, '..', 'public', 'audio', 'tts');

// ── Voice config ──────────────────────────────────────────────────────────────
interface LocaleConfig {
  code: string;
  voice: string;
  getText: (n: number) => string;
}

const LOCALES: LocaleConfig[] = [
  {
    code: 'en-US',
    voice: 'en-US-Wavenet-D',
    getText: (n) => String(n),
  },
  {
    code: 'vi-VN',
    voice: 'vi-VN-Wavenet-A',
    getText: (n) => numberToVietnamese(n),
  },
];

// ── Vietnamese number words 0-100 ─────────────────────────────────────────────
// Rules:
//   "mười"  = standalone 10 and teens 11-19
//   "mươi"  = tens position for 20-90
//   "mốt"   = replaces "một" when units digit is 1 in positions 21-91
//   "lăm"   = replaces "năm" when units digit is 5 in positions 15-95
function numberToVietnamese(n: number): string {
  if (n === 0)   return 'không';
  if (n === 100) return 'một trăm';

  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

  if (n < 10) return units[n];

  if (n < 20) {
    // Teens: "mười" + unit; apply "lăm" substitution at 15
    const u = n % 10;
    return u === 0 ? 'mười' : `mười ${u === 5 ? 'lăm' : units[u]}`;
  }

  // 20-99: "{tens} mươi" + optional unit
  const tens = Math.floor(n / 10);
  const u    = n % 10;
  const tensWord = `${units[tens]} mươi`;

  if (u === 0) return tensWord;
  if (u === 1) return `${tensWord} mốt`;  // "mốt" after mươi (tens ≥ 20)
  if (u === 5) return `${tensWord} lăm`;  // "lăm" after mươi
  return `${tensWord} ${units[u]}`;
}

// ── TTS synthesis ─────────────────────────────────────────────────────────────
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function synthesise(
  client: TextToSpeechClient,
  text: string,
  locale: LocaleConfig,
  outPath: string,
  retries = 2,
): Promise<void> {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const [response] = await client.synthesizeSpeech({
        input: { text },
        voice: { languageCode: locale.code, name: locale.voice },
        audioConfig: { audioEncoding: 'MP3' },
      });

      if (!response.audioContent) {
        throw new Error(`Empty audioContent for "${text}"`);
      }

      writeFileSync(outPath, response.audioContent as Buffer);
      return;
    } catch (err: unknown) {
      const code = (err as { code?: number }).code;
      const isRetryable = code === 8 || code === 14; // RESOURCE_EXHAUSTED or UNAVAILABLE
      if (attempt <= retries && isRetryable) {
        console.warn(`  ↻ retry ${attempt}/${retries} for "${text}" (gRPC code ${code})`);
        await delay(2000 * attempt);
      } else {
        throw err;
      }
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('[generate-tts] GOOGLE_APPLICATION_CREDENTIALS not set — skipping.');
    console.log('[generate-tts] Set the env var pointing to your GCP service-account JSON and re-run.');
    return;
  }

  const client = new TextToSpeechClient();
  let generated = 0;
  let skipped   = 0;
  let errors    = 0;

  for (const locale of LOCALES) {
    const dir = join(PUBLIC_AUDIO, locale.code);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    console.log(`\n[${locale.code}] Generating 0–100 with voice "${locale.voice}"…`);

    for (let n = 0; n <= 100; n++) {
      const outPath = join(dir, `${n}.mp3`);

      if (!FORCE && existsSync(outPath)) {
        skipped++;
        continue;
      }

      const text = locale.getText(n);

      try {
        await synthesise(client, text, locale, outPath);
        generated++;
        process.stdout.write(`  ✓ ${n}.mp3  "${text}"\n`);
      } catch (err) {
        errors++;
        console.error(`  ✗ ${n}.mp3  "${text}": ${(err as Error).message}`);
      }

      // Rate-limit: 60ms between requests (~1 000 RPM ceiling)
      if (n < 100) await delay(60);
    }
  }

  console.log(`\n[generate-tts] Done: ${generated} generated, ${skipped} skipped, ${errors} errors.`);
  if (errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error('[generate-tts] Fatal error:', err);
  process.exit(1);
});

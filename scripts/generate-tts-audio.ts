// @ts-nocheck
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

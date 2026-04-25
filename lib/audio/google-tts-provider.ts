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

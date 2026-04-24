// Web Speech API provider — primary TTS backend for browser environments
import type { AudioProvider, SpeakOptions } from './types';

export class WebSpeechProvider implements AudioProvider {
  isAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  async speak(text: string, options?: SpeakOptions): Promise<void> {
    if (!this.isAvailable()) return;

    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options?.lang ?? 'en-US';
      utterance.rate = options?.rate ?? 0.85;
      utterance.pitch = options?.pitch ?? 1.1;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }

  stop(): void {
    if (this.isAvailable()) window.speechSynthesis.cancel();
  }
}

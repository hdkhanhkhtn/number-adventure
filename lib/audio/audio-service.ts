// AudioService — orchestrates TTS providers with priority fallback and config-driven behavior
import type { AudioProvider, AudioConfig, SpeakOptions } from './types';
import { WebSpeechProvider } from './web-speech-provider';
import { GoogleTTSProvider } from './google-tts-provider';

/** Rate/pitch tuning per voice style, matching DB voiceStyle values */
const STYLE_MAP: Record<string, { rate: number; pitch: number }> = {
  Friendly: { rate: 0.85, pitch: 1.1 },
  Slow:     { rate: 0.65, pitch: 1.0 },
  Adult:    { rate: 1.0,  pitch: 0.9 },
};

export class AudioService {
  private providers: AudioProvider[];
  private config: AudioConfig;

  constructor(config: AudioConfig) {
    this.config = config;
    // Priority order: Google TTS first (higher quality), WebSpeech as fallback
    this.providers = [new GoogleTTSProvider(), new WebSpeechProvider()];
  }

  private getProvider(): AudioProvider | null {
    return this.providers.find((p) => p.isAvailable()) ?? null;
  }

  private getLang(): string {
    return this.config.kidLang === 'vi' ? 'vi-VN' : 'en-US';
  }

  private getStyleOptions(): Pick<SpeakOptions, 'rate' | 'pitch'> {
    return STYLE_MAP[this.config.voiceStyle] ?? STYLE_MAP.Friendly;
  }

  /** Speak a number aloud using current voice config */
  async playNumber(n: number): Promise<void> {
    if (!this.config.voiceEnabled) return;
    const provider = this.getProvider();
    if (!provider) return;
    await provider.speak(String(n), { ...this.getStyleOptions(), lang: this.getLang() });
  }

  /** Speak arbitrary text aloud using current voice config */
  async playText(text: string): Promise<void> {
    if (!this.config.voiceEnabled) return;
    const provider = this.getProvider();
    if (!provider) return;
    await provider.speak(text, { lang: this.getLang() });
  }

  /** Stop all in-progress speech across every provider */
  stop(): void {
    this.providers.forEach((p) => p.stop());
  }

  /** Update config without recreating the service instance */
  updateConfig(config: Partial<AudioConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

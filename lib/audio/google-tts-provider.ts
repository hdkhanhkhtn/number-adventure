// Google Cloud TTS provider — stub, enable when API key is configured
import type { AudioProvider, SpeakOptions } from './types';

export class GoogleTTSProvider implements AudioProvider {
  isAvailable(): boolean {
    // Enable when Google Cloud TTS API key is configured
    return false;
  }

  async speak(_text: string, _options?: SpeakOptions): Promise<void> {
    // TODO: Implement Google Cloud TTS API call
    // 1. POST https://texttospeech.googleapis.com/v1/text:synthesize
    // 2. Decode base64 audioContent
    // 3. Play via Web Audio API
  }

  stop(): void {
    // TODO: Stop any in-progress audio playback
  }
}

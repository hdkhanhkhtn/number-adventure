// Audio system types for Bap Number Adventure

export interface SpeakOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
}

/** Abstraction over any TTS backend (WebSpeech, Google TTS, etc.) */
export interface AudioProvider {
  speak(text: string, options?: SpeakOptions): Promise<void>;
  stop(): void;
  isAvailable(): boolean;
}

/** Voicestyle identifiers matching DB ChildSettings.voiceStyle */
export type VoiceStyle = 'Friendly' | 'Slow' | 'Adult';

/** Snapshot of the audio configuration used by AudioService */
export interface AudioConfig {
  voiceEnabled: boolean;
  sfxEnabled: boolean;
  musicEnabled: boolean;
  voiceStyle: VoiceStyle;
  kidLang: string;
}

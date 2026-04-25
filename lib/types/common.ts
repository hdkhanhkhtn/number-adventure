// Shared TypeScript types for Bap Number Adventure

// ── Theme & Visual ─────────────────────────────────────────
export type ThemeName = 'garden' | 'candy' | 'sunny';

export type TileColor = 'sun' | 'sage' | 'sky' | 'lavender' | 'coral' | 'berry' | 'cream';
export type ButtonColor = 'sage' | 'sun' | 'coral' | 'sky' | 'lavender' | 'cream';
export type IconBtnColor = 'cream' | 'sage' | 'sun' | 'coral' | 'sky';
export type TagColor = 'cream' | 'sage' | 'sky' | 'sun' | 'coral';
export type GardenBgVariant = 'cream' | 'sky' | 'sage' | 'sun' | 'lavender';

export type TileSize = 'sm' | 'md' | 'lg' | 'xl';
export type ButtonSize = 'md' | 'lg' | 'xl';
export type TileState = 'idle' | 'correct' | 'wrong' | 'disabled';

// ── Mascot ─────────────────────────────────────────────────
export type MascotMood = 'happy' | 'wink' | 'think' | 'sleep' | 'celebrate';
export type MascotColor = 'sun' | 'sage' | 'coral' | 'lavender' | 'sky';

// ── Game ───────────────────────────────────────────────────
// Derived from the central registry — add new game types there, not here
import type { GAME_REGISTRY } from '@/lib/game-engine/registry';
export type GameType = keyof typeof GAME_REGISTRY;

export type WorldId =
  | 'number-garden'
  | 'counting-castle'
  | 'even-odd-house'
  | 'number-sequence'
  | 'math-kitchen'
  | 'counting-meadow'
  | 'writing-workshop';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export type StickerRarity = 'common' | 'rare' | 'epic';

// ── User Profile ────────────────────────────────────────────
export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  color: MascotColor;
}

export interface ChildSettings {
  dailyMin: number;
  difficulty: Difficulty;
  kidLang: string;
  parentLang: string;
  sfx: boolean;
  music: boolean;
  voice: boolean;
  voiceStyle: string;
  quietHours: boolean;
}

// ── Progress ────────────────────────────────────────────────
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPlayDate: string | null;
}

export interface WeekProgress {
  days: boolean[]; // 7 booleans Mon–Sun
  completedToday: boolean;
}

// ── Stickers ────────────────────────────────────────────────
export interface StickerDef {
  id: string;
  emoji: string;
  name: string;
  worldId: string;
  rarity: StickerRarity;
}

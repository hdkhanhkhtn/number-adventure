import type { GameType, WorldId } from '@/lib/types/common';

export interface GameTypeConfig {
  id: GameType;
  name: string;
  description: string;
  emoji: string;
  worlds: WorldId[];
  /** Min/max number range per difficulty */
  numberRange: {
    easy: [number, number];
    medium: [number, number];
    hard: [number, number];
  };
}

/** Static game type definitions */
export const GAME_TYPES: GameTypeConfig[] = [
  {
    id: 'hear-tap',
    name: 'Hear & Tap',
    description: 'Listen to a number and tap the matching tile',
    emoji: '👂',
    worlds: ['number-garden'],
    numberRange: { easy: [1, 10], medium: [1, 20], hard: [1, 100] },
  },
  {
    id: 'build-number',
    name: 'Build the Number',
    description: 'Drag tens and ones blocks to build a number',
    emoji: '🧱',
    worlds: ['number-garden'],
    numberRange: { easy: [1, 20], medium: [10, 50], hard: [10, 99] },
  },
  {
    id: 'even-odd',
    name: 'Even or Odd',
    description: 'Sort numbers into the even or odd house',
    emoji: '🏠',
    worlds: ['even-odd-house'],
    numberRange: { easy: [1, 10], medium: [1, 20], hard: [1, 50] },
  },
  {
    id: 'number-order',
    name: 'Number Order',
    description: 'Arrange numbers in ascending or descending order',
    emoji: '🔢',
    worlds: ['counting-castle', 'number-sequence'],
    numberRange: { easy: [1, 10], medium: [1, 30], hard: [1, 100] },
  },
  {
    id: 'add-take',
    name: 'Math Kitchen',
    description: 'Add ingredients or take them away to match the recipe',
    emoji: '🍳',
    worlds: ['math-kitchen'],
    numberRange: { easy: [1, 10], medium: [1, 20], hard: [1, 50] },
  },
];

export function getGameType(id: GameType): GameTypeConfig | undefined {
  return GAME_TYPES.find(g => g.id === id);
}

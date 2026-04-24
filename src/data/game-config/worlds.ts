import type { WorldId, TileColor } from '@/lib/types/common';

export interface WorldConfig {
  id: WorldId;
  name: string;
  subtitle: string;
  color: TileColor;
  bg: string;       // hex background for world card
  emoji: string;
  gameTypes: string[];
  lessonCount: number;
  unlockOrder: number;
}

/** Static world definitions — order matches unlock progression */
export const WORLDS: WorldConfig[] = [
  {
    id: 'number-garden',
    name: 'Number Garden',
    subtitle: 'Tens & ones',
    color: 'sage',
    bg: '#B9E2B2',
    emoji: '🌻',
    gameTypes: ['hear-tap', 'build-number'],
    lessonCount: 9,
    unlockOrder: 0,
  },
  {
    id: 'counting-castle',
    name: 'Counting Castle',
    subtitle: 'Number sequences',
    color: 'lavender',
    bg: '#D9C7F0',
    emoji: '🏰',
    gameTypes: ['number-order'],
    lessonCount: 9,
    unlockOrder: 1,
  },
  {
    id: 'even-odd-house',
    name: 'Even-Odd House',
    subtitle: 'Even & odd numbers',
    color: 'sky',
    bg: '#B8DEEF',
    emoji: '🏠',
    gameTypes: ['even-odd'],
    lessonCount: 9,
    unlockOrder: 2,
  },
  {
    id: 'number-sequence',
    name: 'Number Sequence',
    subtitle: 'Patterns & series',
    color: 'sun',
    bg: '#FFE6A8',
    emoji: '🔢',
    gameTypes: ['number-order'],
    lessonCount: 9,
    unlockOrder: 3,
  },
  {
    id: 'math-kitchen',
    name: 'Math Kitchen',
    subtitle: 'Add & subtract',
    color: 'coral',
    bg: '#FFC9B8',
    emoji: '🍳',
    gameTypes: ['add-take'],
    lessonCount: 9,
    unlockOrder: 4,
  },
];

/** Look up world config by id */
export function getWorld(id: WorldId): WorldConfig | undefined {
  return WORLDS.find(w => w.id === id);
}

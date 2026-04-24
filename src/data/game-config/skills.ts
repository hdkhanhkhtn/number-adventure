import type { WorldId, GameType } from '@/lib/types/common';

export interface SkillDef {
  id: string;
  name: string;
  description: string;
  worldId: WorldId;
  gameType: GameType;
  emoji: string;
}

/** Skill definitions — one per lesson group, used in progress reports */
export const SKILLS: SkillDef[] = [
  {
    id: 'recognize-1-10',
    name: 'Recognize 1–10',
    description: 'Identify numbers 1 through 10 by sound and sight',
    worldId: 'number-garden',
    gameType: 'hear-tap',
    emoji: '👁️',
  },
  {
    id: 'recognize-1-20',
    name: 'Recognize 1–20',
    description: 'Identify numbers 1 through 20 by sound and sight',
    worldId: 'number-garden',
    gameType: 'hear-tap',
    emoji: '🔍',
  },
  {
    id: 'place-value-tens-ones',
    name: 'Tens & Ones',
    description: 'Understand tens and ones place values',
    worldId: 'number-garden',
    gameType: 'build-number',
    emoji: '🧱',
  },
  {
    id: 'count-to-20',
    name: 'Count to 20',
    description: 'Count numbers in order up to 20',
    worldId: 'counting-castle',
    gameType: 'number-order',
    emoji: '1️⃣',
  },
  {
    id: 'skip-count',
    name: 'Skip Counting',
    description: 'Count by 2s, 5s, and 10s',
    worldId: 'counting-castle',
    gameType: 'number-order',
    emoji: '⏭️',
  },
  {
    id: 'even-odd',
    name: 'Even & Odd',
    description: 'Identify whether a number is even or odd',
    worldId: 'even-odd-house',
    gameType: 'even-odd',
    emoji: '🏠',
  },
  {
    id: 'number-patterns',
    name: 'Number Patterns',
    description: 'Identify and continue number patterns',
    worldId: 'number-sequence',
    gameType: 'number-order',
    emoji: '🔢',
  },
  {
    id: 'addition-to-20',
    name: 'Addition to 20',
    description: 'Add numbers with sums up to 20',
    worldId: 'math-kitchen',
    gameType: 'add-take',
    emoji: '➕',
  },
  {
    id: 'subtraction-to-20',
    name: 'Subtraction to 20',
    description: 'Subtract numbers from values up to 20',
    worldId: 'math-kitchen',
    gameType: 'add-take',
    emoji: '➖',
  },
];

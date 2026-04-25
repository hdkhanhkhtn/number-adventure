import type { GameType, WorldId, Difficulty } from '@/lib/types/common';

export interface LessonTemplate {
  id: string;
  worldId: WorldId;
  gameType: GameType;
  order: number;
  title: string;
  difficulty: Difficulty;
  questionCount: number;
  passingStars: number; // min stars to unlock next lesson
}

/** Lesson template definitions — 9 lessons per world, 3 per difficulty tier */
export const LESSON_TEMPLATES: LessonTemplate[] = [
  // ── Number Garden (hear-tap + build-number) ──────────────
  { id: 'ng-01', worldId: 'number-garden', gameType: 'hear-tap',    order: 1, title: 'Numbers 1–5',   difficulty: 'easy',   questionCount: 8,  passingStars: 1 },
  { id: 'ng-02', worldId: 'number-garden', gameType: 'hear-tap',    order: 2, title: 'Numbers 1–10',  difficulty: 'easy',   questionCount: 10, passingStars: 1 },
  { id: 'ng-03', worldId: 'number-garden', gameType: 'build-number', order: 3, title: 'Build to 10',  difficulty: 'easy',   questionCount: 8,  passingStars: 1 },
  { id: 'ng-04', worldId: 'number-garden', gameType: 'hear-tap',    order: 4, title: 'Numbers 1–20',  difficulty: 'medium', questionCount: 10, passingStars: 2 },
  { id: 'ng-05', worldId: 'number-garden', gameType: 'build-number', order: 5, title: 'Build to 20',  difficulty: 'medium', questionCount: 10, passingStars: 2 },
  { id: 'ng-06', worldId: 'number-garden', gameType: 'build-number', order: 6, title: 'Tens & Ones',  difficulty: 'medium', questionCount: 10, passingStars: 2 },
  { id: 'ng-07', worldId: 'number-garden', gameType: 'hear-tap',    order: 7, title: 'Numbers 1–50',  difficulty: 'hard',   questionCount: 12, passingStars: 2 },
  { id: 'ng-08', worldId: 'number-garden', gameType: 'build-number', order: 8, title: 'Build to 99',  difficulty: 'hard',   questionCount: 12, passingStars: 2 },
  { id: 'ng-09', worldId: 'number-garden', gameType: 'build-number', order: 9, title: 'Big Numbers',  difficulty: 'hard',   questionCount: 12, passingStars: 2 },

  // ── Counting Castle (number-order) ──────────────────────
  { id: 'cc-01', worldId: 'counting-castle', gameType: 'number-order', order: 1, title: 'Count to 5',    difficulty: 'easy',   questionCount: 8,  passingStars: 1 },
  { id: 'cc-02', worldId: 'counting-castle', gameType: 'number-order', order: 2, title: 'Count to 10',   difficulty: 'easy',   questionCount: 8,  passingStars: 1 },
  { id: 'cc-03', worldId: 'counting-castle', gameType: 'number-order', order: 3, title: 'Count to 20',   difficulty: 'easy',   questionCount: 10, passingStars: 1 },
  { id: 'cc-04', worldId: 'counting-castle', gameType: 'number-order', order: 4, title: 'Count Up & Down', difficulty: 'medium', questionCount: 10, passingStars: 2 },
  { id: 'cc-05', worldId: 'counting-castle', gameType: 'number-order', order: 5, title: 'Skip Count 2s',  difficulty: 'medium', questionCount: 10, passingStars: 2 },
  { id: 'cc-06', worldId: 'counting-castle', gameType: 'number-order', order: 6, title: 'Skip Count 5s',  difficulty: 'medium', questionCount: 10, passingStars: 2 },
  { id: 'cc-07', worldId: 'counting-castle', gameType: 'number-order', order: 7, title: 'Order to 50',    difficulty: 'hard',   questionCount: 12, passingStars: 2 },
  { id: 'cc-08', worldId: 'counting-castle', gameType: 'number-order', order: 8, title: 'Order to 100',   difficulty: 'hard',   questionCount: 12, passingStars: 2 },
  { id: 'cc-09', worldId: 'counting-castle', gameType: 'number-order', order: 9, title: 'Mixed Sequences', difficulty: 'hard',  questionCount: 12, passingStars: 2 },

  // ── Even-Odd House ───────────────────────────────────────
  { id: 'eo-01', worldId: 'even-odd-house', gameType: 'even-odd', order: 1, title: 'Even or Odd 1–6',  difficulty: 'easy',   questionCount: 8,  passingStars: 1 },
  { id: 'eo-02', worldId: 'even-odd-house', gameType: 'even-odd', order: 2, title: 'Even or Odd 1–10', difficulty: 'easy',   questionCount: 10, passingStars: 1 },
  { id: 'eo-03', worldId: 'even-odd-house', gameType: 'even-odd', order: 3, title: 'Sort the Numbers',  difficulty: 'easy',   questionCount: 10, passingStars: 1 },
  { id: 'eo-04', worldId: 'even-odd-house', gameType: 'even-odd', order: 4, title: 'Even or Odd 1–20', difficulty: 'medium', questionCount: 10, passingStars: 2 },
  { id: 'eo-05', worldId: 'even-odd-house', gameType: 'even-odd', order: 5, title: 'Quick Sort',        difficulty: 'medium', questionCount: 12, passingStars: 2 },
  { id: 'eo-06', worldId: 'even-odd-house', gameType: 'even-odd', order: 6, title: 'Even Patterns',     difficulty: 'medium', questionCount: 12, passingStars: 2 },
  { id: 'eo-07', worldId: 'even-odd-house', gameType: 'even-odd', order: 7, title: 'Even or Odd 1–50', difficulty: 'hard',   questionCount: 12, passingStars: 2 },
  { id: 'eo-08', worldId: 'even-odd-house', gameType: 'even-odd', order: 8, title: 'Speed Sort',        difficulty: 'hard',   questionCount: 15, passingStars: 2 },
  { id: 'eo-09', worldId: 'even-odd-house', gameType: 'even-odd', order: 9, title: 'Master Sort',       difficulty: 'hard',   questionCount: 15, passingStars: 2 },

  // ── Number Sequence ──────────────────────────────────────
  { id: 'ns-01', worldId: 'number-sequence', gameType: 'number-order', order: 1, title: 'What Comes Next?',  difficulty: 'easy',   questionCount: 8,  passingStars: 1 },
  { id: 'ns-02', worldId: 'number-sequence', gameType: 'number-order', order: 2, title: 'Fill the Gap',       difficulty: 'easy',   questionCount: 8,  passingStars: 1 },
  { id: 'ns-03', worldId: 'number-sequence', gameType: 'number-order', order: 3, title: 'Pattern to 20',      difficulty: 'easy',   questionCount: 10, passingStars: 1 },
  { id: 'ns-04', worldId: 'number-sequence', gameType: 'number-order', order: 4, title: 'Pattern +2',         difficulty: 'medium', questionCount: 10, passingStars: 2 },
  { id: 'ns-05', worldId: 'number-sequence', gameType: 'number-order', order: 5, title: 'Pattern +5',         difficulty: 'medium', questionCount: 10, passingStars: 2 },
  { id: 'ns-06', worldId: 'number-sequence', gameType: 'number-order', order: 6, title: 'Pattern +10',        difficulty: 'medium', questionCount: 10, passingStars: 2 },
  { id: 'ns-07', worldId: 'number-sequence', gameType: 'number-order', order: 7, title: 'Mixed Patterns',     difficulty: 'hard',   questionCount: 12, passingStars: 2 },
  { id: 'ns-08', worldId: 'number-sequence', gameType: 'number-order', order: 8, title: 'Reverse Patterns',   difficulty: 'hard',   questionCount: 12, passingStars: 2 },
  { id: 'ns-09', worldId: 'number-sequence', gameType: 'number-order', order: 9, title: 'Sequence Master',    difficulty: 'hard',   questionCount: 12, passingStars: 2 },

  // ── Math Kitchen (add-take) ──────────────────────────────
  { id: 'mk-01', worldId: 'math-kitchen', gameType: 'add-take', order: 1, title: 'Add to 5',      difficulty: 'easy',   questionCount: 8,  passingStars: 1 },
  { id: 'mk-02', worldId: 'math-kitchen', gameType: 'add-take', order: 2, title: 'Take from 5',   difficulty: 'easy',   questionCount: 8,  passingStars: 1 },
  { id: 'mk-03', worldId: 'math-kitchen', gameType: 'add-take', order: 3, title: 'Add & Take 10', difficulty: 'easy',   questionCount: 10, passingStars: 1 },
  { id: 'mk-04', worldId: 'math-kitchen', gameType: 'add-take', order: 4, title: 'Add to 20',     difficulty: 'medium', questionCount: 10, passingStars: 2 },
  { id: 'mk-05', worldId: 'math-kitchen', gameType: 'add-take', order: 5, title: 'Take from 20',  difficulty: 'medium', questionCount: 10, passingStars: 2 },
  { id: 'mk-06', worldId: 'math-kitchen', gameType: 'add-take', order: 6, title: 'Mixed to 20',   difficulty: 'medium', questionCount: 12, passingStars: 2 },
  { id: 'mk-07', worldId: 'math-kitchen', gameType: 'add-take', order: 7, title: 'Add to 50',     difficulty: 'hard',   questionCount: 12, passingStars: 2 },
  { id: 'mk-08', worldId: 'math-kitchen', gameType: 'add-take', order: 8, title: 'Take from 50',  difficulty: 'hard',   questionCount: 12, passingStars: 2 },
  { id: 'mk-09', worldId: 'math-kitchen', gameType: 'add-take', order: 9, title: 'Chef Master',   difficulty: 'hard',   questionCount: 15, passingStars: 2 },

  // ── Counting Meadow (count-objects) ──────────────────────
  { id: 'cm-01', worldId: 'counting-meadow', gameType: 'count-objects', order: 1, title: 'Count to 3',      difficulty: 'easy',   questionCount: 8,  passingStars: 1 },
  { id: 'cm-02', worldId: 'counting-meadow', gameType: 'count-objects', order: 2, title: 'Count to 5',      difficulty: 'easy',   questionCount: 8,  passingStars: 1 },
  { id: 'cm-03', worldId: 'counting-meadow', gameType: 'count-objects', order: 3, title: 'How Many?',       difficulty: 'easy',   questionCount: 10, passingStars: 1 },
  { id: 'cm-04', worldId: 'counting-meadow', gameType: 'count-objects', order: 4, title: 'Count to 7',      difficulty: 'medium', questionCount: 10, passingStars: 2 },
  { id: 'cm-05', worldId: 'counting-meadow', gameType: 'count-objects', order: 5, title: 'Count to 10',     difficulty: 'medium', questionCount: 10, passingStars: 2 },
  { id: 'cm-06', worldId: 'counting-meadow', gameType: 'count-objects', order: 6, title: 'Quick Count',     difficulty: 'medium', questionCount: 12, passingStars: 2 },
  { id: 'cm-07', worldId: 'counting-meadow', gameType: 'count-objects', order: 7, title: 'Count to 15',     difficulty: 'hard',   questionCount: 12, passingStars: 2 },
  { id: 'cm-08', worldId: 'counting-meadow', gameType: 'count-objects', order: 8, title: 'Count to 20',     difficulty: 'hard',   questionCount: 12, passingStars: 2 },
  { id: 'cm-09', worldId: 'counting-meadow', gameType: 'count-objects', order: 9, title: 'Counting Master', difficulty: 'hard',   questionCount: 15, passingStars: 2 },

  // ── Writing Workshop (number-writing) ───────────────────
  { id: 'ww-01', worldId: 'writing-workshop', gameType: 'number-writing', order: 1, title: 'Write 0 & 1',    difficulty: 'easy',   questionCount: 6,  passingStars: 1 },
  { id: 'ww-02', worldId: 'writing-workshop', gameType: 'number-writing', order: 2, title: 'Write 2 & 3',    difficulty: 'easy',   questionCount: 6,  passingStars: 1 },
  { id: 'ww-03', worldId: 'writing-workshop', gameType: 'number-writing', order: 3, title: 'Write 0-4',      difficulty: 'easy',   questionCount: 8,  passingStars: 1 },
  { id: 'ww-04', worldId: 'writing-workshop', gameType: 'number-writing', order: 4, title: 'Write 5 & 6',    difficulty: 'medium', questionCount: 8,  passingStars: 2 },
  { id: 'ww-05', worldId: 'writing-workshop', gameType: 'number-writing', order: 5, title: 'Write 0-6',      difficulty: 'medium', questionCount: 10, passingStars: 2 },
  { id: 'ww-06', worldId: 'writing-workshop', gameType: 'number-writing', order: 6, title: 'Speed Write',    difficulty: 'medium', questionCount: 10, passingStars: 2 },
  { id: 'ww-07', worldId: 'writing-workshop', gameType: 'number-writing', order: 7, title: 'Write 7, 8, 9',  difficulty: 'hard',   questionCount: 10, passingStars: 2 },
  { id: 'ww-08', worldId: 'writing-workshop', gameType: 'number-writing', order: 8, title: 'Write All',      difficulty: 'hard',   questionCount: 12, passingStars: 2 },
  { id: 'ww-09', worldId: 'writing-workshop', gameType: 'number-writing', order: 9, title: 'Writing Master', difficulty: 'hard',   questionCount: 12, passingStars: 2 },
];

export function getLessonsForWorld(worldId: WorldId): LessonTemplate[] {
  return LESSON_TEMPLATES.filter(l => l.worldId === worldId).sort((a, b) => a.order - b.order);
}

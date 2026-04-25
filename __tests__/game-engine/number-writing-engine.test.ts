import {
  generateNumberWritingQuestion,
  generateNumberWritingQuestions,
  numberWritingEngine,
} from '@/lib/game-engine/number-writing-engine';
import { DOT_PATHS } from '@/lib/game-engine/dot-paths';

describe('generateNumberWritingQuestion', () => {
  it('returns correct shape', () => {
    const q = generateNumberWritingQuestion('easy');
    expect(q).toHaveProperty('type', 'number-writing');
    expect(q).toHaveProperty('digit');
    expect(q).toHaveProperty('dotPath');
    expect(q).toHaveProperty('totalDots');
  });

  it('totalDots equals dotPath.length', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateNumberWritingQuestion('hard');
      expect(q.totalDots).toBe(q.dotPath.length);
    }
  });

  it('dotPath matches DOT_PATHS entry for the digit', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateNumberWritingQuestion('hard');
      expect(q.dotPath).toEqual(DOT_PATHS[q.digit]);
    }
  });

  it('digit is within easy range [0,4]', () => {
    for (let i = 0; i < 30; i++) {
      const q = generateNumberWritingQuestion('easy');
      expect(q.digit).toBeGreaterThanOrEqual(0);
      expect(q.digit).toBeLessThanOrEqual(4);
    }
  });

  it('digit is within medium range [0,6]', () => {
    for (let i = 0; i < 30; i++) {
      const q = generateNumberWritingQuestion('medium');
      expect(q.digit).toBeGreaterThanOrEqual(0);
      expect(q.digit).toBeLessThanOrEqual(6);
    }
  });

  it('digit is within hard range [0,9]', () => {
    for (let i = 0; i < 30; i++) {
      const q = generateNumberWritingQuestion('hard');
      expect(q.digit).toBeGreaterThanOrEqual(0);
      expect(q.digit).toBeLessThanOrEqual(9);
    }
  });

  it('defaults to easy when no difficulty given', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateNumberWritingQuestion();
      expect(q.digit).toBeGreaterThanOrEqual(0);
      expect(q.digit).toBeLessThanOrEqual(4);
    }
  });

  it('dotPath dots have sequential labels starting at 1', () => {
    for (let digit = 0; digit <= 9; digit++) {
      const q = generateNumberWritingQuestion('hard');
      const sorted = [...q.dotPath].sort((a, b) => a.label - b.label);
      sorted.forEach((dot, idx) => {
        expect(dot.label).toBe(idx + 1);
      });
    }
  });

  it('dotPath coordinates are percentages in range [0,100]', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateNumberWritingQuestion('hard');
      q.dotPath.forEach((dot) => {
        expect(dot.x).toBeGreaterThanOrEqual(0);
        expect(dot.x).toBeLessThanOrEqual(100);
        expect(dot.y).toBeGreaterThanOrEqual(0);
        expect(dot.y).toBeLessThanOrEqual(100);
      });
    }
  });

  it('dotPath has at least 4 dots per digit', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateNumberWritingQuestion('hard');
      expect(q.dotPath.length).toBeGreaterThanOrEqual(4);
    }
  });
});

describe('generateNumberWritingQuestions', () => {
  it('returns requested count', () => {
    expect(generateNumberWritingQuestions(5, 'easy')).toHaveLength(5);
    expect(generateNumberWritingQuestions(0, 'easy')).toHaveLength(0);
  });
});

describe('numberWritingEngine', () => {
  it('generateQuestions returns correct count and shape', () => {
    const qs = numberWritingEngine.generateQuestions(3, 'medium');
    expect(qs).toHaveLength(3);
    qs.forEach((q) => {
      expect(q).toHaveProperty('type', 'number-writing');
    });
  });

  it('defaults to easy difficulty when none provided', () => {
    const qs = numberWritingEngine.generateQuestions(10);
    qs.forEach((q) => {
      expect((q as { digit: number }).digit).toBeGreaterThanOrEqual(0);
      expect((q as { digit: number }).digit).toBeLessThanOrEqual(4);
    });
  });
});

import {
  generateHearTapQuestion,
  generateHearTapQuestions,
} from '@/lib/game-engine/hear-tap-engine';

describe('generateHearTapQuestion', () => {
  it('returns target within [1, max] (default max=20)', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateHearTapQuestion();
      expect(q.target).toBeGreaterThanOrEqual(1);
      expect(q.target).toBeLessThanOrEqual(20);
    }
  });

  it('always returns exactly 4 options', () => {
    for (let i = 0; i < 30; i++) {
      const q = generateHearTapQuestion();
      expect(q.options).toHaveLength(4);
    }
  });

  it('options always contain the target', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateHearTapQuestion();
      expect(q.options).toContain(q.target);
    }
  });

  it('options are all integers', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateHearTapQuestion();
      q.options.forEach((opt) => {
        expect(Number.isInteger(opt)).toBe(true);
      });
    }
  });

  it('options are within [min, max] when min=1, max=5', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateHearTapQuestion(1, 5);
      q.options.forEach((opt) => {
        expect(opt).toBeGreaterThanOrEqual(1);
        expect(opt).toBeLessThanOrEqual(5);
      });
    }
  });

  it('target is within [min, max] when min=1, max=10', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateHearTapQuestion(1, 10);
      expect(q.target).toBeGreaterThanOrEqual(1);
      expect(q.target).toBeLessThanOrEqual(10);
    }
  });

  it('options are 4 unique values', () => {
    // Run many times — since range [1,20] has 20 possible values, uniqueness should hold
    for (let i = 0; i < 50; i++) {
      const q = generateHearTapQuestion(1, 20);
      const unique = new Set(q.options);
      expect(unique.size).toBe(4);
    }
  });
});

describe('generateHearTapQuestions', () => {
  it('returns the requested count', () => {
    expect(generateHearTapQuestions(5)).toHaveLength(5);
    expect(generateHearTapQuestions(1)).toHaveLength(1);
    expect(generateHearTapQuestions(10)).toHaveLength(10);
  });

  it('returns empty array when count=0', () => {
    expect(generateHearTapQuestions(0)).toHaveLength(0);
  });

  it('each question in the batch passes invariants', () => {
    const questions = generateHearTapQuestions(20);
    questions.forEach((q) => {
      expect(q.options).toHaveLength(4);
      expect(q.options).toContain(q.target);
      expect(q.target).toBeGreaterThanOrEqual(1);
      expect(q.target).toBeLessThanOrEqual(20);
    });
  });
});

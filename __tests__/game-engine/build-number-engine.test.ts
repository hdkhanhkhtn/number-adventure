import {
  generateBuildNumberQuestion,
  generateBuildNumberQuestions,
} from '@/lib/game-engine/build-number-engine';

describe('generateBuildNumberQuestion', () => {
  it('returns target in range [11, 70]', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateBuildNumberQuestion();
      expect(q.target).toBeGreaterThanOrEqual(11);
      expect(q.target).toBeLessThanOrEqual(70);
    }
  });

  it('target is always an integer', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateBuildNumberQuestion();
      expect(Number.isInteger(q.target)).toBe(true);
    }
  });

  it('target is always a two-digit number (11-70)', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateBuildNumberQuestion();
      expect(q.target).toBeGreaterThan(10);
      expect(q.target).toBeLessThan(71);
    }
  });
});

describe('generateBuildNumberQuestions', () => {
  it('returns the requested count', () => {
    expect(generateBuildNumberQuestions(5)).toHaveLength(5);
    expect(generateBuildNumberQuestions(1)).toHaveLength(1);
    expect(generateBuildNumberQuestions(10)).toHaveLength(10);
  });

  it('returns empty array when count=0', () => {
    expect(generateBuildNumberQuestions(0)).toHaveLength(0);
  });

  it('each question in the batch has valid target range', () => {
    const questions = generateBuildNumberQuestions(30);
    questions.forEach((q) => {
      expect(q.target).toBeGreaterThanOrEqual(11);
      expect(q.target).toBeLessThanOrEqual(70);
    });
  });
});

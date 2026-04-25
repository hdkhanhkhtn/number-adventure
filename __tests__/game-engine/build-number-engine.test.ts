import {
  generateBuildNumberQuestion,
  generateBuildNumberQuestions,
} from '@/lib/game-engine/build-number-engine';

describe('generateBuildNumberQuestion', () => {
  it('returns target in default range [1, 99]', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateBuildNumberQuestion();
      expect(q.target).toBeGreaterThanOrEqual(1);
      expect(q.target).toBeLessThanOrEqual(99);
    }
  });

  it('target is always an integer', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateBuildNumberQuestion();
      expect(Number.isInteger(q.target)).toBe(true);
    }
  });

  it('respects explicit min/max range', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateBuildNumberQuestion(10, 50);
      expect(q.target).toBeGreaterThanOrEqual(10);
      expect(q.target).toBeLessThanOrEqual(50);
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

  it('each question in the batch has valid target range (default)', () => {
    const questions = generateBuildNumberQuestions(30);
    questions.forEach((q) => {
      expect(q.target).toBeGreaterThanOrEqual(1);
      expect(q.target).toBeLessThanOrEqual(99);
    });
  });
});

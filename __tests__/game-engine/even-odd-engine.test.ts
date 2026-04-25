import {
  generateEvenOddQuestion,
  generateEvenOddQuestions,
} from '@/lib/game-engine/even-odd-engine';

describe('generateEvenOddQuestion', () => {
  it('returns number in default range [1, 20]', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateEvenOddQuestion();
      expect(q.number).toBeGreaterThanOrEqual(1);
      expect(q.number).toBeLessThanOrEqual(20);
    }
  });

  it('isEven is always correct for the given number', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateEvenOddQuestion();
      expect(q.isEven).toBe(q.number % 2 === 0);
    }
  });

  it('never produces odd number with isEven=true', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateEvenOddQuestion();
      if (q.number % 2 !== 0) {
        expect(q.isEven).toBe(false);
      }
    }
  });

  it('never produces even number with isEven=false', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateEvenOddQuestion();
      if (q.number % 2 === 0) {
        expect(q.isEven).toBe(true);
      }
    }
  });

  it('number is always an integer', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateEvenOddQuestion();
      expect(Number.isInteger(q.number)).toBe(true);
    }
  });

  it('respects explicit min/max range', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateEvenOddQuestion(1, 50);
      expect(q.number).toBeGreaterThanOrEqual(1);
      expect(q.number).toBeLessThanOrEqual(50);
    }
  });
});

describe('generateEvenOddQuestions', () => {
  it('returns the requested count', () => {
    expect(generateEvenOddQuestions(5)).toHaveLength(5);
    expect(generateEvenOddQuestions(1)).toHaveLength(1);
    expect(generateEvenOddQuestions(10)).toHaveLength(10);
  });

  it('returns empty array when count=0', () => {
    expect(generateEvenOddQuestions(0)).toHaveLength(0);
  });

  it('all questions in the batch satisfy isEven invariant (default range)', () => {
    const questions = generateEvenOddQuestions(30);
    questions.forEach((q) => {
      expect(q.isEven).toBe(q.number % 2 === 0);
      expect(q.number).toBeGreaterThanOrEqual(1);
      expect(q.number).toBeLessThanOrEqual(20);
    });
  });
});

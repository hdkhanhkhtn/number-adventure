import {
  generateCountObjectsQuestion,
  generateCountObjectsQuestions,
  countObjectsEngine,
} from '@/lib/game-engine/count-objects-engine';

describe('generateCountObjectsQuestion', () => {
  it('returns correct shape', () => {
    const q = generateCountObjectsQuestion('easy');
    expect(q).toHaveProperty('type', 'count-objects');
    expect(q).toHaveProperty('items');
    expect(q).toHaveProperty('answer');
    expect(q).toHaveProperty('choices');
  });

  it('items.length equals answer', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateCountObjectsQuestion('easy');
      expect(q.items).toHaveLength(q.answer);
    }
  });

  it('choices has exactly 4 entries', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateCountObjectsQuestion('medium');
      expect(q.choices).toHaveLength(4);
    }
  });

  it('choices includes the correct answer', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateCountObjectsQuestion('hard');
      expect(q.choices).toContain(q.answer);
    }
  });

  it('choices are unique', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateCountObjectsQuestion('easy');
      expect(new Set(q.choices).size).toBe(4);
    }
  });

  it('answer is within easy range [1,5]', () => {
    for (let i = 0; i < 30; i++) {
      const q = generateCountObjectsQuestion('easy');
      expect(q.answer).toBeGreaterThanOrEqual(1);
      expect(q.answer).toBeLessThanOrEqual(5);
    }
  });

  it('answer is within medium range [1,10]', () => {
    for (let i = 0; i < 30; i++) {
      const q = generateCountObjectsQuestion('medium');
      expect(q.answer).toBeGreaterThanOrEqual(1);
      expect(q.answer).toBeLessThanOrEqual(10);
    }
  });

  it('answer is within hard range [1,20]', () => {
    for (let i = 0; i < 30; i++) {
      const q = generateCountObjectsQuestion('hard');
      expect(q.answer).toBeGreaterThanOrEqual(1);
      expect(q.answer).toBeLessThanOrEqual(20);
    }
  });

  it('defaults to easy when no difficulty given', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateCountObjectsQuestion();
      expect(q.answer).toBeGreaterThanOrEqual(1);
      expect(q.answer).toBeLessThanOrEqual(5);
    }
  });

  it('items are all the same emoji string', () => {
    const q = generateCountObjectsQuestion('easy');
    const unique = new Set(q.items);
    expect(unique.size).toBe(1);
  });
});

describe('generateCountObjectsQuestions', () => {
  it('returns requested count', () => {
    expect(generateCountObjectsQuestions(5, 'easy')).toHaveLength(5);
    expect(generateCountObjectsQuestions(0, 'easy')).toHaveLength(0);
  });
});

describe('countObjectsEngine', () => {
  it('generateQuestions returns correct count and shape', () => {
    const qs = countObjectsEngine.generateQuestions(3, 'medium');
    expect(qs).toHaveLength(3);
    qs.forEach((q) => {
      expect(q).toHaveProperty('type', 'count-objects');
    });
  });

  it('defaults to easy difficulty when none provided', () => {
    const qs = countObjectsEngine.generateQuestions(10);
    qs.forEach((q) => {
      expect((q as { answer: number }).answer).toBeGreaterThanOrEqual(1);
      expect((q as { answer: number }).answer).toBeLessThanOrEqual(5);
    });
  });
});

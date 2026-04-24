/**
 * Tests for add-take-engine.ts
 *
 * KNOWN BUG (documented): generateAddTakeQuestion() uses `while (opts.size < 4)`
 * with Math.max(0, target + random - 2). When target=0 (a === b with op='-'),
 * the distractor loop can run forever. This is a real engine defect.
 *
 * We use jest.spyOn(Math, 'random') to supply deterministic sequences that:
 * 1. Control op, a, b values (avoid a===b subtraction giving target=0)
 * 2. Ensure distractor generation terminates by providing varied offsets
 */
import {
  generateAddTakeQuestion,
  generateAddTakeQuestions,
} from '@/lib/game-engine/add-take-engine';

// Sequence-based random mock: returns values from the queue in order, cycling
function mockRandom(values: number[]) {
  let idx = 0;
  return jest.spyOn(Math, 'random').mockImplementation(() => {
    const v = values[idx % values.length];
    idx++;
    return v;
  });
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('generateAddTakeQuestion — addition path', () => {
  it('returns correct structure for "+" operation', () => {
    // Math.random() calls in order:
    // 1. op: > 0.5 → '+' (use 0.9)
    // 2. a: 2 + floor(0.5 * 6) = 5
    // 3. b: 1 + floor(0.5 * 4) = 3
    // target = 5 + 3 = 8
    // distractor loop (need 4 unique around 8):
    // floor(0.6*5)-2=1 → 8+1=9, floor(0.0*5)-2=-2 → 8-2=6, floor(0.4*5)-2=0 → 8+0=8(dupe), floor(0.8*5)-2=2 → 8+2=10
    mockRandom([0.9, 0.5, 0.5, 0.6, 0.0, 0.4, 0.8, 0.1, 0.3, 0.7]);

    const q = generateAddTakeQuestion();
    expect(q.op).toBe('+');
    expect(q.target).toBe(q.a + q.b);
    expect(q.target).toBeGreaterThan(0);
    expect(q.options).toContain(q.target);
    expect(q.options).toHaveLength(4);
  });

  it('all options are >= 0 for addition', () => {
    mockRandom([0.9, 0.5, 0.5, 0.6, 0.0, 0.4, 0.8, 0.1, 0.3, 0.7]);
    const q = generateAddTakeQuestion();
    q.options.forEach((opt) => expect(opt).toBeGreaterThanOrEqual(0));
  });
});

describe('generateAddTakeQuestion — subtraction path', () => {
  it('returns correct structure for "-" operation with a > b', () => {
    // op: <= 0.5 → '-' (use 0.1)
    // a: 2 + floor(0.8 * 6) = 6, b: 1 + floor(0.3 * 4) = 2
    // b(2) <= a(6) so no swap; target = 6 - 2 = 4
    // distractor loop for target=4 with varied offsets
    mockRandom([0.1, 0.8, 0.3, 0.8, 0.0, 0.4, 0.1, 0.7, 0.2, 0.6, 0.9]);

    const q = generateAddTakeQuestion();
    expect(q.op).toBe('-');
    expect(q.target).toBe(q.a - q.b);
    expect(q.target).toBeGreaterThanOrEqual(0);
    expect(q.b).toBeLessThanOrEqual(q.a);
    expect(q.options).toContain(q.target);
    expect(q.options).toHaveLength(4);
  });

  it('swaps a and b when b > a to prevent negative target', () => {
    // op: '-', a=2 (floor(0.0*6)=0 → 2+0=2), b=4 (floor(0.7*4)=2 → 1+2... wait, b range is 1+floor(r*4), so r=0.7→1+2=3)
    // Let's set a=2, b=3 → b>a so swap → a=3, b=2, target=1
    mockRandom([0.1, 0.0, 0.7, 0.8, 0.0, 0.4, 0.9, 0.2, 0.6]);

    const q = generateAddTakeQuestion();
    expect(q.op).toBe('-');
    expect(q.b).toBeLessThanOrEqual(q.a);
    expect(q.target).toBeGreaterThanOrEqual(0);
    expect(q.target).toBe(q.a - q.b);
  });
});

describe('generateAddTakeQuestion — option structure', () => {
  it('options contain exactly 4 unique values', () => {
    mockRandom([0.9, 0.5, 0.5, 0.8, 0.0, 0.6, 0.2, 0.4, 0.7, 0.1]);
    const q = generateAddTakeQuestion();
    expect(q.options).toHaveLength(4);
    const unique = new Set(q.options);
    expect(unique.size).toBe(4);
  });

  it('options are always integers', () => {
    mockRandom([0.9, 0.4, 0.6, 0.8, 0.0, 0.6, 0.2, 0.4, 0.7, 0.1]);
    const q = generateAddTakeQuestion();
    q.options.forEach((opt) => expect(Number.isInteger(opt)).toBe(true));
  });
});

describe('generateAddTakeQuestions', () => {
  it('returns the requested count', () => {
    // Provide enough random values for 3 questions (each needs ~10 values)
    mockRandom([
      0.9, 0.5, 0.5, 0.8, 0.0, 0.6, 0.2, 0.4, 0.7, 0.1,
      0.1, 0.8, 0.3, 0.8, 0.0, 0.4, 0.1, 0.7, 0.2, 0.6,
      0.9, 0.4, 0.6, 0.8, 0.0, 0.6, 0.2, 0.4, 0.7, 0.1,
    ]);
    expect(generateAddTakeQuestions(3)).toHaveLength(3);
  });

  it('returns empty array when count=0', () => {
    expect(generateAddTakeQuestions(0)).toHaveLength(0);
  });
});

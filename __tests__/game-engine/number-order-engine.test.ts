/**
 * Tests for number-order-engine.ts
 *
 * KNOWN RISK: generateNumberOrderQuestion() uses `while (opts.size < 3)` with
 * Math.max(1, target ± small_random). In narrow ranges this can loop.
 * We mock Math.random to supply deterministic sequences that always terminate.
 *
 * Random call order in generateNumberOrderQuestion():
 *   1. start = 1 + floor(r1 * 10)       → range [1..10]
 *   2. hideIdx = 1 + floor(r2 * 3)      → range [1..3]
 *   3. distractor loop: r3, r4... until 3 unique options built
 *      each iteration: direction = r > 0.5, magnitude = 1 + floor(r*3)
 */
import {
  generateNumberOrderQuestion,
  generateNumberOrderQuestions,
} from '@/lib/game-engine/number-order-engine';

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

describe('generateNumberOrderQuestion — structure', () => {
  it('seq has length 5 and is consecutive', () => {
    // start = 1 + floor(0.3*10) = 4 → seq=[4,5,6,7,8]
    // hideIdx = 1 + floor(0.5*3) = 2 → target=6
    // distractors: need 2 more besides 6
    //   r=0.8>0.5 → +ve, mag=1+floor(0.8*3)=3 → 6+3=9 ✓
    //   r=0.1<0.5 → -ve, mag=1+floor(0.1*3)=1 → max(1,6-1)=5 ✓  done
    mockRandom([0.3, 0.5, 0.8, 0.8, 0.1, 0.1]);

    const q = generateNumberOrderQuestion();
    expect(q.seq).toHaveLength(5);
    for (let j = 1; j < q.seq.length; j++) {
      expect(q.seq[j]).toBe(q.seq[j - 1] + 1);
    }
  });

  it('seq[0] is in range [1..10]', () => {
    mockRandom([0.3, 0.5, 0.8, 0.8, 0.1, 0.1]);
    const q = generateNumberOrderQuestion();
    expect(q.seq[0]).toBeGreaterThanOrEqual(1);
    expect(q.seq[0]).toBeLessThanOrEqual(10);
  });

  it('hideIdx is in [1, 2, 3] — never 0 or 4', () => {
    // hideIdx = 1 + floor(0.0*3) = 1
    mockRandom([0.5, 0.0, 0.8, 0.8, 0.1, 0.1]);
    const q = generateNumberOrderQuestion();
    expect(q.hideIdx).toBeGreaterThanOrEqual(1);
    expect(q.hideIdx).toBeLessThanOrEqual(3);
  });

  it('hideIdx=1 → hides second element', () => {
    // start=2, hideIdx=1+floor(0*3)=1 → target=seq[1]=3
    mockRandom([0.1, 0.0, 0.9, 0.9, 0.2, 0.0]);
    const q = generateNumberOrderQuestion();
    expect(q.hideIdx).toBe(1);
    expect(q.target).toBe(q.seq[1]);
  });

  it('hideIdx=3 → hides fourth element', () => {
    // start=3, hideIdx=1+floor(0.9*3)=3 → target=seq[3]
    mockRandom([0.2, 0.9, 0.8, 0.8, 0.1, 0.1]);
    const q = generateNumberOrderQuestion();
    expect(q.hideIdx).toBe(3);
    expect(q.target).toBe(q.seq[3]);
  });
});

describe('generateNumberOrderQuestion — correctness', () => {
  it('target always equals seq[hideIdx]', () => {
    mockRandom([0.3, 0.5, 0.8, 0.8, 0.1, 0.1]);
    const q = generateNumberOrderQuestion();
    expect(q.target).toBe(q.seq[q.hideIdx]);
  });

  it('options contain exactly 3 values including target', () => {
    mockRandom([0.3, 0.5, 0.8, 0.8, 0.1, 0.1]);
    const q = generateNumberOrderQuestion();
    expect(q.options).toHaveLength(3);
    expect(q.options).toContain(q.target);
  });

  it('all option values are integers >= 1', () => {
    mockRandom([0.3, 0.5, 0.8, 0.8, 0.1, 0.1]);
    const q = generateNumberOrderQuestion();
    q.options.forEach((opt) => {
      expect(Number.isInteger(opt)).toBe(true);
      expect(opt).toBeGreaterThanOrEqual(1);
    });
  });

  it('distractor options differ from target', () => {
    mockRandom([0.3, 0.5, 0.8, 0.8, 0.1, 0.1]);
    const q = generateNumberOrderQuestion();
    const distractors = q.options.filter((o) => o !== q.target);
    expect(distractors).toHaveLength(2);
    distractors.forEach((d) => expect(d).not.toBe(q.target));
  });
});

describe('generateNumberOrderQuestions', () => {
  it('returns the requested count', () => {
    // Enough random values for 3 questions (each needs ~6 values)
    mockRandom([
      0.3, 0.5, 0.8, 0.8, 0.1, 0.1,
      0.5, 0.3, 0.9, 0.9, 0.2, 0.0,
      0.1, 0.9, 0.6, 0.6, 0.4, 0.2,
    ]);
    expect(generateNumberOrderQuestions(3)).toHaveLength(3);
  });

  it('returns empty array when count=0', () => {
    expect(generateNumberOrderQuestions(0)).toHaveLength(0);
  });

  it('batch question invariants hold', () => {
    mockRandom([
      0.3, 0.5, 0.8, 0.8, 0.1, 0.1,
      0.5, 0.3, 0.9, 0.9, 0.2, 0.0,
      0.1, 0.9, 0.6, 0.6, 0.4, 0.2,
    ]);
    const questions = generateNumberOrderQuestions(3);
    questions.forEach((q) => {
      expect(q.seq).toHaveLength(5);
      expect(q.options).toHaveLength(3);
      expect(q.options).toContain(q.target);
      expect(q.target).toBe(q.seq[q.hideIdx]);
      expect(q.hideIdx).toBeGreaterThanOrEqual(1);
      expect(q.hideIdx).toBeLessThanOrEqual(3);
    });
  });
});

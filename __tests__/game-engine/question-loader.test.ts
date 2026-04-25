import { generateLocalQuestions, loadQuestions } from '@/lib/game-engine/question-loader';
import type { GameType } from '@/lib/types/common';

// Polyfill fetch for Node.js test environment
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('generateLocalQuestions', () => {
  it('generates hear-tap questions', () => {
    const qs = generateLocalQuestions('hear-tap', 5);
    expect(qs).toHaveLength(5);
    qs.forEach((q) => {
      expect(q).toHaveProperty('target');
      expect(q).toHaveProperty('options');
    });
  });

  it('generates build-number questions', () => {
    const qs = generateLocalQuestions('build-number', 3);
    expect(qs).toHaveLength(3);
    qs.forEach((q) => {
      expect(q).toHaveProperty('target');
    });
  });

  it('generates even-odd questions', () => {
    const qs = generateLocalQuestions('even-odd', 4);
    expect(qs).toHaveLength(4);
    qs.forEach((q) => {
      expect(q).toHaveProperty('number');
      expect(q).toHaveProperty('isEven');
    });
  });

  it('generates number-order questions', () => {
    const qs = generateLocalQuestions('number-order', 3);
    expect(qs).toHaveLength(3);
    qs.forEach((q) => {
      expect(q).toHaveProperty('seq');
      expect(q).toHaveProperty('hideIdx');
    });
  });

  it('generates add-take questions', () => {
    const qs = generateLocalQuestions('add-take', 3);
    expect(qs).toHaveLength(3);
    qs.forEach((q) => {
      expect(q).toHaveProperty('op');
      expect(q).toHaveProperty('target');
    });
  });

  it('returns empty array for unknown game type (registry miss)', () => {
    // Registry has no entry for unknown types — returns [] instead of silent fallback
    const qs = generateLocalQuestions('unknown-game' as GameType, 3);
    expect(qs).toHaveLength(0);
  });

  it('generates count-objects questions', () => {
    const qs = generateLocalQuestions('count-objects', 3);
    expect(qs).toHaveLength(3);
    qs.forEach((q) => {
      expect(q).toHaveProperty('type', 'count-objects');
      expect(q).toHaveProperty('items');
      expect(q).toHaveProperty('answer');
      expect(q).toHaveProperty('choices');
    });
  });

  it('generates number-writing questions', () => {
    const qs = generateLocalQuestions('number-writing', 3);
    expect(qs).toHaveLength(3);
    qs.forEach((q) => {
      expect(q).toHaveProperty('type', 'number-writing');
      expect(q).toHaveProperty('digit');
      expect(q).toHaveProperty('dotPath');
      expect(q).toHaveProperty('totalDots');
    });
  });

  it('returns empty array when count=0', () => {
    expect(generateLocalQuestions('hear-tap', 0)).toHaveLength(0);
  });
});

describe('loadQuestions', () => {
  it('returns AI questions when fetch succeeds', async () => {
    const mockPayload = { target: 5, options: [3, 5, 7, 9] };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        questions: [
          { id: 'q1', payload: mockPayload },
          { id: 'q2', payload: mockPayload },
        ],
      }),
    });

    const result = await loadQuestions('lesson-1', 'hear-tap', 2);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockPayload);
  });

  it('falls back to local generation when fetch returns non-ok status', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const result = await loadQuestions('lesson-1', 'hear-tap', 3);
    expect(result).toHaveLength(3);
    // local fallback produces hear-tap questions with 'options'
    result.forEach((q) => {
      expect(q).toHaveProperty('options');
    });
  });

  it('falls back to local generation on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));

    const result = await loadQuestions('lesson-1', 'even-odd', 3);
    expect(result).toHaveLength(3);
    result.forEach((q) => {
      expect(q).toHaveProperty('isEven');
    });
  });

  it('falls back to local generation when response JSON is malformed', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => { throw new SyntaxError('Unexpected token'); },
    });

    const result = await loadQuestions('lesson-1', 'add-take', 2);
    expect(result).toHaveLength(2);
  });

  it('uses default count=5 when count not specified', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    const result = await loadQuestions('lesson-1', 'build-number');
    expect(result).toHaveLength(5);
  });
});

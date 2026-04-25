/**
 * @jest-environment jsdom
 *
 * Tests for lib/pwa/offline-attempt-queue.ts
 * W3 coverage: drain loop must skip-and-delete on permanent 4xx errors
 * (session deleted, invalid payload) and only break on transient 5xx / network errors.
 */

// ── Mock idb BEFORE module import ────────────────────────────────
const mockDelete = jest.fn();
const mockGetAll = jest.fn();
const mockAdd = jest.fn();
const mockCount = jest.fn();

jest.mock('idb', () => ({
  openDB: jest.fn().mockResolvedValue({
    getAll: (...args: unknown[]) => mockGetAll(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
    add: (...args: unknown[]) => mockAdd(...args),
    count: (...args: unknown[]) => mockCount(...args),
  }),
}));

import { trySyncNow, queueAttempt, getQueuedCount } from '@/lib/pwa/offline-attempt-queue';

// ── Helpers ───────────────────────────────────────────────────────
function makeItem(id: number, sessionId = 'sess-1') {
  return { id, sessionId, answer: '5', correct: true, timeMs: 800, queuedAt: Date.now() };
}

const okResponse = { ok: true, status: 200 } as Response;
const notFoundResponse = { ok: false, status: 404 } as Response;
const badRequestResponse = { ok: false, status: 400 } as Response;
const serverErrorResponse = { ok: false, status: 503 } as Response;

// ── Setup ─────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
  // Default: online
  Object.defineProperty(navigator, 'onLine', { value: true, configurable: true, writable: true });
  mockDelete.mockResolvedValue(undefined);
  mockAdd.mockResolvedValue(1);
  mockCount.mockResolvedValue(0);
});

// ── trySyncNow — W3 drain behaviour ──────────────────────────────

describe('trySyncNow', () => {
  it('skips sync entirely when navigator.onLine is false', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

    await trySyncNow();

    expect(mockGetAll).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('does nothing when queue is empty', async () => {
    mockGetAll.mockResolvedValue([]);

    await trySyncNow();

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('deletes item after 200 success', async () => {
    const item = makeItem(1);
    mockGetAll.mockResolvedValue([item]);
    (global.fetch as jest.Mock).mockResolvedValue(okResponse);

    await trySyncNow();

    expect(mockDelete).toHaveBeenCalledWith('attempts', item.id);
  });

  // ── W3: 4xx permanent errors — skip-and-delete ────────────────

  it('W3: deletes item and continues to next on 404 (session deleted)', async () => {
    const item1 = makeItem(1, 'sess-old');
    const item2 = makeItem(2, 'sess-current');
    mockGetAll.mockResolvedValue([item1, item2]);
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(notFoundResponse)  // item1: 404 — skip
      .mockResolvedValueOnce(okResponse);        // item2: 200 — success

    await trySyncNow();

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(mockDelete).toHaveBeenCalledWith('attempts', item1.id);
    expect(mockDelete).toHaveBeenCalledWith('attempts', item2.id);
  });

  it('W3: deletes item and continues to next on 400 (invalid payload)', async () => {
    const item1 = makeItem(1);
    const item2 = makeItem(2);
    mockGetAll.mockResolvedValue([item1, item2]);
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(badRequestResponse) // item1: 400 — skip
      .mockResolvedValueOnce(okResponse);         // item2: 200 — success

    await trySyncNow();

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(mockDelete).toHaveBeenCalledWith('attempts', item1.id);
    expect(mockDelete).toHaveBeenCalledWith('attempts', item2.id);
  });

  it('W3: processes all items if all return 4xx (queue fully drained)', async () => {
    const items = [makeItem(1), makeItem(2), makeItem(3)];
    mockGetAll.mockResolvedValue(items);
    (global.fetch as jest.Mock).mockResolvedValue(notFoundResponse);

    await trySyncNow();

    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(mockDelete).toHaveBeenCalledTimes(3);
  });

  // ── W3: 5xx transient errors — break and retry later ──────────

  it('W3: breaks on 5xx server error without deleting item', async () => {
    const item1 = makeItem(1);
    const item2 = makeItem(2);
    mockGetAll.mockResolvedValue([item1, item2]);
    (global.fetch as jest.Mock).mockResolvedValueOnce(serverErrorResponse); // item1: 503

    await trySyncNow();

    expect(global.fetch).toHaveBeenCalledTimes(1); // stopped after item1
    expect(mockDelete).not.toHaveBeenCalled();      // item1 NOT deleted — will retry
  });

  it('W3: breaks on network error (fetch throws) without deleting item', async () => {
    const item = makeItem(1);
    mockGetAll.mockResolvedValue([item]);
    (global.fetch as jest.Mock).mockRejectedValue(new TypeError('Failed to fetch'));

    await trySyncNow();

    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('W3: resumes processing after 4xx, then breaks on 5xx', async () => {
    const item1 = makeItem(1);
    const item2 = makeItem(2);
    const item3 = makeItem(3);
    mockGetAll.mockResolvedValue([item1, item2, item3]);
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(notFoundResponse)   // item1: 404 — skip
      .mockResolvedValueOnce(serverErrorResponse) // item2: 503 — break
      .mockResolvedValueOnce(okResponse);         // item3: never reached

    await trySyncNow();

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledWith('attempts', item1.id);
    expect(mockDelete).not.toHaveBeenCalledWith('attempts', item2.id);
  });
});

// ── queueAttempt ─────────────────────────────────────────────────

describe('queueAttempt', () => {
  it('adds attempt to the store', async () => {
    await queueAttempt('sess-1', { answer: '5', correct: true, timeMs: 500 });

    expect(mockAdd).toHaveBeenCalledWith(
      'attempts',
      expect.objectContaining({ sessionId: 'sess-1', answer: '5', correct: true }),
    );
  });

  it('does not throw if idb add fails', async () => {
    mockAdd.mockRejectedValue(new Error('IDB quota exceeded'));

    await expect(queueAttempt('sess-1', { answer: '5', correct: true })).resolves.not.toThrow();
  });
});

// ── getQueuedCount ────────────────────────────────────────────────

describe('getQueuedCount', () => {
  it('returns the count from the store', async () => {
    mockCount.mockResolvedValue(3);

    const count = await getQueuedCount();

    expect(count).toBe(3);
  });

  it('returns 0 if idb count fails', async () => {
    mockCount.mockRejectedValue(new Error('IDB unavailable'));

    const count = await getQueuedCount();

    expect(count).toBe(0);
  });
});

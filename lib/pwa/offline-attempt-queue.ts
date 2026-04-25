import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'bap-offline-queue';
const DB_VERSION = 1;
const STORE_NAME = 'attempts';

interface QueuedAttempt {
  id?: number; // auto-increment key
  sessionId: string;
  questionId?: string;
  answer: string;
  correct: boolean;
  timeMs?: number;
  queuedAt: number; // Date.now()
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
}

/** Queue a failed attempt for later sync */
export async function queueAttempt(
  sessionId: string,
  attempt: { questionId?: string; answer: string; correct: boolean; timeMs?: number },
): Promise<void> {
  try {
    const db = await getDB();
    await db.add(STORE_NAME, {
      sessionId,
      ...attempt,
      queuedAt: Date.now(),
    } satisfies Omit<QueuedAttempt, 'id'>);
  } catch (err) {
    console.warn('[offline-queue] Failed to queue attempt:', err);
  }
}

/** Drain queued attempts — call when back online */
export async function trySyncNow(): Promise<void> {
  if (typeof navigator === 'undefined' || !navigator.onLine) return;

  try {
    const db = await getDB();
    const all = await db.getAll(STORE_NAME) as QueuedAttempt[];
    if (all.length === 0) return;

    for (const item of all) {
      try {
        const res = await fetch(`/api/sessions/${item.sessionId}/attempts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: item.questionId,
            answer: item.answer,
            correct: item.correct,
            timeMs: item.timeMs,
          }),
        });
        if (res.ok && item.id != null) {
          await db.delete(STORE_NAME, item.id);
        } else {
          break; // stop on first failure, retry later
        }
      } catch {
        break; // network error — stop draining, will retry next trigger
      }
    }
  } catch (err) {
    console.warn('[offline-queue] Sync failed:', err);
  }
}

/** Get count of queued items (for UI indicator) */
export async function getQueuedCount(): Promise<number> {
  try {
    const db = await getDB();
    return await db.count(STORE_NAME);
  } catch {
    return 0;
  }
}

// NOTE: in-memory only — resets on process restart. For multi-instance deploy, migrate to Redis.

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const attemptMap = new Map<string, number[]>();

export function checkRateLimit(ip: string): {
  allowed: boolean;
  attemptsRemaining: number;
  retryAfterMs: number;
} {
  const now = Date.now();
  const prev = (attemptMap.get(ip) ?? []).filter(t => now - t < WINDOW_MS);

  if (prev.length >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      attemptsRemaining: 0,
      retryAfterMs: WINDOW_MS - (now - prev[0]),
    };
  }

  attemptMap.set(ip, [...prev, now]);
  return {
    allowed: true,
    attemptsRemaining: MAX_ATTEMPTS - prev.length - 1,
    retryAfterMs: 0,
  };
}

export function clearRateLimit(ip: string): void {
  attemptMap.delete(ip);
}

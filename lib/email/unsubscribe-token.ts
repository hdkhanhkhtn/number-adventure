/**
 * HMAC-SHA256 signed unsubscribe tokens — prevents unauthorized opt-out via bare parentId.
 *
 * Token format: base64url(parentId):base64url(hmac)
 * Secret: CRON_SECRET env var (shared with cron auth; never exposed in URLs)
 */
import { createHmac, timingSafeEqual } from 'crypto';

const ALGORITHM = 'sha256';

function secret(): string {
  const s = process.env.CRON_SECRET;
  if (!s) throw new Error('CRON_SECRET env var is required for unsubscribe tokens');
  return s;
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString('base64url');
}

/** Generate a signed token for the given parentId */
export function createUnsubscribeToken(parentId: string): string {
  const sig = createHmac(ALGORITHM, secret()).update(parentId).digest();
  return `${b64url(parentId)}:${b64url(sig)}`;
}

/** Verify a token and return the parentId, or null if invalid */
export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const [encodedId, encodedSig] = token.split(':');
    if (!encodedId || !encodedSig) return null;

    const parentId = Buffer.from(encodedId, 'base64url').toString('utf8');
    const expectedSig = createHmac(ALGORITHM, secret()).update(parentId).digest();
    const actualSig = Buffer.from(encodedSig, 'base64url');

    if (actualSig.length !== expectedSig.length) return null;
    if (!timingSafeEqual(expectedSig, actualSig)) return null;

    return parentId;
  } catch {
    return null;
  }
}

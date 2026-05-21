/**
 * In-memory rate limiter (single-process).
 * Not shared across instances or restarts — sufficient for one Docker container.
 */

const buckets = new Map<string, number>();

/**
 * Returns true if the request is allowed (first in window or window expired).
 * Returns false if the key was seen within windowMs.
 */
export function consumeRateLimit(key: string, windowMs: number): boolean {
  const now = Date.now();
  const staleBefore = now - windowMs * 5;

  for (const [k, ts] of buckets) {
    if (ts < staleBefore) buckets.delete(k);
  }

  const last = buckets.get(key);
  if (last != null && now - last < windowMs) {
    return false;
  }

  buckets.set(key, now);
  return true;
}

export function parseCooldownMs(envValue: string | undefined, fallbackMs = 60_000): number {
  const parsed = Number(envValue);
  if (!Number.isFinite(parsed) || parsed < 1_000) return fallbackMs;
  return Math.min(parsed, 3_600_000);
}

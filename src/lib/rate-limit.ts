import "server-only";

// In-memory sliding window limiter. Good enough for Phase 1 on a single
// long-lived process; on Vercel's serverless functions each cold start
// resets this, so it should be swapped for a shared store (e.g. a
// `rate_limits` table or Upstash Redis) before relying on it in production.
const hits = new Map<string, number[]>();

export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (timestamps.length >= max) {
    hits.set(key, timestamps);
    return false;
  }
  timestamps.push(now);
  hits.set(key, timestamps);
  return true;
}

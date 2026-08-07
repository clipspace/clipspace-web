// Fixed-window rate limiter kept in process memory.
//
// This is deliberately modest: on serverless each instance keeps its own
// counters, so a determined attacker spread across instances gets a higher
// effective limit. It exists to stop a single client from hammering the
// database, not to stop a distributed attack — that is the Vercel WAF's job
// (see the firewall rules in README/notes). Cheap, no dependencies, no
// network round-trip on the hot path.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Cap the map so that a flood of unique keys (spoofed IPs) can't turn the
// limiter itself into a memory-exhaustion vector.
const MAX_BUCKETS = 20_000;

function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
  // Still oversized after dropping the expired ones: start fresh rather than
  // grow without bound. Worst case a few clients get a fresh window.
  if (buckets.size > MAX_BUCKETS) buckets.clear();
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();

  if (buckets.size >= MAX_BUCKETS) sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

  if (bucket.count > limit) {
    return { ok: false, remaining: 0, retryAfterSeconds };
  }
  return { ok: true, remaining: limit - bucket.count, retryAfterSeconds };
}

export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

/**
 * Best-effort client identity. On Vercel `x-forwarded-for` is set by the
 * platform, so the left-most entry is the real client. Everything falls back
 * to a shared bucket, which is intentionally conservative.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

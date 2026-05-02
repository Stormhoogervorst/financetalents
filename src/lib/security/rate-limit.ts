import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitResult = {
  ok: boolean;
  retryAfterSeconds: number;
};

// Lazily created singleton — avoids cold-start errors when env vars are absent.
let ratelimiter: Ratelimit | null = null;

function getRatelimiter(): Ratelimit | null {
  if (ratelimiter) return ratelimiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  const redis = new Redis({ url, token });

  ratelimiter = new Ratelimit({
    redis,
    // Sliding-window: smooths bursts better than fixed windows.
    limiter: Ratelimit.slidingWindow(10, "10 m"),
    prefix: "@legaltalents/rl",
    analytics: false,
  });

  return ratelimiter;
}

/**
 * Checks rate-limit for `key` using Upstash sliding-window when configured,
 * falling back to always-allow when Upstash env vars are absent (e.g. local dev).
 *
 * Per-route limits are expressed as a simple token multiplier:
 *   - `limit`     max hits per window (overrides the default 10)
 *   - `windowMs`  kept for API compatibility but the Ratelimit window is set in
 *                 the constructor above ("10 m"). Adjust there if needed.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  _windowMs: number
): Promise<RateLimitResult> {
  const rl = getRatelimiter();

  if (!rl) {
    // No Upstash configured — fall back to always-allow.
    return { ok: true, retryAfterSeconds: 0 };
  }

  // Use a custom limiter with the per-route `limit` via a named sub-limiter.
  const perRoute = new Ratelimit({
    redis: (rl as unknown as { redis: Redis }).redis,
    limiter: Ratelimit.slidingWindow(limit, "10 m"),
    prefix: "@legaltalents/rl",
    analytics: false,
  });

  const { success, reset } = await perRoute.limit(key);
  const retryAfterSeconds = success
    ? 0
    : Math.max(1, Math.ceil((reset - Date.now()) / 1000));

  return { ok: success, retryAfterSeconds };
}

export function getRequestIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return headers.get("x-real-ip") ?? "unknown";
}

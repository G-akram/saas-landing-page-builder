/**
 * In-memory sliding window rate limiter for server actions.
 *
 * Why in-memory: single-process deployment (Vercel serverless or dev).
 * For multi-instance deploys, swap to Redis-backed implementation.
 *
 * Each limiter tracks request timestamps per key (typically userId).
 * Old entries are pruned on every check to prevent unbounded growth.
 */

interface RateLimiterConfig {
  /** Maximum requests allowed within the window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
}

interface RateLimitResult {
  isAllowed: boolean
  retryAfterMs: number | null
}

export function createRateLimiter(config: RateLimiterConfig): {
  check: (key: string) => RateLimitResult
} {
  const requests = new Map<string, number[]>()

  function check(key: string): RateLimitResult {
    const now = Date.now()
    const windowStart = now - config.windowMs

    // Get existing timestamps, prune expired
    const timestamps = (requests.get(key) ?? []).filter((t) => t > windowStart)

    if (timestamps.length >= config.maxRequests) {
      const oldestInWindow = timestamps[0]
      const retryAfterMs = oldestInWindow !== undefined
        ? (oldestInWindow + config.windowMs) - now
        : config.windowMs
      requests.set(key, timestamps)
      return { isAllowed: false, retryAfterMs }
    }

    timestamps.push(now)
    requests.set(key, timestamps)
    return { isAllowed: true, retryAfterMs: null }
  }

  return { check }
}

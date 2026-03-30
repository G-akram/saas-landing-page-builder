import { and, asc, eq, lt, gte } from 'drizzle-orm'

import { db, rateLimitEvents } from '@/shared/db'

interface RateLimiterConfig {
  /** Stable limiter scope name so different actions don't share buckets */
  name: string
  /** Maximum requests allowed within the window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
}

interface RateLimitResult {
  isAllowed: boolean
  retryAfterMs: number | null
}

type RateLimiterStorage = 'memory' | 'database'

export function createRateLimiter(config: RateLimiterConfig): {
  check: (key: string) => Promise<RateLimitResult>
} {
  const storage = getRateLimiterStorage()

  if (storage === 'database') {
    return {
      check: async (key: string): Promise<RateLimitResult> => {
        const now = new Date()
        const windowStart = new Date(now.getTime() - config.windowMs)

        await db.insert(rateLimitEvents).values({
          scope: config.name,
          key,
          occurredAt: now,
        })

        const matchingEvents = await db
          .select({ occurredAt: rateLimitEvents.occurredAt })
          .from(rateLimitEvents)
          .where(
            and(
              eq(rateLimitEvents.scope, config.name),
              eq(rateLimitEvents.key, key),
              gte(rateLimitEvents.occurredAt, windowStart),
            ),
          )
          .orderBy(asc(rateLimitEvents.occurredAt))

        await db
          .delete(rateLimitEvents)
          .where(
            and(
              eq(rateLimitEvents.scope, config.name),
              eq(rateLimitEvents.key, key),
              lt(rateLimitEvents.occurredAt, windowStart),
            ),
          )

        if (matchingEvents.length > config.maxRequests) {
          const oldestInWindow = matchingEvents[0]?.occurredAt
          const retryAfterMs = oldestInWindow
            ? oldestInWindow.getTime() + config.windowMs - now.getTime()
            : config.windowMs

          return {
            isAllowed: false,
            retryAfterMs,
          }
        }

        return {
          isAllowed: true,
          retryAfterMs: null,
        }
      },
    }
  }

  const requests = new Map<string, number[]>()

  function check(key: string): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - config.windowMs

    // Get existing timestamps, prune expired
    const timestamps = (requests.get(key) ?? []).filter((t) => t > windowStart)

    if (timestamps.length >= config.maxRequests) {
      const oldestInWindow = timestamps[0]
      const retryAfterMs =
        oldestInWindow !== undefined ? oldestInWindow + config.windowMs - now : config.windowMs
      requests.set(key, timestamps)
      return Promise.resolve({ isAllowed: false, retryAfterMs })
    }

    timestamps.push(now)
    requests.set(key, timestamps)
    return Promise.resolve({ isAllowed: true, retryAfterMs: null })
  }

  return { check }
}

function getRateLimiterStorage(): RateLimiterStorage {
  const rawStorage = process.env.RATE_LIMIT_STORAGE

  if (!rawStorage) {
    return 'memory'
  }

  if (rawStorage === 'memory' || rawStorage === 'database') {
    return rawStorage
  }

  throw new Error(
    `Unsupported RATE_LIMIT_STORAGE "${rawStorage}". Supported values: memory, database`,
  )
}

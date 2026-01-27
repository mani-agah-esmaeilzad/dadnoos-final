import { redis } from '@/lib/redis/client'

export class RateLimitError extends Error {
  status = 429
  retryAfter?: number

  constructor(message: string, retryAfter?: number) {
    super(message)
    this.retryAfter = retryAfter
  }
}

export async function enforceRateLimit({
  key,
  limit,
  windowSeconds,
}: {
  key: string
  limit: number
  windowSeconds: number
}) {
  try {
    const count = await redis.incr(key)
    if (count === 1) {
      await redis.expire(key, windowSeconds)
    }

    if (count > limit) {
      const ttl = await redis.ttl(key)
      throw new RateLimitError('Too many requests. Please try again later.', ttl >= 0 ? ttl : undefined)
    }

    const ttl = await redis.ttl(key)
    return {
      remaining: Math.max(0, limit - count),
      resetSeconds: ttl,
      count,
    }
  } catch (error) {
    console.warn('Rate limit skipped due to Redis error:', (error as Error).message)
    return {
      remaining: limit,
      resetSeconds: windowSeconds,
      count: 0,
      skipped: true,
    }
  }
}

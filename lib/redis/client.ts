import Redis from 'ioredis'

import { env } from '@/lib/env'

const globalForRedis = globalThis as unknown as {
  redis?: Redis
}

type MemoryEntry = {
  value: string
  expiresAt: number | null
}

function createMemoryRedis() {
  const store = new Map<string, MemoryEntry>()

  const cleanup = () => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (entry.expiresAt !== null && entry.expiresAt <= now) {
        store.delete(key)
      }
    }
  }

  const getEntry = (key: string) => {
    cleanup()
    return store.get(key) || null
  }

  const setEntry = (key: string, value: string, ttlSeconds?: number) => {
    const expiresAt = typeof ttlSeconds === 'number' ? Date.now() + ttlSeconds * 1000 : null
    store.set(key, { value, expiresAt })
  }

  const memoryRedis = {
    async get(key: string) {
      const entry = getEntry(key)
      return entry ? entry.value : null
    },
    async setex(key: string, ttlSeconds: number, value: string) {
      setEntry(key, value, ttlSeconds)
      return 'OK'
    },
    async incr(key: string) {
      const entry = getEntry(key)
      const current = entry ? parseInt(entry.value, 10) || 0 : 0
      const next = current + 1
      setEntry(key, String(next), entry?.expiresAt ? Math.max(0, (entry.expiresAt - Date.now()) / 1000) : undefined)
      return next
    },
    async decr(key: string) {
      const entry = getEntry(key)
      const current = entry ? parseInt(entry.value, 10) || 0 : 0
      const next = current - 1
      setEntry(key, String(next), entry?.expiresAt ? Math.max(0, (entry.expiresAt - Date.now()) / 1000) : undefined)
      return next
    },
    async expire(key: string, ttlSeconds: number) {
      const entry = getEntry(key)
      if (!entry) return 0
      entry.expiresAt = Date.now() + ttlSeconds * 1000
      store.set(key, entry)
      return 1
    },
    async ttl(key: string) {
      const entry = getEntry(key)
      if (!entry) return -2
      if (entry.expiresAt === null) return -1
      return Math.max(-1, Math.floor((entry.expiresAt - Date.now()) / 1000))
    },
    async del(...keys: string[]) {
      let removed = 0
      for (const key of keys) {
        if (store.delete(key)) removed += 1
      }
      return removed
    },
    multi() {
      const queue: Array<() => Promise<any>> = []
      const api = {
        setex(key: string, ttlSeconds: number, value: string) {
          queue.push(() => memoryRedis.setex(key, ttlSeconds, value))
          return api
        },
        exec: async () => {
          const results = []
          for (const fn of queue) {
            results.push(await fn())
          }
          return results
        },
      }
      return api
    },
  }

  console.warn('Redis URL invalid for production, using in-memory mock store.')
  return memoryRedis as unknown as Redis
}

const shouldUseMemoryRedis =
  process.env.VERCEL === '1' &&
  (!env.REDIS_URL || /localhost|127\.0\.0\.1/.test(env.REDIS_URL || ''))

export const redis =
  globalForRedis.redis ||
  (shouldUseMemoryRedis
    ? createMemoryRedis()
    : new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        lazyConnect: false,
        enableOfflineQueue: true,
      }))

if (!shouldUseMemoryRedis && redis instanceof Redis) {
  redis.on('error', (error) => {
    console.error('Redis connection error:', error.message)
  })
}

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}

export default redis

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

interface CacheOptions {
  ttl?: number
  key?: (request: FastifyRequest) => string
}

export function createCache(fastify: FastifyInstance) {
  const DEFAULT_TTL = 60 // 1 minute

  return {
    async get<T>(key: string): Promise<T | null> {
      if (!fastify.redis) return null
      
      try {
        const cached = await fastify.redis.get(key)
        if (cached) {
          return JSON.parse(cached)
        }
        return null
      } catch (err) {
        fastify.log.warn({ err, key }, 'Cache get failed')
        return null
      }
    },

    async set(key: string, value: any, ttl: number = DEFAULT_TTL): Promise<void> {
      if (!fastify.redis) return
      
      try {
        await fastify.redis.setex(key, ttl, JSON.stringify(value))
      } catch (err) {
        fastify.log.warn({ err, key }, 'Cache set failed')
      }
    },

    async del(pattern: string): Promise<void> {
      if (!fastify.redis) return
      
      try {
        if (pattern.includes('*')) {
          const keys = await fastify.redis.keys(pattern)
          if (keys.length > 0) {
            await fastify.redis.del(...keys)
          }
        } else {
          await fastify.redis.del(pattern)
        }
      } catch (err) {
        fastify.log.warn({ err, pattern }, 'Cache delete failed')
      }
    },

    async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl: number = DEFAULT_TTL): Promise<T> {
      const cached = await this.get<T>(key)
      if (cached !== null) {
        return cached
      }
      
      const value = await fetcher()
      await this.set(key, value, ttl)
      return value
    },
  }
}

export type CacheService = ReturnType<typeof createCache>

// Cache keys helper
export const CacheKeys = {
  drivers: {
    list: (filters?: any) => `drivers:list:${JSON.stringify(filters || {})}`,
    detail: (id: string) => `drivers:detail:${id}`,
  },
  units: {
    list: (filters?: any) => `units:list:${JSON.stringify(filters || {})}`,
    detail: (id: string) => `units:detail:${id}`,
  },
  clients: {
    list: (filters?: any) => `clients:list:${JSON.stringify(filters || {})}`,
    detail: (id: string) => `clients:detail:${id}`,
  },
  jobs: {
    list: (filters?: any) => `jobs:list:${JSON.stringify(filters || {})}`,
    detail: (id: string) => `jobs:detail:${id}`,
  },
  assignments: {
    list: (filters?: any) => `assignments:list:${JSON.stringify(filters || {})}`,
    detail: (id: string) => `assignments:detail:${id}`,
  },
  dashboard: {
    stats: () => 'dashboard:stats',
    activity: () => 'dashboard:activity',
  },
}

// Cache invalidation helper
export function invalidateCache(cache: CacheService, entity: string, id?: string) {
  const patterns = [
    `${entity}:list:*`,
    ...(id ? [`${entity}:detail:${id}`] : []),
  ]

  return Promise.all(patterns.map(p => cache.del(p)))
}

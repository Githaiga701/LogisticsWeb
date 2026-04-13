import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { errorHandler } from './errors'

export async function applyMiddleware(fastify: FastifyInstance) {
  // Rate limiting middleware
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip rate limiting for health checks
    if (request.url === '/health') return

    // Get client identifier (IP or user ID)
    const clientId = request.ip || 'unknown'
    const key = `ratelimit:${clientId}`
    const limit = 100
    const window = 60 // seconds

    if (fastify.redis) {
      try {
        const current = await fastify.redis.incr(key)
        
        if (current === 1) {
          await fastify.redis.expire(key, window)
        }

        if (current > limit) {
          const ttl = await fastify.redis.ttl(key)
          reply.header('X-RateLimit-Limit', limit)
          reply.header('X-RateLimit-Remaining', 0)
          reply.header('X-RateLimit-Reset', ttl)
          
          return reply.status(429).send({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many requests, please try again later',
              retryAfter: ttl,
            },
          })
        }

        reply.header('X-RateLimit-Limit', limit)
        reply.header('X-RateLimit-Remaining', limit - current)
      } catch (err) {
        request.log.warn({ err }, 'Rate limiting failed, continuing without')
      }
    }
  })

  // Request logging
  fastify.addHook('onRequest', async (request: FastifyRequest) => {
    request.log.info({
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
    }, 'Incoming request')
  })

  // Response time header
  fastify.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload: any) => {
    const responseTime = reply.elapsedTime
    reply.header('X-Response-Time', `${Math.round(responseTime)}ms`)
    return payload
  })

  // Global error handler
  fastify.setErrorHandler(errorHandler)

  // 404 handler
  fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${request.method} ${request.url} not found`,
      },
    })
  })
}

// Authentication middleware factory
export function requireAuth() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      })
    }
  }
}

// Role-based access control middleware factory
export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userRole = (request as any).user?.role
    
    if (!userRole || !roles.includes(userRole)) {
      return reply.status(403).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource',
        },
      })
    }
  }
}

// Cache middleware for GET requests
export function cacheResponse(seconds: number) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.method !== 'GET') return
    
    const key = `cache:${request.url}`
    
    if (fastify.redis) {
      try {
        const cached = await fastify.redis.get(key)
        if (cached) {
          reply.header('X-Cache', 'HIT')
          return reply.send(JSON.parse(cached))
        }
      } catch (err) {
        request.log.warn({ err }, 'Cache read failed')
      }
    }
    
    reply.header('X-Cache', 'MISS')
  }
}

// Declare fastify instance for cache middleware
declare module 'fastify' {
  interface FastifyInstance {
    redis: any
  }
}

const fastify = {} as FastifyInstance

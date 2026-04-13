import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import { PrismaClient } from '@prisma/client'
import Redis from 'ioredis'
import { applyMiddleware } from './middleware'

// Prevent multiple instances in serverless
const globalForPrisma = global as unknown as { prisma: PrismaClient }
const globalForRedis = global as unknown as { redis: Redis | null }

// Prisma configuration
const prismaClientOptions = {
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] as const
    : ['error'] as const,
  errorFormat: 'pretty' as const,
}

export const prisma = globalForPrisma.prisma || new PrismaClient(prismaClientOptions)

// Redis configuration
export const redis = process.env.REDIS_URL 
  ? (globalForRedis.redis || new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
    }))
  : null

// Preserve instances in dev
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  if (redis) globalForRedis.redis = redis
}

// Graceful shutdown
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
    if (redis) await redis.quit()
  })
}

export async function createServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'error' : 'info',
      transport: process.env.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    },
    trustProxy: true,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'reqId',
    disableRequestLogging: process.env.NODE_ENV === 'production',
  })

  // Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", process.env.CORS_ORIGIN || '*'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })

  // CORS
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(',') || true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['X-Request-Id', 'X-Response-Time', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    maxAge: 86400,
  })

  // JWT
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'change-me-in-production-min-32-chars',
    sign: {
      expiresIn: '15m',
      issuer: 'logistics-platform',
    },
    verify: {
      maxAge: '15m',
      issuer: 'logistics-platform',
    },
  })

  // Cookies
  await fastify.register(cookie, {
    secret: process.env.JWT_SECRET || 'change-me',
    parseOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    },
  })

  // Decorate with services
  fastify.decorate('prisma', prisma)
  fastify.decorate('redis', redis)

  // Apply middleware
  await applyMiddleware(fastify)

  // Health check
  fastify.get('/health', async () => {
    const dbHealthy = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false)
    const redisHealthy = redis ? await redis.ping().then(() => true).catch(() => false) : false
    
    const healthy = dbHealthy
    
    return {
      status: healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: dbHealthy ? 'ok' : 'error',
        redis: redisHealthy ? 'ok' : (redis ? 'error' : 'not_configured'),
      },
    }
  })

  return fastify
}

// Type augmentation
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
    redis: Redis | null
  }
}

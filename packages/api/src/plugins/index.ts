import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import multipart from '@fastify/multipart'
import { Config } from '../config'
import { prismaPlugin } from './prisma'
import { redisPlugin } from './redis'
import { tokenServicePlugin } from './token'

export async function registerPlugins(config: Config) {
  const fastify = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      transport: config.NODE_ENV === 'development' 
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    },
  })

  await fastify.register(helmet, {
    contentSecurityPolicy: config.NODE_ENV === 'production' ? undefined : false,
  })

  await fastify.register(cors, {
    origin: config.CORS_ORIGIN,
    credentials: true,
  })

  await fastify.register(rateLimit, {
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_WINDOW,
  })

  await fastify.register(jwt, {
    secret: config.JWT_SECRET,
    sign: {
      expiresIn: config.JWT_EXPIRY,
    },
  })

  await fastify.register(cookie)

await fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
})

await fastify.register(prismaPlugin)
await fastify.register(redisPlugin)
await fastify.register(tokenServicePlugin)

  if (config.NODE_ENV === 'development') {
    await fastify.register(swagger, {
      openapi: {
        openapi: '3.0.0',
        info: {
          title: 'Logistics Platform API',
          description: 'API documentation for Logistics Management Platform',
          version: '1.0.0',
        },
      },
    })

    await fastify.register(swaggerUI, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
      },
    })
  }

  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }))

  return fastify
}

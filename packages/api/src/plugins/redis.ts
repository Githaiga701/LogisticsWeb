import { FastifyPluginAsync } from 'fastify'
import Redis from 'ioredis'
import fp from 'fastify-plugin'
import { config } from '../config'

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis
  }
}

const redis = new Redis(config.REDIS_URL)

const redisPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.decorate('redis', redis)
  fastify.addHook('onClose', async () => {
    await redis.quit()
  })
})

export { redisPlugin }

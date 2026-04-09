import { FastifyPluginAsync } from 'fastify'
import { createTokenService } from './token.service'
import fp from 'fastify-plugin'

const tokenServicePlugin: FastifyPluginAsync = fp(async (fastify) => {
  const tokenService = createTokenService(fastify.redis)
  fastify.decorate('tokenService', tokenService)
})

export { tokenServicePlugin }

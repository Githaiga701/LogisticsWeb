import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { config } from './config'
import { registerPlugins } from './plugins'
import { registerRoutes } from './routes'

export async function createServer(): Promise<FastifyInstance> {
  const fastify = await registerPlugins(config)

  await registerRoutes(fastify)

  fastify.setErrorHandler((error, request: FastifyRequest, reply: FastifyReply) => {
    const statusCode = error.statusCode || 500
    
    fastify.log.error({
      error: {
        message: error.message,
        stack: error.stack,
        statusCode,
      },
      request: {
        method: request.method,
        url: request.url,
        headers: request.headers,
      },
    })

    reply.status(statusCode).send({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: statusCode === 500 ? 'Internal server error' : error.message,
      },
    })
  })

  return fastify
}

async function start() {
  const fastify = await createServer()
  
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' })
    fastify.log.info(`Server running on http://localhost:${config.port}`)
    fastify.log.info(`Environment: ${config.nodeEnv}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

if (require.main === module) {
  start()
}

export default createServer

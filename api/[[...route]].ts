import { createServer } from './lib/db'
import { registerRoutes } from './routes'

export default async function handler(req: any, res: any) {
  const fastify = await createServer()
  await registerRoutes(fastify)
  await fastify.ready()
  
  fastify.server.emit('request', req, res)
}

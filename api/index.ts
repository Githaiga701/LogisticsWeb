import { createServer } from './lib/db'
import { registerRoutes } from './routes'

async function start() {
  const fastify = await createServer()
  await registerRoutes(fastify)
  
  await fastify.ready()
  
  const port = parseInt(process.env.PORT || '3000')
  await fastify.listen({ port, host: '0.0.0.0' })
  
  console.log(`Server running on http://localhost:${port}`)
}

start().catch(err => {
  console.error('Server error:', err)
  process.exit(1)
})

import { FastifyInstance } from 'fastify'
import authRoutes from './auth'
import driverRoutes from './drivers'
import unitRoutes from './units'
import clientRoutes from './clients'
import locationRoutes from './locations'
import jobRoutes from './jobs'
import assignmentRoutes from './assignments'

export async function registerRoutes(fastify: FastifyInstance) {
  await fastify.register(authRoutes, { prefix: '/api/auth' })
  await fastify.register(driverRoutes, { prefix: '/api/drivers' })
  await fastify.register(unitRoutes, { prefix: '/api/units' })
  await fastify.register(clientRoutes, { prefix: '/api/clients' })
  await fastify.register(locationRoutes, { prefix: '/api/locations' })
  await fastify.register(jobRoutes, { prefix: '/api/jobs' })
  await fastify.register(assignmentRoutes, { prefix: '/api/assignments' })
}

import { FastifyInstance } from 'fastify'
import authRoutes from './auth'
import userRoutes from './users'
import driverRoutes from './drivers'
import unitRoutes from './units'
import clientRoutes from './clients'
import locationRoutes from './locations'
import jobRoutes from './jobs'
import assignmentRoutes from './assignments'
import driverActionRoutes from './driver-actions'
import documentRoutes from './documents'
import notificationRoutes from './notifications'
import reportRoutes from './reports'

export async function registerRoutes(fastify: FastifyInstance) {
  await fastify.register(authRoutes, { prefix: '/api/auth' })
  await fastify.register(userRoutes, { prefix: '/api/users' })
  await fastify.register(driverRoutes, { prefix: '/api/drivers' })
  await fastify.register(unitRoutes, { prefix: '/api/units' })
  await fastify.register(clientRoutes, { prefix: '/api/clients' })
  await fastify.register(locationRoutes, { prefix: '/api/locations' })
  await fastify.register(jobRoutes, { prefix: '/api/jobs' })
  await fastify.register(assignmentRoutes, { prefix: '/api/assignments' })
  await fastify.register(driverActionRoutes, { prefix: '/api/driver' })
  await fastify.register(documentRoutes, { prefix: '/api/documents' })
  await fastify.register(notificationRoutes, { prefix: '/api/notifications' })
  await fastify.register(reportRoutes, { prefix: '/api/dashboard' })
}

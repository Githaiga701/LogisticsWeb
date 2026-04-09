import { FastifyPluginAsync } from 'fastify'
import { 
  getDriverAssignments,
  getDriverAssignment,
  acceptAssignment,
  rejectAssignment,
  dispatchTrip,
  markDeparted,
  markArrived,
  completeJob,
  reportDelayDriver,
} from '../controllers/driver-actions.controller'
import { authenticate, requireRoles } from '../middlewares/auth.middleware'

const driverActionRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/assignments', {
    preHandler: [authenticate, requireRoles('DRIVER')],
  }, getDriverAssignments)

  fastify.get('/assignments/:id', {
    preHandler: [authenticate, requireRoles('DRIVER')],
  }, getDriverAssignment)

  fastify.post('/assignments/:id/accept', {
    preHandler: [authenticate, requireRoles('DRIVER')],
  }, acceptAssignment)

  fastify.post('/assignments/:id/reject', {
    preHandler: [authenticate, requireRoles('DRIVER')],
  }, rejectAssignment)

  fastify.post('/assignments/:id/dispatch', {
    preHandler: [authenticate, requireRoles('DRIVER')],
  }, dispatchTrip)

  fastify.post('/assignments/:id/depart', {
    preHandler: [authenticate, requireRoles('DRIVER')],
  }, markDeparted)

  fastify.post('/assignments/:id/arrive', {
    preHandler: [authenticate, requireRoles('DRIVER')],
  }, markArrived)

  fastify.post('/assignments/:id/complete', {
    preHandler: [authenticate, requireRoles('DRIVER')],
  }, completeJob)

  fastify.post('/assignments/:id/delay', {
    preHandler: [authenticate, requireRoles('DRIVER')],
  }, reportDelayDriver)
}

export default driverActionRoutes

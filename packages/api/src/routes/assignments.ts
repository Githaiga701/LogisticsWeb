import { FastifyPluginAsync } from 'fastify'
import { 
  listAssignments, 
  showAssignment, 
  addAssignment,
  updateAssignmentStatusHandler,
  reassignAssignmentHandler,
  delayReport,
  assignmentEvents
} from '../controllers/assignments.controller'
import { authenticate, requireRoles } from '../middlewares/auth.middleware'

const assignmentRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, listAssignments)

  fastify.post('/', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, addAssignment)

  fastify.get('/:id', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH', 'DRIVER')],
  }, showAssignment)

  fastify.post('/:id/status', {
    preHandler: [authenticate],
  }, updateAssignmentStatusHandler)

  fastify.post('/:id/reassign', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, reassignAssignmentHandler)

  fastify.post('/:id/delay', {
    preHandler: [authenticate],
  }, delayReport)

  fastify.get('/:id/events', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH', 'DRIVER')],
  }, assignmentEvents)
}

export default assignmentRoutes

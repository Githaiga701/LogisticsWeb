import { FastifyPluginAsync } from 'fastify'
import { 
  listJobs, 
  showJob, 
  addJob, 
  editJob, 
  removeJob,
  cancelJobHandler,
  duplicateJobHandler
} from '../controllers/jobs.controller'
import { authenticate, requireRoles } from '../middlewares/auth.middleware'

const jobRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, listJobs)

  fastify.post('/', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, addJob)

  fastify.get('/:id', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, showJob)

  fastify.put('/:id', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, editJob)

  fastify.delete('/:id', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, removeJob)

  fastify.post('/:id/cancel', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, cancelJobHandler)

  fastify.post('/:id/duplicate', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, duplicateJobHandler)
}

export default jobRoutes

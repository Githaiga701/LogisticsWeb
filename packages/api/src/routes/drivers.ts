import { FastifyPluginAsync } from 'fastify'
import { 
  listDrivers, 
  showDriver, 
  addDriver, 
  editDriver, 
  removeDriver,
  driverAssignments 
} from '../controllers/drivers.controller'
import { authenticate, requireRoles } from '../middlewares/auth.middleware'

const driverRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, listDrivers)

  fastify.post('/', {
    preHandler: [authenticate, requireRoles('ADMIN')],
  }, addDriver)

  fastify.get('/:id', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, showDriver)

  fastify.put('/:id', {
    preHandler: [authenticate, requireRoles('ADMIN')],
  }, editDriver)

  fastify.delete('/:id', {
    preHandler: [authenticate, requireRoles('ADMIN')],
  }, removeDriver)

  fastify.get('/:id/assignments', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, driverAssignments)
}

export default driverRoutes

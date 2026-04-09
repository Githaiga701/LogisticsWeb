import { FastifyPluginAsync } from 'fastify'
import { 
  listUnits, 
  showUnit, 
  addUnit, 
  editUnit, 
  removeUnit,
  unitAssignments 
} from '../controllers/units.controller'
import { authenticate, requireRoles } from '../middlewares/auth.middleware'

const unitRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, listUnits)

  fastify.post('/', {
    preHandler: [authenticate, requireRoles('ADMIN')],
  }, addUnit)

  fastify.get('/:id', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, showUnit)

  fastify.put('/:id', {
    preHandler: [authenticate, requireRoles('ADMIN')],
  }, editUnit)

  fastify.delete('/:id', {
    preHandler: [authenticate, requireRoles('ADMIN')],
  }, removeUnit)

  fastify.get('/:id/assignments', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, unitAssignments)
}

export default unitRoutes

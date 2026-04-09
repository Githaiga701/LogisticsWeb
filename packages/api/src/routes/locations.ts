import { FastifyPluginAsync } from 'fastify'
import { 
  listLocations, 
  showLocation, 
  addLocation, 
  editLocation, 
  removeLocation 
} from '../controllers/locations.controller'
import { authenticate, requireRoles } from '../middlewares/auth.middleware'

const locationRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, listLocations)

  fastify.post('/', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, addLocation)

  fastify.get('/:id', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, showLocation)

  fastify.put('/:id', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, editLocation)

  fastify.delete('/:id', {
    preHandler: [authenticate, requireRoles('ADMIN')],
  }, removeLocation)
}

export default locationRoutes

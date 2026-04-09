import { FastifyPluginAsync } from 'fastify'
import { 
  getUsers, 
  getUser, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../controllers/users.controller'
import { authenticate, requireRoles } from '../middlewares/auth.middleware'

const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    preHandler: [authenticate, requireRoles('ADMIN')],
  }, getUsers)

  fastify.post('/', {
    preHandler: [authenticate, requireRoles('ADMIN')],
  }, createUser)

  fastify.get('/:id', {
    preHandler: [authenticate, requireRoles('ADMIN')],
  }, getUser)

  fastify.put('/:id', {
    preHandler: [authenticate, requireRoles('ADMIN')],
  }, updateUser)

  fastify.delete('/:id', {
    preHandler: [authenticate, requireRoles('ADMIN')],
  }, deleteUser)
}

export default userRoutes

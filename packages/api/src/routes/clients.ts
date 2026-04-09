import { FastifyPluginAsync } from 'fastify'
import { 
  listClients, 
  showClient, 
  addClient, 
  editClient, 
  removeClient,
  listClientContacts,
  addClientContactHandler,
  editContact,
  removeContact,
  clientJobs
} from '../controllers/clients.controller'
import { authenticate, requireRoles } from '../middlewares/auth.middleware'

const clientRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, listClients)

  fastify.post('/', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, addClient)

  fastify.get('/:id', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, showClient)

  fastify.put('/:id', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, editClient)

  fastify.delete('/:id', {
    preHandler: [authenticate, requireRoles('ADMIN')],
  }, removeClient)

  fastify.get('/:id/jobs', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, clientJobs)

  fastify.get('/:clientId/contacts', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, listClientContacts)

  fastify.post('/:clientId/contacts', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, addClientContactHandler)

  fastify.put('/contacts/:id', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, editContact)

  fastify.delete('/contacts/:id', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, removeContact)
}

export default clientRoutes

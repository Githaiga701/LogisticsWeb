import { FastifyPluginAsync } from 'fastify'
import { uploadDocument, getDocument, deleteDocument } from '../controllers/documents.controller'
import { authenticate } from '../middlewares/auth.middleware'

const documentRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', {
    preHandler: [authenticate],
  }, uploadDocument)

  fastify.get('/:id', {
    preHandler: [authenticate],
  }, getDocument)

  fastify.delete('/:id', {
    preHandler: [authenticate],
  }, deleteDocument)
}

export default documentRoutes

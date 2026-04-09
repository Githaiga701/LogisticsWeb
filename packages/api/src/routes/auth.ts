import { FastifyPluginAsync } from 'fastify'
import { login, logout, refresh, forgotPassword, resetPassword, me } from '../controllers/auth.controller'
import { authenticate, requireRoles } from '../middlewares/auth.middleware'

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/login', login)
  
  fastify.post('/logout', logout)
  
  fastify.post('/refresh', refresh)
  
  fastify.post('/forgot-password', forgotPassword)
  
  fastify.post('/reset-password', resetPassword)
  
  fastify.get('/me', { 
    preHandler: [authenticate] 
  }, me)
}

export default authRoutes

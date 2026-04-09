import { FastifyPluginAsync } from 'fastify'
import { 
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
} from '../controllers/notifications.controller'
import { authenticate } from '../middlewares/auth.middleware'

const notificationRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    preHandler: [authenticate],
  }, listNotifications)

  fastify.get('/unread-count', {
    preHandler: [authenticate],
  }, getUnreadCount)

  fastify.post('/:id/read', {
    preHandler: [authenticate],
  }, markNotificationRead)

  fastify.post('/read-all', {
    preHandler: [authenticate],
  }, markAllNotificationsRead)
}

export default notificationRoutes

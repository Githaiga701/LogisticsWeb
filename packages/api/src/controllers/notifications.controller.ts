import { FastifyRequest, FastifyReply } from 'fastify'
import { notificationRepository } from '../services/notification.service'

export async function listNotifications(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request as any).user.userId
  const { unread } = request.query as { unread?: string }
  
  const notifications = await notificationRepository.findByUserId(
    userId,
    unread === 'true'
  )

  return reply.send({
    success: true,
    data: notifications,
  })
}

export async function markNotificationRead(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  
  const notification = await notificationRepository.markAsRead(id)

  return reply.send({
    success: true,
    data: notification,
  })
}

export async function markAllNotificationsRead(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request as any).user.userId
  
  await notificationRepository.markAllAsRead(userId)

  return reply.send({
    success: true,
    data: { message: 'All notifications marked as read' },
  })
}

export async function getUnreadCount(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request as any).user.userId
  
  const count = await notificationRepository.getUnreadCount(userId)

  return reply.send({
    success: true,
    data: { count },
  })
}

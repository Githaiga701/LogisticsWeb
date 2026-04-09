import { PrismaClient, Notification, NotificationType } from '@prisma/client'
import { prisma } from '../plugins/prisma'
import { FastifyInstance } from 'fastify'

export interface CreateNotificationData {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
}

class NotificationRepository {
  async create(data: CreateNotificationData): Promise<Notification> {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data ?? {},
      },
    })
  }

  async findByUserId(userId: string, unreadOnly?: boolean) {
    return prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { readAt: null } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  async markAsRead(id: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    })
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: { readAt: new Date() },
    })
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    })
  }
}

export const notificationRepository = new NotificationRepository()

export async function createNotification(data: CreateNotificationData) {
  const notification = await notificationRepository.create(data)
  
  return notification
}

export async function notifyAssignmentCreated(
  driverId: string,
  assignmentId: string,
  jobNumber: string
) {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    include: { user: true },
  })

  if (!driver) return

  await createNotification({
    userId: driver.userId,
    type: 'ASSIGNMENT',
    title: 'New Assignment',
    message: `You have been assigned to job ${jobNumber}. Please review and accept.`,
    data: { assignmentId, jobNumber },
  })
}

export async function notifyStatusChange(
  userIds: string[],
  assignmentId: string,
  jobNumber: string,
  status: string,
  driverName?: string
) {
  const statusMessages: Record<string, string> = {
    ACCEPTED: `Job ${jobNumber} has been accepted${driverName ? ` by ${driverName}` : ''}.`,
    DISPATCHED: `Driver has started trip for job ${jobNumber}.`,
    IN_TRANSIT: `Driver has departed for job ${jobNumber}.`,
    ARRIVED: `Driver has arrived at destination for job ${jobNumber}.`,
    COMPLETED: `Job ${jobNumber} has been completed.`,
    REJECTED: `Job ${jobNumber} was rejected${driverName ? ` by ${driverName}` : ''}.`,
    CANCELLED: `Job ${jobNumber} has been cancelled.`,
    DELAYED: `Delay reported for job ${jobNumber}.`,
  }

  for (const userId of userIds) {
    await createNotification({
      userId,
      type: 'STATUS_CHANGE',
      title: 'Assignment Update',
      message: statusMessages[status] || `Status changed to ${status} for job ${jobNumber}.`,
      data: { assignmentId, jobNumber, status },
    })
  }
}

export async function notifyRejection(
  adminIds: string[],
  assignmentId: string,
  jobNumber: string,
  reason: string,
  driverName: string
) {
  for (const adminId of adminIds) {
    await createNotification({
      userId: adminId,
      type: 'REJECTION',
      title: 'Assignment Rejected',
      message: `${driverName} rejected job ${jobNumber}. Reason: ${reason}`,
      data: { assignmentId, jobNumber, reason },
    })
  }
}

export async function notifyCancellation(
  driverId: string,
  assignmentId: string,
  jobNumber: string,
  reason: string
) {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    include: { user: true },
  })

  if (!driver) return

  await createNotification({
    userId: driver.userId,
    type: 'CANCELLATION',
    title: 'Assignment Cancelled',
    message: `Job ${jobNumber} has been cancelled. Reason: ${reason}`,
    data: { assignmentId, jobNumber, reason },
  })
}

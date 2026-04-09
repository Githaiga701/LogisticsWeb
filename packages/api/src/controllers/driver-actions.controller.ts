import { FastifyRequest, FastifyReply } from 'fastify'
import { updateAssignmentStatus, getAssignment } from '../services/assignment.service'
import { prisma } from '../plugins/prisma'

export async function getDriverAssignments(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request as any).user.userId
  
  const driver = await prisma.driver.findFirst({
    where: { userId, deletedAt: null },
  })

  if (!driver) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'DRIVER_NOT_FOUND',
        message: 'Driver profile not found',
      },
    })
  }

  const assignments = await prisma.assignment.findMany({
    where: {
      driverId: driver.id,
      status: { notIn: ['CANCELLED', 'REASSIGNED', 'CLOSED'] },
    },
    include: {
      job: {
        include: {
          client: { select: { id: true, companyName: true } },
          pickupLocation: true,
          dropoffLocation: true,
        },
      },
      unit: true,
      events: {
        orderBy: { timestamp: 'desc' },
        take: 5,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return reply.send({
    success: true,
    data: assignments,
  })
}

export async function getDriverAssignment(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const userId = (request as any).user.userId
  
  const driver = await prisma.driver.findFirst({
    where: { userId, deletedAt: null },
  })

  if (!driver) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'DRIVER_NOT_FOUND',
        message: 'Driver profile not found',
      },
    })
  }

  const assignment = await prisma.assignment.findFirst({
    where: { id, driverId: driver.id },
    include: {
      job: {
        include: {
          client: { include: { contacts: true } },
          pickupLocation: true,
          dropoffLocation: true,
        },
      },
      unit: true,
      events: { orderBy: { timestamp: 'asc' } },
      documents: true,
    },
  })

  if (!assignment) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'ASSIGNMENT_NOT_FOUND',
        message: 'Assignment not found',
      },
    })
  }

  return reply.send({
    success: true,
    data: assignment,
  })
}

export async function acceptAssignment(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const userId = (request as any).user.userId
  
  const assignment = await updateAssignmentStatus(id, 'ACCEPTED', userId)
  
  return reply.send({
    success: true,
    data: assignment,
  })
}

export async function rejectAssignment(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const { reason } = request.body as { reason: string }
  const userId = (request as any).user.userId
  
  const assignment = await updateAssignmentStatus(id, 'REJECTED', userId, reason)
  
  return reply.send({
    success: true,
    data: assignment,
  })
}

export async function dispatchTrip(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const userId = (request as any).user.userId
  
  const assignment = await updateAssignmentStatus(id, 'DISPATCHED', userId)
  
  return reply.send({
    success: true,
    data: assignment,
  })
}

export async function markDeparted(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const { notes, odometer } = request.body as { notes?: string; odometer?: number }
  const userId = (request as any).user.userId

  const assignment = await prisma.assignment.findUnique({
    where: { id },
  })

  if (!assignment) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'ASSIGNMENT_NOT_FOUND',
        message: 'Assignment not found',
      },
    })
  }

  await prisma.$transaction(async (tx) => {
    await tx.assignment.update({
      where: { id },
      data: { status: 'IN_TRANSIT' },
    })

    await tx.event.create({
      data: {
        assignmentId: id,
        eventType: 'DEPARTED',
        actorId: userId,
        timestamp: new Date(),
        notes,
        metadata: odometer ? { odometer } : undefined,
      },
    })

    await tx.job.update({
      where: { id: assignment.jobId },
      data: { status: 'IN_PROGRESS' },
    })
  })

  const updated = await getAssignment(id)
  
  return reply.send({
    success: true,
    data: updated,
  })
}

export async function markArrived(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const { notes } = request.body as { notes?: string }
  const userId = (request as any).user.userId
  
  const assignment = await updateAssignmentStatus(id, 'ARRIVED', userId, notes)
  
  return reply.send({
    success: true,
    data: assignment,
  })
}

export async function completeJob(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const { notes } = request.body as { notes?: string }
  const userId = (request as any).user.userId
  
  const assignment = await updateAssignmentStatus(id, 'COMPLETED', userId, notes)
  
  return reply.send({
    success: true,
    data: assignment,
  })
}

export async function reportDelayDriver(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const { reason, estimatedDelay } = request.body as { reason: string; estimatedDelay?: number }
  const userId = (request as any).user.userId
  
  const assignment = await prisma.assignment.findUnique({
    where: { id },
  })

  if (!assignment) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'ASSIGNMENT_NOT_FOUND',
        message: 'Assignment not found',
      },
    })
  }

  await prisma.event.create({
    data: {
      assignmentId: id,
      eventType: 'DELAYED',
      actorId: userId,
      timestamp: new Date(),
      notes: reason,
      metadata: estimatedDelay ? { estimatedDelayMinutes: estimatedDelay } : undefined,
    },
  })

  const updated = await getAssignment(id)
  
  return reply.send({
    success: true,
    data: updated,
  })
}

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['ACCEPTED', 'REJECTED', 'CANCELLED', 'REASSIGNED'],
  ACCEPTED: ['DISPATCHED', 'CANCELLED', 'REASSIGNED'],
  DISPATCHED: ['IN_TRANSIT', 'DELAYED', 'CANCELLED'],
  IN_TRANSIT: ['ARRIVED', 'DELAYED'],
  DELAYED: ['IN_TRANSIT', 'ARRIVED', 'CANCELLED'],
  ARRIVED: ['COMPLETED', 'DELAYED'],
  COMPLETED: ['CLOSED'],
  REJECTED: [],
  CANCELLED: [],
  CLOSED: [],
}

export default async function assignmentRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { status, driverId, unitId } = request.query as { 
      status?: string
      driverId?: string
      unitId?: string 
    }
    
    const where: any = {}
    if (status) where.status = status
    if (driverId) where.driverId = driverId
    if (unitId) where.unitId = unitId

    const assignments = await fastify.prisma.assignment.findMany({
      where,
      include: {
        job: {
          include: {
            client: { select: { id: true, companyName: true } },
            pickupLocation: true,
            dropoffLocation: true,
          },
        },
        driver: { include: { user: { select: { email: true } } } },
        unit: true,
        events: { orderBy: { timestamp: 'desc' }, take: 5 },
      },
      orderBy: { createdAt: 'desc' },
    })

    return reply.send({ success: true, data: assignments })
  })

  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = z.object({
      jobId: z.string().uuid(),
      driverId: z.string().uuid(),
      unitId: z.string().uuid(),
    }).parse(request.body)

    const userId = (request as any).user?.userId || 'system'

    // Check for existing assignment
    const existing = await fastify.prisma.assignment.count({
      where: {
        jobId: body.jobId,
        status: { notIn: ['CANCELLED', 'REASSIGNED', 'REJECTED'] },
      },
    })

    if (existing > 0) {
      return reply.status(409).send({
        success: false,
        error: { code: 'JOB_ALREADY_ASSIGNED', message: 'Job already has active assignment' },
      })
    }

    // Check driver availability
    const driverActive = await fastify.prisma.assignment.count({
      where: {
        driverId: body.driverId,
        status: { in: ['PENDING', 'ACCEPTED', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED'] },
      },
    })

    if (driverActive > 0) {
      return reply.status(400).send({
        success: false,
        error: { code: 'DRIVER_NOT_AVAILABLE', message: 'Driver is not available' },
      })
    }

    // Check unit availability
    const unitActive = await fastify.prisma.assignment.count({
      where: {
        unitId: body.unitId,
        status: { in: ['PENDING', 'ACCEPTED', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED'] },
      },
    })

    if (unitActive > 0) {
      return reply.status(400).send({
        success: false,
        error: { code: 'UNIT_NOT_AVAILABLE', message: 'Unit is not available' },
      })
    }

    const assignment = await fastify.prisma.$transaction(async (tx) => {
      const a = await tx.assignment.create({
        data: { ...body, createdById: userId },
      })
      
      await tx.event.create({
        data: {
          assignmentId: a.id,
          eventType: 'CREATED',
          actorId: userId,
          timestamp: new Date(),
        },
      })

      await tx.job.update({
        where: { id: body.jobId },
        data: { status: 'ASSIGNED' },
      })

      return a
    })

    const result = await fastify.prisma.assignment.findFirst({
      where: { id: assignment.id },
      include: {
        job: { include: { client: true, pickupLocation: true, dropoffLocation: true } },
        driver: { include: { user: { select: { email: true } } } },
        unit: true,
      },
    })

    return reply.status(201).send({ success: true, data: result })
  })

  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    
    const assignment = await fastify.prisma.assignment.findFirst({
      where: { id },
      include: {
        job: {
          include: {
            client: { include: { contacts: true } },
            pickupLocation: true,
            dropoffLocation: true,
          },
        },
        driver: { include: { user: { select: { email: true } } } },
        unit: true,
        events: { orderBy: { timestamp: 'asc' } },
        documents: true,
      },
    })

    if (!assignment) {
      return reply.status(404).send({
        success: false,
        error: { code: 'ASSIGNMENT_NOT_FOUND', message: 'Assignment not found' },
      })
    }

    return reply.send({ success: true, data: assignment })
  })

  fastify.post('/:id/status', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const body = z.object({
      status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED', 'COMPLETED', 'CANCELLED']),
      reason: z.string().optional(),
    }).parse(request.body)

    const userId = (request as any).user?.userId || 'system'

    const assignment = await fastify.prisma.assignment.findUnique({ where: { id } })
    
    if (!assignment) {
      return reply.status(404).send({
        success: false,
        error: { code: 'ASSIGNMENT_NOT_FOUND', message: 'Assignment not found' },
      })
    }

    const validNext = VALID_TRANSITIONS[assignment.status] || []
    if (!validNext.includes(body.status)) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_TRANSITION', message: `Cannot transition from ${assignment.status} to ${body.status}` },
      })
    }

    const updateData: any = { status: body.status }
    if (body.status === 'REJECTED') updateData.rejectionReason = body.reason
    if (body.status === 'CANCELLED') {
      updateData.cancellationReason = body.reason
      updateData.cancelledById = userId
    }

    await fastify.prisma.$transaction(async (tx) => {
      await tx.assignment.update({ where: { id }, data: updateData })
      
      await tx.event.create({
        data: {
          assignmentId: id,
          eventType: body.status as any,
          actorId: userId,
          timestamp: new Date(),
          notes: body.reason,
        },
      })

      if (body.status === 'COMPLETED') {
        await tx.job.update({ where: { id: assignment.jobId }, data: { status: 'COMPLETED' } })
      }
    })

    const result = await fastify.prisma.assignment.findFirst({
      where: { id },
      include: {
        job: { include: { client: true, pickupLocation: true, dropoffLocation: true } },
        driver: { include: { user: { select: { email: true } } } },
        unit: true,
      },
    })

    return reply.send({ success: true, data: result })
  })

  fastify.get('/:id/events', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    
    const events = await fastify.prisma.event.findMany({
      where: { assignmentId: id },
      orderBy: { timestamp: 'asc' },
    })

    return reply.send({ success: true, data: events })
  })
}

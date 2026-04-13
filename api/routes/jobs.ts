import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export default async function jobRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { status, priority, clientId, search } = request.query as { 
      status?: string
      priority?: string
      clientId?: string
      search?: string 
    }
    
    const where: any = { deletedAt: null }
    if (status) where.status = status
    if (priority) where.priority = priority
    if (clientId) where.clientId = clientId
    if (search) {
      where.OR = [
        { jobNumber: { contains: search, mode: 'insensitive' } },
        { loadType: { contains: search, mode: 'insensitive' } },
      ]
    }

    const jobs = await fastify.prisma.job.findMany({
      where,
      include: {
        client: { select: { id: true, companyName: true } },
        pickupLocation: true,
        dropoffLocation: true,
        assignments: {
          where: { status: { notIn: ['CANCELLED', 'REASSIGNED', 'REJECTED'] } },
          include: {
            driver: { include: { user: { select: { email: true } } } },
            unit: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return reply.send({ success: true, data: jobs })
  })

  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = z.object({
      clientId: z.string().uuid(),
      contactId: z.string().uuid().optional(),
      pickupLocationId: z.string().uuid(),
      dropoffLocationId: z.string().uuid(),
      pickupAddress: z.string().optional(),
      dropoffAddress: z.string().optional(),
      loadType: z.string().min(1),
      weightTons: z.number().positive().optional(),
      priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
      scheduledDate: z.string().transform(v => new Date(v)),
      scheduledTime: z.string().optional(),
      specialInstructions: z.string().optional(),
    }).parse(request.body)

    const userId = (request as any).user?.userId || 'system'

    const count = await fastify.prisma.job.count()
    const jobNumber = `JOB-${(count + 1).toString().padStart(6, '0')}`

    const job = await fastify.prisma.job.create({
      data: {
        ...body,
        jobNumber,
        createdById: userId,
      },
      include: {
        client: true,
        pickupLocation: true,
        dropoffLocation: true,
      },
    })

    return reply.status(201).send({ success: true, data: job })
  })

  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    
    const job = await fastify.prisma.job.findFirst({
      where: { id, deletedAt: null },
      include: {
        client: { include: { contacts: true } },
        contact: true,
        pickupLocation: true,
        dropoffLocation: true,
        assignments: {
          include: {
            driver: { include: { user: { select: { email: true } } } },
            unit: true,
            events: { orderBy: { timestamp: 'asc' } },
          },
        },
      },
    })

    if (!job) {
      return reply.status(404).send({
        success: false,
        error: { code: 'JOB_NOT_FOUND', message: 'Job not found' },
      })
    }

    return reply.send({ success: true, data: job })
  })

  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const body = z.object({
      clientId: z.string().uuid().optional(),
      contactId: z.string().uuid().optional(),
      pickupLocationId: z.string().uuid().optional(),
      dropoffLocationId: z.string().uuid().optional(),
      loadType: z.string().min(1).optional(),
      weightTons: z.number().positive().optional(),
      priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
      scheduledDate: z.string().transform(v => new Date(v)).optional(),
      scheduledTime: z.string().optional(),
      specialInstructions: z.string().optional(),
    }).parse(request.body)

    const job = await fastify.prisma.job.update({
      where: { id },
      data: body,
      include: { client: true, pickupLocation: true, dropoffLocation: true },
    })

    return reply.send({ success: true, data: job })
  })

  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    
    await fastify.prisma.job.update({ where: { id }, data: { deletedAt: new Date() } })

    return reply.send({ success: true, data: { message: 'Job deleted' } })
  })

  fastify.post('/:id/cancel', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const body = z.object({ reason: z.string().min(1) }).parse(request.body)
    const userId = (request as any).user?.userId || 'system'

    await fastify.prisma.$transaction(async (tx) => {
      await tx.job.update({ where: { id }, data: { status: 'CANCELLED' } })
      await tx.assignment.updateMany({
        where: { jobId: id },
        data: { status: 'CANCELLED', cancellationReason: body.reason, cancelledById: userId },
      })
    })

    const job = await fastify.prisma.job.findFirst({
      where: { id },
      include: { client: true, pickupLocation: true, dropoffLocation: true },
    })

    return reply.send({ success: true, data: job })
  })
}

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export default async function unitRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { status, unitType, search } = request.query as { status?: string; unitType?: string; search?: string }
    
    const where: any = { deletedAt: null }
    if (status) where.status = status
    if (unitType) where.unitType = unitType
    if (search) where.plateNumber = { contains: search, mode: 'insensitive' }

    const units = await fastify.prisma.unit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return reply.send({ success: true, data: units })
  })

  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = z.object({
      plateNumber: z.string().min(1),
      capacityTons: z.number().positive(),
      unitType: z.enum(['TRUCK', 'TRAILER', 'VAN', 'OTHER']),
      bodyType: z.enum(['CLOSED', 'OPEN', 'REFRIGERATED', 'TANKER', 'OTHER']),
      insuranceProvider: z.string().min(1),
      insurancePolicy: z.string().min(1),
      insuranceExpiry: z.string().transform(v => new Date(v)),
      registrationExpiry: z.string().transform(v => new Date(v)),
    }).parse(request.body)

    const existing = await fastify.prisma.unit.findFirst({
      where: { plateNumber: body.plateNumber, deletedAt: null },
    })

    if (existing) {
      return reply.status(409).send({
        success: false,
        error: { code: 'PLATE_EXISTS', message: 'Plate number already registered' },
      })
    }

    const unit = await fastify.prisma.unit.create({ data: body })

    return reply.status(201).send({ success: true, data: unit })
  })

  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    
    const unit = await fastify.prisma.unit.findFirst({
      where: { id, deletedAt: null },
    })

    if (!unit) {
      return reply.status(404).send({
        success: false,
        error: { code: 'UNIT_NOT_FOUND', message: 'Unit not found' },
      })
    }

    return reply.send({ success: true, data: unit })
  })

  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const body = z.object({
      plateNumber: z.string().min(1).optional(),
      capacityTons: z.number().positive().optional(),
      unitType: z.enum(['TRUCK', 'TRAILER', 'VAN', 'OTHER']).optional(),
      bodyType: z.enum(['CLOSED', 'OPEN', 'REFRIGERATED', 'TANKER', 'OTHER']).optional(),
      insuranceProvider: z.string().min(1).optional(),
      insurancePolicy: z.string().min(1).optional(),
      insuranceExpiry: z.string().transform(v => new Date(v)).optional(),
      registrationExpiry: z.string().transform(v => new Date(v)).optional(),
      status: z.enum(['AVAILABLE', 'ASSIGNED', 'MAINTENANCE']).optional(),
    }).parse(request.body)

    const unit = await fastify.prisma.unit.update({
      where: { id },
      data: body,
    })

    return reply.send({ success: true, data: unit })
  })

  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    
    const activeAssignment = await fastify.prisma.assignment.count({
      where: {
        unitId: id,
        status: { in: ['PENDING', 'ACCEPTED', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED'] },
      },
    })

    if (activeAssignment > 0) {
      return reply.status(400).send({
        success: false,
        error: { code: 'UNIT_HAS_ACTIVE_ASSIGNMENT', message: 'Cannot delete unit with active assignment' },
      })
    }

    await fastify.prisma.unit.update({ where: { id }, data: { deletedAt: new Date() } })

    return reply.send({ success: true, data: { message: 'Unit deleted' } })
  })
}

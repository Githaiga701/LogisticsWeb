import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export default async function driverRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { status, search } = request.query as { status?: string; search?: string }
    
    const where: any = { deletedAt: null }
    if (status) where.status = status
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    const drivers = await fastify.prisma.driver.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, isActive: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return reply.send({ success: true, data: drivers })
  })

  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = z.object({
      email: z.string().email(),
      password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      phone: z.string().min(1),
      licenseNumber: z.string().min(1),
      licenseClass: z.string().min(1),
      licenseExpiry: z.string().transform(v => new Date(v)),
    }).parse(request.body)

    const existing = await fastify.prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    })

    if (existing) {
      return reply.status(409).send({
        success: false,
        error: { code: 'EMAIL_EXISTS', message: 'Email already in use' },
      })
    }

    const bcrypt = await import('bcrypt')
    const passwordHash = await bcrypt.hash(body.password, 12)

    const user = await fastify.prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        role: 'DRIVER',
      },
    })

    const driver = await fastify.prisma.driver.create({
      data: {
        userId: user.id,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        licenseNumber: body.licenseNumber,
        licenseClass: body.licenseClass,
        licenseExpiry: body.licenseExpiry,
      },
      include: { user: { select: { id: true, email: true, isActive: true } } },
    })

    return reply.status(201).send({ success: true, data: driver })
  })

  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    
    const driver = await fastify.prisma.driver.findFirst({
      where: { id, deletedAt: null },
      include: { user: { select: { id: true, email: true, isActive: true } } },
    })

    if (!driver) {
      return reply.status(404).send({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver not found' },
      })
    }

    return reply.send({ success: true, data: driver })
  })

  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const body = z.object({
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      phone: z.string().min(1).optional(),
      licenseNumber: z.string().min(1).optional(),
      licenseClass: z.string().min(1).optional(),
      licenseExpiry: z.string().transform(v => new Date(v)).optional(),
      status: z.enum(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY']).optional(),
    }).parse(request.body)

    const driver = await fastify.prisma.driver.update({
      where: { id },
      data: body,
      include: { user: { select: { id: true, email: true, isActive: true } } },
    })

    return reply.send({ success: true, data: driver })
  })

  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    
    const activeAssignment = await fastify.prisma.assignment.count({
      where: {
        driverId: id,
        status: { in: ['PENDING', 'ACCEPTED', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED'] },
      },
    })

    if (activeAssignment > 0) {
      return reply.status(400).send({
        success: false,
        error: { code: 'DRIVER_HAS_ACTIVE_ASSIGNMENT', message: 'Cannot delete driver with active assignment' },
      })
    }

    const driver = await fastify.prisma.driver.findFirst({ where: { id, deletedAt: null } })
    
    if (!driver) {
      return reply.status(404).send({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver not found' },
      })
    }

    await fastify.prisma.driver.update({ where: { id }, data: { deletedAt: new Date() } })
    await fastify.prisma.user.update({ where: { id: driver.userId }, data: { deletedAt: new Date() } })

    return reply.send({ success: true, data: { message: 'Driver deleted' } })
  })
}

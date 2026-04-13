import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export default async function clientRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { isActive, search } = request.query as { isActive?: string; search?: string }
    
    const where: any = { deletedAt: null }
    if (isActive !== undefined) where.isActive = isActive === 'true'
    if (search) where.companyName = { contains: search, mode: 'insensitive' }

    const clients = await fastify.prisma.client.findMany({
      where,
      include: {
        contacts: { where: { isPrimary: true }, take: 1 },
        _count: { select: { jobs: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return reply.send({ success: true, data: clients })
  })

  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = z.object({
      companyName: z.string().min(1),
      billingAddress: z.string().optional(),
      billingEmail: z.string().email().optional().or(z.literal('')),
      notes: z.string().optional(),
    }).parse(request.body)

    const client = await fastify.prisma.client.create({ data: body })

    return reply.status(201).send({ success: true, data: client })
  })

  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    
    const client = await fastify.prisma.client.findFirst({
      where: { id, deletedAt: null },
      include: { contacts: true, locations: { where: { deletedAt: null } } },
    })

    if (!client) {
      return reply.status(404).send({
        success: false,
        error: { code: 'CLIENT_NOT_FOUND', message: 'Client not found' },
      })
    }

    return reply.send({ success: true, data: client })
  })

  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const body = z.object({
      companyName: z.string().min(1).optional(),
      billingAddress: z.string().optional(),
      billingEmail: z.string().email().optional().or(z.literal('')),
      notes: z.string().optional(),
      isActive: z.boolean().optional(),
    }).parse(request.body)

    const client = await fastify.prisma.client.update({
      where: { id },
      data: body,
    })

    return reply.send({ success: true, data: client })
  })

  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    
    await fastify.prisma.client.update({ where: { id }, data: { deletedAt: new Date() } })

    return reply.send({ success: true, data: { message: 'Client deleted' } })
  })
}

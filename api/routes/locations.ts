import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export default async function locationRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { clientId, locationType, search } = request.query as { 
      clientId?: string
      locationType?: string
      search?: string 
    }
    
    const where: any = { deletedAt: null }
    if (clientId) where.clientId = clientId
    if (locationType) where.locationType = locationType
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ]
    }

    const locations = await fastify.prisma.location.findMany({
      where,
      include: {
        client: { select: { id: true, companyName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return reply.send({ success: true, data: locations })
  })

  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = z.object({
      clientId: z.string().optional(),
      name: z.string().min(1),
      address: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().min(1),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      locationType: z.enum(['DEPOT', 'WAREHOUSE', 'CLIENT_SITE', 'OTHER']),
    }).parse(request.body)

    const location = await fastify.prisma.location.create({ data: body })

    return reply.status(201).send({ success: true, data: location })
  })

  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    
    await fastify.prisma.location.update({ where: { id }, data: { deletedAt: new Date() } })

    return reply.send({ success: true, data: { message: 'Location deleted' } })
  })
}

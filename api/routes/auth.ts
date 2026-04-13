import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }).parse(request.body)

    const user = await fastify.prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    })

    if (!user || !user.isActive) {
      return reply.status(401).send({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      })
    }

    const bcrypt = await import('bcrypt')
    const isValid = await bcrypt.compare(body.password, user.passwordHash)
    
    if (!isValid) {
      return reply.status(401).send({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      })
    }

    const accessToken = fastify.jwt.sign({ userId: user.id, role: user.role })
    
    const refreshToken = fastify.redis 
      ? await generateRefreshToken(user.id, fastify.redis)
      : ''

    await fastify.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    return reply.send({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
    })
  })

  fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = z.object({ refreshToken: z.string() }).parse(request.body)
    
    if (fastify.redis) {
      const key = `refresh:${body.refreshToken}`
      await fastify.redis.del(key)
    }

    return reply.send({ success: true, data: { message: 'Logged out' } })
  })

  fastify.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = z.object({ refreshToken: z.string() }).parse(request.body)

    if (!fastify.redis) {
      return reply.status(503).send({
        success: false,
        error: { code: 'SERVICE_UNAVAILABLE', message: 'Redis not configured' },
      })
    }

    const key = `refresh:${body.refreshToken}`
    const userId = await fastify.redis.get(key)
    
    if (!userId) {
      return reply.status(401).send({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid refresh token' },
      })
    }

    const user = await fastify.prisma.user.findUnique({ where: { id: userId } })
    
    if (!user || !user.isActive) {
      return reply.status(401).send({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      })
    }

    await fastify.redis.del(key)
    
    const accessToken = fastify.jwt.sign({ userId: user.id, role: user.role })
    const refreshToken = await generateRefreshToken(user.id, fastify.redis)

    return reply.send({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
    })
  })

  fastify.get('/me', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request as any).user?.userId
    
    const user = await fastify.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, isActive: true, lastLogin: true, createdAt: true, updatedAt: true },
    })

    if (!user) {
      return reply.status(404).send({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      })
    }

    return reply.send({ success: true, data: user })
  })
}

async function generateRefreshToken(userId: string, redis: any): Promise<string> {
  const { v4: uuidv4 } = await import('uuid')
  const token = uuidv4()
  await redis.setex(`refresh:${token}`, 604800, userId) // 7 days
  return token
}

async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    return reply.status(401).send({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
    })
  }
}

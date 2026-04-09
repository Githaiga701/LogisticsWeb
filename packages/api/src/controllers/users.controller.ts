import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../plugins/prisma'
import { hashPassword } from '../services/auth.service'
import { createUserSchema, updateUserSchema } from '../types/auth.types'
import { authenticate, requireRoles } from '../middlewares/auth.middleware'

export async function getUsers(request: FastifyRequest, reply: FastifyReply) {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return reply.send({
    success: true,
    data: users,
  })
}

export async function getUser(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }

  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!user) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      },
    })
  }

  return reply.send({
    success: true,
    data: user,
  })
}

export async function createUser(request: FastifyRequest, reply: FastifyReply) {
  const body = createUserSchema.parse(request.body)
  
  const existing = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase() },
  })

  if (existing) {
    return reply.status(409).send({
      success: false,
      error: {
        code: 'EMAIL_EXISTS',
        message: 'Email already in use',
      },
    })
  }

  const passwordHash = await hashPassword(body.password)

  const user = await prisma.user.create({
    data: {
      email: body.email.toLowerCase(),
      passwordHash,
      role: body.role,
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  })

  return reply.status(201).send({
    success: true,
    data: user,
  })
}

export async function updateUser(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const body = updateUserSchema.parse(request.body)

  const existing = await prisma.user.findFirst({
    where: { id, deletedAt: null },
  })

  if (!existing) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      },
    })
  }

  if (body.email) {
    const emailTaken = await prisma.user.findFirst({
      where: { 
        email: body.email.toLowerCase(),
        NOT: { id }
      },
    })

    if (emailTaken) {
      return reply.status(409).send({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email already in use',
        },
      })
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: body,
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return reply.send({
    success: true,
    data: user,
  })
}

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }

  const existing = await prisma.user.findFirst({
    where: { id, deletedAt: null },
  })

  if (!existing) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      },
    })
  }

  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return reply.send({
    success: true,
    data: { message: 'User deleted successfully' },
  })
}

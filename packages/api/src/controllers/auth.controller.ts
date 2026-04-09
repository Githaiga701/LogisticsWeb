import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../plugins/prisma'
import { validateCredentials, hashPassword } from '../services/auth.service'
import { loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema } from '../types/auth.types'

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const body = loginSchema.parse(request.body)
  
  const user = await validateCredentials(body.email, body.password)
  
  if (!user) {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    })
  }

  const accessToken = request.server.jwt.sign({ 
    userId: user.id, 
    role: user.role 
  })
  
  const refreshToken = await request.server.tokenService.generateRefreshToken(user.id)

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
}

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  const body = refreshTokenSchema.parse(request.body)
  
  await request.server.tokenService.invalidateRefreshToken(body.refreshToken)
  
  return reply.send({
    success: true,
    data: { message: 'Logged out successfully' },
  })
}

export async function refresh(request: FastifyRequest, reply: FastifyReply) {
  const body = refreshTokenSchema.parse(request.body)
  
  const userId = await request.server.tokenService.validateRefreshToken(body.refreshToken)
  
  if (!userId) {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired refresh token',
      },
    })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user || !user.isActive) {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found or inactive',
      },
    })
  }

  await request.server.tokenService.invalidateRefreshToken(body.refreshToken)
  
  const accessToken = request.server.jwt.sign({ 
    userId: user.id, 
    role: user.role 
  })
  
  const refreshToken = await request.server.tokenService.generateRefreshToken(user.id)

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
}

export async function forgotPassword(request: FastifyRequest, reply: FastifyReply) {
  const body = forgotPasswordSchema.parse(request.body)
  
  const user = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase() },
  })

  if (user) {
    // TODO: Implement email sending with reset token
    request.log.info({ userId: user.id }, 'Password reset requested')
  }

  return reply.send({
    success: true,
    data: { message: 'If the email exists, a reset link has been sent' },
  })
}

export async function resetPassword(request: FastifyRequest, reply: FastifyReply) {
  const body = resetPasswordSchema.parse(request.body)
  
  // TODO: Validate reset token and update password
  request.log.info({ token: body.token }, 'Password reset attempted')
  
  return reply.status(501).send({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Password reset not yet implemented',
    },
  })
}

export async function me(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request as any).user?.userId
  
  if (!userId) {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      },
    })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
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

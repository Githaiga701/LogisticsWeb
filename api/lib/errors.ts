import { FastifyError, FastifyRequest, FastifyReply } from 'fastify'
import { ZodError } from 'zod'

export interface ApiError {
  code: string
  message: string
  details?: any
  statusCode: number
}

export class AppError extends Error {
  public code: string
  public statusCode: number
  public details?: any

  constructor(code: string, message: string, statusCode: number = 400, details?: any) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

export const Errors = {
  NotFound: (resource: string) => new AppError('NOT_FOUND', `${resource} not found`, 404),
  Unauthorized: (message: string = 'Unauthorized') => new AppError('UNAUTHORIZED', message, 401),
  Forbidden: (message: string = 'Access denied') => new AppError('FORBIDDEN', message, 403),
  BadRequest: (message: string, details?: any) => new AppError('BAD_REQUEST', message, 400, details),
  Conflict: (message: string) => new AppError('CONFLICT', message, 409),
  TooManyRequests: (message: string = 'Too many requests') => new AppError('RATE_LIMIT', message, 429),
  Internal: (message: string = 'Internal server error') => new AppError('INTERNAL_ERROR', message, 500),
  ServiceUnavailable: (message: string = 'Service temporarily unavailable') => new AppError('SERVICE_UNAVAILABLE', message, 503),
}

export function formatZodError(error: ZodError) {
  return error.errors.map(e => ({
    field: e.path.join('.'),
    message: e.message,
    code: e.code,
  }))
}

export async function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  const isDev = process.env.NODE_ENV === 'development'
  
  // Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: formatZodError(error),
      },
    })
  }

  // App errors
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
      },
    })
  }

  // Fastify errors
  const statusCode = error.statusCode || 500
  
  // Log unexpected errors
  if (statusCode >= 500) {
    request.log.error({
      error: {
        message: error.message,
        stack: isDev ? error.stack : undefined,
      },
      request: {
        method: request.method,
        url: request.url,
        headers: request.headers,
      },
    })
  }

  // JWT errors
  if (error.message?.includes('jwt') || error.message?.includes('token')) {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired authentication token',
      },
    })
  }

  // Database errors
  if (error.message?.includes('Prisma') || error.message?.includes('database')) {
    return reply.status(503).send({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database temporarily unavailable',
        ...(isDev && { details: error.message }),
      },
    })
  }

  // Generic error
  return reply.status(statusCode).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: statusCode >= 500 ? 'An unexpected error occurred' : error.message,
      ...(isDev && statusCode >= 500 && { stack: error.stack }),
    },
  })
}

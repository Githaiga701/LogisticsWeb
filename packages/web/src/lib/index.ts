export * from './query-client'
export * from './api-client'
export * from './auth'
export * from './entities'
export * from './dashboard'

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        if (error.details && Array.isArray(error.details)) {
          return error.details.map((d: any) => d.message).join(', ')
        }
        return error.message
      case 'UNAUTHORIZED':
        return 'Please log in to continue'
      case 'FORBIDDEN':
        return 'You do not have permission'
      case 'NOT_FOUND':
        return 'Resource not found'
      case 'RATE_LIMIT_EXCEEDED':
        return 'Too many requests. Please wait'
      case 'TIMEOUT':
        return 'Request timed out'
      case 'SERVICE_UNAVAILABLE':
        return 'Service temporarily unavailable'
      default:
        return error.message
    }
  }
  
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred'
}

import { ApiClientError } from './api-client'

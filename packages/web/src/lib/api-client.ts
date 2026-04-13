import { useAuthStore } from '../stores/auth.store'

const API_URL = import.meta.env.VITE_API_URL || ''

interface ApiError {
  code: string
  message: string
  details?: any
  statusCode: number
}

export class ApiClientError extends Error {
  public code: string
  public statusCode: number
  public details?: any

  constructor(error: ApiError) {
    super(error.message)
    this.code = error.code
    this.statusCode = error.statusCode
    this.details = error.details
    this.name = 'ApiClientError'
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
  retries?: number
}

const MAX_RETRIES = 3
const RETRY_DELAY = 1000

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function shouldRetry(error: any, attempt: number): boolean {
  if (attempt >= MAX_RETRIES) return false
  
  // Retry on network errors or 5xx errors
  if (!error.statusCode) return true
  if (error.statusCode >= 500) return true
  if (error.code === 'RATE_LIMIT_EXCEEDED') return true
  
  return false
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<{ data: T; meta?: any }> {
  const { skipAuth, retries = 0, ...init } = options
  const accessToken = useAuthStore.getState().accessToken

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...init.headers,
  }

  if (!skipAuth && accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`
  }

  let lastError: any

  for (let attempt = retries; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...init,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        throw new ApiClientError({
          code: data.error?.code || 'UNKNOWN_ERROR',
          message: data.error?.message || 'An error occurred',
          statusCode: response.status,
          details: data.error?.details,
        })
      }

      return data
    } catch (error: any) {
      lastError = error

      // Don't retry on auth errors or 4xx client errors
      if (error instanceof ApiClientError) {
        if (error.statusCode === 401 && !skipAuth) {
          // Try to refresh token
          const refreshed = await tryRefreshToken()
          if (refreshed && attempt === 0) {
            continue // Retry with new token
          }
        }
        
        if (error.statusCode >= 400 && error.statusCode < 500 && error.code !== 'RATE_LIMIT_EXCEEDED') {
          throw error
        }
      }

      // Don't retry if aborted
      if (error.name === 'AbortError') {
        throw new ApiClientError({
          code: 'TIMEOUT',
          message: 'Request timed out',
          statusCode: 408,
        })
      }

      if (!shouldRetry(error, attempt)) {
        throw error
      }

      // Exponential backoff
      const backoff = RETRY_DELAY * Math.pow(2, attempt)
      await delay(backoff)
    }
  }

  throw lastError
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = useAuthStore.getState().refreshToken
  
  if (!refreshToken) return false

  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) return false

    const data = await response.json()
    
    if (data.success) {
      useAuthStore.getState().setTokens(data.data.accessToken, data.data.refreshToken)
      useAuthStore.getState().setUser(data.data.user)
      return true
    }

    return false
  } catch {
    return false
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
}

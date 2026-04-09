import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from './api'
import { useAuthStore } from '../stores/auth.store'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  data: {
    accessToken: string
    refreshToken: string
    user: {
      id: string
      email: string
      role: string
      isActive: boolean
      createdAt: string
    }
  }
}

interface RefreshResponse {
  success: boolean
  data: {
    accessToken: string
    refreshToken: string
    user: {
      id: string
      email: string
      role: string
      isActive: boolean
      createdAt: string
    }
  }
}

export function useLogin() {
  const { setUser, setTokens } = useAuthStore()

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await api.post<LoginResponse>('/api/auth/login', credentials, {
        skipAuth: true,
      })
      return response
    },
    onSuccess: (response) => {
      if (response.success) {
        setTokens(response.data.accessToken, response.data.refreshToken)
        setUser(response.data.user)
      }
    },
  })
}

export function useLogout() {
  const { logout } = useAuthStore()
  const refreshToken = useAuthStore((state) => state.refreshToken)

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await api.post('/api/auth/logout', { refreshToken })
      }
    },
    onSuccess: () => {
      logout()
    },
  })
}

export function useRefreshToken() {
  const { setTokens, setUser, logout } = useAuthStore()
  const refreshToken = useAuthStore((state) => state.refreshToken)

  return useMutation({
    mutationFn: async () => {
      if (!refreshToken) throw new Error('No refresh token')
      
      const response = await api.post<RefreshResponse>('/api/auth/refresh', {
        refreshToken,
      }, { skipAuth: true })
      
      return response
    },
    onSuccess: (response) => {
      if (response.success) {
        setTokens(response.data.accessToken, response.data.refreshToken)
        setUser(response.data.user)
      }
    },
    onError: () => {
      logout()
    },
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean
        data: {
          id: string
          email: string
          role: string
          isActive: boolean
          lastLogin?: string
          createdAt: string
          updatedAt: string
        }
      }>('/api/auth/me')
      return response.data
    },
    enabled: useAuthStore.getState().isAuthenticated,
  })
}

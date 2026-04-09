import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  setUser: (user: User) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: true,
        isLoading: false 
      }),
      
      setTokens: (accessToken, refreshToken) => set({ 
        accessToken, 
        refreshToken 
      }),
      
      setLoading: (loading) => set({ 
        isLoading: loading 
      }),
      
      logout: () => set({ 
        user: null, 
        accessToken: null, 
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

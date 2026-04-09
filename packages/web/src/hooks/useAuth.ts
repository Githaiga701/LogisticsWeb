import { useEffect } from 'react'
import { useAuthStore } from '../stores/auth.store'

export function useAuthHydration() {
  const setLoading = useAuthStore((state) => state.setLoading)

  useEffect(() => {
    setLoading(false)
  }, [setLoading])
}

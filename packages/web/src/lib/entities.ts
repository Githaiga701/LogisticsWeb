import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api'

// Drivers
export function useDrivers(filters?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ['drivers', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.search) params.append('search', filters.search)
      const response = await api.get(`/api/drivers?${params.toString()}`)
      return response.data
    },
  })
}

export function useDriver(id: string) {
  return useQuery({
    queryKey: ['driver', id],
    queryFn: async () => {
      const response = await api.get(`/api/drivers/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateDriver() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/api/drivers', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
    },
  })
}

export function useUpdateDriver() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/api/drivers/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
    },
  })
}

export function useDeleteDriver() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/drivers/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
    },
  })
}

// Units
export function useUnits(filters?: { status?: string; unitType?: string; search?: string }) {
  return useQuery({
    queryKey: ['units', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.unitType) params.append('unitType', filters.unitType)
      if (filters?.search) params.append('search', filters.search)
      const response = await api.get(`/api/units?${params.toString()}`)
      return response.data
    },
  })
}

export function useUnit(id: string) {
  return useQuery({
    queryKey: ['unit', id],
    queryFn: async () => {
      const response = await api.get(`/api/units/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/api/units', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] })
    },
  })
}

export function useUpdateUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/api/units/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] })
    },
  })
}

export function useDeleteUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/units/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] })
    },
  })
}

// Clients
export function useClients(filters?: { isActive?: boolean; search?: string }) {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))
      if (filters?.search) params.append('search', filters.search)
      const response = await api.get(`/api/clients?${params.toString()}`)
      return response.data
    },
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const response = await api.get(`/api/clients/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/api/clients', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/api/clients/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/clients/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

// Locations
export function useLocations(filters?: { clientId?: string; locationType?: string; search?: string }) {
  return useQuery({
    queryKey: ['locations', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.clientId) params.append('clientId', filters.clientId)
      if (filters?.locationType) params.append('locationType', filters.locationType)
      if (filters?.search) params.append('search', filters.search)
      const response = await api.get(`/api/locations?${params.toString()}`)
      return response.data
    },
  })
}

export function useCreateLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/api/locations', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
  })
}

// Jobs
export function useJobs(filters?: { status?: string; priority?: string; clientId?: string; search?: string }) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.priority) params.append('priority', filters.priority)
      if (filters?.clientId) params.append('clientId', filters.clientId)
      if (filters?.search) params.append('search', filters.search)
      const response = await api.get(`/api/jobs?${params.toString()}`)
      return response.data
    },
  })
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const response = await api.get(`/api/jobs/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/api/jobs', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export function useUpdateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/api/jobs/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export function useCancelJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.post(`/api/jobs/${id}/cancel`, { reason })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

// Assignments
export function useAssignments(filters?: { status?: string; driverId?: string; unitId?: string }) {
  return useQuery({
    queryKey: ['assignments', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.driverId) params.append('driverId', filters.driverId)
      if (filters?.unitId) params.append('unitId', filters.unitId)
      const response = await api.get(`/api/assignments?${params.toString()}`)
      return response.data
    },
  })
}

export function useAssignment(id: string) {
  return useQuery({
    queryKey: ['assignment', id],
    queryFn: async () => {
      const response = await api.get(`/api/assignments/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/api/assignments', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export function useUpdateAssignmentStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      const response = await api.post(`/api/assignments/${id}/status`, { status, reason })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

// Driver Actions
export function useDriverAssignments() {
  return useQuery({
    queryKey: ['driverAssignments'],
    queryFn: async () => {
      const response = await api.get('/api/driver/assignments')
      return response.data
    },
  })
}

export function useDriverAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ action, id, data }: { action: string; id: string; data?: any }) => {
      const response = await api.post(`/api/driver/assignments/${id}/${action}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverAssignments'] })
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

// Notifications
export function useNotifications(unreadOnly?: boolean) {
  return useQuery({
    queryKey: ['notifications', unreadOnly],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (unreadOnly) params.append('unread', 'true')
      const response = await api.get(`/api/notifications?${params.toString()}`)
      return response.data
    },
  })
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['unreadNotificationCount'],
    queryFn: async () => {
      const response = await api.get('/api/notifications/unread-count')
      return response.data
    },
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/api/notifications/${id}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.post('/api/notifications/read-all')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] })
    },
  })
}

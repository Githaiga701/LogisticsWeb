import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, queryKeys, getErrorMessage } from '../index'
import { useToast } from '../components/Toast'

// Drivers hooks
export function useDrivers(filters?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: queryKeys.drivers.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.search) params.append('search', filters.search)
      const res = await api.get(`/api/drivers?${params.toString()}`)
      return res.data
    },
    staleTime: 30000, // 30 seconds
  })
}

export function useDriver(id: string) {
  return useQuery({
    queryKey: queryKeys.drivers.detail(id),
    queryFn: async () => {
      const res = await api.get(`/api/drivers/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

export function useCreateDriver() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/api/drivers', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all })
      showToast('success', 'Driver created successfully')
    },
    onError: (error: any) => {
      showToast('error', getErrorMessage(error))
    },
  })
}

export function useUpdateDriver() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/api/drivers/${id}`, data)
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers.lists() })
      showToast('success', 'Driver updated successfully')
    },
    onError: (error: any) => {
      showToast('error', getErrorMessage(error))
    },
  })
}

export function useDeleteDriver() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/drivers/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all })
      showToast('success', 'Driver deleted successfully')
    },
    onError: (error: any) => {
      showToast('error', getErrorMessage(error))
    },
  })
}

// Units hooks
export function useUnits(filters?: { status?: string; unitType?: string; search?: string }) {
  return useQuery({
    queryKey: queryKeys.units.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.unitType) params.append('unitType', filters.unitType)
      if (filters?.search) params.append('search', filters.search)
      const res = await api.get(`/api/units?${params.toString()}`)
      return res.data
    },
    staleTime: 30000,
  })
}

export function useUnit(id: string) {
  return useQuery({
    queryKey: queryKeys.units.detail(id),
    queryFn: async () => {
      const res = await api.get(`/api/units/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

export function useCreateUnit() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/api/units', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units.all })
      showToast('success', 'Unit created successfully')
    },
    onError: (error: any) => {
      showToast('error', getErrorMessage(error))
    },
  })
}

export function useUpdateUnit() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/api/units/${id}`, data)
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.units.lists() })
      showToast('success', 'Unit updated successfully')
    },
    onError: (error: any) => {
      showToast('error', getErrorMessage(error))
    },
  })
}

export function useDeleteUnit() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/units/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units.all })
      showToast('success', 'Unit deleted successfully')
    },
    onError: (error: any) => {
      showToast('error', getErrorMessage(error))
    },
  })
}

// Clients hooks
export function useClients(filters?: { isActive?: boolean; search?: string }) {
  return useQuery({
    queryKey: queryKeys.clients.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))
      if (filters?.search) params.append('search', filters.search)
      const res = await api.get(`/api/clients?${params.toString()}`)
      return res.data
    },
    staleTime: 60000,
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: queryKeys.clients.detail(id),
    queryFn: async () => {
      const res = await api.get(`/api/clients/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/api/clients', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all })
      showToast('success', 'Client created successfully')
    },
    onError: (error: any) => {
      showToast('error', getErrorMessage(error))
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/api/clients/${id}`, data)
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.lists() })
      showToast('success', 'Client updated successfully')
    },
    onError: (error: any) => {
      showToast('error', getErrorMessage(error))
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/clients/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all })
      showToast('success', 'Client deleted successfully')
    },
    onError: (error: any) => {
      showToast('error', getErrorMessage(error))
    },
  })
}

// Locations hooks
export function useLocations(filters?: { clientId?: string; locationType?: string; search?: string }) {
  return useQuery({
    queryKey: queryKeys.locations.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.clientId) params.append('clientId', filters.clientId)
      if (filters?.locationType) params.append('locationType', filters.locationType)
      if (filters?.search) params.append('search', filters.search)
      const res = await api.get(`/api/locations?${params.toString()}`)
      return res.data
    },
    staleTime: 120000, // 2 minutes
  })
}

export function useCreateLocation() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/api/locations', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations.all })
      showToast('success', 'Location created successfully')
    },
    onError: (error: any) => {
      showToast('error', getErrorMessage(error))
    },
  })
}

// Jobs hooks
export function useJobs(filters?: { status?: string; priority?: string; clientId?: string; search?: string }) {
  return useQuery({
    queryKey: queryKeys.jobs.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.priority) params.append('priority', filters.priority)
      if (filters?.clientId) params.append('clientId', filters.clientId)
      if (filters?.search) params.append('search', filters.search)
      const res = await api.get(`/api/jobs?${params.toString()}`)
      return res.data
    },
    staleTime: 15000, // 15 seconds for more real-time feel
  })
}

export function useJob(id: string) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(id),
    queryFn: async () => {
      const res = await api.get(`/api/jobs/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

export function useCreateJob() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/api/jobs', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats })
      showToast('success', 'Job created successfully')
    },
    onError: (error: any) => {
      showToast('error', getErrorMessage(error))
    },
  })
}

export function useUpdateJob() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/api/jobs/${id}`, data)
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() })
      showToast('success', 'Job updated successfully')
    },
    onError: (error: any) => {
      showToast('error', getErrorMessage(error))
    },
  })
}

export function useCancelJob() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await api.post(`/api/jobs/${id}/cancel`, { reason })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats })
      showToast('success', 'Job cancelled')
    },
    onError: (error: any) => {
      showToast('error', getErrorMessage(error))
    },
  })
}

// Assignments hooks
export function useAssignments(filters?: { status?: string; driverId?: string; unitId?: string }) {
  return useQuery({
    queryKey: queryKeys.assignments.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.driverId) params.append('driverId', filters.driverId)
      if (filters?.unitId) params.append('unitId', filters.unitId)
      const res = await api.get(`/api/assignments?${params.toString()}`)
      return res.data
    },
    staleTime: 10000, // 10 seconds
  })
}

export function useAssignment(id: string) {
  return useQuery({
    queryKey: queryKeys.assignments.detail(id),
    queryFn: async () => {
      const res = await api.get(`/api/assignments/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

export function useCreateAssignment() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/api/assignments', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats })
      showToast('success', 'Assignment created successfully')
    },
    onError: (error: any) => {
      showToast('error', getErrorMessage(error))
    },
  })
}

export function useUpdateAssignmentStatus() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      const res = await api.post(`/api/assignments/${id}/status`, { status, reason })
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats })
      showToast('success', 'Status updated')
    },
    onError: (error: any) => {
      showToast('error', getErrorMessage(error))
    },
  })
}

// Dashboard hooks
export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: async () => {
      const res = await api.get('/api/dashboard/stats')
      return res.data
    },
    staleTime: 30000,
    refetchInterval: 60000, // Refetch every minute
  })
}

export function useRecentActivity() {
  return useQuery({
    queryKey: queryKeys.dashboard.activity,
    queryFn: async () => {
      const res = await api.get('/api/dashboard/recent-activity')
      return res.data
    },
    staleTime: 15000,
  })
}

// Notifications hooks
export function useNotifications(unreadOnly?: boolean) {
  return useQuery({
    queryKey: queryKeys.notifications.list(unreadOnly),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (unreadOnly) params.append('unread', 'true')
      const res = await api.get(`/api/notifications?${params.toString()}`)
      return res.data
    },
    staleTime: 30000,
  })
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: async () => {
      const res = await api.get('/api/notifications/unread-count')
      return res.data
    },
    staleTime: 10000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/api/notifications/${id}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })
}

// Driver-specific hooks
export function useDriverAssignments() {
  return useQuery({
    queryKey: queryKeys.driver.assignments,
    queryFn: async () => {
      const res = await api.get('/api/driver/assignments')
      return res.data
    },
    staleTime: 10000,
    refetchInterval: 30000,
  })
}

export function useDriverAssignment(id: string) {
  return useQuery({
    queryKey: queryKeys.driver.assignment(id),
    queryFn: async () => {
      const res = await api.get(`/api/driver/assignments/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

export function useDriverAction() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async ({ action, id, data }: { action: string; id: string; data?: any }) => {
      const res = await api.post(`/api/driver/assignments/${id}/${action}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.driver.assignments })
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats })
    },
    onError: (error: any) => {
      showToast('error', getErrorMessage(error))
    },
  })
}

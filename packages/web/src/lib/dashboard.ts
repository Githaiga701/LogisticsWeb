import { useQuery } from '@tanstack/react-query'
import { api } from './api'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get('/api/dashboard/stats')
      return response.data
    },
    refetchInterval: 60000,
  })
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      const response = await api.get('/api/dashboard/recent-activity')
      return response.data
    },
  })
}

export function useDriverPerformance(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['driverPerformance', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      const response = await api.get(`/api/dashboard/driver-performance?${params.toString()}`)
      return response.data
    },
  })
}

export function useUnitUtilization(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['unitUtilization', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      const response = await api.get(`/api/dashboard/unit-utilization?${params.toString()}`)
      return response.data
    },
  })
}

export function useOnTimeDelivery(startDate?: string, endDate?: string, groupBy?: 'day' | 'week' | 'month') {
  return useQuery({
    queryKey: ['onTimeDelivery', startDate, endDate, groupBy],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (groupBy) params.append('groupBy', groupBy)
      const response = await api.get(`/api/dashboard/on-time-delivery?${params.toString()}`)
      return response.data
    },
  })
}

export function useDelayAnalysis(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['delayAnalysis', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      const response = await api.get(`/api/dashboard/delay-analysis?${params.toString()}`)
      return response.data
    },
  })
}

import { QueryClient } from '@tanstack/react-query'
import { ApiClientError } from './api-client'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof ApiClientError && error.statusCode >= 400 && error.statusCode < 500) {
          return false
        }
        return failureCount < 2
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
})

// Query key factory for type-safe query keys
export const queryKeys = {
  all: ['all'] as const,
  drivers: {
    all: ['drivers'] as const,
    lists: () => [...queryKeys.drivers.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.drivers.lists(), filters] as const,
    details: () => [...queryKeys.drivers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.drivers.details(), id] as const,
  },
  units: {
    all: ['units'] as const,
    lists: () => [...queryKeys.units.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.units.lists(), filters] as const,
    details: () => [...queryKeys.units.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.units.details(), id] as const,
  },
  clients: {
    all: ['clients'] as const,
    lists: () => [...queryKeys.clients.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.clients.lists(), filters] as const,
    details: () => [...queryKeys.clients.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.clients.details(), id] as const,
  },
  locations: {
    all: ['locations'] as const,
    lists: () => [...queryKeys.locations.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.locations.lists(), filters] as const,
  },
  jobs: {
    all: ['jobs'] as const,
    lists: () => [...queryKeys.jobs.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.jobs.lists(), filters] as const,
    details: () => [...queryKeys.jobs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
  },
  assignments: {
    all: ['assignments'] as const,
    lists: () => [...queryKeys.assignments.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.assignments.lists(), filters] as const,
    details: () => [...queryKeys.assignments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.assignments.details(), id] as const,
    events: (id: string) => [...queryKeys.assignments.detail(id), 'events'] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    activity: ['dashboard', 'activity'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (unread?: boolean) => [...queryKeys.notifications.all, unread] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
  },
  driver: {
    assignments: ['driver', 'assignments'] as const,
    assignment: (id: string) => ['driver', 'assignment', id] as const,
  },
} as const

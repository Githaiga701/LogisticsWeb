export const APP_NAME = 'Logistics Platform'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DRIVERS: '/drivers',
  UNITS: '/units',
  CLIENTS: '/clients',
  JOBS: '/jobs',
  ASSIGNMENTS: '/assignments',
  DRIVER: '/driver',
  DRIVER_ASSIGNMENT: '/driver/assignment',
} as const

export const STATUSES = {
  JOB: {
    DRAFT: 'DRAFT',
    PENDING: 'PENDING',
    ASSIGNED: 'ASSIGNED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  },
  ASSIGNMENT: {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    DISPATCHED: 'DISPATCHED',
    IN_TRANSIT: 'IN_TRANSIT',
    ARRIVED: 'ARRIVED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  },
  DRIVER: {
    AVAILABLE: 'AVAILABLE',
    ON_TRIP: 'ON_TRIP',
    OFF_DUTY: 'OFF_DUTY',
  },
  UNIT: {
    AVAILABLE: 'AVAILABLE',
    ASSIGNED: 'ASSIGNED',
    MAINTENANCE: 'MAINTENANCE',
  },
} as const

export const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const
export const UNIT_TYPES = ['TRUCK', 'TRAILER', 'VAN', 'OTHER'] as const
export const BODY_TYPES = ['CLOSED', 'OPEN', 'REFRIGERATED', 'TANKER', 'OTHER'] as const
export const LOCATION_TYPES = ['DEPOT', 'WAREHOUSE', 'CLIENT_SITE', 'OTHER'] as const

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  DISPATCHED: 'Dispatched',
  IN_TRANSIT: 'In Transit',
  ARRIVED: 'Arrived',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  DRAFT: 'Draft',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  AVAILABLE: 'Available',
  ON_TRIP: 'On Trip',
  OFF_DUTY: 'Off Duty',
  MAINTENANCE: 'Maintenance',
}

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  DISPATCHED: 'bg-indigo-100 text-indigo-800',
  IN_TRANSIT: 'bg-purple-100 text-purple-800',
  ARRIVED: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  DRAFT: 'bg-gray-100 text-gray-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  AVAILABLE: 'bg-green-100 text-green-800',
  ON_TRIP: 'bg-blue-100 text-blue-800',
  OFF_DUTY: 'bg-gray-100 text-gray-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
}

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  NORMAL: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
}

export const EVENT_LABELS: Record<string, string> = {
  CREATED: 'Created',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  DISPATCHED: 'Dispatched',
  DEPARTED: 'Departed',
  IN_TRANSIT: 'In Transit',
  ARRIVED: 'Arrived',
  COMPLETED: 'Completed',
  DELAYED: 'Delayed',
  CANCELLED: 'Cancelled',
  REASSIGNED: 'Reassigned',
  CLOSED: 'Closed',
}

export const EVENT_COLORS: Record<string, string> = {
  CREATED: 'text-blue-600',
  ACCEPTED: 'text-green-600',
  REJECTED: 'text-red-600',
  DISPATCHED: 'text-indigo-600',
  DEPARTED: 'text-purple-600',
  IN_TRANSIT: 'text-purple-600',
  ARRIVED: 'text-orange-600',
  COMPLETED: 'text-green-600',
  DELAYED: 'text-yellow-600',
  CANCELLED: 'text-red-600',
  REASSIGNED: 'text-gray-600',
  CLOSED: 'text-gray-600',
}

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const

export const DATE_FORMAT = 'MMM d, yyyy'
export const TIME_FORMAT = 'h:mm a'
export const DATETIME_FORMAT = 'MMM d, yyyy h:mm a'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown[]
  }
  meta?: {
    page: number
    total: number
    perPage: number
    totalPages: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface User {
  id: string
  email: string
  role: string
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Driver {
  id: string
  userId: string
  firstName: string
  lastName: string
  phone: string
  licenseNumber: string
  licenseClass: string
  licenseExpiry: Date
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface Unit {
  id: string
  plateNumber: string
  capacityTons: number
  unitType: string
  bodyType: string
  insuranceProvider: string
  insurancePolicy: string
  insuranceExpiry: Date
  registrationExpiry: Date
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  id: string
  companyName: string
  billingAddress?: string
  billingEmail?: string
  notes?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ClientContact {
  id: string
  clientId: string
  name: string
  phone: string
  email?: string
  isPrimary: boolean
}

export interface Location {
  id: string
  clientId?: string
  name: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  latitude?: number
  longitude?: number
  locationType: string
  createdAt: Date
  updatedAt: Date
}

export interface Job {
  id: string
  jobNumber: string
  clientId: string
  contactId?: string
  pickupLocationId: string
  dropoffLocationId: string
  pickupAddress?: string
  dropoffAddress?: string
  loadType: string
  weightTons?: number
  priority: string
  scheduledDate: Date
  scheduledTime?: string
  specialInstructions?: string
  status: string
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface Assignment {
  id: string
  jobId: string
  driverId: string
  unitId: string
  status: string
  rejectionReason?: string
  cancellationReason?: string
  cancelledById?: string
  reassignedFromId?: string
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface Event {
  id: string
  assignmentId: string
  eventType: string
  actorId: string
  timestamp: Date
  notes?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

export interface Document {
  id: string
  assignmentId: string
  documentType: string
  filePath: string
  fileName: string
  fileSize: number
  mimeType: string
  uploadedById: string
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data?: Record<string, unknown>
  readAt?: Date
  createdAt: Date
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface CreateDriverRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  licenseNumber: string
  licenseClass: string
  licenseExpiry: string
}

export interface CreateUnitRequest {
  plateNumber: string
  capacityTons: number
  unitType: string
  bodyType: string
  insuranceProvider: string
  insurancePolicy: string
  insuranceExpiry: string
  registrationExpiry: string
}

export interface CreateClientRequest {
  companyName: string
  billingAddress?: string
  billingEmail?: string
  notes?: string
  contacts?: Array<{
    name: string
    phone: string
    email?: string
    isPrimary?: boolean
  }>
}

export interface CreateJobRequest {
  clientId: string
  contactId?: string
  pickupLocationId: string
  dropoffLocationId: string
  pickupAddress?: string
  dropoffAddress?: string
  loadType: string
  weightTons?: number
  priority: string
  scheduledDate: string
  scheduledTime?: string
  specialInstructions?: string
}

export interface CreateAssignmentRequest {
  jobId: string
  driverId: string
  unitId: string
}

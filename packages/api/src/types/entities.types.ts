import { z } from 'zod'

export const createDriverSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseClass: z.string().min(1, 'License class is required'),
  licenseExpiry: z.string().transform((val) => new Date(val)),
})

export const updateDriverSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  licenseNumber: z.string().min(1).optional(),
  licenseClass: z.string().min(1).optional(),
  licenseExpiry: z.string().transform((val) => new Date(val)).optional(),
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY']).optional(),
})

export const createUnitSchema = z.object({
  plateNumber: z.string().min(1, 'Plate number is required'),
  capacityTons: z.number().positive('Capacity must be positive'),
  unitType: z.enum(['TRUCK', 'TRAILER', 'VAN', 'OTHER']),
  bodyType: z.enum(['CLOSED', 'OPEN', 'REFRIGERATED', 'TANKER', 'OTHER']),
  insuranceProvider: z.string().min(1, 'Insurance provider is required'),
  insurancePolicy: z.string().min(1, 'Insurance policy is required'),
  insuranceExpiry: z.string().transform((val) => new Date(val)),
  registrationExpiry: z.string().transform((val) => new Date(val)),
})

export const updateUnitSchema = z.object({
  plateNumber: z.string().min(1).optional(),
  capacityTons: z.number().positive().optional(),
  unitType: z.enum(['TRUCK', 'TRAILER', 'VAN', 'OTHER']).optional(),
  bodyType: z.enum(['CLOSED', 'OPEN', 'REFRIGERATED', 'TANKER', 'OTHER']).optional(),
  insuranceProvider: z.string().min(1).optional(),
  insurancePolicy: z.string().min(1).optional(),
  insuranceExpiry: z.string().transform((val) => new Date(val)).optional(),
  registrationExpiry: z.string().transform((val) => new Date(val)).optional(),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'MAINTENANCE']).optional(),
})

export const createClientSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  billingAddress: z.string().optional(),
  billingEmail: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
})

export const updateClientSchema = z.object({
  companyName: z.string().min(1).optional(),
  billingAddress: z.string().optional(),
  billingEmail: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const createContactSchema = z.object({
  name: z.string().min(1, 'Contact name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  isPrimary: z.boolean().optional(),
})

export const createLocationSchema = z.object({
  clientId: z.string().optional(),
  name: z.string().min(1, 'Location name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  locationType: z.enum(['DEPOT', 'WAREHOUSE', 'CLIENT_SITE', 'OTHER']),
})

export type CreateDriverInput = z.infer<typeof createDriverSchema>
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>
export type CreateUnitInput = z.infer<typeof createUnitSchema>
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>
export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type CreateContactInput = z.infer<typeof createContactSchema>
export type CreateLocationInput = z.infer<typeof createLocationSchema>

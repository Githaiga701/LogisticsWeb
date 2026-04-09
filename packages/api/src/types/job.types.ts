import { z } from 'zod'

export const createJobSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  contactId: z.string().uuid().optional(),
  pickupLocationId: z.string().uuid('Invalid pickup location'),
  dropoffLocationId: z.string().uuid('Invalid dropoff location'),
  pickupAddress: z.string().optional(),
  dropoffAddress: z.string().optional(),
  loadType: z.string().min(1, 'Load type is required'),
  weightTons: z.number().positive().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  scheduledDate: z.string().transform((val) => new Date(val)),
  scheduledTime: z.string().optional(),
  specialInstructions: z.string().optional(),
})

export const updateJobSchema = z.object({
  clientId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  pickupLocationId: z.string().uuid().optional(),
  dropoffLocationId: z.string().uuid().optional(),
  pickupAddress: z.string().optional(),
  dropoffAddress: z.string().optional(),
  loadType: z.string().min(1).optional(),
  weightTons: z.number().positive().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  scheduledDate: z.string().transform((val) => new Date(val)).optional(),
  scheduledTime: z.string().optional(),
  specialInstructions: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
})

export const createAssignmentSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  driverId: z.string().uuid('Invalid driver ID'),
  unitId: z.string().uuid('Invalid unit ID'),
})

export const updateAssignmentStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED', 'COMPLETED', 'CANCELLED']),
  reason: z.string().optional(),
})

export const reassignSchema = z.object({
  driverId: z.string().uuid('Invalid driver ID'),
  unitId: z.string().uuid('Invalid unit ID'),
})

export const reportDelaySchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
})

export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>
export type UpdateAssignmentStatusInput = z.infer<typeof updateAssignmentStatusSchema>
export type ReassignInput = z.infer<typeof reassignSchema>
export type ReportDelayInput = z.infer<typeof reportDelaySchema>

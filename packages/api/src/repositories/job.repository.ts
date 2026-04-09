import { PrismaClient, Job, JobPriority, JobStatus } from '@prisma/client'
import { prisma } from '../plugins/prisma'

export interface CreateJobData {
  clientId: string
  contactId?: string
  pickupLocationId: string
  dropoffLocationId: string
  pickupAddress?: string
  dropoffAddress?: string
  loadType: string
  weightTons?: number
  priority: JobPriority
  scheduledDate: Date
  scheduledTime?: string
  specialInstructions?: string
}

export interface UpdateJobData {
  clientId?: string
  contactId?: string
  pickupLocationId?: string
  dropoffLocationId?: string
  pickupAddress?: string
  dropoffAddress?: string
  loadType?: string
  weightTons?: number
  priority?: JobPriority
  scheduledDate?: Date
  scheduledTime?: string
  specialInstructions?: string
  status?: JobStatus
}

export interface JobFilters {
  status?: JobStatus
  priority?: JobPriority
  clientId?: string
  search?: string
}

class JobRepository {
  async create(data: CreateJobData & { jobNumber: string; createdById: string }): Promise<Job> {
    return prisma.job.create({ data })
  }

  async generateJobNumber(): Promise<string> {
    const count = await prisma.job.count()
    const number = (count + 1).toString().padStart(6, '0')
    return `JOB-${number}`
  }

  async findMany(filters?: JobFilters) {
    const where: any = { deletedAt: null }

    if (filters?.status) where.status = filters.status
    if (filters?.priority) where.priority = filters.priority
    if (filters?.clientId) where.clientId = filters.clientId

    if (filters?.search) {
      where.OR = [
        { jobNumber: { contains: filters.search, mode: 'insensitive' } },
        { loadType: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    return prisma.job.findMany({
      where,
      include: {
        client: { select: { id: true, companyName: true } },
        pickupLocation: true,
        dropoffLocation: true,
        assignments: {
          where: { status: { notIn: ['CANCELLED', 'REASSIGNED'] } },
          include: {
            driver: { include: { user: { select: { email: true } } } },
            unit: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: string) {
    return prisma.job.findFirst({
      where: { id, deletedAt: null },
      include: {
        client: { include: { contacts: true } },
        contact: true,
        pickupLocation: true,
        dropoffLocation: true,
        assignments: {
          include: {
            driver: { include: { user: { select: { email: true } } } },
            unit: true,
            events: { orderBy: { timestamp: 'asc' } },
          },
        },
      },
    })
  }

  async update(id: string, data: UpdateJobData) {
    return prisma.job.update({
      where: { id },
      data,
      include: {
        client: true,
        pickupLocation: true,
        dropoffLocation: true,
      },
    })
  }

  async softDelete(id: string) {
    return prisma.job.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }
}

export const jobRepository = new JobRepository()

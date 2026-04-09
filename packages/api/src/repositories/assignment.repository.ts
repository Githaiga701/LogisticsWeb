import { PrismaClient, Assignment, AssignmentStatus } from '@prisma/client'
import { prisma } from '../plugins/prisma'
import { VALID_TRANSITIONS, TERMINAL_STATES } from '@logistics/shared'

export interface CreateAssignmentData {
  jobId: string
  driverId: string
  unitId: string
}

export interface AssignmentFilters {
  status?: AssignmentStatus
  driverId?: string
  unitId?: string
}

class AssignmentRepository {
  async create(data: CreateAssignmentData & { createdById: string }): Promise<Assignment> {
    return prisma.assignment.create({ data })
  }

  async findMany(filters?: AssignmentFilters) {
    const where: any = {}

    if (filters?.status) where.status = filters.status
    if (filters?.driverId) where.driverId = filters.driverId
    if (filters?.unitId) where.unitId = filters.unitId

    return prisma.assignment.findMany({
      where,
      include: {
        job: {
          include: {
            client: { select: { id: true, companyName: true } },
            pickupLocation: true,
            dropoffLocation: true,
          },
        },
        driver: {
          include: { user: { select: { email: true } } },
        },
        unit: true,
        events: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: string) {
    return prisma.assignment.findFirst({
      where: { id },
      include: {
        job: {
          include: {
            client: { include: { contacts: true } },
            pickupLocation: true,
            dropoffLocation: true,
          },
        },
        driver: { include: { user: { select: { email: true } } } },
        unit: true,
        events: { orderBy: { timestamp: 'asc' } },
        documents: true,
      },
    })
  }

  async update(id: string, data: Partial<Assignment>) {
    return prisma.assignment.update({
      where: { id },
      data,
    })
  }

  async hasActiveAssignment(driverId?: string, unitId?: string): Promise<{ driver: boolean; unit: boolean }> {
    const activeStatuses = ['PENDING', 'ACCEPTED', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED']
    
    const driverActive = driverId 
      ? (await prisma.assignment.count({
          where: { driverId, status: { in: activeStatuses } },
        })) > 0
      : false

    const unitActive = unitId
      ? (await prisma.assignment.count({
          where: { unitId, status: { in: activeStatuses } },
        })) > 0
      : false

    return { driver: driverActive, unit: unitActive }
  }
}

export const assignmentRepository = new AssignmentRepository()

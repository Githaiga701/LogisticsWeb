import { PrismaClient, Driver, DriverStatus } from '@prisma/client'
import { prisma } from '../plugins/prisma'

export interface CreateDriverData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  licenseNumber: string
  licenseClass: string
  licenseExpiry: Date
}

export interface UpdateDriverData {
  firstName?: string
  lastName?: string
  phone?: string
  licenseNumber?: string
  licenseClass?: string
  licenseExpiry?: Date
  status?: DriverStatus
}

export interface DriverFilters {
  status?: DriverStatus
  search?: string
}

class DriverRepository {
  async create(data: CreateDriverData & { userId: string }): Promise<Driver> {
    return prisma.driver.create({
      data: {
        userId: data.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        licenseNumber: data.licenseNumber,
        licenseClass: data.licenseClass,
        licenseExpiry: data.licenseExpiry,
      },
    })
  }

  async findMany(filters?: DriverFilters) {
    const where: any = { deletedAt: null }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { licenseNumber: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    return prisma.driver.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: string) {
    return prisma.driver.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        },
      },
    })
  }

  async update(id: string, data: UpdateDriverData) {
    return prisma.driver.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        },
      },
    })
  }

  async softDelete(id: string) {
    return prisma.driver.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  async findByUserId(userId: string) {
    return prisma.driver.findFirst({
      where: { userId, deletedAt: null },
    })
  }

  async hasActiveAssignment(driverId: string): Promise<boolean> {
    const count = await prisma.assignment.count({
      where: {
        driverId,
        status: { in: ['PENDING', 'ACCEPTED', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED'] },
      },
    })
    return count > 0
  }
}

export const driverRepository = new DriverRepository()

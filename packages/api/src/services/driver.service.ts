import { prisma } from '../plugins/prisma'
import { hashPassword } from './auth.service'
import { driverRepository, CreateDriverData, UpdateDriverData } from '../repositories/driver.repository'
import { DriverStatus } from '@prisma/client'

export async function createDriver(data: CreateDriverData) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  })

  if (existingUser) {
    throw new Error('EMAIL_EXISTS')
  }

  const passwordHash = await hashPassword(data.password)

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash,
      role: 'DRIVER',
    },
  })

  const driver = await driverRepository.create({
    ...data,
    userId: user.id,
  })

  return driverRepository.findById(driver.id)
}

export async function getDrivers(filters?: { status?: DriverStatus; search?: string }) {
  return driverRepository.findMany(filters)
}

export async function getDriver(id: string) {
  return driverRepository.findById(id)
}

export async function updateDriver(id: string, data: UpdateDriverData) {
  const driver = await driverRepository.findById(id)
  if (!driver) {
    throw new Error('DRIVER_NOT_FOUND')
  }

  return driverRepository.update(id, data)
}

export async function deleteDriver(id: string) {
  const driver = await driverRepository.findById(id)
  if (!driver) {
    throw new Error('DRIVER_NOT_FOUND')
  }

  const hasActive = await driverRepository.hasActiveAssignment(id)
  if (hasActive) {
    throw new Error('DRIVER_HAS_ACTIVE_ASSIGNMENT')
  }

  await driverRepository.softDelete(id)
  await prisma.user.update({
    where: { id: driver.userId },
    data: { deletedAt: new Date() },
  })
}

export async function getDriverAssignments(id: string) {
  return prisma.assignment.findMany({
    where: { driverId: id },
    include: {
      job: {
        include: {
          client: true,
          pickupLocation: true,
          dropoffLocation: true,
        },
      },
      unit: true,
      events: {
        orderBy: { timestamp: 'desc' },
        take: 10,
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

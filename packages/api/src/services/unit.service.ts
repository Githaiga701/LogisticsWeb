import { prisma } from '../plugins/prisma'
import { unitRepository, CreateUnitData, UpdateUnitData } from '../repositories/unit.repository'
import { UnitStatus, UnitType } from '@prisma/client'

export async function createUnit(data: CreateUnitData) {
  const existing = await unitRepository.findByPlateNumber(data.plateNumber)
  
  if (existing) {
    throw new Error('PLATE_NUMBER_EXISTS')
  }

  return unitRepository.create(data)
}

export async function getUnits(filters?: { status?: UnitStatus; unitType?: UnitType; search?: string }) {
  return unitRepository.findMany(filters)
}

export async function getUnit(id: string) {
  return unitRepository.findById(id)
}

export async function updateUnit(id: string, data: UpdateUnitData) {
  const unit = await unitRepository.findById(id)
  if (!unit) {
    throw new Error('UNIT_NOT_FOUND')
  }

  if (data.plateNumber && data.plateNumber !== unit.plateNumber) {
    const existing = await unitRepository.findByPlateNumber(data.plateNumber)
    if (existing) {
      throw new Error('PLATE_NUMBER_EXISTS')
    }
  }

  return unitRepository.update(id, data)
}

export async function deleteUnit(id: string) {
  const unit = await unitRepository.findById(id)
  if (!unit) {
    throw new Error('UNIT_NOT_FOUND')
  }

  const hasActive = await unitRepository.hasActiveAssignment(id)
  if (hasActive) {
    throw new Error('UNIT_HAS_ACTIVE_ASSIGNMENT')
  }

  return unitRepository.softDelete(id)
}

export async function getUnitAssignments(id: string) {
  return prisma.assignment.findMany({
    where: { unitId: id },
    include: {
      job: {
        include: {
          client: true,
          pickupLocation: true,
          dropoffLocation: true,
        },
      },
      driver: {
        include: {
          user: {
            select: { email: true },
          },
        },
      },
      events: {
        orderBy: { timestamp: 'desc' },
        take: 10,
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

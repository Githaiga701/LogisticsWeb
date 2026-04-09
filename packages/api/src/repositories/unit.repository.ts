import { PrismaClient, Unit, UnitStatus, UnitType, BodyType } from '@prisma/client'
import { prisma } from '../plugins/prisma'

export interface CreateUnitData {
  plateNumber: string
  capacityTons: number
  unitType: UnitType
  bodyType: BodyType
  insuranceProvider: string
  insurancePolicy: string
  insuranceExpiry: Date
  registrationExpiry: Date
}

export interface UpdateUnitData {
  plateNumber?: string
  capacityTons?: number
  unitType?: UnitType
  bodyType?: BodyType
  insuranceProvider?: string
  insurancePolicy?: string
  insuranceExpiry?: Date
  registrationExpiry?: Date
  status?: UnitStatus
}

export interface UnitFilters {
  status?: UnitStatus
  unitType?: UnitType
  search?: string
}

class UnitRepository {
  async create(data: CreateUnitData): Promise<Unit> {
    return prisma.unit.create({ data })
  }

  async findMany(filters?: UnitFilters) {
    const where: any = { deletedAt: null }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.unitType) {
      where.unitType = filters.unitType
    }

    if (filters?.search) {
      where.OR = [
        { plateNumber: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    return prisma.unit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: string) {
    return prisma.unit.findFirst({
      where: { id, deletedAt: null },
    })
  }

  async findByPlateNumber(plateNumber: string) {
    return prisma.unit.findFirst({
      where: { plateNumber, deletedAt: null },
    })
  }

  async update(id: string, data: UpdateUnitData) {
    return prisma.unit.update({
      where: { id },
      data,
    })
  }

  async softDelete(id: string) {
    return prisma.unit.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  async hasActiveAssignment(unitId: string): Promise<boolean> {
    const count = await prisma.assignment.count({
      where: {
        unitId,
        status: { in: ['PENDING', 'ACCEPTED', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED'] },
      },
    })
    return count > 0
  }
}

export const unitRepository = new UnitRepository()

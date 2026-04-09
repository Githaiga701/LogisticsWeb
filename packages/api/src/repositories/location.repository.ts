import { PrismaClient, Location } from '@prisma/client'
import { prisma } from '../plugins/prisma'

export interface CreateLocationData {
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
}

export interface UpdateLocationData {
  name?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  latitude?: number
  longitude?: number
  locationType?: string
}

class LocationRepository {
  async create(data: CreateLocationData): Promise<Location> {
    return prisma.location.create({ data })
  }

  async findMany(filters?: { clientId?: string; locationType?: string; search?: string }) {
    const where: any = { deletedAt: null }

    if (filters?.clientId) {
      where.clientId = filters.clientId
    }

    if (filters?.locationType) {
      where.locationType = filters.locationType
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } },
        { city: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    return prisma.location.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: string) {
    return prisma.location.findFirst({
      where: { id, deletedAt: null },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    })
  }

  async update(id: string, data: UpdateLocationData) {
    return prisma.location.update({
      where: { id },
      data,
    })
  }

  async softDelete(id: string) {
    return prisma.location.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }
}

export const locationRepository = new LocationRepository()

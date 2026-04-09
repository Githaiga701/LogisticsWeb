import { PrismaClient, Client, ClientContact, Location } from '@prisma/client'
import { prisma } from '../plugins/prisma'

export interface CreateClientData {
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

export interface UpdateClientData {
  companyName?: string
  billingAddress?: string
  billingEmail?: string
  notes?: string
  isActive?: boolean
}

export interface CreateContactData {
  name: string
  phone: string
  email?: string
  isPrimary?: boolean
}

class ClientRepository {
  async create(data: CreateClientData): Promise<Client> {
    return prisma.client.create({
      data: {
        companyName: data.companyName,
        billingAddress: data.billingAddress,
        billingEmail: data.billingEmail,
        notes: data.notes,
      },
    })
  }

  async findMany(filters?: { isActive?: boolean; search?: string }) {
    const where: any = { deletedAt: null }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters?.search) {
      where.OR = [
        { companyName: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    return prisma.client.findMany({
      where,
      include: {
        contacts: {
          where: { isPrimary: true },
          take: 1,
        },
        _count: {
          select: { jobs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: string) {
    return prisma.client.findFirst({
      where: { id, deletedAt: null },
      include: {
        contacts: true,
        locations: { where: { deletedAt: null } },
      },
    })
  }

  async update(id: string, data: UpdateClientData) {
    return prisma.client.update({
      where: { id },
      data,
    })
  }

  async softDelete(id: string) {
    return prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  async addContact(clientId: string, data: CreateContactData): Promise<ClientContact> {
    if (data.isPrimary) {
      await prisma.clientContact.updateMany({
        where: { clientId, isPrimary: true },
        data: { isPrimary: false },
      })
    }

    return prisma.clientContact.create({
      data: {
        clientId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        isPrimary: data.isPrimary ?? false,
      },
    })
  }

  async updateContact(id: string, data: Partial<CreateContactData>) {
    if (data.isPrimary) {
      const contact = await prisma.clientContact.findUnique({ where: { id } })
      if (contact) {
        await prisma.clientContact.updateMany({
          where: { clientId: contact.clientId, isPrimary: true },
          data: { isPrimary: false },
        })
      }
    }

    return prisma.clientContact.update({
      where: { id },
      data,
    })
  }

  async deleteContact(id: string) {
    return prisma.clientContact.delete({ where: { id } })
  }
}

export const clientRepository = new ClientRepository()

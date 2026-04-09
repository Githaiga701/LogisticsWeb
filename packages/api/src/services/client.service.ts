import { prisma } from '../plugins/prisma'
import { clientRepository, CreateClientData, UpdateClientData, CreateContactData } from '../repositories/client.repository'

export async function createClient(data: CreateClientData) {
  const client = await clientRepository.create(data)

  if (data.contacts && data.contacts.length > 0) {
    for (const contact of data.contacts) {
      await clientRepository.addContact(client.id, contact)
    }
  }

  return clientRepository.findById(client.id)
}

export async function getClients(filters?: { isActive?: boolean; search?: string }) {
  return clientRepository.findMany(filters)
}

export async function getClient(id: string) {
  return clientRepository.findById(id)
}

export async function updateClient(id: string, data: UpdateClientData) {
  const client = await clientRepository.findById(id)
  if (!client) {
    throw new Error('CLIENT_NOT_FOUND')
  }

  return clientRepository.update(id, data)
}

export async function deleteClient(id: string) {
  const client = await clientRepository.findById(id)
  if (!client) {
    throw new Error('CLIENT_NOT_FOUND')
  }

  return clientRepository.softDelete(id)
}

export async function addClientContact(clientId: string, data: CreateContactData) {
  return clientRepository.addContact(clientId, data)
}

export async function updateClientContact(id: string, data: Partial<CreateContactData>) {
  return clientRepository.updateContact(id, data)
}

export async function deleteClientContact(id: string) {
  return clientRepository.deleteContact(id)
}

export async function getClientJobs(id: string) {
  return prisma.job.findMany({
    where: { clientId: id },
    include: {
      assignments: {
        include: {
          driver: true,
          unit: true,
        },
      },
      pickupLocation: true,
      dropoffLocation: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

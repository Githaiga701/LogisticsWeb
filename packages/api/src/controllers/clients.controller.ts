import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../plugins/prisma'
import { 
  createClient, 
  getClients, 
  getClient, 
  updateClient, 
  deleteClient,
  addClientContact,
  updateClientContact,
  deleteClientContact,
  getClientJobs
} from '../services/client.service'
import { createClientSchema, updateClientSchema, createContactSchema } from '../types/entities.types'

export async function listClients(request: FastifyRequest, reply: FastifyReply) {
  const { isActive, search } = request.query as { 
    isActive?: string
    search?: string 
  }
  
  const clients = await getClients({
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    search,
  })

  return reply.send({
    success: true,
    data: clients,
  })
}

export async function showClient(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  
  const client = await getClient(id)
  
  if (!client) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'CLIENT_NOT_FOUND',
        message: 'Client not found',
      },
    })
  }

  return reply.send({
    success: true,
    data: client,
  })
}

export async function addClient(request: FastifyRequest, reply: FastifyReply) {
  const body = createClientSchema.parse(request.body)
  
  const client = await createClient(body)
  return reply.status(201).send({
    success: true,
    data: client,
  })
}

export async function editClient(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const body = updateClientSchema.parse(request.body)
  
  try {
    const client = await updateClient(id, body)
    return reply.send({
      success: true,
      data: client,
    })
  } catch (error: any) {
    if (error.message === 'CLIENT_NOT_FOUND') {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Client not found',
        },
      })
    }
    throw error
  }
}

export async function removeClient(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  
  try {
    await deleteClient(id)
    return reply.send({
      success: true,
      data: { message: 'Client deleted successfully' },
    })
  } catch (error: any) {
    if (error.message === 'CLIENT_NOT_FOUND') {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Client not found',
        },
      })
    }
    throw error
  }
}

export async function listClientContacts(request: FastifyRequest, reply: FastifyReply) {
  const { clientId } = request.params as { clientId: string }
  
  const client = await getClient(clientId)
  if (!client) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'CLIENT_NOT_FOUND',
        message: 'Client not found',
      },
    })
  }

  return reply.send({
    success: true,
    data: client.contacts,
  })
}

export async function addClientContactHandler(request: FastifyRequest, reply: FastifyReply) {
  const { clientId } = request.params as { clientId: string }
  const body = createContactSchema.parse(request.body)
  
  const contact = await addClientContact(clientId, body)
  return reply.status(201).send({
    success: true,
    data: contact,
  })
}

export async function editContact(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const body = createContactSchema.partial().parse(request.body)
  
  const contact = await updateClientContact(id, body)
  return reply.send({
    success: true,
    data: contact,
  })
}

export async function removeContact(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  
  await deleteClientContact(id)
  return reply.send({
    success: true,
    data: { message: 'Contact deleted successfully' },
  })
}

export async function clientJobs(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  
  const client = await getClient(id)
  if (!client) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'CLIENT_NOT_FOUND',
        message: 'Client not found',
      },
    })
  }

  const jobs = await getClientJobs(id)
  return reply.send({
    success: true,
    data: jobs,
  })
}

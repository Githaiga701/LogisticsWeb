import { FastifyRequest, FastifyReply } from 'fastify'
import { createLocation, getLocations, getLocation, updateLocation, deleteLocation } from '../services/location.service'
import { createLocationSchema } from '../types/entities.types'

export async function listLocations(request: FastifyRequest, reply: FastifyReply) {
  const { clientId, locationType, search } = request.query as { 
    clientId?: string
    locationType?: string
    search?: string 
  }
  
  const locations = await getLocations({
    clientId,
    locationType,
    search,
  })

  return reply.send({
    success: true,
    data: locations,
  })
}

export async function showLocation(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  
  const location = await getLocation(id)
  
  if (!location) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'LOCATION_NOT_FOUND',
        message: 'Location not found',
      },
    })
  }

  return reply.send({
    success: true,
    data: location,
  })
}

export async function addLocation(request: FastifyRequest, reply: FastifyReply) {
  const body = createLocationSchema.parse(request.body)
  
  const location = await createLocation(body)
  return reply.status(201).send({
    success: true,
    data: location,
  })
}

export async function editLocation(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const body = createLocationSchema.partial().parse(request.body)
  
  try {
    const location = await updateLocation(id, body)
    return reply.send({
      success: true,
      data: location,
    })
  } catch (error: any) {
    if (error.message === 'LOCATION_NOT_FOUND') {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'LOCATION_NOT_FOUND',
          message: 'Location not found',
        },
      })
    }
    throw error
  }
}

export async function removeLocation(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  
  try {
    await deleteLocation(id)
    return reply.send({
      success: true,
      data: { message: 'Location deleted successfully' },
    })
  } catch (error: any) {
    if (error.message === 'LOCATION_NOT_FOUND') {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'LOCATION_NOT_FOUND',
          message: 'Location not found',
        },
      })
    }
    throw error
  }
}

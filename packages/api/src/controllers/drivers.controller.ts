import { FastifyRequest, FastifyReply } from 'fastify'
import { createDriver, getDrivers, getDriver, updateDriver, deleteDriver, getDriverAssignments } from '../services/driver.service'
import { createDriverSchema, updateDriverSchema } from '../types/entities.types'

export async function listDrivers(request: FastifyRequest, reply: FastifyReply) {
  const { status, search } = request.query as { status?: string; search?: string }
  
  const drivers = await getDrivers({
    status: status as any,
    search,
  })

  return reply.send({
    success: true,
    data: drivers,
  })
}

export async function showDriver(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  
  const driver = await getDriver(id)
  
  if (!driver) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'DRIVER_NOT_FOUND',
        message: 'Driver not found',
      },
    })
  }

  return reply.send({
    success: true,
    data: driver,
  })
}

export async function addDriver(request: FastifyRequest, reply: FastifyReply) {
  const body = createDriverSchema.parse(request.body)
  
  try {
    const driver = await createDriver(body)
    return reply.status(201).send({
      success: true,
      data: driver,
    })
  } catch (error: any) {
    if (error.message === 'EMAIL_EXISTS') {
      return reply.status(409).send({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email already in use',
        },
      })
    }
    throw error
  }
}

export async function editDriver(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const body = updateDriverSchema.parse(request.body)
  
  try {
    const driver = await updateDriver(id, body)
    return reply.send({
      success: true,
      data: driver,
    })
  } catch (error: any) {
    if (error.message === 'DRIVER_NOT_FOUND') {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'DRIVER_NOT_FOUND',
          message: 'Driver not found',
        },
      })
    }
    throw error
  }
}

export async function removeDriver(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  
  try {
    await deleteDriver(id)
    return reply.send({
      success: true,
      data: { message: 'Driver deleted successfully' },
    })
  } catch (error: any) {
    if (error.message === 'DRIVER_NOT_FOUND') {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'DRIVER_NOT_FOUND',
          message: 'Driver not found',
        },
      })
    }
    if (error.message === 'DRIVER_HAS_ACTIVE_ASSIGNMENT') {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'DRIVER_HAS_ACTIVE_ASSIGNMENT',
          message: 'Cannot delete driver with active assignment',
        },
      })
    }
    throw error
  }
}

export async function driverAssignments(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  
  const driver = await getDriver(id)
  if (!driver) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'DRIVER_NOT_FOUND',
        message: 'Driver not found',
      },
    })
  }

  const assignments = await getDriverAssignments(id)
  
  return reply.send({
    success: true,
    data: assignments,
  })
}

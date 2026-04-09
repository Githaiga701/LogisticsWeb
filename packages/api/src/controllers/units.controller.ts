import { FastifyRequest, FastifyReply } from 'fastify'
import { createUnit, getUnits, getUnit, updateUnit, deleteUnit, getUnitAssignments } from '../services/unit.service'
import { createUnitSchema, updateUnitSchema } from '../types/entities.types'

export async function listUnits(request: FastifyRequest, reply: FastifyReply) {
  const { status, unitType, search } = request.query as { 
    status?: string
    unitType?: string
    search?: string 
  }
  
  const units = await getUnits({
    status: status as any,
    unitType: unitType as any,
    search,
  })

  return reply.send({
    success: true,
    data: units,
  })
}

export async function showUnit(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  
  const unit = await getUnit(id)
  
  if (!unit) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'UNIT_NOT_FOUND',
        message: 'Unit not found',
      },
    })
  }

  return reply.send({
    success: true,
    data: unit,
  })
}

export async function addUnit(request: FastifyRequest, reply: FastifyReply) {
  const body = createUnitSchema.parse(request.body)
  
  try {
    const unit = await createUnit(body)
    return reply.status(201).send({
      success: true,
      data: unit,
    })
  } catch (error: any) {
    if (error.message === 'PLATE_NUMBER_EXISTS') {
      return reply.status(409).send({
        success: false,
        error: {
          code: 'PLATE_NUMBER_EXISTS',
          message: 'Plate number already registered',
        },
      })
    }
    throw error
  }
}

export async function editUnit(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const body = updateUnitSchema.parse(request.body)
  
  try {
    const unit = await updateUnit(id, body)
    return reply.send({
      success: true,
      data: unit,
    })
  } catch (error: any) {
    if (error.message === 'UNIT_NOT_FOUND') {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'UNIT_NOT_FOUND',
          message: 'Unit not found',
        },
      })
    }
    if (error.message === 'PLATE_NUMBER_EXISTS') {
      return reply.status(409).send({
        success: false,
        error: {
          code: 'PLATE_NUMBER_EXISTS',
          message: 'Plate number already registered',
        },
      })
    }
    throw error
  }
}

export async function removeUnit(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  
  try {
    await deleteUnit(id)
    return reply.send({
      success: true,
      data: { message: 'Unit deleted successfully' },
    })
  } catch (error: any) {
    if (error.message === 'UNIT_NOT_FOUND') {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'UNIT_NOT_FOUND',
          message: 'Unit not found',
        },
      })
    }
    if (error.message === 'UNIT_HAS_ACTIVE_ASSIGNMENT') {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'UNIT_HAS_ACTIVE_ASSIGNMENT',
          message: 'Cannot delete unit with active assignment',
        },
      })
    }
    throw error
  }
}

export async function unitAssignments(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  
  const unit = await getUnit(id)
  if (!unit) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'UNIT_NOT_FOUND',
        message: 'Unit not found',
      },
    })
  }

  const assignments = await getUnitAssignments(id)
  
  return reply.send({
    success: true,
    data: assignments,
  })
}

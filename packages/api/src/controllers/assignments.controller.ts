import { FastifyRequest, FastifyReply } from 'fastify'
import { 
  createAssignment, 
  getAssignments, 
  getAssignment, 
  updateAssignmentStatus,
  reassignAssignment,
  reportDelay,
  getAssignmentEvents 
} from '../services/assignment.service'
import { 
  createAssignmentSchema, 
  updateAssignmentStatusSchema,
  reassignSchema,
  reportDelaySchema 
} from '../types/job.types'

export async function listAssignments(request: FastifyRequest, reply: FastifyReply) {
  const { status, driverId, unitId } = request.query as { 
    status?: string
    driverId?: string
    unitId?: string 
  }
  
  const assignments = await getAssignments({
    status: status as any,
    driverId,
    unitId,
  })

  return reply.send({
    success: true,
    data: assignments,
  })
}

export async function showAssignment(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  
  const assignment = await getAssignment(id)
  
  if (!assignment) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'ASSIGNMENT_NOT_FOUND',
        message: 'Assignment not found',
      },
    })
  }

  return reply.send({
    success: true,
    data: assignment,
  })
}

export async function addAssignment(request: FastifyRequest, reply: FastifyReply) {
  const body = createAssignmentSchema.parse(request.body)
  const userId = (request as any).user.userId
  
  try {
    const assignment = await createAssignment({
      ...body,
      createdById: userId,
    })
    return reply.status(201).send({
      success: true,
      data: assignment,
    })
  } catch (error: any) {
    const errorMap: Record<string, { code: string; message: string; status: number }> = {
      'JOB_NOT_FOUND': { code: 'JOB_NOT_FOUND', message: 'Job not found', status: 404 },
      'JOB_ALREADY_ASSIGNED': { code: 'JOB_ALREADY_ASSIGNED', message: 'Job already has an active assignment', status: 409 },
      'DRIVER_NOT_AVAILABLE': { code: 'DRIVER_NOT_AVAILABLE', message: 'Driver is not available', status: 400 },
      'UNIT_NOT_AVAILABLE': { code: 'UNIT_NOT_AVAILABLE', message: 'Unit is not available', status: 400 },
      'DRIVER_NOT_FOUND': { code: 'DRIVER_NOT_FOUND', message: 'Driver not found', status: 404 },
      'UNIT_NOT_FOUND': { code: 'UNIT_NOT_FOUND', message: 'Unit not found', status: 404 },
      'DRIVER_LICENSE_EXPIRED': { code: 'DRIVER_LICENSE_EXPIRED', message: 'Driver license has expired', status: 400 },
      'UNIT_INSURANCE_EXPIRED': { code: 'UNIT_INSURANCE_EXPIRED', message: 'Unit insurance has expired', status: 400 },
    }

    const mapped = errorMap[error.message]
    if (mapped) {
      return reply.status(mapped.status).send({
        success: false,
        error: { code: mapped.code, message: mapped.message },
      })
    }
    throw error
  }
}

export async function updateAssignmentStatusHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const body = updateAssignmentStatusSchema.parse(request.body)
  const userId = (request as any).user.userId
  
  try {
    const assignment = await updateAssignmentStatus(id, body.status, userId, body.reason)
    return reply.send({
      success: true,
      data: assignment,
    })
  } catch (error: any) {
    if (error.message.startsWith('INVALID_TRANSITION:')) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'INVALID_TRANSITION',
          message: 'Invalid status transition',
        },
      })
    }
    if (error.message === 'ASSIGNMENT_NOT_FOUND') {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'ASSIGNMENT_NOT_FOUND',
          message: 'Assignment not found',
        },
      })
    }
    if (error.message === 'ASSIGNMENT_IS_TERMINAL') {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'ASSIGNMENT_IS_TERMINAL',
          message: 'Assignment is in terminal state and cannot be modified',
        },
      })
    }
    throw error
  }
}

export async function reassignAssignmentHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const body = reassignSchema.parse(request.body)
  const userId = (request as any).user.userId
  
  try {
    const assignment = await reassignAssignment(id, body.driverId, body.unitId, userId)
    return reply.send({
      success: true,
      data: assignment,
    })
  } catch (error: any) {
    const errorMap: Record<string, { code: string; message: string; status: number }> = {
      'ASSIGNMENT_NOT_FOUND': { code: 'ASSIGNMENT_NOT_FOUND', message: 'Assignment not found', status: 404 },
      'DRIVER_NOT_AVAILABLE': { code: 'DRIVER_NOT_AVAILABLE', message: 'Driver is not available', status: 400 },
      'UNIT_NOT_AVAILABLE': { code: 'UNIT_NOT_AVAILABLE', message: 'Unit is not available', status: 400 },
    }

    const mapped = errorMap[error.message]
    if (mapped) {
      return reply.status(mapped.status).send({
        success: false,
        error: { code: mapped.code, message: mapped.message },
      })
    }
    throw error
  }
}

export async function delayReport(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const body = reportDelaySchema.parse(request.body)
  const userId = (request as any).user.userId
  
  try {
    const assignment = await reportDelay(id, userId, body.reason)
    return reply.send({
      success: true,
      data: assignment,
    })
  } catch (error: any) {
    if (error.message === 'ASSIGNMENT_NOT_FOUND') {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'ASSIGNMENT_NOT_FOUND',
          message: 'Assignment not found',
        },
      })
    }
    throw error
  }
}

export async function assignmentEvents(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  
  try {
    const events = await getAssignmentEvents(id)
    return reply.send({
      success: true,
      data: events,
    })
  } catch (error: any) {
    if (error.message === 'ASSIGNMENT_NOT_FOUND') {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'ASSIGNMENT_NOT_FOUND',
          message: 'Assignment not found',
        },
      })
    }
    throw error
  }
}

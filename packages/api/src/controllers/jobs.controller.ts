import { FastifyRequest, FastifyReply } from 'fastify'
import { createJob, getJobs, getJob, updateJob, deleteJob, cancelJob, duplicateJob } from '../services/job.service'
import { createJobSchema, updateJobSchema } from '../types/job.types'

export async function listJobs(request: FastifyRequest, reply: FastifyReply) {
  const { status, priority, clientId, search } = request.query as { 
    status?: string
    priority?: string
    clientId?: string
    search?: string 
  }
  
  const jobs = await getJobs({
    status: status as any,
    priority: priority as any,
    clientId,
    search,
  })

  return reply.send({
    success: true,
    data: jobs,
  })
}

export async function showJob(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  
  const job = await getJob(id)
  
  if (!job) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'JOB_NOT_FOUND',
        message: 'Job not found',
      },
    })
  }

  return reply.send({
    success: true,
    data: job,
  })
}

export async function addJob(request: FastifyRequest, reply: FastifyReply) {
  const body = createJobSchema.parse(request.body)
  const userId = (request as any).user.userId
  
  const job = await createJob({
    ...body,
    createdById: userId,
  })
  
  return reply.status(201).send({
    success: true,
    data: job,
  })
}

export async function editJob(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const body = updateJobSchema.parse(request.body)
  
  try {
    const job = await updateJob(id, body)
    return reply.send({
      success: true,
      data: job,
    })
  } catch (error: any) {
    if (error.message === 'JOB_NOT_FOUND') {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job not found',
        },
      })
    }
    if (error.message === 'JOB_CANNOT_BE_MODIFIED') {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'JOB_CANNOT_BE_MODIFIED',
          message: 'Job cannot be modified in current status',
        },
      })
    }
    throw error
  }
}

export async function removeJob(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  
  try {
    await deleteJob(id)
    return reply.send({
      success: true,
      data: { message: 'Job deleted successfully' },
    })
  } catch (error: any) {
    if (error.message === 'JOB_NOT_FOUND') {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job not found',
        },
      })
    }
    if (error.message === 'JOB_IN_PROGRESS') {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'JOB_IN_PROGRESS',
          message: 'Cannot delete job that is in progress',
        },
      })
    }
    throw error
  }
}

export async function cancelJobHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const { reason } = request.body as { reason: string }
  const userId = (request as any).user.userId
  
  try {
    const job = await cancelJob(id, reason, userId)
    return reply.send({
      success: true,
      data: job,
    })
  } catch (error: any) {
    if (error.message === 'JOB_NOT_FOUND') {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job not found',
        },
      })
    }
    if (error.message === 'JOB_CANNOT_BE_CANCELLED') {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'JOB_CANNOT_BE_CANCELLED',
          message: 'Job cannot be cancelled in current status',
        },
      })
    }
    throw error
  }
}

export async function duplicateJobHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const userId = (request as any).user.userId
  
  try {
    const job = await duplicateJob(id, userId)
    return reply.status(201).send({
      success: true,
      data: job,
    })
  } catch (error: any) {
    if (error.message === 'JOB_NOT_FOUND') {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job not found',
        },
      })
    }
    throw error
  }
}

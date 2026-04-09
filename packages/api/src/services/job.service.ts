import { prisma } from '../plugins/prisma'
import { jobRepository, CreateJobData, UpdateJobData, JobFilters } from '../repositories/job.repository'
import { JobStatus, JobPriority } from '@prisma/client'

export async function createJob(data: CreateJobData & { createdById: string }) {
  const jobNumber = await jobRepository.generateJobNumber()
  
  const job = await jobRepository.create({
    ...data,
    jobNumber,
  })

  return jobRepository.findById(job.id)
}

export async function getJobs(filters?: JobFilters) {
  return jobRepository.findMany(filters)
}

export async function getJob(id: string) {
  return jobRepository.findById(id)
}

export async function updateJob(id: string, data: UpdateJobData) {
  const job = await jobRepository.findById(id)
  if (!job) {
    throw new Error('JOB_NOT_FOUND')
  }

  if (job.status !== 'DRAFT' && job.status !== 'PENDING') {
    if (data.pickupLocationId || data.dropoffLocationId || data.clientId) {
      throw new Error('JOB_CANNOT_BE_MODIFIED')
    }
  }

  return jobRepository.update(id, data)
}

export async function deleteJob(id: string) {
  const job = await jobRepository.findById(id)
  if (!job) {
    throw new Error('JOB_NOT_FOUND')
  }

  if (job.status === 'IN_PROGRESS') {
    throw new Error('JOB_IN_PROGRESS')
  }

  return jobRepository.softDelete(id)
}

export async function cancelJob(id: string, reason: string, cancelledById: string) {
  const job = await jobRepository.findById(id)
  if (!job) {
    throw new Error('JOB_NOT_FOUND')
  }

  if (job.status === 'COMPLETED' || job.status === 'CANCELLED') {
    throw new Error('JOB_CANNOT_BE_CANCELLED')
  }

  await prisma.$transaction(async (tx) => {
    await tx.job.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    if (job.assignments.length > 0) {
      await tx.assignment.updateMany({
        where: { jobId: id },
        data: { 
          status: 'CANCELLED',
          cancellationReason: reason,
          cancelledById,
        },
      })
    }
  })

  return jobRepository.findById(id)
}

export async function duplicateJob(id: string, createdById: string) {
  const job = await jobRepository.findById(id)
  if (!job) {
    throw new Error('JOB_NOT_FOUND')
  }

  return createJob({
    clientId: job.clientId,
    contactId: job.contactId ?? undefined,
    pickupLocationId: job.pickupLocationId,
    dropoffLocationId: job.dropoffLocationId,
    pickupAddress: job.pickupAddress ?? undefined,
    dropoffAddress: job.dropoffAddress ?? undefined,
    loadType: job.loadType,
    weightTons: job.weightTons ?? undefined,
    priority: job.priority as JobPriority,
    scheduledDate: new Date(),
    scheduledTime: job.scheduledTime ?? undefined,
    specialInstructions: job.specialInstructions ?? undefined,
    createdById,
  })
}

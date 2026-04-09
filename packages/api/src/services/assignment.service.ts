import { prisma } from '../plugins/prisma'
import { assignmentRepository, CreateAssignmentData, AssignmentFilters } from '../repositories/assignment.repository'
import { AssignmentStatus, EventType } from '@prisma/client'
import { VALID_TRANSITIONS, TERMINAL_STATES } from '@logistics/shared'

export async function createAssignment(data: CreateAssignmentData & { createdById: string }) {
  const job = await prisma.job.findFirst({
    where: { id: data.jobId, deletedAt: null },
  })

  if (!job) {
    throw new Error('JOB_NOT_FOUND')
  }

  const existingAssignments = await prisma.assignment.count({
    where: {
      jobId: data.jobId,
      status: { notIn: ['CANCELLED', 'REASSIGNED', 'REJECTED'] },
    },
  })

  if (existingAssignments > 0) {
    throw new Error('JOB_ALREADY_ASSIGNED')
  }

  const availability = await assignmentRepository.hasActiveAssignment(data.driverId, data.unitId)
  
  if (availability.driver) {
    throw new Error('DRIVER_NOT_AVAILABLE')
  }
  
  if (availability.unit) {
    throw new Error('UNIT_NOT_AVAILABLE')
  }

  const driver = await prisma.driver.findFirst({
    where: { id: data.driverId, deletedAt: null },
  })

  if (!driver) {
    throw new Error('DRIVER_NOT_FOUND')
  }

  if (driver.licenseExpiry < new Date()) {
    throw new Error('DRIVER_LICENSE_EXPIRED')
  }

  const unit = await prisma.unit.findFirst({
    where: { id: data.unitId, deletedAt: null },
  })

  if (!unit) {
    throw new Error('UNIT_NOT_FOUND')
  }

  if (unit.insuranceExpiry < new Date()) {
    throw new Error('UNIT_INSURANCE_EXPIRED')
  }

  const assignment = await assignmentRepository.create(data)

  await prisma.event.create({
    data: {
      assignmentId: assignment.id,
      eventType: 'CREATED',
      actorId: data.createdById,
      timestamp: new Date(),
    },
  })

  await prisma.job.update({
    where: { id: data.jobId },
    data: { status: 'ASSIGNED' },
  })

  return assignmentRepository.findById(assignment.id)
}

export async function getAssignments(filters?: AssignmentFilters) {
  return assignmentRepository.findMany(filters)
}

export async function getAssignment(id: string) {
  return assignmentRepository.findById(id)
}

async function validateTransition(currentStatus: AssignmentStatus, newStatus: AssignmentStatus) {
  const validNext = VALID_TRANSITIONS[currentStatus]
  
  if (!validNext.includes(newStatus)) {
    throw new Error(`INVALID_TRANSITION:${currentStatus}:${newStatus}`)
  }

  if (TERMINAL_STATES.includes(currentStatus)) {
    throw new Error('ASSIGNMENT_IS_TERMINAL')
  }
}

async function addEvent(assignmentId: string, eventType: EventType, actorId: string, notes?: string, metadata?: any) {
  return prisma.event.create({
    data: {
      assignmentId,
      eventType,
      actorId,
      timestamp: new Date(),
      notes,
      metadata,
    },
  })
}

export async function updateAssignmentStatus(
  id: string, 
  status: AssignmentStatus, 
  actorId: string,
  reason?: string
) {
  const assignment = await assignmentRepository.findById(id)
  
  if (!assignment) {
    throw new Error('ASSIGNMENT_NOT_FOUND')
  }

  await validateTransition(assignment.status as AssignmentStatus, status)

  const updateData: any = { status }
  
  if (status === 'REJECTED') {
    updateData.rejectionReason = reason
  } else if (status === 'CANCELLED') {
    updateData.cancellationReason = reason
    updateData.cancelledById = actorId
  }

  await prisma.$transaction(async (tx) => {
    await tx.assignment.update({
      where: { id },
      data: updateData,
    })

    await tx.event.create({
      data: {
        assignmentId: id,
        eventType: status as EventType,
        actorId,
        timestamp: new Date(),
        notes: reason,
      },
    })
  })

  if (status === 'COMPLETED') {
    await prisma.job.update({
      where: { id: assignment.jobId },
      data: { status: 'COMPLETED' },
    })
  } else if (status === 'CANCELLED') {
    const otherAssignments = await prisma.assignment.count({
      where: {
        jobId: assignment.jobId,
        id: { not: id },
        status: { notIn: ['CANCELLED', 'REASSIGNED', 'REJECTED'] },
      },
    })

    if (otherAssignments === 0) {
      await prisma.job.update({
        where: { id: assignment.jobId },
        data: { status: 'PENDING' },
      })
    }
  }

  return assignmentRepository.findById(id)
}

export async function reassignAssignment(
  id: string, 
  newDriverId: string, 
  newUnitId: string,
  actorId: string
) {
  const assignment = await assignmentRepository.findById(id)
  
  if (!assignment) {
    throw new Error('ASSIGNMENT_NOT_FOUND')
  }

  const availability = await assignmentRepository.hasActiveAssignment(newDriverId, newUnitId)
  
  if (availability.driver) {
    throw new Error('DRIVER_NOT_AVAILABLE')
  }
  
  if (availability.unit) {
    throw new Error('UNIT_NOT_AVAILABLE')
  }

  const newAssignment = await prisma.$transaction(async (tx) => {
    await tx.assignment.update({
      where: { id },
      data: { status: 'REASSIGNED' },
    })

    await tx.event.create({
      data: {
        assignmentId: id,
        eventType: 'REASSIGNED',
        actorId,
        timestamp: new Date(),
        metadata: { newDriverId, newUnitId },
      },
    })

    const created = await tx.assignment.create({
      data: {
        jobId: assignment.jobId,
        driverId: newDriverId,
        unitId: newUnitId,
        createdById: actorId,
        reassignedFromId: id,
      },
    })

    await tx.event.create({
      data: {
        assignmentId: created.id,
        eventType: 'CREATED',
        actorId,
        timestamp: new Date(),
        metadata: { reassignedFrom: id },
      },
    })

    return created
  })

  return assignmentRepository.findById(newAssignment.id)
}

export async function reportDelay(id: string, actorId: string, reason: string, metadata?: any) {
  const assignment = await assignmentRepository.findById(id)
  
  if (!assignment) {
    throw new Error('ASSIGNMENT_NOT_FOUND')
  }

  await addEvent(id, 'DELAYED', actorId, reason, metadata)

  return assignmentRepository.findById(id)
}

export async function getAssignmentEvents(id: string) {
  const assignment = await assignmentRepository.findById(id)
  
  if (!assignment) {
    throw new Error('ASSIGNMENT_NOT_FOUND')
  }

  return prisma.event.findMany({
    where: { assignmentId: id },
    orderBy: { timestamp: 'asc' },
  })
}

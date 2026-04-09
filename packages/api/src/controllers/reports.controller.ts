import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../plugins/prisma'

export async function getDashboardStats(request: FastifyRequest, reply: FastifyReply) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [
    activeJobs,
    pendingAssignments,
    completedToday,
    delayedJobs,
    availableDrivers,
    availableUnits,
    onTripDrivers,
    assignedUnits,
  ] = await Promise.all([
    prisma.job.count({
      where: {
        deletedAt: null,
        status: { in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] },
      },
    }),
    prisma.assignment.count({
      where: {
        status: 'PENDING',
      },
    }),
    prisma.assignment.count({
      where: {
        status: 'COMPLETED',
        updatedAt: { gte: today, lt: tomorrow },
      },
    }),
    prisma.event.count({
      where: {
        eventType: 'DELAYED',
        timestamp: { gte: today },
      },
    }),
    prisma.driver.count({
      where: {
        deletedAt: null,
        status: 'AVAILABLE',
      },
    }),
    prisma.unit.count({
      where: {
        deletedAt: null,
        status: 'AVAILABLE',
      },
    }),
    prisma.driver.count({
      where: {
        deletedAt: null,
        status: 'ON_TRIP',
      },
    }),
    prisma.unit.count({
      where: {
        deletedAt: null,
        status: 'ASSIGNED',
      },
    }),
  ])

  const totalDrivers = availableDrivers + onTripDrivers
  const totalUnits = availableUnits + assignedUnits

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const completedLast30Days = await prisma.assignment.count({
    where: {
      status: 'COMPLETED',
      updatedAt: { gte: thirtyDaysAgo },
    },
  })

  const onTimeDeliveries = await prisma.assignment.count({
    where: {
      status: 'COMPLETED',
      updatedAt: { gte: thirtyDaysAgo },
      events: {
        some: {
          eventType: 'DELAYED',
        },
      },
    },
  })

  const onTimeRate = completedLast30Days > 0 
    ? ((completedLast30Days - onTimeDeliveries) / completedLast30Days) * 100 
    : 100

  return reply.send({
    success: true,
    data: {
      jobs: {
        active: activeJobs,
        pendingAssignments,
        completedToday,
        delayed: delayedJobs,
      },
      drivers: {
        available: availableDrivers,
        onTrip: onTripDrivers,
        total: totalDrivers,
      },
      units: {
        available: availableUnits,
        assigned: assignedUnits,
        total: totalUnits,
      },
      performance: {
        onTimeRate: Math.round(onTimeRate * 10) / 10,
        completedLast30Days,
      },
    },
  })
}

export async function getRecentActivity(request: FastifyRequest, reply: FastifyReply) {
  const limit = 20

  const events = await prisma.event.findMany({
    where: {
      eventType: { in: ['ACCEPTED', 'REJECTED', 'DISPATCHED', 'DEPARTED', 'ARRIVED', 'COMPLETED', 'DELAYED', 'CANCELLED'] },
    },
    include: {
      assignment: {
        include: {
          job: {
            include: {
              client: { select: { companyName: true } },
            },
          },
          driver: { select: { firstName: true, lastName: true } },
        },
      },
      actor: { select: { email: true } },
    },
    orderBy: { timestamp: 'desc' },
    take: limit,
  })

  const activity = events.map((event) => ({
    id: event.id,
    type: event.eventType,
    timestamp: event.timestamp,
    jobNumber: event.assignment.job.jobNumber,
    client: event.assignment.job.client.companyName,
    driver: event.assignment.driver 
      ? `${event.assignment.driver.firstName} ${event.assignment.driver.lastName}`
      : 'N/A',
    notes: event.notes,
    actor: event.actor.email,
  }))

  return reply.send({
    success: true,
    data: activity,
  })
}

export async function getDriverPerformance(request: FastifyRequest, reply: FastifyReply) {
  const { startDate, endDate } = request.query as { startDate?: string; endDate?: string }
  
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const end = endDate ? new Date(endDate) : new Date()

  const drivers = await prisma.driver.findMany({
    where: { deletedAt: null },
    include: {
      user: { select: { email: true } },
      assignments: {
        where: {
          createdAt: { gte: start, lte: end },
          status: 'COMPLETED',
        },
        include: {
          events: {
            where: { eventType: 'DELAYED' },
          },
        },
      },
    },
  })

  const performance = drivers.map((driver) => {
    const totalJobs = driver.assignments.length
    const delayedJobs = driver.assignments.filter((a) => a.events.length > 0).length
    const onTimeJobs = totalJobs - delayedJobs
    const onTimeRate = totalJobs > 0 ? (onTimeJobs / totalJobs) * 100 : 0

    return {
      id: driver.id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.user.email,
      totalJobs,
      onTimeJobs,
      delayedJobs,
      onTimeRate: Math.round(onTimeRate * 10) / 10,
      status: driver.status,
    }
  })

  return reply.send({
    success: true,
    data: performance,
    meta: {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    },
  })
}

export async function getUnitUtilization(request: FastifyRequest, reply: FastifyReply) {
  const { startDate, endDate } = request.query as { startDate?: string; endDate?: string }
  
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const end = endDate ? new Date(endDate) : new Date()

  const units = await prisma.unit.findMany({
    where: { deletedAt: null },
    include: {
      assignments: {
        where: {
          createdAt: { gte: start, lte: end },
        },
      },
    },
  })

  const daysInRange = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  
  const utilization = units.map((unit) => {
    const completedAssignments = unit.assignments.filter((a) => a.status === 'COMPLETED').length
    const totalAssignments = unit.assignments.length
    const utilizationRate = daysInRange > 0 ? (totalAssignments / daysInRange) * 100 : 0

    return {
      id: unit.id,
      plateNumber: unit.plateNumber,
      unitType: unit.unitType,
      bodyType: unit.bodyType,
      capacityTons: unit.capacityTons,
      totalAssignments,
      completedAssignments,
      utilizationRate: Math.round(utilizationRate * 10) / 10,
      status: unit.status,
    }
  })

  return reply.send({
    success: true,
    data: utilization,
    meta: {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      daysInRange,
    },
  })
}

export async function getOnTimeDeliveryReport(request: FastifyRequest, reply: FastifyReply) {
  const { startDate, endDate, groupBy } = request.query as { 
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month'
  }
  
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const end = endDate ? new Date(endDate) : new Date()
  const group = groupBy || 'day'

  const assignments = await prisma.assignment.findMany({
    where: {
      status: 'COMPLETED',
      updatedAt: { gte: start, lte: end },
    },
    include: {
      events: {
        where: { eventType: 'DELAYED' },
      },
    },
    orderBy: { updatedAt: 'asc' },
  })

  const grouped: Record<string, { total: number; onTime: number; delayed: number }> = {}

  assignments.forEach((assignment) => {
    const date = new Date(assignment.updatedAt!)
    let key: string

    if (group === 'day') {
      key = date.toISOString().split('T')[0]
    } else if (group === 'week') {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      key = weekStart.toISOString().split('T')[0]
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }

    if (!grouped[key]) {
      grouped[key] = { total: 0, onTime: 0, delayed: 0 }
    }

    grouped[key].total++
    if (assignment.events.length > 0) {
      grouped[key].delayed++
    } else {
      grouped[key].onTime++
    }
  })

  const report = Object.entries(grouped).map(([date, data]) => ({
    date,
    total: data.total,
    onTime: data.onTime,
    delayed: data.delayed,
    onTimeRate: data.total > 0 ? Math.round((data.onTime / data.total) * 1000) / 10 : 100,
  }))

  return reply.send({
    success: true,
    data: report,
    meta: {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      groupBy: group,
    },
  })
}

export async function getDelayAnalysis(request: FastifyRequest, reply: FastifyReply) {
  const { startDate, endDate } = request.query as { startDate?: string; endDate?: string }
  
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const end = endDate ? new Date(endDate) : new Date()

  const delayEvents = await prisma.event.findMany({
    where: {
      eventType: 'DELAYED',
      timestamp: { gte: start, lte: end },
    },
    include: {
      assignment: {
        include: {
          job: {
            include: {
              client: { select: { companyName: true } },
            },
          },
          driver: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { timestamp: 'desc' },
  })

  const byReason: Record<string, number> = {}
  const byDriver: Record<string, { name: string; count: number }> = {}
  const byClient: Record<string, { name: string; count: number }> = {}

  delayEvents.forEach((event) => {
    const reason = event.notes || 'Unspecified'
    byReason[reason] = (byReason[reason] || 0) + 1

    if (event.assignment.driver) {
      const driverName = `${event.assignment.driver.firstName} ${event.assignment.driver.lastName}`
      if (!byDriver[event.assignment.driverId]) {
        byDriver[event.assignment.driverId] = { name: driverName, count: 0 }
      }
      byDriver[event.assignment.driverId].count++
    }

    const clientName = event.assignment.job.client.companyName
    if (!byClient[event.assignment.job.clientId]) {
      byClient[event.assignment.job.clientId] = { name: clientName, count: 0 }
    }
    byClient[event.assignment.job.clientId].count++
  })

  const recentDelays = delayEvents.slice(0, 20).map((event) => ({
    id: event.id,
    timestamp: event.timestamp,
    jobNumber: event.assignment.job.jobNumber,
    client: event.assignment.job.client.companyName,
    driver: event.assignment.driver 
      ? `${event.assignment.driver.firstName} ${event.assignment.driver.lastName}`
      : 'N/A',
    reason: event.notes || 'Unspecified',
  }))

  return reply.send({
    success: true,
    data: {
      totalDelays: delayEvents.length,
      byReason: Object.entries(byReason)
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count),
      byDriver: Object.values(byDriver).sort((a, b) => b.count - a.count),
      byClient: Object.values(byClient).sort((a, b) => b.count - a.count),
      recentDelays,
    },
    meta: {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    },
  })
}

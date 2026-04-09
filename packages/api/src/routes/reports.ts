import { FastifyPluginAsync } from 'fastify'
import {
  getDashboardStats,
  getRecentActivity,
  getDriverPerformance,
  getUnitUtilization,
  getOnTimeDeliveryReport,
  getDelayAnalysis,
} from '../controllers/reports.controller'
import { authenticate, requireRoles } from '../middlewares/auth.middleware'

const reportRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/stats', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, getDashboardStats)

  fastify.get('/recent-activity', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, getRecentActivity)

  fastify.get('/driver-performance', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, getDriverPerformance)

  fastify.get('/unit-utilization', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, getUnitUtilization)

  fastify.get('/on-time-delivery', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, getOnTimeDeliveryReport)

  fastify.get('/delay-analysis', {
    preHandler: [authenticate, requireRoles('ADMIN', 'DISPATCH')],
  }, getDelayAnalysis)
}

export default reportRoutes

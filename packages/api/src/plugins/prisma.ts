import { FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

const prismaClient = new PrismaClient()

const prismaPlugin: FastifyPluginAsync = fp(async (fastify) => {
  await prismaClient.$connect()
  fastify.decorate('prisma', prismaClient)
  fastify.addHook('onClose', async () => {
    await prismaClient.$disconnect()
  })
})

export { prismaPlugin }

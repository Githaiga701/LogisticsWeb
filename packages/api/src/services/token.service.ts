import { FastifyRequest } from 'fastify'
import { v4 as uuidv4 } from 'uuid'
import { config } from '../config'

const REFRESH_PREFIX = 'refresh:'
const BLACKLIST_PREFIX = 'blacklist:'

export class TokenService {
  constructor(private readonly redis: typeof import('ioredis').default.prototype) {}

  async generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = uuidv4()
    const key = `${REFRESH_PREFIX}${refreshToken}`
    const expirySeconds = this.parseExpiry(config.REFRESH_TOKEN_EXPIRY)
    
    await this.redis.setex(key, expirySeconds, userId)
    
    return refreshToken
  }

  async validateRefreshToken(refreshToken: string): Promise<string | null> {
    const key = `${REFRESH_PREFIX}${refreshToken}`
    const userId = await this.redis.get(key)
    
    if (!userId) {
      return null
    }

    const blacklisted = await this.redis.get(`${BLACKLIST_PREFIX}${refreshToken}`)
    if (blacklisted) {
      return null
    }

    return userId
  }

  async invalidateRefreshToken(refreshToken: string): Promise<void> {
    const key = `${REFRESH_PREFIX}${refreshToken}`
    await this.redis.del(key)
    await this.redis.setex(`${BLACKLIST_PREFIX}${refreshToken}`, 86400 * 7, '1')
  }

  async invalidateAllUserTokens(userId: string): Promise<void> {
    const pattern = `${REFRESH_PREFIX}*`
    const keys = await this.redis.keys(pattern)
    
    for (const key of keys) {
      const storedUserId = await this.redis.get(key)
      if (storedUserId === userId) {
        const token = key.replace(REFRESH_PREFIX, '')
        await this.invalidateRefreshToken(token)
      }
    }
  }

  private parseExpiry(expiry: string): number {
    const unit = expiry.slice(-1)
    const value = parseInt(expiry.slice(0, -1))
    
    switch (unit) {
      case 's': return value
      case 'm': return value * 60
      case 'h': return value * 3600
      case 'd': return value * 86400
      default: return 604800
    }
  }
}

export function createTokenService(redis: typeof import('ioredis').default.prototype) {
  return new TokenService(redis)
}

declare module 'fastify' {
  interface FastifyInstance {
    tokenService: TokenService
  }
}

import { v4 as uuidv4 } from 'uuid'
import { redis } from './db'

const REFRESH_PREFIX = 'refresh:'
const BLACKLIST_PREFIX = 'blacklist:'

export async function generateRefreshToken(userId: string): Promise<string> {
  const refreshToken = uuidv4()
  const key = `${REFRESH_PREFIX}${refreshToken}`
  const expirySeconds = 7 * 24 * 60 * 60 // 7 days
  
  if (redis) {
    await redis.setex(key, expirySeconds, userId)
  }
  
  return refreshToken
}

export async function validateRefreshToken(refreshToken: string): Promise<string | null> {
  if (!redis) return null
  
  const key = `${REFRESH_PREFIX}${refreshToken}`
  const userId = await redis.get(key)
  
  if (!userId) {
    return null
  }

  const blacklisted = await redis.get(`${BLACKLIST_PREFIX}${refreshToken}`)
  if (blacklisted) {
    return null
  }

  return userId
}

export async function invalidateRefreshToken(refreshToken: string): Promise<void> {
  if (!redis) return
  
  const key = `${REFRESH_PREFIX}${refreshToken}`
  await redis.del(key)
  await redis.setex(`${BLACKLIST_PREFIX}${refreshToken}`, 86400 * 7, '1')
}

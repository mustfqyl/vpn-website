import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const blacklistToken = async (token: string, expiresIn: number) => {
  try {
    await redis.set(`blacklist:${token}`, '1', { ex: expiresIn })
  } catch (error) {
    console.error('Failed to blacklist token in Redis:', error)
  }
}

export const isTokenBlacklisted = async (token: string) => {
  try {
    const result = await redis.get(`blacklist:${token}`)
    return !!result
  } catch (error) {
    console.error('Failed to check token blacklist in Redis:', error)
    return false
  }
}

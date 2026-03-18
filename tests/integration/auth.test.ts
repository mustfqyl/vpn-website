/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateToken, verifyToken } from '@/lib/auth'
import { isTokenBlacklisted, blacklistToken } from '@/lib/redis'
vi.mock('@/lib/redis', () => ({
  isTokenBlacklisted: vi.fn(),
  blacklistToken: vi.fn()
}))

describe('Auth Integration Tests', () => {
  const payload = { userId: '1', role: 'TRIAL' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should generate and verify a valid token', async () => {
    vi.mocked(isTokenBlacklisted).mockResolvedValue(false)
    const token = await generateToken(payload)
    const verifiedPayload = await verifyToken(token)
    expect(verifiedPayload).toMatchObject(payload)
  })

  it('should reject a blacklisted token', async () => {
    vi.mocked(isTokenBlacklisted).mockResolvedValue(true)
    const token = await generateToken(payload)
    const verifiedPayload = await verifyToken(token)
    expect(verifiedPayload).toBeNull()
  })

  it('should reject an invalid token', async () => {
    const verifiedPayload = await verifyToken('invalid-token')
    expect(verifiedPayload).toBeNull()
  })
})

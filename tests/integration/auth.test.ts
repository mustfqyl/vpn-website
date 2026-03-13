import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as registerRoute } from '@/app/api/auth/register/route'
import { POST as loginRoute } from '@/app/api/auth/login/route'
import { prisma } from '@/lib/prisma'
import { vpnProvider } from '@/lib/vpn/factory'
import * as auth from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import * as headers from 'next/headers'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        vpnUser: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
        },
        usersGroupsAssociation: {
            findMany: vi.fn(),
        },
        $transaction: vi.fn(),
    }
}))

vi.mock('@/lib/vpn/factory', () => ({
    vpnProvider: {
        createUser: vi.fn(),
        getUser: vi.fn(),
        deleteUser: vi.fn(),
        listUsers: vi.fn(),
    }
}))

vi.mock('@/lib/rate-limit', () => ({
    checkRateLimit: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
    generateToken: vi.fn(),
    verifyToken: vi.fn(),
}))

vi.mock('next/headers', () => ({
    cookies: vi.fn(),
}))

describe('Auth API Routes', () => {

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(checkRateLimit).mockResolvedValue(true)
        const mockCookies = {
            set: vi.fn(),
            get: vi.fn(),
            delete: vi.fn(),
        }
        vi.mocked(headers.cookies).mockResolvedValue(mockCookies as any)
    })

    describe('POST /api/auth/register', () => {

        it('should return 503 if VPN provisioning fails during registration', async () => {
            vi.mocked(vpnProvider.createUser).mockRejectedValue(new Error('VPN API Down'))

            const req = new Request('http://localhost:3000/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ plan: 'Trial' })
            })

            const res = await registerRoute(req)
            const json = await res.json()

            expect(res.status).toBe(503)
            expect(json.error).toContain('Failed to create VPN account')
        })

        it('should successfully register a new user and provision VPN access', async () => {
            vi.mocked(vpnProvider.createUser).mockResolvedValue({
                id: 123,
                username: 'ABC-123',
                subscriptionUrl: 'https://vpn.example.com/sub'
            } as any)

            vi.mocked(auth.generateToken).mockResolvedValue('fake_token')

            const req = new Request('http://localhost:3000/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ plan: 'Trial' })
            })

            const res = await registerRoute(req)
            const json = await res.json()

            expect(res.status).toBe(201)
            expect(json.user.authCode).toBeDefined()
            expect(json.user.vpnSubUrl).toBe('https://vpn.example.com/sub')

            // Ensure VPN provider was called
            expect(vpnProvider.createUser).toHaveBeenCalled()
        })
    })

    describe('POST /api/auth/login', () => {

        it('should return 401 for invalid credentials', async () => {
            vi.mocked(prisma.vpnUser.findUnique).mockResolvedValue(null)

            const req = new Request('http://localhost:3000/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ authCode: 'INVALID-CODE' })
            })

            const res = await loginRoute(req)
            const json = await res.json()

            expect(res.status).toBe(401)
            expect(json.error).toBe('Invalid access code')
        })

        it('should successfully log in user and set cookie', async () => {
            const mockUser = { 
                id: BigInt(1), 
                username: 'TEST-CODE', 
                status: 'active', 
                createdAt: new Date() 
            }
            vi.mocked(prisma.vpnUser.findUnique).mockResolvedValue(mockUser as any)
            vi.mocked(prisma.usersGroupsAssociation.findMany).mockResolvedValue([
                { group: { name: 'Trial' } }
            ] as any)
            vi.mocked(auth.generateToken).mockResolvedValue('fake_token')

            const req = new Request('http://localhost:3000/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ authCode: 'TEST-CODE' })
            })

            const res = await loginRoute(req)
            const json = await res.json()

            expect(res.status).toBe(200)
            expect(json.user.authCode).toBe('TEST-CODE')
            expect(headers.cookies).toHaveBeenCalled()
        })
    })
})

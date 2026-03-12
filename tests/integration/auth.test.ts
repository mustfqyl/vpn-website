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
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
        },
        $transaction: vi.fn(),
        subscription: {
            create: vi.fn(),
        },
        usedEmail: {
            findUnique: vi.fn(),
            create: vi.fn(),
        }
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
    hashPassword: vi.fn(),
    generateToken: vi.fn(),
    comparePassword: vi.fn(),
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

        it('should return 400 if user already exists', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '1', email: 'test@example.com' } as any)

            const req = new Request('http://localhost:3000/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com', password: 'Password1!' })
            })

            const res = await registerRoute(req)
            const json = await res.json()

            expect(res.status).toBe(400)
            expect(json.error).toBe('User already exists')
        })

        it('should successfully register a new user and provision VPN access', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
            vi.mocked(auth.hashPassword).mockResolvedValue('hashedPw')
            vi.mocked(vpnProvider.createUser).mockResolvedValue({
                username: 'pg_user',
                subscriptionUrl: 'https://vpn.example.com/sub'
            } as any)

            // Mock the transaction
            vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
                // Return a mock user
                return { id: 'user123', email: 'new@example.com', role: 'user', vpnUserId: 'pg_user', vpnSubUrl: 'https://vpn.example.com/sub' } as any
            })

            vi.mocked(auth.generateToken).mockResolvedValue('fake_token')

            const req = new Request('http://localhost:3000/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email: 'new@example.com', password: 'Password1!' })
            })

            const res = await registerRoute(req)
            const json = await res.json()

            expect(res.status).toBe(201)
            expect(json.user.email).toBe('new@example.com')
            expect(json.user.vpnUserId).toBe('pg_user')

            // Ensure VPN provider was called
            expect(vpnProvider.createUser).toHaveBeenCalledWith('new@example.com', expect.any(Object))
        })

        it('should return 503 if VPN provisioning fails during registration', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
            vi.mocked(vpnProvider.createUser).mockRejectedValue(new Error('VPN API Down'))

            const req = new Request('http://localhost:3000/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email: 'new@example.com', password: 'Password1!' })
            })

            const res = await registerRoute(req)
            const json = await res.json()

            // VPN provisoning failure stops registration early
            expect(res.status).toBe(503)
            expect(json.error).toContain('Failed to provision Trial VPN service')
            expect(prisma.$transaction).not.toHaveBeenCalled()
        })
    })

    describe('POST /api/auth/login', () => {

        it('should return 401 for invalid credentials', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

            const req = new Request('http://localhost:3000/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email: 'fake@example.com', password: 'Password1!' })
            })

            const res = await loginRoute(req)
            const json = await res.json()

            expect(res.status).toBe(401)
            expect(json.error).toBe('Invalid credentials')
        })

        it('should successfully log in user and set cookie', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '1', email: 'test@example.com', password: 'hashed', vpnUserId: 'pg123' } as any)
            vi.mocked(auth.comparePassword).mockResolvedValue(true)
            vi.mocked(auth.generateToken).mockResolvedValue('fake_token')
            vi.mocked(vpnProvider.getUser).mockResolvedValue({ username: 'pg123', status: 'active' } as any)
            vi.mocked(vpnProvider.listUsers).mockResolvedValue([])

            const req = new Request('http://localhost:3000/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com', password: 'Password1!' })
            })

            const res = await loginRoute(req)
            const json = await res.json()

            expect(res.status).toBe(200)
            expect(json.user.email).toBe('test@example.com')
            expect(headers.cookies).toHaveBeenCalled()
        })
    })
})

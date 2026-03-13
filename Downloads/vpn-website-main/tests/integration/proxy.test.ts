import { describe, it, expect, vi, beforeEach } from 'vitest'
import { proxy } from '@/proxy'
import { NextRequest } from 'next/server'
import * as jose from 'jose'

vi.mock('jose', () => ({
    jwtVerify: vi.fn(),
}))

describe('Middleware (Proxy) Route Protection', () => {

    const originalEnv = process.env

    beforeEach(() => {
        vi.clearAllMocks()
        process.env = { ...originalEnv, JWT_SECRET: 'test_secret' }
    })

    const mockRequest = (pathname: string, hasToken: boolean = false) => {
        const req = new NextRequest(new URL(`http://localhost:3000${pathname}`))
        if (hasToken) {
            req.cookies.set('token', 'valid_token')
        }
        return req
    }

    it('should allow access to unprotected routes (e.g., /)', async () => {
        const req = mockRequest('/')
        const res = await proxy(req)

        // When NextResponse.next() is called, res.status is 200 by default in the mock
        expect(res.status).toBe(200)
    })

    it('should redirect unauthorized users from protected pages to login', async () => {
        const req = mockRequest('/dashboard')
        const res = await proxy(req)

        // 307 Temporary Redirect by default in Next.js redirect
        expect(res.status).toBe(307)
        expect(res.headers.get('location')).toContain('/auth/login')
    })

    it('should return 401 JSON for unauthorized API requests', async () => {
        const req = mockRequest('/api/user/me')
        const res = await proxy(req)

        expect(res.status).toBe(401)
        const json = await res.json()
        expect(json.error).toBe('Unauthorized')
    })

    it('should allow access to protected routes with a valid token', async () => {
        vi.mocked(jose.jwtVerify).mockResolvedValue({ payload: { userId: '1' } } as any)

        const req = mockRequest('/dashboard', true)
        const res = await proxy(req)

        expect(res.status).toBe(200)
    })

    it('should reject invalid tokens and redirect on pages', async () => {
        vi.mocked(jose.jwtVerify).mockRejectedValue(new Error('Invalid token'))

        const req = mockRequest('/billing', true)
        const res = await proxy(req)

        expect(res.status).toBe(307)
        expect(res.headers.get('location')).toContain('/auth/login')
    })
})

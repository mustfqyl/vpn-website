import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || ''
const secretKey = new TextEncoder().encode(JWT_SECRET)

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/billing', '/profile', '/contact']
// API routes that require authentication
const protectedApiPrefix = '/api/'
const publicApiRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/logout', '/api/auth/generate-code', '/api/health', '/api/server/status', '/api/nodes']

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 1. Check if the route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isApiRoute = pathname.startsWith(protectedApiPrefix)

    // Check if the current route matches any public route exactly, or starts with a public dynamic route
    const isPublicApi = publicApiRoutes.some(route => pathname === route) ||
        pathname.startsWith('/api/server/live-speed/') ||
        pathname.startsWith('/api/server/uptime/') ||
        pathname.startsWith('/api/cron/');

    if (isProtectedRoute || (isApiRoute && !isPublicApi)) {
        const token = request.cookies.get('token')?.value

        if (!token) {
            if (isApiRoute) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        try {
            // Verify JWT
            await jwtVerify(token, secretKey)
            return NextResponse.next()
        } catch (error) {
            console.error('Middleware JWT verification failed:', error)
            const response = isApiRoute
                ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
                : NextResponse.redirect(new URL('/auth/login', request.url))

            // Clear invalid token
            response.cookies.delete('token')
            return response
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
}

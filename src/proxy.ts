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
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    const { pathname } = request.nextUrl

    // CSP Policy
    // strict-dynamic: Güvenilir scriptlerin (nonce'lu) yüklediği diğer scriptlere izin verir (Vercel, Analytics vb.)
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https: http:;
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: https:;
        font-src 'self' data:;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        connect-src 'self' wss: https://api.nowpayments.io https://*.nowpayments.io https://vitals.vercel-insights.com;
        upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy-Report-Only', cspHeader);

    // 1. Check if the route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isApiRoute = pathname.startsWith(protectedApiPrefix)

    // Check if the current route matches any public route exactly, or starts with a public dynamic route
    const isPublicApi = publicApiRoutes.some(route => pathname === route) ||
        pathname.startsWith('/api/server/live-speed/') ||
        pathname.startsWith('/api/server/uptime/') ||
        pathname.startsWith('/api/cron/');

    let response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    if (isProtectedRoute || (isApiRoute && !isPublicApi)) {
        const token = request.cookies.get('token')?.value

        if (!token) {
            if (isApiRoute) {
                response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            } else {
                response = NextResponse.redirect(new URL('/auth/login', request.url))
            }
        } else {
            try {
                // Verify JWT
                await jwtVerify(token, secretKey)
            } catch (error) {
                console.error('Proxy JWT verification failed:', error)
                response = isApiRoute
                    ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
                    : NextResponse.redirect(new URL('/auth/login', request.url))

                // Clear invalid token
                response.cookies.delete('token')
            }
        }
    }

    // Apply CSP headers to the response
    response.headers.set('Content-Security-Policy-Report-Only', cspHeader);

    return response
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
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
}

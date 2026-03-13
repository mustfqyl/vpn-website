import { NextResponse } from 'next/server'
import { vpnProvider } from '@/lib/vpn/factory'
import { verifyToken } from '@/lib/auth'
import { handleApiError, AppError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get('token')

        if (!token) {
            return new NextResponse('Token required', { status: 400 })
        }

        // In the new architecture, we identify the user by their token.
        const payload = await verifyToken(token)
        if (!payload || !payload.authCode) {
             return new NextResponse('Unauthorized', { status: 401 })
        }

        const authCode = payload.authCode as string;

        // Fetch subscription content from VPN Provider API
        const pgUser = await vpnProvider.getUser(authCode);
        if (!pgUser || !pgUser.subscriptionUrl) {
            return new NextResponse('Subscription not found', { status: 404 })
        }

        const content = await vpnProvider.getSubscriptionContent(pgUser.subscriptionUrl)
        
        return new NextResponse(content, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-store',
            }
        })
    } catch (error) {
        return handleApiError(error, 'Sub Proxy');
    }
}

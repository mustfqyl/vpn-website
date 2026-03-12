import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { verifyToken } from '@/lib/auth';
import { vpnProvider } from '@/lib/vpn/factory';
import { getPlanConfig } from '@/lib/vpn/plans';
import { handleApiError, AppError } from '@/lib/api-error';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/checkout
 * Mock payment checkout
 */
export async function POST(request: Request) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1] || 
                     request.headers.get('cookie')?.split('token=')[1]?.split(';')[0];

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !payload.authCode || !payload.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const authCode = payload.authCode as string;
        const userId = payload.userId as string;

        const body = await request.json();
        const { amount, days } = body;

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        if (!days || ![30, 90, 180, 360].includes(days)) {
            return NextResponse.json({ error: 'Invalid days parameter' }, { status: 400 });
        }

        const orderId = `SUB-${userId}-${Date.now()}`;
        
        logger.info({ userId, amount, days, orderId }, 'Processing mock checkout');

        // Note: Payment record creation skipped because Payment model is deprecated in new PasarGuard-only architecture
        // and we should only read from PasarGuard tables or use their API.
        
        const planConfig = getPlanConfig('Premium');

        // MOCK PAYMENT PROCESS
        console.log(`Processing mock payment for user ${authCode} for plan Premium`);

        // Update user in PasarGuard via API
        try {
            // First get current user to see if they have an active expiry
            const currentUser = await vpnProvider.getUser(authCode);
            const nowUnix = Math.floor(Date.now() / 1000);
            
            // PasarGuard/Marzban expire is usually in seconds. 
            // Our mapUser converts it to milliseconds for the VpnUser object.
            let currentExpireUnix = currentUser?.expiresAtUnix 
                ? Math.floor(currentUser.expiresAtUnix / 1000) 
                : nowUnix;

            // If current expire is in the past, start from now
            if (currentExpireUnix < nowUnix) {
                currentExpireUnix = nowUnix;
            }

            const newExpireUnix = currentExpireUnix + (days * 86400);

            const success = await vpnProvider.updateUser(authCode, {
                group: 'Premium',
                expire: newExpireUnix,
                dataLimit: planConfig.dataLimitGB ? planConfig.dataLimitGB * 1024 * 1024 * 1024 : null,
                status: 'active',
                note: 'Premium Upgrade'
            });

            if (!success) {
                throw new Error('VPN provider failed to update user');
            }

            logger.info({ userId, authCode, orderId, newExpireUnix }, 'Premium activation successful via PasarGuard API');
        } catch (error) {
            logger.error({ error, userId, authCode, orderId }, 'PasarGuard premium activation failed');
            throw new AppError('Payment processed but failed to activate VPN service. Contact support.', 503);
        }

        return NextResponse.json({
            status: 'confirmed',
            orderId,
            message: 'Mock payment successful'
        });

    } catch (error) {
        return handleApiError(error, 'Checkout');
    }
}


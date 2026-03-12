import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { vpnProvider } from '@/lib/vpn/factory';
import { verifyToken } from '@/lib/auth';
import { getPlanConfig } from '@/lib/vpn/plans';
import { handleApiError, AppError } from '@/lib/api-error';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/trial
 * Activates a free trial subscription for a user
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

        // Fetch user from PasarGuard API to check status
        const pgUser = await vpnProvider.getUser(authCode);
        if (!pgUser) {
            throw new AppError('User not found in PasarGuard', 404);
        }

        // Check if already premium
        if (pgUser.group === 'Premium') {
            throw new AppError('You are already on a Premium plan', 400);
        }

        const planConfig = getPlanConfig('Trial');

        // Update user in PasarGuard via API
        try {
            await vpnProvider.updateUser(authCode, {
                group: 'Trial',
                expire: Math.floor(Date.now() / 1000) + (planConfig.expireDays * 86400),
                dataLimit: planConfig.dataLimitGB ? planConfig.dataLimitGB * 1024 * 1024 * 1024 : null,
                status: 'active',
                note: 'Trial'
            });

            logger.info({ userId, authCode }, 'Trial activated successfully via PasarGuard API');
        } catch (error) {
            logger.error({ error, userId, authCode }, 'PasarGuard trial activation failed');
            throw new AppError('Failed to activate trial service. Please try again later.', 503);
        }

        return NextResponse.json({
            success: true,
            message: 'Trial activated successfully',
        });

    } catch (error) {
        return handleApiError(error, 'Trial Activation');
    }
}


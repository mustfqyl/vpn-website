import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { vpnProvider } from '@/lib/vpn/factory'
import { getAuthenticatedUser } from '@/lib/authHelper'
import { handleApiError, AppError } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { VpnSyncService } from '@/lib/vpn/sync'
import { getPlanConfig } from '@/lib/vpn/plans'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const authUser = await getAuthenticatedUser()
        if (!authUser) {
            throw new AppError('Unauthorized', 401)
        }

        const { userId } = authUser

        let bigIntId: bigint;
        try {
            bigIntId = BigInt(userId);
        } catch (e) {
            logger.warn({ userId }, 'Invalid user ID format in token. Clearing session.');
            const cookieStore = await cookies();
            cookieStore.delete('token');
            throw new AppError('Invalid session. Please login again.', 401);
        }

        // Fetch user from PasarGuard DB via Prisma
        const user = await (prisma as any).vpnUser.findUnique({
            where: { id: bigIntId },
            include: {
                groups: {
                    include: {
                        group: true
                    }
                }
            }
        });

        if (!user) {
            const cookieStore = await cookies();
            cookieStore.delete('token');
            throw new AppError('User not found in PasarGuard', 404)
        }

        // Fetch live status from PasarGuard API for most up-to-date info
        const pgUser = await vpnProvider.getUser(user.username);

        // Determine role based on groups
        const groupNames = user.groups.map((ug: any) => ug.group.name.toLowerCase());
        const role = groupNames.includes('premium') ? 'PREMIUM' : (groupNames.includes('root') ? 'ADMIN' : 'TRIAL');

        // Usage and Status logic
        let usedGB = Number(user.usedTraffic) / (1024 ** 3);
        let limitGB = user.dataLimit ? Number(user.dataLimit) / (1024 ** 3) : null;
        let remoteStatus = user.status;
        let subscriptionUrl = pgUser?.subscriptionUrl || '';

        if (pgUser) {
            usedGB = pgUser.usedTrafficBytes / (1024 ** 3);
            limitGB = pgUser.dataLimitBytes ? pgUser.dataLimitBytes / (1024 ** 3) : null;
            remoteStatus = pgUser.status;
            subscriptionUrl = pgUser.subscriptionUrl;
        }

        // --- SAFEGUARD: Explicitly remove data limit for Premium/Admin roles ---
        if (role === 'PREMIUM' || role === 'ADMIN') {
            limitGB = null;
        }

        return NextResponse.json({
            id: user.id.toString(),
            authCode: user.username,
            role: role,
            status: remoteStatus,
            plan: groupNames.includes('premium') ? 'Premium' : (groupNames.includes('trial') ? 'Trial' : 'None'),
            expiresAt: user.expire?.toISOString() || null,
            usage: {
                usedGB: Math.round(usedGB * 100) / 100,
                limitGB: limitGB ? Math.round(limitGB * 100) / 100 : null,
            },
            onlineCount: remoteStatus === 'active' ? 1 : 0,
            subscriptionUrl,
            devices: [], // Devices model removed
            createdAt: user.createdAt.toISOString(),
        })

    } catch (error) {
        return handleApiError(error, 'User Me GET');
    }
}

/**
 * Account Deletion
 */
export async function DELETE() {
    try {
        const authUser = await getAuthenticatedUser();
        if (!authUser) throw new AppError('Unauthorized', 401);

        const user = await (prisma as any).vpnUser.findUnique({
            where: { id: BigInt(authUser.userId) }
        });

        if (!user) throw new AppError('User not found', 404);

        // 1. Delete from VPN Provider API
        logger.info({ userId: user.id.toString(), username: user.username }, 'Account deletion: Attempting to delete via PasarGuard API');
        const vpnDeleted = await vpnProvider.deleteUser(user.username);
        
        if (!vpnDeleted) {
            logger.error({ userId: user.id.toString(), username: user.username }, 'Account deletion: API deletion failed.');
            throw new AppError('Failed to delete VPN user. Please try again later.', 500);
        }
        
        // Note: PasarGuard might automatically remove the user from its DB if we used the API.
        // If not, we don't have DELETE permissions on the DB normally in this setup according to instructions
        // ("Prisma artık hiç tablo OLUŞTURMUYOR. Sadece PasarGuard'ın mevcut tablolarını OKUYOR.")
        // But the user said "Prisma query ile okunacak" and "PasarGuard API'ye POST isteği at... başka hiçbir yere yazma"
        // So we skip DB DELETE here as we should only use API for mutations.

        // Clear session cookie
        const cookieStore = await cookies()
        cookieStore.delete('token')

        logger.info({ userId: user.id.toString() }, 'Account deletion: Process completed successfully');
        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error, 'User Me DELETE');
    }
}


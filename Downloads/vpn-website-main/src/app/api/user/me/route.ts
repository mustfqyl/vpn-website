import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { vpnProvider } from '@/lib/vpn/factory'
import { getAuthenticatedUser } from '@/lib/authHelper'
import { handleApiError, AppError } from '@/lib/api-error'
import { logger } from '@/lib/logger'

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
        } catch {
            logger.warn({ userId }, 'Invalid user ID format in token. Clearing session.');
            const cookieStore = await cookies();
            cookieStore.delete('token');
            throw new AppError('Invalid session. Please login again.', 401);
        }

        // Fetch user from oculve DB via Prisma
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            throw new AppError('User not found in oculve', 404)
        }

        // Fetch live status from oculve API for most up-to-date info
        const pgUser = await vpnProvider.getUser(user.username);

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

        // Determine role and plan (dynamic from Pasarguard)
        const role = 'USER';
        
        // Priority: 
        // 1. Group Name from PG (planName)
        // 2. Note from PG
        // 3. Default Template Name
        let plan = pgUser?.planName || pgUser?.note || 'Premium';
        
        if (plan === 'Web Kayıt' || !pgUser?.planName) {
            const defaultName = await vpnProvider.getDefaultTemplateName();
            if (defaultName && (!pgUser?.planName)) {
                 // only override if we don't have a specific group name
                 plan = defaultName;
            }
        }
        
        // If we have a valid group name, it wins
        if (pgUser?.planName) {
            plan = pgUser.planName;
        }

        return NextResponse.json({
            id: user.id.toString(),
            authCode: user.username,
            role: role,
            status: remoteStatus,
            plan: plan,
            expiresAt: user.expire?.toISOString() || null,
            usage: {
                usedGB: Math.round(usedGB * 100) / 100,
                limitGB: limitGB ? Math.round(limitGB * 100) / 100 : null,
            },
            onlineCount: remoteStatus === 'active' ? 1 : 0,
            subscriptionUrl,
            devices: [], // Devices model removed
            createdAt: user.createdAt.toISOString(),
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = await (prisma as any).vpnUser.findUnique({
            where: { id: BigInt(authUser.userId) }
        });

        if (!user) throw new AppError('User not found', 404);

        // 1. Delete from VPN Provider API
        logger.info({ userId: user.id.toString(), username: user.username }, 'Account deletion: Attempting to delete via oculve API');
        const vpnDeleted = await vpnProvider.deleteUser(user.username);
        
        if (!vpnDeleted) {
            logger.error({ userId: user.id.toString(), username: user.username }, 'Account deletion: API deletion failed.');
            throw new AppError('Failed to delete VPN user. Please try again later.', 500);
        }
        
        // Note: oculve might automatically remove the user from its DB if we used the API.
        // If not, we don't have DELETE permissions on the DB normally in this setup according to instructions
        // ("Prisma artık hiç tablo OLUŞTURMUYOR. Sadece Oculve'ın mevcut tablolarını OKUYOR.")
        // But the user said "Prisma query ile okunacak" and "Oculve API'ye POST isteği at... başka hiçbir yere yazma"
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


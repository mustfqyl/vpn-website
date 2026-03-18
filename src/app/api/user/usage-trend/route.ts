import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authHelper';
import { vpnProvider } from '@/lib/vpn/factory';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const authUser = await getAuthenticatedUser();
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // We need the username, which we can get from the db or if authUser has it.
        // authUser returns { userId, role }. We must fetch the username from DB.
        const user = await (prisma as any).vpnUser.findUnique({
             where: { id: BigInt(authUser.userId) }
        });

        if (!user) {
             return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const usageData = await vpnProvider.getUserUsage(user.username);

        return NextResponse.json({ usages: usageData });

    } catch (error: any) {
        logger.error({ error: error.message }, 'Failed to fetch usage trend');
        return NextResponse.json({ error: 'Failed to fetch usage trend' }, { status: 500 });
    }
}

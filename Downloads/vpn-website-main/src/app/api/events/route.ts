import { NextRequest } from 'next/server';
import { vpnProvider } from '@/lib/vpn/factory';
import { getAuthenticatedUser } from '@/lib/authHelper';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { VpnSyncService } from '@/lib/vpn/sync';



export const dynamic = 'force-dynamic';

/**
 * Server-Sent Events (SSE) endpoint for real-time dashboard updates.
 * Using TransformStream for better stability in Next.js environment.
 */
export async function GET(req: NextRequest) {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    let isClosed = false;

    const push = async (data: any, event = 'message') => {
        if (isClosed || req.signal.aborted) return;
        try {
            await writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch (err) {
            isClosed = true;
        }
    };

    const fetchData = async () => {
        if (isClosed || req.signal.aborted) return;
        try {
            const stats = await vpnProvider.getStats();
            
            const user = await (prisma as any).vpnUser.findUnique({
                where: { id: BigInt(authUser.userId) },
                include: {
                    groups: {
                        include: {
                            group: true
                        }
                    }
                }
            });

            if (!user) {
                isClosed = true;
                return;
            }

            const pgUser = await vpnProvider.getUser(user.username);
            
            const role = 'USER';

            let userData = {
                status: user.status,
                usage: {
                    usedGB: Number(user.usedTraffic) / (1024 ** 3),
                    limitGB: user.dataLimit ? Number(user.dataLimit) / (1024 ** 3) : null
                },
                subscriptionUrl: pgUser?.subscriptionUrl || '',
                expiresAt: user.expire?.toISOString() || null,
                onlineCount: user.status === 'active' ? 1 : 0,
                devices: []
            };

            if (pgUser) {
                userData = {
                    ...userData,
                    status: pgUser.status,
                    usage: {
                        usedGB: pgUser.usedTrafficBytes / (1024 ** 3),
                        limitGB: pgUser.dataLimitBytes ? pgUser.dataLimitBytes / (1024 ** 3) : null
                    },
                    subscriptionUrl: pgUser.subscriptionUrl,
                    onlineCount: pgUser.status === 'active' ? 1 : 0,
                };
            }


            await push({ stats, user: userData }, 'update');
        } catch (err) {
            if (!isClosed) logger.error({ err }, 'SSE data collection failed');
        }
    };

    fetchData();

    // Heartbeat & Updates
    const heartbeatInterval = setInterval(() => {
        if (isClosed || req.signal.aborted) {
            clearInterval(heartbeatInterval);
            return;
        }
        push({}, 'heartbeat').catch(() => { });
    }, 15000);

    const updateInterval = setInterval(fetchData, 15000);

    const cleanup = () => {
        if (isClosed) return;
        isClosed = true;
        clearInterval(heartbeatInterval);
        clearInterval(updateInterval);
        writer.close().catch(() => { });
    };

    req.signal.onabort = cleanup;

    return new Response(readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
}


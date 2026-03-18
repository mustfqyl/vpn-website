import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
    const health = {
        status: 'UP',
        timestamp: new Date().toISOString(),
        services: {
            database: 'UNKNOWN',
            vpn_panel: 'UNKNOWN',
            system: 'UP'
        },
        memory: process.memoryUsage(),
        uptime: process.uptime()
    };

    try {
        // Test Database
        await prisma.$queryRaw`SELECT 1`;
        health.services.database = 'UP';
    } catch (err) {
        logger.error({ err }, 'Health Check: Database DOWN');
        health.services.database = 'DOWN';
    }

    try {
        // Test VPN Panel
        const vpnRes = await fetch(`${process.env.VPN_PANEL_API_URL}/api/docs`, { method: 'HEAD', cache: 'no-store' });
        health.services.vpn_panel = vpnRes.ok ? 'UP' : 'DOWN';
    } catch (err) {
        logger.error({ err }, 'Health Check: VPN Panel UNREACHABLE');
        health.services.vpn_panel = 'DOWN';
    }

    health.status = (health.services.database === 'UP' && health.services.vpn_panel === 'UP') ? 'UP' : 'DEGRADED';

    return NextResponse.json(health, {
        status: health.status === 'UP' ? 200 : 503
    });
}

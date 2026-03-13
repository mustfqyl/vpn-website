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
        health.status = 'DEGRADED';
    }

    return NextResponse.json(health, {
        status: health.status === 'UP' ? 200 : 503
    });
}

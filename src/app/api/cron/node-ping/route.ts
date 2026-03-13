import { NextResponse } from 'next/server'
import { NodeUptimeService } from '@/lib/node-uptime'
import { handleApiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
    try {
        // Protect with secret key
        if (CRON_SECRET) {
            const authHeader = request.headers.get('authorization');
            if (authHeader !== `Bearer ${CRON_SECRET}`) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const result = await NodeUptimeService.checkAndLog();

        return NextResponse.json(result);
    } catch (error) {
        return handleApiError(error, 'Cron Node Ping');
    }
}

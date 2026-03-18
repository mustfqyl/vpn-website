import { NextResponse } from 'next/server'
import { vpnProvider } from '@/lib/vpn/factory'
import { handleApiError } from '@/lib/api-error'
import { redis } from '@/lib/redis'

export const dynamic = 'force-dynamic'

const CACHE_KEY = 'server_status_cache'
const CACHE_TTL = 30 // seconds

export async function GET() {
    try {
        // Try to get from cache first
        if (redis) {
            try {
                const cachedData = await redis.get(CACHE_KEY);
                if (cachedData) {
                    return NextResponse.json(cachedData);
                }
            } catch (cacheError) {
                console.error('Redis cache get error:', cacheError);
            }
        }

        const stats = await vpnProvider.getStats();

        const protocols = ['VLESS'];
        const responseData = {
            nodes: stats.nodes,
            protocols,
            system: stats.system
        };

        // Store in cache
        if (redis) {
            try {
                await redis.set(CACHE_KEY, JSON.stringify(responseData), { ex: CACHE_TTL });
            } catch (cacheError) {
                console.error('Redis cache set error:', cacheError);
            }
        }

        return NextResponse.json(responseData);
    } catch (error) {
        return handleApiError(error, 'Server Status');
    }
}

import { Redis } from '@upstash/redis';

// Fallback memory map for local dev without UPSTASH_REDIS_REST_URL
export const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

// Periodic cleanup for Memory Fallback to prevent memory leaks
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 1000 * 60 * 60; // 1 hour

function cleanupMemoryMap() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;

    for (const [ip, data] of rateLimitMap.entries()) {
        // If the entry is older than 2 hours, we can safely remove it 
        // (assuming no windowMs is that large in this app)
        if (now - data.timestamp > 1000 * 60 * 120) {
            rateLimitMap.delete(ip);
        }
    }
    lastCleanup = now;
}

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

/**
 * Basic Rate Limiter.
 * Uses Redis if available, falls back to memory for local development.
 */
export async function checkRateLimit(ip: string, maxRequests: number, windowMs: number): Promise<boolean> {
    const now = Date.now();

    if (redis) {
        const key = `rate-limit:${ip}`;
        try {
            // Using a pipeline or multi-exec is overkill for this simple case,
            // but we ensure expiry is always set if not exists.
            const current = await redis.incr(key);
            if (current === 1) {
                await redis.pexpire(key, windowMs);
            }
            return current <= maxRequests;
        } catch (error) {
            console.error('Redis rate limit error, falling back to memory:', error);
        }
    } else {
        // Run cleanup periodically during memory fallback
        cleanupMemoryMap();
    }

    // Memory Fallback
    const data = rateLimitMap.get(ip) || { count: 0, timestamp: now };

    if (now - data.timestamp > windowMs) {
        data.count = 1;
        data.timestamp = now;
    } else {
        data.count++;
    }

    rateLimitMap.set(ip, data);
    return data.count <= maxRequests;
}


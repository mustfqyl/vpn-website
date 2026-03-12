import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { checkRateLimit, rateLimitMap } from './rate-limit';

describe('Rate Limiter (Memory Fallback)', () => {
    beforeEach(() => {
        rateLimitMap.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should allow requests below the limit', async () => {
        const ip = '192.168.1.1';
        const allowed1 = await checkRateLimit(ip, 2, 1000);
        expect(allowed1).toBe(true);

        const allowed2 = await checkRateLimit(ip, 2, 1000);
        expect(allowed2).toBe(true);
    });

    it('should block requests above the limit', async () => {
        const ip = '192.168.1.2';
        await checkRateLimit(ip, 1, 1000); // 1st request (allowed)
        const allowed = await checkRateLimit(ip, 1, 1000); // 2nd request (blocked)
        expect(allowed).toBe(false);
    });

    it('should reset limit after window time passes', async () => {
        const ip = '192.168.1.3';
        await checkRateLimit(ip, 1, 1000); // 1st request (allowed)

        // Fast-forward time
        vi.advanceTimersByTime(1001);

        const allowed = await checkRateLimit(ip, 1, 1000); // 1st request in new window
        expect(allowed).toBe(true);
    });
});

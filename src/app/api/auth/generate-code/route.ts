import { NextResponse } from 'next/server';
import { generateUniqueAuthCode } from '@/lib/auth.utils';
import { handleApiError } from '@/lib/api-error';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/network';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Publicly accessible but rate limited to prevent exhaustion/abuse
        const ip = getClientIp(request);
        // Lowered limit to 10 per minute as requested
        if (!(await checkRateLimit(ip, 10, 60 * 1000))) {
            return NextResponse.json({ error: 'Too many requests. Please wait before trying again.' }, { status: 429 });
        }

        const code = await generateUniqueAuthCode();
        return NextResponse.json({ code });
    } catch (error) {
        return handleApiError(error, 'Generate Auth Code');
    }
}

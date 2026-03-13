import { NextResponse } from 'next/server';
import { generateUniqueAuthCode } from '@/lib/auth.utils';
import { handleApiError } from '@/lib/api-error';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Publicly accessible but rate limited to prevent exhaustion/abuse
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        if (!(await checkRateLimit(ip, 5, 60 * 1000))) {
            return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
        }

        const code = await generateUniqueAuthCode();
        return NextResponse.json({ code });
    } catch (error) {
        return handleApiError(error, 'Generate Auth Code');
    }
}

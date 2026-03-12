import { NextResponse } from 'next/server';
import { generateUniqueAuthCode } from '@/lib/auth.utils';
import { handleApiError } from '@/lib/api-error';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const code = await generateUniqueAuthCode();
        return NextResponse.json({ code });
    } catch (error) {
        return handleApiError(error, 'Generate Auth Code');
    }
}

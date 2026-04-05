import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { handleApiError, AppError } from '@/lib/api-error'
import { getClientIp } from '@/lib/network'

export const dynamic = 'force-dynamic'

const loginSchema = z.object({
    authCode: z.string(),
})

export async function POST(request: Request) {
    try {
        const ip = getClientIp(request);
        if (!(await checkRateLimit(ip, 5, 60 * 1000))) {
            return NextResponse.json({ error: 'Login attempt limit reached. Please wait and try again.' }, { status: 429 });
        }

        const body = await request.json()
        const { authCode } = loginSchema.parse(body)

        const user = await prisma.vpnUser.findUnique({
            where: { username: authCode },
        })

        if (!user) {
            throw new AppError('Invalid access code', 401)
        }

        // Check if user is disabled
        if (user.status === 'disabled') {
            throw new AppError('Account is disabled', 403)
        }

        // Determine role (simplified to universal USER role)
        const role = 'USER';

        const token = await generateToken({
            userId: user.id.toString(), // BigInt to string
            authCode: user.username,
            role: role,
        })

        const cookieStore = await cookies()
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        })
        // Non-httpOnly indicator cookie so client-side JS can detect auth instantly
        cookieStore.set('auth_status', '1', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        })

        return NextResponse.json({
            user: {
                id: user.id.toString(),
                authCode: user.username,
                role: role,
                createdAt: user.createdAt,
            }
        }, { status: 200 })
    } catch (error) {
        return handleApiError(error, 'Auth Login');
    }
}

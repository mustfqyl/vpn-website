import { NextResponse } from 'next/server'
import { generateToken } from '@/lib/auth'
import { vpnProvider } from '@/lib/vpn/factory'
import { getPlanConfig } from '@/lib/vpn/plans'
import { checkRateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { handleApiError, AppError } from '@/lib/api-error'
import { prisma } from '@/lib/prisma'
import { getClientIp } from '@/lib/network'
import { generateRawCode } from '@/lib/auth.utils'

export const dynamic = 'force-dynamic'

const registerSchema = z.object({
    plan: z.enum(['Trial', 'Premium']).default('Trial'),
    authCode: z.string().optional()
})

export async function POST(request: Request) {
    try {
        const ip = getClientIp(request);
        if (!(await checkRateLimit(ip, 5, 60 * 1000))) {
            throw new AppError('Registration attempt limit reached. Please wait and try again.', 429);
        }

        const body = await request.json()
        const { plan, authCode: providedAuthCode } = registerSchema.parse(body)

        // 1. Use provided code from frontend, or generate 4x4 alphanumerical code as fallback
        const authCode = providedAuthCode || await generateRawCode();

        const planName = plan;
        const planConfig = getPlanConfig(planName);

        // 2. Create user in PasarGuard via API
        let pgUser;
        try {
            pgUser = await vpnProvider.createUser(authCode, {
                expireDays: planConfig.expireDays,
                dataLimitGB: planConfig.dataLimitGB,
                group: plan === 'Trial' ? "Trial" : "Premium",
                planName: planName,
                status: plan === 'Trial' ? 'active' : 'on_hold'
            })
        } catch (error: any) {
            console.error('PasarGuard user creation failed:', error);
            throw new AppError('Failed to create VPN account. Please try again.', 503);
        }

        // Determine role
        const role = plan === 'Trial' ? 'TRIAL' : 'PREMIUM';

        // 3. Wait a moment for PasarGuard to sync to its DB and fetch numeric ID via Prisma
        // If the API provided the ID (it should), we use it. Otherwise we fetch from DB.
        let userId = pgUser.id ? pgUser.id.toString() : null;
        
        if (!userId) {
            // Fallback: Fetch from Prisma using username
            const dbUser = await (prisma as any).vpnUser.findUnique({
                where: { username: authCode }
            });
            if (dbUser) {
                userId = dbUser.id.toString();
            } else {
                // Final fallback: use username but we've handled BigInt conversion gracefully in /me
                userId = pgUser.username;
            }
        }

        const token = await generateToken({ 
            userId: userId, 
            authCode: authCode, 
            role: role 
        })

        // Set cookie
        const cookieStore = await cookies()
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        })

        return NextResponse.json({
            user: {
                id: userId,
                authCode: authCode,
                role: role,
                vpnSubUrl: pgUser.subscriptionUrl,
            }
        }, { status: 201 })
    } catch (error) {
        return handleApiError(error, 'Auth Register');
    }
}

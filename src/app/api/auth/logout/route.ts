import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { handleApiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

export async function POST() {
    try {
        const cookieStore = await cookies()
        cookieStore.set('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/',
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return handleApiError(error, 'Auth Logout')
    }
}


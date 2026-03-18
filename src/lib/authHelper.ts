import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export interface AuthUser {
    userId: string
    authCode: string
    role: string
}

/**
 * Extract and verify the authenticated user from the request cookie.
 * Returns the decoded user payload or null if not authenticated.
 */
export async function getAuthenticatedUser(): Promise<AuthUser | null> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) return null

        const decoded = await verifyToken(token)

        if (!decoded || !decoded.userId) return null

        return {
            userId: decoded.userId as string,
            authCode: decoded.authCode as string,
            role: decoded.role as string,
        }
    } catch {
        return null
    }
}

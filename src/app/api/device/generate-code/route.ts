import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { getAuthenticatedUser } from '@/lib/authHelper'

export const dynamic = 'force-dynamic'

export async function POST() {
    try {
        const authUser = await getAuthenticatedUser()
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { userId } = authUser

        // Generate a 6-character alphanumeric code
        const code = crypto.randomBytes(3).toString('hex').toUpperCase()

        // Hash it deterministically for lookup in device/login
        const hashedCode = crypto.createHash('sha256').update(code).digest('hex')

        const expiresAt = new Date()
        expiresAt.setMinutes(expiresAt.getMinutes() + 15) // Code valid for 15 minutes

        // Invalidate old unused codes for this user to prevent clutter
        await prisma.loginCode.updateMany({
            where: { userId, used: false },
            data: { used: true }
        })

        await prisma.loginCode.create({
            data: {
                userId,
                code: hashedCode,
                expiresAt,
            }
        })

        // Return the RAW code to the user (they will look at this and type it into the device)
        return NextResponse.json({ code, expiresAt: expiresAt.toISOString() })

    } catch (error) {
        console.error("Generate device code error:", error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

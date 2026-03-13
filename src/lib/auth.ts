import { SignJWT, jwtVerify } from 'jose'
import { isTokenBlacklisted } from './redis'

const JWT_SECRET = process.env.JWT_SECRET;
const encoder = new TextEncoder();
const secretKey = encoder.encode(JWT_SECRET || 'fallback-secret') as Uint8Array;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required')
}

export const generateToken = async (payload: Record<string, unknown>, expiresIn: string = '1d') => {
    let builder = new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiresIn)

    if (payload.userId) {
        builder = builder.setSubject(payload.userId as string)
    }

    return await builder.sign(secretKey)
}

export const verifyToken = async (token: string) => {
    try {
        // Check blacklist first
        if (await isTokenBlacklisted(token)) {
            return null
        }
        const { payload } = await jwtVerify(token, secretKey)
        return payload
    } catch {
        return null
    }
}

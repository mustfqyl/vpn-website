import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required')
}

const secretKey = new TextEncoder().encode(JWT_SECRET)



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
        const { payload } = await jwtVerify(token, secretKey)
        return payload
    } catch {
        return null
    }
}

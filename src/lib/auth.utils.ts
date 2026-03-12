import { prisma } from './prisma';

/**
 * Generates a random character from A-Z and 1-9.
 */
function getRandomChar(): string {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'; // O and 0 removed for clarity, though user said large letters and 1-9
    // Wait, user said "Sadece büyük harfler ve 1-9 a kadar olan rakamlar" (Only large letters and 1-9 digits)
    const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
    return allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
}

/**
 * Generates a 4x4 code (XXXX-XXXX-XXXX-XXXX).
 */
export function generateRawCode(): string {
    const parts = [];
    for (let p = 0; p < 4; p++) {
        let part = '';
        for (let i = 0; i < 4; i++) {
            part += getRandomChar();
        }
        parts.push(part);
    }
    return parts.join('-');
}

/**
 * Generates a unique 2x4 code by checking against the VPN users.
 */
export async function generateUniqueAuthCode(): Promise<string> {
    let code = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
        code = generateRawCode();
        const existingUser = await prisma.vpnUser.findUnique({
            where: { username: code }
        });

        if (!existingUser) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        throw new Error('Failed to generate a unique code after multiple attempts');
    }

    return code;
}

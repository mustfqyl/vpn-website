import { prisma } from './prisma';
import { issueCode } from "./codeEngine";

/**
 * Generates a 3x4 code (XXXX-XXXX-XXXX).
 */
export async function generateRawCode(): Promise<string> {
    return await issueCode();
}


export async function generateUniqueAuthCode(): Promise<string> {
    let code = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
        code = await generateRawCode();
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

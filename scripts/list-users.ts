import { prisma } from '../src/lib/prisma';

async function listUsers() {
    try {
        const users = await prisma.user.findMany({ take: 5 });
        console.log('Available users:', JSON.stringify(users.map((u: any) => ({ email: u.email, id: u.id, expiresAt: u.expiresAt, vpnUserId: u.vpnUserId })), null, 2));
    } catch (e) {
        console.error('Database connection failed', e);
    }
}

listUsers()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

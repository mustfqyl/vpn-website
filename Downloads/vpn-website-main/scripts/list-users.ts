import { prisma } from '../src/lib/prisma';

async function listUsers() {
    try {
        const users = await prisma.vpnUser.findMany({ take: 5 });
        console.log('Available users:', JSON.stringify(users.map((u: any) => ({ username: u.username, id: u.id.toString(), status: u.status })), null, 2));
    } catch (e) {
        console.error('Database connection failed', e);
    }
}

listUsers()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const count = await prisma.nodeUptimeLog.count();
        console.log('Total uptime logs:', count);

        const latest = await prisma.nodeUptimeLog.findMany({
            take: 3,
            orderBy: { checkedAt: 'desc' }
        });
        console.log('Latest logs:', JSON.stringify(latest, null, 2));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();

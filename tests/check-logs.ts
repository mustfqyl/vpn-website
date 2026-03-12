import { prisma } from '@/lib/prisma';

async function test() {
    console.log('Checking NodeUptimeLog entries...');
    const logs = await prisma.nodeUptimeLog.findMany({
        take: 5,
        orderBy: { checkedAt: 'desc' }
    });
    console.log('Recent logs:', JSON.stringify(logs, null, 2));

    if (logs.length > 0) {
        console.log('SUCCESS: Node uptime logs found!');
    } else {
        console.log('WARNING: No node uptime logs found yet.');
    }
}

test().catch(console.error).finally(() => prisma.$disconnect());

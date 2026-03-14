import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLogs() {
    console.log('--- Log Analysis ---');
    
    // Find the node name from the screenshot (Denmark)
    const nodeName = "Denmark";
    
    const logs = await prisma.nodeUptimeLog.findMany({
        where: {
            nodeName: {
                contains: nodeName
            },
            checkedAt: {
                gte: new Date(new Date().setHours(0,0,0,0)) // Today
            }
        },
        orderBy: {
            checkedAt: 'asc'
        }
    });

    console.log(`Found ${logs.length} logs for nodes containing "${nodeName}" today.`);
    
    if (logs.length > 0) {
        console.log('Earliest 5 logs of today:');
        logs.slice(0, 5).forEach(l => {
            console.log(`- ${l.nodeName}: ${l.checkedAt.toISOString()} - ${l.status}`);
        });

        console.log('Latest 5 logs of today:');
        logs.slice(-5).forEach(l => {
            console.log(`- ${l.nodeName}: ${l.checkedAt.toISOString()} - ${l.status}`);
        });

        // Distribution by hour
        const hourly: Record<number, number> = {};
        logs.forEach(l => {
            const hour = l.checkedAt.getUTCHours();
            hourly[hour] = (hourly[hour] || 0) + 1;
        });
        console.log('Hourly distribution (UTC):', hourly);
    }

    const lastHour = new Date(Date.now() - 3600000);
    const recentLogs = await prisma.nodeUptimeLog.count({
        where: { checkedAt: { gte: lastHour } }
    });
    console.log(`Total logs in the last hour (all nodes): ${recentLogs}`);
}

checkLogs()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

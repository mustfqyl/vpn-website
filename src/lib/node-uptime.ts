import { prisma } from './prisma';
import { vpnProvider } from './vpn/factory';
import { logger } from './logger';

export class NodeUptimeService {
    /**
     * Checks all nodes status and logs their uptime/ping.
     * Also cleans up old logs.
     */
    static async checkAndLog() {
        try {
            const stats = await vpnProvider.getStats();
            const nodes = stats.nodes;
            const checkedAt = new Date();
            let loggedCount = 0;
            const logPromises = nodes.map(async (node) => {
                try {
                    await prisma.nodeUptimeLog.create({
                        data: {
                            nodeName: node.name,
                            status: node.status,
                            ping: node.ping ?? -1,
                            checkedAt
                        }
                    });
                    return true;
                } catch (err) {
                    logger.error({ err, nodeName: node.name }, 'Failed to log node uptime');
                    return false;
                }
            });

            const results = await Promise.allSettled(logPromises);
            loggedCount = results.filter(r => r.status === 'fulfilled' && r.value).length;

            // Cleanup: remove logs older than 35 days to prevent table bloat
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 35);
            const deleted = await prisma.nodeUptimeLog.deleteMany({
                where: { checkedAt: { lt: cutoff } }
            });

            logger.info({ loggedCount, deletedOld: deleted.count, total: nodes.length }, 'Node uptime check and log completed');

            return {
                success: true,
                logged: loggedCount,
                deletedOld: deleted.count,
                checkedAt: checkedAt.toISOString()
            };
        } catch (error) {
            logger.error({ error }, 'Critical failure in NodeUptimeService.checkAndLog');
            throw error;
        }
    }
}

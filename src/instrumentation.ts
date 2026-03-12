export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { NodeUptimeService } = await import('@/lib/node-uptime');
        const { logger } = await import('@/lib/logger');

        logger.info('Initializing Node Uptime background worker...');

        // Initial check on startup
        NodeUptimeService.checkAndLog().catch(err => {
            logger.error({ err }, 'Initial node uptime check failed');
        });

        // Run every 60 seconds
        setInterval(() => {
            NodeUptimeService.checkAndLog().catch(err => {
                logger.error({ err }, 'Periodic node uptime check failed');
            });
        }, 60000);
    }
}





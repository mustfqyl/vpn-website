export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { logger } = await import('@/lib/logger');
        logger.info('oculve Monitoring Active (Native Mode)');
    }
}

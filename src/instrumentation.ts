export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { logger } = await import('@/lib/logger');
        logger.info('Oculve Monitoring Active (Native Mode)');
    }
}





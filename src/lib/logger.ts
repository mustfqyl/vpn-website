/**
 * Structured Logger utility using Pino for Enterprise Readiness
 */
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
    level: isDev ? 'debug' : 'info',
    transport: isDev
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                ignore: 'pid,hostname',
            },
        }
        : undefined, // Let it output raw JSON in production
    formatters: {
        level: (label) => {
            return { level: label };
        },
    },
});

// Extension for Audit Logging
export const audit = (action: string, metadata: Record<string, any>) => {
    logger.info({
        audit: true,
        action,
        ...metadata,
        timestamp: new Date().toISOString()
    }, `AUDIT: ${action}`);
};

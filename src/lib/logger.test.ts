import { expect, test, describe } from 'vitest';
import { logger } from './logger';

describe('Logger Utility', () => {
    test('should have standard logging methods', () => {
        expect(typeof logger.info).toBe('function');
        expect(typeof logger.error).toBe('function');
        expect(typeof logger.warn).toBe('function');
        expect(typeof logger.debug).toBe('function');
    });

    test('should be properly configured with a log level', () => {
        expect(logger.level).toBeDefined();
        expect(['info', 'debug', 'warn', 'error', 'fatal', 'trace']).toContain(logger.level);
    });
});

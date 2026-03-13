import { prisma } from '@/lib/prisma';
import { vpnProvider } from './factory';
import { logger } from '@/lib/logger';

/**
 * VpnSyncService
 * In the new architecture where we read directly from PasarGuard's DB,
 * many of the traditional "sync" tasks are redundant.
 */
export class VpnSyncService {
    /**
     * Reconciles a user's status.
     * In this architecture, we primarily trust the PasarGuard DB and API.
     */
    static async reconcileUser(userId: string) {
        // Since we are reading directly from PasarGuard's DB, there's no "sync" needed
        // between local and remote DB roles. We just return the latest from API if for some reason
        // we need an extra check.
        try {
            const user = await prisma.vpnUser.findUnique({
                where: { id: BigInt(userId) }
            });
            if (!user) return null;
            
            return await vpnProvider.getUser(user.username);
        } catch (error) {
            logger.error({ error, userId }, 'Error in reconcileUser stub');
            return null;
        }
    }

    /**
     * Background sync task.
     */
    static async syncAll(force = false) {
        // Orphan cleanup is handled by PasarGuard itself or manually via its panel.
        // We'll keep this as a stub to avoid breaking existing callers.
        logger.info({ force }, 'VpnSyncService.syncAll called (Stub)');
    }
}


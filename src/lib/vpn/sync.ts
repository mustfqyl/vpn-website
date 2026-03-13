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
     * Reconciles all users between the portal database and the VPN panel.
     */
    static async syncAll(force = false) {
        logger.info({ force }, 'VpnSyncService.syncAll starting');
        try {
            const panelUsers = await vpnProvider.listUsers();
            logger.info({ count: panelUsers.length }, 'Fetched users from VPN panel');

            for (const panelUser of panelUsers) {
                // Update or Create in local DB
                await prisma.vpnUser.upsert({
                    where: { username: panelUser.username },
                    update: {
                        status: panelUser.status,
                        usedTraffic: BigInt(panelUser.usedTrafficBytes),
                        dataLimit: panelUser.dataLimitBytes ? BigInt(panelUser.dataLimitBytes) : null,
                        expire: panelUser.expiresAtUnix ? new Date(panelUser.expiresAtUnix) : null,
                    },
                    create: {
                        id: BigInt(panelUser.id ?? 0),
                        username: panelUser.username,
                        status: panelUser.status,
                        usedTraffic: BigInt(panelUser.usedTrafficBytes),
                        dataLimit: panelUser.dataLimitBytes ? BigInt(panelUser.dataLimitBytes) : null,
                        expire: panelUser.expiresAtUnix ? new Date(panelUser.expiresAtUnix) : null,
                        createdAt: new Date()
                    }
                });
            }
            logger.info('VpnSyncService.syncAll completed successfully');
        } catch (error) {
            logger.error({ error }, 'Error in VpnSyncService.syncAll');
        }
    }
}


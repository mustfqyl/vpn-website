import { VpnUser, VpnCreateOptions, VpnUpdatePayload, VpnProviderStats } from './types';

export interface IVpnProvider {
    /**
     * Unique identifier for this provider (e.g. 'oculve', 'marzban')
     */
    readonly id: string;

    /**
     * Create a new user in the VPN panel
     */
    createUser(username: string, options?: VpnCreateOptions): Promise<VpnUser>;

    /**
     * Get user details from the VPN panel
     */
    getUser(username: string): Promise<VpnUser | null>;

    /**
     * Update an existing user
     */
    updateUser(username: string, data: VpnUpdatePayload): Promise<boolean>;

    /**
     * Delete a user from the VPN panel
     */
    deleteUser(username: string): Promise<boolean>;

    /**
     * List all users in the VPN panel
     */
    listUsers(): Promise<VpnUser[]>;

    /**
     * Get raw subscription content (links)
     */
    getSubscriptionContent(subUrl: string): Promise<string>;

    /**
     * Get system-wide stats and node status
     */
    getStats(): Promise<VpnProviderStats>;

    /**
     * Reset user traffic stats
     */
    resetTraffic(username: string): Promise<boolean>;

    /**
     * Get user historical usage data
     */
    getUserUsage(username: string): Promise<any>;
}

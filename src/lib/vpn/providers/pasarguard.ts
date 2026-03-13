import { IVpnProvider } from '../provider';
import { VpnUser, VpnCreateOptions, VpnUpdatePayload, VpnProviderStats } from '../types';
import { getPlanConfig } from '../plans';
import { logger } from '@/lib/logger';
import net from 'net';

export class PasarGuardProvider implements IVpnProvider {
    readonly id = 'pasarguard';
    private baseUrl: string;
    private username: string;
    private password: string;
    private cachedToken: string | null = null;
    private tokenExpiry: number = 0;

    constructor() {
        this.baseUrl = (process.env.VPN_PANEL_API_URL || '').replace(/\/$/, '');
        this.username = process.env.VPN_PANEL_ADMIN_USERNAME || '';
        this.password = process.env.VPN_PANEL_ADMIN_PASSWORD || '';

        if (!this.baseUrl || !this.username || !this.password) {
            logger.warn('VPN Panel configuration is incomplete. VPN_PANEL_API_URL, VPN_PANEL_ADMIN_USERNAME, and VPN_PANEL_ADMIN_PASSWORD are required for full functionality.');
        }
    }

    private async getAdminToken(): Promise<string> {
        if (!this.baseUrl || !this.username || !this.password) {
            throw new Error('VPN Provider not configured. Check your environment variables.');
        }

        if (this.cachedToken && Date.now() < this.tokenExpiry) {
            return this.cachedToken;
        }

        const formData = new URLSearchParams();
        formData.append('username', this.username);
        formData.append('password', this.password);
        formData.append('grant_type', 'password');

        const res = await fetch(`${this.baseUrl}/api/admin/token`, {
            method: 'POST',
            cache: 'no-store',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        });

        if (!res.ok) {
            throw new Error(`PasarGuard login failed (${res.status})`);
        }

        const data = await res.json();
        this.cachedToken = data.access_token;
        this.tokenExpiry = Date.now() + 12 * 3600 * 1000;
        return this.cachedToken!;
    }

    private async apiRequest(path: string, options: RequestInit = {}): Promise<Response> {
        const token = await this.getAdminToken();
        try {
            const res = await fetch(`${this.baseUrl}${path}`, {
                ...options,
                cache: 'no-store',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...(options.headers || {})
                }
            });

            if (res.status === 401 && this.cachedToken) {
                this.cachedToken = null;
                this.tokenExpiry = 0;
                return this.apiRequest(path, options);
            }

            return res;
        } catch (error: any) {
            // Rethrow connection-specific errors to be caught by global handler
            if (error.message?.includes('fetch failed') || error.code === 'ECONNREFUSED') {
                throw new Error(`VPN Panel at ${this.baseUrl} is unreachable: ${error.message}`);
            }
            throw error;
        }
    }

    private mapUser(data: any): VpnUser {
        let subUrl = data.subscription_url || data.sub_url || '';
        if (subUrl.startsWith('/sub/')) {
            subUrl = `${this.baseUrl}${subUrl}`;
        }

        // Robust date parsing for Pasarguard 'expire' field
        let expiresAtUnix: number | null = null;
        if (data.expire !== undefined && data.expire !== null && data.expire !== 0) {
            const parsed = new Date(data.expire);
            if (!isNaN(parsed.getTime())) {
                // It's a valid date string or timestamp
                expiresAtUnix = parsed.getTime();
            } else {
                // Possible Unix timestamp as string/number
                const num = Number(data.expire);
                if (!isNaN(num)) {
                    expiresAtUnix = num > 10000000000 ? num : num * 1000;
                }
            }
        }

        return {
            id: data.id,
            username: data.username,
            status: data.status,
            usedTrafficBytes: data.used_traffic,
            dataLimitBytes: data.data_limit === 0 ? null : data.data_limit, // 0 means unlimited in Marzban/PasarGuard
            expiresAtUnix: expiresAtUnix,
            subscriptionUrl: subUrl,
            group: data.groups && data.groups.length > 0 ? data.groups[0].name : undefined,
            createdAt: data.created_at,
            admin: data.admin && data.admin.username ? data.admin.username : data.admin
        };
    }

    async createUser(username: string, options?: VpnCreateOptions): Promise<VpnUser> {
        // Attempt to load full plan config from utility
        const planName = options?.planName || 'DEFAULT';
        const planConfig = getPlanConfig(planName);

        // Define fallback configuration
        const proxySettings: Record<string, any> = {};
        for (const [protocol, config] of Object.entries(planConfig.proxies)) {
            proxySettings[protocol] = { ...config as object };
            if (protocol.toLowerCase() === 'vless' || protocol.toLowerCase() === 'reality') {
                (proxySettings[protocol] as any).flow = 'xtls-rprx-vision';
            }
        }

        const payload: any = {
            username,
            proxy_settings: proxySettings,
            status: options?.status === 'disabled' ? 'on_hold' : (options?.status || 'active'),
        };

        // Add inbounds for panel group assignment (Trial/Premium)
        if (options?.inbounds) {
            payload.inbounds = options.inbounds;
        }

        if (options?.group) {
            const groupId = await this.getOrCreateGroup(options.group);
            if (groupId !== null) {
                payload.group_ids = [groupId];
            }
        }

        if (options?.planName) {
            payload.note = options.planName;
        }

        if (options?.expireDays) {
            if (payload.status === 'on_hold') {
                payload.on_hold_expire_duration = options.expireDays * 86400;
            } else {
                payload.expire = Math.floor(Date.now() / 1000) + (options.expireDays * 86400);
            }
        }

        if (options?.dataLimitGB !== undefined) {
            // In Marzban/PasarGuard API: 0 means unlimited.
            payload.data_limit = (options.dataLimitGB === null || options.dataLimitGB === 0) 
                ? 0 
                : options.dataLimitGB * 1024 * 1024 * 1024;
        } else if (options?.group === 'Premium') {
            // Force unlimited for premium if not explicitly specified
            payload.data_limit = 0;
        }

        const res = await this.apiRequest('/api/user', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorText = await res.text();
            logger.error({ errorText, username }, 'PasarGuard API Error during user creation');

            if (res.status === 409) {
                const existing = await this.getUser(username);
                if (existing) return existing;
            }
            throw new Error(`Failed to create user: ${errorText}`);
        }

        return this.mapUser(await res.json());
    }

    async getUser(username: string): Promise<VpnUser | null> {
        const res = await this.apiRequest(`/api/user/${encodeURIComponent(username)}`);
        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error(`Failed to get user: ${res.status}`);
        }

        return this.mapUser(await res.json());
    }

    async updateUser(username: string, data: VpnUpdatePayload): Promise<boolean> {
        const payload: any = {};
        if (data.status) {
            payload.status = data.status === 'disabled' ? 'on_hold' : data.status;
        }
        if (data.expire !== undefined) payload.expire = data.expire;
        if (data.dataLimit !== undefined) {
            // In Marzban/PasarGuard API: null or 0 means unlimited. 
            // We explicitly send 0 to ensure it's cleared if it was previously set.
            payload.data_limit = data.dataLimit === null ? 0 : data.dataLimit;
        }
        if (data.note) payload.note = data.note;
        if (data.group) {
            const groupId = await this.getOrCreateGroup(data.group);
            if (groupId !== null) {
                payload.group_ids = [groupId];
            }
        }
        if (data.inbounds) payload.inbounds = data.inbounds;

        const res = await this.apiRequest(`/api/user/${encodeURIComponent(username)}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorText = await res.text();
            logger.error({ errorText, username }, 'PasarGuard API Error during user update');
        }

        return res.ok;
    }

    private async getOrCreateGroup(groupName: string): Promise<number | null> {
        try {
            // Check API for existing group matching the name
            const res = await this.apiRequest('/api/groups');
            if (res.ok) {
                const data = await res.json();
                const existing = (data.groups || []).find((g: any) => g.name.toLowerCase() === groupName.toLowerCase());
                if (existing) return existing.id;
            }

            // Group doesn't exist, try to create it automatically
            const inboundsRes = await this.apiRequest('/api/inbounds');
            if (!inboundsRes.ok) return null;

            const inboundsData = await inboundsRes.json();
            const tags = Array.isArray(inboundsData) ? inboundsData : Object.keys(inboundsData);
            const tag = tags.length > 0 ? tags[0] : "VLESS"; // fallback

            const createRes = await this.apiRequest('/api/group', {
                method: 'POST',
                body: JSON.stringify({ name: groupName, inbound_tags: [tag] })
            });

            if (createRes.ok) {
                const newGroup = await createRes.json();
                return newGroup.id;
            }

            return null;
        } catch (e) {
            console.error(`Failed to get or create group ${groupName}`, e);
            return null;
        }
    }

    async deleteUser(username: string): Promise<boolean> {
        const url = `${this.baseUrl}/api/user/${encodeURIComponent(username)}`;
        logger.info({ username, url }, '[PasarGuard] Requesting user deletion');
        
        try {
            const res = await this.apiRequest(`/api/user/${encodeURIComponent(username)}`, {
                method: 'DELETE'
            });

            if (res.ok || res.status === 404) {
                if (res.status === 404) {
                    logger.info({ username }, '[PasarGuard] User already missing from panel (404). Treating as success.');
                } else {
                    logger.info({ username, status: res.status }, '[PasarGuard] Successfully deleted user');
                }
                return true;
            }

            const errText = await res.text();
            logger.error({ username, status: res.status, error: errText }, '[PasarGuard] Deletion failed');
            return false;
        } catch (error: any) {
            logger.error({ username, error: error.message }, '[PasarGuard] Deletion error');
            return false;
        }
    }

    async listUsers(): Promise<VpnUser[]> {
        // Try /api/users first (standard Marzban/PasarGuard)
        let res = await this.apiRequest('/api/users');

        if (!res.ok) {
            // Fallback 1: /api/user
            res = await this.apiRequest('/api/user');
        }

        if (!res.ok) {
            // Fallback 2: Try with pagination params if panel requires it
            res = await this.apiRequest('/api/users?offset=0&limit=1000');
        }

        if (!res.ok) {
            throw new Error(`Failed to list users from VPN panel: ${res.status}`);
        }

        const data = await res.json();
        const userList = Array.isArray(data) ? data : (data.users || []);
        return userList.map((u: any) => this.mapUser(u));
    }

    async getSubscriptionContent(subUrl: string): Promise<string> {
        const res = await fetch(subUrl, {
            headers: { 'User-Agent': 'SecureVPN/1.0' }
        });
        if (!res.ok) throw new Error(`Failed to fetch subscription: ${res.status}`);
        return await res.text();
    }

    async resetTraffic(username: string): Promise<boolean> {
        const res = await this.apiRequest(`/api/user/${encodeURIComponent(username)}/reset`, {
            method: 'POST'
        });

        return res.ok;
    }

    async getStats(): Promise<VpnProviderStats> {
        const [nodesRes, systemRes] = await Promise.all([
            this.apiRequest('/api/nodes'),
            this.apiRequest('/api/system')
        ]);

        let nodes: any[] = [];
        if (nodesRes.ok) {
            const data = await nodesRes.json();
            const nodeList = Array.isArray(data) ? data : (data.nodes || []);

            nodes = await Promise.all(nodeList.map(async (n: any) => {
                let livePing = -1;
                if (n.status === 'connected' && n.address && n.port) {
                    try {

                        livePing = await new Promise<number>((resolve) => {
                            const start = Date.now();
                            const socket = new net.Socket();
                            socket.setTimeout(2500);

                            socket.on('connect', () => {
                                resolve(Date.now() - start);
                                socket.destroy();
                            });
                            socket.on('timeout', () => {
                                resolve(-1);
                                socket.destroy();
                            });
                            socket.on('error', () => {
                                resolve(-1);
                                socket.destroy();
                            });

                            socket.connect(n.port, n.address);
                        });
                    } catch (e) {
                        livePing = -1;
                    }
                }

                return {
                    name: n.name || 'Unknown',
                    address: n.address || '0.0.0.0',
                    port: n.port || 0,
                    status: n.status || 'connected',
                    message: n.message || '',
                    ping: livePing,
                    connectionType: n.connection_type || 'unknown',
                    xrayVersion: n.xray_version || '',
                    nodeVersion: n.node_version || '',
                    uplinkGB: Math.round((n.uplink || 0) / (1024 ** 3) * 100) / 100,
                    downlinkGB: Math.round((n.downlink || 0) / (1024 ** 3) * 100) / 100,
                    uplinkBytes: n.uplink || 0,
                    downlinkBytes: n.downlink || 0,
                };
            }));
        }

        let system = { onlineUsers: 0, activeUsers: 0, totalUsers: 0, cpuUsage: 0, memUsedPercent: 0, incomingBandwidthGB: 0, outgoingBandwidthGB: 0, version: '' };
        if (systemRes.ok) {
            const sysData = await systemRes.json();
            system = {
                onlineUsers: sysData.online_users || 0,
                activeUsers: sysData.active_users || 0,
                totalUsers: sysData.total_user || 0,
                cpuUsage: Math.round((sysData.cpu_usage || 0) * 10) / 10,
                memUsedPercent: sysData.mem_total ? Math.round((sysData.mem_used / sysData.mem_total) * 100) : 0,
                incomingBandwidthGB: Math.round((sysData.incoming_bandwidth || 0) / (1024 ** 3) * 100) / 100,
                outgoingBandwidthGB: Math.round((sysData.outgoing_bandwidth || 0) / (1024 ** 3) * 100) / 100,
                version: sysData.version || ''
            };
        }

        return { nodes, system };
    }
}

export type VpnUserStatus = 'active' | 'disabled' | 'limited' | 'expired' | 'on_hold' | 'inactive';

export interface VpnUser {
    id?: string | number | bigint;
    username: string;
    status: VpnUserStatus;
    usedTrafficBytes: number;
    dataLimitBytes: number | null;
    expiresAtUnix: number | null;
    subscriptionUrl: string;
    group?: string;
    createdAt?: string;
    admin?: string;
}

export interface VpnCreateOptions {
    expireDays?: number;
    dataLimitGB?: number | null;
    group?: string;
    planName?: string;
    status?: VpnUserStatus;
    inbounds?: Record<string, string[]>;
}

export interface VpnUpdatePayload {
    status?: VpnUserStatus;
    expire?: number | null;
    dataLimit?: number | null;
    note?: string;
    group?: string;
    inbounds?: Record<string, string[]>;
}

export interface SystemStats {
    onlineUsers: number;
    activeUsers: number;
    totalUsers: number;
    cpuUsage: number;
    memUsedPercent: number;
    incomingBandwidthGB: number;
    outgoingBandwidthGB: number;
    version: string;
}

export interface ServerNode {
    name: string;
    address: string;
    port: number;
    status: string;
    message: string;
    ping: number;
    connectionType: string;
    xrayVersion: string;
    nodeVersion: string;
    uplinkGB: number;
    downlinkGB: number;
    uplinkBytes?: number;
    downlinkBytes?: number;
}

export interface VpnProviderStats {
    nodes: ServerNode[];
    system: SystemStats;
}

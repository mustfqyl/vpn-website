export interface VpnPlanConfig {
    expireDays: number;
    dataLimitGB: number | null;
    proxies: Record<string, any>;
}

export function getPlanConfig(planName: string): VpnPlanConfig {
    const isPremium = planName.toLowerCase().includes('premium');
    
    // Default trial config (used as fallback)
    const defaultConfig: VpnPlanConfig = {
        expireDays: isPremium ? 30 : 3,
        dataLimitGB: isPremium ? null : 5, // Premium is unlimited by default
        proxies: { "vless": { "flow": "xtls-rprx-vision" } }
    };

    const envKey = `VPN_PLAN_${planName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
    let envVal = process.env[envKey];

    if (!envVal) {
        return defaultConfig;
    }

    // Strip single quotes if they exist (common in .env files)
    if (envVal.startsWith("'") && envVal.endsWith("'")) {
        envVal = envVal.substring(1, envVal.length - 1);
    }

    try {
        const parsed = JSON.parse(envVal);
        return {
            expireDays: parsed.expireDays !== undefined ? Number(parsed.expireDays) : defaultConfig.expireDays,
            dataLimitGB: parsed.dataLimitGB !== undefined ? (parsed.dataLimitGB === null ? null : Number(parsed.dataLimitGB)) : defaultConfig.dataLimitGB,
            proxies: parsed.proxies || defaultConfig.proxies
        };
    } catch (e) {
        console.error(`Failed to parse plan config ${envKey}:`, e);
        return defaultConfig;
    }
}

import { IVpnProvider } from './provider';
import { PasarGuardProvider } from './providers/pasarguard';

export class VpnProviderFactory {
    private static instance: IVpnProvider | null = null;

    static getProvider(): IVpnProvider {
        if (!this.instance) {
            const providerType = process.env.VPN_PROVIDER || 'pasarguard';
            switch (providerType) {
                case 'pasarguard':
                default:
                    this.instance = new PasarGuardProvider();
                    break;
            }
        }
        return this.instance;
    }
}

// Export a singleton instance for convenience
export const vpnProvider = VpnProviderFactory.getProvider();


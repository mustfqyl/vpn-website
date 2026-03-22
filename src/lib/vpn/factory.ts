import { IVpnProvider } from './provider';
import { OculveProvider } from './providers/oculve';

export class VpnProviderFactory {
    private static instance: IVpnProvider | null = null;

    static getProvider(): IVpnProvider {
        if (!this.instance) {
            const providerType = process.env.VPN_PROVIDER || 'oculve';
            switch (providerType) {
                case 'oculve':
                default:
                    this.instance = new OculveProvider();
                    break;
            }
        }
        return this.instance;
    }
}

// Export a singleton instance for convenience
export const vpnProvider = VpnProviderFactory.getProvider();


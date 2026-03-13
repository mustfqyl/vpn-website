import { NextResponse } from 'next/server'
import { vpnProvider } from '@/lib/vpn/factory'
import { handleApiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const stats = await vpnProvider.getStats();

        // Return protocol names for backward compatibility if needed, 
        // though the UI currently mostly uses nodes and system.
        const protocols = ['VLESS'];

        return NextResponse.json({
            nodes: stats.nodes,
            protocols,
            system: stats.system
        })
    } catch (error) {
        return handleApiError(error, 'Server Status');
    }
}

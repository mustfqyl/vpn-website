import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { vpnProvider } from '@/lib/vpn/factory'
import { handleApiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1] || 
                     request.headers.get('cookie')?.split('token=')[1]?.split(';')[0]

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch live node stats from Oculve API
        const { nodes } = await vpnProvider.getStats();

        // In the new architecture, we just show all available nodes from Oculve.
        // We can filter by "Premium" or other logic if Oculve returns that info.
        // For now, return all nodes.
        const mappedNodes = nodes.map(node => ({
            id: node.name,
            name: node.name,
            status: node.status,
            ping: node.ping,
            location: node.name.split('-')[0] || 'Global', // Heuristic for location if name contains it
            isPremium: true // Default to premium in this UI
        }));

        return NextResponse.json({
            nodes: mappedNodes
        })

    } catch (error) {
        return handleApiError(error, 'Servers GET');
    }
}

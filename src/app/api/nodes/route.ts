import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { vpnProvider } from '@/lib/vpn/factory'
import { handleApiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

// Country code lookup from IP (basic, from known hosting info embedded in name)
function guessCountryFromName(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('de') || n.includes('germany') || n.includes('frankfurt')) return 'DE';
    if (n.includes('nl') || n.includes('netherlands') || n.includes('amsterdam')) return 'NL';
    if (n.includes('us') || n.includes('usa') || n.includes('new york') || n.includes('dallas')) return 'US';
    if (n.includes('uk') || n.includes('london') || n.includes('england')) return 'GB';
    if (n.includes('fr') || n.includes('france') || n.includes('paris')) return 'FR';
    if (n.includes('sg') || n.includes('singapore')) return 'SG';
    if (n.includes('jp') || n.includes('japan') || n.includes('tokyo')) return 'JP';
    if (n.includes('tr') || n.includes('turkey') || n.includes('istanbul')) return 'TR';
    if (n.includes('fi') || n.includes('finland') || n.includes('helsinki')) return 'FI';
    if (n.includes('se') || n.includes('sweden') || n.includes('stockholm')) return 'SE';
    return 'XX';
}

const countryNames: Record<string, string> = {
    DE: 'Germany', NL: 'Netherlands', US: 'United States', GB: 'United Kingdom',
    FR: 'France', SG: 'Singapore', JP: 'Japan', TR: 'Turkey', FI: 'Finland',
    SE: 'Sweden', XX: 'Unknown'
};

export async function GET() {
    try {
        // Fetch live nodes from VPN panel
        const stats = await vpnProvider.getStats();
        const liveNodes = stats.nodes;

        // For each node, compute 30-day uptime from our DB logs
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const uptimeLogs = await (prisma as any).nodeUptimeLog.groupBy({
            by: ['nodeName'],
            where: { checkedAt: { gte: thirtyDaysAgo } },
            _count: { id: true },
        });

        const uptimeConnected = await (prisma as any).nodeUptimeLog.groupBy({
            by: ['nodeName'],
            where: {
                checkedAt: { gte: thirtyDaysAgo },
                status: 'connected'
            },
            _count: { id: true },
        });

        // Build uptime map
        const totalMap: Record<string, number> = {};
        const connectedMap: Record<string, number> = {};
        for (const row of uptimeLogs) { totalMap[row.nodeName] = row._count.id; }
        for (const row of uptimeConnected) { connectedMap[row.nodeName] = row._count.id; }

        // Get latest ping per node
        const latestPings = await (prisma as any).nodeUptimeLog.findMany({
            where: { checkedAt: { gte: thirtyDaysAgo } },
            orderBy: { checkedAt: 'desc' },
            distinct: ['nodeName'],
            select: { nodeName: true, ping: true, checkedAt: true }
        });
        const pingMap: Record<string, { ping: number; lastChecked: string }> = {};
        for (const row of latestPings) {
            pingMap[row.nodeName] = { ping: row.ping, lastChecked: row.checkedAt.toISOString() };
        }

        const nodes = liveNodes.map((n: any) => {
            const total = totalMap[n.name] || 0;
            const connected = connectedMap[n.name] || 0;
            const uptime30d = total > 0 ? Math.round((connected / total) * 1000) / 10 : null;
            const countryCode = guessCountryFromName(n.name);

            return {
                name: n.name,
                address: n.address,
                port: n.port,
                status: n.status, // 'connected' | 'connecting' | 'error'
                countryCode,
                country: countryNames[countryCode] ?? countryCode,
                ping: pingMap[n.name]?.ping ?? n.ping ?? -1,
                lastChecked: pingMap[n.name]?.lastChecked ?? null,
                uplinkGB: n.uplinkGB,
                downlinkGB: n.downlinkGB,
                xrayVersion: n.xrayVersion,
                nodeVersion: n.nodeVersion,
                connectionType: n.connectionType,
                message: n.message,
                uptime30d, // percentage, null if no data
            };
        });

        return NextResponse.json({ nodes, updatedAt: new Date().toISOString() });
    } catch (error) {
        return handleApiError(error, 'Public Nodes List');
    }
}

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

        // For each node, compute 30-day uptime from native node_stats
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Map node names to IDs first to match stats
        const dbNodes = await prisma.node.findMany({
            select: { id: true, name: true }
        });
        const nameToId: Record<string, string> = {};
        for (const row of dbNodes) { nameToId[row.name] = row.id.toString(); }

        const statsCounts = await prisma.nodeStats.groupBy({
            by: ['nodeId'],
            where: { createdAt: { gte: thirtyDaysAgo } },
            _count: { id: true },
        });

        const uptimeMap: Record<string, number> = {};
        const totalPossibleChecks = (30 * 24 * 60 * 60) / 25; // 30 days in 25s intervals

        for (const row of statsCounts) {
            const count = row._count.id;
            const uptime = Math.min(100, Math.round((count / totalPossibleChecks) * 1000) / 10);
            uptimeMap[row.nodeId.toString()] = uptime;
        }

        // Get latest check info
        const latestStats = await prisma.nodeStats.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            orderBy: { createdAt: 'desc' },
            distinct: ['nodeId'],
            select: { nodeId: true, createdAt: true }
        });
        const lastSeenMap: Record<string, string> = {};
        for (const row of latestStats) {
            lastSeenMap[row.nodeId.toString()] = row.createdAt.toISOString();
        }

        const nodes = liveNodes.map((n) => {
            const nodeId = nameToId[n.name];
            const uptime30d = nodeId ? (uptimeMap[nodeId] ?? null) : null;
            const countryCode = guessCountryFromName(n.name);

            return {
                name: n.name,
                address: n.address,
                port: n.port,
                status: n.status, // 'connected' | 'connecting' | 'error'
                countryCode,
                country: countryNames[countryCode] ?? countryCode,
                ping: n.ping ?? -1, // Use live ping from provider if available
                lastChecked: nodeId ? (lastSeenMap[nodeId] ?? null) : null,
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

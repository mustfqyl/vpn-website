import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ nodeName: string }> }
) {
    try {
        const { nodeName } = await params;
        const decodedName = decodeURIComponent(nodeName);

        // 1. Find the node ID from the nodes table
        const node = await prisma.node.findUnique({
            where: { name: decodedName }
        });

        if (!node) {
            return NextResponse.json({ error: 'Node not found' }, { status: 404 });
        }

        // 2. Fetch stats for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const statsEntries = await prisma.nodeStats.findMany({
            where: {
                nodeId: node.id,
                createdAt: { gte: thirtyDaysAgo }
            },
            orderBy: { createdAt: 'asc' }
        });

        // 3. Group by day (YYYY-MM-DD)
        const dailyStats: Record<string, { total: number; entries: { createdAt: Date; ping: number }[] }> = {};

        // Initialize last 30 days
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dailyStats[dateStr] = { total: 0, entries: [] };
        }

        for (const entry of statsEntries) {
            const dateStr = entry.createdAt.toISOString().split('T')[0];
            if (!dailyStats[dateStr]) continue;
            // Since node_stats doesn't have ping, we use -1 or a default if available elsewhere
            // For now, let's assume ping is recorded in our NodeUptimeLog if we still want it, 
            // but the user wants to use native data. Native data (node_stats) doesn't have ping.
            // We'll use -1 for ping from native stats.
            dailyStats[dateStr].entries.push({ createdAt: entry.createdAt, ping: -1 });
            dailyStats[dateStr].total += 1;
        }

        // 4. Transform stats into segments/events based on gaps
        const result = Object.entries(dailyStats).map(([date, dayData]) => {
            const entries = dayData.entries;
            const segments: { start: number; end: number; status: 'up' | 'down' }[] = [];
            const downtimeEvents: { start: string; end: string | null; duration: string; isOngoing?: boolean }[] = [];
            
            const dayStart = new Date(date).getTime();
            const GAP_THRESHOLD_MS = 90 * 1000; // 90 seconds (entries are every 25s, so 90s is safe for "down")

            let downCount = 0;


            if (entries.length > 0) {
                let currentSegmentStart = entries[0].createdAt;


                for (let i = 1; i < entries.length; i++) {
                    const prev = entries[i - 1];
                    const curr = entries[i];
                    const gap = curr.createdAt.getTime() - prev.createdAt.getTime();

                    if (gap > GAP_THRESHOLD_MS) {
                        // There was a downtime between prev and curr
                        // End current UP segment
                        segments.push({
                            start: (currentSegmentStart.getTime() - dayStart) / (24 * 60 * 60 * 1000),
                            end: (prev.createdAt.getTime() - dayStart) / (24 * 60 * 60 * 1000),
                            status: 'up'
                        });

                        // Add DOWN segment
                        const downtimeStart = prev.createdAt;
                        const downtimeEnd = curr.createdAt;
                        segments.push({
                            start: (downtimeStart.getTime() - dayStart) / (24 * 60 * 60 * 1000),
                            end: (downtimeEnd.getTime() - dayStart) / (24 * 60 * 60 * 1000),
                            status: 'down'
                        });

                        // Record downtime event
                        const durationMs = gap;
                        const totalMins = Math.round(durationMs / 60000);
                        const h = Math.floor(totalMins / 60);
                        const m = totalMins % 60;
                        const durationStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
                        downCount += Math.floor(durationMs / 25000);

                        downtimeEvents.push({
                            start: downtimeStart.toISOString(),
                            end: downtimeEnd.toISOString(),
                            duration: durationStr
                        });

                        // Start new UP segment
                        currentSegmentStart = curr.createdAt;
                    }
                }

                // Close last UP segment
                const lastEntry = entries[entries.length - 1];
                segments.push({
                    start: (currentSegmentStart.getTime() - dayStart) / (24 * 60 * 60 * 1000),
                    end: (lastEntry.createdAt.getTime() - dayStart) / (24 * 60 * 60 * 1000),
                    status: 'up'
                });

                // Check if ongoing (if latest entry is older than 2 mins)
                const isToday = new Date().toISOString().split('T')[0] === date;
                const timeSinceLastEntry = Date.now() - lastEntry.createdAt.getTime();
                if (isToday && timeSinceLastEntry > GAP_THRESHOLD_MS) {
                    const durationMs = timeSinceLastEntry;
                    const totalMins = Math.round(durationMs / 60000);
                    const h = Math.floor(totalMins / 60);
                    const m = totalMins % 60;
                    const durationStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
                    downCount += Math.floor(durationMs / 25000);

                    segments.push({
                        start: (lastEntry.createdAt.getTime() - dayStart) / (24 * 60 * 60 * 1000),
                        end: (Date.now() - dayStart) / (24 * 60 * 60 * 1000),
                        status: 'down'
                    });

                    downtimeEvents.push({
                        start: lastEntry.createdAt.toISOString(),
                        end: null,
                        duration: durationStr,
                        isOngoing: true
                    });
                }
            }

            const uptimePercent = entries.length > 0 ? (entries.length / (entries.length + downCount)) : 0;

            return {
                date,
                uptimePercent,
                isDown: entries.length === 0 || (Date.now() - entries[entries.length - 1].createdAt.getTime() > GAP_THRESHOLD_MS),
                checks: entries.length + downCount,
                downChecks: downCount,
                avgPing: -1, // Ping not available in node_stats
                segments,
                downtimeEvents
            };
        });

        return NextResponse.json({ success: true, history: result });

    } catch (error) {
        console.error('Uptime History Error:', error);
        return NextResponse.json({ error: 'Failed to fetch uptime history' }, { status: 500 });
    }
}

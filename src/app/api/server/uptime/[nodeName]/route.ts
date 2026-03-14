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

        // Fetch logs for the last 30 days with pagination
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const logs = await prisma.nodeUptimeLog.findMany({
            where: {
                nodeName: decodedName,
                checkedAt: {
                    gte: thirtyDaysAgo
                }
            },
            orderBy: {
                checkedAt: 'asc'
            }
        });

        // Group by day (YYYY-MM-DD)
        const dailyStats: Record<string, { total: number; down: number; pingSum: number; pingCount: number; logs: { status: string; checkedAt: Date; ping: number }[] }> = {};

        // Initialize last 30 days
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dailyStats[dateStr] = { total: 0, down: 0, pingSum: 0, pingCount: 0, logs: [] };
        }

        for (const log of logs) {
            const dateStr = new Date(log.checkedAt).toISOString().split('T')[0];
            if (!dailyStats[dateStr]) continue;

            dailyStats[dateStr].logs.push(log);
            dailyStats[dateStr].total += 1;
            if (log.status !== 'connected') {
                dailyStats[dateStr].down += 1;
            }
            if (log.ping >= 0) {
                dailyStats[dateStr].pingSum += log.ping;
                dailyStats[dateStr].pingCount += 1;
            }
        }

        // Format for frontend
        const result = Object.entries(dailyStats).map(([date, stats]) => {
            const isDown = stats.down > 0;
            const uptimePercent = stats.total > 0 ? ((stats.total - stats.down) / stats.total) : (stats.total === 0 ? 0 : 1);
            const avgPing = stats.pingCount > 0 ? Math.round(stats.pingSum / stats.pingCount) : -1;

            // Calculate segments (time spans of up/down)
            const segments: { start: number; end: number; status: 'up' | 'down' }[] = [];
            const downtimeEvents: { start: string; end: string; duration: string }[] = [];

            if (stats.logs.length > 0) {
                let currentStatus = stats.logs[0].status === 'connected' ? 'up' : 'down';
                let segmentStart = stats.logs[0].checkedAt;
                let downtimeStart: Date | null = currentStatus === 'down' ? segmentStart : null;

                for (let i = 1; i < stats.logs.length; i++) {
                    const log = stats.logs[i];
                    const status = log.status === 'connected' ? 'up' : 'down';

                    if (status !== currentStatus) {
                        // End current segment
                        const end = log.checkedAt;
                        const dayStart = new Date(date).getTime();
                        segments.push({
                            start: (new Date(segmentStart).getTime() - dayStart) / (24 * 60 * 60 * 1000),
                            end: (new Date(end).getTime() - dayStart) / (24 * 60 * 60 * 1000),
                            status: currentStatus as 'up' | 'down'
                        });

                        if (currentStatus === 'down' && downtimeStart) {
                            const durationMs = new Date(end).getTime() - downtimeStart.getTime();
                            const totalMins = Math.round(durationMs / 60000);
                            const h = Math.floor(totalMins / 60);
                            const m = totalMins % 60;
                            const durationStr = h > 0 ? `${h}h ${m}m` : `${m}m`;

                            downtimeEvents.push({
                                start: downtimeStart.toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit' }),
                                end: new Date(end).toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit' }),
                                duration: durationStr
                            });
                        }

                        currentStatus = status;
                        segmentStart = log.checkedAt;
                        downtimeStart = status === 'down' ? segmentStart : null;
                    }
                }

                // Close last segment
                const lastLog = stats.logs[stats.logs.length - 1];
                const dayStart = new Date(date).getTime();
                const actualEnd = lastLog.checkedAt;

                segments.push({
                    start: (new Date(segmentStart).getTime() - dayStart) / (24 * 60 * 60 * 1000),
                    end: (new Date(actualEnd).getTime() - dayStart) / (24 * 60 * 60 * 1000),
                    status: currentStatus as 'up' | 'down'
                });

                if (currentStatus === 'down' && downtimeStart) {
                    const durationMs = new Date(actualEnd).getTime() - downtimeStart.getTime();
                    const totalMins = Math.round(durationMs / 60000);
                    const h = Math.floor(totalMins / 60);
                    const m = totalMins % 60;
                    const durationStr = h > 0 ? `${h}h ${m}m` : `${m}m`;

                    downtimeEvents.push({
                        start: downtimeStart.toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit' }),
                        end: new Date(actualEnd).toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit' }),
                        duration: durationStr
                    });
                }
            }

            return {
                date,
                uptimePercent,
                isDown,
                checks: stats.total,
                downChecks: stats.down,
                avgPing,
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

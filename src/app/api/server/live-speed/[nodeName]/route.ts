import { NextRequest } from 'next/server';
import { vpnProvider } from '@/lib/vpn/factory';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ nodeName: string }> }
) {
    const { nodeName } = await params;

    const stream = new ReadableStream({
        async start(controller) {
            let isActive = true;
            const HISTORY_SIZE = 15; // 15 seconds window
            const history: { time: number; up: number; down: number }[] = [];

            const pollInterval = setInterval(async () => {
                if (!isActive) return;

                try {
                    const stats = await vpnProvider.getStats();
                    if (!isActive) return;

                    const node = stats.nodes.find(n => n.name === decodeURIComponent(nodeName));
                    if (!node) return;

                    const currentTime = Date.now();
                    const currentUplinkBytes = node.uplinkBytes || 0;
                    const currentDownlinkBytes = node.downlinkBytes || 0;

                    history.push({ time: currentTime, up: currentUplinkBytes, down: currentDownlinkBytes });
                    if (history.length > HISTORY_SIZE) {
                        history.shift();
                    }

                    if (history.length >= 2) {
                        const first = history[0];
                        const last = history[history.length - 1];
                        const timeDeltaSec = (last.time - first.time) / 1000;

                        if (timeDeltaSec > 0) {
                            // Calculate average speed over the window
                            let upSpeedMBps = (last.up - first.up) / (1024 * 1024) / timeDeltaSec;
                            let downSpeedMBps = (last.down - first.down) / (1024 * 1024) / timeDeltaSec;

                            upSpeedMBps = Math.max(0, upSpeedMBps);
                            downSpeedMBps = Math.max(0, downSpeedMBps);

                            const payload = JSON.stringify({
                                upSpeed: parseFloat(upSpeedMBps.toFixed(2)),
                                downSpeed: parseFloat(downSpeedMBps.toFixed(2))
                            });

                            if (isActive) {
                                try {
                                    controller.enqueue(new TextEncoder().encode(`data: ${payload}\n\n`));
                                } catch (e) {
                                    // Controller might have closed between check and call
                                    isActive = false;
                                }
                            }
                        }
                    }

                } catch (error) {
                    if (isActive) {
                        console.error('SSE Live Speed Error:', error);
                    }
                }
            }, 1000);

            request.signal.addEventListener('abort', () => {
                isActive = false;
                clearInterval(pollInterval);
                try { controller.close(); } catch (e) { }
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
        },
    });
}

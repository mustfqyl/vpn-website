import { useState, useEffect } from "react";

interface ServerNode {
    name: string;
    address: string;
    port: number;
    status: string;
    message: string;
    ping: number;
    connectionType: string;
    xrayVersion: string;
    nodeVersion: string;
    uplinkGB: number;
    downlinkGB: number;
}

interface NodeDetailPopupProps {
    node: ServerNode;
    onClose: () => void;
}

interface DowntimeEvent {
    start: string;
    end: string | null;
    duration: string;
    isOngoing?: boolean;
}

interface UptimeDay {
    date: string;
    uptimePercent: number;
    avgPing: number;
    checks: number;
    downChecks: number;
    isDown: boolean;
    segments: { start: number; end: number; status: 'up' | 'down' }[];
    downtimeEvents: DowntimeEvent[];
}

export const NodeDetailPopup = ({ node, onClose }: NodeDetailPopupProps) => {
    const [liveSpeed, setLiveSpeed] = useState<{ upSpeed: number; downSpeed: number } | null>(null);
    const [uptimeHistory, setUptimeHistory] = useState<UptimeDay[]>([]);
    const [hoveredDay, setHoveredDay] = useState<UptimeDay | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Fetch uptime history
        fetch(`/api/server/uptime/${encodeURIComponent(node.name)}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.history) {
                    setUptimeHistory(data.history);
                }
            })
            .catch(console.error);

        if (node.status !== 'connected') return;

        // Establish an SSE connection for live updates
        let source: EventSource | null = null;
        let reconnectTimeout: ReturnType<typeof setTimeout>;

        const connectStream = () => {
            if (source) source.close();
            source = new EventSource(`/api/server/live-speed/${encodeURIComponent(node.name)}`);

            source.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setLiveSpeed(data);
                } catch {
                    // console.error("Failed to parse live speed data", e);
                }
            };

            source.onerror = () => {
                source?.close();
                // If stream closes, try reconnecting automatically after a brief delay
                reconnectTimeout = setTimeout(connectStream, 2000);
            };
        };

        connectStream();

        return () => {
            clearTimeout(reconnectTimeout);
            if (source) source.close();
        };
    }, [node.name, node.status]);

    return (
        <div onClick={onClose} style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            display: "grid", placeItems: "center",
            zIndex: 100,
            animation: "fadeIn 0.2s ease"
        }}>
            <div onClick={(e) => e.stopPropagation()} style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                borderRadius: "16px",
                padding: "2rem",
                maxWidth: "420px",
                width: "90vw",
                animation: "fadeIn 0.2s ease"
            }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{
                            width: "40px", height: "40px", borderRadius: "10px",
                            background: node.status === "connected" ? "rgba(52, 211, 153, 0.15)" : "rgba(248, 113, 113, 0.15)",
                            display: "grid", placeItems: "center",
                            border: `1px solid ${node.status === "connected" ? "rgba(52, 211, 153, 0.3)" : "rgba(248, 113, 113, 0.3)"}`
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={node.status === "connected" ? "var(--success)" : "var(--error)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontSize: "1.125rem", fontWeight: 700 }}>{node.name}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                <span className="status-dot" style={{ width: "6px", height: "6px", background: node.status === "connected" ? "var(--success)" : "var(--error)", animation: node.status === "connected" ? "pulse 2s infinite" : "none" }} />
                                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: node.status === "connected" ? "var(--success)" : "var(--error)", textTransform: "uppercase" }}>
                                    {node.status === "connected" ? "Online" : "Offline"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--foreground-muted)", cursor: "pointer", padding: "0.5rem" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                {/* Details Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div style={{ background: "var(--accent-soft)", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--card-border)" }}>
                        <div style={{ fontSize: "0.625rem", color: "var(--foreground-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>IP Address</div>
                        <div style={{ fontSize: "0.8125rem", fontWeight: 600, fontFamily: "monospace" }}>{node.address}</div>
                    </div>
                    <div style={{ background: "var(--accent-soft)", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--card-border)" }}>
                        <div style={{ fontSize: "0.625rem", color: "var(--foreground-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Port</div>
                        <div style={{ fontSize: "0.8125rem", fontWeight: 600, fontFamily: "monospace" }}>{node.port}</div>
                    </div>
                    <div style={{ background: "var(--accent-soft)", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--card-border)" }}>
                        <div style={{ fontSize: "0.625rem", color: "var(--foreground-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Ping</div>
                        <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: node.ping >= 0 && node.ping < 200 ? "var(--success)" : "var(--error)" }}>{node.ping >= 0 ? `${node.ping} ms` : "Timeout"}</div>
                    </div>
                    <div style={{ background: "var(--accent-soft)", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--card-border)" }}>
                        <div style={{ fontSize: "0.625rem", color: "var(--foreground-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Connection</div>
                        <div style={{ fontSize: "0.8125rem", fontWeight: 600, textTransform: "uppercase" }}>{node.connectionType}</div>
                    </div>
                </div>

                {/* Bandwidth */}
                <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div style={{ background: "var(--accent-soft)", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--card-border)" }}>
                        <div style={{ fontSize: "0.625rem", color: "var(--foreground-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>↑ Upload</div>
                        <div style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{node.uplinkGB} GB</div>
                    </div>
                    <div style={{ background: "var(--accent-soft)", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--card-border)" }}>
                        <div style={{ fontSize: "0.625rem", color: "var(--foreground-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>↓ Total Download</div>
                        <div style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{node.downlinkGB} GB</div>
                    </div>
                </div>

                {/* Live Speed */}
                {node.status === 'connected' && (
                    <div style={{ marginTop: "1rem" }}>
                        <div style={{ background: "var(--accent-soft)", padding: "1rem", borderRadius: "10px", border: "1px solid var(--card-border)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                <div style={{ fontSize: "0.625rem", color: "var(--foreground-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Live Network Speed</div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginBottom: "0.25rem" }}>↑ Upload</div>
                                    <div style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "monospace" }}>
                                        {liveSpeed ? `${liveSpeed.upSpeed.toFixed(2)} MB/s` : '-- MB/s'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginBottom: "0.25rem" }}>↓ Download</div>
                                    <div style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "monospace", color: "var(--success)" }}>
                                        {liveSpeed ? `${liveSpeed.downSpeed.toFixed(2)} MB/s` : '-- MB/s'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 30-Day Uptime History */}
                <div style={{ marginTop: "1.5rem", position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <div style={{ fontSize: "0.625rem", color: "var(--foreground-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>30-Day History</div>
                    </div>
                    <div style={{ display: "flex", gap: "2px", alignItems: "flex-end", height: "32px" }}>
                        {uptimeHistory.length === 0 ? (
                            <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>Loading history...</div>
                        ) : (
                            uptimeHistory.map((day, idx) => {
                                const isToday = day.date === new Date().toISOString().split('T')[0];
                                const secondsInDay = 24 * 60 * 60;
                                const now = new Date();
                                const elapsedSeconds = isToday ? (now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds()) : secondsInDay;
                                const heightPercent = (elapsedSeconds / secondsInDay) * 100;

                                // Helper for health colors
                                const getHealthColor = (percent: number) => {
                                    const p = percent * 100;
                                    if (p >= 100) return '#10b981'; // Green
                                    if (p >= 99) return '#84cc16';  // Lime
                                    if (p >= 90) return '#fbbf24';  // Yellow/Gold
                                    if (p >= 75) return '#f97316';  // Orange
                                    return '#ef4444';               // Red
                                };

                                const healthColor = getHealthColor(day.uptimePercent);

                                // Build gradient from segments
                                let gradient = "";
                                if (day.segments && day.segments.length > 0) {
                                    const stops = day.segments.map((seg) => {
                                        const color = healthColor;
                                        return `${color} ${seg.start * 100}%, ${color} ${seg.end * 100}%`;
                                    });
                                    gradient = `linear-gradient(to top, ${stops.join(", ")})`;
                                } else {
                                    gradient = day.checks === 0 ? "var(--card-border)" : healthColor;
                                }

                                return (
                                    <div key={idx}
                                        style={{
                                            flex: 1,
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "flex-end",
                                            position: "relative"
                                        }}
                                        onMouseEnter={(e) => {
                                            const bar = e.currentTarget.querySelector('.bar-growth') as HTMLElement;
                                            if (bar) bar.style.transform = "scaleX(1.3)";
                                            setHoveredDay(day);
                                        }}
                                        onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                                        onMouseLeave={(e) => {
                                            const bar = e.currentTarget.querySelector('.bar-growth') as HTMLElement;
                                            if (bar) bar.style.transform = "scaleX(1)";
                                            setHoveredDay(null);
                                        }}
                                    >
                                        <div className="bar-growth" style={{
                                            width: "100%",
                                            height: "0%", // Animated via CSS below
                                            background: gradient,
                                            borderRadius: "2px",
                                            opacity: day.checks === 0 ? 0.2 : 0.8,
                                            transition: "all 0.2s ease, height 1s ease-out",
                                            // @ts-expect-error - Custom CSS property
                                            '--target-height': `${heightPercent}%`
                                        }}
                                            ref={(el) => {
                                                if (el) setTimeout(() => el.style.height = `${heightPercent}%`, 50 + idx * 20);
                                            }}
                                        />
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.4rem", fontSize: "0.625rem", color: "var(--foreground-muted)" }}>
                        <span>30 days ago</span>
                        <span>Today</span>
                    </div>

                    {/* Tooltip */}
                    {hoveredDay && (
                        <div style={{
                            position: "fixed",
                            left: mousePos.x > window.innerWidth / 2 ? mousePos.x - 170 : mousePos.x + 10,
                            top: mousePos.y - 80,
                            background: "var(--card-bg)",
                            backdropFilter: "blur(8px)",
                            border: "1px solid var(--card-border)",
                            padding: "0.75rem",
                            borderRadius: "12px",
                            zIndex: 1000,
                            pointerEvents: "none",
                            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.1)",
                            minWidth: "160px",
                            animation: "fadeIn 0.15s ease-out"
                        }}>
                            <div style={{
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                marginBottom: "0.6rem",
                                color: "var(--foreground)",
                                borderBottom: "1px solid var(--card-border)",
                                paddingBottom: "0.4rem"
                            }}>
                                {new Date(hoveredDay.date).toLocaleDateString('en-US', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })}
                                {hoveredDay.date === new Date().toISOString().split('T')[0] && <span style={{ marginLeft: '0.5rem', opacity: 0.6, fontSize: '0.6rem' }}>(Today)</span>}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--foreground-muted)" }}>
                                    <span>Uptime:</span>
                                    <span style={{ color: "var(--foreground)", fontWeight: 600 }}>
                                        {(hoveredDay.checks === 0 ? 0 : hoveredDay.uptimePercent * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--foreground-muted)" }}>
                                    <span>Avg Ping:</span>
                                    <span style={{ color: hoveredDay.avgPing >= 0 ? "var(--success)" : "var(--foreground-muted)", fontWeight: 600 }}>
                                        {hoveredDay.avgPing >= 0 ? `${hoveredDay.avgPing}ms` : '--'}
                                    </span>
                                </div>

                                        {hoveredDay.downtimeEvents && hoveredDay.downtimeEvents.length > 0 && (
                                            <div style={{ marginTop: '4px', borderTop: '1px dashed var(--card-border)', paddingTop: '4px' }}>
                                                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--error)', marginBottom: '2px' }}>Downtime Periods:</div>
                                                {hoveredDay.downtimeEvents.map((ev, i) => {
                                                    const formatTime = (iso: string | null) => {
                                                        if (!iso) return "Now";
                                                        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                                                    };
                                                    return (
                                                        <div key={i} style={{ fontSize: '0.6rem', display: 'flex', justifyContent: 'space-between', color: 'var(--foreground)' }}>
                                                            <span>{formatTime(ev.start)} - {formatTime(ev.end)}</span>
                                                            <span style={{ opacity: 0.7 }}>({ev.duration})</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6rem", color: "var(--foreground-muted)", borderTop: '1px solid var(--card-border)', paddingTop: '4px', marginTop: '2px' }}>
                                    <span>Checks:</span>
                                    <span style={{ color: "var(--foreground)" }}>{hoveredDay.checks}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

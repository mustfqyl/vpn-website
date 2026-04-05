"use client";

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

interface ServerStatusData {
    nodes: ServerNode[];
    protocols: string[];
    system: {
        onlineUsers: number;
        activeUsers: number;
        totalUsers: number;
        cpuUsage: number;
        memUsedPercent: number;
        incomingBandwidthGB: number;
        outgoingBandwidthGB: number;
        version: string;
    };
}

interface ServerStatusProps {
    serverStatus: ServerStatusData | null;
    onSelectNode: (node: ServerNode) => void;
}

export const ServerStatus = ({ serverStatus, onSelectNode }: ServerStatusProps) => {
    return (
        <div className="card" style={{ display: "flex", flexDirection: "column", position: "relative", overflow: "visible" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", minHeight: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", height: "32px" }}>
                    <h3 style={{
                        fontSize: "13px",
                        color: "var(--foreground-muted)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05rem",
                        margin: 0,
                        padding: 0,
                        lineHeight: "1",
                        fontFamily: "'Outfit', sans-serif"
                    }}>Servers Status</h3>
                </div>

                {serverStatus && serverStatus.nodes && (
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                        <span><strong style={{ color: "var(--success)" }}>{serverStatus.nodes.filter(n => n.status === 'connected').length}</strong> Online</span>
                        <span><strong>{serverStatus.nodes.length}</strong> Total</span>
                    </div>
                )}
            </div>

            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                overflowY: "auto",
                flex: 1,
                paddingRight: "4px",
                marginRight: "-8px",
                paddingBottom: "1rem"
            }} className="custom-scrollbar">
                {/* Nodes */}
                {serverStatus && Array.isArray(serverStatus.nodes) && serverStatus.nodes.length > 0 ? (
                    serverStatus.nodes.map((node: ServerNode, i: number) => (
                        <div key={i} onClick={() => onSelectNode(node)} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            padding: "0.75rem 1rem",
                            background: "var(--accent-soft)",
                            borderRadius: "8px",
                            border: "1px solid var(--card-border)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            position: "relative"
                        }}>
                            <div style={{
                                width: "36px", height: "36px",
                                borderRadius: "8px",
                                background: node.status === "connected" ? "rgba(52, 211, 153, 0.15)" : "rgba(248, 113, 113, 0.15)",
                                display: "grid", placeItems: "center",
                                border: `1px solid ${node.status === "connected" ? "rgba(52, 211, 153, 0.3)" : "rgba(248, 113, 113, 0.3)"}`
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={node.status === "connected" ? "var(--success)" : "var(--error)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
                                </svg>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{String(node.name || 'Unknown Node')}</div>
                                <div style={{ fontSize: "0.6875rem", color: "var(--foreground-muted)", fontFamily: "monospace" }}>{String(node.address || '0.0.0.0')}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                    <span className="status-dot" style={{
                                        width: "6px", height: "6px",
                                        background: node.status === "connected" ? "var(--success)" : "var(--error)",
                                        animation: node.status === "connected" ? "pulse 2s infinite" : "none"
                                    }} />
                                    <span style={{
                                        fontSize: "0.6875rem", fontWeight: 700,
                                        color: node.status === "connected" ? "var(--success)" : "var(--error)",
                                        textTransform: "uppercase"
                                    }}>
                                        {node.status === "connected" ? "Online" : "Offline"}
                                    </span>
                                </div>
                                <div style={{ fontSize: "0.625rem", color: "var(--foreground-muted)", marginTop: "0.1rem" }}>
                                    {node.ping >= 0 ? `${node.ping} ms` : "N/A"}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ padding: "1rem", textAlign: "center", color: "var(--foreground-muted)", fontSize: "0.8125rem" }}>
                        {serverStatus ? "No nodes found." : "Loading nodes..."}
                    </div>
                )}

                <div style={{ height: "1px", background: "var(--card-border)", opacity: 0.5 }} />
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--card-border);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

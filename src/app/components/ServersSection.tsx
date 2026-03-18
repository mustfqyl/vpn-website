"use client";

import { useState, useEffect, useCallback } from "react";

interface NodeData {
    name: string;
    address: string;
    port: number;
    status: string; // 'connected' | 'connecting' | 'error'
    countryCode: string;
    country: string;
    ping: number;
    lastChecked: string | null;
    uplinkGB: number;
    downlinkGB: number;
    xrayVersion: string;
    nodeVersion: string;
    connectionType: string;
    message: string;
    uptime30d: number | null;
}

const FLAG_MAP: Record<string, string> = {
    DE: '🇩🇪', NL: '🇳🇱', US: '🇺🇸', GB: '🇬🇧', FR: '🇫🇷', SG: '🇸🇬',
    JP: '🇯🇵', TR: '🇹🇷', FI: '🇫🇮', SE: '🇸🇪', XX: '🌐'
};

export function ServersSection() {
    const [nodes, setNodes] = useState<NodeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'connected' | 'error'>('all');
    const [filterCountry, setFilterCountry] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchNodes = useCallback(async () => {
        try {
            const res = await fetch('/api/nodes');
            if (!res.ok) throw new Error('Failed to fetch nodes');
            const data = await res.json();
            setNodes(data.nodes || []);
            setUpdatedAt(data.updatedAt);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNodes();
        const intervalId = setInterval(fetchNodes, 2500);
        return () => clearInterval(intervalId);
    }, [fetchNodes]);

    // Filter logic
    const countries = [...new Set(nodes.map(n => n.country))].sort();
    const filteredNodes = nodes.filter(n => {
        if (filterStatus !== 'all' && n.status !== filterStatus) return false;
        if (filterCountry !== 'all' && n.country !== filterCountry) return false;
        if (searchQuery && !n.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const getStatusColor = (status: string) => {
        if (status === 'connected') return 'var(--success)';
        if (status === 'connecting') return 'var(--warning)';
        return '#ef4444';
    };

    const getUptimeColor = (pct: number | null) => {
        if (pct === null) return 'var(--foreground-muted)';
        if (pct >= 99) return 'var(--success)';
        if (pct >= 95) return 'var(--warning)';
        return '#ef4444';
    };

    return (
        <section id="servers" style={{ padding: "8rem 0", borderTop: "1px solid var(--card-border)", background: "var(--background-secondary)" }}>
            <div className="container">
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                    <h2 style={{
                        fontSize: "clamp(2.5rem, 8vw, 4rem)",
                        marginBottom: "1rem",
                        background: "linear-gradient(to bottom, var(--foreground), var(--foreground-muted))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>
                        Global Network
                    </h2>
                    <p style={{ maxWidth: "500px", margin: "0 auto" }}>
                        Our infrastructure worldwide — updated live from the panel.
                    </p>
                    {updatedAt && (
                        <div style={{ fontSize: "0.6875rem", color: "var(--foreground-subtle)", marginTop: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />
                            Live · Updated {new Date(updatedAt).toLocaleTimeString()}
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div style={{
                    display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2rem",
                    padding: "1rem", background: "var(--background)", borderRadius: "12px",
                    border: "1px solid var(--card-border)"
                }}>
                    {/* Search */}
                    <div style={{ flex: 1, minWidth: "180px", position: "relative" }}>
                        <svg style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        <input
                            type="text"
                            placeholder="Search by node name..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%", padding: "0.5rem 0.75rem 0.5rem 2rem",
                                borderRadius: "8px", border: "1px solid var(--card-border)",
                                background: "var(--background-secondary)", color: "var(--foreground)",
                                fontSize: "0.8125rem"
                            }}
                        />
                    </div>

                    {/* Status filter */}
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value as 'all' | 'connected' | 'error')}
                        style={{
                            padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid var(--card-border)",
                            background: "var(--background-secondary)", color: "var(--foreground)", fontSize: "0.8125rem"
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="connected">✅ Active</option>
                        <option value="error">❌ Offline</option>
                    </select>

                    {/* Country filter */}
                    <select
                        value={filterCountry}
                        onChange={e => setFilterCountry(e.target.value)}
                        style={{
                            padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid var(--card-border)",
                            background: "var(--background-secondary)", color: "var(--foreground)", fontSize: "0.8125rem"
                        }}
                    >
                        <option value="all">All Countries</option>
                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    {/* Stats */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "auto", fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                        <span><strong style={{ color: "var(--success)" }}>{nodes.filter(n => n.status === 'connected').length}</strong> Active</span>
                        <span><strong>{nodes.length}</strong> Total</span>
                    </div>
                </div>

                {/* Node Grid */}
                {loading && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} style={{ height: "140px", borderRadius: "12px", background: "var(--accent-soft)", animation: "pulse 2s infinite" }} />
                        ))}
                    </div>
                )}
                {error && (
                    <div style={{ textAlign: "center", padding: "3rem", color: "var(--foreground-muted)" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</div>
                        <p>Panel connection failed. Please try again later.</p>
                    </div>
                )}
                {!loading && !error && filteredNodes.length === 0 && (
                    <div style={{ textAlign: "center", padding: "3rem", color: "var(--foreground-muted)" }}>
                        No nodes match your filters.
                    </div>
                )}
                {!loading && !error && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                        {filteredNodes.map(node => (
                            <button
                                key={node.name}
                                onClick={() => setSelectedNode(node)}
                                style={{
                                    background: "var(--background)",
                                    border: `1px solid ${node.status === 'connected' ? 'var(--card-border)' : 'rgba(239,68,68,0.2)'}`,
                                    borderRadius: "12px",
                                    padding: "1.25rem",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.75rem",
                                }}
                                onMouseOver={e => {
                                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--foreground-subtle)';
                                }}
                                onMouseOut={e => {
                                    (e.currentTarget as HTMLElement).style.transform = 'none';
                                    (e.currentTarget as HTMLElement).style.borderColor = node.status === 'connected' ? 'var(--card-border)' : 'rgba(239,68,68,0.2)';
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <div style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>
                                            {FLAG_MAP[node.countryCode] ?? '🌐'}
                                        </div>
                                        <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--foreground)" }}>{node.name}</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>{node.country}</div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.6875rem", fontWeight: 700, color: getStatusColor(node.status), background: `${getStatusColor(node.status)}20`, padding: "0.25rem 0.6rem", borderRadius: "100px" }}>
                                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: getStatusColor(node.status), display: "inline-block" }} />
                                        {node.status}
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: "0.625rem", color: "var(--foreground-muted)", textTransform: "uppercase", fontWeight: 600 }}>Ping</div>
                                        <div style={{ fontSize: "0.875rem", fontWeight: 700, color: node.ping > 0 ? (node.ping < 100 ? 'var(--success)' : node.ping < 250 ? 'var(--warning)' : 'var(--error)') : "var(--foreground-muted)" }}>
                                            {node.ping > 0 ? `${node.ping}ms` : '—'}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: "0.625rem", color: "var(--foreground-muted)", textTransform: "uppercase", fontWeight: 600 }}>30d Uptime</div>
                                        <div style={{ fontSize: "0.875rem", fontWeight: 700, color: getUptimeColor(node.uptime30d) }}>
                                            {node.uptime30d !== null ? `${node.uptime30d}%` : '—'}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: "0.625rem", color: "var(--foreground-muted)", textTransform: "uppercase", fontWeight: 600 }}>Traffic</div>
                                        <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>
                                            {(node.uplinkGB + node.downlinkGB) > 0 ? `${(node.uplinkGB + node.downlinkGB).toFixed(1)} GB` : '—'}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {(() => {
                const liveSelectedNode = selectedNode ? nodes.find(n => n.name === selectedNode.name) || selectedNode : null;
                return liveSelectedNode && (
                    <div
                        onClick={() => setSelectedNode(null)}
                        style={{
                            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
                            WebkitBackdropFilter: "blur(12px)",
                            backdropFilter: "blur(12px)", display: "grid", placeItems: "center",
                            zIndex: 200, padding: "1rem"
                        }}
                    >
                        <div onClick={e => e.stopPropagation()} style={{
                            background: "var(--background)",
                            border: "1px solid var(--card-border)",
                            borderRadius: "20px",
                            width: "100%",
                            maxWidth: "520px",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            animation: "fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                        }}>
                            {/* Modal Header */}
                            <div style={{
                                position: "sticky", top: 0, background: "var(--background-glass)",
                                WebkitBackdropFilter: "blur(16px)",
                                backdropFilter: "blur(16px)", padding: "1.25rem 1.5rem",
                                borderBottom: "1px solid var(--card-border)",
                                display: "flex", justifyContent: "space-between", alignItems: "center"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <span style={{ fontSize: "1.75rem" }}>{FLAG_MAP[liveSelectedNode.countryCode] ?? '🌐'}</span>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: "1.0625rem" }}>{liveSelectedNode.name}</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>{liveSelectedNode.country}</div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedNode(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--foreground-muted)", padding: "0.4rem" }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {/* Status Row */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: "var(--accent-soft)", borderRadius: "10px" }}>
                                    <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>Status</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: getStatusColor(liveSelectedNode.status), fontWeight: 700, fontSize: "0.875rem" }}>
                                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: getStatusColor(liveSelectedNode.status), display: "inline-block" }} />
                                        {liveSelectedNode.status}
                                    </div>
                                </div>

                                {/* Grid of stats */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                                    {[
                                        { label: "Address", value: liveSelectedNode.address },
                                        { label: "Port", value: liveSelectedNode.port || '—' },
                                        { label: "Ping", value: liveSelectedNode.ping > 0 ? `${liveSelectedNode.ping}ms` : 'Unreachable' },
                                        { label: "30-Day Uptime", value: liveSelectedNode.uptime30d !== null ? `${liveSelectedNode.uptime30d}%` : 'No data yet' },
                                        { label: "Uplink", value: liveSelectedNode.uplinkGB > 0 ? `${liveSelectedNode.uplinkGB} GB` : '—' },
                                        { label: "Downlink", value: liveSelectedNode.downlinkGB > 0 ? `${liveSelectedNode.downlinkGB} GB` : '—' },
                                        { label: "Xray Version", value: liveSelectedNode.xrayVersion || '—' },
                                        { label: "Node Version", value: liveSelectedNode.nodeVersion || '—' },
                                        { label: "Connection Type", value: liveSelectedNode.connectionType || '—' },
                                        { label: "Last Checked", value: liveSelectedNode.lastChecked ? new Date(liveSelectedNode.lastChecked).toLocaleString() : 'Never' },
                                    ].map(({ label, value }) => (
                                        <div key={label} style={{
                                            padding: "0.75rem", background: "var(--background-secondary)",
                                            borderRadius: "8px", border: "1px solid var(--card-border)"
                                        }}>
                                            <div style={{ fontSize: "0.625rem", textTransform: "uppercase", color: "var(--foreground-muted)", fontWeight: 600, marginBottom: "0.25rem" }}>{label}</div>
                                            <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>{String(value)}</div>
                                        </div>
                                    ))}
                                </div>

                                {liveSelectedNode.message && (
                                    <div style={{ padding: "0.75rem 1rem", background: "rgba(239,68,68,0.05)", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.2)", fontSize: "0.8125rem", color: "#ef4444" }}>
                                        ⚠️ {liveSelectedNode.message}
                                    </div>
                                )}

                                {/* Uptime bar */}
                                {liveSelectedNode.uptime30d !== null && (
                                    <div>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.4rem" }}>
                                            <span style={{ color: "var(--foreground-muted)" }}>30-Day Uptime</span>
                                            <span style={{ fontWeight: 700, color: getUptimeColor(liveSelectedNode.uptime30d) }}>{liveSelectedNode.uptime30d}%</span>
                                        </div>
                                        <div style={{ height: "6px", borderRadius: "3px", background: "var(--card-border)", overflow: "hidden" }}>
                                            <div style={{
                                                height: "100%",
                                                width: `${liveSelectedNode.uptime30d}%`,
                                                background: getUptimeColor(liveSelectedNode.uptime30d),
                                                borderRadius: "3px",
                                                transition: "width 1s ease"
                                            }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 0.8; }
                }
            `}</style>
        </section>
    );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ServerStatus } from "@/app/dashboard/components/ServerStatus";
import { NodeDetailPopup } from "@/app/dashboard/components/NodeDetailPopup";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";


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

export default function ServersPage() {
    const [serverStatus, setServerStatus] = useState<ServerStatusData | null>(null);
    const [selectedNode, setSelectedNode] = useState<ServerNode | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'connected' | 'offline'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = () => {
            fetch('/api/server/status', { cache: 'no-store' })
                .then(r => r.json())
                .then(data => setServerStatus(data))
                .catch(console.error)
                .finally(() => setLoading(false));
        };

        fetchData();
        const intervalId = setInterval(fetchData, 2500);
        return () => clearInterval(intervalId);
    }, []);

    const filteredNodes = (serverStatus?.nodes ?? []).filter(n => {
        if (filterStatus === 'connected' && n.status !== 'connected') return false;
        if (filterStatus === 'offline' && n.status === 'connected') return false;
        if (searchQuery && !n.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });



    return (
        <div style={{ minHeight: "100vh", background: "var(--background)" }}>
            <Navbar />

            <div style={{ maxWidth: "900px", margin: "0 auto", padding: "120px var(--container-padding) 2rem" }}>
                {/* Filters */}
                <div className="grid-mobile-1" style={{
                    display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.5rem",
                    padding: "0.75rem 1rem", background: "var(--background-secondary)",
                    borderRadius: "12px", border: "1px solid var(--card-border)"
                }}>
                    <div style={{ flex: 1, minWidth: "180px", position: "relative" }}>
                        <svg style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search nodes..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%", padding: "0.4rem 0.75rem 0.4rem 2rem",
                                borderRadius: "8px", border: "1px solid var(--card-border)",
                                background: "var(--background)", color: "var(--foreground)", fontSize: "0.8125rem"
                            }}
                        />
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        {(['all', 'connected', 'offline'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                style={{
                                    padding: "0.4rem 0.75rem", borderRadius: "8px", border: "1px solid",
                                    borderColor: filterStatus === s ? "var(--accent)" : "var(--card-border)",
                                    background: filterStatus === s ? "var(--accent-soft)" : "transparent",
                                    color: filterStatus === s ? "var(--foreground)" : "var(--foreground-muted)",
                                    fontSize: "0.75rem", fontWeight: 600, cursor: "pointer"
                                }}
                            >
                                {s === 'all' ? 'All' : s === 'connected' ? '✅ Active' : '❌ Offline'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* System Stats */}
                {serverStatus?.system && (
                    <div className="grid-mobile-1" style={{
                        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: "0.75rem", marginBottom: "1.5rem"
                    }}>
                        {[
                            { label: "Online Users", value: serverStatus.system.onlineUsers },
                            { label: "CPU Usage", value: `${serverStatus.system.cpuUsage}%` },
                            { label: "Memory Used", value: `${serverStatus.system.memUsedPercent}%` },
                            { label: "↑ Outgoing", value: `${serverStatus.system.outgoingBandwidthGB} GB` },
                            { label: "↓ Incoming", value: `${serverStatus.system.incomingBandwidthGB} GB` },
                        ].map(({ label, value }) => (
                            <div key={label} style={{
                                padding: "0.75rem", background: "var(--background-secondary)",
                                borderRadius: "10px", border: "1px solid var(--card-border)", textAlign: "center"
                            }}>
                                <div style={{ fontSize: "0.625rem", color: "var(--foreground-muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: "0.25rem" }}>{label}</div>
                                <div style={{ fontSize: "1rem", fontWeight: 700 }}>{String(value)}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Node List using the same ServerStatus component */}
                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ height: "68px", borderRadius: "10px", background: "var(--accent-soft)", animation: "pulse 2s infinite" }} />
                        ))}
                    </div>
                ) : !serverStatus ? (
                    <div style={{ textAlign: "center", padding: "4rem", color: "var(--foreground-muted)" }}>
                        <p>Failed to load server status. Please try again later.</p>
                    </div>
                ) : filteredNodes.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "4rem", color: "var(--foreground-muted)" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</div>
                        <p>No nodes match your filters.</p>
                    </div>
                ) : (
                    <ServerStatus
                        serverStatus={{ ...serverStatus!, nodes: filteredNodes }}
                        onSelectNode={setSelectedNode}
                    />
                )}
            </div>

            {selectedNode && (
                <NodeDetailPopup
                    node={serverStatus?.nodes.find(n => n.name === selectedNode.name) || selectedNode}
                    onClose={() => setSelectedNode(null)}
                />
            )}

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 0.8; }
                }
            `}</style>
        </div>
    );
}

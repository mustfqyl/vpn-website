"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { UsageStats } from "./components/UsageStats";
import Navbar from "@/app/components/Navbar";
import { ConnectionCode } from "./components/ConnectionCode";
import { UsageTrendChart } from "./components/UsageTrendChart";
import { ProfileSettings } from "./components/ProfileSettings";
import { NodeDetailPopup } from "./components/NodeDetailPopup";
import { siteConfig } from "@/lib/siteConfig";
import { Shield } from "lucide-react";
import { copyToClipboard as copyToClipboardUtil } from "@/lib/clipboard";

interface ConnectedDevice {
    id: string;
    name: string;
    lastSeen: string;
    revoked: boolean;
}

interface UserData {
    authCode: string;
    vpnUserId: string | null;
    status: "active" | "disabled" | "expired" | "limited" | "inactive";
    role: string;
    plan: string;
    expiresAt: string | null;
    usage: {
        usedGB: number;
        limitGB: number | null;
    };
    subscriptionUrl: string | null;
    onlineCount: number;
    devices: ConnectedDevice[];
    createdAt: string;
}

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

export default function DashboardPage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [serverStatus, setServerStatus] = useState<ServerStatusData | null>(null);
    const [selectedNode, setSelectedNode] = useState<ServerNode | null>(null);
    const [loading, setLoading] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        // Safe to use Date.now() inside useEffect
        setCurrentTime(Date.now());
    }, []);

    useEffect(() => {
        let isMounted = true;
        let eventSource: EventSource | null = null;

        const fetchInitialData = async () => {
            try {
                const res = await fetch("/api/user/me", { cache: "no-store", headers: { 'Cache-Control': 'no-cache' } });
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted) {
                        setUser(data);
                        setLoading(false);

                        // Start SSE after initial user data is loaded
                        startSSE();
                    }
                } else if (res.status === 404 || res.status === 401) {
                    if (isMounted) {
                        console.warn("User not found or unauthorized. Logging out.");
                        handleLogout();
                    }
                } else {
                    if (isMounted) {
                        setUser(null);
                        setLoading(false);
                    }
                }
            } catch {
                if (isMounted) {
                    setUser(null);
                    setLoading(false);
                }
            }
        };

        const startSSE = () => {
            if (eventSource) eventSource.close();

            eventSource = new EventSource('/api/events');

            eventSource.addEventListener('update', (event) => {
                if (!isMounted) return;
                try {
                    const data = JSON.parse(event.data);
                    if (data.stats) setServerStatus(data.stats);

                    if (data.user) {
                        setUser(prev => prev ? {
                            ...prev,
                            status: data.user.status,
                            usage: data.user.usage,
                            subscriptionUrl: data.user.subscriptionUrl,
                            expiresAt: data.user.expiresAt || prev.expiresAt,
                            onlineCount: data.user.onlineCount !== undefined ? data.user.onlineCount : prev.onlineCount,
                            devices: data.user.devices || prev.devices
                        } : null);
                    }
                } catch (e) {
                    console.error("Failed to parse SSE update", e);
                }
            });

            eventSource.onerror = (err) => {
                console.error("SSE connection error", err);
                eventSource?.close();
                // Retry after 5s
                setTimeout(() => {
                    if (isMounted) startSSE();
                }, 5000);
            };
        };

        fetchInitialData();

        return () => {
            isMounted = false;
            if (eventSource) eventSource.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const copyToClipboard = async (text: string) => {
        if (!text) return;
        const success = await copyToClipboardUtil(text);
        if (success) {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
    };

    if (loading || !user) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ color: "var(--foreground-muted)", fontWeight: 500 }}>Initializing Security Context...</div>
            </div>
        );
    }


    const daysRemaining = user.expiresAt
        ? Math.ceil((new Date(user.expiresAt).getTime() - currentTime) / (1000 * 60 * 60 * 24))
        : (user.status === 'active' && !user.expiresAt ? 9999 : 0);


    return (
        <div style={{ minHeight: "100vh", position: "relative" }}>
            <div className="bg-glow" />

            <Navbar hideLinks />

            <main className="container" style={{ paddingTop: "calc(64px + 3rem)", paddingBottom: "var(--container-padding)", paddingLeft: "var(--container-padding)", paddingRight: "var(--container-padding)" }}>
                <div style={{ maxWidth: "900px", margin: "0 auto" }} className="animate-fadeUp">

                    <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ fontSize: "clamp(1.25rem, 5vw, 1.75rem)" }}>Dashboard</h1>
                        </div>
                        <button
                            onClick={() => setIsProfileOpen(true)}
                            className="btn btn-secondary"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                fontSize: "0.8125rem",
                                padding: "0.5rem 1rem",
                                background: "var(--background-glass)",
                                border: "1px solid var(--card-border)",
                                borderRadius: "8px",
                                color: "var(--foreground)",
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            Profile Settings
                        </button>
                    </div>

                    <UsageStats user={user} daysRemaining={daysRemaining} />

                    <div className="grid-mobile-1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                        <ConnectionCode
                            subscriptionUrl={user.subscriptionUrl}
                            copySuccess={copySuccess}
                            onCopy={copyToClipboard}
                        />

                        <UsageTrendChart />
                    </div>

                    {/* Quick Access */}
                    <div className="grid-mobile-1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
                        <Link href="/billing" className="card" style={{ padding: "1rem", textAlign: "center", transition: "all 0.2s ease" }}>
                            <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--foreground-muted)" }}>Billing</div>
                        </Link>
                        <Link href="/contact" className="card" style={{ padding: "1rem", textAlign: "center", transition: "all 0.2s ease" }}>
                            <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--foreground-muted)" }}>Support</div>
                        </Link>
                    </div>
                </div>
            </main>

            <ProfileSettings
                user={user}
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />

            {selectedNode && (
                <NodeDetailPopup
                    node={serverStatus?.nodes.find(n => n.name === selectedNode.name) || selectedNode}
                    onClose={() => setSelectedNode(null)}
                />
            )}
        </div>
    );
}

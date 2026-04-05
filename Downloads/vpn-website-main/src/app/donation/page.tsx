"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";

interface UserData {
    plan: string;
    status: string;
    expiresAt: string | null;
}

export default function DonationPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        if (typeof window !== "undefined") {
            return document.cookie.split(";").some((c) => c.trim().startsWith("auth_status=1"));
        }
        return false;
    });
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/user/me", { cache: "no-store" });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (err) {
                console.error("Failed to load user data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", position: "relative" }}>
                <div className="bg-glow" />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
                    <div style={{ color: "var(--foreground-muted)", fontWeight: 500 }}>Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", position: "relative" }}>
            <div className="bg-glow" />

            <Navbar hideLinks isLoggedIn={isLoggedIn} isAuthLoading={loading} />

            <main className="container" style={{ paddingTop: "calc(64px + 3rem)", paddingBottom: "var(--container-padding)", paddingLeft: "var(--container-padding)", paddingRight: "var(--container-padding)" }}>
                <div style={{ maxWidth: "850px", margin: "0 auto" }} className="animate-fadeUp">

                    <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                        <h1 style={{ fontSize: "clamp(1.75rem, 5vw, 2.5rem)", marginBottom: "1rem" }}>Support Our Mission</h1>
                        <p style={{ color: "var(--foreground-muted)", maxWidth: "600px", margin: "0 auto" }}>
                            We rely on community support to maintain our high-speed nodes and privacy infrastructure. Every contribution helps keep the service free for everyone.
                        </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                        
                        {/* Donation Options */}
                        <div className="card">
                            <h3 style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.25rem" }}>Donation Methods</h3>
                            
                            <div className="grid-mobile-1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                                <div style={{ padding: "1.5rem", borderRadius: "12px", background: "var(--background-secondary)", border: "1px solid var(--card-border)" }}>
                                    <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Cryptocurrency (BTC/ETH/XMR)</div>
                                    <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginBottom: "1rem" }}>Secure, anonymous contributions for maximum privacy.</p>
                                    <div style={{ padding: "0.5rem", background: "var(--background)", borderRadius: "4px", fontSize: "0.75rem", fontFamily: "monospace", overflowWrap: "break-word" }}>
                                        COMING_SOON_ADDRESS
                                    </div>
                                </div>
                                
                                <div style={{ padding: "1.5rem", borderRadius: "12px", background: "var(--background-secondary)", border: "1px solid var(--card-border)" }}>
                                    <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Digital Collectibles</div>
                                    <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", marginBottom: "1rem" }}>Support us and get a unique digital badge on your profile.</p>
                                    <button disabled style={{ opacity: 0.5, width: "100%", padding: "0.5rem", borderRadius: "8px", background: "var(--accent)", color: "white", border: "none", cursor: "not-allowed" }}>
                                        Beta Coming Soon
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Transparency Info */}
                        <div className="card">
                            <h3 style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.25rem" }}>How funds are used</h3>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <li style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)", marginTop: "0.4rem" }} />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>Server Maintenance</div>
                                        <div style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>Paying for high-bandwidth server nodes in various global locations.</div>
                                    </div>
                                </li>
                                <li style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success)", marginTop: "0.4rem" }} />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>Software Development</div>
                                        <div style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>Improving our encryption protocols and dashboard features.</div>
                                    </div>
                                </li>
                            </ul>
                        </div>

                    </div>

                    <div style={{ marginTop: "2rem", textAlign: "center" }}>
                        <Link href="/dashboard" style={{ color: "var(--foreground)", textDecoration: "none", fontWeight: 600, fontSize: "0.875rem" }}>
                            ← Back to Dashboard
                        </Link>
                    </div>

                </div>
            </main>
        </div>
    );
}

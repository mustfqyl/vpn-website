"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";

interface UserData {
    plan: string;
    status: string;
    expiresAt: string | null;
    email?: string;
}

export default function BillingPage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [initiating, setInitiating] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/user/me", {
                    cache: "no-store",
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else if (res.status === 404 || res.status === 401) {
                    window.location.href = "/";
                }
            } catch (err) {
                console.error("Failed to load user data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleBuyDuration = async (amount: number) => {
        if (initiating !== null) return;
        try {
            setInitiating(amount);
            setErrorMessage("");
            setSuccessMessage("");

            const tier = [
                { cost: 2.5, months: 1, days: 30 },
                { cost: 7.5, months: 3, days: 90 },
                { cost: 15, months: 6, days: 180 },
                { cost: 30, months: 12, days: 360 },
            ].find((t) => t.cost === amount);

            if (!tier) {
                setErrorMessage("Invalid plan selected");
                setInitiating(null);
                return;
            }

            // Call the generic checkout endpoint – returns mock confirmation
            const response = await fetch("/api/payments/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount,
                    currency: "EUR",
                    days: tier.days,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                setErrorMessage(error.error || "Payment processing failed");
                setInitiating(null);
                return;
            }

            const data = await response.json();

            // Handle mock success immediately
            if (data.status === 'confirmed') {
                handlePaymentSuccess();
                setInitiating(null);
                return;
            }

            setInitiating(null);
        } catch (err) {
            setErrorMessage("Payment processing failed. Please try again.");
            setInitiating(null);
            console.error("Payment error:", err);
        }
    };

    const handlePaymentSuccess = () => {
        setSuccessMessage("Mock Payment Confirmed! Your subscription has been extended instantly.");
        // Refresh user data bypass cache
        fetch("/api/user/me", {
            cache: "no-store",
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        })
            .then((r) => r.json())
            .then((d) => setUser(d))
            .catch(() => null);
    };

    const daysRemaining = user?.expiresAt
        ? Math.ceil((new Date(user.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : (user?.status === "active" && user?.plan !== "None" && !user?.expiresAt)
            ? 9999
            : 0;

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", position: "relative" }}>
                <div className="bg-glow" />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
                    <div style={{ color: "var(--foreground-muted)", fontWeight: 500 }}>Initializing Billing Engine...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", position: "relative" }}>
            <div className="bg-glow" />


            <Navbar hideLinks />

            <main className="container" style={{ paddingTop: "calc(64px + 3rem)", paddingBottom: "var(--container-padding)", paddingLeft: "var(--container-padding)", paddingRight: "var(--container-padding)" }}>
                <div style={{ maxWidth: "850px", margin: "0 auto" }} className="animate-fadeUp">

                    <div style={{ marginBottom: "1.5rem" }}>
                        <h1 style={{ fontSize: "clamp(1.25rem, 5vw, 1.75rem)" }}>Subscription & Billing</h1>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>

                        {/* Current Plan Card */}
                        <div className="card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                                <div>
                                    <div style={{ color: "var(--foreground-muted)", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Current Plan</div>
                                    <div style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>{user?.plan || "Unknown"}</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ color: "var(--foreground-muted)", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Expires</div>
                                    <div style={{ fontSize: "1rem", fontWeight: 600 }}>{user?.expiresAt ? new Date(user.expiresAt).toLocaleDateString() : (user?.plan !== "None" && user?.status === "active" ? "∞" : "—")}</div>
                                    <div style={{ fontSize: "0.75rem", color: (user?.expiresAt && daysRemaining <= 7) ? "var(--error)" : "var(--foreground-muted)", fontWeight: 600 }}>
                                        {user?.expiresAt ? (daysRemaining > 0 ? `${daysRemaining} days remaining` : "Expired") : (user?.plan !== "None" && user?.status === "active" ? "Unlimited Access" : "No Active Plan")}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Success Message */}
                        {successMessage && (
                            <div style={{
                                padding: "0.75rem 1rem",
                                borderRadius: "10px",
                                background: "rgba(34, 197, 94, 0.1)",
                                border: "1px solid var(--success)",
                                color: "var(--success)",
                                fontSize: "0.8125rem",
                                fontWeight: 600
                            }}>
                                ✓ {successMessage}
                            </div>
                        )}

                        {/* Error Message */}
                        {errorMessage && (
                            <div style={{
                                padding: "0.75rem 1rem",
                                borderRadius: "10px",
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid var(--error)",
                                color: "var(--error)",
                                fontSize: "0.8125rem",
                                fontWeight: 600
                            }}>
                                ⚠ {errorMessage}
                            </div>
                        )}

                        {/* Duration Purchase Controls */}
                        <div className="card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                                <h3 style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Extend Subscription</h3>
                                <div style={{ fontSize: "0.6875rem", color: "var(--foreground-muted)", fontWeight: 600, background: "var(--background-secondary)", padding: "0.25rem 0.6rem", borderRadius: "100px" }}>
                                    MAX 365 DAYS
                                </div>
                            </div>

                            <div className="grid-mobile-1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "1rem" }}>
                                {[
                                    { cost: 2.5, months: 1, days: 30 },
                                    { cost: 7.5, months: 3, days: 90 },
                                    { cost: 15, months: 6, days: 180 },
                                    { cost: 30, months: 12, days: 360 },
                                ].map((tier) => {
                                    const isInfinite = user?.expiresAt === null && user?.status === "active" && user?.plan !== "None";
                                    const isTooLong = isInfinite || (daysRemaining + tier.days > 365 && !isInfinite);
                                    const isLoading = initiating === tier.cost;
                                    return (
                                        <button
                                            key={tier.cost}
                                            onClick={() => handleBuyDuration(tier.cost)}
                                            disabled={initiating !== null || isTooLong}
                                            style={{
                                                padding: "1rem",
                                                borderRadius: "12px",
                                                background: "var(--background)",
                                                border: "1px solid",
                                                borderColor: isTooLong ? "transparent" : "var(--card-border)",
                                                color: isTooLong ? "var(--foreground-muted)" : "var(--foreground)",
                                                cursor: (initiating !== null || isTooLong) ? "not-allowed" : "pointer",
                                                textAlign: "center",
                                                transition: "all 0.2s ease",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                gap: "0.5rem",
                                                opacity: (initiating !== null && !isLoading) || isTooLong ? 0.5 : 1,
                                                position: "relative",
                                            }}
                                            className={!isTooLong ? "hoverable-transaction" : ""}
                                        >
                                            <div style={{ fontWeight: 800, fontSize: "1.25rem" }}>{tier.months} Month{tier.months > 1 ? "s" : ""}</div>
                                            <div style={{ fontSize: "0.6875rem", color: "var(--foreground-muted)" }}>{tier.days} days</div>
                                            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: isLoading ? "var(--success)" : isTooLong ? "var(--foreground-muted)" : "var(--accent)" }}>
                                                {isLoading ? (
                                                    <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                                        <svg className="spinner" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                                        Processing…
                                                    </span>
                                                ) : isTooLong ? (isInfinite ? "Infinite Access" : "Limit Exceeded") : `€${tier.cost.toFixed(2)}`}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Transaction Info */}
                        <div className="card">
                            <h3 style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.25rem" }}>Payment Method</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "0.75rem 1rem",
                                    background: "var(--background)",
                                    borderRadius: "10px",
                                    border: "1px solid var(--card-border)",
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <span style={{ color: "var(--success)" }}>Bypass Payment System</span>
                                        </div>
                                        <div style={{ fontSize: "0.6875rem", color: "var(--foreground-subtle)" }}>
                                            Instant activation – for testing and development purposes.
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <div style={{ fontSize: "0.625rem", color: "var(--accent)", fontWeight: 700, padding: "0.2rem 0.5rem", background: "var(--accent-soft)", borderRadius: "4px" }}>Mock Active</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div style={{ marginTop: "2rem", textAlign: "center" }}>
                        <p style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                            Need infrastructure assistance?{" "}
                            <Link href="/contact" style={{ color: "var(--foreground)", textDecoration: "underline", fontWeight: 500 }}>
                                Contact professional support.
                            </Link>
                        </p>
                    </div>

                </div>
            </main>

            <style jsx>{`
                .hoverable-transaction:hover:not(:disabled) {
                    border-color: var(--accent);
                    background: var(--accent-soft);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .btn:hover {
                    filter: brightness(1.1);
                    transform: translateY(-1px);
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spinner {
                    animation: spin 0.8s linear infinite;
                }
            `}</style>
        </div>
    );
}

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

const ThemeSwitcher = () => {
    const { theme, toggleTheme, mounted } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle-btn active"
            style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "var(--accent-soft)",
                border: "1px solid var(--card-border)",
                display: "grid",
                placeItems: "center",
                transition: "all 0.2s ease"
            }}
            aria-label="Toggle Theme"
        >
            {mounted ? (
                theme === "dark" ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                )
            ) : (
                <div style={{ width: "15px", height: "15px" }} />
            )}
        </button>
    );
};

import React, { Suspense } from "react";

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan') || 'Premium';

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const price = "€2.50";

    const handleMockPayment = async () => {
        try {
            setLoading(true);
            setError("");

            // Determine plan type and days
            const planConfig = plan === 'Trial'
                ? { days: 3, amount: 0 } // Trial is free
                : { days: 30, amount: 2.50 };

            // For trial, skip payment and directly activate
            if (plan === 'Trial') {
                // Create free trial activation (no payment needed)
                const response = await fetch("/api/payments/trial", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ plan })
                });

                if (response.ok) {
                    setSuccess(true);
                    setTimeout(() => router.push("/dashboard"), 3000);
                } else {
                    setError("Failed to activate trial. Please try again.");
                    setLoading(false);
                }
                return;
            }

            // For paid plans, initiate payment
            const response = await fetch("/api/payments/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: planConfig.amount,
                    days: planConfig.days,
                    plan
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || "Payment processing failed");
                setLoading(false);
                return;
            }

            const paymentData = await response.json();

            if (paymentData.status === 'confirmed' || paymentData.paymentUrl) {
                setSuccess(true);
                // Wait a bit to show success message before redirecting
                setTimeout(() => {
                    if (paymentData.paymentUrl) {
                        window.location.href = paymentData.paymentUrl;
                    } else {
                        router.push("/dashboard");
                    }
                }, 2000);
            } else {
                setError("Failed to generate mock payment");
                setLoading(false);
            }
        } catch (err) {
            setError("Payment processing failed. Please try again.");
            setLoading(false);
            console.error("Payment error:", err);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            paddingTop: "var(--header-height)"
        }}>
            <div style={{ width: "100%", maxWidth: "440px" }} className="animate-fadeUp">
                <div className="card" style={{ padding: "3rem 2.5rem", textAlign: "center" }}>

                    <div style={{ marginBottom: "2rem" }}>
                        <div style={{
                            width: "64px",
                            height: "64px",
                            background: "var(--accent-soft)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 1.5rem",
                            color: "var(--accent)"
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                        </div>
                        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>
                            Complete Authentication
                        </h1>
                        <p style={{ color: "var(--foreground-muted)", fontSize: "0.9375rem" }}>
                            Finalize your {plan} plan setup to activate the secure node network.
                        </p>
                    </div>

                    <div style={{
                        background: "var(--background)",
                        border: "1px solid var(--card-border)",
                        borderRadius: "12px",
                        padding: "1.5rem",
                        marginBottom: "2.5rem",
                        textAlign: "left"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", color: "var(--foreground-subtle)", fontSize: "0.875rem" }}>
                            <span>Plan Type</span>
                            <span style={{ color: "var(--foreground)", fontWeight: 600 }}>{plan} Access</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", color: "var(--foreground-subtle)", fontSize: "0.875rem" }}>
                            <span>Duration</span>
                            <span>{plan === 'Trial' ? '3 Days' : '30 Days'}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", color: "var(--foreground-subtle)", fontSize: "0.875rem" }}>
                            <span>Data Limit</span>
                            <span>Unlimited</span>
                        </div>
                        <hr style={{ border: "none", borderTop: "1px solid var(--card-border)", margin: "1rem 0" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.125rem", fontWeight: 700 }}>
                            <span>Total Amount</span>
                            <span style={{ color: "var(--accent)" }}>{price}</span>
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            padding: "1rem",
                            borderRadius: "10px",
                            background: "rgba(239, 68, 68, 0.05)",
                            border: "1px solid var(--error)",
                            color: "var(--error)",
                            fontSize: "0.875rem",
                            marginBottom: "2rem"
                        }}>
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div style={{
                            padding: "1.5rem",
                            borderRadius: "10px",
                            background: "rgba(16, 185, 129, 0.1)",
                            border: "1px solid #10B981",
                            color: "#10B981",
                            fontWeight: 600
                        }}>
                            <span style={{ display: "block", fontSize: "1.2rem", marginBottom: "0.5rem" }}>✓ Payment Successful</span>
                            Directing to network dashboard...
                        </div>
                    ) : (
                        <button
                            onClick={handleMockPayment}
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ width: "100%", padding: "1rem" }}
                        >
                            {loading ? "Processing..." : "Simulate Mock Payment & Activate"}
                        </button>
                    )}

                    <div style={{ marginTop: "1.5rem" }}>
                        <p style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                            Note: This bypasses real card processors. Your account wallet will be credited automatically.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
            <div className="bg-glow" />

            <header style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                backgroundColor: "var(--background-glass)",
                backdropFilter: "blur(40px)",
                borderBottom: "1px solid var(--card-border)"
            }}>
                <div className="container" style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: "var(--header-height)"
                }}>
                    <Link href="/" style={{ fontSize: "1.125rem", fontWeight: 700, letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "24px", height: "24px", background: "var(--accent)", borderRadius: "6px", display: "grid", placeItems: "center", color: "var(--background)" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline" }}>
                            <span style={{ fontWeight: 800 }}>SECURE</span>
                            <span style={{ fontWeight: 400, opacity: 0.6 }}>VPN</span>
                        </div>
                    </Link>

                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                        <ThemeSwitcher />
                    </div>
                </div>
            </header>

            <Suspense fallback={<div style={{ minHeight: "100vh", padding: "1rem", paddingTop: "var(--header-height)", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "var(--foreground-muted)", fontWeight: 500 }}>Loading setup...</div></div>}>
                <CheckoutContent />
            </Suspense>
        </div>
    );
}

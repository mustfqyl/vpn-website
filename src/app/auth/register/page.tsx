"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { copyToClipboard } from "@/lib/clipboard";

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

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        authCode: "",
        plan: "Trial",
    });
    const [loading, setLoading] = useState(false);
    const [fetchingCode, setFetchingCode] = useState(true);
    const [error, setError] = useState("");
    const [codeSaved, setCodeSaved] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchCode = async () => {
            try {
                const res = await fetch("/api/auth/generate-code");
                const data = await res.json();
                if (res.ok && data.code) {
                    setFormData(prev => ({ ...prev, authCode: data.code }));
                    setError("");
                } else {
                    throw new Error(data.error || "Failed to generate access code");
                }
            } catch (err) {
                console.error("Failed to fetch auth code", err);
                setError("Failed to generate secure access code. Check database connection.");
            } finally {
                setFetchingCode(false);
            }
        };
        fetchCode();
    }, []);

    const downloadCode = () => {
        if (!formData.authCode) return;
        const element = document.createElement("a");
        const file = new Blob([`SECURE VPN ACCESS CODE\n------------------------\nCode: ${formData.authCode}\n\nKEEP THIS FILE SAFE. IT IS YOUR ONLY ACCESS KEY.`], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = "secure-vpn-access-code.txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!codeSaved) {
            setError("You must confirm that you have saved your access code.");
            return;
        }

        setLoading(true);
        setError("");

        if (!formData.authCode) {
            setError("Access code is required. Please refresh.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ authCode: formData.authCode, plan: formData.plan }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Registration failed");
            }

            if (formData.plan === 'Premium') {
                router.push("/checkout?plan=Premium");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
            <div className="bg-glow" />

            <header style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
                backgroundColor: "var(--background-glass)", backdropFilter: "blur(40px)",
                borderBottom: "1px solid var(--card-border)"
            }}>
                <div className="container" style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
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
                        <Link href="/auth/login" className="link-subtle" style={{ fontSize: "0.8125rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Sign In</Link>
                        <ThemeSwitcher />
                    </div>
                </div>
            </header>

            <div style={{
                minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
                padding: "1rem", paddingTop: "var(--header-height)"
            }}>
                <div style={{ width: "100%", maxWidth: "440px" }} className="animate-fadeUp">
                    <div className="card" style={{ padding: "2.5rem" }}>
                        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                            <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Secure Setup</h1>
                            <p style={{ color: "var(--foreground-muted)", fontSize: "0.9375rem" }}>
                                Your unique identification code has been generated.
                            </p>
                        </div>

                        {error && (
                            <div style={{
                                padding: "1rem", borderRadius: "10px", background: "rgba(239, 68, 68, 0.05)",
                                border: "1px solid var(--error)", color: "var(--error)", fontSize: "0.875rem",
                                marginBottom: "2rem", textAlign: "center"
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, marginBottom: "0.6rem", color: "var(--foreground-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Select Plan</label>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, plan: 'Trial' })}
                                        style={{
                                            padding: "0.75rem", borderRadius: "10px",
                                            border: formData.plan === 'Trial' ? "2px solid var(--accent)" : "1px solid var(--card-border)",
                                            background: formData.plan === 'Trial' ? "var(--accent-soft)" : "transparent",
                                            color: "var(--foreground)", cursor: "pointer", textAlign: "left"
                                        }}
                                    >
                                        <div style={{ fontWeight: 700, fontSize: "1rem" }}>Trial</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>3 Days</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, plan: 'Premium' })}
                                        style={{
                                            padding: "0.75rem", borderRadius: "10px",
                                            border: formData.plan === 'Premium' ? "2px solid var(--accent)" : "1px solid var(--card-border)",
                                            background: formData.plan === 'Premium' ? "var(--accent-soft)" : "transparent",
                                            color: "var(--foreground)", cursor: "pointer", textAlign: "left"
                                        }}
                                    >
                                        <div style={{ fontWeight: 700, fontSize: "1rem" }}>Premium</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>30 Days</div>
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: "2rem" }}>
                                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, marginBottom: "0.6rem", color: "var(--foreground-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Your Unique Access Code</label>
                                <div 
                                    onClick={async () => {
                                        if (formData.authCode) {
                                            const success = await copyToClipboard(formData.authCode);
                                            if (success) {
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 800);
                                            }
                                        }
                                    }}
                                    style={{
                                        padding: "1.25rem", borderRadius: "12px", 
                                        background: copied ? "var(--success-soft)" : "var(--accent-soft)",
                                        border: copied ? "2px solid var(--success)" : "1px dashed var(--accent)", 
                                        textAlign: "center", fontSize: "1.25rem",
                                        fontWeight: 800, letterSpacing: "0.1em", 
                                        color: copied ? "var(--success)" : "var(--accent)", 
                                        fontFamily: "monospace",
                                        cursor: "pointer", transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                                        position: "relative",
                                        transform: copied ? "scale(0.98)" : "scale(1)",
                                        boxShadow: copied ? "0 0 20px rgba(34, 197, 94, 0.2)" : "none"
                                    }}
                                    className="hover-lift"
                                >
                                    {fetchingCode ? "XXXX-XXXX-XXXX-XXXX" : (copied ? "¡COPIED!" : formData.authCode)}
                                </div>
                                
                                <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1rem" }}>
                                    <button
                                        type="button"
                                        onClick={downloadCode}
                                        style={{
                                            fontSize: "0.6875rem",
                                            fontWeight: 700,
                                            padding: "0.4rem 0.8rem",
                                            borderRadius: "6px",
                                            background: "var(--background)",
                                            border: "1px solid var(--card-border)",
                                            color: "var(--foreground)",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.4rem"
                                        }}
                                        className="hover-lift"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                        Download Code
                                    </button>
                                </div>
                            </div>

                            {/* Safety Confirmation */}
                            <div style={{ 
                                padding: "1rem", 
                                background: "rgba(255, 171, 0, 0.05)", 
                                border: "1px solid rgba(255, 171, 0, 0.2)", 
                                borderRadius: "10px",
                                marginBottom: "2rem"
                            }}>
                                <label style={{ display: "flex", gap: "0.75rem", cursor: "pointer", alignItems: "flex-start" }}>
                                    <input 
                                        type="checkbox" 
                                        checked={codeSaved}
                                        onChange={(e) => setCodeSaved(e.target.checked)}
                                        style={{ marginTop: "0.2rem", cursor: "pointer" }}
                                    />
                                    <span style={{ fontSize: "0.8125rem", color: "var(--foreground-subtle)", lineHeight: 1.4 }}>
                                        I have securely saved my access code. I understand that if I lose it, <strong>I will permanently lose access</strong> to my account.
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || fetchingCode || !codeSaved}
                                className="btn btn-primary"
                                style={{ width: "100%", padding: "1rem", opacity: codeSaved ? 1 : 0.5 }}
                            >
                                {loading ? "INITIALIZING..." : "INITIALIZE SETUP"}
                            </button>
                        </form>

                        <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
                            By proceeding, you agree to our <Link href="/terms" style={{ color: "var(--foreground)" }}>Terms</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { copyToClipboard } from "@/lib/clipboard";
import Navbar from "@/app/components/Navbar";

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
                } else if (res.status === 429) {
                    // Handle rate limit gracefully without throwing/logging as error
                    setError(data.error);
                } else {
                    throw new Error(data.error || "Failed to generate access code.");
                }
            } catch (err) {
                console.error("Failed to fetch auth code", err);
                setError(err instanceof Error ? err.message : "Failed to generate access code.");
            } finally {
                setFetchingCode(false);
            }
        };
        fetchCode();
    }, []);

    const downloadCode = () => {
        if (!formData.authCode) return;
        const element = document.createElement("a");
        const file = new Blob([`ACCESS CODE\n------------------------\nCode: ${formData.authCode}\n\nKEEP THIS FILE SAFE. IT IS YOUR ONLY ACCESS KEY.`], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = "access-code.txt";
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
                if (res.status === 400) {
                   setError("Invalid parameters. Please check your data and try again.");
                } else if (res.status === 409) {
                   setError("This access code has already been registered.");
                } else {
                   setError(data.error || "An unexpected error occurred during registration. Please try again later.");
                }
                setLoading(false);
                return;
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

            <Navbar hideLinks />

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
                                padding: "1rem 1.25rem",
                                borderRadius: "12px",
                                background: "rgba(239, 68, 68, 0.08)",
                                border: "1px solid var(--error-soft)",
                                color: "var(--error)",
                                fontSize: "0.875rem",
                                marginBottom: "2rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                fontWeight: 500,
                                animation: "shake 0.5s cubic-bezier(.36,.07,.19,.97) both"
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
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
                                {fetchingCode ? "XXXX-XXXX-XXXX" : (copied ? "¡COPIED!" : (formData.authCode || "XXXX-XXXX-XXXX"))}
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
